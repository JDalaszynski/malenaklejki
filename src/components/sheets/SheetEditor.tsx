"use client";

import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import dynamic from "next/dynamic";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertTriangle,
  CheckCircle2,
  Download,
  Edit3,
  Eye,
  ImagePlus,
  Library,
  Loader2,
  Maximize2,
  Minimize2,
  MousePointerClick,
  Plus,
  Rocket,
  Save,
  Trash2,
  UploadCloud,
} from "lucide-react";

import { Card } from "@/components/admin/AdminLayout";
import { StatusPill } from "@/components/account/StatusPill";
import { NewA4Visualizer } from "@/components/creator/NewA4Visualizer";
import {
  markLibraryStickersUsed,
  saveSheet,
  updateLibrarySticker,
} from "@/app/actions/sheets";
import { describePublishBlockers, getSheetIssues } from "@/lib/creator/sheetOps";
import { renderRealisticSheet, renderSheetCanvas } from "@/lib/creator/renderSheet";
import { compactSticker } from "@/lib/orders/layoutFormat";
import {
  DEFAULT_STICKER_WIDTH_CM,
  MAX_CATEGORY_NAME,
  MAX_SHEET_NAME,
  SHEET_STATUS_LABELS,
  stickerNameFromFile,
  type LibrarySticker,
  type SheetStatus,
} from "@/lib/sheets/types";
import { MAX_IMAGE_BYTES, addBlobToLibrary, addUrlToLibrary } from "@/lib/sheets/upload";
import { getPdfStickerWidthCm, isPdfFile, MAX_PDF_BYTES, type RenderedPdfPage } from "@/lib/utils/pdf";
import { getStickersNoun } from "@/lib/utils/polish";
import { getRenderImageUrl } from "@/lib/utils/transparentBackground";
import type { PlacedSticker } from "@/types/creator";
import { LibraryPicker } from "./LibraryPicker";
import { SelectedStickerPanel } from "./SelectedStickerPanel";
import { useSheetEditor, type NewStickerInput } from "./useSheetEditor";

const A4Visualizer3D = dynamic(
  () => import("@/components/creator/A4Visualizer3D").then((mod) => ({ default: mod.A4Visualizer3D })),
  {
    ssr: false,
    loading: () => <div className="w-full aspect-[210/297] rounded-2xl bg-muted animate-pulse" />,
  }
);
const StickerEditModal = dynamic(
  () => import("@/components/creator/StickerEditModal").then((mod) => ({ default: mod.StickerEditModal })),
  { ssr: false }
);
const PdfImportModal = dynamic(
  () => import("@/components/creator/PdfImportModal").then((mod) => ({ default: mod.PdfImportModal })),
  { ssr: false }
);

const STICKER_FILE_ACCEPT =
  "image/png, image/jpeg, image/jpg, image/webp, application/pdf, .png, .jpg, .jpeg, .webp, .pdf";

/** Szerokość podglądu zapisywanego z arkuszem — lista w panelu, docelowo karta w sklepie. */
const PREVIEW_WIDTH_PX = 720;

/**
 * Szerokość arkusza w widoku „Cały arkusz": tyle, żeby A4 w pionie zmieściło
 * się pod paskiem zapisu z odstępem 0,75 rem u góry, pod paskiem i na dole.
 * `--toolbar-h` ustawia pomiar paska — zawija się na węższych ekranach.
 */
const FIT_SHEET_MAX_WIDTH = "max(22rem, calc((100dvh - var(--toolbar-h, 3.75rem) - 2.25rem) * 0.7071))";

type SheetZoom = "fit" | "wide";
const ZOOM_STORAGE_KEY = "mn-arkusz-powiekszenie";
const zoomListeners = new Set<() => void>();
let zoomInMemory: SheetZoom | null = null;

function readZoom(): SheetZoom {
  if (zoomInMemory) return zoomInMemory;
  try {
    return window.localStorage.getItem(ZOOM_STORAGE_KEY) === "wide" ? "wide" : "fit";
  } catch {
    return "fit";
  }
}

/**
 * Wybrany rozmiar arkusza — zapamiętany w przeglądarce, bo to wygoda jednej
 * osoby przy jednym ekranie. Serwer zawsze renderuje „Cały arkusz".
 */
function useSheetZoom(): [SheetZoom, (zoom: SheetZoom) => void] {
  const zoom = useSyncExternalStore(
    (onChange) => {
      zoomListeners.add(onChange);
      return () => zoomListeners.delete(onChange);
    },
    readZoom,
    () => "fit" as const
  );
  const setZoom = useCallback((next: SheetZoom) => {
    zoomInMemory = next;
    try {
      window.localStorage.setItem(ZOOM_STORAGE_KEY, next);
    } catch {
      // Tryb prywatny — wybór przetrwa do przeładowania strony.
    }
    zoomListeners.forEach((listener) => listener());
  }, []);
  return [zoom, setZoom];
}

export type SheetEditorProps = {
  sheet: {
    id: string | null;
    name: string;
    category: string;
    status: SheetStatus;
    updatedAt: string | null;
  };
  initialStickers: PlacedSticker[];
  library: LibrarySticker[];
  categories: string[];
};

/** Odcisk stanu do wykrywania niezapisanych zmian — bez wielokątów, które liczą się w tle. */
function signatureOf(name: string, category: string, stickers: PlacedSticker[]): string {
  return JSON.stringify([
    name.trim(),
    category.trim(),
    stickers.map((s) => [
      s.id,
      s.imageUrl,
      Math.round(s.x * 100),
      Math.round(s.y * 100),
      s.widthCm,
      s.heightCm,
      s.cutLineType,
      s.rotation || 0,
      s.libraryId ?? "",
    ]),
  ]);
}

function isTyping(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  return (
    target instanceof HTMLInputElement ||
    target instanceof HTMLTextAreaElement ||
    target instanceof HTMLSelectElement ||
    target.isContentEditable
  );
}

function downloadBlob(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function fileSlug(name: string): string {
  return (
    name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .replace(/ł/g, "l")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 60) || "arkusz"
  );
}

export function SheetEditor({ sheet, initialStickers, library: initialLibrary, categories }: SheetEditorProps) {
  const editor = useSheetEditor(initialStickers);
  const {
    stickers,
    selectedSticker,
    selectedStickerId,
    setSelectedStickerId,
    error,
    setError,
  } = editor;

  const [sheetId, setSheetId] = useState(sheet.id);
  const [name, setName] = useState(sheet.name);
  const [category, setCategory] = useState(sheet.category);
  const [status, setStatus] = useState<SheetStatus>(sheet.status);
  const [updatedAt, setUpdatedAt] = useState(sheet.updatedAt);
  const [library, setLibrary] = useState(initialLibrary);

  const [savedSignature, setSavedSignature] = useState(() =>
    signatureOf(sheet.name, sheet.category, initialStickers)
  );
  const [saving, setSaving] = useState<SheetStatus | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  // Powody blokady publikacji pokazujemy tylko dla stanu, którego dotyczą —
  // każda poprawka arkusza albo kategorii je chowa.
  const [blockersFor, setBlockersFor] = useState<{ signature: string; reasons: string[] } | null>(
    null
  );

  const [visualizerMode, setVisualizerMode] = useState<"2d" | "3d">("2d");
  const [addTab, setAddTab] = useState<"library" | "file">(
    initialLibrary.length > 0 ? "library" : "file"
  );
  const [editingStickerId, setEditingStickerId] = useState<string | null>(null);
  const [pdfQueue, setPdfQueue] = useState<File[]>([]);
  const [uploadProgress, setUploadProgress] = useState<{ done: number; total: number } | null>(null);
  const [libraryBusy, setLibraryBusy] = useState(false);
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const nameInputRef = useRef<HTMLInputElement>(null);
  const [zoom, setZoom] = useSheetZoom();
  const sheetAreaRef = useRef<HTMLDivElement>(null);
  const toolbarRef = useRef<HTMLDivElement>(null);

  // Wysokość paska zapisu zmienia się (zawijanie, lista powodów blokady),
  // a od niej zależy, jak duży może być arkusz w widoku „Cały arkusz".
  useEffect(() => {
    const toolbar = toolbarRef.current;
    const area = sheetAreaRef.current;
    if (!toolbar || !area) return;
    const update = () => area.style.setProperty("--toolbar-h", `${toolbar.offsetHeight}px`);
    update();
    const observer = new ResizeObserver(update);
    observer.observe(toolbar);
    return () => observer.disconnect();
  }, []);

  const libraryById = useMemo(() => new Map(library.map((item) => [item.id, item])), [library]);
  const countsOnSheet = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const st of stickers) {
      if (st.libraryId) counts[st.libraryId] = (counts[st.libraryId] ?? 0) + 1;
    }
    return counts;
  }, [stickers]);

  const signature = useMemo(() => signatureOf(name, category, stickers), [name, category, stickers]);
  const hasChanges = signature !== savedSignature;
  const blockers = blockersFor?.signature === signature ? blockersFor.reasons : [];
  const setBlockers = (reasons: string[]) =>
    setBlockersFor(reasons.length > 0 ? { signature, reasons } : null);
  const issues = useMemo(() => getSheetIssues(stickers), [stickers]);
  const issueCount = new Set([...issues.noCutLine, ...issues.outside, ...issues.overlapping]).size;

  useEffect(() => {
    if (!notice) return;
    const timer = setTimeout(() => setNotice(null), 3500);
    return () => clearTimeout(timer);
  }, [notice]);

  /* -------------------------------------------------------------- */
  /* Baza naklejek                                                   */
  /* -------------------------------------------------------------- */

  const upsertLibrary = useCallback((item: LibrarySticker) => {
    setLibrary((current) => [item, ...current.filter((existing) => existing.id !== item.id)]);
  }, []);

  const pickFromLibrary = async (item: LibrarySticker) => {
    const now = new Date().toISOString();
    setLibrary((current) =>
      current.map((existing) => (existing.id === item.id ? { ...existing, lastUsedAt: now } : existing))
    );
    await editor.addStickers([
      {
        imageUrl: item.imageUrl,
        aspectRatio: item.aspectRatio,
        widthCm: item.widthCm,
        cutLineType: item.cutLineType,
        libraryId: item.id,
      },
    ]);
    // Kolejność w bazie to wygoda, nie dane — porażka niczego nie psuje.
    markLibraryStickersUsed([item.id]).catch(() => undefined);
  };

  const uploadFiles = async (files: File[]) => {
    if (files.length === 0) return;
    setError(null);

    const pdfs = files.filter(isPdfFile);
    const images = files.filter((file) => !isPdfFile(file));

    const tooBigPdf = pdfs.find((file) => file.size > MAX_PDF_BYTES);
    if (tooBigPdf) setError(`Plik „${tooBigPdf.name}" jest za duży (maksymalnie 50 MB).`);
    const acceptedPdfs = pdfs.filter((file) => file.size <= MAX_PDF_BYTES);

    const problems: string[] = [];
    const inputs: NewStickerInput[] = [];
    const reused: string[] = [];

    if (images.length > 0) {
      setUploadProgress({ done: 0, total: images.length });
      for (const [index, file] of images.entries()) {
        if (!file.type.startsWith("image/")) {
          problems.push(`„${file.name}" to nie grafika (JPG, PNG, WEBP) ani PDF.`);
        } else if (file.size > MAX_IMAGE_BYTES) {
          problems.push(`„${file.name}" jest za duży (maksymalnie 10 MB).`);
        } else {
          const result = await addBlobToLibrary({
            blob: file,
            fileName: file.name || "naklejka.png",
            name: stickerNameFromFile(file.name || "Naklejka"),
            cutLineType: "none",
            widthCm: DEFAULT_STICKER_WIDTH_CM,
          });
          if (result.ok) {
            upsertLibrary(result.sticker);
            if (result.existing) reused.push(result.sticker.name);
            inputs.push({
              imageUrl: result.sticker.imageUrl,
              aspectRatio: result.sticker.aspectRatio,
              widthCm: result.sticker.widthCm,
              cutLineType: result.sticker.cutLineType,
              libraryId: result.sticker.id,
            });
          } else {
            problems.push(result.error);
          }
        }
        setUploadProgress({ done: index + 1, total: images.length });
      }
      setUploadProgress(null);
    }

    if (inputs.length > 0) await editor.addStickers(inputs);
    if (problems.length > 0) setError(problems.join(" "));
    else if (reused.length > 0) {
      setNotice(
        reused.length === 1
          ? `„${reused[0]}" była już w bazie — użyto istniejącej naklejki.`
          : `${reused.length} grafiki były już w bazie — użyto istniejących naklejek.`
      );
    }
    if (acceptedPdfs.length > 0) setPdfQueue((queue) => [...queue, ...acceptedPdfs]);
  };

  // Każda strona PDF to osobna naklejka w fizycznym rozmiarze z projektu.
  const addPdfPages = async (fileName: string, pages: RenderedPdfPage[]) => {
    const baseName = fileName.replace(/\.pdf$/i, "");
    const inputs: NewStickerInput[] = [];
    const problems: string[] = [];

    setUploadProgress({ done: 0, total: pages.length });
    for (const [index, page] of pages.entries()) {
      const widthCm = getPdfStickerWidthCm(page.widthCm, page.heightCm);
      const result = await addBlobToLibrary({
        blob: page.blob,
        fileName: `${baseName}-strona-${page.pageNumber}.png`,
        name:
          pages.length > 1 || page.pageNumber > 1
            ? `${stickerNameFromFile(baseName)} – str. ${page.pageNumber}`
            : stickerNameFromFile(baseName),
        cutLineType: "none",
        widthCm,
      });
      if (result.ok) {
        upsertLibrary(result.sticker);
        inputs.push({
          imageUrl: result.sticker.imageUrl,
          aspectRatio: result.sticker.aspectRatio,
          widthCm,
          cutLineType: result.sticker.cutLineType,
          libraryId: result.sticker.id,
        });
      } else {
        problems.push(result.error);
      }
      setUploadProgress({ done: index + 1, total: pages.length });
    }
    setUploadProgress(null);

    await editor.addStickers(inputs);
    if (problems.length > 0) setError(problems.join(" "));
  };

  const renameLibraryItem = async (item: LibrarySticker, newName: string) => {
    setLibraryBusy(true);
    const result = await updateLibrarySticker({ id: item.id, name: newName });
    setLibraryBusy(false);
    if (!result.success) {
      setError(result.error);
      return;
    }
    setLibrary((current) =>
      current.map((existing) => (existing.id === item.id ? { ...existing, name: newName } : existing))
    );
    setNotice("Nazwa naklejki zapisana w bazie.");
  };

  const saveDefaultsToLibrary = async (sticker: PlacedSticker, item: LibrarySticker) => {
    setLibraryBusy(true);
    const result = await updateLibrarySticker({
      id: item.id,
      cutLineType: sticker.cutLineType,
      widthCm: sticker.widthCm,
    });
    setLibraryBusy(false);
    if (!result.success) {
      setError(result.error);
      return;
    }
    setLibrary((current) =>
      current.map((existing) =>
        existing.id === item.id
          ? { ...existing, cutLineType: sticker.cutLineType, widthCm: sticker.widthCm }
          : existing
      )
    );
    setNotice("Ustawienia zapisane w bazie — tak naklejka przyjdzie następnym razem.");
  };

  /** Naklejka spoza bazy (np. usunięta z niej po ułożeniu arkusza) wraca do bazy. */
  const linkToLibrary = async (sticker: PlacedSticker, name: string) => {
    setLibraryBusy(true);
    const result = await addUrlToLibrary({
      imageUrl: sticker.imageUrl,
      name,
      cutLineType: sticker.cutLineType,
      widthCm: sticker.widthCm,
    });
    setLibraryBusy(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    upsertLibrary(result.sticker);
    // Wszystkie kopie tej grafiki na arkuszu to ta sama pozycja bazy.
    editor.setStickers((current) =>
      current.map((st) => (st.imageUrl === sticker.imageUrl ? { ...st, libraryId: result.sticker.id } : st))
    );
  };

  /* -------------------------------------------------------------- */
  /* Kadrowanie i pobieranie                                         */
  /* -------------------------------------------------------------- */

  const editingSticker = stickers.find((st) => st.id === editingStickerId) ?? null;

  const handleEditSaved = async (newUrl: string) => {
    const sticker = editingSticker;
    setEditingStickerId(null);
    if (!sticker) return;

    const previousName = sticker.libraryId ? libraryById.get(sticker.libraryId)?.name : undefined;
    await editor.replaceImage(sticker.id, newUrl);

    // Przerobiona grafika to nowa naklejka — oryginał zostaje w bazie
    // nietknięty, bo może leżeć na innych arkuszach.
    const result = await addUrlToLibrary({
      imageUrl: newUrl,
      name: `${previousName ?? "Naklejka"} (edycja)`.slice(0, 120),
      cutLineType: sticker.cutLineType,
      widthCm: sticker.widthCm,
    });
    if (result.ok) {
      upsertLibrary(result.sticker);
      editor.updateSticker(sticker.id, { libraryId: result.sticker.id });
    } else {
      setError(`Grafika podmieniona, ale nie trafiła do bazy: ${result.error}`);
    }
  };

  const downloadSelected = async () => {
    if (!selectedSticker) return;
    try {
      const renderUrl = await getRenderImageUrl(selectedSticker.imageUrl, selectedSticker.cutLineType);
      const response = await fetch(
        renderUrl.startsWith("blob:") || renderUrl.startsWith("data:")
          ? renderUrl
          : `/api/proxy-image?url=${encodeURIComponent(renderUrl)}`
      );
      if (!response.ok) throw new Error("proxy");
      const itemName = selectedSticker.libraryId
        ? libraryById.get(selectedSticker.libraryId)?.name
        : undefined;
      downloadBlob(await response.blob(), `${fileSlug(itemName ?? "naklejka")}.png`);
    } catch (err) {
      console.error(err);
      setError("Nie udało się pobrać pliku naklejki.");
    }
  };

  const downloadSheet = async (mode: "print" | "cut-lines") => {
    if (stickers.length === 0) return;
    setIsExporting(true);
    try {
      const ready = await editor.withContours();
      const canvas = await renderSheetCanvas(ready, mode);
      const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/png"));
      if (!blob) throw new Error("canvas");
      const suffix = mode === "print" ? "DRUK" : "LINIE_CIECIA";
      downloadBlob(blob, `${fileSlug(name)}-A4-${suffix}.png`);
    } catch (err) {
      console.error(err);
      setError("Nie udało się wygenerować pliku PNG.");
    } finally {
      setIsExporting(false);
    }
  };

  /* -------------------------------------------------------------- */
  /* Zapis                                                           */
  /* -------------------------------------------------------------- */

  const save = async (target: SheetStatus, force = false) => {
    if (saving) return;
    setError(null);
    setBlockers([]);

    const trimmedName = name.trim();
    if (!trimmedName) {
      setError("Podaj nazwę arkusza.");
      nameInputRef.current?.focus();
      return;
    }

    if (target === "published") {
      const reasons = describePublishBlockers(stickers);
      if (!category.trim()) reasons.unshift("Wybierz kategorię arkusza.");
      if (reasons.length > 0) {
        setBlockers(reasons);
        const found = getSheetIssues(stickers);
        editor.flagStickers([...found.noCutLine, ...found.outside, ...found.overlapping]);
        setError("Arkusza nie da się jeszcze opublikować — popraw zaznaczone naklejki.");
        return;
      }
    }

    const publishedBefore = status === "published";
    setSaving(target);
    try {
      const ready = await editor.withContours();

      let preview: string | null = null;
      try {
        const canvas = await renderRealisticSheet(ready, PREVIEW_WIDTH_PX);
        preview = canvas.toDataURL("image/jpeg", 0.86);
      } catch (err) {
        // Arkusz zapisze się i bez odświeżonej miniatury.
        console.warn("Podgląd arkusza:", err);
      }

      const result = await saveSheet({
        id: sheetId,
        name: trimmedName,
        category: category.trim(),
        status: target,
        stickers: ready.map(compactSticker),
        preview,
        expectedUpdatedAt: updatedAt,
        force,
      });

      if (!result.success) {
        if (result.conflict) {
          if (
            window.confirm(
              `${result.error}\n\nNadpisać tamtą wersję tym, co widzisz teraz na ekranie?`
            )
          ) {
            setSaving(null);
            await save(target, true);
            return;
          }
          setError(`${result.error} Odśwież stronę, żeby zobaczyć aktualną wersję.`);
        } else {
          setError(result.error);
          if (result.blockers) setBlockers(result.blockers);
        }
        return;
      }

      const isNew = !sheetId;
      setSheetId(result.id);
      setUpdatedAt(result.updatedAt);
      setStatus(result.status);
      setName(trimmedName);
      setSavedSignature(signatureOf(trimmedName, category, ready));

      // Serwer uzupełnia bazę o linie cięcia wybrane dopiero na arkuszu.
      const cutByLibraryId = new Map<string, PlacedSticker>();
      for (const st of ready) {
        if (st.libraryId && st.cutLineType !== "none") cutByLibraryId.set(st.libraryId, st);
      }
      setLibrary((current) =>
        current.map((item) => {
          const st = cutByLibraryId.get(item.id);
          return item.cutLineType === "none" && st
            ? { ...item, cutLineType: st.cutLineType, widthCm: st.widthCm }
            : item;
        })
      );

      if (isNew) {
        // Bez przeładowania: edytor zostaje z całym stanem, zmienia się tylko adres.
        window.history.replaceState(null, "", `/admin/arkusze/${result.id}`);
      }
      setNotice(
        target === "published"
          ? publishedBefore
            ? "Zmiany opublikowane."
            : "Arkusz opublikowany."
          : publishedBefore
            ? "Arkusz zdjęty ze sklepu i zapisany jako szkic."
            : "Szkic zapisany."
      );
    } catch (err) {
      console.error(err);
      setError("Nie udało się zapisać arkusza. Spróbuj ponownie.");
    } finally {
      setSaving(null);
    }
  };

  // Aktualna wersja `save` dla nasłuchów rejestrowanych raz.
  const saveRef = useRef(save);
  useEffect(() => {
    saveRef.current = save;
  });

  /* -------------------------------------------------------------- */
  /* Niezapisane zmiany                                              */
  /* -------------------------------------------------------------- */

  const dirtyRef = useRef(hasChanges);
  useEffect(() => {
    dirtyRef.current = hasChanges && !saving;
  }, [hasChanges, saving]);

  useEffect(() => {
    const onBeforeUnload = (event: BeforeUnloadEvent) => {
      if (!dirtyRef.current) return;
      event.preventDefault();
      event.returnValue = "";
    };

    // Linki Next.js nie przeładowują strony, więc `beforeunload` ich nie łapie.
    const onClick = (event: MouseEvent) => {
      if (!dirtyRef.current || event.defaultPrevented || event.button !== 0) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const anchor = (event.target as HTMLElement | null)?.closest?.("a[href]");
      if (!(anchor instanceof HTMLAnchorElement) || anchor.target === "_blank") return;
      if (anchor.origin !== window.location.origin) return;
      if (!window.confirm("Masz niezapisane zmiany w arkuszu. Wyjść bez zapisywania?")) {
        event.preventDefault();
        event.stopPropagation();
      }
    };

    window.addEventListener("beforeunload", onBeforeUnload);
    document.addEventListener("click", onClick, true);
    return () => {
      window.removeEventListener("beforeunload", onBeforeUnload);
      document.removeEventListener("click", onClick, true);
    };
  }, []);

  /* -------------------------------------------------------------- */
  /* Klawiatura i schowek                                            */
  /* -------------------------------------------------------------- */

  const statusRef = useRef(status);
  useEffect(() => {
    statusRef.current = status;
  }, [status]);

  const editorRef = useRef(editor);
  useEffect(() => {
    editorRef.current = editor;
  });

  // Delete i strzałki nie mogą ruszać arkusza pod otwartym oknem kadrowania czy PDF.
  const modalOpenRef = useRef(false);
  useEffect(() => {
    modalOpenRef.current = editingStickerId !== null || pdfQueue.length > 0;
  }, [editingStickerId, pdfQueue.length]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const mod = event.metaKey || event.ctrlKey;

      if (mod && event.key.toLowerCase() === "s") {
        event.preventDefault();
        void saveRef.current(statusRef.current);
        return;
      }
      if (isTyping(event.target) || modalOpenRef.current) return;

      const current = editorRef.current;
      if (!current.selectedStickerId) return;

      if (mod && event.key.toLowerCase() === "d") {
        event.preventDefault();
        current.duplicateSelected();
      } else if (event.key === "Delete" || event.key === "Backspace") {
        event.preventDefault();
        current.deleteSelected();
      } else if (event.key === "Escape") {
        current.setSelectedStickerId(null);
      } else if (event.key.startsWith("Arrow")) {
        event.preventDefault();
        const step = event.shiftKey ? 5 : 1;
        const dx = event.key === "ArrowLeft" ? -step : event.key === "ArrowRight" ? step : 0;
        const dy = event.key === "ArrowUp" ? -step : event.key === "ArrowDown" ? step : 0;
        current.nudgeSelected(dx, dy);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const uploadRef = useRef(uploadFiles);
  useEffect(() => {
    uploadRef.current = uploadFiles;
  });

  useEffect(() => {
    const onPaste = (event: ClipboardEvent) => {
      if (isTyping(event.target)) return;
      const files = Array.from(event.clipboardData?.items ?? [])
        .filter((item) => item.type.startsWith("image/"))
        .map((item) => item.getAsFile())
        .filter((file): file is File => !!file);
      if (files.length === 0) return;
      event.preventDefault();
      void uploadRef.current(files);
    };
    window.addEventListener("paste", onPaste);
    return () => window.removeEventListener("paste", onPaste);
  }, []);

  /* -------------------------------------------------------------- */
  /* Widok                                                           */
  /* -------------------------------------------------------------- */

  const selectedLibraryItem = selectedSticker?.libraryId
    ? libraryById.get(selectedSticker.libraryId)
    : undefined;
  const busy = editor.isPlacing || uploadProgress !== null;
  const wasPublished = status === "published";

  return (
    <div className="flex flex-col gap-6">
      {/* Komunikaty — jak w kreatorze, tylko przy dolnej krawędzi */}
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

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Lewa kolumna: dane arkusza, dodawanie naklejek, wybrana naklejka.
            Stała szerokość — resztę ekranu dostaje arkusz. */}
        <div className="lg:w-[22rem] xl:w-[24rem] shrink-0 flex flex-col gap-6 order-2 lg:order-1">
          <Card title="Arkusz">
            <div className="flex flex-col gap-4">
              <div>
                <label htmlFor="sheet-name" className="text-sm font-bold text-foreground">
                  Nazwa arkusza
                </label>
                <input
                  id="sheet-name"
                  ref={nameInputRef}
                  value={name}
                  maxLength={MAX_SHEET_NAME}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="np. Koty w kosmosie"
                  className="mt-1.5 h-11 w-full rounded-xl border border-slate-300 dark:border-white/20 bg-background px-3.5 text-sm font-semibold focus-visible:outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20"
                />
              </div>
              <div>
                <label htmlFor="sheet-category" className="text-sm font-bold text-foreground">
                  Kategoria
                </label>
                <input
                  id="sheet-category"
                  value={category}
                  maxLength={MAX_CATEGORY_NAME}
                  onChange={(event) => setCategory(event.target.value)}
                  list="sheet-categories"
                  placeholder="np. Zwierzęta"
                  className="mt-1.5 h-11 w-full rounded-xl border border-slate-300 dark:border-white/20 bg-background px-3.5 text-sm font-semibold focus-visible:outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20"
                />
                <datalist id="sheet-categories">
                  {categories.map((item) => (
                    <option key={item} value={item} />
                  ))}
                </datalist>
                {categories.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {categories.slice(0, 12).map((item) => (
                      <button
                        key={item}
                        type="button"
                        onClick={() => setCategory(item)}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-colors cursor-pointer ${
                          category.trim() === item
                            ? "bg-primary/10 border-primary/40 text-primary"
                            : "bg-muted/40 border-transparent text-muted-foreground hover:text-foreground hover:bg-muted"
                        }`}
                      >
                        {item}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {stickers.length > 0 && (
              <div className="mt-4 pt-3 border-t border-border/50 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs font-semibold text-muted-foreground">
                <button
                  type="button"
                  onClick={() => void downloadSheet("print")}
                  disabled={isExporting}
                  className="inline-flex items-center gap-1 hover:text-foreground transition-colors cursor-pointer disabled:opacity-50"
                >
                  {isExporting ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" aria-hidden />
                  ) : (
                    <Download className="w-3.5 h-3.5" aria-hidden />
                  )}
                  PNG do druku
                </button>
                <button
                  type="button"
                  onClick={() => void downloadSheet("cut-lines")}
                  disabled={isExporting}
                  className="inline-flex items-center gap-1 hover:text-foreground transition-colors cursor-pointer disabled:opacity-50"
                >
                  <Download className="w-3.5 h-3.5" aria-hidden />
                  PNG linii cięcia
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm("Usunąć wszystkie naklejki z arkusza?")) editor.clearSheet();
                  }}
                  className="inline-flex items-center gap-1 hover:text-destructive transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" aria-hidden />
                  Wyczyść arkusz
                </button>
              </div>
            )}
          </Card>

          <Card title="Dodaj naklejki">
            <div className="flex bg-[#004749]/5 dark:bg-[#002224] p-1 rounded-2xl border border-[#004749]/10 dark:border-white/10 gap-1 mb-4">
              {(
                [
                  { key: "library", label: `Z bazy (${library.length})`, icon: Library },
                  { key: "file", label: "Z pliku", icon: ImagePlus },
                ] as const
              ).map(({ key, label, icon: Icon }) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setAddTab(key)}
                  className={`flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-black rounded-xl transition-all cursor-pointer ${
                    addTab === key
                      ? "bg-white dark:bg-[#004749] text-[#004749] dark:text-white shadow-[0_3px_10px_rgba(0,71,73,0.12)]"
                      : "text-muted-foreground/80 hover:text-foreground"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" aria-hidden />
                  {label}
                </button>
              ))}
            </div>

            {addTab === "library" ? (
              <LibraryPicker
                library={library}
                countsOnSheet={countsOnSheet}
                onPick={pickFromLibrary}
                disabled={busy}
              />
            ) : (
              <div className="flex flex-col gap-3">
                <label className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-foreground/20 dark:border-foreground/30 hover:border-primary/45 rounded-2xl bg-muted/10 hover:bg-muted/30 transition-all cursor-pointer group">
                  <input
                    type="file"
                    multiple
                    accept={STICKER_FILE_ACCEPT}
                    className="hidden"
                    disabled={busy}
                    onChange={(event) => {
                      const files = Array.from(event.target.files ?? []);
                      event.target.value = "";
                      void uploadFiles(files);
                    }}
                  />
                  <ImagePlus className="w-8 h-8 text-muted-foreground group-hover:text-primary mb-2 opacity-75" />
                  <span className="text-sm font-bold text-foreground text-center">
                    Dodaj grafiki z dysku
                  </span>
                  <span className="text-[11px] font-semibold text-muted-foreground mt-0.5 text-center">
                    JPG, PNG, WEBP lub PDF · kilka naraz · można też wkleić (Ctrl+V) albo upuścić na
                    arkusz
                  </span>
                </label>
                <p className="text-[11px] font-medium text-muted-foreground">
                  Każda dodana grafika trafia do bazy naklejek pod nazwą pliku. Tę samą grafikę
                  wgraną drugi raz rozpoznajemy i bierzemy z bazy.
                </p>
              </div>
            )}
          </Card>

          {selectedSticker ? (
            <SelectedStickerPanel
              key={selectedSticker.id}
              sticker={selectedSticker}
              libraryItem={selectedLibraryItem}
              countOnSheet={selectedSticker.libraryId ? countsOnSheet[selectedSticker.libraryId] ?? 1 : 1}
              calculating={editor.isCalculatingContour}
              isFilling={editor.isFillingSheet}
              libraryBusy={libraryBusy}
              onEdit={() => setEditingStickerId(selectedSticker.id)}
              onDuplicate={editor.duplicateSelected}
              onFill={() => editor.fillWith()}
              onDownload={downloadSelected}
              onDelete={editor.deleteSelected}
              onWidthChange={editor.changeWidth}
              onRotationChange={editor.changeRotation}
              onCutLineChange={(type) => void editor.changeCutLine(type)}
              onRename={(newName) => selectedLibraryItem && renameLibraryItem(selectedLibraryItem, newName)}
              onSaveDefaults={() =>
                selectedLibraryItem && saveDefaultsToLibrary(selectedSticker, selectedLibraryItem)
              }
              onAddToLibrary={() => linkToLibrary(selectedSticker, "Naklejka z arkusza")}
            />
          ) : (
            <div className="bg-card border border-border/70 rounded-2xl p-6 text-center text-sm font-semibold text-muted-foreground flex flex-col items-center gap-2">
              <MousePointerClick className="w-5 h-5 text-primary" aria-hidden />
              {stickers.length === 0
                ? "Dodaj pierwszą naklejkę — z bazy albo z pliku."
                : "Kliknij naklejkę na arkuszu, żeby zmienić jej rozmiar, obrót albo linię cięcia."}
            </div>
          )}
        </div>

        {/* Prawa kolumna: pasek zapisu i arkusz */}
        <div
          className="relative flex-1 min-w-0 order-1 lg:order-2"
          onDragOver={(event) => {
            event.preventDefault();
            if (event.dataTransfer.types.includes("Files")) setIsDraggingOver(true);
          }}
          onDragLeave={(event) => {
            if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
              setIsDraggingOver(false);
            }
          }}
          onDrop={(event) => {
            event.preventDefault();
            setIsDraggingOver(false);
            void uploadFiles(Array.from(event.dataTransfer.files));
          }}
        >
          {isDraggingOver && (
            <div className="absolute inset-0 z-[60] bg-primary/20 backdrop-blur-md flex flex-col items-center justify-center border-4 border-dashed border-primary rounded-3xl pointer-events-none">
              <div className="bg-background/90 p-8 rounded-2xl shadow-xl flex flex-col items-center gap-3 text-center max-w-xs">
                <UploadCloud className="w-12 h-12 text-primary animate-bounce" aria-hidden />
                <p className="text-lg font-extrabold text-foreground">Upuść pliki tutaj</p>
                <p className="text-xs text-muted-foreground font-semibold">
                  Trafią na arkusz i do bazy naklejek
                </p>
              </div>
            </div>
          )}

          <div
            ref={sheetAreaRef}
            className={`flex flex-col gap-3 ${zoom === "fit" ? "lg:sticky lg:top-3" : ""}`}
          >
            <div
              ref={toolbarRef}
              className={`bg-card border border-border/70 rounded-2xl px-3 py-2.5 shadow-[0_8px_30px_rgba(0,0,0,0.04)] flex flex-col gap-2.5 ${
                zoom === "wide" ? "lg:sticky lg:top-3 z-[45]" : ""
              }`}
            >
              <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                <div className="flex items-center gap-2.5 mr-auto min-w-0">
                  <StatusPill tone={wasPublished ? "success" : "neutral"}>
                    {wasPublished && <Eye className="w-3.5 h-3.5" aria-hidden />}
                    {SHEET_STATUS_LABELS[status]}
                  </StatusPill>
                  <div className="leading-tight min-w-0">
                    {!sheetId ? (
                      <p className="text-xs font-bold text-muted-foreground">Jeszcze niezapisany</p>
                    ) : hasChanges ? (
                      <p className="text-xs font-bold text-[#8a6d00] dark:text-[#FFCD08]">
                        Niezapisane zmiany
                      </p>
                    ) : (
                      <p className="text-xs font-bold text-muted-foreground">Wszystko zapisane</p>
                    )}
                    <p className="text-[11px] font-semibold text-muted-foreground mt-0.5 whitespace-nowrap">
                      {stickers.length} {getStickersNoun(stickers.length)}
                      {editor.pendingContours > 0 && " · liczę obrysy…"}
                      {issueCount > 0 && (
                        <span className="text-destructive font-bold"> · do poprawy: {issueCount}</span>
                      )}
                    </p>
                  </div>
                </div>

                <div className="flex bg-[#004749]/5 dark:bg-[#002224] p-1 rounded-xl border border-[#004749]/10 dark:border-white/10 gap-1">
                  {(
                    [
                      { key: "2d", label: "Edycja", icon: Edit3 },
                      { key: "3d", label: "Wizualizacja", icon: Eye },
                    ] as const
                  ).map(({ key, label, icon: Icon }) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setVisualizerMode(key)}
                      aria-pressed={visualizerMode === key}
                      className={`px-3 py-1.5 text-xs font-black rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                        visualizerMode === key
                          ? "bg-white dark:bg-[#004749] text-[#004749] dark:text-white shadow-[0_3px_10px_rgba(0,71,73,0.12)]"
                          : "text-muted-foreground/80 hover:text-foreground"
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" aria-hidden />
                      {label}
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => setZoom(zoom === "fit" ? "wide" : "fit")}
                  aria-pressed={zoom === "wide"}
                  title={
                    zoom === "fit"
                      ? "Arkusz na całą szerokość — do dokładnego układania (przewija się stronę)"
                      : "Cały arkusz na ekranie naraz"
                  }
                  className="hidden lg:inline-flex items-center justify-center gap-1.5 rounded-xl text-xs font-black h-10 px-3 border border-slate-300 dark:border-white/20 bg-background hover:bg-slate-50 dark:hover:bg-white/5 transition-all active:scale-[0.98] cursor-pointer"
                >
                  {zoom === "fit" ? (
                    <Maximize2 className="w-4 h-4" aria-hidden />
                  ) : (
                    <Minimize2 className="w-4 h-4" aria-hidden />
                  )}
                  {zoom === "fit" ? "Powiększ" : "Cały arkusz"}
                </button>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => void save("draft")}
                    disabled={saving !== null || busy}
                    title={
                      wasPublished
                        ? "Zapisuje zmiany i zdejmuje arkusz ze sklepu"
                        : "Zapisuje arkusz bez publikowania (Ctrl+S)"
                    }
                    className="inline-flex items-center justify-center gap-2 rounded-xl text-sm font-bold h-10 px-4 border border-slate-300 dark:border-white/20 bg-background hover:bg-slate-50 dark:hover:bg-white/5 transition-all active:scale-[0.98] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {saving === "draft" ? (
                      <Loader2 className="w-4 h-4 animate-spin" aria-hidden />
                    ) : (
                      <Save className="w-4 h-4" aria-hidden />
                    )}
                    Zapisz jako szkic
                  </button>
                  <button
                    type="button"
                    onClick={() => void save("published")}
                    disabled={saving !== null || busy}
                    title={wasPublished ? "Zapisuje zmiany w opublikowanym arkuszu (Ctrl+S)" : undefined}
                    className="inline-flex items-center justify-center gap-2 rounded-xl text-sm font-bold h-10 px-4 bg-primary text-primary-foreground hover:bg-primary/95 shadow-sm transition-all active:scale-[0.98] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {saving === "published" ? (
                      <Loader2 className="w-4 h-4 animate-spin" aria-hidden />
                    ) : (
                      <Rocket className="w-4 h-4" aria-hidden />
                    )}
                    {wasPublished ? "Opublikuj zmiany" : "Opublikuj"}
                  </button>
                </div>
              </div>

              {wasPublished && hasChanges && (
                <p className="text-[11px] font-semibold text-muted-foreground">
                  Arkusz jest w sklepie. „Zapisz jako szkic” zdejmie go ze sklepu — zmiany w sklepie
                  zapisuje „Opublikuj zmiany”.
                </p>
              )}

              {blockers.length > 0 && (
                <div className="rounded-xl border border-destructive/30 bg-destructive/5 px-3 py-2.5">
                  <p className="text-xs font-extrabold text-destructive flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5" aria-hidden />
                    Przed publikacją:
                  </p>
                  <ul className="mt-1 text-xs font-semibold text-destructive/90 list-disc pl-5 space-y-0.5">
                    {blockers.map((reason) => (
                      <li key={reason}>{reason}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <div
              className="relative w-full mx-auto"
              // „Cały arkusz": arkusz wypełnia wysokość ekranu pod paskiem zapisu
              // (wysokość paska mierzy `--toolbar-h`), „Powiększ": całą kolumnę.
              style={zoom === "fit" ? { maxWidth: FIT_SHEET_MAX_WIDTH } : undefined}
            >
              <div className="relative w-full aspect-[210/297] flex items-center justify-center">
                {visualizerMode === "2d" ? (
                  <NewA4Visualizer
                    stickers={stickers}
                    selectedStickerId={selectedStickerId}
                    onSelectSticker={setSelectedStickerId}
                    onUpdateStickers={editor.setStickers}
                    onError={setError}
                    onEditSticker={() => selectedStickerId && setEditingStickerId(selectedStickerId)}
                    onDuplicateSticker={editor.duplicateSelected}
                    onFillSheet={() => editor.fillWith()}
                    onDeleteSticker={editor.deleteSelected}
                    onCutLineChange={(type) => void editor.changeCutLine(type)}
                    onRotationChange={editor.changeRotation}
                    isPresentationMode={false}
                    overlappingStickerIds={editor.highlightedIds}
                    deliveryForm="sheet"
                    isFillingSheet={editor.isFillingSheet}
                  />
                ) : (
                  <A4Visualizer3D stickers={stickers} deliveryForm="sheet" />
                )}

                {(busy || saving) && (
                  <div className="absolute inset-0 z-[55] flex flex-col items-center justify-center bg-background/60 backdrop-blur-[2px] rounded-lg">
                    <Loader2 className="w-10 h-10 text-primary animate-spin mb-3" aria-hidden />
                    <span className="text-[13px] font-black text-foreground uppercase tracking-wider">
                      {saving
                        ? "Zapisywanie arkusza…"
                        : uploadProgress
                          ? `Wgrywanie ${uploadProgress.done}/${uploadProgress.total}…`
                          : "Dodawanie na arkusz…"}
                    </span>
                  </div>
                )}

                {stickers.length === 0 && !busy && (
                  <label className="absolute inset-0 z-40 flex flex-col items-center justify-center cursor-pointer">
                    <input
                      type="file"
                      multiple
                      accept={STICKER_FILE_ACCEPT}
                      className="hidden"
                      onChange={(event) => {
                        const files = Array.from(event.target.files ?? []);
                        event.target.value = "";
                        void uploadFiles(files);
                      }}
                    />
                    <span className="flex flex-col items-center justify-center bg-background/95 border-2 border-primary/30 py-7 px-9 rounded-[2rem] shadow-xl">
                      <Plus className="w-9 h-9 text-primary mb-2" aria-hidden />
                      <span className="text-base font-black text-foreground">Pusty arkusz</span>
                      <span className="text-xs font-semibold text-muted-foreground mt-1 text-center">
                        Kliknij, żeby dodać grafiki z dysku,
                        <br />
                        albo wybierz naklejki z bazy
                      </span>
                    </span>
                  </label>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {editingSticker && (
          <StickerEditModal
            imageSrc={editingSticker.imageUrl}
            onSave={(url) => void handleEditSaved(url)}
            onCancel={() => setEditingStickerId(null)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {pdfQueue[0] && (
          <PdfImportModal
            key={`${pdfQueue[0].name}-${pdfQueue[0].size}-${pdfQueue.length}`}
            file={pdfQueue[0]}
            onAdd={(pages) => addPdfPages(pdfQueue[0].name, pages)}
            onError={setError}
            onClose={() => setPdfQueue((queue) => queue.slice(1))}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
