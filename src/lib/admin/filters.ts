import type { OrderFilters } from "./queries";

const TIME_ZONE = "Europe/Warsaw";

/** Przesunięcie strefy warszawskiej względem UTC w danym momencie (uwzględnia czas letni). */
function zoneOffsetMs(date: Date): number {
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: TIME_ZONE,
    hour12: false,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  const parts: Record<string, string> = {};
  for (const part of formatter.formatToParts(date)) {
    if (part.type !== "literal") parts[part.type] = part.value;
  }

  const asUtc = Date.UTC(
    Number(parts.year),
    Number(parts.month) - 1,
    Number(parts.day),
    Number(parts.hour) === 24 ? 0 : Number(parts.hour),
    Number(parts.minute),
    Number(parts.second)
  );

  return asUtc - date.getTime();
}

/**
 * Zamienia lokalną datę (tak, jak widzi ją sprzedawca) na znacznik UTC.
 *
 * Bez tego zamówienie złożone o 1:00 w nocy 1 września wpadałoby do sierpnia,
 * bo w bazie leży jako 23:00 UTC dnia poprzedniego — a w raporcie księgowym
 * taki przeskok między miesiącami jest realnym problemem.
 */
export function zonedBoundary(
  year: number,
  month: number,
  day: number,
  end = false
): string {
  const guess = Date.UTC(
    year,
    month - 1,
    day,
    end ? 23 : 0,
    end ? 59 : 0,
    end ? 59 : 0,
    end ? 999 : 0
  );
  const offset = zoneOffsetMs(new Date(guess));
  return new Date(guess - offset).toISOString();
}

export function monthRange(monthValue: string): { from: string; to: string } | null {
  const match = /^(\d{4})-(\d{2})$/.exec(monthValue);
  if (!match) return null;

  const year = Number(match[1]);
  const month = Number(match[2]);
  if (month < 1 || month > 12) return null;

  const lastDay = new Date(Date.UTC(year, month, 0)).getUTCDate();
  return {
    from: zonedBoundary(year, month, 1),
    to: zonedBoundary(year, month, lastDay, true),
  };
}

function dayBoundary(value: string, end: boolean): string | undefined {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return undefined;
  return zonedBoundary(Number(match[1]), Number(match[2]), Number(match[3]), end);
}

export type AdminSearchParams = Record<string, string | string[] | undefined>;

function single(params: AdminSearchParams, key: string): string | undefined {
  const value = params[key];
  if (Array.isArray(value)) return value[0];
  return value || undefined;
}

/** Odczytuje filtry z adresu strony, żeby dały się zapisać w zakładce i cofnąć. */
export function parseFilters(params: AdminSearchParams, trash = false): OrderFilters {
  const month = single(params, "miesiac");
  const range = month ? monthRange(month) : null;

  const dateField = single(params, "dataWg") === "paidAt" ? "paidAt" : "createdAt";

  return {
    from: range?.from ?? (single(params, "od") ? dayBoundary(single(params, "od")!, false) : undefined),
    to: range?.to ?? (single(params, "do") ? dayBoundary(single(params, "do")!, true) : undefined),
    dateField,
    status: single(params, "status"),
    fulfillmentStatus: single(params, "realizacja"),
    paymentMethod: single(params, "platnosc"),
    deliveryMethod: single(params, "dostawa"),
    invoice: single(params, "faktura") === "yes" ? "yes" : single(params, "faktura") === "no" ? "no" : undefined,
    search: single(params, "szukaj"),
    trash,
  };
}

/** Bieżący miesiąc w formacie `RRRR-MM` — domyślny zakres raportu. */
export function currentMonthValue(): string {
  const formatter = new Intl.DateTimeFormat("pl-PL", {
    timeZone: TIME_ZONE,
    year: "numeric",
    month: "2-digit",
  });
  const parts: Record<string, string> = {};
  for (const part of formatter.formatToParts(new Date())) {
    if (part.type !== "literal") parts[part.type] = part.value;
  }
  return `${parts.year}-${parts.month}`;
}
