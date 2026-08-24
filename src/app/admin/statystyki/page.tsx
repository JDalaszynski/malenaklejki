import type { Metadata } from "next";

import { AdminLayout, Card } from "@/components/admin/AdminLayout";
import {
  MonthlyChart,
  MonthlyTable,
  SheetSummary,
  StatTile,
  trend,
} from "@/components/admin/SheetStats";
import { requireAdmin } from "@/lib/auth/dal";
import { currentMonthValue } from "@/lib/admin/filters";
import {
  loadManualSales,
  loadPaidOrders,
  monthKey,
  monthlyBreakdown,
  summarizeSheets,
  toSalesEntries,
  PROFIT_PER_SHEET,
} from "@/lib/admin/stats";
import { ManualSales } from "@/components/admin/ManualSales";
import { formatPln } from "@/lib/orders/status";

export const metadata: Metadata = {
  title: "Panel — statystyki",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function StatsPage() {
  const admin = await requireAdmin();

  const [orders, manualSales] = await Promise.all([loadPaidOrders(), loadManualSales()]);

  // Zamówienia ze sklepu i sprzedaż dopisana ręcznie liczą się tak samo,
  // więc dalej pracujemy już tylko na wspólnej liście wpisów.
  const entries = toSalesEntries(orders, manualSales);
  const months = monthlyBreakdown(entries, 12);

  const thisMonth = currentMonthValue();
  const year = thisMonth.slice(0, 4);

  const empty = { sheets: 0, profit: 0, orders: 0, manualSheets: 0, gross: 0 };
  const current = months[months.length - 1] ?? empty;
  const previous = months[months.length - 2] ?? empty;

  const yearStats = summarizeSheets(
    entries.filter((entry) => monthKey(entry.date).startsWith(year))
  );
  const allTime = summarizeSheets(entries);

  const best = [...months].sort((a, b) => b.sheets - a.sheets)[0];

  return (
    <AdminLayout
      adminEmail={admin.email ?? ""}
      title="Statystyki"
      subtitle={`Opłacone zamówienia ze sklepu plus sprzedaż dopisana ręcznie. Zysk to ${PROFIT_PER_SHEET} zł od każdego sprzedanego arkusza.`}
    >
      <Card
        title="Ten miesiąc"
        description="Sprzedaż od pierwszego dnia bieżącego miesiąca."
      >
        <SheetSummary stats={current} />
        <p className="text-sm font-semibold text-muted-foreground mt-4">
          Arkusze: {trend(current.sheets, previous.sheets)} (poprzednio {previous.sheets}).
        </p>
      </Card>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatTile
          label={`Arkusze w ${year}`}
          value={String(yearStats.sheets)}
          hint={
            yearStats.manualSheets
              ? `${yearStats.orders} zamówień + ${yearStats.manualSheets} ark. dopisanych`
              : `${yearStats.orders} opłaconych zamówień`
          }
        />
        <StatTile
          label={`Zysk w ${year}`}
          value={formatPln(yearStats.profit)}
          hint="narastająco od stycznia"
          accent
        />
        <StatTile
          label="Arkusze łącznie"
          value={String(allTime.sheets)}
          hint="cała historia sklepu"
        />
        <StatTile
          label="Zysk łącznie"
          value={formatPln(allTime.profit)}
          hint={`obrót brutto ${formatPln(allTime.gross)}`}
          accent
        />
      </div>

      <Card
        title="Ostatnie 12 miesięcy"
        description={
          best && best.sheets > 0
            ? `Najlepszy miesiąc: ${best.label} — ${best.sheets} arkuszy, ${formatPln(best.profit)} zysku.`
            : "Brak opłaconych zamówień w tym okresie."
        }
      >
        <MonthlyChart months={months} />
      </Card>

      <Card title="Miesiąc po miesiącu">
        <MonthlyTable months={months} />
      </Card>

      <ManualSales sales={manualSales} profitPerSheet={PROFIT_PER_SHEET} />
    </AdminLayout>
  );
}
