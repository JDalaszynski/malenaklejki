import "server-only";

import { unstable_cache } from "next/cache";

import { db } from "@/lib/firebase/admin";
import {
  DEFAULT_READY_SHEETS_SETTINGS,
  READY_SHEETS_MODES,
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

const getCachedReadySheetsSettings = unstable_cache(
  readReadySheetsSettings,
  ["ustawienia-gotowych-arkuszy"],
  { tags: [READY_SHEETS_MODE_TAG], revalidate: 3600 }
);

/**
 * Tryb na czas pracy lokalnej, np. `READY_SHEETS_MODE=on npm run dev`.
 *
 * `.env.local` wskazuje na produkcyjną bazę, więc przełączenie trybu w panelu
 * od razu pokazałoby arkusze klientom. Zmienna działa wyłącznie poza
 * produkcyjnym buildem i niczego nie zapisuje.
 */
function localModeOverride(): ReadySheetsMode | null {
  if (process.env.NODE_ENV === "production") return null;
  const value = process.env.READY_SHEETS_MODE as ReadySheetsMode | undefined;
  return value && READY_SHEETS_MODES.includes(value) ? value : null;
}

/**
 * Tryb dla sklepu — z pamięci podręcznej, bo pyta o niego strona główna
 * i każde żądanie do `/api/gotowe-arkusze`. Zapis w panelu unieważnia tag,
 * więc zmiana działa od razu; godzinne `revalidate` to tylko siatka
 * bezpieczeństwa.
 */
export async function getReadySheetsSettings(): Promise<ReadySheetsSettings> {
  const override = localModeOverride();
  if (override) return { ...DEFAULT_READY_SHEETS_SETTINGS, mode: override };
  return getCachedReadySheetsSettings();
}

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
