"use client";

import { Plus } from "lucide-react";
import { Reveal, SectionHeading, HighlightWord } from "./primitives";
import { HOME_FAQS } from "./homeFaqData";

export function FAQSection() {
  return (
    <div className="space-y-10 sm:space-y-12">
      <Reveal>
        <SectionHeading
          eyebrow="Masz pytania?"
          id="seo-faq-title"
          title={
            <>
              Często zadawane <HighlightWord>pytania</HighlightWord> (FAQ)
            </>
          }
          sub="Wszystko, co musisz wiedzieć o tworzeniu, drukowaniu i dostawie naklejek na arkuszach."
        />
      </Reveal>

      <div className="max-w-3xl mx-auto flex flex-col gap-3.5">
        {HOME_FAQS.map((faq, i) => (
          <Reveal key={faq.q} delay={Math.min(i * 0.05, 0.2)}>
            <details className="group rounded-2xl border border-border/70 dark:border-white/10 bg-card open:bg-muted/40 dark:open:bg-white/[0.04] shadow-sm open:shadow-md transition-all duration-300">
              <summary className="flex items-center justify-between gap-4 px-5 sm:px-6 py-4.5 cursor-pointer select-none list-none [&::-webkit-details-marker]:hidden rounded-2xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring">
                <h3 className="text-sm sm:text-[15px] font-black text-foreground leading-snug">
                  {faq.q}
                </h3>
                <span
                  aria-hidden
                  className="shrink-0 w-8 h-8 rounded-full bg-primary/10 dark:bg-primary/20 text-primary flex items-center justify-center transition-transform duration-300 group-open:rotate-45"
                >
                  <Plus className="w-4 h-4" strokeWidth={3} />
                </span>
              </summary>
              <p className="px-5 sm:px-6 pb-5 -mt-1 text-xs sm:text-sm text-muted-foreground font-semibold leading-relaxed max-w-[62ch]">
                {faq.aNode ?? faq.a}
              </p>
            </details>
          </Reveal>
        ))}
      </div>
    </div>
  );
}
