/**
 * Przerwa urlopowa — wspólny model ustawień.
 *
 * Moduł jest czysty (bez Firestore i bez `server-only`), bo z tych samych
 * reguł korzystają trzy miejsca: panel administratora, baner w przeglądarce
 * i szablony maili. Dzięki temu data powrotu liczona jest wszędzie tak samo.
 */

export type VacationTone = "info" | "warning";

export type VacationSettings = {
  /** Główny włącznik. Wyłączony = nic się nigdzie nie pokazuje. */
  enabled: boolean;
  /** Pierwszy dzień przerwy (`YYYY-MM-DD`). Puste = przerwa trwa od zaraz. */
  startsAt: string | null;
  /** Ostatni dzień przerwy (`YYYY-MM-DD`). Puste = bezterminowo. */
  endsAt: string | null;
  /** Na ile dni przed startem zapowiadać przerwę. 0 = bez zapowiedzi. */
  announceDaysBefore: number;
  /** Nagłówek banera. Puste = tekst generowany z dat. */
  title: string;
  /** Treść banera. Puste = tekst generowany z dat. */
  message: string;
  /** Co pokazać zamiast „Szacowana wysyłka". Puste = tekst generowany z dat. */
  shippingNote: string;
  /** Blokada składania nowych zamówień na czas przerwy. */
  pauseOrders: boolean;
  /** Wygląd banera: spokojny (zielony) albo ostrzegawczy (czerwony). */
  tone: VacationTone;
  updatedAt: string | null;
  updatedBy: string | null;
};

/** Tag pamięci podręcznej — po zapisie ustawień unieważniamy go w akcji serwerowej. */
export const VACATION_CACHE_TAG = "ustawienia-przerwy";

export const DEFAULT_VACATION_SETTINGS: VacationSettings = {
  enabled: false,
  startsAt: null,
  endsAt: null,
  announceDaysBefore: 7,
  title: "",
  message: "",
  shippingNote: "",
  pauseOrders: false,
  tone: "info",
  updatedAt: null,
  updatedBy: null,
};

/* ------------------------------------------------------------------ */
/* Daty                                                                */
/* ------------------------------------------------------------------ */

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

/**
 * Dzisiejsza data w strefie sklepu.
 *
 * Cały model trzyma daty jako `YYYY-MM-DD`, więc porównania sprowadzają się do
 * porównania napisów — bez pułapek związanych z przesunięciem czasu na
 * serwerze (Vercel pracuje w UTC, a sklep żyje czasem warszawskim).
 */
export function warsawToday(now: Date = new Date()): string {
  // `en-CA` formatuje datę dokładnie jako `YYYY-MM-DD`.
  return now.toLocaleDateString("en-CA", { timeZone: "Europe/Warsaw" });
}

function isoToUtc(iso: string): Date {
  const [year, month, day] = iso.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day));
}

/** Przesuwa datę `YYYY-MM-DD` o podaną liczbę dni. */
export function addDays(iso: string, days: number): string {
  const date = isoToUtc(iso);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

/** Liczba dni od `from` do `to` (ujemna, gdy `to` jest wcześniej). */
export function daysBetween(from: string, to: string): number {
  return Math.round((isoToUtc(to).getTime() - isoToUtc(from).getTime()) / 86_400_000);
}

/** `2026-09-05` → `05.09`. */
export function formatDayMonth(iso: string): string {
  const [, month, day] = iso.split("-");
  return `${day}.${month}`;
}

/** `2026-09-05` → `5 września`. */
export function formatLongDate(iso: string): string {
  return isoToUtc(iso).toLocaleDateString("pl-PL", {
    day: "numeric",
    month: "long",
    timeZone: "UTC",
  });
}

/* ------------------------------------------------------------------ */
/* Normalizacja                                                        */
/* ------------------------------------------------------------------ */

function cleanDate(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return ISO_DATE.test(trimmed) ? trimmed : null;
}

function cleanText(value: unknown, max: number): string {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

/**
 * Sprowadza dowolny zapis z bazy do pełnego kształtu ustawień.
 *
 * Dokument w Firestore powstawał na przestrzeni wdrożeń, więc czytamy go
 * defensywnie — brakujące pole ma dostać wartość domyślną, a nie wywrócić
 * render strony głównej.
 */
export function normalizeVacationSettings(raw: unknown): VacationSettings {
  const data = (raw ?? {}) as Record<string, unknown>;

  const startsAt = cleanDate(data.startsAt);
  let endsAt = cleanDate(data.endsAt);
  // Odwrócony zakres traktujemy jak przerwę bezterminową — lepiej pokazać
  // baner bez daty powrotu niż liczyć powrót „wstecz".
  if (startsAt && endsAt && endsAt < startsAt) endsAt = null;

  const announce = Number(data.announceDaysBefore);

  return {
    enabled: data.enabled === true,
    startsAt,
    endsAt,
    announceDaysBefore: Number.isFinite(announce)
      ? Math.min(90, Math.max(0, Math.round(announce)))
      : DEFAULT_VACATION_SETTINGS.announceDaysBefore,
    title: cleanText(data.title, 120),
    message: cleanText(data.message, 600),
    shippingNote: cleanText(data.shippingNote, 160),
    pauseOrders: data.pauseOrders === true,
    tone: data.tone === "warning" ? "warning" : "info",
    updatedAt: typeof data.updatedAt === "string" ? data.updatedAt : null,
    updatedBy: typeof data.updatedBy === "string" ? data.updatedBy : null,
  };
}

/* ------------------------------------------------------------------ */
/* Stan przerwy                                                        */
/* ------------------------------------------------------------------ */

export type VacationStatus = "off" | "upcoming" | "active";

export type ResolvedVacation = {
  status: VacationStatus;
  /** Czy baner ma się pokazać (przerwa trwa albo mieści się w oknie zapowiedzi). */
  visible: boolean;
  title: string;
  message: string;
  shippingNote: string;
  /** Blokada zamówień działa wyłącznie w trakcie trwania przerwy. */
  pauseOrders: boolean;
  tone: VacationTone;
  startsAt: string | null;
  endsAt: string | null;
  /** Pierwszy dzień pracy po przerwie (`YYYY-MM-DD`), o ile znany. */
  resumesAt: string | null;
  /** Zakres w formie `05.09 – 19.09`. Pusty, gdy przerwa jest bezterminowa. */
  rangeLabel: string;
  /** Ile dni zostało do startu przerwy (tylko dla zapowiedzi). */
  daysUntilStart: number | null;
  /** Ile dni zostało do powrotu (tylko w trakcie przerwy). */
  daysUntilReturn: number | null;
  /** Znacznik wersji ustawień — po zmianie baner wraca mimo zamknięcia. */
  version: string;
};

function autoTitle(status: VacationStatus): string {
  return status === "upcoming" ? "Zbliża się przerwa urlopowa" : "Przerwa urlopowa";
}

function autoMessage(
  status: VacationStatus,
  startsAt: string | null,
  endsAt: string | null,
  resumesAt: string | null
): string {
  const resume = resumesAt
    ? ` Zamówienia złożone w tym czasie realizujemy od ${formatLongDate(resumesAt)}.`
    : " Zamówienia złożone w tym czasie realizujemy zaraz po powrocie.";

  if (status === "upcoming" && startsAt) {
    const range = endsAt
      ? `Od ${formatLongDate(startsAt)} do ${formatLongDate(endsAt)} robimy przerwę w wysyłce.`
      : `Od ${formatLongDate(startsAt)} robimy przerwę w wysyłce.`;
    return `${range}${resume}`;
  }

  const period = endsAt
    ? `Do ${formatLongDate(endsAt)} mamy przerwę w wysyłce — sklep działa, ale paczki czekają na nasz powrót.`
    : "Mamy przerwę w wysyłce — sklep działa, ale paczki czekają na nasz powrót.";
  return `${period}${resume}`;
}

function autoShippingNote(resumesAt: string | null): string {
  return resumesAt
    ? `Wysyłka po przerwie: od ${formatDayMonth(resumesAt)}`
    : "Wysyłka wstrzymana — przerwa urlopowa";
}

/**
 * Wylicza, co i jak pokazać na dziś.
 *
 * Rozstrzygnięcie trzymamy w jednym miejscu, bo z tej samej odpowiedzi
 * korzysta baner, szacowana data wysyłki, blokada kasy i treść maila —
 * rozjazd między nimi byłby dla klienta gorszy niż brak informacji.
 */
export function resolveVacation(
  settings: VacationSettings,
  /** Data odniesienia albo gotowy dzień `YYYY-MM-DD` (tak przekazuje go serwer do przeglądarki). */
  now: Date | string = new Date()
): ResolvedVacation {
  const today = typeof now === "string" ? now : warsawToday(now);
  const { startsAt, endsAt } = settings;
  const resumesAt = endsAt ? addDays(endsAt, 1) : null;

  let status: VacationStatus = "off";
  if (settings.enabled) {
    const started = !startsAt || today >= startsAt;
    const finished = Boolean(endsAt) && today > (endsAt as string);
    if (started && !finished) status = "active";
    else if (!started) status = "upcoming";
  }

  const daysUntilStart =
    status === "upcoming" && startsAt ? daysBetween(today, startsAt) : null;
  const daysUntilReturn = status === "active" && endsAt ? daysBetween(today, endsAt) + 1 : null;

  const visible =
    status === "active" ||
    (status === "upcoming" &&
      settings.announceDaysBefore > 0 &&
      daysUntilStart !== null &&
      daysUntilStart <= settings.announceDaysBefore);

  const rangeLabel =
    startsAt && endsAt
      ? `${formatDayMonth(startsAt)} – ${formatDayMonth(endsAt)}`
      : endsAt
        ? `do ${formatDayMonth(endsAt)}`
        : startsAt
          ? `od ${formatDayMonth(startsAt)}`
          : "";

  return {
    status,
    visible,
    title: settings.title || autoTitle(status === "off" ? "active" : status),
    message: settings.message || autoMessage(status, startsAt, endsAt, resumesAt),
    shippingNote: settings.shippingNote || autoShippingNote(resumesAt),
    pauseOrders: status === "active" && settings.pauseOrders,
    tone: settings.tone,
    startsAt,
    endsAt,
    resumesAt,
    rangeLabel,
    daysUntilStart,
    daysUntilReturn,
    version: settings.updatedAt ?? "0",
  };
}

/** Komunikat pokazywany, gdy przerwa wstrzymuje przyjmowanie zamówień. */
export function pausedOrdersMessage(info: ResolvedVacation): string {
  return info.resumesAt
    ? `Chwilowo nie przyjmujemy nowych zamówień — wracamy ${formatLongDate(info.resumesAt)}. Koszyk poczeka, a jeśli chcesz, napisz do nas na kontakt@malenaklejki.pl.`
    : "Chwilowo nie przyjmujemy nowych zamówień z powodu przerwy urlopowej. Koszyk poczeka na nasz powrót.";
}
