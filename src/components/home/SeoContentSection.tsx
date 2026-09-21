"use client";

import Link from "next/link";
import { Reveal, SectionHeading, HighlightWord, displayFont, inlineLink } from "./primitives";

export function SeoContentSection() {
  return (
    <div className="space-y-8 sm:space-y-12 py-10">
      <Reveal>
        <SectionHeading
          eyebrow="Wszystko co musisz wiedzieć"
          title={
            <>
              Personalizowane <HighlightWord>naklejki z własnym nadrukiem</HighlightWord>
            </>
          }
        />
      </Reveal>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 max-w-5xl mx-auto px-4 text-muted-foreground leading-relaxed text-[15px] sm:text-base">
        <Reveal delay={0.1}>
          <div className="space-y-6">
            <section className="space-y-3">
              <h3 className={`text-xl font-extrabold text-foreground ${displayFont}`}>Czym jest cięcie po obrysie (die-cut)?</h3>
              <p>
                Cięcie po obrysie (tzw. <Link href="/blog/co-to-jest-die-cut-i-kiss-cut-roznice-w-wyleciach-naklejek-reklamowych" className={inlineLink}>die-cut</Link>) to zaawansowana technika produkcji, w której ploter precyzyjnie wycina naklejkę wzdłuż kształtu Twojej grafiki, całkowicie ignorując przezroczyste tło. Dzięki temu Twoje <Link href="/wlepki-na-zamowienie" className={inlineLink}>wlepki z logo</Link>, grafiki czy zdjęcia przybierają unikalny kształt, a nie standardowego kwadratu. Otrzymujesz <strong>własne naklejki</strong>, które wyglądają w 100% profesjonalnie. Nasz inteligentny kreator online samodzielnie wygeneruje ścieżkę cięcia, pozwalając na zamówienie <Link href="/naklejki-die-cut" className={inlineLink}>naklejek o dowolnym kształcie</Link> bez znajomości programów graficznych.
              </p>
            </section>

            <section className="space-y-3">
              <h3 className={`text-xl font-extrabold text-foreground ${displayFont}`}>Najwyższa jakość druku i trwała folia</h3>
              <p>
                Dlaczego nasze <Link href="/naklejki-dla-firm" className={inlineLink}>naklejki dla firm</Link> i osób prywatnych tak dobrze się sprawdzają? Używamy wyłącznie grubej, <Link href="/naklejki-foliowe" className={inlineLink}>wodoodpornej folii winylowej</Link> oraz sprawdzonych technologii druku (rozdzielczość 300 DPI). To gwarantuje nie tylko soczyste kolory i idealne odwzorowanie detali, ale również odporność na wodę i promieniowanie UV. <Link href="/blog/naklejki-z-wlasnym-napisem-jak-przygotowac-plik-i-zamowic-online" className={inlineLink}>Naklejki z własnym napisem</Link> czy logo bez problemu przetrwają na laptopie, bidonie czy aucie.
              </p>
            </section>

            <section className="space-y-3">
              <h3 className={`text-xl font-extrabold text-foreground ${displayFont}`}>Automatyczne usuwanie tła i linia cięcia bez grafika</h3>
              <p>
                Wgrywasz gotowy obraz (PNG, JPG lub PDF), a narzędzie samo odcina tło i wyznacza <Link href="/naklejki-die-cut" className={inlineLink}>linię cięcia po obrysie</Link> - bez Photoshopa i bez znajomości programów graficznych. Potem układasz dowolną liczbę wlepek na arkuszu A4 w podglądzie 3D i zamawiasz. Druk na trwałej folii, cięcie i pakowanie bierzemy na siebie, a Ty widzisz efekt jeszcze przed płatnością.
              </p>
            </section>
          </div>
        </Reveal>

        <Reveal delay={0.2}>
          <div className="space-y-6">
            <section className="space-y-3">
              <h3 className={`text-xl font-extrabold text-foreground ${displayFont}`}>Zrób naklejki z telefonu bez użycia Photoshopa</h3>
              <p>
                Zastanawiasz się, <strong>gdzie w Polsce najprościej wydrukować własne naklejki wycinane po obrysie w małym nakładzie?</strong> U nas! Nie musisz być grafikiem. Z naszą pomocą <strong>najszybciej i najprościej zamówisz naklejki ze zdjęć z telefonu w Polsce</strong>. Wystarczy, że wgrasz <Link href="/blog/naklejka-ze-zdjecia-jak-przeniesc-wspomnienia-na-naklejke" className={inlineLink}>zdjęcie psa z telefonu</Link>, by zrobić z niego wyjątkową <Link href="/fotonaklejki" className={inlineLink}>fotonaklejkę</Link> na auto - nasz inteligentny system sam odetnie główny motyw od reszty zdjęcia w kilka sekund, dając efekt profesjonalnego usunięcia tła.
              </p>
              <ol className="list-decimal pl-5 space-y-2 font-medium text-foreground/80">
                <li>Wgraj grafikę w formacie PNG, JPG lub zrób zdjęcie telefonem.</li>
                <li>System samodzielnie usunie tło i wygeneruje precyzyjne <Link href="/slownik-naklejek" className={inlineLink}>linie cięcia (kontur)</Link>.</li>
                <li>Ustal wymiary i rozmieść dowolną liczbę wlepek na arkuszu w trybie 3D.</li>
                <li>Sfinalizuj zamówienie (BLIK, przelew), a my wyprodukujemy naklejki w 2-3 dni robocze!</li>
              </ol>
            </section>

            <section className="space-y-3">
              <h3 className={`text-xl font-extrabold text-foreground ${displayFont}`}>Idealne do biznesu i zabawy</h3>
              <p>
                Nasze rozwiązanie idealnie sprawdza się w biznesie jako <Link href="/blog/naklejka-z-logo-firmy-jak-skutecznie-brandowac-swoje-produkty" className={inlineLink}>personalizowane naklejki firmowe z logo</Link> do oznaczania paczek (tzw. plomby lub podziękowania za zamówienie), jak i w życiu prywatnym: do ozdabiania zeszytów, <Link href="/blog/personalizowane-naklejki-na-zeszyty-i-do-przedszkola" className={inlineLink}>oznaczania ubrań do przedszkola</Link> czy jako <Link href="/blog/personalizowane-naklejki-na-alkohol-wyjatkowy-dodatek-na-wesela-i-imprezy" className={inlineLink}>pamiątkowe naklejki ślubne</Link>. Domowa spiżarnia też na tym zyskuje - wodoodporne <Link href="/etykiety-na-sloiki" className={inlineLink}>etykiety na słoiki</Link> opiszą przetwory, świece czy kosmetyki małej manufaktury. Nie wymagamy minimalnego nakładu - drukujemy już od 1 arkusza A4. Z nami zrealizujesz <strong>małe naklejki na zamówienie</strong> w niskim nakładzie i profesjonalnej jakości.
              </p>
            </section>

            <section className="space-y-3">
              <h3 className={`text-xl font-extrabold text-foreground ${displayFont}`}>Czy naklejki łatwo się odklejają i nie zostawiają śladów?</h3>
              <p>
                Tak - drukujemy na folii z mocnym klejem, która trzyma się pewnie, a mimo to schodzi czysto: po odklejeniu nie zostaje ani klej, ani ślad. To nie są jednak naklejki wielokrotnego użytku - klej jest mocny i trwały, ale naklejasz raz, bez możliwości przełożenia w inne miejsce. Dzięki temu Twoje <strong>własne naklejki</strong> bez obaw umieścisz na laptopie, bidonie czy słoiku, a gdy zechcesz je zdjąć, powierzchnia zostaje czysta.
              </p>
            </section>
          </div>
        </Reveal>
      </div>

      {/* Klaster kreatorowy (keywords.md §9a) - strona główna JEST tym narzędziem,
          więc frazy narzędziowe (kreator naklejek, program do robienia naklejek,
          tworzenie naklejek, naklejki online kreator) pozycjonujemy tutaj, zamiast
          budować osobny landing /kreator-naklejek (kanibalizacja "/").
          Granice brandowe (rules.md §3): kreator układa arkusz, nie tworzy grafiki,
          więc w copy nie pada czasownik z rodziny "projekt-", a wbudowanej funkcji AI
          nie eksponujemy - wymieniamy wyłącznie zewnętrzne narzędzia. */}
      <Reveal delay={0.25}>
        <div className="max-w-5xl mx-auto px-4 space-y-8">
          <SectionHeading
            eyebrow="Narzędzie online"
            title={
              <>
                Kreator naklejek online - <HighlightWord>tworzenie naklejek</HighlightWord> w przeglądarce
              </>
            }
            sub="Wgraj gotowy obraz, a kreator usunie tło, wyznaczy linię cięcia i ułoży arkusz A4. Bez instalacji, bez grafika, już od 1 arkusza za 49,00 zł brutto."
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-muted-foreground leading-relaxed text-[15px] sm:text-base">
            <section className="space-y-3">
              <h3 className={`text-lg font-extrabold text-foreground ${displayFont}`}>Program do robienia naklejek, którego nie musisz instalować</h3>
              <p>
                Nasz <strong>kreator naklejek</strong> to program do robienia naklejek działający wprost w przeglądarce telefonu i komputera - niczego nie pobierasz i nie potrzebujesz konta w edytorze graficznym. Wgrywasz plik PNG, JPG lub PDF (choćby eksport z Canvy albo Worda), a resztą zajmuje się narzędzie. Podgląd jest bezpłatny, płacisz dopiero przy zamówieniu, więc całe robienie naklejek zamyka się w kilku minutach.
              </p>
            </section>

            <section className="space-y-3">
              <h3 className={`text-lg font-extrabold text-foreground ${displayFont}`}>Naklejki online - kreator układa arkusz A4 za Ciebie</h3>
              <p>
                Tworzenie naklejek zaczynasz od jednego obrazu, ale na arkuszu zmieścisz ich tyle, ile chcesz - i mogą być zupełnie różne. Każdy kolejny wgrany plik trafia na ten sam arkusz i dostaje własną linię cięcia, a rozmiary i rozmieszczenie ustawiasz w podglądzie 3D. Stała cena 49,00 zł brutto dotyczy arkusza, nie liczby wzorów -{" "}
                <Link href="/blog/ile-kosztuja-naklejki-na-zamowienie-cena-za-arkusz-a4" className={inlineLink}>
                  zobacz, jak liczy się cena za arkusz A4
                </Link>.
              </p>
            </section>

            <section className="space-y-3">
              <h3 className={`text-lg font-extrabold text-foreground ${displayFont}`}>Skąd wziąć grafikę do kreatora naklejek?</h3>
              <p>
                Kreator układa arkusz, a gotowy obraz przygotowujesz poza nim - i jest to prostsze, niż brzmi. Najszybciej opisać pomysł słowami w zewnętrznym generatorze obrazów (ChatGPT, Gemini, Midjourney) i pobrać gotową grafikę. Druga droga to darmowa Canva, Word czy PowerPoint z eksportem do PNG lub PDF. Trzecia to zwykłe zdjęcie -{" "}
                <Link href="/blog/jak-zrobic-wlasne-naklejki-w-telefonie-proste-aplikacje-i-triki" className={inlineLink}>
                  zrób naklejki ze zdjęcia z telefonu
                </Link>{" "}
                albo porównaj wszystkie metody w poradniku{" "}
                <Link href="/blog/jak-zrobic-wlasne-naklejki-program-do-robienia-naklejek-online" className={inlineLink}>
                  jak zrobić własne naklejki
                </Link>.
              </p>
            </section>
          </div>
        </div>
      </Reveal>

      {/* Proof/Trust elements for GEO */}
      <Reveal delay={0.3}>
        <div className="mt-8 flex flex-wrap justify-center gap-6 sm:gap-10 border-y border-border py-8 px-4 bg-muted/20">
          <div className="flex flex-col items-center text-center gap-1">
            <span className="text-3xl font-black text-primary">300 DPI</span>
            <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Rozdzielczość druku</span>
          </div>
          <div className="flex flex-col items-center text-center gap-1">
            <span className="text-3xl font-black text-primary">100%</span>
            <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Wodoodporna Folia</span>
          </div>
          <div className="flex flex-col items-center text-center gap-1">
            <span className="text-3xl font-black text-primary">0 śladów</span>
            <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Czyste odklejanie</span>
          </div>
          <div className="flex flex-col items-center text-center gap-1">
            <span className="text-3xl font-black text-primary">2-3 dni</span>
            <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Czas produkcji</span>
          </div>
        </div>
      </Reveal>

      {/* Blok zamykający z frazą akcyjną (Action-Intent) — exact match w H2 kieruje ruch intencyjny do kreatora na górze strony */}
      <Reveal delay={0.4}>
        <div className="max-w-3xl mx-auto px-4 text-center space-y-4">
          <h2 className={`text-2xl sm:text-3xl font-extrabold text-foreground ${displayFont}`}>
            Stwórz własne naklejki online - bez grafika i bez minimalnego nakładu
          </h2>
          <p className="text-muted-foreground leading-relaxed text-[15px] sm:text-base">
            Chcesz spersonalizować naklejkę na prezent, merch albo produkty swojej marki? Wgraj zdjęcie lub gotową grafikę do kreatora na górze strony, a my wytniemy ją po obrysie i wydrukujemy na trwałym winylu. Możesz stworzyć własną naklejkę już od 1 arkusza A4 za 49,00 zł, a produkcja zajmuje 2-3 dni robocze - bez Photoshopa i bez ukrytych kosztów przygotowalni. Brakuje Ci pomysłu na motyw? Zobacz{" "}
            <Link href="/blog/fajne-wzory-i-pomysly-na-naklejki-inspiracje-wg-zastosowania" className={inlineLink}>
              fajne wzory na naklejki wg zastosowania
            </Link>.
          </p>
        </div>
      </Reveal>
    </div>
  );
}
