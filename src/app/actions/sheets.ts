"use server";

import { z } from "zod";
import { revalidatePath, updateTag } from "next/cache";

import { recordAudit } from "@/lib/admin/audit";
import { getSession } from "@/lib/auth/dal";
import { db } from "@/lib/firebase/admin";
import { describePublishBlockers } from "@/lib/creator/sheetOps";
import { READY_SHEETS_TAG } from "@/lib/settings/readySheets";
import { MAX_LAYOUT_BYTES, serializeLayout } from "@/lib/orders/layoutFormat";
import {
  LIBRARY_COLLECTION,
  SHEETS_COLLECTION,
  copySheetFiles,
  deleteSheetFiles,
  findLibraryStickerByHash,
  getLibrarySticker,
  getSheet,
  listCategories,
  readSheetLayout,
  writeSheetLayout,
  writeSheetPreview,
} from "@/lib/sheets/store";
import {
  CUT_LINE_TYPES,
  MAX_CATEGORY_NAME,
  MAX_SHEET_NAME,
  MAX_STICKER_NAME,
  SHEET_STATUS_LABELS,
  normalizeForSearch,
  type CutLineType,
  type LibrarySticker,
  type SheetStatus,
  type StickerSheet,
} from "@/lib/sheets/types";
import type { PlacedSticker } from "@/types/creator";

type Result<T = object> =
  | ({ success: true } & T)
  | { success: false; error: string; conflict?: boolean; blockers?: string[] };

const DENIED = { success: false, error: "Brak uprawnień." } as const;

/**
 * Akcje gotowych arkuszy sprawdzają uprawnienia samodzielnie — jak reszta
 * panelu, bo akcje serwerowe mają własne adresy i ukrycie przycisku niczego
 * nie zabezpiecza.
 */
async function requireAdminActor(): Promise<{ email: string } | null> {
  const session = await getSession();
  if (!session?.isAdmin) return null;
  return { email: session.email ?? "administrator" };
}

function refreshSheetViews(sheetId?: string) {
  // Lista i układy w kreatorze na stronie głównej są zapamiętane — po każdej
  // zmianie arkusza sklep ma pokazać stan świeży, a nie ten sprzed zapisu.
  updateTag(READY_SHEETS_TAG);
  revalidatePath("/admin/arkusze");
  revalidatePath("/admin/arkusze/baza-naklejek");
  if (sheetId) revalidatePath(`/admin/arkusze/${sheetId}`);
}

const idSchema = z
  .string()
  .trim()
  .min(1)
  .max(128)
  .regex(/^[A-Za-z0-9_-]+$/);

/* ------------------------------------------------------------------ */
/* Walidacja układu                                                    */
/* ------------------------------------------------------------------ */

const STORAGE_BUCKET = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;

/**
 * Grafiki naklejek muszą leżeć w naszym Storage. Arkusz trafi kiedyś do
 * klientów, więc adres spoza bucketa (albo `javascript:`) nie może się tam
 * znaleźć nawet przez podmienione żądanie.
 */
function isOwnStorageUrl(value: string): boolean {
  try {
    const url = new URL(value);
    if (url.protocol !== "https:" || url.hostname !== "firebasestorage.googleapis.com") return false;
    return !STORAGE_BUCKET || url.pathname.startsWith(`/v0/b/${STORAGE_BUCKET}/o/`);
  } catch {
    return false;
  }
}

const storageUrlSchema = z
  .string()
  .trim()
  .max(2000)
  .refine(isOwnStorageUrl, "Grafika spoza magazynu sklepu.");

const cutLineSchema = z.enum(CUT_LINE_TYPES as [CutLineType, ...CutLineType[]]);

const coordinate = z.number().finite().min(-100).max(400);
const pointSchema = z.object({ x: z.number().finite(), y: z.number().finite() });

const stickerSchema = z.object({
  id: z.string().min(1).max(64),
  imageUrl: storageUrlSchema,
  x: coordinate,
  y: coordinate,
  widthCm: z.number().finite().positive().max(40),
  heightCm: z.number().finite().positive().max(60),
  aspectRatio: z.number().finite().positive().max(100),
  cutLineType: cutLineSchema,
  rotation: z.number().finite().min(0).max(360).optional(),
  contourPolygons: z.array(z.array(pointSchema).max(20000)).max(200).optional(),
  libraryId: idSchema.optional(),
});

const stickersSchema = z.array(stickerSchema).max(400);

/** Podgląd przychodzi z przeglądarki jako data URL JPEG-a. */
function decodePreview(dataUrl: string | null | undefined): Buffer | null {
  if (!dataUrl) return null;
  const match = /^data:image\/jpeg;base64,([A-Za-z0-9+/=]+)$/.exec(dataUrl);
  if (!match) return null;
  const buffer = Buffer.from(match[1], "base64");
  // Sygnatura JPEG — nie zapisujemy pod adresem podglądu niczego innego.
  if (buffer.length < 4 || buffer[0] !== 0xff || buffer[1] !== 0xd8 || buffer[2] !== 0xff) {
    return null;
  }
  return buffer.length <= 3 * 1024 * 1024 ? buffer : null;
}

/**
 * Pisownia kategorii z bazy: „zwierzęta" dołącza do istniejących „Zwierzęta"
 * zamiast zakładać drugą kategorię różniącą się wielką literą.
 */
async function canonicalCategory(category: string): Promise<string> {
  const trimmed = category.trim().replace(/\s+/g, " ");
  if (!trimmed) return "";

  const snapshot = await db.collection(SHEETS_COLLECTION).select("category", "createdAt").get();
  const existing = listCategories(
    snapshot.docs.map((doc) => ({
      category: doc.get("category") ?? "",
      createdAt: doc.get("createdAt") ?? "",
    })) as StickerSheet[]
  );
  const key = normalizeForSearch(trimmed);
  return existing.find((item) => normalizeForSearch(item) === key) ?? trimmed;
}

/**
 * Nowa naklejka ląduje w bazie z linią cięcia „brak" — wybiera się ją dopiero
 * na arkuszu. Przy zapisie arkusza przepisujemy ustawienia z arkusza do tych
 * pozycji bazy, które wciąż ich nie mają, żeby następnym razem naklejka
 * przychodziła z bazy gotowa. Ustawionych wcześniej nie ruszamy — od tego
 * jest przycisk „Zapisz ustawienia w bazie" w edytorze.
 */
async function fillMissingLibrarySettings(stickers: PlacedSticker[]): Promise<void> {
  const latest = new Map<string, PlacedSticker>();
  for (const sticker of stickers) {
    if (sticker.libraryId && sticker.cutLineType !== "none") latest.set(sticker.libraryId, sticker);
  }
  if (latest.size === 0) return;

  const refs = [...latest.keys()].map((id) => db.collection(LIBRARY_COLLECTION).doc(id));
  const snapshots = await db.getAll(...refs);
  const batch = db.batch();
  let pending = 0;
  const now = new Date().toISOString();

  for (const snapshot of snapshots) {
    if (!snapshot.exists || snapshot.get("cutLineType") !== "none") continue;
    const sticker = latest.get(snapshot.id)!;
    batch.update(snapshot.ref, {
      cutLineType: sticker.cutLineType,
      widthCm: sticker.widthCm,
      updatedAt: now,
    });
    pending++;
  }

  if (pending > 0) await batch.commit();
}

/* ------------------------------------------------------------------ */
/* Arkusze                                                             */
/* ------------------------------------------------------------------ */

const saveSchema = z.object({
  id: idSchema.nullable().optional(),
  name: z.string().trim().min(1, "Podaj nazwę arkusza.").max(MAX_SHEET_NAME, "Nazwa jest za długa."),
  category: z.string().trim().max(MAX_CATEGORY_NAME, "Nazwa kategorii jest za długa."),
  status: z.enum(["draft", "published"]),
  stickers: stickersSchema,
  preview: z.string().max(5_000_000).nullable().optional(),
  /** Znacznik wersji, którą edytor wczytał — wykrywa zapis z innej karty. */
  expectedUpdatedAt: z.string().max(40).nullable().optional(),
  force: z.boolean().optional(),
});

export type SaveSheetInput = z.input<typeof saveSchema>;

export async function saveSheet(
  raw: SaveSheetInput
): Promise<Result<{ id: string; updatedAt: string; previewUrl: string | null; status: SheetStatus }>> {
  const actor = await requireAdminActor();
  if (!actor) return DENIED;

  const parsed = saveSchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Nieprawidłowe dane arkusza." };
  }
  const input = parsed.data;
  const stickers = input.stickers as PlacedSticker[];

  if (input.status === "published") {
    const blockers = describePublishBlockers(stickers);
    if (!input.category) blockers.unshift("Wybierz kategorię arkusza.");
    if (blockers.length > 0) {
      return { success: false, error: "Arkusza nie da się jeszcze opublikować.", blockers };
    }
  }

  const collection = db.collection(SHEETS_COLLECTION);
  const ref = input.id ? collection.doc(input.id) : collection.doc();
  const now = new Date().toISOString();

  let previous: StickerSheet | null = null;
  if (input.id) {
    previous = await getSheet(input.id);
    if (!previous) return { success: false, error: "Ten arkusz został usunięty." };
    if (
      !input.force &&
      input.expectedUpdatedAt &&
      previous.updatedAt &&
      previous.updatedAt !== input.expectedUpdatedAt
    ) {
      return {
        success: false,
        conflict: true,
        error: `Arkusz zmienił się w międzyczasie (zapis ${previous.updatedBy ?? "z innej karty"}).`,
      };
    }
  }

  const layoutJson = serializeLayout(stickers);
  if (Buffer.byteLength(layoutJson, "utf8") > MAX_LAYOUT_BYTES) {
    return { success: false, error: "Układ arkusza jest za duży, żeby go zapisać." };
  }

  const category = await canonicalCategory(input.category);

  try {
    await writeSheetLayout(ref.id, layoutJson);
  } catch (error) {
    console.error("saveSheet layout error:", error);
    return { success: false, error: "Nie udało się zapisać układu arkusza." };
  }

  let previewUrl = previous?.previewUrl ?? null;
  const preview = decodePreview(input.preview);
  if (preview) {
    try {
      previewUrl = await writeSheetPreview(ref.id, preview);
    } catch (error) {
      // Brak nowego podglądu nie może zatrzymać zapisu pracy nad arkuszem.
      console.error("saveSheet preview error:", error);
    }
  }

  const libraryIds = [
    ...new Set(stickers.map((sticker) => sticker.libraryId).filter((id): id is string => !!id)),
  ];

  const publishedAt =
    input.status === "published"
      ? previous?.status === "published"
        ? previous.publishedAt ?? now
        : now
      : null;

  await ref.set(
    {
      name: input.name,
      category,
      status: input.status,
      stickerCount: stickers.length,
      libraryIds,
      previewUrl,
      updatedAt: now,
      updatedBy: actor.email,
      publishedAt,
      ...(previous
        ? {}
        : { createdAt: now, createdBy: actor.email, duplicatedFrom: null }),
    },
    { merge: true }
  );

  try {
    await fillMissingLibrarySettings(stickers);
  } catch (error) {
    console.error("saveSheet library sync error:", error);
  }

  const statusChange =
    previous && previous.status !== input.status
      ? `, ${SHEET_STATUS_LABELS[previous.status].toLowerCase()} → ${SHEET_STATUS_LABELS[input.status].toLowerCase()}`
      : "";
  await recordAudit({
    actorEmail: actor.email,
    action: previous ? "Zapis gotowego arkusza" : "Nowy gotowy arkusz",
    details: `„${input.name}"${category ? ` (${category})` : ""}: ${SHEET_STATUS_LABELS[
      input.status
    ].toLowerCase()}, naklejek: ${stickers.length}${statusChange}`,
  });

  refreshSheetViews(ref.id);
  return { success: true, id: ref.id, updatedAt: now, previewUrl, status: input.status };
}

/** Publikacja albo cofnięcie do szkicu prosto z listy, bez otwierania edytora. */
export async function setSheetStatus(raw: {
  id: string;
  status: SheetStatus;
}): Promise<Result> {
  const actor = await requireAdminActor();
  if (!actor) return DENIED;

  const id = idSchema.safeParse(raw?.id);
  const status = z.enum(["draft", "published"]).safeParse(raw?.status);
  if (!id.success || !status.success) return { success: false, error: "Nieprawidłowe dane." };

  const sheet = await getSheet(id.data);
  if (!sheet) return { success: false, error: "Ten arkusz został usunięty." };
  if (sheet.status === status.data) return { success: true };

  if (status.data === "published") {
    // Serwer sprawdza zapisany układ, a nie to, co twierdzi przeglądarka.
    const stickers = (await readSheetLayout(sheet.id)) ?? [];
    const blockers = describePublishBlockers(stickers);
    if (!sheet.category) blockers.unshift("Wybierz kategorię arkusza.");
    if (blockers.length > 0) {
      return { success: false, error: "Arkusza nie da się jeszcze opublikować.", blockers };
    }
  }

  const now = new Date().toISOString();
  await db
    .collection(SHEETS_COLLECTION)
    .doc(sheet.id)
    .update({
      status: status.data,
      publishedAt: status.data === "published" ? now : null,
      updatedAt: now,
      updatedBy: actor.email,
    });

  await recordAudit({
    actorEmail: actor.email,
    action: status.data === "published" ? "Publikacja gotowego arkusza" : "Arkusz cofnięty do szkicu",
    details: `„${sheet.name}"${sheet.category ? ` (${sheet.category})` : ""}`,
  });

  refreshSheetViews(sheet.id);
  return { success: true };
}

/** Kopia arkusza jako nowy szkic — do przerobienia bez ruszania oryginału. */
export async function duplicateSheet(rawId: string): Promise<Result<{ id: string }>> {
  const actor = await requireAdminActor();
  if (!actor) return DENIED;

  const id = idSchema.safeParse(rawId);
  if (!id.success) return { success: false, error: "Brak arkusza." };

  const source = await getSheet(id.data);
  if (!source) return { success: false, error: "Ten arkusz został usunięty." };

  const ref = db.collection(SHEETS_COLLECTION).doc();
  let previewUrl: string | null = null;
  try {
    previewUrl = await copySheetFiles(source.id, ref.id);
  } catch (error) {
    console.error("duplicateSheet copy error:", error);
    return { success: false, error: "Nie udało się skopiować układu arkusza." };
  }

  const now = new Date().toISOString();
  const suffix = " (kopia)";
  await ref.set({
    name: `${source.name.slice(0, MAX_SHEET_NAME - suffix.length)}${suffix}`,
    category: source.category,
    status: "draft",
    stickerCount: source.stickerCount,
    libraryIds: source.libraryIds,
    previewUrl,
    createdAt: now,
    createdBy: actor.email,
    updatedAt: now,
    updatedBy: actor.email,
    publishedAt: null,
    duplicatedFrom: source.id,
  });

  await recordAudit({
    actorEmail: actor.email,
    action: "Duplikat gotowego arkusza",
    details: `„${source.name}" → nowy szkic`,
  });

  refreshSheetViews();
  return { success: true, id: ref.id };
}

/**
 * Trwałe usunięcie arkusza razem z układem i podglądem.
 *
 * Naklejki zostają w bazie — mogą należeć do innych arkuszy, a grafiki
 * w `uploads/` i tak są współdzielone.
 */
export async function deleteSheet(rawId: string): Promise<Result> {
  const actor = await requireAdminActor();
  if (!actor) return DENIED;

  const id = idSchema.safeParse(rawId);
  if (!id.success) return { success: false, error: "Brak arkusza." };

  const sheet = await getSheet(id.data);
  if (!sheet) return { success: false, error: "Ten arkusz został już usunięty." };

  await db.collection(SHEETS_COLLECTION).doc(sheet.id).delete();
  await deleteSheetFiles(sheet.id);

  await recordAudit({
    actorEmail: actor.email,
    action: "Usunięcie gotowego arkusza",
    details: `„${sheet.name}"${sheet.category ? ` (${sheet.category})` : ""}, ${SHEET_STATUS_LABELS[
      sheet.status
    ].toLowerCase()}, naklejek: ${sheet.stickerCount}`,
  });

  refreshSheetViews();
  return { success: true };
}

/* ------------------------------------------------------------------ */
/* Baza naklejek                                                       */
/* ------------------------------------------------------------------ */

const hashSchema = z.string().regex(/^[a-f0-9]{64}$/);

/**
 * Czy ta grafika jest już w bazie — pytamy przed wgraniem pliku, żeby drugi
 * raz wrzucona ta sama grafika nie mnożyła pozycji ani plików w magazynie.
 */
export async function findLibraryStickerByFileHash(
  rawHash: string
): Promise<Result<{ sticker: LibrarySticker | null }>> {
  const actor = await requireAdminActor();
  if (!actor) return DENIED;

  const hash = hashSchema.safeParse(rawHash);
  if (!hash.success) return { success: true, sticker: null };

  const sticker = await findLibraryStickerByHash(hash.data);
  if (sticker) {
    const now = new Date().toISOString();
    await db.collection(LIBRARY_COLLECTION).doc(sticker.id).update({ lastUsedAt: now });
    sticker.lastUsedAt = now;
  }
  return { success: true, sticker };
}

const createStickerSchema = z.object({
  name: z.string().trim().min(1, "Podaj nazwę naklejki.").max(MAX_STICKER_NAME),
  imageUrl: storageUrlSchema,
  thumbUrl: storageUrlSchema.nullable().optional(),
  aspectRatio: z.number().finite().positive().max(100),
  pixelWidth: z.number().int().positive().max(100000).nullable().optional(),
  pixelHeight: z.number().int().positive().max(100000).nullable().optional(),
  widthCm: z.number().finite().min(0.5).max(40),
  cutLineType: cutLineSchema,
  hash: hashSchema.nullable().optional(),
});

export type CreateLibraryStickerInput = z.input<typeof createStickerSchema>;

/** Dodaje grafikę do bazy. Przy powtórce po skrócie zwraca istniejącą pozycję. */
export async function createLibrarySticker(
  raw: CreateLibraryStickerInput
): Promise<Result<{ sticker: LibrarySticker; existing: boolean }>> {
  const actor = await requireAdminActor();
  if (!actor) return DENIED;

  const parsed = createStickerSchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Nieprawidłowe dane naklejki." };
  }
  const input = parsed.data;
  const now = new Date().toISOString();

  if (input.hash) {
    const existing = await findLibraryStickerByHash(input.hash);
    if (existing) {
      await db.collection(LIBRARY_COLLECTION).doc(existing.id).update({ lastUsedAt: now });
      return { success: true, sticker: { ...existing, lastUsedAt: now }, existing: true };
    }
  }

  const ref = db.collection(LIBRARY_COLLECTION).doc();
  const fields: Omit<LibrarySticker, "id"> = {
    name: input.name,
    imageUrl: input.imageUrl,
    thumbUrl: input.thumbUrl ?? null,
    aspectRatio: input.aspectRatio,
    pixelWidth: input.pixelWidth ?? null,
    pixelHeight: input.pixelHeight ?? null,
    widthCm: Math.round(input.widthCm * 100) / 100,
    cutLineType: input.cutLineType,
    createdAt: now,
    updatedAt: now,
    lastUsedAt: now,
  };
  await ref.set({ ...fields, hash: input.hash ?? null, createdBy: actor.email });
  const sticker: LibrarySticker = { id: ref.id, ...fields };

  await recordAudit({
    actorEmail: actor.email,
    action: "Nowa naklejka w bazie",
    details: `„${sticker.name}"`,
  });

  revalidatePath("/admin/arkusze/baza-naklejek");
  return { success: true, sticker, existing: false };
}

const updateStickerSchema = z.object({
  id: idSchema,
  name: z.string().trim().min(1, "Podaj nazwę naklejki.").max(MAX_STICKER_NAME).optional(),
  cutLineType: cutLineSchema.optional(),
  widthCm: z.number().finite().min(0.5).max(40).optional(),
});

/** Nazwa i domyślne ustawienia naklejki w bazie. */
export async function updateLibrarySticker(
  raw: z.input<typeof updateStickerSchema>
): Promise<Result<{ sticker: LibrarySticker }>> {
  const actor = await requireAdminActor();
  if (!actor) return DENIED;

  const parsed = updateStickerSchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Nieprawidłowe dane naklejki." };
  }
  const { id, ...changes } = parsed.data;

  const current = await getLibrarySticker(id);
  if (!current) return { success: false, error: "Tej naklejki nie ma już w bazie." };

  const update: Record<string, unknown> = { updatedAt: new Date().toISOString() };
  if (changes.name !== undefined) update.name = changes.name;
  if (changes.cutLineType !== undefined) update.cutLineType = changes.cutLineType;
  if (changes.widthCm !== undefined) update.widthCm = Math.round(changes.widthCm * 100) / 100;

  await db.collection(LIBRARY_COLLECTION).doc(id).update(update);

  if (changes.name !== undefined && changes.name !== current.name) {
    await recordAudit({
      actorEmail: actor.email,
      action: "Zmiana nazwy naklejki w bazie",
      details: `„${current.name}" → „${changes.name}"`,
    });
  }

  revalidatePath("/admin/arkusze/baza-naklejek");
  return { success: true, sticker: { ...current, ...(update as Partial<LibrarySticker>) } };
}

/**
 * Znacznik „ostatnio użyte" — wołany przy wstawieniu naklejki z bazy na
 * arkusz. Przy zapisie arkusza go nie ruszamy: ponowne zapisanie starego
 * arkusza nie jest użyciem jego naklejek.
 */
export async function markLibraryStickersUsed(rawIds: string[]): Promise<Result> {
  const actor = await requireAdminActor();
  if (!actor) return DENIED;

  const ids = z.array(idSchema).max(50).safeParse(rawIds);
  if (!ids.success || ids.data.length === 0) return { success: true };

  const refs = [...new Set(ids.data)].map((id) => db.collection(LIBRARY_COLLECTION).doc(id));
  const snapshots = await db.getAll(...refs);
  const batch = db.batch();
  const now = new Date().toISOString();
  let pending = 0;
  for (const snapshot of snapshots) {
    if (!snapshot.exists) continue;
    batch.update(snapshot.ref, { lastUsedAt: now });
    pending++;
  }
  if (pending > 0) await batch.commit();

  return { success: true };
}

/**
 * Usuwa naklejkę z bazy. Arkusze, na których leży, zachowują swoją kopię —
 * układ arkusza przechowuje adres grafiki, a nie odwołanie do bazy.
 */
export async function deleteLibrarySticker(rawId: string): Promise<Result> {
  const actor = await requireAdminActor();
  if (!actor) return DENIED;

  const id = idSchema.safeParse(rawId);
  if (!id.success) return { success: false, error: "Brak naklejki." };

  const sticker = await getLibrarySticker(id.data);
  if (!sticker) return { success: false, error: "Tej naklejki nie ma już w bazie." };

  await db.collection(LIBRARY_COLLECTION).doc(sticker.id).delete();

  await recordAudit({
    actorEmail: actor.email,
    action: "Usunięcie naklejki z bazy",
    details: `„${sticker.name}"`,
  });

  revalidatePath("/admin/arkusze/baza-naklejek");
  return { success: true };
}
