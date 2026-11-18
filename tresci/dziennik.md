# Dziennik treści MałeNaklejki

Prowadzi agent `redaktor-tresci`. Najnowsze wpisy na górze. Każdy wpis: data, co się zmieniło (adresy), dlaczego (liczby z oknem), zgłoszenia, kiedy ocenić. Starsza historia: `blog-agent/plan.md`, `landing-agent/plan.md`, `blog-agent/strategy.md`.

## 2026-11-18 - start systemu treści

**Co powstało:** agent `redaktor-tresci` i komendy `/tresc`, `/frazy`, `/przeglad-tresci`; rejestr `tresci/rejestr.json` (11 landingów, 34 wpisy, 2 nowe wpisy w kolejce, 13 zadań poprawy); baza `tresci/slowa-kluczowe.csv` (504 frazy: z rejestru, `blog-agent/keywords.md`, `landing-agent/keywords.md`, `landing-agent/keywords-znicze.md` i zapytań GSC z co najmniej 15 wyświetleniami w 90 dni); skrypty `tresci:sprawdz`, `tresci:frazy`, `tresci:zamowienia`, `tresci:zglos`; zakładki „Treści” i „Frazy” w panelu (MałeNaklejki).

**Dane:** GSC 18.08-15.11.2026 przez API panelu (677 kliknięć, 42 970 wyświetleń, 97 stron, 593 zapytania), GA4 90 dni według strony wejścia, zamówienia według `landingPage` od 3.11.2026.

**Decyzje przy zakładaniu:**

- Właściciele fraz: fraza główna i wspierające każdej strony wybrane z zapytań GSC tej strony i dotychczasowych planów; frazy z plików `keywords.md` bez danych przypisane do strony, na której Google je dziś pokazuje, a bez danych - do strony, której słowa zawierają całą frazę; reszta „bez strony”.
- Strona główna: fraza główna „naklejki z własnym nadrukiem” (jest w jej title i H1), wspierające „małe naklejki”, „naklejki na zamówienie”, „personalizowane naklejki”, „naklejki online”. Właściciel „naklejki na zamówienie” to decyzja Jakuba D2 (`tresci/strategia.md`).
- `filar` wpisu wskazuje stronę, która sprzedaje to, o czym wpis mówi (w większości landing), zamiast dwóch filarów bloga. Linki w tekście dochodzą przy najbliższym zadaniu na wpisie.
- Frazy zakazane (serwisowe, plomby), szablony do druku, hologram, brokat, mat i tkaniny mają w bazie `oferta` = `poza`; frazy o naszym generatorze AI - `później` (HOLD).
- Liczby GA4 i zamówień według strony trzymamy poza gitem (`tresci/dane-*.json`, `tresci/frazy.json` w `.gitignore`).
- Otwarte pozycje z `blog-agent/plan.md` przeniesione: P4.3.4 → zadanie `naklejki-dla-firm`, P4.3.5 → `fotonaklejki` i `naklejka-ze-zdjecia`, P4.3.6 → `etykiety-na-prezenty`, P4.3.7 → `naklejki-walentynkowe` (okno 5-20.01.2027), B6 → `etykiety-na-kosmetyki-i-swiece` (wstrzymane). P4.2.16 krok 2 → decyzja D2. Od dziś kolejka żyje w rejestrze, a `plan.md` zostaje historią.

**Kiedy ocenić:** pierwszy `/przeglad-tresci` po wykonaniu 3-4 zadań z kolejki, najpóźniej 2026-12-16 (28 dni).
