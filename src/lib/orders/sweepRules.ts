/**
 * Reguła decydująca, które zamówienie uznajemy za nieopłacone i przenosimy
 * do kosza.
 *
 * Moduł celowo nie ma `server-only` — korzysta z niego zarówno kod aplikacji
 * (src/lib/orders/sweep.ts), jak i skrypt uruchamiany z linii poleceń.
 * Trzymanie warunku w jednym miejscu jest ważniejsze niż dodatkowa bariera:
 * dwie kopie tej samej reguły prędzej czy później zaczęłyby się różnić,
 * a rozjazd oznaczałby zamówienia znikające niezgodnie z oczekiwaniem.
 */

/** Po tylu dniach nieopłacone zamówienie trafia do kosza. */
export const ABANDONED_AFTER_DAYS = 7;

/**
 * Statusy uznawane za zamknięte bez zapłaty. `PAYMENT_FAILED` to starsza
 * nazwa — tak zapisana jest większość historycznych zamówień z nieudaną
 * płatnością.
 */
export const SWEEPABLE_STATUSES = ["PENDING_PAYMENT", "FAILED", "PAYMENT_FAILED"];

export function sweepCutoffIso(now = Date.now()): string {
  return new Date(now - ABANDONED_AFTER_DAYS * 86400000).toISOString();
}

/** Czy dane zamówienie kwalifikuje się do przeniesienia do kosza. */
export function isSweepable(
  data: { deletedAt?: unknown; status?: string; createdAt?: string },
  cutoffIso: string
): boolean {
  if (data.deletedAt) return false;
  if (!SWEEPABLE_STATUSES.includes(data.status ?? "")) return false;
  return Boolean(data.createdAt) && (data.createdAt as string) < cutoffIso;
}
