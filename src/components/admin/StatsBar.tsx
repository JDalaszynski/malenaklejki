import type { OrderStats } from "@/lib/admin/queries";
import { formatPln } from "@/lib/orders/status";

export function StatsBar({ stats }: { stats: OrderStats }) {
  const tiles = [
    { label: "Zamówienia", value: String(stats.count), hint: `${stats.unpaidCount} nieopłaconych` },
    { label: "Obrót brutto", value: formatPln(stats.grossTotal), hint: `${stats.paidCount} opłaconych` },
    { label: "Netto", value: formatPln(stats.netTotal), hint: "brutto ÷ 1,23" },
    { label: "VAT", value: formatPln(stats.vatTotal), hint: "stawka 23%" },
    { label: "Średnie zamówienie", value: formatPln(stats.averageOrder), hint: "tylko opłacone" },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
      {tiles.map((tile) => (
        <div
          key={tile.label}
          className="bg-card border border-border/70 rounded-2xl px-4 py-3.5 shadow-[0_8px_30px_rgba(0,0,0,0.02)]"
        >
          <p className="text-[11px] font-black uppercase tracking-wider text-muted-foreground">
            {tile.label}
          </p>
          <p className="text-xl font-extrabold text-foreground mt-1 tabular-nums">{tile.value}</p>
          <p className="text-xs font-medium text-muted-foreground mt-0.5">{tile.hint}</p>
        </div>
      ))}
    </div>
  );
}
