import { escapeHtml } from "@/lib/utils/sanitize";
import { formatLongDate, resolveVacation, type VacationSettings } from "./vacation";

/**
 * Ramka o przerwie urlopowej wstawiana do maili do klienta.
 *
 * Zwraca pusty napis, gdy przerwa nie trwa — dzięki temu wywołania nie muszą
 * niczego sprawdzać, a szablony pozostają zwykłymi funkcjami synchronicznymi.
 * Zapowiedź pomijamy celowo: w mailu liczy się to, kiedy paczka realnie
 * wyjdzie, a zamówienie złożone przed urlopem wysyłamy normalnie.
 */
export function buildVacationEmailNotice(settings: VacationSettings | null): string {
  if (!settings) return "";

  const info = resolveVacation(settings);
  if (info.status !== "active") return "";

  const heading = escapeHtml(info.title);
  const body = escapeHtml(
    info.resumesAt
      ? `Twoje zamówienie przyjęliśmy, ale wysyłamy je dopiero po przerwie — pierwsze paczki wyjdą ${formatLongDate(info.resumesAt)}. Dziękujemy za cierpliwość!`
      : "Twoje zamówienie przyjęliśmy, ale wysyłamy je dopiero po powrocie z przerwy. Dziękujemy za cierpliwość!"
  );

  return `
    <div style="background:#fff7ed;border:1px solid #fed7aa;border-radius:16px;padding:18px 20px;margin:0 0 20px;">
      <p style="margin:0 0 6px;font-size:14px;font-weight:800;color:#9a3412;">🌴 ${heading}</p>
      <p style="margin:0;font-size:13px;font-weight:600;color:#9a3412;line-height:1.6;">${body}</p>
    </div>`;
}
