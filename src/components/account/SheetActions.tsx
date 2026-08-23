"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, RotateCcw } from "lucide-react";

import { loadSheetFromOrder } from "@/app/actions/orderSheets";
import { useCartStore } from "@/store/cartStore";

export function SheetActions({
  orderId,
  itemId,
  compact = false,
}: {
  orderId: string;
  itemId: string;
  compact?: boolean;
}) {
  const router = useRouter();
  const addItem = useCartStore((state) => state.addItem);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reorder = async () => {
    setBusy(true);
    setError(null);

    // Dociągamy też układ naklejek, jeśli został zapisany — dzięki temu
    // arkusz w koszyku można otworzyć w kreatorze i poprawić. Gdy układu nie ma
    // (zamówienia sprzed wdrożenia zapisu), arkusz i tak trafia do koszyka,
    // tylko bez możliwości edycji.
    const result = await loadSheetFromOrder(orderId, itemId, true);
    if (!result.success) {
      setError(result.error);
      setBusy(false);
      return;
    }

    // Zawsze powstaje nowa pozycja w koszyku — historyczne zamówienie
    // zostaje nietknięte.
    addItem({
      imageUrl: result.sheet.imageUrl,
      cutLinesImageUrl: result.sheet.cutLinesImageUrl,
      widthCm: result.sheet.widthCm,
      heightCm: result.sheet.heightCm,
      stickersPerSheet: result.sheet.stickersPerSheet,
      sheetQuantity: result.sheet.sheetQuantity,
      pricePerSheet: result.sheet.pricePerSheet,
      deliveryForm: result.sheet.deliveryForm,
      stickers: result.sheet.stickers,
      layoutPath: result.sheet.layoutPath,
    });

    router.push("/koszyk");
  };

  return (
    <div className="flex flex-col gap-2">
      <button
        type="button"
        onClick={reorder}
        disabled={busy}
        className={`inline-flex items-center justify-center gap-2 rounded-xl font-bold transition-all active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer bg-primary text-primary-foreground hover:bg-primary/95 shadow-sm self-start ${
          compact ? "h-10 px-4 text-sm" : "h-12 px-5 text-sm"
        }`}
      >
        {busy ? (
          <Loader2 className="w-4 h-4 animate-spin" aria-hidden />
        ) : (
          <RotateCcw className="w-4 h-4" aria-hidden />
        )}
        Zamów ponownie
      </button>

      {error && (
        <p className="inline-block self-start bg-destructive/10 text-destructive border border-destructive/30 text-xs font-bold px-3 py-1.5 rounded-lg">
          {error}
        </p>
      )}
    </div>
  );
}
