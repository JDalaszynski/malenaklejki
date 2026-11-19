# Dziennik treści MałeNaklejki

Prowadzi agent `redaktor-tresci`. Najnowsze wpisy na górze. Każdy wpis: data, co się zmieniło (adresy), dlaczego (liczby z oknem), zgłoszenia, kiedy ocenić. Starsza historia: `blog-agent/plan.md`, `landing-agent/plan.md`, `blog-agent/strategy.md`.





## 2026-11-19 - /tresc wzory-na-naklejki: title z obiema frazami, odpowiedź z katalogiem

**Co się zmieniło:** `/blog/fajne-wzory-i-pomysly-na-naklejki-inspiracje-wg-zastosowania` (P2, `zmieniono` i `updated` = 2026-11-19). Title i H1 „Fajne wzory na naklejki - gotowe zestawy za 59 zł” (od 19.10) → „Wzory i pomysły na naklejki - gotowe zestawy za 59 zł” (53 znaki + dopisek szablonu; fraza główna na początku, „pomysły na naklejki” w title i H1, bez kolizji z frazami `/gotowe-zestawy`). Nowy opis meta (149 znaków) zaczyna się od frazy głównej. Pierwszy akapit (58 słów) odpowiada wprost: wzory z katalogu [gotowe zestawy naklejek](/gotowe-zestawy) (arkusz A4 za 59,00 zł brutto, zamówisz od razu albo zmienisz w kreatorze) albo własny pomysł według zastosowania; zamiast wstępu „Decyzja o zamówieniu…”. H2 „Skąd wziąć darmowe wzory na naklejki do druku? Rewolucja AI” → „Skąd wziąć własne wzory na naklejki? Generatory AI” (decyzja 4: bez darmowych szablonów do druku). Katalog publiczny (200 na produkcji 19.11), więc link zgodny z decyzją 6.

**Dlaczego:** GSC 90 dni 18.08-15.11.2026: 239 wyświetleń, 1 kliknięcie, CTR 0,4% przy poz. 7,7 (typowo ok. 2,5%); „wzory na naklejki” 12 wyświetleń na poz. 8,6, „pomysły na naklejki” 9 na poz. 8 (tej drugiej nie było w title).

**Zgłoszenia:** commit 274cc0a na produkcji 19.11, IndexNow 200 OK 19.11. **GSC do ponowienia od 2026-11-20** (nowy title i opis; limit 19.11 wyczerpany).

**Skan:** bez braków i kolizji.

**Kiedy ocenić:** title i opis - sygnał od 2026-12-03, odczyt CTR od 2026-12-17 (28 dni).

## 2026-11-19 - /tresc gdzie-zamowic-naklejki: title i opis z odpowiedzią

**Co się zmieniło:** `/blog/gdzie-zamowic-naklejki-w-malym-nakladzie-porownanie` (P1, `zmieniono` i `updated` = 2026-11-19). Title i H1 „Gdzie zamówić naklejki w małym nakładzie? Porównanie opcji” (od 25.08) → „Gdzie zamówić naklejki? Od 1 arkusza za 59 zł, bez minimum” (58 znaków + dopisek szablonu, bez nazw konkurentów). Opis meta (152 znaki) z odpowiedzią: od 1 arkusza A4 za 59,00 zł brutto, bez minimum i wykrojnika; wcześniej „Porównujemy…”. Pierwsze zdanie odpowiada zamiast wyliczać cztery kanały: „Kilkanaście naklejek najprościej zamówić w polskim kreatorze online…” (cena, bez wykrojnika, produkcja 4-5 dni robocze), kanały w drugim zdaniu. Pierwsze pytanie FAQ zamienione na pytanie AI „Gdzie najlepiej zamówić kilkanaście naklejek z własnym nadrukiem w Polsce?” (odpowiedź bez zmian). Wspierająca „gdzie zamówić naklejki w małym nakładzie” wyszła z title, zostaje w H2 i opisie.

**Dlaczego:** GSC 90 dni 18.08-15.11.2026: 168 wyświetleń, 0 kliknięć przy poz. 7,8 (typowo ok. 2,5%). Wejścia z tego wpisu częściej niż z innych wpisów kończą się koszykiem (GA4, liczby w `tresci/frazy.json`, poza gitem) - problem jest w wyniku Google, nie na stronie. Stary title i opis obiecywały listę („porównanie opcji”), nowe podają odpowiedź i cenę.

**Zgłoszenia:** commit 6c323dc na produkcji 19.11, IndexNow 200 OK 19.11. **GSC do ponowienia od 2026-11-20** (nowy title i opis, prośba potrzebna; limit 19.11 wyczerpany).

**Skan:** bez braków i kolizji.

**Kiedy ocenić:** title i opis - sygnał od 2026-12-03, odczyt CTR od 2026-12-17 (28 dni).

## 2026-11-19 - /tresc drukowanie-naklejek-online: odpowiedź o pliku w pierwszym akapicie

**Co się zmieniło:** `/blog/drukowanie-naklejek-online-na-co-zwrocic-uwage-przed-wysylka-projektu` (P1, `zmieniono` i `updated` = 2026-11-19). Title i H1 bez zmian: „Drukowanie naklejek online - jak przygotować plik 300 DPI” ma 57 znaków z frazą na początku, a do 60 z dopiskiem szablonu nie zejdzie bez decyzji D1. Nowy pierwszy akapit (58 słów) zaczyna się od frazy głównej i odpowiada wprost: 300 DPI w docelowym rozmiarze, PNG z przezroczystym tłem do cięcia po obrysie, JPG do zdjęć, PDF do drobnego tekstu, tło usuwa przycisk „Usuń tło”, 59,00 zł brutto za arkusz A4. Drugi akapit: co jest dalej i link do kreatora kotwicą „Otwórz kreator arkusza” (zamiast „Spersonalizuj naklejkę”; bez „Dobrze trafiłeś”). Nowy opis meta (152 znaki, wcześniej „Poznaj 5 błędów…”). H2 „Rozdzielczość pliku - dlaczego naklejki potrzebują 300 DPI?” i „Druk naklejek online - 5 błędów, przez które wydruk wychodzi rozmazany” (wspierająca „druk naklejek online” była tylko w kotwicach). FAQ: pytanie AI na początku (55 słów) - 9 pytań. „Kreator automatycznie usunie tło” → przycisk „Usuń tło” (dwa miejsca, `facts.md`).

**Dlaczego:** GSC 90 dni 18.08-15.11.2026: 451 wyświetleń, 2 kliknięcia, CTR 0,4% przy poz. 10,6 (typowo ok. 1,2%); „drukowanie naklejek online” 39 wyświetleń na poz. 15,7. Skan: brak frazy głównej w pierwszym akapicie, „druk naklejek online” bez H2/H3/FAQ. Title ostatnio zmieniany przed 25.10, więc nie ruszam go drugi raz na tych samych danych; wynik i opis zmienia nowy opis meta i pierwsze zdanie.

**Zgłoszenia:** commit 394cac1 na produkcji 19.11, IndexNow 200 OK 19.11. **GSC do ponowienia od 2026-11-20** (P1, istotna aktualizacja i nowy opis; limit 19.11 wyczerpany).

**Skan:** frazy główna i wspierające na miejscach, bez braków i kolizji. Zostaje sygnał CTR (do odczytu).

**Kiedy ocenić:** opis i pierwszy akapit - sygnał od 2026-12-03, odczyt CTR od 2026-12-17 (28 dni, porównanie z 28 dniami przed 19.11). Jeśli CTR nie wzrośnie, następny krok to title (po decyzji D1 albo nowa formuła).

## 2026-11-19 - /tresc naklejka-ze-zdjecia: wpis o przygotowaniu zdjęcia na prezent

**Co się zmieniło:** `/blog/naklejka-ze-zdjecia-jak-przeniesc-wspomnienia-na-naklejke` (P0, `zmieniono` i `updated` = 2026-11-19). Nowy title i H1 „Naklejki ze zdjęciem na prezent - jak przygotować zdjęcie” (57 znaków + dopisek szablonu), bez frazy wpisu o telefonie. Nowy opis meta (145 znaków) i pierwszy akapit (56 słów) z nową główną, ceną i linkiem do filaru kotwicą „fotonaklejki ze zdjęcia”; drugi akapit odsyła osoby, które chcą naklejki w czacie, do wpisu o telefonie (kotwica „jak zrobić naklejki w telefonie”). Nowa sekcja H2 „Naklejki ze zdjęciem na prezent - święta i Dzień Babci i Dziadka” (P4.3.5): odpowiedź 54 słowa (kilka zdjęć dla kilku osób na jednym arkuszu, 59,00 zł, dostawa 19,99 zł raz), tabela okazja / zdjęcie / gdzie nakleić, H3 o rozdzieleniu arkusza między prezenty („Wypełnij arkusz”), terminie (4-5 dni robocze, „z zapasem”, bez daty granicznej) i o tym, kiedy to zły prezent (zmywarka, tkanina, jedna mała naklejka). H2 „Jak zrobić naklejkę ze zdjęcia krok po kroku?” → „Zrób naklejkę ze zdjęcia w kreatorze krok po kroku”, przycisk do kreatora po kroku 4. FAQ: pytanie AI (47 słów), „Czy mogę dodać do zdjęcia imię albo datę?” (brak edytora tekstu) - 7 pytań. Poprawki według `facts.md` i kodu: tło usuwa przycisk „Usuń tło” (było „algorytmy AI automatycznie”), kreator ma kadrowanie, a nie ręczną korektę linii cięcia (`StickerEditModal.tsx`), bez „mniej niż 5 minut”, „od 12 Mpx”, „do 19 cm” i „Twój projekt”; „nie do zmywarki” przy kubkach. Słowa: 946 → 1308.

**Sąsiad:** `/fotonaklejki` - link do wpisu miał kotwicę „Zobacz, jak zrobić naklejkę ze zdjęcia krok po kroku” (fraza wpisu o telefonie), teraz „Zobacz, jak przygotować zdjęcie na naklejkę krok po kroku”. Bez zmiany `zmieniono` landingu. Kotwica wpisu w rejestrze: „naklejki ze zdjęciem na prezent”.

**Dlaczego:** GSC 90 dni 18.08-15.11.2026: 787 wyświetleń, 5 kliknięć, poz. 9,1, CTR 0,6%. Google na „jak zrobić naklejkę ze zdjęcia” pokazywał wpis o telefonie (ok. 935 wyświetleń wobec 53 tutaj), fraza przeszła do niego 19.11. Wariant główny: ani „naklejki ze zdjęciem na prezent”, ani „naklejka ze zdjęcia na prezent” nie mają wyświetleń w GSC (90 dni do 15.11), więc baza bez zmian; title w liczbie mnogiej trafia też w „naklejka ze zdjęcia” (76 wyświetleń na tym wpisie, odmiana). Rozpoznanie 19.11.2026 (WebSearch „naklejki ze zdjęciem na prezent”): marketplace'y z ceną za sztukę (Shein, Etsy, Kaufland) i edytory bez wydruku (Canva, VistaCreate) - nikt nie pokazuje kilku zdjęć dla kilku osób na jednym arkuszu za jedną cenę.

**Zgłoszenia:** commit b1080b3 na produkcji 19.11, IndexNow 200 OK 19.11. **GSC do ponowienia od 2026-11-20** (P0, istotna aktualizacja i nowy title; limit 19.11 wyczerpany).

**Skan:** wszystkie frazy strony na miejscach, bez braków i kolizji. Zostaje sygnał „Google pokazuje inną stronę” na „zrób naklejkę ze zdjęcia” (`/fotonaklejki` 20 wyświetleń wobec 11 tutaj) - do decyzji przy przeglądzie.

**Kiedy ocenić:** title i opis - sygnał od 2026-12-03, odczyt od 2026-12-17 (28 dni); pozycja na frazy prezentowe po Dniu Babci i Dziadka (od 2027-01-25), pozycja strony 60-90 dni (od 2027-01-18).

## 2026-11-19 - /tresc etykiety-na-prezenty: zadanie P4.3.6 przesunięte na 1-5.12

**Co się zmieniło:** nic na stronie `/blog/naklejki-swiateczne-i-etykiety-na-prezenty` (`zmieniono` zostaje 2026-11-02, bez zgłoszeń). W rejestrze zadanie dostało `od` = 2026-12-01 i tezę na ten termin: z datą graniczną albo zdjęciami - realna aktualizacja; bez nich tylko link do `/naklejki-swiateczne` kotwicą „naklejki świąteczne” w sekcji „Skąd wziąć świąteczną grafikę na naklejki” i zamknięcie zadania.

**Dlaczego:** warunek zadania niespełniony. `blog-agent/facts.md` nadal wymaga osobnej zgody na datę graniczną przed świętami (P4.3.0, decyzja D3 w `tresci/strategia.md`), a `public/blog/naklejki-swiateczne-i-etykiety-na-prezenty/` jest pusty. Wpis już linkuje landing w pierwszym akapicie (kotwica „gotowe zestawy naklejek świątecznych”), więc drugi link sam w sobie nie uzasadnia zmiany wbrew tezie. GSC 90 dni 18.08-15.11.2026: 14 wyświetleń, 1 kliknięcie, poz. 8.

**Kiedy wrócić:** `/tresc etykiety-na-prezenty` od 2026-12-01. Data graniczna potrzebna do 1.12 (rekomendacja: pon 14.12.2026, `blog-agent/strategia-swieta-2026.md` §12).

## 2026-11-19 - /tresc etykiety-na-sloiki: frazy o słoikach do landingu

**Powód:** GSC 90 dni 18.08-15.11.2026: 809 wyświetleń, 7 kliknięć przy poz. 23,7. „naklejki na słoiki z własnym nadrukiem”: wpis o logo na słoikach poz. 9,4 (49 wyśw.), landing poz. 18,1 (41 wyśw.); „etykiety na słoiki” 52 wyświetlenia na poz. 35,6. Braki w bazie: „naklejki na słoiki z własnym nadrukiem” i „etykiety na słoiki drukarnia” bez miejsca w H2/H3/FAQ landingu.

**Zmiana na landingu** (`/etykiety-na-sloiki`, P1, `zmieniono`, `dateModified` i `lastModified` w sitemapie = 2026-11-19; title i H1 bez zmian):

- nowa sekcja H2 „Naklejki na słoiki z własnym nadrukiem - gdzie zamówić małą ilość” z odpowiedzią 47 słów (pytanie AI: od 1 arkusza A4, 59,00 zł brutto, folia wodoodporna, 4-5 dni roboczych) i H3 „Etykiety na słoiki: drukarnia czy wydruk w domu?” (papier w suchej szafce wystarczy, w lodówce i przy myciu rozmaka; bez zmywarki); przycisk „Zamów etykiety na słoiki”. Bez darmowych szablonów do druku (decyzja 4), choć w GSC są zapytania „do druku/word”.
- Skan: oba braki usunięte, strona bez braków.

**Wpisy (linki kotwicą „etykiety na słoiki”, bez zmiany `zmieniono`):**

- logo na słoikach: H2 „Estetyczne naklejki na słoiki z własnym nadrukiem…” → „Słoiki z logo - kształt i rozmiar naklejki” (fraza wraca do właściciela, wpis dostaje swoją wspierającą), w akapicie pod nim link do landingu zamiast pogrubionej frazy.
- przetwory: kotwica „etykiety na słoiki z własnym nadrukiem” → „etykiety na słoiki”, nowy link w FAQ „Jaka jest najlepsza polska strona do zamówienia małej ilości etykiet na słoiki?”.
- przyprawy i nalewki: kotwice „wodoodpornych etykiet na słoiki” i „własne etykiety na słoiki” → „etykiety na słoiki”.

**Zauważone, poza zakresem:** wpis o przetworach ma brak „etykiety na przetwory” we wstępie (fraza główna nie stoi w pierwszym akapicie) - do zadania przy przeglądzie. Zapytanie „słoiki z logo” Google pokazuje częściej z landingu (76 wyśw., poz. 43,3) niż z wpisu-właściciela (51, poz. 17).

**Zgłoszenia:** commit 669e9d1 na produkcji 19.11, IndexNow 200 OK 19.11. **GSC do ponowienia od 2026-11-20** (P1, istotna aktualizacja; limit 19.11 wyczerpany).

**Kiedy ocenić:** pozycja landingu na „naklejki na słoiki z własnym nadrukiem” i „etykiety na słoiki” po 60-90 dniach (od 2027-01-18); czy Google przestał pokazywać na pierwszą wpis o logo - przy przeglądzie po 28 dniach (od 2026-12-17).

## 2026-11-19 - /tresc naklejki-foliowe: tabela folia a papier, H2 z frazami, FAQ, linki z wpisów

**Powód:** GSC 90 dni 18.08-15.11.2026: 1404 wyświetlenia, 32 kliknięcia przy poz. 18,3; „naklejki foliowe” 449 wyświetleń na poz. 24,9, „naklejki winylowe” 183 na poz. 35,9, „naklejki wodoodporne” 76 na poz. 30,6. Dane z 18.11 - powód aktualny. Brak w bazie: „naklejki odporne na uv” bez miejsca w H2/H3/FAQ.

**Zmiana** (`/naklejki-foliowe`, P0, `zmieniono`, `dateModified` i `lastModified` w sitemapie = 2026-11-19; title, H1 i fraza główna bez zmian):

- nowa sekcja H2 „Naklejki winylowe i wodoodporne: folia winylowa a papier samoprzylepny” z odpowiedzią na początku i tabelą (woda, UV, zmywarka - nie, odklejanie, zastosowania, cena; tylko fakty z `facts.md`, papier jakościowo) oraz H3 „Naklejki odporne na UV - co to znaczy w praktyce” (bez liczby lat na zewnątrz) z linkiem do wpisu o wodoodporności; przycisk do kreatora po tabeli.
- FAQ: pierwsze pytanie zamienione na pytanie AI „Czy naklejki z folii winylowej są wodoodporne i odporne na słońce?”, nowe „Gdzie zamówić wodoodporne naklejki winylowe… w małej ilości?” (pytanie AI) i „Czy naklejki foliowe to to samo co naklejki wodne?” (zapytanie GSC „naklejki wodne na zamówienie” - uczciwe „nie drukujemy kalkomanii”).
- przyciski „Otwórz kreator naklejek” → „Zamów naklejki na folii” (CTA z rejestru); decyzja 3: usunięta wzmianka o „wbudowanym” generatorze AI.
- Skan: brak „naklejki odporne na uv” usunięty, strona bez braków.

**Linki przychodzące z kotwicą „naklejki foliowe”:** wpisy o rowerze i motoryzacji (kotwice „wodoodpornej folii winylowej” i „folii winylowej” → „naklejki foliowe”), nowe linki we wpisie o motocyklach i we wpisie o wodoodporności (pierwszy akapit). Sąsiadom bez zmiany `zmieniono`.

**Do obserwacji:** wpis o wodoodporności zaczyna się od „Naklejki wodoodporne zamówisz…”, a ta fraza należy do landingu. Jeśli przy przeglądzie Google dalej będzie pokazywał na nią wpis, rozstrzygnąć właściciela.

**Zgłoszenia:** commit c471702 na produkcji 19.11, IndexNow 200 OK 19.11. **GSC do ponowienia od 2026-11-20** (P0, istotna aktualizacja; limit 19.11 wyczerpany).

**Kiedy ocenić:** pozycja „naklejki foliowe”, „naklejki winylowe” i „naklejki wodoodporne” po 60-90 dniach (od 2027-01-18); wejścia i koszyk z GA4 przy przeglądzie.

## 2026-11-19 - /tresc naklejki-dla-firm: pogłębienie pod „naklejki firmowe” i „naklejki dla firm”

**Powód:** GSC 90 dni 18.08-15.11.2026: 531 wyświetleń, 0 kliknięć przy poz. 21,8; „naklejki firmowe” 196 wyświetleń na poz. 37,8, „naklejki dla firm” 67 na poz. 19,2. Dane z 18.11 - powód aktualny.

**Rozpoznanie** (WebSearch 19.11.2026, przybliżenie wyników google.pl): na „naklejki firmowe” i „naklejki dla firm z logo” w wynikach Canva (kreator naklejek z logo), Oferteo (porównywarka drukarni, wyceny), lokalne drukarnie i poradniki o druku po obrysie. Żaden wynik nie porównuje uczciwie arkusza od 1 sztuki z drukarnią z nakładem i nie mówi, kiedy który się opłaca - to dołożyliśmy.

**Zmiana** (`/naklejki-dla-firm`, P1, `zmieniono`, `dateModified` i `lastModified` w sitemapie = 2026-11-19):

- title: „Naklejki dla firm - naklejki firmowe z logo, faktura VAT” (56 znaków; było „Naklejki dla małych firm - od 1 arkusza, 59 zł, faktura VAT”). Opis meta (152): fraza główna, od 1 arkusza A4, 59,00 zł brutto, faktura VAT, „naklejki firmowe”. H1 bez zmian.
- pierwszy akapit od frazy głównej z odpowiedzią na pytanie AI (od 1 arkusza, faktura VAT na NIP, bez nakładu i opłat za plik).
- nowa sekcja H2 „Naklejki na paczki z logo - sezon wysyłek” (P4.3.4: jeden wzór na sezon i „Wypełnij arkusz”, faktura VAT, zamówienie z wyprzedzeniem bez daty granicznej) z przyciskiem do kreatora.
- nowa sekcja H2 „Naklejki firmowe: arkusz od 1 sztuki czy drukarnia z nakładem?” z tabelą i uczciwym „kiedy się nie opłaca” (tysiące identycznych etykiet, etykiety na rolce). Dane drukarni tylko jakościowo.
- 2 nowe FAQ (termin przed sezonem wysyłek, arkusz czy drukarnia) - widok i schemat z jednej tablicy.
- przyciski „Otwórz kreator naklejek” → „Zamów naklejki z logo” (CTA z rejestru).
- decyzja 3 (HOLD generatora): usunięte dwie wzmianki o „wbudowanym” generatorze AI; zostają zewnętrzne generatory i Canva.

**Linki przychodzące z kotwicą „naklejki dla firm”:** nowy z `/blog/gdzie-zamowic-naklejki-w-malym-nakladzie-porownanie` (punkt o fakturze VAT); w `/blog/naklejki-firmowe-na-eventy-welcome-pack-dla-pracownikow` kotwica „naklejek firmowych” → „naklejki dla firm”. `/blog/naklejka-z-logo-firmy-...` i `/blog/naklejki-z-wlasnym-logo-na-sloiki-i-opakowania` już ją mają. Sąsiadom bez zmiany `zmieniono`.

**Zgłoszenia:** commit 02861d9 na produkcji 19.11, IndexNow 200 OK 19.11. **GSC do ponowienia od 2026-11-20** (limit 19.11 wyczerpany; P1 z nowym title - prośba potrzebna).

**Kiedy ocenić:** title i opis - pierwszy sygnał od 2026-12-03, CTR po 28 dniach (od 2026-12-17); pozycja „naklejki firmowe” i „naklejki dla firm” po 60-90 dniach (od 2027-01-18).

## 2026-11-19 - /tresc logo-na-sloiki-i-opakowania: title, opis i pierwszy akapit

**Powód:** GSC 90 dni 18.08-15.11.2026: 325 wyświetleń, 0 kliknięć przy poz. 11,2; „naklejki z logo” 44 wyświetlenia na poz. 3,5, „słoiki z logo” 51 na poz. 17, „naklejki na słoiki z własnym nadrukiem” 49 na poz. 9,4 - bez kliknięć. Dane z 18.11 - powód aktualny.

**Zmiana** (`/blog/naklejki-z-wlasnym-logo-na-sloiki-i-opakowania`, P1, `zmieniono` i `updated` = 2026-11-19):

- title i H1: „Naklejki z logo na słoiki - od 1 arkusza A4” (43 znaki, 63 z dopiskiem szablonu; było 80). Faktura VAT nie zmieściła się w title, jest w opisie i pierwszym zdaniu.
- opis meta (149 znaków): fraza główna, od 1 arkusza A4, 59,00 zł brutto, faktura VAT, folia odporna na wodę, kilka wzorów na arkuszu.
- pierwszy akapit od nowa: fraza główna w pierwszym zdaniu, odpowiedź (cena, faktura VAT na NIP, bez minimalnego nakładu, warianty na jednym arkuszu), linki do `/etykiety-na-sloiki` („etykiety na słoiki”) i `/naklejki-dla-firm` („naklejki dla firm”).
- H2 „Profesjonalny wizerunek…” → „Naklejki na opakowania z logo w krótkich seriach” (fraza wspierająca wypadła z title).
- przycisk i `cta_text`: „Zamów naklejki z logo” (zgodnie z rejestrem; było „Zamów własne naklejki”).
- Skan: brak „wstep” frazy głównej usunięty, strona bez braków.

**Zgłoszenia:** commit bdbc86c na produkcji 19.11, IndexNow 200 OK 19.11. **GSC do ponowienia od 2026-11-20** (limit 19.11 wyczerpany).

**Kiedy ocenić:** title i opis - pierwszy sygnał od 2026-12-03 (14 dni), pełny odczyt CTR od 2026-12-17 (28 dni).

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
