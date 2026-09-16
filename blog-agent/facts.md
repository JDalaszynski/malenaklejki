# 📌 Fakty o produkcie - jedyne źródło prawdy

> **Obowiązuje bezwzględnie** dla `blog-agent/*` i `landing-agent/*`. Zanim podasz w treści jakąkolwiek liczbę (cena, czas, wymiar, odporność) - sprawdź ją tutaj. Jeśli faktu nie ma w tabeli poniżej, **nie wymyślaj go**: albo pisz jakościowo (bez liczby), albo zapytaj właściciela i dopisz fakt do tego pliku.
>
> Modele LLM cytują liczby. Sprzeczne liczby na jednej domenie osłabiają nas jako źródło i realnie ryzykują reklamacją.

**Ostatnia aktualizacja:** 2026-09-16

---

## ✅ Fakty potwierdzone przez właściciela (używaj swobodnie)

| Fakt | Wartość | Jak pisać w treści | Źródło / data |
| :--- | :--- | :--- | :--- |
| Cena arkusza | **49,00 zł brutto za arkusz A4** | zawsze "brutto"; stała cena, bez progów nakładowych | landing-agent 2026-07-24 |
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

---

## ⚠️ NIE UŻYWAJ bez zgody właściciela

* **Całkowity czas dostawy do klienta** (produkcja + kurier/paczkomat). Znamy koszt (19,99 zł) i czas produkcji - sumy **nie deklaruj**.
* **Deadline zamówień przed świętami / konkretna data graniczna** - wymaga osobnej zgody (dotyczy huba B3, dawniej A5; rekomendacja do decyzji: `strategia-swieta-2026.md` §12). Po zgodzie wpisz datę do tabeli faktów potwierdzonych **z adnotacją "ważne do 24.12.2026"**, dopisz ją do `FACTS` w `scripts/generuj-llms-txt.mjs` i przebuduj `llms.txt`. Po sezonie usuń oba wpisy.
* **Sufit trwałości zewnętrznej** ("na lata", "na karoserię", "odporna na myjnię ciśnieniową") - poza woda/UV.
* **Odporność na rozpuszczalniki, tłuszcze, benzynę, pranie, tkaninę.**
* **Właściwości security / void / "nie da się zdjąć"** przy plombach na paczki.
* **Dane konkurencji** (minimalne nakłady, ceny, czasy StickerApp / Sticker Mule / Redbubble) - pisz jakościowo, nigdy liczbowo.
* **Gwarancja skanowalności kodu QR po wydruku** - dawaj zalecenia i każ przetestować.
* **Liczba sztuk na arkuszu A4 jako twarda gwarancja** - zawsze "orientacyjnie ok. X szt.", bo zależy od kształtu i odstępów.

---

## ✅ Czas realizacji - ROZSTRZYGNIĘTE (2026-08-17)

**Decyzja właściciela: obowiązuje "produkcja 2-3 dni robocze".** Wcześniej blog i strona główna mówiły "3 dni robocze" (i miejscami "wysyłka w 3 dni"), a landingi "produkcja 2-3 dni robocze". Ujednolicone w całym serwisie 2026-08-17.

**Jak pisać:**
* ✅ "produkcja 2-3 dni robocze", "realizacja zajmuje 2-3 dni robocze", "wyprodukujemy w 2-3 dni robocze", "naklejki będą gotowe w 2-3 dni robocze"
* ❌ "dostarczymy w 2-3 dni", "odbierzesz w 2-3 dni", "dotrą do Ciebie w 2-3 dni", "wysyłka w 2-3 dni" - to obietnice **doręczenia**, a całkowity czas dostawy jest nadal DO POTWIERDZENIA. Mów o produkcji, potem osobno o paczkomacie.

**Wyjątek - `src/app/regulamin/page.tsx`** mówi "maksymalnie 3 dni robocze od zaksięgowania wpłaty". Jest to zgodne z 2-3 dniami (sufit), więc **nie ruszaj regulaminu** bez decyzji prawnej.

**Korekta audytu Fazy 3 (P3.3):** flaga "1-2 dni robocze" jako obietnica szybsza niż potwierdzona to **fałszywy alarm**. Oba wystąpienia (`drukowanie-naklejek-online...`, `naklejki-wlasnego-projektu-na-sloiki-z-przyprawami...`) opisują **czas kuriera po produkcji**, nie czas realizacji. Zostają.

---

## 🚫 Czego nie oferujemy (fałszywa obietnica)

Folia do wrappingu / oklejania całych pojazdów, hologram, brokat, folia transparentna, naklejki matowe (i wybór mat/połysk), naklejki repozycjonowalne / wielokrotnego użytku, naklejki na tkaninę.
