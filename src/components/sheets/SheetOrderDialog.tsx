"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence } from "framer-motion";
import { ArrowDown, ArrowUp, ArrowUpDown, GripVertical, Loader2 } from "lucide-react";

import { saveSheetsOrder } from "@/app/actions/sheets";
import { byNewest, moveItem } from "@/lib/sheets/order";
import { getStickersNoun } from "@/lib/utils/polish";
import { Modal, primaryButtonClass, secondaryButtonClass } from "./Modal";

/** Zestaw w sklepie — tyle, ile trzeba, żeby go rozpoznać na liście. */
export type OrderableSheet = {
  id: string;
  name: string;
  category: string;
  category2: string;
  previewUrl: string | null;
  stickerCount: number;
  publishedAt: string | null;
  createdAt: string;
};

const arrowButton =
  "inline-flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 rounded-xl border border-slate-300 dark:border-white/20 bg-background text-muted-foreground hover:text-foreground hover:bg-slate-50 dark:hover:bg-white/5 transition-all active:scale-[0.95] cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed";

/**
 * Przycisk w nagłówku listy zestawów i okno, w którym właściciel układa
 * kolejność zestawów w sklepie. `sheets` przychodzą w kolejności, w jakiej
 * klient widzi je dziś.
 */
export function SheetOrderButton({ sheets }: { sheets: OrderableSheet[] }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        disabled={sheets.length < 2}
        title={
          sheets.length < 2
            ? "Do ułożenia kolejności potrzebne są co najmniej dwa opublikowane zestawy"
            : "Ustaw, w jakiej kolejności zestawy widzą klienci"
        }
        className="inline-flex items-center gap-2 rounded-xl text-sm font-bold h-11 px-5 border border-slate-300 dark:border-white/20 bg-background hover:bg-slate-50 dark:hover:bg-white/5 transition-all active:scale-[0.98] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <ArrowUpDown className="w-4 h-4" aria-hidden />
        Kolejność w sklepie
      </button>
      <AnimatePresence>
        {open && <SheetOrderDialog sheets={sheets} onClose={() => setOpen(false)} />}
      </AnimatePresence>
    </>
  );
}

function SheetOrderDialog({ sheets, onClose }: { sheets: OrderableSheet[]; onClose: () => void }) {
  const router = useRouter();
  const [items, setItems] = useState(sheets);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragId, setDragId] = useState<string | null>(null);
  const [overIndex, setOverIndex] = useState<number | null>(null);
  const arrows = useRef<Record<string, HTMLButtonElement | null>>({});

  const dirty = items.some((item, index) => item.id !== sheets[index]?.id);

  const move = (from: number, to: number, focus?: "up" | "down") => {
    setItems((current) => moveItem(current, from, to));
    if (focus) {
      const id = items[from].id;
      // Po przesunięciu element stoi w innym miejscu listy — oddajemy mu
      // fokus, żeby dało się klikać strzałką raz za razem z klawiatury.
      setTimeout(() => arrows.current[`${id}:${focus}`]?.focus(), 0);
    }
  };

  const drop = () => {
    const from = items.findIndex((item) => item.id === dragId);
    if (from >= 0 && overIndex !== null) move(from, overIndex);
    setDragId(null);
    setOverIndex(null);
  };

  const save = async () => {
    setError(null);
    setSaving(true);
    try {
      const result = await saveSheetsOrder(items.map((item) => item.id));
      if (!result.success) {
        setError(result.error);
        return;
      }
      router.refresh();
      onClose();
    } catch {
      setError("Nie udało się zapisać kolejności. Spróbuj jeszcze raz.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      title="Kolejność w sklepie"
      description="Tak zestawy ustawiają się w galerii w kreatorze, w katalogu i na stronach zestawów. Przeciągnij wiersz albo użyj strzałek — pierwszy zestaw klient zobaczy na początku."
      onClose={onClose}
      busy={saving}
      size="lg"
      footer={
        <>
          {error && (
            <p role="alert" className="mr-auto text-sm font-bold text-destructive">
              {error}
            </p>
          )}
          <button
            type="button"
            onClick={() => setItems((current) => [...current].sort(byNewest))}
            disabled={saving}
            title="Ustaw od ostatnio opublikowanego"
            className={`${secondaryButtonClass} ${error ? "" : "mr-auto"}`}
          >
            Od najnowszych
          </button>
          <button type="button" onClick={onClose} disabled={saving} className={secondaryButtonClass}>
            Anuluj
          </button>
          <button
            type="button"
            onClick={save}
            disabled={saving || !dirty}
            className={primaryButtonClass}
          >
            {saving && <Loader2 className="w-4 h-4 animate-spin" aria-hidden />}
            Zapisz kolejność
          </button>
        </>
      }
    >
      <ol className="flex flex-col gap-2">
        {items.map((item, index) => (
          <li
            key={item.id}
            draggable={!saving}
            onDragStart={(event) => {
              setDragId(item.id);
              event.dataTransfer.effectAllowed = "move";
              // Firefox nie rozpoczyna przeciągania bez ustawionych danych.
              event.dataTransfer.setData("text/plain", item.id);
            }}
            onDragOver={(event) => {
              if (!dragId) return;
              event.preventDefault();
              setOverIndex(index);
            }}
            onDrop={(event) => {
              event.preventDefault();
              drop();
            }}
            onDragEnd={() => {
              setDragId(null);
              setOverIndex(null);
            }}
            className={`flex items-center gap-2 sm:gap-3 rounded-2xl border bg-card p-2 sm:p-2.5 sm:pr-3 transition-colors ${
              dragId === item.id ? "opacity-40" : ""
            } ${
              dragId && overIndex === index && dragId !== item.id
                ? "border-primary ring-2 ring-primary/30"
                : "border-border/60"
            }`}
          >
            <span className="w-5 sm:w-6 shrink-0 text-center text-sm font-black text-primary tabular-nums">
              {index + 1}
            </span>
            <GripVertical
              className="hidden sm:block w-4 h-4 shrink-0 text-muted-foreground cursor-grab active:cursor-grabbing"
              aria-hidden
            />
            <div className="relative w-11 shrink-0 aspect-[210/297] rounded bg-white border border-border/40 overflow-hidden">
              {item.previewUrl && (
                // eslint-disable-next-line @next/next/no-img-element -- adres z tokenem Storage
                <img
                  src={item.previewUrl}
                  alt=""
                  loading="lazy"
                  draggable={false}
                  className="absolute inset-0 w-full h-full object-cover"
                />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-extrabold text-foreground leading-snug break-words">{item.name}</p>
              <p className="text-xs font-semibold text-muted-foreground mt-0.5">
                {[item.category, item.category2].filter(Boolean).join(" · ") || "bez tematu"} ·{" "}
                {item.stickerCount} {getStickersNoun(item.stickerCount)}
              </p>
            </div>
            <div className="flex shrink-0 gap-1">
              <button
                type="button"
                ref={(node) => {
                  arrows.current[`${item.id}:up`] = node;
                }}
                onClick={() => move(index, index - 1, "up")}
                disabled={saving || index === 0}
                aria-label={`Przesuń „${item.name}” wyżej`}
                className={arrowButton}
              >
                <ArrowUp className="w-4 h-4" aria-hidden />
              </button>
              <button
                type="button"
                ref={(node) => {
                  arrows.current[`${item.id}:down`] = node;
                }}
                onClick={() => move(index, index + 1, "down")}
                disabled={saving || index === items.length - 1}
                aria-label={`Przesuń „${item.name}” niżej`}
                className={arrowButton}
              >
                <ArrowDown className="w-4 h-4" aria-hidden />
              </button>
            </div>
          </li>
        ))}
      </ol>
      <p className="mt-4 text-xs font-semibold text-muted-foreground">
        Nowy zestaw po publikacji staje na początku — stąd możesz go przenieść na właściwe miejsce.
        Szkice nie biorą udziału w kolejności, dopóki ich nie opublikujesz.
      </p>
    </Modal>
  );
}
