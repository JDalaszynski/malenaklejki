"use client";

import { useState } from "react";
import { Download, Loader2, Printer, Scissors } from "lucide-react";

/**
 * Ikona jako nazwa, nie komponent: przycisk jest używany ze strony serwerowej,
 * a z komponentu serwerowego do klienckiego nie da się przekazać funkcji.
 */
const ICONS = { download: Download, print: Printer, cut: Scissors } as const;

/** Nazwa pliku z nagłówka `Content-Disposition` odpowiedzi trasy pobierania. */
function fileNameFrom(header: string | null): string {
  const match = header?.match(/filename="([^"]+)"/);
  return match?.[1] ?? "pliki-zamowienia";
}

/**
 * Jeden przycisk na pobranie plików.
 *
 * Pobiera `fetch`-em, a nie zwykłym linkiem, z dwóch powodów: błąd (plik
 * usunięty z magazynu, wygasła sesja) pokazujemy w miejscu przycisku zamiast
 * wyrzucać użytkownika na stronę z gołym tekstem, a w trakcie widać, że coś
 * się dzieje — arkusze do druku ważą po kilka megabajtów.
 */
export function DownloadButton({
  href,
  label,
  icon = "download",
  variant = "primary",
  size = "md",
  title,
}: {
  href: string;
  label: string;
  icon?: keyof typeof ICONS;
  /** Podpowiedź po najechaniu — np. ile plików trafi do archiwum. */
  title?: string;
  variant?: "primary" | "outline";
  size?: "md" | "sm";
}) {
  const Icon = ICONS[icon];
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const run = async () => {
    setBusy(true);
    setError(null);

    try {
      const response = await fetch(href, { cache: "no-store" });

      // Wygasła sesja: proxy przekierowuje na logowanie i `fetch` dostaje HTML.
      if (response.redirected || response.headers.get("content-type")?.includes("text/html")) {
        throw new Error("Sesja wygasła — odśwież stronę i zaloguj się ponownie.");
      }
      if (!response.ok) {
        throw new Error((await response.text()) || `Błąd ${response.status}`);
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = fileNameFrom(response.headers.get("content-disposition"));
      document.body.append(link);
      link.click();
      link.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 30_000);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Nie udało się pobrać plików.");
    } finally {
      setBusy(false);
    }
  };

  const sizing = size === "sm" ? "h-9 px-4" : "h-11 px-5";
  const tone =
    variant === "primary"
      ? "bg-primary text-primary-foreground hover:bg-primary/95 shadow-sm"
      : "bg-card border border-border/70 text-foreground hover:bg-muted/50 hover:text-primary";

  return (
    <div className="flex flex-col items-end gap-1.5">
      <button
        type="button"
        onClick={run}
        disabled={busy}
        title={title}
        className={`inline-flex items-center justify-center gap-2 rounded-xl text-sm font-bold active:scale-[0.98] transition-all cursor-pointer disabled:opacity-70 disabled:cursor-progress ${sizing} ${tone}`}
      >
        {busy ? (
          <Loader2 className="w-4 h-4 animate-spin" aria-hidden />
        ) : (
          <Icon className="w-4 h-4" aria-hidden />
        )}
        {busy ? "Przygotowuję…" : label}
      </button>
      {error && (
        <p
          role="alert"
          className="max-w-xs text-right text-xs font-bold text-destructive bg-destructive/10 border border-destructive/25 rounded-lg px-3 py-1.5"
        >
          {error}
        </p>
      )}
    </div>
  );
}
