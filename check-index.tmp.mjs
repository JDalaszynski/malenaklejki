// Sprawdzenie, czy indeks (status + paidAt) jest już aktywny — samo zapytanie, bez zapisu.
import fs from "node:fs";
import admin from "firebase-admin";

for (const line of fs.readFileSync(".env.local", "utf8").split("\n")) {
  const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)$/);
  if (!m) continue;
  let v = m[2].trim();
  if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) v = v.slice(1, -1);
  process.env[m[1]] = v.replace(/\\n/g, "\n");
}

admin.initializeApp({
  credential: admin.credential.cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY,
  }),
});

const since = new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString();
try {
  const snap = await admin.firestore().collection("orders")
    .where("status", "==", "PAID").where("paidAt", ">=", since).get();
  console.log(`OK — indeks działa. Zamówień PAID z ostatnich 3 dni: ${snap.size}`);
  const missing = snap.docs.filter((d) => !d.data().paidNotificationsSentAt);
  console.log(`Bez znacznika paidNotificationsSentAt: ${missing.length}`);
} catch (e) {
  console.log("BŁĄD:", e.code, e.message.slice(0, 300));
}
process.exit(0);
