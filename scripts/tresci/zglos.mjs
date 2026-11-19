// Zgłoszenie treści po wdrożeniu: kontrola strony na produkcji, IndexNow i adresy do GSC.
//
// Użycie (procedura w tresci/system.md, sekcja 6):
//   npm run tresci:zglos -- --nowa /blog/naklejki-walentynkowe     nowy wpis: dokłada /blog
//   npm run tresci:zglos -- /fotonaklejki                           istotna aktualizacja
//   npm run tresci:zglos -- --czekaj --nowa /blog/x                 najpierw czeka na wdrożenie Vercela
//   npm run tresci:zglos -- --sprawdz /blog/x                       tylko kontrola, bez IndexNow i zapisu
//   ... --gsc                                                       wypisuje adresy do „Sprawdź dowolny URL” w GSC
//
// Kontrola: 200, brak `noindex`, canonical na siebie, <title>, adres w sitemapie.
// Bez pętli po produkcji: z `--czekaj` pierwsze wejście po 2 min, potem najwyżej
// 3 kolejne co 90 s. Po zgłoszeniu zapisuje datę w `zgloszenia.indexnow` pozycji rejestru.
// Klucz IndexNow to plik public/ping-sitemap.txt (jawny z założenia).
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const root = new URL("../..", import.meta.url).pathname;
const ADRES = "https://www.malenaklejki.pl";
const REJESTR = join(root, "tresci/rejestr.json");
const KLUCZ = readFileSync(join(root, "public/ping-sitemap.txt"), "utf8").trim();

const arg = process.argv.slice(2);
const czekaj = arg.includes("--czekaj");
const nowa = arg.includes("--nowa");
const tylkoSprawdz = arg.includes("--sprawdz");
const gsc = arg.includes("--gsc");
const podane = arg.filter((a) => a.startsWith("/"));
if (!podane.length) {
  console.error("Podaj ścieżki, np. npm run tresci:zglos -- --nowa /blog/naklejki-walentynkowe");
  process.exit(1);
}
// Nowy wpis zmienia też listę na /blog, więc /blog idzie razem z nim.
const sciezki = [...new Set([...podane, ...(nowa && podane.some((s) => s.startsWith("/blog/")) ? ["/blog"] : [])])];

const pauza = (s) => new Promise((r) => setTimeout(r, s * 1000));
const dzis = new Date().toLocaleDateString("sv-SE", { timeZone: "Europe/Warsaw" });

async function kontrola(sciezka, mapa) {
  const url = `${ADRES}${sciezka}`;
  const odp = await fetch(url, { redirect: "manual", headers: { "User-Agent": "malenaklejki-zglos/1.0" } });
  const html = odp.status === 200 ? await odp.text() : "";
  const canonical = html.match(/<link rel="canonical" href="([^"]+)"/)?.[1];
  const bledy = [];
  if (odp.status === 403 && odp.headers.get("x-vercel-mitigated")) bledy.push("403 z kontrolą Vercela - nie ponawiaj teraz, sprawdź stronę w przeglądarce");
  else if (odp.status !== 200) bledy.push(`status ${odp.status}`);
  if (/noindex/i.test(odp.headers.get("x-robots-tag") ?? "")) bledy.push("nagłówek X-Robots-Tag: noindex");
  if (html && /<meta name="robots" content="[^"]*noindex/i.test(html)) bledy.push("meta robots noindex");
  if (html && (!canonical || new URL(canonical, ADRES).href.replace(/\/$/, "") !== url.replace(/\/$/, ""))) bledy.push(`canonical ${canonical ?? "brak"} zamiast ${url}`);
  if (html && !/<title>[^<]+<\/title>/.test(html)) bledy.push("brak <title>");
  const bezUkosnika = url.replace(/\/$/, "");
  if (!mapa.includes(`<loc>${bezUkosnika}</loc>`) && !mapa.includes(`<loc>${bezUkosnika}/</loc>`)) bledy.push("brak w sitemap.xml");
  return bledy;
}

async function sprawdzWszystkie() {
  const mapa = await fetch(`${ADRES}/sitemap.xml`).then((r) => (r.ok ? r.text() : ""));
  const wynik = {};
  for (const s of sciezki) wynik[s] = await kontrola(s, mapa);
  return wynik;
}

let wynik;
const proby = czekaj ? 4 : 1;
for (let i = 0; i < proby; i++) {
  if (czekaj) {
    const s = i === 0 ? 120 : 90;
    console.log(`Czekam ${s} s na wdrożenie (próba ${i + 1} z ${proby})…`);
    await pauza(s);
  }
  wynik = await sprawdzWszystkie();
  if (Object.values(wynik).every((b) => !b.length)) break;
  if (Object.values(wynik).some((b) => b.some((x) => x.startsWith("403")))) break;
}

let ok = true;
for (const [s, bledy] of Object.entries(wynik)) {
  console.log(`${bledy.length ? "✗" : "✓"} ${ADRES}${s}${bledy.length ? `: ${bledy.join("; ")}` : ""}`);
  if (bledy.length) ok = false;
}
if (!ok) {
  console.error("\nNie zgłaszam: najpierw wdrożenie i poprawna strona. Ponów za kilka minut, bez pętli.");
  process.exit(2);
}
if (tylkoSprawdz) process.exit(0);

const odp = await fetch("https://api.indexnow.org/indexnow", {
  method: "POST",
  headers: { "Content-Type": "application/json; charset=utf-8" },
  body: JSON.stringify({ host: new URL(ADRES).host, key: KLUCZ, keyLocation: `${ADRES}/ping-sitemap.txt`, urlList: sciezki.map((s) => `${ADRES}${s}`) }),
});
console.log(`\nIndexNow: ${odp.status} ${odp.statusText} (${sciezki.length} adresów)`);
if (!odp.ok) process.exit(1);

// Data zgłoszenia w rejestrze: panel pokazuje ją przy treści.
const rejestr = JSON.parse(readFileSync(REJESTR, "utf8"));
const zapisane = [];
for (const t of rejestr.tresci) {
  if (sciezki.includes(t.sciezka)) {
    t.zgloszenia = { ...(t.zgloszenia ?? {}), indexnow: dzis };
    zapisane.push(t.id);
  }
}
if (zapisane.length) {
  writeFileSync(REJESTR, `${JSON.stringify(rejestr, null, 2)}\n`);
  console.log(`Zapisano zgloszenia.indexnow = ${dzis} w tresci/rejestr.json: ${zapisane.join(", ")}.`);
}

if (gsc) {
  console.log("\nGSC (usługa sc-domain:malenaklejki.pl): wpisz adres w pole „Sprawdź dowolny URL”, potem „Poproś o zindeksowanie”.");
  console.log("Najwyżej ok. 10 próśb dziennie i raz na adres w ciągu 7 dni. Bezpośredni link /inspect?id= daje 404.");
  for (const s of podane) console.log(`  ${ADRES}${s}`);
  console.log("Po prośbie wpisz datę w zgloszenia.gsc tej pozycji w tresci/rejestr.json.");
}
