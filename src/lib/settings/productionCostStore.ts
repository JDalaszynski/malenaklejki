import "server-only";

import { db } from "@/lib/firebase/admin";
import {
  DEFAULT_PRODUCTION_COST_SETTINGS,
  normalizeProductionCostSettings,
  type ProductionCostSettings,
} from "./productionCost";

function docRef() {
  return db.collection("settings").doc("productionCost");
}

/**
 * Historia stawek prosto z bazy, bez pamięci podręcznej — czytają ją tylko
 * panel, statystyki i wysyłka do BaseLinkera, a każde z nich musi widzieć
 * zmianę od razu po zapisie.
 *
 * Brak dokumentu znaczy, że nikt jeszcze nie zapisał historii w panelu, więc
 * obowiązuje ta z kodu. Awaria bazy też do niej wraca — statystyki i wysyłka
 * zamówienia nie mogą przez to stanąć.
 */
export async function getProductionCostSettings(): Promise<ProductionCostSettings> {
  try {
    const snapshot = await docRef().get();
    if (!snapshot.exists) return DEFAULT_PRODUCTION_COST_SETTINGS;
    return normalizeProductionCostSettings(snapshot.data());
  } catch (error) {
    console.error("getProductionCostSettings error:", error);
    return DEFAULT_PRODUCTION_COST_SETTINGS;
  }
}

export async function saveProductionCostSettings(
  settings: ProductionCostSettings,
  actorEmail: string
): Promise<ProductionCostSettings> {
  const payload: ProductionCostSettings = {
    rates: settings.rates.map((rate) => ({ from: rate.from, net: rate.net })),
    updatedAt: new Date().toISOString(),
    updatedBy: actorEmail,
  };
  await docRef().set(payload, { merge: false });
  return payload;
}
