"use server";

import { getSession } from "@/lib/auth/dal";
import { getRawUserOrder } from "@/lib/orders/queries";
import { copyLayoutToCart, readItemLayout } from "@/lib/orders/layout";
import { consumeRateLimit } from "@/lib/auth/rateLimit";
import type { PlacedSticker } from "@/types/creator";

export type ReusableSheet = {
  imageUrl: string;
  cutLinesImageUrl?: string;
  widthCm: number;
  heightCm: number;
  stickersPerSheet: number;
  sheetQuantity: number;
  pricePerSheet: number;
  deliveryForm: "sheet" | "individual";
  stickers?: PlacedSticker[];
  /** Ścieżka do zapisanego układu — pozwala zachować edycję po ponownym zamówieniu. */
  layoutPath?: string;
};

type Result =
  | { success: true; sheet: ReusableSheet }
  | { success: false; error: string };

/**
 * Wyciąga jedną pozycję z historii zamówień razem z zapisanym układem naklejek,
 * żeby otworzyć ją w kreatorze jako nową pozycję koszyka.
 *
 * Właściciela zamówienia sprawdza `getRawUserOrder`, a nie strona wywołująca:
 * akcje serwerowe są dostępne pod własnym adresem, więc każda z nich musi
 * weryfikować uprawnienia samodzielnie.
 */
export async function loadSheetFromOrder(
  orderId: string,
  itemId: string,
  /**
   * Czy dociągnąć zapisany układ naklejek. Potrzebny wyłącznie do edycji
   * w kreatorze; samo powtórzenie zamówienia działa bez niego, także dla
   * zamówień sprzed wdrożenia zapisu układów.
   */
  withLayout = false
): Promise<Result> {
  const session = await getSession();
  if (!session) return { success: false, error: "Zaloguj się, żeby wrócić do tego arkusza." };
  if (!session.emailVerified) {
    return { success: false, error: "Potwierdź adres e-mail, żeby korzystać z historii zamówień." };
  }

  const limit = await consumeRateLimit(`sheet:${session.uid}`, 60, 10 * 60 * 1000);
  if (!limit.ok) {
    return { success: false, error: "Zbyt wiele żądań. Odczekaj chwilę." };
  }

  if (typeof orderId !== "string" || typeof itemId !== "string" || orderId.length > 128 || itemId.length > 128) {
    return { success: false, error: "Nieprawidłowe zamówienie." };
  }

  const order = await getRawUserOrder(orderId, session.uid);
  if (!order) return { success: false, error: "Nie znaleźliśmy tego zamówienia." };

  const item = (order.items ?? []).find(
    (candidate: Record<string, unknown>) => candidate.id === itemId
  );
  if (!item) return { success: false, error: "Nie znaleźliśmy tego arkusza w zamówieniu." };

  const sheet: ReusableSheet = {
    imageUrl: item.imageUrl,
    cutLinesImageUrl: item.cutLinesImageUrl ?? undefined,
    widthCm: item.widthCm,
    heightCm: item.heightCm,
    stickersPerSheet: item.stickersPerSheet,
    sheetQuantity: item.sheetQuantity ?? 1,
    pricePerSheet: item.pricePerSheet,
    deliveryForm: item.deliveryForm ?? "sheet",
  };

  // Układ dociągamy, jeśli istnieje. Jego brak nie jest błędem — arkusz i tak
  // wraca do koszyka i da się go zamówić ponownie w niezmienionej formie.
  // Bez układu odpada wyłącznie otwarcie go w kreatorze, co dotyczy zamówień
  // sprzed wdrożenia zapisu układów.
  if (withLayout && item.layoutPath) {
    const stickers = await readItemLayout(item.layoutPath);
    if (stickers) {
      sheet.stickers = stickers;
      // Do koszyka trafia kopia pod adresem wygenerowanym przez serwer,
      // nigdy ścieżka do układu zamówienia źródłowego.
      sheet.layoutPath = (await copyLayoutToCart(item.layoutPath)) ?? undefined;
    }
  }

  return { success: true, sheet };
}
