"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";

/**
 * Kopiuje wartość do schowka — adres do etykiety kuriera, e-mail do wiadomości.
 * Bez schowka (stara przeglądarka, brak HTTPS) przycisk po prostu nic nie robi,
 * a wartość zostaje zaznaczalna w tekście obok.
 */
export function CopyButton({ value, label }: { value: string; label: string }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      /* brak dostępu do schowka — nic do zrobienia */
    }
  };

  return (
    <button
      type="button"
      onClick={copy}
      aria-label={copied ? "Skopiowano" : label}
      title={copied ? "Skopiowano" : label}
      className="inline-flex items-center justify-center w-7 h-7 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors cursor-pointer shrink-0"
    >
      {copied ? (
        <Check className="w-3.5 h-3.5 text-primary" aria-hidden />
      ) : (
        <Copy className="w-3.5 h-3.5" aria-hidden />
      )}
    </button>
  );
}
