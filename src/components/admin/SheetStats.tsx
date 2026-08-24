import type { MonthlyStats, SheetStats } from "@/lib/admin/stats";
import { PROFIT_PER_SHEET } from "@/lib/admin/stats";
import { formatPln } from "@/lib/orders/status";

function sheetsLabel(count: number): string {
  if (count === 1) return "arkusz";
  const rest = count % 10;
  const teens = count % 100;
  if (rest >= 2 && rest <= 4 && (teens < 12 || teens > 14)) return "arkusze";
  return "arkuszy";
}

function ordersLabel(count: number): string {
  if (count === 1) return "zamówienie";
  const rest = count % 10;
  const teens = count % 100;
  if (rest >= 2 && rest <= 4 && (teens < 12 || teens > 14)) return "zamówienia";
  return "zamówień";
}

export function StatTile({
  label,
  value,
  hint,
  accent = false,
}: {
  label: string;
  value: string;
  hint: string;
  accent?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl px-4 py-3.5 border shadow-[0_8px_30px_rgba(0,0,0,0.02)] ${
        accent ? "bg-primary/10 border-primary/40" : "bg-card border-border/70"
      }`}
    >
      <p className="text-[11px] font-black uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <p
        className={`text-2xl font-extrabold mt-1 tabular-nums ${
          accent ? "text-primary" : "text-foreground"
        }`}
      >
        {value}
      </p>
      <p className="text-xs font-medium text-muted-foreground mt-0.5">{hint}</p>
    </div>
  );
}

/** Różnica względem poprzedniego okresu — bez punktu odniesienia nic nie pokazujemy. */
export function trend(current: number, previous: number): string {
  if (previous === 0) return current === 0 ? "brak porównania" : "pierwszy taki miesiąc";
  const change = Math.round(((current - previous) / previous) * 100);
  if (change === 0) return "tyle samo co miesiąc temu";
  return `${change > 0 ? "+" : ""}${change}% względem poprzedniego miesiąca`;
}

export function SheetSummary({ stats }: { stats: SheetStats }) {
  const perOrder = stats.orders ? stats.sheets / stats.orders : 0;

  // O sprzedaży dopisanej ręcznie wspominamy tylko wtedy, gdy jakaś jest —
  // inaczej co miesiąc świeciłoby „w tym 0 dopisanych".
  const sheetsHint = stats.manualSheets
    ? `${stats.orders} ${ordersLabel(stats.orders)} + ${stats.manualSheets} ark. dopisanych`
    : `${stats.orders} ${ordersLabel(stats.orders)}`;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      <StatTile label="Sprzedane arkusze" value={String(stats.sheets)} hint={sheetsHint} />
      <StatTile
        label="Zysk"
        value={formatPln(stats.profit)}
        hint={`${PROFIT_PER_SHEET} zł × ${stats.sheets} ${sheetsLabel(stats.sheets)}`}
        accent
      />
      <StatTile label="Obrót brutto" value={formatPln(stats.gross)} hint="z dostawą" />
      <StatTile
        label="Arkusze na zamówienie"
        value={perOrder.toFixed(1).replace(".", ",")}
        hint="średnio"
      />
    </div>
  );
}

/**
 * Rozkład sprzedaży w czasie. Słupki są proporcjonalne do najlepszego miesiąca —
 * chodzi o wyłapanie trendu, nie o odczyt dokładnych wartości (te są w tabeli).
 */
export function MonthlyChart({ months }: { months: MonthlyStats[] }) {
  const max = Math.max(...months.map((month) => month.sheets), 1);

  return (
    <div className="flex flex-col gap-2.5">
      {months.map((month) => (
        <div key={month.month} className="flex items-center gap-3">
          <span className="w-28 shrink-0 text-xs font-bold text-muted-foreground capitalize">
            {month.label}
          </span>
          <div className="flex-1 h-7 rounded-lg bg-muted/40 overflow-hidden">
            <div
              className="h-full rounded-lg bg-primary/80 min-w-[2px] transition-[width]"
              style={{ width: `${(month.sheets / max) * 100}%` }}
            />
          </div>
          <span className="w-32 shrink-0 text-right text-xs font-extrabold tabular-nums text-foreground">
            {month.sheets} {sheetsLabel(month.sheets)}
          </span>
          <span className="w-28 shrink-0 text-right text-xs font-bold tabular-nums text-primary">
            {formatPln(month.profit)}
          </span>
        </div>
      ))}
    </div>
  );
}

export function MonthlyTable({ months }: { months: MonthlyStats[] }) {
  const total = months.reduce(
    (sum, month) => ({
      orders: sum.orders + month.orders,
      manualSheets: sum.manualSheets + month.manualSheets,
      sheets: sum.sheets + month.sheets,
      profit: sum.profit + month.profit,
      gross: Math.round((sum.gross + month.gross) * 100) / 100,
    }),
    { orders: 0, manualSheets: 0, sheets: 0, profit: 0, gross: 0 }
  );

  return (
    <div className="overflow-x-auto -mx-5 sm:-mx-6 px-5 sm:px-6">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="text-left">
            {["Miesiąc", "Zamówienia", "Arkusze", "Zysk", "Obrót brutto"].map((heading) => (
              <th
                key={heading}
                className="pb-3 pr-4 text-[11px] font-black uppercase tracking-wider text-muted-foreground whitespace-nowrap border-b border-border/60"
              >
                {heading}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {months.map((month) => (
            <tr key={month.month} className="border-b border-border/40">
              <td className="py-2.5 pr-4 font-bold capitalize whitespace-nowrap">{month.label}</td>
              <td className="py-2.5 pr-4 tabular-nums">
                {month.orders}
                {month.manualSheets > 0 && (
                  <span className="text-muted-foreground font-medium"> + wpisy ręczne</span>
                )}
              </td>
              <td className="py-2.5 pr-4 tabular-nums font-extrabold">{month.sheets}</td>
              <td className="py-2.5 pr-4 tabular-nums font-extrabold text-primary">
                {formatPln(month.profit)}
              </td>
              <td className="py-2.5 pr-4 tabular-nums text-muted-foreground">
                {formatPln(month.gross)}
              </td>
            </tr>
          ))}
          <tr className="font-extrabold">
            <td className="py-3 pr-4">Razem</td>
            <td className="py-3 pr-4 tabular-nums">{total.orders}</td>
            <td className="py-3 pr-4 tabular-nums">{total.sheets}</td>
            <td className="py-3 pr-4 tabular-nums text-primary">{formatPln(total.profit)}</td>
            <td className="py-3 pr-4 tabular-nums">{formatPln(total.gross)}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
