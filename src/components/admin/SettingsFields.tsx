"use client";

import { useEffect } from "react";
import { Check, Loader2, RotateCcw } from "lucide-react";

export const settingsInputClass =
  "h-11 w-full rounded-xl border border-slate-300 dark:border-white/20 bg-background px-3 text-sm font-semibold focus-visible:outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20";

export const settingsTextareaClass =
  "w-full rounded-xl border border-slate-300 dark:border-white/20 bg-background px-3 py-2.5 text-sm font-semibold leading-relaxed focus-visible:outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20";

export function SettingsField({
  label,
  htmlFor,
  hint,
  error,
  children,
  className = "",
}: {
  label: string;
  /** `id` pola — dzięki niemu klik w etykietę ustawia w nim kursor. */
  htmlFor?: string;
  hint?: string;
  error?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <label htmlFor={htmlFor} className="text-sm font-bold mb-1.5 block">
        {label}
      </label>
      {children}
      {hint && !error && (
        <p className="text-xs font-medium text-muted-foreground mt-1.5">{hint}</p>
      )}
      {error && (
        <p
          role="alert"
          className="inline-block bg-destructive/20 text-destructive text-xs font-bold px-2.5 py-1 rounded-lg mt-1.5"
        >
          {error}
        </p>
      )}
    </div>
  );
}

export function SettingsToggle({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <label className="flex items-start gap-3 rounded-2xl border border-border/60 bg-muted/30 hover:bg-muted/50 p-4 cursor-pointer transition-colors select-none">
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="mt-0.5 w-4 h-4 rounded border-border text-primary focus:ring-primary cursor-pointer"
      />
      <span className="min-w-0">
        <span className="block text-sm font-extrabold text-foreground">{label}</span>
        <span className="block text-xs font-medium text-muted-foreground leading-relaxed mt-0.5">
          {description}
        </span>
      </span>
    </label>
  );
}

/**
 * Pasek zapisu przyklejony do dołu ekranu.
 *
 * Przycisk „Zapisz" jest aktywny dopiero po zmianie, a pasek mówi wprost, czy
 * coś czeka na zapis — dzięki temu nie trzeba przewijać do końca długiego
 * formularza ani zgadywać, czy poprzednia zmiana „weszła". Przy niezapisanych
 * zmianach przeglądarka pyta przed zamknięciem karty.
 */
export function SettingsSaveBar({
  dirty,
  saving,
  onReset,
  lastChange,
  error,
  saveLabel = "Zapisz zmiany",
}: {
  dirty: boolean;
  saving: boolean;
  onReset: () => void;
  /** Gotowy opis ostatniej zmiany, np. „5.10.2026, 10:12 — jan@…". */
  lastChange?: string | null;
  /** Błąd zapisu pokazujemy tuż nad przyciskiem — u góry formularza nikt by go nie zobaczył. */
  error?: string | null;
  saveLabel?: string;
}) {
  useEffect(() => {
    if (!dirty) return;
    const warn = (event: BeforeUnloadEvent) => {
      event.preventDefault();
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  return (
    <div className="sticky bottom-4 z-20 flex flex-col gap-2">
      {error && (
        <p
          role="alert"
          className="rounded-2xl border border-destructive/40 bg-card px-4 py-2.5 text-sm font-bold text-destructive shadow-lg"
        >
          {error}
        </p>
      )}
      <div
        className={`flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-2xl border px-4 py-3 shadow-lg backdrop-blur transition-colors ${
          dirty
            ? "bg-card/95 border-primary/50"
            : "bg-card/90 border-border/70"
        }`}
      >
        <p role="status" className="text-sm font-bold min-w-0 max-w-full">
          {dirty ? (
            <span className="inline-flex items-center gap-2 text-foreground">
              <span className="w-2 h-2 rounded-full bg-[#FFCD08] shrink-0" aria-hidden />
              Masz niezapisane zmiany
            </span>
          ) : (
            <span className="flex items-center gap-2 text-muted-foreground min-w-0">
              <Check className="w-4 h-4 text-primary shrink-0" aria-hidden />
              <span className="truncate min-w-0">
                {lastChange ? `Zapisane · ${lastChange}` : "Brak zmian do zapisania"}
              </span>
            </span>
          )}
        </p>
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={onReset}
            disabled={!dirty || saving}
            className="inline-flex items-center justify-center gap-1.5 rounded-xl text-sm font-bold h-11 px-4 border border-border/70 text-muted-foreground hover:bg-muted/50 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <RotateCcw className="w-4 h-4" aria-hidden />
            Cofnij
          </button>
          <button
            type="submit"
            disabled={!dirty || saving}
            className="inline-flex items-center justify-center gap-2 rounded-xl text-sm font-bold h-11 px-6 bg-primary text-primary-foreground hover:bg-primary/95 shadow-sm transition-all active:scale-[0.98] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving && <Loader2 className="w-4 h-4 animate-spin" aria-hidden />}
            {saveLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
