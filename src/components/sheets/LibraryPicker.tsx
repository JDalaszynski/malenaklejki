"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Library, Plus, Search, X } from "lucide-react";

import {
  CUT_LINE_LABELS,
  byLastUsed,
  matchesSearch,
  type LibrarySticker,
} from "@/lib/sheets/types";
import { StickerThumb } from "./StickerThumb";

const PAGE = 48;

/**
 * Baza naklejek w edytorze arkusza: wyszukiwarka po nazwie i siatka
 * miniatur, ostatnio użyte na górze. Kliknięcie kładzie naklejkę na arkuszu
 * z ustawieniami zapisanymi w bazie.
 */
export function LibraryPicker({
  library,
  countsOnSheet,
  onPick,
  disabled = false,
}: {
  library: LibrarySticker[];
  /** Ile razy każda naklejka z bazy leży już na tym arkuszu. */
  countsOnSheet: Record<string, number>;
  onPick: (sticker: LibrarySticker) => void;
  disabled?: boolean;
}) {
  const [query, setQuery] = useState("");
  const [limit, setLimit] = useState(PAGE);

  const results = useMemo(
    () => library.filter((item) => matchesSearch(item.name, query)).sort(byLastUsed),
    [library, query]
  );

  if (library.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border/80 bg-muted/20 px-4 py-6 text-center">
        <Library className="w-6 h-6 text-muted-foreground mx-auto mb-2" aria-hidden />
        <p className="text-sm font-bold text-foreground">Baza naklejek jest pusta</p>
        <p className="text-xs font-medium text-muted-foreground mt-1">
          Każda grafika dodana z pliku trafi tu automatycznie.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="relative">
        <Search
          className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground"
          aria-hidden
        />
        <input
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setLimit(PAGE);
          }}
          placeholder={`Szukaj w bazie (${library.length})…`}
          aria-label="Szukaj naklejki w bazie"
          className="h-11 w-full rounded-xl border border-slate-300 dark:border-white/20 bg-background pl-10 pr-10 text-sm font-semibold focus-visible:outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20"
        />
        {query && (
          <button
            type="button"
            onClick={() => setQuery("")}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted cursor-pointer"
            aria-label="Wyczyść wyszukiwanie"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {results.length === 0 ? (
        <p className="text-sm font-medium text-muted-foreground text-center py-6">
          Brak naklejek pasujących do „{query}”.
        </p>
      ) : (
        <div className="max-h-[26rem] overflow-y-auto -mx-1 px-1 pb-1">
          <ul className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-3 gap-2">
            {results.slice(0, limit).map((item) => {
              const count = countsOnSheet[item.id] ?? 0;
              return (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => onPick(item)}
                    disabled={disabled}
                    title={`${item.name} — dodaj na arkusz`}
                    className="group relative w-full flex flex-col gap-1.5 rounded-2xl border border-border/60 bg-card p-1.5 text-left transition-all hover:border-primary/50 hover:shadow-sm active:scale-[0.97] cursor-pointer disabled:opacity-50 disabled:cursor-wait"
                  >
                    <StickerThumb sticker={item} className="aspect-square w-full p-1.5" />
                    <span className="px-0.5 text-[11px] font-bold text-foreground leading-tight line-clamp-2 break-words">
                      {item.name}
                    </span>
                    <span className="px-0.5 text-[10px] font-semibold text-muted-foreground leading-none pb-0.5">
                      {CUT_LINE_LABELS[item.cutLineType]} · {String(item.widthCm).replace(".", ",")} cm
                    </span>
                    {count > 0 && (
                      <span className="absolute top-2 left-2 rounded-full bg-primary text-primary-foreground text-[10px] font-black px-1.5 py-0.5 tabular-nums">
                        ×{count}
                      </span>
                    )}
                    <span className="absolute top-2 right-2 rounded-full bg-background/95 border border-border/60 p-1 text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                      <Plus className="w-3 h-3" aria-hidden />
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
          {results.length > limit && (
            <button
              type="button"
              onClick={() => setLimit((value) => value + PAGE)}
              className="mt-3 w-full h-10 rounded-xl border border-border/70 bg-card text-sm font-bold text-foreground hover:bg-muted/50 transition-colors cursor-pointer"
            >
              Pokaż więcej ({results.length - limit})
            </button>
          )}
        </div>
      )}

      <Link
        href="/admin/arkusze/baza-naklejek"
        className="self-start text-xs font-bold text-muted-foreground hover:text-primary transition-colors"
      >
        Zarządzaj bazą naklejek →
      </Link>
    </div>
  );
}
