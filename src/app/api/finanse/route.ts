import { timingSafeEqual } from "node:crypto";
import { NextResponse, type NextRequest } from "next/server";

import {
  COST_RATES,
  allTimeMonthlyBreakdown,
  loadManualSales,
  loadPaidOrders,
  summarize,
  toSalesEntries,
  type SalesEntry,
} from "@/lib/admin/stats";

export const dynamic = "force-dynamic";

/**
 * Miesięczny rachunek zysku dla prywatnego panelu finansowego
 * (panel.jdalaszynski.pl).
 *
 * Liczy dokładnie to samo, co /admin/statystyki — te same wpisy (opłacone
 * zamówienia bez wyłączonych ze statystyk + sprzedaż ręczna) i te same stawki
 * z `lib/admin/costs` — więc panel i sklep zawsze pokazują tę samą kwotę.
 * Zwraca wyłącznie sumy miesięczne i dzienne, bez żadnych danych klientów.
 *
 * Dostęp tylko z nagłówkiem `Authorization: Bearer <FINANCE_API_TOKEN>`.
 * Brak tokenu w środowisku blokuje endpoint zamiast go otwierać.
 */

const NO_STORE = { "Cache-Control": "no-store" };

/** `RRRR-MM-DD` w strefie warszawskiej — ten sam podział co miesiące w statystykach. */
function dayKey(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("sv-SE", { timeZone: "Europe/Warsaw" });
}

/** Rachunek każdego dnia ze sprzedażą — do kalendarza w panelu. */
function dailyBreakdown(entries: SalesEntry[]) {
  const buckets = new Map<string, SalesEntry[]>();
  for (const entry of entries) {
    const key = dayKey(entry.date);
    if (key) buckets.set(key, [...(buckets.get(key) ?? []), entry]);
  }
  return [...buckets.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, bucket]) => {
      const stats = summarize(bucket);
      return {
        date,
        orders: stats.orders,
        manualEntries: stats.manualEntries,
        sheets: stats.sheets,
        gross: stats.gross,
        netRevenue: stats.netRevenue,
        profit: stats.profit,
      };
    });
}

function authorized(request: NextRequest, token: string): boolean {
  const given = Buffer.from(request.headers.get("authorization") ?? "");
  const expected = Buffer.from(`Bearer ${token}`);
  return given.length === expected.length && timingSafeEqual(given, expected);
}

export async function GET(request: NextRequest) {
  const token = process.env.FINANCE_API_TOKEN;
  if (!token || token.length < 32) {
    return NextResponse.json({ error: "Not configured" }, { status: 503, headers: NO_STORE });
  }
  if (!authorized(request, token)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401, headers: NO_STORE });
  }

  const [orders, manualSales] = await Promise.all([loadPaidOrders(), loadManualSales()]);
  const entries = toSalesEntries(orders, manualSales);

  const firstSale = entries.reduce(
    (earliest, entry) => (!earliest || entry.date < earliest ? entry.date : earliest),
    ""
  );

  const months = allTimeMonthlyBreakdown(entries, firstSale).map((month) => ({
    month: month.month,
    orders: month.orders,
    manualEntries: month.manualEntries,
    unpriced: month.unpriced,
    sheets: month.sheets,
    gross: month.gross,
    netRevenue: month.netRevenue,
    vatDue: month.vatDue,
    sheetsCost: month.sheetsCost,
    shippingCost: month.shippingCost,
    extraCost: month.extraCost,
    costTotal: month.costTotal,
    vatDeductible: month.vatDeductible,
    vatPayable: month.vatPayable,
    profit: month.profit,
    margin: month.margin,
  }));

  return NextResponse.json(
    {
      shop: "malenaklejki",
      generatedAt: new Date().toISOString(),
      rates: COST_RATES,
      months,
      days: dailyBreakdown(entries),
    },
    { headers: NO_STORE }
  );
}
