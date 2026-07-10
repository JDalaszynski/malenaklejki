"use client";

import { motion } from "framer-motion";
import {
  Reveal,
  SectionHeading,
  HighlightWord,
  PhotoPlaceholder,
  scrollToCreator,
  displayFont,
} from "./primitives";
import { Check } from "lucide-react";

/* Kafle inspiracji — PLACEHOLDER: podmień PhotoPlaceholder na finalne zdjęcia. */
type Tile = {
  label: string;
  title: string;
  desc: string;
  className: string;
  ratio: string;
  big?: boolean;
};

const TILES: readonly Tile[] = [
  {
    label: "Etykiety na słoiki, kosmetyki i opakowania małej firmy",
    title: "Małe firmy i rękodzieło",
    desc: "Logo na słoiczkach, butelkach i pudełkach wysyłkowych.",
    className: "sm:col-span-7 sm:row-span-2",
    ratio: "aspect-[4/3] sm:aspect-auto sm:h-full",
    big: true,
  },
  {
    label: "Naklejki-podziękowania na chrzest, komunię lub wesele",
    title: "Śluby, chrzciny, komunie",
    desc: "Pamiątkowe podziękowania dla gości.",
    className: "sm:col-span-5",
    ratio: "aspect-[16/9]",
  },
  {
    label: "Wlepki na laptopie, butelce i deskorolce",
    title: "Laptop, butelka, deska",
    desc: "Wytrzymałe wlepki z Twoich grafik.",
    className: "sm:col-span-5",
    ratio: "aspect-[16/9]",
  },
  {
    label: "Naklejki ze zdjęcia wycięte po konturze postaci",
    title: "Twoje zdjęcia jako naklejki",
    desc: "System sam usunie tło i wytnie po obrysie.",
    className: "sm:col-span-4",
    ratio: "aspect-[4/3]",
  },
  {
    label: "Podpisane zeszyty i ubrania dziecka w przedszkolu",
    title: "Szkoła i przedszkole",
    desc: "Naklejki na zeszyty, metki i przybory.",
    className: "sm:col-span-4",
    ratio: "aspect-[4/3]",
  },
  {
    label: "Planner ozdobiony naklejkami motywacyjnymi",
    title: "Plannery i prezenty",
    desc: "Motywacyjne napisy i dekoracje pakowania.",
    className: "sm:col-span-4",
    ratio: "aspect-[4/3]",
  },
];

const PRACTICAL_USES = [
  "Kolorowe naklejki z grafiką na prezenty urodzinowe i sprzęt elektroniczny.",
  "Dedykowane naklejki z własnym wzorem do oznaczania organizerów i pudełek w biurze.",
  "Wytrzymałe naklejki na zeszyty personalizowane z wizerunkami ulubionych bohaterów z gier lub bajek.",
  "Funkcjonalne naklejki na ubrania dla dzieci (idealne do naklejania na nylonowe metki z instrukcją prania), ułatwiające organizację rzeczy w przedszkolu i żłobku.",
  "Pamiątkowe dekoracje plannerów, gdzie główną rolę gra motywacyjna naklejka z własnym napisem.",
] as const;

export function UseCasesSection() {
  return (
    <div className="space-y-10 sm:space-y-14">
      <Reveal>
        <SectionHeading
          eyebrow="Inspiracje"
          title={
            <>
              Jedna kartka A4, <HighlightWord>tysiąc zastosowań</HighlightWord>
            </>
          }
          sub="Nasi klienci wykorzystują kreator do najbardziej nietypowych i codziennych zadań. Sprawdź, co możesz stworzyć:"
        />
      </Reveal>

      {/* Bento z placeholderami zdjęć — każdy kafel prowadzi do kreatora */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 sm:gap-5">
        {TILES.map((tile, i) => (
          <Reveal key={tile.title} delay={Math.min(i * 0.06, 0.24)} className={tile.className}>
            <motion.button
              type="button"
              onClick={scrollToCreator}
              whileHover={{ y: -4 }}
              whileTap={{ scale: 0.99 }}
              transition={{ type: "spring", stiffness: 320, damping: 22 }}
              className="group relative w-full h-full text-left rounded-3xl overflow-hidden border border-border/70 dark:border-white/10 bg-card shadow-sm hover:shadow-xl hover:shadow-primary/5 hover:border-primary/30 transition-[box-shadow,border-color] duration-300 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            >
              <PhotoPlaceholder
                label={tile.label}
                ratio={tile.ratio}
                className="!rounded-none"
                iconSize={tile.big ? "w-9 h-9" : "w-6 h-6"}
              />
              {/* Pasek tytułu na dole kafla */}
              <span className="absolute inset-x-0 bottom-0 flex flex-col gap-0.5 p-4 pt-8 bg-gradient-to-t from-[#004749]/95 via-[#004749]/35 to-transparent">
                <span className={`text-white text-base sm:text-lg font-extrabold leading-tight ${displayFont}`}>
                  {tile.title}
                </span>
                <span className="text-white/80 text-[11px] sm:text-xs font-semibold leading-snug">
                  {tile.desc}
                </span>
              </span>
              <span className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-white/90 dark:bg-white/90 text-[10px] font-black uppercase tracking-wide text-[#004749] opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                Stwórz w kreatorze
              </span>
            </motion.button>
          </Reveal>
        ))}
      </div>

      {/* Treść SEO: małe firmy + wyjątkowe okazje */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
        <Reveal className="space-y-4">
          <h3 className={`text-xl sm:text-2xl font-extrabold tracking-tight text-foreground ${displayFont}`}>
            Profesjonalny arkusz naklejek na zamówienie dla małych firm
          </h3>
          <p className="text-muted-foreground text-sm font-semibold leading-relaxed">
            Prowadzisz małą gastronomię, tworzysz rękodzieło albo produkujesz naturalne kosmetyki?
            Profesjonalny druk naklejek na zamówienie na arkuszach A4 to model stworzony dla Ciebie.
            Zamiast inwestować w tysiące sztuk etykiet, których jeszcze nie potrzebujesz, kupujesz
            jeden wielofunkcyjny arkusz z naklejkami.
          </p>
          <p className="text-muted-foreground text-sm font-semibold leading-relaxed">
            Wgrywasz własne logo i jednym kliknięciem tworzysz unikalne naklejki z własną grafiką
            oraz informacyjne naklejki z własnym napisem opisujące skład produktu. To idealne i
            ekonomiczne małe naklejki z własnym nadrukiem na słoiczki, butelki czy opakowania
            wysyłkowe. Każdy produkt prezentuje się u klienta o wiele lepiej, gdy zdobią go
            precyzyjnie docięte naklejki samoprzylepne na zamówienie. Jeśli w przyszłości rozwiniesz
            ofertę, bez problemu skonfigurujesz w koszyku również większe naklejki na zamówienie z
            własnym nadrukiem.
          </p>
        </Reveal>

        <Reveal delay={0.08} className="space-y-4">
          <h3 className={`text-xl sm:text-2xl font-extrabold tracking-tight text-foreground ${displayFont}`}>
            Wyjątkowe okazje i naklejki z własnym zdjęciem
          </h3>
          <p className="text-muted-foreground text-sm font-semibold leading-relaxed">
            Nasz pojedynczy arkusz naklejek do druku to absolutny hit podczas rodzinnych i
            religijnych uroczystości. W zaledwie kilka minut zaprojektujesz u nas pamiątkowe
            naklejki personalizowane na chrzest jako naklejki na podziękowania dla gości lub
            stworzysz eleganckie naklejki personalizowane komunia pasujące do zaproszeń.
          </p>
          <p className="text-muted-foreground text-sm font-semibold leading-relaxed">
            Nic nie stoi na przeszkodzie, aby wykorzystać wykadrowane naklejki ze zdjęcia jubilata
            do dekoracji prezentów. Niezależnie od tego, czy system ma przetworzyć klasyczne
            naklejki ze zdjeciem bez skomplikowanego tła, czy wyciąć portret całej rodziny, efekt
            zawsze jest perfekcyjny.
          </p>
        </Reveal>
      </div>

      {/* Praktyczne zastosowania — zachowana treść SEO w formie listy */}
      <Reveal className="space-y-6 rounded-3xl border border-border/60 dark:border-white/10 bg-muted/40 dark:bg-white/[0.03] p-6 sm:p-8">
        <h2 className={`text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground ${displayFont}`}>
          Praktyczne zastosowania — wybierz naklejki na zamówienie online
        </h2>
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3.5">
          {PRACTICAL_USES.map((text) => (
            <li key={text} className="flex items-start gap-3">
              <span className="shrink-0 mt-0.5 w-5 h-5 rounded-full bg-primary/15 text-primary flex items-center justify-center">
                <Check aria-hidden className="w-3 h-3" strokeWidth={3.5} />
              </span>
              <span className="text-muted-foreground text-[13px] sm:text-sm font-semibold leading-relaxed">
                {text}
              </span>
            </li>
          ))}
        </ul>
        <p className="text-muted-foreground text-sm sm:text-base font-semibold leading-relaxed border-t border-border/60 dark:border-white/10 pt-6">
          Wybierając elastyczny produkt, jakim jest naklejki arkusz, płacisz raz, a na kartce A4
          zyskujesz dziesiątki różnorodnych wlepek. Gwarantujemy, że nasze naklejki z własnym
          nadrukiem to najwyższa jakość winylu i mocny klej. Drukujemy Twoje gotowe naklejki arkusze
          błyskawicznie, a integracja z bezpieczną bramką płatniczą Przelewy24 oznacza natychmiastowe
          przekazanie pliku do produkcji. Przetestuj nasze naklejki na zamówienie już dziś i stwórz
          swój pierwszy projekt powyżej!
        </p>
      </Reveal>
    </div>
  );
}
