interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

/**
 * Checks if two rectangles overlap with an optional padding (safety gap).
 */
export function checkOverlap(r1: Rect, r2: Rect, padding: number = 0): boolean {
  return (
    r1.x < r2.x + r2.w + padding &&
    r1.x + r1.w + padding > r2.x &&
    r1.y < r2.y + r2.h + padding &&
    r1.y + r1.h + padding > r2.y
  );
}

/**
 * Calculates the bounding box size of a rotated rectangle.
 */
export function getRotatedSize(w: number, h: number, rotationDegrees: number = 0): { w: number; h: number } {
  const rad = (rotationDegrees * Math.PI) / 180;
  const rotatedW = w * Math.abs(Math.cos(rad)) + h * Math.abs(Math.sin(rad));
  const rotatedH = w * Math.abs(Math.sin(rad)) + h * Math.abs(Math.cos(rad));
  return { w: rotatedW, h: rotatedH };
}

interface Point {
  x: number;
  y: number;
}

/**
 * Calculates the exact rotated bounding box margins for a sticker relative to its position (x, y)
 * taking into account its custom contour polygons if present.
 */
export function getContourMargins(
  wMm: number,
  hMm: number,
  rotationDegrees: number,
  contourPolygons?: Point[][]
): { left: number; right: number; top: number; bottom: number } {
  const rad = (rotationDegrees * Math.PI) / 180;
  const size = getRotatedSize(wMm, hMm, rotationDegrees);
  const defaultOffsetX = (size.w - wMm) / 2;
  const defaultOffsetY = (size.h - hMm) / 2;

  if (!contourPolygons || contourPolygons.length === 0) {
    return {
      left: defaultOffsetX,
      right: wMm + defaultOffsetX,
      top: defaultOffsetY,
      bottom: hMm + defaultOffsetY,
    };
  }

  const cx = wMm / 2;
  const cy = hMm / 2;
  const cos = Math.cos(rad);
  const sin = Math.sin(rad);

  let minRotX = Infinity;
  let maxRotX = -Infinity;
  let minRotY = Infinity;
  let maxRotY = -Infinity;

  contourPolygons.forEach((poly) => {
    poly.forEach((p) => {
      const px = p.x * wMm;
      const py = p.y * hMm;

      const rx = px - cx;
      const ry = py - cy;

      const rotX = rx * cos - ry * sin;
      const rotY = rx * sin + ry * cos;

      if (rotX < minRotX) minRotX = rotX;
      if (rotX > maxRotX) maxRotX = rotX;
      if (rotY < minRotY) minRotY = rotY;
      if (rotY > maxRotY) maxRotY = rotY;
    });
  });

  return {
    left: -cx - minRotX,
    right: cx + maxRotX,
    top: -cy - minRotY,
    bottom: cy + maxRotY,
  };
}

/**
 * Calculates the exact rotated margins of a sticker's cut line,
 * taking into account its dimensions, rotation, cutLineType, and contour polygons.
 * If overrideParams is provided, it uses those values instead of the sticker's current values.
 */
export function getCutLineMargins(
  st: {
    widthCm: number;
    heightCm: number;
    rotation?: number;
    cutLineType: "none" | "contour" | "rounded" | "circle" | "contour_inside" | "rounded_inside" | "circle_inside";
    contourPolygons?: { x: number; y: number }[][];
  },
  overrideParams?: {
    widthCm?: number;
    heightCm?: number;
    rotation?: number;
    cutLineType?: "none" | "contour" | "rounded" | "circle" | "contour_inside" | "rounded_inside" | "circle_inside";
    contourPolygons?: { x: number; y: number }[][];
  }
): { left: number; right: number; top: number; bottom: number } {
  const widthCm = overrideParams?.widthCm !== undefined ? overrideParams.widthCm : st.widthCm;
  const heightCm = overrideParams?.heightCm !== undefined ? overrideParams.heightCm : st.heightCm;
  const rotation = overrideParams?.rotation !== undefined ? overrideParams.rotation : (st.rotation || 0);
  const cutLineType = overrideParams?.cutLineType !== undefined ? overrideParams.cutLineType : st.cutLineType;
  const contourPolygons = overrideParams?.contourPolygons !== undefined ? overrideParams.contourPolygons : st.contourPolygons;

  const wMm = widthCm * 10;
  const hMm = heightCm * 10;

  if (
    cutLineType === "rounded" ||
    cutLineType === "circle" ||
    cutLineType === "rounded_inside" ||
    cutLineType === "circle_inside"
  ) {
    const baseOffset = Math.max(widthCm, heightCm) * 10 * (8 / 120);
    const offsetMm = (cutLineType === "rounded_inside" || cutLineType === "circle_inside") ? -2 : baseOffset;
    const cutW = wMm + 2 * offsetMm;
    const cutH = hMm + 2 * offsetMm;
    const size = getRotatedSize(cutW, cutH, rotation);
    return {
      left: size.w / 2 - wMm / 2,
      right: wMm / 2 + size.w / 2,
      top: size.h / 2 - hMm / 2,
      bottom: hMm / 2 + size.h / 2,
    };
  }

  return getContourMargins(
    wMm,
    hMm,
    rotation,
    (cutLineType === "contour" || cutLineType === "contour_inside") ? contourPolygons : undefined
  );
}

/**
 * Calculates the outer envelope margins of BOTH the sticker graphic and its cut line,
 * ensuring that neither the image boundary nor the cut line boundary exceeds safety margins.
 */
export function getOuterMargins(
  st: {
    widthCm: number;
    heightCm: number;
    rotation?: number;
    cutLineType: "none" | "contour" | "rounded" | "circle" | "contour_inside" | "rounded_inside" | "circle_inside";
    contourPolygons?: { x: number; y: number }[][];
  },
  overrideParams?: {
    widthCm?: number;
    heightCm?: number;
    rotation?: number;
    cutLineType?: "none" | "contour" | "rounded" | "circle" | "contour_inside" | "rounded_inside" | "circle_inside";
    contourPolygons?: { x: number; y: number }[][];
  }
): { left: number; right: number; top: number; bottom: number } {
  const widthCm = overrideParams?.widthCm !== undefined ? overrideParams.widthCm : st.widthCm;
  const heightCm = overrideParams?.heightCm !== undefined ? overrideParams.heightCm : st.heightCm;
  const rotation = overrideParams?.rotation !== undefined ? overrideParams.rotation : (st.rotation || 0);

  const wMm = widthCm * 10;
  const hMm = heightCm * 10;

  const graphicMargins = getContourMargins(wMm, hMm, rotation, undefined);
  const cutMargins = getCutLineMargins(st, overrideParams);

  return {
    left: Math.max(graphicMargins.left, cutMargins.left),
    right: Math.max(graphicMargins.right, cutMargins.right),
    top: Math.max(graphicMargins.top, cutMargins.top),
    bottom: Math.max(graphicMargins.bottom, cutMargins.bottom),
  };
}

/**
 * Calculates the exact rotated bounding box of a sticker's cut line,
 * taking into account its dimensions, rotation, cutLineType, and contour polygons.
 * If overrideParams is provided, it uses those values instead of the sticker's current values.
 */
export function getCutLineBoundingBox(
  st: {
    x: number;
    y: number;
    widthCm: number;
    heightCm: number;
    rotation?: number;
    cutLineType: "none" | "contour" | "rounded" | "circle" | "contour_inside" | "rounded_inside" | "circle_inside";
    contourPolygons?: { x: number; y: number }[][];
  },
  overrideParams?: {
    x?: number;
    y?: number;
    widthCm?: number;
    heightCm?: number;
    rotation?: number;
    cutLineType?: "none" | "contour" | "rounded" | "circle" | "contour_inside" | "rounded_inside" | "circle_inside";
    contourPolygons?: { x: number; y: number }[][];
  }
): Rect {
  const x = overrideParams?.x !== undefined ? overrideParams.x : st.x;
  const y = overrideParams?.y !== undefined ? overrideParams.y : st.y;

  const margins = getOuterMargins(st, overrideParams);

  return {
    x: x - margins.left,
    y: y - margins.top,
    w: margins.left + margins.right,
    h: margins.top + margins.bottom,
  };
}

export function getGraphicBoundingBox(
  st: {
    widthCm: number;
    heightCm: number;
    rotation?: number;
    x: number;
    y: number;
  },
  overrideParams?: {
    widthCm?: number;
    heightCm?: number;
    rotation?: number;
    x?: number;
    y?: number;
  }
): Rect {
  const x = overrideParams?.x !== undefined ? overrideParams.x : st.x;
  const y = overrideParams?.y !== undefined ? overrideParams.y : st.y;
  const widthCm = overrideParams?.widthCm !== undefined ? overrideParams.widthCm : st.widthCm;
  const heightCm = overrideParams?.heightCm !== undefined ? overrideParams.heightCm : st.heightCm;
  const rotation = overrideParams?.rotation !== undefined ? overrideParams.rotation : (st.rotation || 0);

  const wMm = widthCm * 10;
  const hMm = heightCm * 10;
  const margins = getContourMargins(wMm, hMm, rotation, undefined);

  return {
    x: x - margins.left,
    y: y - margins.top,
    w: margins.left + margins.right,
    h: margins.top + margins.bottom,
  };
}

export function getOnlyCutLineBoundingBox(
  st: {
    widthCm: number;
    heightCm: number;
    rotation?: number;
    x: number;
    y: number;
    cutLineType: "none" | "contour" | "rounded" | "circle" | "contour_inside" | "rounded_inside" | "circle_inside";
    contourPolygons?: { x: number; y: number }[][];
  },
  overrideParams?: {
    widthCm?: number;
    heightCm?: number;
    rotation?: number;
    x?: number;
    y?: number;
    cutLineType?: "none" | "contour" | "rounded" | "circle" | "contour_inside" | "rounded_inside" | "circle_inside";
    contourPolygons?: { x: number; y: number }[][];
  }
): Rect {
  const x = overrideParams?.x !== undefined ? overrideParams.x : st.x;
  const y = overrideParams?.y !== undefined ? overrideParams.y : st.y;

  const margins = getCutLineMargins(st, overrideParams);

  return {
    x: x - margins.left,
    y: y - margins.top,
    w: margins.left + margins.right,
    h: margins.top + margins.bottom,
  };
}

export function checkStickersCollision(
  s1: {
    widthCm: number;
    heightCm: number;
    rotation?: number;
    x: number;
    y: number;
    cutLineType: "none" | "contour" | "rounded" | "circle" | "contour_inside" | "rounded_inside" | "circle_inside";
    contourPolygons?: { x: number; y: number }[][];
  },
  s2: {
    widthCm: number;
    heightCm: number;
    rotation?: number;
    x: number;
    y: number;
    cutLineType: "none" | "contour" | "rounded" | "circle" | "contour_inside" | "rounded_inside" | "circle_inside";
    contourPolygons?: { x: number; y: number }[][];
  },
  overrideParams1?: {
    widthCm?: number;
    heightCm?: number;
    rotation?: number;
    x?: number;
    y?: number;
    cutLineType?: "none" | "contour" | "rounded" | "circle" | "contour_inside" | "rounded_inside" | "circle_inside";
    contourPolygons?: { x: number; y: number }[][];
  }
): boolean {
  // 1. Graphics must not overlap (0 padding)
  const g1 = getGraphicBoundingBox(s1, overrideParams1);
  const g2 = getGraphicBoundingBox(s2);
  if (checkOverlap(g1, g2, 0)) {
    return true;
  }

  // 2. Cut lines must not overlap and need safety spacing (1.0mm padding)
  const c1 = getOnlyCutLineBoundingBox(s1, overrideParams1);
  const c2 = getOnlyCutLineBoundingBox(s2);
  const cutLinePadding = (
    (overrideParams1?.cutLineType ?? s1.cutLineType) === "none" &&
    s2.cutLineType === "none"
  ) ? 0.0 : 1.0;
  if (checkOverlap(c1, c2, cutLinePadding)) {
    return true;
  }

  return false;
}



