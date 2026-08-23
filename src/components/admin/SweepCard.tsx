"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Trash2 } from "lucide-react";

import { runAbandonedSweep } from "@/app/actions/admin";
import { Card } from "./AdminLayout";

/**
 * Widoczne tylko wtedy, gdy faktycznie jest co sprzątać — pusty panel
 * z przyciskiem „posprzątaj" byłby wyłącznie szumem.
 */
export function SweepCard({ matched, afterDays }: { matched: number; afterDays: number }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [done, setDone] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (matched === 0 && done === null) return null;

  if (done !== null) {
    return (
      <Card>
        <p className="text-sm font-bold text-primary">
          Przeniesiono do kosza {done}{" "}
          {done === 1 ? "porzucone zamówienie" : "porzuconych zamówień"}. Znajdziesz je w koszu,
          gdyby coś trzeba było przywrócić.
        </p>
      </Card>
    );
  }

  return (
    <Card className="border-[#FFCD08]/50 bg-[#FFCD08]/5">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="flex-1">
          <p className="font-extrabold text-foreground">
            {matched}{" "}
            {matched === 1 ? "nieopłacone zamówienie" : "nieopłaconych zamówień"} do sprzątnięcia
          </p>
          <p className="text-sm font-medium text-muted-foreground mt-1 leading-relaxed max-w-2xl">
            Od ponad {afterDays} dni czekają na płatność albo mają płatność nieudaną. Trafią do
            kosza, nie zostaną usunięte — a gdyby spóźniona wpłata jednak dotarła, zamówienie
            wróci na listę automatycznie.
          </p>
          {error && (
            <p className="text-xs font-bold text-destructive bg-destructive/10 border border-destructive/25 rounded-lg px-3 py-1.5 mt-2 inline-block">
              {error}
            </p>
          )}
        </div>

        <button
          type="button"
          disabled={isPending}
          onClick={() =>
            startTransition(async () => {
              setError(null);
              const result = await runAbandonedSweep();
              if (!result.success) setError(result.error);
              else {
                setDone(result.moved);
                router.refresh();
              }
            })
          }
          className="shrink-0 inline-flex items-center justify-center gap-2 rounded-xl text-sm font-bold bg-card border border-border/70 text-foreground hover:bg-muted/50 hover:text-destructive h-11 px-5 transition-all cursor-pointer disabled:opacity-60"
        >
          {isPending ? (
            <Loader2 className="w-4 h-4 animate-spin" aria-hidden />
          ) : (
            <Trash2 className="w-4 h-4" aria-hidden />
          )}
          Przenieś do kosza
        </button>
      </div>
    </Card>
  );
}
