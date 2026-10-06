"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronRight, Layers, Loader2, Minus, PencilRuler, Plus, Scissors, ShoppingCart } from "lucide-react";

import { trackAddToCart, trackViewReadySheet } from "@/lib/analytics";
import { loadReadySheetLayout } from "@/lib/sheets/client";
import { EDIT_CTA_LABEL, formatPrice, sheetCreatorPath } from "@/lib/sheets/schema";
import { SHEET_PRICE, SHIPPING_PRICE, type CatalogSheet } from "@/lib/sheets/types";
import { useCartStore } from "@/store/cartStore";

type DeliveryForm = "sheet" | "individual";

const FORMS: { value: DeliveryForm; icon: typeof Layers; label: string; hint: string }[] = [
  { value: "sheet", icon: Layers, label: "Na arkuszu", hint: "Naklejki zostają na arkuszu A4 - wygodne do przechowywania." },
  { value: "individual", icon: Scissors, label: "Pojedyncze sztuki", hint: "Każda naklejka docięta osobno i dostarczona luzem." },
];

/**
 * Zakup gotowego zestawu prosto ze strony produktu.
 *
 * Pliki do druku powstały przy publikacji w panelu, więc pozycja trafia do
 * koszyka od razu — bez kreatora i bez składania zestawu w przeglądarce.
 * Taka pozycja jest „niezmieniona", czyli podlega zwrotowi w 14 dni.
 */
export function AddReadySheetToCart({
  sheet,
}: {
  sheet: Pick<
    CatalogSheet,
    "id" | "slug" | "name" | "category" | "version" | "stickerCount" | "printUrl" | "cutLinesUrl"
  >;
}) {
  const router = useRouter();
  const addItem = useCartStore((state) => state.addItem);
  const [quantity, setQuantity] = useState(1);
  const [form, setForm] = useState<DeliveryForm>("sheet");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    trackViewReadySheet(sheet, SHEET_PRICE);
    // Jedno zdarzenie na otwarcie strony zestawu.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sheet.id]);

  const add = async () => {
    if (busy) return;
    setBusy(true);
    setError(null);
    try {
      // Układ nie jest potrzebny do druku — pozwala tylko wrócić do zestawu
      // w kreatorze (z koszyka albo z historii zamówień), więc jego brak
      // nie zatrzymuje zakupu.
      const [layout, cart] = await Promise.all([
        loadReadySheetLayout(sheet.id, sheet.version).catch(() => null),
        fetch(`/api/gotowe-zestawy/${sheet.id}/koszyk`, { method: "POST" })
          .then((response) => (response.ok ? (response.json() as Promise<{ layoutPath?: string }>) : null))
          .catch(() => null),
      ]);

      const item = {
        imageUrl: sheet.printUrl,
        cutLinesImageUrl: sheet.cutLinesUrl,
        layoutPath: cart?.layoutPath,
        widthCm: 21,
        heightCm: 29.7,
        stickersPerSheet: sheet.stickerCount,
        sheetQuantity: quantity,
        pricePerSheet: SHEET_PRICE,
        stickers: layout?.stickers,
        deliveryForm: form,
        readySheet: {
          id: sheet.id,
          slug: sheet.slug,
          name: sheet.name,
          category: sheet.category,
          modified: false,
        },
      };
      addItem(item);
      trackAddToCart(item, "strona zestawu");
      router.push("/koszyk");
    } catch (err) {
      console.error(err);
      setError("Nie udało się dodać zestawu do koszyka. Spróbuj ponownie.");
      setBusy(false);
    }
  };

  const total = quantity * SHEET_PRICE;

  return (
    <div className="space-y-4">
      <fieldset>
        <legend className="text-xs font-black uppercase tracking-wider text-muted-foreground">
          Forma zestawu
        </legend>
        <div className="mt-2 grid grid-cols-2 gap-2">
          {FORMS.map(({ value, icon: Icon, label, hint }) => {
            const active = form === value;
            return (
              <button
                key={value}
                type="button"
                onClick={() => setForm(value)}
                aria-pressed={active}
                title={hint}
                className={`flex items-center gap-2 rounded-2xl border px-3 py-2.5 text-left text-xs font-extrabold transition-all cursor-pointer ${
                  active
                    ? "border-primary bg-primary/5 text-foreground shadow-sm"
                    : "border-border/60 bg-background/50 text-muted-foreground hover:text-foreground hover:bg-muted/30"
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${active ? "text-primary" : ""}`} aria-hidden />
                {label}
              </button>
            );
          })}
        </div>
        <p className="mt-1.5 text-[11px] font-medium text-muted-foreground">
          {FORMS.find((item) => item.value === form)?.hint}
        </p>
      </fieldset>

      <div className="flex items-center justify-between gap-3">
        <span className="text-xs font-black uppercase tracking-wider text-muted-foreground">
          Liczba zestawów
        </span>
        <div className="flex items-center gap-1 rounded-2xl border border-border/60 bg-background/60 p-1">
          <button
            type="button"
            onClick={() => setQuantity((value) => Math.max(1, value - 1))}
            disabled={quantity <= 1}
            aria-label="Mniej zestawów"
            className="w-9 h-9 rounded-xl flex items-center justify-center hover:bg-muted/60 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Minus className="w-4 h-4" />
          </button>
          <span className="w-8 text-center text-sm font-black tabular-nums" aria-live="polite">
            {quantity}
          </span>
          <button
            type="button"
            onClick={() => setQuantity((value) => Math.min(99, value + 1))}
            aria-label="Więcej zestawów"
            className="w-9 h-9 rounded-xl flex items-center justify-center hover:bg-muted/60 transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>

      <button
        type="button"
        onClick={() => void add()}
        disabled={busy}
        className="group w-full inline-flex items-center justify-center gap-2 px-6 py-4 bg-[#02af7a] hover:bg-[#029668] text-white text-sm sm:text-base font-black tracking-wide uppercase rounded-2xl shadow-[0_4px_14px_0_rgba(2,175,122,0.4)] hover:shadow-[0_6px_20px_0_rgba(2,175,122,0.6)] transition-all duration-300 cursor-pointer disabled:opacity-70 disabled:cursor-wait"
      >
        {busy ? <Loader2 className="w-5 h-5 animate-spin" aria-hidden /> : <ShoppingCart className="w-5 h-5" aria-hidden />}
        {busy ? "Dodaję..." : `Dodaj do koszyka - ${formatPrice(total)}`}
      </button>

      <Link
        href={sheetCreatorPath(sheet.id)}
        className="group flex items-center gap-3 rounded-2xl border border-primary/30 bg-primary/5 px-4 py-3 hover:bg-primary/10 hover:border-primary/60 transition-all duration-300"
      >
        <span className="flex w-9 h-9 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary">
          <PencilRuler className="w-4 h-4" aria-hidden />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-sm font-black text-foreground">{EDIT_CTA_LABEL} w kreatorze</span>
          <span className="block text-xs font-medium text-muted-foreground leading-snug">
            Usuń naklejki, zmień rozmiar, dodaj własne. Cena bez zmian.
          </span>
        </span>
        <ChevronRight
          className="w-4 h-4 shrink-0 text-primary group-hover:translate-x-0.5 transition-transform"
          aria-hidden
        />
      </Link>

      {error && (
        <p role="alert" className="text-sm font-bold text-destructive">
          {error}
        </p>
      )}

      <p className="text-[11px] font-medium text-muted-foreground leading-relaxed">
        Dostawa do paczkomatu {formatPrice(SHIPPING_PRICE)}, liczona raz za całe zamówienie.
        Zestaw zamówiony bez zmian możesz zwrócić w 14 dni; zmieniony w kreatorze zwrotowi nie podlega.
      </p>
    </div>
  );
}
