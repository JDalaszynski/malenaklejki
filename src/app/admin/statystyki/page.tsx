import type { Metadata } from "next";

import { AdminLayout, CollapsibleCard } from "@/components/admin/AdminLayout";
import { CostModel, delta } from "@/components/admin/ProfitStats";
import { STATS_TABS, SectionTabs } from "@/components/admin/SectionTabs";
import {
  MonthlyPanel,
  StatsOverview,
  type PeriodComparison,
  type StatsPeriod,
} from "@/components/admin/StatsPanels";
import { requireAdmin } from "@/lib/auth/dal";
import { currentMonthValue, type AdminSearchParams } from "@/lib/admin/filters";
import {
  COST_RATES,
  EMPTY_STATS,
  EMPTY_TAX,
  allTimeMonthlyBreakdown,
  daysInYear,
  financeOf,
  loadManualSales,
  loadPaidOrders,
  monthKey,
  monthlyBreakdown,
  round2,
  sumTaxes,
  summarize,
  toSalesEntries,
  withTaxes,
  yearMonthlyBreakdown,
  type ManualSaleRow,
  type MonthlyStats,
  type SalesEntry,
} from "@/lib/admin/stats";
import { ManualSales } from "@/components/admin/ManualSales";
import { formatPln } from "@/lib/orders/status";

export const metadata: Metadata = {
  title: "Panel — statystyki",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

const EMPTY_MONTH: MonthlyStats = {
  ...EMPTY_STATS,
  month: "",
  label: "",
  days: 0,
  profitPerDay: 0,
};

const DAY_MS = 86_400_000;

/** Dni od pierwszej sprzedaży do dziś — mianownik średniej dla całej historii. */
function daysSince(iso: string): number {
  const start = new Date(iso).getTime();
  if (Number.isNaN(start)) return 0;
  return Math.max(1, Math.round((Date.now() - start) / DAY_MS) + 1);
}

/** Dzień miesiąca według czasu sklepu — serwer na Vercelu liczy w UTC. */
function dayOfMonth(iso: string): number {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return 0;
  return Number(date.toLocaleDateString("sv-SE", { timeZone: "Europe/Warsaw" }).slice(8, 10));
}

/** Zmiana procentowa — bez punktu odniesienia nie ma czego dzielić, więc mówimy to wprost. */
function changeText(current: number, previous: number): string {
  if (previous === 0) return current === 0 ? "bez zmian" : "od zera";
  return delta(current, previous);
}

function trendOf(current: number, previous: number): "up" | "down" | "flat" {
  if (current === previous) return "flat";
  return current > previous ? "up" : "down";
}

/**
 * Bieżący miesiąc na tle poprzedniego — ale tylko do tego samego dnia.
 *
 * Porównanie z całym poprzednim miesiącem w połowie obecnego pokazywałoby
 * „−50%” nawet przy rekordowym tempie. Dlatego z poprzedniego miesiąca bierzemy
 * sprzedaż do dnia, który mamy dziś.
 */
function monthComparison(
  entries: SalesEntry[],
  current: MonthlyStats,
  previous: MonthlyStats
): PeriodComparison | undefined {
  if (!previous.label) return undefined;

  const sameSpan = summarize(
    entries.filter(
      (entry) => monthKey(entry.date) === previous.month && dayOfMonth(entry.date) <= current.days
    )
  );

  return {
    against: `${previous.label}, do ${current.days}. dnia`,
    items: [
      {
        label: "Zysk",
        change: changeText(current.profit, sameSpan.profit),
        trend: trendOf(current.profit, sameSpan.profit),
        was: formatPln(sameSpan.profit),
      },
      {
        label: "Arkusze",
        change: changeText(current.sheets, sameSpan.sheets),
        trend: trendOf(current.sheets, sameSpan.sheets),
        was: String(sameSpan.sheets),
      },
    ],
  };
}

export default async function StatsPage({
  searchParams,
}: {
  searchParams: Promise<AdminSearchParams>;
}) {
  const admin = await requireAdmin();
  const params = await searchParams;
  const initialPeriod = typeof params.okres === "string" ? params.okres : undefined;

  const [orders, manualSales] = await Promise.all([loadPaidOrders(), loadManualSales()]);

  // Zamówienia ze sklepu i sprzedaż dopisana ręcznie liczą się tak samo,
  // więc dalej pracujemy już tylko na wspólnej liście wpisów.
  const entries = toSalesEntries(orders, manualSales);

  const months = withTaxes(monthlyBreakdown(entries, 12));

  const year = Number(currentMonthValue().slice(0, 4));

  const current = months[months.length - 1] ?? { ...EMPTY_MONTH, ...EMPTY_TAX };
  const previous = months[months.length - 2] ?? { ...EMPTY_MONTH, ...EMPTY_TAX };

  const yearMonths = withTaxes(yearMonthlyBreakdown(entries, year));
  const yearStats = summarize(
    entries.filter((entry) => monthKey(entry.date).startsWith(String(year)))
  );
  const yearTax = sumTaxes(yearMonths);
  const yearDays = daysInYear(year);

  const firstSale = entries.reduce(
    (earliest, entry) => (!earliest || entry.date < earliest ? entry.date : earliest),
    ""
  );
  const allTimeMonths = withTaxes(allTimeMonthlyBreakdown(entries, firstSale));
  const allTime = summarize(entries);
  const allTimeTax = sumTaxes(allTimeMonths);
  const allTimeDays = firstSale ? daysSince(firstSale) : 0;

  const periods: StatsPeriod[] = [
    {
      id: "month",
      label: "Ten miesiąc",
      caption: `${current.label} — od pierwszego dnia miesiąca do dziś (${current.days} ${
        current.days === 1 ? "dzień" : "dni"
      }).`,
      stats: current,
      tax: current,
      days: current.days,
      profitPerDay: current.days ? round2(current.profitAfterTax / current.days) : 0,
      compare: monthComparison(entries, current, previous),
    },
    {
      id: "year",
      label: `Rok ${year}`,
      caption: `Narastająco od stycznia ${year} — ${yearDays} dni.`,
      stats: yearStats,
      tax: yearTax,
      days: yearDays,
      profitPerDay: yearDays ? round2(yearTax.profitAfterTax / yearDays) : 0,
    },
    {
      id: "all",
      label: "Cały czas",
      caption: allTimeDays
        ? `Cała historia sklepu — ${allTimeDays} dni od pierwszej sprzedaży.`
        : "Cała historia sklepu.",
      stats: allTime,
      tax: allTimeTax,
      days: allTimeDays,
      profitPerDay: allTimeDays ? round2(allTimeTax.profitAfterTax / allTimeDays) : 0,
    },
  ];

  // Rachunek modelowego zamówienia — te same funkcje, co reszta strony, więc
  // przykład nie może rozjechać się ze stawkami.
  const example = summarize([
    {
      date: new Date().toISOString(),
      sheets: 1,
      gross: 49 + COST_RATES.shippingGross,
      manual: false,
    },
  ]);

  const manualRows: ManualSaleRow[] = manualSales.map((sale) => {
    const finance = financeOf({ sheets: sale.sheets, gross: sale.amount });
    return { ...sale, profit: finance.unpriced ? null : finance.profit };
  });

  return (
    <AdminLayout
      adminEmail={admin.email ?? ""}
      title="Statystyki"
      subtitle="Opłacone zamówienia i sprzedaż dopisana ręcznie: przychód netto minus koszty, składka zdrowotna i PIT na skali."
    >
      <SectionTabs tabs={STATS_TABS} current="/admin/statystyki" label="Widok statystyk" />

      <StatsOverview periods={periods} initialPeriod={initialPeriod} />

      <MonthlyPanel months={months} />

      <CollapsibleCard
        title="Jak liczymy zysk"
        description={`Arkusz ${formatPln(COST_RATES.sheetGross)}, kurier ${formatPln(
          COST_RATES.shippingGross
        )}, koszt dodatkowy ${formatPln(COST_RATES.extraGross)}, VAT ${Math.round(
          COST_RATES.vatRate * 100
        )}%.`}
      >
        <CostModel example={example} />
      </CollapsibleCard>

      <ManualSales sales={manualRows} />
    </AdminLayout>
  );
}
