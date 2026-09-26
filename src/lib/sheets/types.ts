import type { PlacedSticker } from "@/types/creator";

/**
 * Gotowe arkusze tematyczne i baza naklejek — typy wspólne dla serwera
 * i przeglądarki.
 *
 * Arkusz to układ naklejek zapisany tak samo jak arkusz z kreatora
 * (`PlacedSticker[]`), tylko przygotowany przez sprzedawcę. Baza naklejek
 * to katalog grafik, z których te arkusze się składa — każda naklejka
 * dodana na arkusz trafia do niej automatycznie.
 */

export type CutLineType = PlacedSticker["cutLineType"];

export const CUT_LINE_TYPES: readonly CutLineType[] = [
  "none",
  "contour",
  "rounded",
  "circle",
  "contour_inside",
  "rounded_inside",
  "circle_inside",
] as const;

export const CUT_LINE_LABELS: Record<CutLineType, string> = {
  none: "Brak",
  contour: "Kontur",
  rounded: "Prostokąt",
  circle: "Koło",
  contour_inside: "Kontur wew.",
  rounded_inside: "Prostokąt wew.",
  circle_inside: "Koło wew.",
};

export type SheetStatus = "draft" | "published";

export const SHEET_STATUS_LABELS: Record<SheetStatus, string> = {
  draft: "Szkic",
  published: "Opublikowany",
};

export type StickerSheet = {
  id: string;
  name: string;
  category: string;
  status: SheetStatus;
  stickerCount: number;
  /** Naklejki z bazy użyte na arkuszu (bez powtórzeń) — do licznika użyć w bazie. */
  libraryIds: string[];
  /** Podgląd arkusza (JPEG z tokenem pobierania) — lista w panelu, a docelowo sklep. */
  previewUrl: string | null;
  createdAt: string;
  updatedAt: string;
  publishedAt: string | null;
  updatedBy: string | null;
  duplicatedFrom: string | null;
};

export type LibrarySticker = {
  id: string;
  name: string;
  imageUrl: string;
  /** Miniatura do list; bez niej pokazujemy oryginał. */
  thumbUrl: string | null;
  aspectRatio: number;
  /** Wymiary pliku w pikselach — ostrzeżenie o niskiej rozdzielczości przy danym rozmiarze. */
  pixelWidth: number | null;
  pixelHeight: number | null;
  /** Szerokość grafiki (cm), z jaką naklejka ląduje na arkuszu. */
  widthCm: number;
  cutLineType: CutLineType;
  createdAt: string;
  updatedAt: string;
  /** Ostatnie użycie na arkuszu — po tym sortujemy listę. */
  lastUsedAt: string;
};

/** Gotowy arkusz na liście w kreatorze — tylko to, co widzi klient. */
export type PublicSheetSummary = {
  id: string;
  name: string;
  category: string;
  previewUrl: string | null;
  stickerCount: number;
};

/** Odpowiedź `/api/gotowe-arkusze`. */
export type PublicSheetsResponse = {
  sheets: PublicSheetSummary[];
  categories: string[];
  /** Tryb podglądu — lista widoczna tylko dla administratora. */
  preview: boolean;
};

/** Odpowiedź `/api/gotowe-arkusze/[id]` — układ do wczytania w kreatorze. */
export type PublicSheetLayout = {
  id: string;
  name: string;
  stickers: PlacedSticker[];
};

/** Domyślna szerokość naklejki: 1/4 szerokości A4, jak w kreatorze. */
export const DEFAULT_STICKER_WIDTH_CM = 5.25;

export const MAX_SHEET_NAME = 120;
export const MAX_CATEGORY_NAME = 60;
export const MAX_STICKER_NAME = 120;

/** Porównywanie bez wielkości liter i polskich znaków — wyszukiwarka i kategorie. */
export function normalizeForSearch(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/ł/g, "l")
    .replace(/\s+/g, " ")
    .trim();
}

/** Każde słowo zapytania musi wystąpić w nazwie — kolejność bez znaczenia. */
export function matchesSearch(name: string, query: string): boolean {
  const words = normalizeForSearch(query).split(" ").filter(Boolean);
  if (words.length === 0) return true;
  const haystack = normalizeForSearch(name);
  return words.every((word) => haystack.includes(word));
}

/** Nazwa naklejki z nazwy pliku: bez rozszerzenia, podkreślników i myślników. */
export function stickerNameFromFile(fileName: string): string {
  const base = fileName
    .replace(/\.[a-z0-9]{2,5}$/i, "")
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  const name = base || "Naklejka";
  return (name.charAt(0).toUpperCase() + name.slice(1)).slice(0, MAX_STICKER_NAME);
}

/** Nowsze najpierw. Daty to ISO, więc porównanie tekstowe wystarcza. */
export function byLastUsed(a: LibrarySticker, b: LibrarySticker): number {
  return b.lastUsedAt.localeCompare(a.lastUsedAt);
}

/** Rozdzielczość druku przy danej szerokości; poniżej 100 dpi kreator ostrzega klienta. */
export function printDpi(pixelWidth: number | null, widthCm: number): number | null {
  if (!pixelWidth || !(widthCm > 0)) return null;
  return Math.round(pixelWidth / (widthCm / 2.54));
}

export const LOW_DPI = 100;
