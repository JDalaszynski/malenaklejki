/**
 * Zdarzenia, którymi sklep liczy własne zainteresowanie gotowymi zestawami.
 *
 * Ten plik trafia i do przeglądarki, i na serwer, więc nie importuje niczego
 * serwerowego. Liczniki są własne, a nie z Google Analytics, bo GA4 widzi tylko
 * osoby, które zgodziły się na cookies analityczne — a odmawia ich większość.
 */

/**
 * Kroki od zainteresowania do koszyka:
 * - `open`   — klient otworzył galerię (kliknął wejście),
 * - `select` — obejrzał wzór z bliska,
 * - `use`    — wczytał wzór do kreatora,
 * - `cart`   — dodał do koszyka zestaw zaczęty od gotowego wzoru.
 */
export const USAGE_EVENTS = ["open", "select", "use", "cart"] as const;
export type UsageEvent = (typeof USAGE_EVENTS)[number];

export const USAGE_EVENT_LABELS: Record<UsageEvent, string> = {
  open: "Otwarcia galerii",
  select: "Obejrzane wzory",
  use: "Wczytane do kreatora",
  cart: "Dodane do koszyka",
};

/**
 * Skąd klient otworzył galerię — każde wejście w kreatorze ma własny znacznik.
 * Wejście usunięte z kreatora znika też stąd: serwer przestaje je przyjmować,
 * a jego dawne otwarcia statystyki pokazują zbiorczo jako „usunięte wejścia".
 */
export const USAGE_SOURCES = [
  "podtytul",
  "panel",
  "pod-arkuszem",
  "zmien-wzor",
  "link",
] as const;
export type UsageSource = (typeof USAGE_SOURCES)[number];

export const USAGE_SOURCE_LABELS: Record<UsageSource, string> = {
  podtytul: "Link w podtytule kreatora",
  panel: "Przycisk w panelu „Dodaj naklejkę” (komputer)",
  "pod-arkuszem": "Przycisk pod arkuszem (telefon)",
  "zmien-wzor": "„Zmień wzór” przy wczytanym zestawie",
  link: "Link z adresem #gotowe-zestawy",
};

/** Zdarzenie przysyłane z przeglądarki. */
export type UsagePayload = {
  event: UsageEvent;
  source?: UsageSource;
  sheetId?: string;
};

export const USAGE_ENDPOINT = "/api/gotowe-zestawy/zdarzenie";

export function isUsageEvent(value: unknown): value is UsageEvent {
  return typeof value === "string" && (USAGE_EVENTS as readonly string[]).includes(value);
}

export function isUsageSource(value: unknown): value is UsageSource {
  return typeof value === "string" && (USAGE_SOURCES as readonly string[]).includes(value);
}
