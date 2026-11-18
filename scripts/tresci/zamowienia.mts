/**
 * Zamówienia według strony, od której zaczęła się wizyta - miara konwersji treści
 * dla agenta treści (`tresci/system.md`, sekcja 9).
 *
 * Sklep zapisuje ścieżkę pierwszej strony wizyty przy każdym zamówieniu od 3.11.2026
 * (`landingPage`, bez cookies - patrz `src/lib/attribution.ts`), więc ta liczba widzi
 * wszystkich klientów, a nie tylko tych ze zgodą na analitykę jak GA4.
 *
 *   node --env-file=.env.local scripts/tresci/zamowienia.mts
 *
 * Tylko odczyt (`select` trzech pól). Wynik: `tresci/dane-sklep.json`, poza gitem,
 * bo repozytorium jest publiczne. Kwot nie zapisujemy - wystarczy liczba zamówień.
 */
import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

const KORZEN = fileURLToPath(new URL("../..", import.meta.url));
/** Od tego dnia zamówienia mają `landingPage`. */
const OD = "2026-11-03";

function klucz(): string {
  let k = process.env.FIREBASE_PRIVATE_KEY?.trim() ?? "";
  if ((k.startsWith('"') && k.endsWith('"')) || (k.startsWith("'") && k.endsWith("'"))) k = k.slice(1, -1);
  return k.replace(/\\n/g, "\n");
}

if (!process.env.FIREBASE_PROJECT_ID || !process.env.FIREBASE_CLIENT_EMAIL || !process.env.FIREBASE_PRIVATE_KEY) {
  console.error("Brak FIREBASE_* - uruchom przez node --env-file=.env.local.");
  process.exit(1);
}
const app =
  getApps()[0] ??
  initializeApp({ credential: cert({ projectId: process.env.FIREBASE_PROJECT_ID, clientEmail: process.env.FIREBASE_CLIENT_EMAIL, privateKey: klucz() }) });
const db = getFirestore(app);

const migawka = await db.collection("orders").where("createdAt", ">=", OD).select("landingPage", "status", "createdAt").get();

const strony = new Map<string, { zamowienia: number; oplacone: number }>();
let bezStrony = 0;
let oplaconeRazem = 0;
for (const doc of migawka.docs) {
  const status = String(doc.get("status") ?? "");
  const oplacone = status === "PAID" || status === "COMPLETED";
  if (oplacone) oplaconeRazem++;
  const strona = doc.get("landingPage");
  if (typeof strona !== "string" || !strona.startsWith("/")) {
    bezStrony++;
    continue;
  }
  const sciezka = strona.replace(/\/+$/, "") || "/";
  const s = strony.get(sciezka) ?? { zamowienia: 0, oplacone: 0 };
  s.zamowienia++;
  if (oplacone) s.oplacone++;
  strony.set(sciezka, s);
}

const dzis = new Date().toLocaleDateString("sv-SE", { timeZone: "Europe/Warsaw" });
const wynik = {
  opis: "Zamówienia według strony wejścia (landingPage) od 3.11.2026. Zapisuje scripts/tresci/zamowienia.mts. Nie commitować: repozytorium jest publiczne.",
  pobrano: new Date().toISOString(),
  okno: { od: OD, do: dzis },
  razem: { zamowienia: migawka.size, oplacone: oplaconeRazem, bezStrony },
  strony: [...strony.entries()].map(([sciezka, s]) => ({ sciezka, ...s })).sort((a, b) => b.oplacone - a.oplacone || b.zamowienia - a.zamowienia),
};
writeFileSync(join(KORZEN, "tresci/dane-sklep.json"), `${JSON.stringify(wynik, null, 2)}\n`);
console.log(`Zamówienia od ${OD}: ${migawka.size} (opłacone ${oplaconeRazem}), bez strony wejścia ${bezStrony}, stron wejścia ${strony.size}.`);
console.log("Zapisano tresci/dane-sklep.json.");
