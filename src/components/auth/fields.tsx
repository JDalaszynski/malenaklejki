"use client";

import { forwardRef } from "react";
import { AlertCircle, Loader2 } from "lucide-react";

/** Wspólne style pól formularza — identyczne z formularzem zamówienia. */
export const inputClass =
  "flex h-12 w-full rounded-xl border border-slate-300 dark:border-white/20 bg-background px-4 py-2 text-base font-medium focus-visible:outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20 disabled:opacity-60";

export const Input = forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  function Input({ className = "", ...props }, ref) {
    return <input ref={ref} className={`${inputClass} ${className}`} {...props} />;
  }
);

export function Field({
  label,
  required,
  error,
  hint,
  children,
}: {
  label: string;
  required?: boolean;
  error?: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="text-sm font-bold mb-2 block">
        {label}
        {required && <span className="text-destructive"> *</span>}
      </label>
      {children}
      {hint && !error && (
        <p className="text-xs font-medium text-muted-foreground mt-1.5">{hint}</p>
      )}
      {error && (
        <p className="inline-block bg-destructive/30 text-destructive-foreground text-xs font-bold px-3 py-1 rounded-lg border border-destructive/40 mt-1.5">
          {error}
        </p>
      )}
    </div>
  );
}

export function FormAlert({
  tone = "error",
  children,
}: {
  tone?: "error" | "success" | "info";
  children: React.ReactNode;
}) {
  const tones = {
    error: "bg-destructive/10 border-destructive/30 text-destructive",
    success: "bg-primary/10 border-primary/30 text-primary",
    info: "bg-muted/50 border-border/60 text-foreground",
  };
  return (
    <div
      role={tone === "error" ? "alert" : "status"}
      className={`flex items-start gap-3 rounded-2xl border px-4 py-3 text-sm font-bold ${tones[tone]}`}
    >
      {tone === "error" && <AlertCircle className="w-5 h-5 shrink-0 mt-px" aria-hidden />}
      <span className="leading-relaxed">{children}</span>
    </div>
  );
}

export function SubmitButton({
  loading,
  children,
  className = "",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { loading?: boolean }) {
  return (
    <button
      type="submit"
      disabled={loading || props.disabled}
      className={`w-full inline-flex items-center justify-center rounded-xl text-base font-bold bg-primary text-primary-foreground hover:bg-primary/95 active:scale-[0.98] h-14 px-8 shadow-sm transition-all disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer ${className}`}
      {...props}
    >
      {loading && <Loader2 className="w-5 h-5 mr-2 animate-spin" aria-hidden />}
      {children}
    </button>
  );
}

export function GoogleButton({
  onClick,
  loading,
  label,
}: {
  onClick: () => void;
  loading?: boolean;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={loading}
      className="w-full inline-flex items-center justify-center gap-3 rounded-xl text-base font-bold bg-card text-foreground border border-border/70 hover:bg-muted/40 active:scale-[0.98] h-14 px-6 shadow-sm transition-all disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
    >
      {loading ? (
        <Loader2 className="w-5 h-5 animate-spin" aria-hidden />
      ) : (
        <svg className="w-5 h-5" viewBox="0 0 24 24" aria-hidden>
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.65l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23z" />
          <path fill="#FBBC05" d="M5.84 14.11a6.6 6.6 0 0 1 0-4.22V7.05H2.18a11 11 0 0 0 0 9.9l3.66-2.84z" />
          <path fill="#EA4335" d="M12 4.75c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 1.46 14.97.5 12 .5A11 11 0 0 0 2.18 7.05l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
        </svg>
      )}
      {label}
    </button>
  );
}

export function Divider({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-4">
      <span className="h-px flex-1 bg-border/70" />
      <span className="text-xs font-black uppercase tracking-[0.18em] text-muted-foreground">
        {label}
      </span>
      <span className="h-px flex-1 bg-border/70" />
    </div>
  );
}
