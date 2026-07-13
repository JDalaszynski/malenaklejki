"use client";

import Image from "next/image";
import { Reveal, SectionHeading, HighlightWord, displayFont } from "./primitives";

const STEPS = [
  {
    title: "Dodaj i dostosuj grafiki",
    desc: "Wgraj zdjęcia/grafiki z telefonu lub komputera albo stwórz je za pomocą AI. Wybierz rozmiar każdej naklejki oraz jej linię cięcia (kontur, koło lub prostokąt).",
    image: "/images/kroki/krok-1-dodaj-dostosuj-naklejki.png",
  },
  {
    title: "Rozmieść na arkuszu A4",
    desc: "Układaj i przeciągaj naklejki na podglądzie arkusza. Inteligentny kreator dopilnuje, aby naklejki na siebie nie nachodziły i optymalnie wykorzystały miejsce.",
    image: "/images/kroki/krok-2-rozmiesc-na-arkuszu-a4-naklejki.png",
  },
  {
    title: "Sprawdź w 3D i zamów",
    desc: "Obejrzyj realistyczną wizualizację 3D gotowego arkusza, dodaj go do koszyka i sfinalizuj bezpieczne zamówienie za pomocą BLIK/Przelewy24.",
    image: "/images/kroki/krok-3-sprawdz-3d-i-zamow-naklejki.png",
  },
] as const;

export function HowItWorksSection() {
  return (
    <div className="space-y-10 sm:space-y-12">
      <Reveal>
        <SectionHeading
          eyebrow="Od pomysłu do skrzynki"
          id="seo-how-it-works-title"
          title={
            <>
              Twoje naklejki w <HighlightWord>3 prostych krokach</HighlightWord>
            </>
          }
          sub="Zajmie Ci zaledwie kilka minut!"
        />
      </Reveal>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
        {STEPS.map((step, idx) => (
          <Reveal key={step.title} delay={idx * 0.1}>
            <article className="group relative h-full flex flex-col rounded-3xl border border-border/70 dark:border-white/10 bg-card overflow-hidden shadow-sm hover:shadow-lg transition-shadow duration-300">
              {/* Obrazek kroku (istniejący asset projektu) */}
              <div className="relative w-full aspect-[4/3] bg-white dark:bg-white overflow-hidden flex items-center justify-center">
                <Image
                  src={step.image}
                  alt={step.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className={`w-full h-full object-contain ${idx === 2 ? "scale-125" : ""}`}
                />
                {/* Duży numer kroku */}
                <span
                  aria-hidden
                  className={`absolute top-3 left-4 text-5xl leading-none font-extrabold text-primary/15 select-none ${displayFont}`}
                >
                  {idx + 1}
                </span>
              </div>

              <div className="flex flex-col gap-2 p-5">
                <span className="text-[10px] font-black uppercase text-primary tracking-[0.18em]">
                  Krok 0{idx + 1}
                </span>
                <h3 className={`text-lg font-extrabold text-foreground leading-snug ${displayFont}`}>
                  {step.title}
                </h3>
                <p className="text-muted-foreground text-xs sm:text-[13px] font-semibold leading-relaxed">
                  {step.desc}
                </p>
              </div>
            </article>
          </Reveal>
        ))}
      </div>
    </div>
  );
}
