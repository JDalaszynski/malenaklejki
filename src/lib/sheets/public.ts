import "server-only";

import { createHash } from "node:crypto";

import { unstable_cache } from "next/cache";

import { getSession } from "@/lib/auth/dal";
import { db, getBucket } from "@/lib/firebase/admin";
import { CATALOG_VISIBILITY_TAG, READY_SHEETS_TAG } from "@/lib/settings/readySheets";
import { getReadySheetsSettings } from "@/lib/settings/readySheetsStore";
import type { PlacedSticker } from "@/types/creator";
import { applySheetOrder } from "./order";
import {
  SHEETS_COLLECTION,
  getSheet,
  getSheetOrder,
  listCategories,
  ownStoragePath,
  readSheetLayout,
} from "./store";
import {
  isCatalogReady,
  normalizeForSearch,
  toReadySheetsTeaser,
  type CatalogSheet,
  type HomeReadySheets,
  type PublicSheetLayout,
  type PublicSheetSummary,
} from "./types";

/**
 * Gotowe zestawy widziane od strony sklepu.
 *
 * Wszystko tutaj dotyczy wyłącznie zestawów opublikowanych — szkic nie
 * wydostaje się poza panel nawet pod znanym identyfikatorem. Wyniki są
 * zapamiętywane, bo o zapowiedź pyta każde wejście na stronę główną; każda
 * zmiana zestawu w panelu unieważnia tag `READY_SHEETS_TAG`.
 */

/** Czy ta osoba widzi teraz gotowe zestawy, i czy to tylko podgląd administratora. */
export async function readySheetsAccess(): Promise<{ visible: boolean; preview: boolean }> {
  const { mode } = await getReadySheetsSettings();
  if (mode === "on") return { visible: true, preview: false };
  if (mode === "preview") {
    const session = await getSession();
    return session?.isAdmin ? { visible: true, preview: true } : { visible: false, preview: false };
  }
  return { visible: false, preview: false };
}

/**
 * Znacznik wersji z daty ostatniego zapisu. Trafia do adresu układu, więc
 * zmieniony zestaw dostaje nowy adres i stara kopia z pamięci podręcznej
 * przestaje być używana.
 */
function versionOf(updatedAt: unknown): string {
  const time = typeof updatedAt === "string" ? Date.parse(updatedAt) : NaN;
  return Number.isFinite(time) ? time.toString(36) : "0";
}

/** Opublikowany zestaw ze wszystkim, co o nim wie sklep. */
type PublishedSheet = PublicSheetSummary & {
  subtitle: string;
  description: string;
  motifs: string[];
  productImageUrl: string | null;
  printUrl: string | null;
  cutLinesUrl: string | null;
  publishedAt: string | null;
  updatedAt: string;
};

async function readPublishedSheets(): Promise<{
  sheets: PublishedSheet[];
  categories: string[];
}> {
  const snapshot = await db
    .collection(SHEETS_COLLECTION)
    .where("status", "==", "published")
    .select(
      "name",
      "category",
      "category2",
      "previewUrl",
      "stickerCount",
      "publishedAt",
      "createdAt",
      "updatedAt",
      "slug",
      "subtitle",
      "description",
      "motifs",
      "productImageUrl",
      "printUrl",
      "cutLinesUrl",
      "assetsStale"
    )
    .get();

  const docs = snapshot.docs.map((doc) => ({ id: doc.id, data: doc.data() }));

  const unordered: PublishedSheet[] = docs.map(({ id, data }) => {
    const category: string = data.category ?? "";
    const category2: string = data.category2 ?? "";
    return {
      id,
      name: data.name ?? "",
      category,
      categories: [category, category2].filter(Boolean),
      previewUrl: data.previewUrl ?? null,
      stickerCount: typeof data.stickerCount === "number" ? data.stickerCount : 0,
      version: versionOf(data.updatedAt),
      // Adres dostaje tylko zestaw z kompletem do katalogu — inaczej link
      // z galerii prowadziłby na stronę, której nie ma.
      slug: isCatalogReady(data) ? data.slug : null,
      subtitle: data.subtitle ?? "",
      description: data.description ?? "",
      motifs: Array.isArray(data.motifs) ? data.motifs : [],
      productImageUrl: data.productImageUrl ?? null,
      printUrl: data.printUrl ?? null,
      cutLinesUrl: data.cutLinesUrl ?? null,
      publishedAt: data.publishedAt ?? null,
      updatedAt: data.updatedAt ?? "",
    };
  });

  // Kolejność wybrana przez właściciela w panelu; zestaw, którego jeszcze
  // nie ustawiono, stoi na początku jako najnowszy. Ta sama lista rządzi
  // galerią w kreatorze, katalogiem, stronami tematów i mapą strony.
  const sheets = applySheetOrder(unordered, await getSheetOrder());

  const categories = listCategories(
    docs.map(({ data }) => ({
      category: data.category ?? "",
      category2: data.category2 ?? "",
      createdAt: data.createdAt ?? "",
    }))
  );

  return { sheets, categories };
}

// Numer w kluczu rośnie razem z kształtem danych — wpis zapamiętany przez
// starszą wersję kodu nie może wrócić bez nowych pól ani bez kolejności.
const getPublishedSheets = unstable_cache(readPublishedSheets, ["gotowe-zestawy-lista-5"], {
  tags: [READY_SHEETS_TAG],
  revalidate: 3600,
});

/** Lista do galerii w kreatorze — bez opisów i plików, których galeria nie pokazuje. */
export async function getGallerySheets(): Promise<{
  sheets: PublicSheetSummary[];
  categories: string[];
}> {
  const { sheets, categories } = await getPublishedSheets();
  return {
    sheets: sheets.map(({ id, name, category, categories, previewUrl, stickerCount, version, slug }) => ({
      id,
      name,
      category,
      categories,
      previewUrl,
      stickerCount,
      version,
      slug,
    })),
    categories,
  };
}

/**
 * Katalog `/gotowe-zestawy` i strony zestawów istnieją wyłącznie przy trybie
 * „Włączony". Tryb podglądu ich nie odsłania: są statyczne, więc nie mogą
 * zależeć od tego, kto patrzy — administrator ogląda je w panelu.
 */
export async function isCatalogPublic(): Promise<boolean> {
  try {
    return (await getReadySheetsSettings()).mode === "on";
  } catch (error) {
    console.error("isCatalogPublic error:", error);
    return false;
  }
}

/** Zestawy z własną stroną w sklepie; pusta lista, gdy katalog nie jest publiczny. */
export async function getCatalogSheets(): Promise<CatalogSheet[]> {
  if (!(await isCatalogPublic())) return [];
  try {
    const { sheets } = await getPublishedSheets();
    return sheets.filter((sheet): sheet is CatalogSheet => !!sheet.slug && isCatalogReady(sheet));
  } catch (error) {
    console.error("getCatalogSheets error:", error);
    return [];
  }
}

/** Świeży odczyt: czy jest choć jeden opublikowany zestaw z kompletem do katalogu. */
export async function readCatalogHasSheets(): Promise<boolean> {
  const snapshot = await db
    .collection(SHEETS_COLLECTION)
    .where("status", "==", "published")
    .select("slug", "description", "productImageUrl", "printUrl", "cutLinesUrl", "assetsStale")
    .get();
  return snapshot.docs.some((doc) => isCatalogReady(doc.data()));
}

const getCatalogHasSheets = unstable_cache(readCatalogHasSheets, ["katalog-ma-zestawy"], {
  tags: [CATALOG_VISIBILITY_TAG],
  revalidate: 3600,
});

/**
 * Czy linkować do katalogu: tryb „Włączony" i co najmniej jeden zestaw
 * z własną stroną. Pyta o to układ główny (stopka na każdej stronie), dlatego
 * odpowiedź ma własny, rzadko unieważniany wpis w pamięci podręcznej.
 */
export async function isCatalogVisible(): Promise<boolean> {
  try {
    return (await isCatalogPublic()) && (await getCatalogHasSheets());
  } catch (error) {
    console.error("isCatalogVisible error:", error);
    return false;
  }
}

/**
 * Po zmianie zestawu: jeśli katalog właśnie zyskał pierwszy zestaw albo
 * stracił ostatni, zwraca `true` — wtedy trzeba unieważnić
 * `CATALOG_VISIBILITY_TAG` i przebudować strony z linkiem do katalogu.
 */
export async function catalogVisibilityChanged(): Promise<boolean> {
  try {
    const [fresh, cached] = await Promise.all([readCatalogHasSheets(), getCatalogHasSheets()]);
    return fresh !== cached;
  } catch (error) {
    console.error("catalogVisibilityChanged error:", error);
    return false;
  }
}

export async function getCatalogSheetBySlug(slug: string): Promise<CatalogSheet | null> {
  return (await getCatalogSheets()).find((sheet) => sheet.slug === slug) ?? null;
}

/** Zestawy danego tematu — strona tematyczna pokazuje je w kolejności wybranej w panelu. */
export async function getCatalogSheetsByCategory(category: string): Promise<CatalogSheet[]> {
  const key = normalizeForSearch(category);
  return (await getCatalogSheets()).filter((sheet) =>
    sheet.categories.some((item) => normalizeForSearch(item) === key)
  );
}

/**
 * Gotowe zestawy dla strony głównej — bez sesji, żeby strona została
 * statyczna. W trybie podglądu nie zwracamy nic poza samym trybem: zapowiedź
 * dociąga wtedy przeglądarka administratora (`/api/gotowe-zestawy`).
 */
export async function getHomeReadySheets(): Promise<HomeReadySheets> {
  try {
    const { mode } = await getReadySheetsSettings();
    if (mode === "off") return { state: "off" };
    if (mode === "preview") return { state: "preview" };

    const { sheets, categories } = await getGallerySheets();
    if (sheets.length === 0) return { state: "off" };
    return { state: "on", teaser: toReadySheetsTeaser(sheets, categories, false) };
  } catch (error) {
    // Kreator ma działać dalej — najwyżej bez gotowych zestawów.
    console.error("getHomeReadySheets error:", error);
    return { state: "off" };
  }
}

/* ------------------------------------------------------------------ */
/* Układ i lekkie grafiki                                              */
/* ------------------------------------------------------------------ */

/**
 * Dłuższy bok wersji ekranowej. Wystarcza z zapasem dla naklejek do 7,5 cm
 * na ekranach o podwójnej gęstości — większe kreator pokazuje z oryginału
 * (`DISPLAY_SOURCE_MAX_CM` w `transparentBackground.ts`).
 */
const DISPLAY_GRAPHIC_PX = 384;

/** Klucz grafiki w adresie wersji ekranowej — skrót adresu oryginału. */
function displayGraphicKey(imageUrl: string): string {
  return createHash("sha256").update(imageUrl).digest("hex").slice(0, 16);
}

async function readPublishedSheetLayout(id: string): Promise<PublicSheetLayout | null> {
  const sheet = await getSheet(id);
  if (!sheet || sheet.status !== "published") return null;

  const stickers = (await readSheetLayout(sheet.id)) ?? [];

  const display: Record<string, string> = {};
  for (const { imageUrl } of stickers) {
    if (!imageUrl || display[imageUrl] || !ownStoragePath(imageUrl)) continue;
    display[imageUrl] = `/api/gotowe-zestawy/${sheet.id}/grafika/${displayGraphicKey(
      imageUrl
    )}?w=${DISPLAY_GRAPHIC_PX}`;
  }

  return {
    id: sheet.id,
    name: sheet.name,
    slug: isCatalogReady(sheet) ? sheet.slug : null,
    category: sheet.category,
    version: versionOf(sheet.updatedAt),
    // Powiązanie z bazą naklejek to sprawa panelu — w kreatorze zestaw ma
    // być nie do odróżnienia od ułożonego przez klienta.
    stickers: stickers.map(({ libraryId: _libraryId, ...rest }) => {
      void _libraryId;
      return rest as PlacedSticker;
    }),
    display,
  };
}

export const getPublishedSheetLayout = unstable_cache(
  readPublishedSheetLayout,
  ["gotowy-zestaw-uklad-4"],
  { tags: [READY_SHEETS_TAG], revalidate: 3600 }
);

/**
 * Lekka wersja grafiki naklejki z opublikowanego zestawu (WebP).
 *
 * Zestaw ma kilkadziesiąt naklejek, a oryginały ważą od kilkudziesięciu
 * kilobajtów do paru megabajtów. Na ekranie naklejka ma kilka centymetrów,
 * więc kreator pokazuje te wersje, a oryginały pobiera dopiero do pliku
 * do druku. Klucz musi należeć do grafiki z tego zestawu — adres nie służy
 * do zmniejszania dowolnych plików z magazynu.
 */
export async function renderSheetDisplayGraphic(id: string, key: string): Promise<Buffer | null> {
  const layout = await getPublishedSheetLayout(id);
  if (!layout) return null;

  const imageUrl = Object.keys(layout.display).find((url) => displayGraphicKey(url) === key);
  const path = imageUrl ? ownStoragePath(imageUrl) : null;
  if (!path) return null;

  const [original] = await getBucket().file(path).download();

  // `sharp` ma natywną binarkę — ładujemy go dopiero tutaj, jak w `/api/compress-png`.
  const sharp = (await import("sharp")).default;
  return sharp(original)
    // Przeglądarka obraca zdjęcia według EXIF; bez tego wersja ekranowa
    // leżałaby inaczej niż oryginał, z którego powstaje druk.
    .rotate()
    .resize({
      width: DISPLAY_GRAPHIC_PX,
      height: DISPLAY_GRAPHIC_PX,
      fit: "inside",
      withoutEnlargement: true,
    })
    .webp({ quality: 84 })
    .toBuffer();
}
