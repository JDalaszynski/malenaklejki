"use client";

import { ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { ImageIcon } from "lucide-react";

/**
 * Kolor linii cięcia — dokładnie ten sam, którym kreator rysuje
 * linie cięcia na podglądzie arkusza (renderSheetCanvas → #ff5ebb).
 */
export const CUT_LINE_PINK = "#ff5ebb";

/** Klasa nagłówków display — Nunito (--font-sans), zgodnie z resztą strony (pełne wsparcie polskich znaków). */
export const displayFont = "[font-family:var(--font-sans)]";

/**
 * Styl kontekstowego linku w treści SEO (hub → spoke).
 * Prowadzi ze strony głównej do powiązanego artykułu na blogu.
 */
export const inlineLink =
  "font-bold text-primary underline decoration-primary/40 underline-offset-4 transition-colors hover:decoration-primary hover:text-primary/80";

/** Przewija do podglądu arkusza w kreatorze (listener istnieje w page.tsx). */
export function scrollToCreator() {
  window.dispatchEvent(new Event("scroll-to-sheet"));
}

/* ------------------------------------------------------------------ */
/* Reveal — subtelny scroll-reveal z poszanowaniem reduced motion      */
/* ------------------------------------------------------------------ */

export function Reveal({
  children,
  className,
  delay = 0,
  y = 18,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  y?: number;
}) {
  const reduceMotion = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y }}
      whileInView={reduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-72px" }}
      transition={{ duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/* SectionHeading — eyebrow + display h2 (wzorzec podkreślenia jak     */
/* w sekcji bloga: słowo w primary + miękki pasek)                     */
/* ------------------------------------------------------------------ */

export function HighlightWord({ children }: { children: ReactNode }) {
  return (
    <span className="text-primary relative inline-block">
      {children}
      <span
        aria-hidden
        className="absolute -bottom-1.5 left-0 w-full h-1.5 bg-primary/20 rounded-full"
      />
    </span>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  sub,
  align = "center",
  id,
  as: Tag = "h2",
}: {
  eyebrow?: string;
  title: ReactNode;
  sub?: ReactNode;
  align?: "center" | "left";
  id?: string;
  as?: "h2" | "h3";
}) {
  const alignCls = align === "center" ? "text-center items-center mx-auto" : "text-left items-start";
  return (
    <div className={`flex flex-col gap-3 max-w-2xl ${alignCls}`}>
      {eyebrow && (
        <span className="text-[11px] font-black uppercase tracking-[0.2em] text-primary">
          {eyebrow}
        </span>
      )}
      <Tag
        id={id}
        className={`text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground text-balance leading-[1.15] ${displayFont}`}
      >
        {title}
      </Tag>
      {sub && (
        <p className="text-muted-foreground text-sm sm:text-base font-semibold leading-relaxed">
          {sub}
        </p>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* PhotoPlaceholder — miejsce na docelowe zdjęcie.                     */
/* Wariant cut=true dostaje biały margines die-cut i różową            */
/* przerywaną linię cięcia — jak naklejka na podglądzie arkusza.       */
/* PLACEHOLDER: każdy element z tym komponentem podmień na finalne     */
/* zdjęcie (np. <img> / next/image) zachowując proporcje.              */
/* ------------------------------------------------------------------ */

export function PhotoPlaceholder({
  label,
  ratio = "aspect-[4/3]",
  cut = false,
  className = "",
  iconSize = "w-7 h-7",
  showLabel = true,
}: {
  label: string;
  ratio?: string;
  cut?: boolean;
  className?: string;
  iconSize?: string;
  showLabel?: boolean;
}) {
  const inner = (
    <div
      className={`relative w-full h-full flex flex-col items-center justify-center gap-2 overflow-hidden rounded-[inherit] bg-muted dark:bg-[#00393b] [background-image:repeating-linear-gradient(45deg,rgba(0,71,73,0.035)_0px,rgba(0,71,73,0.035)_10px,transparent_10px,transparent_20px)] dark:[background-image:repeating-linear-gradient(45deg,rgba(255,255,255,0.03)_0px,rgba(255,255,255,0.03)_10px,transparent_10px,transparent_20px)]`}
    >
      <ImageIcon aria-hidden className={`${iconSize} text-foreground/25 dark:text-white/25`} />
      {showLabel && (
        <span className="px-3 text-center text-[10px] leading-tight font-extrabold uppercase tracking-wider text-foreground/35 dark:text-white/35">
          {label}
        </span>
      )}
      <span className="sr-only">Miejsce na zdjęcie: {label}</span>
    </div>
  );

  if (!cut) {
    return <div className={`${ratio} rounded-2xl overflow-hidden ${className}`}>{inner}</div>;
  }

  // Wariant „naklejka”: białe passe-partout (die-cut) + linia cięcia.
  return (
    <div
      className={`${ratio} rounded-2xl bg-white dark:bg-white p-1.5 shadow-[0_10px_30px_-10px_rgba(0,71,73,0.25)] ${className}`}
    >
      <div
        className="w-full h-full rounded-xl border-2 border-dashed p-1"
        style={{ borderColor: CUT_LINE_PINK }}
      >
        <div className="w-full h-full rounded-lg overflow-hidden">{inner}</div>
      </div>
    </div>
  );
}
