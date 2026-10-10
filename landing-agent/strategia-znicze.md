# Nisza sezonowa „znicze" - strategia, wykonanie i otwarte punkty

**Data:** 2026-10-05 · **Sezon:** 5.10 - 2.11.2026 (Wszystkich Świętych = niedziela 1.11, Zaduszki = poniedziałek 2.11) + fale całoroczne
**Baza fraz:** [`keywords-znicze.md`](keywords-znicze.md) · **Surowe dane:** [`dane/znicze-podpowiedzi-2026-10-05.json`](dane/znicze-podpowiedzi-2026-10-05.json) · **Odświeżanie podpowiedzi:** `node scripts/podpowiedzi-google.mjs "<fraza>"`
**Zasady:** `landing-agent/rules.md`, `blog-agent/rules.md`, `blog-agent/facts.md` (od 2026-10-05 z wpisem o zniczach i o cieple płomienia)

---

## 1. W skrócie

**Cel:** zbierać ruch z zapytań o znicze z naciskiem na zdjęcie i kierować go do kreatora.
**Teza:** zapytania o znicze to w większości zakup **gotowego znicza**; my sprzedajemy **naklejkę**. Dlatego nie walczymy o głowę „znicz ze zdjęciem" jako produkt, tylko zajmujemy trzy kąty, których sklepy ze zniczami nie obsługują: **własny znicz + naklejka**, **wiele grobów w jednym zamówieniu** i **tekst/dedykacja** (szczegóły: baza fraz §1).

**Decyzja o architekturze: jeden landing + dwa wpisy poradnikowe, bez rozdrabniania.**

| Strona | Typ | Rola |
| :--- | :--- | :--- |
| [`/naklejki-na-znicze`](../src/app/naklejki-na-znicze/page.tsx) | landing komercyjny, **evergreen** (bez roku w adresie) | zakup naklejki: `naklejki na znicze (ze zdjęciem)` |
| `/blog/znicz-ze-zdjeciem-jak-zrobic-samodzielnie-naklejka-na-znicz` | wpis poradnikowy | głowa „znicz ze zdjęciem": kąt „zrób to sam" |
| `/blog/co-napisac-na-zniczu-napisy-i-dedykacje-dla-bliskich` | wpis poradnikowy | `co napisać na zniczu`, `napis na znicz`, `dedykacja na znicz` |

**Dlaczego landing, a nie wpis „sezonowy"** (inaczej niż przy hubie świątecznym): popyt na znicze ma szczyt na Wszystkich Świętych, ale **nie znika** - fraza `znicz na dzień babci / dziadka / mamy / taty ze zdjęciem` ma podpowiedzi Google, a rocznice i pogrzeby są cały rok (baza fraz §8). Landing pod stałym adresem zbiera autorytet z sezonu na sezon; w 2027 odświeżamy go polem `dateModified`, nie tworzymy nowego adresu.

**Dlaczego nie osobny landing pod „ze zdjęciem":** to ta sama intencja zakupowa co główny landing, a `naklejki na znicze ze zdjęciem` bez własnej strony w SERP i bez podpowiedzi Google zdobędzie ten sam landing (H1 i `title` zawierają „ze zdjęciem"). Druga strona o tej samej intencji byłaby kanibalizacją.

---

## 2. Realistyczne oczekiwania (uczciwie)

* **Do szczytu zostały 4 tygodnie.** Nowy adres musi zostać zaindeksowany (zwykle dni, nie tygodnie przy linku ze strony głównej i pingu IndexNow), a dopiero potem zacząć rankować. **Nie obiecuję pozycji w TOP 10 na `naklejki na znicze` przed 1.11.** To sezon na „zasianie" i naukę: które frazy faktycznie przywodzą ruch (GSC), co klika się z landingu do kreatora, jakie pytania zadają ludzie.
* **Najlepsze szanse w tym sezonie** mają frazy o niskiej konkurencji: `naklejki na znicze ze zdjęciem` (zero dedykowanych stron), `co napisać na zniczu` (informacyjna, sklepy jej nie obsługują), `znicz solarny ze zdjęciem` (kąt „własny znicz") i zapytania GEO/AEO (cytowalne tabele i FAQ).
* **Prawdziwa wartość tej pracy przypada na 2027:** strona będzie miała rok historii, a start publikacji zaplanowano na sierpień (§9).

---

## 3. Co zbudowano (2026-10-05)

| Element | Plik |
| :--- | :--- |
| Baza słów kluczowych (6 klastrów fraz, mapa fraza → strona, pytania AEO, pułapki, kalendarz, pomiar) | `landing-agent/keywords-znicze.md` |
| Surowe podpowiedzi Google (407 unikalnych) | `landing-agent/dane/znicze-podpowiedzi-2026-10-05.json` |
| Skrypt odświeżania podpowiedzi | `scripts/podpowiedzi-google.mjs` |
| Landing (hero BLUF, 15-wierszowa specyfikacja, 6 zastosowań, tabela rodzajów zniczy, ramka „płomień i bezpieczeństwo", tabela rozmiarów i kosztu, sekcja B2B, 6 zalet, 3 kroki, 10 FAQ; JSON-LD `BreadcrumbList` + `Product`/`Offer` + `FAQPage` + `WebPage`) | `src/app/naklejki-na-znicze/page.tsx` |
| Wpis „Znicz ze zdjęciem - jak zrobić go samodzielnie" (6 FAQ) | `src/content/blog/znicz-ze-zdjeciem-jak-zrobic-samodzielnie-naklejka-na-znicz.md` |
| Wpis „Co napisać na zniczu" (tabela 12 adresatów, 6 FAQ) | `src/content/blog/co-napisac-na-zniczu-napisy-i-dedykacje-dla-bliskich.md` |
| Sitemap, `llms.txt` / `llms-full.txt` (strona + fakty + reguła dla agentów AI) | `src/app/sitemap.ts`, `scripts/generuj-llms-txt.mjs` |
| Fakty (wpis o zniczach + zakaz deklarowania odporności na płomień) | `blog-agent/facts.md` |

---

## 4. Granice merytoryczne, które nie podlegają negocjacji

1. **Ciepło płomienia (korekta właściciela 2026-10-10).** Folia **nie jest odporna** na ciepło płomienia - na kloszu znicza z płomieniem się stopi. Naklejki są wyłącznie na znicze **bez otwartego płomienia** (solarne, LED, na baterie); landing i wpisy mówią to wprost (hero, ramka, tabela rodzajów zniczy, specyfikacja, FAQ). Wcześniejsza wersja (5-9.10) dopuszczała naklejanie na szkło znicza z płomieniem „z dala od knota" i test jednej sztuki - to był błąd, usunięty 10.10. Nie przywracać.
2. **Nie sprzedajemy zniczy ani wkładów** - powiedziane na landingu i w FAQ, żeby nie wprowadzać w błąd wyszukujących „znicz ze zdjęciem".
3. **Kreator nie ma edytora tekstu** - napis i dedykację przygotowuje się w Canvie/Wordzie; mówimy to wprost.
4. **Ton:** spokojny, rzeczowy, bez wykrzykników, emoji, „okazji" i odliczania do 1.11. Termin zamówienia: wyłącznie „zamów z zapasem" - **bez daty granicznej i bez deklaracji całkowitego czasu dostawy** (facts.md).
5. **Prawa autorskie:** nie wklejamy wierszy ani cytatów; zdjęcia i teksty - odpowiedzialność zamawiającego (regulamin §3), przypomniane w poradniku.
6. **Zakaz „zaprojektuj"**, brak eksponowania wbudowanego generatora AI (HOLD); zewnętrzne ChatGPT/Gemini/Midjourney wymienione tylko jako źródło ramki/symbolu.

---

## 5. Linkowanie wewnętrzne (dograne w dniu publikacji)

**Przychodzące do landingu (min. 3 wymagane, jest 6):** strona główna (`SeoContentSection.tsx`, zdanie przed Wszystkimi Świętymi), `/fotonaklejki` (karta „Zdjęcia rodzinne i z wakacji"), `/naklejki-dla-firm` (akapit o akcjach pamięci), wpis `naklejka-ze-zdjecia-...` (punkt „Pamięć o bliskich", `updated` 2026-10-05), wpis `jaki-rozmiar-naklejki-wybrac` (wiersz tabeli, `updated` 2026-10-05), oba nowe wpisy (kilka linków każdy).
**Wychodzące z landingu:** kreator `/` (2× CTA), oba wpisy, `/fotonaklejki`, `/naklejki-dla-firm`, `/naklejki-foliowe`, `/naklejki-die-cut`, `jaki-rozmiar-naklejki-wybrac`, `/zamow-projekt`.
**Stopka:** od 2026-10-05 sezonowy link „Naklejki na znicze ze zdjęciem" w module „Rodzaje naklejek" (`Footer.tsx`, zgoda właściciela, **do 3.11 włącznie**). Po 4.11 chowa się sam po stronie przeglądarki (`ZNICZE_LINK_HIDDEN_FROM`); wpis i stałą usuń z kodu po sezonie. Nagłówek nietknięty.

---

## 6. GEO / AEO

* **Cytowalne tabele:** specyfikacja (15 wierszy), rodzaje zniczy vs naklejka, rozmiary i koszt sztuki (spójne liczby z `ile-kosztuja-naklejki-...`: 49,00 zł / A4, ~4,08 zł za portret 5 x 7 cm), rachunek arkuszy dla 50 i 100 zniczy.
* **FAQ = schemat** z jednej tablicy (10 pytań), odpowiedzi samodzielne, pierwsze zdanie bezpośrednie. Pytania wprost pod PAA: ile kosztuje, jak zrobić samodzielnie, czy wytrzyma deszcz, **czy się nie stopi** (uczciwa odpowiedź), na jakich zniczach, jaki rozmiar, jakie zdjęcie, co napisać, kilka naraz, czy zdążę przed 1.11.
* **`llms.txt` / `llms-full.txt`:** nowa strona + fakt o zniczach + reguła dla agentów („zawsze zaznacz, że odporności na ciepło płomienia nie deklarujemy") - żeby modele cytujące nas nie obiecywały czegoś, czego nie potwierdzamy.
* **Disambiguacja:** „znicz" jako Złoty Znicz (Harry Potter) i klub Znicz Pruszków - świadomie nie celujemy (baza fraz §12).

---

## 7. Zdjęcia - gdzie wgrać

Landing i oba wpisy **działają bez zdjęć** (zgodnie z `rules.md` §11: nie blokujemy publikacji). Foldery istnieją i czekają (każdy z `.gitkeep`):

| Folder | Co tam trafia |
| :--- | :--- |
| `public/landing/naklejki-na-znicze/` | zdjęcia landingu (okładka/OG i 1-3 do treści) |
| `public/blog/znicz-ze-zdjeciem-jak-zrobic-samodzielnie-naklejka-na-znicz/` | okładka wpisu i zdjęcia kroków (skan, przyklejanie, efekt) |
| `public/blog/co-napisac-na-zniczu-napisy-i-dedykacje-dla-bliskich/` | okładka wpisu, naklejka z napisem / odręcznym pismem |

**Czego szukam (lista ujęć, od najważniejszych):**
1. **Znicz szklany z naklejką ze zdjęciem w owalu** - to ujęcie okładkowe i OG.
2. **Znicz solarny lub LED z naklejką** (najbezpieczniejsze podłoże, ważne dla wiarygodności).
3. **Arkusz A4 z naklejkami do zniczy** - portrety 5 x 7 cm i małe dedykacje 4 x 4 cm obok siebie.
4. **Zbliżenie brzegu naklejki na szkle** (przyleganie, brak pęcherzy).
5. **Proces:** zdjęcie starej odbitki telefonem w świetle dziennym / skan; naklejka w dłoni przed przyklejeniem.
6. **Naklejka z odręcznym pismem** lub z samą dedykacją.

**Zasady kadru:** bez płonącego knota blisko naklejki (nie sugerujemy odporności na ciepło) - znicz niezapalony, solarny lub LED; bez widocznych logotypów producentów zniczy; bez rozpoznawalnych twarzy osób trzecich i bez prawdziwych danych zmarłych bez zgody rodziny (najlepiej własna rodzina albo osoba, która wyraziła zgodę); bez wizerunków znaków chronionych. Pliki wystarczą w dowolnym formacie - po wgraniu daj znać, a: skompresuję do JPEG, nadam nazwy SEO, osadzę w treści z altem, ustawię OG, wypalę pasek z logo i wygeneruję piny Pinterest (kolejność: piny z surowych zdjęć, potem logo - `autoblog.md`).

---

## 8. Otwarte punkty (moja rekomendacja przy każdym; nic nie blokuje publikacji)

1. ✅ **Test ciepła - ROZSTRZYGNIĘTE 2026-10-10:** właściciel potwierdził, że na kloszu znicza z płomieniem folia się stopi; treści przepisane na „tylko znicze solarne, LED i na baterie". Poniżej pierwotna rekomendacja (nieaktualna). ~~Jeden znicz szklany z naklejką, palony pod nadzorem 4-6 godzin; sprawdzić brzegi, falowanie i klej po ostygnięciu. Wynik zmienia najważniejszą obiekcję tej niszy („czy się nie stopi") z „nie deklarujemy" na konkret. Wpisz wynik do `facts.md` i odeślij mi - zmienię hero, ramkę, tabelę i FAQ.~~
2. **Data graniczna zamówienia przed 1.11.** Przy 1.11 w niedzielę i produkcji 2-3 dni roboczych plus dostawie bezpieczna data to około **środy 21.10** (rekomendacja do potwierdzenia u przewoźnika). `facts.md` wymaga Twojej zgody na datę; po zgodzie dopiszę ją na landingu, w FAQ i w `llms.txt` z adnotacją „ważne do 2.11.2026".
3. **Gotowy zestaw „Pamięć" w panelu** (dedykacje „Kochanej Mamie", „Kochanemu Tacie", „Pamiętamy" + symbole: anioł, gołąb, świeca, róża), na które klient bez zdjęcia mógłby kliknąć. To najlepsza droga dla osób bez własnej grafiki. Własne grafiki bez treści licencjonowanych; strona tematyczna jest w etapie 2 `strategia-gotowe-zestawy.md`. Rekomendacja: **tak, ale na 2027** (zbyt mało czasu do szczytu na zamówienie grafik i publikację).
4. ✅ **Link sezonowy w stopce - ZROBIONE 2026-10-05** (zgoda właściciela, do 3.11). Do zrobienia po sezonie: usunąć wpis i stałą `ZNICZE_LINK_HIDDEN_FROM` z `src/components/layout/Footer.tsx`.
5. **Search Console:** ręczne „Poproś o zindeksowanie" dla trzech adresów (landing + dwa wpisy). Zrobię ping IndexNow (Bing), ale Google tego nie obsługuje.
6. ✅ **Odświeżenie starych wpisów z sufitem ciepła - ZROBIONE 2026-10-08.** Z `naklejki-z-wlasnym-logo-na-sloiki-i-opakowania` zniknęło „nie odklejają się pod wpływem ciepła" (w zamian: odporności na ciepło płomienia nie deklarujemy, naklejaj z dala od knota), z `...sloiki-z-przyprawami...` - „ani ciepła z kuchenki".

---

## 9. Plan na 2027

* **Sierpień:** odświeżenie landingu (`dateModified`), przegląd bazy fraz o dane GSC z tego sezonu, decyzja o gotowym zestawie „Pamięć".
* **Wrzesień:** zdjęcia i piny Pinterest (Pinterest potrzebuje kilku tygodni przed szczytem).
* **Połowa października:** sezonowy link w stopce, ewentualna data graniczna zamówień.
* **Zasada:** nie budujemy kolejnych stron o tej samej intencji; wzmacniamy landing i dwa wpisy. Nowy wpis tylko na frazę, która w GSC dała wyświetlenia i pozycję > 30.

---

## 10. Dziennik

* **2026-10-05:** rozpoznanie (repo, reguły, geometria arkusza, kształty cięcia), badanie popytu (autouzupełnianie Google PL: 24 zalążki, 407 podpowiedzi; przegląd SERP), baza fraz, landing, dwa wpisy, linkowanie przychodzące, sitemap, `llms.txt`, `facts.md`, plany, skrypt podpowiedzi. Weryfikacja i wdrożenie - patrz commit.
