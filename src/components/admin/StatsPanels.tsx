"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

import type { MonthlyStats, PeriodStats } from "@/lib/admin/costs";
import { formatPln } from "@/lib/orders/status";
import { Card } from "./AdminLayout";
import { MonthlyChart, MonthlyTable, ProfitBreakdown, ProfitSummary } from "./ProfitStats";

/** Przełącznik widoku — tam, gdzie druga karta byłaby tylko dłuższą stroną. */
function Segmented<T extends string>({
  options,
  value,
  onChange,
  label,
}: {
  options: { id: T; label: string }[];
  value: T;
  onChange: (id: T) => void;
  label: string;
}) {
  return (
    <div
      role="tablist"
      aria-label={label}
      className="inline-flex rounded-xl bg-muted/40 p-1 gap-1"
    >
      {options.map((option) => {
        const active = option.id === value;
        return (
          <button
            key={option.id}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(option.id)}
            className={`rounded-lg px-3 py-1.5 text-xs font-extrabold transition-colors cursor-pointer ${
              active
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

/** Zwijany blok wewnątrz karty — szczegóły na żądanie, nie na starcie. */
function Details({ summary, children }: { summary: string; children: React.ReactNode }) {
  return (
    <details className="group mt-4 rounded-2xl border border-border/60 bg-muted/10">
      <summary className="flex items-center justify-between gap-3 px-4 py-3 cursor-pointer list-none [&::-webkit-details-marker]:hidden text-sm font-extrabold rounded-2xl hover:bg-muted/20 transition-colors">
        {summary}
        <ChevronDown
          className="w-4 h-4 shrink-0 text-muted-foreground transition-transform group-open:rotate-180"
          aria-hidden
        />
      </summary>
      <div className="px-4 pb-4">{children}</div>
    </details>
  );
}

export type StatsPeriod = {
  id: string;
  label: string;
  caption: string;
  stats: PeriodStats;
  /** Dni, przez które dzielimy zysk — 0, gdy średnia dzienna nie ma sensu. */
  days: number;
  profitPerDay: number;
  /** Zdanie o zmianie względem poprzedniego okresu — tylko tam, gdzie jest sens. */
  note?: string;
};

/**
 * Zysk w trzech horyzontach naraz. Okresy różnią się tylko liczbami, więc
 * zamiast trzech kart pod sobą przełączamy jedną — strona zostaje na ekranie.
 */
export function StatsOverview({ periods }: { periods: StatsPeriod[] }) {
  const [active, setActive] = useState(periods[0]?.id ?? "");
  const period = periods.find((item) => item.id === active) ?? periods[0];
  if (!period) return null;

  return (
    <Card
      title="Zysk"
      description={period.caption}
      actions={
        <Segmented
          label="Okres"
          value={period.id}
          onChange={setActive}
          options={periods.map((item) => ({ id: item.id, label: item.label }))}
        />
      }
    >
      <ProfitSummary
        stats={period.stats}
        days={period.days}
        profitPerDay={period.profitPerDay}
      />

      {period.note && (
        <p className="text-sm font-semibold text-muted-foreground mt-4">{period.note}</p>
      )}

      {period.stats.unpriced > 0 && (
        <p className="text-sm font-semibold text-muted-foreground mt-1.5">
          {period.stats.unpriced}{" "}
          {period.stats.unpriced === 1 ? "wpis ręczny" : "wpisów ręcznych"} bez kwoty — arkusze
          policzone, zysk nie.
        </p>
      )}

      <Details summary="Rachunek — od wpłat klientów do zysku">
        <ProfitBreakdown stats={period.stats} />
      </Details>
    </Card>
  );
}

/**
 * Historia w jednej karcie: wykres do wyłapania trendu, tabela do odczytu
 * konkretnych kwot. Dwie karty pod sobą pokazywały to samo dwa razy.
 */
export function MonthlyPanel({ months }: { months: MonthlyStats[] }) {
  const [view, setView] = useState<"chart" | "table">("chart");
  const best = [...months].sort((a, b) => b.profit - a.profit)[0];

  return (
    <Card
      title="Ostatnie 12 miesięcy"
      description={
        best && best.profit > 0
          ? `Najlepszy miesiąc: ${best.label} — ${formatPln(best.profit)} zysku, ${formatPln(
              best.profitPerDay
            )} dziennie.`
          : "Brak sprzedaży w tym okresie."
      }
      actions={
        <Segmented
          label="Widok historii"
          value={view}
          onChange={setView}
          options={[
            { id: "chart" as const, label: "Wykres" },
            { id: "table" as const, label: "Tabela" },
          ]}
        />
      }
    >
      {view === "chart" ? <MonthlyChart months={months} /> : <MonthlyTable months={months} />}
    </Card>
  );
}
