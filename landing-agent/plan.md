# 📅 Plan i strategia landing pages

Format jak `blog-agent/plan.md`: wytyczne → kolejka (checkboxy) → zrealizowane. Agent bierze pierwszy niewykonany `- [ ]`, **potwierdza fakty oznaczone "DO POTWIERDZENIA"**, buduje stronę wg `rules.md`, dodaje URL do `sitemap.ts` i oznacza `- [x]`.

---

## 🎯 Wytyczne GEO/AEO dla landingów

1. **Zero kanibalizacji `/`** - landing celuje w kwalifikowany modyfikator, nie w generyczną głowę "naklejki na zamówienie".
2. **Wyciągalna odpowiedź + cena w pierwszym ekranie (BLUF).** Fakty jako cytowalne liczby: 49 zł, 3 dni, od 1 szt.
3. **Komplet structured data:** `BreadcrumbList` + `FAQPage` + `Product`/`Offer` (+ globalne `Organization`/`sameAs`). Widoczny FAQ **==** schemat.
4. **Tabele i specyfikacje** (LLM-y cytują tabele). Disclaimer + nota o znakach przy porównaniach.
5. **GEO warstwowo:** name-drop marek tylko na stronach porównawczych; w segmentowych/atrybutowych - przewagi bez konkurenta.
6. **Świeżość:** dodawaj widoczną "Ostatnią aktualizację" + `dateModified` przy realnych zmianach (analogicznie do pola `updated` w blogu - jeden sygnał, widoczny i w schema).
7. **Parafraza faktów** między stronami - zero near-duplicate boilerplate.
8. **Linkowanie:** landing → kreator; landing ↔ spoke'y; spoke → landing ("w górę").
9. **Tylko prawdziwe roszczenia** (materiał/trwałość/rozliczenia) - patrz sekcja "DO POTWIERDZENIA".

---

## ✅ Fakty POTWIERDZONE (2026-07-24) i ⚠️ nadal otwarte

**Potwierdzone przez właściciela - używaj:**
* **Faktura VAT na NIP - TAK** (jesteśmy płatnikiem VAT). 49 zł = **brutto**. **Brak rabatu hurtowego** (zawsze arkusz po arkuszu).
* **Produkcja 2-3 dni robocze.** Wysyłka: **paczkomat**, **koszt dostawy 19,99 zł** (brak darmowej dostawy). *(zatwierdzone 2026-07-24)*
* Folia winylowa **NIE nadaje się do zmywarki** (nie obiecuj). Odporność: woda / UV / zadrapania.

**⚠️ Nadal DO POTWIERDZENIA (nie używaj bez zgody):**
* **Całkowity** czas dostawy (produkcja 2-3 dni + czas kuriera do paczkomatu) - znany koszt (19,99 zł) i czas produkcji.
* Sufit trwałości zewnętrznej (na lata / na karoserię) - poza "woda/UV/zadrapania".
* Aktualne dane konkurencji do tabel porównawczych (min. nakłady, ceny, czas).

---

## 📊 Wnioski z GSC (dane 2026-07-24)
Serwis wczesny (max ~44 wyświetlenia na zapytanie), więc **priorytetyzuj strategicznie, nie tylko wg obecnego wolumenu**. Sygnały:
* **Największa obecna widoczność:** klaster "małe naklejki" (44 wyśw., poz. 8) - fraza generyczna dla strony głównej/blogu, **NIE landingu** (kanibalizacja).
* **Realna luka atrybutowa/formatowa:** "fotonaklejki" / "foto naklejki" (13+1 wyśw., poz. 27-39) - słaba pozycja mimo popytu → mocny kandydat na przyszły landing/wpis **"fotonaklejki"** (naklejka ze zdjęcia jako produkt). "wykroje die-cut i kiss-cut" (15 wyśw.) potwierdza popyt na die-cut → wspiera **Tier 2 /naklejki-die-cut**.
* **Intencja B2B nascentna:** "słoiki z logo" (poz. 14), "naklejki serwisowe" (poz. 25), "naklejki warsztatowe" (poz. 39) - niski wolumen dziś, ale realna intencja komercyjna → **/naklejki-dla-firm to bet forward-looking**, nie na obecny wolumen.
* **Uwaga - "zaprojektuj naklejkę":** wielokrotnie w danych, ale to fraza "projektowania" objęta **zakazem brandowym** (kreator = arkusz). Nie budować pod nią; łapać semantycznie przez "stwórz/zamów", nigdy "zaprojektuj".

---

## 🧱 Kolejka landingów (priorytet malejąco)

- [x] **Tier 1 — Rozbudowa klastra porównawczego** (decyzja: pojedyncze marki vs 1 hub)
    - **Domyślnie:** wzmacniaj istniejący `/alternatywa-dla-sticker-mule-i-stickerapp` (dodano `Product`/`Offer` schema, znacznik czasu i `dateModified`).
    - Osobne `/alternatywa-dla-stickerapp` lub `/alternatywa-dla-sticker-mule` **tylko** przy potwierdzonym odrębnym wolumenie (GSC) i **unikalnej** treści (nie klon huba).

- [x] **Tier 2 — `/naklejki-foliowe`** (zbudowane 2026-07-25) - atrybut / rdzeń oferty. Szczegóły w "Zrealizowane" niżej.
    - **Intencja:** atrybutowa zakupowa. **Frazy:** naklejki foliowe, winylowe, trwałe, wodoodporne (**scalone w jednej stronie** - decyzja właściciela 2026-07-25: NIE budować osobnego `/naklejki-winylowe` ani `/naklejki-wodoodporne`, near-duplicate).
    - **Decyzja o trwałości (2026-07-25):** wersja zachowawcza - tylko woda/UV/zadrapania. Bez deklaracji "na zewnątrz przez lata" / "na karoserię". Sufit trwałości zewnętrznej **nadal DO POTWIERDZENIA** (patrz niżej).

- [ ] **Tier 2 — `/naklejki-die-cut`** (cięcie po obrysie) - format
    - **Intencja:** format zakupowy. **Frazy:** die cut naklejki, cięte po obrysie, naklejki w kształcie.
    - **Uwaga na pokrycie** z wpisem blogowym die-cut/kiss-cut: landing = komercyjny ("zamów"), wpis = edukacyjny; krzyżuj linki, różnicuj intencją.

- [ ] **Tier 3 — `/slownik-naklejek`** (glosariusz AEO) - opcjonalnie
    - `DefinedTerm`/`FAQPage`; definicje die-cut, kiss-cut, folia winylowa, laminat, DPI. Magnes na cytowania LLM. Niższy priorytet (pokrycie z blogiem).

---

## 🚫 Świadomie odrzucone (nie buduj)
* Landing pod generyczne "naklejki na zamówienie" - **kanibalizacja `/`.**
* **Local SEO** ("naklejki Warszawa/Kraków") - thin i mało wartościowe dla sklepu online ogólnopolskiego.
* **Rój thin "alternatywa dla [każda marka]"** - near-duplicate, rozmycie intencji.
* Strony atrybutowe pod **nieoferowane** materiały (hologram / transparent / brokat) - fałszywa obietnica.

---

## ✅ Zrealizowane
- [x] **`/naklejki-foliowe`** (2026-07-25) - Tier 2 landing atrybutowy (rdzeń oferty: folia/winyl). Plik: `src/app/naklejki-foliowe/page.tsx`. Mikro-klaster **foliowe = winylowe = wodoodporne = trwałe** scalony w jednej stronie (decyzja właściciela: nie mnożyć near-duplicate). Struktura: Hero BLUF (49 zł brutto/A4, od 1 szt., 300 DPI, woda/UV/zadrapania, produkcja 2-3 dni, paczkomat) + widoczna "ostatnia aktualizacja" → trust stats (49 zł / od 1 szt. / 300 DPI / Woda·UV·rysy) → "Czym są naklejki foliowe" (foliowe==winylowe, wodoodporność) → tabela specyfikacji (12 wierszy, cytowalna) → 6 zastosowań (butelki/słoiki, laptop, rower/sport, moto, kuchnia, produkty) → 6 zalet → "jak zamówić" 1-2-3 (link die-cut) → 10 FAQ → final CTA. **Schema: `BreadcrumbList`+`Product`/`Offer`(49.00 PLN, material: Folia winylowa)+`FAQPage`+`WebPage`(dateModified).** Użytkownik wgrał zdjęcia, zostały one zoptymalizowane SEO (alt, nazwy), osadzone w treści z zachowaniem proporcji, wypalono na nich logo i wygenerowano materiały Pinterest/Social. Dodany do `sitemap.ts`.
    - **Trwałość - wersja zachowawcza (2026-07-25):** strona twierdzi wyłącznie woda/UV/zadrapania. FAQ "na jakie warunki odporna" odpowiada bez deklaracji wieloletniej zewnętrznej/karoserii; FAQ "zmywarka" jasno mówi NIE. Gdy właściciel potwierdzi sufit trwałości zewnętrznej - można wzmocnić copy (na zewnątrz/lata) i dodać FAQ "na zewnątrz".
    - **Linkowanie przychodzące (zrobione 2026-07-25):** 1 link ze strony głównej (`SeoContentSection.tsx`, sekcja "trwała folia", anchor "wodoodpornej folii winylowej") + 3 linki "w górę" ze spoke'ów (rower, laptop, moto - anchory sparafrazowane: "wodoodpornej folii winylowej"/"folii winylowej"). Wychodzące: kreator (2× CTA), die-cut (2×), drukowanie online, słoiki/opakowania, laptop, rower, moto, przyprawy.
    - **TODO strategiczne (opcjonalnie):** gdy potwierdzona trwałość zewnętrzna - rozważ osobny mocny akapit/FAQ; monitoruj GSC, czy "wodoodporne" nie zasługuje jednak na własną stronę (na razie: NIE, scalone).
- [x] **`/naklejki-dla-firm`** (2026-07-24) - komercyjny hub B2B. Plik: `src/app/naklejki-dla-firm/page.tsx`. Hero BLUF (faktura VAT, 49 zł brutto, brak min. nakładu, produkcja 2-3 dni, paczkomat) → trust stats → 6 zastosowań B2B (z linkami do spoke'ów) → 6 zalet → tabela specyfikacji → "jak zamówić" → 9 FAQ → final CTA. **Schema: `BreadcrumbList`+`Product`/`Offer`(49.00 PLN)+`FAQPage`.** Bez zdjęć (folder `public/landing/naklejki-dla-firm/` gotowy - **czeka na grafiki od właściciela**; po wgraniu: nazwy SEO, alty, branding, OG image). Dodany do `sitemap.ts`. Linkuje do spoke'ów: logo-firmy, sloiki/opakowania, serwisowe, eventy, die-cut, mały nakład.
    - **TODO po zdjęciach:** osadzić grafiki, podmienić OG z generycznej na dedykowaną.
    - **Linkowanie przychodzące (zrobione 2026-07-24):** link z sekcji SEO strony głównej (`SeoContentSection.tsx`, anchor "naklejki dla firm") + linki "w górę" z 4 wpisów B2B (logo-firmy, sloiki/opakowania, serwisowe, eventy). Przy okazji poprawiono na stronie głównej fałszywe "przetrwają w zmywarce" (folia NIE nadaje się do zmywarki).
    - **Naprawa SSR strony głównej (zrobione 2026-07-24, task_dbc976e8):** `HomePageClient.tsx` renderował całą stronę główną dopiero po JS - teraz gałąź `!mounted` renderuje powłokę (Header + Mini-Hero + placeholder kreatora + sekcje SEO/marketing + Footer) serwerowo. Efekt: link przychodzący do `/naklejki-dla-firm` oraz 9 linków do bloga są teraz w surowym HTML (SSR), widoczne dla crawlerów bez JS (GEO/AEO). Usunięto też sfabrykowaną ocenę 4.9/128 (JSON-LD + widoczne "4.9/5").
- [x] **`/alternatywa-dla-sticker-mule-i-stickerapp`** (2026-07-24) - landing porównawczy GEO/AEO. Hero BLUF, trust stats, tabela porównawcza (z disclaimerem i notą o znakach), 6 zalet, "jak zamówić", 6 FAQ z `FAQPage`, final CTA. `BreadcrumbList`+`FAQPage`. Podlinkowany z: homepage FAQ #3, artykuł moto; dodany do `sitemap.ts`. **Wzorzec referencyjny** dla kolejnych landingów.
    - **ZROBIONE wzmocnienia (2026-07-25):** dodano `Product`/`Offer` schema (jak w /naklejki-dla-firm); widoczna "ostatnia aktualizacja" + `dateModified` w obiekcie WebPage.
