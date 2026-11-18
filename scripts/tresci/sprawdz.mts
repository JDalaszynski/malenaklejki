/**
 * Bramka systemu treści przed każdym pushem treści (`tresci/system.md`, sekcja 7):
 * rejestr, pliki stron, sitemapa, frontmatter wpisów i baza fraz muszą się zgadzać.
 *
 *   npm run tresci:sprawdz
 *
 * Kończy się błędem i listą problemów. Nie potrzebuje buildu ani sieci.
 */
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { STRONY_SPOZA_REJESTRU, WARTOSCI, czytajBaze, czytajRejestr, klucz, plik, type Tresc } from "./wspolne.mts";

const bledy: string[] = [];
const blad = (b: string) => bledy.push(b);
const DZIEN = /^\d{4}-\d{2}-\d{2}$/;

const rejestr = czytajRejestr();
const tresci = rejestr.tresci;
const opublikowane = tresci.filter((t) => t.status === "opublikowane");
const kolejka = tresci.filter((t) => t.status !== "opublikowane");
const poSciezce = new Map(tresci.map((t) => [t.sciezka, t]));

/** Zakazy z `blog-agent/facts.md` i `blog-agent/rules.md` §3 w polach, które trafiają na stronę i do panelu. */
const ZAKAZANE = /serwisow|gwarancyjn|plomb|zaprojektuj|projektowa|hologra|brokat|repozycjon|do zmywarki\b(?! -)/i;

// ---------------------------------------------------------------------------
// Rejestr
// ---------------------------------------------------------------------------

if (!DZIEN.test(rejestr.zaktualizowano)) blad("rejestr: zaktualizowano nie jest datą RRRR-MM-DD");
const ids = new Set<string>();
const sciezki = new Set<string>();
for (const t of tresci) {
  const at = `${t.id ?? "?"}`;
  if (ids.has(t.id)) blad(`${at}: powtórzone id`);
  if (sciezki.has(t.sciezka)) blad(`${at}: powtórzony adres ${t.sciezka}`);
  ids.add(t.id);
  sciezki.add(t.sciezka);
  for (const pole of ["id", "sciezka", "plik", "tytul", "nazwa", "zajawka", "fraza", "potrzeba", "odbiorca", "kotwica", "roznica"] as const) {
    if (!String(t[pole] ?? "").trim()) blad(`${at}: brak pola ${pole}`);
  }
  if (!/^\/[a-z0-9/-]*$/.test(t.sciezka)) blad(`${at}: adres ${t.sciezka} ma znaki spoza a-z, 0-9 i „-”`);
  if (!["landing", "wpis"].includes(t.typ)) blad(`${at}: typ ${t.typ}`);
  if (!["opublikowane", "w_kolejce", "wstrzymane"].includes(t.status)) blad(`${at}: status ${t.status}`);
  if (!["informacyjna", "komercyjna", "transakcyjna"].includes(t.intencja)) blad(`${at}: intencja ${t.intencja}`);
  if (!["TOFU", "MOFU", "BOFU"].includes(t.etap)) blad(`${at}: etap ${t.etap}`);
  if (!["P0", "P1", "P2"].includes(t.priorytet)) blad(`${at}: priorytet ${t.priorytet}`);
  if (!(t.segment in rejestr.segmenty)) blad(`${at}: segment ${t.segment} spoza listy segmenty`);
  if (!Array.isArray(t.frazy) || t.frazy.length > 6) blad(`${at}: frazy to lista do 6 pozycji`);
  if (!Array.isArray(t.pytania_ai)) blad(`${at}: pytania_ai to lista`);
  if (!t.cta?.href?.startsWith("/") || !t.cta?.tekst) blad(`${at}: cta musi mieć href od „/” i tekst`);
  if (t.zajawka.length > 200) blad(`${at}: zajawka ma ${t.zajawka.length} znaków (do 200)`);
  for (const [pole, tekst] of Object.entries({ tytul: t.tytul, nazwa: t.nazwa, zajawka: t.zajawka, cta: t.cta?.tekst ?? "" })) {
    if (tekst.includes("–")) blad(`${at}: półpauza w polu ${pole} - w sklepie dywiz „-” (blog-agent/rules.md §7)`);
    if (ZAKAZANE.test(tekst)) blad(`${at}: zakazane słowo w polu ${pole}: „${tekst.match(ZAKAZANE)![0]}”`);
  }
  if (t.typ === "wpis") {
    if (!/^\/blog\/[a-z0-9-]+$/.test(t.sciezka)) blad(`${at}: wpis musi leżeć w /blog/<slug>`);
    if (t.plik !== `src/content/blog/${t.sciezka.slice(6)}.md`) blad(`${at}: plik wpisu to src/content/blog/<slug>.md`);
    const filar = t.filar ? (poSciezce.get(t.filar) ?? STRONY_SPOZA_REJESTRU[t.filar]) : null;
    if (!filar) blad(`${at}: filar ${t.filar} nie istnieje w rejestrze ani na liście stron spoza rejestru`);
    const filarTresc = t.filar ? poSciezce.get(t.filar) : undefined;
    if (t.status === "opublikowane" && filarTresc && filarTresc.status !== "opublikowane") blad(`${at}: filar ${t.filar} nie jest opublikowany`);
  } else {
    if (t.filar !== null) blad(`${at}: landing ma filar null`);
    if (t.sciezka.startsWith("/blog")) blad(`${at}: landing nie leży w /blog`);
    if (t.plik !== `src/app${t.sciezka}/page.tsx`) blad(`${at}: plik landingu to src/app<adres>/page.tsx`);
  }
  if (t.okno && (!DZIEN.test(t.okno.od) || !DZIEN.test(t.okno.do) || t.okno.od > t.okno.do)) blad(`${at}: okno od-do musi być datami, od <= do`);
}

// ---------------------------------------------------------------------------
// Opublikowane: plik, daty, sitemapa i frontmatter
// ---------------------------------------------------------------------------

const sitemapa = readFileSync(plik("src/app/sitemap.ts"), "utf8");
const datySitemapy = new Map([...sitemapa.matchAll(/path: "(\/[^"]*)"(?:, lastModified: "([^"]+)")?/g)].map((m) => [m[1], m[2] ?? null]));
const tematy = readFileSync(plik("src/lib/sheets/themes.ts"), "utf8");
const datyTematow = new Map([...tematy.matchAll(/path: "(\/[^"]+)",[\s\S]*?lastModified: "([^"]+)"/g)].map((m) => [m[1], m[2]]));

function frontmatter(slug: string): Record<string, string> {
  const tekst = readFileSync(plik("src/content/blog", `${slug}.md`), "utf8");
  const fm = tekst.match(/^---([\s\S]*?)---/)?.[1] ?? "";
  return Object.fromEntries([...fm.matchAll(/^([a-z_A-Z]+):\s*"?([^"\n]*)"?\s*$/gm)].map((m) => [m[1], m[2].trim()]));
}

for (const t of opublikowane) {
  const at = t.id;
  if (!existsSync(plik(t.plik))) blad(`${at}: brak pliku ${t.plik}`);
  if (!DZIEN.test(t.opublikowano ?? "") || !DZIEN.test(t.zmieniono ?? "")) {
    blad(`${at}: opublikowana treść wymaga dat opublikowano i zmieniono`);
    continue;
  }
  if (t.zmieniono! < t.opublikowano!) blad(`${at}: zmieniono przed opublikowano`);
  for (const [k, v] of Object.entries(t.zgloszenia ?? {})) if (!DZIEN.test(String(v))) blad(`${at}: zgloszenia.${k} nie jest datą`);
  if (t.kolejnosc !== undefined) blad(`${at}: opublikowana treść nie ma kolejnosc (kolejność poprawy jest w zadanie)`);
  if (t.typ === "wpis" && existsSync(plik(t.plik))) {
    const fm = frontmatter(t.sciezka.slice(6));
    if (fm.date !== t.opublikowano) blad(`${at}: date we frontmatterze (${fm.date}) różni się od opublikowano (${t.opublikowano})`);
    const zmiana = fm.updated && fm.updated > fm.date ? fm.updated : fm.date;
    if (zmiana !== t.zmieniono) blad(`${at}: updated we frontmatterze (${zmiana}) różni się od zmieniono (${t.zmieniono}) - podbij oba naraz`);
  }
  if (t.typ === "landing") {
    const data = datySitemapy.get(t.sciezka) ?? datyTematow.get(t.sciezka);
    if (data === undefined) blad(`${at}: brak ${t.sciezka} w src/app/sitemap.ts ani w THEME_PAGES`);
    else if (data !== t.zmieniono) blad(`${at}: lastModified w sitemapie (${data}) różni się od zmieniono (${t.zmieniono}) - podbij oba naraz`);
  }
  const z = t.zadanie;
  if (z) {
    if (!["ctr", "poglebienie", "frazy", "konwersja", "linki", "odswiezenie"].includes(z.rodzaj)) blad(`${at}: zadanie.rodzaj ${z.rodzaj}`);
    for (const pole of ["tytul", "powod", "teza", "zrodlo"] as const) if (!z[pole]?.trim()) blad(`${at}: zadanie bez pola ${pole}`);
    if (!["P0", "P1", "P2"].includes(z.priorytet)) blad(`${at}: zadanie.priorytet ${z.priorytet}`);
    if (!DZIEN.test(z.dodano) || (z.od && !DZIEN.test(z.od))) blad(`${at}: zadanie.dodano i zadanie.od to daty`);
  }
}

// Każdy wpis i każdy landing serwisu jest w rejestrze.
for (const f of readdirSync(plik("src/content/blog")).filter((f) => f.endsWith(".md"))) {
  const sciezka = `/blog/${f.slice(0, -3)}`;
  if (!poSciezce.has(sciezka)) blad(`${sciezka}: wpis na stronie bez pozycji w rejestrze`);
}
const POZA_TRESCIAMI = new Set(["", "/kontakt", "/regulamin", "/polityka-prywatnosci", "/pliki-cookies", ...Object.keys(STRONY_SPOZA_REJESTRU)]);
for (const sciezka of [...datySitemapy.keys(), ...datyTematow.keys()]) {
  if (!POZA_TRESCIAMI.has(sciezka) && !poSciezce.has(sciezka)) blad(`${sciezka}: strona w sitemapie bez pozycji w rejestrze`);
}

// ---------------------------------------------------------------------------
// Kolejka: nowe strony i zadania poprawy w jednej kolejności
// ---------------------------------------------------------------------------

for (const t of kolejka) {
  const at = t.id;
  if (existsSync(plik(t.plik))) blad(`${at}: plik ${t.plik} istnieje, a status to ${t.status}`);
  if (!t.teza?.trim()) blad(`${at}: pozycja w kolejce bez tezy`);
  if (!(t.kolejnosc! > 0)) blad(`${at}: pozycja w kolejce bez kolejnosc`);
  if (t.status === "wstrzymane" && !t.warunek?.trim()) blad(`${at}: wstrzymana pozycja bez warunku`);
  if (t.zadanie) blad(`${at}: zadanie poprawy tylko przy opublikowanej treści`);
}
const miejsca = [...kolejka.map((t) => t.kolejnosc), ...opublikowane.filter((t) => t.zadanie).map((t) => t.zadanie!.kolejnosc)];
if (new Set(miejsca).size !== miejsca.length) blad(`kolejka: powtórzone miejsca w kolejności (${miejsca.sort((a, b) => a! - b!).join(", ")})`);

// ---------------------------------------------------------------------------
// Baza fraz
// ---------------------------------------------------------------------------

const baza = czytajBaze();
const wlasciciel = new Map<string, string>();
for (const w of baza) {
  const at = `fraza „${w.fraza}”`;
  for (const [kolumna, dozwolone] of Object.entries(WARTOSCI)) {
    const v = w[kolumna as keyof typeof w];
    if (!dozwolone!.includes(v)) blad(`${at}: ${kolumna} = „${v}” (dozwolone: ${dozwolone!.join(", ")})`);
  }
  if (!(w.segment in rejestr.segmenty)) blad(`${at}: segment ${w.segment} spoza listy segmenty`);
  if (w.oferta === "teraz" && w.docelowy_url !== "brak" && !poSciezce.has(w.docelowy_url) && !STRONY_SPOZA_REJESTRU[w.docelowy_url]) {
    blad(`${at}: docelowy_url ${w.docelowy_url} nie istnieje w rejestrze`);
  }
  if (w.oferta !== "teraz" && w.docelowy_url !== "brak") blad(`${at}: fraza poza ofertą albo na później ma docelowy_url = brak`);
  const strona = poSciezce.get(w.docelowy_url);
  const istnieje = w.oferta === "teraz" && (strona ? strona.status === "opublikowane" : !!STRONY_SPOZA_REJESTRU[w.docelowy_url]);
  if (w.oferta === "teraz" && (w.status_strony === "istnieje") !== istnieje) blad(`${at}: status_strony = ${w.status_strony}, a strona ${w.docelowy_url} ${istnieje ? "istnieje" : "nie istnieje"}`);
  const k = `${w.kanal === "google" ? "google" : "ai"}|${klucz(w.fraza)}`;
  if (wlasciciel.has(k) && wlasciciel.get(k) !== w.docelowy_url) blad(`${at}: dwóch właścicieli (${wlasciciel.get(k)} i ${w.docelowy_url})`);
  wlasciciel.set(k, w.docelowy_url);
}
const celujeWSwoje = (t: Tresc) => {
  for (const f of [t.fraza, ...t.frazy]) {
    const u = wlasciciel.get(`google|${klucz(f)}`);
    if (u === undefined) blad(`${t.id}: fraza „${f}” z rejestru nie ma wiersza w tresci/slowa-kluczowe.csv`);
    else if (u !== t.sciezka) blad(`${t.id}: fraza „${f}” należy w bazie do ${u}, nie do ${t.sciezka}`);
  }
};
tresci.forEach(celujeWSwoje);

const zmiany = JSON.parse(readFileSync(plik("tresci/frazy-zmiany.json"), "utf8"));
if (!Array.isArray(zmiany.zmiany)) blad("tresci/frazy-zmiany.json: brak listy zmiany");

if (bledy.length) {
  console.error(`System treści: ${bledy.length} ${bledy.length === 1 ? "problem" : "problemów"}:\n- ${bledy.join("\n- ")}`);
  process.exit(1);
}
const zadania = opublikowane.filter((t) => t.zadanie).length;
console.log(
  `System treści w porządku: ${opublikowane.length} opublikowanych (${opublikowane.filter((t) => t.typ === "landing").length} landingów), kolejka ${kolejka.length} nowych i ${zadania} zadań poprawy, baza ${baza.length} fraz.`,
);
