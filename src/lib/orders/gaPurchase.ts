import "server-only";

import { cookies } from "next/headers";
import { db } from "@/lib/firebase/admin";
import {
  buildPurchasePayload,
  parseGaClientId,
  parseGaSessionId,
  type PurchaseOrder,
} from "@/lib/orders/gaMeasurement";

export { toAnalyticsSheets } from "@/lib/orders/gaMeasurement";

/**
 * Zdarzenie `purchase` w GA4 wysyłane z serwera (Measurement Protocol), gdy
 * Przelewy24 potwierdzą płatność — w webhooku.
 *
 * W przeglądarce zakup ginął, gdy klient nie wrócił z P24 na stronę sukcesu
 * albo potwierdzenie przyszło po jej ostatnim odpytaniu. Webhook przychodzi
 * zawsze.
 *
 * Zdarzenie wiążemy z wizytą przez `client_id` i `session_id` z ciasteczek GA,
 * odczytanych przy składaniu zamówienia. Te ciasteczka istnieją tylko po zgodzie
 * na analitykę — bez nich nic nie wysyłamy, a zakup raportuje (bez ciasteczek)
 * strona sukcesu.
 */

const ENDPOINT = "https://www.google-analytics.com/mp/collect";

export type GaIdentifiers = { gaClientId: string; gaSessionId: string | null };

/** Bez sekretu Measurement Protocol zakup raportuje wyłącznie przeglądarka. */
export function isServerPurchaseTrackingEnabled(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_GA_ID && process.env.GA_MEASUREMENT_PROTOCOL_SECRET);
}

/** Identyfikatory GA z ciasteczek bieżącego żądania; `null`, gdy nie ma zgody na analitykę. */
export async function readGaIdentifiers(): Promise<GaIdentifiers | null> {
  try {
    const store = await cookies();
    const gaClientId = parseGaClientId(store.get("_ga")?.value);
    if (!gaClientId) return null;
    const streamId = (process.env.NEXT_PUBLIC_GA_ID ?? "").replace(/^G-/, "");
    const gaSessionId = streamId ? parseGaSessionId(store.get(`_ga_${streamId}`)?.value) : null;
    return { gaClientId, gaSessionId };
  } catch (error) {
    console.warn("GA4: nie odczytano ciasteczek GA:", error);
    return null;
  }
}

/**
 * Wysyła `purchase` dla opłaconego zamówienia. Nigdy nie rzuca — analityka nie
 * może przerwać obsługi płatności. Zamówienie oznaczamy w transakcji przed
 * wysyłką, więc ponowiony webhook P24 nie wyśle zakupu drugi raz.
 */
export async function sendPurchaseToGa(orderId: string): Promise<void> {
  if (!isServerPurchaseTrackingEnabled()) return;

  try {
    const orderRef = db.collection("orders").doc(orderId);
    const order = await db.runTransaction(async (tx) => {
      const data = (await tx.get(orderRef)).data();
      if (!data?.analytics?.gaClientId || data.analytics.purchaseSentAt) return null;
      tx.update(orderRef, { "analytics.purchaseSentAt": new Date().toISOString() });
      return data as PurchaseOrder;
    });
    if (!order) return;

    const url =
      `${ENDPOINT}?measurement_id=${encodeURIComponent(process.env.NEXT_PUBLIC_GA_ID ?? "")}` +
      `&api_secret=${encodeURIComponent(process.env.GA_MEASUREMENT_PROTOCOL_SECRET ?? "")}`;
    const res = await fetch(url, {
      method: "POST",
      body: JSON.stringify(buildPurchasePayload(order)),
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    console.log(`GA4: purchase ${order.orderNumber} wysłany z serwera.`);
  } catch (error) {
    // Znacznik zostaje — lepiej zgubić jeden zakup w GA, niż policzyć go dwa razy.
    console.error(`GA4: nie wysłano purchase dla zamówienia ${orderId}:`, error);
  }
}
