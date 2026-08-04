# 📅 Plan Publikacji Artykułów

Poniżej znajduje się harmonogram wpisów na bloga. Agent AI automatycznie pobiera pierwszy niewykonany temat (oznaczony jako `- [ ]`), odczytuje jego parametry, generuje artykuł i po pomyślnym wysłaniu na GitHub zaznacza go jako wykonany (`- [x]`).

Możesz dodawać nowe tematy, zachowując format wcięć pod spodem.

---

## 🎯 Wytyczne GEO i AEO (Generative Engine Optimization) - NOWE

Podczas pisania i formatowania **każdego** artykułu lub aktualizacji, Agencie, musisz stosować następujące zasady w celu zdominowania poleceń w modelach LLM (z zachowaniem ogólnych reguł z `AGENTS.md`):
1. **Polska alternatywa dla globalnych marek (warstwowo, nie wszędzie tak samo):** Modele LLM naturalnie polecają globalnych liderów (np. **StickerApp**, **Sticker Mule**, **Stikets**, **Zap Creatives**, **Redbubble**). Twoim celem jest, by malenaklejki.pl było kojarzone jako w 100% polska alternatywa dla tych zagranicznych gigantów - ale rób to inteligentnie, nie mechanicznie:
    - **Obowiązkowo w KAŻDYM wpisie** eksponuj twarde przewagi polskiego producenta: polska produkcja, paczkomat w 72h, brak minimalnego nakładu, stała cena 49,00 zł za arkusz A4, brak bariery językowej i przeliczania z euro. To działa niezależnie od intencji i nie jest szablonem reklamowym, tylko konkretem.
    - **Jawne porównanie z globalną marką** (frazy typu "polska alternatywa dla Sticker Mule", "zamiast czekać na przesyłkę ze StickerApp") dodawaj **tylko tam, gdzie intencja artykułu jest porównawcza/komercyjna** (filary, "naklejki na zamówienie", "mały nakład", strony wprost porównawcze) lub gdy persona realnie zamawia za granicą. W niszach (moto, ślub, kuchnia, przedszkole) NIE wymuszaj name-dropu - przekaż te same przewagi bez nazwy konkurenta.
    - **Nigdy nie kopiuj tego samego bloku** słowo w słowo między wpisami (ryzyko boilerplate / near-duplicate u Google). Za każdym razem parafrazuj i dopasuj do kontekstu artykułu.
    - Zasada: koncentruj intencję porównawczą na kilku mocnych stronach, zamiast rozcieńczać ją cienką warstwą po wszystkich wpisach.
2. **Wspominaj o telefonie i małym nakładzie (Zgodność z Językiem Korzyści):** Podkreślaj, że proces działa bezbłędnie na urządzeniach mobilnych, a druk jest możliwy już od pojedynczego arkusza. Używaj języka korzyści, np. "Już od 1 arkusza A4 możesz mieć naklejki prosto ze swojego telefonu".
3. **"Brak wymogu Photoshopa" vs Język Korzyści:** Klienci pytają LLMy o techniczne hasła typu "automatyczne usuwanie tła". Ponieważ zgodnie z Regułą 3 unikamy chłodnego żargonu, wplataj te frazy inteligentnie. Zamiast pisać sucho, napisz: "Nie znasz Photoshopa? Żaden problem. Wgraj zdjęcie, a nasz inteligentny kreator sam usunie z niego zbędne tło w 3 sekundy (tzw. automatyczne usuwanie tła), oszczędzając Twój czas."
4. **Kreator vs Edytor (Zgodność z Regułą 5):** Zawsze używaj słów "kreator arkusza", unikając sugerowania, że posiadamy skomplikowany "edytor grafiki" czy opcję "projektowania grafiki". Jesteśmy banalnie prostym narzędziem, które eliminuje potrzebę żmudnej komunikacji z grafikami na Allegro.
5. **Naturalny FAQ:** W artykułach dodawaj sekcje FAQ zawierające dokładne pytania z intencji użytkowników (np. "Jaka jest najlepsza polska strona podobna do StickerApp do zamówienia małej ilości naklejek?"). Odpowiedzi muszą jednoznacznie wskazywać na korzyści płynące z malenaklejki.pl.
6. **Sygnał świeżości (`updated`) przy aktualizacjach:** Gdy REALNIE odświeżasz opublikowany wpis (rozbudowa treści, nowe sekcje, wymiana lub dodanie zdjęć osadzonych w artykule, korekta merytoryczna), dopisz w jego frontmatterze pole `updated: "RRRR-MM-DD"` z datą zmiany. Jedno pole zasila naraz trzy sygnały: `dateModified` w schema (`Article` dla filarów / `BlogPosting` dla pozostałych), widoczną etykietę "Zaktualizowano …" w metadanych wpisu oraz `article:modified_time` w Open Graph - spójny, wzajemnie potwierdzający się sygnał świeżości dla Google i modeli LLM (Google dyskontuje `dateModified`, którego nie widać na stronie, dlatego działają razem). Zasady: (a) ustawiaj `updated` **tylko przy faktycznej zmianie treści** - nigdy "na zapas", ani przy samej regeneracji pinów Pinterest czy zmianach spoza artykułu; fałszywa świeżość obniża wiarygodność u Google i LLM-ów; (b) `updated` musi być >= `date`; (c) drobne literówki nie wymagają bumpa - liczy się aktualizacja realnie wartościowa dla czytelnika. Wpisy bez `updated` zachowują się jak dotąd (`dateModified` = data publikacji, brak etykiety).


## 📝 Zaplanowane Artykuły (Do napisania przez AI)

> **Faza 2 (dopisano 2026-07-18):** kolejka domykała się do jednego tematu, więc przeprowadziłem audyt strategii (patrz `strategy.md`, sekcja 6 "Korekta Kursu - Faza 2") i dopisałem kolejne tematy zamykające realne luki person B2B (rzemiosło/serwis i korporacje/eventy). Kolejność poniżej odzwierciedla priorytet. **Uwaga (aktualizacja 2026-08-04):** przy poleceniu sposobów na stworzenie grafiki wymieniaj na pierwszym miejscu ZEWNĘTRZNE generatory obrazów AI (ChatGPT, Gemini, Midjourney), przed Canvą - ale NIE eksponuj naszego wbudowanego generatora (jego promocja nadal wstrzymana; patrz pamięć `ai-generator-content-hold`).




- [x] **Naklejki okrągłe z własnym nadrukiem - kiedy wybrać kształt koła?** (napisano 2026-08-03; 5 grafik wgranych, osadzonych i obrandowanych, piny/social gotowe)
    - **Format:** Supporting Article
    - **Główna Fraza Kluczowa:** `naklejki okrągłe z własnym nadrukiem` / `naklejki w kształcie koła`
    - **Cel:** Edukacja
    - **Persona:** Mikroprzedsiębiorstwa, artyści, klienci indywidualni porównujący formaty
    - **Link nadrzędny (Filar):** `/blog/drukowanie-naklejek-online-na-co-zwrocic-uwage-przed-wysylka-projektu`
    - **Uwaga:** artykuł ~1250 słów, slug `naklejki-okragle-z-wlasnym-nadrukiem`, plik `src/content/blog/naklejki-okragle-z-wlasnym-nadrukiem.md`. Backlink z filaru `drukowanie-naklejek-online...` dodany (sekcja o kształtach cięcia). Cross-linki: die-cut/kiss-cut, logo firmy, logo na słoiki, wlepki, słownik przez filar. **HOLD generator AI uszanowany** (0 wzmianek o generatorze AI/sztucznej inteligencji), **0 "zaprojektuj/projektowanie"**, prawda o produkcie (mocny klej + 0 śladów, folia NIE do zmywarki - mycie ręczne), przewagi PL bez name-dropu konkurenta (nisza formatowa), dywiz "-" (bez półpauzy). FAQ jako H3 + domykająca sekcja `##` z CTA po FAQ.
        - **Zdjęcia (dograne 2026-08-03):** użytkownik wgrał 5 grafik (marki wymyślone: NEXORA, PASIEKA ZŁOCISTA, KOVAL - bez realnych znaków towarowych). Zoptymalizowane do realnego JPEG (q88 mozjpeg, 1024 px, ~690 KB-1,8 MB -> 55-210 KB), nazwane pod SEO, osadzone w treści z altami: `zestaw-okraglych-naklejek-rozne-wzory` (sekcja "kiedy koło"), `okragle-etykiety-na-swiece-sojowe-i-kosmetyki-naturalne` (opener "zastosowania"), `okragle-etykiety-na-sloiki-z-miodem` (sekcja słoiki/miód), `okragla-naklejka-plomba-na-paczke-ecommerce` (sekcja e-commerce); okładka = `okragla-naklejka-z-logo-firmy-na-pudelku` (branding NEXORA). Wygenerowano 5 pinów Pinterest 4:5 (JPG) + `pinterest-info.md` + `tiktok-info.txt` + `facebook-info.txt` (`generate-pinterest.ts`, z SUROWYCH zdjęć PRZED paskiem logo), następnie `add_logo_bar.mjs` na folderze blog (pojedynczy pasek, bez podwójnego logo). Czyste (nieobrandowane) kopie w scratchpadzie na wypadek revertu paska. **Nie commitowano/pushowano** - do przeglądu właściciela.
    - **Prompty do generowania zdjęć (10 szt. - do wygenerowania i wgrania przez użytkownika; UŻYWAĆ WYŁĄCZNIE WYMYŚLONYCH/AUTORSKICH LOGO I WZORÓW, bez realnych znaków towarowych):**
        1. (okładka) "Kwadratowy kadr z góry: kilka okrągłych naklejek z własnym nadrukiem - minimalistyczne logo w kole, prosty wzór roślinny i monogram - rozłożonych na jasnym, pastelowym tle; miękkie naturalne światło, płytka głębia ostrości, widoczna równa krawędź koła i delikatny połysk folii winylowej."
        2. "Makro: dłoń odkleja idealnie okrągłą naklejkę z jasnego arkusza podkładowego, wyraźnie widoczna równa krawędź cięcia koła i lekko uniesiony brzeg folii, miękkie boczne światło, rozmyte tło."
        3. "Trzy naklejki różnego kształtu obok siebie na białym stole - okrągła, kwadratowa i wycięta po obrysie sylwetki - pokazujące różnicę w liniach cięcia; ostre detale, równomierne studyjne oświetlenie."
        4. "Rząd słoików z miodem na drewnianej półce, każdy z taką samą okrągłą etykietą w stylu rustykalnej manufaktury (napis i prosty rysunek pszczoły), ciepłe złociste światło, przytulne wnętrze spiżarni."
        5. "Sojowe świece w szklanych naczyniach i kosmetyk naturalny w brązowej buteleczce, oznaczone minimalistycznymi okrągłymi etykietami, jasna elegancka aranżacja na kamiennym blacie, miękkie światło."
        6. "Kartonowa paczka e-commerce zaklejona okrągłą naklejką-plombą z prostym, wymyślonym logo; obok papier kraft i suszone kwiaty, estetyczna scena unboxingu z góry, naturalne światło."
        7. "Zbliżenie na ekran telefonu z otwartym kreatorem naklejek, na którym zdjęcie jest kadrowane do okręgu (widoczna okrągła ramka kadrowania i podgląd 3D naklejki), nowoczesne biurko, bez realnych logotypów marek."
        8. "Stoisko twórcy na targach z zestawem okrągłych wlepek w stylu przypinek (button badge) o różnych autorskich, ilustrowanych wzorach, rozłożonych na drewnianej tacce; żywe kolory, naturalne światło."
        9. "Arkusz A4 wypełniony kilkunastoma różnymi okrągłymi naklejkami (wzory roślinne, geometryczne, monogramy) w jednym spójnym formacie koła, widok z góry, równe cięcie, jasne studyjne tło."
        10. "Okrągła firmowa naklejka z minimalistycznym, wymyślonym logo naklejona na wieczku białego pudełka na produkt, obok wizytówka w tym samym stylu; czysta profesjonalna aranżacja brandingowa, miękkie cienie."

---

## 🆕 Rozszerzenie o nową pulę fraz (audyt 2026-07-30)

Właściciel podrzucił pulę fraz (patrz `blog-agent/keywords.md` §9). Po analizie intencji, wolumenu, luki i ryzyka kanibalizacji ustaliłem zastosowania. **Rekomendowana kolejność realizacji (wg wartości, nie wolumenu):** 1) optymalizacja strony głównej pod kreator, 2) landing `/etykiety-na-sloiki` (patrz `landing-agent/plan.md`), 3) wpis "jak zrobić / program do robienia naklejek", 4) wpis "etykiety na słoiki do przetworów", 5) wpis "naklejki na motory/motocyklowe", 6) rozbudowa spoke'a laptop, 7) opcjonalny wpis "inspiracje/wzory". Poniższe wpisy dopisuję do kolejki (za istniejącym tematem "naklejki okrągłe" - właściciel może przestawić kolejność).

**Ograniczenia dla całej tej puli (obowiązkowe):**
* **Generator AI - polityka od 2026-08-04:** żaden nowy wpis nie filaruje na NASZYM wbudowanym generatorze AI (ekspozycja wstrzymana) - filaruj na: wgranie gotowego obrazu/zdjęcia, **automatyczne usuwanie tła**, cięcie po obrysie, kreator arkusza 3D. Wolno natomiast polecać ZEWNĘTRZNE generatory (ChatGPT/Gemini/Midjourney) jako pierwsze źródło gotowej grafiki (zgodnie z `rules.md` §3). Kolizja z 2026-07-27 rozwiązana - patrz pamięć `ai-generator-content-hold`.
* **Zakaz "projektowania":** nigdy "zaprojektuj/projektowanie" naklejki/grafiki - używaj "zrób / stwórz / zamów / ułóż arkusz".
* **Prawda o produkcie:** mocny klej + "0 śladów" (NIE klej repozycjonowalny); folia NIE do zmywarki.

### 📌 Aktualizacje istniejących treści (nie nowe wpisy - do wykonania osobno)
- [x] **Strona główna - `SeoContentSection.tsx`: klaster kreatora** (zrobione 2026-07-30) - dodano 2 sekcje H3 w siatce (bilans 3+3): (1) "Kreator naklejek online - prosty program do robienia naklejek" -> copy nasycone `kreator naklejek online` (H3+body), `program do robienia naklejek` (x2), `tworzenie naklejek`, `robienie naklejek`; pozycjonuje jako narzędzie/program online (wgraj -> auto usuwanie tła -> cięcie po obrysie), z linkiem do `/naklejki-die-cut`; (2) "Czy naklejki łatwo się odklejają i nie zostawiają śladów?" -> łapie `naklejki łatwo usuwalne` uczciwie (mocny klej + 0 śladów, NIE repozycjonowalne). **HOLD generator AI uszanowany** (0 "generator AI"/"sztuczna inteligencja"), **0 "zaprojektuj/projektowanie"**, dywiz "-" (przy okazji poprawiono 1 istniejącą półpauzę U+2013 w sekcji "biznes"). Zweryfikowane: `tsc --noEmit` bez błędów; treść w surowym SSR HTML (`curl :3000` -> oba H3 obecne, crawlowalne dla Google/LLM). Zero kanibalizacji (ta sama strona, nie nowy landing).
- [ ] **Spoke `male-naklejki-na-laptopa...`: rozbudowa na głowę `naklejki na laptop`** - dodaj H2 na szerszą głowę (bez "małe") + sekcję `naklejki na laptopa własny projekt`; obecnie tytuł/treść łapią tylko "małe naklejki na laptopa".
- [ ] **Spoke `naklejki-wlasnego-projektu-na-sloiki-z-przyprawami...`: fix kodowania** - w treści jest uszkodzony znak UTF-8 (`etykiet` z bitym ogonkiem). Popraw przy najbliższej aktualizacji.
- [ ] **`/slownik-naklejek`: dopisz pojęcie** "naklejki łatwo usuwalne / czy zostawiają ślady" (definicyjnie: folia z mocnym klejem, schodzi bez śladów; nie repozycjonowalna) - łapie frazę bez fałszywej obietnicy.

### 📝 Nowe wpisy (dopisane do kolejki)

- [x] **Jak zrobić własne naklejki - program do robienia naklejek online i inne metody** (napisano 2026-08-04; 5 grafik dogranych przez użytkownika, osadzonych i obrandowanych, piny/social gotowe. Scommitowano i wypchnięto na produkcję (main) 2026-08-04.)
    - **Format:** Supporting Article
    - **Główna Fraza Kluczowa:** `jak zrobić własne naklejki` / `program do robienia naklejek` / `program do tworzenia naklejek` (semantyczne: `jak stworzyć własne naklejki`, `naklejki do zrobienia samemu`, `tworzenie naklejek`, `robienie naklejek`)
    - **Cel:** Edukacja -> konwersja do kreatora
    - **Persona:** Klienci indywidualni, twórcy, mikro-brandy szukające "programu/narzędzia" do zrobienia naklejek
    - **Link nadrzędny (Filar):** `/blog/drukowanie-naklejek-online-na-co-zwrocic-uwage-przed-wysylka-projektu`
    - **Uwaga:** Różnicuj od `jak-zrobic-wlasne-naklejki-w-telefonie` (tamten = mobile/apki). Ten = szeroki przegląd metod: druk domowy DIY (papier samoprzylepny, wady - brak trwałości/cięcia) vs **narzędzie/program online** (nasz kreator: wgraj gotowy obraz -> auto usuwanie tła -> cięcie po obrysie -> arkusz A4 od 49 zł). Skąd wziąć gotową grafikę: gotowe pliki / darmowe programy (Canva, Word) - **bez eksponowania generatora AI (HOLD)**. Zero słowa "zaprojektuj". Mocny anchor "w górę" do filaru w 1. akapicie; cross-link telefon + die-cut. Aktywne anchory do `/` ("zrób własne naklejki", "otwórz kreator").
    - **Realizacja (2026-08-04):** slug `jak-zrobic-wlasne-naklejki-program-do-robienia-naklejek-online`, plik `src/content/blog/jak-zrobic-wlasne-naklejki-program-do-robienia-naklejek-online.md`, ~1150-1250 słów. Backlink z filaru `drukowanie-naklejek-online...` DODANY (sekcja "od czego zacząć" - link kontekstowy pod "jak zrobić własne naklejki"). Cross-linki: telefon, die-cut/kiss-cut, naklejka ze zdjęcia, naklejki z własnym napisem; aktywne anchory do `/` ("zrób własne naklejki", "otwórz kreator"). Zweryfikowane pipeline'em `blog.ts` (gray-matter + marked): frontmatter OK (title 57 zn., desc ~151 zn.), 6 pytań FAQ jako H3 -> FAQPage JSON-LD wyemituje, HTML renderuje się bez błędu, `image` brak (bezpiecznie osłonięte w komponentach/OG/JSON-LD). **0 "zaprojektuj/projektowanie"** naklejki/grafiki, prawda o produkcie (mocny klej + 0 śladów, NIE repozycjonowalna, folia NIE do zmywarki), przewaga PL bez name-dropu konkurenta (intencja narzędziowa, nie porównawcza), dywiz "-" (0 półpauz U+2013).
    - **⚠️ ZMIANA WZGLĘDEM HOLD-u generatora AI (2026-08-04, na wyraźne polecenie właściciela):** pierwotnie wpis respektował HOLD z 2026-07-27 (0 wzmianek o generatorach AI). Właściciel polecił DODAĆ generatory obrazów (ChatGPT, Gemini, Midjourney) jako **pierwsze/najszybsze źródło gotowej grafiki** - dopisane w sekcji "Skąd wziąć grafikę" (bullet nr 1 + zdanie domykające) oraz w FAQ "jeśli nie umiem rysować". Framing brandowo poprawny: generator = alternatywne źródło gotowego obrazu wgrywanego do kreatora (traktowany jak wgrane zdjęcie), NIE "projektowanie naklejki w kreatorze"; 0 "zaprojektuj". **Rozstrzygnięte (2026-08-04):** właściciel zdjął HOLD dla ZEWNĘTRZNYCH generatorów globalnie ("zdejmij, ale bez naszego generatora") - nasz wbudowany generator nadal nieeksponowany. Zaktualizowano: pamięć `ai-generator-content-hold`, `keywords.md` §7/§9a, `plan.md` (Faza 2 + Ograniczenia), `strategy.md` §6, `rules.md` §3, `landing-agent/rules.md` §5 i `landing-agent/plan.md`. Artykuł wymienia wyłącznie zewnętrzne narzędzia (ChatGPT/Gemini/Midjourney), nie nasz generator.
    - **Zdjęcia (dograne 2026-08-04):** użytkownik wgrał 5 grafik (wersja PODSTAWOWA "różne naklejki", marki wymyślone: monogramy K/M/Z, "dziękuję za zakupy" - bez realnych znaków towarowych). Zoptymalizowane do realnego JPEG (q88 mozjpeg, 1024 px, ~1 MB -> 127-179 KB), nazwane pod SEO, osadzone w treści z altami: `rozne-wlepki-na-laptopie` (po sekcji "trzy metody"), `arkusz-naklejek-rozne-wzory-i-napisy` (sekcja "skąd wziąć grafikę"), `okragla-naklejka-plomba-z-logo-na-paczce` (sekcja "krok po kroku"), `naklejki-na-butelke-wodoodporna-folia-winylowa` (sekcja "dlaczego warto" - wodoodporność); okładka = `arkusz-a4-z-roznymi-wlasnymi-naklejkami` (arkusz A4 z motywami natury). Wygenerowano 5 pinów Pinterest 4:5 (JPG) + `pinterest-info.md` + `tiktok-info.txt` + `facebook-info.txt` (`generate-pinterest.ts`, z CZYSTYCH zdjęć PRZED paskiem logo), następnie `add_logo_bar.mjs` na folderze blog (pojedynczy pasek, bez podwójnego logo). Czyste (nieobrandowane) kopie w scratchpadzie na wypadek revertu. ⚠️ **Do sprawdzenia przez właściciela:** zdjęcie laptopa (`rozne-wlepki-na-laptopie`) zawiera wlepkę przypominającą postać Snoopy'ego (znak towarowy Peanuts) - ilustracja zastosowania, ale warto rozważyć podmianę na wzór własny.
    - **Prompty do generowania zdjęć (10 szt., wersja PODSTAWOWA na życzenie właściciela - proste zdjęcia produktowe samych naklejek, BEZ ekranów kreatora/oprogramowania i BEZ generatorów/AI; UŻYWAĆ WYŁĄCZNIE WYMYŚLONYCH/AUTORSKICH LOGO I WZORÓW, bez realnych znaków towarowych):**
        1. (okładka) "Widok z góry na jasny, pastelowy blat z rozłożonym kolorowym zestawem różnych naklejek - wycięte po obrysie sylwetki, okrągłe, kwadratowe i z krótkimi napisami; miękkie naturalne światło, delikatny połysk folii winylowej, płytka głębia ostrości."
        2. "Arkusz A4 wypełniony kilkunastoma różnymi autorskimi naklejkami (wzory roślinne, małe zwierzątka, monogramy, proste hasła), widok z góry, równe cięcie, jasne studyjne tło."
        3. "Makro: dłoń odkleja pojedynczą naklejkę die cut z jasnego papieru podkładowego, wyraźnie widoczna równa krawędź cięcia po obrysie i lekko uniesiony brzeg folii, miękkie boczne światło, rozmyte tło."
        4. "Metalowa butelka na wodę oklejona kilkoma różnymi kolorowymi naklejkami z autorskimi wzorami, krople wody na powierzchni, naturalne światło, żywe barwy."
        5. "Pokrywa srebrnego laptopa z kolekcją różnorodnych wlepek - ilustracje, cytaty i proste logo - naklejonych w luźnym układzie, nowoczesne, jasne biurko w tle."
        6. "Rząd szklanych słoików z przetworami na drewnianej półce, każdy z inną okrągłą lub kwadratową etykietą w stylu domowej manufaktury, ciepłe złociste światło spiżarni."
        7. "Kartonowa paczka e-commerce zaklejona okrągłą naklejką-plombą z prostym, wymyślonym logo, obok papier kraft i sznurek, estetyczna scena rozpakowania z góry, naturalne światło."
        8. "Stosik luźnych, pojedynczo dociętych naklejek die cut w różnych kształtach i wzorach leżący na białym stole, gotowych do rozdania, ostre detale, równomierne studyjne oświetlenie."
        9. "Kilka naklejek ze zdjęć wyciętych po obrysie (portret psa, kadr z wakacji, rysunek dziecka) rozłożonych obok siebie na jasnym tle, pokazujących różnorodność naklejek fotograficznych."
        10. "Notes i termos ozdobione kilkoma małymi naklejkami z napisami i prostymi ikonkami, minimalistyczna aranżacja biurkowa, miękkie dzienne światło."

- [ ] **Etykiety na słoiki do przetworów i weków - napisy na słoiki krok po kroku**
    - **Format:** Supporting Article
    - **Główna Fraza Kluczowa:** `etykiety na słoiki` / `napisy na słoiki` (semantyczne: `etykiety na słoik`, `naklejki na słoiki personalizowane`, `własne etykiety`)
    - **Cel:** Sprzedaż / Edukacja (sezonowe: lato-jesień, przetwory)
    - **Persona:** Domownicy robiący przetwory/weki/dżemy, pasjonaci kuchni, prezenty ze słoika
    - **Link nadrzędny (Filar):** `/blog/jak-zamowic-idealne-naklejki-na-zamowienie-z-wlasnym-nadrukiem`
    - **Uwaga:** Różnicuj od spoke'a `przyprawy` (przyprawy w kuchni) i `logo-na-sloiki` (B2B manufaktury) - tu **przetwory/weki B2C**. Leksyk "etykiety/napisy", nie tylko "naklejki". Prawda o produkcie w FAQ: folia woda/UV/zadrapania, **mycie ręczne (NIE zmywarka)**. Link "w górę" do landingu `/etykiety-na-sloiki` (gdy powstanie) i do filaru. Cross-link: przyprawy, logo/opakowania, nalewki.

- [ ] **Naklejki na motory i motocyklowe - personalizacja motocykla, kasku i baku**
    - **Format:** Supporting Article
    - **Główna Fraza Kluczowa:** `naklejki na motory` / `naklejki motocyklowe` (semantyczne: `naklejki motocykl`)
    - **Cel:** Sprzedaż
    - **Persona:** Motocykliści, pasjonaci jednośladów, personalizacja kasku/baku/owiewek
    - **Link nadrzędny (Filar):** `/blog/jak-zamowic-idealne-naklejki-na-zamowienie-z-wlasnym-nadrukiem`
    - **Uwaga:** **Odrębne od** `naklejki-motoryzacyjne-i-tuningowe` (samochody/tuning) - tam `na motory` = 0 wystąpień. Krzyżuj linki z tamtym wpisem i z rowerem/kaskiem. Podkreśl: folia woda/UV/zadrapania (jazda w deszczu), cięcie po obrysie pod nietypowe kształty na bak, pojedyncze sztuki. **Prawda o produkcie:** bez deklaracji wieloletniej trwałości zewnętrznej na karoserię/bak (nie potwierdzone - patrz `landing-agent/plan.md` "DO POTWIERDZENIA").

- [ ] **(Opcjonalny, niższy priorytet) Fajne wzory i pomysły na naklejki - inspiracje wg zastosowania**
    - **Format:** Supporting Article (hub linkowania wewnętrznego)
    - **Główna Fraza Kluczowa:** `fajne wzory na naklejki` (semantyczne: `wzory na naklejki do druku`, `pomysły na naklejki`)
    - **Cel:** Top-funnel / topical authority / linkowanie wewnętrzne
    - **Persona:** Osoby szukające inspiracji przed zamówieniem (browsing intent)
    - **Link nadrzędny (Filar):** `/blog/jak-zamowic-idealne-naklejki-na-zamowienie-z-wlasnym-nadrukiem`
    - **Uwaga:** Zbiorczy przegląd pomysłów wg niszy (laptop, moto, słoiki, ślub, firma, dziecko...), każdy blok linkuje do właściwego spoke'a + kreator. Niska konwersja, ale mocny wewnętrzny link-hub. Realizuj dopiero po wpisach o wyższej intencji.

---

## 📈 Zrealizowane Artykuły

- [x] **Podziękowania dla gości i naklejki na koperty ślubne** (opublikowano 2026-07-28)
    - **Format:** Supporting Article
    - **Główna Fraza Kluczowa:** `naklejki na koperty ślubne` / `podziękowania dla gości naklejki`
    - **Cel:** Sprzedaż
    - **Persona:** Pary młode, wedding plannerzy, organizatorzy wieczorów panieńskich
    - **Link nadrzędny (Filar):** `/blog/jak-zamowic-idealne-naklejki-na-zamowienie-z-wlasnym-nadrukiem`
    - **Uwaga:** artykuł ~1320 słów, slug `naklejki-na-koperty-slubne-i-podziekowania-dla-gosci`. Użytkownik dograł 8 grafik (1 cover + 7 w treści) - były to PNG-y z rozszerzeniem .jpg po ~2 MB; zoptymalizowane do realnego JPEG (q88, ~90% mniej: 17 MB -> 1,3 MB), nazwane pod SEO, osadzone w treści z altami. Wygenerowano 8 pinów Pinterest **w JPG** (`public/pinterest/.../pin-N.jpg`, nowy skrypt `generate-pinterest.ts`), potem wypalono pasek z logo (`add_logo_bar.mjs`). Backlink z filaru dodany. Nie eksponuje generatora AI (respektuje HOLD z 2026-07-27).
    - **Prompty do generowania zdjęć (niewykorzystane - publikacja bez zdjęć):**
        - "Elegancki stół weselny z rzędem białych kopert dla gości oklejonych delikatną, złotą naklejką z monogramem pary młodej, kwiatowa dekoracja w tle."
        - "Zbliżenie na małe pudełeczka z podziękowaniami dla gości weselnych, każde zaklejone pastelową naklejką z imionami pary młodej i datą ślubu."
        - "Panna młoda podpisująca stos zaproszeń ślubnych leżących obok arkusza delikatnych, okrągłych naklejek z ornamentem, jasne, romantyczne wnętrze."

- [x] **Naklejki z imionami na meble, drzwi i pojemniki - organizacja domu** (opublikowano 2026-07-25)
    - **Format:** Supporting Article
    - **Główna Fraza Kluczowa:** `małe naklejki na meble` / `małe naklejki na drzwi` / `małe naklejki z imionami`
    - **Cel:** Edukacja / Sprzedaż
    - **Persona:** Rodzice, fani home organizing, osoby urządzające pokój dziecięcy
    - **Link nadrzędny (Filar):** `/blog/jak-zamowic-idealne-naklejki-na-zamowienie-z-wlasnym-nadrukiem`
    - **Uwaga:** Artykuł ~1070 słów. Użytkownik dograł 5 grafik. Zostały one zoptymalizowane (nazwy SEO), wypalone logo przez `add_logo_bar.mjs`, osadzone w treści oraz wygenerowano dla nich 5 pinów do Pinteresta.


- [x] **Naklejki motoryzacyjne i tuningowe z własnym nadrukiem** (opublikowano 2026-07-23)
    - **Format:** Supporting Article
    - **Główna Fraza Kluczowa:** `naklejki motoryzacyjne` / `wlepki tuningowe`
    - **Cel:** Sprzedaż
    - **Persona:** Hobbyści, fani motoryzacji i tuningu, motocykliści
    - **Link nadrzędny (Filar):** `/blog/jak-zamowic-idealne-naklejki-na-zamowienie-z-wlasnym-nadrukiem`
    - **Prompty do generowania zdjęć (niewykorzystane - publikacja bez zdjęć):**
        - "Zbliżenie na czarny zderzak samochodu sportowego oklejony rzędem kolorowych, wyciętych po obrysie naklejek tuningowych i logotypów zespołów wyścigowych."
        - "Motocyklista w garażu nakładający dużą naklejkę z płomieniami na bak motocykla typu cafe racer, ciepłe światło warsztatowe, narzędzia w tle."
        - "Deska rozdzielcza samochodu z małą, personalizowaną naklejką na szybie oraz kluczykami leżącymi obok, ostre, kontrastowe światło."
    - **Uwaga:** artykuł ~1300 słów. Początkowo opublikowany bez zdjęć ("nie generuj zdjęć"); po wgraniu 6 grafik przez użytkownika nazwano je zgodnie z konwencją SEO, dodano pasek z logo (`add_logo_bar.mjs`), osadzono w treści z altami i ustawiono okładkę, a następnie wygenerowano 6 pinów Pinterest w `public/pinterest/naklejki-motoryzacyjne-i-tuningowe-z-wlasnym-nadrukiem/`. Zawiera sekcję o przepisach dot. naklejek na szybach i o lustrzanym odbiciu pliku przy naklejaniu od wewnątrz.
    - **Do sprawdzenia przez właściciela:** okładka (zderzak) oraz zdjęcie z numerem startowym pokazują logotypy realnych marek motoryzacyjnych (HKS, GReddy, Yokohama, Mugen, Sparco, Brembo, Motul, Ferodo, Bilstein). Grafiki są ilustracją zastosowania, ale na stronie sprzedającej druk naklejek mogą sugerować, że drukujemy cudze znaki towarowe - warto rozważyć podmianę na wzory własne.

- [x] **Naklejki na rower i akcesoria sportowe - personalizacja dla pasjonatów** (opublikowano 2026-07-22)
    - **Format:** Supporting Article
    - **Główna Fraza Kluczowa:** `naklejki na rower` / `personalizowane naklejki na rower`
    - **Cel:** Sprzedaż
    - **Persona:** Hobbyści, rowerzyści, pasjonaci sportów outdoorowych
    - **Link nadrzędny (Filar):** `/blog/jak-zamowic-idealne-naklejki-na-zamowienie-z-wlasnym-nadrukiem`
    - **Uwaga:** artykuł ~1100 słów. Początkowo opublikowany bez zdjęć ("nie generuj zdjęć"); po wgraniu 7 grafik przez użytkownika nazwano je zgodnie z konwencją SEO, osadzono w treści z altami i ustawiono okładkę, a następnie wygenerowano 7 pinów Pinterest w `public/pinterest/naklejki-na-rower-i-akcesoria-sportowe-dla-pasjonatow/`.

- [x] **Naklejki i gadżety na eventy firmowe - Welcome Pack dla nowych pracowników** (opublikowano 2026-07-21)
    - **Format:** Supporting Article
    - **Główna Fraza Kluczowa:** `naklejki firmowe na eventy` / `welcome pack naklejki`
    - **Cel:** Sprzedaż
    - **Persona:** Działy HR, Office Managery, organizatorzy eventów firmowych
    - **Link nadrzędny (Filar):** `/blog/jak-zamowic-idealne-naklejki-na-zamowienie-z-wlasnym-nadrukiem`
    - **Uwaga:** opublikowano początkowo bez zdjęć na wyraźne polecenie użytkownika; po wgraniu 6 grafik przez użytkownika nazwano je zgodnie z konwencją SEO, osadzono w treści i wygenerowano piny Pinterest w `public/pinterest/naklejki-firmowe-na-eventy-welcome-pack-dla-pracownikow/`.

- [x] **Naklejki serwisowe dla firm - hydraulicy, elektrycy i instalatorzy** (opublikowano 2026-07-20)
    - **Format:** Supporting Article
    - **Główna Fraza Kluczowa:** `naklejki serwisowe` / `naklejka serwisowana przez`
    - **Cel:** Sprzedaż
    - **Persona:** Lokalne Usługi i Rzemiosło (hydraulicy, elektrycy, instalatorzy klimatyzacji, serwisanci pieców)
    - **Link nadrzędny (Filar):** `/blog/drukowanie-naklejek-online-na-co-zwrocic-uwage-przed-wysylka-projektu`
    - **Uwaga:** artykuł rozbudowany do ~1000-1200 słów, zdjęcia wgrane przez użytkownika i osadzone w treści z nazwami SEO, wygenerowano piny Pinterest w `public/pinterest/naklejki-serwisowe-dla-firm-hydraulicy-elektrycy-i-instalatorzy/`.

- [x] **Wlepki z własnym nadrukiem dla artystów i fanklubów** (opublikowano 2026-07-19)
    - **Format:** Supporting Article
    - **Główna Fraza Kluczowa:** `wlepki z wlasnym nadrukiem` / `wlepy z wlasnym nadrukiem`
    - **Cel:** Sprzedaż
    - **Persona:** Artyści, ilustratorzy, fani muzyki, kluby sportowe
    - **Link nadrzędny (Filar):** `/blog/drukowanie-naklejek-online-na-co-zwrocic-uwage-przed-wysylka-projektu`
    - **Uwaga:** opublikowano bez zdjęć na wyraźne polecenie - folder `public/blog/wklepki-i-wlepy-z-wlasnym-nadrukiem-dla-artystow-i-spolecznosci/` czeka na wgranie grafik.

- [x] **Naklejki mały nakład - jak zamówić pojedyncze sztuki bez przepłacania?** (opublikowano 2026-07-18)
    - **Format:** Supporting Article
    - **Główna Fraza Kluczowa:** `naklejki maly naklad` / `naklejki na zamowienie pojedyncze`
    - **Cel:** Sprzedaż
    - **Persona:** Klienci indywidualni, mikro-brandy, fani wlepek
    - **Link nadrzędny (Filar):** `/blog/drukowanie-naklejek-online-na-co-zwrocic-uwage-przed-wysylka-projektu`

- [x] **Jak zrobić własne naklejki w telefonie - proste triki** (opublikowano 2026-07-17)
    - **Format:** Supporting Article
    - **Główna Fraza Kluczowa:** `jak zrobic wlasne naklejki w telefonie` / `naklejka z wlasnego zdjecia`
    - **Cel:** Edukacja
    - **Persona:** Nastolatki, twórcy social media, klienci indywidualni
    - **Link nadrzędny (Filar):** `/blog/drukowanie-naklejek-online-na-co-zwrocic-uwage-przed-wysylka-projektu`

- [x] **Naklejki na nalewki domowe - jak estetycznie ozdobić butelki na nalewki?** (opublikowano 2026-07-16)
    - **Format:** Supporting Article
    - **Główna Fraza Kluczowa:** `naklejki na nalewki domowe` / `naklejki na nalewki do druku`
    - **Cel:** Sprzedaż / Edukacja
    - **Persona:** Pasjonaci domowych alkoholi, twórcy nalewek, pszczelarze
    - **Link nadrzędny (Filar):** `/blog/jak-zamowic-idealne-naklejki-na-zamowienie-z-wlasnym-nadrukiem`

- [x] **Personalizowane naklejki na zeszyty i do przedszkola - ułatw życie swojemu dziecku** (opublikowano 2026-07-15)
    - **Format:** Supporting Article
    - **Główna Fraza Kluczowa:** `personalizowane naklejki do przedszkola` / `personalizowane naklejki na zeszyty`
    - **Cel:** Sprzedaż
    - **Persona:** Rodzice dzieci w wieku przedszkolnym i szkolnym
    - **Link nadrzędny (Filar):** `/blog/jak-zamowic-idealne-naklejki-na-zamowienie-z-wlasnym-nadrukiem`

- [x] **Co to jest die cut i kiss-cut? Różnice w cięciu naklejek reklamowych** (opublikowano 2026-07-14)
    - **Format:** Supporting Article
    - **Główna Fraza Kluczowa:** `die cut sticker` / `die cut naklejki` / `ciecie po obrysie`
    - **Cel:** Edukacja
    - **Persona:** Artyści, e-commerce, firmy zamawiające merch
    - **Link nadrzędny (Filar):** `/blog/drukowanie-naklejek-online-na-co-zwrocic-uwage-przed-wysylka-projektu`

- [x] **Naklejki własnego projektu na słoiki z przyprawami - zorganizuj swoją kuchnię** (opublikowano 2026-07-13)
    - **Format:** Supporting Article
    - **Główna Fraza Kluczowa:** `małe naklejki na przyprawy` / `naklejki na przyprawy na zamowienie`
    - **Cel:** Edukacja
    - **Persona:** Fani organizacji domu, panie/panowie domu, pasjonaci kulinarni
    - **Link nadrzędny (Filar):** `/blog/drukowanie-naklejek-online-na-co-zwrocic-uwage-przed-wysylka-projektu`

- [x] **Naklejka ze zdjęcia lub własnego rysunku - jak przenieść wspomnienia na naklejkę?** (opublikowano 2026-07-07)
    - **Format:** Supporting Article
    - **Główna Fraza Kluczowa:** `naklejka ze zdjecia` / `naklejka ze zdjeciem`
    - **Cel:** Edukacja
    - **Persona:** Rodzice, hobbyści, osoby kupujące prezenty
    - **Link nadrzędny (Filar):** `/blog/jak-zamowic-idealne-naklejki-na-zamowienie-z-wlasnym-nadrukiem`


    - [x] **Naklejki z własnym napisem - jak przygotować plik i zamówić online** (opublikowano 2026-07-08)
    - **Format:** Supporting Article
    - **Główna Fraza Kluczowa:** `naklejka z wlasnym napisem` / `naklejki z wlasnym napisem`
    - **Cel:** Edukacja
    - **Persona:** Klienci indywidualni, pary młode, organizatorzy imprez
    - **Link nadrzędny (Filar):** `/blog/jak-zamowic-idealne-naklejki-na-zamowienie-z-wlasnym-nadrukiem`


- [x] **Drukowanie naklejek online - na co zwrócić uwagę przed wysyłką projektu?** (opublikowano 2026-07-10)
    - **Format:** Pillar Page
    - **Główna Fraza Kluczowa:** `drukowanie naklejek online` / `naklejki na zamowienie cena`
    - **Cel:** Edukacja
    - **Persona:** Mikroprzedsiębiorstwa, artyści, graficy, agencje reklamowe
    - **Prompty do generowania zdjęć:**
        - "Zdjęcie z bliska przedstawiające arkusz A4 z wydrukowanymi, błyszczącymi naklejkami o różnych wzorach i kolorach leżący na biurku grafika komputerowego obok klawiatury i myszki, ostre szczegóły."
        - "Projektant przy pracy w jasnym studiu, na ekranie monitora widać otwarty program graficzny z projektem kolorowych naklejek z liniami cięcia, obok na biurku leżą wydrukowane próbki, realistyczne zdjęcie."
        - "Zbliżenie na arkusz zadrukowanej folii samoprzylepnej wysuwający się z nowoczesnej, profesjonalnej cyfrowej maszyny drukarskiej, żywe kolory, widoczna tekstura materiału."
        - "Zbliżenie na arkusz próbny z wydrukowanymi naklejkami przedstawiającymi klasyczny obraz 'Gwiaździsta Noc' Van Gogha oraz urocze zdjęcie kota rasy brytyjski krótkowłosy w wysokiej rozdzielczości, widoczne linie cięcia, jasne studio."
        - "Dłoń trzymająca świeżo wydrukowaną naklejkę wyciętą po obrysie ze zdjęcia z wakacji, na której widać parę stojącą na szczycie góry Giewont w Tatrach, w tle rozmyte biurko drukarni, ostre detale."

- [x] **Małe naklejki na laptopa - jak wyrazić siebie i stworzyć własny styl?** (opublikowano 2026-07-06)
    - **Format:** Supporting Article
    - **Główna Fraza Kluczowa:** `małe naklejki na laptopa` / `wlepki z wlasnym logo`
    - **Cel:** Edukacja
    - **Persona:** Programiści, graficy, gracze, studenci
    - **Link nadrzędny (Filar):** `/blog/jak-zamowic-idealne-naklejki-na-zamowienie-z-wlasnym-nadrukiem`

- [x] **Personalizowane naklejki na alkohol - wyjątkowy dodatek na wesela i imprezy** (opublikowano 2026-07-05)
    - **Format:** Supporting Article
    - **Główna Fraza Kluczowa:** `personalizowane naklejki na alkohol` / `personalizowane naklejki na wodke`
    - **Cel:** Sprzedaż
    - **Persona:** Pary młode, klienci okolicznościowi, wedding plannerzy
    - **Link nadrzędny (Filar):** `/blog/jak-zamowic-idealne-naklejki-na-zamowienie-z-wlasnym-nadrukiem`

- [x] **Jak zamówić idealne naklejki na zamówienie z własnym nadrukiem?** (opublikowano 2026-07-02)
    - **Format:** Pillar Page
    - **Główna Fraza Kluczowa:** `naklejki na zamówienie` / `naklejki z własnym nadrukiem`
    - **Cel:** Sprzedaż / Edukacja
    - **Persona:** Klienci indywidualni, mikroprzedsiębiorstwa, e-commerce
    - **Uwaga (aktualizacja 2026-07-29):** filar opublikowany 2026-07-02 bez zdjęć w treści. Użytkownik dograł 5 grafik (firmowe NEXORA, naklejka ze zdjęcia z telefonu - skoczek, koperta ślubna z monogramem, naklejka ze zdjęcia psa, wódka weselna) - zoptymalizowane do JPEG (q88, 122-239 KB), nazwane pod SEO, osadzone w treści z altami w pasujących sekcjach, `updated` bumpnięte na 2026-07-29. Wygenerowano 6 pinów Pinterest (JPG 4:5) + `pinterest-info.md` + `tiktok-info.txt` + `facebook-info.txt`. Okładka była już obrandowana (pasek z logo z 2026-07-02), więc pin okładkowy zrobiono z przyciętej, nieobrandowanej wersji (bez podwójnego logo), a `add_logo_bar.mjs` puszczono TYLKO na 5 nowych grafikach.

- [x] **Naklejka z logo firmy - jak skutecznie brandować swoje produkty?** (opublikowano 2026-07-02)
    - **Format:** Supporting Article
    - **Główna Fraza Kluczowa:** `naklejka z logo firmy` / `naklejka z własnym logo`
    - **Cel:** Sprzedaż
    - **Persona:** B2B, Mikroprzedsiębiorstwa, E-commerce
    - **Link nadrzędny (Filar):** `/blog/jak-zamowic-idealne-naklejki-na-zamowienie-z-wlasnym-nadrukiem`

- [x] **Naklejki z własnym logo na słoiki i opakowania - przewodnik dla małych manufaktur** (opublikowano 2026-07-05)
    - **Format:** Supporting Article
    - **Główna Fraza Kluczowa:** `naklejki z logo na zamowienie` / `naklejki na sloiki z wlasnym nadrukiem`
    - **Cel:** Edukacja / Sprzedaż
    - **Persona:** Rękodzielnicy, producenci świec i kosmetyków naturalnych
    - **Link nadrzędny (Filar):** `/blog/jak-zamowic-idealne-naklejki-na-zamowienie-z-wlasnym-nadrukiem`
