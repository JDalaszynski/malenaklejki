import "server-only";

import { db } from "@/lib/firebase/admin";
import { sendTransactionalEmail } from "@/lib/email/auth";
import { escapeHtml } from "@/lib/utils/sanitize";
import {
  buildInvoicePayload,
  warsawDate,
  createInvoice,
  findInvoiceByNumber,
  InfaktError,
  resolveInvoiceTask,
  type InfaktCreatedInvoice,
  type InfaktInvoiceListItem,
} from "@/lib/infakt";
import { normalizePaymentStatus } from "@/lib/orders/status";

/**
 * Wystawianie faktury w inFakcie po zaksięgowaniu płatności.
 *
 * Wejście jest jedno dla wszystkich ścieżek: webhooka Przelewy24 i ręcznego
 * oznaczenia zapłaty w panelu. Dzięki temu każde przejście zamówienia w PAID
 * kończy się dokładnie tą samą fakturą.
 */

/** Stan wystawiania zapisywany przy zamówieniu w polu `infakt`. */
export type OrderInvoiceState = {
  status: "PENDING" | "ISSUED" | "ERROR";
  uuid?: string | null;
  number?: string | null;
  taskReference?: string | null;
  startedAt?: string | null;
  issuedAt?: string | null;
  failedAt?: string | null;
  error?: string | null;
  warnings?: string[];
  /**
   * Faktura wystawiona poza automatem i przypięta później: przez raport
   * (`lib/admin/invoiceNumbers`) po numerze zamówienia w uwagach albo po
   * kwocie, dacie i nabywcy, albo ręcznie w panelu (`linkInvoiceToOrder`).
   */
  linkedBy?: "notes" | "match" | "manual";
};

export type IssueInvoiceResult = {
  ok: boolean;
  number?: string | null;
  error?: string;
  /** Faktura już istniała albo wystawia ją właśnie inny proces. */
  skipped?: boolean;
};

/**
 * Po tym czasie uznajemy rozpoczęte wystawianie za przerwane (np. funkcja
 * padła w połowie) i pozwalamy spróbować jeszcze raz.
 */
const PENDING_TIMEOUT_MS = 5 * 60 * 1000;

/**
 * Data uruchomienia integracji. Zamówienia opłacone wcześniej nie dostają
 * faktury automatycznie — inaczej wpisanie do panelu historycznej sprzedaży
 * (albo spóźniona płatność za stare zamówienie) zrobiłoby w księgowości
 * fakturę z datą wsteczną. `INFAKT_START_DATE` pozwala przesunąć próg.
 */
const INVOICING_START_DATE = process.env.INFAKT_START_DATE || "2026-08-24";

/** Czy zamówienie jest sprzed uruchomienia integracji z inFaktem. */
export function isBeforeInvoicing(order: {
  paidAt?: string | null;
  createdAt?: string | null;
}): boolean {
  const reference = order.paidAt || order.createdAt;
  if (!reference) return false;
  return warsawDate(reference) < INVOICING_START_DATE;
}

function isFresh(startedAt?: string | null): boolean {
  if (!startedAt) return false;
  const started = new Date(startedAt).getTime();
  return !Number.isNaN(started) && Date.now() - started < PENDING_TIMEOUT_MS;
}

async function saveIssued(
  ref: FirebaseFirestore.DocumentReference,
  created: InfaktCreatedInvoice,
  warnings: string[]
): Promise<void> {
  const state: OrderInvoiceState = {
    status: "ISSUED",
    uuid: created.uuid,
    number: created.number ?? null,
    taskReference: created.taskReference ?? null,
    issuedAt: new Date().toISOString(),
    warnings,
  };
  // `invoiceNumber` na wierzchu dokumentu czyta panel i raporty sprzedaży.
  await ref.update({ infakt: state, invoiceNumber: created.number ?? null });
}

/** Alert do sprzedawcy — faktura jest jedyną rzeczą, której nie da się odtworzyć z maila. */
async function alertSeller(
  order: FirebaseFirestore.DocumentData,
  orderId: string,
  heading: string,
  message: string
): Promise<void> {
  const adminEmail = process.env.ADMIN_EMAIL || "kontakt@malenaklejki.pl";
  const appUrl = (process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000").replace(/\/+$/, "");
  const orderUrl = `${appUrl}/admin/zamowienia/${orderId}`;

  await sendTransactionalEmail({
    sender: { name: "MałeNaklejki - System zamówień", email: adminEmail },
    to: [{ email: adminEmail, name: "MałeNaklejki - Sprzedawca" }],
    subject: `⚠️ ${heading} — zamówienie ${order.orderNumber ?? orderId}`,
    htmlContent: `
      <div style="font-family:'Inter',system-ui,-apple-system,sans-serif;color:#0f172a;line-height:1.6;">
        <h2 style="margin:0 0 12px;font-size:18px;font-weight:800;">${escapeHtml(heading)}</h2>
        <p style="margin:0 0 12px;font-size:14px;">
          Zamówienie <strong>${escapeHtml(String(order.orderNumber ?? orderId))}</strong>
          (${escapeHtml(String(order.customer?.email ?? ""))}),
          kwota ${(order.totals?.total ?? 0).toFixed(2).replace(".", ",")} zł.
        </p>
        <p style="margin:0 0 16px;font-size:14px;background:#fef3c7;border:1px solid #fcd34d;border-radius:12px;padding:12px 14px;">
          ${escapeHtml(message)}
        </p>
        <p style="margin:0;font-size:14px;">
          <a href="${orderUrl}" style="color:#02af7a;font-weight:700;">Otwórz zamówienie w panelu</a>
        </p>
      </div>
    `,
  });
}

/**
 * Wystawia fakturę za zamówienie. Bezpieczna do wielokrotnego wywołania:
 * gotowa faktura albo zlecenie w toku blokują kolejną próbę, więc powtórzony
 * webhook nie zrobi duplikatu w księgowości.
 *
 * @param options.force pomija blokadę trwającego zlecenia (przycisk w panelu).
 */
export async function issueInvoiceForOrder(
  orderId: string,
  options: { force?: boolean } = {}
): Promise<IssueInvoiceResult> {
  const ref = db.collection("orders").doc(String(orderId));
  const snapshot = await ref.get();
  if (!snapshot.exists) return { ok: false, error: "Zamówienie nie istnieje." };

  const order = snapshot.data()!;
  const state = (order.infakt ?? null) as OrderInvoiceState | null;

  if (state?.uuid) return { ok: true, number: state.number ?? null, skipped: true };

  if (normalizePaymentStatus(order.status) !== "PAID") {
    return { ok: false, error: "Zamówienie nie jest opłacone — faktury nie wystawiamy." };
  }
  if (!((order.totals?.total ?? 0) > 0)) {
    return { ok: false, error: "Zamówienie ma zerową kwotę — faktury nie wystawiamy." };
  }

  // Historyczna sprzedaż zostaje poza integracją. Ręczny przycisk w panelu
  // (`force`) potrafi to obejść, ale tylko na wyraźne kliknięcie.
  if (!options.force && isBeforeInvoicing(order)) {
    console.log(
      `inFakt: pomijam zamówienie ${order.orderNumber} — opłacone przed ${INVOICING_START_DATE}.`
    );
    return { ok: true, skipped: true };
  }

  // Poprzednia próba wystartowała, ale nie doczekaliśmy się wyniku. Zanim
  // zlecimy cokolwiek nowego, sprawdzamy, czy inFakt jednak jej nie przetworzył.
  if (state?.taskReference) {
    try {
      const resolved = await resolveInvoiceTask(state.taskReference);
      if (resolved) {
        await saveIssued(ref, resolved, state.warnings ?? []);
        return { ok: true, number: resolved.number ?? null, skipped: true };
      }
    } catch (error) {
      console.error(`inFakt: nie udało się sprawdzić zlecenia ${state.taskReference}:`, error);
    }
  }

  // Blokada na dokumencie — ponowiony webhook i przycisk w panelu potrafią
  // trafić w to samo zamówienie.
  const claimedAt = new Date().toISOString();
  const claimed = await db.runTransaction(async (tx) => {
    const fresh = await tx.get(ref);
    const current = (fresh.data()?.infakt ?? null) as OrderInvoiceState | null;
    if (current?.uuid) return false;
    if (!options.force && current?.status === "PENDING" && isFresh(current.startedAt)) return false;

    const pending: OrderInvoiceState = {
      status: "PENDING",
      startedAt: claimedAt,
      taskReference: current?.taskReference ?? null,
    };
    tx.update(ref, { infakt: pending });
    return true;
  });

  if (!claimed) return { ok: true, skipped: true };

  try {
    const { invoice, warnings } = await buildInvoicePayload(order);
    const created = await createInvoice(invoice);
    await saveIssued(ref, created, warnings);

    console.log(
      `inFakt: wystawiono fakturę ${created.number ?? created.uuid} do zamówienia ${order.orderNumber}`
    );

    if (warnings.length > 0) {
      await alertSeller(
        order,
        String(orderId),
        `Faktura ${created.number ?? ""} wystawiona z zastrzeżeniami`.trim(),
        warnings.join(" ")
      );
    }

    return { ok: true, number: created.number ?? null };
  } catch (error) {
    const message =
      error instanceof InfaktError
        ? error.message
        : String((error as Error)?.message ?? error);
    const taskReference = error instanceof InfaktError ? error.taskReference ?? null : null;

    const failed: OrderInvoiceState = {
      status: "ERROR",
      taskReference,
      failedAt: new Date().toISOString(),
      error: message.slice(0, 500),
    };
    await ref.update({ infakt: failed });

    console.error(`inFakt: błąd wystawiania faktury do zamówienia ${order.orderNumber}:`, error);
    try {
      await alertSeller(order, String(orderId), "Nie wystawiono faktury w inFakcie", message);
    } catch (mailError) {
      console.error("inFakt: nie udało się wysłać alertu do sprzedawcy:", mailError);
    }

    return { ok: false, error: message };
  }
}

export type LinkInvoiceResult =
  | {
      ok: true;
      number: string;
      /** Numer przypięty do zamówienia przed zmianą. */
      previous: string | null;
      /** Krótki opis przypiętej faktury — kwota i nabywca, do sprawdzenia na oko. */
      summary: string;
      /** Rozbieżności, które warto obejrzeć; zmiana i tak została zapisana. */
      warnings: string[];
    }
  | { ok: false; error: string };

function formatGross(grosze: number): string {
  return `${(grosze / 100).toFixed(2).replace(".", ",")} zł`;
}

function invoiceBuyer(invoice: InfaktInvoiceListItem): string {
  return (
    invoice.client_company_name?.trim() ||
    `${invoice.client_first_name ?? ""} ${invoice.client_last_name ?? ""}`.trim()
  );
}

/**
 * Przypina do zamówienia fakturę o podanym numerze — ręczna poprawka z panelu,
 * gdy automat powiązał nie tę albo fakturę wystawiono na nowo w inFakcie.
 *
 * Numer musi istnieć w inFakcie. Zamówienie zapamiętuje UUID faktury, a nie
 * sam numer: ewidencja sprzedaży uzgadnia numery z inFaktem przy każdym
 * otwarciu (`lib/admin/invoiceNumbers`), więc numer bez pokrycia w księgowości
 * zniknąłby z raportu przy najbliższej okazji.
 */
export async function linkInvoiceToOrder(
  orderId: string,
  rawNumber: string
): Promise<LinkInvoiceResult> {
  const number = rawNumber.trim();
  const ref = db.collection("orders").doc(String(orderId));
  const snapshot = await ref.get();
  if (!snapshot.exists) return { ok: false, error: "Zamówienie nie istnieje." };

  const order = snapshot.data()!;
  const state = (order.infakt ?? null) as OrderInvoiceState | null;

  // Automat właśnie wystawia fakturę — jego zapis nadpisałby ręczną zmianę.
  if (state?.status === "PENDING" && isFresh(state.startedAt)) {
    return {
      ok: false,
      error: "Faktura do tego zamówienia właśnie się wystawia — spróbuj za chwilę.",
    };
  }

  let invoice: InfaktInvoiceListItem | null;
  try {
    invoice = await findInvoiceByNumber(number);
  } catch (error) {
    console.error(`inFakt: nie udało się wyszukać faktury ${number}:`, error);
    return {
      ok: false,
      error: "inFakt nie odpowiedział i numeru nie dało się sprawdzić — spróbuj ponownie za chwilę.",
    };
  }
  if (!invoice) {
    return {
      ok: false,
      error: `W inFakcie nie ma faktury o numerze „${number}”. Wpisz go tak, jak jest na fakturze, np. 12/10/2026.`,
    };
  }

  const previous: string | null = order.invoiceNumber ?? state?.number ?? null;
  if (state?.uuid === invoice.uuid && order.invoiceNumber === invoice.number) {
    return { ok: false, error: `Faktura ${invoice.number} jest już przypięta do tego zamówienia.` };
  }

  const warnings: string[] = [];
  if (invoice.kind !== "vat") {
    warnings.push(`To nie jest zwykła faktura VAT (rodzaj dokumentu w inFakcie: ${invoice.kind}).`);
  }
  const orderGross = Math.round(((order.totals?.total ?? 0) + Number.EPSILON) * 100);
  if (invoice.gross_price !== orderGross) {
    warnings.push(
      `Kwota faktury (${formatGross(invoice.gross_price)}) różni się od kwoty zamówienia (${formatGross(orderGross)}).`
    );
  }
  const sharing = await db
    .collection("orders")
    .where("infakt.uuid", "==", invoice.uuid)
    .select("orderNumber", "deletedAt")
    .get();
  const others = sharing.docs
    .filter((doc) => doc.id !== String(orderId) && !doc.data().deletedAt)
    .map((doc) => String(doc.data().orderNumber ?? doc.id));
  if (others.length > 0) {
    warnings.push(`Ta sama faktura jest przypięta także do: ${others.join(", ")}.`);
  }

  await ref.update({
    invoiceNumber: invoice.number,
    "infakt.status": "ISSUED",
    "infakt.uuid": invoice.uuid,
    "infakt.number": invoice.number,
    "infakt.issuedAt": invoice.created_at ?? invoice.invoice_date,
    "infakt.error": null,
    // Zastrzeżenia dotyczyły poprzedniej faktury.
    "infakt.warnings": [],
    "infakt.linkedBy": "manual",
  });

  return {
    ok: true,
    number: invoice.number,
    previous,
    summary: [formatGross(invoice.gross_price), invoiceBuyer(invoice)].filter(Boolean).join(", "),
    warnings,
  };
}

/**
 * Wersja do wołania z webhooka — nigdy nie rzuca, bo problem
 * z fakturą nie może zablokować potwierdzenia płatności ani maili do klienta.
 */
export async function issueInvoiceForOrderSafely(orderId: string): Promise<void> {
  try {
    await issueInvoiceForOrder(orderId);
  } catch (error) {
    console.error(`inFakt: nieoczekiwany błąd przy zamówieniu ${orderId}:`, error);
  }
}
