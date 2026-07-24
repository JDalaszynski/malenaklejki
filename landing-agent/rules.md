# Zasady budowy landing pages (Landing Page Agent)

Dziedziczysz **cały kanon stylu** z `blog-agent/rules.md` (ton BLUF, język korzyści, strona czynna, czarna lista SEO, **zakaz "projektowania" w kreatorze i w generatorze AI**, dywiz "-" zamiast półpauzy "–"). Poniżej reguły **specyficzne dla landingów**. Wzorzec referencyjny w kodzie: [`src/app/alternatywa-dla-sticker-mule-i-stickerapp/page.tsx`](../src/app/alternatywa-dla-sticker-mule-i-stickerapp/page.tsx).

> **Punkt wyjścia każdej strony: `landing-agent/keywords.md` + `blog-agent/keywords.md` + dane GSC (`plan.md` → "Wnioski z GSC").** Zanim zaczniesz budować, wybierz docelowy **mikro-klaster fraz** (kilka blisko powiązanych, jedna intencja). Fraza główna → `H1` / URL / `title`; frazy semantyczne/poboczne → `H2`/`H3`/FAQ. Waliduj wolumen i lukę (GSC, `strategy.md` checklist). **Nie buduj landingu "z głowy" bez zakotwiczenia w bazie fraz.**

---

## 1. Anatomia landingu (kolejność sekcji)
Trzymaj się sprawdzonego układu z wzorca referencyjnego:
1. **Breadcrumbs** ("Kreator Zestawu Naklejek" / [Nazwa strony]) + `BreadcrumbList`.
2. **Hero:** badge → `H1` (główna fraza) → akapit **BLUF** (bezpośrednia odpowiedź + twarde fakty: 49 zł/A4, od 1 szt., 3 dni, produkcja PL) → 1-2 CTA (primary do `/`, secondary do powiązanego wpisu).
3. **Trust stats** - 4 kafle (np. 49 zł / od 1 szt. / 3 dni / BLIK).
4. **Sekcja właściwa dla typu** - tabela porównawcza / siatka zastosowań / specyfikacja materiału.
5. **Zalety** - grid z ikonami `lucide-react`.
6. **"Jak zamówić krok po kroku"** - `<ol>` 1-2-3, z wplecionym linkiem do wpisu (die-cut / mały nakład).
7. **FAQ** - `<details>/<summary>`, z jednej tablicy `FAQS` (patrz §3).
8. **Final CTA** - do `/`.

**BLUF:** najważniejsza odpowiedź i cena muszą być w pierwszym ekranie.

**Długość (treść substantywna, nie "lanie wody"):** landing atrybut/format ~600-1000 słów; landing komercyjny-kategoria / hub (np. `/naklejki-dla-firm`) ~1000-1500 słów; landing porównawczy ~800-1200 słów. Każda dodatkowa sekcja musi celować w realny podintent (specyfikacja, sub-persona, poszerzony FAQ) albo dodawać cytowalny fakt - inaczej ją wytnij. Nie zamieniaj landingu w artykuł blogowy: zachowaj BLUF, skanowalność i CTA. Dobra dźwignia długości pod SEO+AEO: **tabela specyfikacji** (cytowalna) + **FAQ rozbudowany do 8-10 pytań** z realnych zapytań.

---

## 2. Structured data (obowiązkowo)
Komponent: `@/components/seo/JsonLd`. Na każdym landingu:
* `BreadcrumbList`
* `FAQPage` (z tablicy `FAQS`)
* **`Product` + `Offer`** (ulepszenie względem obecnego landingu - **DODAWAJ**): `name`, `description`, `brand: MałeNaklejki`, `offers: { "@type": "Offer", price: "49.00", priceCurrency: "PLN", availability, url }`. Silny sygnał AEO na "ile kosztują naklejki".
* Rozważ globalne `Organization` + `sameAs` (jeśli nie ma w `layout.tsx`).

**Zasada spójności:** widoczny FAQ i schemat `FAQPage` pochodzą z **tej samej tablicy** (jeden string zasila render i schemat) - nigdy nie dopuść, by się rozjechały.

---

## 3. FAQ pod AEO
* Pytania = **dokładne zapytania użytkowników** (people-also-ask), w tym porównawcze / cenowe / czasowe ("ile kosztuje", "jaki czas dostawy", "czy wodoodporne", "czy wystawiacie fakturę").
* Odpowiedź: 2-4 zdania, **samodzielna** (zrozumiała bez kontekstu strony), pierwsze zdanie = bezpośrednia odpowiedź (BLUF), potem konkret/fakt.
* **Czysty tekst** (bez markdown) - ten sam string trafia do schematu.

---

## 4. Tabela porównawcza / specyfikacja
LLM-y chętnie cytują tabele. Układ: `Cecha | malenaklejki.pl | konkurent/alternatywa`. Przy porównaniach zawsze dodaj **disclaimer o danych konkurencji** ("sprawdź aktualne warunki u dostawcy") + **notę o znakach towarowych** (nazwy należą do właścicieli, służą do porównania) - patrz §9.

---

## 5. Twarde fakty - ZATWIERDZONY zestaw
Używaj wyłącznie potwierdzonych faktów. Zatwierdzone (źródło: produkcyjny landing porównawczy + `blog-agent/strategy.md` + potwierdzenia właściciela 2026-07-24):
* **Cena:** stała **49,00 zł brutto / arkusz A4**, bez minimalnego nakładu, już od 1 arkusza. **Brak rabatu hurtowego** - zawsze arkusz po arkuszu (nie obiecuj cen za wolumen).
* **Faktura:** dla firm wystawiamy **fakturę VAT** na dane z NIP (jesteśmy płatnikiem VAT). 49 zł to kwota **brutto**.
* **Materiał:** trwała **folia winylowa**, mocny klej, nie zostawia śladów. Druk **300 DPI**. Odporność: **woda, UV, zadrapania**. (MałeNaklejki oferuje **tylko folię/winyl** - nie hologram, transparent, brokat itp.)
* **Cięcie:** po obrysie (die-cut), koło, prostokąt. Jedna duża naklejka do **19 cm** lub kilkadziesiąt małych na arkuszu.
* **Wykończenie:** pozostawione na arkuszu A4 **lub** pojedyncze docięte sztuki luzem.
* **Kreator:** wgranie PDF/PNG/JPG, automatyczne usuwanie tła, generator AI (obraz z opisu tekstowego), podgląd 3D.
* **Produkcja:** **2-3 dni robocze** (czas produkcji, NIE całkowity czas dostawy). **Wysyłka:** odbiór w **paczkomacie**, **koszt dostawy 19,99 zł** (brak darmowej dostawy). **Płatność:** BLIK, Przelewy24, przelew.

❌ **Nadal NIE wolno twierdzić bez dalszego potwierdzenia:** wieloletnia trwałość zewnętrzna / na karoserię, **odporność w zmywarce (potwierdzone: NIE nadaje się do zmywarki - nie obiecuj)**, całkowity czas dostawy (produkcja + czas kuriera). Takie punkty trzymaj w `plan.md` jako "DO POTWIERDZENIA".

**Parafraza:** nie kopiuj tego samego bloku faktów słowo w słowo między stronami (ryzyko near-duplicate u Google) - parafrazuj i dopasuj do kontekstu.

---

## 6. Linkowanie wewnętrzne

### 6a. Wychodzące (z landingu)
* **Landing → `/` (kreator):** aktywne anchory do-intent (np. "otwórz kreator naklejek", "zamów naklejki z logo"), min. 2 CTA (hero + final).
* **Landing → spoke'y blogowe:** 2-4 kontekstowe linki (głębia + dowód tematyczny).

### 6b. Przychodzące (INBOUND) - skąd landing dostaje moc
Każdy landing MUSI mieć linki przychodzące - **samo dodanie do `sitemap.ts` NIE wystarcza do rankingu.** Źródła w kolejności siły:
1. **Strona główna - sekcja SEO (`src/components/home/SeoContentSection.tsx`) lub FAQ (`FAQSection.tsx`):** najmocniejsze źródło (najwyższy autorytet). 1 kontekstowy link z trafnym anchorem (np. "naklejki dla firm"). Zasada **max 1 link na URL** (bez over-optimization).
2. **Spoke'y blogowe "w górę":** przy tworzeniu landingu segmentowego dodaj 1 link z każdego powiązanego wpisu (hub-and-spoke). **Anchory parafrazuj** (nie ten sam exact-match wszędzie).
3. **Inne landingi (cross-link):** gdy tematycznie powiązane (np. landing porównawczy ↔ `/naklejki-dla-firm`).
4. **`sitemap.ts`:** discovery - obowiązkowe, ale nie liczy się jako przekaz mocy.
* **Header / Footer:** linki w nawigacji/stopce **tylko za zgodą właściciela** (guardrail).

---

## 7. Meta i URL
* **URL:** top-level, po polsku, dywizy, opisowy, zawiera główną frazę (wzór: `/alternatywa-dla-sticker-mule-i-stickerapp`, `/naklejki-dla-firm`). Trzymaj `PAGE_PATH` / `PAGE_URL` jako stałe na górze pliku.
* **canonical:** self-referencyjny (`alternates.canonical = PAGE_PATH`). **Nigdy do `/`.**
* **title** 50-60 znaków z frazą; **description** 120-160 znaków, z CTA i frazą.
* **openGraph** `type: "website"`, twitter `summary_large_image`.
* **Dodaj URL do [`src/app/sitemap.ts`](../src/app/sitemap.ts).**

---

## 8. Techniczne / komponenty
* **PRZED kodowaniem:** `AGENTS.md` wymaga przeczytania odpowiedniego przewodnika w `node_modules/next/dist/docs/` - to **nie** jest standardowy Next.js; nie pisz z pamięci treningowej.
* **Reużywaj:** `Header`, `Footer`, `StickyCTAButton`, `JsonLd` oraz tokeny wizualne (font `font-heading`, kolory `#edf6f2`/`#002c2e`/`#003a3b`/`#02af7a`, `rounded-2xl`/`3xl`, `border-border/40`). Nie twórz nowego designu - spójność z landingiem porównawczym.
* **Server Component** (bez `"use client"`) gdy się da; dane w stałych tablicach na górze pliku (jak `FAQS`, `COMPARISON`, `ADVANTAGES` we wzorcu).
* **A11y:** `<details>/<summary>` dla FAQ, `aria-label` przy breadcrumbach, hierarchia `H1→H2→H3`, kontrast, `alt` dla grafik.

---

## 9. Prawne (landing porównawczy i atrybutowy)
* **Reklama porównawcza (PL):** dozwolona, jeśli **nie wprowadza w błąd** i porównuje weryfikowalne cechy. Dane o konkurencji (ceny, minimalny nakład, czas dostawy, cło) muszą być aktualne/prawdziwe - dodawaj disclaimer "sprawdź u dostawcy" + notę o znakach towarowych (jak we wzorcu).
* **Znaki towarowe:** użycie nazw konkurentów w tytule/URL to użycie **nominatywne** (porównanie) - dopuszczalne, ale **bez logotypów** i bez sugerowania powiązania/partnerstwa.
* **Roszczenia o produkcie:** tylko prawdziwe (materiał, trwałość). Żadnych "wieloletnia odporność zewnętrzna", "do zmywarki", "faktura VAT" bez potwierdzenia właściciela.

---

## 10. QA przed publikacją (checklista)
* [ ] BLUF + cena w pierwszym ekranie.
* [ ] Nie kanibalizuje `/` (inna, kwalifikowana fraza).
* [ ] `BreadcrumbList` + `FAQPage` + `Product`/`Offer` w JSON-LD; widoczny FAQ **==** schemat.
* [ ] Fakty tylko z zatwierdzonego zestawu (§5); parafraza, nie kopiuj bloków.
* [ ] Linki: ≥2 CTA do `/`, 2-4 do spoke'ów; spoke'y podlinkowane "w górę".
* [ ] Disclaimer + nota o znakach (jeśli porównawczy).
* [ ] canonical self-referencyjny; strona dodana do `sitemap.ts`.
* [ ] Zakaz "projektowania"; dywiz "-", nie półpauza.
* [ ] Header/Footer nietknięte; link w nawigacji tylko za zgodą.
* [ ] Utworzono folder `public/landing/<slug>/` na grafiki (patrz §11).
* [ ] Zgodność z faktycznym Next.js (przewodnik w `node_modules/next/dist/docs/` sprawdzony).

---

## 11. Organizacja plików zdjęć landingu
* **Osobny folder na landing:** przy tworzeniu każdego landingu utwórz katalog `public/landing/<slug>/` (np. `public/landing/naklejki-dla-firm/`), aby właściciel mógł tam wgrać grafiki. Utwórz go od razu (choćby z `.gitkeep`), zanim zgłosi się po zdjęcia.
* **Domyślnie landing działa BEZ zdjęć** - wzorzec porównawczy nie ma żadnych fotografii, tylko ikony `lucide-react`. Nie blokuj publikacji brakiem grafik.
* **Obsługa zdjęć po wgraniu (jak w blog-agent):** gdy właściciel wgra pliki i da znać, wykonaj: (a) nazwy plików SEO-friendly z dywizami, (b) osadzenie w treści z `alt` nasyconym frazą, (c) branding / pasek z logo jeśli dotyczy, (d) ustawienie grafiki jako `openGraph`/`twitter` image landingu zamiast generycznej. **Nie generuj zdjęć samodzielnie**, chyba że właściciel poprosi.
* **Ścieżki:** odwołuj się relatywnie do katalogu publicznego: `/landing/<slug>/nazwa-obrazu.jpg`.
