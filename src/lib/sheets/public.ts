import "server-only";

import { createHash } from "node:crypto";

import { unstable_cache } from "next/cache";

import { getSession } from "@/lib/auth/dal";
import { db, getBucket } from "@/lib/firebase/admin";
import { READY_SHEETS_TAG } from "@/lib/settings/readySheets";
import { getReadySheetsSettings } from "@/lib/settings/readySheetsStore";
import type { PlacedSticker } from "@/types/creator";
import { SHEETS_COLLECTION, getSheet, listCategories, readSheetLayout } from "./store";
import {
  toReadySheetsTeaser,
  type HomeReadySheets,
  type PublicSheetLayout,
  type PublicSheetSummary,
  type StickerSheet,
} from "./types";

/**
 * Gotowe arkusze widziane od strony sklepu.
 *
 * Wszystko tutaj dotyczy wyłącznie arkuszy opublikowanych — szkic nie
 * wydostaje się poza panel nawet pod znanym identyfikatorem. Wyniki są
 * zapamiętywane, bo o zapowiedź pyta każde wejście na stronę główną; każda
 * zmiana arkusza w panelu unieważnia tag `READY_SHEETS_TAG`.
 */

/** Czy ta osoba widzi teraz gotowe arkusze, i czy to tylko podgląd administratora. */
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
 * zmieniony arkusz dostaje nowy adres i stara kopia z pamięci podręcznej
 * przestaje być używana.
 */
function versionOf(updatedAt: unknown): string {
  const time = typeof updatedAt === "string" ? Date.parse(updatedAt) : NaN;
  return Number.isFinite(time) ? time.toString(36) : "0";
}

async function readPublishedSheets(): Promise<{
  sheets: PublicSheetSummary[];
  categories: string[];
}> {
  const snapshot = await db
    .collection(SHEETS_COLLECTION)
    .where("status", "==", "published")
    .select("name", "category", "previewUrl", "stickerCount", "publishedAt", "createdAt", "updatedAt")
    .get();

  const docs = snapshot.docs
    .map((doc) => ({ id: doc.id, data: doc.data() }))
    // Najświeżej opublikowane na początku listy.
    .sort((a, b) => String(b.data.publishedAt ?? "").localeCompare(String(a.data.publishedAt ?? "")));

  const sheets: PublicSheetSummary[] = docs.map(({ id, data }) => ({
    id,
    name: data.name ?? "",
    category: data.category ?? "",
    previewUrl: data.previewUrl ?? null,
    stickerCount: typeof data.stickerCount === "number" ? data.stickerCount : 0,
    version: versionOf(data.updatedAt),
  }));

  const categories = listCategories(
    docs.map(({ data }) => ({ category: data.category ?? "", createdAt: data.createdAt ?? "" })) as StickerSheet[]
  );

  return { sheets, categories };
}

// Numer w kluczu rośnie razem z kształtem danych — wpis zapamiętany przez
// starszą wersję kodu nie może wrócić bez nowych pól.
export const getPublishedSheets = unstable_cache(readPublishedSheets, ["gotowe-arkusze-lista-2"], {
  tags: [READY_SHEETS_TAG],
  revalidate: 3600,
});

/**
 * Gotowe arkusze dla strony głównej — bez sesji, żeby strona została
 * statyczna. W trybie podglądu nie zwracamy nic poza samym trybem: zapowiedź
 * dociąga wtedy przeglądarka administratora (`/api/gotowe-arkusze`).
 */
export async function getHomeReadySheets(): Promise<HomeReadySheets> {
  try {
    const { mode } = await getReadySheetsSettings();
    if (mode === "off") return { state: "off" };
    if (mode === "preview") return { state: "preview" };

    const { sheets, categories } = await getPublishedSheets();
    if (sheets.length === 0) return { state: "off" };
    return { state: "on", teaser: toReadySheetsTeaser(sheets, categories, false) };
  } catch (error) {
    // Kreator ma działać dalej — najwyżej bez gotowych arkuszy.
    console.error("getHomeReadySheets error:", error);
    return { state: "off" };
  }
}

/* ------------------------------------------------------------------ */
/* Układ i lekkie grafiki                                              */
/* ------------------------------------------------------------------ */

const STORAGE_BUCKET = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;

/**
 * Dłuższy bok wersji ekranowej. Wystarcza z zapasem dla naklejek do 7,5 cm
 * na ekranach o podwójnej gęstości — większe kreator pokazuje z oryginału
 * (`DISPLAY_SOURCE_MAX_CM` w `transparentBackground.ts`).
 */
const DISPLAY_GRAPHIC_PX = 384;

/** Ścieżka pliku w naszym magazynie albo `null`, gdy adres prowadzi gdzie indziej. */
function ownStoragePath(value: string): string | null {
  try {
    const url = new URL(value);
    if (url.protocol !== "https:" || url.hostname !== "firebasestorage.googleapis.com") return null;
    const match = /^\/v0\/b\/([^/]+)\/o\/(.+)$/.exec(url.pathname);
    if (!match || (STORAGE_BUCKET && match[1] !== STORAGE_BUCKET)) return null;
    return decodeURIComponent(match[2]);
  } catch {
    return null;
  }
}

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
    display[imageUrl] = `/api/gotowe-arkusze/${sheet.id}/grafika/${displayGraphicKey(
      imageUrl
    )}?w=${DISPLAY_GRAPHIC_PX}`;
  }

  return {
    id: sheet.id,
    name: sheet.name,
    version: versionOf(sheet.updatedAt),
    // Powiązanie z bazą naklejek to sprawa panelu — w kreatorze arkusz ma
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
  ["gotowy-arkusz-uklad-2"],
  { tags: [READY_SHEETS_TAG], revalidate: 3600 }
);

/**
 * Lekka wersja grafiki naklejki z opublikowanego arkusza (WebP).
 *
 * Arkusz ma kilkadziesiąt naklejek, a oryginały ważą od kilkudziesięciu
 * kilobajtów do paru megabajtów. Na ekranie naklejka ma kilka centymetrów,
 * więc kreator pokazuje te wersje, a oryginały pobiera dopiero do pliku
 * do druku. Klucz musi należeć do grafiki z tego arkusza — adres nie służy
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
