import type { PlacedSticker } from "@/types/creator";

/** Katalog na układy arkuszy w Firebase Storage. */
export const LAYOUT_PREFIX = "layouts";

/** Ścieżka na układ świeżo dodany do koszyka, zanim powstanie zamówienie. */
export const CART_LAYOUT_PREFIX = `${LAYOUT_PREFIX}/carts`;

/** Górna granica na jeden arkusz. Realny układ waży kilkadziesiąt kilobajtów. */
export const MAX_LAYOUT_BYTES = 4 * 1024 * 1024;

function round(value: number, places: number): number {
  const factor = 10 ** places;
  return Math.round(value * factor) / factor;
}

/**
 * Przycina precyzję współrzędnych przed zapisem.
 *
 * Punkty konturu są ułamkami szerokości naklejki, więc w pełnej precyzji
 * zajmują po ~19 znaków każdy, a gęsty arkusz potrafi mieć ich kilkadziesiąt
 * tysięcy. Cztery miejsca po przecinku to przy arkuszu A4 dokładność rzędu
 * tysięcznych milimetra — daleko poniżej rozdzielczości druku i noża,
 * a plik kurczy się kilkukrotnie.
 */
export function compactSticker(sticker: PlacedSticker): PlacedSticker {
  return {
    ...sticker,
    x: round(sticker.x, 3),
    y: round(sticker.y, 3),
    widthCm: round(sticker.widthCm, 4),
    heightCm: round(sticker.heightCm, 4),
    aspectRatio: round(sticker.aspectRatio, 6),
    ...(sticker.rotation !== undefined ? { rotation: round(sticker.rotation, 2) } : {}),
    ...(sticker.contourPolygons
      ? {
          contourPolygons: sticker.contourPolygons.map((polygon) =>
            polygon.map((point) => ({ x: round(point.x, 4), y: round(point.y, 4) }))
          ),
        }
      : {}),
  };
}

export function serializeLayout(stickers: PlacedSticker[]): string {
  return JSON.stringify({
    version: 1,
    savedAt: new Date().toISOString(),
    stickers: stickers.map(compactSticker),
  });
}
