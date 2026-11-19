# Dziennik treści MałeNaklejki

Prowadzi agent `redaktor-tresci`. Najnowsze wpisy na górze. Każdy wpis: data, co się zmieniło (adresy), dlaczego (liczby z oknem), zgłoszenia, kiedy ocenić. Starsza historia: `blog-agent/plan.md`, `landing-agent/plan.md`, `blog-agent/strategy.md`.

## 2026-11-19 - /tresc die-cut-i-kiss-cut: title i pierwszy akapit

**Powód:** GSC 90 dni 18.08-15.11.2026: 814 wyświetleń, 8 kliknięć (CTR 1%) przy poz. 7; „wykroje die-cut i kiss-cut” 183 wyświetlenia na poz. 6,6 i 0 kliknięć, „kiss cut” 51 na poz. 7. Dane z 18.11 - powód aktualny.

**Zmiana** (`/blog/co-to-jest-die-cut-i-kiss-cut-roznice-w-wyleciach-naklejek-reklamowych`, P1, `zmieniono` i `updated` = 2026-11-19):

- title i H1: „Die-cut i kiss-cut - różnica wykrojów” (37 znaków, 57 z dopiskiem szablonu; było 73), bez ceny w tytule - cena została w opisie.
- opis meta (150 znaków): od frazy głównej, różnica w jednym zdaniu, cena 59,00 zł brutto za A4.
- pierwszy akapit od nowa: fraza główna w pierwszym zdaniu, definicja każdego wykroju, kiedy który wybrać, link do `/naklejki-die-cut` kotwicą „naklejki cięte po obrysie”. Drugi akapit: „die cut sticker”, cena, link do kreatora i do wpisu o drukowaniu online.
- H2 z tabelą: „Wykroje die-cut i kiss-cut - najważniejsze różnice w tabeli” (fraza wspierająca w H2, nie tylko w title).
- Skan: brak „wstep” dla frazy głównej usunięty, strona bez braków.

**Zgłoszenia:** commit 3ed2411 na produkcji 19.11, IndexNow 200 OK 19.11. GSC: limit próśb wyczerpany 19.11 (wpis wyżej), więc **GSC do ponowienia od 2026-11-20** (zmiana title, prośba potrzebna).

**Kiedy ocenić:** title i opis - pierwszy sygnał od 2026-12-03 (14 dni), pełny odczyt CTR od 2026-12-17 (28 dni), okna 28 dni z tym samym dniem tygodnia.

## 2026-11-19 - /tresc naklejki-na-zeszyty: opis meta z konkretem

**Co się zmieniło:** `/blog/personalizowane-naklejki-na-zeszyty-i-do-przedszkola` (P0) - nowy opis meta (143 znaki): „Naklejki do podpisania zeszytu z imieniem i nazwiskiem dziecka: ok. 30 sztuk na arkuszu A4, od 1 arkusza za 59 zł brutto. Także do przedszkola.” (ok. 30 sztuk według tabeli cen we wpisie: 30 naklejek ok. 3 x 3 cm; „Imienne naklejki na przybory” 24-30 szt. w `jaki-rozmiar-naklejki-wybrac`). Title i H1 bez zmian: „Naklejki do podpisania zeszytu z imieniem i nazwiskiem” (54 znaki) ma już frazę główną na początku i „naklejki na zeszyty z imieniem i nazwiskiem”. Do 74 znaków wydłuża go tylko dopisek szablonu „ - Blog MałeNaklejki”, więc title do 60 znaków zależy od decyzji D1 (szablon wpisu, za zgodą Jakuba) - przygotowana, pokazana w raporcie. Zmiana tylko opisu: `zmieniono` i `updated` bez zmian (sekcja 8).

**Zgłoszenia:** commit 5d5178a na produkcji 19.11, IndexNow 200 OK 19.11. GSC: limit dzienny wyczerpany 19.11 - **GSC do ponowienia od 2026-11-20** (zmiana opisu, więc prośba jest potrzebna).

**Kiedy ocenić:** CTR - pierwszy sygnał od 2026-12-03, pełny odczyt od 2026-12-17 (okna 28 dni, ten sam dzień tygodnia; uwaga na sezon - drugi semestr i ferie).

**Dlaczego:** GSC 90 dni 18.08-15.11.2026: 2887 wyświetleń, 12 kliknięć (CTR 0,4%) przy poz. 8,2; „naklejki na zeszyty z imieniem i nazwiskiem” 137 wyświetleń (poz. 7,3), „naklejki do podpisania zeszytu” 151 (poz. 9,1), oba bez kliknięć. Stary opis nie mówił, ile naklejek jest na arkuszu ani że zamówienie jest od 1 arkusza.

## 2026-11-19 - /tresc fotonaklejki: pierwszy ekran prowadzi od zdjęcia do kreatora

**Co się zmieniło:** `/fotonaklejki` (P0, `zmieniono`, `lastModified` w sitemapie i `dateModified` = 2026-11-19; title, opis meta i H1 bez zmian). Pierwszy ekran przy 375 px: H1, jedno zdanie odpowiedzi („Fotonaklejki zamówisz w MałeNaklejki bez wycinania tła samemu…”, 59,00 zł brutto za arkusz A4), przykład zdjęcie → naklejka (schemat w HTML/CSS z ikoną, bez grafik AI), przycisk „Zrób fotonaklejki” i trzy rozbrojone obawy (tło usuwa kreator przyciskiem „Usuń tło”, 59,00 zł za cały arkusz, różne zdjęcia na jednym arkuszu) - wszystko nad linią zgięcia (przycisk ok. 530 px, wcześniej ok. 660 px przy 75-wyrazowym akapicie). Z pierwszego ekranu wyszły odznaka i drugi przycisk do wpisu o telefonie; linki do obu wpisów przeniesione niżej (sekcja „Czym są”, sekcja „Jak zrobić”). Hero ma `id="first-article-banner"`, więc po przewinięciu pokazuje się przyklejony przycisk do kreatora (na tej stronie nie działał, bo znacznika brakowało). Przyciski z obawami także po tabeli specyfikacji i w nowej sekcji. Nowa sekcja H2 „Fotonaklejki na prezent - święta i Dzień Babci i Dziadka” (P4.3.5 z `blog-agent/plan.md`): akapit odpowiedzi ok. 55 słów, trzy pomysły w H3 (w tym „Naklejka ze zdjęcia wnuków…”, „Naklejki z własnego zdjęcia na opakowanie prezentu” z linkiem do `/naklejki-swiateczne`), „zamów z zapasem” bez daty granicznej, uwaga o zmywarce. FAQ: +3 pytania (pytanie AI „Gdzie zamówić naklejki z własnego zdjęcia wycięte po obrysie, bez usuwania tła samemu?”, Dzień Babci i Dziadka, fotonaklejki dla kilku osób na jednym arkuszu) - 13 pytań, `FAQPage` z tej samej tablicy.

**Poprawki według `facts.md`:** „kreator automatycznie usuwa tło” → przycisk „Usuń tło”; „druk 300 DPI” (kafel, zaleta, specyfikacja, opis `Product`) → 300 DPI jako zalecenie dla pliku, kafel „4-5 dni produkcji”; bez „od 12 Mpx”; WEBP w formatach plików.

**Dlaczego:** GA4 90 dni: wejścia na tę stronę bez dodania do koszyka; zamówień zaczętych tu od 3.11 brak (liczby w `tresci/frazy.json`, poza gitem). GSC 90 dni 18.08-15.11.2026: 1871 wyświetleń, 25 kliknięć, poz. 8,8, CTR 1,3%. Rozpoznanie 19.11.2026 (WebSearch, wyniki anglojęzyczne): w czołówce edytory i serwisy zagraniczne (prostokątne wydruki na papierze albo polipropylenie), bez ceny za arkusz i bez usuwania tła po stronie klienta.

**Baza fraz:** pytanie AI strony ma teraz miejsce (nagłówki, FAQ, tekst). Główna i obie wspierające bez braków (`npm run tresci:frazy -- --sprawdz /fotonaklejki`).

**Zgłoszenia:** commit 018461e - build na Vercelu padł na błędzie fontów Google (`next/font/google`, ten sam co lokalnie przy pierwszej próbie i 5.10), pusty commit 16f5911 wdrożył stronę 19.11 (sprawdzona na produkcji). IndexNow 200 OK 19.11 (ponowione po wdrożeniu). GSC: „Przekroczono limit” 19.11 - **GSC do ponowienia od 2026-11-20** (`/fotonaklejki`, P0 z nową sekcją; adres jest w indeksie).

**Kiedy ocenić:** proporcja wejść do dodań do koszyka (GA4) i zamówienia ze strony wejścia od 2026-12-17 (28 dni), sekcja prezentowa - wyświetlenia na frazy prezentowe po Dniu Babci i Dziadka (od 2027-01-25). Pozycja strony 60-90 dni (od 2027-01-18).

## 2026-11-19 - /tresc naklejki-w-telefonie: odpowiedź na „jak zrobić naklejkę ze zdjęcia”

**Co się zmieniło:** `/blog/jak-zrobic-wlasne-naklejki-w-telefonie-proste-aplikacje-i-triki` (P0, `zmieniono` i `updated` = 2026-11-19). Nowy title i H1 „Jak zrobić naklejki w telefonie ze zdjęcia: iPhone i Android” (60 znaków + dopisek szablonu), nowy opis meta (147 znaków, fraza główna w pierwszym zdaniu - brak z bazy zamknięty). Pierwszy akapit odpowiada wprost: iPhone (Zdjęcia, przytrzymaj obiekt, „Dodaj naklejkę”), Samsung (Galeria), WhatsApp (panel naklejek); drugi akapit z linkiem do filaru kotwicą „fotonaklejki ze zdjęcia”. Nowe H2 „Jak zrobić naklejkę ze zdjęcia na iPhonie, Androidzie i w WhatsAppie?” z H3 dla każdego systemu i H2-most „Chcesz ją mieć na laptopie albo bidonie? Wydrukuj naklejkę z telefonu” z krokami w kreatorze i przyciskiem w środku. FAQ: nowe pytanie AI (wydruk ze zdjęcia z telefonu na folii), „Ile trwa produkcja naklejek?” zamiast „wysyłki”. Poprawki według `facts.md`: tło usuwa się przyciskiem „Usuń tło” (było „automatycznie po wgraniu”), bez „aparatu od 12 Mpx”, „mniej niż 10 minut” i „druku w 300 DPI” (300 DPI to zalecenie dla pliku).

**Dlaczego:** GSC 90 dni 18.08-15.11.2026: 7764 wyświetleń, CTR 0,4% przy poz. 7,3; „jak zrobić naklejkę ze zdjęcia” z wariantami ok. 935 wyświetleń i 2 kliknięcia na tym wpisie. Pytający chcą naklejki cyfrowej, a stary opis obiecywał wydruk. Rozpoznanie 19.11.2026 (WebSearch): iOS 17+ „Dodaj naklejkę” w Zdjęciach, Galeria Samsunga wycina obiekt przytrzymaniem, WhatsApp tworzy naklejki ze zdjęcia (na Androidzie od 2026 w kolejnych wersjach).

**Baza fraz:** „jak zrobić naklejkę ze zdjęcia” przeniesiona z `naklejka-ze-zdjecia` na ten wpis jako czwarta wspierająca (Google i tak pokazywał tu tę frazę: ok. 935 wyświetleń wobec 53 na poprzednim właścicielu; przeniesienie na polecenie Jakuba w prompcie). Wpis `naklejka-ze-zdjecia` ma w bazie nową główną „naklejki ze zdjęciem na prezent” (dotąd bez strony). Jego title i H1 się nie zmieniły - to robi jego zadanie (kolejność 10, teza zaktualizowana). Do tego czasu ma 1 brak w bazie. Braki w bazie: 30 → 29.

**Zgłoszenia:** commit eeeaae6 na produkcji 19.11, IndexNow 200 OK 19.11. GSC: „Przekroczono limit” 19.11 - **GSC do ponowienia od 2026-11-20** (`/blog/jak-zrobic-wlasne-naklejki-w-telefonie-proste-aplikacje-i-triki`; zmiana title, więc prośba jest potrzebna).

**Kiedy ocenić:** title i opis - pierwszy sygnał od 2026-12-03 (14 dni), pełny odczyt CTR od 2026-12-17 (28 dni), okna 28 dni z tym samym dniem tygodnia.

## 2026-11-18 - /frazy: 5 fraz z panelu

**Zmiany z panelu:** 5 dodanych, 0 usuniętych, wszystkie `dodana` (`tresci/frazy-zmiany.json`). Rozpoznanie: wyszukiwania 18.11.2026 (narzędzie WebSearch, nie google.pl - przybliżenie wyników).

- „naklejka logo firmy” - wariant na `/blog/naklejka-z-logo-firmy-jak-skutecznie-brandowac-swoje-produkty` (Google pokazuje tę stronę, poz. 20,6).
- „naklejki ze zdjęcia” - wariant wspierającej „naklejka ze zdjęcia” na `/fotonaklejki` (poz. 24). W wynikach przeważają edytory naklejek cyfrowych.
- „zamów naklejki online” - wariant strony głównej `/` (transakcyjna, poz. 20,3). Strona główna bez zmian (tylko za zgodą).
- „zamówienie naklejek” - wariant na `/blog/jak-zamowic-idealne-naklejki-na-zamowienie-z-wlasnym-nadrukiem`, właściciela „naklejki zamówienie”. GSC 90 dni: 7 wyświetleń na wpisie o wlepkach (poz. 3,3) i 4 na właścicielu (poz. 9,8). Intencja to ogólne zamawianie, więc właściciel zostaje; jeśli przy przeglądzie wpis o wlepkach dalej będzie wyżej, rozważyć przeniesienie.
- „jak zrobić vlepki kibicowskie” - szósta wspierająca `vlepki-kibicowskie`. Google pokazuje dziś wpis o wlepkach dla artystów (poz. 9,2, 10 wyświetleń), ale pytanie dotyczy niszy kibicowskiej, którą ma ten wpis. W wynikach wyszukiwania nie ma poradnika o vlepkach kibicowskich.

**Zmieniona strona:** `/blog/vlepki-kibicowskie-i-klubowe-wlepy-dla-kibicow-klubow-i-ekip` (P1, `zmieniono` i `updated` = 2026-11-18). Nowa sekcja H2 „Jak zrobić vlepki kibicowskie?” z odpowiedzią 40-60 słów na początku, wskazówkami do grafiki (generatory AI, potem Canva; brak edytora tekstu w kreatorze; „Usuń tło”) i uczciwym porównaniem z domowym wydrukiem. Braki strony uzupełnione: „vlepki kibicowskie” w pierwszym zdaniu, „naklejki kibicowskie” w H2. Przy okazji: FAQ o kilku wzorach na arkuszu mówiło, że trzeba je złożyć w jeden plik - poprawione według `facts.md` (kolejne grafiki wgrywa się osobno); „Nie musi” → „Nie muszą”.

**Braki w bazie:** 32 → 30 (na 24 → 23 stronach).

**Zgłoszenia:** commit 808636e na produkcji 18.11, IndexNow 200 OK 18.11, GSC „Poproś o zindeksowanie” 19.11 (adres był w indeksie).

**Kiedy ocenić:** pozycja wpisu na „jak zrobić vlepki kibicowskie” i „naklejki kibicowskie” po 60-90 dniach (od 2027-01-17).

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
