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
                Cięcie po obrysie (tzw. die-cut) to zaawansowana technika produkcji, w której ploter precyzyjnie wycina naklejkę wzdłuż kształtu Twojej grafiki, całkowicie ignorując przezroczyste tło. Dzięki temu Twoje <strong>wlepki z logo</strong>, grafiki czy zdjęcia przybierają unikalny kształt, a nie standardowego kwadratu. Nasz inteligentny kreator online samodzielnie wygeneruje ścieżkę cięcia, pozwalając na zamówienie <strong>naklejek o dowolnym kształcie</strong> bez znajomości programów graficznych.
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
              <h3 className={`text-xl font-extrabold text-foreground ${displayFont}`}>Jak zamówić naklejki ze zdjęcia online?</h3>
              <p>
                W MałeNaklejki proces zamawiania <strong>naklejek na arkuszach A4</strong> został maksymalnie uproszczony. Nie musisz wymieniać dziesiątek maili z drukarnią.
              </p>
              <ol className="list-decimal pl-5 space-y-2 font-medium text-foreground/80">
                <li>Wgraj grafikę w formacie PNG lub JPG bezpośrednio do naszego kreatora.</li>
                <li>Ustal rozmiar i wybierz rodzaj cięcia (kontur, koło, prostokąt).</li>
                <li>Rozmieść dowolną liczbę naklejek na arkuszu A4 i sprawdź projekt w podglądzie 3D.</li>
                <li>Opłać zamówienie (BLIK, karta, przelew), a my wyślemy je do Ciebie w 72 godziny!</li>
              </ol>
            </section>

            <section className="space-y-3">
              <h3 className={`text-xl font-extrabold text-foreground ${displayFont}`}>Idealne do biznesu i zabawy</h3>
              <p>
                Nasze rozwiązanie idealnie sprawdza się w biznesie jako <strong>personalizowane naklejki firmowe z logo</strong> do oznaczania paczek (tzw. plomby lub podziękowania za zamówienie), jak i w życiu prywatnym: do ozdabiania zeszytów, oznaczania ubrań do przedszkola czy jako pamiątkowe naklejki ślubne. Nie wymagamy minimalnego nakładu – drukujemy już od 1 arkusza A4. Z nami zrealizujesz naklejki w niskim nakładzie w profesjonalnej jakości.
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
