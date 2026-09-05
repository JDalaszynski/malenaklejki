import "server-only";

import type { UserRecord } from "firebase-admin/auth";

import { adminAuth, db } from "@/lib/firebase/admin";
import { listOrders } from "./queries";

const round2 = (value: number): number => Math.round(value * 100) / 100;

export type AdminUserRow = {
  uid: string;
  email: string;
  emailVerified: boolean;
  disabled: boolean;
  isAdmin: boolean;
  authCreatedAt: string;
  lastSignInAt: string | null;
  /** Profil w Firestore (`users/{uid}`) — konto z samego Auth (np. rejestracja przerwana przed zapisem profilu) go nie ma. */
  hasProfile: boolean;
  firstName: string;
  lastName: string;
  phone: string;
  marketingConsent: boolean;
  hasAddress: boolean;
  hasInvoiceDetails: boolean;
  orderCount: number;
  totalSpent: number;
  lastOrderAt: string | null;
};

/** Wszystkie konta z Firebase Auth — API zwraca po 1000, więc kartkujemy do końca. */
async function listAllAuthUsers(): Promise<UserRecord[]> {
  const users: UserRecord[] = [];
  let pageToken: string | undefined;

  do {
    const page = await adminAuth.listUsers(1000, pageToken);
    users.push(...page.users);
    pageToken = page.pageToken || undefined;
    // Zabezpieczenie przed nieskończoną pętlą przy nietypowej odpowiedzi API — nie ma sklepu z 10k+ kont.
  } while (pageToken && users.length < 10_000);

  return users;
}

/**
 * Konta klientów do panelu — łączymy trzy źródła: Firebase Auth (logowanie,
 * weryfikacja, blokada), profil w Firestore (dane osobowe, adres, faktura)
 * i opłacone zamówienia (żeby wiedzieć, ile klient realnie zostawił w sklepie).
 * Konto zwykle powstaje z zamówienia, więc większość tych trzech rzeczy
 * pokrywa się, ale żadna nie jest gwarantowana — stąd osobne pobranie każdej.
 */
export async function listAdminUsers(): Promise<AdminUserRow[]> {
  const [authUsers, profileSnapshot, paidOrders] = await Promise.all([
    listAllAuthUsers(),
    db.collection("users").get(),
    listOrders({ status: "PAID" }, 3000),
  ]);

  const profiles = new Map(profileSnapshot.docs.map((doc) => [doc.id, doc.data()]));

  const ordersByUser = new Map<string, { count: number; total: number; lastAt: string }>();
  for (const order of paidOrders) {
    if (!order.userId) continue;
    const entry = ordersByUser.get(order.userId) ?? { count: 0, total: 0, lastAt: "" };
    entry.count += 1;
    entry.total = round2(entry.total + order.totals.total);
    if (order.createdAt > entry.lastAt) entry.lastAt = order.createdAt;
    ordersByUser.set(order.userId, entry);
  }

  return authUsers
    .map((record): AdminUserRow => {
      const profile = profiles.get(record.uid);
      const orders = ordersByUser.get(record.uid);

      return {
        uid: record.uid,
        email: record.email ?? "",
        emailVerified: record.emailVerified,
        disabled: record.disabled,
        isAdmin: record.customClaims?.role === "admin",
        authCreatedAt: record.metadata.creationTime
          ? new Date(record.metadata.creationTime).toISOString()
          : "",
        lastSignInAt: record.metadata.lastSignInTime
          ? new Date(record.metadata.lastSignInTime).toISOString()
          : null,
        hasProfile: Boolean(profile),
        firstName: profile?.firstName ?? "",
        lastName: profile?.lastName ?? "",
        phone: profile?.phone ?? "",
        marketingConsent: Boolean(profile?.marketingConsent),
        hasAddress: Boolean(profile?.defaultAddress || profile?.defaultLocker),
        hasInvoiceDetails: Boolean(profile?.invoiceDetails),
        orderCount: orders?.count ?? 0,
        totalSpent: orders?.total ?? 0,
        lastOrderAt: orders?.lastAt || null,
      };
    })
    .sort((a, b) => b.authCreatedAt.localeCompare(a.authCreatedAt));
}

export type AdminUserFilters = {
  search?: string;
  /** "yes" — potwierdzony e-mail, "no" — niepotwierdzony. */
  verified?: "yes" | "no";
  /** "active" — może się zalogować, "blocked" — zablokowane logowanie. */
  status?: "active" | "blocked";
  /** "yes" — złożyli choć jedno opłacone zamówienie, "no" — jeszcze żadnego. */
  hasOrders?: "yes" | "no";
  role?: "admin" | "customer";
};

type SearchParams = Record<string, string | string[] | undefined>;

function single(params: SearchParams, key: string): string | undefined {
  const value = params[key];
  return (Array.isArray(value) ? value[0] : value) || undefined;
}

/** Odczytuje filtry listy użytkowników z adresu strony. */
export function parseUserFilters(params: SearchParams): AdminUserFilters {
  const verified = single(params, "weryfikacja");
  const status = single(params, "status");
  const hasOrders = single(params, "zamowienia");
  const role = single(params, "rola");

  return {
    search: single(params, "szukaj"),
    verified: verified === "yes" || verified === "no" ? verified : undefined,
    status: status === "active" || status === "blocked" ? status : undefined,
    hasOrders: hasOrders === "yes" || hasOrders === "no" ? hasOrders : undefined,
    role: role === "admin" || role === "customer" ? role : undefined,
  };
}

export function filterAdminUsers(users: AdminUserRow[], filters: AdminUserFilters): AdminUserRow[] {
  const search = filters.search?.trim().toLowerCase();

  return users.filter((user) => {
    if (filters.verified === "yes" && !user.emailVerified) return false;
    if (filters.verified === "no" && user.emailVerified) return false;
    if (filters.status === "active" && user.disabled) return false;
    if (filters.status === "blocked" && !user.disabled) return false;
    if (filters.hasOrders === "yes" && user.orderCount === 0) return false;
    if (filters.hasOrders === "no" && user.orderCount > 0) return false;
    if (filters.role === "admin" && !user.isAdmin) return false;
    if (filters.role === "customer" && user.isAdmin) return false;

    if (search) {
      const haystack = [user.email, user.firstName, user.lastName, user.phone, user.uid]
        .join(" ")
        .toLowerCase();
      if (!haystack.includes(search)) return false;
    }

    return true;
  });
}
