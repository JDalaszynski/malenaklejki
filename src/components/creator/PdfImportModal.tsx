"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Check, FileText, Loader2, Plus, X } from "lucide-react";
import {
  describePdfError,
  EmptyPdfPageError,
  openPdf,
  renderPdfPageForSticker,
  renderPdfThumbnail,
  type PDFDocumentProxy,
  type RenderedPdfPage,
} from "@/lib/utils/pdf";
import { getPagesNoun } from "@/lib/utils/polish";

/** Więcej miniatur zapycha pamięć telefonu, a tylu stron i tak nikt nie wybiera. */
const MAX_PREVIEW_PAGES = 60;
/** Każda strona to osobny render w jakości druku i osobny upload. */
const MAX_SELECTED_PAGES = 10;
const THUMB_LONG_SIDE_PX = 400;

interface PdfImportModalProps {
  file: File;
  /** Wysyła gotowe grafiki do Storage i układa je na arkuszu. */
  onAdd: (pages: RenderedPdfPage[]) => Promise<void>;
  onError: (message: string) => void;
  onClose: () => void;
}

/**
 * Import pliku PDF: jednostronicowy trafia od razu na arkusz, przy wielostronicowym
 * klient wybiera strony z miniatur. Każda strona staje się osobną naklejką.
 */
export function PdfImportModal({ file, onAdd, onError, onClose }: PdfImportModalProps) {
  const [phase, setPhase] = useState<"opening" | "picking" | "adding">("opening");
  const [pageCount, setPageCount] = useState(0);
  const [thumbnails, setThumbnails] = useState<Record<number, string>>({});
  const [selected, setSelected] = useState<number[]>([]);
  const [limitHit, setLimitHit] = useState(false);
  const [progress, setProgress] = useState("Otwieranie pliku PDF...");

  const docRef = useRef<PDFDocumentProxy | null>(null);
  const closedRef = useRef(false);
  const callbacksRef = useRef({ onAdd, onError, onClose });
  useEffect(() => {
    callbacksRef.current = { onAdd, onError, onClose };
  });

  const addPages = useCallback(async (pageNumbers: number[]) => {
    const doc = docRef.current;
    if (!doc) return;
    const { onAdd, onError, onClose } = callbacksRef.current;
    setPhase("adding");

    const rendered: RenderedPdfPage[] = [];
    const emptyPages: EmptyPdfPageError[] = [];
    try {
      for (const [i, pageNumber] of pageNumbers.entries()) {
        setProgress(
          pageNumbers.length > 1
            ? `Przygotowywanie strony ${i + 1} z ${pageNumbers.length}...`
            : "Przygotowywanie grafiki...",
        );
        try {
          rendered.push(await renderPdfPageForSticker(doc, pageNumber));
        } catch (err) {
          // Pusta strona wśród kilku wybranych nie blokuje pozostałych.
          if (!(err instanceof EmptyPdfPageError)) throw err;
          emptyPages.push(err);
        }
        if (closedRef.current) return;
      }
    } catch (err) {
      if (closedRef.current) return;
      console.error(err);
      onError(describePdfError(err));
      onClose();
      return;
    }

    if (rendered.length === 0) {
      onError(describePdfError(emptyPages[0]));
      onClose();
      return;
    }

    setProgress("Dodawanie na arkusz...");
    try {
      await onAdd(rendered);
      if (emptyPages.length > 0) {
        const numbers = emptyPages.map((e) => e.pageNumber).join(", ");
        onError(
          emptyPages.length === 1
            ? `Pominęliśmy stronę ${numbers} - jest pusta.`
            : `Pominęliśmy puste strony: ${numbers}.`,
        );
      }
    } catch (err) {
      console.error(err);
      onError("Nie udało się dodać grafiki z pliku PDF. Spróbuj ponownie.");
    }
    onClose();
  }, []);

  useEffect(() => {
    let cancelled = false;
    closedRef.current = false;

    (async () => {
      let doc: PDFDocumentProxy;
      try {
        doc = await openPdf(file);
      } catch (err) {
        if (cancelled) return;
        // Zwykle wina pliku (hasło, uszkodzenie), a klient dostaje komunikat.
        console.warn(err);
        callbacksRef.current.onError(describePdfError(err));
        callbacksRef.current.onClose();
        return;
      }
      if (cancelled) {
        doc.loadingTask.destroy();
        return;
      }
      docRef.current = doc;
      setPageCount(doc.numPages);

      if (doc.numPages === 1) {
        addPages([1]);
        return;
      }

      setPhase("picking");
      const previewCount = Math.min(doc.numPages, MAX_PREVIEW_PAGES);
      for (let pageNumber = 1; pageNumber <= previewCount; pageNumber++) {
        try {
          const url = await renderPdfThumbnail(doc, pageNumber, THUMB_LONG_SIDE_PX);
          if (cancelled) return;
          setThumbnails((prev) => ({ ...prev, [pageNumber]: url }));
        } catch (err) {
          if (cancelled) return;
          // Uszkodzona strona zostaje bez miniatury - reszta ma się wczytać.
          console.error(err);
        }
      }
    })();

    return () => {
      cancelled = true;
      closedRef.current = true;
      docRef.current?.loadingTask.destroy();
      docRef.current = null;
    };
  }, [file, addPages]);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  useEffect(() => {
    if (phase !== "picking") return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") callbacksRef.current.onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [phase]);

  const previewPages = Array.from(
    { length: Math.min(pageCount, MAX_PREVIEW_PAGES) },
    (_, i) => i + 1,
  );
  const canSelectAll = previewPages.length <= MAX_SELECTED_PAGES;

  const togglePage = (pageNumber: number) => {
    setSelected((prev) => {
      if (prev.includes(pageNumber)) return prev.filter((p) => p !== pageNumber);
      if (prev.length >= MAX_SELECTED_PAGES) return prev;
      return [...prev, pageNumber].sort((a, b) => a - b);
    });
    setLimitHit(
      !selected.includes(pageNumber) && selected.length >= MAX_SELECTED_PAGES,
    );
  };

  const hint = limitHit
    ? `Naraz dodasz najwyżej ${MAX_SELECTED_PAGES} stron.`
    : selected.length === 0
      ? "Wybierz strony, które chcesz dodać."
      : `Zaznaczono: ${selected.length} ${getPagesNoun(selected.length)}`;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={phase === "picking" ? onClose : undefined}
        className="absolute inset-0 bg-background/80 backdrop-blur-sm"
      />

      {phase === "picking" ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="pdf-import-title"
          className="relative w-full max-w-2xl max-h-[calc(100dvh-2rem)] rounded-3xl border border-border bg-background shadow-xl flex flex-col overflow-hidden"
        >
          <div className="flex items-start justify-between gap-3 p-5 sm:p-6 pb-2 sm:pb-3">
            <div className="min-w-0">
              <h2
                id="pdf-import-title"
                className="text-xl font-extrabold flex items-center gap-2 text-foreground"
              >
                <FileText className="w-6 h-6 text-primary flex-shrink-0" />
                Wybierz strony z PDF
              </h2>
              <p className="text-sm font-semibold text-muted-foreground pt-1 flex min-w-0">
                <span className="truncate">{file.name}</span>
                <span className="flex-shrink-0 whitespace-pre">
                  {` · ${pageCount} ${getPagesNoun(pageCount)}`}
                </span>
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Zamknij"
              className="p-2 -mr-2 -mt-1 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="px-5 sm:px-6 flex items-center justify-between gap-3">
            <p className="text-xs font-semibold text-muted-foreground">
              Każda strona trafi na arkusz jako osobna naklejka. Puste marginesy
              przytniemy automatycznie.
            </p>
            {canSelectAll && (
              <button
                type="button"
                onClick={() => {
                  setSelected(selected.length === previewPages.length ? [] : previewPages);
                  setLimitHit(false);
                }}
                className="flex-shrink-0 text-xs font-extrabold text-primary hover:underline cursor-pointer"
              >
                {selected.length === previewPages.length
                  ? "Odznacz wszystkie"
                  : "Zaznacz wszystkie"}
              </button>
            )}
          </div>

          <div className="flex-1 overflow-y-auto px-5 sm:px-6 py-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
              {previewPages.map((pageNumber) => {
                const isSelected = selected.includes(pageNumber);
                const thumbnail = thumbnails[pageNumber];
                return (
                  <button
                    key={pageNumber}
                    type="button"
                    onClick={() => togglePage(pageNumber)}
                    aria-pressed={isSelected}
                    className={`relative flex flex-col items-center gap-1.5 p-2 rounded-2xl border-2 transition-all cursor-pointer ${
                      isSelected
                        ? "border-primary bg-primary/10"
                        : "border-transparent hover:border-primary/40 hover:bg-muted/40"
                    }`}
                  >
                    <div className="relative w-full aspect-[210/297] flex items-center justify-center">
                      {thumbnail ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={thumbnail}
                          alt={`Strona ${pageNumber}`}
                          className="max-w-full max-h-full rounded-md bg-white border border-border/60 shadow-md"
                        />
                      ) : (
                        <div className="w-full h-full rounded-md bg-muted animate-pulse" />
                      )}
                      {isSelected && (
                        <span className="absolute top-1.5 right-1.5 w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-md">
                          <Check className="w-4 h-4" strokeWidth={3} />
                        </span>
                      )}
                    </div>
                    <span
                      className={`text-xs font-bold ${isSelected ? "text-primary" : "text-muted-foreground"}`}
                    >
                      Strona {pageNumber}
                    </span>
                  </button>
                );
              })}
            </div>
            {pageCount > MAX_PREVIEW_PAGES && (
              <p className="mt-4 text-xs font-semibold text-muted-foreground text-center">
                Pokazujemy pierwsze {MAX_PREVIEW_PAGES} stron. Dalsze strony zapisz
                jako osobny plik PDF.
              </p>
            )}
          </div>

          <div className="border-t border-border/60 px-5 sm:px-6 py-4 flex flex-col sm:flex-row sm:items-center gap-3">
            <p
              className={`flex-1 text-xs font-bold text-center sm:text-left ${
                limitHit ? "text-amber-600 dark:text-amber-400" : "text-muted-foreground"
              }`}
            >
              {hint}
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 sm:px-5 py-3 rounded-2xl text-muted-foreground font-semibold hover:bg-muted/40 transition-all cursor-pointer"
              >
                Anuluj
              </button>
              <button
                type="button"
                disabled={selected.length === 0}
                onClick={() => addPages(selected)}
                className="flex-1 sm:flex-none px-4 sm:px-6 py-3 rounded-2xl whitespace-nowrap bg-primary text-primary-foreground font-black flex items-center justify-center gap-2 hover:bg-primary/90 transition-all shadow-lg shadow-primary/25 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
              >
                <Plus className="w-5 h-5" />
                Dodaj na arkusz
              </button>
            </div>
          </div>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="relative flex flex-col items-center gap-4 text-primary"
        >
          <Loader2 className="w-16 h-16 animate-spin" />
          <p className="text-xl font-extrabold text-center">{progress}</p>
        </motion.div>
      )}
    </div>
  );
}
