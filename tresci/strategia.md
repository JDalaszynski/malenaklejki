# Strategia treści MałeNaklejki: listopad 2026 - luty 2027

Stan na 18.11.2026. Prowadzi agent `redaktor-tresci`, aktualizuje przy `/przeglad-tresci`. Zasady i procedury: `tresci/system.md`. Historia decyzji i analiz Faz 1-4: `blog-agent/strategy.md`, `blog-agent/plan.md`, `landing-agent/plan.md` - ten plik ich nie powtarza, tylko bierze z nich to, co dalej obowiązuje.

**Kierunek całej pracy: treść ma prowadzić ludzi do kreatora arkusza.** Każde zadanie w kolejce uzasadniam tym, co zmienia w drodze klienta od wyniku w Google albo odpowiedzi modelu AI do arkusza w koszyku. Jeśli niczego nie zmienia, nie trafia do kolejki.

## 1. Stan z danych

Search Console, 90 dni 18.08-15.11.2026, usługa `sc-domain:malenaklejki.pl`, odczyt API 18.11.2026:

| Grupa stron | Kliknięcia | Wyświetlenia | CTR | 28 dni: kliknięcia / wyświetlenia (poprzednie 28) |
| :--- | ---: | ---: | ---: | :--- |
| 34 wpisy | 287 | 29 412 | 1,0% | 70 / 9 658 (75 / 8 074) |
| Strona główna | 247 | 5 087 | 4,9% | 87 / 1 721 (80 / 1 602) |
| 11 landingów | 127 | 7 278 | 1,7% | 56 / 2 627 (44 / 2 101) |
| Pozostałe | 16 | 1 193 | 1,3% | 5 / 618 (8 / 430) |
| **Razem** | **677** | **42 970** | **1,6%** | **218 / 14 624 (207 / 12 207)** |

Ruch sprzedażowy (GA4 według strony wejścia i zamówienia według `landingPage`) jest w `tresci/frazy.json`, poza gitem. Wniosek z niego, bez liczb: zamówienia zaczynają się głównie na stronie głównej, a z treści - pojedynczo z landingów. Wpisy przynoszą wyświetlenia, prawie nie przynoszą arkuszy w koszyku.

## 2. Diagnoza w czterech punktach

**1. Wpisy są widoczne, ale nikt w nie nie klika.** Blog ma 68% wyświetleń serwisu i CTR 1%. Trzy przyczyny, w kolejności wagi:

- *Intencja.* Wpis o naklejkach w telefonie ma 7 764 wyświetlenia przy pozycji 7,3 i CTR 0,4%. Największe zapytanie to „jak zrobić naklejkę ze zdjęcia” (ok. 935 wyświetleń z wariantami): ludzie chcą naklejki cyfrowej w telefonie, a nasz wynik obiecuje wydruk. Ten sam mechanizm stoi za częścią ruchu na „naklejki na zdjęcia w telefonie”.
- *Długość tytułów.* Szablon wpisu dokleja „ - Blog MałeNaklejki”, więc 34 z 34 wpisów mają `title` od 69 do 98 znaków. Google ucina go albo przepisuje, a fraza ląduje w ucięciu (decyzja D1).
- *Brak odpowiedzi w pierwszym zdaniu.* 13 stron z rejestru i strona główna nie mają frazy głównej w pierwszym akapicie albo w opisie meta (skan `npm run tresci:frazy`).

**2. Google wybiera inne strony, niż zaplanowaliśmy.** Skan porównuje właściciela frazy z tym, co pokazuje Google:

| Fraza | Właściciel w bazie | Google pokazuje (wyświetlenia / pozycja) |
| :--- | :--- | :--- |
| wlepki na zamówienie | `/wlepki-na-zamowienie` (74 / 31,5) | wpis o wlepkach dla artystów (1 040 / 8,4) |
| jak zrobić naklejkę ze zdjęcia | wpis „naklejka ze zdjęcia” (53 / 9,0) | wpis o telefonie (633 / 9,0) |
| naklejki na słoiki z własnym nadrukiem | `/etykiety-na-sloiki` (41 / 18,1) | wpis o logo na słoikach (49 / 9,4) |
| naklejki z logo | `/naklejki-dla-firm` | wpis o logo na słoikach (44 / 3,5) |
| naklejki na zamówienie | strona główna (35 / 36,0) | filar „jak zamówić” (379 / 27,8) |

Wlepki to jedyny przypadek, który rozwiązuje się sam: w ostatnich 28 dniach landing wlepek urósł z 373 do 686 wyświetleń, a wpis spadł z 2 611 do 1 003 (część to sezon kibicowski). Zostawiam go bez zmian i sprawdzam w styczniu. Pozostałe mają zadania w kolejce.

**3. Landingi sprzedażowe stoją poza pierwszą stroną.** `/naklejki-foliowe` (poz. 18,3), `/naklejki-dla-firm` (21,8, 0 kliknięć na 531 wyświetleń), `/etykiety-na-sloiki` (23,7). To strony z ofertą i CTA nad linią zgięcia - każda pozycja w górę przekłada się na wejścia do kreatora bez pośrednika. Brakuje im linków z wpisów z kotwicą frazy i sekcji odpowiadających na pytania, które dziś obsługują wpisy.

**4. Treść kończy się na wpisie, nie w kreatorze.** Wpisy linkują głównie do dwóch filarów bloga, a nie do stron, które sprzedają. Od 18.11.2026 każdy wpis ma w rejestrze `filar` = strona, która odpowiada na pytanie zakupowe po lekturze (w większości landing), i link do niej w pierwszych akapitach wchodzi przy najbliższym zadaniu na wpisie.

## 3. Kierunki na trzy miesiące

Rytm Fazy 4 zostaje: **1-2 nowe strony i 3-4 realne aktualizacje miesięcznie**. Kolejność w `tresci/rejestr.json`, w panelu (MałeNaklejki → Treści) z promptem do każdej pozycji.

| # | Kierunek | Pozycje w kolejce | Dlaczego teraz |
| :--- | :--- | :--- | :--- |
| K1 | **Przechwycić kliknięcia** z wyświetleń, które już mamy: title, opis i pierwszy akapit pod prawdziwą intencję | 1, 3, 4, 5, 11, 12, 13 (+ D1) | Najtańszy zysk: zero nowych stron, efekt po 14-28 dniach |
| K2 | **Uporządkować właścicieli fraz** tam, gdzie Google wybiera inną stronę | 1, 5, 8, 10 | Dwie strony na jedną frazę dzielą siłę; decyzje zapisane w dzienniku |
| K3 | **Wyprowadzić landingi na pierwszą stronę**: sekcje pod pytania, tabele, linki z wpisów z kotwicą | 6, 7, 8 | Landing to najkrótsza droga do kreatora |
| K4 | **Konwersja do kreatora**: pierwszy ekran, tekst CTA, rozbrojone obawy | 2 (+ przy każdym zadaniu) | Strony z wejściami i bez koszyka |
| K5 | **Sezon**: święta do 5.12, Dzień Babci i Dziadka do 21.01, Walentynki od 5.01 | 2, 9, 10, 14 | Okna są stałe co roku |
| K6 | **GEO/AEO**: akapit-odpowiedź pod każdym H2, `pytania_ai` na landingach, `llms.txt` po publikacji | przy każdym zadaniu | Asystenci AI cytują fragmenty, nie strony |

Nowe strony do lutego: tylko `naklejki-walentynkowe` (okno 5-20.01.2027). Etykiety na kosmetyki i świece (B6) czekają, aż `/etykiety-na-sloiki` wyjdzie z pozycji 20+, żeby nie rozpraszać klastra. Pomysły bez danych (landing na laptopa, Z3 dla zniczy, gotowy zestaw dla graczy) wracają przy przeglądzie, gdy GSC pokaże popyt.

## 4. Decyzje Jakuba

| # | Decyzja | Rekomendacja | Co da |
| :--- | :--- | :--- | :--- |
| D1 | Szablon `title` wpisów (`src/app/blog/[slug]/page.tsx`) | Pole `seoTitle` we frontmatterze (opcjonalne) i dopisek „ - Blog MałeNaklejki” tylko wtedy, gdy całość mieści się w 60 znakach. H1 i `headline` zostają z `title`. Zmiana 3 linii, bez zmiany wyglądu stron | 34 tytuły wpisów mieszczą się w wyniku; zadania CTR na wpisach działają w pełni |
| D2 | Właściciel frazy „naklejki na zamówienie” (P4.2.16, krok 2) | Strona główna: fraza w H1 albo leadzie i w opisie meta, filar zostaje poradnikiem „jak zamówić”. Filar stoi na 27,8 od 6 tygodni po kroku 1 (19.10) - warunek kroku 2 jest spełniony | Najważniejsza fraza handlowa trafia na stronę z kreatorem |
| D3 | Data graniczna zamówień przed świętami (P4.3.0) | Bez zmian w tej rekomendacji - `blog-agent/strategia-swieta-2026.md` §12 | Bez niej hub świąteczny nie dostanie realnej aktualizacji (pozycja 9) |

Zmiany na stronie głównej i w szablonach agent robi tylko po wyraźnym „tak” (`tresci/system.md`, sekcja 7).

## 5. Mierniki

Mierniki Fazy 4 (`blog-agent/strategy.md` §7) mają termin 30.11.2026 i zostają. Dochodzą trzy, liczone przy każdym `/przeglad-tresci` z `tresci/frazy.json`:

| Miernik | 18.11.2026 (90 dni) | Kierunek |
| :--- | ---: | :--- |
| CTR wpisów | 1,0% | w górę po K1 i D1 |
| Udział landingów w kliknięciach (bez strony głównej) | 30% (127 z 430) | w górę po K3 |
| Strony z sygnałem „Google pokazuje inną stronę” | 5 | w dół po K2 |
| Opłacone zamówienia, których wizyta zaczęła się na treści z rejestru | liczone od 3.11 (poza gitem) | w górę po K4 |

Nie mierzę liczby opublikowanych stron (zasada Fazy 4). Efekty oceniam według horyzontów z `tresci/system.md`, sekcja 9.
