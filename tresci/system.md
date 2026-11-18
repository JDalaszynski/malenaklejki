# System treści MałeNaklejki: rejestr, baza fraz, kolejka

Stan na 18.11.2026. Prowadzi agent `redaktor-tresci` (`.claude/agents/redaktor-tresci.md`). Wzorzec: system treści projektu Wraca na miejsce (`~/Desktop/naswoimmiejscu/rozwoj/tresci.md`), dostosowany do sklepu, który ma już ruch, dane z Google i 45 opublikowanych stron.

Strategia i kolejność prac: `tresci/strategia.md`. Zasady stylu i fakty zostają tam, gdzie były: `blog-agent/facts.md` (jedyne źródło liczb), `blog-agent/rules.md`, `landing-agent/rules.md`. Ten plik opisuje, **jak** treść powstaje, gdzie stoi każda fraza i jak mierzymy, czy strona prowadzi do kreatora.

## 1. Jak to działa

`tresci/rejestr.json` to jedno źródło prawdy o treściach. Każdy landing i każdy wpis ma w nim intencję, odbiorcę, frazę główną i wspierające, filar, CTA, daty i zgłoszenia. Z rejestru:

- **agent** bierze brief przy `/tresc <id>` i po pracy zmienia status, daty i zadanie,
- **panel** pokazuje opublikowane treści, kolejkę z gotowym promptem i bazę fraz (`npm run panel:tresci -- --project malenaklejki` i `npm run panel:frazy -- --project malenaklejki` w `~/Desktop/jdalaszynski`),
- **bramka** `npm run tresci:sprawdz` pilnuje, żeby rejestr, pliki stron, sitemapa, frontmatter wpisów i baza fraz się zgadzały.

Serwis **nie czyta** rejestru: blog dalej powstaje z `src/content/blog/*.md`, landingi z `src/app/<adres>/page.tsx`, sitemapa z `src/app/sitemap.ts`. Rejestr to warstwa wiedzy nad nimi, a bramka wymusza zgodność dat (frontmatter `date`/`updated` i `lastModified` w sitemapie muszą równać się `opublikowano`/`zmieniono`).

| Plik | Co | Kto zmienia | W gicie |
| :--- | :--- | :--- | :--- |
| `tresci/rejestr.json` | Treści, kolejka nowych stron i zadania poprawy | Agent | tak |
| `tresci/slowa-kluczowe.csv` | Baza fraz z właścicielem każdej frazy (sekcja 11) | Agent, CRLF | tak |
| `tresci/frazy-zmiany.json` | Zmiany Jakuba z panelu z decyzją agenta | Agent przy `/frazy` | tak |
| `tresci/dziennik.md` | Decyzje, publikacje, zgłoszenia, przeglądy | Agent | tak |
| `tresci/strategia.md` | Diagnoza z danych, kierunki, decyzje do podjęcia | Agent przy `/przeglad-tresci` | tak |
| `tresci/dane-google.json` | GSC 90 dni według strony i zapytania, GA4 według strony wejścia | `npm run panel:dane-tresci -- --project malenaklejki` w panelu | **nie** |
| `tresci/dane-sklep.json` | Opłacone zamówienia według strony wejścia (od 3.11.2026) | `npm run tresci:zamowienia` | **nie** |
| `tresci/frazy.json` | Wygenerowana baza: użycie fraz na stronach, braki, kolizje, liczby, sygnały, kandydaci | `npm run tresci:frazy` | **nie** |

Repozytorium jest publiczne, więc liczby ruchu i sprzedaży według strony zostają poza gitem. W dokumentach w gicie wolno podawać liczby GSC tak, jak robiły to dotąd `blog-agent/plan.md` i `strategy.md`; zamówień według strony i GA4 według strony - nie.

## 2. Pola rejestru

| Pole | Znaczenie |
| :--- | :--- |
| `id` | Stały identyfikator. Panel i prompt używają go w `/tresc <id>`. Nigdy się nie zmienia |
| `typ` | `landing` (strona sprzedażowa w głównym drzewie) albo `wpis` (blog, `/blog/<slug>`) |
| `sciezka`, `plik` | Adres i plik źródłowy (`src/content/blog/<slug>.md` albo `src/app<adres>/page.tsx`). Adres po publikacji się nie zmienia |
| `tytul`, `nazwa` | H1 strony i krótka nazwa do panelu |
| `zajawka` | Do 200 znaków: co czytelnik dostanie |
| `fraza`, `frazy` | Fraza główna i wspierające (do 6) z bazy, z `docelowy_url` równym `sciezka` (bramka). Miejsca na stronie: sekcja 11 |
| `pytania_ai` | Pytania, które ludzie zadają asystentom AI. Każde dostaje akapit 40-60 słów, który odpowiada wprost |
| `intencja`, `etap` | `informacyjna` / `komercyjna` / `transakcyjna` i `TOFU` / `MOFU` / `BOFU`. Etap decyduje o sile CTA (sekcja 5) |
| `potrzeba`, `segment`, `odbiorca` | Czego szuka człowiek, który wpisuje frazę; segment z listy `segmenty` w rejestrze; jedno zdanie o konkretnej osobie |
| `filar` | Wpis: adres strony, która odpowiada na pytanie zakupowe po lekturze (najczęściej landing, czasem filar bloga albo `/`). Landing: `null` |
| `kotwica` | Tekst linku, którym inne strony prowadzą do tej |
| `cta` | Przycisk do kreatora: `href` (`/` albo `/?zestaw=<id>` dla gotowego zestawu, `/gotowe-zestawy` dla katalogu) i tekst zgodny z tematem |
| `roznica` | Czym intencja różni się od najbliższej strony. Bez tego zdania pozycja nie wchodzi do kolejki |
| `priorytet` | P0-P2 strony |
| `status` | `opublikowane`, `w_kolejce`, `wstrzymane` (z polem `warunek`) |
| `kolejnosc`, `teza`, `okno` | Tylko nowe strony w kolejce: miejsce, główny argument, okno publikacji treści sezonowej |
| `opublikowano`, `zmieniono` | Daty RRRR-MM-DD. `zmieniono` tylko przy istotnej zmianie (sekcja 8), razem z frontmatterem albo sitemapą |
| `zgloszenia` | `indexnow` (wpisuje `npm run tresci:zglos`) i `gsc` (data prośby o zindeksowanie) |
| `zadanie` | Zaplanowana poprawa opublikowanej strony: `rodzaj` (`ctr`, `poglebienie`, `frazy`, `konwersja`, `linki`, `odswiezenie`), `tytul`, `powod` (liczby z datą; GA4 i zamówienia według strony tylko opisowo, bo rejestr jest w publicznym repozytorium), `teza` (co zmienić), `priorytet`, `kolejnosc`, `zrodlo`, `od`, `dodano`. Jedno zadanie na stronę; po wykonaniu pole znika, a wpis zostaje w dzienniku |

**Kolejka** w panelu to nowe strony (`w_kolejce`, `wstrzymane`) i zadania poprawy w jednej kolejności (`kolejnosc` i `zadanie.kolejnosc` nie mogą się powtarzać).

## 3. Gdzie są linki do treści

| Miejsce | Jak powstaje | Zmiana |
| :--- | :--- | :--- |
| Stopka: kolumny „Rodzaje naklejek” i „Poradniki” (`src/components/layout/Footer.tsx`) | Ręcznie | Za zgodą Jakuba |
| Menu górne (`Header.tsx`) | Ręcznie | Za zgodą Jakuba |
| Strona główna: sekcje SEO, FAQ i „Odkryj nasz blog” | Ręcznie / filary (`pillar: true`) | Za zgodą Jakuba |
| `/blog`, „Powiązane artykuły” pod wpisem | Same, z wpisów | - |
| Wpis, w treści | Link do filaru kotwicą filaru w pierwszym albo drugim akapicie, obowiązkowo | Agent |
| Landing, w treści | 2-4 linki do wpisów, które pogłębiają temat | Agent |
| Inne strony, w treści | Link do nowej strony tylko tam, gdzie akapit odpowiada na to samo pytanie, kotwicą z rejestru | Agent |

Nowa strona ma **co najmniej 3 linki przychodzące w dniu publikacji** (zasada Fazy 4), w tym link z filaru. Same linki z bloków automatycznych się nie liczą.

## 4. Szablony

**Wpis:** `src/content/blog/<slug>.md` z frontmatterem według `autoblog.md` (krok 2: `title`, `slug`, `date`, `description`, `image`, `tags`, `role`, `cta_text`), FAQ jako `## … (FAQ)` z pytaniami w H3 (`blog-agent/rules.md` §6b), sekcja z CTA po FAQ, przycisk HTML na końcu. Zdjęcia i piny: `autoblog.md`, kroki 1.1-1.6 (najpierw piny z surowych zdjęć, potem pasek z logo).

Szablon `src/app/blog/[slug]/page.tsx` dokleja do `title` dopisek „ - Blog MałeNaklejki” (20 znaków), a ten sam `title` jest H1 i `headline` w schemacie. Dlatego 34 z 34 wpisów mają `title` dłuższy niż 60 znaków. Propozycja zmiany szablonu czeka na decyzję Jakuba (`tresci/strategia.md`, D1). Do tego czasu: nowy tytuł wpisu stawia frazę główną w pierwszych 40 znakach (to widać w wyniku nawet po ucięciu), a H1 nie skracasz na siłę.

**Landing:** `src/app/<adres>/page.tsx` według `landing-agent/rules.md` (anatomia, schema `Product`/`Offer`/`FAQPage`/`BreadcrumbList`, FAQ z jednej tablicy, zdjęcia w formie z `/naklejki-foliowe`). Nowy landing dopisuje się do `src/app/sitemap.ts` z `lastModified`.

## 5. Standard treści: lista kontrolna przed publikacją

**Intencja i droga do kreatora**

- Pierwszy ekran odpowiada na `potrzeba` językiem osoby z `odbiorca`, a odpowiedź i cena (59 zł za arkusz A4, `facts.md`) są przed pierwszym przewinięciem.
- CTA według etapu: TOFU - jedno kontekstowe w środku i końcowe; MOFU - po tabeli i na końcu; BOFU - nad linią zgięcia, po pierwszym bloku, po tabeli i na końcu. Tekst przycisku mówi, co klient zrobi w kreatorze („Wgraj zdjęcie”, „Ułóż arkusz z logo”).
- Przy CTA rozbrajasz prawdziwe obawy: tło usuwa kreator, różne wzory na jednym arkuszu, cena od razu, produkcja 4-5 dni roboczych (bez daty doręczenia).
- Strona nie odpowiada na intencję innej strony (`roznica`). Wspólny temat oddaje linkiem, nie kopią.

**SEO**

- Frazy w miejscach z sekcji 11: główna w adresie, `title` (na początku), opisie meta, H1 i pierwszym zdaniu odpowiedzi; każda wspierająca w H2, H3 albo pytaniu FAQ. Naturalna odmiana, bez upychania. Sprawdza to `npm run tresci:frazy -- --sprawdz <ścieżka>` po buildzie.
- `title` do 60 znaków razem z dopiskiem szablonu, `description` 140-155 znaków, jeden H1, canonical na siebie.
- `title` i H1 nie zawierają frazy głównej ani wspierającej innej strony (kolizja w `tresci/frazy.json`).
- Treść w HTML bez JavaScriptu (wpisy i landingi są renderowane na serwerze - nie przenoś treści do komponentów klienckich).

**GEO i AEO**

- Pod każdym H2-pytaniem pierwszy akapit (40-60 słów) odpowiada wprost i kompletnie. Test: gdyby model miał odpowiedzieć wyłącznie tym akapitem, czy odpowiedź byłaby pełna?
- Encje nazwane wprost: „MałeNaklejki”, „arkusz A4”, „folia winylowa”, „kreator arkusza”, zamiast „to”, „nasz produkt”.
- Co najmniej jeden element, którego nie ma w pierwszych wynikach Google dla frazy: parametr z naszego procesu (cena za sztukę z tabeli, liczba naklejek na A4, kształt cięcia), uczciwe „kiedy to się nie opłaca”, porównanie z warunkiem.
- Tabela faktów albo porównanie (modele chętnie cytują tabele), FAQ z prawdziwych zapytań (GSC, podpowiedzi Google, `pytania_ai`).
- Liczby wyłącznie z `blog-agent/facts.md`, przeczytanego w tej samej turze. `public/llms.txt` po publikacji: `node scripts/generuj-llms-txt.mjs`.

**Ton i zakazy** (`blog-agent/rules.md`, `facts.md`)

- BLUF, strona czynna, liczba zamiast przymiotnika, czarna lista zwrotów, bez nagłówka „Podsumowanie”, dywiz „-” zamiast półpauzy.
- Kreator służy do **układania arkusza**: nigdy „zaprojektuj” wobec naklejki ani grafiki. Grafika: najpierw zewnętrzne generatory AI (ChatGPT, Gemini, Midjourney), potem Canva i Word; naszego generatora nie eksponujemy (HOLD).
- Bez obietnic spoza `facts.md`: zmywarka, ścieranie, ciepło, tkaniny, repozycjonowalność, czas doręczenia, data graniczna przed świętami, rabat hurtowy, darmowa dostawa.
- Bez fraz i sekcji o naklejkach serwisowych, gwarancyjnych i plombach (decyzja z 9.10.2026).

## 6. Procedura `/tresc <id>`

1. **Czytaj:** pozycję w rejestrze, ten plik, plik agenta (sekcje 2, 3, 5), `blog-agent/facts.md`, wiersze frazy w `tresci/slowa-kluczowe.csv` i `tresci/frazy.json` (właściciele, kolizje, liczby strony, `gscInne`), filar i strony, które dziś odpowiadają na te frazy. W `tresci/dziennik.md` sprawdź prośby GSC „do ponowienia”.
2. **Kanibalizacja:** szukaj frazy głównej w rejestrze, w `frazy.json` i w `gscInne`. Jeśli inna strona już odpowiada na tę intencję, nie piszesz nowej: raport z propozycją zadania na stronie-właścicielu.
3. **Rozpoznanie:** 1-2 wyszukiwania frazy głównej (`WebSearch`), żeby wiedzieć, co jest w wynikach i dać coś więcej. Data odczytu do dziennika.
4. **Pisz** według sekcji 4 i 5. Rejestr: nowa strona - `status: opublikowane`, `opublikowano` i `zmieniono` = dziś, bez `kolejnosc`, `teza` i `okno`; zadanie - `zmieniono` = dziś tylko przy istotnej zmianie, pole `zadanie` usunięte. Frontmatter `updated` albo `lastModified` w sitemapie podbijasz razem z `zmieniono`.
5. **Sąsiedzi:** linki z sekcji 3, bez zmiany ich `zmieniono`.
6. **Baza fraz:** `status_strony` = `istnieje` w wierszach strony, frazy z `/frazy` przypisane, zmiana właściciela frazy z powodem w dzienniku.
7. **Sprawdź:** `npm run build`, `npm run tresci:frazy -- --sprawdz <ścieżka>`, `npm run tresci:sprawdz`, `npx tsc --noEmit` (kod wyjścia 0), strona w przeglądarce przy 375 i 1280 px (`npm run dev`), JSON-LD w źródle (`FAQPage`, `BlogPosting`/`Article` albo `Product`).
8. **Opublikuj:** `node scripts/generuj-llms-txt.mjs`, commit tylko własnych plików, `git log origin/main..HEAD` (cudze commity nie jadą), push na `main` bez pytania, jeśli zmiana mieści się w sekcji 7.
9. **Zgłoś:** `npm run tresci:zglos -- --czekaj [--nowa] --gsc <ścieżka>` w tle: czeka na wdrożenie, sprawdza produkcję, wysyła IndexNow i zapisuje datę w rejestrze.
10. **GSC** według sekcji 8: w Claude in Chrome (Browser 1, macOS, konto Jakuba) adres w polu „Sprawdź dowolny URL”, „Poproś o zindeksowanie”, data w `zgloszenia.gsc`. Bez Chrome: adres do raportu jako krok „Ty, 1 min”. „Przekroczono limit”: wpis „GSC do ponowienia od <jutro>” w dzienniku.
11. **Domknij:** commit i push rejestru z datami zgłoszeń i dziennika, potem w `~/Desktop/jdalaszynski`: `npm run panel:tresci -- --project malenaklejki` i (po `npm run tresci:frazy`) `npm run panel:frazy -- --project malenaklejki`.
12. **Raport** w układzie z pliku agenta, z adresem strony i stanem zgłoszeń.

## 7. Co agent publikuje bez pytania

**Bez pytania** (po zielonych `npm run build`, `npm run tresci:sprawdz` i `npx tsc --noEmit`): nowy wpis albo landing z kolejki, zadanie poprawy z kolejki, zmiana tekstu opublikowanej treści na zlecenie Jakuba (także prompt z panelu), linki w tekście stron sąsiednich, nowy landing w `sitemap.ts`, rejestr, CSV, `frazy-zmiany.json`, dziennik, strategia, `public/llms.txt`.

**Za zgodą Jakuba:** strona główna i jej sekcje, menu górne i stopka, kreator, koszyk i kasa, szablony i komponenty wspólne (np. `src/app/blog/[slug]/page.tsx`, `src/lib/blog.ts`, `layout.tsx`), ceny i `facts.md` w częściach wymagających decyzji (data graniczna, nowe obietnice), dokumenty prawne, `next.config.ts` (przekierowania), usunięcie strony, zmiana adresu, zmiana frazy głównej strony z P0 albo z ponad 50 kliknięciami w 90 dni. Jeśli treść wymaga takiej zmiany, pytasz przed pushem i podajesz gotową propozycję.

## 8. IndexNow i GSC: decyzje

Najpierw wdrożenie, potem zgłoszenie. „Istotna” zmiana to taka, po której wynik w Google albo odpowiedź modelu powinny wyglądać inaczej.

| Zmiana | Przykład | `zmieniono` | IndexNow | GSC: prośba o zindeksowanie |
| :--- | :--- | :--- | :--- | :--- |
| Nowa strona | Wpis, landing | Data publikacji | Tak (`--nowa` dokłada `/blog`) | Tak |
| Istotna aktualizacja | Nowa odpowiedź na początku, nowa sekcja H2, FAQ, tabela | Tak | Tak | Tylko P0 i P1 |
| Sam `title` lub opis meta | Zadanie `ctr` | Nie (to nie zmiana treści) | Tak | Tak - to jedyny sposób, żeby Google szybko pokazał nowy tytuł |
| Nowe linki do strony | Link w akapicie innej strony | Nie | Nie | Nie |
| Drobna poprawka | Literówka, styl | Nie | Nie | Nie |

**Limity:** prośba w GSC najwyżej raz na adres w ciągu 7 dni i ok. 10 dziennie (`dane-gsc-dostep` w pamięci). Sitemapy nie przesyła się ponownie: Google czyta ją sam.

## 9. Pomiar: czy treść prowadzi do kreatora

Ruch, który nie dochodzi do kreatora, jest kosztem. Każdą stronę oceniasz trzema liczbami z `tresci/frazy.json` (sekcja `strony`):

| Liczba | Źródło | Co mówi | Ograniczenie |
| :--- | :--- | :--- | :--- |
| Wyświetlenia, kliknięcia, CTR, pozycja (90 dni i 28 dni wobec poprzednich 28) | Search Console | Czy wynik w Google przyciąga | Brak danych o zapytaniach anonimowych |
| Sesje i dodania do koszyka według strony wejścia (90 dni) | GA4 | Czy wejście kończy się arkuszem w koszyku | Tylko osoby ze zgodą na analitykę - liczby są małe, patrz na proporcję |
| Opłacone zamówienia według strony wejścia (od 3.11.2026) | Sklep (`landingPage` zamówienia) | Czy strona sprzedaje | Pełne, bez zgody, ale jeszcze krótka seria |

**Sygnały** (pole `uwagi` przy stronie, liczone przez `npm run tresci:frazy`): title ponad 60 znaków, opis poza 120-160 znaków, brak linku do kreatora, mniej niż 600 słów, CTR poniżej połowy typowego dla pozycji przy co najmniej 150 wyświetleniach, spadek wyświetleń o ponad 40% (28 dni), co najmniej 15 sesji GA4 i 0 dodań do koszyka, Google pokazujący inną stronę serwisu na frazę tej strony. Sygnał to powód do sprawdzenia, nie wyrok: decyzja o zadaniu zapada przy `/przeglad-tresci`.

**Horyzonty oceny** (domena od czerwca 2026, strona po zmianie): `title` i opis - pierwszy sygnał po 14 dniach, pełny odczyt po 28; nowa strona i pogłębienie - pozycja po 60-90 dniach. Wcześniej pisz „za wcześnie na ocenę”. Licz od daty wdrożenia z dziennika. Porównuj okna 28-dniowe z tym samym dniem tygodnia, pamiętając o sezonie (szkoła VIII-IX, znicze X, święta XI-XII).

## 10. Panel

Zakładka MałeNaklejki → **„Treści”**: liczby, następna pozycja z przyciskiem „Kopiuj prompt”, kolejka (nowe strony i zadania poprawy w jednej kolejności, przy każdej brief i prompt `/tresc <id>`), opublikowane treści z datami, zgłoszeniami, liczbami z GSC, GA4 i zamówień oraz sygnałami. Dane: `npm run panel:tresci -- --project malenaklejki` (klucz `tresci:malenaklejki`, bez wdrażania panelu).

Zakładka MałeNaklejki → **„Frazy”**: liczby (frazy, pytania AI, braki, kolizje, frazy, na które Google pokazuje inną stronę), prompt `/frazy`, formularz „Dodaj frazę”, zmiany czekające na agenta, decyzje agenta, baza według stron z rolą, wyświetleniami i pozycją z GSC i miejscami użycia, zapytania z GSC bez miejsca w bazie. Jedyny zapis z panelu: zmiany Jakuba pod `frazy-zmiany:malenaklejki`. Bazę publikuje `npm run panel:frazy -- --project malenaklejki` (`-- --zmiany` wypisuje czekające zmiany, `-- --check` tylko sprawdza).

**Strateg SEO** w panelu zostaje: robi przegląd z danymi i rekomendacje, które Jakub przyjmuje do kolejki stratega. Rekomendację dotyczącą treści agent zamienia w `zadanie` (albo nową pozycję) w rejestrze przy `/przeglad-tresci`, z `zrodlo` = „strateg SEO (panel), <data>”. Odczyt kolejki stratega: `npm run panel:queue -- --all` w `~/Desktop/jdalaszynski` (nic nie zmienia).

## 11. Baza fraz

Każda fraza ma jedną stronę-właściciela, rolę na tej stronie i zapisane miejsca, w których naprawdę stoi.

**Kolumny `tresci/slowa-kluczowe.csv`:** `fraza`, `kanal` (`google` albo `ai` - pytanie do asystentów), `klaster` (id strony-właściciela albo `bez-strony`), `segment`, `intencja` (`info`, `kom`, `trans`, `nawig`), `etap`, `priorytet`, `wolumen` i `cpc` (przedział z Planera z datą albo „brak danych” - nigdy zgadywane), `zrodlo`, `data_odczytu`, `oferta` (`teraz`, `później` - np. nasz generator AI pod HOLD, `poza` - poza ofertą albo świadomie odrzucone: serwisowe, plomby, hologram, szablony do druku), `docelowy_url` (`brak` bez strony), `status_strony`.

**Role:** główna (jedna na stronę), wspierająca (do 6), pytanie AI (akapit 40-60 słów), wariant (reszta klastra: do tekstu, gdzie pasuje), bez strony (`pozniej` w panelu).

**Gdzie stoi fraza:**

| Miejsce | Główna | Wspierająca | Wariant i pytanie |
| :--- | :--- | :--- | :--- |
| Adres | Tak, przy tworzeniu strony | - | - |
| `title` | Na początku | Jedna, jeśli mieści się naturalnie | - |
| Opis meta | W pierwszym zdaniu | Jedna, jeśli pasuje | - |
| H1 | W naturalnej odmianie | - | - |
| Pierwszy akapit | W pierwszym zdaniu | - | - |
| H2 i H3 | 1-2 razy | Każda w co najmniej jednym H2, H3 albo pytaniu FAQ | Gdy to prawdziwe pytanie |
| FAQ | - | jak wyżej | Pytania AI i frazy pytające |
| `alt` | Gdy opisuje to, co widać | Gdy opisuje to, co widać | - |
| Kotwica linku z innych stron | `kotwica` z rejestru | - | - |

Odmiana się liczy (porównanie początków słów, bez słownika). Pierwszy akapit odpowiada na pytanie, więc nie musi powtarzać słowa pytającego. Fraza stoi tam, gdzie zdanie i tak by ją miało.

**Kanibalizacja:**

- Jedna fraza ma jeden `docelowy_url` (bramka). Rejestr celuje tylko we frazy własnej strony (bramka).
- Fraza główna lub wspierająca strony A nie stoi w `title` ani H1 strony B (kolizja: co najmniej 60% słów cudzego `title`/H1).
- **Kanibalizacja w danych:** `gscInne` przy frazie pokazuje, że Google wyświetla na nią inną naszą stronę. Gdy inna strona ma wyraźnie więcej wyświetleń (sygnał „Google pokazuje inną stronę”), decydujesz przy przeglądzie: wzmocnić właściciela (linki z kotwicą, H2, title) albo przenieść frazę do strony, którą wybrał Google (zmiana w CSV z powodem w dzienniku). Strona z ruchem nie traci frazy bez zapisanej decyzji.

**Skan (`npm run tresci:frazy`):** czyta HTML z `.next/server/app` po `npm run build` (bez nagłówka, stopki, nawigacji i bloków „Powiązane artykuły”), liczy miejsca, braki i kolizje, dokłada liczby z `dane-google.json` i `dane-sklep.json`, sygnały z sekcji 9 i **kandydatów**: zapytania z GSC z co najmniej 10 wyświetleniami, których nie ma w bazie. `-- --sprawdz <ścieżki>` kończy się błędem, gdy te strony mają braki albo cudzą frazę w title lub H1.

**Zmiany z panelu:** Jakub dodaje frazę (z uwagą) albo usuwa ją z bazy. Zmiana czeka, aż wklei prompt `/frazy` (`.claude/commands/frazy.md`). Fraza główna żywej strony nie znika bez decyzji Jakuba.

**Odświeżenie danych** (przy `/przeglad-tresci` i przed `/frazy`, gdy dane są starsze niż 7 dni): `npm run panel:dane-tresci -- --project malenaklejki` w `~/Desktop/jdalaszynski`, `npm run tresci:zamowienia` tutaj, potem `npm run build` i `npm run tresci:frazy`.

## 12. Kolejka i planowanie

Rytm z Fazy 4 obowiązuje: **głębokość przed szerokością** - około 1-2 nowe strony i 3-4 realne aktualizacje miesięcznie. Kolejka zadań poprawy powstaje z danych (sekcja 9), nowe strony tylko wtedy, gdy:

1. fraza ma potwierdzony popyt (GSC: wyświetlenia bez strony-właściciela, kandydaci; Planer; podpowiedzi Google; Allegro),
2. żadna strona nie odpowiada na tę intencję (zdanie `roznica`),
3. da się z niej dojść do kreatora (CTA ma sens),
4. oferta pokrywa obietnicę (`facts.md`).

Kolejność: najpierw P0, potem zadania poprawy stron z ruchem (największy zwrot przy najmniejszym ryzyku), potem nowe strony MOFU/BOFU, na końcu TOFU. Okna sezonowe (`okno`) mają pierwszeństwo w swoim czasie.

## Źródła

Odczyt 18.11.2026 (`dane-gsc-dostep` w pamięci agenta i system Wraca na miejsce, `rozwoj/tresci.md`, sekcje 8 i 11).

- [Google: Indexing API tylko dla ofert pracy i transmisji](https://developers.google.com/search/apis/indexing-api/v3/using-api?hl=en)
- [Search Console API: Search Analytics](https://developers.google.com/webmaster-tools/v1/searchanalytics/query)
- [GA4 Data API: wymiar landingPage i metryki e-commerce](https://developers.google.com/analytics/devguides/reporting/data/v1/api-schema)
