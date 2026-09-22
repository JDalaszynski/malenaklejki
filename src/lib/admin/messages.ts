import "server-only";

import { db } from "@/lib/firebase/admin";

/**
 * Wiadomości z formularzy sklepu.
 *
 * Do 22.09.2026 formularz kontaktowy i zapytanie o projekt kończyły się
 * jednym mailem i niczym więcej. Serwer pocztowy domeny potrafi odrzucić
 * pocztę z adresów IP Brevo (`550 Email blocked`), a odbity mail z formularza
 * znaczył wiadomość przepadłą bezpowrotnie — razem z informacją, że ktoś
 * w ogóle pisał. Zamówienia takiego problemu nie mają, bo siedzą w bazie.
 *
 * Dlatego każda wiadomość ląduje najpierw tutaj, a dopiero potem idzie mailem.
 * Kolekcja jest zapisem źródłowym, nie kopią skrzynki: panel pokazuje ją
 * niezależnie od tego, czy powiadomienie dotarło.
 */
const COLLECTION = "formMessages";

/** Ile wiadomości ściągamy pod filtry — reszta czeka na zawężenie zakresu. */
const FETCH_LIMIT = 500;

export const MESSAGES_PAGE_SIZE = 25;

export type FormMessageKind = "contact" | "design";

/** „Nowa" znaczy tylko tyle, że nikt jej jeszcze nie odhaczył w panelu. */
export type FormMessageStatus = "new" | "handled";

/** Czy powiadomienie mailowe wyszło z Brevo — przy „failed" panel jest jedynym śladem. */
export type FormMessageMailStatus = "sent" | "failed" | "pending";

export type FormMessage = {
  id: string;
  kind: FormMessageKind;
  createdAt: string;
  /** Formularz projektu pyta tylko o e-mail, więc bywa puste. */
  name: string;
  email: string;
  subject: string;
  message: string;
  status: FormMessageStatus;
  handledAt: string | null;
  handledBy: string | null;
  mailStatus: FormMessageMailStatus;
  mailError: string | null;
};

export const KIND_LABELS: Record<FormMessageKind, string> = {
  contact: "Kontakt",
  design: "Projekt naklejki",
};

function toFormMessage(id: string, data: FirebaseFirestore.DocumentData): FormMessage {
  return {
    id,
    kind: data.kind === "design" ? "design" : "contact",
    createdAt: data.createdAt ?? "",
    name: data.name ?? "",
    email: data.email ?? "",
    subject: data.subject ?? "",
    message: data.message ?? "",
    status: data.status === "handled" ? "handled" : "new",
    handledAt: data.handledAt ?? null,
    handledBy: data.handledBy ?? null,
    mailStatus:
      data.mailStatus === "sent" || data.mailStatus === "failed" ? data.mailStatus : "pending",
    mailError: data.mailError ?? null,
  };
}

/**
 * Zapisuje wiadomość, zanim ruszy wysyłka maila.
 *
 * Nie rzuca wyjątkiem: awaria Firestore nie może zablokować formularza,
 * bo mail wciąż ma szansę dojść. Zwraca `null`, gdy zapis się nie udał —
 * wtedy nie ma czego później oznaczać.
 */
export async function recordFormMessage(entry: {
  kind: FormMessageKind;
  name?: string;
  email: string;
  subject: string;
  message: string;
}): Promise<string | null> {
  try {
    const ref = await db.collection(COLLECTION).add({
      kind: entry.kind,
      createdAt: new Date().toISOString(),
      name: entry.name ?? "",
      email: entry.email,
      subject: entry.subject,
      message: entry.message,
      status: "new",
      handledAt: null,
      handledBy: null,
      mailStatus: "pending",
      mailError: null,
    });
    return ref.id;
  } catch (error) {
    console.error("recordFormMessage error:", error);
    return null;
  }
}

/**
 * Dopisuje wynik wysyłki do zapisanej wiadomości. Też bez wyjątków —
 * to adnotacja dla panelu, a nie część obsługi formularza.
 */
export async function markFormMessageMail(
  id: string | null,
  result: { ok: true } | { ok: false; error: string }
): Promise<void> {
  if (!id) return;
  try {
    await db.collection(COLLECTION).doc(id).update(
      result.ok
        ? { mailStatus: "sent", mailError: null }
        : { mailStatus: "failed", mailError: result.error.slice(0, 500) }
    );
  } catch (error) {
    console.error("markFormMessageMail error:", error);
  }
}

/** Najnowsze wiadomości. Sortowanie po jednym polu — bez indeksu złożonego. */
export async function listFormMessages(limit = FETCH_LIMIT): Promise<FormMessage[]> {
  const snapshot = await db
    .collection(COLLECTION)
    .orderBy("createdAt", "desc")
    .limit(limit)
    .get();

  return snapshot.docs.map((doc) => toFormMessage(doc.id, doc.data()));
}

/**
 * Liczba nieodhaczonych wiadomości — do odznaki przy zakładce.
 *
 * `count()` liczy się po stronie Firestore, więc nie ściągamy dokumentów
 * tylko po to, żeby pokazać jedną liczbę na każdej stronie panelu.
 */
export async function countNewFormMessages(): Promise<number> {
  try {
    const snapshot = await db
      .collection(COLLECTION)
      .where("status", "==", "new")
      .count()
      .get();
    return snapshot.data().count;
  } catch (error) {
    console.error("countNewFormMessages error:", error);
    return 0;
  }
}

export type FormMessageFilters = {
  kind?: FormMessageKind;
  status?: FormMessageStatus;
  /** „failed" — tylko te, których mail nie wyszedł. */
  mail?: "failed";
  search?: string;
};

type SearchParams = Record<string, string | string[] | undefined>;

function single(params: SearchParams, key: string): string | undefined {
  const value = params[key];
  return (Array.isArray(value) ? value[0] : value) || undefined;
}

export function parseMessageFilters(params: SearchParams): FormMessageFilters {
  const kind = single(params, "rodzaj");
  const status = single(params, "stan");

  return {
    kind: kind === "contact" || kind === "design" ? kind : undefined,
    status: status === "new" || status === "handled" ? status : undefined,
    mail: single(params, "mail") === "failed" ? "failed" : undefined,
    search: single(params, "szukaj"),
  };
}

export function filterFormMessages(
  messages: FormMessage[],
  filters: FormMessageFilters
): FormMessage[] {
  const search = filters.search?.trim().toLowerCase();

  return messages.filter((item) => {
    if (filters.kind && item.kind !== filters.kind) return false;
    if (filters.status && item.status !== filters.status) return false;
    if (filters.mail === "failed" && item.mailStatus !== "failed") return false;

    if (search) {
      const haystack = [item.name, item.email, item.subject, item.message]
        .join(" ")
        .toLowerCase();
      if (!haystack.includes(search)) return false;
    }

    return true;
  });
}

export function paginateFormMessages(
  messages: FormMessage[],
  page: number,
  pageSize = MESSAGES_PAGE_SIZE
): { items: FormMessage[]; page: number; pageCount: number; total: number } {
  const pageCount = Math.max(1, Math.ceil(messages.length / pageSize));
  const current = Math.min(Math.max(1, page), pageCount);
  const start = (current - 1) * pageSize;

  return {
    items: messages.slice(start, start + pageSize),
    page: current,
    pageCount,
    total: messages.length,
  };
}
