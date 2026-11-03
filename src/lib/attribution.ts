/**
 * Skąd przyszło zamówienie — bez plików cookies.
 *
 * GA4 zapisuje zakup tylko osobom, które zgodziły się na analitykę, więc
 * Google Ads widzi ułamek sprzedaży z reklam. Dlatego sklep sam odnotowuje,
 * od której podstrony zaczęła się wizyta i czy był to ruch z reklamy: ścieżkę
 * pierwszej strony (bez parametrów adresu) oraz parametry kampanii `utm_…` albo
 * fakt obecności identyfikatora kliknięcia Google trzymamy w pamięci karty
 * i dołączamy do zamówienia.
 *
 * Nic nie trafia do cookies ani do localStorage. Do `sessionStorage` — żeby
 * dane wejścia przetrwały odświeżenie strony — tylko po zgodzie marketingowej.
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
  /** Ścieżka pierwszej strony wizyty — bez parametrów `?…` i bez fragmentu `#…`. */
  landingPage: string | null;
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
const MAX_PATH_LENGTH = 200;

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

/** Ścieżka strony sprowadzona do bezpiecznej postaci `/…`, zawsze bez `?…` i `#…`. */
export function cleanLandingPath(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const raw = value.replace(/\p{Cc}+/gu, "").trim();
  const withoutParams = raw.split(/[?#]/, 1)[0]?.trim() ?? "";
  if (!withoutParams.startsWith("/") || withoutParams.startsWith("//")) return null;
  const normalized =
    withoutParams.length > 1 ? withoutParams.replace(/\/+$/, "") : withoutParams;
  return normalized.slice(0, MAX_PATH_LENGTH) || null;
}

type CampaignParams = Omit<VisitAttribution, "landingPage">;

function readCampaignParams(search: string): CampaignParams | null {
  const params = new URLSearchParams(search);
  const campaign: CampaignParams = {
    source: clean(params.get("utm_source")),
    medium: clean(params.get("utm_medium")),
    campaign: clean(params.get("utm_campaign")),
    term: clean(params.get("utm_term")),
    adClick: CLICK_ID_PARAMS.some((name) => Boolean(params.get(name))),
  };
  const empty =
    !campaign.source &&
    !campaign.medium &&
    !campaign.campaign &&
    !campaign.term &&
    !campaign.adClick;
  return empty ? null : campaign;
}

/** Dane wejścia z adresu pierwszej strony; `null`, gdy nie ma ani kampanii, ani ścieżki. */
export function readAttribution(search: string, pathname?: string): VisitAttribution | null {
  const campaign = readCampaignParams(search);
  const landingPage = cleanLandingPath(pathname);
  if (!campaign && !landingPage) return null;
  return {
    source: campaign?.source ?? null,
    medium: campaign?.medium ?? null,
    campaign: campaign?.campaign ?? null,
    term: campaign?.term ?? null,
    adClick: campaign?.adClick ?? false,
    landingPage,
  };
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

/** Ścieżka pierwszej strony wizyty dla zapisanego zamówienia (bez parametrów adresu). */
export function toOrderLandingPage(input: unknown): string | null {
  if (!input || typeof input !== "object") return null;
  const visit = input as Record<string, unknown>;
  return cleanLandingPath(visit.landingPage);
}

/** Etykieta odczytana z zapisanego zamówienia; `null` dla zamówień spoza reklam. */
export function toStoredAcquisition(stored: unknown): OrderAcquisition | null {
  if (!stored || typeof stored !== "object") return null;
  const data = stored as Record<string, unknown>;
  if (data.channel !== "google-ads") return null;
  return { channel: "google-ads", campaign: clean(data.campaign), keyword: clean(data.keyword) };
}

/** Ścieżka pierwszej strony wizyty odczytana z zapisanego zamówienia. */
export function toStoredLandingPage(stored: unknown): string | null {
  return cleanLandingPath(stored);
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

function parseStoredVisit(raw: string): VisitAttribution | null {
  try {
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return null;
    const data = parsed as Record<string, unknown>;
    const candidate: VisitAttribution = {
      source: clean(data.source),
      medium: clean(data.medium),
      campaign: clean(data.campaign),
      term: clean(data.term),
      adClick: data.adClick === true,
      landingPage: cleanLandingPath(data.landingPage),
    };
    const empty =
      !candidate.source &&
      !candidate.medium &&
      !candidate.campaign &&
      !candidate.term &&
      !candidate.adClick &&
      !candidate.landingPage;
    return empty ? null : candidate;
  } catch {
    return null;
  }
}

/**
 * Zapis w `sessionStorage` idzie za zgodą marketingową: jest zgoda — źródło
 * i strona wejścia przetrwają odświeżenie karty, nie ma — sprzątamy to, co
 * mogło tam zostać. Baner cookies woła to po każdej decyzji klienta.
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

/** Wołane na wejściu do sklepu — zapamiętuje pierwszą stronę i parametry kampanii. */
export function captureAttribution(search: string, pathname?: string): void {
  const campaignFromUrl = readCampaignParams(search);
  const landingPath = cleanLandingPath(pathname);

  if (!visit && typeof window !== "undefined" && hasMarketingConsent()) {
    try {
      const stored = sessionStorage.getItem(STORAGE_KEY);
      if (stored) visit = parseStoredVisit(stored);
    } catch {
      // Uszkodzony lub niedostępny wpis — zostajemy przy pamięci karty.
    }
  }

  if (campaignFromUrl) {
    visit = {
      ...campaignFromUrl,
      landingPage: landingPath ?? visit?.landingPage ?? null,
    };
  } else if (!visit) {
    if (landingPath) {
      visit = {
        source: null,
        medium: null,
        campaign: null,
        term: null,
        adClick: false,
        landingPage: landingPath,
      };
    }
  } else if (!visit.landingPage && landingPath) {
    visit = { ...visit, landingPage: landingPath };
  }

  syncAttributionStorage();
}

/** Źródło i strona wejścia bieżącej wizyty do dołączenia do zamówienia. */
export function getAttribution(): VisitAttribution | null {
  return visit;
}
