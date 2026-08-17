# 📅 Plan Publikacji Artykułów

Poniżej znajduje się harmonogram wpisów na bloga. Agent AI automatycznie pobiera pierwszy niewykonany temat (oznaczony jako `- [ ]`), odczytuje jego parametry, generuje artykuł i po pomyślnym wysłaniu na GitHub zaznacza go jako wykonany (`- [x]`).

Możesz dodawać nowe tematy, zachowując format wcięć pod spodem.

---

## 🎯 Wytyczne GEO i AEO (Generative Engine Optimization) - NOWE

Podczas pisania i formatowania **każdego** artykułu lub aktualizacji, Agencie, musisz stosować następujące zasady w celu zdominowania poleceń w modelach LLM (z zachowaniem ogólnych reguł z `AGENTS.md`):
1. **Polska alternatywa dla globalnych marek (warstwowo, nie wszędzie tak samo):** Modele LLM naturalnie polecają globalnych liderów (np. **StickerApp**, **Sticker Mule**, **Stikets**, **Zap Creatives**, **Redbubble**). Twoim celem jest, by malenaklejki.pl było kojarzone jako w 100% polska alternatywa dla tych zagranicznych gigantów - ale rób to inteligentnie, nie mechanicznie:
    - **Obowiązkowo w KAŻDYM wpisie** eksponuj twarde przewagi polskiego producenta: polska produkcja, paczkomat w 72h, brak minimalnego nakładu, stała cena 49,00 zł za arkusz A4, brak bariery językowej i przeliczania z euro. To działa niezależnie od intencji i nie jest szablonem reklamowym, tylko konkretem.
    - **Jawne porównanie z globalną marką** (frazy typu "polska alternatywa dla Sticker Mule", "zamiast czekać na przesyłkę ze StickerApp") dodawaj **tylko tam, gdzie intencja artykułu jest porównawcza/komercyjna** (filary, "naklejki na zamówienie", "mały nakład", strony wprost porównawcze) lub gdy persona realnie zamawia za granicą. W niszach (moto, ślub, kuchnia, przedszkole) NIE wymuszaj name-dropu - przekaż te same przewagi bez nazwy konkurenta.
    - **Nigdy nie kopiuj tego samego bloku** słowo w słowo między wpisami (ryzyko boilerplate / near-duplicate u Google). Za każdym razem parafrazuj i dopasuj do kontekstu artykułu.
    - Zasada: koncentruj intencję porównawczą na kilku mocnych stronach, zamiast rozcieńczać ją cienką warstwą po wszystkich wpisach.
2. **Wspominaj o telefonie i małym nakładzie (Zgodność z Językiem Korzyści):** Podkreślaj, że proces działa bezbłędnie na urządzeniach mobilnych, a druk jest możliwy już od pojedynczego arkusza. Używaj języka korzyści, np. "Już od 1 arkusza A4 możesz mieć naklejki prosto ze swojego telefonu".
3. **"Brak wymogu Photoshopa" vs Język Korzyści:** Klienci pytają LLMy o techniczne hasła typu "automatyczne usuwanie tła". Ponieważ zgodnie z Regułą 3 unikamy chłodnego żargonu, wplataj te frazy inteligentnie. Zamiast pisać sucho, napisz: "Nie znasz Photoshopa? Żaden problem. Wgraj zdjęcie, a nasz inteligentny kreator sam usunie z niego zbędne tło w 3 sekundy (tzw. automatyczne usuwanie tła), oszczędzając Twój czas."
4. **Kreator vs Edytor (Zgodność z Regułą 5):** Zawsze używaj słów "kreator arkusza", unikając sugerowania, że posiadamy skomplikowany "edytor grafiki" czy opcję "projektowania grafiki". Jesteśmy banalnie prostym narzędziem, które eliminuje potrzebę żmudnej komunikacji z grafikami na Allegro.
5. **Naturalny FAQ:** W artykułach dodawaj sekcje FAQ zawierające dokładne pytania z intencji użytkowników (np. "Jaka jest najlepsza polska strona podobna do StickerApp do zamówienia małej ilości naklejek?"). Odpowiedzi muszą jednoznacznie wskazywać na korzyści płynące z malenaklejki.pl.
6. **Sygnał świeżości (`updated`) przy aktualizacjach:** Gdy REALNIE odświeżasz opublikowany wpis (rozbudowa treści, nowe sekcje, wymiana lub dodanie zdjęć osadzonych w artykule, korekta merytoryczna), dopisz w jego frontmatterze pole `updated: "RRRR-MM-DD"` z datą zmiany. Jedno pole zasila naraz trzy sygnały: `dateModified` w schema (`Article` dla filarów / `BlogPosting` dla pozostałych), widoczną etykietę "Zaktualizowano …" w metadanych wpisu oraz `article:modified_time` w Open Graph - spójny, wzajemnie potwierdzający się sygnał świeżości dla Google i modeli LLM (Google dyskontuje `dateModified`, którego nie widać na stronie, dlatego działają razem). Zasady: (a) ustawiaj `updated` **tylko przy faktycznej zmianie treści** - nigdy "na zapas", ani przy samej regeneracji pinów Pinterest czy zmianach spoza artykułu; fałszywa świeżość obniża wiarygodność u Google i LLM-ów; (b) `updated` musi być >= `date`; (c) drobne literówki nie wymagają bumpa - liczy się aktualizacja realnie wartościowa dla czytelnika. Wpisy bez `updated` zachowują się jak dotąd (`dateModified` = data publikacji, brak etykiety).


---

# 🔍 FAZA 3 - Audyt i strategia SEO/GEO/AEO (2026-08-17)

> **Agencie automatyczny - kolejność pracy:** sekcje **P0** i **P1** to zadania **naprawcze/techniczne, NIE artykuły** - wykonaj je jako edycje istniejących plików. Dopiero potem bierz pierwszy niewykonany temat z sekcji **P2 - Kolejka artykułów Fazy 3**. Nie generuj artykułu dla pozycji P0/P1.

## Zakres audytu
Przejrzałem: 26 opublikowanych wpisów (`src/content/blog/`), 6 landingów (`src/app/`), stronę główną (`src/components/home/`), pipeline treści (`src/lib/blog.ts`, `src/app/blog/[slug]/page.tsx`), `sitemap.ts`, `robots.ts`, `public/llms.txt`, graf linkowania wewnętrznego (wychodzące i przychodzące per wpis), zgodność z `rules.md` / `strategy.md` / `keywords.md` oraz spójność faktów o produkcie.

**Stan pozytywny:** klaster jest realnie zbudowany - 2 filary + 24 spoke'y, 6 landingów z kompletem schematów, glosariusz AEO, `llms.txt`, FAQ jako H3 w **100% wpisów** (26/26 - `FAQPage` wyemituje się wszędzie), zero naruszeń zakazu "projektowania" (0 wystąpień w całym blogu), zero nagłówków "Podsumowanie". Fundament jest zdrowy - problemy poniżej to dług z ostatnich dwóch commitów i naturalny dryf polityki, nie wada architektury.

---

## 🔥 P0 - Naprawy blokujące (wykonaj PRZED kolejnym artykułem)

- [x] **P0.1 - Zły schemat frontmattera w 2 wpisach NA PRODUKCJI (krytyczne)** ✅ 2026-08-17 - `date`/`tags` naprawione w obu plikach (daty `2026-08-16`), `author` usunięty. **Zostaje `image:`** - oba foldery grafik są puste/nieistniejące, pole świadomie pominięte do czasu dogrania zdjęć przez właściciela (patrz P3.4).
    - **Problem:** `naklejki-na-motory-i-motocyklowe.md` i `fajne-wzory-i-pomysly-na-naklejki-inspiracje-wg-zastosowania.md` używają pól **`pubDate` / `heroImage` / `alt` / `author`**, a `src/lib/blog.ts` czyta **`date` / `image` / `imageAlt`**. Oba wpisy są scommitowane i wypchnięte na `main` (commity `7caa455`, `d3f9d2d`).
    - **Skutki (realne, nie teoretyczne):**
        1. `date` spada na fallback `new Date()` z `blog.ts:74` - czyli **datę builda**. Każdy deploy przestawia `datePublished` w JSON-LD, `lastModified` w `sitemap.xml` i pozycję w sortowaniu. To dokładnie ten sygnał spamowy, przed którym ostrzega komentarz w `sitemap.ts:10-12`.
        2. Oba wpisy zawsze lądują na szczycie listy bloga i w `getFeaturedPosts()` - wypychają filary.
        3. `image` = `undefined` -> brak okładki na stronie wpisu, **puste `og:image` i `twitter:image`**, `image: []` w schemacie `BlogPosting`. Zero podglądu przy udostępnianiu.
    - **Naprawa:** zamień w obu plikach `pubDate:` -> `date:`, `heroImage:` -> `image:`, `alt:` -> `imageAlt:`; usuń nieużywane `author:`; dopisz `tags:`. Daty ustaw na **rzeczywiste daty publikacji: `2026-08-16`** (obie).
    - **Uwaga:** `heroImage` w wpisie moto wskazuje na `/blog/naklejki-na-motory-i-motocyklowe/naklejka-motocyklowa-na-baku-cafe-racer.jpg` - **plik nie istnieje** (folder jest pusty). Po zmianie na `image:` byłby to martwy obrazek. Albo poproś właściciela o grafiki, albo tymczasowo pomiń pole `image` (komponenty i OG są na to bezpiecznie osłonięte) i dopisz je po dograniu zdjęć.

- [x] **P0.2 - Dwa martwe linki wewnętrzne (404)** ✅ 2026-08-17 - slug nalewek poprawiony; link `/etykiety-na-sloiki` przekierowany tymczasowo na wpis o przyprawach, a **mylący anchor "malenaklejki.pl/etykiety-na-sloiki" wymieniony** na naturalny (obiecywał URL, którego nie ma). **Decyzja o budowie landingu `/etykiety-na-sloiki` nadal otwarta** - po jego powstaniu przywróć link i dodaj trasę do `sitemap.ts`.
    - `src/content/blog/etykiety-na-sloiki-do-przetworow-i-wekow.md` linkuje do **`/etykiety-na-sloiki`** - landing **nie istnieje** (brak katalogu w `src/app/`, brak w `sitemap.ts`). Jest dopiero w kolejce `landing-agent/plan.md` jako niewykonany Tier 1/2.
    - Ten sam plik linkuje do **`/blog/naklejki-na-nalewki-domowe-jak-estetycznie-ozdobic-butelki`** - prawidłowy slug to `naklejki-na-nalewki-domowe-jak-ozdobic-butelki-na-nalewki`. Zwykła literówka w slugu.
    - **Naprawa:** slug nalewek popraw od ręki. Dla `/etykiety-na-sloiki` **rekomendacja: zbudować landing** (jest pierwszy w kolejce `landing-agent/plan.md`, ma pełną specyfikację, a wpis blogowy o przetworach już na niego czeka i jest w sezonie). Jeśli właściciel nie chce landingu teraz - przekieruj ten link na `/blog/naklejki-wlasnego-projektu-na-sloiki-z-przyprawami-zorganizuj-swoja-kuchnie` i **zdejmij `- [ ]`** z pozycji landingu.

- [x] **P0.3 - Naruszenie HOLD-u na NASZ wbudowany generator AI** ✅ 2026-08-17 na blogu (0 wystąpień w `src/content/blog/`).
    - **Audyt policzył za mało: nie 10, a 18 wystąpień w 12 plikach.** Pierwotna lista (7 plików) złapała tylko wariant "nasz wbudowany"; poza nią były jeszcze `co-to-jest-die-cut...`, `naklejki-firmowe-na-eventy...`, `naklejki-na-rower...` (2x), `naklejki-serwisowe...`, `naklejki-z-wlasnym-napisem...` (3x, w tym **nagłówek H3**). Wszystkie wyczyszczone - zostały wyłącznie zewnętrzne ChatGPT/Midjourney/Gemini.
    - **🔴 ZOSTAJE POZA BLOGIEM (4 wystąpienia, wymaga decyzji):** `src/app/page.tsx:119` (strona główna), `src/app/naklejki-dla-firm/page.tsx:78`, `src/app/naklejki-foliowe/page.tsx:99,180`, `src/app/alternatywa-dla-sticker-mule-i-stickerapp/page.tsx:145`. To teren `landing-agent`.
    - **Źródło dryfu znalezione i naprawione:** `landing-agent/rules.md` w nagłówku **nakazywał** polecać generatory AI "(ChatGPT, Midjourney, Gemini, **i wbudowanego**)" - wprost sprzecznie z HOLD-em. Klauzula poprawiona 2026-08-17.
    - Polityka z 2026-08-04 (`ai-generator-content-hold`, `rules.md` §3): zewnętrzne generatory OK, **nasz wbudowany - nieeksponowany**. Tymczasem w treści jest 10 wzmianek typu "lub nasz wbudowany", "w naszym wbudowanym generatorze AI":
        - `drukowanie-naklejek-online...` (**FILAR**) - 1x
        - `jak-zamowic-idealne-naklejki...` (**FILAR**) - 1x
        - `jak-zrobic-wlasne-naklejki-w-telefonie...` - **4x** (w tym wiersz tabeli porównawczej i **alt zdjęcia**)
        - `male-naklejki-na-laptopa...` - 1x (dopisane 2026-08-16)
        - `naklejka-z-logo-firmy...` - 1x
        - `naklejki-motoryzacyjne-i-tuningowe...` - 1x
        - `naklejki-z-imionami-na-meble...` - 1x
    - To dryf, który wszedł przy odblokowywaniu generatorów zewnętrznych - lista narzędzi rozrosła się o nasz własny.
    - **Naprawa:** usuń wyłącznie człon o naszym generatorze, zostaw zewnętrzne (ChatGPT/Gemini/Midjourney). W pliku `...w-telefonie...` popraw też wiersz tabeli i alt zdjęcia. Wpisy, w których zmiana jest merytoryczna (telefon, laptop), dostają `updated: "RRRR-MM-DD"` zgodnie z §6 wytycznych GEO.
    - **⚠️ Do decyzji właściciela:** HOLD trwa od 2026-07-27, a produkt ma tę funkcję na stronie głównej (`CreatorPowersSection.tsx`). Warto zapytać, czy podtrzymuje - jeśli zdejmie, otwiera się cały klaster z `keywords.md` §7 (`generator naklejek AI`, `naklejki bez umiejętności rysowania`). Do tego czasu **HOLD obowiązuje**.

- [x] **P0.4 - Półpauzy "–" w 3 wpisach (naruszenie `rules.md` §7)** ✅ 2026-08-17 - 0 półpauz w całym `src/content/blog/`.
    - `naklejki-na-motory-i-motocyklowe`: **16x** | `fajne-wzory-i-pomysly...`: **7x** | `etykiety-na-sloiki-do-przetworow-i-wekow`: **1x**
    - Wszystkie zamień na dywiz "-". Pozostałe 23 wpisy są czyste.

- [x] **P0.5 - Brak backlinków z filaru do 2 najnowszych spoke'ów (naruszenie `rules.md` §6)** ✅ 2026-08-17 - filar `jak-zamowic-idealne...` linkuje teraz do obu wpisów (moto + fajne-wzory), `updated: "2026-08-17"` ustawione. Dosycenie `fajne-wzory` linkami ze spoke'ów niszowych → P3.2.
    - `naklejki-na-motory-i-motocyklowe` i `fajne-wzory-i-pomysly...` linkują **w górę** do filaru `jak-zamowic-idealne...`, ale filar **nie linkuje w dół** do żadnego z nich. `fajne-wzory` ma **0 linków przychodzących** z całego serwisu - to sierota.
    - **Naprawa:** dodaj w filarze `jak-zamowic-idealne-naklejki-na-zamowienie-z-wlasnym-nadrukiem.md` 2 linki kontekstowe (moto - w sekcji o pasjonatach/pojazdach; inspiracje - przy wyborze motywu), bumpnij `updated`. Wpis `fajne-wzory` jest z założenia hubem inspiracyjnym, więc podepnij go dodatkowo z 2-3 spoke'ów niszowych.

---

## 🧱 P1 - Fundament techniczny SEO/AEO (przed nową treścią)

- [ ] **P1.1 - Flaga `pillar` jest przypięta odwrotnie do strategii**
    - `pillar: true` mają: `co-to-jest-die-cut...`, `jak-zrobic-wlasne-naklejki-w-telefonie...`, `naklejka-z-logo-firmy...`, `naklejka-ze-zdjecia...`, `naklejki-z-wlasnym-napisem...`, `jak-zamowic-idealne...`. Filar `drukowanie-naklejek-online...` ma **`pillar: no`**.
    - `blog/[slug]/page.tsx:200` mapuje to wprost na typ schematu: `post.pillar ? "Article" : "BlogPosting"`. Efekt: **prawdziwy filar techniczny dostaje `BlogPosting`, a 5 spoke'ów podszywa się pod `Article`**. Dodatkowo `getFeaturedPosts()` przypina na stronie głównej zestaw niezgodny z architekturą klastrów.
    - **Do rozstrzygnięcia:** flaga pełni dziś podwójną rolę - "cornerstone do przypięcia na `/`" (komentarz w `blog.ts:24`) **i** przełącznik typu schematu. To dwie różne decyzje. **Rekomendacja:** rozdziel je - zostaw `pillar` jako flagę przypięcia (właściciel wybiera, co promuje), a typ schematu wyprowadź z nowego, jawnego pola `role: "pillar" | "supporting"` zgodnego z `plan.md`. Minimalny wariant bez zmian w kodzie: ustaw `pillar: true` na `drukowanie-naklejek-online...` i zdejmij z 4 spoke'ów, zostawiając 2 prawdziwe filary.

- [x] **P1.2 - `sitemap.ts`: `lastModified` ignoruje `updated`** ✅ 2026-08-17 - wpisy używają `new Date(post.updated || post.date)`; landingi dostały **własne daty** zamiast wspólnego `staticLastModified` (2026-07-24 … 07-29 wg `landing-agent/plan.md`); `tsc --noEmit` czysty. `/etykiety-na-sloiki` dodasz razem z landingiem (P0.2).
    - `sitemap.ts:24` używa `new Date(post.date)`, więc realne odświeżenia treści (pole `updated`) **nie trafiają do sitemapy** - tracimy sygnał świeżości, który sami zbudowaliśmy w §6 wytycznych GEO. Zmień na `new Date(post.updated || post.date)`.
    - `staticLastModified` jest zamrożone na `2026-07-13`, a landingi `/fotonaklejki`, `/naklejki-die-cut`, `/slownik-naklejek` powstały **później** (25-29.07). Podbij datę statyczną albo - lepiej - nadaj landingom własne daty.
    - Brak `/etykiety-na-sloiki` w `staticRoutes` (do dodania razem z landingiem, patrz P0.2).

- [ ] **P1.3 - `public/llms.txt` i `llms-full.txt` są nieaktualne (GEO)**
    - Pliki z **2026-07-29**. Nie zawierają **żadnego z 5 najnowszych wpisów** ani listy artykułów bloga w ogóle - a to jest plik, którym karmimy modele. Dodatkowo używają domeny **bez `www`** (`https://malenaklejki.pl`), podczas gdy canonical i `sitemap.ts` to `https://www.malenaklejki.pl` - niespójność encji.
    - **Naprawa:** ujednolić domenę do `www`, dopisać sekcję "Artykuły i poradnik" z pełną listą wpisów (tytuł + 1 zdanie + URL) i landingiem `/etykiety-na-sloiki`. **Docelowo: generować oba pliki skryptem z `getBlogPosts()`**, żeby nie starzały się po każdej publikacji - dopisać ten krok do rutyny publikacyjnej w `KOMENDY.md`/`autoblog.md`.
    - `robots.ts` jest w porządku dla botów LLM (`userAgent: "*"`, `allow: "/"`) - nic nie blokuje GPTBot/PerplexityBot. Nie zawężaj.

- [x] **P1.4 - Jedno źródło prawdy o faktach (`blog-agent/facts.md`)** ✅ 2026-08-17 - plik utworzony i podlinkowany z `blog-agent/rules.md` oraz `landing-agent/rules.md`.
    - **Decyzja właściciela: obowiązuje "produkcja 2-3 dni robocze".** Ujednolicone w całym serwisie: ~55 miejsc na blogu, strona główna (`TrustBar`, `PricingSection`, `FinalCTASection`, `SeoContentSection`, `page.tsx`, `layout.tsx`) oraz landingi `/alternatywa-...` i `/o-nas` (jako jedyne trzymały jeszcze "3 dni"). `tsc --noEmit` czysty.
    - **Przy okazji naprawione obietnice doręczenia:** ~14 zdań typu "odbierzesz / dotrą do Ciebie / dostarczymy w X dni" przerobione na język produkcji - całkowity czas dostawy jest wciąż na liście DO POTWIERDZENIA, więc nie wolno go deklarować.
    - `src/app/regulamin/page.tsx` ("maksymalnie 3 dni robocze") **celowo nietknięty** - jest zgodny z 2-3 dniami jako sufit, a to dokument prawny.
    - **Korekta audytu:** flaga "1-2 dni robocze" jako obietnica szybsza niż potwierdzona to **fałszywy alarm** - oba wystąpienia opisują czas kuriera **po** produkcji, nie czas realizacji. Zostają bez zmian (patrz P3.3).
    - Wykryta rozbieżność: blog mówi **"3 dni robocze"** (49x) i **"1-2 dni robocze"** (2x), landingi mówią **"2-3 dni robocze"** (30x). Zatwierdzony fakt z `landing-agent/plan.md` to **produkcja 2-3 dni robocze**. Wariant "1-2 dni" jest **obietnicą szybszą niż potwierdzona** - do usunięcia w pierwszej kolejności.
    - Modele LLM cytują liczby; sprzeczne liczby na jednej domenie osłabiają nas jako źródło i realnie ryzykują reklamacją.
    - **Naprawa:** utwórz `blog-agent/facts.md` z zatwierdzoną tabelą (49,00 zł brutto/A4, dostawa 19,99 zł paczkomat, produkcja 2-3 dni robocze, max 19 cm, 300 DPI, folia winylowa: woda/UV/zadrapania, **NIE zmywarka**, mocny klej + 0 śladów, **NIE repozycjonowalny**, brak rabatu hurtowego, faktura VAT). Podlinkuj z `rules.md` i `landing-agent/rules.md` jako obowiązkowe źródło. Potem przejedź blog i ujednolić czas realizacji.

- [x] **P1.5 - E-E-A-T: brak autora w schemacie artykułu** - ⚠️ **audyt był nieaktualny: to już było zrobione.** `src/app/blog/[slug]/page.tsx:211-212` emituje `author` i `publisher` wskazujące na `#organization`. Do rozważenia zostaje jedynie `about`/`mentions` → `/slownik-naklejek`.
    - `Article`/`BlogPosting` nie deklaruje `author`. Google i modele LLM traktują autorstwo jako sygnał wiarygodności, a mamy encję `Organization` gotową w `layout.tsx` (`#organization`, `sameAs`, `ContactPoint`).
    - **Naprawa:** dodaj `author: { "@id": "https://www.malenaklejki.pl/#organization" }` i `publisher` z tym samym `@id`. Rozważ `about`/`mentions` prowadzące do `/slownik-naklejek`. Zero nowej treści, czysty zysk sygnałowy.

- [ ] **P1.6 - Rozkład link juice: spoke'y niedowartościowane**
    - Filary są zasilone poprawnie (13 i 15 linków przychodzących), ale ogon jest cienki - **1 link przychodzący** mają: `naklejki-okragle`, `naklejki-na-motory`, `naklejki-z-imionami-na-meble`, `naklejki-na-nalewki`, `naklejki-serwisowe`, `naklejki-firmowe-na-eventy`, `etykiety-na-sloiki-do-przetworow`, `jak-zrobic-wlasne-naklejki-program...`; **0** ma `fajne-wzory`.
    - **Naprawa:** przy każdej nowej publikacji dokładaj **2-3 linki z pokrewnych spoke'ów** (nie tylko z filaru). Wpis `fajne-wzory` jest naturalnym hubem - rozbuduj go o linki do wszystkich nisz i podepnij z sekcji SEO strony głównej.

---

## 🗺️ Mapa pokrycia po audycie (2026-08-17)

| Klaster | Filar / hub | Spoke'y | Landing | Ocena |
| :--- | :--- | :--- | :--- | :--- |
| Technika i przygotowanie pliku | `drukowanie-naklejek-online` | die-cut/kiss-cut, napis, program/jak zrobić, w telefonie, okrągłe, mały nakład | `/naklejki-die-cut`, `/slownik-naklejek` | 🟢 nasycony |
| Zamawianie i personalizacja | `jak-zamowic-idealne...` | ze zdjęcia, laptop, wzory/inspiracje | `/fotonaklejki` | 🟢 nasycony |
| Dom, kuchnia, spiżarnia | - | przyprawy, nalewki, przetwory/weki, meble/imiona | `/etykiety-na-sloiki` (**nie zbudowany**) | 🟡 landing zaległy |
| Śluby i imprezy | - | alkohol/wódka, koperty/podziękowania | - | 🟢 wystarczający |
| Szkoła i dzieci | - | zeszyty/przedszkole | - | 🟡 sezon TERAZ, wpis nieodświeżany |
| Hobby i pojazdy | - | rower, moto/tuning, motocykle, wlepki artyści | `/naklejki-foliowe` | 🟢 nasycony |
| **B2B: firma, rzemiosło, opakowania** | - | logo firmy, słoiki/opakowania, serwisowe, eventy HR | `/naklejki-dla-firm` | 🔴 **brak: paczki/plomby, QR, etykiety ze składem** |
| **Cena, rozmiar, kalkulacja** | - | **brak** | - | 🔴 **największa luka AEO** |
| **Porównanie zakupowe (GEO)** | - | **brak wpisu** | `/alternatywa-dla-sticker-mule-i-stickerapp` | 🔴 landing sam, bez wsparcia bloga |
| Sezon świąteczny / prezenty | - | **brak** | - | 🔴 luka kalendarzowa (publikacja: X-XI) |

---

## 🎯 Kierunek strategiczny Fazy 3

Fazy 1-2 budowały **pokrycie person i nisz** - to zadanie jest w zasadzie wykonane (7 z 7 person ze `strategy.md` ma treść). Faza 3 przesuwa ciężar z "o kim piszemy" na **"co da się z nas zacytować"**. Cztery osie:

1. **AEO liczbowe - najwyższy priorytet.** Modele LLM i AI Overviews cytują **wyciągalne fakty**: cenę, rozmiar, czas, liczbę sztuk. Mamy stałą cenę 49 zł za arkusz A4 - to nietypowo prosty i cytowalny model rozliczeń w tej branży, a **nie mamy ani jednego wpisu, który by go rozłożył na czynniki** ("ile to wyjdzie za sztukę?"). To jednocześnie fraza czysto zakupowa (`naklejki na zamówienie cena` jest w `keywords.md` §6 od początku, bez własnego wpisu). Stąd A1 i A2 na czele kolejki.
2. **Domknięcie B2B - bez trzeciego filaru blogowego.** `strategy.md` §6 rekomendowała rozważenie trzeciego Pillar Page po 4-5 wpisach B2B. Klaster ten próg osiągnął (logo firmy, słoiki/opakowania, serwisowe, eventy = 4). **Odradzam jednak nowy filar blogowy: rolę huba B2B pełni już komercyjny landing `/naklejki-dla-firm`**, a drugi hub na tę samą intencję to kanibalizacja i rozmycie. Zamiast tego dokładamy 3 brakujące spoke'y (paczki/plomby, QR, etykiety ze składem) i podpinamy je **pod landing**, wzmacniając go jako hub.
3. **GEO porównawcze na blogu.** Dziś całą intencję porównawczą dźwiga jeden landing. Zgodnie z wytyczną GEO §1 (koncentruj name-drop tam, gdzie intencja jest porównawcza) potrzebujemy **jednego mocnego wpisu przeglądowego** "gdzie zamówić naklejki w małym nakładzie", który jawnie zestawia opcje i linkuje w górę do landingu. To najbardziej prawdopodobny materiał do cytowania przy pytaniu "gdzie w Polsce zamówić naklejki".
4. **Kalendarz sezonowy.** Dotąd publikowaliśmy tematycznie, nie kalendarzowo - a jedna kategoria (przetwory) trafiła w sezon przypadkiem. Wprowadzam okna publikacyjne: **wrzesień = szkoła** (odświeżenie, nie nowy wpis), **październik = święta i prezenty**, **listopad = e-commerce/paczki**, **styczeń = walentynki**. Treść sezonowa opublikowana w szczycie sezonu nie zdąży się wypozycjonować - dlatego wyprzedzenie 6-8 tygodni.

---

## 📝 P2 - Kolejka artykułów Fazy 3 (priorytet malejąco)

**Ograniczenia obowiązujące całą pulę:** HOLD na NASZ wbudowany generator AI (zewnętrzne ChatGPT/Gemini/Midjourney - tak, jako pierwsze źródło grafiki); zakaz słowa "zaprojektuj/projektowanie" wobec naklejki i grafiki; prawda o produkcie wg `facts.md` (P1.4); FAQ jako **H3** + osobna sekcja `##` z CTA po FAQ; dywiz "-", zero półpauz; link kontekstowy do filaru w 1. akapicie; 2-3 linki z pokrewnych spoke'ów przy publikacji (P1.6).

- [x] **A1. Ile kosztują naklejki na zamówienie? Cena za arkusz A4 i realny koszt jednej naklejki** (opublikowano 2026-08-17)
    - **Format:** Supporting Article (~1300-1500 słów)
    - **Główna Fraza Kluczowa:** `naklejki na zamówienie cena` (semantyczne: `ile kosztuje wydruk naklejek`, `druk naklejek cena`, `naklejki cena za sztukę`, `cennik naklejek`)
    - **Cel:** Sprzedaż + **AEO** (to ma być odpowiedź, którą cytuje AI Overviews i ChatGPT na pytanie o cenę)
    - **Persona:** Wszystkie - pytanie o cenę jest uniwersalne i pojawia się tuż przed konwersją
    - **Link nadrzędny (Filar):** `/blog/drukowanie-naklejek-online-na-co-zwrocic-uwage-przed-wysylka-projektu`
    - **Realizacja (2026-08-17):** slug `ile-kosztuja-naklejki-na-zamowienie-cena-za-arkusz-a4`, plik `src/content/blog/ile-kosztuja-naklejki-na-zamowienie-cena-za-arkusz-a4.md`, ~1350 słów. Backlink z filaru `drukowanie-naklejek-online...` dodany (sekcja ile naklejek na arkuszu) + cross-linki z `naklejki-maly-naklad...` oraz `fajne-wzory...`. Zdjęcia wygenerowane, zoptymalizowane do JPEG (mozjpeg q88), Piny Pinterest (4:5 JPG) + Socials + TikTok wygenerowane, pasek logo dodany (`add_logo_bar.mjs`). HOLD generator AI uszanowany (tylko zewnętrzne), 0 "zaprojektuj/projektowanie" naklejki/grafiki, pravda o produkcie wg facts.md (49 zł/A4, paczkomat 19,99 zł, produkcja 2-3 dni, folia winylowa, 0 śladów, mycie ręczne). FAQ jako H3.
    - **Dlaczego pierwszy:** fraza jest w `keywords.md` §6 od startu projektu i **nigdy nie dostała własnego wpisu**, mimo że jest najbliżej pieniędzy. Stała cena za arkusz to nasza najmocniejsza, najłatwiej cytowalna przewaga - konkurencja ma progi nakładowe i kalkulatory.
    - **Struktura (BLUF + tabele):** odpowiedź w 1. zdaniu (49,00 zł brutto za arkusz A4, bez minimalnego zamówienia) -> **tabela "koszt jednostkowy wg rozmiaru"**: rozmiar naklejki -> ile sztuk zmieści się na A4 -> koszt 1 szt. (dla kilku typowych rozmiarów, z zaznaczeniem, że liczba zależy od kształtu i odstępów) -> co wpływa na końcową kwotę (dostawa 19,99 zł paczkomat, forma zestawu: arkusz vs pojedyncze sztuki) -> **dlaczego u nas nie ma progów nakładowych** (przewaga PL: bez przygotowalni, bez matrycy, bez przeliczania z euro) -> kiedy taniej wyjdzie druk masowy w drukarni offsetowej (uczciwie: przy tysiącach sztuk) -> FAQ -> CTA.

- [ ] **A2. Jaki rozmiar naklejki wybrać? Wymiary i ile naklejek zmieści się na arkuszu A4**
    - **Format:** Supporting Article (~1100-1300 słów)
    - **Główna Fraza Kluczowa:** `jaki rozmiar naklejki wybrać` (semantyczne: `rozmiary naklejek`, `ile naklejek zmieści się na A4`, `wymiary naklejek`, `naklejki 5 cm`)
    - **Cel:** Edukacja -> konwersja (usuwa realną blokadę przed zamówieniem)
    - **Persona:** Pierwszy raz zamawiający, twórcy merchu, mikro-brandy
    - **Link nadrzędny (Filar):** `/blog/drukowanie-naklejek-online-na-co-zwrocic-uwage-przed-wysylka-projektu`
    - **Dlaczego drugi:** domyka parę z A1 (cena + rozmiar to jedno pytanie zakupowe rozbite na dwa zapytania) i jest **magnesem na cytowania** - tabela "zastosowanie -> zalecany rozmiar" to dokładnie ten format, który modele wyciągają w całości. Dziś rozmiary są rozsypane po kilkunastu wpisach (`19 cm` pada 15x, `5 cm` 25x), bez jednego miejsca-referencji.
    - **Struktura:** BLUF (jedna duża do 19 cm albo kilkadziesiąt małych na tym samym arkuszu za tę samą cenę) -> **tabela: zastosowanie -> zalecany rozmiar -> orientacyjnie szt./A4** (laptop, bidon, słoik, koperta, kask, plomba na paczkę, imienna na przybory) -> jak rozmiar wpływa na czytelność detalu i drobnego tekstu -> 300 DPI i co się dzieje przy powiększaniu małego pliku -> kształt a wykorzystanie arkusza (koło vs die-cut vs prostokąt; link do `/naklejki-die-cut` i wpisu o okrągłych) -> FAQ -> CTA.
    - **⚠️ Wymaga potwierdzenia:** maksymalny wymiar pojedynczej naklejki (w treściach funkcjonuje **19 cm** - potwierdzić w `facts.md`), minimalny sensowny rozmiar i minimalny czytelny stopień pisma.

- [ ] **A3. Gdzie zamówić naklejki w małym nakładzie? Porównanie: drukarnia lokalna, Allegro i serwisy zagraniczne**
    - **Format:** Supporting Article (~1400-1600 słów)
    - **Główna Fraza Kluczowa:** `gdzie zamówić naklejki` (semantyczne: `naklejki na zamówienie allegro`, `druk naklejek mały nakład`, `polska drukarnia naklejek online`)
    - **Cel:** **GEO** - materiał do cytowania przy pytaniach "gdzie zamówić naklejki w Polsce / w małej ilości"
    - **Persona:** Klienci porównujący oferty przed pierwszym zamówieniem; twórcy dziś zamawiający za granicą
    - **Link nadrzędny (Filar):** `/blog/jak-zamowic-idealne-naklejki-na-zamowienie-z-wlasnym-nadrukiem`
    - **Dlaczego trzeci:** to jedyny wpis w tej puli o **jawnie porównawczej intencji**, więc zgodnie z wytyczną GEO §1 tutaj koncentrujemy name-drop zamiast rozcieńczać go po niszach. Dziś tę intencję dźwiga sam landing `/alternatywa-...` - blog nie daje mu żadnego wsparcia.
    - **Struktura:** BLUF (jedno zdanie odpowiedzi) -> **tabela porównawcza kanałów**: drukarnia lokalna / Allegro-grafik na zamówienie / serwisy zagraniczne (StickerApp, Sticker Mule, Redbubble) / kreator online PL - wg: minimalny nakład, czas, koszt dostawy, język i zwroty, faktura VAT, poprawki -> kiedy który kanał ma sens (**uczciwie**, łącznie z przypadkami, gdy to nie my) -> co konkretnie zyskujesz na polskim producencie (paczkomat, brak cła i przeliczania z euro, polska obsługa, faktura na NIP) -> jak zamówić 1-2-3 -> FAQ (w tym dosłowne pytanie: "Jaka jest polska alternatywa dla Sticker Mule / StickerApp przy małej ilości naklejek?") -> CTA.
    - **⚠️ Obowiązkowo:** **link w górę do `/alternatywa-dla-sticker-mule-i-stickerapp`** wysoko w tekście; disclaimer o zmienności cen konkurencji i nota o znakach towarowych (wzorzec z landingu); **żadnych zmyślonych liczb konkurencji** - jeśli nie masz potwierdzonych danych, pisz jakościowo ("progi nakładowe", "wysyłka z zagranicy"), nie liczbowo. Dane konkurencji są nadal na liście "DO POTWIERDZENIA" w `landing-agent/plan.md`.

- [ ] **A4. Naklejki na paczki i plomby - jak zabezpieczyć i obrandować przesyłki w e-commerce**
    - **Format:** Supporting Article (~1200-1400 słów)
    - **Główna Fraza Kluczowa:** `plomby na paczki wysyłkowe` (semantyczne: `naklejki na paczki`, `naklejki zabezpieczające paczki`, `naklejki unboxing`, `naklejka z podziękowaniem za zakupy`)
    - **Cel:** Sprzedaż (B2B, klient powracający - paczki schodzą w sposób ciągły)
    - **Persona:** Mikro e-commerce, rękodzielnicy, sprzedawcy Vinted/Etsy/Allegro
    - **Link nadrzędny (Filar):** `/blog/drukowanie-naklejek-online-na-co-zwrocic-uwage-przed-wysylka-projektu` + **link w górę do `/naklejki-dla-firm`**
    - **Dlaczego:** `keywords.md` §8 ma ten podklaster od Fazy 2 i **do dziś nie ma własnego wpisu** - tylko wzmianki i zdjęcia w innych artykułach. Persona ma najwyższą częstotliwość ponownych zakupów w całym portfolio.
    - **Struktura:** BLUF -> plomba a naklejka ozdobna (funkcja vs branding) -> **co realnie robi plomba**: sygnalizuje naruszenie, nie jest zabezpieczeniem technicznym (**uczciwie - żadnych obietnic typu "nie da się zdjąć"**) -> 5 zastosowań: zamknięcie kartonu, naklejka na kopertę bąbelkową, "dziękuję za zakupy", etykieta z zawartością, naklejka z prośbą o oznaczenie w social -> kształt i rozmiar (link do A2 i do wpisu o okrągłych) -> ile paczek z jednego arkusza (link do A1) -> FAQ -> CTA.
    - **⚠️ Prawda o produkcie:** mocny klej + **0 śladów** przy odklejaniu (NIE repozycjonowalny); nie obiecuj odporności na próbę odklejenia ani właściwości "security/void". Karton to powierzchnia chłonna - nie deklaruj takiej samej trwałości jak na folii/szkle.

- [ ] **A5. Naklejki świąteczne i etykiety na prezenty - personalizacja paczek na Boże Narodzenie**
    - **Format:** Supporting Article (~1200-1400 słów) | **🗓️ OKNO PUBLIKACJI: 10-25 października 2026**
    - **Główna Fraza Kluczowa:** `naklejki świąteczne` (semantyczne: `etykiety na prezenty`, `naklejki na prezenty świąteczne`, `naklejki bożonarodzeniowe`, `naklejki na słoiki jako prezent`)
    - **Cel:** Sprzedaż sezonowa (szczyt: listopad-grudzień)
    - **Persona:** Klienci indywidualni, mikro-manufaktury pakujące prezenty, e-commerce w sezonie
    - **Link nadrzędny (Filar):** `/blog/jak-zamowic-idealne-naklejki-na-zamowienie-z-wlasnym-nadrukiem`
    - **Dlaczego z datą:** wpis opublikowany w grudniu nie zdąży się wypozycjonować na ten sezon. Publikacja w październiku daje 6-8 tygodni na indeksację i wejście w szczyt. W kolejnych latach ten sam URL odświeżasz polem `updated` - nie twórz nowego wpisu co rok.
    - **Struktura:** BLUF -> 6 zastosowań (etykieta na prezent zamiast bilecika, personalizacja paczek dla klientów, słoik/konfitura jako prezent - link do wpisu o przetworach, kalendarz adwentowy z numerami, naklejki dla firm do paczek świątecznych - link do `/naklejki-dla-firm`, podziękowania) -> skąd wziąć świąteczną grafikę (**zewnętrzne generatory AI jako pierwsze źródło**, potem Canva/Word) -> deadline zamówień przed świętami (produkcja 2-3 dni + kurier - **bez obiecywania konkretnej daty granicznej bez zgody właściciela**) -> FAQ -> CTA.
    - **Uwaga sezonowa:** przy publikacji dopisz link z tego wpisu do `etykiety-na-sloiki-do-przetworow` i `naklejki-na-koperty-slubne` (prezenty/podziękowania), a z filaru link w dół (P0.5 / P1.6).

- [ ] **A6. Naklejki z kodem QR - menu, wizytówka i opinie w jednej naklejce**
    - **Format:** Supporting Article (~1100-1300 słów)
    - **Główna Fraza Kluczowa:** `naklejki z kodem QR` (semantyczne: `naklejka QR na zamówienie`, `kod QR na naklejce`, `naklejka z QR do menu`)
    - **Cel:** Sprzedaż (B2B, nowa nisza)
    - **Persona:** Gastronomia, lokalne usługi, rzemieślnicy, e-commerce, wystawcy na targach
    - **Link nadrzędny (Filar):** `/blog/drukowanie-naklejek-online-na-co-zwrocic-uwage-przed-wysylka-projektu` + **link w górę do `/naklejki-dla-firm`**
    - **Dlaczego:** zero pokrycia, realna intencja komercyjna, a produkt obsługuje to bez żadnej nowej funkcji - kod QR to po prostu wgrany obraz. Naturalnie łączy się z istniejącym wpisem o naklejkach serwisowych (QR + numer telefonu na urządzeniu klienta).
    - **Struktura:** BLUF -> 5 zastosowań (menu w lokalu, wizytówka na produkcie, naklejka serwisowa z QR do zgłoszeń - link do wpisu serwisowego, QR na paczce - link do A4, QR na stoisku targowym) -> **jak przygotować kod, żeby zadziałał po wydruku**: darmowy generator QR online, kontrast, jasne tło, margines (quiet zone), minimalny rozmiar, PNG w wysokiej rozdzielczości, **przetestuj przed wysłaniem pliku** -> dlaczego folia winylowa ma tu znaczenie (odporność na wodę i UV) -> FAQ -> CTA.
    - **⚠️ Uwaga merytoryczna:** kod generuje się w **zewnętrznym, darmowym generatorze QR** - to nie jest funkcja naszego kreatora, nie sugeruj że jest. Nie deklaruj gwarancji skanowalności - dawaj zalecenia i wprost każ przetestować wydruk.

- [ ] **A7. Etykiety na kosmetyki naturalne i świece - co umieścić na opakowaniu małej manufaktury**
    - **Format:** Supporting Article (~1200-1400 słów)
    - **Główna Fraza Kluczowa:** `etykiety na kosmetyki naturalne` (semantyczne: `etykiety ze składem`, `etykiety na świeczki`, `naklejki na świece sojowe`, `etykiety na mydło`)
    - **Cel:** Sprzedaż (B2B, persona producenci świec i kosmetyków - dotąd bez własnego wpisu)
    - **Persona:** Manufaktury kosmetyczne, świecarnie, mydlarnie, twórcy na Etsy
    - **Link nadrzędny (Filar):** `/blog/drukowanie-naklejek-online-na-co-zwrocic-uwage-przed-wysylka-projektu` + link w górę do `/naklejki-dla-firm` i (po zbudowaniu) `/etykiety-na-sloiki`
    - **Dlaczego:** `keywords.md` §8 i §9b wskazują tę personę, a `strategy.md` wymienia ją w pierwszej grupie docelowej - mimo to jedyne pokrycie to sekcje w cudzych wpisach. Leksyk "etykiety" jest wciąż słabo obsadzony na blogu.
    - **Struktura:** BLUF -> etykieta a naklejka (leksyk) -> **co zwykle znajduje się na etykiecie małej manufaktury** (nazwa, skład, pojemność, dane producenta, data/partia) -> kształt i rozmiar pod typowe opakowania (słoik świecy, buteleczka, kostka mydła) -> odporność: woda, UV, tłuszcze z kosmetyku - **uczciwie, bez obietnicy odporności na rozpuszczalniki i bez zmywarki** -> mały nakład jako przewaga przy testowaniu wariantów produktu -> FAQ -> CTA.
    - **🚨 Ograniczenie prawne (bezwzględne):** oznakowanie kosmetyków i świec podlega przepisom (m.in. INCI, CLP). **Nie udzielaj porady prawnej i nie twierdź, że nasza etykieta spełnia wymogi prawne.** Pisz opisowo ("producenci zwykle umieszczają...") i **zawsze odsyłaj do sprawdzenia aktualnych przepisów lub konsultacji ze specjalistą**. To warunek publikacji tego wpisu.

- [ ] **A8. (WARUNKOWY - wymaga decyzji właściciela) Naklejki na ubrania i metki - jak oznaczyć rzeczy dziecka**
    - **Format:** Supporting Article (~1000-1200 słów)
    - **Główna Fraza Kluczowa:** `naklejki na ubrania` (semantyczne: `naklejki na metki`, `naklejki na ubrania dla dorosłych`, `jak oznaczyć ubrania dziecka`)
    - **Persona:** Rodzice przedszkolaków, opiekunowie osób w domach opieki
    - **Link nadrzędny (Filar):** `/blog/jak-zamowic-idealne-naklejki-na-zamowienie-z-wlasnym-nadrukiem`
    - **🚨 BLOKADA - zapytaj właściciela PRZED pisaniem:** `keywords.md` §4 zawiera frazę `naklejki na ubrania dla dorosłych`, a `strategy.md` wymienia "naklejki imienne na metki nylonowe ubrań" wśród potrzeb persony rodziców. **Nie mamy jednak potwierdzenia, że folia winylowa nadaje się na tkaninę i przetrwa pranie** - a to jest dokładnie to, o co zapyta czytelnik.
    - **Dwa scenariusze:** (a) właściciel potwierdza przyklejanie na **metkę/nylon** i podaje realne zachowanie po praniu -> piszemy wpis z jasnym rozgraniczeniem "metka/tworzywo TAK, tkanina NIE"; (b) właściciel potwierdza, że produkt się do tego **nie nadaje** -> wpis nadal ma sens jako uczciwa odpowiedź przechwytująca zapytanie, kierująca na to, co faktycznie działa (naklejki na bidon, śniadaniówkę, przybory - link do wpisu przedszkolnego), ale **frazę usuwamy z `keywords.md`** jako niesprzedażową. **Wariantu "na oko" nie piszemy.**

- [ ] **A9. (Opcjonalny, najniższy priorytet) Naklejki na deskorolkę, hulajnogę i sprzęt sportowy**
    - **Format:** Supporting Article (~900-1100 słów)
    - **Główna Fraza Kluczowa:** `naklejki na deskorolkę` (semantyczne: `naklejki na hulajnogę`, `naklejki na sprzęt sportowy`)
    - **Link nadrzędny (Filar):** `/blog/jak-zamowic-idealne-naklejki-na-zamowienie-z-wlasnym-nadrukiem`
    - **Uwaga:** fraza jest w `keywords.md` §4, ale temat **mocno zachodzi** na istniejące wpisy o rowerze i wlepkach dla artystów. Pisz **tylko jeśli** GSC potwierdzi odrębny wolumen - inaczej lepszym ruchem jest dopisanie sekcji H2 do wpisu o rowerze. Trzymam w kolejce jako kandydata, nie jako zobowiązanie.

---

## 📌 P3 - Aktualizacje istniejących treści (nie nowe wpisy)

- [ ] **P3.1 - 🗓️ PILNE, SEZON TRWA: odśwież `personalizowane-naklejki-na-zeszyty-i-do-przedszkola`**
    - Szczyt zapytań "powrót do szkoły" przypada na przełom sierpnia i września - **czyli teraz**. Wpis jest z 2026-07-15 i nie był ruszany.
    - Dodaj sekcję o oznaczaniu przyborów na nowy rok szkolny, dopisz 2-3 pytania FAQ (H3), dorzuć link do wpisu o meblach/imionach i do A2 (rozmiary), ustaw **`updated: "2026-08-XX"`**. To najtańsza możliwa konwersja w tym miesiącu.
- [ ] **P3.2 - Rozbuduj `fajne-wzory-i-pomysly...` do roli prawdziwego huba** (dziś linkuje do 5 wpisów, ma 0 linków przychodzących). Dodaj sekcje z linkami do **wszystkich** nisz (nalewki, alkohol/wesele, serwisowe, eventy, rower, okrągłe, przetwory, wlepki) i podepnij go z `SeoContentSection.tsx` oraz z filaru.
- [x] **P3.3 - Ujednolić czas realizacji w całym blogu** ✅ 2026-08-17 - wykonane razem z P1.4, patrz tam.
- [ ] **P3.6 (NOWE) - 11 meta description przekracza 160 znaków** (`rules.md` §5). Najgorsze: `naklejki-na-motory-i-motocyklowe` (194 zn.), `personalizowane-naklejki-na-alkohol` (175), `male-naklejki-na-laptopa` (173). Google utnie je w SERP-ie. Skrócić do 120-160 przy najbliższym przejeździe po treści.
- [ ] **P3.7 (NOWE) - Błędne dane w `Product`/`Offer` na stronie głównej** (`src/app/page.tsx`): `shippingRate` = **15.00 PLN**, a realny koszt dostawy to **19,99 zł**; `handlingTime` = 1-3 dni zamiast 2-3. Schema podaje Google nieprawdziwą cenę dostawy - naprawić.
- [ ] **P3.8 (NOWE) - Ekspozycja NASZEGO generatora AI poza treścią marketingową.** HOLD wyczyszczony w copy, ale generator wciąż widnieje w `layout.tsx` (meta description: "Generator AI w cenie!"), `o-nas/page.tsx:48`, `PricingSection.tsx:17` i `CreatorPowersSection.tsx`. To opis funkcji produktu, nie porada "jak zrobić grafikę" - **zapytaj właściciela**, czy HOLD ma objąć również te miejsca. `regulamin` zostaje bez zmian (dokument prawny).
- [ ] **P3.4 - Uzupełnij okładki** dla `naklejki-na-motory-i-motocyklowe` (folder pusty) i `fajne-wzory-i-pomysly...` (folder nie istnieje). Utwórz katalogi wg `rules.md` §8 i poproś właściciela o grafiki; po dograniu: kompresja -> nazwy SEO -> osadzenie -> piny -> `add_logo_bar.mjs` -> `tiktok-info.txt`.
- [ ] **P3.5 - Uzupełnij `keywords.md`** o klastry z Fazy 3: **§10 Cena i rozmiar** (`naklejki na zamówienie cena`, `ile kosztuje wydruk naklejek`, `ile naklejek zmieści się na A4`, `rozmiary naklejek`), **§11 Sezonowe** (`naklejki świąteczne`, `etykiety na prezenty`) oraz dopisz do §8 podklastry **QR** i **paczki/plomby**.

---

## 🚫 Faza 3 - świadomie odrzucone (nie rób)

* **Trzeci Pillar Page "Naklejki dla firm"** - próg 4-5 wpisów B2B ze `strategy.md` §6 wprawdzie osiągnięty, ale rolę huba pełni już landing `/naklejki-dla-firm`. Drugi hub na tę samą intencję = kanibalizacja. **Decyzja: wzmacniamy landing, nie budujemy filaru.** Wracamy do tematu, gdy B2B urośnie do ~10 wpisów.
* **Osobny wpis pod `kreator naklejek` / `program do robienia naklejek`** - pokryte przez `SeoContentSection.tsx` na `/` (2026-07-30) i wpis `jak-zrobic-wlasne-naklejki-program...` (2026-08-04). Kolejny tekst = kanibalizacja.
* **Wpisy pod NASZ generator AI** (`keywords.md` §7) - HOLD obowiązuje (P0.3). Odblokować dopiero po jawnej decyzji właściciela.
* **Wpisy pod "naklejki łatwo usuwalne / wielokrotnego użytku"** - fałszywa obietnica (mamy mocny klej; atut to "0 śladów"). Obsłużone w FAQ i słowniku.
* **Osobne wpisy pod warianty semantyczne** (`naklejki custom`, `naklejki własny wzór`, `naklejki na zamówienie online`) - to warianty tej samej intencji co filar i `/`; wplatać w istniejącą treść.
* **Treść pod materiały, których nie oferujemy** (hologram, brokat, transparent, folia do wrappingu) - fałszywa obietnica.

---

## 📊 Jak mierzyć Fazę 3

Serwis jest wciąż wczesny (GSC: maks ~44 wyświetlenia na zapytanie wg audytu z 2026-07-24), więc **nie oceniaj po pozycjach w pierwszym miesiącu**. Sygnały do śledzenia:
1. **Czy A1/A2 wchodzą w AI Overviews i odpowiedzi LLM na pytania o cenę i rozmiar** - to główna hipoteza Fazy 3. Testuj ręcznie w ChatGPT/Perplexity/Google: "ile kosztuje wydruk naklejek na zamówienie", "gdzie zamówić naklejki w małym nakładzie w Polsce".
2. **GSC: czy pojawiają się zapytania cenowe i rozmiarowe** (dziś praktycznie nieobecne, bo nie mamy pod nie treści).
3. **`fotonaklejki` / `foto naklejki`** - luka potwierdzona w GSC (poz. 27-39), landing zbudowany 2026-07-27; sprawdź, czy pozycja rośnie. Jeśli po ~3 miesiącach stoi - problem jest w linkowaniu przychodzącym, nie w treści.
4. **Sieroty linkowe** - po P1.6 żaden wpis nie powinien mieć mniej niż 3 linki przychodzące.
5. **Przed każdą decyzją o nowym landingu** (`/naklejki-na-laptopa`, ewentualne rozbicie klastra porównawczego) - **najpierw dane z GSC**, zgodnie z checklistą w `landing-agent/plan.md`. Nie budować "na przeczucie".

---

## 📝 Zaplanowane Artykuły (Do napisania przez AI)

> **Faza 2 (dopisano 2026-07-18):** kolejka domykała się do jednego tematu, więc przeprowadziłem audyt strategii (patrz `strategy.md`, sekcja 6 "Korekta Kursu - Faza 2") i dopisałem kolejne tematy zamykające realne luki person B2B (rzemiosło/serwis i korporacje/eventy). Kolejność poniżej odzwierciedla priorytet. **Uwaga (aktualizacja 2026-08-04):** przy poleceniu sposobów na stworzenie grafiki wymieniaj na pierwszym miejscu ZEWNĘTRZNE generatory obrazów AI (ChatGPT, Gemini, Midjourney), przed Canvą - ale NIE eksponuj naszego wbudowanego generatora (jego promocja nadal wstrzymana; patrz pamięć `ai-generator-content-hold`).




- [x] **Naklejki okrągłe z własnym nadrukiem - kiedy wybrać kształt koła?** (napisano 2026-08-03; 5 grafik wgranych, osadzonych i obrandowanych, piny/social gotowe)
    - **Format:** Supporting Article
    - **Główna Fraza Kluczowa:** `naklejki okrągłe z własnym nadrukiem` / `naklejki w kształcie koła`
    - **Cel:** Edukacja
    - **Persona:** Mikroprzedsiębiorstwa, artyści, klienci indywidualni porównujący formaty
    - **Link nadrzędny (Filar):** `/blog/drukowanie-naklejek-online-na-co-zwrocic-uwage-przed-wysylka-projektu`
    - **Uwaga:** artykuł ~1250 słów, slug `naklejki-okragle-z-wlasnym-nadrukiem`, plik `src/content/blog/naklejki-okragle-z-wlasnym-nadrukiem.md`. Backlink z filaru `drukowanie-naklejek-online...` dodany (sekcja o kształtach cięcia). Cross-linki: die-cut/kiss-cut, logo firmy, logo na słoiki, wlepki, słownik przez filar. **HOLD generator AI uszanowany** (0 wzmianek o generatorze AI/sztucznej inteligencji), **0 "zaprojektuj/projektowanie"**, prawda o produkcie (mocny klej + 0 śladów, folia NIE do zmywarki - mycie ręczne), przewagi PL bez name-dropu konkurenta (nisza formatowa), dywiz "-" (bez półpauzy). FAQ jako H3 + domykająca sekcja `##` z CTA po FAQ.
        - **Zdjęcia (dograne 2026-08-03):** użytkownik wgrał 5 grafik (marki wymyślone: NEXORA, PASIEKA ZŁOCISTA, KOVAL - bez realnych znaków towarowych). Zoptymalizowane do realnego JPEG (q88 mozjpeg, 1024 px, ~690 KB-1,8 MB -> 55-210 KB), nazwane pod SEO, osadzone w treści z altami: `zestaw-okraglych-naklejek-rozne-wzory` (sekcja "kiedy koło"), `okragle-etykiety-na-swiece-sojowe-i-kosmetyki-naturalne` (opener "zastosowania"), `okragle-etykiety-na-sloiki-z-miodem` (sekcja słoiki/miód), `okragla-naklejka-plomba-na-paczke-ecommerce` (sekcja e-commerce); okładka = `okragla-naklejka-z-logo-firmy-na-pudelku` (branding NEXORA). Wygenerowano 5 pinów Pinterest 4:5 (JPG) + `pinterest-info.md` + `tiktok-info.txt` + `facebook-info.txt` (`generate-pinterest.ts`, z SUROWYCH zdjęć PRZED paskiem logo), następnie `add_logo_bar.mjs` na folderze blog (pojedynczy pasek, bez podwójnego logo). Czyste (nieobrandowane) kopie w scratchpadzie na wypadek revertu paska. **Nie commitowano/pushowano** - do przeglądu właściciela.
    - **Prompty do generowania zdjęć (10 szt. - do wygenerowania i wgrania przez użytkownika; UŻYWAĆ WYŁĄCZNIE WYMYŚLONYCH/AUTORSKICH LOGO I WZORÓW, bez realnych znaków towarowych):**
        1. (okładka) "Kwadratowy kadr z góry: kilka okrągłych naklejek z własnym nadrukiem - minimalistyczne logo w kole, prosty wzór roślinny i monogram - rozłożonych na jasnym, pastelowym tle; miękkie naturalne światło, płytka głębia ostrości, widoczna równa krawędź koła i delikatny połysk folii winylowej."
        2. "Makro: dłoń odkleja idealnie okrągłą naklejkę z jasnego arkusza podkładowego, wyraźnie widoczna równa krawędź cięcia koła i lekko uniesiony brzeg folii, miękkie boczne światło, rozmyte tło."
        3. "Trzy naklejki różnego kształtu obok siebie na białym stole - okrągła, kwadratowa i wycięta po obrysie sylwetki - pokazujące różnicę w liniach cięcia; ostre detale, równomierne studyjne oświetlenie."
        4. "Rząd słoików z miodem na drewnianej półce, każdy z taką samą okrągłą etykietą w stylu rustykalnej manufaktury (napis i prosty rysunek pszczoły), ciepłe złociste światło, przytulne wnętrze spiżarni."
        5. "Sojowe świece w szklanych naczyniach i kosmetyk naturalny w brązowej buteleczce, oznaczone minimalistycznymi okrągłymi etykietami, jasna elegancka aranżacja na kamiennym blacie, miękkie światło."
        6. "Kartonowa paczka e-commerce zaklejona okrągłą naklejką-plombą z prostym, wymyślonym logo; obok papier kraft i suszone kwiaty, estetyczna scena unboxingu z góry, naturalne światło."
        7. "Zbliżenie na ekran telefonu z otwartym kreatorem naklejek, na którym zdjęcie jest kadrowane do okręgu (widoczna okrągła ramka kadrowania i podgląd 3D naklejki), nowoczesne biurko, bez realnych logotypów marek."
        8. "Stoisko twórcy na targach z zestawem okrągłych wlepek w stylu przypinek (button badge) o różnych autorskich, ilustrowanych wzorach, rozłożonych na drewnianej tacce; żywe kolory, naturalne światło."
        9. "Arkusz A4 wypełniony kilkunastoma różnymi okrągłymi naklejkami (wzory roślinne, geometryczne, monogramy) w jednym spójnym formacie koła, widok z góry, równe cięcie, jasne studyjne tło."
        10. "Okrągła firmowa naklejka z minimalistycznym, wymyślonym logo naklejona na wieczku białego pudełka na produkt, obok wizytówka w tym samym stylu; czysta profesjonalna aranżacja brandingowa, miękkie cienie."

---

## 🆕 Rozszerzenie o nową pulę fraz (audyt 2026-07-30)

Właściciel podrzucił pulę fraz (patrz `blog-agent/keywords.md` §9). Po analizie intencji, wolumenu, luki i ryzyka kanibalizacji ustaliłem zastosowania. **Rekomendowana kolejność realizacji (wg wartości, nie wolumenu):** 1) optymalizacja strony głównej pod kreator, 2) landing `/etykiety-na-sloiki` (patrz `landing-agent/plan.md`), 3) wpis "jak zrobić / program do robienia naklejek", 4) wpis "etykiety na słoiki do przetworów", 5) wpis "naklejki na motory/motocyklowe", 6) rozbudowa spoke'a laptop, 7) opcjonalny wpis "inspiracje/wzory". Poniższe wpisy dopisuję do kolejki (za istniejącym tematem "naklejki okrągłe" - właściciel może przestawić kolejność).

**Ograniczenia dla całej tej puli (obowiązkowe):**
* **Generator AI - polityka od 2026-08-04:** żaden nowy wpis nie filaruje na NASZYM wbudowanym generatorze AI (ekspozycja wstrzymana) - filaruj na: wgranie gotowego obrazu/zdjęcia, **automatyczne usuwanie tła**, cięcie po obrysie, kreator arkusza 3D. Wolno natomiast polecać ZEWNĘTRZNE generatory (ChatGPT/Gemini/Midjourney) jako pierwsze źródło gotowej grafiki (zgodnie z `rules.md` §3). Kolizja z 2026-07-27 rozwiązana - patrz pamięć `ai-generator-content-hold`.
* **Zakaz "projektowania":** nigdy "zaprojektuj/projektowanie" naklejki/grafiki - używaj "zrób / stwórz / zamów / ułóż arkusz".
* **Prawda o produkcie:** mocny klej + "0 śladów" (NIE klej repozycjonowalny); folia NIE do zmywarki.

### 📌 Aktualizacje istniejących treści (nie nowe wpisy - do wykonania osobno)
- [x] **Strona główna - `SeoContentSection.tsx`: klaster kreatora** (zrobione 2026-07-30) - dodano 2 sekcje H3 w siatce (bilans 3+3): (1) "Kreator naklejek online - prosty program do robienia naklejek" -> copy nasycone `kreator naklejek online` (H3+body), `program do robienia naklejek` (x2), `tworzenie naklejek`, `robienie naklejek`; pozycjonuje jako narzędzie/program online (wgraj -> auto usuwanie tła -> cięcie po obrysie), z linkiem do `/naklejki-die-cut`; (2) "Czy naklejki łatwo się odklejają i nie zostawiają śladów?" -> łapie `naklejki łatwo usuwalne` uczciwie (mocny klej + 0 śladów, NIE repozycjonowalne). **HOLD generator AI uszanowany** (0 "generator AI"/"sztuczna inteligencja"), **0 "zaprojektuj/projektowanie"**, dywiz "-" (przy okazji poprawiono 1 istniejącą półpauzę U+2013 w sekcji "biznes"). Zweryfikowane: `tsc --noEmit` bez błędów; treść w surowym SSR HTML (`curl :3000` -> oba H3 obecne, crawlowalne dla Google/LLM). Zero kanibalizacji (ta sama strona, nie nowy landing).
- [x] **Spoke `male-naklejki-na-laptopa...`: rozbudowa na głowę `naklejki na laptop`** - dodano H2 na szerszą głowę (bez "małe") + sekcję `naklejki na laptopa własny projekt` (wykonano 2026-08-16).
- [x] **Spoke `naklejki-wlasnego-projektu-na-sloiki-z-przyprawami...`: fix kodowania** - poprawiono błędy językowe / kodowania (wykonano 2026-08-16).
- [x] **`/slownik-naklejek`: dopisz pojęcie** "naklejki łatwo usuwalne / czy zostawiają ślady" - dodano pojęcie do słownika (wykonano 2026-08-16).

### 📝 Nowe wpisy (dopisane do kolejki)

- [x] **Jak zrobić własne naklejki - program do robienia naklejek online i inne metody** (napisano 2026-08-04; 5 grafik dogranych przez użytkownika, osadzonych i obrandowanych, piny/social gotowe. Scommitowano i wypchnięto na produkcję (main) 2026-08-04.)
    - **Format:** Supporting Article
    - **Główna Fraza Kluczowa:** `jak zrobić własne naklejki` / `program do robienia naklejek` / `program do tworzenia naklejek` (semantyczne: `jak stworzyć własne naklejki`, `naklejki do zrobienia samemu`, `tworzenie naklejek`, `robienie naklejek`)
    - **Cel:** Edukacja -> konwersja do kreatora
    - **Persona:** Klienci indywidualni, twórcy, mikro-brandy szukające "programu/narzędzia" do zrobienia naklejek
    - **Link nadrzędny (Filar):** `/blog/drukowanie-naklejek-online-na-co-zwrocic-uwage-przed-wysylka-projektu`
    - **Uwaga:** Różnicuj od `jak-zrobic-wlasne-naklejki-w-telefonie` (tamten = mobile/apki). Ten = szeroki przegląd metod: druk domowy DIY (papier samoprzylepny, wady - brak trwałości/cięcia) vs **narzędzie/program online** (nasz kreator: wgraj gotowy obraz -> auto usuwanie tła -> cięcie po obrysie -> arkusz A4 od 49 zł). Skąd wziąć gotową grafikę: gotowe pliki / darmowe programy (Canva, Word) - **bez eksponowania generatora AI (HOLD)**. Zero słowa "zaprojektuj". Mocny anchor "w górę" do filaru w 1. akapicie; cross-link telefon + die-cut. Aktywne anchory do `/` ("zrób własne naklejki", "otwórz kreator").
    - **Realizacja (2026-08-04):** slug `jak-zrobic-wlasne-naklejki-program-do-robienia-naklejek-online`, plik `src/content/blog/jak-zrobic-wlasne-naklejki-program-do-robienia-naklejek-online.md`, ~1150-1250 słów. Backlink z filaru `drukowanie-naklejek-online...` DODANY (sekcja "od czego zacząć" - link kontekstowy pod "jak zrobić własne naklejki"). Cross-linki: telefon, die-cut/kiss-cut, naklejka ze zdjęcia, naklejki z własnym napisem; aktywne anchory do `/` ("zrób własne naklejki", "otwórz kreator"). Zweryfikowane pipeline'em `blog.ts` (gray-matter + marked): frontmatter OK (title 57 zn., desc ~151 zn.), 6 pytań FAQ jako H3 -> FAQPage JSON-LD wyemituje, HTML renderuje się bez błędu, `image` brak (bezpiecznie osłonięte w komponentach/OG/JSON-LD). **0 "zaprojektuj/projektowanie"** naklejki/grafiki, prawda o produkcie (mocny klej + 0 śladów, NIE repozycjonowalna, folia NIE do zmywarki), przewaga PL bez name-dropu konkurenta (intencja narzędziowa, nie porównawcza), dywiz "-" (0 półpauz U+2013).
    - **⚠️ ZMIANA WZGLĘDEM HOLD-u generatora AI (2026-08-04, na wyraźne polecenie właściciela):** pierwotnie wpis respektował HOLD z 2026-07-27 (0 wzmianek o generatorach AI). Właściciel polecił DODAĆ generatory obrazów (ChatGPT, Gemini, Midjourney) jako **pierwsze/najszybsze źródło gotowej grafiki** - dopisane w sekcji "Skąd wziąć grafikę" (bullet nr 1 + zdanie domykające) oraz w FAQ "jeśli nie umiem rysować". Framing brandowo poprawny: generator = alternatywne źródło gotowego obrazu wgrywanego do kreatora (traktowany jak wgrane zdjęcie), NIE "projektowanie naklejki w kreatorze"; 0 "zaprojektuj". **Rozstrzygnięte (2026-08-04):** właściciel zdjął HOLD dla ZEWNĘTRZNYCH generatorów globalnie ("zdejmij, ale bez naszego generatora") - nasz wbudowany generator nadal nieeksponowany. Zaktualizowano: pamięć `ai-generator-content-hold`, `keywords.md` §7/§9a, `plan.md` (Faza 2 + Ograniczenia), `strategy.md` §6, `rules.md` §3, `landing-agent/rules.md` §5 i `landing-agent/plan.md`. Artykuł wymienia wyłącznie zewnętrzne narzędzia (ChatGPT/Gemini/Midjourney), nie nasz generator.
    - **Zdjęcia (dograne 2026-08-04):** użytkownik wgrał 5 grafik (wersja PODSTAWOWA "różne naklejki", marki wymyślone: monogramy K/M/Z, "dziękuję za zakupy" - bez realnych znaków towarowych). Zoptymalizowane do realnego JPEG (q88 mozjpeg, 1024 px, ~1 MB -> 127-179 KB), nazwane pod SEO, osadzone w treści z altami: `rozne-wlepki-na-laptopie` (po sekcji "trzy metody"), `arkusz-naklejek-rozne-wzory-i-napisy` (sekcja "skąd wziąć grafikę"), `okragla-naklejka-plomba-z-logo-na-paczce` (sekcja "krok po kroku"), `naklejki-na-butelke-wodoodporna-folia-winylowa` (sekcja "dlaczego warto" - wodoodporność); okładka = `arkusz-a4-z-roznymi-wlasnymi-naklejkami` (arkusz A4 z motywami natury). Wygenerowano 5 pinów Pinterest 4:5 (JPG) + `pinterest-info.md` + `tiktok-info.txt` + `facebook-info.txt` (`generate-pinterest.ts`, z CZYSTYCH zdjęć PRZED paskiem logo), następnie `add_logo_bar.mjs` na folderze blog (pojedynczy pasek, bez podwójnego logo). Czyste (nieobrandowane) kopie w scratchpadzie na wypadek revertu. ⚠️ **Do sprawdzenia przez właściciela:** zdjęcie laptopa (`rozne-wlepki-na-laptopie`) zawiera wlepkę przypominającą postać Snoopy'ego (znak towarowy Peanuts) - ilustracja zastosowania, ale warto rozważyć podmianę na wzór własny.
    - **Prompty do generowania zdjęć (10 szt., wersja PODSTAWOWA na życzenie właściciela - proste zdjęcia produktowe samych naklejek, BEZ ekranów kreatora/oprogramowania i BEZ generatorów/AI; UŻYWAĆ WYŁĄCZNIE WYMYŚLONYCH/AUTORSKICH LOGO I WZORÓW, bez realnych znaków towarowych):**
        1. (okładka) "Widok z góry na jasny, pastelowy blat z rozłożonym kolorowym zestawem różnych naklejek - wycięte po obrysie sylwetki, okrągłe, kwadratowe i z krótkimi napisami; miękkie naturalne światło, delikatny połysk folii winylowej, płytka głębia ostrości."
        2. "Arkusz A4 wypełniony kilkunastoma różnymi autorskimi naklejkami (wzory roślinne, małe zwierzątka, monogramy, proste hasła), widok z góry, równe cięcie, jasne studyjne tło."
        3. "Makro: dłoń odkleja pojedynczą naklejkę die cut z jasnego papieru podkładowego, wyraźnie widoczna równa krawędź cięcia po obrysie i lekko uniesiony brzeg folii, miękkie boczne światło, rozmyte tło."
        4. "Metalowa butelka na wodę oklejona kilkoma różnymi kolorowymi naklejkami z autorskimi wzorami, krople wody na powierzchni, naturalne światło, żywe barwy."
        5. "Pokrywa srebrnego laptopa z kolekcją różnorodnych wlepek - ilustracje, cytaty i proste logo - naklejonych w luźnym układzie, nowoczesne, jasne biurko w tle."
        6. "Rząd szklanych słoików z przetworami na drewnianej półce, każdy z inną okrągłą lub kwadratową etykietą w stylu domowej manufaktury, ciepłe złociste światło spiżarni."
        7. "Kartonowa paczka e-commerce zaklejona okrągłą naklejką-plombą z prostym, wymyślonym logo, obok papier kraft i sznurek, estetyczna scena rozpakowania z góry, naturalne światło."
        8. "Stosik luźnych, pojedynczo dociętych naklejek die cut w różnych kształtach i wzorach leżący na białym stole, gotowych do rozdania, ostre detale, równomierne studyjne oświetlenie."
        9. "Kilka naklejek ze zdjęć wyciętych po obrysie (portret psa, kadr z wakacji, rysunek dziecka) rozłożonych obok siebie na jasnym tle, pokazujących różnorodność naklejek fotograficznych."
        10. "Notes i termos ozdobione kilkoma małymi naklejkami z napisami i prostymi ikonkami, minimalistyczna aranżacja biurkowa, miękkie dzienne światło."


- [x] **Naklejki na motory i motocyklowe - personalizacja motocykla, kasku i baku** (napisano 2026-08-16)
    - **Format:** Supporting Article
    - **Główna Fraza Kluczowa:** `naklejki na motory` / `naklejki motocyklowe` (semantyczne: `naklejki motocykl`)
    - **Cel:** Sprzedaż
    - **Persona:** Motocykliści, pasjonaci jednośladów, personalizacja kasku/baku/owiewek
    - **Link nadrzędny (Filar):** `/blog/jak-zamowic-idealne-naklejki-na-zamowienie-z-wlasnym-nadrukiem`
    - **Uwaga:** Artykuł wygenerowany. Przestrzega nowych reguł (brak folii typu wrap - tylko małe detale, zewnętrzne generatory AI), folder `public/blog/naklejki-na-motory-i-motocyklowe` przygotowany na grafiki. Zaznaczono w repozytorium.

- [x] **(Opcjonalny, niższy priorytet) Fajne wzory i pomysły na naklejki - inspiracje wg zastosowania** (napisano 2026-08-16)
    - **Format:** Supporting Article (hub linkowania wewnętrznego)
    - **Główna Fraza Kluczowa:** `fajne wzory na naklejki` (semantyczne: `wzory na naklejki do druku`, `pomysły na naklejki`)
    - **Cel:** Top-funnel / topical authority / linkowanie wewnętrzne
    - **Persona:** Osoby szukające inspiracji przed zamówieniem (browsing intent)
    - **Link nadrzędny (Filar):** `/blog/jak-zamowic-idealne-naklejki-na-zamowienie-z-wlasnym-nadrukiem`
    - **Uwaga:** Artykuł wygenerowany. Spełnia wymogi GEO/AEO, linkuje do wspierających postów-nisz (laptop, słoiki, wesela, przedszkole, moto), nie posiada obrazków/placeholderów, w pełni dostosowany pod generatory AI zewnętrzne. Zaznaczono w repozytorium.

---

## 📈 Zrealizowane Artykuły

- [x] **Etykiety na słoiki do przetworów i weków - napisy na słoiki krok po kroku** (opublikowano 2026-08-06)
    - **Format:** Supporting Article
    - **Główna Fraza Kluczowa:** `etykiety na słoiki` / `napisy na słoiki`
    - **Cel:** Sprzedaż / Edukacja (sezonowe: lato-jesień, przetwory)
    - **Persona:** Domownicy robiący przetwory/weki/dżemy, pasjonaci kuchni, prezenty ze słoika
    - **Link nadrzędny (Filar):** `/blog/jak-zamowic-idealne-naklejki-na-zamowienie-z-wlasnym-nadrukiem`
    - **Uwaga:** artykuł napisany 2026-08-06. Zoptymalizowano 4 zdjęcia dostarczone przez użytkownika i osadzono w treści. Wygenerowano Piny do Pinteresta oraz materiały do mediów społecznościowych z czystych, pozbawionych brandingu zdjęć, a następnie dodano na nich pasek z logo (surowe kopie pozostały w pamięci/skrypcie roboczym).

- [x] **Podziękowania dla gości i naklejki na koperty ślubne** (opublikowano 2026-07-28)
    - **Format:** Supporting Article
    - **Główna Fraza Kluczowa:** `naklejki na koperty ślubne` / `podziękowania dla gości naklejki`
    - **Cel:** Sprzedaż
    - **Persona:** Pary młode, wedding plannerzy, organizatorzy wieczorów panieńskich
    - **Link nadrzędny (Filar):** `/blog/jak-zamowic-idealne-naklejki-na-zamowienie-z-wlasnym-nadrukiem`
    - **Uwaga:** artykuł ~1320 słów, slug `naklejki-na-koperty-slubne-i-podziekowania-dla-gosci`. Użytkownik dograł 8 grafik (1 cover + 7 w treści) - były to PNG-y z rozszerzeniem .jpg po ~2 MB; zoptymalizowane do realnego JPEG (q88, ~90% mniej: 17 MB -> 1,3 MB), nazwane pod SEO, osadzone w treści z altami. Wygenerowano 8 pinów Pinterest **w JPG** (`public/pinterest/.../pin-N.jpg`, nowy skrypt `generate-pinterest.ts`), potem wypalono pasek z logo (`add_logo_bar.mjs`). Backlink z filaru dodany. Nie eksponuje generatora AI (respektuje HOLD z 2026-07-27).
    - **Prompty do generowania zdjęć (niewykorzystane - publikacja bez zdjęć):**
        - "Elegancki stół weselny z rzędem białych kopert dla gości oklejonych delikatną, złotą naklejką z monogramem pary młodej, kwiatowa dekoracja w tle."
        - "Zbliżenie na małe pudełeczka z podziękowaniami dla gości weselnych, każde zaklejone pastelową naklejką z imionami pary młodej i datą ślubu."
        - "Panna młoda podpisująca stos zaproszeń ślubnych leżących obok arkusza delikatnych, okrągłych naklejek z ornamentem, jasne, romantyczne wnętrze."

- [x] **Naklejki z imionami na meble, drzwi i pojemniki - organizacja domu** (opublikowano 2026-07-25)
    - **Format:** Supporting Article
    - **Główna Fraza Kluczowa:** `małe naklejki na meble` / `małe naklejki na drzwi` / `małe naklejki z imionami`
    - **Cel:** Edukacja / Sprzedaż
    - **Persona:** Rodzice, fani home organizing, osoby urządzające pokój dziecięcy
    - **Link nadrzędny (Filar):** `/blog/jak-zamowic-idealne-naklejki-na-zamowienie-z-wlasnym-nadrukiem`
    - **Uwaga:** Artykuł ~1070 słów. Użytkownik dograł 5 grafik. Zostały one zoptymalizowane (nazwy SEO), wypalone logo przez `add_logo_bar.mjs`, osadzone w treści oraz wygenerowano dla nich 5 pinów do Pinteresta.


- [x] **Naklejki motoryzacyjne i tuningowe z własnym nadrukiem** (opublikowano 2026-07-23)
    - **Format:** Supporting Article
    - **Główna Fraza Kluczowa:** `naklejki motoryzacyjne` / `wlepki tuningowe`
    - **Cel:** Sprzedaż
    - **Persona:** Hobbyści, fani motoryzacji i tuningu, motocykliści
    - **Link nadrzędny (Filar):** `/blog/jak-zamowic-idealne-naklejki-na-zamowienie-z-wlasnym-nadrukiem`
    - **Prompty do generowania zdjęć (niewykorzystane - publikacja bez zdjęć):**
        - "Zbliżenie na czarny zderzak samochodu sportowego oklejony rzędem kolorowych, wyciętych po obrysie naklejek tuningowych i logotypów zespołów wyścigowych."
        - "Motocyklista w garażu nakładający dużą naklejkę z płomieniami na bak motocykla typu cafe racer, ciepłe światło warsztatowe, narzędzia w tle."
        - "Deska rozdzielcza samochodu z małą, personalizowaną naklejką na szybie oraz kluczykami leżącymi obok, ostre, kontrastowe światło."
    - **Uwaga:** artykuł ~1300 słów. Początkowo opublikowany bez zdjęć ("nie generuj zdjęć"); po wgraniu 6 grafik przez użytkownika nazwano je zgodnie z konwencją SEO, dodano pasek z logo (`add_logo_bar.mjs`), osadzono w treści z altami i ustawiono okładkę, a następnie wygenerowano 6 pinów Pinterest w `public/pinterest/naklejki-motoryzacyjne-i-tuningowe-z-wlasnym-nadrukiem/`. Zawiera sekcję o przepisach dot. naklejek na szybach i o lustrzanym odbiciu pliku przy naklejaniu od wewnątrz.
    - **Do sprawdzenia przez właściciela:** okładka (zderzak) oraz zdjęcie z numerem startowym pokazują logotypy realnych marek motoryzacyjnych (HKS, GReddy, Yokohama, Mugen, Sparco, Brembo, Motul, Ferodo, Bilstein). Grafiki są ilustracją zastosowania, ale na stronie sprzedającej druk naklejek mogą sugerować, że drukujemy cudze znaki towarowe - warto rozważyć podmianę na wzory własne.

- [x] **Naklejki na rower i akcesoria sportowe - personalizacja dla pasjonatów** (opublikowano 2026-07-22)
    - **Format:** Supporting Article
    - **Główna Fraza Kluczowa:** `naklejki na rower` / `personalizowane naklejki na rower`
    - **Cel:** Sprzedaż
    - **Persona:** Hobbyści, rowerzyści, pasjonaci sportów outdoorowych
    - **Link nadrzędny (Filar):** `/blog/jak-zamowic-idealne-naklejki-na-zamowienie-z-wlasnym-nadrukiem`
    - **Uwaga:** artykuł ~1100 słów. Początkowo opublikowany bez zdjęć ("nie generuj zdjęć"); po wgraniu 7 grafik przez użytkownika nazwano je zgodnie z konwencją SEO, osadzono w treści z altami i ustawiono okładkę, a następnie wygenerowano 7 pinów Pinterest w `public/pinterest/naklejki-na-rower-i-akcesoria-sportowe-dla-pasjonatow/`.

- [x] **Naklejki i gadżety na eventy firmowe - Welcome Pack dla nowych pracowników** (opublikowano 2026-07-21)
    - **Format:** Supporting Article
    - **Główna Fraza Kluczowa:** `naklejki firmowe na eventy` / `welcome pack naklejki`
    - **Cel:** Sprzedaż
    - **Persona:** Działy HR, Office Managery, organizatorzy eventów firmowych
    - **Link nadrzędny (Filar):** `/blog/jak-zamowic-idealne-naklejki-na-zamowienie-z-wlasnym-nadrukiem`
    - **Uwaga:** opublikowano początkowo bez zdjęć na wyraźne polecenie użytkownika; po wgraniu 6 grafik przez użytkownika nazwano je zgodnie z konwencją SEO, osadzono w treści i wygenerowano piny Pinterest w `public/pinterest/naklejki-firmowe-na-eventy-welcome-pack-dla-pracownikow/`.

- [x] **Naklejki serwisowe dla firm - hydraulicy, elektrycy i instalatorzy** (opublikowano 2026-07-20)
    - **Format:** Supporting Article
    - **Główna Fraza Kluczowa:** `naklejki serwisowe` / `naklejka serwisowana przez`
    - **Cel:** Sprzedaż
    - **Persona:** Lokalne Usługi i Rzemiosło (hydraulicy, elektrycy, instalatorzy klimatyzacji, serwisanci pieców)
    - **Link nadrzędny (Filar):** `/blog/drukowanie-naklejek-online-na-co-zwrocic-uwage-przed-wysylka-projektu`
    - **Uwaga:** artykuł rozbudowany do ~1000-1200 słów, zdjęcia wgrane przez użytkownika i osadzone w treści z nazwami SEO, wygenerowano piny Pinterest w `public/pinterest/naklejki-serwisowe-dla-firm-hydraulicy-elektrycy-i-instalatorzy/`.

- [x] **Wlepki z własnym nadrukiem dla artystów i fanklubów** (opublikowano 2026-07-19)
    - **Format:** Supporting Article
    - **Główna Fraza Kluczowa:** `wlepki z wlasnym nadrukiem` / `wlepy z wlasnym nadrukiem`
    - **Cel:** Sprzedaż
    - **Persona:** Artyści, ilustratorzy, fani muzyki, kluby sportowe
    - **Link nadrzędny (Filar):** `/blog/drukowanie-naklejek-online-na-co-zwrocic-uwage-przed-wysylka-projektu`
    - **Uwaga:** opublikowano bez zdjęć na wyraźne polecenie - folder `public/blog/wklepki-i-wlepy-z-wlasnym-nadrukiem-dla-artystow-i-spolecznosci/` czeka na wgranie grafik.

- [x] **Naklejki mały nakład - jak zamówić pojedyncze sztuki bez przepłacania?** (opublikowano 2026-07-18)
    - **Format:** Supporting Article
    - **Główna Fraza Kluczowa:** `naklejki maly naklad` / `naklejki na zamowienie pojedyncze`
    - **Cel:** Sprzedaż
    - **Persona:** Klienci indywidualni, mikro-brandy, fani wlepek
    - **Link nadrzędny (Filar):** `/blog/drukowanie-naklejek-online-na-co-zwrocic-uwage-przed-wysylka-projektu`

- [x] **Jak zrobić własne naklejki w telefonie - proste triki** (opublikowano 2026-07-17)
    - **Format:** Supporting Article
    - **Główna Fraza Kluczowa:** `jak zrobic wlasne naklejki w telefonie` / `naklejka z wlasnego zdjecia`
    - **Cel:** Edukacja
    - **Persona:** Nastolatki, twórcy social media, klienci indywidualni
    - **Link nadrzędny (Filar):** `/blog/drukowanie-naklejek-online-na-co-zwrocic-uwage-przed-wysylka-projektu`

- [x] **Naklejki na nalewki domowe - jak estetycznie ozdobić butelki na nalewki?** (opublikowano 2026-07-16)
    - **Format:** Supporting Article
    - **Główna Fraza Kluczowa:** `naklejki na nalewki domowe` / `naklejki na nalewki do druku`
    - **Cel:** Sprzedaż / Edukacja
    - **Persona:** Pasjonaci domowych alkoholi, twórcy nalewek, pszczelarze
    - **Link nadrzędny (Filar):** `/blog/jak-zamowic-idealne-naklejki-na-zamowienie-z-wlasnym-nadrukiem`

- [x] **Personalizowane naklejki na zeszyty i do przedszkola - ułatw życie swojemu dziecku** (opublikowano 2026-07-15)
    - **Format:** Supporting Article
    - **Główna Fraza Kluczowa:** `personalizowane naklejki do przedszkola` / `personalizowane naklejki na zeszyty`
    - **Cel:** Sprzedaż
    - **Persona:** Rodzice dzieci w wieku przedszkolnym i szkolnym
    - **Link nadrzędny (Filar):** `/blog/jak-zamowic-idealne-naklejki-na-zamowienie-z-wlasnym-nadrukiem`

- [x] **Co to jest die cut i kiss-cut? Różnice w cięciu naklejek reklamowych** (opublikowano 2026-07-14)
    - **Format:** Supporting Article
    - **Główna Fraza Kluczowa:** `die cut sticker` / `die cut naklejki` / `ciecie po obrysie`
    - **Cel:** Edukacja
    - **Persona:** Artyści, e-commerce, firmy zamawiające merch
    - **Link nadrzędny (Filar):** `/blog/drukowanie-naklejek-online-na-co-zwrocic-uwage-przed-wysylka-projektu`

- [x] **Naklejki własnego projektu na słoiki z przyprawami - zorganizuj swoją kuchnię** (opublikowano 2026-07-13)
    - **Format:** Supporting Article
    - **Główna Fraza Kluczowa:** `małe naklejki na przyprawy` / `naklejki na przyprawy na zamowienie`
    - **Cel:** Edukacja
    - **Persona:** Fani organizacji domu, panie/panowie domu, pasjonaci kulinarni
    - **Link nadrzędny (Filar):** `/blog/drukowanie-naklejek-online-na-co-zwrocic-uwage-przed-wysylka-projektu`

- [x] **Naklejka ze zdjęcia lub własnego rysunku - jak przenieść wspomnienia na naklejkę?** (opublikowano 2026-07-07)
    - **Format:** Supporting Article
    - **Główna Fraza Kluczowa:** `naklejka ze zdjecia` / `naklejka ze zdjeciem`
    - **Cel:** Edukacja
    - **Persona:** Rodzice, hobbyści, osoby kupujące prezenty
    - **Link nadrzędny (Filar):** `/blog/jak-zamowic-idealne-naklejki-na-zamowienie-z-wlasnym-nadrukiem`


    - [x] **Naklejki z własnym napisem - jak przygotować plik i zamówić online** (opublikowano 2026-07-08)
    - **Format:** Supporting Article
    - **Główna Fraza Kluczowa:** `naklejka z wlasnym napisem` / `naklejki z wlasnym napisem`
    - **Cel:** Edukacja
    - **Persona:** Klienci indywidualni, pary młode, organizatorzy imprez
    - **Link nadrzędny (Filar):** `/blog/jak-zamowic-idealne-naklejki-na-zamowienie-z-wlasnym-nadrukiem`


- [x] **Drukowanie naklejek online - na co zwrócić uwagę przed wysyłką projektu?** (opublikowano 2026-07-10)
    - **Format:** Pillar Page
    - **Główna Fraza Kluczowa:** `drukowanie naklejek online` / `naklejki na zamowienie cena`
    - **Cel:** Edukacja
    - **Persona:** Mikroprzedsiębiorstwa, artyści, graficy, agencje reklamowe
    - **Prompty do generowania zdjęć:**
        - "Zdjęcie z bliska przedstawiające arkusz A4 z wydrukowanymi, błyszczącymi naklejkami o różnych wzorach i kolorach leżący na biurku grafika komputerowego obok klawiatury i myszki, ostre szczegóły."
        - "Projektant przy pracy w jasnym studiu, na ekranie monitora widać otwarty program graficzny z projektem kolorowych naklejek z liniami cięcia, obok na biurku leżą wydrukowane próbki, realistyczne zdjęcie."
        - "Zbliżenie na arkusz zadrukowanej folii samoprzylepnej wysuwający się z nowoczesnej, profesjonalnej cyfrowej maszyny drukarskiej, żywe kolory, widoczna tekstura materiału."
        - "Zbliżenie na arkusz próbny z wydrukowanymi naklejkami przedstawiającymi klasyczny obraz 'Gwiaździsta Noc' Van Gogha oraz urocze zdjęcie kota rasy brytyjski krótkowłosy w wysokiej rozdzielczości, widoczne linie cięcia, jasne studio."
        - "Dłoń trzymająca świeżo wydrukowaną naklejkę wyciętą po obrysie ze zdjęcia z wakacji, na której widać parę stojącą na szczycie góry Giewont w Tatrach, w tle rozmyte biurko drukarni, ostre detale."

- [x] **Małe naklejki na laptopa - jak wyrazić siebie i stworzyć własny styl?** (opublikowano 2026-07-06)
    - **Format:** Supporting Article
    - **Główna Fraza Kluczowa:** `małe naklejki na laptopa` / `wlepki z wlasnym logo`
    - **Cel:** Edukacja
    - **Persona:** Programiści, graficy, gracze, studenci
    - **Link nadrzędny (Filar):** `/blog/jak-zamowic-idealne-naklejki-na-zamowienie-z-wlasnym-nadrukiem`

- [x] **Personalizowane naklejki na alkohol - wyjątkowy dodatek na wesela i imprezy** (opublikowano 2026-07-05)
    - **Format:** Supporting Article
    - **Główna Fraza Kluczowa:** `personalizowane naklejki na alkohol` / `personalizowane naklejki na wodke`
    - **Cel:** Sprzedaż
    - **Persona:** Pary młode, klienci okolicznościowi, wedding plannerzy
    - **Link nadrzędny (Filar):** `/blog/jak-zamowic-idealne-naklejki-na-zamowienie-z-wlasnym-nadrukiem`

- [x] **Jak zamówić idealne naklejki na zamówienie z własnym nadrukiem?** (opublikowano 2026-07-02)
    - **Format:** Pillar Page
    - **Główna Fraza Kluczowa:** `naklejki na zamówienie` / `naklejki z własnym nadrukiem`
    - **Cel:** Sprzedaż / Edukacja
    - **Persona:** Klienci indywidualni, mikroprzedsiębiorstwa, e-commerce
    - **Uwaga (aktualizacja 2026-07-29):** filar opublikowany 2026-07-02 bez zdjęć w treści. Użytkownik dograł 5 grafik (firmowe NEXORA, naklejka ze zdjęcia z telefonu - skoczek, koperta ślubna z monogramem, naklejka ze zdjęcia psa, wódka weselna) - zoptymalizowane do JPEG (q88, 122-239 KB), nazwane pod SEO, osadzone w treści z altami w pasujących sekcjach, `updated` bumpnięte na 2026-07-29. Wygenerowano 6 pinów Pinterest (JPG 4:5) + `pinterest-info.md` + `tiktok-info.txt` + `facebook-info.txt`. Okładka była już obrandowana (pasek z logo z 2026-07-02), więc pin okładkowy zrobiono z przyciętej, nieobrandowanej wersji (bez podwójnego logo), a `add_logo_bar.mjs` puszczono TYLKO na 5 nowych grafikach.

- [x] **Naklejka z logo firmy - jak skutecznie brandować swoje produkty?** (opublikowano 2026-07-02)
    - **Format:** Supporting Article
    - **Główna Fraza Kluczowa:** `naklejka z logo firmy` / `naklejka z własnym logo`
    - **Cel:** Sprzedaż
    - **Persona:** B2B, Mikroprzedsiębiorstwa, E-commerce
    - **Link nadrzędny (Filar):** `/blog/jak-zamowic-idealne-naklejki-na-zamowienie-z-wlasnym-nadrukiem`

- [x] **Naklejki z własnym logo na słoiki i opakowania - przewodnik dla małych manufaktur** (opublikowano 2026-07-05)
    - **Format:** Supporting Article
    - **Główna Fraza Kluczowa:** `naklejki z logo na zamowienie` / `naklejki na sloiki z wlasnym nadrukiem`
    - **Cel:** Edukacja / Sprzedaż
    - **Persona:** Rękodzielnicy, producenci świec i kosmetyków naturalnych
    - **Link nadrzędny (Filar):** `/blog/jak-zamowic-idealne-naklejki-na-zamowienie-z-wlasnym-nadrukiem`
