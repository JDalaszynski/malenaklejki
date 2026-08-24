import "server-only";

import { db } from "@/lib/firebase/admin";
import { sendTransactionalEmail } from "@/lib/email/auth";
import { escapeHtml } from "@/lib/utils/sanitize";
import {
  buildInvoicePayload,
  warsawDate,
  createInvoice,
  InfaktError,
  resolveInvoiceTask,
  type InfaktCreatedInvoice,
} from "@/lib/infakt";
import { normalizePaymentStatus } from "@/lib/orders/status";

/**
 * Wystawianie faktury w inFakcie po zaksięgowaniu płatności.
 *
 * Wejście jest jedno dla wszystkich ścieżek: webhooka Przelewy24, Stripe'a,
 * awaryjnego crona i ręcznego oznaczenia zapłaty w panelu. Dzięki temu każde
 * przejście zamówienia w PAID kończy się dokładnie tą samą fakturą.
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

  // Blokada na dokumencie — webhook i cron potrafią trafić w to samo zamówienie.
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

/**
 * Wersja do wołania z webhooków i crona — nigdy nie rzuca, bo problem
 * z fakturą nie może zablokować potwierdzenia płatności ani maili do klienta.
 */
export async function issueInvoiceForOrderSafely(orderId: string): Promise<void> {
  try {
    await issueInvoiceForOrder(orderId);
  } catch (error) {
    console.error(`inFakt: nieoczekiwany błąd przy zamówieniu ${orderId}:`, error);
  }
}
