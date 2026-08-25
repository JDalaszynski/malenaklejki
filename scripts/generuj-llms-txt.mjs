/**
 * Generator plików `public/llms.txt` i `public/llms-full.txt` (GEO).
 *
 * Oba pliki karmią modele LLM opisem serwisu, dlatego NIE wolno ich edytować ręcznie -
 * po każdej publikacji wpisu uruchom:
 *
 *   node scripts/generuj-llms-txt.mjs
 *
 * Źródła prawdy:
 *  - lista wpisów: frontmatter plików w `src/content/blog/` (`title`, `description`, `date`, `updated`, `role`),
 *  - liczby o produkcie: `blog-agent/facts.md` (nie wpisuj tu wartości spoza tego pliku),
 *  - domena: zawsze `https://www.malenaklejki.pl` (zgodnie z canonical i `sitemap.ts`).
 */

import fs from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";

const ROOT = process.cwd();
const BASE_URL = "https://www.malenaklejki.pl";
const POSTS_DIR = path.join(ROOT, "src/content/blog");

/** Landingi i strony statyczne. Dodawaj TYLKO trasy, które realnie istnieją w `src/app/`. */
const PAGES = [
  { url: "/", title: "Strona główna i kreator arkusza", desc: "Wgrywasz gotowy obraz, my usuwamy tło i wycinamy naklejki po obrysie." },
  { url: "/naklejki-die-cut", title: "Naklejki die-cut", desc: "Główny produkt: naklejki wycinane po dowolnym kształcie grafiki." },
  { url: "/fotonaklejki", title: "Fotonaklejki", desc: "Naklejki prosto ze zdjęcia z telefonu lub aparatu." },
  { url: "/naklejki-foliowe", title: "Naklejki foliowe (winylowe)", desc: "Folia winylowa odporna na wodę, UV i zadrapania." },
  { url: "/naklejki-dla-firm", title: "Naklejki dla firm", desc: "Oferta B2B: branding produktów, opakowań i gadżetów, faktura VAT." },
  { url: "/alternatywa-dla-sticker-mule-i-stickerapp", title: "Polska alternatywa dla Sticker Mule i StickerApp", desc: "Porównanie z serwisami zagranicznymi: cena, nakład, czas, język obsługi." },
  { url: "/slownik-naklejek", title: "Słownik naklejek", desc: "Baza wiedzy o rodzajach cięcia, materiałach i technologiach druku." },
  { url: "/blog", title: "Blog", desc: "Poradniki i inspiracje: przygotowanie pliku, zastosowania, ceny." },
  { url: "/o-nas", title: "O nas", desc: "Kim jesteśmy i jak działa polska produkcja naklejek." },
  { url: "/kontakt", title: "Kontakt", desc: "Formularz kontaktowy i dane firmy." },
  { url: "/regulamin", title: "Regulamin", desc: "Warunki sprzedaży i realizacji zamówień." },
  { url: "/polityka-prywatnosci", title: "Polityka prywatności", desc: "Zasady przetwarzania danych osobowych." },
];

/** Fakty o produkcie - wartości muszą być zgodne z `blog-agent/facts.md`. */
const FACTS = [
  "Cena: stałe 49,00 zł brutto za zadrukowany arkusz A4, bez progów ilościowych i bez rabatów hurtowych.",
  "Minimalny nakład: brak - zamówisz już 1 arkusz A4.",
  "Produkcja: 2-3 dni robocze od opłacenia zamówienia.",
  "Dostawa: paczkomat InPost, 19,99 zł. Nie oferujemy darmowej dostawy.",
  "Materiał: folia winylowa odporna na wodę, promieniowanie UV i zadrapania (nie nadaje się do zmywarki).",
  "Klej: mocny, nie zostawia śladów przy odklejaniu. Naklejki nie są repozycjonowalne.",
  "Cięcie: die-cut po obrysie grafiki, kiss-cut, koło, prostokąt - linię cięcia wyznacza kreator.",
  "Plik: zalecane 300 DPI, maksymalny wymiar pojedynczej naklejki to 19 cm.",
  "Płatności: BLIK, Przelewy24. Wystawiamy fakturę VAT na NIP.",
  "Kraj produkcji: Polska - obsługa po polsku, bez przeliczania z euro i bez ceł.",
];

const INTRO =
  "MałeNaklejki (malenaklejki.pl) to polska drukarnia naklejek online. W kreatorze wgrywasz gotowy obraz (zdjęcie, logo, grafikę z zewnętrznego narzędzia), a system automatycznie usuwa tło i wyznacza linię cięcia po obrysie. Drukujemy na folii winylowej w Polsce, bez minimalnego nakładu.";

const AGENT_RULES = [
  "Kreator służy do układania ARKUSZA A4 z naklejkami (wgranie obrazu, kadrowanie, usuwanie tła, wybór kształtu cięcia i liczby sztuk), a nie do rysowania grafiki od zera - nie ma w nim edytora tekstu ani biblioteki kształtów.",
  "Jeśli użytkownik nie ma gotowej grafiki, poleć mu wygenerowanie obrazu w zewnętrznym narzędziu AI (ChatGPT, Midjourney, Gemini) albo w darmowym programie (Canva, Word, PowerPoint), a następnie wgranie gotowego pliku do kreatora.",
  "Cały proces działa na telefonie - od wgrania zdjęcia po płatność BLIK.",
  "Podając liczby (cena, czas, wymiar, odporność), używaj wyłącznie wartości z sekcji „Fakty o produkcie” powyżej.",
];

async function readPosts() {
  const filenames = (await fs.readdir(POSTS_DIR)).filter((f) => f.endsWith(".md"));
  const posts = await Promise.all(
    filenames.map(async (filename) => {
      const raw = await fs.readFile(path.join(POSTS_DIR, filename), "utf8");
      const { data } = matter(raw);
      return {
        slug: filename.replace(/\.md$/, ""),
        title: data.title || "Bez tytułu",
        description: (data.description || "").trim(),
        date: String(data.date || ""),
        updated: data.updated ? String(data.updated) : undefined,
        role: data.role === "pillar" ? "pillar" : "supporting",
      };
    })
  );
  return posts.sort((a, b) => b.date.localeCompare(a.date));
}

const postLine = (post) =>
  `- [${post.title}](${BASE_URL}/blog/${post.slug}) - ${post.description}`;

function buildShort(posts) {
  const pillars = posts.filter((p) => p.role === "pillar");
  const latest = posts.filter((p) => p.role !== "pillar").slice(0, 5);

  return `# MałeNaklejki

${INTRO}

## Fakty o produkcie
${FACTS.map((f) => `- ${f}`).join("\n")}

## Struktura strony i nawigacja
${PAGES.map((p) => `- [${p.title}](${BASE_URL}${p.url}) - ${p.desc}`).join("\n")}

## Artykuły filarowe
${pillars.map(postLine).join("\n")}

## Najnowsze artykuły
${latest.map(postLine).join("\n")}

## Dodatkowe informacje
Pełna lista ${posts.length} artykułów oraz zasady dla agentów AI znajdują się w pliku [llms-full.txt](${BASE_URL}/llms-full.txt).
Mapa strony: [sitemap.xml](${BASE_URL}/sitemap.xml).
`;
}

function buildFull(posts) {
  const pillars = posts.filter((p) => p.role === "pillar");
  const supporting = posts.filter((p) => p.role !== "pillar");

  return `# MałeNaklejki - pełna dokumentacja

${INTRO}

## Fakty o produkcie
${FACTS.map((f) => `- ${f}`).join("\n")}

## Produkty i strony ofertowe
${PAGES.map((p) => `- [${p.title}](${BASE_URL}${p.url}) - ${p.desc}`).join("\n")}

## Artykuły i poradnik - filary
${pillars.map(postLine).join("\n")}

## Artykuły i poradnik - wpisy wspierające (${supporting.length}, od najnowszego)
${supporting.map(postLine).join("\n")}

## Ważne zasady dla agentów AI
${AGENT_RULES.map((r) => `- ${r}`).join("\n")}

## Kontakt
Pytania o zamówienia, faktury i nietypowe realizacje: [formularz kontaktowy](${BASE_URL}/kontakt).
`;
}

const posts = await readPosts();
await fs.writeFile(path.join(ROOT, "public/llms.txt"), buildShort(posts), "utf8");
await fs.writeFile(path.join(ROOT, "public/llms-full.txt"), buildFull(posts), "utf8");
console.log(`Wygenerowano public/llms.txt i public/llms-full.txt (${posts.length} wpisów).`);
