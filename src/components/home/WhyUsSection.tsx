"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Sparkles, Scissors, Layers } from "lucide-react";
import { Reveal, SectionHeading, HighlightWord } from "./primitives";

/* Istniejące, realne zdjęcia produktowe projektu. */
const USPS = [
  {
    icon: Sparkles,
    title: "Naklejki po Twojemu w 100%",
    image: "/images/naklejki-z-wlasnym-nadrukiem-na-arkuszu.png",
    imageScale: "scale-[1.02] group-hover:scale-[1.05]",
    aspect: "aspect-[4/5]",
    objectFit: "object-cover",
    rotate: -2.5,
  },
  {
    icon: Scissors,
    title: "Wycinane po dowolnym kształcie",
    image: "/images/ksztalt-dowolny-naklejki-z-wlasnym-ksztaltem.jpg",
    imageScale: "group-hover:scale-105",
    aspect: "aspect-[4/3]",
    objectFit: "object-contain",
    rotate: 1.5,
  },
  {
    icon: Layers,
    title: "Naklejki w małych ilościach",
    image: "/images/naklejki-od-1-szt-niski-naklad-male-ilosci-malenaklejkii.jpg",
    imageScale: "scale-100 group-hover:scale-105",
    aspect: "aspect-[1000/925]",
    objectFit: "object-cover",
    rotate: 3,
  },
] as const;

export function WhyUsSection() {
  const reduceMotion = useReducedMotion();

  return (
    <div className="space-y-10 sm:space-y-12">
      <Reveal>
        <SectionHeading
          eyebrow="Co nas wyróżnia"
          title={
            <>
              Dlaczego naklejki w <HighlightWord>MałeNaklejki</HighlightWord>?
            </>
          }
        />
      </Reveal>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-7 lg:gap-9 pb-2 items-start">
        {USPS.map(({ icon: Icon, title, image, imageScale, aspect, objectFit, rotate }, i) => (
          <Reveal key={title} delay={i * 0.08}>
            <motion.article
              initial={false}
              whileHover={
                reduceMotion ? undefined : { y: -8, rotate: 0, scale: 1.015 }
              }
              transition={{ type: "spring", stiffness: 260, damping: 20 }}
              style={{ rotate: reduceMotion ? 0 : rotate }}
              className="group h-full flex flex-col rounded-[28px] bg-white dark:bg-white p-3 pb-5 border-[3px] border-white shadow-[0_18px_40px_-16px_rgba(0,71,73,0.28)] dark:shadow-[0_18px_40px_-14px_rgba(0,0,0,0.55)]"
            >
              {/* Zdjęcie produktowe (istniejący asset projektu) */}
              <div className={`relative w-full ${aspect} rounded-2xl bg-white overflow-hidden flex items-center justify-center`}>
                <img
                  src={image}
                  alt={title}
                  loading="lazy"
                  className={`w-full h-full ${objectFit} transform transition-transform duration-500 ${imageScale}`}
                />
              </div>

              <div className="flex items-center gap-3 px-2 mt-4">
                <span className="shrink-0 w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                  <Icon aria-hidden className="w-4.5 h-4.5" />
                </span>
                <h3 className="text-[15px] font-black tracking-tight leading-snug text-[#004749]">
                  {title}
                </h3>
              </div>
            </motion.article>
          </Reveal>
        ))}
      </div>
    </div>
  );
}
