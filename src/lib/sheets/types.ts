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
  /** Temat główny — pod nim arkusz stoi w galerii i na stronie tematycznej. */
  category: string;
  /** Drugi temat (opcjonalny), np. arkusz jesienny z motywem Halloween. */
  category2: string;
  /** Adres strony arkusza w sklepie: `/gotowe-arkusze/<slug>`. */
  slug: string;
  /** Opisowy podtytuł z motywem, np. „naklejki jesienne z kawą i dyniami". */
  subtitle: string;
  /** Opis na stronę arkusza i do pliku produktowego. */
  description: string;
  /** Co jest na arkuszu: „dynie", „liście klonu", „kubek kawy"… */
  motifs: string[];
  /** Obraz produktu w wysokiej rozdzielczości — strona arkusza i Merchant Center. */
  productImageUrl: string | null;
  /** Plik do druku i plik linii cięcia przygotowane przy publikacji. */
  printUrl: string | null;
  cutLinesUrl: string | null;
  /** Układ zmienił się po przygotowaniu plików — trzeba opublikować ponownie z edytora. */
  assetsStale: boolean;
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
  /** Wszystkie tematy arkusza (główny pierwszy) — po nich filtruje galeria. */
  categories: string[];
  previewUrl: string | null;
  stickerCount: number;
  /** Znacznik wersji arkusza — adres układu z nim może leżeć w pamięci podręcznej. */
  version: string;
  /** Adres strony arkusza; `null`, dopóki arkusz nie ma kompletu do katalogu. */
  slug: string | null;
};

/**
 * Arkusz z kompletem do katalogu: własna strona, opis i pliki do druku, dzięki
 * którym da się go dodać do koszyka bez przechodzenia przez kreator.
 */
export type CatalogSheet = PublicSheetSummary & {
  slug: string;
  subtitle: string;
  description: string;
  motifs: string[];
  productImageUrl: string;
  printUrl: string;
  cutLinesUrl: string;
  publishedAt: string | null;
  updatedAt: string;
};

/** Czy arkusz ma wszystko, czego potrzebuje strona produktu. */
export function isCatalogReady(sheet: {
  slug?: string | null;
  description?: string | null;
  productImageUrl?: string | null;
  printUrl?: string | null;
  cutLinesUrl?: string | null;
  assetsStale?: boolean;
}): boolean {
  return (
    !!sheet.slug &&
    !!sheet.description &&
    !!sheet.productImageUrl &&
    !!sheet.printUrl &&
    !!sheet.cutLinesUrl &&
    !sheet.assetsStale
  );
}

/** Skąd pozycja koszyka: gotowy arkusz i to, czy klient go zmienił. */
export type ReadySheetOrigin = {
  id: string;
  slug: string | null;
  name: string;
  category: string;
  /** Niezmieniony gotowy arkusz można zwrócić w 14 dni (regulamin §7). */
  modified: boolean;
};

/** Cena arkusza A4 brutto — jedna stała dla stron, danych strukturalnych i koszyka. */
export const SHEET_PRICE = 49;
/** Koszt dostawy do paczkomatu, liczony raz na zamówienie. */
export const SHIPPING_PRICE = 19.99;

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
  slug: string | null;
  category: string;
  version: string;
  stickers: PlacedSticker[];
  /**
   * Lekkie wersje grafik do pokazania na ekranie: adres oryginału → adres
   * wersji ekranowej. Plik do druku zawsze powstaje z oryginałów.
   */
  display: Record<string, string>;
};

/**
 * Zapowiedź gotowych arkuszy przy kreatorze: tyle, ile trzeba do narysowania
 * wejścia do galerii. Samą listę galeria dociąga dopiero po otwarciu.
 */
export type ReadySheetsTeaser = {
  count: number;
  categories: string[];
  /** Podglądy kilku najnowszych arkuszy — miniaturki przy wejściu. */
  thumbs: string[];
  preview: boolean;
};

/**
 * Stan gotowych arkuszy wliczony w stronę główną. W trybie podglądu strona
 * nie niesie nic — administrator dociąga zapowiedź z przeglądarki, żeby
 * statyczna strona nie zależała od sesji.
 */
export type HomeReadySheets =
  | { state: "off" }
  | { state: "preview" }
  | { state: "on"; teaser: ReadySheetsTeaser };

/** Ile podglądów mieści wejście do galerii. */
export const TEASER_THUMBS = 3;

export function toReadySheetsTeaser(
  sheets: PublicSheetSummary[],
  categories: string[],
  preview: boolean
): ReadySheetsTeaser {
  return {
    count: sheets.length,
    categories,
    thumbs: sheets
      .map((sheet) => sheet.previewUrl)
      .filter((url): url is string => !!url)
      .slice(0, TEASER_THUMBS),
    preview,
  };
}

/** Domyślna szerokość naklejki: 1/4 szerokości A4, jak w kreatorze. */
export const DEFAULT_STICKER_WIDTH_CM = 5.25;

/** Linia cięcia nowej naklejki na arkuszu — „Brak" w bazie to „jeszcze nieustawiona". */
export const DEFAULT_CUT_LINE_TYPE: CutLineType = "contour";

export function cutLineForPlacement(type: CutLineType): CutLineType {
  return type === "none" ? DEFAULT_CUT_LINE_TYPE : type;
}

export const MAX_SHEET_NAME = 120;
export const MAX_CATEGORY_NAME = 60;
export const MAX_STICKER_NAME = 120;
export const MAX_SHEET_SLUG = 80;
export const MAX_SHEET_SUBTITLE = 140;
export const MAX_SHEET_DESCRIPTION = 1500;
export const MAX_MOTIFS = 24;
export const MAX_MOTIF_LENGTH = 40;
/** Poniżej tylu słów opis jest za krótki, żeby strona arkusza miała własną treść. */
export const MIN_DESCRIPTION_WORDS = 80;

/** Adres z nazwy: małe litery, bez polskich znaków, słowa łączone dywizem. */
export function slugify(value: string): string {
  return normalizeForSearch(value)
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, MAX_SHEET_SLUG)
    .replace(/-+$/g, "");
}

export function countWords(value: string): number {
  return value.trim().split(/\s+/).filter(Boolean).length;
}

/** Lista motywów z pola tekstowego: po przecinku albo w osobnych liniach, bez powtórzeń. */
export function parseMotifs(value: string): string[] {
  const seen = new Set<string>();
  const motifs: string[] = [];
  for (const part of value.split(/[,\n;]+/)) {
    const motif = part.trim().replace(/\s+/g, " ").slice(0, MAX_MOTIF_LENGTH);
    const key = normalizeForSearch(motif);
    if (!motif || seen.has(key)) continue;
    seen.add(key);
    motifs.push(motif);
    if (motifs.length === MAX_MOTIFS) break;
  }
  return motifs;
}

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
