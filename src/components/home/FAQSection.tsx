"use client";

import { Plus } from "lucide-react";
import { Reveal, SectionHeading, HighlightWord } from "./primitives";

const FAQS = [
  {
    q: "Jakiej jakości pliki powinienem wgrać do kreatora?",
    a: "Najlepsze rezultaty uzyskasz wgrywając pliki w formacie PNG lub JPG o rozdzielczości 300 DPI. Kreator automatycznie ocenia jakość grafiki i ostrzeże Cię komunikatem, jeśli rozdzielczość będzie zbyt niska (poniżej 100 DPI).",
  },
  {
    q: "Co oznacza cięcie po konturze (obrysie)?",
    a: "Nasze maszyny plotujące wytną naklejkę dokładnie wzdłuż krawędzi Twojego obrazka (z pominięciem przezroczystego tła). W kreatorze możesz wybrać opcję „Kontur”, aby zobaczyć podgląd linii cięcia naniesiony na Twoją grafikę.",
  },
  {
    q: "Ile naklejek zmieści się na jednym arkuszu A4?",
    a: "To zależy od Ciebie! Możesz umieścić jedną ogromną naklejkę (do 19 cm szerokości) lub kilkadziesiąt mniejszych (np. o średnicy 3-4 cm). Nasz system automatycznie pilnuje, aby naklejki nie nakładały się na siebie.",
  },
  {
    q: "Czy mogę edytować arkusz po dodaniu do koszyka?",
    a: "Po dodaniu arkusza do koszyka kompozycja jest zapisywana i generowany jest plik produkcyjny. Wszelkie poprawki wymagają ponownego ułożenia arkusza, dlatego przed zatwierdzeniem upewnij się w podglądzie 2D/3D, że wszystko wygląda poprawnie.",
  },
  {
    q: "Jaki jest czas realizacji i koszt dostawy?",
    a: "Wszystkie zamówienia drukujemy i wysyłamy w ciągu 3 dni roboczych. Koszt dostawy wynosi 19,99 zł, a bezpieczną i szybką płatność realizujemy za pośrednictwem Przelewy24 (karta, BLIK, przelew).",
  },
] as const;

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
        {FAQS.map((faq, i) => (
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
                {faq.a}
              </p>
            </details>
          </Reveal>
        ))}
      </div>
    </div>
  );
}
