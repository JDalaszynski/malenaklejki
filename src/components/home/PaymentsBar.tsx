"use client";

import { Reveal } from "./primitives";

export function PaymentsBar() {
  return (
    <Reveal>
      <div className="flex flex-col items-center justify-center gap-4 text-center border-t border-dashed border-border dark:border-white/15 pt-8">
        <div className="flex items-center justify-center gap-3">
          <span className="text-xs sm:text-sm font-extrabold text-muted-foreground">
            Płatności obsługuje:
          </span>
          <img
            src="/images/payment-icons/Przelewy24_logo.png"
            alt="Przelewy24 Logo"
            loading="lazy"
            className="h-6 sm:h-7 object-contain"
          />
        </div>
        <img
          src="/images/payment-icons/metody-platnosci-przelewy24.png"
          alt="Metody płatności Przelewy24"
          loading="lazy"
          className="w-full max-w-[450px] sm:max-w-[600px] h-auto object-contain opacity-90 dark:brightness-90 dark:invert-[0.05]"
        />
      </div>
    </Reveal>
  );
}
