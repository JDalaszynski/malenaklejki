"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowDown } from "lucide-react";
import React from "react";

/**
 * Client-only interactive scroll button for the MiniHero.
 * The H1 and subtitle are rendered server-side via MiniHeroContent.
 */
export const MiniHeroButton = () => {
  const scrollToCreator = () => {
    const el = document.getElementById("creator-section");
    if (el) {
      const headerOffset = 100;
      const elementPosition = el.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth"
      });
    }
  };

  return (
    <motion.button
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut", delay: 0.2 }}
      onClick={scrollToCreator}
      className="mt-4 sm:mt-5 group flex flex-col items-center gap-1.5 cursor-pointer transition-all hover:scale-105 active:scale-95"
    >
      <span className="text-xs font-extrabold text-foreground/80 group-hover:text-primary transition-colors">
        Zamów Zestaw Naklejek
      </span>
      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-primary-foreground shadow-sm transition-all duration-300">
        <ArrowDown className="w-4 h-4 mt-0.5 transition-transform group-hover:translate-y-0.5" />
      </div>
    </motion.button>
  );
};

/**
 * Server-rendered MiniHero content (H1 + subtitle).
 * Renders without JS for SEO crawlability — H1 is visible to Googlebot on first paint.
 */
export function MiniHeroContent() {
  const bgStickers = [
    {
      src: "/images/zastosowania/naklejki-z-wlasnym-napisem.jpg",
      className: "w-24 h-16 sm:w-72 sm:h-52 rounded-[1rem] sm:rounded-[2.5rem] z-[-9]",
      style: { top: "-5%", right: "-5%", rotate: "10deg" },
    },
    {
      src: "/images/zastosowania/naklejka-ze-zdjecia.jpg",
      className: "w-20 h-20 sm:w-64 sm:h-64 rounded-full z-[-7]",
      style: { top: "5%", right: "8%", rotate: "-12deg" },
    },
    {
      src: "/images/zastosowania/naklejki-firmowe-z-logo.jpg",
      className: "w-20 h-28 sm:w-60 sm:h-80 rounded-xl sm:rounded-[2rem] z-[-5]",
      style: { top: "25%", right: "-8%", rotate: "-15deg" },
    },
    {
      src: "/images/zastosowania/personalizowane-naklejki-do-przedszkola.jpg",
      className: "w-24 h-24 sm:w-76 sm:h-76 rounded-[30%_70%_70%_30%/30%_30%_70%_70%] z-[-8]",
      style: { top: "18%", right: "15%", rotate: "5deg" },
    },
    {
      src: "/images/zastosowania/personalizowane-naklejki-slubne.jpeg",
      className: "w-24 h-24 sm:w-80 sm:h-80 rounded-full z-[-6]",
      style: { top: "45%", right: "5%", rotate: "22deg" },
    },
    {
      src: "/images/zastosowania/wlepki-z-wlasnym-nadrukiem.png",
      className: "w-20 h-20 sm:w-68 sm:h-68 rounded-[40%_60%_60%_40%/40%_40%_60%_60%] z-[-4]",
      style: { top: "60%", right: "-5%", rotate: "8deg" },
    },
    {
      src: "/images/zastosowania/naklejki-z-wlasnym-napisem.jpg",
      className: "w-16 h-16 sm:w-56 sm:h-56 rounded-[30%] z-[-3]",
      style: { top: "70%", right: "18%", rotate: "-18deg" },
    },
    {
      src: "/images/zastosowania/naklejka-ze-zdjecia.jpg",
      className: "w-16 h-16 sm:w-52 sm:h-52 rounded-full z-[-10]",
      style: { top: "80%", right: "0%", rotate: "-5deg" },
    }
  ];

  return (
    <section className="w-full px-4 sm:px-6 lg:px-8 pt-4 pb-6 sm:pt-6 sm:pb-8 flex flex-col items-center justify-center text-center relative overflow-hidden">
      {/* Decorative background blur/glows */}
      <div className="absolute -top-12 -left-12 w-[250px] h-[250px] bg-primary/5 dark:bg-primary/15 blur-[80px] rounded-full pointer-events-none -z-20" />
      <div className="absolute -bottom-16 -right-16 w-[300px] h-[300px] bg-emerald-400/5 dark:bg-emerald-500/10 blur-[90px] rounded-full pointer-events-none -z-20" />

      {/* Central-left background image */}
      <div className="absolute bottom-0 left-0 h-[60%] aspect-square sm:left-0 sm:top-1/2 sm:bottom-auto sm:-translate-y-1/2 sm:w-[400px] sm:h-[400px] md:w-[600px] md:h-[600px] opacity-90 sm:opacity-50 dark:opacity-80 dark:sm:opacity-40 -rotate-6 pointer-events-none -z-10 sm:[mask-image:radial-gradient(circle_at_center,black_50%,transparent_75%)]">
        <img
          src="/images/hero-background-image-central.jpg"
          alt=""
          className="w-full h-full object-cover rounded-2xl sm:rounded-full"
          loading="eager"
        />
      </div>

      {/* Static layered stickers (dense on right and sparse on left) */}
      {bgStickers.map((sticker, idx) => (
        <div
          key={idx}
          className={`absolute pointer-events-none bg-white flex items-center justify-center border-[6px] sm:border-[10px] border-white dark:border-white/90 overflow-hidden opacity-[0.95] ${sticker.className}`}
          style={sticker.style}
        >
          <img
            src={sticker.src}
            alt=""
            className="w-full h-full object-cover"
            loading="eager"
          />
        </div>
      ))}

      {/* White background covering the entire width and height of the section on mobile, theme-based on desktop */}
      <div className="absolute inset-0 bg-white/75 sm:bg-background/50 dark:sm:bg-background/50 pointer-events-none z-0" />

      {/* Content wrapper */}
      <div className="relative z-10 flex flex-col items-center p-6 max-w-4xl mx-auto w-full mt-4 sm:mt-8">
        <h1
          className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-foreground max-w-4xl font-heading leading-[1.15] drop-shadow-sm"
        >
          Naklejki z własnym nadrukiem <br className="hidden sm:block" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-emerald-400">idealnie wycięte po obrysie</span>
        </h1>

        <p
          className="text-muted-foreground text-sm sm:text-base font-semibold mt-4 max-w-2xl mx-auto leading-relaxed"
        >
          Wgraj zdjęcie z telefonu, a my sami wytniemy naklejkę idealnie po jej kształcie.
          Stwórz własny arkusz w kilku prostych krokach poniżej.
        </p>

        <div className="mt-2">
          <MiniHeroButton />
        </div>
      </div>
    </section>
  );
}

/**
 * @deprecated Use MiniHeroContent (server component) instead.
 * Kept for backward compatibility with HomePageClient.
 */
export const MiniHero = MiniHeroContent;

