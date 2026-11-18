/**
 * Wspólny kod systemu treści: rejestr, baza fraz (CSV), dopasowanie frazy do tekstu
 * i odczyt strony z gotowego HTML. Zasady: `tresci/system.md`.
 *
 * Polską odmianę łapie porównanie początków słów, bez słownika: „naklejka na znicz”
 * znajdzie się w „naklejkach na znicze”, ale „organizer” nie w „organizacji”.
 * Uruchamiane wprost przez Node (bez kompilacji), więc tylko składnia TS, którą da
 * się wymazać: bez `enum`, bez parametrów-pól w konstruktorach.
 */
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

export const KORZEN = fileURLToPath(new URL("../..", import.meta.url));
export const plik = (...czesci: string[]) => join(KORZEN, ...czesci);
export const ADRES = "https://www.malenaklejki.pl";

export const dzis = () => new Date().toLocaleDateString("sv-SE", { timeZone: "Europe/Warsaw" });

// ---------------------------------------------------------------------------
// Rejestr
// ---------------------------------------------------------------------------

export type TypTresci = "landing" | "wpis";
export type StatusTresci = "opublikowane" | "w_kolejce" | "wstrzymane";
export type Intencja = "informacyjna" | "komercyjna" | "transakcyjna";
export type Etap = "TOFU" | "MOFU" | "BOFU";
export type Priorytet = "P0" | "P1" | "P2";
export type RodzajZadania = "ctr" | "poglebienie" | "frazy" | "konwersja" | "linki" | "odswiezenie";

/** Zaplanowana poprawa opublikowanej strony: druga połowa kolejki. */
export interface Zadanie {
  rodzaj: RodzajZadania;
  /** Co ma się zmienić, jednym zdaniem: tytuł pozycji w panelu. */
  tytul: string;
  /** Dlaczego: liczby z GSC, GA4 albo zamówień z datą odczytu. */
  powod: string;
  /** Jak: konkretne zmiany, które agent ma wykonać. */
  teza: string;
  priorytet: Priorytet;
  kolejnosc: number;
  /** Skąd wziął się pomysł: przegląd treści, strateg z panelu, Jakub. */
  zrodlo: string;
  /** Nie wcześniej niż (RRRR-MM-DD). */
  od?: string;
  dodano: string;
}

export interface Tresc {
  id: string;
  typ: TypTresci;
  sciezka: string;
  /** Plik źródłowy: `src/content/blog/<slug>.md` albo `src/app/<adres>/page.tsx`. */
  plik: string;
  tytul: string;
  nazwa: string;
  zajawka: string;
  fraza: string;
  frazy: string[];
  pytania_ai: string[];
  intencja: Intencja;
  potrzeba: string;
  segment: string;
  odbiorca: string;
  etap: Etap;
  /** Wpis: adres strony, do której prowadzi (landing albo filar bloga). Landing: null. */
  filar: string | null;
  kotwica: string;
  cta: { href: string; tekst: string };
  roznica: string;
  teza?: string;
  priorytet: Priorytet;
  status: StatusTresci;
  kolejnosc?: number;
  warunek?: string;
  /** Okno publikacji treści sezonowej. */
  okno?: { od: string; do: string };
  opublikowano?: string;
  zmieniono?: string;
  zgloszenia?: { indexnow?: string; gsc?: string };
  zadanie?: Zadanie;
}

export interface Rejestr {
  projekt: string;
  zaktualizowano: string;
  opis: string;
  segmenty: Record<string, string>;
  tresci: Tresc[];
}

export const czytajRejestr = (): Rejestr => JSON.parse(readFileSync(plik("tresci/rejestr.json"), "utf8"));

/**
 * Strony spoza rejestru, które są właścicielami fraz. Strona główna to kreator
 * i główna strona sprzedażowa: fraza z `landing-agent/strategy.md` („zero kanibalizacji `/`”).
 */
export const STRONY_SPOZA_REJESTRU: Record<string, { nazwa: string; fraza?: string; frazy?: string[] }> = {
  "/": {
    nazwa: "Strona główna i kreator",
    fraza: "naklejki z własnym nadrukiem",
    frazy: ["małe naklejki", "naklejki na zamówienie", "personalizowane naklejki", "naklejki online"],
  },
  "/blog": { nazwa: "Blog" },
  "/gotowe-zestawy": { nazwa: "Gotowe zestawy (katalog)", fraza: "gotowe zestawy naklejek", frazy: ["zestaw naklejek", "gotowe naklejki"] },
  "/zamow-projekt": { nazwa: "Zamów projekt" },
  "/o-nas": { nazwa: "O nas" },
  "/kontakt": { nazwa: "Kontakt" },
};

// ---------------------------------------------------------------------------
// Baza fraz (CSV)
// ---------------------------------------------------------------------------

export const KOLUMNY = [
  "fraza",
  "kanal",
  "klaster",
  "segment",
  "intencja",
  "etap",
  "priorytet",
  "wolumen",
  "cpc",
  "zrodlo",
  "data_odczytu",
  "oferta",
  "docelowy_url",
  "status_strony",
] as const;
export type Kolumna = (typeof KOLUMNY)[number];
export type WierszFrazy = Record<Kolumna, string>;

/** Pytanie do asystentów AI (ChatGPT, Gemini, Perplexity): akapit 40-60 słów, który odpowiada wprost. */
export const KANALY_AI = ["ai"] as const;

/** Dozwolone wartości kolumn (opis: `tresci/system.md`, sekcja 11). */
export const WARTOSCI: Partial<Record<Kolumna, readonly string[]>> = {
  kanal: ["google", ...KANALY_AI],
  intencja: ["info", "kom", "trans", "nawig"],
  etap: ["TOFU", "MOFU", "BOFU"],
  priorytet: ["P0", "P1", "P2"],
  oferta: ["teraz", "później", "poza"],
  status_strony: ["istnieje", "brak", "później"],
};

function parsujCsv(tekst: string): string[][] {
  const wynik: string[][] = [];
  let wiersz: string[] = [];
  let pole = "";
  let wCudzyslowie = false;
  for (let i = 0; i < tekst.length; i++) {
    const z = tekst[i];
    if (wCudzyslowie) {
      if (z === '"' && tekst[i + 1] === '"') {
        pole += '"';
        i++;
      } else if (z === '"') wCudzyslowie = false;
      else pole += z;
    } else if (z === '"') wCudzyslowie = true;
    else if (z === ",") {
      wiersz.push(pole);
      pole = "";
    } else if (z === "\n" || z === "\r") {
      if (z === "\r" && tekst[i + 1] === "\n") i++;
      wiersz.push(pole);
      wynik.push(wiersz);
      wiersz = [];
      pole = "";
    } else pole += z;
  }
  if (pole || wiersz.length) {
    wiersz.push(pole);
    wynik.push(wiersz);
  }
  return wynik;
}

export function czytajCsv(tekst: string): WierszFrazy[] {
  const [naglowek, ...reszta] = parsujCsv(tekst.replace(/^﻿/, ""));
  if (naglowek?.join(",") !== KOLUMNY.join(",")) throw new Error(`Nagłówek bazy fraz to nie ${KOLUMNY.join(",")}`);
  return reszta
    .filter((w) => w.some((pole) => pole.trim()))
    .map((w) => Object.fromEntries(KOLUMNY.map((k, i) => [k, (w[i] ?? "").trim()])) as WierszFrazy);
}

const pole = (v: string) => (/[",\r\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v);

/** CSV z końcami linii CRLF, jak w bazie Wraca na miejsce (otwiera się wprost w Excelu i Numbers). */
export function zapiszCsv(wiersze: WierszFrazy[]): string {
  return [KOLUMNY.join(","), ...wiersze.map((w) => KOLUMNY.map((k) => pole(w[k] ?? "")).join(","))].join("\r\n") + "\r\n";
}

export const czytajBaze = () => czytajCsv(readFileSync(plik("tresci/slowa-kluczowe.csv"), "utf8"));

// ---------------------------------------------------------------------------
// Dopasowanie frazy do tekstu
// ---------------------------------------------------------------------------

/** Przyimki i spójniki zmieniają się z odmianą („na znicz”, „na zniczu”), więc ich nie porównujemy. */
const POMIJANE = new Set(["a", "albo", "bez", "czy", "dla", "do", "i", "lub", "na", "o", "od", "oraz", "po", "pod", "przy", "u", "w", "we", "z", "za", "ze", "sie"]);
/** Słowa pytające, których odpowiedź nie powtarza: „ile kosztują naklejki” → „naklejki kosztują 59 zł”. */
const PYTAJNE = new Set(["co", "czym", "dlaczego", "gdzie", "ile", "jak", "jaka", "jaki", "jakie", "kiedy", "kto"]);

export function tokeny(tekst: string): string[] {
  return tekst
    .toLowerCase()
    .replace(/ł/g, "l")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .split(/[^a-z0-9]+/)
    .filter(Boolean);
}

/** Fraza bez słów pytających na początku - do szukania w pierwszym akapicie, który odpowiada na pytanie. */
export function bezPytania(fraza: string): string {
  const slowa = fraza.trim().split(/\s+/);
  let i = 0;
  while (i < slowa.length - 1 && PYTAJNE.has(tokeny(slowa[i])[0] ?? "")) i++;
  return slowa.slice(i).join(" ");
}

/** Słowa frazy, które muszą się znaleźć w tekście. */
export function rdzenie(fraza: string): string[] {
  const t = tokeny(fraza);
  const znaczace = t.filter((s) => !POMIJANE.has(s));
  return znaczace.length ? znaczace : t;
}

/**
 * Dwa słowa to ta sama fraza w innej odmianie, gdy mają wspólny początek co najmniej
 * 3 liter, a końcówki po nim mają najwyżej 3 litery: naklejka i naklejkami, znicz
 * i zniczach, ale nie organizer i organizacja. Krótkie słowa (QR, A4, UV) muszą być identyczne.
 */
export function toSamoSlowo(a: string, b: string): boolean {
  if (a === b) return true;
  if (a.length <= 3 || b.length <= 3) return false;
  let k = 0;
  while (k < a.length && k < b.length && a[k] === b[k]) k++;
  return k >= 3 && a.length - k <= 3 && b.length - k <= 3;
}

/**
 * Czy fraza stoi w tekście: wszystkie jej słowa w jednym oknie niewiele dłuższym od frazy,
 * w dowolnej kolejności. `luz` to liczba słów, które mogą się wcisnąć między słowa frazy.
 */
export function wystepuje(fraza: string, tekst: string | string[], luz = 3): boolean {
  const szukane = rdzenie(fraza);
  if (!szukane.length) return false;
  const t = Array.isArray(tekst) ? tekst : tokeny(tekst);
  const okno = tokeny(fraza).length + luz;
  for (let i = 0; i < t.length; i++) {
    if (!szukane.some((s) => toSamoSlowo(s, t[i]))) continue;
    const fragment = t.slice(i, i + okno);
    if (szukane.every((s) => fragment.some((x) => toSamoSlowo(s, x)))) return true;
  }
  return false;
}

/** Ta sama fraza po normalizacji (wielkość liter, polskie znaki, spacje). */
export const klucz = (fraza: string) => tokeny(fraza).join(" ");

// ---------------------------------------------------------------------------
// Strona z gotowego HTML
// ---------------------------------------------------------------------------

export interface StronaHtml {
  sciezka: string;
  title: string;
  meta: string;
  h1: string;
  /** Pierwszy akapit po H1: odpowiedź we wpisie, BLUF w landingu. */
  wstep: string;
  naglowki: string[];
  faq: string[];
  alt: string[];
  tekst: string;
  /** Liczba słów treści - do oceny, czy strona nie jest za cienka. */
  slowa: number;
  /** Linki wewnętrzne z treści strony (bez menu, stopki i bloków z innymi wpisami). */
  linki: { href: string; tekst: string }[];
  /** Linki do kreatora (`/` z parametrami albo bez) w treści strony. */
  ctaKreatora: number;
  schematy: string[];
}

const ENCJE: Record<string, string> = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " " };

function odkoduj(tekst: string): string {
  return tekst
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(Number(d)))
    .replace(/&([a-z]+);/gi, (c, n) => ENCJE[n.toLowerCase()] ?? c);
}

/** Tekst bez znaczników; znacznik zamienia się w spację, żeby nie sklejać słów z sąsiednich elementów. */
export function tekstZ(html: string): string {
  return odkoduj(html.replace(/<[^>]+>/g, " ")).replace(/\s+/g, " ").trim();
}

/** Usuwa elementy danego znacznika razem z zagnieżdżonymi (np. `header`, `footer`). */
function bezElementow(html: string, znacznik: string): string {
  let wynik = html;
  const otwarcie = new RegExp(`<${znacznik}\\b`, "i");
  for (let m = otwarcie.exec(wynik); m; m = otwarcie.exec(wynik)) {
    const wzor = new RegExp(`<${znacznik}\\b|</${znacznik}>`, "gi");
    wzor.lastIndex = m.index;
    let glebokosc = 0;
    let koniec = wynik.length;
    for (let z = wzor.exec(wynik); z; z = wzor.exec(wynik)) {
      glebokosc += z[0].startsWith("</") ? -1 : 1;
      if (glebokosc === 0) {
        koniec = z.index + z[0].length;
        break;
      }
    }
    wynik = wynik.slice(0, m.index) + wynik.slice(koniec);
  }
  return wynik;
}

/**
 * Bloki z tytułami innych stron („Powiązane artykuły” we wpisie, „Odkryj nasz blog”
 * na stronie głównej) to linki, a nie treść tej strony. Wycinamy najbliższą sekcję,
 * która je obejmuje; bez sekcji - wszystko od nagłówka do końca.
 */
const BLOKI_LINKOW = [/powiązane artykuły/i, /odkryj nasz blog/i, /czytaj (też|także|dalej)/i];

function bezBlokowLinkow(html: string): string {
  let wynik = html;
  for (const wzor of BLOKI_LINKOW) {
    const naglowek = [...wynik.matchAll(/<(h[2-4])\b[^>]*>([\s\S]*?)<\/\1>/g)].find((m) => wzor.test(tekstZ(m[2])));
    if (!naglowek || naglowek.index === undefined) continue;
    const przed = wynik.slice(0, naglowek.index);
    const start = Math.max(przed.lastIndexOf("<section"), przed.lastIndexOf("<aside"));
    if (start === -1) {
      wynik = przed;
      continue;
    }
    const znacznik = wynik.startsWith("<section", start) ? "section" : "aside";
    const wzorZn = new RegExp(`<${znacznik}\\b|</${znacznik}>`, "g");
    wzorZn.lastIndex = start;
    let glebokosc = 0;
    let koniec = wynik.length;
    for (let z = wzorZn.exec(wynik); z; z = wzorZn.exec(wynik)) {
      glebokosc += z[0].startsWith("</") ? -1 : 1;
      if (glebokosc === 0) {
        koniec = z.index + z[0].length;
        break;
      }
    }
    wynik = wynik.slice(0, start) + wynik.slice(koniec);
  }
  return wynik;
}

/** `/?zestaw=x` i `/` to kreator; `/#creator-section` też. */
const doKreatora = (href: string) => /^\/(?:[?#].*)?$/.test(href);

export function czytajHtml(sciezka: string, html: string): StronaHtml {
  const title = tekstZ(html.match(/<title>([\s\S]*?)<\/title>/)?.[1] ?? "");
  const meta = odkoduj(html.match(/<meta name="description" content="([^"]*)"/)?.[1] ?? "");
  const schematy = [...html.matchAll(/"@type":"([A-Za-z]+)"/g)].map((m) => m[1]);
  const cialo = (html.match(/<body[^>]*>([\s\S]*)<\/body>/)?.[1] ?? html).replace(/<(script|style|svg|template|noscript)\b[\s\S]*?<\/\1>/g, " ");
  const tresc = bezBlokowLinkow(bezElementow(bezElementow(bezElementow(cialo, "header"), "footer"), "nav"));
  const linki = [...tresc.matchAll(/<a\b[^>]*href="(\/[^"]*)"[^>]*>([\s\S]*?)<\/a>/g)].map((m) => ({
    href: odkoduj(m[1]),
    tekst: tekstZ(m[2]),
  }));
  const h1 = tekstZ(tresc.match(/<h1[^>]*>([\s\S]*?)<\/h1>/)?.[1] ?? "");
  const poH1 = tresc.split(/<\/h1>/)[1] ?? "";
  // Pierwszy prawdziwy akapit: data i czas czytania wpisu to nie odpowiedź.
  const wstep = [...poH1.matchAll(/<p\b[^>]*>([\s\S]*?)<\/p>/g)].map((m) => tekstZ(m[1])).find((t) => t.split(" ").length >= 12) ?? "";
  const naglowki = [...tresc.matchAll(/<h([23])[^>]*>([\s\S]*?)<\/h\1>/g)].map((m) => tekstZ(m[2])).filter(Boolean);
  const tekst = tekstZ(tresc);
  return {
    sciezka,
    title,
    meta,
    h1,
    wstep,
    naglowki,
    faq: [
      ...[...tresc.matchAll(/<details\b[^>]*>([\s\S]*?)<\/details>/g)].map((m) => tekstZ(m[1])),
      // FAQ we wpisach to pytania w H3 (`blog-agent/rules.md`, §6b).
      ...naglowki.filter((n) => n.endsWith("?")),
    ],
    alt: [...tresc.matchAll(/<img\b[^>]*\balt="([^"]*)"/g)].map((m) => odkoduj(m[1])).filter(Boolean),
    tekst,
    slowa: tekst.split(" ").length,
    linki: linki.map((l) => ({ ...l, href: l.href.split(/[?#]/)[0].replace(/\/$/, "") || "/" })),
    ctaKreatora: linki.filter((l) => doKreatora(l.href)).length,
    schematy: [...new Set(schematy)],
  };
}

/** HTML strony z ostatniego `npm run build` (strony statyczne i wpisy). */
export function plikHtml(sciezka: string): string | null {
  const p = plik(".next/server/app", sciezka === "/" ? "index.html" : `${sciezka.slice(1)}.html`);
  return existsSync(p) ? readFileSync(p, "utf8") : null;
}

/**
 * Kolizja: fraza stoi niemal w całości w title albo H1 innej strony i zajmuje większość jego słów.
 * Wtedy obie strony odpowiadają na tę samą frazę. Krótka fraza w długim tytule kolizją nie jest.
 */
export function koliduje(fraza: string, naglowek: string): boolean {
  const slowa = rdzenie(naglowek.replace(/\s*[|-]\s*(Blog )?MałeNaklejki.*$/i, "")).length;
  return slowa > 0 && rdzenie(fraza).length / slowa >= 0.6 && wystepuje(fraza, naglowek, 1);
}
