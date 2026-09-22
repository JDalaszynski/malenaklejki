import "server-only";

import { db } from "@/lib/firebase/admin";
import { sendOrderToBaseLinker } from "@/lib/baselinker";
import { normalizePaymentStatus } from "./status";

/**
 * Przekazanie zamówienia do BaseLinkera.
 *
 * Do BaseLinkera trafiają wyłącznie zamówienia opłacone. Wcześniej sklep
 * wysyłał je w momencie złożenia — w BaseLinkerze lądowały więc także
 * porzucone koszyki i nieudane płatności, czyli zamówienia, których nikt nigdy
 * nie spakuje. Teraz wysyłkę odpala dopiero zmiana statusu na PAID: webhook
 * Przelewy24 przy płatności online i ręczne zaksięgowanie w panelu przy
 * przelewie tradycyjnym.
 *
 * Sam fakt zapłaty nadal nie jest przekazywany do BaseLinkera (`paid: 0`
 * w `buildBaseLinkerOrderParams`) — wpłatę sprzedawca księguje tam ręcznie.
 */

export type BaseLinkerPushResult = {
  ok: boolean;
  /** ID nadane przez BaseLinkera; brak, gdy nic nie wysłaliśmy. */
  baselinkerOrderId?: number;
  /** Zamówienie już tam jest albo trwa inna próba — nic nie zrobiliśmy. */
  skipped?: boolean;
  error?: string;
};

/**
 * Po tylu minutach uznajemy zaczętą wysyłkę za przerwaną (ubita funkcja,
 * zawieszony fetch) i pozwalamy spróbować jeszcze raz.
 */
const CLAIM_TTL_MS = 5 * 60 * 1000;

function isFresh(startedAt: string | null | undefined): boolean {
  if (!startedAt) return false;
  const started = new Date(startedAt).getTime();
  return Number.isFinite(started) && Date.now() - started < CLAIM_TTL_MS;
}

/**
 * Wysyła opłacone zamówienie do BaseLinkera. Bezpieczna do wielokrotnego
 * wywołania: zapisane `baselinkerOrderId` i blokada na czas trwającej próby
 * sprawiają, że ponowiony webhook P24 nie zrobi duplikatu zamówienia.
 *
 * @param options.force pomija wymóg opłacenia i blokadę trwającej próby —
 *   przycisk „Wyślij do BaseLinkera" w panelu.
 */
export async function pushOrderToBaseLinker(
  orderId: string,
  options: { force?: boolean } = {}
): Promise<BaseLinkerPushResult> {
  const ref = db.collection("orders").doc(String(orderId));
  const snapshot = await ref.get();
  if (!snapshot.exists) return { ok: false, error: "Zamówienie nie istnieje." };

  const order = snapshot.data()!;

  if (order.baselinkerOrderId) {
    return { ok: true, baselinkerOrderId: order.baselinkerOrderId, skipped: true };
  }

  if (!options.force && normalizePaymentStatus(order.status) !== "PAID") {
    return { ok: false, error: "Zamówienie nie jest opłacone — do BaseLinkera nie wysyłamy." };
  }

  // Blokada na dokumencie — P24 potrafi powtórzyć webhook, a sprzedawca
  // kliknąć przycisk w panelu w trakcie automatycznej wysyłki.
  const claimedAt = new Date().toISOString();
  const claimed = await db.runTransaction(async (tx) => {
    const fresh = (await tx.get(ref)).data();
    if (fresh?.baselinkerOrderId) return false;
    if (!options.force && isFresh(fresh?.baselinkerPushStartedAt)) return false;
    tx.update(ref, { baselinkerPushStartedAt: claimedAt });
    return true;
  });

  if (!claimed) return { ok: true, skipped: true };

  const result = await sendOrderToBaseLinker(order);

  if (result?.status !== "SUCCESS") {
    // Blokadę zdejmujemy od razu — kolejna próba ma ruszyć bez czekania.
    await ref.update({ baselinkerPushStartedAt: null }).catch(() => {});
    return { ok: false, error: result?.error_message || "BaseLinker odrzucił zamówienie." };
  }

  await ref.update({
    baselinkerOrderId: result.order_id,
    baselinkerPushedAt: new Date().toISOString(),
    baselinkerPushStartedAt: null,
  });

  console.log(
    `BaseLinker: zamówienie ${order.orderNumber} przekazane (ID: ${result.order_id}).`
  );

  return { ok: true, baselinkerOrderId: result.order_id };
}

/**
 * To samo, ale bez rzucania i bez wyniku — dla ścieżek obsługi płatności,
 * których awaria BaseLinkera nie może przerwać. Zamówienie zostaje wtedy
 * z pustym `baselinkerOrderId`, a panel pokazuje je na liście jako
 * niewysłane i pozwala dosłać jednym kliknięciem.
 */
export async function pushOrderToBaseLinkerSafely(orderId: string): Promise<void> {
  try {
    const result = await pushOrderToBaseLinker(orderId);
    if (!result.ok) {
      console.error(`BaseLinker: nie przekazano zamówienia ${orderId}: ${result.error}`);
    }
  } catch (error) {
    console.error(`BaseLinker: błąd przy przekazywaniu zamówienia ${orderId}:`, error);
  }
}
