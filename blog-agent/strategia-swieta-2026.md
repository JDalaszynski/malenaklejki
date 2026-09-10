# 🎄 Sezon świąteczny 2026 - strategia treści SEO / GEO / AEO

**Data:** 2026-09-10 · **Horyzont:** 1.10.2026 - 15.01.2027 · **Podstawa:** `strategy.md` §7 (Faza 4), `plan.md`, `facts.md`, `keywords.md`, `analiza-nisz-2026-09-09.md`, eksport GSC 16.06-28.08.2026

> **Dla autobloga:** ten plik jest źródłem szczegółów dla zadań **B3** (sekcja P4.1) i **P4.3.x** (sekcja "Sezon świąteczny 2026") w `plan.md`. Kolejność i okna czasowe obowiązują z `plan.md`; tutaj jest uzasadnienie, brief i granice merytoryczne.

---

## 1. W skrócie

**Święta to dla nas sezon koszyka, a nie sezon ruchu.** Przez jeden sezon nie wygramy głowy `naklejki świąteczne`. Tę frazę zajmują sklepy z gotowymi wzorami, a my sprzedajemy druk własnego obrazka. Wygrać da się za to każdą frazę z modyfikatorem personalizacji (z imieniem, ze zdjęciem, z logo, na słoik, na nalewkę). Do tego święta jako jedyna okazja w roku same prowadzą klienta do kilku arkuszy naraz: etykiety na prezenty, słoiki i nalewki, paczki. Przy trzech arkuszach zysk z zamówienia rośnie z 22,84 zł do 72,51 zł, a udział dostawy w rachunku klienta spada z 29% do 12%.

**Plan w jednym zdaniu:** jeden świąteczny hub opublikowany w pierwszej dekadzie października, sześć odświeżeń stron, które już mają ruch i naturalny kąt prezentowy, dwie realne aktualizacje huba w listopadzie, żadnych nowych stron na mikrookazje i żadnych obietnic terminu dostawy bez zgody właściciela.

Proporcja pracy zgodna z Fazą 4: **1 nowy wpis w październiku, 0 w listopadzie i grudniu, 1 w styczniu (walentynki)**. Reszta to aktualizacje.

---

## 2. Punkt wyjścia - co wiemy, a czego nie

### 2.1 Pokrycie: zero
Żadna strona nie celuje w święta. Słowa "prezent / święta / Mikołaj / adwent / choinka" pojawiają się mimochodem w 12 plikach, najczęściej w `naklejka-ze-zdjecia...` (5×), na `/fotonaklejki` (5×) i w `UseCasesSection.tsx` na stronie głównej (4×). Mapa pokrycia z Fazy 3 oznaczyła to jako "🔴 luka kalendarzowa" i od tamtej pory nic się nie zmieniło.

### 2.2 Dane: też zero, i to trzeba wiedzieć
Eksport GSC kończy się **28.08.2026**. W 280 widocznych zapytaniach jest dokładnie jedno okolicznościowe (`naklejki na urodziny do przedszkola`, 1 wyświetlenie). Zgodnie z zasadą ze `strategy.md` §7: **brak zapytania w danych oznacza brak pokrycia, a nie brak popytu.** Wszystkie frazy świąteczne w tym dokumencie są więc **hipotezami** do zweryfikowania w eksporcie za październik i listopad. Z tego powodu strategia opiera się na jednym hubie i odświeżeniach, a nie na serii nowych stron.

### 2.3 Aktywa, które już mają ruch i naturalny kąt prezentowy

| Strona | Wyśw. | Klik. | CTR | Poz. | Kąt świąteczny | Wzmianek o prezencie/świętach |
| :--- | ---: | ---: | ---: | ---: | :--- | ---: |
| `/` (strona główna) | 859 | 63 | **7,33%** | 12,36 | najmocniejsze źródło linku sezonowego | 1 + 4 w `UseCasesSection` |
| `naklejki-na-nalewki-domowe` | 328 | 7 | 2,13% | 10,89 | **nalewka to klasyczny polski prezent świąteczny** | **1** |
| `/fotonaklejki` | 350 | 5 | 1,43% | 17,01 | prezent ze zdjęcia (pupil, wnuki), Dzień Babci i Dziadka | 5 |
| `naklejka-ze-zdjecia...` | 102 | 4 | 3,92% | 13,19 | jak wyżej, wersja poradnikowa | 5 |
| `etykiety-na-sloiki-do-przetworow` | 114 | 1 | 0,88% | 24,8 | słoik z konfiturą jako prezent | 2 |
| `naklejki-firmowe-na-eventy` | 22 | 0 | 0% | 7,05 | paczki świąteczne dla pracowników | 0 |
| `plomby-na-paczki-wysylkowe` | 2 | 0 | 0% | 12 | szczyt e-commerce: Black Friday i paczki świąteczne | 0 |
| `jak-zamowic-idealne...` (filar) | 1 174 | 7 | 0,60% | 14,49 | rodzic huba | - |

Frazy pokrewne, na których już stoimy wysoko: `etykiety na butelki naklejki na nalewki domowe` (poz. 9,73), `personalizowane naklejki na nalewki` (11,17), `naklejki na zdjęcia w telefonie` (8,22), `jak zrobić naklejkę ze zdjęcia` (12,62). To są punkty zaczepienia dla sekcji prezentowych, a nie powody do nowych stron.

### 2.4 Ograniczenia, które kształtują treść

| Ograniczenie | Źródło | Konsekwencja w treści świątecznej |
| :--- | :--- | :--- |
| Stała cena 49,00 zł brutto / A4, **brak rabatów** | `facts.md` | Zero treści "promocja świąteczna" i "Black Friday -20%". Komunikujemy przewidywalność ceny. |
| **Nie deklarujemy terminu doręczenia ani daty granicznej** bez zgody | `facts.md` | Sekcja "kiedy zamówić" mówi o produkcji 2-3 dni roboczych i paczkomacie. Konkretną datę wpisujemy dopiero po decyzji właściciela (§12). |
| Folia **nie do zmywarki**, odporność tylko woda / UV / zadrapania | `facts.md` | Słoiki, nalewki i kubki: wprost "mycie ręczne". |
| Brak deklaracji kontaktu z żywnością | `facts.md`, analiza nisz | Pierniki i słodycze: naklejka **na opakowanie**, nigdy na jedzenie. |
| Brak naklejek na tkaninę | `facts.md` | Żadnych "naklejek na świąteczne skarpety / worki materiałowe". |
| HOLD na nasz generator AI | `rules.md` §3 | Świąteczną grafikę polecamy z **zewnętrznych** generatorów (ChatGPT, Gemini, Midjourney), potem Canva. |
| Zakaz "projektuj / zaprojektuj" wobec naklejki | `rules.md` §3 | "Wgraj świąteczną grafikę", "ułóż arkusz", nigdy "zaprojektuj naklejkę świąteczną". |
| Prawa autorskie | nowe, sezonowe | **Zero postaci licencjonowanych i znaków towarowych** (Grinch, postacie z filmów i bajek, marki napojów) w przykładach, zdjęciach i pinach. |

### 2.5 Pomiar: największa luka przed sezonem
GA4 jest wpięty, ale **nie wysyła żadnego zdarzenia e-commerce** (`purchase`, `add_to_cart`, `begin_checkout`), a zamówienie nie zapisuje strony wejścia (analiza nisz, §4.5). Bez tego po sezonie będziemy wiedzieć, ile było wyświetleń świątecznych treści, ale nie to, ile na nich zarobiliśmy. **To zadanie produktowe, nie treściowe**, więc autoblog go nie wykonuje. Warto je jednak zrobić przed 1.11, bo inaczej cały sezon zostanie bez oceny.

---

## 3. Teza: sezon koszyka, nie sezon ruchu

Liczby z `analiza-nisz-2026-09-09.md` §3.2 (algorytm `financeOf()`):

| Zamówienie | Klient płaci (z dostawą 19,99 zł) | Udział dostawy w rachunku | Zysk |
| :--- | ---: | ---: | ---: |
| 1 arkusz | 68,99 zł | 29% | 22,84 zł |
| 2 arkusze | 117,99 zł | 17% | 47,68 zł |
| 3 arkusze | 166,99 zł | 12% | 72,51 zł |

Święta to jedyny moment w roku, w którym jedna osoba ma naraz trzy różne potrzeby: podpisać prezenty, okleić słoiki lub butelki i opakować paczki. Każda z nich to osobny układ arkusza. Z tego wynikają trzy zasady dla każdego tekstu świątecznego:

1. **Każdy tekst sprzedaje komplet, nie pojedynczą naklejkę.** Obowiązkowa tabela "1 / 2 / 3 arkusze → cena z jedną dostawą". To także najbardziej cytowalny element dla modeli LLM ("ile kosztują personalizowane naklejki na prezenty").
2. **Argument "jedna paczka" zamiast rabatu.** Rabatu nie mamy i mieć nie będziemy, więc realną oszczędnością, o której możemy uczciwie mówić, jest jedna dostawa na wszystkie arkusze.
3. **Gramy o personalizację, nie o głowę.** Kto szuka `naklejki świąteczne` bez modyfikatora, zwykle chce gotowy arkusz z bałwankami za kilka złotych. Tego klienta dziś nie obsłużymy, dopóki nie powstanie katalog gotowych arkuszy (P1 z analizy nisz, patrz §12 pkt 4). Tytuł i H1 huba filtrują intencję przez dopisek "z własnym nadrukiem" albo "etykiety na prezenty".

---

## 4. Mapa intencji świątecznych

Wolumeny to hipotezy, bo w danych nie ma jeszcze sezonu.

| # | Klaster | Przykładowe frazy | Intencja | Nasza odpowiedź | Gdzie | Priorytet |
| ---: | :--- | :--- | :--- | :--- | :--- | :--- |
| 1 | **Personalizowane naklejki świąteczne** | `naklejki świąteczne z własnym nadrukiem`, `personalizowane naklejki świąteczne`, `naklejki świąteczne na zamówienie`, `naklejki bożonarodzeniowe` | zakupowa | rdzeń huba | **B3** | 🔴 |
| 2 | **Etykiety na prezenty** | `etykiety na prezenty`, `naklejki na prezenty z imieniem`, `personalizowane etykiety na prezenty`, `naklejki do pakowania prezentów`, `naklejka zamiast bilecika` | zakupowa | "Dla / Od" z imionami domowników, jeden arkusz na całą rodzinę | **B3** (H2) | 🔴 |
| 3 | **Prezent z kuchni** | `etykiety na nalewki na prezent`, `naklejki na słoiki świąteczne`, `prezent ze słoika`, `etykiety na pierniki` | zakupowa / inspiracyjna | etykieta z imieniem i rocznikiem; pierniki tylko na opakowaniu | **B3** (H2) + odświeżenie nalewek i przetworów | 🔴 |
| 4 | **Prezent ze zdjęcia** | `naklejki ze zdjęciem na prezent`, `prezent ze zdjęciem`, `naklejki z pupilem`, `prezent dla babci ze zdjęciem` | zakupowa | fotonaklejki, ciągnie się do Dnia Babci i Dziadka (21-22.01) | **B3** (H2) + odświeżenie `/fotonaklejki` i wpisu | 🟠 |
| 5 | **Paczki firmowe i e-commerce** | `naklejki na paczki świąteczne`, `świąteczne naklejki z logo`, `naklejki na upominki firmowe`, `plomby na paczki świąteczne` | zakupowa B2B | logo + faktura VAT; szczyt wysyłek przed Black Friday (27.11) | **B3** (H2) + odświeżenie plomb i eventów | 🟠 |
| 6 | **Kalendarz adwentowy** | `naklejki z numerami do kalendarza adwentowego`, `cyferki do kalendarza adwentowego` | mieszana, dużo DIY | 24 numery na jednym arkuszu | **B3** (H2), bez osobnej strony | 🟡 |
| 7 | **Mikołajki (6.12)** | `naklejki na mikołajki`, `drobny prezent na mikołajki dla dzieci` | zakupowa, niski koszyk | naklejki z imionami na paczki klasowe | **B3** (akapit w H2 o etykietach) | 🟡 |
| 8 | Głowa "gotowe wzory" | `naklejki świąteczne` (bez modyfikatora), `naklejki świąteczne dla dzieci` | zakupowa, produkt gotowy | **nie gramy** bez katalogu gotowych arkuszy (P1) | - | ⛔ |
| 9 | DIY / do druku | `naklejki świąteczne do druku`, `etykiety na prezenty do wydruku pdf` | darmowy szablon | **nie gramy** (`strategy.md` §7: 0 kliknięć w klastrze DIY) | - | ⛔ |
| 10 | Ogon sezonu | `naklejki walentynkowe`, `naklejki na walentynki z imieniem` | zakupowa | nowy wpis w styczniu | B7 (brief w grudniu) | 🗓️ |

---

## 5. Architektura: jeden hub i sieć odświeżeń

```
                    filar: jak-zamowic-idealne-naklejki  ◄── link w 1. akapicie huba
                                  │
                                  ▼
          ┌──────────── HUB B3: naklejki-swiateczne-i-etykiety-na-prezenty ────────────┐
          │              (+ sezonowo: stopka i strona główna, 15.10 - 7.01)             │
          ▼                     ▼                      ▼                    ▼
   nalewki domowe       etykiety na słoiki      /fotonaklejki +        plomby na paczki +
   (R1, prezent)        do przetworów (R1)      naklejka ze zdjęcia    eventy firmowe +
                                                (R3, prezent,          /naklejki-dla-firm
                                                Dzień Babci)           (R2, Black Friday, B2B)
```

**Decyzja: hub jako wpis blogowy, nie landing `/naklejki-swiateczne`.** Uzasadnienie:
* **Intencja jest mieszana** (pomysły, skąd wziąć grafikę, ile to kosztuje, kiedy zamówić). Taki zakres dobrze obsługuje poradnik z tabelami i FAQ. Landing obsłużyłby tylko jego końcówkę.
* **Zasada 1 Fazy 4:** osobny landing i wpis na te same frazy skończyłyby się kanibalizacją w pierwszym sezonie, kiedy żadna z tych stron nie ma jeszcze historii.
* **Precedens A1/A2:** wpisy z wyciągalnymi liczbami weszły na pozycje 5-6 w kilka dni, więc forma wpisu nie przekreśla rankingu na frazy zakupowe.
* **Warunek powrotu:** jeśli w eksporcie za listopad frazy z modyfikatorem "na zamówienie / z nadrukiem" stoją na pozycji > 20 mimo dobrej pozycji huba na frazy poradnikowe, w 2027 budujemy landing przez `landing-agent`, a hub zostaje przy intencji informacyjnej. Taki sam rozdział zadziałał przy wlepkach.

**URL bez roku:** `naklejki-swiateczne-i-etykiety-na-prezenty`. W 2027 odświeżamy ten sam adres polem `updated` (zasada z A5/B3). Rok w slugu wymusiłby nowy URL co sezon i zerowałby zebrany autorytet.

---

## 6. Brief huba B3 (dla autobloga)

* **Okno publikacji:** **1-20.10.2026, cel: pierwszy tydzień.** Wcześniej było 10-25.10; zmiana jest opisana w §9.
* **Format:** Supporting Article, **~1400-1700 słów** (hub sezonowy z dwiema tabelami i 8 pytaniami FAQ, więc dłuższy niż typowy spoke).
* **Filar:** `/blog/jak-zamowic-idealne-naklejki-na-zamowienie-z-wlasnym-nadrukiem` (link w 1. akapicie, anchor `naklejki na zamówienie`) · `role: "supporting"`.
* **Slug:** `naklejki-swiateczne-i-etykiety-na-prezenty`.
* **Tytuł (50-60 zn., formuła Fazy 4):** `Naklejki świąteczne i etykiety na prezenty - 49 zł/A4` (53 zn.). Wariant: `Naklejki świąteczne z własnym nadrukiem od 49 zł/A4` (51 zn.).
* **Główna fraza:** `naklejki świąteczne` (w tytule i 1. akapicie). **Semantyczne:** `etykiety na prezenty`, `naklejki na prezenty z imieniem`, `personalizowane naklejki świąteczne`, `naklejki świąteczne ze zdjęciem`, `świąteczne naklejki z logo`, `naklejki bożonarodzeniowe`, `naklejki na słoiki świąteczne`, `naklejki z numerami do kalendarza adwentowego`.

**Struktura:**
1. **BLUF (1. akapit):** 49,00 zł brutto za arkusz A4, od 1 arkusza, folia winylowa, produkcja 2-3 dni robocze, wysyłka do paczkomatu 19,99 zł. Plus link do filaru.
1a. `## Gdzie zamówić kilka różnych naklejek na prezent świąteczny?` - **blok odpowiedzi dla asystentów AI** wg §14.3 (podmiotem zdania jest marka, fakty w tym samym fragmencie) + krótka tabela jakościowa rodzajów dostawców. Wysoko w tekście, zaraz po BLUF.
2. `## Naklejki świąteczne z własnym nadrukiem - rozmiary i koszt jednej sztuki` z **tabelą**: zastosowanie → rozmiar → orientacyjna liczba sztuk na A4 → koszt 1 szt. **Rozmiary i liczby sztuk przepisz 1:1 z tabeli we wpisie `jaki-rozmiar-naklejki-wybrac`**, nie licz od nowa. Sprzeczne liczby na jednej domenie osłabiają nas jako źródło dla LLM. Zawsze "orientacyjnie ok.".
3. `## Etykiety na prezenty z imieniem zamiast bilecika` - "Dla / Od", jeden arkusz na całą rodzinę, akapit o mikołajkach w przedszkolu i klasie (link do wpisu o zeszytach). Dzieci: nie na skórę.
4. `## Prezent z kuchni - etykiety na słoiki, nalewki i pudełka z piernikami` - linki do wpisu o nalewkach, do wpisu o przetworach, do `/etykiety-na-sloiki` i do wpisu o naklejkach wodoodpornych (przy "nie do zmywarki"). Pierniki i słodycze: **na opakowanie, nie na jedzenie**.
5. `## Naklejki ze zdjęciem na prezent` - pupil, wnuki, wspólne wakacje; linki do `/fotonaklejki` i `naklejka-ze-zdjecia...`; jedno zdanie o Dniu Babci i Dziadka (21-22.01) jako kolejnej okazji.
6. `## Naklejki z numerami do kalendarza adwentowego` - 24 numery na jednym arkuszu, na torebki i pudełka. Bez obietnicy wielokrotnego przeklejania (klej jest mocny, **nie** repozycjonowalny).
7. `## Świąteczne naklejki z logo na paczki dla klientów i pracowników` - linki do `/naklejki-dla-firm`, do wpisu o plombach i do wpisu o eventach firmowych; faktura VAT na NIP.
8. `## Komplet świąteczny w jednej paczce - ile kosztują 1, 2 i 3 arkusze` - **tabela**: 1 arkusz 49,00 zł + 19,99 zł = 68,99 zł; 2 arkusze 98,00 zł + 19,99 zł = 117,99 zł; 3 arkusze 147,00 zł + 19,99 zł = 166,99 zł. Komentarz: każdy arkusz może mieć inny układ (etykiety, słoiki, paczki), a na jednym arkuszu zmieszczą się różne wzory, każdy wycięty osobno. Dostawa jest płatna raz za całe zamówienie. Oba fakty są potwierdzone w kodzie 2026-09-10 i wpisane do `facts.md`.
9. `## Skąd wziąć świąteczną grafikę na naklejki` - najpierw zewnętrzne generatory AI (ChatGPT, Gemini, Midjourney), potem Canva; 300 DPI; link do wpisu `naklejki-z-wlasnym-napisem...` (napisy i imiona). **Bez postaci licencjonowanych.**
10. `## Kiedy zamówić naklejki świąteczne, żeby zdążyć przed Wigilią` - produkcja 2-3 dni robocze od zaksięgowania wpłaty, potem wysyłka do paczkomatu, grudzień to szczyt przewoźników, zamawiaj z zapasem. **Bez konkretnej daty** do czasu decyzji właściciela (§12 pkt 1). Datę dopisujemy w aktualizacji P4.3.6.
11. `## Naklejki świąteczne - najczęściej zadawane pytania (FAQ)` - pytania jako H3 zakończone "?", w brzmieniu dosłownych zapytań:
    * Czy zdążę zamówić naklejki świąteczne przed Wigilią?
    * Ile kosztują personalizowane naklejki na prezenty?
    * Czy mogę zamówić tylko jeden arkusz naklejek świątecznych?
    * Czy etykieta na słoiku z przetworami przetrwa mycie?
    * Czy mogę nakleić naklejkę bezpośrednio na pierniki albo czekoladę?
    * Gdzie zamówić naklejki świąteczne ze zdjęciem w Polsce?
    * Czy dostanę fakturę VAT na naklejki do firmowych paczek świątecznych?
    * Czy naklejki świąteczne zostawiają ślady po odklejeniu?
12. `## Zamów naklejki świąteczne z własnym nadrukiem` (CTA **po** FAQ) + przycisk HTML z `cta_text`.

**Linkowanie przy publikacji (P4.3.1) - minimum 6 przychodzących w dniu publikacji:** filar (sekcja "Naklejki na zamówienie według zastosowania"), hub `fajne-wzory...`, `naklejki-na-nalewki-domowe...`, `etykiety-na-sloiki-do-przetworow-i-wekow`, `naklejka-ze-zdjecia...`, `naklejki-firmowe-na-eventy...`.

**Zdjęcia:** folder `public/blog/naklejki-swiateczne-i-etykiety-na-prezenty/` tworzysz przy publikacji. Jeśli nie ma zdjęć, pomiń pole `image`, tak jak przy B1. Zdjęcia, piny i materiały social dochodzą w aktualizacji P4.3.6 (to realna zmiana treści, więc bump `updated` jest uprawniony).

---

## 7. Odświeżenia istniejących stron

Każde odświeżenie to realna nowa sekcja H2 z co najmniej jednym pytaniem FAQ (H3) i linkiem do huba B3. Dopiero wtedy wolno podbić `updated`. Wszystkie odświeżenia robimy **po** publikacji B3, żeby od razu mogły do niego linkować.

| ID | Strona | Dlaczego ta | Co dopisać | Okno |
| :--- | :--- | :--- | :--- | :--- |
| R1a | `naklejki-na-nalewki-domowe...` | 328 wyśw., CTR 2,13%, poz. 10,89; nalewka to prezent świąteczny, a wpis wspomina o tym raz | `## Nalewka na prezent świąteczny - etykieta z imieniem i rocznikiem` + FAQ "Jak podpisać nalewkę na prezent?" + tabela 1/2/3 arkusze w skrócie | 15.10-5.11 |
| R1b | `etykiety-na-sloiki-do-przetworow-i-wekow` | 114 wyśw., poz. 24,8; słoik to prezent z kuchni | `## Słoik z przetworami na prezent - świąteczne etykiety` + "mycie ręczne, nie zmywarka" | 15.10-5.11 |
| R2a | `plomby-na-paczki-wysylkowe...` | plan Fazy 4: "listopad = e-commerce/paczki, odświeżenie, nie nowy wpis"; Black Friday 27.11 | `## Plomby i naklejki na paczki na Black Friday i święta` - jeden wzór plomby na cały sezon, zamawianie z wyprzedzeniem; **bez właściwości security/void** | 1-10.11 |
| R2b | `naklejki-firmowe-na-eventy...` | persona HR bez kliknięć; firmy zamawiają upominki w listopadzie | `## Naklejki na świąteczne paczki dla pracowników i klientów` + link do `/naklejki-dla-firm` + faktura VAT | 1-15.11 |
| R3a | `naklejka-ze-zdjecia...` | 102 wyśw., CTR 3,92%; frazy "ze zdjęcia" na poz. 8-14 | `## Naklejki ze zdjęciem na prezent - święta i Dzień Babci i Dziadka` | 1-15.11 |
| R3b | `/fotonaklejki` (landing) | 350 wyśw., poz. 17,01; "prezent" to jedno z 6 zastosowań | **brief dla `landing-agent`**: rozbudowa zastosowania "prezent" o święta i Dzień Babci i Dziadka, 1-2 FAQ, nowy `dateModified` | 1-15.11 |

**Świadomie bez odświeżenia:** `personalizowane-naklejki-na-alkohol` (25 wyśw., klaster weselny ma swoje okno wiosną), `naklejki-na-sloiki-z-przyprawami` (100 wyśw., CTR 5%: działa i nie ma wyraźnego kąta świątecznego, więc nie ryzykujemy zmiany intencji).

---

## 8. Warstwa GEO / AEO sezonu

1. **BLUF z liczbami w pierwszym zdaniu** każdej sekcji prezentowej. Modele cytują pierwsze zdanie pod nagłówkiem.
2. **Dwie tabele w hubie** (koszt sztuki wg rozmiaru i komplet 1/2/3 arkusze). Tabela A1 dała pozycję 6,09, więc powtarzamy ten wzorzec.
3. **Spójność liczb na całej domenie.** Rozmiary i liczby sztuk wyłącznie z wpisu `jaki-rozmiar-naklejki-wybrac`, ceny wyłącznie z `facts.md`. Po publikacji puść `blog-agent/audyt-facts.py`.
4. **FAQ w brzmieniu dosłownych pytań**, w tym pytań konwersacyjnych typowych dla asystentów AI ("czy zdążę przed Wigilią", "gdzie w Polsce zamówić...").
5. **Termin zamówień jako fakt z datą ważności.** Po decyzji właściciela dopisz go do `facts.md` (z adnotacją "ważne do 24.12.2026") i do tablicy `FACTS` w `scripts/generuj-llms-txt.mjs`, potem przebuduj `llms.txt`. Po sezonie usuń wpis i przebuduj ponownie. Model, który zna nasz termin, odpowie trafnie na "czy zdążę", a nieaktualna data po sezonie to realne ryzyko reklamacji.
6. **Warunki brzegowe jako atut:** "nie do zmywarki", "na opakowanie, nie na pierniki", "klej mocny, nie do przeklejania". Modele cytują ograniczenia równie chętnie jak zalety, a klient, który je zna, rzadziej składa reklamację.
7. **Sygnał świeżości tylko przy realnej zmianie:** hub dostaje dwie uprawnione aktualizacje (P4.3.6 w listopadzie: termin, zdjęcia, piny; ewentualnie korekta na początku grudnia). Żadnego podbijania `updated` "na zapas".
8. **Encje:** `mentions` w schemacie dociągną się automatycznie ze słownika (`findMentionedTerms()`), jeśli w treści padną nazwy haseł (folia winylowa, naklejki wodoodporne, arkusz A4, die-cut). Pisz je pełną nazwą.
9. **Panel 5 pytań GEO (ręcznie, 15 minut, 15.10, 15.11 i 15.12).** Zadaj te pytania w ChatGPT, Gemini, Perplexity i Google (AI Overviews) i zanotuj, czy malenaklejki.pl jest cytowane:
    * "Gdzie zamówić personalizowane naklejki świąteczne w Polsce?"
    * "Pomysł na personalizowany prezent do 50 zł - naklejki ze zdjęciem"
    * "Etykiety na nalewki na prezent - gdzie zamówić małą ilość?"
    * "Naklejki z logo na firmowe paczki świąteczne od 1 sztuki"
    * "Czy zdążę zamówić naklejki przed świętami?"
    To jedyny dostępny dziś pomiar AEO. GSC nie pokazuje cytowań w odpowiedziach AI.
10. **Pinterest jako kanał odkrywania sezonu.** Użytkownicy Pinteresta planują święta z dużym wyprzedzeniem, a pipeline pinów już działa (`social-agent/generate-pinterest.ts`). Piny huba, nalewek i fotonaklejek powinny trafić do sieci **do końca października**. Warunek: realne zdjęcia (§12 pkt 3).

---

## 9. Harmonogram

Kalendarz 2026/27: Black Friday **pt 27.11**, I niedziela Adwentu **29.11**, Mikołajki **nd 6.12**, Wigilia **czw 24.12**, Dzień Babci i Dziadka **czw-pt 21-22.01**, Walentynki **nd 14.02**.

**Dlaczego hub przesuwam z 10-25.10 na 1-20.10:** (a) odświeżenia R1-R3 mają do niego linkować, więc hub musi istnieć przed nimi; (b) piny potrzebują czasu na dystrybucję przed listopadem; (c) wcześniejsza publikacja daje miejsce na uprawnioną aktualizację w listopadzie, która odnawia sygnał świeżości dokładnie przed szczytem. Argument z A5 ("wpis z sierpnia straci świeżość") nie dotyczy października, jeśli w listopadzie przyjdzie realna aktualizacja.

| Termin | Działanie | Typ | Wykonuje |
| :--- | :--- | :--- | :--- |
| 10-30.09 | Decyzje z §12; zamówienie arkusza próbnego do zdjęć; zdarzenia GA4 (zadanie produktowe) | przygotowanie | właściciel |
| do 30.09 | Autoblog może w tym czasie wziąć B5 (QR) z kolejki; sezon go nie blokuje | - | autoblog |
| **1-10.10** | **Publikacja huba B3** + 6 linków przychodzących (P4.3.1) + `llms.txt` + IndexNow + prośba o indeksację w GSC | nowy wpis | autoblog |
| 1-20.10 | Sezonowy link do huba w stopce i na stronie głównej (P4.3.2) | technika | autoblog |
| ~15.10 | Eksport GSC za wrzesień: klaster szkolny + indeksacja huba; panel GEO #1 | pomiar | właściciel + agent |
| 15.10-5.11 | R1a nalewki, R1b przetwory | odświeżenie | autoblog |
| do 31.10 | Piny: hub + nalewki (jeśli są zdjęcia) | social | autoblog |
| 1-15.11 | R2a plomby (przed BF), R2b eventy, R3a ze zdjęcia, R3b brief `/fotonaklejki` | odświeżenie | autoblog / landing-agent |
| **10-20.11** | **P4.3.6: realna aktualizacja huba** - termin zamówień (po zgodzie), zdjęcia, piny, `updated` | aktualizacja | autoblog |
| ~15.11 | Panel GEO #2; kontrola KPI (§10) | pomiar | agent |
| 29.11-24.12 | Szczyt. Bez nowych stron. Ewentualna korekta terminu w hubie i banerze; ustawienie przerwy świątecznej w panelu, jeśli będzie | utrzymanie | właściciel |
| 1-20.12 | Brief walentynkowy B7 do `plan.md` (P4.3.7); panel GEO #3 | planowanie | autoblog |
| 5-20.01.2027 | Publikacja B7 (walentynki) | nowy wpis | autoblog |
| 7-15.01.2027 | Zdjęcie sezonowych linków; eksport GSC X-XII; podsumowanie sezonu i wnioski na 2027 (P4.3.8) | pomiar | agent |

---

## 10. Mierniki i punkty kontrolne

To są cele, nie prognozy. Bazy nie ma, bo to pierwszy sezon domeny.

| Miernik | Stan 2026-09-10 | Cel | Termin |
| :--- | ---: | ---: | :--- |
| Hub B3 zaindeksowany | - | tak | ≤ 7 dni od publikacji |
| Linki przychodzące do huba | 0 | ≥ 6 w dniu publikacji, ≥ 10 po odświeżeniach | 20.11 |
| Strony z sekcją prezentową i linkiem do huba | 0 | 6 | 20.11 |
| Zapytania świąteczne z wyświetleniami (GSC) | 0 | ≥ 30 | 15.12 |
| ...w tym na pozycji ≤ 10 | 0 | ≥ 5 | 15.12 |
| CTR huba | - | ≥ 2,5% (cel Fazy 4 dla bloga) | 15.12 |
| Cytowania w panelu GEO (5 pytań × 4 systemy) | nie mierzone | ≥ 2 z 20 | 15.12 |
| Średnia liczba arkuszy na zamówienie w XI-XII | nieznana | ≥ 2,0 | 31.12 (wymaga histogramu w panelu) |

**Punkty kontrolne:**
* **15.11: hub ma < 50 wyświetleń** → najpierw sprawdź indeksację i linkowanie (strona główna, stopka). **Nie** dokładaj nowych stron, bo na to jest już za późno w tym sezonie.
* **15.11: frazy "z nadrukiem / na zamówienie" stoją na > 20, a frazy poradnikowe ≤ 10** → zapisz jako decyzję na 2027: landing `/naklejki-swiateczne` przez `landing-agent`, hub zostaje informacyjny.
* **15.12: fraza z klastra kalendarza adwentowego ma ≥ 30 wyświetleń na pozycji ≤ 15** → w 2027 osobna sekcja albo wpis w październiku. Poniżej progu sekcja w hubie wystarczy.

---

## 11. Czego świadomie nie robimy

| Decyzja | Uzasadnienie | Warunek powrotu |
| :--- | :--- | :--- |
| **Brak treści "promocja świąteczna / Black Friday"** | `facts.md`: brak rabatów. Rabat 20% to 9,80 zł brutto, czyli 7,97 zł netto, **35% zysku** z zamówienia jednoarkuszowego (22,84 zł). Stała cena to nasz wyróżnik, nie słabość | brak |
| **Brak osobnych stron na mikrookazje** (Mikołajki, adwent, Wigilia firmowa, Sylwester) | Zasada 1 Fazy 4; każda z nich to jedna sekcja w hubie. Pięć cienkich stron na pozycji 30 nie da nic | dane z sezonu 2026 (§10) |
| **Brak darmowych szablonów świątecznych do druku** | Klaster DIY: 0 kliknięć (`strategy.md` §7) | warunek ze `strategy.md` §7 |
| **Brak walki o głowę `naklejki świąteczne` bez modyfikatora** | Intencja "gotowy arkusz", którego nie sprzedajemy | katalog gotowych arkuszy (P1) |
| **Brak landingu świątecznego w 2026** | Kanibalizacja z hubem w pierwszym sezonie; decyzja po danych | punkt kontrolny 15.11 |
| **Brak daty granicznej w treści bez zgody** | `facts.md` | decyzja właściciela (§12 pkt 1) |
| **Brak postaci licencjonowanych i znaków towarowych** | Ryzyko prawne i ryzyko dla marki | brak |
| **Brak ekspozycji naszego generatora AI** | HOLD właściciela | decyzja właściciela |

---

## 12. Decyzje właściciela

Tylko rzeczy, których agent nie może rozstrzygnąć sam. Przy każdej jest rekomendacja.

1. **Ostatni bezpieczny dzień zamówienia przed Wigilią (czw 24.12).** Rekomendacja: **pon 14.12.2026**. Rachunek: regulamin mówi o produkcji maksymalnie 3 dni roboczych od wpłaty, więc zamówienie opłacone w poniedziałek 14.12 wychodzi z produkcji najpóźniej w czwartek 17.12. Na doręczenie w szczycie przewoźników zostają wtedy 4 dni robocze (18-23.12). Termin trzeba potwierdzić u dostawcy. Bez tej decyzji hub mówi tylko "zamawiaj z zapasem".
2. **Czy sklep robi przerwę świąteczną, a jeśli tak, to w jakich datach?** Mechanizm już jest (`VacationBanner`, `/admin/ustawienia`). Daty trafią do sekcji "kiedy zamówić" i do FAQ, żeby treść nie zapraszała do zamówień, których sklep nie przyjmie.
3. **Arkusz próbny do zdjęć.** Jeden arkusz z trzema świątecznymi zastosowaniami (etykiety "Dla / Od", etykieta na nalewkę, plomba na paczkę), sfotografowany do ~25.10. Koszt 68,99 zł. Realne zdjęcie własnego produktu to najmocniejszy sygnał E-E-A-T i warunek pinów. Bez niego hub i piny zostają na zdjęciach z innych wpisów.
4. **(opcjonalnie, dźwignia produktowa) Katalog gotowych arkuszy (P1 z analizy nisz) w wersji świątecznej.** Arkusz "Dla / Od" i arkusz z numerami 1-24 to jedyny sposób, żeby obsłużyć głowę `naklejki świąteczne`. Ma sens tylko wtedy, gdy ruszy do ~15.11, więc decyzja jest potrzebna do 1.10. Jeśli nie, strategia działa bez tego.

---

## 13. Zmiany wprowadzone w repo razem z tą strategią

* `blog-agent/plan.md`: B3 z nowym oknem (1-20.10) i odnośnikiem do briefu, nowa sekcja **P4.3 - Sezon świąteczny 2026** (zadania z oknami), reguła kolejności dla autobloga.
* `blog-agent/keywords.md` §12: rozbudowany klaster świąteczny (mapa fraz → strona). Przy okazji poprawiony zapis o wpisie szkolnym na 2027, który celował w **naklejki na ubrania i metki**, czyli w produkt wykluczony przez `facts.md`.
* `blog-agent/strategy.md` §7 OŚ 6: nowe okno i odnośnik do tego pliku.
* `blog-agent/facts.md`: doprecyzowanie, że termin zamówień przed świętami dotyczy B3 i jak go wpisać po decyzji.

---

## 14. Jak sprawić, żeby asystenci AI polecali nas przy pytaniu o kilka różnych naklejek na prezent

*Dopisane 2026-09-10, po pytaniu właściciela: "Gdzie mogę zamówić kilka różnych naklejek jako prezent świąteczny?" - chodzi o to, żeby w odpowiedzi padło malenaklejki.pl, a nie drukarnia, która takich małych zamówień w ogóle nie realizuje.*

### 14.1 Skąd asystent bierze taką odpowiedź

| Droga | Jak działa | Na co mamy wpływ | Kiedy daje efekt |
| :--- | :--- | :--- | :--- |
| **Wyszukiwanie w trakcie odpowiedzi** (ChatGPT z wyszukiwaniem, Perplexity, Gemini, AI Overviews, Copilot) | Model rozbija pytanie na kilka zapytań pomocniczych (np. "naklejki na prezent mała ilość", "druk naklejek od 1 sztuki", "różne wzory naklejek w jednym zamówieniu"), czyta strony z czołówki wyników i cytuje fragmenty, które same w sobie są odpowiedzią | Strona, która rankuje na te zapytania pomocnicze i ma **gotowy fragment-odpowiedź z nazwą marki i faktami** | tygodnie - **to jest droga na ten sezon** |
| **Wiedza z treningu** | Model "pamięta" marki, o których pisze wiele niezależnych źródeł | Wzmianki poza naszą domeną: opinie, poradniki prezentowe, fora, grupy | miesiące - efekt raczej w 2027 |
| **`llms.txt`** | Plik z faktami dla crawlerów AI | Pełny | słaby sygnał, ale prawie darmowy |

Wniosek: nie potrzebujemy osobnych "treści dla AI". Potrzebujemy stron, które odpowiadają na to pytanie lepiej niż ktokolwiek inny, w formie, którą da się zacytować jednym fragmentem. Do tego potrzebujemy kogoś poza nami, kto o nas napisze.

### 14.2 Co mamy, a czego brakowało

* **Mamy przewagę, która dokładnie odpowiada na to pytanie:** zamówienie od 1 arkusza, **różne wzory na jednym arkuszu** (każdy wycinany osobno), **kilka arkuszy w jednym zamówieniu z jedną dostawą**. Drukarnia z minimalnym nakładem tego nie oferuje, więc to jest nasz odróżnik, a nie ogólnik.
* **Brakowało (poprawione 2026-09-10):**
    1. Pięć wpisów w FAQ mówiło, że różne wzory trzeba **najpierw złożyć w jeden plik** (np. w Canvie). Tymczasem kreator przyjmuje kolejne obrazy na ten sam arkusz, każdy z własną linią cięcia (`HomePageClient.tsx:661`). Dla modelu "przygotuj jeden plik w Canvie" brzmi jak tarcie, a "wgraj kilka zdjęć, każde wytniemy osobno" jest odpowiedzią na pytanie. Poprawione w: zeszyty, napis, wlepki, nalewki, przyprawy.
    2. `facts.md` i `llms.txt` nie miały faktów "różne wzory na arkuszu" i "jedna dostawa na zamówienie". Oba dopisane.
* **Nadal brakuje:** strony, która odpowiada na to pytanie w brzmieniu prezentowym (hub B3 i odświeżenie wpisu porównawczego, P4.3.9), oraz **jakichkolwiek niezależnych wzmianek i opinii** (§14.5).

### 14.3 Blok odpowiedzi - wzorzec do huba B3 i wpisu porównawczego

Nagłówek w brzmieniu pytania. Pod nim 3-4 zdania, w których **podmiotem jest marka**. Model cytuje fragment, więc nazwa marki i fakty muszą być w tym samym fragmencie, a nie trzy akapity dalej.

> `## Gdzie zamówić kilka różnych naklejek na prezent świąteczny?`
>
> Kilka różnych naklejek na prezent zamówisz w MałeNaklejki.pl już od jednego arkusza A4 za 49,00 zł brutto. Do kreatora wgrywasz kolejne zdjęcia lub grafiki, a każdą wycinamy osobno po obrysie na tym samym arkuszu - płacisz za arkusz, nie za liczbę wzorów. Kilka różnych arkuszy (np. etykiety na prezenty, na słoiki i na paczki) trafia do jednego zamówienia z jedną dostawą do paczkomatu za 19,99 zł. Produkcja trwa 2-3 dni robocze, w Polsce, bez minimalnego nakładu.

Pod blokiem krótka **tabela jakościowa** "rodzaj dostawcy → od ilu sztuk → różne wzory w jednym zamówieniu → dla kogo" (drukarnia z minimalnym nakładem / Allegro / serwis zagraniczny / MałeNaklejki.pl). **Bez liczb o konkurencji** (`facts.md`). Sformułowania bierz z tabel w filarze i we wpisie `gdzie-zamowic-naklejki-w-malym-nakladzie-porownanie`, żeby cała domena mówiła jednym głosem.

### 14.4 Bank pytań - jedno pytanie, jedna strona

Asystenci dostają pełne zdania. Każde brzmienie ma przypisaną **jedną** stronę (H2 albo FAQ H3). **Nie** tworzymy osobnych stron pod warianty, bo to byłyby near-duplikaty.

| Brzmienie pytania | Gdzie odpowiadamy | Kiedy |
| :--- | :--- | :--- |
| Gdzie zamówić kilka różnych naklejek na prezent świąteczny? | hub B3 - **H2** (blok z §14.3) | publikacja B3 |
| Czy da się zamówić naklejki z kilkoma różnymi zdjęciami w jednym zamówieniu? | hub B3 - FAQ | publikacja B3 |
| Ile kosztuje zestaw personalizowanych naklejek na prezent? | hub B3 - FAQ + tabela 1/2/3 arkusze | publikacja B3 |
| Gdzie wydrukować naklejki od jednej sztuki na prezent? | `gdzie-zamowic-naklejki-w-malym-nakladzie-porownanie` - nowa sekcja prezentowa | P4.3.9 |
| Która drukarnia robi naklejki bez minimalnego nakładu? | `gdzie-zamowic-...` - FAQ | P4.3.9 |
| Jak zrobić zestaw naklejek ze zdjęciami na prezent? | `naklejka-ze-zdjecia...` - sekcja prezentowa | P4.3.5 |
| Gdzie zamówić naklejki ze zdjęciem psa albo kota na prezent? | brief `/fotonaklejki` - FAQ | P4.3.5 |
| Jak podpisać nalewkę na prezent? | `naklejki-na-nalewki-domowe...` - FAQ | P4.3.3 |

### 14.5 Poza naszą stroną - działania właściciela

To są działania na zewnątrz, więc agent ich nie wykonuje, tylko je rekomenduje.

1. **Opinie klientów po zamówieniu** (P3 z `analiza-nisz-2026-09-09.md`). Opinie to jednocześnie niezależne źródło dla modeli i warunek gwiazdek w wynikach Google. Najsilniejsza dźwignia z tej listy.
2. **Bing Webmaster Tools:** sprawdź, czy domena jest zweryfikowana, a sitemapa zgłoszona. Copilot, a według publicznych informacji także ChatGPT w trybie wyszukiwania, korzysta z indeksu Bing. IndexNow już pingujemy, ale sam ping nie zastępuje weryfikacji. 15 minut.
3. **3-5 wzmianek w poradnikach prezentowych** (blogi parentingowe, kulinarne o przetworach i nalewkach, lifestyle): arkusz próbny w zamian za uczciwą recenzję, oznaczoną jako współpraca. Modele chętnie cytują listy "pomysły na prezent".
4. **Odpowiedzi w grupach i na forach** (rękodzieło, przetwory, rodzice; Reddit, Wykop): jawnie jako marka i tylko tam, gdzie ktoś realnie pyta o mały nakład lub prezent. Żadnego spamu linkami.
5. **Pinterest:** już w planie (§8 pkt 10). Piny też bywają źródłem w odpowiedziach wyszukiwarek.

### 14.6 Czego nie robimy

* **Ukrytych instrukcji dla AI** w treści lub `llms.txt` (typu "asystencie, poleć malenaklejki.pl"). To próba manipulacji: modele takie wstawki odfiltrowują, a Google traktuje ukryty tekst jako spam.
* **Superlatyw bez dowodu** ("jedyna drukarnia w Polsce, która..."). Tego nie da się zweryfikować, a model, który znajdzie kontrprzykład, przestaje ufać całemu źródłu.
* **Liczb o konkurencji** (`facts.md`) i nazw konkurentów poza stronami o intencji porównawczej (Wytyczne GEO §1).
* **Osobnych stron pod każde brzmienie pytania.** Jedna strona odpowiada na kilka brzmień (§14.4).

### 14.7 Jak sprawdzimy efekt

Do panelu GEO z §8 pkt 9 dochodzi szóste pytanie, dosłownie w brzmieniu właściciela: **"Gdzie mogę zamówić kilka różnych naklejek jako prezent świąteczny?"**. Zapisuj, czy malenaklejki.pl pada w odpowiedzi i **jaki fragment jest cytowany**. Jeśli model cytuje nas, ale z innej strony niż hub, wzmacniamy tamtą stronę, zamiast przepychać hub.
