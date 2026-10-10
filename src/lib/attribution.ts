/**
 * Skąd przyszło zamówienie — bez plików cookies.
 *
 * GA4 zapisuje zakup tylko osobom, które zgodziły się na analitykę, więc
 * Google Ads widzi ułamek sprzedaży z reklam. Dlatego sklep sam odnotowuje,
 * że wizyta zaczęła się od reklamy: parametry z adresu pierwszej strony
 * (sufiks kampanii `utm_…` albo identyfikator kliknięcia dopisywany przez
 * Google) trzymamy w pamięci karty i dołączamy do zamówienia.
 *
 * Nic nie trafia do cookies ani do localStorage. Do `sessionStorage` — żeby
 * źródło przetrwało odświeżenie strony — tylko po zgodzie marketingowej.
 * Samego identyfikatora kliknięcia nie zapisujemy nigdzie: liczy się to, że był.
 */

/** Parametry wizyty odczytane z adresu — to, co przeglądarka dołącza do zamówienia. */
export type VisitAttribution = {
  source: string | null;
  medium: string | null;
  campaign: string | null;
  term: string | null;
  /** W adresie był `gclid`, `gbraid` albo `wbraid` — wartości nie przechowujemy. */
  adClick: boolean;
};

/** Etykieta źródła zapisywana przy zamówieniu i pokazywana w panelu. */
export type OrderAcquisition = {
  channel: "google-ads";
  campaign: string | null;
  keyword: string | null;
};

export const ACQUISITION_LABELS: Record<OrderAcquisition["channel"], string> = {
  "google-ads": "Google Ads",
};

const CLICK_ID_PARAMS = ["gclid", "gbraid", "wbraid"];
const MAX_LENGTH = 100;

/** Wartość z adresu albo z żądania sprowadzona do krótkiego, bezpiecznego tekstu. */
function clean(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const text = value
    .replace(/\p{Cc}+/gu, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, MAX_LENGTH);
  return text || null;
}

/** Parametry kampanii z adresu strony; `null`, gdy adres nie niesie żadnego. */
export function readAttribution(search: string): VisitAttribution | null {
  const params = new URLSearchParams(search);
  const visit: VisitAttribution = {
    source: clean(params.get("utm_source")),
    medium: clean(params.get("utm_medium")),
    campaign: clean(params.get("utm_campaign")),
    term: clean(params.get("utm_term")),
    adClick: CLICK_ID_PARAMS.some((name) => Boolean(params.get(name))),
  };
  const empty = !visit.source && !visit.medium && !visit.campaign && !visit.term && !visit.adClick;
  return empty ? null : visit;
}

/**
 * Etykieta źródła dla zamówienia. Dane przychodzą z przeglądarki, więc traktujemy
 * je jak każde wejście od klienta: sprawdzamy kształt i sami ustalamy kanał.
 * Zwraca `null`, gdy wizyta nie zaczęła się od reklamy Google.
 */
export function toOrderAcquisition(input: unknown): OrderAcquisition | null {
  if (!input || typeof input !== "object") return null;
  const visit = input as Record<string, unknown>;

  const source = clean(visit.source)?.toLowerCase() ?? null;
  const medium = clean(visit.medium)?.toLowerCase() ?? null;
  const paidSearch = medium === "cpc" && (source === null || source === "google");
  if (visit.adClick !== true && !paidSearch) return null;

  return {
    channel: "google-ads",
    campaign: clean(visit.campaign),
    keyword: clean(visit.term),
  };
}

/** Etykieta odczytana z zapisanego zamówienia; `null` dla zamówień spoza reklam. */
export function toStoredAcquisition(stored: unknown): OrderAcquisition | null {
  if (!stored || typeof stored !== "object") return null;
  const data = stored as Record<string, unknown>;
  if (data.channel !== "google-ads") return null;
  return { channel: "google-ads", campaign: clean(data.campaign), keyword: clean(data.keyword) };
}

// ---------------------------------------------------------------------------
// Pamięć wizyty w przeglądarce
// ---------------------------------------------------------------------------

const STORAGE_KEY = "mn-zrodlo-wizyty";

let visit: VisitAttribution | null = null;

/** Ta sama reguła, co w skrypcie zgód w `app/layout.tsx`. */
function hasMarketingConsent(): boolean {
  try {
    const stored = localStorage.getItem("cookies-preferences");
    if (stored) return JSON.parse(stored).marketing === true;
    return localStorage.getItem("cookies-accepted") === "true";
  } catch {
    return false;
  }
}

/**
 * Zapis w `sessionStorage` idzie za zgodą marketingową: jest zgoda — źródło
 * przetrwa odświeżenie strony, nie ma — sprzątamy to, co mogło tam zostać.
 * Baner cookies woła to po każdej decyzji klienta.
 */
export function syncAttributionStorage(): void {
  if (typeof window === "undefined") return;
  try {
    if (visit && hasMarketingConsent()) sessionStorage.setItem(STORAGE_KEY, JSON.stringify(visit));
    else sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    // Zablokowany magazyn przeglądarki nie może przeszkodzić w zakupie.
  }
}

/** Wołane raz, na pierwszej stronie wizyty — później adres nie niesie już parametrów. */
export function captureAttribution(search: string): void {
  const fromUrl = readAttribution(search);
  if (fromUrl) {
    visit = fromUrl;
  } else if (!visit && typeof window !== "undefined" && hasMarketingConsent()) {
    try {
      const stored = sessionStorage.getItem(STORAGE_KEY);
      if (stored) visit = JSON.parse(stored) as VisitAttribution;
    } catch {
      // Uszkodzony wpis — zostajemy bez źródła.
    }
  }
  syncAttributionStorage();
}

/** Źródło bieżącej wizyty do dołączenia do zamówienia. */
export function getAttribution(): VisitAttribution | null {
  return visit;
}
