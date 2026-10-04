"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { motion } from "framer-motion";
import {
  AlertTriangle,
  ArrowLeft,
  Check,
  ChevronLeft,
  ChevronRight,
  Eye,
  LayoutGrid,
  Loader2,
  RotateCcw,
  X,
} from "lucide-react";

import Link from "next/link";

import { trackSelectReadySheet, trackViewReadySheets } from "@/lib/analytics";
import { loadReadySheets } from "@/lib/sheets/client";
import { SHEET_PRICE, type PublicSheetSummary, type PublicSheetsResponse } from "@/lib/sheets/types";
import { getStickersNoun } from "@/lib/utils/polish";
import { SheetImage } from "@/components/catalog/SheetImage";

const ALL = "";

const FOCUSABLE = 'button:not([disabled]), [href], [tabindex]:not([tabindex="-1"])';

/**
 * Galeria gotowych arkuszy: siatka wzorów z kategoriami, a po wybraniu wzoru
 * duży podgląd z przyciskiem wczytania do kreatora.
 *
 * Ładowana dopiero po pierwszym otwarciu (osobny fragment kodu) i sama
 * dociąga listę — strona główna nie płaci za galerię, dopóki nikt jej nie
 * otworzy. Rodzic trzyma ją w `AnimatePresence`.
 */
export default function ReadySheetsDialog({
  activeSheetId,
  replaceCount,
  onUse,
  onPreview,
  onClose,
}: {
  /** Gotowy arkusz leżący teraz w kreatorze. */
  activeSheetId: string | null;
  /** Ile naklejek zniknie z arkusza po wczytaniu wzoru; 0, gdy nie ma czego stracić. */
  replaceCount: number;
  /** Wczytuje wzór do kreatora. `false` oznacza, że się nie udało. */
  onUse: (sheet: PublicSheetSummary) => Promise<boolean>;
  /** Klient ogląda wzór z bliska — dobry moment, żeby zacząć pobierać jego układ. */
  onPreview: (sheet: PublicSheetSummary) => void;
  onClose: () => void;
}) {
  const [data, setData] = useState<PublicSheetsResponse | null>(null);
  const [loadFailed, setLoadFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [category, setCategory] = useState(ALL);
  const [detailId, setDetailId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [useFailed, setUseFailed] = useState(false);

  const panelRef = useRef<HTMLDivElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;
    loadReadySheets()
      .then((response) => {
        if (cancelled) return;
        setData(response);
        // Podgląd administratora nie jest ruchem klientów.
        if (!response.preview) trackViewReadySheets(response.sheets, "galeria w kreatorze", SHEET_PRICE);
      })
      .catch(() => {
        if (!cancelled) setLoadFailed(true);
      });
    return () => {
      cancelled = true;
    };
  }, [attempt]);

  const retry = () => {
    setLoadFailed(false);
    setAttempt((value) => value + 1);
  };

  const sheets = useMemo(() => data?.sheets ?? [], [data]);
  const categories = data?.categories ?? [];

  const visible = useMemo(() => {
    const filtered = category ? sheets.filter((sheet) => sheet.categories.includes(category)) : sheets;
    // Kategoria bez arkuszy (np. po zmianie w panelu) nie może zostawić pustej galerii.
    return filtered.length > 0 ? filtered : sheets;
  }, [sheets, category]);
  const activeCategory = visible === sheets ? ALL : category;

  const detailIndex = detailId ? visible.findIndex((sheet) => sheet.id === detailId) : -1;
  const detail = detailIndex >= 0 ? visible[detailIndex] : null;

  const openDetail = useCallback(
    (sheet: PublicSheetSummary) => {
      setDetailId(sheet.id);
      setUseFailed(false);
      onPreview(sheet);
      if (!data?.preview) trackSelectReadySheet(sheet, "galeria w kreatorze", SHEET_PRICE);
      bodyRef.current?.scrollTo({ top: 0 });
    },
    [onPreview, data?.preview]
  );

  const step = useCallback(
    (delta: number) => {
      if (detailIndex < 0 || visible.length < 2) return;
      openDetail(visible[(detailIndex + delta + visible.length) % visible.length]);
    },
    [detailIndex, visible, openDetail]
  );

  const use = async () => {
    if (!detail || busy) return;
    setBusy(true);
    setUseFailed(false);
    const ok = await onUse(detail);
    // Po udanym wczytaniu rodzic zamyka galerię — stanu już nie ruszamy.
    if (!ok) {
      setBusy(false);
      setUseFailed(true);
    }
  };

  // Strona pod galerią nie przewija się razem z nią, a po zamknięciu fokus
  // wraca tam, skąd galerię otwarto.
  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    const opener = document.activeElement as HTMLElement | null;
    document.body.style.overflow = "hidden";
    panelRef.current?.focus();
    return () => {
      document.body.style.overflow = previousOverflow;
      opener?.focus?.({ preventScroll: true });
    };
  }, []);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        if (busy) return;
        event.preventDefault();
        if (detailId) setDetailId(null);
        else onClose();
        return;
      }

      if (detailId && event.key === "ArrowRight") step(1);
      if (detailId && event.key === "ArrowLeft") step(-1);

      // Tab krąży po galerii zamiast uciekać na stronę pod spodem.
      if (event.key === "Tab" && panelRef.current) {
        const items = [...panelRef.current.querySelectorAll<HTMLElement>(FOCUSABLE)];
        if (items.length === 0) return;
        const first = items[0];
        const last = items[items.length - 1];
        const current = document.activeElement;
        if (event.shiftKey && (current === first || current === panelRef.current)) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && current === last) {
          event.preventDefault();
          first.focus();
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [busy, detailId, onClose, step]);

  const isActiveDetail = !!detail && detail.id === activeSheetId;
  const willReplace = replaceCount > 0;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center sm:p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={() => !busy && onClose()}
        className="absolute inset-0 bg-background/80 backdrop-blur-sm"
      />

      <motion.div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="gotowe-arkusze-tytul"
        tabIndex={-1}
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 24 }}
        transition={{ duration: 0.22, ease: "easeOut" }}
        className="relative w-full sm:max-w-5xl h-[92dvh] sm:h-[min(52rem,calc(100dvh-2rem))] flex flex-col rounded-t-3xl sm:rounded-3xl border border-border bg-background shadow-xl outline-none"
      >
        <span
          aria-hidden
          className="sm:hidden mx-auto mt-2.5 h-1 w-10 shrink-0 rounded-full bg-foreground/15"
        />

        {/* Nagłówek */}
        <div className="flex items-start justify-between gap-4 px-4 sm:px-7 pt-3 sm:pt-6 pb-3">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
              <h2
                id="gotowe-arkusze-tytul"
                className="text-xl sm:text-2xl font-extrabold text-foreground flex items-center gap-2"
              >
                <LayoutGrid className="w-5 h-5 text-primary" aria-hidden />
                Gotowe arkusze
              </h2>
              {data?.preview && (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-[#FFCD08]/50 bg-[#FFCD08]/15 px-2.5 py-0.5 text-[11px] font-extrabold text-[#8a6d00] dark:text-[#FFCD08]">
                  <Eye className="w-3.5 h-3.5" aria-hidden />
                  Podgląd - widzisz to tylko Ty
                </span>
              )}
            </div>
            {detail ? (
              <button
                type="button"
                onClick={() => setDetailId(null)}
                disabled={busy}
                className="mt-1.5 inline-flex items-center gap-1.5 text-sm font-extrabold text-primary hover:text-primary/80 transition-colors cursor-pointer disabled:opacity-50"
              >
                <ArrowLeft className="w-4 h-4" aria-hidden />
                Wszystkie wzory
              </button>
            ) : (
              <p className="text-sm font-medium text-muted-foreground mt-1">
                Wybierz wzór i dopasuj go po swojemu - każdą naklejkę zmienisz, usuniesz albo
                zastąpisz własną.
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={busy}
            className="shrink-0 p-2 rounded-full bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground transition-all cursor-pointer disabled:opacity-50"
            aria-label="Zamknij galerię"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Kategorie */}
        {!detail && categories.length > 1 && (
          <div
            className="flex gap-1.5 overflow-x-auto px-4 sm:px-7 pb-3 [scrollbar-width:none]"
            role="group"
            aria-label="Kategorie gotowych arkuszy"
          >
            {[ALL, ...categories].map((item) => {
              const active = activeCategory === item;
              const count = item
                ? sheets.filter((sheet) => sheet.categories.includes(item)).length
                : sheets.length;
              return (
                <button
                  key={item || "wszystkie"}
                  type="button"
                  onClick={() => {
                    setCategory(item);
                    bodyRef.current?.scrollTo({ top: 0 });
                  }}
                  aria-pressed={active}
                  className={`shrink-0 inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-extrabold border transition-all cursor-pointer whitespace-nowrap ${
                    active
                      ? "bg-primary text-primary-foreground border-primary shadow-sm"
                      : "bg-background text-muted-foreground border-border/70 hover:text-foreground hover:bg-muted/60"
                  }`}
                >
                  {item || "Wszystkie"}
                  <span className={active ? "opacity-80" : "opacity-60"}>{count}</span>
                </button>
              );
            })}
          </div>
        )}

        {/* Treść */}
        <div
          ref={bodyRef}
          className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-4 sm:px-7 pb-5 sm:pb-6"
        >
          {loadFailed ? (
            <div className="h-full flex flex-col items-center justify-center text-center gap-3 py-10">
              <p className="text-base font-extrabold text-foreground">
                Nie udało się wczytać gotowych arkuszy
              </p>
              <p className="text-sm font-medium text-muted-foreground max-w-sm">
                Sprawdź połączenie i spróbuj jeszcze raz. Kreator działa normalnie - możesz dodać
                własne grafiki.
              </p>
              <button
                type="button"
                onClick={retry}
                className="mt-1 inline-flex items-center justify-center gap-2 rounded-xl text-sm font-bold h-11 px-5 bg-primary text-primary-foreground hover:bg-primary/95 shadow-sm transition-all active:scale-[0.98] cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" aria-hidden />
                Spróbuj ponownie
              </button>
            </div>
          ) : !data ? (
            <ul
              className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4"
              aria-label="Wczytywanie gotowych arkuszy"
            >
              {Array.from({ length: 8 }, (_, index) => (
                <li key={index} className="animate-pulse">
                  <div className="rounded-2xl bg-muted/70 p-2.5 sm:p-3">
                    <div className="w-full aspect-[210/297] rounded-md bg-background/80" />
                  </div>
                  <div className="h-3.5 w-3/4 rounded bg-muted mt-2.5 mx-1" />
                  <div className="h-3 w-1/3 rounded bg-muted/70 mt-1.5 mx-1" />
                </li>
              ))}
            </ul>
          ) : sheets.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center gap-2 py-10">
              <p className="text-base font-extrabold text-foreground">
                Na razie nie ma tu gotowych arkuszy
              </p>
              <p className="text-sm font-medium text-muted-foreground">
                Dodaj własne grafiki - kreator ułoży je na arkuszu.
              </p>
            </div>
          ) : detail ? (
            <div className="sm:h-full grid grid-cols-1 sm:grid-cols-[minmax(0,1fr)_17.5rem] gap-5 sm:gap-7">
              <div className="sm:min-h-0 rounded-2xl bg-[#edf6f2] dark:bg-[#002c2e] p-4 sm:p-6 flex items-center justify-center">
                <div className="relative w-full max-w-[26rem] sm:w-auto sm:max-w-full sm:h-full sm:max-h-[38rem] aspect-[210/297] rounded-lg bg-white overflow-hidden shadow-[0_14px_40px_rgba(0,71,73,0.16)]">
                  {detail.previewUrl && (
                    <SheetImage
                      key={detail.id}
                      src={detail.previewUrl}
                      sizes="(max-width: 640px) 88vw, 430px"
                      eager
                    />
                  )}
                </div>
              </div>

              <div className="flex flex-col gap-4 sm:overflow-y-auto sm:pr-1">
                <div>
                  {detail.category && (
                    <span className="inline-block rounded-full bg-primary/10 text-primary text-[11px] font-extrabold px-2.5 py-1 mb-2">
                      {detail.category}
                    </span>
                  )}
                  <h3 className="text-2xl font-extrabold text-foreground leading-tight text-balance">
                    {detail.name}
                  </h3>
                  <p className="text-sm font-bold text-muted-foreground mt-1.5">
                    {detail.stickerCount} {getStickersNoun(detail.stickerCount)} na arkuszu A4
                  </p>
                </div>

                <ul className="space-y-2.5 text-sm font-semibold text-foreground/90">
                  {[
                    "Po wczytaniu edytujesz go jak własny projekt: zmienisz rozmiary, usuniesz naklejki, dodasz swoje.",
                    "Druk na folii winylowej i cięcie - tak samo jak przy Twoich grafikach.",
                    "49 zł za arkusz A4, jak każdy zestaw z kreatora.",
                  ].map((line) => (
                    <li key={line} className="flex items-start gap-2.5">
                      <span className="mt-0.5 shrink-0 w-4.5 h-4.5 rounded-full bg-primary/15 text-primary flex items-center justify-center">
                        <Check className="w-3 h-3" aria-hidden />
                      </span>
                      <span className="leading-snug">{line}</span>
                    </li>
                  ))}
                </ul>

                {willReplace && (
                  <p className="flex items-start gap-2 text-xs font-bold text-[#8a6d00] dark:text-[#FFCD08] bg-[#FFCD08]/10 border border-[#FFCD08]/40 rounded-xl px-3 py-2.5">
                    <AlertTriangle className="w-4 h-4 shrink-0" aria-hidden />
                    <span>
                      Na arkuszu {replaceCount === 1 ? "leży" : "leżą"} teraz {replaceCount}{" "}
                      {getStickersNoun(replaceCount)}. Ten wzór {replaceCount === 1 ? "ją" : "je"}{" "}
                      zastąpi.
                    </span>
                  </p>
                )}

                {detail.slug && !data?.preview && (
                  <Link
                    href={`/gotowe-arkusze/${detail.slug}`}
                    className="self-start text-sm font-extrabold text-primary underline decoration-primary/40 underline-offset-4 hover:decoration-primary"
                  >
                    Opis i szczegóły arkusza
                  </Link>
                )}

                {useFailed && (
                  <p role="alert" className="text-sm font-bold text-destructive">
                    Nie udało się wczytać tego arkusza. Spróbuj ponownie.
                  </p>
                )}
              </div>
            </div>
          ) : (
            <ul className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-3 gap-y-4 sm:gap-x-4 sm:gap-y-5">
              {visible.map((sheet) => {
                const active = sheet.id === activeSheetId;
                return (
                  <li key={sheet.id}>
                    <button
                      type="button"
                      onClick={() => openDetail(sheet)}
                      aria-label={`${sheet.name}, ${sheet.stickerCount} ${getStickersNoun(sheet.stickerCount)} - zobacz wzór`}
                      className="group w-full text-left cursor-pointer rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
                    >
                      <span
                        className={`relative block rounded-2xl p-2.5 sm:p-3 transition-colors ${
                          active
                            ? "bg-primary/15 ring-2 ring-primary"
                            : "bg-[#edf6f2] dark:bg-[#002c2e] group-hover:bg-[#dff0e8] dark:group-hover:bg-[#003a3b]"
                        }`}
                      >
                        <span className="relative block w-full aspect-[210/297] rounded-md bg-white overflow-hidden shadow-[0_6px_18px_rgba(0,71,73,0.12)] transition-transform duration-200 group-hover:-translate-y-0.5">
                          {sheet.previewUrl && (
                            <SheetImage
                              src={sheet.previewUrl}
                              sizes="(max-width: 640px) 30vw, 190px"
                            />
                          )}
                        </span>
                        {active && (
                          <span className="absolute top-1.5 left-1.5 inline-flex items-center gap-1 rounded-full bg-primary text-primary-foreground text-[10px] font-extrabold pl-1.5 pr-2 py-0.5 shadow">
                            <Check className="w-3 h-3" aria-hidden />
                            W kreatorze
                          </span>
                        )}
                      </span>
                      <span className="block px-1 pt-2">
                        <span className="block text-sm font-extrabold text-foreground leading-snug line-clamp-2 group-hover:text-primary transition-colors">
                          {sheet.name}
                        </span>
                        <span className="block text-[11px] font-semibold text-muted-foreground mt-0.5">
                          {sheet.stickerCount} {getStickersNoun(sheet.stickerCount)}
                          {activeCategory === ALL && sheet.category ? ` · ${sheet.category}` : ""}
                        </span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Stopka podglądu: przeglądanie wzorów i wczytanie do kreatora */}
        {detail && (
          <div className="flex items-center gap-3 border-t border-border/60 px-4 sm:px-7 py-3 sm:py-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:pb-4">
            {visible.length > 1 && (
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => step(-1)}
                  disabled={busy}
                  aria-label="Poprzedni wzór"
                  className="w-10 h-10 rounded-xl border border-border/70 flex items-center justify-center text-foreground hover:bg-muted/60 transition-colors cursor-pointer disabled:opacity-50"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="min-w-[3rem] text-center text-xs font-extrabold text-muted-foreground tabular-nums">
                  {detailIndex + 1} / {visible.length}
                </span>
                <button
                  type="button"
                  onClick={() => step(1)}
                  disabled={busy}
                  aria-label="Następny wzór"
                  className="w-10 h-10 rounded-xl border border-border/70 flex items-center justify-center text-foreground hover:bg-muted/60 transition-colors cursor-pointer disabled:opacity-50"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
            <button
              type="button"
              onClick={() => void use()}
              disabled={busy}
              className="ml-auto inline-flex items-center justify-center gap-2 rounded-xl text-sm font-extrabold h-12 px-5 sm:px-7 bg-primary text-primary-foreground hover:bg-primary/95 shadow-sm transition-all active:scale-[0.98] cursor-pointer disabled:opacity-70 disabled:cursor-wait"
            >
              {busy ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" aria-hidden />
                  Wczytuję…
                </>
              ) : isActiveDetail && !willReplace ? (
                "Wróć do kreatora"
              ) : willReplace ? (
                "Zastąp arkusz tym wzorem"
              ) : (
                "Użyj tego arkusza"
              )}
            </button>
          </div>
        )}
      </motion.div>
    </div>,
    document.body
  );
}
