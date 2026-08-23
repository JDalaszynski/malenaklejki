"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Download } from "lucide-react";

const selectClass =
  "h-11 w-full rounded-xl border border-slate-300 dark:border-white/20 bg-background px-3 text-sm font-semibold focus-visible:outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20";

function recentMonths(count = 24) {
  const months = [];
  const now = new Date();
  for (let i = 0; i < count; i++) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push({
      value: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`,
      label: date.toLocaleDateString("pl-PL", { month: "long", year: "numeric" }),
    });
  }
  return months;
}

export function ReportControls({ month, includeInvoiced }: { month: string; includeInvoiced: boolean }) {
  const router = useRouter();
  const params = useSearchParams();

  const apply = (updates: Record<string, string>) => {
    const next = new URLSearchParams(params.toString());
    for (const [key, value] of Object.entries(updates)) {
      if (value) next.set(key, value);
      else next.delete(key);
    }
    router.push(`/admin/raporty?${next.toString()}`);
  };

  const downloadUrl = `/admin/raporty/pobierz?miesiac=${encodeURIComponent(month)}${
    includeInvoiced ? "&zFakturami=1" : ""
  }`;

  return (
    <div className="flex flex-col sm:flex-row sm:items-end gap-4">
      <div className="sm:w-64">
        <label className="text-sm font-bold mb-1.5 block">Okres</label>
        <select
          className={selectClass}
          value={month}
          onChange={(event) => apply({ miesiac: event.target.value })}
        >
          {recentMonths().map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <label className="flex items-start gap-3 cursor-pointer sm:pb-3">
        <input
          type="checkbox"
          checked={includeInvoiced}
          onChange={(event) => apply({ zFakturami: event.target.checked ? "1" : "" })}
          className="mt-0.5 w-5 h-5 rounded border-gray-300 text-foreground focus:ring-foreground shrink-0"
        />
        <span className="text-sm font-semibold text-muted-foreground leading-relaxed max-w-xs">
          Pokaż także zamówienia z fakturą (domyślnie pomijane — są udokumentowane osobno)
        </span>
      </label>

      <a
        href={downloadUrl}
        className="sm:ml-auto inline-flex items-center justify-center gap-2 rounded-xl text-sm font-bold bg-primary text-primary-foreground hover:bg-primary/95 active:scale-[0.98] h-11 px-6 shadow-sm transition-all"
      >
        <Download className="w-4 h-4" aria-hidden />
        Pobierz CSV
      </a>
    </div>
  );
}
