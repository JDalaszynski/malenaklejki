# 🏷️ MałeNaklejki.pl – Nowoczesna Platforma DTP & E-Commerce Web-to-Print

> **MałeNaklejki.pl** to nowoczesna platforma e-commerce i automatyzacji DTP (Web-to-Print) dedykowana zamawianiu personalizowanych naklejek na arkuszach A4, naklejek die-cut oraz zestawów firmowych. System łączy zaawansowany interaktywny kreator układania arkuszy A4 z usuwaniem tła w przeglądarce, generator grafik AI, w pełni zintegrowany checkout (P24, BLIK, InPost, BaseLinker, Brevo) oraz autonomiczny pipeline content-marketingowy i SEO (Autoblog, Social Media & Pinterest Generator).

---

## 📑 Spis Treści

- [✨ Kluczowe Funkcjonalności](#-kluczowe-funkcjonalności)
  - [1. Kreator Arkuszy A4 i Silnik DTP](#1-kreator-arkuszy-a4-i-silnik-dtp)
  - [2. Wbudowany Generator Naklejek AI](#2-wbudowany-generator-naklejek-ai)
  - [3. E-Commerce, Koszyk i Płatności](#3-e-commerce-koszyk-i-płatności)
  - [4. Silnik Bloga & Architektura SEO](#4-silnik-bloga--architektura-seo)
  - [5. Autonomiczny Pipeline AI (Autoblog & Social Media)](#5-autonomiczny-pipeline-ai-autoblog--social-media)
- [🛠️ Stack Technologiczny](#️-stack-technologiczny)
- [📁 Struktura Katalogów Projektu](#-struktura-katalogów-projektu)
- [🚀 Szybki Start (Instalacja i Uruchomienie)](#-szybki-start-instalacja-i-uruchomienie)
- [🔐 Konfiguracja Zmiennych Środowiskowych (`.env.local`)](#-konfiguracja-zmiennych-środowiskowych-envlocal)
- [📜 Dostępne Skrypty NPM](#-dostępne-skrypty-npm)
- [🤖 Komendy Agenta AI i Automatyzacje](#-komendy-agenta-ai-i-automatyzacje)
  - [Autoblog Pipeline](#autoblog-pipeline)
  - [Generowanie Grafik Social Media & Pinterest](#generowanie-grafik-social-media--pinterest)
  - [Zasady Biznesowe i Contentowe](#zasady-biznesowe-i-contentowe)
- [🛡️ Bezpieczeństwo i Reguły Firebase](#️-bezpieczeństwo-i-reguły-firebase)
- [🚢 Wdrożenie (Deployment)](#-wdrożenie-deployment)

---

## ✨ Kluczowe Funkcjonalności

### 1. Kreator Arkuszy A4 i Silnik DTP
- **Układanie arkusza A4 w czasie rzeczywistym:** Zaawansowany silnik 2D i 3D (`NewA4Visualizer.tsx`, `A4Visualizer3D.tsx`) pozwalający na skalowanie, obracanie, powielanie i optymalne rozmieszczanie naklejek na arkuszu A4.
- **Wykrywanie i wygładzanie linii cięcia:** Algorytmy wykrywania konturów (`contour.ts`) generujące precyzyjne wektory cięcia (zarówno nacięcie na arkuszu *Kiss-Cut*, jak i wycięcie pojedyncze na wylot *Die-Cut*).
- **Detekcja kolizji i upakowanie:** Algorytmy kolizyjne (`collision.ts`) zapobiegające nakładaniu się grafik i dbające o minimalne marginesy technologiczne do druku.
- **Automatyczne usuwanie tła (Client-side AI):** Integracja z biblioteką `@imgly/background-removal` działającą w WebAssembly po stronie przeglądarki użytkownika – natychmiastowe wycinanie tła bez obciążania serwera.
- **Dynamiczna kalkulacja cen:** Automatyczne przeliczanie ceny w zależności od stopnia wypełnienia arkusza, liczby sztuk i wybranego wariantu dostawy (arkusz vs pojedyncze).

### 2. Wbudowany Generator Naklejek AI
- **Generowanie promptów graficznych:** Zintegrowany moduł oparty o najnowsze modele Google Gemini (`gemini-2.5-flash-image` / `gemini-3.1-flash-image`).
- **Profile i style graficzne:** Gotowe presety dla użytkowników (naklejka wektorowa, styl 3D, retro vintage, kawaii, cyberpunk, badge firmowy itp.).
- **Bezpośredni eksport do kreatora:** Wygenerowana grafika trafia prosto na wirtualny arkusz A4 z automatycznym usunięciem tła i wyznaczeniem linii cięcia.

### 3. E-Commerce, Koszyk i Płatności
- **Zarządzanie stanem koszyka:** Szybki, reaktywny store Zustand (`cartStore.ts`) przechowujący konfigurację arkuszy, parametry naklejek i wycenę.
- **Wielokanałowy Checkout:**
  - **Metody dostawy:** Paczkomaty InPost (wyszukiwarka punktów), Kurier DPD/InPost, opcja etykiet Vinted.
  - **Bramki płatności:** **Przelewy24 (P24)** z pełną obsługą BLIK, kart i szybkich przelewów, obsługa **Stripe** oraz płatności przelewem tradycyjnym.
  - **Dane firmowe / Faktury:** Obsługa NIP, automatyczne walidacje i zapis danych rozliczeniowych.
- **Przerwa urlopowa:** Konfigurowana w panelu administratora (`/admin/ustawienia`) — baner nad nagłówkiem sklepu wraz z zapowiedzią przed startem, podmieniony termin wysyłki w kreatorze i koszyku, informacja w mailach do klienta oraz opcjonalne wstrzymanie przyjmowania zamówień (blokada egzekwowana także po stronie serwera).
- **Integracja BaseLinker:** Automatyczne przekazywanie zamówień do panelu BaseLinker (`baselinker.ts`) w celu szybkiej wysyłki.
- **E-maile transakcyjne Brevo:** System szablonów HTML (`emails.ts`) wysyłający potwierdzenia zamówienia, powiadomienia dla drukarni oraz podsumowania ze szczegółami arkuszy.
- **Generowanie plików produkcyjnych:** Zautomatyzowane tworzenie plików gotowych do druku wielkoformatowego (PDF / pliki z warstwami cięcia w Firebase Storage).

### 4. Silnik Bloga & Architektura SEO
- **Silnik Markdown + Frontmatter:** Baza wpisów w `src/content/blog/` parsowana przez `gray-matter` i `marked`.
- **Topical Authority (Filary & Klastry):** Dwuwarstwowa struktura contentowa – strony filarowe (Pillar Pages) oraz powiązane tematycznie wpisy wspierające z rygorystycznymi regułami linkowania wewnętrznego.
- **Strukturalne Dane SEO (JSON-LD):**
  - Automatyczne parsowanie sekcji `FAQ` do schematu `FAQPage`.
  - Schematy `Article` / `BlogPosting` z obsługą `dateModified` (sygnał świeżości dla Google Search i modeli LLM / SearchGPT / Perplexity).
  - Breadcrumbs i schematy produktowe.
- **Dedykowane strony landingowe:** Zoptymalizowane strony produktowo-usługowe (`/naklejki-die-cut`, `/naklejki-foliowe`, `/naklejki-dla-firm`, `/fotonaklejki`, `/alternatywa-dla-sticker-mule-i-stickerapp`).

### 5. Autonomiczny Pipeline AI (Autoblog & Social Media)
- **Autoblog (`autoblog.md`):** Samodzielny agent AI analizujący plan publikacji (`blog-agent/plan.md`), dobierający frazy (`blog-agent/keywords.md`), tworzący zoptymalizowane artykuły i aktualizujący linkowanie wewnętrzne.
- **Generator Grafik Social Media & Pinterest:**
  - `generate-socials.ts`: tworzenie postów i grafik w formatach 4:5 (FB/IG) oraz 9:16 (TikTok).
  - `generate-pinterest.ts`: tworzenie pinów Pinterest (format JPG 4:5 `pin-N.jpg`) z dedykowanymi opisami w `pinterest-info.md`.
  - `add_logo_bar.mjs`: automatyczny branding i doklejanie estetycznego paska z logo MałeNaklejki do zdjęć na blogu.
- **IndexNow API:** Natychmiastowe powiadamianie wyszukiwarek (Bing, Yandex, IndexNow) o nowo opublikowanych artykułach.

---

## 🛠️ Stack Technologiczny

| Kategoria | Technologie |
|---|---|
| **Frontend & Framework** | [Next.js 16 (App Router)](https://nextjs.org/) (Turbopack, Server Actions), [React 19](https://react.dev/), [TypeScript 5](https://www.typescriptlang.org/) |
| **Styling & UI** | [Tailwind CSS v4](https://tailwindcss.com/), [Shadcn UI](https://ui.shadcn.com/), [Lucide React](https://lucide.dev/), [Framer Motion](https://www.framer.com/motion/) |
| **State Management & Formularze** | [Zustand](https://zustand-demo.pmnd.rs/), [React Hook Form](https://react-hook-form.com/), [Zod](https://zod.dev/) |
| **Grafika & DTP** | `@imgly/background-removal`, `sharp`, `jspdf`, HTML5 Canvas API |
| **Sztuczna Inteligencja (AI)** | Google GenAI SDK (`@google/genai`), Google Gemini 2.5 / 3.1 Flash Image |
| **Backend, Baza & Storage** | [Firebase Firestore](https://firebase.google.com/), [Firebase Admin SDK](https://firebase.google.com/docs/admin/setup), [Firebase Storage](https://firebase.google.com/docs/storage) |
| **Płatności & E-commerce** | [Przelewy24 (P24)](https://www.przelewy24.pl/), [Stripe](https://stripe.com/), [BaseLinker API](https://baselinker.com/) |
| **E-maile Transakcyjne** | [Brevo (Sendinblue) API](https://www.brevo.com/) (`@getbrevo/brevo`) |
| **SEO & Content** | `gray-matter`, `marked`, IndexNow Protocol, Vercel Analytics |

---

## 📁 Struktura Katalogów Projektu

```text
malenaklejki/
├── .agents/                 # Zasady i instrukcje dla agentów AI w IDE
├── blog-agent/              # Baza wiedzy i planowanie bloga (SEO, klastry)
│   ├── facts.md             # Fakty o marce, ofercie i specyfikacji technicznej
│   ├── keywords.md          # Baza słów kluczowych SEO / AEO
│   ├── plan.md              # Harmonogram i statusy artykułów filarowych i wspierających
│   ├── rules.md             # Reguły copywritingu, czarna lista słów, styl komunikacji
│   └── strategy.md          # Strategia contentowa i persony zakupowe
├── landing-agent/           # Plany i szablony stron docelowych (landing pages)
├── social-agent/            # Skrypty i reguły generowania treści na media społecznościowe
│   ├── generate-socials.ts  # Generator postów FB/IG/TikTok (4:5, 9:16)
│   ├── generate-pinterest.ts# Generator Pinów Pinterest (4:5 JPG)
│   ├── social-plan.md       # Harmonogram publikacji w social media
│   └── social-rules.md      # Reguły formatowania i CTA dla social media
├── public/                  # Zasoby statyczne (ikony, logo, czcionki)
│   ├── blog/                # Zdjęcia przypisane do artykułów (/blog/{slug}/)
│   ├── pinterest/           # Wygenerowane grafiki na Pinterest (/pinterest/{slug}/)
│   └── socials/             # Grafiki i materiały na social media
├── src/
│   ├── app/                 # Next.js App Router (strony, routing, Server Actions, API)
│   │   ├── actions/         # Server Actions (createOrder, generateImage, contact)
│   │   ├── api/             # Endpointy API (webhooks P24/Stripe, kompresja, proxy)
│   │   ├── blog/            # Dynamiczne podstrony bloga (/blog i /blog/[slug])
│   │   ├── checkout/        # Formularz zamówienia i wybór metod dostawy/płatności
│   │   ├── koszyk/          # Podgląd i zarządzanie koszykiem
│   │   ├── naklejki-*/      # Dedykowane landing pages SEO (die-cut, foliowe, dla firm itp.)
│   │   ├── zamowienie-sukces/# Strona podziękowania po opłaceniu zamówienia
│   │   ├── layout.tsx       # Główny layout aplikacji z nagłówkiem i stopką
│   │   ├── page.tsx         # Strona główna (Hero, Kreator A4, Opinie, FAQ)
│   │   ├── robots.ts        # Dynamiczny plik robots.txt
│   │   └── sitemap.ts       # Dynamiczna mapa witryny sitemap.xml
│   ├── components/          # Komponenty React
│   │   ├── creator/         # Komponenty kreatora (NewA4Visualizer, A4Visualizer3D, AIGenerator itp.)
│   │   ├── checkout/        # Elementy formularza kasy (adresy, paczkomaty, podsumowania)
│   │   ├── blog/            # Renderery wpisów blogowych, spisy treści, CTA
│   │   ├── home/            # Sekcje strony głównej (Opinie, Korzyści, FAQ)
│   │   ├── layout/          # Header, Footer, Pływający koszyk
│   │   └── ui/              # Komponenty bazowe (Button, Dialog, Card, Input itp.)
│   ├── content/
│   │   └── blog/            # Artykuły blogowe w plikach .md (Markdown + YAML)
│   ├── lib/                 # Integracje, serwisy i biblioteki pomocnicze
│   │   ├── baselinker.ts    # Klient API BaseLinker
│   │   ├── blog.ts          # Parser Markdown, kalkulator czasu czytania, ekstrakcja FAQ
│   │   ├── emails.ts        # Szablony HTML i obsługa wysyłki e-maili przez Brevo
│   │   ├── p24.ts           # Integracja i rejestracja płatności Przelewy24
│   │   ├── firebase/        # Konfiguracja Firebase Client i Firebase Admin SDK
│   │   └── utils/           # Algorytmy DTP (collision.ts, contour.ts, rateLimit.ts)
│   ├── store/
│   │   └── cartStore.ts     # Globalny magazyn stanu koszyka (Zustand)
│   └── types/               # Definicje typów TypeScript
├── add_logo_bar.mjs         # Skrypt doklejający dolny pasek z brandingiem do zdjęć
├── autoblog.md              # Pełna procedura krok po kroku dla automatycznego bloga
├── KOMENDY.md               # Ściągawka komend agenta AI w języku naturalnym
├── storage.rules            # Reguły bezpieczeństwa Firebase Storage
└── package.json             # Zależności i konfiguracja projektu
```

---

## 🚀 Szybki Start (Instalacja i Uruchomienie)

### Wymagania wstępne
- **Node.js**: Wersja `20.x` lub nowsza (rekomendowana `22.x LTS`).
- **NPM** / **PNPM** / **Bun**.

### 1. Klonowanie repozytorium
```bash
git clone https://github.com/twoj-login/malenaklejki.git
cd malenaklejki
```

### 2. Instalacja zależności
```bash
npm install
```

### 3. Konfiguracja zmiennych środowiskowych
Utwórz plik `.env.local` w głównym katalogu projektu i uzupełnij wymagane klucze API (patrz sekcja [Konfiguracja Zmiennych Środowiskowych](#-konfiguracja-zmiennych-środowiskowych-envlocal)).

```bash
cp .env.example .env.local  # jeśli dostępny lub utwórz manualnie
```

### 4. Uruchomienie serwera deweloperskiego
```bash
npm run dev
```

Aplikacja będzie dostępna pod adresem: **`http://localhost:3000`** (lub `http://localhost:3001` w przypadku zajętego portu).

---

## 🔐 Konfiguracja Zmiennych Środowiskowych (`.env.local`)

Poniższa tabela przedstawia zestaw zmiennych wykorzystywanych przez aplikację:

| Zmienna | Wymagana | Opis |
|---|:---:|---|
| `NEXT_PUBLIC_APP_URL` | Tak | Bazowy adres URL aplikacji (np. `https://malenaklejki.pl` lub `http://localhost:3000`). |
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Tak | Klucz API projektu Firebase dla przeglądarki. |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | Tak | Domena uwierzytelniania Firebase (np. `malenaklejki.firebaseapp.com`). |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | Tak | ID projektu Firebase. |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | Tak | Nazwa bucketa Storage w Firebase (np. `malenaklejki.firebasestorage.app`). |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | Tak | Sender ID usługi Firebase Cloud Messaging. |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | Tak | Identyfikator aplikacji Web w Firebase. |
| `FIREBASE_PROJECT_ID` | Tak | ID projektu dla Firebase Admin SDK. |
| `FIREBASE_CLIENT_EMAIL` | Tak | Adres e-mail konta serwisowego (Service Account) Firebase. |
| `FIREBASE_PRIVATE_KEY` | Tak | Klucz prywatny konta serwisowego Firebase Admin (`"-----BEGIN PRIVATE KEY...-----"`). |
| `P24_MERCHANT_ID` | Tak | Identyfikator sprzedawcy w Przelewy24. |
| `P24_POS_ID` | Tak | Identyfikator punktu sprzedaży (POS ID) w Przelewy24. |
| `P24_CRC` | Tak | Klucz CRC do wyliczania sum kontrolnych transakcji Przelewy24. |
| `P24_API_KEY` | Tak | Klucz API do komunikacji z REST API Przelewy24. |
| `P24_ENV` | Tak | Środowisko P24: `sandbox` (testowe) lub `production`. |
| `BREVO_API_KEY` | Tak | Klucz API platformy Brevo (Sendinblue) do wysyłki e-maili transakcyjnych. |
| `ADMIN_EMAIL` | Tak | Adres e-mail do odbierania powiadomień o zamówieniach (np. `kontakt@malenaklejki.pl`). |
| `GEMINI_API_KEY` | Tak | Klucz API Google AI Studio / Gemini do wbudowanego generatora naklejek. |
| `NEXT_PUBLIC_GA_ID` | Opcjonalnie | Identyfikator Google Analytics 4 (np. `G-XXXXXXXXXX`). |
| `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION` | Opcjonalnie | Token weryfikacyjny Google Search Console. |
| `BASELINKER_TOKEN` | Opcjonalnie | Token API do automatycznego przekazywania zamówień do BaseLinkera. |

---

## 📜 Dostępne Skrypty NPM

```bash
# Uruchomienie środowiska deweloperskiego (Turbopack)
npm run dev

# Kompilacja produkcyjna projektu
npm run build

# Uruchomienie skompilowanej aplikacji w trybie produkcyjnym
npm run start

# Sprawdzenie poprawności typów i reguł lintera ESLint
npm run lint
```

---

## 🤖 Komendy Agenta AI i Automatyzacje

Projekt zawiera dedykowane procesy dla agentów AI wspierające automatyzację tworzenia treści i marketingu.

### Autoblog Pipeline

Aby uruchomić pełen zautomatyzowany cykl publikacji wpisu, wystarczy wydać agentowi polecenie:
```text
"Uruchom Autoblog"
```

**Kolejność wykonywania pipeline'u:**
1. **Analiza:** Odczyt pierwszego wolnego tematu z `blog-agent/plan.md` wraz z metadanymi i słowami kluczowymi.
2. **Katalog zdjęć:** Utworzenie dedykowanego folderu `public/blog/{slug}/`.
3. **Generowanie treści:** Zapis artykułu z frontmatterem, nagłówkami i sekcją FAQ do `src/content/blog/{slug}.md`.
4. **Optymalizacja zdjęć:** Kompresja i konwersja surowych grafik do formatu Web JPEG.
5. **Generowanie materiałów Social & Pinterest (NAJPIERW z surowych zdjęć):**
   ```bash
   npx tsx social-agent/generate-socials.ts {slug}.md
   npx tsx social-agent/generate-pinterest.ts {slug}.md
   ```
6. **Branding zdjęć (DOPIERO PO PINACH):**
   ```bash
   node add_logo_bar.mjs public/blog/{slug}
   ```
7. **Aktualizacja planu & Git:** Oznaczenie tematu w `plan.md`, `git commit` i `git push`.
8. **Ping IndexNow:** Wysłanie sygnału o aktualizacji sitemapy do Bing/IndexNow.

### Generowanie Grafik Social Media & Pinterest

| Cel | Polecenie |
|---|---|
| Generowanie Pinów (4:5 JPG) | `npx tsx social-agent/generate-pinterest.ts {slug}.md` |
| Generowanie grafik na FB, IG i TikTok | `npx tsx social-agent/generate-socials.ts {slug}.md` |
| Nałożenie paska z logo na zdjęcia | `node add_logo_bar.mjs public/blog/{slug}` |

### Zasady Biznesowe i Contentowe

> [!IMPORTANT]
> **Kreator służy do układania arkusza, a nie do projektowania grafiki:**
> - Kreator na stronie głównej służy do wgrywania gotowego pliku, kadrowania, automatycznego usuwania tła i konfiguracji parametrów produkcyjnych (rozmiary, nakład, sposób cięcia).
> - W tekstach marketingowych i na blogu **nigdy nie piszemy, że w kreatorze "projektuje się naklejkę/napis od zera"**.
> - Jako źródło grafiki w pierwszej kolejności rekomendujemy **generatory AI** (wbudowany generator Gemini, Midjourney, ChatGPT), a dopiero potem programy graficzne (Canva, Photoshop).

---

## 🛡️ Bezpieczeństwo i Reguły Firebase

- Pliki przesyłane przez użytkowników (zarówno do podglądu, jak i wygenerowane arkusze produkcyjne) są izolowane w Firebase Storage zgodnie z regułami w `storage.rules`.
- Akcje serwerowe (`createOrder`, `generateImage`, `contact`) są chronione mechanizmami **Rate Limitingu** (`rateLimit.ts`) oraz sanityzacją danych wejściowych (`sanitize.ts`) przy użyciu schematów **Zod**.
- Klucze prywatne Firebase Admin SDK, Przelewy24 CRC oraz Gemini API są przetwarzane wyłącznie po stronie serwera (Node.js runtime) i nie są ujawniane w kodzie klienckim.

---

## 🚢 Wdrożenie (Deployment)

Projekt jest w pełni zoptymalizowany pod kątem wdrożenia na platformie **Vercel**:

1. Połącz repozytorium GitHub z projektem w panelu [Vercel](https://vercel.com).
2. W ustawieniach projektu (*Project Settings -> Environment Variables*) uzupełnij wszystkie zmienne z pliku `.env.local`.
3. Zbuduj i opublikuj projekt – Vercel automatycznie wykryje konfigurację Next.js i skonfiguruje optymalizację brzegową (Edge/Serverless).

---

<p align="center">
  Stworzone z pasją dla <strong>MałeNaklejki.pl</strong> • Najwyższa jakość naklejek i etykiet
</p>
