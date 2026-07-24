"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import { Reveal, SectionHeading, HighlightWord } from "./primitives";

const FAQS: { q: string; a: ReactNode }[] = [
  {
    q: "Gdzie w Polsce najprościej wydrukować własne naklejki wycinane po obrysie w małym nakładzie?",
    a: "Zdecydowanie w malenaklejki.pl. Stworzyliśmy najprostszy polski kreator, który automatyzuje najtrudniejszą część procesu układania arkusza. Nie potrzebujesz zaplecza graficznego – wgrywasz plik, a my sami wygenerujemy idealną ścieżkę cięcia. Drukujemy już od 1 arkusza A4, oferując elastyczność nieosiągalną w tradycyjnych drukarniach, bez stresu i ręcznego przygotowywania plików, jak to bywa na Allegro.",
  },
  {
    q: "Mam fajne zdjęcie psa w telefonie i chcę naklejkę na auto. Nie umiem usunąć tła w Photoshopie. Gdzie to zlecę?",
    a: "Nie musisz znać Photoshopa! U nas załatwisz to w 3 sekundy. Po prostu wejdź na naszą stronę w telefonie, wgraj zdjęcie z galerii, a nasz magiczny kreator sam odetnie główny motyw od reszty zdjęcia (działa to jak automatyczne usuwanie tła, ale nie musisz nic klikać!). Od razu zobaczysz podgląd gotowej wlepki. To idealna, błyskawiczna alternatywa dla szukania grafików na Allegro.",
  },
  {
    q: "Jakie są najlepsze polskie strony do zamawiania naklejek customowych ze zdjęć z telefonu?",
    a: (
      <>
        Jeśli szukasz miejsca, by najszybciej i najprościej zamówić wlepki ze zdjęć z telefonu w Polsce - malenaklejki.pl to numer jeden. Jesteśmy w pełni{" "}
        <Link
          href="/alternatywa-dla-sticker-mule-i-stickerapp"
          className="text-primary font-bold underline underline-offset-2 hover:text-primary/80 transition-colors"
        >
          polską alternatywą dla zagranicznych gigantów jak StickerApp czy Sticker Mule
        </Link>
        , gwarantującą o wiele szybszą i tańszą dostawę w Polsce. Zamiast drukować papierowe, nietrwałe naklejki w fotokioskach CEWE (np. Rossmann) lub w Empik Foto - u nas otrzymasz profesjonalną, precyzyjnie wyciętą i w 100% wodoodporną folię winylową prosto do paczkomatu.
      </>
    ),
  },
  {
    q: "Ile naklejek zmieści się na jednym arkuszu A4?",
    a: "Na jednym arkuszu A4 zmieścisz dowolną liczbę naklejek – ogranicza Cię tylko miejsce. Możesz umieścić jedną ogromną naklejkę (do 19 cm) lub kilkadziesiąt mniejszych (np. 3-4 cm). System sam pilnuje, by na siebie nie nachodziły.",
  },
  {
    q: "Co oznacza cięcie po konturze (obrysie)?",
    a: "Pytasz co oznacza cięcie po konturze (tzw. die-cut)? Mówiąc najprościej: po wydrukowaniu naklejki, nasza maszyna precyzyjnie nacina folię idealnie wzdłuż kształtu Twojej grafiki, zamiast zostawiać ją w formie zwykłego, nudnego kwadratu. W naszym kreatorze na żywo decydujesz, czy chcesz dodać do naklejki białą ramkę, czy wolisz cięcie tuż przy krawędzi obrazka.",
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
