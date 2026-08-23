/**
 * Przenosi do kosza zamówienia, które od ponad tygodnia czekają na płatność
 * albo mają płatność nieudaną.
 *
 * Ta sama reguła działa automatycznie w zadaniu cyklicznym i pod przyciskiem
 * w panelu — wszystkie trzy korzystają z jednego warunku (src/lib/orders/sweepRules.ts),
 * więc nie mogą się rozjechać.
 *
 *   npx tsx scripts/sprzataj-nieoplacone.ts --na-sucho
 *   npx tsx scripts/sprzataj-nieoplacone.ts
 *
 * Nic nie jest usuwane trwale — zamówienia lądują w koszu i można je przywrócić
 * w panelu. Spóźniona wpłata także wyjmuje zamówienie z kosza automatycznie.
 */
import * as admin from "firebase-admin";
import fs from "node:fs";

import { ABANDONED_AFTER_DAYS, isSweepable, sweepCutoffIso } from "../src/lib/orders/sweepRules";

function loadEnv() {
  for (const name of [".env.local", "env.local", ".env"]) {
    if (!fs.existsSync(name)) continue;
    for (const line of fs.readFileSync(name, "utf8").split("\n")) {
      const match = /^([A-Z0-9_]+)=(.*)$/.exec(line.trim());
      if (!match) continue;
      let value = match[2].trim();
      if (value.startsWith('"')) {
        const end = value.indexOf('"', 1);
        if (end > 0) value = value.slice(1, end);
      } else {
        value = value.split(" #")[0].trim();
      }
      if (process.env[match[1]] === undefined) process.env[match[1]] = value;
    }
    return;
  }
  console.error("Nie znalazłem pliku ze zmiennymi (.env.local).");
  process.exit(1);
}

function initialize() {
  if (admin.apps.length) return;
  loadEnv();

  let privateKey = process.env.FIREBASE_PRIVATE_KEY?.trim();
  if (privateKey?.startsWith('"') && privateKey.endsWith('"')) privateKey = privateKey.slice(1, -1);
  privateKey = privateKey?.replace(/\\n/g, "\n");

  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey,
    }),
  });
}

async function main() {
  const dryRun = process.argv.includes("--na-sucho");
  initialize();

  const db = admin.firestore();
  const cutoff = sweepCutoffIso();
  const snapshot = await db.collection("orders").get();

  const candidates = snapshot.docs.filter((doc) => isSweepable(doc.data(), cutoff));

  console.log(
    `Zamówień nieopłaconych starszych niż ${ABANDONED_AFTER_DAYS} dni: ${candidates.length} (z ${snapshot.size} w bazie)`
  );

  const byStatus: Record<string, number> = {};
  let amount = 0;
  for (const doc of candidates) {
    const data = doc.data();
    byStatus[data.status] = (byStatus[data.status] ?? 0) + 1;
    amount += data.totals?.total ?? 0;
  }
  console.log("  wg statusu:", byStatus);
  console.log(`  łączna kwota nieopłacona: ${amount.toFixed(2)} zł`);

  if (dryRun) {
    console.log("\nTryb na sucho — nic nie zapisano.");
    return;
  }
  if (candidates.length === 0) return;

  const now = new Date().toISOString();
  for (let i = 0; i < candidates.length; i += 400) {
    const batch = db.batch();
    for (const doc of candidates.slice(i, i + 400)) {
      batch.update(doc.ref, { deletedAt: now, trashedReason: "unpaid-expired" });
    }
    await batch.commit();
  }

  await db.collection("auditLog").add({
    at: now,
    actorEmail: "skrypt sprzataj-nieoplacone",
    action: "Przeniesienie do kosza",
    orderId: null,
    orderNumber: null,
    details: `${candidates.length} nieopłaconych zamówień starszych niż ${ABANDONED_AFTER_DAYS} dni: ${candidates
      .map((d) => d.data().orderNumber)
      .join(", ")}`,
  });

  console.log(`\nPrzeniesiono do kosza: ${candidates.length}. Można je przywrócić w panelu.`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
