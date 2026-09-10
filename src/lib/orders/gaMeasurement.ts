import { sheetsValue, toItems, type AnalyticsSheet } from "@/lib/analytics";

/**
 * Czysta część zdarzenia `purchase` wysyłanego z serwera: odczyt identyfikatorów
 * z ciasteczek GA i budowa ciała żądania Measurement Protocol. Bez bazy i bez
 * żądania HTTP — dostęp do nich ma `gaPurchase.ts`.
 */

export type PurchaseOrder = {
  orderNumber: string;
  items?: unknown;
  totals?: { shipping?: unknown };
  payment?: { method?: string };
  analytics: { gaClientId: string; gaSessionId?: string | null };
};

/** Pozycje zamówienia z bazy w formacie zdarzeń GA4 — bez danych klienta. */
export function toAnalyticsSheets(items: unknown): AnalyticsSheet[] {
  if (!Array.isArray(items)) return [];
  return items.map((item: Record<string, unknown>): AnalyticsSheet => ({
    sheetQuantity: Number(item.sheetQuantity) || 0,
    pricePerSheet: Number(item.pricePerSheet) || 0,
    deliveryForm: item.deliveryForm === "individual" ? "individual" : "sheet",
  }));
}

/** `_ga` ma postać "GA1.1.<losowa>.<znacznik czasu>" — client_id to dwa ostatnie człony. */
export function parseGaClientId(value: string | undefined): string | null {
  const parts = value?.split(".") ?? [];
  if (parts.length < 4) return null;
  const clientId = parts.slice(-2).join(".");
  return /^\d+\.\d+$/.test(clientId) ? clientId : null;
}

/** `_ga_<ID>`: starszy format "GS1.1.<session_id>.…", nowszy "GS2.1.s<session_id>$o…". */
export function parseGaSessionId(value: string | undefined): string | null {
  if (!value) return null;
  const parts = value.split(".");
  const candidate = value.startsWith("GS2")
    ? parts.slice(2).join(".").split("$").find((token) => token.startsWith("s"))?.slice(1)
    : parts[2];
  return candidate && /^\d+$/.test(candidate) ? candidate : null;
}

export function buildPurchasePayload(order: PurchaseOrder) {
  const sheets = toAnalyticsSheets(order.items);
  return {
    client_id: order.analytics.gaClientId,
    events: [
      {
        name: "purchase",
        params: {
          transaction_id: order.orderNumber,
          currency: "PLN",
          value: sheetsValue(sheets),
          shipping: Number(order.totals?.shipping) || 0,
          payment_type: order.payment?.method ?? "przelewy24",
          items: toItems(sheets),
          // Bez session_id zakup nie przypisze się do wizyty (źródło, strona wejścia).
          ...(order.analytics.gaSessionId ? { session_id: order.analytics.gaSessionId } : {}),
          engagement_time_msec: 1,
        },
      },
    ],
  };
}
