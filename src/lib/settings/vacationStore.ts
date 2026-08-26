import "server-only";

import { unstable_cache } from "next/cache";

import { db } from "@/lib/firebase/admin";
import {
  DEFAULT_VACATION_SETTINGS,
  VACATION_CACHE_TAG,
  normalizeVacationSettings,
  type VacationSettings,
} from "./vacation";

const SETTINGS_DOC = "vacation";

function docRef() {
  return db.collection("settings").doc(SETTINGS_DOC);
}

async function readVacationSettings(): Promise<VacationSettings> {
  try {
    const snapshot = await docRef().get();
    if (!snapshot.exists) return DEFAULT_VACATION_SETTINGS;
    return normalizeVacationSettings(snapshot.data());
  } catch (error) {
    // Baner siedzi w układzie głównym, więc każda awaria bazy zabrałaby cały
    // sklep. Brak odpowiedzi z Firestore znaczy tu tylko tyle, że baneru nie
    // pokazujemy — sprzedaż działa dalej.
    console.error("readVacationSettings error:", error);
    return DEFAULT_VACATION_SETTINGS;
  }
}

/**
 * Ustawienia przerwy dla stron publicznych.
 *
 * Odczyt jest zapamiętywany, bo inaczej pojedynczy dokument konfiguracji
 * wymusiłby renderowanie na żądanie wszystkich stron sklepu — łącznie ze
 * stroną główną i wpisami bloga.
 *
 * Zapis w panelu unieważnia tag (`updateTag` w `updateVacationSettings`), więc
 * zmiana jest widoczna od razu. Godzinne `revalidate` to wyłącznie siatka
 * bezpieczeństwa: gdyby unieważnienie tagu kiedyś nie doszło, baner odblokuje
 * się sam, zamiast wisieć do następnego wdrożenia. Przejście z dnia na dzień
 * (start i koniec urlopu) nie wymaga odświeżenia strony — stan przelicza
 * `useVacation` po stronie przeglądarki na podstawie tych samych ustawień.
 */
export const getVacationSettings = unstable_cache(
  readVacationSettings,
  ["ustawienia-przerwy-urlopowej"],
  { tags: [VACATION_CACHE_TAG], revalidate: 3600 }
);

/** Odczyt bez pamięci podręcznej — panel i akcje serwerowe muszą widzieć stan faktyczny. */
export async function getVacationSettingsFresh(): Promise<VacationSettings> {
  return readVacationSettings();
}

/** Zapisuje ustawienia i zwraca stan po zapisie. */
export async function saveVacationSettings(
  settings: VacationSettings,
  actorEmail: string
): Promise<VacationSettings> {
  const payload: VacationSettings = {
    ...settings,
    updatedAt: new Date().toISOString(),
    updatedBy: actorEmail,
  };

  await docRef().set(payload, { merge: false });
  return payload;
}
