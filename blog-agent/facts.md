# 📌 Fakty o produkcie - jedyne źródło prawdy

> **Obowiązuje bezwzględnie** dla `blog-agent/*` i `landing-agent/*`. Zanim podasz w treści jakąkolwiek liczbę (cena, czas, wymiar, odporność) - sprawdź ją tutaj. Jeśli faktu nie ma w tabeli poniżej, **nie wymyślaj go**: albo pisz jakościowo (bez liczby), albo zapytaj właściciela i dopisz fakt do tego pliku.
>
> Modele LLM cytują liczby. Sprzeczne liczby na jednej domenie osłabiają nas jako źródło i realnie ryzykują reklamacją.

**Ostatnia aktualizacja:** 2026-08-17

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
| Odporność | **woda, UV, zadrapania** | tylko te trzy | landing-agent 2026-07-24 |
| Zmywarka | **NIE** | wprost: nie nadaje się do zmywarki, mycie ręczne | landing-agent 2026-07-24 |
| Klej | **mocny klej, 0 śladów przy odklejaniu** | "nie zostawia śladów"; **NIE** "repozycjonowalny" / "wielokrotnego użytku" | rules/plan Faza 3 |
| Rozdzielczość pliku | **300 DPI** (zalecane) | "300 DPI"; przy małych naklejkach więcej | używane na wszystkich landingach |
| Maks. wymiar naklejki | **19 cm** | ⚠️ patrz sekcja "do potwierdzenia" niżej | funkcjonuje w treściach (15x), formalnie niezatwierdzony |
| Cięcie | die-cut po obrysie, kiss-cut, koło, prostokąt | kreator sam wyznacza linię cięcia | - |
| Płatności | BLIK, Przelewy24 | - | `src/app/page.tsx` |

---

## ⚠️ NIE UŻYWAJ bez zgody właściciela

* **Całkowity czas dostawy do klienta** (produkcja + kurier/paczkomat). Znamy koszt (19,99 zł) i czas produkcji - sumy **nie deklaruj**.
* **Deadline zamówień przed świętami / konkretna data graniczna** - wymaga osobnej zgody (dotyczy wpisu A5).
* **Sufit trwałości zewnętrznej** ("na lata", "na karoserię", "odporna na myjnię ciśnieniową") - poza woda/UV/zadrapania.
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

Folia do wrappingu / oklejania całych pojazdów, hologram, brokat, folia transparentna, naklejki repozycjonowalne / wielokrotnego użytku, naklejki na tkaninę.
