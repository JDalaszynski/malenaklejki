import "server-only";

import { unstable_cache } from "next/cache";

import { getSession } from "@/lib/auth/dal";
import { db } from "@/lib/firebase/admin";
import { READY_SHEETS_TAG } from "@/lib/settings/readySheets";
import { getReadySheetsSettings } from "@/lib/settings/readySheetsStore";
import type { PlacedSticker } from "@/types/creator";
import { SHEETS_COLLECTION, getSheet, listCategories, readSheetLayout } from "./store";
import type { PublicSheetLayout, PublicSheetSummary, StickerSheet } from "./types";

/**
 * Gotowe arkusze widziane od strony sklepu.
 *
 * Wszystko tutaj dotyczy wyłącznie arkuszy opublikowanych — szkic nie
 * wydostaje się poza panel nawet pod znanym identyfikatorem. Wyniki są
 * zapamiętywane, bo o listę pyta każde wejście na stronę główną; każda zmiana
 * arkusza w panelu unieważnia tag `READY_SHEETS_TAG`.
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

async function readPublishedSheets(): Promise<{
  sheets: PublicSheetSummary[];
  categories: string[];
}> {
  const snapshot = await db
    .collection(SHEETS_COLLECTION)
    .where("status", "==", "published")
    .select("name", "category", "previewUrl", "stickerCount", "publishedAt", "createdAt")
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
  }));

  const categories = listCategories(
    docs.map(({ data }) => ({ category: data.category ?? "", createdAt: data.createdAt ?? "" })) as StickerSheet[]
  );

  return { sheets, categories };
}

export const getPublishedSheets = unstable_cache(readPublishedSheets, ["gotowe-arkusze-lista"], {
  tags: [READY_SHEETS_TAG],
  revalidate: 3600,
});

async function readPublishedSheetLayout(id: string): Promise<PublicSheetLayout | null> {
  const sheet = await getSheet(id);
  if (!sheet || sheet.status !== "published") return null;

  const stickers = (await readSheetLayout(sheet.id)) ?? [];
  return {
    id: sheet.id,
    name: sheet.name,
    // Powiązanie z bazą naklejek to sprawa panelu — w kreatorze arkusz ma
    // być nie do odróżnienia od ułożonego przez klienta.
    stickers: stickers.map(({ libraryId: _libraryId, ...rest }) => {
      void _libraryId;
      return rest as PlacedSticker;
    }),
  };
}

export const getPublishedSheetLayout = unstable_cache(
  readPublishedSheetLayout,
  ["gotowy-arkusz-uklad"],
  { tags: [READY_SHEETS_TAG], revalidate: 3600 }
);
