import { USAGE_ENDPOINT, type UsagePayload } from "./usageEvents";

/**
 * Zgłasza serwerowi, że klient zrobił krok w gotowych zestawach.
 *
 * Nic nie zapisuje w przeglądarce i niczego o kliencie nie wysyła — serwer
 * dostaje samo zdarzenie, dzięki czemu liczy się także wtedy, gdy klient
 * odrzucił cookies analityczne. Błąd sieci jest bez znaczenia dla klienta,
 * więc nigdy nie wychodzi poza tę funkcję.
 */
export function reportReadySheetsEvent(payload: UsagePayload): void {
  if (typeof window === "undefined") return;

  try {
    const body = JSON.stringify(payload);
    // `sendBeacon` dochodzi też wtedy, gdy strona właśnie się zamyka (przejście do koszyka).
    if (navigator.sendBeacon?.(USAGE_ENDPOINT, new Blob([body], { type: "application/json" }))) return;

    void fetch(USAGE_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
      keepalive: true,
    }).catch(() => {});
  } catch {
    // Liczniki nigdy nie mogą przeszkodzić klientowi.
  }
}
