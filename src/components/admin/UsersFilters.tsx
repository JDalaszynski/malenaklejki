"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Search, X } from "lucide-react";

const selectClass =
  "h-11 w-full rounded-xl border border-slate-300 dark:border-white/20 bg-background px-3 text-sm font-semibold focus-visible:outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20";

export function UsersFilters() {
  const router = useRouter();
  const params = useSearchParams();
  const [search, setSearch] = useState(params.get("szukaj") ?? "");

  const apply = (updates: Record<string, string>) => {
    const next = new URLSearchParams(params.toString());
    for (const [key, value] of Object.entries(updates)) {
      if (value) next.set(key, value);
      else next.delete(key);
    }
    router.push(`/admin/uzytkownicy?${next.toString()}`);
  };

  const activeCount = ["weryfikacja", "status", "zamowienia", "rola", "szukaj"].filter((key) =>
    params.get(key)
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
            placeholder="Imię, nazwisko, e-mail, telefon…"
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

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <select
          className={selectClass}
          value={params.get("weryfikacja") ?? ""}
          onChange={(event) => apply({ weryfikacja: event.target.value })}
        >
          <option value="">E-mail: wszystkie</option>
          <option value="yes">Potwierdzony</option>
          <option value="no">Niepotwierdzony</option>
        </select>

        <select
          className={selectClass}
          value={params.get("status") ?? ""}
          onChange={(event) => apply({ status: event.target.value })}
        >
          <option value="">Dostęp: wszystkie</option>
          <option value="active">Aktywne</option>
          <option value="blocked">Zablokowane</option>
        </select>

        <select
          className={selectClass}
          value={params.get("zamowienia") ?? ""}
          onChange={(event) => apply({ zamowienia: event.target.value })}
        >
          <option value="">Zamówienia: wszystkie</option>
          <option value="yes">Z zamówieniem</option>
          <option value="no">Bez zamówienia</option>
        </select>

        <select
          className={selectClass}
          value={params.get("rola") ?? ""}
          onChange={(event) => apply({ rola: event.target.value })}
        >
          <option value="">Rola: wszyscy</option>
          <option value="customer">Klienci</option>
          <option value="admin">Administratorzy</option>
        </select>
      </div>

      {activeCount > 0 && (
        <button
          type="button"
          onClick={() => router.push("/admin/uzytkownicy")}
          className="self-start inline-flex items-center gap-1.5 text-sm font-bold text-muted-foreground hover:text-destructive transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" aria-hidden />
          Wyczyść filtry ({activeCount})
        </button>
      )}
    </div>
  );
}
