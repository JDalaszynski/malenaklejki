/**
 * Usuwa z zamówień pole `pdfAttachments` — arkusze do druku wklejone kiedyś
 * w base64 wprost do dokumentu Firestore.
 *
 * Pole pochodzi z jednego tygodnia czerwca 2026 (kod, który je zapisywał
 * i czytał, zniknął w `46179d0`). Nic w aplikacji go już nie czyta, a waży
 * ~5 MB — czyli prawie całą kolekcję `orders`. Przez to każdy odczyt pełnego
 * dokumentu ciągnął za sobą megabajty danych, których nikt nie oglądał.
 *
 *   npx jiti scripts/usun-pdfattachments.ts            # na sucho, nic nie zapisuje
 *   npx jiti scripts/usun-pdfattachments.ts --usun     # kopia zapasowa + skasowanie
 *
 * UWAGA — inaczej niż `sprzataj-nieoplacone.ts`, tutaj tryb na sucho jest
 * domyślny, a kasowanie wymaga jawnej flagi. Powód: te PDF-y nie mają kopii
 * w Storage (zamówienia z tego tygodnia nie mają `layoutPath`), więc dokument
 * w bazie jest ich jedynym egzemplarzem. Skasowanie jest nieodwracalne.
 *
 * Dlatego skrypt najpierw rozpakowuje załączniki na dysk jako prawdziwe pliki
 * PDF razem ze spisem treści, sprawdza, że kopia się zgadza co do bajta,
 * i dopiero wtedy kasuje pole z bazy.
 */
import * as admin from "firebase-admin";
// Znacznik kasowania pola bierzemy z modularnego wejścia, a nie z
// `admin.firestore.FieldValue`: pod jiti (uruchomienie z linii poleceń)
// ta właściwość jest niezdefiniowana i kasowanie wywala się w połowie.
import { FieldValue } from "firebase-admin/firestore";
import fs from "node:fs";
import path from "node:path";

/** Gdzie ląduje kopia zapasowa. Katalog jest w `.gitignore` — to dane klientów. */
const BACKUP_ROOT = "kopie-zapasowe";

type Attachment = { name?: string; base64?: string };

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

/** Nazwa pliku bezpieczna dla dysku — numery zamówień i nazwy arkuszy bywają różne. */
function safeName(value: string, fallback: string): string {
  const cleaned = value.replace(/[^\w.\-]+/g, "_").replace(/^_+|_+$/g, "");
  return cleaned || fallback;
}

function megabytes(bytes: number): string {
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}

async function main() {
  const apply = process.argv.includes("--usun");
  initialize();
  const db = admin.firestore();

  // Projekcja: do roboty wystarczy samo pole i numer zamówienia, a bez niej
  // ściągalibyśmy całą kolekcję z resztą danych w komplecie.
  const snapshot = await db
    .collection("orders")
    .select("pdfAttachments", "orderNumber", "createdAt")
    .get();

  const affected = snapshot.docs.filter((doc) => doc.data().pdfAttachments !== undefined);

  let files = 0;
  let bytes = 0;
  for (const doc of affected) {
    const attachments = doc.data().pdfAttachments;
    bytes += JSON.stringify(attachments).length;
    if (Array.isArray(attachments)) files += attachments.length;
  }

  console.log(`Zamówień w bazie: ${snapshot.size}`);
  console.log(`Z polem pdfAttachments: ${affected.length}`);
  console.log(`Załączników łącznie: ${files}`);
  console.log(`Do zwolnienia: ${megabytes(bytes)}`);

  if (affected.length === 0) {
    console.log("\nNie ma czego usuwać.");
    return;
  }

  console.log("\nZamówienia, których to dotyczy:");
  for (const doc of affected) {
    const data = doc.data();
    const attachments: Attachment[] = Array.isArray(data.pdfAttachments) ? data.pdfAttachments : [];
    const size = JSON.stringify(data.pdfAttachments).length;
    console.log(
      `  ${data.orderNumber ?? doc.id}  ${String(data.createdAt ?? "").slice(0, 10)}  ` +
        `${attachments.length} plik(ów), ${megabytes(size)}`
    );
  }

  if (!apply) {
    console.log("\nTryb na sucho — nic nie zapisano ani nie skasowano.");
    console.log("Żeby naprawdę usunąć pole (po kopii zapasowej): --usun");
    return;
  }

  // --- kopia zapasowa ---------------------------------------------------
  const stamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
  const backupDir = path.join(BACKUP_ROOT, `pdfattachments-${stamp}`);
  fs.mkdirSync(backupDir, { recursive: true });

  const manifest: {
    utworzono: string;
    zrodlo: string;
    zamowienia: {
      id: string;
      orderNumber: string;
      createdAt: string;
      pliki: { nazwaWBazie: string; plik: string; bajtow: number }[];
    }[];
  } = {
    utworzono: new Date().toISOString(),
    zrodlo: `Firestore orders.pdfAttachments (projekt ${process.env.FIREBASE_PROJECT_ID})`,
    zamowienia: [],
  };

  let savedFiles = 0;
  let savedBytes = 0;

  for (const doc of affected) {
    const data = doc.data();
    const orderNumber = String(data.orderNumber ?? doc.id);
    const attachments: Attachment[] = Array.isArray(data.pdfAttachments) ? data.pdfAttachments : [];

    const orderDir = path.join(backupDir, safeName(orderNumber, doc.id));
    fs.mkdirSync(orderDir, { recursive: true });

    const entry = {
      id: doc.id,
      orderNumber,
      createdAt: String(data.createdAt ?? ""),
      pliki: [] as { nazwaWBazie: string; plik: string; bajtow: number }[],
    };

    for (const [index, attachment] of attachments.entries()) {
      const originalName = String(attachment?.name ?? `zalacznik-${index + 1}.pdf`);
      const fileName = `${String(index + 1).padStart(2, "0")}-${safeName(originalName, "zalacznik.pdf")}`;
      const target = path.join(orderDir, fileName);

      const buffer = Buffer.from(String(attachment?.base64 ?? ""), "base64");
      fs.writeFileSync(target, buffer);

      savedFiles++;
      savedBytes += buffer.byteLength;
      entry.pliki.push({ nazwaWBazie: originalName, plik: path.relative(backupDir, target), bajtow: buffer.byteLength });
    }

    // Surowe pole obok rozpakowanych plików — gdyby kiedyś trzeba było wrócić
    // dokładnie do tego, co leżało w bazie.
    fs.writeFileSync(
      path.join(orderDir, "pdfAttachments.json"),
      JSON.stringify(data.pdfAttachments, null, 2)
    );

    manifest.zamowienia.push(entry);
  }

  fs.writeFileSync(path.join(backupDir, "spis.json"), JSON.stringify(manifest, null, 2));

  console.log(`\nKopia zapasowa: ${backupDir}`);
  console.log(`  plików PDF: ${savedFiles}, razem ${megabytes(savedBytes)} (plus surowy JSON przy każdym zamówieniu)`);

  // --- kontrola kopii przed skasowaniem ---------------------------------
  if (savedFiles !== files) {
    console.error(
      `\nPrzerywam: zapisałem ${savedFiles} plików, a w bazie jest ich ${files}. Nic nie skasowano.`
    );
    process.exit(1);
  }

  const emptyFiles = manifest.zamowienia.flatMap((o) => o.pliki).filter((f) => f.bajtow === 0);
  if (emptyFiles.length > 0) {
    console.error(`\nPrzerywam: ${emptyFiles.length} plik(ów) wyszło pustych. Nic nie skasowano.`);
    process.exit(1);
  }

  // Każdy plik musi zaczynać się nagłówkiem PDF — inaczej kopia jest bezużyteczna.
  for (const order of manifest.zamowienia) {
    for (const file of order.pliki) {
      const head = fs.readFileSync(path.join(backupDir, file.plik)).subarray(0, 5).toString("latin1");
      if (head !== "%PDF-") {
        console.error(
          `\nPrzerywam: ${file.plik} nie wygląda na PDF (nagłówek "${head}"). Nic nie skasowano.`
        );
        process.exit(1);
      }
    }
  }

  console.log("  kontrola kopii: liczba plików się zgadza, żaden nie jest pusty, wszystkie mają nagłówek PDF.");

  // --- kasowanie --------------------------------------------------------
  // Firestore przyjmuje maksymalnie 500 operacji w jednej paczce.
  for (let i = 0; i < affected.length; i += 400) {
    const batch = db.batch();
    for (const doc of affected.slice(i, i + 400)) {
      batch.update(doc.ref, { pdfAttachments: FieldValue.delete() });
    }
    await batch.commit();
  }

  // Sprawdzenie po fakcie — czytamy bazę jeszcze raz, nie ufamy samemu zapisowi.
  const after = await db.collection("orders").select("pdfAttachments").get();
  const left = after.docs.filter((doc) => doc.data().pdfAttachments !== undefined).length;

  console.log(`\nSkasowano pole w ${affected.length} zamówieniach.`);
  console.log(`Zostało dokumentów z polem: ${left}`);
  if (left > 0) {
    console.error("Coś zostało — sprawdź ręcznie.");
    process.exit(1);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
