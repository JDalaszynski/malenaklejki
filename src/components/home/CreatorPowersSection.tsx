"use client";

import Link from "next/link";
import { Wand2, ImageUp, Crop, ArrowUp, Palette } from "lucide-react";
import {
  Reveal,
  SectionHeading,
  HighlightWord,
  scrollToCreator,
  displayFont,
} from "./primitives";

const POWERS = [
  {
    icon: Wand2,
    label: "Sztuczna Inteligencja (AI)",
    text: "Opisz swój pomysł zwykłym tekstem, a wbudowany generator stworzy dla Ciebie unikalne wzory na naklejki do druku. W ten sposób łatwo stworzysz imponujące własne wlepki nawet bez umiejętności rysowania.",
  },
  {
    icon: ImageUp,
    label: "Szybkie naklejki ze zdjęciem",
    text: "Wgraj dowolną fotografię z dysku lub telefonu. System natychmiast usunie tło, dzięki czemu powstaną precyzyjnie wycięte po obrysie kształty (tzw. naklejki die cut). Możesz ułożyć całe grupowe naklejki ze zdjęć na jednym panelu.",
  },
  {
    icon: Crop,
    label: "Szybkie kadrowanie",
    text: "Wrzucasz przygotowane wcześniej małe obrazki do druku na naklejki, a system sam dostosowuje ścieżki cięcia (koła, zaokrąglone prostokąty lub nieregularne obrysy). To najkrótsza droga, by wyprodukować własne, domowe naklejki diy i wytrzymałe własne wlepy na laptopa czy motocykl.",
  },
] as const;

export function CreatorPowersSection() {
  return (
    <div className="space-y-10 sm:space-y-12">
      <Reveal>
        <SectionHeading
          eyebrow="Możliwości kreatora"
          title={
            <>
              Jak zrobić własne wlepki i etykiety w{" "}
              <HighlightWord>kilku prostych krokach</HighlightWord>?
            </>
          }
          sub="Jeśli zastanawiasz się jak zrobić własne wlepki bez profesjonalnego oprogramowania graficznego, nasz interaktywny naklejki kreator to odpowiedź na Twoje potrzeby. Cały proces odbywa się bezpośrednio w przeglądarce:"
        />
      </Reveal>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 lg:gap-6">
        {POWERS.map(({ icon: Icon, label, text }, i) => (
          <Reveal key={label} delay={i * 0.08}>
            <article className="h-full flex flex-col gap-3.5 rounded-3xl border border-border/70 dark:border-white/10 bg-card p-6 shadow-sm hover:shadow-lg hover:border-primary/30 transition-[box-shadow,border-color] duration-300">
              <span className="w-11 h-11 rounded-2xl bg-primary/10 dark:bg-primary/20 text-primary flex items-center justify-center">
                <Icon aria-hidden className="w-5 h-5" />
              </span>
              <h3 className="text-[11px] font-black uppercase text-primary tracking-[0.18em]">
                {label}
              </h3>
              <p className="text-muted-foreground text-xs sm:text-sm font-semibold leading-relaxed">
                {text}
              </p>
            </article>
          </Reveal>
        ))}
      </div>

      {/* Dwie drogi: samodzielnie w kreatorze albo projekt od nas */}
      <Reveal>
        <div className="liquid-glass rounded-[28px] border p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center gap-6 md:gap-8">
          <div className="flex items-start gap-4 flex-1">
            <span className="shrink-0 w-12 h-12 rounded-2xl bg-primary/10 dark:bg-primary/20 text-primary flex items-center justify-center">
              <Palette aria-hidden className="w-6 h-6" />
            </span>
            <div className="space-y-1">
              <h3 className={`text-lg sm:text-xl font-extrabold text-foreground ${displayFont}`}>
                Nie masz gotowej grafiki? Żaden problem.
              </h3>
              <p className="text-muted-foreground text-xs sm:text-sm font-semibold leading-relaxed max-w-xl">
                Wygeneruj wzory AI bezpośrednio w kreatorze albo zamów indywidualny projekt —
                przygotujemy grafiki za Ciebie i wgramy je na Twój arkusz.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-3 shrink-0">
            <button
              type="button"
              onClick={scrollToCreator}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-primary text-primary-foreground text-[13px] font-extrabold shadow-md shadow-primary/20 hover:bg-primary/90 active:scale-[0.98] transition-all cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            >
              <ArrowUp aria-hidden className="w-4 h-4" />
              Otwórz kreator
            </button>
            <Link
              href="/zamow-projekt"
              className="inline-flex items-center px-5 py-3 rounded-2xl border border-primary/40 text-primary bg-primary/5 hover:bg-primary hover:text-primary-foreground text-[13px] font-extrabold active:scale-[0.98] transition-all cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            >
              Zamów projekt u nas
            </Link>
          </div>
        </div>
      </Reveal>
    </div>
  );
}
