/** Statusy płatności i realizacji — wspólny słownik dla konta i panelu. */

export const PAYMENT_STATUSES = {
  PENDING_PAYMENT: { label: "Oczekuje na płatność", tone: "warning" },
  PAID: { label: "Opłacone", tone: "success" },
  FAILED: { label: "Płatność nieudana", tone: "danger" },
  REFUNDED: { label: "Zwrócone", tone: "neutral" },
  CANCELLED: { label: "Anulowane", tone: "neutral" },
} as const;

export const FULFILLMENT_STATUSES = {
  NEW: { label: "Nowe", tone: "neutral" },
  IN_PRODUCTION: { label: "W produkcji", tone: "info" },
  SHIPPED: { label: "Wysłane", tone: "info" },
  DELIVERED: { label: "Dostarczone", tone: "success" },
} as const;

export type PaymentStatus = keyof typeof PAYMENT_STATUSES;
export type FulfillmentStatus = keyof typeof FULFILLMENT_STATUSES;
export type StatusTone = "success" | "warning" | "danger" | "info" | "neutral";

export const PAYMENT_METHOD_LABELS: Record<string, string> = {
  przelewy24: "Przelewy24",
  blik: "BLIK",
  przelew: "Przelew tradycyjny",
  vinted: "Vinted",
  manual: "Dodane ręcznie",
};

export const DELIVERY_METHOD_LABELS: Record<string, string> = {
  kurier: "Kurier pod drzwi",
  paczkomat: "Paczkomat InPost",
  vinted: "Wysyłka Vinted",
};

/**
 * Nazwy statusów używane wcześniej w sklepie, zanim ujednoliciliśmy słownik.
 * Bez tego mapowania zamówienia zapisane starą nazwą pokazywały się w panelu
 * jako „Nieznany" — a takich rekordów jest w bazie kilkadziesiąt.
 */
const LEGACY_PAYMENT_STATUSES: Record<string, PaymentStatus> = {
  PAYMENT_FAILED: "FAILED",
  PENDING: "PENDING_PAYMENT",
  COMPLETED: "PAID",
};

/** Sprowadza status do nazwy ze słownika — także dla zapisów w starym formacie. */
export function normalizePaymentStatus(status: string | undefined): PaymentStatus {
  if (!status) return "PENDING_PAYMENT";
  if (status in PAYMENT_STATUSES) return status as PaymentStatus;
  return LEGACY_PAYMENT_STATUSES[status] ?? "PENDING_PAYMENT";
}

export function paymentStatusOf(status: string | undefined): { label: string; tone: StatusTone } {
  const known = PAYMENT_STATUSES[normalizePaymentStatus(status)];
  return { label: known.label, tone: known.tone as StatusTone };
}

export function fulfillmentStatusOf(status: string | undefined): { label: string; tone: StatusTone } {
  const known = FULFILLMENT_STATUSES[status as FulfillmentStatus];
  return known ? { label: known.label, tone: known.tone as StatusTone } : { label: "Nowe", tone: "neutral" };
}

export function formatPln(amount: number | undefined): string {
  return `${(amount ?? 0).toFixed(2).replace(".", ",")} zł`;
}

export function formatDate(iso: string | undefined | null): string {
  if (!iso) return "—";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("pl-PL", { day: "2-digit", month: "2-digit", year: "numeric" });
}

export function formatDateTime(iso: string | undefined | null): string {
  if (!iso) return "—";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString("pl-PL", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
