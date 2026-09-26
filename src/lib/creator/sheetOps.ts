import type { PlacedSticker } from "@/types/creator";
import {
  checkStickersCollision,
  clampToUsableArea,
  getGraphicWidthFromDisplayed,
  getMaxDisplayedWidthCm,
  getMaxGraphicWidthCm,
  getOuterMargins,
  isStickerOutsideUsableArea,
} from "@/lib/utils/collision";

/**
 * Operacje na układzie arkusza A4 — te same reguły, które pilnują kreatora
 * na stronie głównej (`HomePageClient`): margines bezpieczeństwa 11 mm,
 * wcięcia 6 × 6 mm w narożnikach, wyszukiwanie wolnego miejsca siatką 5 mm,
 * dopasowanie rozmiaru i obrotu do pola arkusza.
 *
 * Czyste funkcje bez Reacta i bez DOM-u, więc serwer może nimi sprawdzić
 * arkusz przed publikacją — przeglądarka jest tu tylko pierwszą linią.
 */

type Margins = { left: number; right: number; top: number; bottom: number };

const MARGIN_MM = 11;
const SHEET_WIDTH_MM = 210;
const SHEET_HEIGHT_MM = 297;
const CORNER_LIMIT = 17;
const RIGHT_CORNER_LIMIT = 193;
const BOTTOM_CORNER_LIMIT = 280;

/** Czy obrys o tych marginesach, postawiony w (x, y), leży w polu arkusza i omija narożniki. */
export function fitsUsableArea(x: number, y: number, margins: Margins): boolean {
  const leftBound = x - margins.left;
  const rightBound = x + margins.right;
  const topBound = y - margins.top;
  const bottomBound = y + margins.bottom;

  const overlapsCorner =
    (leftBound < CORNER_LIMIT && topBound < CORNER_LIMIT) ||
    (rightBound > RIGHT_CORNER_LIMIT && topBound < CORNER_LIMIT) ||
    (leftBound < CORNER_LIMIT && bottomBound > BOTTOM_CORNER_LIMIT) ||
    (rightBound > RIGHT_CORNER_LIMIT && bottomBound > BOTTOM_CORNER_LIMIT);

  return (
    x >= MARGIN_MM + margins.left &&
    x <= SHEET_WIDTH_MM - MARGIN_MM - margins.right &&
    y >= MARGIN_MM + margins.top &&
    y <= SHEET_HEIGHT_MM - MARGIN_MM - margins.bottom &&
    !overlapsCorner
  );
}

/** Dosuwa pozycję do pola arkusza; `null`, gdy obrys nie mieści się nigdzie w pobliżu. */
export function placeWithinSheet(
  x: number,
  y: number,
  margins: Margins
): { x: number; y: number } | null {
  const clamped = clampToUsableArea(x, y, margins);
  return fitsUsableArea(clamped.x, clamped.y, margins) ? clamped : null;
}

/** Pierwsze wolne miejsce na arkuszu — siatka 5 mm od lewego górnego rogu. */
export function findFreePosition(
  wMm: number,
  hMm: number,
  rotation: number,
  existing: PlacedSticker[],
  cutLineType: PlacedSticker["cutLineType"] = "none",
  contourPolygons?: { x: number; y: number }[][]
): { x: number; y: number } | null {
  const step = 5;

  const margins = getOuterMargins({
    widthCm: wMm / 10,
    heightCm: hMm / 10,
    rotation,
    cutLineType,
    contourPolygons,
  });

  const startX = MARGIN_MM + margins.left;
  const endX = SHEET_WIDTH_MM - MARGIN_MM - margins.right;
  const startY = MARGIN_MM + margins.top;
  const endY = SHEET_HEIGHT_MM - MARGIN_MM - margins.bottom;

  for (let candidateY = startY; candidateY <= endY; candidateY += step) {
    for (let candidateX = startX; candidateX <= endX; candidateX += step) {
      const clamped = clampToUsableArea(candidateX, candidateY, margins);
      if (Math.abs(clamped.x - candidateX) > 0.01 || Math.abs(clamped.y - candidateY) > 0.01) {
        continue; // narożnik albo margines
      }

      const candidate = {
        x: candidateX,
        y: candidateY,
        widthCm: wMm / 10,
        heightCm: hMm / 10,
        rotation,
        cutLineType,
        contourPolygons,
      };

      if (!existing.some((st) => checkStickersCollision(candidate, st))) {
        return { x: candidateX, y: candidateY };
      }
    }
  }
  return null;
}

/**
 * Największa szerokość grafiki (cm, w dół do 0,1), z jaką naklejka o tych
 * proporcjach i tej linii cięcia zmieści się na arkuszu bez obrotu.
 * Dla konturu bez policzonego obrysu liczymy zapas jak dla prostokąta —
 * z obrysem wyjdzie najwyżej trochę więcej miejsca.
 */
export function maxPlacementWidthCm(
  aspectRatio: number,
  cutLineType: PlacedSticker["cutLineType"] = "none"
): number {
  const max = getMaxGraphicWidthCm({
    widthCm: 5,
    heightCm: 5 / aspectRatio,
    aspectRatio,
    cutLineType,
  });
  return Math.floor(max * 10 + 1e-6) / 10;
}

/**
 * Pozycja dla nowej naklejki: wolne miejsce albo — gdy arkusz jest pełny —
 * środek arkusza. Kreator robi tak samo: naklejka ląduje na wierzchu,
 * podświetlona na czerwono, a układ poprawia się ręcznie.
 */
export function positionForNewSticker(
  widthCm: number,
  heightCm: number,
  existing: PlacedSticker[],
  cutLineType: PlacedSticker["cutLineType"] = "none",
  contourPolygons?: { x: number; y: number }[][]
): { x: number; y: number; fits: boolean } {
  const wMm = widthCm * 10;
  const hMm = heightCm * 10;
  const pos = findFreePosition(wMm, hMm, 0, existing, cutLineType, contourPolygons);
  if (pos) return { ...pos, fits: true };

  const margins = getOuterMargins({ widthCm, heightCm, cutLineType, contourPolygons });
  const centered = clampToUsableArea(105 - wMm / 2, 148.5 - hMm / 2, margins);
  return { ...centered, fits: false };
}

/**
 * Nowa szerokość naklejki (liczona po linii cięcia, jak suwak w kreatorze).
 * Gdy docelowa się nie mieści, szuka największej, która wchodzi. Wymiary są
 * zaokrąglane do 0,1 cm przed sprawdzeniem, bo takie się zapisuje.
 */
export function fitStickerWidth(
  sticker: PlacedSticker,
  displayedWidthCm: number
): { x: number; y: number; widthCm: number; heightCm: number } | null {
  const clampedDisplayed = Math.max(1, Math.min(getMaxDisplayedWidthCm(sticker), displayedWidthCm));
  const targetGraphicWidth = Math.min(
    getGraphicWidthFromDisplayed(sticker, clampedDisplayed),
    getMaxGraphicWidthCm(sticker)
  );
  const aspect = sticker.aspectRatio;

  const testFits = (rawWidthCm: number) => {
    const w = Math.round(rawWidthCm * 10) / 10;
    const h = Math.round((w / aspect) * 10) / 10;
    const margins = getOuterMargins(sticker, { widthCm: w, heightCm: h });
    const pos = placeWithinSheet(sticker.x, sticker.y, margins);
    return pos ? { ...pos, w, h } : null;
  };

  let fit = testFits(targetGraphicWidth);
  if (!fit) {
    let low = sticker.widthCm;
    let high = targetGraphicWidth;
    if (high < low) {
      fit = testFits(high);
    } else {
      for (let i = 0; i < 8; i++) {
        const mid = (low + high) / 2;
        const midFit = testFits(mid);
        if (midFit) {
          fit = midFit;
          low = mid;
        } else {
          high = mid;
        }
      }
    }
  }

  if (!fit) return null;
  return {
    x: fit.x,
    y: fit.y,
    widthCm: Math.round(fit.w * 10) / 10,
    heightCm: Math.round(fit.h * 10) / 10,
  };
}

/** Pozycja po zmianie obrotu, linii cięcia albo obrysu — `null`, gdy się nie mieści. */
export function fitStickerChange(
  sticker: PlacedSticker,
  change: {
    rotation?: number;
    cutLineType?: PlacedSticker["cutLineType"];
    contourPolygons?: { x: number; y: number }[][];
  }
): { x: number; y: number } | null {
  const margins = getOuterMargins(sticker, change);
  return placeWithinSheet(sticker.x, sticker.y, margins);
}

/**
 * Rozmiar i pozycja po podmianie grafiki (kadrowanie, usunięcie tła).
 * Najpierw próbuje zachować szerokość, potem zmniejsza, a w ostateczności
 * stawia 1,5-centymetrową naklejkę w wolnym miejscu — jak kreator.
 */
export function fitReplacedImage(
  sticker: PlacedSticker,
  aspect: number,
  others: PlacedSticker[]
): { x: number; y: number; widthCm: number; heightCm: number } {
  const testFits = (w: number) => {
    const h = w / aspect;
    const margins = getOuterMargins(sticker, { widthCm: w, heightCm: h });
    const pos = placeWithinSheet(sticker.x, sticker.y, margins);
    return pos ? { ...pos, w, h } : null;
  };

  let fit = testFits(sticker.widthCm);
  if (!fit) {
    for (let w = sticker.widthCm; w >= 1.5; w -= 0.1) {
      fit = testFits(w);
      if (fit) break;
    }
  }

  if (fit) {
    return {
      x: fit.x,
      y: fit.y,
      widthCm: Math.round(fit.w * 10) / 10,
      heightCm: Math.round(fit.h * 10) / 10,
    };
  }

  const freePos =
    findFreePosition(15, 15 / aspect, sticker.rotation || 0, others) ?? {
      x: sticker.x,
      y: sticker.y,
    };
  return {
    ...freePos,
    widthCm: 1.5,
    heightCm: Math.round((1.5 / aspect) * 10) / 10,
  };
}

/** Kopie naklejki w każdym wolnym miejscu arkusza („Wypełnij arkusz"). */
export function fillSheetWith(
  sticker: PlacedSticker,
  stickers: PlacedSticker[],
  newId: () => string,
  limit = 300
): PlacedSticker[] {
  const result = [...stickers];
  const wMm = sticker.widthCm * 10;
  const hMm = sticker.heightCm * 10;

  while (result.length <= limit) {
    const pos = findFreePosition(
      wMm,
      hMm,
      sticker.rotation || 0,
      result,
      sticker.cutLineType,
      sticker.contourPolygons
    );
    if (!pos) break;
    result.push({ ...sticker, id: newId(), x: pos.x, y: pos.y });
  }

  return result;
}

/** Przesunięcie naklejki (strzałki na klawiaturze) — zawsze w polu arkusza. */
export function nudgeSticker(
  sticker: PlacedSticker,
  dxMm: number,
  dyMm: number
): { x: number; y: number } {
  return clampToUsableArea(sticker.x + dxMm, sticker.y + dyMm, getOuterMargins(sticker));
}

export type SheetIssues = {
  /** Naklejki bez wybranej linii cięcia — nie da się ich wyciąć. */
  noCutLine: string[];
  /** Linia cięcia albo druk wychodzi za margines bezpieczeństwa. */
  outside: string[];
  /** Linie cięcia nachodzą na siebie albo stoją bliżej niż 0,5 mm. */
  overlapping: string[];
};

export function getSheetIssues(stickers: PlacedSticker[]): SheetIssues {
  const outside = stickers.filter((st) => isStickerOutsideUsableArea(st)).map((st) => st.id);

  const overlapping = new Set<string>();
  for (let i = 0; i < stickers.length; i++) {
    for (let j = i + 1; j < stickers.length; j++) {
      if (checkStickersCollision(stickers[i], stickers[j])) {
        overlapping.add(stickers[i].id);
        overlapping.add(stickers[j].id);
      }
    }
  }

  return {
    noCutLine: stickers.filter((st) => st.cutLineType === "none").map((st) => st.id),
    outside,
    overlapping: [...overlapping],
  };
}

/** Naklejki do podświetlenia na czerwono w trakcie pracy (bez braku linii cięcia — ta ma własny znacznik). */
export function findInvalidStickerIds(stickers: PlacedSticker[]): string[] {
  const issues = getSheetIssues(stickers);
  return [...new Set([...issues.outside, ...issues.overlapping])];
}

function isPaucal(count: number): boolean {
  const mod10 = count % 10;
  const mod100 = count % 100;
  return mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20);
}

function stickersCount(count: number): string {
  if (count === 1) return "1 naklejka";
  return isPaucal(count) ? `${count} naklejki` : `${count} naklejek`;
}

/** Powody, dla których arkusza nie da się opublikować. Pusta lista — można. */
export function describePublishBlockers(stickers: PlacedSticker[]): string[] {
  if (stickers.length === 0) return ["Arkusz jest pusty — dodaj przynajmniej jedną naklejkę."];

  const issues = getSheetIssues(stickers);
  const messages: string[] = [];
  if (issues.noCutLine.length > 0) {
    messages.push(`${stickersCount(issues.noCutLine.length)} bez linii cięcia.`);
  }
  if (issues.outside.length > 0) {
    messages.push(`${stickersCount(issues.outside.length)} poza marginesem bezpieczeństwa.`);
  }
  if (issues.overlapping.length > 0) {
    const count = issues.overlapping.length;
    messages.push(`${stickersCount(count)} ${isPaucal(count) ? "nachodzą" : "nachodzi"} na inne.`);
  }
  return messages;
}
