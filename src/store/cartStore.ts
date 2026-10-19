import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { SHEET_PRICE, type ReadySheetOrigin } from "@/lib/sheets/types";
import { getUUID } from "@/lib/uuid";

export interface CartItem {
  id: string; // Unique ID for the cart item
  imageUrl: string; // Firebase Storage URL - print version (color)
  cutLinesImageUrl?: string; // Firebase Storage URL - cut-lines version (black shapes on white)
  widthCm: number;
  heightCm: number;
  stickersPerSheet: number;
  sheetQuantity: number;
  pricePerSheet: number;
  stickers?: any[]; // Store the exact sticker layout for editing
  /** Ścieżka do układu arkusza w Storage — pozwala wrócić do niego z historii zamówień. */
  layoutPath?: string;
  deliveryForm?: "sheet" | "individual";
  /** Gotowy zestaw, z którego powstała pozycja, i to, czy klient go zmienił. */
  readySheet?: ReadySheetOrigin;
}

interface CartState {
  items: CartItem[];
  /** Zwraca identyfikator dodanej pozycji — potrzebny, żeby od razu otworzyć ją w kreatorze. */
  addItem: (item: Omit<CartItem, 'id'>) => string;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, newQuantity: number) => void;
  updateItem: (id: string, item: Omit<CartItem, 'id'>) => void;
  clearCart: () => void;
  getTotalPrice: () => number;
}

/**
 * Pozycja zawsze z bieżącą ceną arkusza. Koszyk potrafi leżeć w localStorage
 * tygodniami, a „zamów ponownie" wkłada pozycję z ceną ze starego zamówienia —
 * bez tego klient widziałby inną kwotę niż ta, którą policzy serwer
 * (`createOrder` i tak liczy z `SHEET_PRICE`).
 */
function withCurrentPrice<T extends { pricePerSheet: number }>(item: T): T {
  return { ...item, pricePerSheet: SHEET_PRICE };
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (item) => {
        const id = getUUID();
        set((state) => ({ items: [...state.items, { ...withCurrentPrice(item), id }] }));
        return id;
      },
      removeItem: (id) =>
        set((state) => ({ items: state.items.filter((i) => i.id !== id) })),
      updateQuantity: (id, newQuantity) =>
        set((state) => ({
          items: state.items.map((i) =>
            i.id === id ? { ...i, sheetQuantity: newQuantity } : i
          ),
        })),
      updateItem: (id, item) =>
        set((state) => ({
          items: state.items.map((i) =>
            i.id === id ? { ...withCurrentPrice(item), id } : i
          ),
        })),
      clearCart: () => set({ items: [] }),
      getTotalPrice: () => {
        const { items } = get();
        return items.reduce(
          (total, item) => total + item.pricePerSheet * item.sheetQuantity,
          0
        );
      },
    }),
    {
      name: 'malenaklejki-cart',
      merge: (persisted, current) => {
        const stored = (persisted ?? {}) as Partial<CartState>;
        return {
          ...current,
          ...stored,
          items: (stored.items ?? []).map(withCurrentPrice),
        };
      },
    }
  )
);
