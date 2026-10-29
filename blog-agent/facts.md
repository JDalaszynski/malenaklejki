# 📌 Fakty o produkcie - jedyne źródło prawdy

> **Obowiązuje bezwzględnie** dla `blog-agent/*` i `landing-agent/*`. Zanim podasz w treści jakąkolwiek liczbę (cena, czas, wymiar, odporność) - sprawdź ją tutaj. Jeśli faktu nie ma w tabeli poniżej, **nie wymyślaj go**: albo pisz jakościowo (bez liczby), albo zapytaj właściciela i dopisz fakt do tego pliku.
>
> Modele LLM cytują liczby. Sprzeczne liczby na jednej domenie osłabiają nas jako źródło i realnie ryzykują reklamacją.

**Ostatnia aktualizacja:** 2026-10-27 (naklejki z kodem QR: co robi, a czego nie robi kreator)

---

## ✅ Fakty potwierdzone przez właściciela (używaj swobodnie)

| Fakt | Wartość | Jak pisać w treści | Źródło / data |
| :--- | :--- | :--- | :--- |
| Cena arkusza | **59,00 zł brutto za arkusz A4** | zawsze "brutto"; stała cena, bez progów nakładowych. Cena za sztukę w tabelach = 59,00 zł podzielone przez liczbę naklejek (np. 30 szt. → ~1,97 zł) | decyzja właściciela 2026-10-19 (wcześniej 49,00 zł); w kodzie stała `SHEET_PRICE` w `src/lib/sheets/types.ts` |
| Minimalny nakład | **brak** - już od 1 arkusza / 1 sztuki | "bez minimalnego nakładu", "od 1 arkusza A4" | landing-agent 2026-07-24 |
| Rabat hurtowy | **NIE MA** - zawsze arkusz po arkuszu | nie sugeruj negocjacji ani progów ilościowych | landing-agent 2026-07-24 |
| Faktura VAT | **TAK**, na NIP (jesteśmy płatnikiem VAT) | atut B2B | landing-agent 2026-07-24 |
| Dostawa | **paczkomat, 19,99 zł** | brak darmowej dostawy - nie obiecuj jej | landing-agent 2026-07-24 |
| Materiał | **folia winylowa** | "folia winylowa" / "trwały winyl" | landing-agent 2026-07-24 |
| Powierzchnia naklejki | **subtelny połysk** - naklejki są delikatnie błyszczące; ta sama powierzchnia we wszystkich zamówieniach (w kreatorze nie ma wyboru mat/połysk) | "subtelny połysk", "delikatnie błyszcząca folia", "żywe kolory z subtelnym połyskiem". **NIE:** "matowe", "wysoki połysk", "lustrzany połysk", "glossy jak lakier", "laminowane / lakierowane" (warstwy ochronnej nie potwierdzono). Słowa **"wykończenie"** nie używaj dla połysku - w serwisie oznacza formę zestawu (arkusz / pojedyncze sztuki); w tabelach parametrów wiersz nazywa się **"Powierzchnia"** | właściciel 2026-09-16 |
| Odporność | **woda, UV** | tylko te dwie; **NIE** "odporna na zadrapania", "na ścieranie", "na tarcie / otarcia" (właściciel 2026-09-16) | landing-agent 2026-07-24 |
| Zmywarka | **NIE** | wprost: nie nadaje się do zmywarki, mycie ręczne | landing-agent 2026-07-24 |
| Klej | **mocny klej, 0 śladów przy odklejaniu** | "nie zostawia śladów"; **NIE** "repozycjonowalny" / "wielokrotnego użytku" | rules/plan Faza 3 |
| Rozdzielczość pliku | **300 DPI** (zalecane) | "300 DPI"; przy małych naklejkach więcej | używane na wszystkich landingach |
| Formaty plików | **JPG, PNG, WEBP, PDF** - PDF bez hasła, do 50 MB; każda strona PDF to osobna naklejka (naraz do 10 stron); puste marginesy strony kreator przycina, a naklejka trafia na arkusz w wymiarach z projektu (większy projekt zmniejsza do pola zadruku) | "wgraj JPG, PNG lub PDF - np. eksport z Canvy albo Worda"; **NIE:** SVG, AI, EPS, CDR, PSD - kreator ich nie przyjmuje, pisz o eksporcie do PNG lub PDF | kod: `src/lib/utils/pdf.ts`, `src/components/creator/PdfImportModal.tsx` - 2026-09-16 |
| Maks. wymiar naklejki | **19 cm** | ⚠️ patrz sekcja "do potwierdzenia" niżej | funkcjonuje w treściach (15x), formalnie niezatwierdzony |
| Cięcie | die-cut po obrysie, kiss-cut, koło, prostokąt | kreator sam wyznacza linię cięcia | - |
| Różne wzory na jednym arkuszu | **TAK** - kolejne obrazy wgrywane do kreatora trafiają na ten sam arkusz, każdy z własną linią cięcia | "wgraj kolejne zdjęcia lub grafiki - każdą wytniemy osobno"; płacisz za arkusz, nie za liczbę wzorów. Złożenie wzorów w jeden plik (np. w Canvie) to **opcja, nie wymóg** | kod: `HomePageClient.tsx:661`, `types/creator.ts` (`PlacedSticker`) - 2026-09-10 |
| Kilka arkuszy w jednym zamówieniu | **TAK**, dostawa 19,99 zł liczona **raz za całe zamówienie** | "różne arkusze (np. etykiety na prezenty, na słoiki, na paczki) w jednej paczce, z jedną dostawą" | kod: `createOrder.ts:150` - 2026-09-10 |
| Płatności | BLIK, Przelewy24 | - | `src/app/page.tsx` |
| Gotowe zestawy | **TAK** - zestawy naklejek z gotowymi wzorami, każdy to jeden arkusz A4 (katalog `/gotowe-zestawy`), ta sama folia winylowa i ta sama cena **59,00 zł brutto za zestaw**. Nazwa od 2026-10-05: „gotowe zestawy” / „gotowe zestawy naklejek” (wcześniej „gotowe arkusze”) | "gotowy zestaw do zamówienia", "gotowe zestawy naklejek", "wybierz wzór"; **NIE:** "gotowy arkusz" / "gotowe arkusze" (stara nazwa - „arkusz” zostaje dla formatu A4 i kreatora), "zaprojektowaliśmy", "projekt", "edytor grafiki". O pochodzeniu grafik nie piszemy (HOLD na generator AI). Pisz o nich tylko wtedy, gdy katalog jest publiczny (tryb "Włączony" w panelu) | właściciel 2026-10-03, `landing-agent/strategia-gotowe-zestawy.md` |
| Liczba naklejek na gotowym zestawie | **dokładna**, podana przy każdym zestawie | wolno podać konkretną liczbę (np. "54 naklejki") - to wyjątek od zasady "orientacyjnie ok. X szt.", która dalej obowiązuje dla arkuszy układanych przez klienta | kod: `stickerCount` arkusza, 2026-10-03 |
| Edycja gotowego zestawu | **TAK** - przed zamówieniem w kreatorze: zmiana rozmiaru, usuwanie naklejek, dokładanie własnych grafik; cena bez zmian | "dopasuj zestaw", "zmień po swojemu"; **NIE:** "zaprojektuj" | kod: `/?zestaw=<id>`, 2026-10-03 |
| Zwrot | **14 dni** dla gotowego zestawu zamówionego **bez zmian**; naklejki z własnych grafik i gotowy zestaw zmieniony w kreatorze - **bez zwrotu** (rzecz wg specyfikacji klienta) | zawsze oba człony razem; odesłanie na koszt klienta. **NIE:** "zwrot w 14 dni" bez zastrzeżenia, **NIE:** "brak zwrotów" o całej ofercie | regulamin §7, decyzja właściciela 2026-10-03 (wariant A) |
| Naklejki na znicze | **TAK** - drukujemy same naklejki (zdjęcie, imię, dedykacja, logo) do przyklejenia na **płaską, gładką ściankę klosza znicza BEZ otwartego płomienia** (solarny, LED, na baterie), ze szkła lub plastiku; **znicz musi mieć płaską powierzchnię pod naklejkę, inaczej naklejka wygląda niekorzystnie** (właściciel, 2026-10-23) - na kloszu kulistym / z wybrzuszeniem / ryflowanym / ażurowym / z reliefem marszczy się i odstaje, a **na okrągłym (walec, stożek) też NIE - „nawet mała naklejka jest problemem”** (właściciel, 2026-10-23); **na klosz znicza z płomieniem NIE - folia się stopi** (właściciel, 2026-10-10); **zniczy i wkładów nie sprzedajemy**. Kształt „Koło" w kreatorze dopasowuje się do proporcji zdjęcia (portret w pionie = owal). Tło usuwa się przyciskiem „Usuń tło", **napis przygotowuje się poza kreatorem** (brak edytora tekstu) | "naklejka na znicz", "znicz ze zdjęciem z własną naklejką", "na znicz solarny, LED lub na baterie", "nie naklejaj na klosz znicza z płomieniem - folia się stopi", "płaska, gładka ścianka klosza", "test z kartką papieru przed zamówieniem". **NIE:** "naklejaj z dala od knota", "na zewnętrznej stronie szkła znicza z płomieniem", "sprawdź jedną naklejkę, zapalając znicz", "najbezpieczniej solarny/LED" (sugeruje, że z płomieniem też wolno), "odporna na płomień / ciepło / wysoką temperaturę", "na lata na cmentarzu", "odporna na mróz", "do każdego znicza", "na każdy kształt klosza", "na okrągłym kloszu mała naklejka wystarczy", "im węższy klosz, tym mniejsza naklejka", "zaprojektuj", gotowe znicze w ofercie | kod: `HomePageClient.tsx` (cięcie `circle` = elipsa), `StickerEditModal.tsx`; decyzja redakcyjna 2026-10-05, korekta właściciela 2026-10-10 (klosz z płomieniem = folia się topi), właściciel 2026-10-23 (płaska powierzchnia), `landing-agent/strategia-znicze.md` |
| Naklejki z kodem QR | **TAK** - drukujemy **wgrany przez klienta obraz** z kodem QR (PNG, JPG, WEBP, PDF; **bez SVG**), ta sama folia, cena i cięcie co zawsze. **Kreator NIE generuje kodów QR i nie ma edytora tekstu** - kod i podpis przygotowuje klient w zewnętrznym generatorze / Canvie. Na jednym arkuszu może być kilka różnych kodów i kopie (przycisk „Wypełnij arkusz”). Dla kodu zalecamy cięcie **„Prostokąt”** (obejmuje biały margines; „Kontur” tnie po krawędzi kwadracików, „Koło” obcina narożniki z wzorcami pozycjonującymi), **bez „Usuń tło”**, **PNG zamiast PDF** (PDF: kreator przycina puste marginesy strony) | "kod QR wgrany jako PNG", "kilka różnych kodów na jednym arkuszu", "kreator drukuje wgrany obraz i nie tworzy kodów", "przetestuj wydruk próbny w docelowym rozmiarze". **NIE:** gwarancja skanowalności po wydruku (patrz niżej), "generujemy / tworzymy kod QR", "naklejka serwisowa / gwarancyjna z QR", naklejki NFC (nie oferujemy), odporność poza woda/UV, obietnica, że kod jest zabezpieczony przed podmianą | kod: `getCutLineOffsetMm`, `computeForegroundMask`, `renderPdfPageForSticker`; decyzja redakcyjna 2026-10-27, `landing-agent/strategia-qr.md` |

---

## ⚠️ NIE UŻYWAJ bez zgody właściciela

* **Całkowity czas dostawy do klienta** (produkcja + kurier/paczkomat). Znamy koszt (19,99 zł) i czas produkcji - sumy **nie deklaruj**.
* **Deadline zamówień przed świętami / konkretna data graniczna** - wymaga osobnej zgody (dotyczy huba B3, dawniej A5; rekomendacja do decyzji: `strategia-swieta-2026.md` §12). Po zgodzie wpisz datę do tabeli faktów potwierdzonych **z adnotacją "ważne do 24.12.2026"**, dopisz ją do `FACTS` w `scripts/generuj-llms-txt.mjs` i przebuduj `llms.txt`. Po sezonie usuń oba wpisy.
* **Sufit trwałości zewnętrznej** ("na lata", "na karoserię", "odporna na myjnię ciśnieniową") - poza woda/UV.
* **Odporność na rozpuszczalniki, tłuszcze, benzynę, pranie, tkaninę.**
* **Odporność na ciepło płomienia i temperaturę znicza** (naklejki na znicze, lampiony). **Folia NIE jest odporna** - właściciel potwierdził 2026-10-10, że na kloszu znicza z płomieniem folia się stopi. Pisz wprost: naklejki wyłącznie na znicze bez otwartego płomienia (solarne, LED, na baterie); na klosz znicza z wkładem parafinowym/olejowym, na wkład i na metal - nie. **Nigdy** nie pisz, że na znicz z płomieniem można naklejać „z dala od knota", „na zewnętrznej stronie szkła" ani „po teście jednej sztuki". (Świece w szkle - wpis `naklejki-z-wlasnym-logo-na-sloiki-i-opakowania` - nadal mają formułę „nie deklarujemy, z dala od knota"; do decyzji właściciela.) Uwaga: starsze wpisy (`naklejki-z-wlasnym-logo-na-sloiki-i-opakowania`, `...sloiki-z-przyprawami...`) obiecywały odporność na ciepło otoczenia („nie odklejają się pod wpływem ciepła", „nie blaknie pod wpływem ciepła z kuchenki") - sformułowania usunięte 2026-10-08, bo wykraczały poza tabelę potwierdzonych faktów (woda, UV). Nie przywracaj ich i nie przenoś na znicze.
* **Czy światło LED/solarne prześwituje przez naklejkę na zniczu** - właściciel nie wie (2026-10-23). Nie pisz ani że prześwituje, ani że nocą jest ciemną plamą; wolno tylko „nie oklejaj całego klosza - im więcej szkła odsłonięte, tym lepiej widać światło”.
* **Frazy „naklejki serwisowe", „naklejki gwarancyjne", „plomby" / „naklejki plombujące"** - **zakaz używania** (decyzja właściciela 2026-10-09). Nasze naklejki nie mają kleju permanentnego i da się je zdjąć bez trudu, więc nie pozycjonujemy ich jako oznaczeń serwisowych, gwarancyjnych ani zabezpieczeń. Wpisy `naklejki-serwisowe-dla-firm-...` i `plomby-na-paczki-wysylkowe-...` usunięte, adresy przekierowane 301 na `/naklejki-dla-firm` (`next.config.ts`). Nie twórz nowych wpisów ani sekcji pod te frazy; zamiast „plomba na paczkę" pisz „naklejka na paczkę". Nie wyjaśniaj klientom powodu.
* **Dane konkurencji** (minimalne nakłady, ceny, czasy StickerApp / Sticker Mule / Redbubble) - pisz jakościowo, nigdy liczbowo.
* **Gwarancja skanowalności kodu QR po wydruku** - dawaj zalecenia i każ przetestować.
* **Liczba sztuk na arkuszu A4 jako twarda gwarancja** - zawsze "orientacyjnie ok. X szt.", bo zależy od kształtu i odstępów.

---

## ✅ Czas realizacji - ROZSTRZYGNIĘTE (2026-08-17)

**Decyzja właściciela (zmiana 2026-10-29): obowiązuje "produkcja 4-5 dni robocze" (wcześniej 2-3, od 2026-08-17).** Wcześniej blog i strona główna mówiły "3 dni robocze" (i miejscami "wysyłka w 3 dni"), a landingi "produkcja 2-3 dni robocze". Ujednolicone w całym serwisie 2026-08-17.

**Jak pisać:**
* ✅ "produkcja 4-5 dni robocze", "realizacja zajmuje 4-5 dni robocze", "wyprodukujemy w 4-5 dni robocze", "naklejki będą gotowe w 4-5 dni robocze"
* ❌ "dostarczymy w 4-5 dni", "odbierzesz w 4-5 dni", "dotrą do Ciebie w 4-5 dni", "wysyłka w 4-5 dni" - to obietnice **doręczenia**, a całkowity czas dostawy jest nadal DO POTWIERDZENIA. Mów o produkcji, potem osobno o paczkomacie.

**Wyjątek - `src/app/regulamin/page.tsx`** mówi "maksymalnie 3 dni robocze od zaksięgowania wpłaty". Jest to zgodne z 2-3 dniami (sufit), więc **nie ruszaj regulaminu** bez decyzji prawnej.

**Korekta audytu Fazy 3 (P3.3):** flaga "1-2 dni robocze" jako obietnica szybsza niż potwierdzona to **fałszywy alarm**. Oba wystąpienia (`drukowanie-naklejek-online...`, `naklejki-wlasnego-projektu-na-sloiki-z-przyprawami...`) opisują **czas kuriera po produkcji**, nie czas realizacji. Zostają.

---

## 🚫 Czego nie oferujemy (fałszywa obietnica)

Folia do wrappingu / oklejania całych pojazdów, hologram, brokat, folia transparentna, naklejki matowe (i wybór mat/połysk), naklejki repozycjonowalne / wielokrotnego użytku, naklejki na tkaninę.
