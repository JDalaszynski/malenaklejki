"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, ImagePlus, Library, Search, X } from "lucide-react";

import { StatTile } from "@/components/admin/ProfitStats";
import { Card } from "@/components/admin/AdminLayout";
import { formatDateTime } from "@/lib/orders/status";
import {
  CUT_LINE_LABELS,
  DEFAULT_STICKER_WIDTH_CM,
  byLastUsed,
  matchesSearch,
  stickerNameFromFile,
  type CutLineType,
  type LibrarySticker,
} from "@/lib/sheets/types";
import { MAX_IMAGE_BYTES } from "@/lib/sheets/upload";
import { getPdfStickerWidthCm, isPdfFile, MAX_PDF_BYTES, type RenderedPdfPage } from "@/lib/utils/pdf";
import { getStickersNoun } from "@/lib/utils/polish";
import { getUUID } from "@/lib/uuid";
import { AddStickersDialog, type PendingSticker } from "./AddStickersDialog";
import { LibraryStickerDialog, type SheetRef } from "./LibraryStickerDialog";
import { StickerThumb } from "./StickerThumb";

const PdfImportModal = dynamic(
  () => import("@/components/creator/PdfImportModal").then((mod) => ({ default: mod.PdfImportModal })),
  { ssr: false }
);

const FILE_ACCEPT =
  "image/png, image/jpeg, image/jpg, image/webp, application/pdf, .png, .jpg, .jpeg, .webp, .pdf";
const PAGE = 60;

type Sort = "recent" | "name" | "newest";
type Usage = "" | "used" | "unused";

const selectClass =
  "h-11 w-full rounded-xl border border-slate-300 dark:border-white/20 bg-background px-3 text-sm font-semibold focus-visible:outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20";

/** „na 1 arkuszu", „na 3 arkuszach" — miejscownik ma dwie formy. */
function sheetsNoun(count: number): string {
  return count === 1 ? "arkuszu" : "arkuszach";
}

function measure(url: string): Promise<number> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img.width / img.height);
    img.onerror = reject;
    img.src = url;
  });
}

/**
 * Baza naklejek: wyszukiwarka, filtry i siatka. Wszystko filtruje się
 * w przeglądarce — baza to co najwyżej kilka tysięcy lekkich wpisów,
 * a wyszukiwanie ma działać w trakcie pisania.
 */
export function StickerLibraryManager({
  initialItems,
  usedIn,
}: {
  initialItems: LibrarySticker[];
  /** Arkusze, na których leży każda naklejka z bazy. */
  usedIn: Record<string, SheetRef[]>;
}) {
  const [items, setItems] = useState(initialItems);
  const [query, setQuery] = useState("");
  const [cutFilter, setCutFilter] = useState<CutLineType | "">("");
  const [usage, setUsage] = useState<Usage>("");
  const [sort, setSort] = useState<Sort>("recent");
  const [limit, setLimit] = useState(PAGE);

  const [editing, setEditing] = useState<LibrarySticker | null>(null);
  const [pending, setPending] = useState<PendingSticker[]>([]);
  const [pdfQueue, setPdfQueue] = useState<File[]>([]);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!notice) return;
    const timer = setTimeout(() => setNotice(null), 4000);
    return () => clearTimeout(timer);
  }, [notice]);

  // Podglądy `blob:` z okna dodawania żyją tylko do jego zamknięcia.
  const pendingRef = useRef(pending);
  useEffect(() => {
    const previous = pendingRef.current;
    pendingRef.current = pending;
    const alive = new Set(pending.map((item) => item.previewUrl));
    previous.forEach((item) => {
      if (!alive.has(item.previewUrl)) URL.revokeObjectURL(item.previewUrl);
    });
  }, [pending]);

  const results = useMemo(() => {
    const filtered = items.filter((item) => {
      if (!matchesSearch(item.name, query)) return false;
      if (cutFilter && item.cutLineType !== cutFilter) return false;
      const count = usedIn[item.id]?.length ?? 0;
      if (usage === "used" && count === 0) return false;
      if (usage === "unused" && count > 0) return false;
      return true;
    });
    if (sort === "name") return filtered.sort((a, b) => a.name.localeCompare(b.name, "pl"));
    if (sort === "newest") return filtered.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    return filtered.sort(byLastUsed);
  }, [items, query, cutFilter, usage, sort, usedIn]);

  const usedCount = items.filter((item) => (usedIn[item.id]?.length ?? 0) > 0).length;
  const withoutCut = items.filter((item) => item.cutLineType === "none").length;
  const activeFilters = [query, cutFilter, usage].filter(Boolean).length;

  const queueFiles = async (files: File[]) => {
    setError(null);
    const problems: string[] = [];
    const next: PendingSticker[] = [];

    for (const file of files) {
      if (isPdfFile(file)) {
        if (file.size > MAX_PDF_BYTES) problems.push(`„${file.name}" jest za duży (maksymalnie 50 MB).`);
        else setPdfQueue((queue) => [...queue, file]);
        continue;
      }
      if (!file.type.startsWith("image/")) {
        problems.push(`„${file.name}" to nie grafika (JPG, PNG, WEBP) ani PDF.`);
        continue;
      }
      if (file.size > MAX_IMAGE_BYTES) {
        problems.push(`„${file.name}" jest za duży (maksymalnie 10 MB).`);
        continue;
      }
      const previewUrl = URL.createObjectURL(file);
      try {
        const aspectRatio = await measure(previewUrl);
        next.push({
          key: getUUID(),
          blob: file,
          previewUrl,
          fileName: file.name,
          name: stickerNameFromFile(file.name),
          aspectRatio,
          widthCm: DEFAULT_STICKER_WIDTH_CM,
        });
      } catch {
        URL.revokeObjectURL(previewUrl);
        problems.push(`Nie udało się odczytać „${file.name}".`);
      }
    }

    if (next.length > 0) setPending((current) => [...current, ...next]);
    if (problems.length > 0) setError(problems.join(" "));
  };

  const queuePdfPages = async (fileName: string, pages: RenderedPdfPage[]) => {
    const baseName = fileName.replace(/\.pdf$/i, "");
    const next: PendingSticker[] = [];
    for (const page of pages) {
      const previewUrl = URL.createObjectURL(page.blob);
      next.push({
        key: getUUID(),
        blob: page.blob,
        previewUrl,
        fileName: `${baseName}-strona-${page.pageNumber}.png`,
        name:
          pages.length > 1 || page.pageNumber > 1
            ? `${stickerNameFromFile(baseName)} – str. ${page.pageNumber}`
            : stickerNameFromFile(baseName),
        aspectRatio: page.widthCm / page.heightCm,
        widthCm: getPdfStickerWidthCm(page.widthCm, page.heightCm),
      });
    }
    setPending((current) => [...current, ...next]);
  };

  const handleAdded = ({
    added,
    existing,
    errors,
  }: {
    added: LibrarySticker[];
    existing: LibrarySticker[];
    errors: string[];
  }) => {
    setPending([]);
    const touched = [...added, ...existing];
    setItems((current) => [
      ...touched,
      ...current.filter((item) => !touched.some((other) => other.id === item.id)),
    ]);
    setSort("recent");

    const parts: string[] = [];
    if (added.length > 0) parts.push(`Dodano ${added.length} ${getStickersNoun(added.length)}.`);
    if (existing.length > 0) {
      parts.push(
        existing.length === 1
          ? `„${existing[0].name}" była już w bazie.`
          : `${existing.length} grafiki były już w bazie.`
      );
    }
    if (parts.length > 0) setNotice(parts.join(" "));
    if (errors.length > 0) setError(errors.join(" "));
  };

  return (
    <>
      <AnimatePresence>
        {(error || notice) && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            // Na dole ekranu, bo u góry wisi pasek zapisu edytora.
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[150] max-w-md w-[calc(100%-2rem)]"
            role={error ? "alert" : "status"}
          >
            {error ? (
              <div className="bg-red-50 text-red-500 dark:bg-red-950/60 dark:text-red-300 p-4 rounded-2xl shadow-lg border border-red-200 dark:border-red-900/40 flex items-center justify-between gap-3">
                <span className="text-sm font-extrabold">{error}</span>
                <button
                  type="button"
                  onClick={() => setError(null)}
                  className="shrink-0 text-xs bg-red-100 hover:bg-red-200 dark:bg-red-900/40 dark:hover:bg-red-900 text-red-600 dark:text-red-200 py-1 px-2.5 rounded-lg transition-all cursor-pointer"
                >
                  Zamknij
                </button>
              </div>
            ) : (
              <div className="bg-card text-foreground p-4 rounded-2xl shadow-lg border border-primary/40 flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-primary shrink-0" aria-hidden />
                <span className="text-sm font-extrabold">{notice}</span>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatTile label="W bazie" value={String(items.length)} hint="naklejek do układania" hero />
        <StatTile label="Na arkuszach" value={String(usedCount)} hint="leży na co najmniej jednym" />
        <StatTile label="Nieużywane" value={String(items.length - usedCount)} hint="czekają na arkusz" />
        <StatTile
          label="Bez linii cięcia"
          value={String(withoutCut)}
          hint={withoutCut ? "ustawisz na arkuszu albo tutaj" : "wszystkie mają ustawienia"}
        />
      </div>

      <Card>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
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
                placeholder="Szukaj po nazwie…"
                aria-label="Szukaj naklejki"
                className="h-11 w-full rounded-xl border border-slate-300 dark:border-white/20 bg-background pl-10 pr-4 text-sm font-semibold focus-visible:outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20"
              />
            </div>
            <label className="inline-flex items-center justify-center gap-2 rounded-xl text-sm font-bold bg-primary text-primary-foreground hover:bg-primary/95 active:scale-[0.98] h-11 px-5 shadow-sm transition-all cursor-pointer shrink-0">
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept={FILE_ACCEPT}
                className="hidden"
                onChange={(event) => {
                  const files = Array.from(event.target.files ?? []);
                  event.target.value = "";
                  void queueFiles(files);
                }}
              />
              <ImagePlus className="w-4 h-4" aria-hidden />
              Dodaj naklejki
            </label>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <select
              className={selectClass}
              value={cutFilter}
              onChange={(event) => setCutFilter(event.target.value as CutLineType | "")}
              aria-label="Linia cięcia"
            >
              <option value="">Linia cięcia: wszystkie</option>
              {(Object.keys(CUT_LINE_LABELS) as CutLineType[]).map((type) => (
                <option key={type} value={type}>
                  {type === "none" ? "Bez linii cięcia" : CUT_LINE_LABELS[type]}
                </option>
              ))}
            </select>
            <select
              className={selectClass}
              value={usage}
              onChange={(event) => setUsage(event.target.value as Usage)}
              aria-label="Użycie"
            >
              <option value="">Użycie: wszystkie</option>
              <option value="used">Na arkuszach</option>
              <option value="unused">Nieużywane</option>
            </select>
            <select
              className={selectClass}
              value={sort}
              onChange={(event) => setSort(event.target.value as Sort)}
              aria-label="Kolejność"
            >
              <option value="recent">Ostatnio użyte</option>
              <option value="newest">Najnowsze</option>
              <option value="name">Nazwa A–Z</option>
            </select>
          </div>

          {activeFilters > 0 && (
            <button
              type="button"
              onClick={() => {
                setQuery("");
                setCutFilter("");
                setUsage("");
              }}
              className="self-start inline-flex items-center gap-1.5 text-sm font-bold text-muted-foreground hover:text-destructive transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" aria-hidden />
              Wyczyść filtry ({activeFilters})
            </button>
          )}
        </div>
      </Card>

      <Card title={`Naklejki (${results.length})`}>
        {items.length === 0 ? (
          <div className="flex flex-col items-center text-center gap-3 py-12">
            <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
              <Library className="w-7 h-7 text-primary" aria-hidden />
            </div>
            <p className="text-lg font-extrabold text-foreground">Baza jest pusta</p>
            <p className="text-sm font-medium text-muted-foreground max-w-md">
              Dodaj grafiki tutaj albo prosto na arkuszu w edytorze — każda naklejka położona na
              arkuszu trafia do bazy sama.
            </p>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="mt-2 inline-flex items-center gap-2 rounded-xl text-sm font-bold bg-primary text-primary-foreground hover:bg-primary/95 active:scale-[0.98] h-11 px-5 shadow-sm transition-all cursor-pointer"
            >
              <ImagePlus className="w-4 h-4" aria-hidden />
              Dodaj pierwsze naklejki
            </button>
          </div>
        ) : results.length === 0 ? (
          <p className="text-sm font-medium text-muted-foreground py-8 text-center">
            Brak naklejek dla wybranych filtrów.
          </p>
        ) : (
          <>
            <ul className="grid grid-cols-2 min-[520px]:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
              {results.slice(0, limit).map((item) => {
                const sheets = usedIn[item.id] ?? [];
                return (
                  <li key={item.id}>
                    <button
                      type="button"
                      onClick={() => setEditing(item)}
                      className="w-full h-full flex flex-col gap-2 rounded-2xl border border-border/60 bg-card p-2 text-left transition-all hover:border-primary/50 hover:shadow-sm cursor-pointer"
                    >
                      <StickerThumb sticker={item} className="aspect-square w-full p-2" />
                      <div className="px-1 pb-1 min-w-0">
                        <p className="text-sm font-extrabold text-foreground leading-snug line-clamp-2 break-words">
                          {item.name}
                        </p>
                        <p
                          className={`text-[11px] font-bold mt-0.5 ${
                            item.cutLineType === "none" ? "text-destructive" : "text-primary"
                          }`}
                        >
                          {item.cutLineType === "none"
                            ? "Bez linii cięcia"
                            : CUT_LINE_LABELS[item.cutLineType]}{" "}
                          · {String(item.widthCm).replace(".", ",")} cm
                        </p>
                        <p className="text-[11px] font-semibold text-muted-foreground mt-0.5">
                          {sheets.length > 0
                            ? `na ${sheets.length} ${sheetsNoun(sheets.length)}`
                            : "nieużywana"}{" "}
                          · {formatDateTime(item.lastUsedAt).split(",")[0]}
                        </p>
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
            {results.length > limit && (
              <button
                type="button"
                onClick={() => setLimit((value) => value + PAGE)}
                className="mt-4 w-full h-11 rounded-xl border border-border/70 bg-card text-sm font-bold text-foreground hover:bg-muted/50 transition-colors cursor-pointer"
              >
                Pokaż więcej ({results.length - limit})
              </button>
            )}
          </>
        )}
      </Card>

      <AnimatePresence>
        {editing && (
          <LibraryStickerDialog
            key={editing.id}
            sticker={editing}
            usedIn={usedIn[editing.id] ?? []}
            onClose={() => setEditing(null)}
            onSaved={(updated) => {
              setItems((current) => current.map((item) => (item.id === updated.id ? updated : item)));
              setEditing(null);
              setNotice("Zapisano zmiany naklejki.");
            }}
            onDeleted={(id) => {
              setItems((current) => current.filter((item) => item.id !== id));
              setEditing(null);
              setNotice("Naklejka usunięta z bazy.");
            }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {pending.length > 0 && pdfQueue.length === 0 && (
          <AddStickersDialog
            items={pending}
            onChange={setPending}
            onClose={() => setPending([])}
            onAdded={handleAdded}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {pdfQueue[0] && (
          <PdfImportModal
            key={`${pdfQueue[0].name}-${pdfQueue[0].size}-${pdfQueue.length}`}
            file={pdfQueue[0]}
            onAdd={(pages) => queuePdfPages(pdfQueue[0].name, pages)}
            onError={setError}
            onClose={() => setPdfQueue((queue) => queue.slice(1))}
          />
        )}
      </AnimatePresence>
    </>
  );
}
