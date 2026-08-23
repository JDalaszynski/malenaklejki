"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Search, X } from "lucide-react";

import { FULFILLMENT_STATUSES, PAYMENT_STATUSES } from "@/lib/orders/status";

const selectClass =
  "h-11 w-full rounded-xl border border-slate-300 dark:border-white/20 bg-background px-3 text-sm font-semibold focus-visible:outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20";

/** Ostatnie 12 miesięcy jako szybki wybór — najczęstszy przypadek przy raportach. */
function recentMonths(count = 12) {
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

export function OrderFilters({ basePath = "/admin" }: { basePath?: string }) {
  const router = useRouter();
  const params = useSearchParams();
  const [search, setSearch] = useState(params.get("szukaj") ?? "");

  const apply = (updates: Record<string, string>) => {
    const next = new URLSearchParams(params.toString());
    for (const [key, value] of Object.entries(updates)) {
      if (value) next.set(key, value);
      else next.delete(key);
    }
    router.push(`${basePath}?${next.toString()}`);
  };

  const activeCount = ["miesiac", "od", "do", "status", "realizacja", "platnosc", "faktura", "szukaj"].filter(
    (key) => params.get(key)
  ).length;

  return (
    <div className="flex flex-col gap-4">
      <form
        onSubmit={(event) => {
          event.preventDefault();
          apply({ szukaj: search });
        }}
        className="flex gap-2"
      >
        <div className="relative flex-1">
          <Search
            className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground"
            aria-hidden
          />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Numer zamówienia, nazwisko, e-mail, NIP, numer przesyłki…"
            className="h-11 w-full rounded-xl border border-slate-300 dark:border-white/20 bg-background pl-10 pr-4 text-sm font-semibold focus-visible:outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20"
          />
        </div>
        <button
          type="submit"
          className="h-11 px-5 rounded-xl bg-primary text-primary-foreground text-sm font-bold hover:bg-primary/95 active:scale-[0.98] transition-all cursor-pointer shrink-0"
        >
          Szukaj
        </button>
      </form>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <select
          className={selectClass}
          value={params.get("miesiac") ?? ""}
          onChange={(event) => apply({ miesiac: event.target.value, od: "", do: "" })}
        >
          <option value="">Wszystkie miesiące</option>
          {recentMonths().map((month) => (
            <option key={month.value} value={month.value}>
              {month.label}
            </option>
          ))}
        </select>

        <select
          className={selectClass}
          value={params.get("dataWg") ?? "createdAt"}
          onChange={(event) => apply({ dataWg: event.target.value })}
        >
          <option value="createdAt">Wg daty zamówienia</option>
          <option value="paidAt">Wg daty zapłaty</option>
        </select>

        <select
          className={selectClass}
          value={params.get("status") ?? ""}
          onChange={(event) => apply({ status: event.target.value })}
        >
          <option value="">Każda płatność</option>
          {Object.entries(PAYMENT_STATUSES).map(([key, value]) => (
            <option key={key} value={key}>
              {value.label}
            </option>
          ))}
        </select>

        <select
          className={selectClass}
          value={params.get("realizacja") ?? ""}
          onChange={(event) => apply({ realizacja: event.target.value })}
        >
          <option value="">Każda realizacja</option>
          {Object.entries(FULFILLMENT_STATUSES).map(([key, value]) => (
            <option key={key} value={key}>
              {value.label}
            </option>
          ))}
        </select>

        <select
          className={selectClass}
          value={params.get("platnosc") ?? ""}
          onChange={(event) => apply({ platnosc: event.target.value })}
        >
          <option value="">Każda metoda</option>
          <option value="przelewy24">Przelewy24</option>
          <option value="blik">BLIK</option>
          <option value="przelew">Przelew tradycyjny</option>
          <option value="vinted">Vinted</option>
          <option value="manual">Dodane ręcznie</option>
        </select>

        <select
          className={selectClass}
          value={params.get("faktura") ?? ""}
          onChange={(event) => apply({ faktura: event.target.value })}
        >
          <option value="">Faktura: wszystkie</option>
          <option value="yes">Tylko z fakturą</option>
          <option value="no">Tylko bez faktury</option>
        </select>
      </div>

      {activeCount > 0 && (
        <button
          type="button"
          onClick={() => router.push(basePath)}
          className="self-start inline-flex items-center gap-1.5 text-sm font-bold text-muted-foreground hover:text-destructive transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" aria-hidden />
          Wyczyść filtry ({activeCount})
        </button>
      )}
    </div>
  );
}
