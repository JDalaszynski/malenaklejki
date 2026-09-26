import "server-only";

import { unstable_cache } from "next/cache";

import { db } from "@/lib/firebase/admin";
import {
  DEFAULT_READY_SHEETS_SETTINGS,
  READY_SHEETS_MODE_TAG,
  normalizeReadySheetsSettings,
  type ReadySheetsMode,
  type ReadySheetsSettings,
} from "./readySheets";

function docRef() {
  return db.collection("settings").doc("readySheets");
}

async function readReadySheetsSettings(): Promise<ReadySheetsSettings> {
  try {
    const snapshot = await docRef().get();
    if (!snapshot.exists) return DEFAULT_READY_SHEETS_SETTINGS;
    return normalizeReadySheetsSettings(snapshot.data());
  } catch (error) {
    // Awaria bazy ma chować gotowe arkusze, a nie wywracać kreatora —
    // „wyłączony" to stan, w jakim sklep działał od zawsze.
    console.error("readReadySheetsSettings error:", error);
    return DEFAULT_READY_SHEETS_SETTINGS;
  }
}

/**
 * Tryb dla strony głównej — z pamięci podręcznej, bo pyta o niego każde
 * wejście na kreator. Zapis w panelu unieważnia tag, więc zmiana działa
 * od razu; godzinne `revalidate` to tylko siatka bezpieczeństwa.
 */
export const getReadySheetsSettings = unstable_cache(
  readReadySheetsSettings,
  ["ustawienia-gotowych-arkuszy"],
  { tags: [READY_SHEETS_MODE_TAG], revalidate: 3600 }
);

/** Odczyt bez pamięci podręcznej — panel musi widzieć stan faktyczny. */
export async function getReadySheetsSettingsFresh(): Promise<ReadySheetsSettings> {
  return readReadySheetsSettings();
}

export async function saveReadySheetsMode(
  mode: ReadySheetsMode,
  actorEmail: string
): Promise<ReadySheetsSettings> {
  const payload: ReadySheetsSettings = {
    mode,
    updatedAt: new Date().toISOString(),
    updatedBy: actorEmail,
  };
  await docRef().set(payload, { merge: false });
  return payload;
}
