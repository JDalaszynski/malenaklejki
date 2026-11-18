/**
 * Baza fraz dla agenta treści i panelu: `tresci/slowa-kluczowe.csv` z właścicielem
 * i rolą z rejestru treści, miejscami, w których fraza stoi na stronie (z HTML po
 * `npm run build`), oraz liczbami z Search Console, GA4 i zamówień według strony wejścia.
 *
 *   npm run tresci:frazy                                zapisuje tresci/frazy.json, wypisuje braki, kolizje i sygnały
 *   npm run tresci:frazy -- --sprawdz /blog/x /fotonaklejki   to samo, a do tego błąd, gdy te strony mają braki albo cudzą frazę w title lub H1
 *
 * Dane z Google: `npm run panel:dane-tresci -- --project malenaklejki` w ~/Desktop/jdalaszynski,
 * zamówienia: `npm run tresci:zamowienia`. Bez nich baza powstaje, tylko bez liczb.
 * Panel bierze plik poleceniem `npm run panel:frazy -- --project malenaklejki`.
 * Zasady: tresci/system.md, sekcja 11.
 */
import { existsSync, readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import {
  STRONY_SPOZA_REJESTRU,
  czytajBaze,
  czytajHtml,
  czytajRejestr,
  dzis,
  klucz,
  koliduje,
  plik,
  plikHtml,
  wystepuje,
  bezPytania,
  type StronaHtml,
  type WierszFrazy,
} from "./wspolne.mts";

const arg = process.argv.slice(2);
const sprawdz = arg.includes("--sprawdz");
const sprawdzane = arg.filter((a) => a.startsWith("/"));

const MIEJSCA = ["url", "title", "meta", "h1", "wstep", "naglowki", "faq", "alt", "tekst", "kotwice"] as const;
type Miejsce = (typeof MIEJSCA)[number];
const WYMAGANE = {
  glowna: ["title", "meta", "h1", "wstep"] as Miejsce[],
  /** Wystarczy jedno z tych miejsc. */
  wspierajaca: ["title", "h1", "naglowki", "faq"] as Miejsce[],
};
type Rola = "glowna" | "wspierajaca" | "pytanie" | "wariant" | "pozniej";

const rejestr = czytajRejestr();
const wiersze = czytajBaze();
const historia = JSON.parse(readFileSync(plik("tresci/frazy-zmiany.json"), "utf8")) as { zmiany: { id: string; obsluzono: string }[] };
const czytajJson = (nazwa: string) => (existsSync(plik("tresci", nazwa)) ? JSON.parse(readFileSync(plik("tresci", nazwa), "utf8")) : null);
const google = czytajJson("dane-google.json");
const sklep = czytajJson("dane-sklep.json");

if (!existsSync(plik(".next/server/app/index.html"))) {
  console.error("Brak gotowych stron w .next/server/app. Najpierw: npm run build");
  process.exit(1);
}

/** Najnowsza zmiana treści; build starszy od niej liczy użycie na starej treści. */
function najnowsza(sciezka: string): number {
  const s = statSync(sciezka);
  if (!s.isDirectory()) return s.mtimeMs;
  return Math.max(0, ...readdirSync(sciezka).map((n) => najnowsza(join(sciezka, n))));
}
const zbudowano = statSync(plik(".next/BUILD_ID")).mtimeMs;
const zrodla = Math.max(najnowsza(plik("src/content/blog")), ...rejestr.tresci.map((t) => (existsSync(plik(t.plik)) ? statSync(plik(t.plik)).mtimeMs : 0)));
const staryBuild = zrodla > zbudowano;

// ---------------------------------------------------------------------------
// Strony
// ---------------------------------------------------------------------------

interface Liczby {
  klik: number;
  wysw: number;
  ctr: number;
  poz: number | null;
  klik28: number;
  wysw28: number;
  klikPrzed28: number;
  wyswPrzed28: number;
}

interface StronaBazy {
  sciezka: string;
  nazwa: string;
  tresc: string | null;
  typ: "landing" | "wpis" | "strona";
  status: string;
  fraza: string | null;
  priorytet?: string;
  title?: string;
  slowa?: number;
  ctaKreatora?: number;
  braki?: { fraza: string; rola: "glowna" | "wspierajaca"; brak: Miejsce[] }[];
  gsc?: Liczby;
  ga4?: { sesje: number; zaangazowane: number; koszyk: number; kasa: number; zakupy: number };
  zamowienia?: number;
  /** Sygnały do poprawy, policzone regułami z `tresci/system.md`, sekcja 9. */
  uwagi?: string[];
}

const strony: StronaBazy[] = [
  ...Object.entries(STRONY_SPOZA_REJESTRU)
    .slice(0, 1)
    .map(([sciezka, s]): StronaBazy => ({ sciezka, nazwa: s.nazwa, tresc: null, typ: "strona", status: "opublikowane", fraza: s.fraza ?? null })),
  ...rejestr.tresci.map((t): StronaBazy => ({ sciezka: t.sciezka, nazwa: t.nazwa, tresc: t.id, typ: t.typ, status: t.status, fraza: t.fraza, priorytet: t.zadanie?.priorytet ?? t.priorytet })),
  ...Object.entries(STRONY_SPOZA_REJESTRU)
    .slice(1)
    .map(([sciezka, s]): StronaBazy => ({ sciezka, nazwa: s.nazwa, tresc: null, typ: "strona", status: "opublikowane", fraza: s.fraza ?? null })),
];

const html = new Map<string, StronaHtml>();
for (const s of strony) {
  if (s.status !== "opublikowane") continue;
  const h = plikHtml(s.sciezka);
  if (h) html.set(s.sciezka, czytajHtml(s.sciezka, h));
}

// ---------------------------------------------------------------------------
// Frazy: właściciel i rola
// ---------------------------------------------------------------------------

interface FrazaBazy extends Omit<WierszFrazy, "kanal"> {
  kanaly: string[];
  wlasciciel: string | null;
  rola: Rola;
  uzycie?: Miejsce[];
  kolizje?: { sciezka: string; miejsca: Miejsce[] }[];
  /** Search Console, 90 dni: zapytanie identyczne z frazą (po normalizacji) na stronie-właścicielu. */
  gsc?: { klik: number; wysw: number; poz: number };
  /** To samo zapytanie na innych stronach serwisu. Więcej wyświetleń niż u właściciela = Google wybiera inną stronę. */
  gscInne?: { sciezka: string; klik: number; wysw: number; poz: number }[];
}

const tresciPoSciezce = new Map(rejestr.tresci.map((t) => [t.sciezka, t]));

function rolaFrazy(w: WierszFrazy): Rola {
  if (w.oferta !== "teraz" || w.docelowy_url === "brak") return "pozniej";
  if (w.kanal !== "google") return "pytanie";
  const f = klucz(w.fraza);
  const t = tresciPoSciezce.get(w.docelowy_url);
  const spoza = STRONY_SPOZA_REJESTRU[w.docelowy_url];
  const glowna = t?.fraza ?? spoza?.fraza;
  const wspierajace = t?.frazy ?? spoza?.frazy ?? [];
  if (glowna && klucz(glowna) === f) return "glowna";
  if (wspierajace.some((x) => klucz(x) === f)) return "wspierajaca";
  return "wariant";
}

const frazyMapa = new Map<string, FrazaBazy>();
for (const w of wiersze) {
  const k = `${w.kanal === "google" ? "google" : "ai"}|${klucz(w.fraza)}`;
  const istniejaca = frazyMapa.get(k);
  if (istniejaca) {
    if (!istniejaca.kanaly.includes(w.kanal)) istniejaca.kanaly.push(w.kanal);
    continue;
  }
  const t = tresciPoSciezce.get(w.docelowy_url);
  const { kanal, ...pola } = w;
  frazyMapa.set(k, { ...pola, kanaly: [kanal], wlasciciel: t ? t.id : STRONY_SPOZA_REJESTRU[w.docelowy_url] ? w.docelowy_url : null, rola: rolaFrazy(w) });
}
const frazy = [...frazyMapa.values()];

// ---------------------------------------------------------------------------
// Użycie na stronie, kolizje i braki
// ---------------------------------------------------------------------------

function gdzieStoi(fraza: string, strona: StronaHtml, kotwice: string[]): Miejsce[] {
  const wCalym = (tekst: string) => wystepuje(fraza, tekst, 99);
  const jest: Record<Miejsce, boolean> = {
    url: wCalym(strona.sciezka.replace(/[/-]/g, " ")),
    title: wCalym(strona.title),
    meta: wystepuje(fraza, strona.meta),
    h1: wCalym(strona.h1),
    wstep: wystepuje(bezPytania(fraza), strona.wstep),
    naglowki: strona.naglowki.some(wCalym),
    faq: strona.faq.some((f) => wystepuje(fraza, f)),
    alt: strona.alt.some((a) => wystepuje(fraza, a)),
    tekst: wystepuje(fraza, strona.tekst),
    kotwice: kotwice.some(wCalym),
  };
  return MIEJSCA.filter((m) => jest[m]);
}

const kotwiceDo = new Map<string, string[]>();
for (const s of html.values()) {
  for (const l of s.linki) if (l.href !== s.sciezka) kotwiceDo.set(l.href, [...(kotwiceDo.get(l.href) ?? []), l.tekst]);
}
for (const f of frazy) {
  const strona = html.get(f.docelowy_url);
  if (!strona) continue;
  f.uzycie = gdzieStoi(f.fraza, strona, kotwiceDo.get(f.docelowy_url) ?? []);
  if (f.rola !== "glowna" && f.rola !== "wspierajaca") continue;
  const kolizje = [...html.values()]
    .filter((inna) => inna.sciezka !== f.docelowy_url)
    .map((inna) => ({ sciezka: inna.sciezka, miejsca: (["title", "h1"] as const).filter((m) => koliduje(f.fraza, inna[m])) as Miejsce[] }))
    .filter((k) => k.miejsca.length);
  if (kolizje.length) f.kolizje = kolizje;
}
for (const s of strony) {
  if (s.status !== "opublikowane" || !html.has(s.sciezka)) continue;
  const braki = frazy
    .filter((f) => f.docelowy_url === s.sciezka && (f.rola === "glowna" || f.rola === "wspierajaca"))
    .map((f) => {
      const wymagane = WYMAGANE[f.rola as "glowna" | "wspierajaca"];
      const brak = f.rola === "glowna" ? wymagane.filter((m) => !f.uzycie?.includes(m)) : wymagane.some((m) => f.uzycie?.includes(m)) ? [] : wymagane;
      return { fraza: f.fraza, rola: f.rola as "glowna" | "wspierajaca", brak };
    })
    .filter((b) => b.brak.length);
  if (braki.length) s.braki = braki;
  const h = html.get(s.sciezka)!;
  s.title = h.title;
  s.slowa = h.slowa;
  s.ctaKreatora = h.ctaKreatora;
}

// ---------------------------------------------------------------------------
// Liczby: Search Console, GA4, zamówienia
// ---------------------------------------------------------------------------

type ZapytanieGsc = { fraza: string; sciezka: string; klik: number; wysw: number; poz: number };
const zapytania: ZapytanieGsc[] = google?.gsc?.zapytania ?? [];
const poKluczu = new Map<string, ZapytanieGsc[]>();
for (const z of zapytania) poKluczu.set(klucz(z.fraza), [...(poKluczu.get(klucz(z.fraza)) ?? []), z]);

for (const f of frazy) {
  if (!f.kanaly.includes("google")) continue;
  const wiersz = poKluczu.get(klucz(f.fraza));
  if (!wiersz) continue;
  const u = wiersz.find((z) => z.sciezka === f.docelowy_url);
  if (u) f.gsc = { klik: u.klik, wysw: u.wysw, poz: u.poz };
  const inne = wiersz.filter((z) => z.sciezka !== f.docelowy_url && z.wysw >= 5).map((z) => ({ sciezka: z.sciezka, klik: z.klik, wysw: z.wysw, poz: z.poz }));
  if (inne.length) f.gscInne = inne;
}

const gscStron = new Map<string, Omit<Liczby, "ctr">>((google?.gsc?.strony ?? []).map((s: Omit<Liczby, "ctr"> & { sciezka: string }) => [s.sciezka, s]));
const ga4Stron = new Map<string, NonNullable<StronaBazy["ga4"]>>((google?.ga4 ?? []).map((s: NonNullable<StronaBazy["ga4"]> & { sciezka: string }) => [s.sciezka, s]));
const zamStron = new Map<string, number>((sklep?.strony ?? []).map((s: { sciezka: string; oplacone: number }) => [s.sciezka, s.oplacone]));

const procent = (a: number, b: number) => (b ? Math.round((a / b) * 1000) / 10 : 0);
/** „0,4”: liczba z przecinkiem dziesiętnym do tekstu sygnałów. */
const pl = (n: number) => String(n).replace(".", ",");

for (const s of strony) {
  const g = gscStron.get(s.sciezka);
  if (g) s.gsc = { ...g, ctr: procent(g.klik, g.wysw) };
  const a = ga4Stron.get(s.sciezka);
  if (a) {
    const { sesje, zaangazowane, koszyk, kasa, zakupy } = a;
    s.ga4 = { sesje, zaangazowane, koszyk, kasa, zakupy };
  }
  if (zamStron.has(s.sciezka)) s.zamowienia = zamStron.get(s.sciezka);
}

// ---------------------------------------------------------------------------
// Sygnały (tresci/system.md, sekcja 9)
// ---------------------------------------------------------------------------

/** Średni CTR dla pozycji w Google - punkt odniesienia, nie cel [ZAŁOŻENIE: rząd wielkości z badań CTR 2025-2026]. */
const oczekiwanyCtr = (poz: number) => (poz <= 3 ? 10 : poz <= 5 ? 5 : poz <= 8 ? 2.5 : poz <= 12 ? 1.2 : 0.5);

for (const s of strony) {
  const uwagi: string[] = [];
  const h = html.get(s.sciezka);
  if (h && s.status === "opublikowane") {
    if (h.title.length > 60) {
      const dopisek = h.title.match(/\s+-\s+Blog MałeNaklejki$/)?.[0];
      uwagi.push(
        dopisek
          ? `title ma ${h.title.length} znaków, z tego ${dopisek.length} to dopisek „- Blog MałeNaklejki” z szablonu wpisu (Google utnie ok. 60)`
          : `title ma ${h.title.length} znaków (Google utnie ok. 60)`,
      );
    }
    if (h.meta.length && (h.meta.length < 120 || h.meta.length > 160)) uwagi.push(`opis meta ma ${h.meta.length} znaków (cel 140-155)`);
    if (s.tresc && h.ctaKreatora === 0) uwagi.push("brak linku do kreatora w treści");
    if (s.tresc && h.slowa < 600) uwagi.push(`tylko ${h.slowa} słów treści`);
  }
  if (s.gsc && s.gsc.wysw >= 150 && s.gsc.poz !== null) {
    const oczek = oczekiwanyCtr(s.gsc.poz);
    if (s.gsc.ctr < oczek / 2) uwagi.push(`CTR ${pl(s.gsc.ctr)}% przy pozycji ${pl(s.gsc.poz)} i ${s.gsc.wysw} wyświetleniach (dla tej pozycji zwykle ok. ${pl(oczek)}%)`);
  }
  if (s.gsc && s.gsc.wyswPrzed28 >= 100 && s.gsc.wysw28 < s.gsc.wyswPrzed28 * 0.6) uwagi.push(`wyświetlenia 28 dni ${s.gsc.wysw28} wobec ${s.gsc.wyswPrzed28} wcześniej`);
  if (s.ga4 && s.ga4.sesje >= 15 && s.ga4.koszyk === 0) uwagi.push(`${s.ga4.sesje} sesji z wejściem na tę stronę i 0 dodań do koszyka (GA4, tylko zgody)`);
  const obce = frazy.filter((f) => f.docelowy_url === s.sciezka && f.gscInne?.some((x) => x.wysw > (f.gsc?.wysw ?? 0) * 1.5 && x.wysw >= 20));
  if (obce.length) uwagi.push(`Google pokazuje inną stronę na ${obce.length} ${obce.length === 1 ? "frazę" : "frazy"} tej strony (${obce.slice(0, 3).map((f) => `„${f.fraza}”`).join(", ")})`);
  if (uwagi.length) s.uwagi = uwagi;
}

/** Zapytania z wyświetleniami, których nie ma w bazie: kandydaci do bazy przy `/frazy` i `/przeglad-tresci`. */
const wBazie = new Set(frazy.map((f) => klucz(f.fraza)));
const kandydaci = [...poKluczu.entries()]
  .filter(([k]) => !wBazie.has(k))
  .map(([, rows]) => {
    const najlepsza = [...rows].sort((a, b) => b.wysw - a.wysw)[0];
    return { fraza: najlepsza.fraza, sciezka: najlepsza.sciezka, wysw: rows.reduce((n, r) => n + r.wysw, 0), klik: rows.reduce((n, r) => n + r.klik, 0), poz: najlepsza.poz };
  })
  .filter((k) => k.wysw >= 10 && k.fraza.length <= 120)
  .sort((a, b) => b.wysw - a.wysw)
  .slice(0, 60);

// ---------------------------------------------------------------------------
// Zapis i wynik
// ---------------------------------------------------------------------------

const decyzje = [...historia.zmiany].sort((a, b) => b.obsluzono.localeCompare(a.obsluzono)).slice(0, 40);
const baza = {
  projekt: "malenaklejki",
  opis: "Baza fraz wygenerowana przez npm run tresci:frazy z tresci/slowa-kluczowe.csv, rejestru treści, HTML po npm run build i danych z Google i sklepu. Nie edytuj ręcznie i nie commituj. Zasady: tresci/system.md, sekcja 11.",
  zaktualizowano: dzis(),
  build: new Date(zbudowano).toISOString(),
  dane: {
    gsc: google?.gsc ? { od: google.gsc.okno.od, do: google.gsc.okno.do, pobrano: google.pobrano } : null,
    ga4: google?.ga4 ? { pobrano: google.pobrano } : null,
    zamowienia: sklep ? { od: sklep.okno.od, do: sklep.okno.do, oplacone: sklep.razem.oplacone } : null,
  },
  strony,
  frazy,
  kandydaci,
  decyzje,
  /** Panel zdejmuje te zmiany z listy czekających. */
  obsluzone: historia.zmiany.map((z) => z.id),
};
writeFileSync(plik("tresci/frazy.json"), `${JSON.stringify(baza, null, 2)}\n`);

const ile = (rola: Rola) => frazy.filter((f) => f.rola === rola).length;
console.log(
  `Baza: ${frazy.length} pozycji - ${ile("glowna")} głównych, ${ile("wspierajaca")} wspierających, ${ile("wariant")} wariantów, ${ile("pytanie")} pytań AI, ${ile("pozniej")} bez strony.`,
);
console.log(`Strony w buildzie: ${html.size}/${strony.filter((s) => s.status === "opublikowane").length} (build ${new Date(zbudowano).toLocaleString("pl-PL")}).`);
console.log(
  `Dane: GSC ${google?.gsc ? `${google.gsc.okno.od} - ${google.gsc.okno.do}` : "brak (npm run panel:dane-tresci w panelu)"}, GA4 ${google?.ga4 ? "tak" : "brak"}, zamówienia ${sklep ? `od ${sklep.okno.od}` : "brak (npm run tresci:zamowienia)"}.`,
);
if (staryBuild) console.log("UWAGA: treści zmieniły się po buildzie. Uruchom npm run build i ponownie npm run tresci:frazy.");

const zBrakami = strony.filter((s) => s.braki);
if (zBrakami.length) {
  console.log("\nBraki na stronach (fraza → gdzie jej nie ma):");
  for (const s of zBrakami) {
    console.log(`  ${s.sciezka}${s.tresc ? "" : " (strona spoza rejestru: zmiana za zgodą Jakuba)"}`);
    for (const b of s.braki!) console.log(`    ${b.rola === "glowna" ? "główna" : "wspierająca"} „${b.fraza}” → ${b.brak.join(", ")}`);
  }
}
const kolizje = frazy.filter((f) => f.kolizje);
if (kolizje.length) {
  console.log("\nKolizje (fraza strony A w title albo H1 strony B):");
  for (const f of kolizje) console.log(`  „${f.fraza}” (${f.docelowy_url}) → ${f.kolizje!.map((k) => `${k.sciezka} ${k.miejsca.join("+")}`).join(", ")}`);
}
const zUwagami = strony.filter((s) => s.uwagi);
if (zUwagami.length) {
  console.log("\nSygnały (sekcja 9 systemu treści):");
  for (const s of zUwagami) console.log(`  ${s.sciezka}: ${s.uwagi!.join("; ")}`);
}
if (kandydaci.length) console.log(`\nZapytania z GSC bez miejsca w bazie: ${kandydaci.length} (lista w tresci/frazy.json → kandydaci).`);
console.log(`\nZapisano tresci/frazy.json. Panel: npm run panel:frazy -- --project malenaklejki w ~/Desktop/jdalaszynski.`);

if (sprawdz) {
  const cel = new Set(sprawdzane.length ? sprawdzane : strony.filter((s) => s.tresc && s.status === "opublikowane").map((s) => s.sciezka));
  const bledy = [
    ...(staryBuild ? ["build starszy niż treści"] : []),
    ...[...cel].filter((s) => !html.has(s)).map((s) => `${s}: brak strony w buildzie`),
    ...strony.filter((s) => cel.has(s.sciezka) && s.braki).map((s) => `${s.sciezka}: ${s.braki!.length} braków`),
    ...kolizje.flatMap((f) => f.kolizje!.filter((k) => cel.has(k.sciezka)).map((k) => `${k.sciezka}: ${k.miejsca.join(" i ")} z frazą „${f.fraza}” (${f.docelowy_url})`)),
  ];
  // Fraza sprawdzanej strony w tytule strony spoza zlecenia: poprawia się tamtą stronę, więc to nie blokuje.
  const uwagi = kolizje
    .filter((f) => cel.has(f.docelowy_url))
    .flatMap((f) => f.kolizje!.filter((k) => !cel.has(k.sciezka)).map((k) => `„${f.fraza}” (${f.docelowy_url}) stoi w ${k.miejsca.join(" i ")} ${k.sciezka}`));
  if (uwagi.length) console.log(`\nUwaga, do poprawy na innych stronach:\n- ${uwagi.join("\n- ")}`);
  if (bledy.length) {
    console.error(`\nSprawdzenie nie przeszło:\n- ${bledy.join("\n- ")}`);
    process.exit(1);
  }
  console.log(`Sprawdzenie przeszło: ${[...cel].join(", ")}.`);
}
