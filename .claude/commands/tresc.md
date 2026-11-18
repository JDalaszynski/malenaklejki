---
description: Napisz i opublikuj treść z kolejki albo wykonaj zadanie poprawy opublikowanej strony - od briefu do produkcji, IndexNow i GSC
argument-hint: "<id z tresci/rejestr.json> [uwagi]"
---

Zlecenie: `$ARGUMENTS`

Wykonaj to **w tej sesji**, jako agent `redaktor-tresci`, a nie przez podagenta. Tylko główna sesja może pytać Jakuba i używać Claude in Chrome do GSC. Prompt zwykle kopiuje Jakub z panelu: MałeNaklejki → „Treści” → „Kopiuj prompt”.

## 1. Przeczytaj

1. `.claude/agents/redaktor-tresci.md` w całości.
2. `tresci/system.md` w całości: szablony, standard, procedura, zakres publikacji bez pytania, decyzje o zgłoszeniach, pomiar.
3. Pozycję o tym `id` w `tresci/rejestr.json` i `blog-agent/facts.md`.

## 2. Zlecenie

Pierwsze słowo to `id`, reszta to brief z panelu i uwagi Jakuba. **Uwagi Jakuba mają pierwszeństwo przed briefem z rejestru**, ale nie przed sekcjami 2 i 3 pliku agenta.

- **`w_kolejce`:** napisz i opublikuj stronę według `tresci/system.md`, sekcja 6, kroki 1-12. Pozycja z `okno`, gdy dziś jest przed `okno.od`: nie pisz, podaj datę i następną pozycję.
- **`wstrzymane`:** nie pisz. Powiedz, na co czeka (`warunek`), i zakończ.
- **`opublikowane` z polem `zadanie`:** wykonaj zadanie (`teza`) według sekcji 6. Przed zmianą odśwież liczby tej strony (`tresci/frazy.json`, w razie potrzeby sekcja 11 systemu, „Odświeżenie danych”) - jeśli powód zadania już nie istnieje, nie zmieniaj strony, usuń zadanie i zapisz to w dzienniku. Po wykonaniu usuń pole `zadanie`, wpisz w dzienniku, co zmieniłeś, i datę oceny (sekcja 9 systemu: horyzonty).
- **`opublikowane` bez zadania:** zmień stronę według uwag Jakuba. Bez uwag - niczego nie zmieniaj, podaj stan strony: liczby, sygnały, braki fraz, zgłoszenia.
- **Brak `id` albo nieznane `id`:** niczego nie zmieniaj, podaj kolejkę (kolejność, `id`, tytuł albo tytuł zadania, status) i wskaż następną pozycję.

Zadanie, które wymaga zmiany spoza sekcji 7 systemu (strona główna, szablon, stopka): przygotuj zmianę, pokaż ją i zapytaj przed pushem.

## 3. Publikacja

Push na `main` bez pytania tylko w zakresie z `tresci/system.md`, sekcja 7, i tylko po zielonych `npm run build`, `npm run tresci:frazy -- --sprawdz <ścieżka>`, `npm run tresci:sprawdz` i `npx tsc --noEmit`. Przed pushem `git log origin/main..HEAD`: jadą tylko Twoje commity.

Raport kończy się adresem strony, stanem zgłoszeń (IndexNow, GSC) i datą, kiedy ocenić efekt.
