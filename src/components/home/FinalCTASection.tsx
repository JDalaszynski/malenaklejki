"use client";

import Link from "next/link";
import { ArrowUp } from "lucide-react";
import { Reveal, scrollToCreator, displayFont } from "./primitives";

export function FinalCTASection() {
  return (
    <Reveal>
      <section className="relative overflow-hidden rounded-[32px] bg-[#004749] dark:bg-[#003a3b] border border-transparent dark:border-white/10 px-6 sm:px-12 py-12 sm:py-16 text-center shadow-[0_30px_60px_-25px_rgba(0,71,73,0.5)]">
        <div className="relative flex flex-col items-center gap-5 max-w-2xl mx-auto">
          <h2 className={`text-3xl sm:text-4xl lg:text-[42px] font-extrabold tracking-tight text-white text-balance leading-[1.15] ${displayFont}`}>
            Twój arkusz już czeka
          </h2>
          <p className="text-white/75 text-sm sm:text-base font-semibold leading-relaxed">
            Ułóż naklejki w kreatorze na górze strony — wydrukujemy je na trwałym winylu i
            wyślemy w 3 dni robocze.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-4 mt-2">
            <button
              type="button"
              onClick={scrollToCreator}
              className="inline-flex items-center gap-2.5 px-8 py-4 rounded-2xl bg-primary text-primary-foreground text-sm sm:text-base font-extrabold shadow-xl shadow-black/20 hover:bg-secondary hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
            >
              <ArrowUp aria-hidden className="w-5 h-5" />
              Stwórz naklejki teraz
            </button>
            <Link
              href="/zamow-projekt"
              className="text-white/80 hover:text-white text-xs sm:text-sm font-extrabold underline underline-offset-4 decoration-white/30 hover:decoration-white transition-colors"
            >
              lub zamów gotowy projekt
            </Link>
          </div>
        </div>
      </section>
    </Reveal>
  );
}
