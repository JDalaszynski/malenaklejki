"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";
import { motion } from "framer-motion";
import { X } from "lucide-react";

/**
 * Okno dialogowe panelu arkuszy — wzór z kreatora (tło z rozmyciem, karta
 * z zaokrągleniem 3xl), zamykane klawiszem Esc i kliknięciem w tło.
 * Rodzic trzyma je w `AnimatePresence`.
 */
export function Modal({
  title,
  description,
  onClose,
  children,
  footer,
  size = "md",
  busy = false,
}: {
  title: React.ReactNode;
  description?: React.ReactNode;
  onClose: () => void;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: "md" | "lg";
  /** W trakcie zapisu nie zamykamy okna przypadkiem. */
  busy?: boolean;
}) {
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !busy) onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose, busy]);

  return createPortal(
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={() => !busy && onClose()}
        className="absolute inset-0 bg-background/80 backdrop-blur-sm"
      />
      <motion.div
        role="dialog"
        aria-modal="true"
        initial={{ opacity: 0, scale: 0.96, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 10 }}
        className={`relative w-full ${
          size === "lg" ? "max-w-3xl" : "max-w-lg"
        } max-h-[calc(100dvh-2rem)] flex flex-col rounded-3xl border border-border bg-background shadow-xl`}
      >
        <div className="flex items-start justify-between gap-4 p-5 sm:p-6 pb-3 sm:pb-4">
          <div className="min-w-0">
            <h2 className="text-xl font-extrabold text-foreground">{title}</h2>
            {description && (
              <p className="text-sm font-medium text-muted-foreground mt-1">{description}</p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={busy}
            className="shrink-0 p-1.5 rounded-full bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground transition-all cursor-pointer disabled:opacity-50"
            aria-label="Zamknij"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="px-5 sm:px-6 pb-5 sm:pb-6 overflow-y-auto">{children}</div>
        {footer && (
          <div className="flex flex-wrap items-center justify-end gap-2 border-t border-border/60 px-5 sm:px-6 py-4">
            {footer}
          </div>
        )}
      </motion.div>
    </div>,
    document.body
  );
}

export const primaryButtonClass =
  "inline-flex items-center justify-center gap-2 rounded-xl text-sm font-bold h-11 px-5 bg-primary text-primary-foreground hover:bg-primary/95 shadow-sm transition-all active:scale-[0.98] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed";

export const secondaryButtonClass =
  "inline-flex items-center justify-center gap-2 rounded-xl text-sm font-bold h-11 px-5 border border-slate-300 dark:border-white/20 bg-background hover:bg-slate-50 dark:hover:bg-white/5 transition-all active:scale-[0.98] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed";

export const dangerButtonClass =
  "inline-flex items-center justify-center gap-2 rounded-xl text-sm font-bold h-11 px-5 border border-destructive/40 text-destructive hover:bg-destructive/10 transition-all active:scale-[0.98] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed";

export const inputClass =
  "h-11 w-full rounded-xl border border-slate-300 dark:border-white/20 bg-background px-3.5 text-sm font-semibold focus-visible:outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20";
