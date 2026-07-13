"use client";

import { motion } from "framer-motion";
import { ArrowDown } from "lucide-react";
import React from "react";

export const MiniHero = () => {
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
    <section className="w-full px-4 sm:px-6 lg:px-8 pt-4 pb-6 sm:pt-6 sm:pb-8 flex flex-col items-center justify-center text-center relative overflow-hidden">
      {/* Decorative background blur/glows placed naturally on the sides */}
      <div className="absolute -top-12 -left-12 w-[250px] h-[250px] bg-primary/5 dark:bg-primary/15 blur-[80px] rounded-full pointer-events-none -z-10" />
      <div className="absolute -bottom-16 -right-16 w-[300px] h-[300px] bg-emerald-400/5 dark:bg-emerald-500/10 blur-[90px] rounded-full pointer-events-none -z-10" />

      <motion.h1
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-foreground max-w-4xl font-heading leading-[1.15] drop-shadow-sm"
      >
        Naklejki z własnym nadrukiem <br className="hidden sm:block" />
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-emerald-400">idealnie wycięte po obrysie</span>
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut", delay: 0.1 }}
        className="text-muted-foreground text-sm sm:text-base font-semibold mt-3 max-w-2xl mx-auto leading-relaxed"
      >
        Wgraj zdjęcie z telefonu, a my sami wytniemy naklejkę idealnie po jej kształcie.
        Stwórz własny arkusz w kilku prostych krokach poniżej.
      </motion.p>

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
          <ArrowDown className="w-4 h-4 animate-bounce mt-0.5" />
        </div>
      </motion.button>
    </section>
  );
};

