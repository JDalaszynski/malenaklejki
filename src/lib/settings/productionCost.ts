/**
 * Koszt produkcji arkusza — historia stawek u dostawcy.
 *
 * Moduł jest czysty (bez Firestore i bez `server-only`), bo z tej samej
 * historii korzystają: cena pozycji wysyłana do BaseLinkera, statystyki zysku,
 * rachunek przy zamówieniu w panelu i podgląd w formularzu ustawień. Jedna
 * funkcja wyboru stawki (`sheetCostAt`) gwarantuje, że wszędzie stoi ta sama
 * kwota.
 *
 * Zasada: zamówienie kosztuje tyle, ile wynosiła stawka w dniu jego zapłaty
 * (czas polski), a starsze zamówienia bez daty zapłaty — w dniu złożenia.
 * Sprzedaż dopisana ręcznie — w dniu sprzedaży. Zmiana stawki nie rusza
 * więc zamówień sprzed niej, a statystyki każdego miesiąca liczą się po
 * stawce, która wtedy obowiązywała.
 */

import * as z from "zod";

import { COST_RATES, round2 } from "@/lib/admin/costs";
import { warsawToday } from "./vacation";

export type SheetCostRate = {
  /**
   * Pierwszy dzień obowiązywania (`RRRR-MM-DD`, czas polski). `null` ma tylko
   * stawka pierwsza — obowiązuje od początku sklepu.
   */
  from: string | null;
  /** Koszt wydruku jednego arkusza A4 netto, bez VAT-u. */
  net: number;
};

export type ProductionCostSettings = {
  /** Stawki rosnąco po dacie; pierwsza ma `from: null`. */
  rates: SheetCostRate[];
  updatedAt: string | null;
  updatedBy: string | null;
};

/** Stawka wybrana dla konkretnego dnia. */
export type SheetCost = {
  net: number;
  /** Kwota z faktury dostawcy — i cena pozycji w BaseLinkerze. */
  gross: number;
  /** Od kiedy obowiązuje (`null` — od początku sklepu). */
  from: string | null;
};

/**
 * Historia, z którą sklep działa, dopóki nikt nie zapisze jej w panelu.
 * 15 zł netto (18,45 zł brutto) od startu sklepu, 25 zł netto od 19.10.2026.
 */
export const DEFAULT_PRODUCTION_COST_SETTINGS: ProductionCostSettings = {
  rates: [
    { from: null, net: 15 },
    { from: "2026-10-19", net: 25 },
  ],
  updatedAt: null,
  updatedBy: null,
};

export const SHEET_COST_LIMITS = {
  net: { min: 0.01, max: 1000 },
  /** Więcej zmian nie ma sensu trzymać — chroni dokument przed rozrostem. */
  rates: 60,
} as const;

const DAY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

/** Czy napis to prawdziwa data `RRRR-MM-DD` (bez 31 lutego). */
export function isValidDay(value: unknown): value is string {
  if (typeof value !== "string" || !DAY_PATTERN.test(value)) return false;
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day;
}

/** Kwota brutto z netto przy stawce VAT 23%. */
export function grossOfNet(net: number): number {
  return round2(net * (1 + COST_RATES.vatRate));
}

/**
 * Sprowadza zapis z bazy do pełnego kształtu: kwoty do grosza, daty
 * poprawne i bez powtórzeń, stawki rosnąco. Pierwsza stawka zawsze
 * obowiązuje „od początku" — bez niej zamówienia sprzed pierwszej
 * zapisanej daty nie miałyby kosztu.
 */
export function normalizeProductionCostSettings(raw: unknown): ProductionCostSettings {
  const data = (raw ?? {}) as Record<string, unknown>;
  const { min, max } = SHEET_COST_LIMITS.net;

  const byDay = new Map<string, number>();
  let base: number | null = null;

  for (const item of Array.isArray(data.rates) ? data.rates : []) {
    const rate = (item ?? {}) as Record<string, unknown>;
    const net = Number(rate.net);
    if (!Number.isFinite(net) || net < min || net > max) continue;
    if (rate.from === null || rate.from === undefined || rate.from === "") {
      base ??= round2(net);
    } else if (isValidDay(rate.from)) {
      byDay.set(rate.from, round2(net));
    }
  }

  const dated = [...byDay]
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-(SHEET_COST_LIMITS.rates - 1))
    .map(([from, net]) => ({ from, net }));

  // Bez stawki bazowej najstarsza zmiana przejmuje jej rolę.
  if (base === null) {
    const first = dated.shift();
    if (!first) return DEFAULT_PRODUCTION_COST_SETTINGS;
    base = first.net;
  }

  return {
    rates: [{ from: null, net: base }, ...dated],
    updatedAt: typeof data.updatedAt === "string" ? data.updatedAt : null,
    updatedBy: typeof data.updatedBy === "string" ? data.updatedBy : null,
  };
}

/** Dzień (`RRRR-MM-DD`, czas polski) chwili zapisanej jako ISO; pusty, gdy data jest błędna. */
export function warsawDayOf(iso: string | null | undefined): string {
  if (!iso) return "";
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? "" : warsawToday(date);
}

/**
 * Stawka obowiązująca w dniu, w którym przypada podana chwila (ISO albo
 * `RRRR-MM-DD`). Bez daty — stawka na dziś.
 */
export function sheetCostAt(settings: ProductionCostSettings, when?: string | null): SheetCost {
  const day = (isValidDay(when) ? when : warsawDayOf(when)) || warsawToday();
  const rates = settings.rates.length ? settings.rates : DEFAULT_PRODUCTION_COST_SETTINGS.rates;

  let chosen = rates[0];
  for (const rate of rates) {
    if (rate.from === null || rate.from <= day) chosen = rate;
  }
  return { net: chosen.net, gross: grossOfNet(chosen.net), from: chosen.from };
}

/**
 * Dzień, który decyduje o stawce zamówienia: zapłata, a dla starszych
 * zamówień bez `paidAt` — złożenie. Ta sama data układa zamówienia
 * w miesiące statystyk, więc koszt i miesiąc zawsze się zgadzają.
 */
export function orderCostDate(order: { paidAt?: string | null; createdAt?: string | null }): string {
  return order.paidAt || order.createdAt || "";
}

/** Najbliższa zmiana zapisana na przyszłość — do podpowiedzi w panelu. */
export function upcomingSheetCost(
  settings: ProductionCostSettings,
  today: string = warsawToday()
): SheetCostRate | null {
  return settings.rates.find((rate) => rate.from !== null && rate.from > today) ?? null;
}

/** `2026-10-19` → `19.10.2026`. */
export function formatCostDay(day: string): string {
  const [year, month, dayOfMonth] = day.split("-");
  return `${dayOfMonth}.${month}.${year}`;
}

/** Ostatni dzień przed podanym — koniec poprzedniej stawki. */
export function dayBefore(day: string): string {
  const [year, month, dayOfMonth] = day.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, dayOfMonth - 1));
  return date.toISOString().slice(0, 10);
}

/* ------------------------------------------------------------------ */
/* Formularz w panelu                                                  */
/* ------------------------------------------------------------------ */

/** `"25"`, `"25,5"`, `"25.50"` → liczba; `null`, gdy to nie kwota z dopuszczalnego zakresu. */
export function parseCostAmount(value: string): number | null {
  const cleaned = value.replace(/\s/g, "").replace(",", ".");
  if (!/^\d+(\.\d{1,2})?$/.test(cleaned)) return null;
  const amount = Number(cleaned);
  const { min, max } = SHEET_COST_LIMITS.net;
  return amount >= min && amount <= max ? amount : null;
}

/**
 * Schemat formularza — wspólny dla przeglądarki i akcji serwerowej. Kwota
 * jest tekstem, bo w polskim zapisie pada przecinek, którego pole liczbowe
 * przeglądarki nie przyjmuje. Pierwszy wiersz to stawka „od początku" i nie
 * ma daty.
 */
export const productionCostFormSchema = z
  .object({
    rates: z
      .array(z.object({ from: z.string().trim(), net: z.string().trim() }))
      .min(1, { message: "Potrzebna jest co najmniej jedna stawka." })
      .max(SHEET_COST_LIMITS.rates, { message: `Maksymalnie ${SHEET_COST_LIMITS.rates} stawek.` }),
  })
  .superRefine(({ rates }, ctx) => {
    const seen = new Set<string>();
    rates.forEach((rate, index) => {
      if (parseCostAmount(rate.net) === null) {
        ctx.addIssue({
          code: "custom",
          message: `Podaj kwotę netto od ${SHEET_COST_LIMITS.net.min} do ${SHEET_COST_LIMITS.net.max} zł, np. 25 albo 25,50.`,
          path: ["rates", index, "net"],
        });
      }
      if (index === 0) return;
      if (!isValidDay(rate.from)) {
        ctx.addIssue({
          code: "custom",
          message: "Podaj dzień, od którego obowiązuje stawka.",
          path: ["rates", index, "from"],
        });
      } else if (seen.has(rate.from)) {
        ctx.addIssue({
          code: "custom",
          message: "Na ten dzień jest już inna stawka.",
          path: ["rates", index, "from"],
        });
      }
      seen.add(rate.from);
    });
  });

export type ProductionCostFormValues = z.input<typeof productionCostFormSchema>;

/** Wartości formularza z zapisanej historii. */
export function formValuesOf(settings: ProductionCostSettings): ProductionCostFormValues {
  return {
    rates: settings.rates.map((rate) => ({
      from: rate.from ?? "",
      net: rate.net.toFixed(2).replace(".", ","),
    })),
  };
}

/**
 * Historia z wartości formularza — także niepełnych, bo z niej liczy się
 * podgląd w trakcie pisania. Błędne wiersze po prostu wypadają.
 */
export function settingsOfFormValues(values: ProductionCostFormValues): ProductionCostSettings {
  return normalizeProductionCostSettings({
    rates: (values.rates ?? []).map((rate, index) => ({
      from: index === 0 ? null : rate.from,
      net: parseCostAmount(rate.net ?? "") ?? Number.NaN,
    })),
  });
}
