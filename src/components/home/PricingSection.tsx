"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { Check, ArrowUp } from "lucide-react";
import {
  Reveal,
  PhotoPlaceholder,
  scrollToCreator,
  displayFont,
  CUT_LINE_PINK,
} from "./primitives";

const INCLUDED = [
  "Dowolna liczba różnych grafik na jednym arkuszu",
  "Cięcie po konturze, kole lub prostokącie — w cenie",
  "Generator AI i automatyczne usuwanie tła",
  "Realistyczny podgląd 3D przed zakupem",
] as const;

/* Signature: miniatura arkusza A4 z naklejkami-placeholderami,
   z liniami cięcia jak na podglądzie w kreatorze.
   PLACEHOLDER: docelowo można podmienić na zdjęcie prawdziwego arkusza. */
function SheetPreview() {
  const reduceMotion = useReducedMotion();
  return (
    <motion.div
      initial={false}
      whileHover={reduceMotion ? undefined : { rotate: 0, y: -6 }}
      transition={{ type: "spring", stiffness: 200, damping: 18 }}
      style={{ rotate: reduceMotion ? 0 : 2.5 }}
      className="relative w-full max-w-[340px] mx-auto aspect-[210/297] bg-white dark:bg-white rounded-xl border border-border/60 shadow-[0_30px_60px_-20px_rgba(0,71,73,0.35)] p-4"
      aria-label="Poglądowy arkusz A4 z naklejkami"
      role="img"
    >
      {/* Naklejki na arkuszu — każda z różową linią cięcia z kreatora */}
      <div className="absolute top-[6%] left-[8%] w-[42%]">
        <div
          className="rounded-2xl border-2 border-dashed p-1"
          style={{ borderColor: CUT_LINE_PINK }}
        >
          <PhotoPlaceholder label="Logo firmy" ratio="aspect-square" showLabel={false} className="!rounded-xl" iconSize="w-6 h-6" />
        </div>
      </div>

      <div className="absolute top-[9%] right-[7%] w-[34%] rotate-6">
        <div
          className="rounded-full border-2 border-dashed p-1"
          style={{ borderColor: CUT_LINE_PINK }}
        >
          <PhotoPlaceholder label="Okrągła etykieta" ratio="aspect-square" showLabel={false} className="!rounded-full" iconSize="w-5 h-5" />
        </div>
      </div>

      <div className="absolute top-[40%] left-[12%] w-[52%] -rotate-3">
        <div
          className="rounded-3xl border-2 border-dashed p-1"
          style={{ borderColor: CUT_LINE_PINK }}
        >
          <PhotoPlaceholder label="Naklejka ze zdjęcia" ratio="aspect-[4/3]" showLabel={false} className="!rounded-2xl" iconSize="w-6 h-6" />
        </div>
      </div>

      <div className="absolute top-[44%] right-[6%] w-[26%] rotate-12">
        <div
          className="rounded-full border-2 border-dashed p-1"
          style={{ borderColor: CUT_LINE_PINK }}
        >
          <PhotoPlaceholder label="Mała naklejka" ratio="aspect-square" showLabel={false} className="!rounded-full" iconSize="w-4 h-4" />
        </div>
      </div>

      {/* „Odklejająca się” naklejka */}
      <motion.div
        initial={false}
        animate={reduceMotion ? undefined : { y: [0, -4, 0] }}
        transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-[7%] left-[18%] w-[58%] rotate-2"
      >
        <div className="rounded-2xl bg-white p-1 shadow-[0_14px_28px_-10px_rgba(0,71,73,0.4)]">
          <div
            className="rounded-xl border-2 border-dashed p-1"
            style={{ borderColor: CUT_LINE_PINK }}
          >
            <PhotoPlaceholder label="Twoja grafika" ratio="aspect-[16/7]" showLabel={false} className="!rounded-lg" iconSize="w-5 h-5" />
          </div>
        </div>
      </motion.div>

      {/* Etykieta arkusza */}
      <span className="absolute -bottom-3.5 left-1/2 -translate-x-1/2 whitespace-nowrap px-3 py-1.5 rounded-full bg-[#004749] text-white text-[10px] font-black uppercase tracking-wider shadow-lg">
        Arkusz A4 · 210 × 297 mm
      </span>
    </motion.div>
  );
}

export function PricingSection() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center rounded-[32px] border border-border/60 dark:border-white/10 bg-muted/40 dark:bg-white/[0.03] p-6 sm:p-10 lg:p-12">
      <Reveal className="lg:col-span-7 space-y-6">
        <div className="space-y-3">
          <span className="text-[11px] font-black uppercase tracking-[0.2em] text-primary">
            Prosta cena
          </span>
          <h2 className={`text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground text-balance leading-[1.15] ${displayFont}`}>
            Gdzie kupić pojedyncze naklejki personalizowane online?
          </h2>
          <p className="text-muted-foreground text-sm sm:text-base font-semibold leading-relaxed">
            Najlepszym rozwiązaniem dla zamówień niskonakładowych jest platforma{" "}
            <Link href="/" className="text-primary hover:underline font-bold">
              malenaklejki.pl
            </Link>
            . To tutaj szybko zaprojektujesz i kupisz naklejki personalizowane bez minimalnych
            limitów zamówienia. Za stałą kwotę 49,00 zł otrzymujesz w pełni zagospodarowany arkusz
            naklejek w formacie A4. Możesz umieścić na nim dowolną liczbę różnych grafik, a nasz
            zaawansowany system automatycznie zadba o to, aby elementy nie nachodziły na siebie. To
            Ty decydujesz, co drukujesz.
          </p>
        </div>

        <div className="flex items-end gap-3">
          <span className={`text-5xl sm:text-6xl font-extrabold text-primary leading-none ${displayFont}`}>
            49,00 zł
          </span>
          <span className="text-xs sm:text-sm font-extrabold text-muted-foreground pb-1.5 leading-tight">
            za cały arkusz A4
            <br />z Twoimi naklejkami
          </span>
        </div>

        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
          {INCLUDED.map((item) => (
            <li key={item} className="flex items-start gap-2.5">
              <span className="shrink-0 mt-0.5 w-5 h-5 rounded-full bg-primary text-white flex items-center justify-center">
                <Check aria-hidden className="w-3 h-3" strokeWidth={3.5} />
              </span>
              <span className="text-[13px] sm:text-sm font-bold text-foreground leading-snug">
                {item}
              </span>
            </li>
          ))}
        </ul>

        <div className="flex flex-wrap items-center gap-4 pt-1">
          <button
            type="button"
            onClick={scrollToCreator}
            className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-primary text-primary-foreground text-sm font-extrabold shadow-lg shadow-primary/25 hover:bg-primary/90 hover:shadow-xl hover:shadow-primary/30 active:scale-[0.98] transition-all cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          >
            <ArrowUp aria-hidden className="w-4 h-4" />
            Ułóż swój arkusz
          </button>
          <span className="text-xs font-semibold text-muted-foreground">
            Dostawa 19,99 zł · wysyłka w 3 dni robocze
          </span>
        </div>
      </Reveal>

      <Reveal delay={0.12} className="lg:col-span-5 py-4">
        <SheetPreview />
      </Reveal>
    </div>
  );
}
