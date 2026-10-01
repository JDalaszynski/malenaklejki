import "server-only";

import { unstable_cache } from "next/cache";

import { db } from "@/lib/firebase/admin";
import {
  DEFAULT_SHIPPING_ESTIMATE_SETTINGS,
  SHIPPING_ESTIMATE_TAG,
  normalizeShippingEstimateSettings,
  type ShippingEstimateSettings,
} from "./shippingEstimate";

function docRef() {
  return db.collection("settings").doc("shippingEstimate");
}

async function readShippingEstimateSettings(): Promise<ShippingEstimateSettings> {
  try {
    const snapshot = await docRef().get();
    if (!snapshot.exists) return DEFAULT_SHIPPING_ESTIMATE_SETTINGS;
    return normalizeShippingEstimateSettings(snapshot.data());
  } catch (error) {
    // Ustawienie siedzi w układzie głównym — awaria bazy nie może zabrać
    // sklepu, więc wracamy do wartości, z którymi sklep działał dotąd.
    console.error("readShippingEstimateSettings error:", error);
    return DEFAULT_SHIPPING_ESTIMATE_SETTINGS;
  }
}

/**
 * Ustawienie terminu wysyłki dla stron publicznych — z pamięci podręcznej,
 * z tych samych powodów co `getVacationSettings`. Zapis w panelu unieważnia
 * tag, godzinne `revalidate` to tylko siatka bezpieczeństwa.
 */
export const getShippingEstimateSettings = unstable_cache(
  readShippingEstimateSettings,
  ["ustawienia-terminu-wysylki"],
  { tags: [SHIPPING_ESTIMATE_TAG], revalidate: 3600 }
);

/** Odczyt bez pamięci podręcznej — panel i akcje serwerowe muszą widzieć stan faktyczny. */
export async function getShippingEstimateSettingsFresh(): Promise<ShippingEstimateSettings> {
  return readShippingEstimateSettings();
}

export async function saveShippingEstimateSettings(
  settings: ShippingEstimateSettings,
  actorEmail: string
): Promise<ShippingEstimateSettings> {
  const payload: ShippingEstimateSettings = {
    ...settings,
    updatedAt: new Date().toISOString(),
    updatedBy: actorEmail,
  };
  await docRef().set(payload, { merge: false });
  return payload;
}
