---
description: Przegląd treści MałeNaklejki - świeże dane (GSC, GA4, zamówienia), ocena zmian, nowa kolejka zadań i strategia, publikacja do panelu
argument-hint: "[na czym się skupić]"
---

Argumenty: `$ARGUMENTS`

Wykonaj to **w tej sesji**, jako agent `redaktor-tresci`, a nie przez podagenta. Tylko główna sesja może jednocześnie pytać Jakuba, czytać GSC w Chrome i zlecać szerokie wyszukiwania podagentom.

**Przegląd nie zmienia stron serwisu.** Zmienia rejestr (kolejkę), bazę fraz, strategię i dziennik. Strony zmienia `/tresc <id>`.

## 1. Przeczytaj

`.claude/agents/redaktor-tresci.md` w całości, `tresci/system.md` (sekcje 2, 9, 11 i 12), `tresci/strategia.md`, ostatnie wpisy `tresci/dziennik.md` (data poprzedniego przeglądu, zmiany i ich daty wdrożenia).

## 2. Dane

1. W `~/Desktop/jdalaszynski`: `npm run panel:dane-tresci -- --project malenaklejki` (GSC 90 dni i 28 dni, GA4 według strony wejścia).
2. Tutaj: `npm run tresci:zamowienia`, `npm run build`, `npm run tresci:frazy`.
3. W `~/Desktop/jdalaszynski`: `npm run panel:queue -- --all` - rekomendacje stratega SEO przyjęte przez Jakuba (tylko odczyt).

Czego brakuje (np. GA4 bez uprawnień), nazwij wprost i pracuj na tym, co jest.

## 3. Ocena zmian

Dla każdej zmiany z dziennika od poprzedniego przeglądu: czy minął horyzont z sekcji 9 systemu. Jeśli tak - porównaj okna 28-dniowe (ten sam dzień tygodnia, z uwagą na sezon) i zapisz werdykt w dzienniku: zadziałało / bez zmian / gorzej, z liczbami. Jeśli nie - „za wcześnie na ocenę” z datą, kiedy ocenić.

## 4. Kolejka

1. **Zadania poprawy** z sygnałów (`uwagi` przy stronach w `tresci/frazy.json`) i z rekomendacji stratega dotyczących treści. Jedno zadanie na stronę, komplet pól z sekcji 2 systemu, `powod` z liczbami i oknem. Najwięcej zyskują strony z dużą liczbą wyświetleń i niskim CTR oraz landingi blisko pierwszej strony.
2. **Nowe strony** tylko z warunkami z sekcji 12 systemu: kandydaci GSC (`kandydaci` w `frazy.json`), podpowiedzi Google, Planer. Bez zdania `roznica` pozycja nie wchodzi.
3. **Porządek:** zadania, których powód zniknął, usuń (z wpisem w dzienniku). Ustal jedną kolejność (`kolejnosc` i `zadanie.kolejnosc`) według sekcji 12 systemu i okien sezonowych. Pilnuj rytmu: 1-2 nowe strony i 3-4 realne aktualizacje miesięcznie.
4. **Baza fraz:** kandydaci GSC z popytem i jasnym właścicielem trafiają do CSV jako warianty albo wspierające (sekcja 11 systemu). Frazy, na które Google pokazuje inną stronę: decyzja w dzienniku (wzmocnić właściciela albo przenieść frazę).

## 5. Strategia

Zaktualizuj `tresci/strategia.md`: stan z danych (tabela grup stron), diagnoza, kierunki, decyzje Jakuba (zamknięte usuń, nowe dopisz z rekomendacją), mierniki. Liczby GA4 i zamówień według strony nie trafiają do pliku (repozytorium publiczne). Zalecenia o wyszukiwarkach AI i danych strukturalnych sprawdź w aktualnych źródłach z datą odczytu.

## 6. Zapisz i opublikuj

1. `npm run tresci:sprawdz`, commit własnych plików (rejestr, CSV, strategia, dziennik), `git log origin/main..HEAD`, push na `main` (zakres z sekcji 7 systemu).
2. W `~/Desktop/jdalaszynski`: `npm run panel:tresci -- --project malenaklejki` i `npm run panel:frazy -- --project malenaklejki`.
3. Wpis w dzienniku: data przeglądu, okno danych, ile zadań dodanych i usuniętych.

## 7. Raport

Układ z sekcji 9 pliku agenta: stan w dwóch zdaniach (liczby rozstrzygające), oceny zmian, trzy pierwsze pozycje kolejki z powodem, „Do Twojej decyzji”, „Nie sprawdzono”.
