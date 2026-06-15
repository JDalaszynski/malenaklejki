"use client";

import { useCartStore } from "@/store/cartStore";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import Link from "next/link";
import { Trash2, Plus, Minus, ArrowLeft, CreditCard, ShoppingBag, Truck } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getStickersNoun } from "@/lib/utils/polish";

export default function CartPage() {
  const { items, removeItem, updateQuantity, getTotalPrice } = useCartStore();
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="min-h-screen text-foreground flex items-center justify-center">
        <div className="animate-pulse font-extrabold text-xl text-primary">Ładowanie koszyka...</div>
      </div>
    );
  }

  const totalPrice = getTotalPrice();

  return (
    <div className="flex flex-col min-h-screen text-foreground bg-[#edf6f2] dark:bg-[#002c2e]">
      {/* Nagłówek w trybie ZEN (bez standardowej ikony koszyka) */}
      <Header zen={true} />

      <main className="flex-1 flex flex-col py-6 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto w-full justify-center">
        <div className="mb-8 text-center sm:text-left flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight text-foreground">
              Twój Koszyk
            </h1>
            <p className="text-muted-foreground mt-2 font-medium text-lg">
              Sprawdź swoje naklejki przed pakowaniem!
            </p>
          </div>
          <Link
            href="/"
            className="inline-flex items-center text-sm font-bold text-muted-foreground hover:text-primary transition-colors bg-muted/40 px-4 py-2 rounded-full border border-border/30 self-center sm:self-auto"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Dodaj kolejną naklejkę
          </Link>
        </div>

        {items.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16 bg-card border border-border/60 rounded-3xl p-8 shadow-sm flex flex-col items-center max-w-md mx-auto"
          >
            <div className="w-20 h-20 bg-muted/50 rounded-full flex items-center justify-center mb-6">
              <ShoppingBag className="w-10 h-10 text-muted-foreground" />
            </div>
            <h2 className="text-2xl font-extrabold mb-3 text-foreground">Koszyk jest jeszcze pusty</h2>
            <p className="text-muted-foreground mb-8 font-medium">
              Zaprojektuj odlotowe naklejki z własnym zdjęciem lub stwórz je za pomocą AI!
            </p>
            <Link
              href="/"
              className="w-full inline-flex items-center justify-center rounded-xl text-base font-bold bg-primary text-primary-foreground hover:bg-primary/95 active:scale-[0.98] h-14 px-8 shadow-sm transition-all"
            >
              Stwórz naklejkę!
            </Link>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            {/* Lista produktów */}
            <div className="lg:col-span-2 space-y-4">
              <AnimatePresence initial={false}>
                {items.map((item) => (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 p-5 bg-card border border-border/70 rounded-2xl shadow-sm hover:shadow-md transition-shadow relative"
                  >
                    {/* Lewa strona: Podgląd i Szczegóły */}
                    <Link href={`/?edit=${item.id}`} className="flex items-center gap-4 flex-1 hover:opacity-80 transition-opacity">
                      <div className="w-20 h-20 sm:w-24 sm:h-24 bg-muted/30 rounded-xl overflow-hidden flex-shrink-0 border border-border/40 p-2 flex items-center justify-center">
                        <img
                          src={item.imageUrl}
                          alt="Podgląd naklejki"
                          className="max-w-full max-h-full object-contain rounded-lg shadow-sm"
                        />
                      </div>

                      <div className="space-y-1">
                        <h3 className="font-extrabold text-base sm:text-lg text-foreground leading-snug">
                          Naklejki na Arkuszu A4
                        </h3>
                        <p className="font-semibold text-xs sm:text-sm text-muted-foreground">
                          Wymiary: {item.widthCm} × {item.heightCm.toFixed(1)} cm
                        </p>
                        <div className="pt-0.5 flex flex-wrap gap-2 items-center">
                          <span className="text-[11px] font-bold text-foreground bg-secondary/15 px-2.5 py-0.5 rounded-full inline-block">
                            {item.stickersPerSheet} {getStickersNoun(item.stickersPerSheet)} na arkuszu
                          </span>
                          {item.stickersPerSheet > 0 && (
                            <span className="text-[11px] font-semibold text-muted-foreground inline-block ml-1">
                              Tylko {(item.pricePerSheet / item.stickersPerSheet).toFixed(2)} zł za 1 naklejkę!
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] font-bold text-primary mt-1 underline">Edytuj arkusz</p>
                      </div>
                    </Link>

                    {/* Prawa strona: Ilość, cena i przycisk usuwania */}
                    <div className="flex items-center justify-between sm:justify-end gap-6 border-t sm:border-t-0 pt-4 sm:pt-0 w-full sm:w-auto">
                      {/* Kontrola ilości */}
                      <div className="flex items-center bg-muted/60 border border-border/40 rounded-xl p-1">
                        <button
                          onClick={() => {
                            if (item.sheetQuantity > 1) {
                              updateQuantity(item.id, item.sheetQuantity - 1);
                            }
                          }}
                          disabled={item.sheetQuantity <= 1}
                          className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-background disabled:opacity-30 disabled:pointer-events-none transition-colors"
                        >
                          <Minus className="w-4 h-4 text-foreground" />
                        </button>
                        <span className="w-10 text-center font-extrabold text-base">
                          {item.sheetQuantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, item.sheetQuantity + 1)}
                          className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-background transition-colors"
                        >
                          <Plus className="w-4 h-4 text-foreground" />
                        </button>
                      </div>

                      {/* Cena za zestaw */}
                      <div className="text-right min-w-[80px]">
                        <p className="font-black text-lg text-primary">
                          {(item.pricePerSheet * item.sheetQuantity).toFixed(2)} zł
                        </p>
                        <p className="text-[10px] text-muted-foreground font-semibold">
                          {item.pricePerSheet.toFixed(2)} zł / arkusz
                        </p>
                      </div>

                      {/* Przycisk usuwania */}
                      <button
                        onClick={() => removeItem(item.id)}
                        className="text-muted-foreground hover:text-destructive p-2 rounded-xl hover:bg-destructive/10 transition-colors"
                        title="Usuń z koszyka"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* Podsumowanie i przejściowe CTA */}
            <div className="space-y-4">
              <div className="bg-card border border-border/70 rounded-2xl p-6 shadow-[0_8px_30px_rgba(0,0,0,0.04)] space-y-6">
                <h3 className="font-extrabold text-xl text-foreground border-b border-border/40 pb-3">Podsumowanie</h3>

                <div className="space-y-3 font-semibold">
                  <div className="flex justify-between text-muted-foreground text-sm">
                    <span>Suma częściowa</span>
                    <span>{totalPrice.toFixed(2)} zł</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground text-sm">
                    <span className="flex items-center gap-1.5">
                      <Truck className="w-4 h-4 text-muted-foreground/75" />
                      Dostawa
                    </span>
                    <span>19.99 zł</span>
                  </div>
                  <div className="flex justify-between text-xl font-black text-primary border-t border-border/40 pt-4">
                    <span>Do zapłaty</span>
                    <span>{(totalPrice + 19.99).toFixed(2)} zł</span>
                  </div>
                </div>

                <div className="space-y-3 pt-2">
                  <Link
                    href="/checkout"
                    className="w-full inline-flex items-center justify-center rounded-xl text-base font-bold bg-primary text-primary-foreground hover:bg-primary/95 active:scale-[0.98] h-14 shadow-sm transition-all"
                  >
                    <CreditCard className="w-5 h-5 mr-2" />
                    Idź do kasy
                  </Link>

                  <Link
                    href="/"
                    className="w-full inline-flex items-center justify-center rounded-xl text-base font-bold bg-background text-foreground border border-border hover:bg-muted/30 active:scale-[0.98] h-14 shadow-none transition-all"
                  >
                    <ShoppingBag className="w-5 h-5 mr-2" />
                    Kontynuuj zakupy
                  </Link>
                </div>
              </div>

              {/* Informacja w trybie ZEN */}
              <div className="text-center space-y-3">
                <div className="inline-flex items-center gap-1.5 bg-secondary/10 text-foreground border border-secondary/20 px-4 py-2 rounded-2xl text-xs font-black">
                  <Truck className="w-3.5 h-3.5 text-secondary" />
                  Wysyłka w ciągu 3 dni roboczych
                </div>
                <p className="text-xs text-muted-foreground font-semibold">
                  Bezpieczne zakupy w MałeNaklejki. <br /> Gwarancja uśmiechu przy rozpakowywaniu!
                </p>
              </div>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
