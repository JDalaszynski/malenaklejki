"use client";

import { useEffect, useRef, useState } from "react";
import {
  AlertTriangle,
  BookmarkCheck,
  Copy,
  Crop,
  Download,
  Layers,
  LayoutGrid,
  Library,
  Loader2,
  Trash2,
} from "lucide-react";

import { Card } from "@/components/admin/AdminLayout";
import {
  CUT_LINE_LABELS,
  LOW_DPI,
  MAX_STICKER_NAME,
  printDpi,
  type CutLineType,
  type LibrarySticker,
} from "@/lib/sheets/types";
import { getDisplayedWidthCm, getMaxDisplayedWidthCm } from "@/lib/utils/collision";
import type { PlacedSticker } from "@/types/creator";
import { CutLineOptions } from "./CutLineOptions";

const actionClass =
  "flex-1 inline-flex items-center justify-center gap-1 px-2 py-1.5 text-[11px] font-bold bg-muted hover:bg-muted/80 dark:bg-white/10 dark:hover:bg-white/20 text-foreground border border-border/40 rounded-xl transition-all active:scale-95 cursor-pointer disabled:opacity-60 disabled:pointer-events-none";

const pixelWidths = new Map<string, number>();

/** Szerokość pliku w pikselach — do ostrzeżenia o rozmytym druku. */
function usePixelWidth(imageUrl: string, known: number | null | undefined): number | null {
  const [measured, setMeasured] = useState<{ url: string; width: number } | null>(null);
  const cached = known || pixelWidths.get(imageUrl);

  useEffect(() => {
    if (cached) return;
    let cancelled = false;
    const img = new Image();
    img.onload = () => {
      const width = img.naturalWidth || img.width;
      pixelWidths.set(imageUrl, width);
      if (!cancelled) setMeasured({ url: imageUrl, width });
    };
    img.src = imageUrl;
    return () => {
      cancelled = true;
    };
  }, [imageUrl, cached]);

  return cached || (measured?.url === imageUrl ? measured.width : null);
}

function formatCm(value: number): string {
  return String(value).replace(".", ",");
}

/**
 * Panel wybranej naklejki — te same kontrolki co w kreatorze (szerokość,
 * obrót, linia cięcia, szybkie akcje) plus to, czego potrzebuje sprzedawca:
 * nazwa w bazie i zapis ustawień jako domyślnych.
 */
export function SelectedStickerPanel({
  sticker,
  libraryItem,
  countOnSheet,
  calculating,
  isFilling,
  libraryBusy,
  onEdit,
  onDuplicate,
  onFill,
  onDownload,
  onDelete,
  onWidthChange,
  onRotationChange,
  onCutLineChange,
  onRename,
  onSaveDefaults,
  onAddToLibrary,
}: {
  sticker: PlacedSticker;
  /** `undefined` — naklejka spoza bazy (albo usunięta z bazy). */
  libraryItem: LibrarySticker | undefined;
  countOnSheet: number;
  calculating: CutLineType | null;
  isFilling: boolean;
  libraryBusy: boolean;
  onEdit: () => void;
  onDuplicate: () => void;
  onFill: () => void;
  onDownload: () => void;
  onDelete: () => void;
  onWidthChange: (displayedWidthCm: number) => void;
  onRotationChange: (degrees: number) => void;
  onCutLineChange: (type: CutLineType) => void;
  onRename: (name: string) => void;
  onSaveDefaults: () => void;
  onAddToLibrary: () => void;
}) {
  const displayedWidth = getDisplayedWidthCm(sticker);
  const maxWidth = getMaxDisplayedWidthCm(sticker);
  // Wpisywana wartość żyje osobno tylko w trakcie pisania — poza tym pole
  // pokazuje stan naklejki (np. po przeciągnięciu uchwytu na arkuszu).
  const [widthDraft, setWidthDraft] = useState<string | null>(null);
  const [nameDraft, setNameDraft] = useState<string | null>(null);
  const widthInput = widthDraft ?? formatCm(displayedWidth);
  const nameInput = nameDraft ?? libraryItem?.name ?? "";

  const commitWidth = () => {
    const value = parseFloat(widthInput.replace(",", "."));
    setWidthDraft(null);
    if (Number.isNaN(value)) return;
    const clamped = Math.round(Math.max(1, Math.min(maxWidth, value)) * 10) / 10;
    if (clamped !== displayedWidth) onWidthChange(clamped);
  };

  const cancelNameRef = useRef(false);
  const commitName = () => {
    const trimmed = nameInput.trim();
    setNameDraft(null);
    if (cancelNameRef.current) {
      cancelNameRef.current = false;
      return;
    }
    if (!libraryItem || !trimmed) return;
    if (trimmed !== libraryItem.name) onRename(trimmed);
  };

  const pixelWidth = usePixelWidth(sticker.imageUrl, libraryItem?.pixelWidth);
  const dpi = printDpi(pixelWidth, sticker.widthCm);
  const isLowRes = dpi !== null && dpi < LOW_DPI;

  const differsFromLibrary =
    !!libraryItem &&
    sticker.cutLineType !== "none" &&
    (libraryItem.cutLineType !== sticker.cutLineType ||
      Math.abs(libraryItem.widthCm - sticker.widthCm) >= 0.05);

  return (
    <Card className="border-2 border-primary/40">
      <div className="flex items-center gap-2 border-b border-border/40 pb-3 mb-4">
        <Layers className="w-5 h-5 text-primary" aria-hidden />
        <h2 className="text-lg font-black text-foreground">Wybrana naklejka</h2>
        {countOnSheet > 1 && (
          <span className="ml-auto text-[11px] font-bold text-muted-foreground">
            na arkuszu ×{countOnSheet}
          </span>
        )}
      </div>

      <div className="flex flex-col gap-5">
        <div className="flex items-center gap-4 bg-[#004749]/5 dark:bg-muted/20 border border-[#004749]/15 dark:border-border/40 p-3 rounded-2xl">
          <div className="w-16 h-16 bg-white rounded-xl border border-border/40 p-1 flex items-center justify-center shrink-0 overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element -- adres z tokenem Storage */}
            <img
              src={libraryItem?.thumbUrl || sticker.imageUrl}
              alt=""
              className="max-w-full max-h-full object-contain rounded-lg"
            />
          </div>
          <div className="min-w-0 flex-1 text-xs font-bold text-foreground space-y-0.5">
            <p>Szerokość: {formatCm(displayedWidth)} cm</p>
            <p>Wysokość: {sticker.heightCm.toFixed(1).replace(".", ",")} cm</p>
            <p>Linia cięcia: {CUT_LINE_LABELS[sticker.cutLineType]}</p>
            {dpi !== null && (
              <p className={isLowRes ? "text-destructive" : "text-muted-foreground"}>
                Rozdzielczość: {dpi} dpi
              </p>
            )}
          </div>
        </div>

        {/* Baza naklejek */}
        {libraryItem ? (
          <div className="flex flex-col gap-2">
            <label
              htmlFor="sticker-library-name"
              className="text-xs font-black uppercase tracking-wide text-muted-foreground flex items-center gap-1.5"
            >
              <Library className="w-3.5 h-3.5" aria-hidden />
              Nazwa w bazie naklejek
            </label>
            <input
              id="sticker-library-name"
              value={nameInput}
              maxLength={MAX_STICKER_NAME}
              onChange={(event) => setNameDraft(event.target.value)}
              onBlur={commitName}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  event.currentTarget.blur();
                }
                if (event.key === "Escape") {
                  cancelNameRef.current = true;
                  event.currentTarget.blur();
                }
              }}
              disabled={libraryBusy}
              className="h-10 w-full rounded-xl border border-slate-300 dark:border-white/20 bg-background px-3 text-sm font-semibold focus-visible:outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20 disabled:opacity-60"
            />
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
              <p className="text-[11px] font-medium text-muted-foreground">
                W bazie: {CUT_LINE_LABELS[libraryItem.cutLineType].toLowerCase()},{" "}
                {formatCm(libraryItem.widthCm)} cm
              </p>
              {differsFromLibrary && (
                <button
                  type="button"
                  onClick={onSaveDefaults}
                  disabled={libraryBusy}
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-primary hover:underline cursor-pointer disabled:opacity-60"
                  title="Następnym razem naklejka przyjdzie z bazy z tą linią cięcia i tym rozmiarem"
                >
                  {libraryBusy ? (
                    <Loader2 className="w-3 h-3 animate-spin" aria-hidden />
                  ) : (
                    <BookmarkCheck className="w-3 h-3" aria-hidden />
                  )}
                  Zapisz te ustawienia w bazie
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-border/80 bg-muted/20 px-3 py-2.5 flex flex-wrap items-center justify-between gap-2">
            <p className="text-xs font-semibold text-muted-foreground">
              {sticker.libraryId
                ? "Tej naklejki nie ma już w bazie."
                : "Ta naklejka nie jest jeszcze w bazie."}
            </p>
            <button
              type="button"
              onClick={onAddToLibrary}
              disabled={libraryBusy}
              className="inline-flex items-center gap-1 text-xs font-bold text-primary hover:underline cursor-pointer disabled:opacity-60"
            >
              {libraryBusy && <Loader2 className="w-3 h-3 animate-spin" aria-hidden />}
              Dodaj do bazy
            </button>
          </div>
        )}

        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-1.5">
            <button type="button" onClick={onEdit} className={actionClass} title="Kadruj lub usuń tło">
              <Crop className="w-3.5 h-3.5" aria-hidden />
              Kadruj/Tło
            </button>
            <button type="button" onClick={onDuplicate} className={actionClass} title="Zduplikuj (Ctrl/⌘+D)">
              <Copy className="w-3.5 h-3.5" aria-hidden />
              Zduplikuj
            </button>
            <button type="button" onClick={onFill} disabled={isFilling} className={actionClass}>
              {isFilling ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" aria-hidden />
              ) : (
                <LayoutGrid className="w-3.5 h-3.5" aria-hidden />
              )}
              {isFilling ? "Wypełnianie..." : "Wypełnij"}
            </button>
          </div>
          <div className="flex items-center gap-1.5">
            <button type="button" onClick={onDownload} className={actionClass}>
              <Download className="w-3.5 h-3.5" aria-hidden />
              Pobierz
            </button>
            <button
              type="button"
              onClick={onDelete}
              title="Usuń z arkusza (Delete)"
              className="flex-1 inline-flex items-center justify-center gap-1 px-2 py-1.5 text-[11px] font-bold bg-destructive/10 hover:bg-destructive/15 text-destructive border border-destructive/20 rounded-xl transition-all active:scale-95 cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" aria-hidden />
              Usuń
            </button>
          </div>
        </div>

        {isLowRes && (
          <div className="bg-red-50 border border-red-200 text-red-500 dark:bg-red-950/30 dark:border-red-900/30 dark:text-red-400 text-xs font-bold p-3 rounded-2xl flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" aria-hidden />
            <div>
              <p className="font-extrabold text-[12px]">Uwaga: niska jakość pliku!</p>
              <p className="text-[10px] leading-relaxed mt-0.5 font-semibold text-red-500/80 dark:text-red-400/80">
                Przy tym rozmiarze naklejka może wyjść rozmazana w druku. Zmniejsz ją albo
                podmień grafikę na lepszą.
              </p>
            </div>
          </div>
        )}

        <div className="space-y-2">
          <div className="flex justify-between items-center text-sm font-bold">
            <label htmlFor="sticker-width" className="text-foreground">
              Szerokość naklejki (cm)
            </label>
            <div className="flex items-center gap-1 text-primary font-black">
              <input
                id="sticker-width"
                type="text"
                inputMode="decimal"
                value={widthInput}
                onChange={(event) => setWidthDraft(event.target.value)}
                onBlur={commitWidth}
                onFocus={(event) => event.currentTarget.select()}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    commitWidth();
                    event.currentTarget.blur();
                  }
                }}
                className="w-12 bg-transparent text-right text-primary font-black focus:outline-none p-0"
              />
              <span className="select-none">cm</span>
            </div>
          </div>
          <input
            type="range"
            min={1}
            max={maxWidth}
            step={0.1}
            value={displayedWidth}
            onChange={(event) => onWidthChange(Number(event.target.value))}
            aria-label="Szerokość naklejki"
            className="w-full h-2 bg-foreground/10 dark:bg-muted-foreground/40 rounded-lg appearance-none cursor-pointer accent-primary focus:outline-none"
          />
          <p className="text-[10px] text-muted-foreground font-semibold">
            Wysokość wylicza się z proporcji grafiki. Przy tym obrocie maksymalnie{" "}
            {formatCm(maxWidth)} cm szerokości.
          </p>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm font-bold">
            <span className="text-foreground">Obrót naklejki (stopnie)</span>
            <span className="text-primary font-black">{sticker.rotation || 0}°</span>
          </div>
          <input
            type="range"
            min={0}
            max={360}
            step={1}
            value={sticker.rotation || 0}
            onChange={(event) => onRotationChange(Number(event.target.value))}
            aria-label="Obrót naklejki"
            className="w-full h-2 bg-foreground/10 dark:bg-muted-foreground/40 rounded-lg appearance-none cursor-pointer accent-primary focus:outline-none"
          />
          <div className="relative w-full h-8 mt-2">
            {[0, 90, 180, 270, 360].map((deg) => {
              const pct = (deg / 360) * 100;
              return (
                <button
                  key={deg}
                  type="button"
                  onClick={() => onRotationChange(deg)}
                  style={{ left: `${pct}%`, transform: `translateX(-${pct}%)` }}
                  className={`absolute text-[10px] font-extrabold rounded-md border transition-all px-2 py-0.5 cursor-pointer ${
                    (sticker.rotation || 0) === deg
                      ? "bg-secondary/20 text-foreground border-secondary/40"
                      : "bg-muted/40 hover:bg-muted text-muted-foreground border-transparent"
                  }`}
                >
                  {deg}°
                </button>
              );
            })}
          </div>
        </div>

        <div className="space-y-3">
          <span className="text-sm font-bold text-foreground block">Rodzaj linii cięcia</span>
          <CutLineOptions
            value={sticker.cutLineType}
            onChange={onCutLineChange}
            calculating={calculating}
          />
        </div>

        <p className="text-[11px] font-medium text-muted-foreground leading-relaxed">
          Skróty: strzałki przesuwają o 1 mm (z Shift o 5 mm), Delete usuwa, Ctrl/⌘+D duplikuje,
          Ctrl/⌘+S zapisuje, Esc odznacza.
        </p>
      </div>
    </Card>
  );
}
