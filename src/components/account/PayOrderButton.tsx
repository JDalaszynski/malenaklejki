"use client";

import { useState } from "react";
import { CreditCard, Loader2 } from "lucide-react";

import { retryOrderPayment } from "@/app/actions/createOrder";

/**
 * Nowa płatność Przelewy24 za zamówienie, które czeka na wpłatę.
 *
 * Bez tego klient, któremu płatność przerwała się w P24, miał w koncie tylko
 * „Zamów ponownie" — i składał kolejne zamówienie zamiast opłacić to, które
 * już złożył. Po płatności P24 odsyła na stronę `/zamowienie-sukces`, tę samą
 * co przy pierwszej próbie.
 */
export function PayOrderButton({
  orderId,
  compact = false,
}: {
  orderId: string;
  compact?: boolean;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const pay = async () => {
    setBusy(true);
    setError(null);

    try {
      const res = await retryOrderPayment(orderId);
      if (res.success && res.redirectUrl) {
        // Przycisk zostaje zablokowany aż do przejścia do Przelewy24.
        window.location.href = res.redirectUrl;
        return;
      }
      setError(res.error || "Nie udało się przygotować płatności. Spróbuj ponownie.");
    } catch {
      setError("Nie udało się przygotować płatności. Odśwież stronę i spróbuj ponownie.");
    }
    setBusy(false);
  };

  return (
    <div className="flex flex-col gap-2">
      <button
        type="button"
        onClick={pay}
        disabled={busy}
        className={`inline-flex items-center justify-center gap-2 rounded-xl font-bold transition-all active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer bg-primary text-primary-foreground hover:bg-primary/95 shadow-sm self-start ${
          compact ? "h-10 px-4 text-sm" : "h-12 px-5 text-sm"
        }`}
      >
        {busy ? (
          <Loader2 className="w-4 h-4 animate-spin" aria-hidden />
        ) : (
          <CreditCard className="w-4 h-4" aria-hidden />
        )}
        Opłać zamówienie
      </button>

      {error && (
        <p
          role="alert"
          className="inline-block self-start bg-destructive/10 text-destructive border border-destructive/30 text-xs font-bold px-3 py-1.5 rounded-lg"
        >
          {error}
        </p>
      )}
    </div>
  );
}
