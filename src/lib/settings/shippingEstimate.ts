/**
 * Szacowany termin wysyłki — wspólny model ustawienia.
 *
 * Moduł jest czysty (bez Firestore i bez `server-only`), bo ten sam rachunek
 * robi koszyk w przeglądarce i podgląd w panelu administratora. Jedna funkcja
 * zamiast dwóch gwarantuje, że w panelu widać dokładnie to, co zobaczy klient.
 */

export type ShippingEstimateSettings = {
  /** Godzina (czas warszawski), do której zamówienie liczy się jako „dzisiejsze". */
  cutoffHour: number;
  /** Widełki w dniach roboczych dla zamówień złożonych przed godziną graniczną. */
  beforeMin: number;
  beforeMax: number;
  /** Widełki dla zamówień złożonych po godzinie granicznej i w weekend. */
  afterMin: number;
  afterMax: number;
  updatedAt: string | null;
  updatedBy: string | null;
};

/** Wartości, z którymi sklep działał, zanim termin dało się ustawić w panelu. */
export const DEFAULT_SHIPPING_ESTIMATE_SETTINGS: ShippingEstimateSettings = {
  cutoffHour: 12,
  beforeMin: 1,
  beforeMax: 2,
  afterMin: 2,
  afterMax: 3,
  updatedAt: null,
  updatedBy: null,
};

/** Tag pamięci podręcznej — unieważniany przy zapisie ustawienia. */
export const SHIPPING_ESTIMATE_TAG = "ustawienia-termin-wysylki";

export const SHIPPING_LIMITS = {
  cutoffHour: { min: 1, max: 23 },
  days: { min: 0, max: 30 },
} as const;

function cleanInt(value: unknown, min: number, max: number, fallback: number): number {
  const number = Number(value);
  if (!Number.isFinite(number)) return fallback;
  return Math.min(max, Math.max(min, Math.round(number)));
}

/**
 * Sprowadza zapis z bazy do pełnego kształtu ustawień. Odwrócone widełki
 * (od > do) wyrównujemy do „do", żeby klient nie zobaczył daty końcowej
 * wcześniejszej niż początkowa.
 */
export function normalizeShippingEstimateSettings(raw: unknown): ShippingEstimateSettings {
  const data = (raw ?? {}) as Record<string, unknown>;
  const defaults = DEFAULT_SHIPPING_ESTIMATE_SETTINGS;
  const { days, cutoffHour } = SHIPPING_LIMITS;

  const beforeMax = cleanInt(data.beforeMax, days.min, days.max, defaults.beforeMax);
  const afterMax = cleanInt(data.afterMax, days.min, days.max, defaults.afterMax);

  return {
    cutoffHour: cleanInt(data.cutoffHour, cutoffHour.min, cutoffHour.max, defaults.cutoffHour),
    beforeMin: Math.min(beforeMax, cleanInt(data.beforeMin, days.min, days.max, defaults.beforeMin)),
    beforeMax,
    afterMin: Math.min(afterMax, cleanInt(data.afterMin, days.min, days.max, defaults.afterMin)),
    afterMax,
    updatedAt: typeof data.updatedAt === "string" ? data.updatedAt : null,
    updatedBy: typeof data.updatedBy === "string" ? data.updatedBy : null,
  };
}

/* ------------------------------------------------------------------ */
/* Rachunek                                                            */
/* ------------------------------------------------------------------ */

function addBusinessDays(startDate: Date, businessDays: number): Date {
  const date = new Date(startDate);
  let daysAdded = 0;
  while (daysAdded < businessDays) {
    date.setDate(date.getDate() + 1);
    const day = date.getDay();
    if (day !== 0 && day !== 6) daysAdded++;
  }
  return date;
}

function formatDate(date: Date): string {
  const day = date.getDate().toString().padStart(2, "0");
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  return `${day}.${month}`;
}

function toDayKey(date: Date): string {
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const day = date.getDate().toString().padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}

export type ShippingEstimate = {
  /** Gotowy napis, np. „Szacowana wysyłka: 02.10-05.10". */
  text: string;
  /** Ostatni dzień widełek (`YYYY-MM-DD`) — do porównania z początkiem przerwy. */
  lastDayKey: string;
  /** Czy zamówienie liczymy po godzinie granicznej (albo w weekend). */
  afterCutoff: boolean;
};

/**
 * Widełki „od–do", w których paczka wyjdzie ze sklepu przy normalnej pracy.
 *
 * `warsawLocal` to moment złożenia zamówienia zapisany polami daty i godziny
 * (rok, dzień, godzina…) — te pola mają już oznaczać czas warszawski, strefa
 * komputera nie gra roli. Dzięki temu panel może pokazać przykłady „w piątek
 * o 15:00" niezależnie od tego, gdzie i kiedy go otworzono.
 *
 * Zamówienia z soboty i niedzieli liczą się jak złożone po godzinie granicznej.
 * Święta nie są uwzględniane — na czas wolnych dni służy przerwa urlopowa.
 */
export function estimateShippingAt(
  settings: ShippingEstimateSettings,
  warsawLocal: Date
): ShippingEstimate {
  const isWeekend = warsawLocal.getDay() === 0 || warsawLocal.getDay() === 6;
  const afterCutoff = isWeekend || warsawLocal.getHours() >= settings.cutoffHour;

  const minDays = afterCutoff ? settings.afterMin : settings.beforeMin;
  const maxDays = afterCutoff ? settings.afterMax : settings.beforeMax;

  const minDate = addBusinessDays(warsawLocal, minDays);
  const maxDate = addBusinessDays(warsawLocal, maxDays);

  const range =
    minDays === maxDays ? formatDate(maxDate) : `${formatDate(minDate)}-${formatDate(maxDate)}`;

  return {
    text: `Szacowana wysyłka: ${range}`,
    lastDayKey: toDayKey(maxDate),
    afterCutoff,
  };
}

/** To samo dla chwili „teraz" (albo podanego momentu) — tak liczy koszyk. */
export function estimateShipping(
  settings: ShippingEstimateSettings,
  now: Date = new Date()
): ShippingEstimate {
  const warsawLocal = new Date(now.toLocaleString("en-US", { timeZone: "Europe/Warsaw" }));
  return estimateShippingAt(settings, warsawLocal);
}

/** `1` → „1 dzień roboczy", `2` → „2 dni robocze", `5` → „5 dni roboczych". */
export function businessDaysLabel(days: number): string {
  if (days === 1) return "1 dzień roboczy";
  const lastDigit = days % 10;
  const lastTwo = days % 100;
  if (lastDigit >= 2 && lastDigit <= 4 && !(lastTwo >= 12 && lastTwo <= 14)) {
    return `${days} dni robocze`;
  }
  return `${days} dni roboczych`;
}
