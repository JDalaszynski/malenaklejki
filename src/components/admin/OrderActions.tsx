"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, RotateCcw, Send, Trash2 } from "lucide-react";

import {
  deleteOrderPermanently,
  moveOrderToTrash,
  pushOrderToBaseLinker,
  restoreOrder,
} from "@/app/actions/admin";
import { FormAlert } from "@/components/auth/fields";
import { Card } from "./AdminLayout";

export function BaseLinkerButton({
  orderId,
  baselinkerOrderId,
}: {
  orderId: string;
  baselinkerOrderId: number | null;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  if (baselinkerOrderId) {
    return (
      <span className="inline-flex items-center gap-2 text-sm font-bold text-muted-foreground bg-muted/50 border border-border/60 rounded-xl px-4 h-11">
        W BaseLinkerze · ID {baselinkerOrderId}
      </span>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <button
        type="button"
        disabled={isPending}
        onClick={() =>
          startTransition(async () => {
            setError(null);
            const result = await pushOrderToBaseLinker(orderId);
            if (!result.success) setError(result.error);
            else router.refresh();
          })
        }
        className="inline-flex items-center justify-center gap-2 rounded-xl text-sm font-bold bg-card border border-border/70 text-foreground hover:bg-muted/50 hover:text-primary h-11 px-5 transition-all cursor-pointer disabled:opacity-60"
      >
        {isPending ? (
          <Loader2 className="w-4 h-4 animate-spin" aria-hidden />
        ) : (
          <Send className="w-4 h-4" aria-hidden />
        )}
        Wyślij do BaseLinkera
      </button>
      {error && (
        <p className="text-xs font-bold text-destructive bg-destructive/10 border border-destructive/25 rounded-lg px-3 py-1.5">
          {error}
        </p>
      )}
    </div>
  );
}

export function DangerZone({
  orderId,
  orderNumber,
  inTrash,
}: {
  orderId: string;
  orderNumber: string;
  inTrash: boolean;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [confirmText, setConfirmText] = useState("");
  const [error, setError] = useState<string | null>(null);

  const run = (action: () => Promise<{ success: boolean; error?: string }>, after: () => void) =>
    startTransition(async () => {
      setError(null);
      const result = await action();
      if (!result.success) {
        setError(result.error ?? "Nie udało się wykonać operacji.");
        return;
      }
      after();
    });

  if (!inTrash) {
    return (
      <Card title="Usuwanie">
        <p className="text-sm font-medium text-muted-foreground leading-relaxed max-w-2xl">
          Zamówienie trafi do kosza — zniknie z listy i z ewidencji sprzedaży, ale przez 30 dni
          będzie można je przywrócić. Trwałe usunięcie jest możliwe dopiero z kosza.
        </p>
        {error && (
          <div className="mt-4">
            <FormAlert>{error}</FormAlert>
          </div>
        )}
        <button
          type="button"
          disabled={isPending}
          onClick={() => run(() => moveOrderToTrash(orderId), () => router.push("/admin"))}
          className="mt-5 inline-flex items-center justify-center gap-2 rounded-xl text-sm font-bold bg-destructive/10 border border-destructive/30 text-destructive hover:bg-destructive/15 h-11 px-5 transition-all cursor-pointer disabled:opacity-60"
        >
          {isPending ? (
            <Loader2 className="w-4 h-4 animate-spin" aria-hidden />
          ) : (
            <Trash2 className="w-4 h-4" aria-hidden />
          )}
          Przenieś do kosza
        </button>
      </Card>
    );
  }

  return (
    <Card title="Zamówienie w koszu">
      <p className="text-sm font-medium text-muted-foreground leading-relaxed max-w-2xl">
        Możesz je przywrócić albo usunąć bezpowrotnie razem z zapisanymi układami arkuszy.
        Trwałego usunięcia nie da się cofnąć, a zamówienie zniknie też z ewidencji sprzedaży.
      </p>

      {error && (
        <div className="mt-4">
          <FormAlert>{error}</FormAlert>
        </div>
      )}

      <div className="mt-5 flex flex-col gap-5">
        <button
          type="button"
          disabled={isPending}
          onClick={() => run(() => restoreOrder(orderId), () => router.refresh())}
          className="self-start inline-flex items-center justify-center gap-2 rounded-xl text-sm font-bold bg-primary text-primary-foreground hover:bg-primary/95 h-11 px-5 transition-all cursor-pointer disabled:opacity-60"
        >
          <RotateCcw className="w-4 h-4" aria-hidden />
          Przywróć zamówienie
        </button>

        <div className="pt-5 border-t border-border/60 flex flex-col gap-3 max-w-md">
          <label className="text-sm font-bold">
            Przepisz numer zamówienia, żeby usunąć trwale
          </label>
          <input
            value={confirmText}
            onChange={(event) => setConfirmText(event.target.value)}
            placeholder={orderNumber}
            autoComplete="off"
            className="h-11 w-full rounded-xl border border-slate-300 dark:border-white/20 bg-background px-3 text-sm font-mono font-semibold focus-visible:outline-none focus-visible:border-destructive focus-visible:ring-2 focus-visible:ring-destructive/20"
          />
          <button
            type="button"
            disabled={isPending || confirmText.trim() !== orderNumber}
            onClick={() =>
              run(
                () => deleteOrderPermanently({ orderId, confirmOrderNumber: confirmText.trim() }),
                () => router.push("/admin/kosz")
              )
            }
            className="self-start inline-flex items-center justify-center gap-2 rounded-xl text-sm font-bold bg-destructive text-destructive-foreground hover:opacity-90 h-11 px-5 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Trash2 className="w-4 h-4" aria-hidden />
            Usuń bezpowrotnie
          </button>
        </div>
      </div>
    </Card>
  );
}
