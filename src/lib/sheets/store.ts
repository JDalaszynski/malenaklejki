import "server-only";

import { randomUUID } from "node:crypto";

import { db, getBucket } from "@/lib/firebase/admin";
import type { PlacedSticker } from "@/types/creator";
import {
  CUT_LINE_TYPES,
  DEFAULT_STICKER_WIDTH_CM,
  normalizeForSearch,
  type CutLineType,
  type LibrarySticker,
  type SheetStatus,
  type StickerSheet,
} from "./types";

/**
 * Gotowe arkusze i baza naklejek w Firestore i Storage.
 *
 * Dokument arkusza trzyma same metadane. Układ (pozycje i wielokąty linii
 * cięcia) leży w Storage jako JSON — z tych samych powodów co układy zamówień
 * (src/lib/orders/layout.ts): Firestore nie przyjmuje tablic w tablicach,
 * a gęsty arkusz z konturami przekracza limit 1 MB dokumentu.
 *
 *   sheets/{id}/layout.json  — prywatny, czyta go tylko serwer
 *   sheets/{id}/preview.jpg  — podgląd z tokenem pobierania (lista, docelowo sklep)
 *
 * Grafiki naklejek siedzą w `uploads/`, dokąd wgrywa je przeglądarka — tak
 * samo jak w kreatorze na stronie głównej.
 */

export const SHEETS_COLLECTION = "stickerSheets";
export const LIBRARY_COLLECTION = "stickerLibrary";
export const SHEETS_PREFIX = "sheets";

/** Ile arkuszy ściągamy pod filtry — więcej nie zmieści się sensownie w panelu. */
const SHEETS_FETCH_LIMIT = 500;
/** Cała baza trafia do przeglądarki, bo wyszukiwarka filtruje na bieżąco. */
const LIBRARY_FETCH_LIMIT = 3000;

export const SHEETS_PAGE_SIZE = 24;

export function layoutPathFor(sheetId: string): string {
  return `${SHEETS_PREFIX}/${sheetId}/layout.json`;
}

function previewPathFor(sheetId: string): string {
  return `${SHEETS_PREFIX}/${sheetId}/preview.jpg`;
}

function isCutLineType(value: unknown): value is CutLineType {
  return CUT_LINE_TYPES.includes(value as CutLineType);
}

function toSheet(id: string, data: FirebaseFirestore.DocumentData): StickerSheet {
  return {
    id,
    name: data.name ?? "",
    category: data.category ?? "",
    status: data.status === "published" ? "published" : "draft",
    stickerCount: typeof data.stickerCount === "number" ? data.stickerCount : 0,
    libraryIds: Array.isArray(data.libraryIds) ? data.libraryIds : [],
    previewUrl: data.previewUrl ?? null,
    createdAt: data.createdAt ?? "",
    updatedAt: data.updatedAt ?? "",
    publishedAt: data.publishedAt ?? null,
    updatedBy: data.updatedBy ?? null,
    duplicatedFrom: data.duplicatedFrom ?? null,
  };
}

function toLibrarySticker(id: string, data: FirebaseFirestore.DocumentData): LibrarySticker {
  return {
    id,
    name: data.name ?? "",
    imageUrl: data.imageUrl ?? "",
    thumbUrl: data.thumbUrl ?? null,
    aspectRatio: typeof data.aspectRatio === "number" && data.aspectRatio > 0 ? data.aspectRatio : 1,
    pixelWidth: typeof data.pixelWidth === "number" ? data.pixelWidth : null,
    pixelHeight: typeof data.pixelHeight === "number" ? data.pixelHeight : null,
    widthCm:
      typeof data.widthCm === "number" && data.widthCm > 0 ? data.widthCm : DEFAULT_STICKER_WIDTH_CM,
    cutLineType: isCutLineType(data.cutLineType) ? data.cutLineType : "none",
    createdAt: data.createdAt ?? "",
    updatedAt: data.updatedAt ?? "",
    lastUsedAt: data.lastUsedAt ?? data.createdAt ?? "",
  };
}

/* ------------------------------------------------------------------ */
/* Arkusze                                                             */
/* ------------------------------------------------------------------ */

/** Najnowsze zmiany na górze. Sortowanie po jednym polu — bez indeksu złożonego. */
export async function listSheets(limit = SHEETS_FETCH_LIMIT): Promise<StickerSheet[]> {
  const snapshot = await db
    .collection(SHEETS_COLLECTION)
    .orderBy("updatedAt", "desc")
    .limit(limit)
    .get();
  return snapshot.docs.map((doc) => toSheet(doc.id, doc.data()));
}

export async function getSheet(id: string): Promise<StickerSheet | null> {
  if (!id || id.length > 128 || id.includes("/")) return null;
  const snapshot = await db.collection(SHEETS_COLLECTION).doc(id).get();
  return snapshot.exists ? toSheet(snapshot.id, snapshot.data()!) : null;
}

/** Układ arkusza. `null`, gdy pliku nie ma albo jest nieczytelny. */
export async function readSheetLayout(sheetId: string): Promise<PlacedSticker[] | null> {
  try {
    const [buffer] = await getBucket().file(layoutPathFor(sheetId)).download();
    const parsed = JSON.parse(buffer.toString("utf8"));
    return Array.isArray(parsed?.stickers) ? (parsed.stickers as PlacedSticker[]) : null;
  } catch (error) {
    // Świeży arkusz zapisany bez naklejek nie ma czego czytać — to nie awaria.
    if ((error as { code?: number })?.code !== 404) {
      console.error("readSheetLayout error:", error);
    }
    return null;
  }
}

export async function writeSheetLayout(sheetId: string, json: string): Promise<void> {
  await getBucket()
    .file(layoutPathFor(sheetId))
    .save(json, {
      contentType: "application/json",
      resumable: false,
      metadata: { cacheControl: "no-store" },
    });
}

/**
 * Zapisuje podgląd i zwraca adres do wyświetlenia.
 *
 * Token pobierania jest nowy przy każdym zapisie — stary adres przestaje
 * działać, więc przeglądarka nie pokaże z pamięci podręcznej poprzedniej
 * wersji arkusza.
 */
export async function writeSheetPreview(sheetId: string, jpeg: Buffer): Promise<string> {
  const bucket = getBucket();
  const path = previewPathFor(sheetId);
  const token = randomUUID();

  await bucket.file(path).save(jpeg, {
    contentType: "image/jpeg",
    resumable: false,
    metadata: {
      cacheControl: "public, max-age=31536000",
      metadata: { firebaseStorageDownloadTokens: token },
    },
  });

  return `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodeURIComponent(
    path
  )}?alt=media&token=${token}`;
}

/** Kopia plików arkusza pod nowy identyfikator. Zwraca adres podglądu kopii. */
export async function copySheetFiles(fromId: string, toId: string): Promise<string | null> {
  const bucket = getBucket();

  try {
    await bucket.file(layoutPathFor(fromId)).copy(bucket.file(layoutPathFor(toId)));
  } catch (error) {
    if ((error as { code?: number })?.code !== 404) throw error;
  }

  try {
    const [preview] = await bucket.file(previewPathFor(fromId)).download();
    return await writeSheetPreview(toId, preview);
  } catch (error) {
    if ((error as { code?: number })?.code !== 404) {
      console.error("copySheetFiles preview error:", error);
    }
    return null;
  }
}

export async function deleteSheetFiles(sheetId: string): Promise<void> {
  try {
    await getBucket().deleteFiles({ prefix: `${SHEETS_PREFIX}/${sheetId}/` });
  } catch (error) {
    console.error("deleteSheetFiles error:", error);
  }
}

/**
 * Kategorie w pisowni, która pierwsza trafiła do bazy — „zwierzęta" wpisane
 * po „Zwierzęta" dołącza do istniejącej zamiast zakładać drugą.
 */
export function listCategories(sheets: StickerSheet[]): string[] {
  const byKey = new Map<string, string>();
  for (const sheet of [...sheets].sort((a, b) => a.createdAt.localeCompare(b.createdAt))) {
    const category = sheet.category.trim();
    if (!category) continue;
    const key = normalizeForSearch(category);
    if (!byKey.has(key)) byKey.set(key, category);
  }
  return [...byKey.values()].sort((a, b) => a.localeCompare(b, "pl"));
}

/** Liczba opublikowanych arkuszy — `count()` po stronie Firestore. */
export async function countPublishedSheets(): Promise<number> {
  try {
    const snapshot = await db
      .collection(SHEETS_COLLECTION)
      .where("status", "==", "published")
      .count()
      .get();
    return snapshot.data().count;
  } catch (error) {
    console.error("countPublishedSheets error:", error);
    return 0;
  }
}

/** Same kategorie — do podpowiedzi w edytorze, bez ściągania całych dokumentów. */
export async function listCategoryNames(): Promise<string[]> {
  const snapshot = await db
    .collection(SHEETS_COLLECTION)
    .select("category", "createdAt")
    .limit(SHEETS_FETCH_LIMIT)
    .get();
  return listCategories(snapshot.docs.map((doc) => toSheet(doc.id, doc.data())));
}

export type SheetFilters = {
  search?: string;
  category?: string;
  status?: SheetStatus;
};

type SearchParams = Record<string, string | string[] | undefined>;

function single(params: SearchParams, key: string): string | undefined {
  const value = params[key];
  return (Array.isArray(value) ? value[0] : value) || undefined;
}

export function parseSheetFilters(params: SearchParams): SheetFilters {
  const status = single(params, "stan");
  return {
    search: single(params, "szukaj"),
    category: single(params, "kategoria"),
    status: status === "draft" || status === "published" ? status : undefined,
  };
}

export function filterSheets(sheets: StickerSheet[], filters: SheetFilters): StickerSheet[] {
  const search = filters.search ? normalizeForSearch(filters.search) : "";
  const category = filters.category ? normalizeForSearch(filters.category) : "";

  return sheets.filter((sheet) => {
    if (filters.status && sheet.status !== filters.status) return false;
    if (category && normalizeForSearch(sheet.category) !== category) return false;
    if (search) {
      const haystack = normalizeForSearch(`${sheet.name} ${sheet.category}`);
      if (!search.split(" ").every((word) => haystack.includes(word))) return false;
    }
    return true;
  });
}

export function paginateSheets(
  sheets: StickerSheet[],
  page: number,
  pageSize = SHEETS_PAGE_SIZE
): { items: StickerSheet[]; page: number; pageCount: number; total: number } {
  const pageCount = Math.max(1, Math.ceil(sheets.length / pageSize));
  const current = Math.min(Math.max(1, page), pageCount);
  const start = (current - 1) * pageSize;
  return {
    items: sheets.slice(start, start + pageSize),
    page: current,
    pageCount,
    total: sheets.length,
  };
}

/* ------------------------------------------------------------------ */
/* Baza naklejek                                                       */
/* ------------------------------------------------------------------ */

/** Ostatnio użyte na górze — tak baza pokazuje się w panelu i w edytorze. */
export async function listLibrary(limit = LIBRARY_FETCH_LIMIT): Promise<LibrarySticker[]> {
  const snapshot = await db
    .collection(LIBRARY_COLLECTION)
    .orderBy("lastUsedAt", "desc")
    .limit(limit)
    .get();
  return snapshot.docs.map((doc) => toLibrarySticker(doc.id, doc.data()));
}

/** Liczba naklejek w bazie — `count()` po stronie Firestore, bez ściągania dokumentów. */
export async function countLibraryStickers(): Promise<number> {
  try {
    const snapshot = await db.collection(LIBRARY_COLLECTION).count().get();
    return snapshot.data().count;
  } catch (error) {
    console.error("countLibraryStickers error:", error);
    return 0;
  }
}

export async function getLibrarySticker(id: string): Promise<LibrarySticker | null> {
  if (!id || id.length > 128 || id.includes("/")) return null;
  const snapshot = await db.collection(LIBRARY_COLLECTION).doc(id).get();
  return snapshot.exists ? toLibrarySticker(snapshot.id, snapshot.data()!) : null;
}

/** Ta sama grafika wgrana drugi raz — po skrócie SHA-256 zawartości pliku. */
export async function findLibraryStickerByHash(hash: string): Promise<LibrarySticker | null> {
  const snapshot = await db
    .collection(LIBRARY_COLLECTION)
    .where("hash", "==", hash)
    .limit(1)
    .get();
  const doc = snapshot.docs[0];
  return doc ? toLibrarySticker(doc.id, doc.data()) : null;
}

/** W ilu arkuszach występuje każda naklejka z bazy. */
export function countLibraryUsage(sheets: StickerSheet[]): Record<string, number> {
  const usage: Record<string, number> = {};
  for (const sheet of sheets) {
    for (const id of new Set(sheet.libraryIds)) {
      usage[id] = (usage[id] ?? 0) + 1;
    }
  }
  return usage;
}

/**
 * Same identyfikatory bazy z każdego arkusza — do liczników użyć.
 * Projekcja, bo lista arkuszy nie potrzebuje reszty pól.
 */
export async function listSheetLibraryIds(): Promise<StickerSheet[]> {
  const snapshot = await db
    .collection(SHEETS_COLLECTION)
    .select("libraryIds", "name", "status", "createdAt")
    .limit(SHEETS_FETCH_LIMIT)
    .get();
  return snapshot.docs.map((doc) => toSheet(doc.id, doc.data()));
}
