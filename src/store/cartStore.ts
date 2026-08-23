import { create } from 'zustand';
import { persist } from 'zustand/middleware';

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

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (item) => {
        const id = getUUID();
        set((state) => ({ items: [...state.items, { ...item, id }] }));
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
            i.id === id ? { ...item, id } : i
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
    }
  )
);
