# 🗂️ Gotowe zestawy tematyczne - strategia SEO / GEO / AEO i Google Merchant Center

**Data:** 2026-10-03 · **Horyzont:** 3.10.2026 - 28.02.2027 · **Podstawa:** `landing-agent/strategy.md` i `rules.md`, `blog-agent/facts.md`, `blog-agent/strategia-swieta-2026.md`, `analiza-nisz-2026-09-09.md` (karta P1), eksport GSC 16.06-28.08.2026, stan produkcyjny gotowych zestawów z 3.10.2026

> **Status: plan przyjęty 2026-10-03, zwroty w wariancie A** (sekcja 15, pkt 1). Etapy i polecenia, które je uruchamiają, są rozpisane w panelu właściciela (panel.jdalaszynski.pl → MałeNaklejki → „Gotowe zestawy") - tam też odhacza się wykonane kroki. Zadania **nie** trafiły do kolejek `landing-agent/plan.md` ani `blog-agent/plan.md`, więc autoblog nie zacznie niczego sam. Co już zrobiono: dziennik na końcu pliku (sekcja 17).

> **Nazewnictwo od 2026-10-05:** funkcja nazywa się **„gotowe zestawy”** (krótko: nawigacja, przyciski, stopka) i **„gotowe zestawy naklejek”** (tytuły, H1, opisy, SEO) - wcześniej „gotowe arkusze”. **Gotowy zestaw = jeden arkusz A4 z naklejkami**, więc „arkusz” zostaje dla fizycznego formatu („49,00 zł brutto za zestaw”, „46 naklejek na arkuszu A4”) i dla kreatora (układanie własnego arkusza). Cały dokument został przepisany na nową nazwę; **frazy z danych GSC i hipotezy fraz zostają w oryginalnym brzmieniu** (np. `arkusz naklejek na zamówienie`). Adresy: `/gotowe-zestawy`, `/gotowe-zestawy/<slug>`, `/api/gotowe-zestawy/*`, panel sklepu `/admin/zestawy`, kreator `/?zestaw=<id>`, galeria `/#gotowe-zestawy`; stare adresy (`/gotowe-arkusze…`, `/admin/arkusze…`, `/api/gotowe-arkusze…`) przekierowują na stałe (308), a w kreatorze działają też `/?arkusz=<id>` i `/#gotowe-arkusze`.

---

## 1. W skrócie

**Gotowe zestawy odblokowują frazy, których do tej pory świadomie nie graliśmy.** Strategia świąteczna zapisała wprost: głowa `naklejki świąteczne` bez modyfikatora to intencja "gotowy zestaw", którego nie sprzedajemy - warunek powrotu: katalog gotowych zestawów. Ten warunek właśnie się spełnił. To samo dotyczy `naklejki jesienne`, `naklejki halloween`, `naklejki do planera`, `naklejki książkowe` i każdej innej frazy, w której ktoś szuka wzoru, a nie druku własnego pliku.

**Dziś nie da się tego jednak ani zaindeksować, ani wystawić w Google.** Zestaw istnieje wyłącznie jako pozycja w oknie galerii na stronie głównej. Nie ma własnego adresu, tytułu, opisu ani przycisku zakupu na stronie, którą widzi robot. Dlatego plan zaczyna się od trzech warstw adresów, a dopiero potem od treści:

1. **Katalog** `/gotowe-zestawy` - jedna strona zbiorcza (frazy: gotowe naklejki, zestaw naklejek, wzory naklejek).
2. **Strony tematyczne** na adresach z frazą, np. `/naklejki-swiateczne`, `/naklejki-jesienne` - tu wygrywamy słowa kluczowe. Każda ma własną treść, tabelę i FAQ, a listę zestawów bierze z panelu.
3. **Strona zestawu** `/gotowe-zestawy/<slug>` - produkt z ceną i przyciskiem "Dodaj do koszyka". Bez niej nie ma Google Merchant Center.

**Google Merchant Center: tak, da się - pod pięcioma warunkami** (sekcja 8): strona produktu z ceną i zakupem, zdjęcie w wyższej rozdzielczości, plik produktowy (feed), oznaczenie grafik wygenerowanych przez AI oraz - najważniejsze - **uporządkowanie polityki zwrotów**, bo nieedytowany gotowy zestaw najpewniej nie jest "rzeczą wyprodukowaną według specyfikacji konsumenta" i wyłączenie z §7 regulaminu może go nie obejmować.

**Kolejność:** infrastruktura i strona świąteczna do połowy października (sezon rusza w listopadzie i to jest największa okazja roku), Merchant do końca października, tematy całoroczne w listopadzie. Halloween 2026 traktujemy jako bonus, nie cel - 28 dni to za mało na nową stronę.

---

## 2. Punkt wyjścia

### 2.1 Co jest na produkcji
* Panel: `/admin/zestawy` (zestawy, baza naklejek), tryb widoczności `Wyłączony / Podgląd / Włączony` w ustawieniach. **Stan 3.10: tryb Wyłączony.**
* Opublikowane zestawy: **5** - Jesień: *Książkowy Raj* (53 naklejki), *Jesieniarski Miszmasz* (44), *Jesienna Kawka* (54), *Jesieniarskie Strachy* (54, motyw Halloween); Zima: *Zimna Zima* (37, z banerami "Merry Christmas" / "Wesołych Świąt"). Szkic: *Dyniowe Szaleństwo* (62).
* Sklep (wdrożone 3.10): wejście do galerii przy kreatorze, galeria z kategoriami i podglądem wzoru, wczytanie do kreatora, edycja, koszyk. Dwa linki, na których opiera się ten plan:
  * `/#gotowe-zestawy` - otwiera galerię,
  * `/?zestaw=<id>` - otwiera kreator z wczytanym wzorem.
* Koszyk i zamówienie nie odróżniają gotowego zestawu od własnego: to zwykły "Zestaw Naklejek" za 49,00 zł.

### 2.2 Co mówią dane
| Sygnał | Wartość | Wniosek |
| :--- | :--- | :--- |
| Zapytania o wzory (`wzory na naklejki`, `pomysły na naklejki`, `gotowe naklejki`, `fajne wzory`...) | razem **43 wyświetlenia, pozycja ok. 8, 0 kliknięć** | stoimy wysoko i nikt nie klika, bo odpowiadamy artykułem na pytanie o produkt |
| Wpis `fajne-wzory-i-pomysly...` | **170 wyświetleń, 0 kliknięć**, pozycja 8,99 | pierwszy kandydat do podpięcia pod katalog |
| `arkusz naklejek na zamówienie` | 9 wyśw., poz. 12,89 | leksyk "arkusz" działa |
| `zestaw naklejek do szkoły / przedszkola` | 4 + 1 + 1 + 1 wyśw., poz. 13-18 | popyt na gotowe zestawy dla dzieci |
| Frazy sezonowe (jesień, Halloween, święta) | **zero w danych** | eksport kończy się 28.08. Brak zapytania = brak pokrycia, nie brak popytu (zasada ze `strategy.md` §7) |

**Wszystkie wolumeny fraz tematycznych w tym dokumencie są hipotezami.** Nie mamy narzędzia do fraz ani danych z sezonu. Weryfikacja: Planer słów kluczowych (darmowy po założeniu konta Google Ads, które i tak przyda się do Merchant Center) oraz eksport GSC 3 tygodnie po publikacji każdej strony.

### 2.3 Jak wyglądają wyniki wyszukiwania
Rekonesans z 3.10 dla `naklejki jesienne`, `naklejki do planera`, `naklejki świąteczne`:
* wyniki zajmują **strony produktów i kategorii** dużych sprzedawców (Etsy, Empik, TaniaKsiążka, Kaufland, Leroy Merlin, Action), nie poradniki,
* sprzedawane są głównie **małe papierowe arkusiki** po kilkanaście-kilkadziesiąt naklejek,
* dla tych fraz Google pokazuje siatki produktów - kto nie ma produktu w Merchant Center, ten w nich nie istnieje.

Dwa wnioski. Po pierwsze, sama treść nie wystarczy - potrzebujemy obecności **produktowej** (dane strukturalne `Product` + feed). Po drugie, nie wygramy ceną za sztukę, więc gramy tym, czego tam nie ma: **duży arkusz A4 z folii winylowej, kilkadziesiąt naklejek, odporny na wodę i UV, który można przed zamówieniem zmienić po swojemu.** Danych konkurencji nie podajemy liczbowo (`facts.md`).

### 2.4 Czego brakuje (i co blokuje resztę)
| Brak | Skutek |
| :--- | :--- |
| Zestaw nie ma adresu URL | nie da się go zaindeksować, podlinkować ani wystawić w Merchant |
| W panelu nie ma pól: slug, opis, lista motywów, tekst alternatywny | strona zestawu nie miałaby unikalnej treści |
| Podgląd zestawu ma 720 px szerokości | Google zaleca 1500 px; od 31.01.2027 minimum to 500 px (dziś spełniamy, ale bez zapasu jakości) |
| Zakup wymaga przejścia przez kreator | strona produktu w Merchant powinna pozwalać kupić ten produkt wprost |
| Analityka: każdy zestaw to `arkusz-a4` | nie dowiemy się, czy gotowe zestawy i które tematy sprzedają |
| Regulamin §7: brak zwrotów dla wszystkiego | patrz 8.4 - ryzyko prawne i ryzyko odrzucenia w Merchant |
| Kategorie w panelu to pory roku ("Jesień", "Zima") | szukający myśli tematem ("Halloween", "książki", "święta"), nie porą roku |

---

## 3. Teza

1. **Gramy o głowy tematyczne, ale produktem, nie artykułem.** Strona tematyczna to strona kategorii sklepu: siatka zestawów z cenami u góry, treść pod spodem.
2. **Jedna strona na jeden temat, minimum 4 zestawy.** Strona z jednym zestawem to thin page. Temat, który nie ma 4 zestawów, żyje jako sekcja szerszej strony (np. Halloween w `/naklejki-jesienne`).
3. **Gotowy zestaw sprzedaje drugi zestaw.** Zysk bierze się z liczby zestawów na zamówienie (analiza nisz, §1). Każda strona tematyczna i każda strona zestawu kończy się propozycją "dołóż zestaw z własnymi naklejkami - dostawa liczona raz".
4. **Edytowalność to nasz wyróżnik, nie przypis.** "Zmień, usuń, dodaj własne" powtarza się w pierwszym ekranie, w FAQ i w danych dla modeli LLM. Tego nie da żaden arkusik z sieciówki.

---

## 4. Architektura adresów

```
                                  /  (kreator = money page, bez zmian)
                                  ▲            ▲
                 /?zestaw=<id>    │            │   CTA "ułóż własny zestaw"
                                  │            │
        ┌──────────── /gotowe-zestawy  (katalog, ItemList) ────────────┐
        ▼                         ▼                         ▼          ▼
 /naklejki-swiateczne     /naklejki-jesienne      /naklejki-do-planera   ...
 (strona tematyczna)      (+ sekcja Halloween)    (całoroczna)
        │                         │                         │
        ▼                         ▼                         ▼
 /gotowe-zestawy/<slug>   /gotowe-zestawy/<slug>   /gotowe-zestawy/<slug>
 (produkt: Product/Offer, "Dodaj do koszyka", źródło dla Merchant)
```

| Warstwa | Adres | Fraza główna | Dane strukturalne | Skąd treść |
| :--- | :--- | :--- | :--- | :--- |
| Katalog | `/gotowe-zestawy` | gotowe naklejki, zestaw naklejek, wzory naklejek | `CollectionPage` + `ItemList` + `BreadcrumbList` + `FAQPage` | kod (stała treść) + zestawy z panelu |
| Temat | `/naklejki-<temat>` (top-level, zgodnie z `rules.md` §7) | głowa tematyczna, np. `naklejki świąteczne` | `CollectionPage` + `ItemList` + `FAQPage` + `BreadcrumbList` | treść pisana ręcznie (plik tematu), zestawy z panelu po kategorii |
| Produkt | `/gotowe-zestawy/<slug>` | nazwa + motyw, długi ogon | `Product` + `Offer` + `BreadcrumbList` | pola z panelu |

**Dlaczego tematy na top-level, a nie `/gotowe-zestawy/jesien`:** adres z dokładną frazą to nasza sprawdzona konwencja (`/fotonaklejki` z pozycji 27-39 na 17 w miesiąc, `/wlepki-na-zamowienie`). Strona tematyczna jest landingiem, tylko z dynamiczną siatką produktów. Technicznie: jeden wspólny komponent szablonu + mały plik treści na temat, więc nowy temat to kwadrans kodu i reszta pisania.

**Tryb widoczności obowiązuje także tutaj:** przy trybie innym niż "Włączony" wszystkie trzy warstwy zwracają 404 i znikają z mapy strony.

### 4.1 Zero kanibalizacji - rozdział intencji
| Para stron | Ryzyko | Rozdział |
| :--- | :--- | :--- |
| `/` vs katalog | "naklejki na zamówienie" | katalog nigdy nie używa "na zamówienie / z własnym nadrukiem" w tytule i H1; jego leksyk to "gotowe / wzory / zestaw / zestaw" |
| hub `naklejki-swiateczne-i-etykiety-na-prezenty` vs `/naklejki-swiateczne` | ta sama głowa | hub zostaje przy **personalizacji** ("z własnym nadrukiem", "etykiety na prezenty z imieniem") i poradniku; landing bierze **gotowe wzory** ("gotowe arkusze A4"). Hub linkuje do landingu w pierwszym ekranie ("nie masz grafiki? wybierz gotowy zestaw"), landing do huba w sekcji "z imieniem i własnym zdjęciem". To dokładnie ten rozdział, który zadziałał przy wlepkach (poradnik vs `/wlepki-na-zamowienie`) |
| `fajne-wzory-i-pomysly...` vs katalog | "wzory na naklejki" | wpis zostaje inspiracją wg zastosowania, ale dostaje u góry blok "gotowe zestawy z ceną" i oddaje katalogowi frazy zakupowe |
| `male-naklejki-na-laptopa...` vs przyszłe `/naklejki-na-laptopa` | "naklejki na laptopa" | bez zmian względem `landing-agent/plan.md`: landing dopiero po potwierdzeniu w GSC; gotowe zestawy robią z niego realną ofertę, więc kandydat awansuje z "pending" na "po danych z listopada" |
| strona tematyczna vs strona zestawu | ta sama fraza tematu | temat = głowa; zestaw = nazwa własna + motyw ("naklejki z kawą i dyniami"). Tytuł strony zestawu nie zaczyna się od głowy tematu |

---

## 5. Mapa tematów i kalendarz

Wolumeny to hipotezy. Kolumna "zestawy" pokazuje stan na 3.10 i ile trzeba dorobić do progu 4.

| # | Temat | Adres | Frazy (hipotezy) | Zestawy dziś → potrzeba | Okno publikacji | Priorytet |
| ---: | :--- | :--- | :--- | :--- | :--- | :--- |
| 1 | **Święta / Boże Narodzenie** | `/naklejki-swiateczne` | naklejki świąteczne, naklejki bożonarodzeniowe, naklejki na prezenty, naklejki zimowe, naklejki do kalendarza adwentowego | 1 → **6** (w tym "Dla / Od" i numery 1-24 z §12 pkt 4 strategii świątecznej) | **do 17.10.2026** | 🔴 |
| 2 | **Jesień** (+ sekcja Halloween) | `/naklejki-jesienne` | naklejki jesienne, naklejki dynie, naklejki halloween, naklejki do jesiennego planera | 4 (+1 szkic) → 5 | do 17.10.2026 | 🟠 (sezon już trwa, strona pracuje na 2027) |
| 3 | **Planer / bullet journal** | `/naklejki-do-planera` | naklejki do planera, naklejki do bullet journala, naklejki do kalendarza, naklejki do journalingu | 0 → 4 (ikony i dni tygodnia, trackery, dekoracyjne, miesiące) | 2-13.11.2026 | 🔴 całoroczny |
| 4 | **Książki** | `/naklejki-ksiazkowe` | naklejki książkowe, naklejki dla mola książkowego, naklejki na czytnik | 1 → 4 | 16-27.11.2026 (prezent dla czytelnika) | 🟠 całoroczny |
| 5 | **Dla dzieci - motywacyjne i do szkoły** | `/naklejki-motywacyjne-dla-dzieci` | naklejki motywacyjne dla dzieci, naklejki nagrody, zestaw naklejek do szkoły / przedszkola | 0 → 4 | styczeń 2027 (drugi semestr), odświeżenie w sierpniu | 🟠 sygnał w GSC |
| 6 | **Walentynki** | `/naklejki-walentynkowe` | naklejki walentynkowe, naklejki serduszka | 0 → 4 | do 10.01.2027 (spójne z B7) | 🟡 |
| 7 | **Halloween** (osobna strona) | `/naklejki-halloween` | naklejki halloween, naklejki dynie i duchy | 1 (+1 szkic) → 4 | **wrzesień 2027**; w 2026 tylko sekcja w #2 | 🗓️ |
| 8 | Wielkanoc, Dzień Matki, wakacje | - | - | - | decyzja po danych ze świąt i walentynek | 🗓️ |
| 9 | Kawa, rośliny, koty i psy, kosmos | sekcje katalogu | długi ogon | 1 (kawa) | bez osobnych stron, dopóki GSC nie pokaże zapytań | ⛔ na razie |

**Kategorie w panelu trzeba przemianować z pór roku na tematy** (Święta, Jesień, Halloween, Książki, Planer...). Jeden zestaw powinien móc należeć do dwóch tematów (*Jesieniarskie Strachy* = Jesień + Halloween) - dziś ma jedną kategorię.

**Nazwy zestawów zostają** (są charakterne), ale strona zestawu dostaje opisowy podtytuł z frazą, np. *Jesienna Kawka - naklejki jesienne z kawą i dyniami, arkusz A4 (54 szt.)*.

---

## 6. Wzorzec strony tematycznej

Anatomia z `rules.md` §1 z jedną zmianą: **siatka produktów stoi nad treścią**.

1. Breadcrumbs: Kreator → Gotowe zestawy → [Temat].
2. Hero: H1 z głową (np. "Naklejki świąteczne - gotowe zestawy") + BLUF w 2-3 zdaniach: ile wzorów, ile naklejek w zestawie, folia winylowa, 49,00 zł brutto za zestaw, produkcja 2-3 dni robocze, możliwość zmiany przed zamówieniem. Data ostatniej aktualizacji.
3. **Siatka zestawów** (obraz, nazwa, liczba naklejek, cena, "Zobacz" → strona zestawu, "Dopasuj w kreatorze" → `/?zestaw=<id>`).
4. Tabela wzorów - cytowalna: `Zestaw | Motywy | Liczba naklejek | Największa naklejka`.
5. "Co możesz zmienić" - trzy kroki: wybierz, dopasuj (zmień rozmiar, usuń, dodaj własne zdjęcie lub imię), zamów.
6. Tabela "1 / 2 / 3 zestawy → cena z jedną dostawą" (wzorzec ze strategii świątecznej §3) + zachęta do dołożenia własnego zestawu.
7. Zastosowania tematu (3-5 akapitów z linkami do spoke'ów).
8. FAQ 6-8 pytań z jednej tablicy (widok == schemat).
9. Final CTA: katalog + kreator.

**Długość:** 600-900 słów poza siatką. **Fakty wyłącznie z `facts.md`** - w tym: odporność tylko woda i UV, nie do zmywarki, klej mocny i nierepozycjonowalny.

**Zakazy brandowe obowiązują:** nigdzie "zaprojektowaliśmy", "projektuj", "edytor grafiki". Poprawnie: "gotowy zestaw do zamówienia", "dopasuj zestaw", "ułóż po swojemu". Generatora AI nie eksponujemy (HOLD) - o pochodzeniu grafik strona nie mówi, a oznaczenie AI trafia do metadanych zdjęć dla Merchant (8.4).

**Prawa autorskie:** zero postaci licencjonowanych, logotypów i nazw marek na arkuszach i w tekstach. Dotyczy zwłaszcza Halloween i świąt.

---

## 7. Wzorzec strony zestawu (produkt)

* **H1:** nazwa + opisowy podtytuł z motywem. **Title:** `<Nazwa> - <motyw>, arkusz A4 <n> naklejek | MałeNaklejki`.
* **Pierwszy ekran:** duży obraz zestawu, cena **49,00 zł brutto**, "<n> naklejek, folia winylowa, arkusz A4", dostawa do paczkomatu 19,99 zł, produkcja 2-3 dni robocze, wybór formy (na arkuszu / pojedyncze sztuki), liczba zestawów.
* **Dwa przyciski:**
  * **"Dodaj do koszyka"** - dodaje nieedytowany zestaw od razu. Wymaga plików do druku przygotowanych przy publikacji (sekcja 11), dzięki czemu klient nie czeka na ich złożenie w przeglądarce.
  * **"Dopasuj w kreatorze"** - `/?zestaw=<id>`.
* **Opis** (80-150 słów, unikalny, z panelu) + lista motywów ("dynie, liście klonu, kubek kawy, cynamon...") - to jest treść, po której strona rankuje w długim ogonie i którą cytują modele.
* **Specyfikacja** - krótka tabela (materiał, format, liczba naklejek, cięcie, odporność, mycie ręczne). Parafrazowana, nie kopiowana między stronami; długie wyjaśnienia zostają na `/naklejki-foliowe`.
* **"Pasuje do"** - 3 inne zestawy z tematu + kafel "zestaw z własnymi naklejkami".
* **Dane strukturalne:** `Product` (name, description, image, sku = id zestawu, brand, material, category) + `Offer` (price 49.00 PLN, availability, url, `shippingDetails` 19.99 i czas przygotowania 2-3 dni, `hasMerchantReturnPolicy` zgodne z decyzją z 8.4) + `BreadcrumbList`.
* **Bez `AggregateRating`**, dopóki nie zbieramy opinii (sfabrykowaną ocenę usunęliśmy 24.07 i nie wraca).

---

## 8. Google Merchant Center

### 8.1 Odpowiedź
**Tak - gotowe zestawy kwalifikują się jako produkty.** To fizyczny towar o stałej cenie, z obrazem, dostępnością i dostawą. Własne naklejki z kreatora nigdy się nie kwalifikowały (nie ma czego pokazać przed zamówieniem); gotowe zestawy są pierwszym produktem, który da się wystawić. Daje to dwie rzeczy: **bezpłatne wyniki produktowe** (karta Zakupy i siatki produktów w zwykłych wynikach) oraz opcjonalnie płatne reklamy produktowe.

### 8.2 Wymagania i stan
| Wymaganie Google | Stan dziś | Co zrobić |
| :--- | :--- | :--- |
| Strona docelowa produktu z ceną, dostępnością i możliwością zakupu | ❌ brak adresu zestawu | strona zestawu (sekcja 7) z bezpośrednim "Dodaj do koszyka" |
| Cena i dostępność zgodne między feedem, stroną i danymi strukturalnymi | - | jedna stała w kodzie zasila stronę, JSON-LD i feed |
| Obraz produktu: min. 100×100 px, zalecane 1500 px; **od 31.01.2027 min. 500×500** | ⚠️ 720×1018 px | przy publikacji zapisywać drugi obraz 1600 px; bez napisów, ramek i znaków wodnych |
| Identyfikatory: brak GTIN | - | `identifier_exists: no` albo `brand: MałeNaklejki` + `mpn` = identyfikator zestawu (wariant drugi daje lepsze dopasowanie) |
| Dane firmy, kontakt, bezpieczna płatność, regulamin | ✅ | bez zmian |
| Dostawa na koncie | - | jedna stawka: Polska, paczkomat 19,99 zł, czas przygotowania 2-3 dni robocze. **Czasu doręczenia nie deklarujemy w treści** (`facts.md`) - na koncie Merchant trzeba go jednak podać, więc potrzebna decyzja (15, pkt 3) |
| Polityka zwrotów na koncie, zgodna ze stroną | ⚠️ patrz 8.4 | decyzja prawna |
| Weryfikacja i zgłoszenie witryny | ✅ GSC już zweryfikowany | połączyć z Merchant jednym kliknięciem |
| Obrazy wygenerowane przez AI muszą mieć znacznik IPTC `DigitalSourceType = trainedAlgorithmicMedia` | ❌ | dopisywać znacznik do obrazu produktu przy zapisie; nie usuwać metadanych |
| Tytuły i opisy pisane przez AI | - | jeśli opis zestawu pisze model, w feedzie idzie przez `structured_title` / `structured_description` z oznaczeniem źródła |

### 8.3 Feed
Trasa `/feeds/google-merchant.xml` generowana z opublikowanych zestawów, odświeżana tym samym tagiem pamięci podręcznej co galeria (zmiana w panelu = świeży feed). Przy trybie innym niż "Włączony" - pusty.

| Atrybut | Wartość |
| :--- | :--- |
| `id` | identyfikator zestawu |
| `title` | `<Nazwa> - <motyw>, zestaw naklejek A4, <n> szt.` (do 150 znaków, fraza na początku drugiej części) |
| `description` | opis z panelu + stałe zdanie o materiale i edycji |
| `link` | `https://www.malenaklejki.pl/gotowe-zestawy/<slug>` |
| `image_link` | obraz 1600 px |
| `additional_image_link` | zdjęcie wydrukowanego zestawu, gdy będzie (15, pkt 5) |
| `price` | `49.00 PLN` |
| `availability` | `in_stock` |
| `condition` | `new` |
| `brand` / `mpn` | `MałeNaklejki` / id zestawu |
| `google_product_category` | kategoria naklejek dekoracyjnych (identyfikator z aktualnej taksonomii Google - do pobrania przy budowie) |
| `product_type` | `Gotowe zestawy > <Temat>` |
| `material` / `size` | `folia winylowa` / `A4 (21 × 29,7 cm)` |
| `shipping` | `PL:::19.99 PLN` + czas przygotowania 2-3 dni |
| `custom_label_0` / `_1` | temat / sezon (pod segmentację kampanii) |

### 8.4 Ryzyka odrzucenia - w kolejności wagi
1. **Zwroty.** Regulamin §7 wyłącza odstąpienie od umowy, bo naklejki powstają "według specyfikacji konsumenta". Nieedytowany zestaw z katalogu drukowany na żądanie najpewniej **tej przesłanki nie spełnia** - samo wyprodukowanie po zamówieniu nie wyłącza prawa do odstąpienia, wyłącza je dopiero indywidualizacja. To nie jest tylko sprawa Merchant: dotyczy sprzedaży od dnia włączenia trybu "Włączony". **Nie jestem prawnikiem - to trzeba potwierdzić** i od wyniku zależy `hasMerchantReturnPolicy`, zapis w regulaminie i ustawienie na koncie Merchant. Dwa czyste warianty w sekcji 15, pkt 1.
2. **Obraz to wizualizacja, nie zdjęcie.** Google wymaga obrazu, który wiernie pokazuje produkt. Nasz podgląd jest wierny (powstaje z tych samych danych co druk), ale to render. Zabezpieczenie: jedno prawdziwe zdjęcie wydrukowanego zestawu jako obraz dodatkowy - a docelowo główny.
3. **Znacznik AI na obrazach** - brak znacznika przy grafikach z generatora to naruszenie zasad Merchant.
4. **Rozjazd ceny lub dostawy** między feedem a stroną - eliminowany jedną stałą w kodzie.
5. **Motywy chronione** (postacie, marki) - eliminowane zasadą z sekcji 6.
6. **Produkt konfigurowalny.** Jeśli jedyną drogą zakupu byłby kreator, Google może uznać, że strona docelowa nie sprzedaje produktu z feedu. Dlatego bezpośrednie "Dodaj do koszyka" nie jest wygodą, tylko warunkiem.

### 8.5 Bezpłatne wyniki czy reklamy
Zaczynamy od **bezpłatnych wyników** - koszt zerowy, a to one karmią siatki produktów. Reklamy produktowe to decyzja budżetowa (15, pkt 4). Rachunek do tej decyzji: zysk z zamówienia jednoarkuszowego to 22,84 zł, więc przy przykładowym koszcie kliknięcia 0,50 zł (realnej stawki nie znamy) reklama zwraca się dopiero powyżej ok. 2,2% konwersji - bez pomiaru z sekcji 13 nie ma jak tego ocenić. Rekomendacja: miesiąc bezpłatnych wyników, potem mały test na samych zestawach świątecznych.

---

## 9. Aktualizacje istniejących treści

| Strona | Zmiana | Kiedy |
| :--- | :--- | :--- |
| `fajne-wzory-i-pomysly...` | blok u góry: 4-6 gotowych zestawów z ceną i linkiem do katalogu; frazy zakupowe oddane katalogowi; nowy tytuł z obietnicą produktu. To test z karty P1 analizy nisz (cel: CTR z 0% do min. 2% w 14 dni) | razem z katalogiem |
| hub `naklejki-swiateczne-i-etykiety-na-prezenty` | akapit i link "gotowe zestawy świąteczne" w pierwszym ekranie; tabela 1 / 2 / 3 zestawy z przykładem "gotowy + własny" | razem z `/naklejki-swiateczne` |
| `SeoContentSection.tsx` (strona główna) | 1 link z anchorem "gotowe zestawy naklejek" (zasada: max 1 link na URL) | razem z katalogiem |
| filar `jak-zamowic-idealne...` | w sekcji "według zastosowania" zdanie i link "nie masz grafiki - wybierz gotowy zestaw" | razem z katalogiem |
| `male-naklejki-na-laptopa...`, `personalizowane-naklejki-na-zeszyty-i-do-przedszkola` | link do pasującego tematu, gdy powstanie | przy publikacji tematu |
| `/slownik-naklejek` | nowe hasło "gotowy zestaw naklejek" (`DefinedTerm`) | razem z katalogiem |
| `sitemap.ts` | katalog, tematy i strony zestawów z `lastModified` z panelu | etap 1 |
| `scripts/generuj-llms-txt.mjs` | katalog i tematy w `PAGES`; lista zestawów z nazwą, motywami i liczbą naklejek | etap 1 |
| `facts.md` | nowe wiersze: "gotowe zestawy - TAK", "liczba naklejek na gotowym zestawie jest dokładna" (wyjątek od zasady "orientacyjnie"), "gotowy zestaw można edytować przed zamówieniem" | etap 0 |
| Stopka, moduł "Rodzaje naklejek" + pozycja w menu | "Gotowe zestawy" | **wymaga zgody** (15, pkt 6) |
| Galeria w kreatorze | link "Zobacz wszystkie wzory" → katalog | etap 1 |

---

## 10. Warstwa GEO / AEO

Asystent AI zapytany "gdzie kupić wodoodporne naklejki jesienne" albo "jakie naklejki do bullet journala polecasz" potrzebuje trzech rzeczy: nazwanego produktu, twardych parametrów i ceny. Dziś nie dajemy żadnej.

* **Blok odpowiedzi na każdej stronie tematycznej** - 2-3 zdania samodzielne poza kontekstem: "MałeNaklejki sprzedaje gotowe zestawy naklejek [temat] w formacie A4: [n] wzorów po [x-y] naklejek, druk na folii winylowej odpornej na wodę i UV, 49,00 zł brutto za zestaw. Każdy zestaw można przed zamówieniem zmienić w kreatorze - usunąć naklejki albo dodać własne."
* **Tabele** (zestaw → motywy → liczba naklejek; liczba zestawów → cena z dostawą) - modele cytują tabele chętniej niż prozę.
* **Bank pytań - jedno pytanie, jedna strona** (zasada z §14.4 strategii świątecznej):
  * katalog: "czy można kupić gotowe naklejki bez własnego projektu", "ile naklejek jest na arkuszu A4",
  * temat: "gdzie kupić naklejki [temat]", "czy naklejki [temat] są wodoodporne",
  * zestaw: "co jest w zestawie [nazwa]",
  * wspólne, ale tylko na katalogu: "czy mogę zmienić gotowy zestaw", "czy mogę zamówić gotowy i własny zestaw w jednej paczce".
* **`Product` + `Offer` na stronach zestawów i feed Merchant** - to z nich korzystają powierzchnie zakupowe asystentów, nie z prozy.
* **`llms.txt` / `llms-full.txt`** - sekcja "Gotowe zestawy" z listą tematów i zestawów (nazwa, motywy, liczba naklejek, adres).
* **Obrazy** - nazwy plików i teksty alternatywne z frazą ("arkusz naklejek jesiennych Jesienna Kawka, 54 naklejki, folia winylowa"), wpisy obrazów w mapie strony. Zestawy są bardzo wizualne, więc Grafika Google i Pinterest to realny kanał - piny per zestaw istniejącą metodą (`generate-pinterest.ts`).

---

## 11. Zakres prac w panelu i w kodzie

**Panel (zestaw):**
* nowe pola: adres (slug, generowany z nazwy, edytowalny), podtytuł z motywem, opis, lista motywów, drugi temat;
* przy publikacji przeglądarka administratora zapisuje dodatkowo: obraz produktu 1600 px ze znacznikiem IPTC, **plik do druku i plik linii cięcia** (te same, które dziś powstają przy "Dodaj do koszyka") - to one pozwalają dodać zestaw do koszyka ze strony produktu bez kreatora;
* blokada publikacji bez slugu i opisu; ostrzeżenie przy opisie krótszym niż 80 słów.

**Sklep:**
* trasy: `/gotowe-zestawy`, `/gotowe-zestawy/[slug]`, wspólny szablon strony tematycznej + plik treści na temat;
* bezpośrednie dodanie do koszyka ze strony zestawu;
* `/feeds/google-merchant.xml`;
* mapa strony i `llms.txt` z zestawami;
* analityka (sekcja 13).

**Czego nie ruszamy:** checkout, BaseLinker, inFakt, maile - pozycja w koszyku dalej wygląda jak każda inna.

---

## 12. Harmonogram

| Etap | Termin | Zakres | Warunek wejścia |
| :--- | :--- | :--- | :--- |
| **0. Decyzje i pomiar** | 3-8.10 | decyzje z sekcji 15 (zwroty!), wiersze w `facts.md`, analityka gotowych zestawów, przemianowanie kategorii w panelu, włączenie trybu "Włączony" | - |
| **1. Adresy** | 6-17.10 | pola w panelu, strona zestawu z "Dodaj do koszyka", katalog, szablon tematu, mapa strony, `llms.txt`, aktualizacje z sekcji 9 | decyzja o zwrotach |
| **2. Dwa pierwsze tematy** | do 17.10 | `/naklejki-swiateczne` (6 zestawów) i `/naklejki-jesienne` (5 zestawów, sekcja Halloween) | 6 zestawów świątecznych w panelu |
| **3. Merchant Center** | 19-31.10 | konto, połączenie z GSC, dostawa i zwroty na koncie, feed, obrazy 1600 px ze znacznikiem, zgłoszenie, poprawki po weryfikacji | etap 1, zdjęcie próbnego zestawu mile widziane |
| **4. Tematy całoroczne** | 2-27.11 | `/naklejki-do-planera`, `/naklejki-ksiazkowe` | po 4 zestawy na temat |
| **5. Punkt kontrolny** | 15.11 i 15.12 | dane z sekcji 13; decyzja o reklamach produktowych i o `/naklejki-na-laptopa` | - |
| **6. Ogon sezonu** | do 10.01.2027 | `/naklejki-walentynkowe`, `/naklejki-motywacyjne-dla-dzieci` | dane ze świąt |

Halloween 2026: oba zestawy wchodzą do katalogu, sekcji w `/naklejki-jesienne` i - jeśli Merchant ruszy przed 25.10 - do feedu. Osobna strona dopiero we wrześniu 2027.

---

## 13. Mierniki i punkty kontrolne

**Najpierw pomiar, bo dziś gotowego zestawu nie widać w danych.** Do wdrożenia w etapie 0:
* pozycja koszyka zapamiętuje, z którego gotowego zestawu powstała i czy była zmieniana;
* GA4: `item_id` = slug zestawu zamiast `arkusz-a4`, `item_category` = "Gotowe zestawy", `item_category2` = temat; zdarzenia `view_item_list` (galeria, katalog, temat), `select_item`, `view_item` (strona zestawu);
* zamówienie zapisuje to samo, żeby panel pokazał udział gotowych zestawów w sprzedaży.

| Miernik | Cel | Kiedy sprawdzamy |
| :--- | :--- | :--- |
| Strony tematyczne zaindeksowane | 100% w 7 dni od publikacji | +7 dni |
| Wyświetlenia głów tematycznych w GSC | jakiekolwiek > 0 w 14 dni; pozycja < 20 w 30 dni | 15.11 |
| CTR `fajne-wzory` | z 0% do min. 2% w 14 dni po zaindeksowaniu zmian | +14 dni |
| Produkty w Merchant zatwierdzone | 100% | 31.10 |
| Bezpłatne wyniki produktowe: wyświetlenia / kliknięcia | pierwsze kliknięcia do 15.11 | 15.11, 15.12 |
| Udział zamówień z gotowym zestawem | punkt odniesienia po 30 dniach | 15.11 |
| **Zestawy na zamówienie** przy zamówieniach z gotowym zestawem | wyżej niż średnia sklepu | 15.12 |

**Stop / go:**
* jeśli do 15.11 żadna strona tematyczna nie ma wyświetleń na swoją głowę - nie budujemy kolejnych tematów, tylko wzmacniamy dwa pierwsze (linki, treść, zestawy);
* jeśli Merchant odrzuci produkty z powodu obrazów - wstrzymujemy feed do czasu zdjęć prawdziwych zestawów;
* jeśli gotowe zestawy sprzedają się, ale bez drugiego zestawu w koszyku - wzmacniamy "dołóż własny zestaw" zamiast dokładać tematów.

---

## 14. Czego świadomie nie robimy

| Decyzja | Uzasadnienie | Warunek powrotu |
| :--- | :--- | :--- |
| Brak strony na temat z mniej niż 4 zestawami | thin page | 4 zestawy |
| Brak osobnej strony Halloween w 2026 | 28 dni do święta, 1 opublikowany zestaw | wrzesień 2027 |
| Brak stron na kawę, rośliny, zwierzęta | nie ma sygnału popytu | zapytania w GSC |
| Brak darmowych wzorów do druku w domu | klaster DIY: 0 kliknięć (`strategy.md` §7) | - |
| Brak "promocji" i rabatów na gotowe zestawy | `facts.md`: stała cena | - |
| Brak ocen w danych strukturalnych | nie zbieramy opinii | cykl po zakupie (karta P3) |
| Brak porównań cenowych z sieciówkami | `facts.md`: dane konkurencji tylko jakościowo | - |
| Brak ekspozycji generatora AI | HOLD właściciela | decyzja właściciela |
| Brak reklam produktowych na start | brak pomiaru opłacalności | punkt kontrolny 15.11 |

---

## 15. Decyzje właściciela

Tylko to, czego nie rozstrzygnę sam. Przy każdej - rekomendacja.

1. **Zwroty gotowych zestawów (blokuje etap 1 i Merchant).** Do potwierdzenia z prawnikiem. Warianty:
   * **A (rekomendowany):** nieedytowany gotowy zestaw podlega zwrotowi w 14 dni; zestaw zmieniony w kreatorze i każdy własny - nie. Regulamin dostaje osobny ustęp, strona zestawu i Merchant pokazują zwrot 14 dni. Koszt: pojedyncze zwroty zestawu, którego nie da się odsprzedać. Zysk: czyste zasady, lepsza konwersja, zielone światło w Merchant.
   * **B:** gotowy zestaw można kupić wyłącznie po dopasowaniu w kreatorze (np. obowiązkowe pole z własnym napisem). Wtedy zostaje dzisiejsze wyłączenie, ale strona produktu nie ma prostego "Dodaj do koszyka" i rośnie ryzyko odrzucenia w Merchant.
2. **Konto Google Merchant Center** - zakładasz Ty (dane firmy, weryfikacja). Ja przygotowuję feed, strony i listę ustawień.
3. **Czas doręczenia na koncie Merchant.** Google wymaga czasu dostawy. Rekomendacja: przygotowanie 2-3 dni robocze + przewóz 1-2 dni robocze (ta sama para liczb jest już w danych strukturalnych strony głównej). W treści stron dalej mówimy tylko o produkcji.
4. **Reklamy produktowe** - rekomendacja: nie teraz; decyzja 15.11 na danych.
5. **Zdjęcia prawdziwych zestawów.** Zamówienie 2 zestawów (świąteczny i jesienny), ok. 118 zł z dostawą, zdjęcia do ~20.10. To najmocniejszy sygnał wiarygodności na stronach i zabezpieczenie w Merchant.
6. **Link "Gotowe zestawy" w stopce i w menu.** Rekomendacja: stopka od razu, menu po 15.11, jeśli gotowe zestawy sprzedają.
7. **Tempo produkcji zestawów.** Plan zakłada ok. 12 nowych zestawów do końca listopada (5 świątecznych, 4 do planera, 3 książkowe). Jeśli to za dużo - tnę tematy, nie liczbę zestawów na temat.
8. **Włączenie trybu "Włączony".** Rekomendacja: Podgląd dziś, Włączony po decyzji nr 1.

---

## 16. Źródła zewnętrzne (stan na 3.10.2026)

* Identyfikatory produktów bez GTIN: [support.google.com/merchants/answer/6324478](https://support.google.com/merchants/answer/6324478)
* Treści wygenerowane przez AI w Merchant Center: [support.google.com/merchants/answer/14743464](https://support.google.com/merchants/answer/14743464), [searchengineland.com](https://searchengineland.com/google-wants-you-to-label-ai-generated-images-used-in-merchant-center-437645)
* Dane strukturalne polityki zwrotów: [developers.google.com/search/docs/appearance/structured-data/return-policy](https://developers.google.com/search/docs/appearance/structured-data/return-policy)
* Wymagania wobec obrazów (w tym minimum 500 px od 31.01.2027): [feedarmy.com](https://feedarmy.com/kb/product-image-size-requirements-for-google-merchant-center/), [adtribes.io](https://adtribes.io/google-shopping-image-requirements/)
* Prawo odstąpienia a towar na zamówienie: [poradnikprzedsiebiorcy.pl](https://poradnikprzedsiebiorcy.pl/-zwrot-towaru-na-zamowienie-czy-mozna-odstapic-od-umowy-na-odleglosc), [ifirma.pl](https://www.ifirma.pl/blog/zwrot-towaru-na-indywidualne-zamowienie-czy-mozna-odstapic-od-umowy/)
* Rekonesans wyników: [empik.com/jesienne-produkty](https://www.empik.com/jesienne-produkty), [taniaksiazka.pl](https://www.taniaksiazka.pl/naklejki-swiateczne-p-1902566.html), [kaufland.pl](https://www.kaufland.pl/product/66627481/)

---

## 17. Dziennik realizacji

Każda sesja, która wykonuje etap, dopisuje tu wpis: data, co zrobiono, co świadomie odłożono.

### 2026-10-03 - galeria w kreatorze (na produkcji, commit `196058f`)
Wejście do gotowych zestawów przy kreatorze, galeria otwierana na żądanie, lekkie wersje grafik, linki `/#gotowe-zestawy` i `/?zestaw=<id>`.

### 2026-10-03 - etap 0 i 1: kod gotowy lokalnie, **czeka na wdrożenie**
Zrobione i sprawdzone (tsc, lint, build, akcje panelu na danych testowych, strony w przeglądarce):
* **Panel zestawu:** pola „Temat" i „Drugi temat", adres strony, podtytuł z motywem, opis (licznik słów, próg 80) i motywy. Publikacja wymaga tematu, adresu i opisu; przy publikacji edytor sam przygotowuje obraz produktu 1600 px, plik do druku i plik linii cięcia. Publikacja prosto z listy działa tylko dla zestawu z aktualnymi plikami. Lista zestawów pokazuje adres strony albo ostrzeżenie „Bez strony w sklepie".
* **Katalog** `/gotowe-zestawy` (`CollectionPage` + `ItemList` + `FAQPage` + `BreadcrumbList`) i **strony zestawów** `/gotowe-zestawy/<slug>` (`Product` + `Offer` z dostawą i zwrotem 14 dni) z bezpośrednim „Dodaj do koszyka" i „Dopasuj w kreatorze". W katalogu są wyłącznie zestawy z kompletem: adres, opis, obraz produktu, pliki do druku.
* **Szablon strony tematycznej** `ThemeLanding` + spis stron w `src/lib/sheets/themes.ts` (na razie pusty - pierwsze strony to etap 2).
* **Widoczność:** katalog, strony zestawów, wpisy w mapie strony, link w stopce i zdanie z linkiem na stronie głównej istnieją tylko przy trybie „Włączony" i co najmniej jednym zestawie z kompletem. Poza tym trybem wszystko zwraca 404.
* **Zwroty (wariant A):** regulamin §2 (definicja gotowego zestawu) i §7 (zwrot 14 dni dla zestawu bez zmian); pozycja koszyka i zamówienia pamięta, z którego zestawu powstała i czy była zmieniana; koszyk pokazuje to klientowi.
* **Pomiar:** GA4 `view_item_list`, `select_item`, `view_item`; w `add_to_cart`, `begin_checkout` i `purchase` gotowy zestaw ma własny `item_id` (`gotowy-<slug>`), `item_category` „Gotowe zestawy", temat w `item_category2` i „bez zmian / zmieniony w kreatorze" w `item_category3`.
* **Blog:** wpis `fajne-wzory...` dostał blok gotowych zestawów z cenami pod wstępem (frontmatter `catalog: true`) - rysuje się tylko przy publicznym katalogu.
* **`facts.md`:** cztery nowe wiersze (gotowe zestawy, dokładna liczba naklejek, edycja, zwrot).
* **`llms.txt`:** generator dopisuje katalog, fakty i listę zestawów, gdy katalog jest publiczny (dane z `/api/gotowe-zestawy/katalog`).
* Przy okazji: plik do druku z edytora panelu ma teraz 2480 × 3508 px, tak jak z kreatora (było 3507).

Świadomie odłożone:
* **Zmiany w treściach markdown** (tytuł wpisu `fajne-wzory`, zdanie w filarze, hasło w słowniku, przebudowa `llms.txt`) - dopiero po włączeniu trybu, bo wcześniej linki prowadziłyby na 404. Polecenie czeka w panelu („Podlinkuj katalog w treściach").
* **Podgląd strony zestawu dla administratora przed włączeniem trybu** - strony są statyczne i nie mogą zależeć od sesji. Do rozważenia, jeśli brak podglądu będzie przeszkadzał.
* **Znacznik IPTC na obrazie produktu** - razem z feedem, etap 3.
* **Udział gotowych zestawów w statystykach panelu sklepu** - dane są już zapisywane w zamówieniach (`items[].readySheet`), widoku jeszcze nie ma.

Po stronie właściciela (etap 0): przeczytać §7, przemianować kategorie na tematy, uzupełnić opisy i opublikować zestawy z edytora, przełączyć tryb na „Włączony".

### 2026-10-04 - etap 0 i 1 na produkcji, dane stron zestawów, tryb „Włączony", podlinkowanie katalogu w treściach
Wpis z 3.10 („kod gotowy lokalnie, czeka na wdrożenie") jest nieaktualny - stan na koniec dnia:
* **Etap 0 i 1 wdrożony** (commit `19c63c2`, `main`). Sprawdzone na produkcji: `/api/gotowe-zestawy/katalog` i 404 na katalogu przy wyłączonym trybie, nowy §7 regulaminu, mapa strony bez katalogu do czasu włączenia trybu.
* **Dane stron zestawów:** 7 opublikowanych zestawów ma adres, podtytuł z motywem, opis (90-103 słowa) i motywy (10-15), zapisane w Firestore wyłącznie w puste pola (status, tematy i `updatedAt` nietknięte). **Nazwy własne zestawów zostają** (decyzja właściciela: wyróżnik i ciekawość przy przeglądaniu) - słowa kluczowe niesie podtytuł, np. „Jesienna Kawka - naklejki jesienne z kawą i dyniami". Opisy bez liczby naklejek (strona pokazuje ją sama z `stickerCount`) i bez słów o pochodzeniu grafik.
* **Publikacja i tryb (właściciel):** zestawy opublikowane w edytorze (powstały pliki do druku), tryb „Włączony". Katalog jest publiczny i zwraca 7 zestawów.
* **Treści z §9 (to polecenie):**
  * `fajne-wzory...` - nowy title (`Fajne wzory na naklejki - gotowe arkusze A4 za 49 zł`) i description (145 zn.) z obietnicą produktu i ceną, `updated: 2026-10-04`; blok z zestawami i jego jedyny link do katalogu już się renderują; z kroku 1 listy usunięta pogrubiona fraza `wzory na naklejki do druku` (fraza zakupowa należy do katalogu);
  * filar `jak-zamowic-idealne...` - zdanie „Nie masz grafiki - wybierz gotowy zestaw..." z linkiem w sekcji „według zastosowania" (bez bumpa `updated`, jak w P4.3.1);
  * `/slownik-naklejek` - hasło „Gotowy zestaw naklejek" (`DefinedTerm`, 21 pojęć) z linkiem „Katalog gotowych wzorów"; `dateModified` i `lastModified` -> 2026-10-04;
  * `llms.txt` / `llms-full.txt` - katalog, trzy fakty, sekcja „Gotowe zestawy" (7 pozycji z motywami i liczbą naklejek), reguła dla agentów; w generatorze poprawiona odmiana liczebnika („62 naklejki", „61 naklejek");
  * zasada „najwyżej jeden link do katalogu na stronę" zachowana, anchory różne na każdej stronie. Szczegóły i weryfikacja: `blog-agent/plan.md` → P4.2.14, `landing-agent/plan.md` → „Zrealizowane".
* **Sprawdzone:** `tsc` (bez cache), lint zmienionych plików (0 -> 0), `next build`, `audyt-facts.py` (bez nowych trafień), podgląd lokalny z `READY_SHEETS_MODE=on`.

Świadomie odłożone / otwarte:
* **Hub świąteczny** (akapit i tabela 1/2/3 zestawy) oraz **`male-naklejki-na-laptopa`, `personalizowane-naklejki-na-zeszyty...`** - dopiero przy publikacji odpowiednich stron tematycznych (etap 2); `THEME_PAGES` nadal pusty.
* **Pomiar testu P1:** zgłosić ponowną indeksację `fajne-wzory` w GSC (krok właściciela); kontrola CTR ok. 18-25.10.2026 (cel: min. 2% i min. 2 `add_to_cart` z gotowych zestawów w 14 dni; punkt startowy 170 wyśw. / 0 klik. / poz. 8,99).
* **Zależność od trybu:** meta `fajne-wzory`, zdanie w filarze i hasło w słowniku zakładają publiczny katalog. Przy powrocie trybu na „Wyłączony" lub „Podgląd" wycofać te trzy zmiany (link prowadziłby w 404); blok i stopka znikają same.
* Merchant Center i feed (etap 3) oraz strony tematyczne (etap 2) - bez zmian.

### 2026-10-04 (wieczór) - ósmy zestaw: „Ciepła Zima" (pierwszy w pełni świąteczny)
* **Zestaw** dodany przez właściciela w panelu: *Ciepła Zima*, temat Zima, 46 naklejek, opublikowany z edytora (obraz produktu i pliki do druku gotowe, adres `/gotowe-zestawy/ciepla-zima`). Katalog liczy teraz **8 zestawów**.
* **Stan po publikacji z edytora:** opis zawierał jeden znak `"`, podtytuł i motywy były puste - strona w sklepie pokazywała pusty akapit „Co jest na arkuszu". Serwer wymaga tylko niepustego opisu, więc `"` przeszedł; ostrzeżenie o 80 słowach działa wyłącznie w edytorze.
* **Uzupełnione** (Admin SDK, transakcja tylko do pustych pól, wpis w `auditLog`, `updatedAt` podbity, żeby otwarty w innej karcie edytor zapytał o nadpisanie zamiast po cichu zgubić tekst):
  * podtytuł: `naklejki świąteczne z kominkiem i piernikami` (nagłówek strony: „Ciepła Zima - naklejki świąteczne z kominkiem i piernikami");
  * opis: 96 słów, bez liczby naklejek, bez słów o pochodzeniu grafik; opisane tylko to, co widać na obrazie produktu (kominek ze skarpetami, dziadek do orzechów, piernikowy domek, kula śnieżna, sanki, łyżwy, choinki, wieniec z pomarańczami, bombki, latarenki, pierniki, filiżanki, kosz jabłek, rękawiczki, wstęga z zimowym napisem po angielsku); zastosowania: kalendarz adwentowy, kartki, opakowania prezentów, planer na grudzień;
  * 16 motywów;
  * **cytatu z napisu na wstędze w tekstach nie powtarzamy** (opis, motywy, `llms.txt`): to rozpoznawalna fraza z serialu, a §14 mówi „zero nazw marek i treści licencjonowanych w tekstach". Sama naklejka z tym napisem jest na arkuszu - to decyzja właściciela, odnotowana do oceny;
  * **drugi temat „Święta"** (`category2`) - zestaw jest wprost świąteczny, a temat „Święta" to filtr w galerii i przyszła podstawa strony `/naklejki-swiateczne`.
* **`llms.txt` / `llms-full.txt`** przebudowane (8 zestawów).
* **Do etapu 2 (strona `/naklejki-swiateczne`, termin 17.10):** w panelu są dwa zestawy o motywie świątecznym (*Zimna Zima* z banerami „Merry Christmas" / „Wesołych Świąt" i *Ciepła Zima*) wobec 6 zakładanych w §12. Oba mają teraz drugi temat „Święta" (*Zimna Zima* dostała go tego samego wieczoru na polecenie właściciela - jedno pole `category2`, zapis jak wyżej: transakcja, `auditLog`, `updatedAt`). Do 6 zestawów brakuje czterech, strona `/naklejki-swiateczne` weźmie oba po temacie „Święta".
* **Uwaga o pamięci podręcznej:** zapis skryptem nie unieważnia stron statycznych. API katalogu pokazało nowe dane od razu, ale statyczna strona produktu odświeża się dopiero po następnym wdrożeniu albo po zapisie zestawu w edytorze.

### 2026-10-05 - zmiana nazwy: „gotowe arkusze” → „gotowe zestawy” / „gotowe zestawy naklejek”
Decyzja właściciela. Zrobione w jednym przebiegu (sklep + panel właściciela + dokumenty):
* **Adresy** (stare przekierowują na stałe, 308, z ogonem ścieżki i parametrami): `/gotowe-arkusze` → `/gotowe-zestawy`, `/gotowe-arkusze/<slug>` → `/gotowe-zestawy/<slug>`, `/api/gotowe-arkusze/*` → `/api/gotowe-zestawy/*`, `/admin/arkusze*` → `/admin/zestawy*`. W kreatorze nadal działają stare linki `/#gotowe-arkusze` i `/?arkusz=<id>` (nowe: `#gotowe-zestawy`, `?zestaw=<id>`). Slugi zestawów (część adresu po `/gotowe-zestawy/`) się nie zmieniły. `sitemap.xml` podaje już nowe adresy.
* **Teksty sklepu:** katalog (tytuł „Gotowe zestawy naklejek - wzory na folii winylowej, 49 zł”, H1, FAQ, dane strukturalne, kategoria produktu w JSON-LD „Gotowe zestawy naklejek > <temat>”), strony zestawów, szablon `ThemeLanding`, galeria i wejście w kreatorze („Gotowe zestawy”, „Użyj tego zestawu”, „Gotowy zestaw: <nazwa>”), koszyk, stopka („Gotowe zestawy naklejek”), blok w blogu, hasło w słowniku (`gotowy-zestaw-naklejek`), regulamin (§ 2 i § 7: „Gotowy zestaw”; data aktualizacji 5.10.2026), `llms.txt` / `llms-full.txt` (przebudowane generatorem), title wpisu `fajne-wzory` („Fajne wzory na naklejki - gotowe zestawy za 49 zł”, bez bumpa `updated` - zmiana samego title/description).
* **Panel sklepu:** zakładka „Zestawy”, „Nowy zestaw”, „Edycja zestawu”, ustawienie „Gotowe zestawy”, komunikaty błędów i wpisy w dzienniku zmian („Zapis gotowego zestawu”…). W edytorze „Arkusz” zostaje przy płótnie z naklejkami (zoom „Cały arkusz”, „Wyczyść arkusz”); dane zestawu (nazwa, temat, adres, opis) są pod nagłówkiem „Zestaw”.
* **Analityka GA4:** `item_category` = „Gotowe zestawy”, `item_list_name` „strona zestawu” (wcześniej „Gotowe arkusze” / „strona arkusza”) - w raportach starsze dni mają starą nazwę. Nazwy zdarzeń (`ready_sheets_open`, `ready_sheet_use`) i klucze liczników (`readySheetUsage`) bez zmian - ciągłość danych.
* **Czego świadomie nie ruszam:** nazw w kodzie i bazie (`stickerSheets`, `settings/readySheets`, `readySheet` w pozycjach zamówień, `PublicSheet*`, `ReadySheets*`) - to identyfikatory, a ich zmiana wymagałaby migracji danych produkcyjnych bez żadnej korzyści dla klienta; kluczy źródeł wejścia (`pusty-arkusz`, `pod-arkuszem` - dotyczą płótna w kreatorze); nazw własnych zestawów. Klucze pamięci podręcznej i tagi dostały nowe nazwy (`gotowe-zestawy…`), więc po wdrożeniu dane odczytują się od zera.
* **Panel właściciela (panel.jdalaszynski.pl):** widok „MałeNaklejki → Gotowe zestawy” (plik `lib/panel/content/gotowe-zestawy.ts`), polecenia dla Claude Code, linki i `README-PANEL.md` przepisane na nową nazwę; identyfikatory kroków (`arkusze-swieta`…) i `sheetsPlan.done` bez zmian, więc odhaczone kroki zostają odhaczone.
* **Do dokończenia po stronie właściciela / do decyzji:** opisy 7 opublikowanych zestawów w Firestore (pole `description`) zawierają jeszcze słowo „arkusz” („Świąteczny arkusz w ciepłej…”) - zmiana wymaga zapisu w produkcyjnej bazie; skrypt jest gotowy i przetestowany na sucho, czeka na zgodę. **Zrobione 2026-10-06** (wpis niżej).


### 2026-10-06 - „w pełni edytowalne” widoczne w katalogu (zasada 4)
Polecenie właściciela: katalog ma jasno mówić, że zestawy da się zmieniać - usuwać naklejki i dodawać własne.
* **Przycisk** przy zestawie nazywa się teraz **„Zmień po swojemu”** (było „Dopasuj w kreatorze”), ma ikonę i widoczne tło; jedna nazwa w `EDIT_CTA_LABEL` (`src/lib/sheets/schema.ts`), FAQ cytuje ją z tej stałej. Adres bez zmian (`/?zestaw=<id>`).
* **Pierwszy ekran katalogu:** ramka „Każdy zestaw zmienisz po swojemu” z trzema możliwościami (usuniesz naklejki, dodasz własne, zmienisz rozmiar) i linkiem do sekcji `#zmiany`. Akapit otwierający (BLUF) skrócony o zdanie, które ramka zastąpiła.
* **Sekcja „Gotowy zestaw możesz zmienić po swojemu”** stoi teraz zaraz pod siatką wzorów (przed tabelą) i zamiast trzech kroków ma rysunek arkusza w trakcie zmian, trzy możliwości, zdanie o cenie i zasadę zwrotu (oba człony, jak w `facts.md`). Ten sam blok (`EditablePanel`) jest na stronie zestawu (CTA „Otwórz zestaw w kreatorze”) i w szablonie `ThemeLanding`.
* **Strona zestawu:** pod „Dodaj do koszyka” dwuwierszowy odnośnik „Zmień po swojemu w kreatorze - usuń naklejki, zmień rozmiar, dodaj własne. Cena bez zmian.”; dopisek o zwrocie ma oba człony.
* **FAQ katalogu:** nowe pytanie „Czy mogę dodać własne naklejki do gotowego zestawu?” (z uczciwą uwagą, że zestaw wypełnia prawie cały arkusz, więc najpierw trzeba coś usunąć).
* **Kreator:** pasek „Gotowy zestaw: <nazwa>” pokazuje zdanie-podpowiedź, dopóki zestaw jest nietknięty.
* **Bez zmian:** „imię” zniknęło z nowych tekstów (kreator nie ma edytora tekstu - `facts.md`), zostało „zdjęcie, logo albo grafika”.

### 2026-10-06 (wieczór) - opisy zestawów w bazie: „arkusz” → „zestaw”
Polecenie właściciela; domyka zmianę nazwy z 5.10.
* **Zmienione opisy (7 z 8):** Książkowy Raj, Ciepła Zima, Pumpkin Spiceowy Sezon, Dyniowe Szaleństwo, Jesieniarskie Strachy, Zimna Zima, Jesienna Kawka. Jesieniarski Miszmasz nie miał słowa „arkusz”. Nazwy, podtytuły i motywy były czyste - nietknięte.
* **Zamiany:** „arkusz” → „zestaw” we wszystkich formach, a razem z rzeczownikiem przyimki i zaimki („Na arkuszu leży” → „W zestawie jest”, „Są na nim” → „Są w nim”, „Znajdziesz na nim” → „Znajdziesz w nim”). Dwie poprawki stylu, żeby słowo „zestaw” nie zderzało się samo ze sobą: Zimna Zima „dopełniają zestawu” → „dopełniają całość”, Dyniowe Szaleństwo „zestaw oliwkowych i piaskowych” (grupka dyń) → „komplet oliwkowych i piaskowych”.
* **Jak:** Admin SDK, transakcja na zestaw z warunkiem na stary tekst, `updatedAt`/`updatedBy` podbite (otwarty edytor zapyta o nadpisanie), wpis w `auditLog` („Opisy gotowych zestawów”). Stare opisy w `kopie-zapasowe/opisy-zestawow-2026-10-06T18-19-35-911Z/` (poza repo).
* **Pamięć podręczna:** zapis skryptem nie unieważnia stron statycznych - odświeża je wdrożenie tego commita.
