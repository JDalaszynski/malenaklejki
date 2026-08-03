# 📅 Plan Generowania Treści Social Media

Zadaniem Agenta Social Media jest śledzenie artykułów z katalogu `src/content/blog` i przekształcanie ich w gotowe materiały na Social Media.

Poniżej lista gotowych artykułów i status wygenerowania dla nich grafik oraz postów tekstowych. Aby wygenerować brakujące materiały, uruchom w terminalu komendę:
`npx ts-node social-agent/generate-socials.ts <nazwa-pliku.md>`

> **Automatyzacja TikTok (opis pod karuzelę):** Uruchomienie `generate-pinterest.ts` tworzy teraz ZAWSZE, obok pinów i `pinterest-info.md`, także plik `tiktok-info.txt` (surowy opis pod karuzelę zdjęć: Tytuł + Treść + CTA "Link do kreatora w bio 👇" + 5 hashtagów). Wszystkie istniejące foldery w `/public/pinterest/` mają już ten plik. Checkbox "TikTok (Karuzela/Photo Mode)" poniżej odnosi się do pełnego zestawu 9:16 (slajdy graficzne), nie do samego opisu.

---

## 🎯 Priorytety Konwersyjne (Top 7)

Sprawdziłem wszystkie artykuły pod kątem ich potencjału wiralowego i sprzedażowego. Poniższa lista określa, które tematy warto wypuścić na Social Media w pierwszej kolejności, ponieważ dotykają silnych emocji, rozwiązują konkretny problem lub są wysoce wizualne (co na IG i TikToku sprzedaje najlepiej).

**🔥 Priorytet 1: Emocje, Wydarzenia i Prezenty (Najwyższa konwersja impulsywna)**
Są to tematy, w których klient kupuje pod wpływem emocji, często w większych ilościach lub wyższym budżecie.
1. **`personalizowane-naklejki-na-alkohol-wyjatkowy-dodatek-na-wesela-i-imprezy.md`** (Wesela to ogromny i wdzięczny rynek. Przyszłe pary młode uwielbiają personalizację).
2. **`personalizowane-naklejki-na-zeszyty-i-do-przedszkola.md`** (Rodzice to świetny target reklamowy, a gubienie podpisanych rzeczy to ich realny ból głowy. Dodatkowo jest to mocno sezonowe).
3. **`naklejka-ze-zdjecia-jak-przeniesc-wspomnienia-na-naklejke.md`** (Świetny, emocjonalny pomysł na prezent - już wygenerowany!).

**🚀 Priorytet 2: Pasje, Twórcy i Estetyka (Świetne na TikTok / Instagram)**
Są to tematy mocno wizualne, idealne pod format "Before/After" lub treści inspiracyjne.
4. **`naklejki-wlasnego-projektu-na-sloiki-z-przyprawami-zorganizuj-swoja-kuchnie.md`** (Trend "home organization" jest niezwykle popularny na TikToku i Instagramie. To przyciąga wzrok na ułamki sekund).
5. **`wklepki-i-wlepy-z-wlasnym-nadrukiem-dla-artystow-i-spolecznosci.md`** (Grupa docelowa, która zamawia naklejki systematycznie i chętnie dzieli się twórczością innych na własnych relacjach).
6. **`naklejki-maly-naklad-jak-zamowic-pojedyncze-sztuki-bez-przeplacania.md`** (Rozwiązuje największy "ból" małych firm i twórców – brak budżetu na zamawianie tysięcy sztuk).
7. **`naklejki-motoryzacyjne-i-tuningowe-z-wlasnym-nadrukiem.md`** (Bardzo zaangażowana społeczność na grupach na FB i IG, idealna pod dzielenie się zdjęciami aut z wlepkami).

---

## 📝 Lista Artykułów

- [ ] **co-to-jest-die-cut-i-kiss-cut-roznice-w-wyleciach-naklejek-reklamowych.md**
    - [ ] TikTok (Karuzela/Photo Mode)
    - [x] Pinterest

- [ ] **drukowanie-naklejek-online-na-co-zwrocic-uwage-przed-wysylka-projektu.md**
    - [ ] TikTok (Karuzela/Photo Mode)
    - [x] Pinterest

- [ ] **jak-zamowic-idealne-naklejki-na-zamowienie-z-wlasnym-nadrukiem.md**
    - [ ] TikTok (Karuzela/Photo Mode)
    - [x] Pinterest (JPG, 6 pinów) + tiktok-info.txt + facebook-info.txt

- [ ] **jak-zrobic-wlasne-naklejki-w-telefonie-proste-aplikacje-i-triki.md**
    - [ ] TikTok (Karuzela/Photo Mode)
    - [x] Pinterest

- [ ] **male-naklejki-na-laptopa-jak-wyrazic-siebie-i-stworzyc-wlasny-styl.md**
    - [ ] TikTok (Karuzela/Photo Mode)
    - [x] Pinterest

- [ ] **naklejka-z-logo-firmy-jak-skutecznie-brandowac-swoje-produkty.md**
    - [ ] TikTok (Karuzela/Photo Mode)
    - [x] Pinterest

- [x] **naklejka-ze-zdjecia-jak-przeniesc-wspomnienia-na-naklejke.md**
    - [x] TikTok (Karuzela/Photo Mode)
    - [x] Pinterest

- [ ] **naklejki-firmowe-na-eventy-welcome-pack-dla-pracownikow.md**
    - [ ] TikTok (Karuzela/Photo Mode)
    - [x] Pinterest

- [ ] **naklejki-maly-naklad-jak-zamowic-pojedyncze-sztuki-bez-przeplacania.md**
    - [ ] TikTok (Karuzela/Photo Mode)
    - [x] Pinterest

- [ ] **naklejki-motoryzacyjne-i-tuningowe-z-wlasnym-nadrukiem.md**
    - [ ] TikTok (Karuzela/Photo Mode)
    - [x] Pinterest

- [ ] **naklejki-na-koperty-slubne-i-podziekowania-dla-gosci.md**
    - [ ] TikTok (Karuzela/Photo Mode)
    - [x] Pinterest (JPG, 8 pinów)

- [ ] **naklejki-na-nalewki-domowe-jak-ozdobic-butelki-na-nalewki.md**
    - [ ] TikTok (Karuzela/Photo Mode)
    - [x] Pinterest

- [ ] **naklejki-na-rower-i-akcesoria-sportowe-dla-pasjonatow.md**
    - [ ] TikTok (Karuzela/Photo Mode)
    - [x] Pinterest

- [ ] **naklejki-serwisowe-dla-firm-hydraulicy-elektrycy-i-instalatorzy.md**
    - [ ] TikTok (Karuzela/Photo Mode)
    - [x] Pinterest

- [x] **naklejki-wlasnego-projektu-na-sloiki-z-przyprawami-zorganizuj-swoja-kuchnie.md**
    - [x] TikTok (Karuzela/Photo Mode)
    - [x] Pinterest

- [ ] **naklejki-z-imionami-na-meble-drzwi-i-pojemniki-organizacja-domu.md**
    - [ ] TikTok (Karuzela/Photo Mode)
    - [x] Pinterest

- [ ] **naklejki-z-wlasnym-logo-na-sloiki-i-opakowania.md**
    - [ ] TikTok (Karuzela/Photo Mode)
    - [x] Pinterest

- [ ] **naklejki-z-wlasnym-napisem-jak-przygotowac-plik-i-zamowic-online.md**
    - [ ] TikTok (Karuzela/Photo Mode)
    - [x] Pinterest

- [ ] **personalizowane-naklejki-na-alkohol-wyjatkowy-dodatek-na-wesela-i-imprezy.md**
    - [ ] TikTok (Karuzela/Photo Mode)
    - [x] Pinterest

- [ ] **personalizowane-naklejki-na-zeszyty-i-do-przedszkola.md**
    - [ ] TikTok (Karuzela/Photo Mode)
    - [x] Pinterest

- [ ] **wklepki-i-wlepy-z-wlasnym-nadrukiem-dla-artystow-i-spolecznosci.md**
    - [ ] TikTok (Karuzela/Photo Mode)
    - [x] Pinterest
