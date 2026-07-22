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
    const offsetMm = (cutLineType === "rounded_inside" || cutLineType === "circle_inside") ? -2 : 2;
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

  const cutLineType = overrideParams?.cutLineType !== undefined ? overrideParams.cutLineType : st.cutLineType;
  if (cutLineType === "contour" || cutLineType === "contour_inside") {
    return cutMargins;
  }

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
  const t1 = overrideParams1?.cutLineType ?? s1.cutLineType;
  const t2 = s2.cutLineType;
  
  const allowedOverlapTypes = ["contour", "rounded", "circle"];
  const canGraphicsOverlap = allowedOverlapTypes.includes(t1) && allowedOverlapTypes.includes(t2);

  if (!canGraphicsOverlap) {
    // 1. Graphics and Cut lines must not overlap each other
    // We check the outer bounding box (which encompasses both graphic and cutline)
    const o1 = getCutLineBoundingBox(s1, overrideParams1);
    const o2 = getCutLineBoundingBox(s2);
    if (checkOverlap(o1, o2, 0)) {
      return true;
    }
  }

  // 2. Cut lines must not overlap and need safety spacing (1.0mm padding)
  const c1 = getOnlyCutLineBoundingBox(s1, overrideParams1);
  const c2 = getOnlyCutLineBoundingBox(s2);
  const cutLinePadding = (
    (overrideParams1?.cutLineType ?? s1.cutLineType) === "none" &&
    s2.cutLineType === "none"
  ) ? 0.0 : 1.0;
  
  // Fast path: if AABBs don't overlap, the polygons definitely don't
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

  if ((cutLineType === "contour" || cutLineType === "contour_inside") && contourPolygons && contourPolygons.length > 0) {
    return contourPolygons.map((poly: { x: number; y: number }[]) => {
      return poly.map((p: { x: number; y: number }) => {
        const px = p.x * wMm;
        const py = p.y * hMm;
        const rx = px - cx;
        const ry = py - cy;
        const rotX = rx * cos - ry * sin;
        const rotY = rx * sin + ry * cos;
        return { x: x + rotX, y: y + rotY };
      });
    });
  }

  // Fallback for non-contour: generate rotated rectangle polygon
  let cutW = wMm;
  let cutH = hMm;
  if (
    cutLineType === "rounded" ||
    cutLineType === "circle" ||
    cutLineType === "rounded_inside" ||
    cutLineType === "circle_inside"
  ) {
    const offsetMm = (cutLineType === "rounded_inside" || cutLineType === "circle_inside") ? -2 : 2;
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
    return { x: x + rotX, y: y + rotY };
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

  // Helper bounds
  const leftBound = cx - margins.left;
  const rightBound = cx + margins.right;
  const topBound = cy - margins.top;
  const bottomBound = cy + margins.bottom;

  const CORNER_LIMIT = 17; // 11 + 6
  const RIGHT_CORNER_LIMIT = 193; // 199 - 6
  const BOTTOM_CORNER_LIMIT = 280; // 286 - 6

  // 2. Resolve corner collisions (using smaller push-out distance)
  // Top-Left: leftBound < 17 && topBound < 17
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
  if (rightBound > RIGHT_CORNER_LIMIT && bottomBound > BOTTOM_CORNER_LIMIT) {
    const dx = rightBound - RIGHT_CORNER_LIMIT;
    const dy = bottomBound - BOTTOM_CORNER_LIMIT;
    if (dx < dy) {
      cx = RIGHT_CORNER_LIMIT - margins.right;
    } else {
      cy = BOTTOM_CORNER_LIMIT - margins.bottom;
    }
  }

  return { x: cx, y: cy };
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
