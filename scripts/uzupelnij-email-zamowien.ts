/**
 * Uzupełnia pole `customerEmailLower` w istniejących zamówieniach.
 *
 * To po nim odnajdujemy zamówienia złożone bez logowania i przypinamy je do
 * konta po potwierdzeniu adresu e-mail. Zamówienia sprzed wdrożenia kont tego
 * pola nie mają, więc bez tego przebiegu ich historia nie dołączyłaby do konta.
 *
 * Przy okazji ustawia `deletedAt: null` i `fulfillmentStatus`, żeby stare
 * zamówienia zachowywały się w panelu tak samo jak nowe.
 *
 *   npx tsx scripts/uzupelnij-email-zamowien.ts
 *   npx tsx scripts/uzupelnij-email-zamowien.ts --na-sucho
 */
import * as admin from "firebase-admin";
import fs from "node:fs";

/**
 * Wczytuje zmienne z pliku `.env.local`.
 *
 * Skrypty uruchamiane przez `tsx` nie przechodzą przez Next.js, więc nikt nie
 * wczyta ich za nas — bez tego Admin SDK dostaje puste dane logowania.
 */
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
  if (privateKey?.startsWith('"') && privateKey.endsWith('"')) {
    privateKey = privateKey.slice(1, -1);
  }
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
  const snapshot = await db.collection("orders").get();

  let updated = 0;
  let batch = db.batch();
  let pending = 0;

  for (const doc of snapshot.docs) {
    const data = doc.data();
    const update: Record<string, unknown> = {};

    const email: string = data.customer?.email ?? "";
    if (email && !data.customerEmailLower) {
      update.customerEmailLower = email.toLowerCase().trim();
    }
    if (data.deletedAt === undefined) update.deletedAt = null;
    if (data.userId === undefined) update.userId = null;
    if (!data.fulfillmentStatus) update.fulfillmentStatus = "NEW";
    if (!data.source) update.source = "shop";

    if (Object.keys(update).length === 0) continue;

    updated++;
    if (dryRun) continue;

    batch.update(doc.ref, update);
    pending++;

    // Firestore przyjmuje maksymalnie 500 operacji w jednej paczce.
    if (pending === 400) {
      await batch.commit();
      batch = db.batch();
      pending = 0;
    }
  }

  if (!dryRun && pending > 0) await batch.commit();

  console.log(
    dryRun
      ? `Do uzupełnienia: ${updated} z ${snapshot.size} zamówień (nic nie zapisano).`
      : `Uzupełniono ${updated} z ${snapshot.size} zamówień.`
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
