# Naklejki z kodem QR - analiza i decyzja (2026-10-27)

> **Wynik:** pomysł ma sens **jako jedna strona usługowa, nie klaster**. Zbudowany landing `/naklejki-z-kodem-qr` (`src/app/naklejki-z-kodem-qr/page.tsx`), zadanie **B5** z `blog-agent/plan.md` zamknięte tym landingiem (wpisu blogowego pod tę intencję nie piszemy). Powstał na wyraźne polecenie właściciela, jako wyjątek od wstrzymania nowych stron do 30.11 (patrz `blog-agent/plan.md` → P4.1).

## 1. Popyt (stan 2026-10-27)

**Planer słów kluczowych** (konto MałeNaklejki, Polska, średnia miesięczna, przedziały - kampanie wstrzymane):

| Fraza | Wyszukiwania / mies. |
|---|---|
| `naklejki z kodem qr` | 100 - 1 tys. |
| `naklejki qr` | 10 - 100 |
| `kod qr naklejka` | 10 - 100 |
| `naklejki z kodem kreskowym` | 10 - 100 |
| `kod qr do opinii google` | 100 - 1 tys. |
| `kod qr wifi` | 100 - 1 tys. |
| `kod qr menu`, `kod qr wizytówka` | 10 - 100 |
| `naklejka nfc` / `naklejki nfc` | 100 - 1 tys. |
| `generator kodów qr`, `kod qr generator`, `jak zrobić kod qr` | 1 - 10 tys. (intencja: narzędzie, nie naklejka) |
| **wszystkie frazy transakcyjne z modyfikatorem** (`naklejki qr na zamówienie`, `druk naklejek qr`, `etykiety z kodem qr`, `naklejka qr menu`, `naklejka qr opinie google`, `wlepki qr`, `naklejki qr wodoodporne`, ...) | **brak danych (< 10)** |

**GSC malenaklejki.pl** (1.07-26.10.2026): zero wyświetleń zapytań z `qr`, `kod`, `nfc` - nie mamy pokrycia.

**Allegro** (`/listing?order=qd`, licznik „kupiło ostatnio"): ok. 60 ofert z QR na frazę `naklejki z kodem qr`, najlepsze po kilkanaście-26 zakupów; suma widocznych zakupów ok. 200-250. Segmenty: **opinie Google** („Oceń nas", najwięcej), **Booksy** (salony), **Instagram/Facebook** na szybę lub drzwi, etykiety produktowe z QR, mała naklejka z kodem na drona. Dla porównania `naklejki nfc` - ok. 1,4 tys. zakupów (inny produkt, z chipem; nie oferujemy).

**Wniosek:** realny, ale mały popyt - głowa `naklejki z kodem QR` to 100-1000 wyszukiwań miesięcznie, reszta to długi ogon poniżej progu Planera. Duże wolumeny (generatory) dotyczą narzędzia, którego nie mamy i którego nie chcemy zastępować.

## 2. Konkurencja i intencja

Top 10 Google dla `naklejki z kodem qr` i `naklejki qr na zamówienie`: **dedykowane strony usługowe** drukarni (sodadruk, nietylkoplakaty, decoprint, kru-good, booklet, print4u, bizay, ikolor, cyfrus) + jeden poradnik (inprinto: „jak zrobić, rozmiar i cena"). Dla `naklejka qr oceń nas w google` - sklepy z gotowymi naklejkami (dotmedia, vizum, tss, graficzny.pro, oznakowanie.pro). Dla menu na stolik - Etsy, tabliczki, stojaki.

**Wniosek o formacie:** intencja jest transakcyjna, Google pokazuje strony usługowe, więc **landing, nie wpis blogowy** (zasada Fazy 4: jedna strona = jedna intencja; informacyjne zostaje na blogu, transakcyjne na landingu). Poradnik „jak przygotować kod QR" nie ma szans z generatorami i przeglądami AI, więc wchodzi do landingu jako sekcja, nie jako osobny wpis.

## 3. Dopasowanie do produktu i przewaga

- Technicznie **zero nowych funkcji**: kod QR to wgrany obraz (PNG), kreator nie przyjmuje SVG.
- **Przewaga, której nie mają drukarnie:** wiele z nich wycenia partię jednego wzoru; my sprzedajemy arkusz za 59,00 zł z kilkoma **różnymi** kodami (opinie + Instagram + menu + Wi-Fi) i kopiami. Pisz o tym jakościowo (bez liczb konkurencji - `facts.md`).
- **Słaba strona:** przy jednej dużej naklejce „Oceń nas" arkusz + dostawa 19,99 zł przegrywa z gotową naklejką z Allegro. Dlatego strona celuje w kilka miejsc / kilka kodów, a FAQ mówi to wprost.
- **Realna skala:** nowa strona na słabej domenie, głowa 100-1000 wyszukiwań, SERP zajęty przez 10 drukarni. Spodziewaj się pojedynczych kliknięć miesięcznie, nie przełomu. Wartość to wzmocnienie `/naklejki-dla-firm` i pokrycie długiego ogona (opinie Google, Wi-Fi, social media).

## 4. Zasady z weryfikacji w kodzie kreatora (nie z testu na produkcji)

- **„Prostokąt"** - linia cięcia wokół całego obrazu z zapasem 1-5 mm (`getCutLineOffsetMm`), czyli biały margines kodu zostaje. Polecamy go dla QR.
- **„Kontur"** - obrys z `computeForegroundMask` (białe tło połączone z krawędzią = tło), cięcie po krawędzi samych kwadracików.
- **„Koło"** - elipsa wpisana w obraz, obcina narożniki, w trzech z nich są wzorce pozycjonujące kodu.
- **PDF** - `renderPdfPageForSticker` przycina puste marginesy strony, więc biały margines kodu może zniknąć. Polecamy PNG.
- Nie testowano wgrywania pliku z QR w kreatorze (lokalny `.env.local` = produkcyjny Storage). Zalecenie „test wydruku próbnego" w treści jest świadome.

## 5. Granice (`facts.md`)

- Bez gwarancji skanowalności po wydruku; zalecenia + wymóg testu.
- Kod generuje klient w zewnętrznym generatorze, kreator go nie tworzy.
- Bez fraz „serwisowe", „gwarancyjne", „plomby" (zakaz z 2026-10-09) - **stare założenie B5 o „naklejce serwisowej z QR" odpada**.
- Odporność tylko woda i UV; nie do zmywarki.
- Opinie Google: tylko zasady (bez nagród, bez wybierania klientów) - źródła wtórne, w treści odesłanie do pomocy Google.
- Podmiana kodu (quishing): zalecenia dla właściciela, bez obietnicy, że naklejka jest zabezpieczona.
- Nie piszemy o płatnościach przez QR ani o kodach na pojazdach/dronach.

## 6. Otwarte punkty i kontrola

- [ ] **Zdjęcia** do `public/landing/naklejki-z-kodem-qr/` (folder pusty, `.gitkeep`): arkusz z różnymi kodami (opinie, Instagram, menu, Wi-Fi), naklejka na ladzie/stoliku. Po dograniu: kompresja, osadzenie wg wzorca `/naklejki-foliowe`, `openGraph`/`twitter` image (dziś `/images/og-main.jpg`).
- [ ] **Zgłoszenie do indeksowania** w GSC (Sprawdzenie adresu URL → Poproś o zindeksowanie) po wdrożeniu.
- [ ] **Kontrola ok. 2026-12-01 i 2027-01-15:** GSC dla `query=~(qr|nfc)` i strony `/naklejki-z-kodem-qr` (stan wyjściowy 27.10: zero wyświetleń). Jeśli po 8 tygodniach < 10 wyświetleń, nie rozbudowuj - zostaw stronę jako wzmocnienie `/naklejki-dla-firm`.
- [ ] **Decyzja właściciela (opcjonalnie):** link do strony w stopce (guardrail `rules.md` §6b) - nie dodano.
- [ ] **Poza zakresem tego zadania, do rozważenia:** (1) schemat `Product` w starszych landingach deklaruje `transitTime` 1-2 dni (całkowity czas dostawy jest w `facts.md` zabroniony) - nowy landing go nie ma; (2) filar `drukowanie-naklejek-online...` radzi „tekst wektorowy (PDF, SVG)", a kreator nie przyjmuje SVG; (3) strona główna ma anchor „oznaczania ubrań do przedszkola", a naklejek na tkaninę nie oferujemy.
