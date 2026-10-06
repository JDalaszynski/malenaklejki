"use client";

import { Pencil } from "lucide-react";

/**
 * Rozwija zwinięty edytor zamówienia (`<details id>`) i przewija do niego.
 * Dane klienta i dostawy są na stronie tylko do odczytu — edycja dzieje się
 * w jednym miejscu, żeby ekran nie był zlepkiem pól, które trzeba przewijać.
 */
export function OpenEditorButton({ targetId, children }: { targetId: string; children: React.ReactNode }) {
  const open = () => {
    const target = document.getElementById(targetId);
    if (!(target instanceof HTMLDetailsElement)) return;
    target.open = true;
    target.scrollIntoView({ behavior: "smooth", block: "start" });
    target.querySelector<HTMLElement>("input, select, textarea")?.focus({ preventScroll: true });
  };

  return (
    <button
      type="button"
      onClick={open}
      className="inline-flex items-center gap-1.5 rounded-lg text-xs font-bold text-primary hover:bg-primary/10 px-2.5 py-1.5 transition-colors cursor-pointer"
    >
      <Pencil className="w-3.5 h-3.5" aria-hidden />
      {children}
    </button>
  );
}
