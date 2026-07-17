"use client";

import { Reveal, SectionHeading, HighlightWord, displayFont } from "./primitives";

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
                Cięcie po obrysie (tzw. die-cut) to zaawansowana technika produkcji, w której ploter precyzyjnie wycina naklejkę wzdłuż kształtu Twojej grafiki, całkowicie ignorując przezroczyste tło. Dzięki temu Twoje <strong>wlepki z logo</strong>, grafiki czy zdjęcia przybierają unikalny kształt, a nie standardowego kwadratu. Otrzymujesz <strong>własne naklejki</strong>, które wyglądają w 100% profesjonalnie. Nasz inteligentny kreator online samodzielnie wygeneruje ścieżkę cięcia, pozwalając na zamówienie <strong>naklejek o dowolnym kształcie</strong> bez znajomości programów graficznych.
              </p>
            </section>

            <section className="space-y-3">
              <h3 className={`text-xl font-extrabold text-foreground ${displayFont}`}>Najwyższa jakość druku i trwała folia</h3>
              <p>
                Dlaczego nasze <strong>naklejki dla firm</strong> i osób prywatnych zbierają tak dobre opinie? Używamy wyłącznie grubego, wodoodpornego winylu oraz sprawdzonych technologii druku (rozdzielczość 300 DPI). To gwarantuje nie tylko soczyste kolory i idealne odwzorowanie detali, ale również całkowitą odporność na wodę, promieniowanie UV oraz zadrapania. Naklejki z własnym napisem czy logo przetrwają na laptopie, bidonie, aucie, a nawet w zmywarce.
              </p>
            </section>
          </div>
        </Reveal>

        <Reveal delay={0.2}>
          <div className="space-y-6">
            <section className="space-y-3">
              <h3 className={`text-xl font-extrabold text-foreground ${displayFont}`}>Stwórz własne naklejki w 4 prostych krokach</h3>
              <p>
                Zastanawiasz się, jak zamówić <strong>małe naklejki na zamówienie</strong> bez zatrudniania grafika? <strong>Spersonalizuj naklejkę</strong> samodzielnie – wystarczy jakikolwiek plik, a nawet zwykła <strong>naklejka ze zdjęcia</strong> z telefonu. Nasz darmowy kreator krok po kroku poprowadzi Cię przez proces, dzięki czemu otrzymasz <strong>własne naklejki</strong> o idealnym kształcie i bez przezroczystego tła.
              </p>
              <ol className="list-decimal pl-5 space-y-2 font-medium text-foreground/80">
                <li>Wgraj grafikę w formacie PNG, JPG lub zrób zdjęcie telefonem.</li>
                <li>System samodzielnie usunie tło i wygeneruje precyzyjne linie cięcia (kontur).</li>
                <li>Ustal wymiary i rozmieść dowolną liczbę wlepek na arkuszu w trybie 3D.</li>
                <li>Sfinalizuj zamówienie (BLIK, przelew), a my zajmiemy się ekspresowym drukiem w 72h!</li>
              </ol>
            </section>

            <section className="space-y-3">
              <h3 className={`text-xl font-extrabold text-foreground ${displayFont}`}>Idealne do biznesu i zabawy</h3>
              <p>
                Nasze rozwiązanie idealnie sprawdza się w biznesie jako <strong>personalizowane naklejki firmowe z logo</strong> do oznaczania paczek (tzw. plomby lub podziękowania za zamówienie), jak i w życiu prywatnym: do ozdabiania zeszytów, oznaczania ubrań do przedszkola czy jako pamiątkowe naklejki ślubne. Nie wymagamy minimalnego nakładu – drukujemy już od 1 arkusza A4. Z nami zrealizujesz <strong>małe naklejki na zamówienie</strong> w niskim nakładzie i profesjonalnej jakości.
              </p>
            </section>
          </div>
        </Reveal>
      </div>

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
            <span className="text-3xl font-black text-primary">72h</span>
            <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Czas realizacji</span>
          </div>
          <div className="flex flex-col items-center text-center gap-1">
            <span className="text-3xl font-black text-primary">4.9/5</span>
            <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Zadowolenie klientów</span>
          </div>
        </div>
      </Reveal>
    </div>
  );
}
