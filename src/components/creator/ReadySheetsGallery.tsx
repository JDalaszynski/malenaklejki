"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Check, Eye, LayoutGrid, Loader2 } from "lucide-react";

import type { PublicSheetSummary, PublicSheetsResponse } from "@/lib/sheets/types";
import { getStickersNoun } from "@/lib/utils/polish";

/**
 * Gotowe arkusze pobrane po zamontowaniu kreatora.
 *
 * Strona główna jest statyczna, a to, czy lista w ogóle istnieje, zależy od
 * trybu w panelu (a w podglądzie — od tego, czy patrzy administrator). Do
 * czasu odpowiedzi i przy pustej liście nie rysujemy niczego, więc kreator
 * z wyłączonymi gotowymi arkuszami wygląda dokładnie tak jak wcześniej.
 */
export function useReadySheets(): PublicSheetsResponse | null {
  const [data, setData] = useState<PublicSheetsResponse | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/gotowe-arkusze", { cache: "no-store" })
      .then((response) => (response.ok ? response.json() : null))
      .then((body: PublicSheetsResponse | null) => {
        if (!cancelled && body && Array.isArray(body.sheets)) setData(body);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  return data;
}

const ALL = "";

/**
 * Pasek gotowych arkuszy nad kreatorem: kategorie i przewijany rząd
 * miniatur. Wybrany arkusz ląduje w tym samym kreatorze, w którym klient
 * układa własne naklejki — dalej wszystko działa bez różnicy.
 */
export function ReadySheetsGallery({
  data,
  activeSheetId,
  loadingSheetId,
  onSelect,
}: {
  data: PublicSheetsResponse;
  activeSheetId: string | null;
  loadingSheetId: string | null;
  onSelect: (sheet: PublicSheetSummary) => void;
}) {
  const [category, setCategory] = useState(ALL);

  const visible = useMemo(
    () => (category ? data.sheets.filter((sheet) => sheet.category === category) : data.sheets),
    [data.sheets, category]
  );

  // Kategoria bez arkuszy (np. po zmianie w panelu) nie może zostawić pustego paska.
  const shown = visible.length > 0 ? visible : data.sheets;
  const activeCategory = visible.length > 0 ? category : ALL;

  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      aria-labelledby="gotowe-arkusze-naglowek"
      className="liquid-glass border border-border/40 rounded-3xl p-4 sm:p-5 shadow-sm flex flex-col gap-3"
    >
      <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-1">
        <div className="min-w-0">
          <h3
            id="gotowe-arkusze-naglowek"
            className="text-base sm:text-lg font-black text-foreground flex items-center gap-2"
          >
            <LayoutGrid className="w-5 h-5 text-primary" aria-hidden />
            Gotowe arkusze
          </h3>
          <p className="text-xs sm:text-sm font-semibold text-muted-foreground mt-0.5">
            Wybierz zestaw i dopasuj go po swojemu — każdą naklejkę zmienisz albo usuniesz.
          </p>
        </div>
        {data.preview && (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-[#FFCD08]/50 bg-[#FFCD08]/15 px-3 py-1 text-[11px] font-extrabold text-[#8a6d00] dark:text-[#FFCD08]">
            <Eye className="w-3.5 h-3.5" aria-hidden />
            Podgląd — widzisz to tylko Ty
          </span>
        )}
      </div>

      {data.categories.length > 1 && (
        <div
          className="flex gap-1.5 overflow-x-auto -mx-1 px-1 pb-0.5 [scrollbar-width:none]"
          role="group"
          aria-label="Kategorie gotowych arkuszy"
        >
          {[ALL, ...data.categories].map((item) => {
            const active = activeCategory === item;
            return (
              <button
                key={item || "wszystkie"}
                type="button"
                onClick={() => setCategory(item)}
                aria-pressed={active}
                className={`shrink-0 px-3 py-1.5 rounded-xl text-xs font-extrabold border transition-all cursor-pointer whitespace-nowrap ${
                  active
                    ? "bg-primary text-primary-foreground border-primary shadow-sm"
                    : "bg-background/70 text-muted-foreground border-border/60 hover:text-foreground hover:bg-muted/50"
                }`}
              >
                {item || "Wszystkie"}
              </button>
            );
          })}
        </div>
      )}

      <ul className="flex gap-3 overflow-x-auto snap-x snap-mandatory -mx-1 px-1 pt-1 pb-2">
        {shown.map((sheet) => {
          const active = sheet.id === activeSheetId;
          const loading = sheet.id === loadingSheetId;
          return (
            <li key={sheet.id} className="shrink-0 snap-start">
              <button
                type="button"
                onClick={() => onSelect(sheet)}
                disabled={loadingSheetId !== null}
                aria-pressed={active}
                title={`Wczytaj arkusz „${sheet.name}” do kreatora`}
                className="group w-[7.25rem] sm:w-[8.5rem] flex flex-col gap-2 text-left cursor-pointer disabled:cursor-wait"
              >
                <span
                  className={`relative block w-full aspect-[210/297] rounded-lg bg-white overflow-hidden border transition-all ${
                    active
                      ? "border-primary ring-2 ring-primary ring-offset-2 ring-offset-background shadow-md"
                      : "border-border/70 shadow-[0_6px_18px_rgba(0,71,73,0.08)] group-hover:-translate-y-0.5 group-hover:shadow-[0_10px_24px_rgba(0,71,73,0.14)]"
                  }`}
                >
                  {sheet.previewUrl && (
                    // eslint-disable-next-line @next/next/no-img-element -- adres z tokenem Storage
                    <img
                      src={sheet.previewUrl}
                      alt=""
                      loading="lazy"
                      draggable={false}
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                  )}
                  {loading && (
                    <span className="absolute inset-0 flex items-center justify-center bg-background/60 backdrop-blur-[1px]">
                      <Loader2 className="w-6 h-6 text-primary animate-spin" aria-hidden />
                    </span>
                  )}
                  {active && !loading && (
                    <span className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow">
                      <Check className="w-3 h-3" aria-hidden />
                    </span>
                  )}
                </span>
                <span className="px-0.5">
                  <span
                    className={`block text-xs font-extrabold leading-snug line-clamp-2 ${
                      active ? "text-primary" : "text-foreground"
                    }`}
                  >
                    {sheet.name}
                  </span>
                  <span className="block text-[10px] font-semibold text-muted-foreground mt-0.5">
                    {sheet.stickerCount} {getStickersNoun(sheet.stickerCount)}
                  </span>
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </motion.section>
  );
}
