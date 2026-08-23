import "server-only";

import { db } from "@/lib/firebase/admin";
import { recordAudit } from "@/lib/admin/audit";
import { ABANDONED_AFTER_DAYS, isSweepable, sweepCutoffIso } from "./sweepRules";

export { ABANDONED_AFTER_DAYS } from "./sweepRules";

export type SweepResult = {
  matched: number;
  moved: number;
  orderNumbers: string[];
};

/**
 * Przenosi do kosza zamówienia, które nie doczekały się zapłaty.
 *
 * Kwalifikuje się zamówienie, które od ponad `ABANDONED_AFTER_DAYS` dni czeka
 * na płatność albo ma nieudaną płatność. Takie rekordy zaśmiecają listę
 * i zaniżają statystyki, a po tygodniu praktycznie nie zmieniają już statusu.
 *
 * Nic nie jest usuwane trwale — zamówienie ląduje w koszu i da się je
 * przywrócić jednym kliknięciem. Dodatkowo, gdyby spóźniona płatność jednak
 * dotarła (np. przelew tradycyjny zaksięgowany po dwóch tygodniach),
 * oznaczenie zamówienia jako opłacone automatycznie wyjmuje je z kosza —
 * patrz `deletedAt: null` w webhooku Przelewy24 i w akcji zmiany statusu.
 */
export async function sweepAbandonedOrders(options: {
  dryRun?: boolean;
  actorEmail?: string;
} = {}): Promise<SweepResult> {
  const cutoff = sweepCutoffIso();

  // Jedno zapytanie o wszystkie zamówienia zamiast trzech po statusie:
  // kolekcja jest mała, a `in` z trzema wartościami i tak wymagałby indeksu.
  const snapshot = await db.collection("orders").get();

  const candidates = snapshot.docs.filter((doc) => isSweepable(doc.data(), cutoff));

  const orderNumbers = candidates.map((doc) => doc.data().orderNumber ?? doc.id);

  if (options.dryRun || candidates.length === 0) {
    return { matched: candidates.length, moved: 0, orderNumbers };
  }

  const now = new Date().toISOString();
  // Firestore przyjmuje maksymalnie 500 operacji w jednej paczce.
  for (let i = 0; i < candidates.length; i += 400) {
    const batch = db.batch();
    for (const doc of candidates.slice(i, i + 400)) {
      batch.update(doc.ref, { deletedAt: now, trashedReason: "unpaid-expired" });
    }
    await batch.commit();
  }

  // Jeden wpis zbiorczy plus numery — inaczej dziennik zalałaby lawina wpisów,
  // a przy porządkach i tak liczy się to, co zniknęło z listy.
  await recordAudit({
    actorEmail: options.actorEmail ?? "system (sprzątanie)",
    action: "Automatyczne przeniesienie do kosza",
    details: `${candidates.length} nieopłaconych zamówień starszych niż ${ABANDONED_AFTER_DAYS} dni: ${orderNumbers.join(", ")}`,
  });

  return { matched: candidates.length, moved: candidates.length, orderNumbers };
}
