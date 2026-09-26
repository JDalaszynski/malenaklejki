"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Search, X } from "lucide-react";

const selectClass =
  "h-11 w-full rounded-xl border border-slate-300 dark:border-white/20 bg-background px-3 text-sm font-semibold focus-visible:outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20";

const KEYS = ["szukaj", "kategoria", "stan"];

export function SheetsFilters({ categories }: { categories: string[] }) {
  const router = useRouter();
  const params = useSearchParams();
  const [search, setSearch] = useState(params.get("szukaj") ?? "");

  const apply = (updates: Record<string, string>) => {
    const next = new URLSearchParams(params.toString());
    for (const [key, value] of Object.entries(updates)) {
      if (value) next.set(key, value);
      else next.delete(key);
    }
    // Inny filtr to inny zestaw wyników — numer strony z poprzedniego nie ma sensu.
    next.delete("strona");
    const query = next.toString();
    router.push(query ? `/admin/arkusze?${query}` : "/admin/arkusze");
  };

  const activeCount = KEYS.filter((key) => params.get(key)).length;

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_auto] gap-3">
        <form
          onSubmit={(event) => {
            event.preventDefault();
            apply({ szukaj: search.trim() });
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
              placeholder="Nazwa arkusza albo kategoria…"
              aria-label="Szukaj arkusza"
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

        <select
          className={`${selectClass} md:w-52`}
          value={params.get("kategoria") ?? ""}
          onChange={(event) => apply({ kategoria: event.target.value })}
          aria-label="Kategoria"
        >
          <option value="">Kategoria: wszystkie</option>
          {categories.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>

        <select
          className={`${selectClass} md:w-48`}
          value={params.get("stan") ?? ""}
          onChange={(event) => apply({ stan: event.target.value })}
          aria-label="Status"
        >
          <option value="">Status: wszystkie</option>
          <option value="published">Opublikowane</option>
          <option value="draft">Szkice</option>
        </select>
      </div>

      {activeCount > 0 && (
        <button
          type="button"
          onClick={() => router.push("/admin/arkusze")}
          className="self-start inline-flex items-center gap-1.5 text-sm font-bold text-muted-foreground hover:text-destructive transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" aria-hidden />
          Wyczyść filtry ({activeCount})
        </button>
      )}
    </div>
  );
}
