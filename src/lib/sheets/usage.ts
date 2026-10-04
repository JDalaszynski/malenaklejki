import "server-only";

import { FieldValue, db } from "@/lib/firebase/admin";
import {
  USAGE_EVENTS,
  USAGE_SOURCES,
  type UsageEvent,
  type UsagePayload,
  type UsageSource,
} from "./usageEvents";

/**
 * Własne liczniki zainteresowania gotowymi arkuszami.
 *
 * Jeden dokument na dzień (`readySheetUsage/2026-10-04`), a w nim same sumy:
 *
 *   totals:  { open, select, use, cart }
 *   sources: { <miejsce wejścia>: { open } }
 *   sheets:  { <id arkusza>: { select, use, cart } }
 *
 * Nie ma tu żadnego identyfikatora klienta, adresu IP ani czasu pojedynczego
 * kliknięcia — tylko licznik zwiększany o 1. Dlatego nie da się z tego
 * odróżnić dwóch kliknięć jednej osoby od kliknięć dwóch osób; liczby mówią
 * „ile razy", nie „ilu klientów".
 */

export const USAGE_COLLECTION = "readySheetUsage";

const EMPTY_COUNTS = (): Record<UsageEvent, number> => ({ open: 0, select: 0, use: 0, cart: 0 });

/** Dzień wg czasu sklepu — doba kończy się o północy w Polsce, nie w UTC. */
export function usageDay(date = new Date()): string {
  return new Intl.DateTimeFormat("sv-SE", { timeZone: "Europe/Warsaw" }).format(date);
}

/** Dolicza jedno zdarzenie do dzisiejszych sum. Wywołujący odpowiada za walidację. */
export async function recordUsage(payload: UsagePayload): Promise<void> {
  const { event, source, sheetId } = payload;
  const day = usageDay();
  const one = FieldValue.increment(1);

  await db
    .collection(USAGE_COLLECTION)
    .doc(day)
    .set(
      {
        day,
        totals: { [event]: one },
        ...(event === "open" && source ? { sources: { [source]: { open: one } } } : {}),
        ...(event !== "open" && sheetId ? { sheets: { [sheetId]: { [event]: one } } } : {}),
      },
      { merge: true }
    );
}

export type UsageDay = Record<UsageEvent, number> & { day: string };

export type UsageSummary = {
  /** Ile ostatnich dni obejmuje zestawienie (łącznie z dzisiejszym). */
  days: number;
  totals: Record<UsageEvent, number>;
  /** Dni od najstarszego, także te bez żadnego zdarzenia. */
  daily: UsageDay[];
  /** Miejsca wejścia do galerii, od najczęściej używanego. */
  sources: Array<{ source: UsageSource; open: number }>;
  /** Arkusze, od najczęściej wczytywanych do kreatora. */
  sheets: Array<{ id: string } & Record<Exclude<UsageEvent, "open">, number>>;
};

function count(value: unknown): number {
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

/** Ostatnie `days` dób wg czasu sklepu, od najstarszej do dzisiejszej. */
function lastDays(days: number): string[] {
  const now = Date.now();
  const result: string[] = [];
  for (let offset = days - 1; offset >= 0; offset--) {
    result.push(usageDay(new Date(now - offset * 86_400_000)));
  }
  return result;
}

export async function loadUsage(days: number): Promise<UsageSummary> {
  const dayKeys = lastDays(days);
  const snapshots = await db.getAll(...dayKeys.map((day) => db.collection(USAGE_COLLECTION).doc(day)));

  const totals = EMPTY_COUNTS();
  const sourceTotals = new Map<UsageSource, number>();
  const sheetTotals = new Map<string, Record<Exclude<UsageEvent, "open">, number>>();

  const daily: UsageDay[] = snapshots.map((snapshot, index) => {
    const row: UsageDay = { day: dayKeys[index], ...EMPTY_COUNTS() };
    const data = snapshot.data();
    if (!data) return row;

    for (const event of USAGE_EVENTS) {
      row[event] = count(data.totals?.[event]);
      totals[event] += row[event];
    }

    for (const source of USAGE_SOURCES) {
      const opens = count(data.sources?.[source]?.open);
      if (opens) sourceTotals.set(source, (sourceTotals.get(source) ?? 0) + opens);
    }

    for (const [id, value] of Object.entries(data.sheets ?? {})) {
      const entry = sheetTotals.get(id) ?? { select: 0, use: 0, cart: 0 };
      const counts = value as Record<string, unknown>;
      entry.select += count(counts.select);
      entry.use += count(counts.use);
      entry.cart += count(counts.cart);
      sheetTotals.set(id, entry);
    }

    return row;
  });

  return {
    days,
    totals,
    daily,
    sources: [...sourceTotals.entries()]
      .map(([source, open]) => ({ source, open }))
      .sort((a, b) => b.open - a.open),
    sheets: [...sheetTotals.entries()]
      .map(([id, counts]) => ({ id, ...counts }))
      .sort((a, b) => b.use - a.use || b.select - a.select || b.cart - a.cart),
  };
}
