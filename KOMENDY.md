# 🤖 Ściągawka Komend Agenta AI - MałeNaklejki

Wywołania agenta dla projektu `malenaklejki`. Wszystkie komendy działają w języku naturalnym.

---

## 🟢 BLOG

| Cel | Komenda |
|---|---|
| Napisz następny artykuł z planu | `"Napisz następny artykuł z planu"` lub `"Uruchom Autoblog"` |
| Napisz konkretny artykuł z planu | `"Napisz artykuł o [temat] z planu"` |
| Zoptymalizuj artykuł pod SEO | `"Przeanalizuj artykuł [slug] i zrób z nim co konieczne dla SEO"` |
| Sprawdź linkowanie wewnętrzne Pillar Page | `"Sprawdź linkowanie wewnętrzne Pillar Page [slug]"` |
| Dodaj nowy temat do planu | `"Dodaj nowy temat do blog-agent/plan.md: [temat, fraza, persona, link filara]"` |

**Referencje:** `autoblog.md`, `blog-agent/rules.md`, `blog-agent/strategy.md`, `blog-agent/keywords.md`, `blog-agent/plan.md`

---

## 🟣 SOCIAL MEDIA & PINTEREST

| Cel | Komenda |
|---|---|
| Wygeneruj Piny + grafiki 4:5 dla artykułu | `"Wykonaj Piny dla [slug artykułu]"` |
| Wygeneruj wszystkie formaty social (FB, IG, TikTok, Pinterest) | `"Wygeneruj social media dla artykułu [slug]"` |
| Tylko treści tekstowe, bez grafik | `"Napisz posty social media dla [slug] bez uruchamiania skryptu"` |

> Skrypt automatyczny: `npx tsx social-agent/generate-socials.ts {slug}.md`
> Wynik: grafiki PNG 4:5 w `/public/pinterest/{slug}/` + opisy w `pinterest-info.md`

**Referencje:** `social-agent/social-rules.md`, `social-agent/social-plan.md`

---

## 🔵 GIT & PUBLIKACJA

| Cel | Komenda |
|---|---|
| Opublikuj artykuł na GitHubie i pinguj Google | `"Opublikuj artykuł [slug] na GitHub i pinguj sitemap"` |
| Ręczny commit po zmianach | `"Zrób commit i push zmian w [slug]"` |

---

## 🟡 SEO / AUDYT

| Cel | Komenda |
|---|---|
| Audyt SEO konkretnego artykułu | `"Zrób audyt SEO artykułu [slug]"` |
| Sprawdź wszystkie artykuły pod zasady z rules.md | `"Sprawdź wszystkie artykuły na blogu pod kątem naruszeń zasad"` |
| Popraw imageAlt / meta description | `"Popraw imageAlt i opis w [slug]"` |
| Sprawdź naruszenia zasady ograniczeń kreatora | `"Sprawdź czy artykuł [slug] nie narusza zasad opisywania kreatora"` |

---

## ⚙️ PEŁNY PIPELINE (jedno polecenie = wszystko)

```
"Uruchom Autoblog"
```

Wykonuje automatycznie w kolejności:
1. Czytanie `blog-agent/plan.md` → pierwszy niezrealizowany temat
2. Przeczytanie `rules.md`, `strategy.md`, `keywords.md`
3. Tworzenie folderu `/public/blog/{slug}/`
4. Pisanie artykułu + weryfikacja SEO (self-correction)
5. Zapis do `src/content/blog/{slug}.md`
6. Skrypt social+Pinterest → `/public/pinterest/{slug}/`
7. Aktualizacja `plan.md` (oznaczenie jako zrealizowany)
8. `git add` → `git commit` → `git push origin main`
9. Ping Google Sitemap

> 💡 Użyj `/goal` aby agent działał bez przerw aż do pełnego ukończenia całego pipeline'u.

---

## 📁 Mapa kluczowych plików

| Plik | Rola |
|---|---|
| `autoblog.md` | Główna instrukcja pipeline'u Autoblog (krok po kroku) |
| `blog-agent/plan.md` | Lista artykułów do napisania i już zrealizowanych |
| `blog-agent/rules.md` | Zasady stylu, SEO, czarna lista zwrotów |
| `blog-agent/strategy.md` | Persony, kontekst biznesowy, architektura klastrów |
| `blog-agent/keywords.md` | Baza słów kluczowych |
| `social-agent/social-rules.md` | Zasady pisania postów social media |
| `social-agent/social-plan.md` | Plan recyklingu artykułów na content social |
| `social-agent/generate-socials.ts` | Skrypt generujący Piny + grafiki 4:5 |
| `.agents/AGENTS.md` | Zasady SEO bloga (linkowanie, zdjęcia, kreator) |
| `src/content/blog/` | Gotowe artykuły w Markdown |
| `public/blog/{slug}/` | Zdjęcia do artykułu |
| `public/pinterest/{slug}/` | Gotowe grafiki Pinterest (4:5 PNG) |
| `social-agent/outputs/` | Teksty social media do wklejenia |
