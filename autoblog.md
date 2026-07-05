# Instrukcja Agenta: Automatyczny Blog (Autoblog)

Jako agent AI jesteś odpowiedzialny za proces tworzenia i publikacji nowych artykułów na blogu MałeNaklejki. Poniżej znajduje się procedura krok po kroku, którą musisz wykonać przy każdym uruchomieniu procesu "Autoblog".

## Krok 1: Przygotowanie i Kontekst
1. Przeczytaj pliki: `blog-agent/rules.md`, `blog-agent/strategy.md` oraz `blog-agent/keywords.md`.
2. Otwórz plik `blog-agent/plan.md` i znajdź pierwszy niezrealizowany temat z listy (oznaczony jako `- [ ]`).
3. Odczytaj wszystkie metadane podpięte pod ten temat (Format, Główna Fraza Kluczowa, Cel, Persona, Link nadrzędny).
4. Przeanalizuj istniejące już artykuły w katalogu `src/content/blog/` (tytuły i ich webowe "slugi"), aby mieć bazę do linkowania wewnętrznego.

## Krok 2: Pisanie Artykułu
Na podstawie zebranych informacji wygeneruj treść artykułu.

**Wymagania ogólne:**
- Pisz zgodnie z zasadami (`rules.md`), uwzględniając personę, cel i format wpisu.
- Stosuj styl zgodny z `strategy.md` (profesjonalny copywriter i ekspert ds. marketingu w "MałeNaklejki").
- Wybierz odpowiednie frazy z bazy `keywords.md` powiązane semantycznie z tematem i wpleć je w sposób naturalny w nagłówki (H2/H3) oraz treść. Główna fraza kluczowa MUSI znaleźć się w tytule oraz w pierwszym akapicie. Bez upychania na siłę!

**Linkowanie wewnętrzne (KRYTYCZNE SEO):**
- **Zasada filarów:** Jeśli temat posiada "Link nadrzędny (Filar)", **BEZWZGLĘDNIE** wstaw link prowadzący do niego w naturalny sposób w obrębie pierwszego lub drugiego rozdziału H2. Użyj frazy kluczowej jako anchor text (np. `[naklejki na zamówienie](/podany-link-nadrzedny)`).
- **Dodatkowe linki:** Wstaw maksymalnie 1-2 naturalne linki do innych wpisów z bloga (zidentyfikowanych w Kroku 1), jeśli pasują kontekstowo. Nie wstawiaj na siłę.

**Frontmatter (YAML):**
Artykuł musi zaczynać się od bloku YAML:
```yaml
---
title: "Tytuł artykułu w cudzysłowie"
slug: "tytul-artykulu-bez-polskich-znakow-oddzielony-myslnikami"
date: "YYYY-MM-DD"
description: "Meta description pod SEO (120-160 znaków, zawierający słowo kluczowe, zachęcający do kliknięcia)"
image: ""
tags: ["naklejki", "marketing", "poradnik"] # dopasuj tagi
cta_text: "Krótkie wezwanie do akcji na przycisk (max 4-5 słów)"
---
```

**Zakończenie artykułu:**
Na samym końcu pliku dopisz kod HTML przycisku CTA wykorzystujący tekst z `cta_text`:
```html

<a href="/" style="display: inline-block; background-color: #02af7a; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 18px; margin-top: 24px; text-align: center;">{cta_text}</a>
```

## Krok 3: Weryfikacja i Optymalizacja (Self-Correction)
Zanim przejdziesz do zapisu i publikacji, przeczytaj ponownie wygenerowany przez siebie artykuł i sprawdź go pod kątem pełnej zgodności z dokumentacją:
1. **Zgodność z `rules.md`**: Upewnij się, że tekst zachowuje styl ekspercki i język korzyści. Sprawdź, czy kategorycznie nie użyto zakazanych zwrotów (np. "W dzisiejszych czasach...", "Podsumowanie"), czy nie ma pustych ogólników oraz czy dodano obowiązkową sekcję FAQ.
2. **Zgodność z `keywords.md`**: Sprawdź naturalne nasycenie i wplecenie głównych i pobocznych słów kluczowych w nagłówkach (H2/H3) oraz w treści.
3. **Zgodność z `strategy.md`**: Upewnij się, że artykuł trafia do docelowej persony i odpowiednio uwzględnia kontekst biznesowy marki "MałeNaklejki".
4. **Linkowanie wewnętrzne**: Zweryfikuj, czy wpis wspierający posiada mocny link zwrotny do nadrzędnego "Pillar Page", a nadrzędny Pillar Page został przez Ciebie zaktualizowany o link do nowego wpisu.

Jeśli wykryjesz jakiekolwiek braki, wprowadź niezbędne poprawki.

## Krok 4: Zapis i Aktualizacja
1. **Zapisz artykuł:** Zapisz wygenerowany artykuł w formacie Markdown w pliku `src/content/blog/{slug}.md`.
2. **Aktualizacja planu:** W pliku `blog-agent/plan.md`:
   - Przenieś napisany artykuł (wraz z jego wciętymi metadanymi) do sekcji `## 📈 Zrealizowane Artykuły`.
   - Zmień jego status na ukończony: `- [x] **Tytuł** (opublikowano YYYY-MM-DD)`.
3. **Synchronizacja Git:**
   - Wykonaj polecenia w terminalu:
     `git add src/content/blog/{slug}.md blog-agent/plan.md`
     `git commit -m "auto(blog): opublikowano wpis o '{tytuł}'"`
     `git push origin main`
4. **Ping Google:**
   - Wykonaj polecenie typu curl w terminalu, aby wysłać ping do Google:
     `curl -s "https://www.google.com/ping?sitemap=https://www.malenaklejki.pl/sitemap.xml"`
