import "server-only";

import { getBucket } from "@/lib/firebase/admin";
import type { PlacedSticker } from "@/types/creator";
import { randomUUID } from "node:crypto";

import { CART_LAYOUT_PREFIX, LAYOUT_PREFIX } from "./layoutFormat";

/**
 * Układ arkusza (pozycje naklejek i wielokąty konturów cięcia) trafia do
 * Firebase Storage, a nie do dokumentu zamówienia, z dwóch powodów:
 *
 *  1. Firestore nie obsługuje tablic w tablicach, a `contourPolygons` to
 *     dokładnie taka struktura — dlatego do niedawna pole `stickers` było
 *     po prostu wyrzucane przed zapisem.
 *  2. Dokument Firestore ma twardy limit 1 MB. Gęsto wypełniony arkusz
 *     z konturami potrafi go przekroczyć.
 *
 * Plik wysyła przeglądarka w chwili dodania arkusza do koszyka — razem
 * z dwoma obrazami PNG, które i tak tam wtedy lecą. Dzięki temu układ nie
 * przechodzi przez treść zamówienia, która ma własny limit rozmiaru
 * i z tego powodu jest czyszczona z `stickers` w formularzu zamówienia.
 */

/**
 * Robi kopię zapisanego układu na potrzeby koszyka i zwraca jej ścieżkę.
 *
 * Używane przy ponownym zamawianiu arkusza z historii. Koszyk mieszka
 * w przeglądarce, więc ścieżka w nim zapisana wraca potem do serwera jako dane
 * od klienta — gdybyśmy przepuszczali ją bez zmian, wystarczyłoby podmienić ją
 * w `localStorage` na cudzą, żeby przy następnym zamówieniu wciągnąć do siebie
 * czyjś projekt. Dlatego oryginał zostaje nietknięty, a do koszyka trafia
 * wyłącznie świeża kopia pod adresem, który wygenerował serwer po sprawdzeniu,
 * że zamówienie źródłowe należy do tej osoby.
 */
export async function copyLayoutToCart(sourcePath: string): Promise<string | null> {
  if (typeof sourcePath !== "string" || !sourcePath.startsWith(`${LAYOUT_PREFIX}/`)) {
    return null;
  }

  const target = `${CART_LAYOUT_PREFIX}/${randomUUID()}.json`;
  try {
    const bucket = getBucket();
    await bucket.file(sourcePath).copy(bucket.file(target));
    return target;
  } catch (error) {
    console.error("copyLayoutToCart error:", error);
    return null;
  }
}

/** Przenosi układ z katalogu koszyka pod zamówienie. */
export async function attachCartLayout(
  cartPath: string,
  orderId: string,
  itemId: string
): Promise<string | null> {
  if (typeof cartPath !== "string" || !cartPath.startsWith(`${CART_LAYOUT_PREFIX}/`)) {
    return null;
  }

  const safeItemId = itemId.replace(/[^a-zA-Z0-9_-]/g, "") || "pozycja";
  const target = `${LAYOUT_PREFIX}/${orderId}/${safeItemId}.json`;

  try {
    const bucket = getBucket();
    await bucket.file(cartPath).copy(bucket.file(target));
    // Kopia z koszyka nie jest już potrzebna; jej brak nie jest błędem.
    await bucket.file(cartPath).delete().catch(() => undefined);
    return target;
  } catch (error) {
    console.error("attachCartLayout error:", error);
    return null;
  }
}

/** Odczytuje zapisany układ. Wywoływane wyłącznie po sprawdzeniu właściciela zamówienia. */
export async function readItemLayout(path: string): Promise<PlacedSticker[] | null> {
  if (typeof path !== "string" || !path.startsWith(`${LAYOUT_PREFIX}/`)) {
    console.error("readItemLayout: odrzucono ścieżkę spoza katalogu układów:", path);
    return null;
  }

  try {
    const [buffer] = await getBucket().file(path).download();
    const parsed = JSON.parse(buffer.toString("utf8"));
    if (!Array.isArray(parsed?.stickers)) return null;
    return parsed.stickers as PlacedSticker[];
  } catch (error) {
    console.error("readItemLayout error:", error);
    return null;
  }
}

/** Usuwa układy zamówienia — używane przy trwałym usunięciu z kosza. */
export async function deleteOrderLayouts(orderId: string): Promise<void> {
  try {
    await getBucket().deleteFiles({ prefix: `${LAYOUT_PREFIX}/${orderId}/` });
  } catch (error) {
    console.error("deleteOrderLayouts error:", error);
  }
}
