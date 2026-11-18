---
description: Baza fraz MałeNaklejki - zmiany Jakuba z panelu (dodaj, usuń), przypisanie fraz do stron, użycie w treściach, publikacja i odświeżenie panelu
argument-hint: "[lista zmian i uwagi z panelu]"
---

Zlecenie: `$ARGUMENTS`

Wykonaj to **w tej sesji**, jako agent `redaktor-tresci`, a nie przez podagenta. Prompt kopiuje Jakub z panelu: MałeNaklejki → „Frazy” → „Kopiuj prompt”.

## 1. Przeczytaj

1. `.claude/agents/redaktor-tresci.md`: sekcje 2, 3, 4 i 7.
2. `tresci/system.md`: sekcje 5, 7, 8, 9 i 11.
3. `tresci/slowa-kluczowe.csv`, `tresci/rejestr.json`, `tresci/frazy-zmiany.json`. Jeśli `tresci/dane-google.json` jest starszy niż 7 dni, odśwież dane (sekcja 11 systemu, „Odświeżenie danych”), potem `npm run build` i `npm run tresci:frazy`, i czytaj `tresci/frazy.json`.

## 2. Zmiany z panelu

W `~/Desktop/jdalaszynski`: `npm run panel:frazy -- --project malenaklejki --zmiany`. Lista ze skryptu jest prawdziwa; lista w promptcie to podgląd (zmiana wycofana w panelu po skopiowaniu już nie istnieje).

**Dodaj** - dla każdej frazy:

1. **Zapis:** małe litery, pojedyncze spacje, polskie znaki. Pytanie zostaje pytaniem (kanał `ai`, jeśli Jakub dopisał, że to pytanie do asystenta).
2. **Duplikat:** ta sama fraza w CSV → decyzja `juz_byla`, w wyniku strona-właściciel. Wariant istniejącej (inna odmiana albo kolejność) → nowy wiersz z tym samym właścicielem, `dodana`.
3. **Poza ofertą** (sekcja 2 pliku agenta, zasady 3-6: serwisowe, plomby, hologram, szablony do druku, nasz generator AI) → wiersz z `oferta` = `poza` albo `później`, `docelowy_url` = `brak`, decyzja `pozniej` albo `odrzucona` z jednym zdaniem dlaczego. Fraza zupełnie poza tematem naklejek → `odrzucona`, bez wiersza.
4. **Dane:** liczby frazy z `tresci/frazy.json` (`gsc`, `gscInne`, `kandydaci`). Jedno wyszukiwanie (`WebSearch`), żeby zobaczyć, jakie strony są w wynikach (sklep, poradnik, porównanie). Najwyżej 5 wyszukiwań na zlecenie; reszta z wiedzy o klastrze z adnotacją `[ZAŁOŻENIE]` w `zrodlo`.
5. **Właściciel** (sekcja 11 systemu, kanibalizacja): strona, która już odpowiada na tę intencję. Gdy GSC pokazuje frazę na naszej stronie, zaczynasz od niej. Jeśli żadna nie odpowiada, a intencję da się nazwać zdaniem `roznica`: nowa pozycja `w_kolejce` w rejestrze (komplet pól z sekcji 2 systemu) i wiersz z jej adresem. Bez zdania `roznica` - właściciel to najbliższa strona.
6. **Wiersz CSV:** wszystkie kolumny, `zrodlo` = `Jakub (panel)` plus to, co sprawdziłeś, `data_odczytu` = dziś, wolumen i CPC `brak danych`, chyba że Jakub podał liczbę ze źródłem. Końce linii CRLF.
7. **Rola:** fraza z realnym popytem albo osobnym pytaniem idzie do `frazy` właściciela w rejestrze (wspierająca, najwyżej 6; przy pełnej liście zamień najsłabszą albo zostaw jako wariant). Pozostałe zostają wariantami.

**Usuń** - dla każdej frazy:

- Nie ma jej w bazie → `brak_w_bazie`.
- Wariant albo pytanie → usuń wiersz, `usunieta`.
- Wspierająca → usuń z `frazy` właściciela i z CSV, `usunieta`. Tekst strony zostaje.
- Główna pozycji w kolejce → nowa główna z klastra, popraw brief, `usunieta`.
- Główna opublikowanej strony → **nie usuwaj**. Decyzja `zostaje`, a w raporcie „Do Twojej decyzji”: która fraza ją zastąpi i jaki będzie nowy title i H1.

## 3. Użyj fraz w treściach

1. `npm run build`, potem `npm run tresci:frazy`.
2. Nowa wspierająca na **opublikowanej** stronie: wpleć ją w H2, H3 albo pytanie FAQ według sekcji 5 i 11 systemu - tylko tam, gdzie odpowiada na prawdziwe pytanie. Nowa wspierająca w **kolejce**: wystarczy rejestr, trafi do promptu `/tresc`.
3. **Braki** stron, które ruszasz, uzupełnij w tej samej turze. Prompt bez zmian (sam `/frazy`) oznacza: uzupełnij braki opublikowanych stron z rejestru, zaczynając od stron z największą liczbą wyświetleń, a kolizje rozwiąż zmianą tytułu strony, która nie jest właścicielem frazy. Najwyżej 5 stron na zlecenie; reszta w raporcie jako następny krok. Strona z polem `zadanie` - zrób zadanie razem z brakami albo zostaw ją zadaniu.
4. Strona główna, kreator i inne strony spoza rejestru zmieniają się tylko za zgodą: ich braki i kolizje idą do „Do Twojej decyzji” z gotową propozycją title i H1.
5. Zmiana title, opisu, H1 albo nowa sekcja H2 lub FAQ to istotna aktualizacja: daty i zgłoszenia według sekcji 8 systemu.

## 4. Zapisz i sprawdź

1. `tresci/frazy-zmiany.json`: każda zmiana z panelu jako wpis `{ id, typ, fraza, uwaga?, zgloszono, obsluzono, decyzja, wynik }` (id i daty ze skryptu, `wynik` jednym zdaniem: strona, rola i gdzie fraza stoi).
2. `npm run build`, `npm run tresci:frazy -- --sprawdz <ścieżki zmienionych stron>`, `npm run tresci:sprawdz`, `npx tsc --noEmit`.
3. Strony zmienione w tekście: podgląd przy 375 i 1280 px.

## 5. Opublikuj

1. Commit tylko własnych plików (CSV, `frazy-zmiany.json`, rejestr, strony, dziennik, `public/llms.txt` po `node scripts/generuj-llms-txt.mjs`), `git log origin/main..HEAD`, push na `main` bez pytania, jeśli zmiana mieści się w sekcji 7 systemu.
2. Zgłoszenia zmienionych stron: `npm run tresci:zglos -- --czekaj [--gsc] <ścieżki>` według sekcji 8 systemu.
3. Po wdrożeniu: `npm run build` i `npm run tresci:frazy` (baza z nowymi stronami), potem w `~/Desktop/jdalaszynski`: `npm run panel:frazy -- --project malenaklejki` (baza i zdjęcie obsłużonych zmian) i `npm run panel:tresci -- --project malenaklejki`.
4. Wpis w `tresci/dziennik.md`: ile zmian, decyzje, zmienione strony.

## 6. Raport

Układ z sekcji 9 pliku agenta. Na początku tabela: fraza, decyzja, strona i rola. Potem zmienione strony z adresami i stanem zgłoszeń, liczba braków przed i po, „Do Twojej decyzji” (główne frazy żywych stron, strony spoza rejestru).
