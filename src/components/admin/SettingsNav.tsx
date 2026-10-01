"use client";

import { useEffect, useState } from "react";

import { StatusPill } from "@/components/account/StatusPill";
import type { StatusTone } from "@/lib/orders/status";

export type SettingsNavItem = {
  id: string;
  label: string;
  /** Aktualny stan ustawienia — widać go bez schodzenia do sekcji. */
  status: string;
  tone: StatusTone;
};

export type SettingsNavGroup = {
  label: string;
  items: SettingsNavItem[];
};

/**
 * Menu boczne strony ustawień: skok do sekcji plus stan każdej z nich.
 *
 * Na wąskim ekranie układa się nad treścią, na szerokim przykleja z boku.
 * Podświetlenie bieżącej sekcji liczy się przy przewijaniu — bez niego
 * nie byłoby widać, w której części strony jesteśmy.
 */
export function SettingsNav({ groups }: { groups: SettingsNavGroup[] }) {
  const [active, setActive] = useState<string>(groups[0]?.items[0]?.id ?? "");

  useEffect(() => {
    const ids = groups.flatMap((group) => group.items.map((item) => item.id));

    // Aktywna jest ostatnia sekcja, której górna krawędź minęła „linię
    // czytania" pod przyklejonym nagłówkiem. Na samym dole strony ostatnia
    // sekcja bywa za niska, żeby tę linię przekroczyć — wtedy wygrywa ona.
    let frame = 0;
    const update = () => {
      frame = 0;
      const atBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4;
      let current = ids[0];
      for (const id of ids) {
        const element = document.getElementById(id);
        if (element && element.getBoundingClientRect().top <= 160) current = id;
      }
      setActive(atBottom ? ids[ids.length - 1] : current);
    };
    const onScroll = () => {
      if (!frame) frame = window.requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [groups]);

  return (
    <nav aria-label="Sekcje ustawień" className="flex flex-col gap-5 lg:sticky lg:top-28">
      {groups.map((group) => (
        <div key={group.label}>
          <p className="text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground mb-2 px-1">
            {group.label}
          </p>
          <ul className="flex flex-col gap-1.5">
            {group.items.map((item) => {
              const isActive = active === item.id;
              return (
                <li key={item.id}>
                  <a
                    href={`#${item.id}`}
                    aria-current={isActive ? "true" : undefined}
                    onClick={() => setActive(item.id)}
                    className={`flex flex-col gap-1.5 rounded-xl border px-3.5 py-3 transition-colors ${
                      isActive
                        ? "bg-card border-primary/50 shadow-sm"
                        : "bg-card/60 border-border/60 hover:bg-card hover:border-border"
                    }`}
                  >
                    <span className="text-sm font-extrabold text-foreground">{item.label}</span>
                    <StatusPill tone={item.tone} className="self-start !px-2.5 !py-0.5 !text-[11px]">
                      {item.status}
                    </StatusPill>
                  </a>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}
