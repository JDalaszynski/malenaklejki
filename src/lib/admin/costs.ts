/**
 * Rachunek sprzedaży — czysta matematyka, bez Firestore'a i bez `server-only`,
 * żeby te same funkcje liczyły po stronie serwera i w komponentach panelu.
 * Dane i zapytania siedzą w `lib/admin/stats`.
 */

/**
 * Stawki, z których liczy się zysk. Wszystkie kwoty są brutto — tak, jak
 * widnieją na fakturach i paragonach, więc łatwo je sprawdzić i podmienić.
 */
export const COST_RATES = {
  /** Wydruk jednego arkusza A4 — faktura kosztowa, VAT do odliczenia. */
  sheetGross: 18.45,
  /** Przesyłka kurierska od zamówienia — faktura kosztowa, VAT do odliczenia. */
  shippingGross: 19.99,
  /**
   * Drobnica od zamówienia (opakowanie, dojazd) — świadomie NIE wrzucana
   * w koszty firmy, więc obciąża zysk w całości i nie daje odliczenia VAT.
   */
  extraGross: 2,
  vatRate: 0.23,
} as const;

const TIME_ZONE = "Europe/Warsaw";

const round2 = (value: number): number => Math.round(value * 100) / 100;

/** Kwota netto z brutto przy stawce 23%. */
export function netOf(gross: number): number {
  return round2(gross / (1 + COST_RATES.vatRate));
}

/** Sprzedaż dopisana ręcznie — to, co poszło mailem, z ręki, poza sklepem. */
export type ManualSale = {
  id: string;
  /** Data sprzedaży (ISO) — po niej wpis trafia do właściwego miesiąca. */
  soldAt: string;
  sheets: number;
  /** Kwota brutto. Zero znaczy „nie podano" i takiego wpisu nie wyceniamy. */
  amount: number;
  note: string;
  createdBy: string;
  createdAt: string;
};

/** Ręczny wpis z policzonym zyskiem — `profit: null`, gdy brakuje kwoty. */
export type ManualSaleRow = ManualSale & { profit: number | null };

/**
 * Wspólny kształt dla obu źródeł sprzedaży. Statystyki liczymy na nim, więc
 * zamówienie ze sklepu i sprzedaż dopisana ręcznie liczą się dokładnie tak
 * samo — bez powielania rachunków w dwóch miejscach.
 */
export type SalesEntry = {
  date: string;
  sheets: number;
  /** Kwota brutto, jaką zapłacił klient (z dostawą). */
  gross: number;
  manual: boolean;
};

/**
 * Rachunek jednej sprzedaży. Zysk liczymy „po VAT": przychód sprowadzamy do
 * netto (VAT należny i tak odprowadzamy), koszty z fakturą też do netto (VAT
 * naliczony odliczamy), a koszt dodatkowy schodzi w pełnej kwocie brutto.
 */
export type SaleFinance = {
  /** Wpis bez kwoty — liczy się do arkuszy, ale nie da się go wycenić. */
  unpriced: boolean;
  gross: number;
  netRevenue: number;
  /** VAT należny od sprzedaży. */
  vatDue: number;
  sheetsCostNet: number;
  shippingCostNet: number;
  /** Koszt dodatkowy — brutto, bez odliczenia VAT-u. */
  extraCost: number;
  /** Koszty razem w ujęciu, w jakim obciążają zysk. */
  costTotal: number;
  /** VAT naliczony z faktur kosztowych. */
  vatDeductible: number;
  /** VAT do zapłaty: należny minus naliczony. */
  vatPayable: number;
  profit: number;
};

const EMPTY_FINANCE: SaleFinance = {
  unpriced: true,
  gross: 0,
  netRevenue: 0,
  vatDue: 0,
  sheetsCostNet: 0,
  shippingCostNet: 0,
  extraCost: 0,
  costTotal: 0,
  vatDeductible: 0,
  vatPayable: 0,
  profit: 0,
};

/**
 * Rachunek pojedynczej sprzedaży.
 *
 * Każdy składnik zaokrąglamy do grosza już tutaj, żeby suma miesięcy zawsze
 * zgadzała się z sumą roku — niezależnie od tego, jak pogrupujemy wpisy.
 */
export function financeOf(entry: Pick<SalesEntry, "sheets" | "gross">): SaleFinance {
  // Wpis bez kwoty (dopisek „ilu arkuszy", bez ceny) nie ma czego wyceniać —
  // doliczenie samych kosztów zrobiłoby z niego fikcyjną stratę.
  if (entry.gross <= 0) return EMPTY_FINANCE;

  const gross = round2(entry.gross);
  const netRevenue = netOf(gross);
  const vatDue = round2(gross - netRevenue);

  const sheetsCostGross = round2(entry.sheets * COST_RATES.sheetGross);
  const sheetsCostNet = netOf(sheetsCostGross);
  const shippingCostNet = netOf(COST_RATES.shippingGross);
  const extraCost = COST_RATES.extraGross;

  const vatDeductible = round2(
    sheetsCostGross - sheetsCostNet + (COST_RATES.shippingGross - shippingCostNet)
  );
  const costTotal = round2(sheetsCostNet + shippingCostNet + extraCost);

  return {
    unpriced: false,
    gross,
    netRevenue,
    vatDue,
    sheetsCostNet,
    shippingCostNet,
    extraCost,
    costTotal,
    vatDeductible,
    vatPayable: round2(vatDue - vatDeductible),
    profit: round2(netRevenue - costTotal),
  };
}

export type PeriodStats = {
  /** Liczba opłaconych zamówień ze sklepu (wpisy ręczne nie są zamówieniami). */
  orders: number;
  /** Liczba ręcznych dopisków. */
  manualEntries: number;
  /** Sprzedaże bez podanej kwoty — poza rachunkiem zysku. */
  unpriced: number;
  sheets: number;
  /** Ile z arkuszy pochodzi z ręcznych dopisków. */
  manualSheets: number;
  gross: number;
  netRevenue: number;
  vatDue: number;
  sheetsCost: number;
  shippingCost: number;
  extraCost: number;
  costTotal: number;
  vatDeductible: number;
  vatPayable: number;
  profit: number;
  /** Zysk z jednej sprzedaży — średnia po wycenionych wpisach. */
  profitPerSale: number;
  /** Zysk z arkusza — ile realnie zostaje na arkuszu w tym okresie. */
  profitPerSheet: number;
  /** Udział zysku w przychodzie netto, w procentach. */
  margin: number;
};

export const EMPTY_STATS: PeriodStats = {
  orders: 0,
  manualEntries: 0,
  unpriced: 0,
  sheets: 0,
  manualSheets: 0,
  gross: 0,
  netRevenue: 0,
  vatDue: 0,
  sheetsCost: 0,
  shippingCost: 0,
  extraCost: 0,
  costTotal: 0,
  vatDeductible: 0,
  vatPayable: 0,
  profit: 0,
  profitPerSale: 0,
  profitPerSheet: 0,
  margin: 0,
};

export type MonthlyStats = PeriodStats & {
  /** `RRRR-MM` — klucz sortowania i identyfikator wiersza. */
  month: string;
  label: string;
  /** Dni, przez które liczy się średnia dzienna (bieżący miesiąc — do dziś). */
  days: number;
  profitPerDay: number;
};

export function summarize(entries: SalesEntry[]): PeriodStats {
  const stats: PeriodStats = { ...EMPTY_STATS };

  for (const entry of entries) {
    const finance = financeOf(entry);

    stats.sheets += entry.sheets;
    if (entry.manual) {
      stats.manualEntries += 1;
      stats.manualSheets += entry.sheets;
    } else {
      stats.orders += 1;
    }

    if (finance.unpriced) {
      stats.unpriced += 1;
      continue;
    }

    stats.gross = round2(stats.gross + finance.gross);
    stats.netRevenue = round2(stats.netRevenue + finance.netRevenue);
    stats.vatDue = round2(stats.vatDue + finance.vatDue);
    stats.sheetsCost = round2(stats.sheetsCost + finance.sheetsCostNet);
    stats.shippingCost = round2(stats.shippingCost + finance.shippingCostNet);
    stats.extraCost = round2(stats.extraCost + finance.extraCost);
    stats.costTotal = round2(stats.costTotal + finance.costTotal);
    stats.vatDeductible = round2(stats.vatDeductible + finance.vatDeductible);
    stats.vatPayable = round2(stats.vatPayable + finance.vatPayable);
    stats.profit = round2(stats.profit + finance.profit);
  }

  const priced = stats.orders + stats.manualEntries - stats.unpriced;
  stats.profitPerSale = priced ? round2(stats.profit / priced) : 0;
  stats.profitPerSheet = stats.sheets ? round2(stats.profit / stats.sheets) : 0;
  stats.margin = stats.netRevenue ? Math.round((stats.profit / stats.netRevenue) * 100) : 0;

  return stats;
}

/** `RRRR-MM` daty w strefie warszawskiej — ten sam podział miesięcy co w raportach. */
export function monthKey(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";

  const parts: Record<string, string> = {};
  for (const part of new Intl.DateTimeFormat("pl-PL", {
    timeZone: TIME_ZONE,
    year: "numeric",
    month: "2-digit",
  }).formatToParts(date)) {
    if (part.type !== "literal") parts[part.type] = part.value;
  }
  return `${parts.year}-${parts.month}`;
}

function monthLabel(month: string): string {
  const [year, index] = month.split("-").map(Number);
  return new Date(year, index - 1, 1).toLocaleDateString("pl-PL", {
    month: "long",
    year: "numeric",
  });
}

/** Dzisiejsza data widziana z Polski, rozbita na części. */
function todayInWarsaw(): { year: number; month: number; day: number } {
  const [year, month, day] = new Date()
    .toLocaleDateString("sv-SE", { timeZone: TIME_ZONE })
    .split("-")
    .map(Number);
  return { year, month, day };
}

/**
 * Dni, przez które dzielimy zysk miesiąca. Bieżący miesiąc liczymy do dziś —
 * dzielenie połowy miesiąca przez pełne 30 dni zaniżałoby średnią o połowę.
 */
export function daysInMonth(month: string): number {
  const [year, index] = month.split("-").map(Number);
  const today = todayInWarsaw();
  if (year === today.year && index === today.month) return today.day;
  return new Date(year, index, 0).getDate();
}

/**
 * Dni roku, przez które dzielimy zysk roczny — bieżący rok liczymy do dziś,
 * żeby średnia dzienna nie rozjeżdżała się na styczniu.
 */
export function daysInYear(year: number): number {
  const today = todayInWarsaw();
  const start = Date.UTC(year, 0, 1);
  const end =
    year === today.year
      ? Date.UTC(today.year, today.month - 1, today.day)
      : Date.UTC(year, 11, 31);
  return Math.round((end - start) / 86_400_000) + 1;
}

/** Ostatnie `count` miesięcy — także te bez sprzedaży, żeby wykres nie kłamał. */
export function monthlyBreakdown(entries: SalesEntry[], count = 12): MonthlyStats[] {
  const buckets = new Map<string, SalesEntry[]>();

  const today = todayInWarsaw();
  for (let i = count - 1; i >= 0; i--) {
    const date = new Date(today.year, today.month - 1 - i, 1);
    buckets.set(`${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`, []);
  }

  for (const entry of entries) {
    const bucket = buckets.get(monthKey(entry.date));
    if (bucket) bucket.push(entry);
  }

  return [...buckets.entries()].map(([month, list]) => {
    const stats = summarize(list);
    const days = daysInMonth(month);
    return {
      ...stats,
      month,
      label: monthLabel(month),
      days,
      profitPerDay: days ? round2(stats.profit / days) : 0,
    };
  });
}
