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
 * Calculates the dynamic cut line margin/offset in mm.
 * - For inside cutlines: fixed at -0.5mm.
 * - For contour: 1.5mm * sqrt(widthCm), clamped to 1.5mm - 7.0mm.
 *   The square root keeps the border visually proportionate at every size: a flat
 *   cap would read as a hairline on a large sticker (3mm is 15% of a 4cm sticker
 *   but only 1.7% of an 18cm one), while a straight percentage would leave a small
 *   sticker with no border at all. The curve passes exactly through the previous
 *   anchor points (1.0cm -> 1.5mm, 4.0cm -> 3.0mm), so small stickers are unchanged
 *   and only the plateau above 4.0cm is lifted (18.1cm: 3.0mm -> 6.4mm).
 * - For rounded / circle: the same square root law at 2/3 of the contour margin,
 *   1.0mm * sqrt(widthCm) clamped to 1.0mm - 5.0mm. It likewise passes exactly
 *   through the previous anchor points (1.0cm -> 1.0mm, 4.0cm -> 2.0mm).
 */
export function getCutLineOffsetMm(
  cutLineType: "none" | "contour" | "rounded" | "circle" | "contour_inside" | "rounded_inside" | "circle_inside" | string,
  widthCm: number
): number {
  if (
    cutLineType === "rounded_inside" ||
    cutLineType === "circle_inside" ||
    cutLineType === "contour_inside"
  ) {
    return -0.5;
  }

  if (cutLineType === "contour") {
    if (!(widthCm > 0)) return 1.5;
    return Math.min(7.0, Math.max(1.5, 1.5 * Math.sqrt(widthCm)));
  }

  if (
    cutLineType === "rounded" ||
    cutLineType === "circle"
  ) {
    if (!(widthCm > 0)) return 1.0;
    return Math.min(5.0, Math.max(1.0, Math.sqrt(widthCm)));
  }

  return 0;
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
    const isInside = cutLineType === "rounded_inside" || cutLineType === "circle_inside";
    const offsetMm = isInside ? -0.5 : getCutLineOffsetMm(cutLineType, widthCm);
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

  if (cutLineType === "contour") {
    const graphicMargins = getContourMargins(wMm, hMm, rotation, undefined);
    const offsetMm = getCutLineOffsetMm("contour", widthCm);
    return {
      left: graphicMargins.left + offsetMm,
      right: graphicMargins.right + offsetMm,
      top: graphicMargins.top + offsetMm,
      bottom: graphicMargins.bottom + offsetMm,
    };
  }

  if (cutLineType === "contour_inside") {
    // For inside contour, it stays within the graphic bounds
    return getContourMargins(wMm, hMm, rotation, undefined);
  }

  return { left: 0, right: wMm, top: 0, bottom: hMm };
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
  // Cut lines must not overlap and need safety spacing (0.5mm padding)
  const c1 = getOnlyCutLineBoundingBox(s1, overrideParams1);
  const c2 = getOnlyCutLineBoundingBox(s2);
  const cutLinePadding = 0.5;
  
  // Fast path: if AABBs don't overlap, the shapes definitely don't
  if (!checkOverlap(c1, c2, cutLinePadding)) {
    return false;
  }

  // Precise polygon collision check
  const polys1 = getAbsolutePolygons(s1, overrideParams1);
  const polys2 = getAbsolutePolygons(s2);
  
  return checkPolygonsDistance(polys1, polys2, cutLinePadding);
}

// --- Precise Collision Helpers ---

export function getAbsolutePolygons(
  st: {
    x: number;
    y: number;
    widthCm: number;
    heightCm: number;
    rotation?: number;
    cutLineType: string;
    contourPolygons?: { x: number; y: number }[][];
  },
  overrideParams?: any
): Point[][] {
  const x = overrideParams?.x !== undefined ? overrideParams.x : st.x;
  const y = overrideParams?.y !== undefined ? overrideParams.y : st.y;
  const widthCm = overrideParams?.widthCm !== undefined ? overrideParams.widthCm : st.widthCm;
  const heightCm = overrideParams?.heightCm !== undefined ? overrideParams.heightCm : st.heightCm;
  const rotation = overrideParams?.rotation !== undefined ? overrideParams.rotation : (st.rotation || 0);
  const cutLineType = overrideParams?.cutLineType !== undefined ? overrideParams.cutLineType : st.cutLineType;
  const contourPolygons = overrideParams?.contourPolygons !== undefined ? overrideParams.contourPolygons : st.contourPolygons;

  const wMm = widthCm * 10;
  const hMm = heightCm * 10;
  const rad = (rotation * Math.PI) / 180;
  const cos = Math.cos(rad);
  const sin = Math.sin(rad);
  const cx = wMm / 2;
  const cy = hMm / 2;
  const centerX = x + cx;
  const centerY = y + cy;

  if ((cutLineType === "contour" || cutLineType === "contour_inside") && contourPolygons && contourPolygons.length > 0) {
    return contourPolygons.map((poly: { x: number; y: number }[]) => {
      return poly.map((p: { x: number; y: number }) => {
        const px = p.x * wMm;
        const py = p.y * hMm;
        const rx = px - cx;
        const ry = py - cy;
        const rotX = rx * cos - ry * sin;
        const rotY = rx * sin + ry * cos;
        return { x: centerX + rotX, y: centerY + rotY };
      });
    });
  }

  if (cutLineType === "circle" || cutLineType === "circle_inside") {
    const offsetMm = cutLineType === "circle_inside" ? -0.5 : getCutLineOffsetMm("circle", widthCm);
    const radX = (wMm + 2 * offsetMm) / 2;
    const radY = (hMm + 2 * offsetMm) / 2;
    const circlePoints: Point[] = [];
    const segments = 16;
    for (let i = 0; i < segments; i++) {
      const angle = (i * 2 * Math.PI) / segments;
      const rx = Math.cos(angle) * radX;
      const ry = Math.sin(angle) * radY;
      const rotX = rx * cos - ry * sin;
      const rotY = rx * sin + ry * cos;
      circlePoints.push({ x: centerX + rotX, y: centerY + rotY });
    }
    return [circlePoints];
  }

  // Fallback for non-contour / rounded: generate rotated rectangle polygon
  let cutW = wMm;
  let cutH = hMm;
  if (
    cutLineType === "rounded" ||
    cutLineType === "rounded_inside"
  ) {
    const offsetMm = cutLineType === "rounded_inside" ? -0.5 : getCutLineOffsetMm("rounded", widthCm);
    cutW = wMm + 2 * offsetMm;
    cutH = hMm + 2 * offsetMm;
  }
  
  const rectCx = cutW / 2;
  const rectCy = cutH / 2;
  const corners = [
    { x: -rectCx, y: -rectCy },
    { x: rectCx, y: -rectCy },
    { x: rectCx, y: rectCy },
    { x: -rectCx, y: rectCy }
  ];
  
  const poly = corners.map(c => {
    const rx = c.x;
    const ry = c.y;
    const rotX = rx * cos - ry * sin;
    const rotY = rx * sin + ry * cos;
    return { x: centerX + rotX, y: centerY + rotY };
  });

  return [poly];
}

export function distSquared(v: Point, w: Point): number {
  return (v.x - w.x) ** 2 + (v.y - w.y) ** 2;
}

export function distToSegmentSquared(p: Point, v: Point, w: Point): number {
  const l2 = distSquared(v, w);
  if (l2 === 0) return distSquared(p, v);
  let t = ((p.x - v.x) * (w.x - v.x) + (p.y - v.y) * (w.y - v.y)) / l2;
  t = Math.max(0, Math.min(1, t));
  return distSquared(p, { x: v.x + t * (w.x - v.x), y: v.y + t * (w.y - v.y) });
}

export function ccw(A: Point, B: Point, C: Point): boolean {
  return (C.y - A.y) * (B.x - A.x) > (B.y - A.y) * (C.x - A.x);
}

export function segmentsIntersect(A: Point, B: Point, C: Point, D: Point): boolean {
  return ccw(A, C, D) !== ccw(B, C, D) && ccw(A, B, C) !== ccw(A, B, D);
}

export function pointInPolygon(point: Point, vs: Point[]): boolean {
  let x = point.x, y = point.y;
  let inside = false;
  for (let i = 0, j = vs.length - 1; i < vs.length; j = i++) {
    let xi = vs[i].x, yi = vs[i].y;
    let xj = vs[j].x, yj = vs[j].y;
    let intersect = ((yi > y) !== (yj > y))
        && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
    if (intersect) inside = !inside;
  }
  return inside;
}

export function polygonsIntersectOrClose(poly1: Point[], poly2: Point[], minPadding: number): boolean {
  let minDistSq = Infinity;
  for (let i = 0; i < poly1.length; i++) {
    const v = poly1[i];
    const w = poly1[(i + 1) % poly1.length];
    for (let j = 0; j < poly2.length; j++) {
      const p = poly2[j];
      const p2 = poly2[(j + 1) % poly2.length];
      
      if (segmentsIntersect(v, w, p, p2)) return true;

      const d1 = distToSegmentSquared(p, v, w);
      if (d1 < minDistSq) minDistSq = d1;
      const d2 = distToSegmentSquared(v, p, p2);
      if (d2 < minDistSq) minDistSq = d2;
    }
  }
  
  if (minDistSq < minPadding * minPadding) return true;

  if (poly1.length > 0 && pointInPolygon(poly1[0], poly2)) return true;
  if (poly2.length > 0 && pointInPolygon(poly2[0], poly1)) return true;

  return false;
}

export function checkPolygonsDistance(polys1: Point[][], polys2: Point[][], minPadding: number): boolean {
  for (const poly1 of polys1) {
    for (const poly2 of polys2) {
      if (polygonsIntersectOrClose(poly1, poly2, minPadding)) {
        return true;
      }
    }
  }
  return false;
}

/**
 * Clamps a sticker position (x, y) based on its margins to the usable A4 sheet area,
 * taking into account the 11mm safety margins and the 6x6mm inward indents at each of the 4 corners.
 */
export function clampToUsableArea(
  x: number,
  y: number,
  margins: { left: number; right: number; top: number; bottom: number }
): { x: number; y: number } {
  const MARGIN_MM = 11;
  const SHEET_WIDTH_MM = 210;
  const SHEET_HEIGHT_MM = 297;

  // 1. Initial clamp to main 11mm safety margins
  let cx = Math.max(MARGIN_MM + margins.left, Math.min(SHEET_WIDTH_MM - MARGIN_MM - margins.right, x));
  let cy = Math.max(MARGIN_MM + margins.top, Math.min(SHEET_HEIGHT_MM - MARGIN_MM - margins.bottom, y));

  const CORNER_LIMIT = 17; // 11 + 6
  const RIGHT_CORNER_LIMIT = 193; // 199 - 6
  const BOTTOM_CORNER_LIMIT = 280; // 286 - 6

  // 2. Resolve corner collisions (re-calculating bounds after each adjustment)
  // Top-Left: leftBound < 17 && topBound < 17
  let leftBound = cx - margins.left;
  let rightBound = cx + margins.right;
  let topBound = cy - margins.top;
  let bottomBound = cy + margins.bottom;
  if (leftBound < CORNER_LIMIT && topBound < CORNER_LIMIT) {
    const dx = CORNER_LIMIT - leftBound;
    const dy = CORNER_LIMIT - topBound;
    if (dx < dy) {
      cx = CORNER_LIMIT + margins.left;
    } else {
      cy = CORNER_LIMIT + margins.top;
    }
  }

  // Top-Right: rightBound > 193 && topBound < 17
  leftBound = cx - margins.left;
  rightBound = cx + margins.right;
  topBound = cy - margins.top;
  bottomBound = cy + margins.bottom;
  if (rightBound > RIGHT_CORNER_LIMIT && topBound < CORNER_LIMIT) {
    const dx = rightBound - RIGHT_CORNER_LIMIT;
    const dy = CORNER_LIMIT - topBound;
    if (dx < dy) {
      cx = RIGHT_CORNER_LIMIT - margins.right;
    } else {
      cy = CORNER_LIMIT + margins.top;
    }
  }

  // Bottom-Left: leftBound < 17 && bottomBound > 280
  leftBound = cx - margins.left;
  rightBound = cx + margins.right;
  topBound = cy - margins.top;
  bottomBound = cy + margins.bottom;
  if (leftBound < CORNER_LIMIT && bottomBound > BOTTOM_CORNER_LIMIT) {
    const dx = CORNER_LIMIT - leftBound;
    const dy = bottomBound - BOTTOM_CORNER_LIMIT;
    if (dx < dy) {
      cx = CORNER_LIMIT + margins.left;
    } else {
      cy = BOTTOM_CORNER_LIMIT - margins.bottom;
    }
  }

  // Bottom-Right: rightBound > 193 && bottomBound > 280
  leftBound = cx - margins.left;
  rightBound = cx + margins.right;
  topBound = cy - margins.top;
  bottomBound = cy + margins.bottom;
  if (rightBound > RIGHT_CORNER_LIMIT && bottomBound > BOTTOM_CORNER_LIMIT) {
    const dx = rightBound - RIGHT_CORNER_LIMIT;
    const dy = bottomBound - BOTTOM_CORNER_LIMIT;
    if (dx < dy) {
      cx = RIGHT_CORNER_LIMIT - margins.right;
    } else {
      cy = BOTTOM_CORNER_LIMIT - margins.bottom;
    }
  }

  // Final safety clamp to main bounds
  cx = Math.max(MARGIN_MM + margins.left, Math.min(SHEET_WIDTH_MM - MARGIN_MM - margins.right, cx));
  cy = Math.max(MARGIN_MM + margins.top, Math.min(SHEET_HEIGHT_MM - MARGIN_MM - margins.bottom, cy));

  return { x: cx, y: cy };
}

/**
 * Checks if a sticker's cut line or envelope exceeds the sheet's usable area (including safety margins and corner indents).
 */
export function isStickerOutsideUsableArea(
  st: {
    widthCm: number;
    heightCm: number;
    rotation?: number;
    x: number;
    y: number;
    cutLineType: "none" | "contour" | "rounded" | "circle" | "contour_inside" | "rounded_inside" | "circle_inside";
    contourPolygons?: { x: number; y: number }[][];
  }
): boolean {
  const margins = getOuterMargins(st);
  const leftBound = st.x - margins.left;
  const rightBound = st.x + margins.right;
  const topBound = st.y - margins.top;
  const bottomBound = st.y + margins.bottom;

  const EPS = 0.05;

  if (leftBound < 11 - EPS || rightBound > 199 + EPS || topBound < 11 - EPS || bottomBound > 286 + EPS) {
    return true;
  }

  // Corner indents (6x6mm from 11mm border)
  if (leftBound < 17 - EPS && topBound < 17 - EPS) return true;
  if (rightBound > 193 + EPS && topBound < 17 - EPS) return true;
  if (leftBound < 17 - EPS && bottomBound > 280 + EPS) return true;
  if (rightBound > 193 + EPS && bottomBound > 280 + EPS) return true;

  return false;
}

/**
 * Calculates the displayed width of a sticker (in cm), which corresponds to the width of its cut line.
 * If there is no cut line, it returns the graphic width.
 * This is an intrinsic width (calculated with 0 rotation) so it makes sense to the user.
 */
export function getDisplayedWidthCm(
  st: {
    widthCm: number;
    heightCm: number;
    rotation?: number;
    cutLineType: "none" | "contour" | "rounded" | "circle" | "contour_inside" | "rounded_inside" | "circle_inside";
    contourPolygons?: { x: number; y: number }[][];
  }
): number {
  if (st.cutLineType === "none") {
    return st.widthCm;
  }
  const margins = getCutLineMargins(st, { rotation: 0 });
  const wMm = margins.left + margins.right;
  return Math.round(wMm) / 10;
}

/**
 * Calculates the graphic width required to achieve a specific target outer cut line width.
 * Uses binary search because cut line margins can be non-linear (e.g. contour scale clamping).
 */
export function getGraphicWidthFromDisplayed(
  st: {
    widthCm: number;
    heightCm: number;
    rotation?: number;
    cutLineType: "none" | "contour" | "rounded" | "circle" | "contour_inside" | "rounded_inside" | "circle_inside";
    contourPolygons?: { x: number; y: number }[][];
  },
  targetOuterWidthCm: number
): number {
  if (st.cutLineType === "none") {
    return targetOuterWidthCm;
  }
  const aspect = st.widthCm / st.heightCm;
  let low = 0.1;
  let high = 40.0;
  let bestW = st.widthCm;
  
  for (let i = 0; i < 20; i++) {
    const mid = (low + high) / 2;
    const margins = getCutLineMargins(st, {
      widthCm: mid,
      heightCm: mid / aspect,
      rotation: 0
    });
    const currentOuterWidthCm = (margins.left + margins.right) / 10;
    
    if (currentOuterWidthCm < targetOuterWidthCm) {
      low = mid;
    } else {
      high = mid;
    }
    bestW = mid;
  }
  
  return bestW;
}
