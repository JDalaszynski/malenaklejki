/**
 * Wdraża `storage.rules` do Firebase Storage.
 *
 * Reguły nie jadą na produkcję razem z kodem — Vercel wdraża tylko stronę,
 * a narzędzia `firebase` w projekcie nie ma. Ten skrypt robi to samo co
 * `firebase deploy --only storage`, kontem serwisowym z `.env.local`.
 *
 *   npx tsx scripts/wdroz-reguly-storage.ts            # porównuje i wdraża
 *   npx tsx scripts/wdroz-reguly-storage.ts --sprawdz  # tylko porównuje
 *
 * Firebase sprawdza składnię przy przyjmowaniu zestawu, więc błąd w pliku
 * kończy się komunikatem, a nie zepsutymi regułami. Nowe reguły zaczynają
 * obowiązywać po chwili (do minuty).
 */
import * as admin from "firebase-admin";
import fs from "node:fs";

const RULES_FILE = "storage.rules";

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
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  });
}

/** Wiersze, które wdrożenie usunie (−) i doda (+) — bez kontekstu, do szybkiego przejrzenia. */
function printDiff(deployed: string, local: string) {
  const before = deployed.split("\n").map((line) => line.trimEnd());
  const after = local.split("\n").map((line) => line.trimEnd());
  const removed = before.filter((line) => line.trim() && !after.includes(line));
  const added = after.filter((line) => line.trim() && !before.includes(line));
  for (const line of removed) console.log(`  − ${line}`);
  for (const line of added) console.log(`  + ${line}`);
}

async function main() {
  const checkOnly = process.argv.includes("--sprawdz");

  if (!fs.existsSync(RULES_FILE)) {
    console.error(`Nie znalazłem pliku ${RULES_FILE} — uruchom skrypt z katalogu projektu.`);
    process.exit(1);
  }
  const local = fs.readFileSync(RULES_FILE, "utf8");

  initialize();
  const rules = admin.securityRules();

  const current = await rules.getStorageRuleset();
  const deployed = current.source.map((file) => file.content).join("\n");
  console.log(`Na produkcji: zestaw ${current.name} z ${current.createTime}`);

  if (deployed.trim() === local.trim()) {
    console.log(`Reguły na produkcji są zgodne z ${RULES_FILE} — nic do wdrożenia.`);
    return;
  }

  console.log(`Reguły na produkcji różnią się od ${RULES_FILE}:`);
  printDiff(deployed, local);
  if (checkOnly) return;

  const released = await rules.releaseStorageRulesetFromSource(local);
  console.log(`Wdrożono: zestaw ${released.name} z ${released.createTime}`);
  console.log("Nowe reguły zaczną obowiązywać w ciągu minuty.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
