# Baza fraz: nisza „znicze" (naklejki na znicze, znicz ze zdjęciem)

**Utworzona:** 2026-10-05 · **Okno sezonu:** 5.10 - 2.11.2026 (szczyt pamięci: 1.11 niedziela, 2.11 poniedziałek) + fale całoroczne (§8)
**Strategia i plan prac:** [`strategia-znicze.md`](strategia-znicze.md) · **Strony:** landing `/naklejki-na-znicze`, dwa wpisy blogowe (§9)
**Zasady stylu i fakty:** `landing-agent/rules.md`, `blog-agent/rules.md`, `blog-agent/facts.md` (ten plik NIE jest ich źródłem - tylko mapą fraz)

> **Czym są dane w tej bazie.** Frazy pochodzą z **autouzupełniania Google PL** (ekspansja alfabetyczna 24 zalążków, 2026-10-05; surowiec: [`dane/znicze-podpowiedzi-2026-10-05.json`](dane/znicze-podpowiedzi-2026-10-05.json), 407 unikalnych podpowiedzi) oraz z przeglądu wyników wyszukiwania. Podpowiedź dowodzi, że ludzie **naprawdę wpisują** daną frazę, i pokazuje, jakie dopiski dodają. **Nie mówi, ile razy w miesiącu.** Żadnego wolumenu w tym pliku nie ma i nie wolno go zgadywać - zgodnie z `strategy.md` (checklist decyzyjny) wolumen potwierdzamy w Search Console po starcie (§10). Kolumna „Sygnał": **AC** = podpowiedź Google, **SERP** = potwierdzone w wynikach, **hip.** = hipoteza bez potwierdzenia.

---

## 1. Rozstrzygnięcie z góry: kto szuka i czego

Zdecydowana większość zapytań o „znicze" to **zakup gotowego znicza** (Allegro, sklepy z personalizacją: HoroStudio, Fajna Fabryka, DruKtur, Znicze Flamma, FotoPrezent, Albumy-Foto). My **nie sprzedajemy zniczy**, tylko naklejki. Wygrywamy więc nie głowę „znicz ze zdjęciem" jako zakup, tylko trzy kąty, których sklepy ze zniczami nie obsługują:

| Kąt | Kto szuka | Co dostaje u nas |
| :--- | :--- | :--- |
| **A. Własny znicz + naklejka** | ktoś, kto kupił zwykły znicz (lub ma solarny/LED) i chce go uczynić osobistym | naklejka ze zdjęciem/imieniem od 1 arkusza, 49,00 zł brutto |
| **B. Wiele grobów, jedno zamówienie** | rodzina z kilkoma grobami, parafia, szkoła, firma | wiele wzorów na jednym arkuszu, jedna dostawa |
| **C. Tekst i dedykacja** | ktoś, kto pyta „co napisać na zniczu" | poradnik z gotowymi sformułowaniami, potem naklejka |

Fraza „naklejki na znicze **ze zdjęciem**" nie ma żadnej podpowiedzi Google (AC puste) i żadnej dedykowanej strony w wynikach - to **własny, wąski ogon** o niemal zerowej konkurencji i najczystszej intencji (zakup naklejki). Głowy „znicz ze zdjęciem" (60 podpowiedzi) nie zdobędziemy jako strona produktowa - bierzemy ją wpisem poradnikowym („jak zrobić samodzielnie").

---

## 2. Klaster A - produkt główny: „naklejki na znicze" → **landing `/naklejki-na-znicze`**

| Fraza | Sygnał | Intencja | Rola na stronie | Priorytet |
| :--- | :--- | :--- | :--- | :---: |
| **naklejki na znicze** | AC (głowa, 12 podpowiedzi) | zakupowa | URL, `title`, H1, 1. akapit | **P1** |
| **naklejki na znicze ze zdjęciem** | hip. (brak AC, brak dedykowanej strony w SERP) | zakupowa | `title`, H1, H2 sekcji o zdjęciu | **P1** |
| naklejka na znicz | AC | zakupowa | H2, FAQ | P1 |
| naklejka na znicz personalizowana | AC | zakupowa | H2 | P1 |
| naklejki na znicze szklane | AC | zakupowa | H2 w sekcji „na jakim zniczu" - **tylko szklany klosz znicza solarnego/LED**, nie znicz z płomieniem | P1 |
| naklejki samoprzylepne na znicze | AC | zakupowa | opis materiału (folia winylowa + mocny klej) | P2 |
| naklejki na znicze na cmentarz | AC | zakupowa | opis, FAQ (deszcz i słońce: woda, UV) | P2 |
| naklejki na znicz (bez „e") | AC | zakupowa | wariant w treści | P2 |
| naklejki na znicze dla dzieci | AC | zakupowa, **wrażliwa** | jeden stonowany akapit (imię, daty, motyw anioła) | P3 |
| naklejki na znicze producent | AC + SERP (znicze-artystyczne.pl) | B2B / hurt | sekcja B2B - **uczciwie: bez rabatu ilościowego** | P3 |
| naklejki patriotyczne na znicze | AC | okazjonalna (11.11, 1.08) | FAQ, własny wzór klienta; **bez znaków chronionych** | P3 |
| naklejki na znicze allegro | AC | nawigacyjna (marketplace) | ⛔ nie celujemy | - |
| naklejki wielkanocne na znicze | AC | niszowa, niejasna | ⛔ nie celujemy | - |

---

## 3. Klaster B - zdjęcie (nacisk właściciela) → **landing (H2) + wpis „znicz ze zdjęciem"**

Głowa `znicz ze zdjęciem` ma **60 podpowiedzi** - to najbogatszy klaster w całej niszy, ale zakupowy dla gotowego znicza. Obsługujemy go wpisem poradnikowym (intencja „zrób to sam"), a landing bierze wąski, produktowy ogon.

| Fraza | Sygnał | Intencja | Gdzie | Priorytet |
| :--- | :--- | :--- | :--- | :---: |
| **znicz ze zdjęciem** | AC (głowa, 60) | zakupowa (gotowy znicz) → kąt DIY | wpis: title, H1 | **P1** |
| **znicz ze zdjęciem zmarłego** | AC | zakupowa / poradnikowa | wpis: H2 „jak przygotować zdjęcie"; landing H2 | **P1** |
| znicz ze zdjęciem i dedykacją | AC | zakupowa | landing H2, wpis | P1 |
| znicz ze zdjęciem i napisem | AC | zakupowa | landing, wpis | P1 |
| znicz ze zdjęciem na cmentarz | AC | zakupowa | wpis | P2 |
| znicz personalizowany ze zdjęciem | AC | zakupowa | landing (wariant) | P2 |
| zdjęcie na zniczu / zdjęcie na znicz / zdjęcie w zniczu | AC | poradnikowa | wpis: H2 | P2 |
| znicz solarny ze zdjęciem (+ i dedykacją, na cmentarz, dla taty/mamy) | AC | zakupowa | landing H2 „solar i LED" - **najbezpieczniejsze podłoże** (brak płomienia) | **P1** |
| znicz led ze zdjęciem | AC (1) | zakupowa | landing | P2 |
| znicz ze zdjęciem na dzień babci / dziadka / taty / ojca | AC | okazjonalna, całoroczna (§8) | wpis (akapit „nie tylko 1 listopada") | P2 |
| jak zrobić znicz ze zdjęciem / jak przykleić zdjęcie na znicz | brak AC | poradnikowa | wpis: title | P2 |
| gdzie zamówić znicz ze zdjęciem | AC | zakupowa / porównawcza | wpis: BLUF odpowiada „własny znicz + naklejka" | P2 |
| znicz ze zdjęciem duży / biały / w kształcie serca | AC | zakupowa (kształt znicza) | ⛔ to cecha znicza, nie naklejki | - |
| znicz ze zdjęciem allegro | AC | nawigacyjna | ⛔ | - |

**Adresaci** (każda wersja: „dla mamy", „dla taty", „dla babci", „dla dziadka", „dla męża", „dla żony", „dla syna", „dla córki", „dla brata", „dla siostry", „dla rodziców", „dla przyjaciela/przyjaciółki", „dla wujka", „dla cioci", „dla chrzestnego/chrzestnej", „dla dziecka") ma podpowiedzi przy `znicz ze zdjęciem`, `znicz z napisem`, `znicz z dedykacją`, `napis na znicz` i `naklejka na znicz`. Obsługa: **tabela dedykacji wg adresata** we wpisie „co napisać na zniczu" (§4), krótka lista adresatów w FAQ landingu.

---

## 4. Klaster C - tekst, napis, dedykacja → **wpis „co napisać na zniczu"**

Czysta intencja informacyjna z silnym popytem (podpowiedzi w każdej odmianie adresata), a jedyny sposób, żeby naklejka z napisem powstała, to wiedzieć, co na niej ma stać.

| Fraza | Sygnał | Gdzie | Priorytet |
| :--- | :--- | :--- | :---: |
| **co napisać na zniczu** (+ dla mamy / taty / babci / dziadka) | AC | wpis: title, H1 | **P1** |
| **napis na znicz** (+ dla mamy, taty, babci, dziadka, brata, dziecka, męża, wujka) | AC (18) | wpis: H2 per adresat | **P1** |
| napis na znicz kochanej mamie / kochanemu tacie / kochanym rodzicom / kochanym dziadkom / kochanemu bratu / kochanemu synowi | AC | wpis: nagłówki tabeli (mianownik → forma „kochanej/kochanemu") | P1 |
| dedykacja na znicz (+ dla babci, brata, dziadka, mamy, przyjaciela, rodziców, syna, taty) | AC (14) | wpis: H2 | P1 |
| jaki napis na znicz | AC | wpis: FAQ | P2 |
| znicz z napisem (76 podpowiedzi) / znicz z dedykacją (56) | AC | wpis, landing (wariant) | P2 |
| znicz z imieniem / znicz z własnym napisem / znicz z napisem na zamówienie | AC | landing, wpis | P2 |
| napis samoprzylepny na znicz | AC | landing H2 | P2 |
| cytaty na znicz dla dziecka / tekst na znicz dla dziecka | AC | wpis: **stonowany** podrozdział „znicz dla dziecka" | P3 |

**Popularne krótkie formuły** pojawiające się w podpowiedziach (wolno je podać jako wspólne sformułowania): „Pamiętamy", „Kochamy i pamiętamy", „Na zawsze w naszych sercach", „Spoczywaj w pokoju", „Wieczny odpoczynek", „Kocham Cię". ⚠️ **Nie wklejamy** treści wierszy ani cytatów z utworów. W podpowiedziach pojawiają się też frazy pochodzące z cudzych utworów (m.in. „Spieszmy się kochać ludzi" - tytuł i wers ks. Twardowskiego, chronione prawem autorskim; „Są ludzie i chwile, których się nie zapomina" - autorstwo niepotwierdzone). W poradniku zamiast nich dajemy własne, krótkie formuły i przypominamy, że za prawa do wgranych tekstów odpowiada zamawiający (regulamin §3).

---

## 5. Klaster D - personalizacja / „znicz na zamówienie" (konkurencja sklepów - tylko warianty w treści)

| Fraza | Sygnał | Decyzja |
| :--- | :--- | :--- |
| znicze personalizowane (+ dla taty / mamy / babci / dziadka / rodziców / dziecka / brata / syna / męża) | AC (16) | **wariant w treści** landingu i wpisów; głowa to sklepy ze zniczami |
| znicze z nadrukiem / znicze z własnym nadrukiem | AC | wariant w treści |
| znicz na zamówienie / znicz na zamówienie ze zdjęciem / znicz z napisem na zamówienie | AC | FAQ („czy sprzedajecie gotowe znicze" → nie, naklejki) |
| znicz z grawerem | AC | ⛔ inna technologia (grawerowanie szkła) - nie celujemy |
| znicze solarne (głowa, ~200 podpowiedzi) | AC | ⛔ **retail** (Biedronka, Castorama, Allegro, Temu…) - nie celujemy |
| wkłady do zniczy (~213 podpowiedzi) | AC | ⛔ **retail** - inny produkt |

---

## 6. Klaster E - podłoże: solar, LED, szkło, plastik

Który znicz przyjmie naklejkę - sekcja „na jakim zniczu zadziała naklejka" na landingu (tabela). Frazy: `znicze solarne personalizowane` (AC), `znicz solarny z dedykacją` (AC, ~12 wariantów), `znicz solarny z napisem` (AC, ~12 wariantów), `znicz led z dedykacją` (AC), `znicz lampion z dedykacją` (AC), `znicz szklany`, `lampion cmentarny`.
**Priorytet rośnie przy znicz solarny/LED**: brak otwartego płomienia = brak ryzyka nagrzewania folii od knota (patrz §11; od 2026-10-10 to jedyne dopuszczone podłoże - na kloszu znicza z płomieniem folia się stopi).

---

## 7. Klaster F - firmy, szkoły, parafie, organizacje → **sekcja na landingu + `/naklejki-dla-firm`**

| Fraza | Sygnał | Uwagi | Priorytet |
| :--- | :--- | :--- | :---: |
| znicze z logo firmy | AC (1) | ⚠️ **dwuznaczne** - „znicz logo" zwraca klub Znicz Pruszków i markę Znicz (patrz §12); frazę prowadzimy tylko w pełnej formie „z logo firmy" | P2 |
| znicze dla firm / znicze firmy | AC | wyniki to dostawcy zniczy (Bartek, Cortina, Bispol, Maxpol) - nie nasz produkt | P3 |
| znicze reklamowe | hip. | brak AC | P3 |
| znicze pamięci / światło pamięci / światełko pamięci | AC | akcje szkolne, harcerskie, samorządowe | P3 |
| naklejki na znicze producent / hurt | AC + SERP | **brak rabatu hurtowego** (facts.md): uczciwy rachunek arkuszy zamiast obietnicy ceny za wolumen | P3 |

---

## 8. Kalendarz popytu (dla planowania odświeżeń; sezonowość = hipoteza do sprawdzenia w GSC)

| Okno | Wydarzenie | Frazy / działanie |
| :--- | :--- | :--- |
| **5.10 - 31.10.2026** | zbliża się Wszystkich Świętych (1.11 = **niedziela**) | publikacja i indeksacja; cały klaster A-C |
| **~19.10 - 1.11** | typowy szczyt zapytań o znicze (hip.) | monitoring GSC co tydzień (§10) |
| **2.11 (poniedziałek)** | Zaduszki | po 2.11 ruch gwałtownie spada - nie planuj nowych wpisów |
| **11.11 (środa)** | Narodowe Święto Niepodległości | `znicz patriotyczny`, `naklejki patriotyczne na znicze` - tylko FAQ |
| **grudzień** | znicze na groby w Boże Narodzenie | `znicz świąteczny` - hip.; ewentualnie 1 akapit w odświeżeniu |
| **21-22.01** | Dzień Babci / Dzień Dziadka | `znicz na dzień babci / dziadka ze zdjęciem` (AC) |
| **26.05 / 23.06** | Dzień Matki / Dzień Ojca | `znicz na dzień mamy / taty / ojca ze zdjęciem` (AC) |
| **1.08** | rocznica Powstania Warszawskiego | `znicz patriotyczny` |
| cały rok | rocznice śmierci, urodziny zmarłych, pogrzeby | `znicz w dzień pogrzebu` (AC), ogon bez sezonu |

**Wniosek:** niższy, ale **całoroczny** popyt (okazje rodzinne) uzasadnia **evergreenowy landing** pod stałym adresem, a nie wpis „sezonowy". Zasada z `strategia-swieta-2026.md`: URL bez roku, odświeżenie polem `updated`/`dateModified`. **W 2027 start publikacji w sierpniu**, nie na 4 tygodnie przed szczytem.

---

## 9. Mapa: fraza → strona (zero kanibalizacji)

| Strona | Typ | Główne frazy | Intencja |
| :--- | :--- | :--- | :--- |
| `/naklejki-na-znicze` | landing komercyjny | naklejki na znicze, naklejki na znicze ze zdjęciem, naklejka na znicz (personalizowana / szklane / samoprzylepne) | zakup naklejki |
| `/blog/znicz-ze-zdjeciem-jak-zrobic-samodzielnie-naklejka-na-znicz` | wpis poradnikowy | znicz ze zdjęciem, znicz ze zdjęciem zmarłego, zdjęcie na zniczu, jak zrobić znicz ze zdjęciem | „zrób to sam" |
| `/blog/co-napisac-na-zniczu-napisy-i-dedykacje-dla-bliskich` | wpis poradnikowy | co napisać na zniczu, napis na znicz, dedykacja na znicz, znicz z napisem | tekst i dedykacja |
| `/fotonaklejki` | landing (istniejący) | link „w bok" do znicza - NIE celuje we frazy znicze | produkt ogólny |
| `/naklejki-dla-firm` | landing (istniejący) | link „w bok" do znicza - sekcja B2B znicza odsyła tutaj | firmy |
| `/` | kreator | **nie** celuje w frazy znicze; dostaje 1 link wychodzący do landingu | konwersja |

---

## 10. Pomiar - jak z tej bazy korzystać po starcie

1. **Filtr w Search Console** (Skuteczność → Zapytanie → regex): `znicz|zniczu|zniczy|cmentarz|dedykacj`. Zapisz widok; porównuj tydzień do tygodnia.
2. **Daty kontrolne 2026:** **8.10** (czy landing i wpisy są zaindeksowane: „Sprawdzanie adresu URL"), **15.10**, **22.10**, **29.10**, **3.11** (rozliczenie sezonu), **16.11** (czy `znicz na dzień …` wygasa).
3. **Co odczytać:** (a) zapytania, które faktycznie wywołały nasze strony - dopisz je do tej bazy z wolumenem (wyświetlenia) zamiast „AC"; (b) strona wyświetlana pod zapytanie, na które NIE celowała (kanibalizacja); (c) CTR landingu vs wpisów.
4. **Aktualizacja bazy:** zamień kolumnę „Sygnał" na „Wyśw./poz. GSC" dla fraz, które pojawiły się w danych; dopisz nowe z wyników. Podpowiedzi odświeżysz poleceniem:

```bash
node scripts/podpowiedzi-google.mjs "naklejki na znicze" "znicz ze zdjęciem" > landing-agent/dane/znicze-podpowiedzi-RRRR-MM-DD.json
```

5. **Decyzje po sezonie (3.11):** fraza z wyświetleniami i pozycją 11-30 → wzmocnić H2/FAQ landingu; fraza z wyświetleniami i pozycją > 30 → rozważyć osobny wpis; fraza bez wyświetleń → zostaje w bazie jako hipoteza do końca 2027, nie buduj pod nią niczego.

---

## 11. Pytania użytkowników (AEO) - gotowe do FAQ i odpowiedzi „bezpośredniej"

Dokładne sformułowania do nagłówków H3 i pytań schematu `FAQPage`. **Odpowiedź = pierwsze zdanie bezpośrednie.**

| Pytanie | Gdzie | Uwaga merytoryczna |
| :--- | :--- | :--- |
| Ile kosztuje naklejka na znicz? | landing FAQ 1 | 49,00 zł brutto za arkusz A4; koszt sztuki z tabeli rozmiarów (orientacyjnie) |
| Jak zrobić znicz ze zdjęciem samodzielnie? | landing FAQ 2, wpis | własny znicz + naklejka |
| Czy naklejka na znicz wytrzyma deszcz i słońce na cmentarzu? | landing FAQ 3 | **tylko woda i UV** (facts.md); **bez** mrozu, liczby lat, ścierania |
| Czy naklejka nie stopi się od płomienia znicza? | landing FAQ 4, wpis | **Stopi się na kloszu znicza z płomieniem** (właściciel, 2026-10-10) - naklejki tylko na znicze solarne/LED/na baterie |
| Na jakich zniczach można nakleić naklejkę? | landing FAQ 5 | tylko bez otwartego płomienia (solarne, LED, na baterie), gładki klosz ze szkła lub plastiku; nie na ryflowane/ażurowe; **nie na klosz znicza z płomieniem** ani na wkład |
| Jaki rozmiar naklejki wybrać na znicz? | landing FAQ 6 | zmierz gładkie pole; tabela rozmiarów |
| Jakie zdjęcie nadaje się na naklejkę na znicz? | landing FAQ 7, wpis | 300 DPI; stary odbitkę zeskanować lub sfotografować w świetle dziennym; **nie retuszujemy** |
| Co napisać na naklejce na znicz? | landing FAQ 8, wpis „co napisać" | **kreator nie ma edytora tekstu** - napis przygotowany w Canvie/Wordzie |
| Czy mogę zamówić kilka różnych naklejek na znicze naraz? | landing FAQ 9 | tak - wiele wzorów na arkuszu, wiele arkuszy w jednej paczce |
| Czy zdążę z zamówieniem przed 1 listopada? | landing FAQ 10 | produkcja 2-3 dni robocze + paczkomat; **całkowitego terminu i daty granicznej nie deklarujemy** |
| Czy odklejenie naklejki zostawia ślady? | wpis | mocny klej, bez śladów; **nie** repozycjonowalna |
| Jak przykleić naklejkę na szklany znicz? | wpis | sucho, czysto, odtłuszczone, w temperaturze pokojowej, dociskać od środka |

---

## 12. Frazy-pułapki i dwuznaczności (NIE celować, uważać w treści)

| Wzorzec | Dlaczego |
| :--- | :--- |
| `znicz` = **Złoty Znicz (Harry Potter)** | „jak zrobić znicz harry potter", „znicz harry potter z masy cukrowej" - ruch o innej intencji; nie używamy słowa „znicz" w znaczeniu zabawy |
| `znicz` = **emotka / klawiatura / telefon** | „jak zrobić znicz emotka / na klawiaturze" - nie nasz klient |
| `znicz logo`, `znicz pruszków logo`, `znicz kłobuck logo` | klub piłkarski Znicz Pruszków i marki z nazwą Znicz - **nie** używamy znaków ani nazw; „znicze z logo firmy" tylko w pełnej formie |
| `znicze solarne` + sklep (Biedronka, Lidl, Castorama, Leroy Merlin, Allegro, Temu) | retail; nasz produkt to naklejka |
| `wkłady do zniczy` (+ marki: Bispol, Bolsius, Kaganek, Maxpol…) | retail; nie nasz produkt; **nie** używamy nazw marek producentów zniczy |
| `… allegro`, `… olx`, `… temu`, `… erli` | nawigacyjne |
| `znicze hurt / hurtownia` | wymagają cennika ilościowego - **nie mamy rabatów hurtowych** |
| wiersze i cytaty autorskie | prawa autorskie - nie wklejamy |
| znaki państwowe (godło) | ustawa o godle, barwach i hymnie RP ogranicza użycie godła; **nie** podsuwamy go jako gotowego motywu |
| tekst o **żałobie** w tonie sprzedażowym | zakazane: wykrzykniki, „okazja", „promocja", odliczanie, „ostatnia szansa", emoji |

---

## 13. Zasady kopii dla tej niszy (nadpisują domyślny ton CRO)

1. **Spokojny, rzeczowy ton.** Zero wykrzykników, zero emoji, zero „okazji" i odliczania do 1 listopada. Pamięć nie jest promocją.
2. **Zdjęcia osób** - nie wymyślamy historii, nazwisk ani „zdjęć klientów"; pokazujemy wyłącznie materiały, które właściciel sam dostarczy (§ strategia).
3. **Folia nie jest odporna na ciepło płomienia** (właściciel, 2026-10-10: na kloszu znicza z płomieniem się stopi - naklejki tylko na znicze solarne/LED/na baterie). **Nie obiecujemy** mrozu, liczby lat, kontaktu z żywnością, zmywarki. **Obiecujemy** wodę, UV, mocny klej bez śladów przy odklejaniu, 300 DPI.
4. **„Zaprojektuj"** wobec naklejki - zakaz; **kreator nie ma edytora tekstu** - napis/dedykację przygotowuje się poza kreatorem.
5. **Zdjęcie ze znaną postacią/marką** - jak w pozostałych treściach: bez postaci licencjonowanych i logotypów.
6. Dywiz „-", nie półpauza.
