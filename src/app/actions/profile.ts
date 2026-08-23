"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";

import { adminAuth, db } from "@/lib/firebase/admin";
import { getSession } from "@/lib/auth/dal";
import { consumeRateLimit } from "@/lib/auth/rateLimit";

export type Profile = {
  firstName: string;
  lastName: string;
  phone: string;
  marketingConsent: boolean;
  defaultAddress: { street: string; building: string; postalCode: string; city: string } | null;
  defaultLocker: { lockerId: string; address: string } | null;
  invoiceDetails: { companyName: string; nip: string } | null;
};

const profileSchema = z.object({
  firstName: z.string().trim().min(2, "Imię jest wymagane").max(100),
  lastName: z.string().trim().max(100).default(""),
  phone: z
    .string()
    .trim()
    .max(20)
    .refine((v) => v === "" || /^[0-9+\s\-()]{7,20}$/.test(v), "Podaj poprawny numer telefonu")
    .default(""),
  marketingConsent: z.boolean().default(false),
  street: z.string().trim().max(100).default(""),
  building: z.string().trim().max(20).default(""),
  postalCode: z
    .string()
    .trim()
    .max(20)
    .refine((v) => v === "" || /^\d{2}-\d{3}$/.test(v), "Kod pocztowy w formacie 00-000")
    .default(""),
  city: z.string().trim().max(100).default(""),
  companyName: z.string().trim().max(200).default(""),
  nip: z
    .string()
    .trim()
    .max(20)
    .refine((v) => v === "" || /^[0-9\s-]{10,20}$/.test(v), "NIP to 10 cyfr")
    .default(""),
});

export async function getProfile(): Promise<Profile | null> {
  const session = await getSession();
  if (!session) return null;

  const snapshot = await db.collection("users").doc(session.uid).get();
  const data = snapshot.data();

  return {
    firstName: data?.firstName ?? "",
    lastName: data?.lastName ?? "",
    phone: data?.phone ?? "",
    marketingConsent: Boolean(data?.marketingConsent),
    defaultAddress: data?.defaultAddress ?? null,
    defaultLocker: data?.defaultLocker ?? null,
    invoiceDetails: data?.invoiceDetails ?? null,
  };
}

export async function updateProfile(
  raw: unknown
): Promise<{ success: true } | { success: false; error: string }> {
  const session = await getSession();
  if (!session) return { success: false, error: "Zaloguj się, żeby zapisać zmiany." };

  const limit = await consumeRateLimit(`profile:${session.uid}`, 30, 60 * 60 * 1000);
  if (!limit.ok) return { success: false, error: "Zbyt wiele zmian. Spróbuj za chwilę." };

  const parsed = profileSchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message || "Błędne dane" };
  }
  const data = parsed.data;

  const hasAddress = Boolean(data.street && data.building && data.postalCode && data.city);
  const hasInvoice = Boolean(data.companyName && data.nip);

  await db.collection("users").doc(session.uid).set(
    {
      firstName: data.firstName,
      lastName: data.lastName,
      phone: data.phone,
      marketingConsent: data.marketingConsent,
      defaultAddress: hasAddress
        ? {
            street: data.street,
            building: data.building,
            postalCode: data.postalCode,
            city: data.city,
          }
        : null,
      invoiceDetails: hasInvoice ? { companyName: data.companyName, nip: data.nip } : null,
      updatedAt: new Date().toISOString(),
    },
    { merge: true }
  );

  // Nazwa wyświetlana trzymana jest w koncie Firebase — to z niej bierzemy
  // inicjał w nagłówku, gdy profil w bazie jest jeszcze pusty.
  try {
    await adminAuth.updateUser(session.uid, {
      displayName: `${data.firstName} ${data.lastName}`.trim() || undefined,
    });
  } catch (error) {
    console.error("updateProfile displayName error:", error);
  }

  revalidatePath("/konto");
  revalidatePath("/konto/dane");
  return { success: true };
}

/** Zapamiętuje dane z właśnie złożonego zamówienia jako domyślne. */
export async function rememberCheckoutDetails(details: {
  firstName: string;
  lastName: string;
  phone: string;
  street?: string;
  building?: string;
  postalCode?: string;
  city?: string;
  lockerId?: string;
  lockerAddress?: string;
  companyName?: string;
  nip?: string;
}): Promise<void> {
  const session = await getSession();
  if (!session) return;

  const update: Record<string, unknown> = {
    firstName: details.firstName,
    lastName: details.lastName,
    phone: details.phone,
    updatedAt: new Date().toISOString(),
  };

  if (details.street && details.building && details.postalCode && details.city) {
    update.defaultAddress = {
      street: details.street,
      building: details.building,
      postalCode: details.postalCode,
      city: details.city,
    };
  }
  if (details.lockerId) {
    update.defaultLocker = { lockerId: details.lockerId, address: details.lockerAddress ?? "" };
  }
  if (details.companyName && details.nip) {
    update.invoiceDetails = { companyName: details.companyName, nip: details.nip };
  }

  try {
    await db.collection("users").doc(session.uid).set(update, { merge: true });
  } catch (error) {
    console.error("rememberCheckoutDetails error:", error);
  }
}
