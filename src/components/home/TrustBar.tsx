"use client";

import { Truck, ShieldCheck, Layers, PackageOpen } from "lucide-react";
import { Reveal } from "./primitives";

const FACTS = [
  {
    icon: Truck,
    title: "Druk i wysyłka w 3 dni robocze",
    sub: "Paczkomaty InPost w całej Polsce",
  },
  {
    icon: ShieldCheck,
    title: "Bezpieczne płatności",
    sub: "BLIK, karta i Przelewy24",
  },
  {
    icon: Layers,
    title: "Trwały winyl i mocny klej",
    sub: "Żywe kolory, precyzyjne cięcie",
  },
  {
    icon: PackageOpen,
    title: "Od 1 arkusza — bez minimum",
    sub: "Zero hurtowych nakładów",
  },
] as const;

export function TrustBar() {
  return (
    <Reveal>
      <ul className="grid grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-7 py-2">
        {FACTS.map(({ icon: Icon, title, sub }) => (
          <li key={title} className="flex items-start gap-3.5">
            <span className="shrink-0 w-11 h-11 rounded-2xl bg-primary/10 dark:bg-primary/20 text-primary flex items-center justify-center">
              <Icon aria-hidden className="w-5 h-5" />
            </span>
            <span className="flex flex-col gap-0.5 min-w-0">
              <span className="text-[13px] sm:text-sm font-extrabold text-foreground leading-snug">
                {title}
              </span>
              <span className="text-[11px] sm:text-xs font-semibold text-muted-foreground leading-snug">
                {sub}
              </span>
            </span>
          </li>
        ))}
      </ul>
    </Reveal>
  );
}
