# Baza fraz pod landing pages

Uzupełnienie `blog-agent/keywords.md` (baza informacyjna long-tail). Tu zbieramy frazy **komercyjne, porównawcze i atrybutowe** pod landingi - wyższa intencja, mid-tail transakcyjny. Priorytet doboru: **intencja zakupowa/porównawcza + realny wolumen** (potwierdź w GSC przed budową strony).

---

## 1. Komercyjne segmentowe (B2B / kategorie)
* `naklejki dla firm`
* `naklejki z logo dla firm`
* `naklejki firmowe z logo`
* `naklejki na produkty` / `etykiety na produkty`
* `etykiety ze składem` / `etykiety na kosmetyki naturalne`
* `naklejki na opakowania` / `plomby na paczki wysyłkowe`
* `naklejki na słoiki na zamówienie` / `naklejki na butelki`
> Pod te frazy landing **komercyjny** (np. `/naklejki-dla-firm`); nie kanibalizuj generycznej `/`.

---

## 2. Porównawcze / "alternatywa" (GEO/AEO)
* `polska alternatywa dla sticker mule` / `... dla stickerapp` (**HUB istnieje**)
* `alternatywa dla stickerapp` / `alternatywa dla sticker mule` (pojedyncze marki - tylko przy potwierdzonym odrębnym wolumenie)
* `polski odpowiednik sticker mule` / `... stickerapp`
* `naklejki jak sticker mule w polsce`
* `tani zamiennik stickerapp`
> Wytyczna właściciela: **koncentruj intencję porównawczą na kilku mocnych stronach**, nie mnóż thin per-brand (near-duplicate).

---

## 3. Atrybut / materiał / format (TYLKO realnie oferowane)
* `naklejki winylowe` / `naklejki foliowe` (**rdzeń oferty**)
* `naklejki wodoodporne` (potwierdzone: odporność woda / UV / zadrapania)
* `trwałe naklejki na zamówienie` / `naklejki 300 dpi`
* `die cut naklejki` / `naklejki cięte po obrysie` / `naklejki w kształcie`
* `naklejki okrągłe z własnym nadrukiem` / `naklejki kwadratowe na zamówienie`
> ❌ **NIE** twórz stron pod: holograficzne, transparentne, brokatowe, tłoczone, magnetyczne - **nieoferowane** (fałszywa obietnica).

---

## 4. Transakcyjne: cena / nakład / czas (AEO)
* `naklejki na zamówienie cena` / `ile kosztują naklejki na zamówienie`
* `naklejki mały nakład` / `naklejki od 1 sztuki` / `naklejki na zamówienie pojedyncze`
* `czas realizacji naklejek` / `naklejki w 3 dni` / `naklejki na już`
> Te frazy najczęściej jako **sekcje / FAQ** w landingach, nie zawsze osobna strona (ryzyko thin page). Uważaj na pokrycie z homepage.

---

## Zasada doboru fraz na landing
* Jeden landing = **klaster mikro** kilku blisko powiązanych fraz o **jednej intencji**, nie pojedyncza fraza.
* Główna fraza → `H1` / URL / `title`; frazy semantyczne/poboczne → `H2`/`H3`/FAQ.
* **Waliduj wolumen i lukę** (GSC) przed budową - patrz `strategy.md` "checklist decyzyjny".

---

## 5. Frazy potwierdzone danymi GSC (2026-07-24)
Rzeczywiste zapytania z Search Console (wyświetlenia / pozycja) - do walidacji i priorytetyzacji. Serwis wczesny (max ~44 wyśw.), więc traktuj to jako sygnał kierunku, nie twardy wolumen:
* **Generyczne (strona główna/blog, NIE landing):** "małe naklejki" (44 wyśw., poz. 8), "małe naklejki z własnym nadrukiem" (22, poz. 24).
* **Format/atrybut (kandydat na landing):** "wykroje die-cut i kiss-cut" (15), "kiss cut"/"kisscut" (poz. 8) → wspiera `/naklejki-die-cut`. **"fotonaklejki" / "foto naklejki" (13+1, poz. 27-39) → realna luka: kandydat na landing/wpis "fotonaklejki"** (naklejka ze zdjęcia jako produkt).
* **B2B (nascentne, intencja komercyjna):** "słoiki z logo" (poz. 14), "naklejki serwisowe" (poz. 25), "naklejki warsztatowe" (poz. 39) → obsługiwane przez `/naklejki-dla-firm`.
* **⚠️ "zaprojektuj naklejkę / naklejki" (wielokrotnie w danych):** objęte **zakazem brandowym** ("projektowanie" - kreator = arkusz). Nie budować pod tę frazę; łapać semantycznie przez "stwórz / zamów".

## Mapowanie landing → klaster fraz
* `/naklejki-dla-firm` → naklejki dla firm, naklejki z logo dla firm, naklejki firmowe z logo (semantyczne: słoiki z logo, serwisowe, warsztatowe).
* `/alternatywa-dla-sticker-mule-i-stickerapp` → polska alternatywa dla sticker mule / stickerapp.
* `/naklejki-foliowe` (zbudowane 2026-07-25) → naklejki foliowe / winylowe / wodoodporne / trwałe (mikro-klaster scalony - NIE budować osobnego `/naklejki-winylowe` ani `/naklejki-wodoodporne`).
* `/fotonaklejki` (zbudowane 2026-07-27) → fotonaklejki, foto naklejki, naklejki ze zdjęcia, naklejka z własnego zdjęcia (ujęcie komercyjne/produktowe; różnicowane od edukacyjnego spoke'a `naklejka-ze-zdjecia...`).
* `/naklejki-die-cut` (zbudowane 2026-07-29) → die cut naklejki, cięte po obrysie, naklejki w kształcie.

---

## 6. Nowa pula komercyjna (dopisano 2026-07-30) - etykiety, kreator, laptop

### 6a. Etykiety na słoiki/opakowania (luka leksykalna "etykiety" - NOWY landing)
Searcher pisze **"etykiety"/"napisy"**, nie "naklejki" - mamy spoke'y o "naklejkach na słoiki", ale zero strony na leksyk "etykiety". Intencja komercyjno-segmentowa (przetwory B2C + manufaktury B2B), realny popyt (przetwory sezonowe, świece, kosmetyki). Sygnał GSC: "słoiki z logo" (poz. 14).
* `etykiety na słoiki` / `etykiety na słoik` / `naklejki na słoiki personalizowane` (główna) → **nowy landing `/etykiety-na-sloiki`**.
* `napisy na słoiki` / `własne etykiety` (semantyczne, H2/FAQ).
* `etykiety na świeczki` (persona producenci świec) / `etykiety na kosmetyki naturalne` / `etykiety ze składem` / `etykiety na produkty` / `naklejki na butelki` (sekcje/pod-persony na tym samym landingu).
> Landing komercyjny; agreguje spoke'y: przyprawy/słoiki, logo/opakowania, nalewki, alkohol. Cross-link `/naklejki-dla-firm` (B2B logo) i `/naklejki-foliowe` (materiał). **Prawda o produkcie:** folia NIE do zmywarki (searcher myje słoiki) - FAQ jasno: mycie ręczne / odporność woda-UV-zadrapania. Różnicowanie od `/naklejki-dla-firm`: tam intencja "firma/logo/faktura", tu leksyk "etykiety/słoiki/przetwory/świece" (także B2C).

### 6b. Kreator / program do naklejek → STRONA GŁÓWNA, nie landing
`kreator naklejek`, `program do robienia/tworzenia naklejek`, `tworzenie naklejek`, `naklejki online kreator` - intencja narzędziowa. **NIE budować landingu** (`/kreator-naklejek` = kanibalizacja `/`, bo strona główna JEST kreatorem i jest najlepszą rankingowo stroną na tę frazę; zgodne z dyrektywą właściciela "skup ruch na `/`"). Rozwiązanie: **optymalizacja `SeoContentSection.tsx` na `/`** (H2/H3 + copy z tymi frazami). Szczegóły: `blog-agent/keywords.md` §9a.
* ⛔ `projektowanie naklejek online` / `zaprojektuj własną naklejkę` - zakaz brandowy, NIE budować (spójne z notą GSC "zaprojektuj naklejkę").

### 6c. Laptop - kandydat Tier 3 (pending GSC)
`naklejki na laptop` / `naklejki na laptopa własny projekt` - komercyjna głowa użytkowa. **Najpierw rozbuduj spoke** `male-naklejki-na-laptopa` na szerszą głowę; landing `/naklejki-na-laptopa` buduj **tylko jeśli** GSC potwierdzi wolumen, a wpis nie zdominuje frazy. Na razie: NIE budować (unikaj thin/near-duplicate z blogiem).
