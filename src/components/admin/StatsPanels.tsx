"use client";

import { useState } from "react";
import { ChevronDown, Minus, TrendingDown, TrendingUp } from "lucide-react";

import type { MonthlyStatsWithTax, PeriodStats, TaxBreakdown } from "@/lib/admin/costs";
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
  /** Zdrowotna i PIT za ten sam okres. */
  tax: TaxBreakdown;
  /** Dni, przez które dzielimy zysk — 0, gdy średnia dzienna nie ma sensu. */
  days: number;
  profitPerDay: number;
  /** Porównanie z poprzednim okresem — tylko tam, gdzie jest sens. */
  compare?: PeriodComparison;
};

export type PeriodComparison = {
  /** Z czym porównujemy, np. „wrzesień 2026, do 6. dnia”. */
  against: string;
  items: Array<{
    label: string;
    /** „+12%”, „bez zmian” — gotowy tekst zmiany. */
    change: string;
    trend: "up" | "down" | "flat";
    /** Wartość z poprzedniego okresu, żeby procent nie był gołą liczbą. */
    was: string;
  }>;
};

const TREND_STYLES = {
  up: "bg-primary/10 border-primary/30 text-primary",
  down: "bg-destructive/10 border-destructive/25 text-destructive",
  flat: "bg-muted/50 border-border/60 text-muted-foreground",
} as const;

const TREND_ICONS = { up: TrendingUp, down: TrendingDown, flat: Minus } as const;

/** Czytelne zestawienie „jak idzie na tle poprzedniego miesiąca” zamiast zdania do rozszyfrowania. */
function ComparisonStrip({ compare }: { compare: PeriodComparison }) {
  return (
    <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-2">
      <p className="text-sm font-semibold text-muted-foreground">
        Na tle poprzedniego miesiąca <span className="text-foreground">({compare.against})</span>:
      </p>
      <ul className="flex flex-wrap gap-2">
        {compare.items.map((item) => {
          const Icon = TREND_ICONS[item.trend];
          return (
            <li
              key={item.label}
              className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-extrabold ${TREND_STYLES[item.trend]}`}
            >
              <Icon className="w-3.5 h-3.5" aria-hidden />
              {item.label} {item.change}
              <span className="font-semibold opacity-80">· było {item.was}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

/**
 * Zysk w trzech horyzontach naraz. Okresy różnią się tylko liczbami, więc
 * zamiast trzech kart pod sobą przełączamy jedną — strona zostaje na ekranie.
 */
export function StatsOverview({
  periods,
  initialPeriod,
}: {
  periods: StatsPeriod[];
  /** Okres z adresu strony — po odświeżeniu wracasz do tego, na co patrzyłeś. */
  initialPeriod?: string;
}) {
  const [active, setActive] = useState(
    periods.some((item) => item.id === initialPeriod) ? (initialPeriod as string) : (periods[0]?.id ?? "")
  );
  const period = periods.find((item) => item.id === active) ?? periods[0];
  if (!period) return null;

  const select = (id: string) => {
    setActive(id);
    // Sam adres, bez nawigacji: dane wszystkich okresów już tu są, więc
    // przełączenie ma być natychmiastowe, a link — do odłożenia w zakładkach.
    const url = new URL(window.location.href);
    if (id === periods[0]?.id) url.searchParams.delete("okres");
    else url.searchParams.set("okres", id);
    window.history.replaceState(null, "", url);
  };

  return (
    <Card
      title="Zysk"
      description={period.caption}
      actions={
        <Segmented
          label="Okres"
          value={period.id}
          onChange={select}
          options={periods.map((item) => ({ id: item.id, label: item.label }))}
        />
      }
    >
      <ProfitSummary
        stats={period.stats}
        tax={period.tax}
        days={period.days}
        profitPerDay={period.profitPerDay}
      />

      {period.compare && <ComparisonStrip compare={period.compare} />}

      {period.stats.unpriced > 0 && (
        <p className="text-sm font-semibold text-muted-foreground mt-1.5">
          {period.stats.unpriced}{" "}
          {period.stats.unpriced === 1 ? "wpis ręczny" : "wpisów ręcznych"} bez kwoty — arkusze
          policzone, zysk nie.
        </p>
      )}

      <Details summary="Rachunek — od wpłat klientów do tego, co zostaje na koncie">
        <ProfitBreakdown stats={period.stats} tax={period.tax} />
      </Details>
    </Card>
  );
}

/**
 * Historia w jednej karcie: wykres do wyłapania trendu, tabela do odczytu
 * konkretnych kwot. Dwie karty pod sobą pokazywały to samo dwa razy.
 */
export function MonthlyPanel({ months }: { months: MonthlyStatsWithTax[] }) {
  const [view, setView] = useState<"chart" | "table">("chart");
  const best = [...months].sort((a, b) => b.profitAfterTax - a.profitAfterTax)[0];

  return (
    <Card
      title="Ostatnie 12 miesięcy"
      description={
        best && best.profitAfterTax > 0
          ? `Najlepszy miesiąc: ${best.label} — ${formatPln(
              best.profitAfterTax
            )} do ręki, ${formatPln(best.profitPerDay)} dziennie operacyjnie.`
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
