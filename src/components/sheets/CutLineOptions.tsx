"use client";

import { Ban, Circle, Loader2, Sparkles, Square } from "lucide-react";

import type { CutLineType } from "@/lib/sheets/types";

/** Te same sześć rodzajów linii cięcia, które kreator pokazuje klientom. */
export const CUT_LINE_OPTIONS: { type: CutLineType; label: string; icon: typeof Ban }[] = [
  { type: "none", label: "Brak", icon: Ban },
  { type: "contour", label: "Kontur", icon: Sparkles },
  { type: "rounded", label: "Prostokąt", icon: Square },
  { type: "circle", label: "Koło", icon: Circle },
  { type: "rounded_inside", label: "Prostokąt wew.", icon: Square },
  { type: "circle_inside", label: "Koło wew.", icon: Circle },
];

export function CutLineOptions({
  value,
  onChange,
  calculating = null,
  disabled = false,
  hideNone = false,
}: {
  value: CutLineType;
  onChange: (type: CutLineType) => void;
  /** Rodzaj, dla którego właśnie liczy się obrys — dostaje kółko ładowania. */
  calculating?: CutLineType | null;
  disabled?: boolean;
  /** W bazie „brak” nie ma sensu jako ustawienie docelowe. */
  hideNone?: boolean;
}) {
  const options = hideNone ? CUT_LINE_OPTIONS.filter((opt) => opt.type !== "none") : CUT_LINE_OPTIONS;

  return (
    <div className="grid grid-cols-3 gap-2" role="radiogroup" aria-label="Rodzaj linii cięcia">
      {options.map((opt) => {
        const Icon = opt.icon;
        const active = value === opt.type;
        const busy = calculating === opt.type;
        return (
          <button
            key={opt.type}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(opt.type)}
            disabled={disabled || calculating !== null}
            className={`py-3 px-1 text-[10px] sm:text-xs font-bold rounded-xl border text-center transition-all flex flex-col items-center justify-center gap-1.5 active:scale-95 whitespace-nowrap cursor-pointer disabled:cursor-not-allowed ${
              active
                ? "bg-primary text-primary-foreground border-primary shadow-sm"
                : "bg-background text-muted-foreground border-border hover:bg-muted/40"
            } ${busy ? "opacity-70" : ""}`}
          >
            {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Icon className="w-4 h-4" />}
            <span>{opt.label}</span>
          </button>
        );
      })}
    </div>
  );
}
