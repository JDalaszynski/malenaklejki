import { getCutLineOffsetMm } from "./collision";
import { computeForegroundMask } from "./imageMask";

interface Point {
  x: number;
  y: number;
}

/**
 * Simplifies a polygon using the Douglas-Peucker algorithm.
 */
function getSqDist(p1: Point, p2: Point) {
  const dx = p1.x - p2.x;
  const dy = p1.y - p2.y;
  return dx * dx + dy * dy;
}

function getSqSegDist(p: Point, p1: Point, p2: Point) {
  let x = p1.x;
  let y = p1.y;
  let dx = p2.x - x;
  let dy = p2.y - y;

  if (dx !== 0 || dy !== 0) {
    const t = ((p.x - x) * dx + (p.y - y) * dy) / (dx * dx + dy * dy);
    if (t > 1) {
      x = p2.x;
      y = p2.y;
    } else if (t > 0) {
      x += dx * t;
      y += dy * t;
    }
  }

  dx = p.x - x;
  dy = p.y - y;
  return dx * dx + dy * dy;
}

function simplifyDouglasPeucker(points: Point[], sqTolerance: number): Point[] {
  const len = points.length;
  if (len <= 2) return points;

  let maxSqDist = 0;
  let index = 0;
  const end = len - 1;

  for (let i = 1; i < end; i++) {
    const sqDist = getSqSegDist(points[i], points[0], points[end]);
    if (sqDist > maxSqDist) {
      index = i;
      maxSqDist = sqDist;
    }
  }

  if (maxSqDist > sqTolerance) {
    const results1 = simplifyDouglasPeucker(points.slice(0, index + 1), sqTolerance);
    const results2 = simplifyDouglasPeucker(points.slice(index), sqTolerance);
    return results1.slice(0, results1.length - 1).concat(results2);
  }
  return [points[0], points[end]];
}

export function simplifyPoints(points: Point[], tolerance = 1): Point[] {
  if (points.length <= 2) return points;
  const sqTolerance = tolerance * tolerance;
  return simplifyDouglasPeucker(points, sqTolerance);
}

/**
 * Smooths a closed polygon using a moving average window.
 */
export function smoothPolygon(points: Point[], windowSize = 5): Point[] {
  if (points.length < windowSize) return points;
  const smoothed: Point[] = [];
  const half = Math.floor(windowSize / 2);
  
  for (let i = 0; i < points.length; i++) {
    let sumX = 0;
    let sumY = 0;
    for (let w = -half; w <= half; w++) {
      const idx = (i + w + points.length) % points.length;
      sumX += points[idx].x;
      sumY += points[idx].y;
    }
    smoothed.push({ x: sumX / windowSize, y: sumY / windowSize });
  }
  return smoothed;
}

const DT_INF = 1e20;

/**
 * 1D squared Euclidean distance transform over f[0..n-1]
 * (Felzenszwalb & Huttenlocher, exact and O(n)). Scratch buffers are passed in
 * so the 2D pass can reuse them.
 */
function edt1d(
  f: Float64Array,
  d: Float64Array,
  v: Int32Array,
  z: Float64Array,
  n: number
) {
  let k = 0;
  v[0] = 0;
  z[0] = -DT_INF;
  z[1] = DT_INF;

  for (let q = 1; q < n; q++) {
    let s = (f[q] + q * q - (f[v[k]] + v[k] * v[k])) / (2 * q - 2 * v[k]);
    while (s <= z[k]) {
      k--;
      s = (f[q] + q * q - (f[v[k]] + v[k] * v[k])) / (2 * q - 2 * v[k]);
    }
    k++;
    v[k] = q;
    z[k] = s;
    z[k + 1] = DT_INF;
  }

  k = 0;
  for (let q = 0; q < n; q++) {
    while (z[k + 1] < q) k++;
    const dq = q - v[k];
    d[q] = dq * dq + f[v[k]];
  }
}

/**
 * Exact squared Euclidean distance transform: for every pixel, the squared
 * distance to the nearest pixel set in `seed`.
 *
 * This gives dilation and erosion for free and in linear time:
 *   dilate(seed, r) === { squaredDistanceTransform(seed) <= r*r }
 *   erode(mask, r)  === { squaredDistanceTransform(!mask) >  r*r }
 * which is what makes the adaptive gap bridging below affordable.
 */
function squaredDistanceTransform(seed: Uint8Array, w: number, h: number): Float64Array {
  const n = w * h;
  const dist = new Float64Array(n);
  for (let i = 0; i < n; i++) dist[i] = seed[i] ? 0 : DT_INF;

  const maxDim = Math.max(w, h);
  const f = new Float64Array(maxDim);
  const d = new Float64Array(maxDim);
  const v = new Int32Array(maxDim);
  const z = new Float64Array(maxDim + 1);

  for (let x = 0; x < w; x++) {
    for (let y = 0; y < h; y++) f[y] = dist[y * w + x];
    edt1d(f, d, v, z, h);
    for (let y = 0; y < h; y++) dist[y * w + x] = d[y];
  }

  for (let y = 0; y < h; y++) {
    const off = y * w;
    for (let x = 0; x < w; x++) f[x] = dist[off + x];
    edt1d(f, d, v, z, w);
    for (let x = 0; x < w; x++) dist[off + x] = d[x];
  }

  return dist;
}

/**
 * Counts 4-connected components of a binary grid, giving up as soon as more
 * than `limit` have been found (the callers only care about "exactly one").
 */
function countComponents(grid: Uint8Array, w: number, h: number, limit = 1): number {
  const n = w * h;
  const seen = new Uint8Array(n);
  const stack = new Int32Array(n);
  let count = 0;

  for (let i = 0; i < n; i++) {
    if (!grid[i] || seen[i]) continue;
    count++;
    if (count > limit) return count;

    let sp = 0;
    stack[sp++] = i;
    seen[i] = 1;

    while (sp > 0) {
      const p = stack[--sp];
      const x = p % w;
      const y = (p / w) | 0;
      if (x > 0 && grid[p - 1] && !seen[p - 1]) { seen[p - 1] = 1; stack[sp++] = p - 1; }
      if (x < w - 1 && grid[p + 1] && !seen[p + 1]) { seen[p + 1] = 1; stack[sp++] = p + 1; }
      if (y > 0 && grid[p - w] && !seen[p - w]) { seen[p - w] = 1; stack[sp++] = p - w; }
      if (y < h - 1 && grid[p + w] && !seen[p + w]) { seen[p + w] = 1; stack[sp++] = p + w; }
    }
  }

  return count;
}

/** Absolute polygon area (shoelace). */
function polygonArea(poly: Point[]): number {
  let area = 0;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    area += (poly[j].x + poly[i].x) * (poly[j].y - poly[i].y);
  }
  return Math.abs(area) / 2;
}

/** Convex hull (Andrew's monotone chain), used as a last-resort enclosing shape. */
function convexHull(points: Point[]): Point[] {
  if (points.length < 3) return points;

  const pts = [...points].sort((a, b) => (a.x - b.x) || (a.y - b.y));
  const cross = (o: Point, a: Point, b: Point) =>
    (a.x - o.x) * (b.y - o.y) - (a.y - o.y) * (b.x - o.x);

  const lower: Point[] = [];
  for (const p of pts) {
    while (lower.length >= 2 && cross(lower[lower.length - 2], lower[lower.length - 1], p) <= 0) {
      lower.pop();
    }
    lower.push(p);
  }

  const upper: Point[] = [];
  for (let i = pts.length - 1; i >= 0; i--) {
    const p = pts[i];
    while (upper.length >= 2 && cross(upper[upper.length - 2], upper[upper.length - 1], p) <= 0) {
      upper.pop();
    }
    upper.push(p);
  }

  lower.pop();
  upper.pop();
  return lower.concat(upper);
}

const imageCache = new Map<string, HTMLImageElement>();

/**
 * Traces the contours of an image, ignoring transparent or near-white pixels.
 * Returns normalized coordinates in the range [0, 1] relative to image width and height,
 * with an exact outward (dilation) or inward (erosion) margin baked into the geometry.
 * Guarantees a single unified outer contour that can be rendered identically anywhere
 * (edit mode, visualization, margin/collision math) with no further correction needed.
 *
 * Artwork made of several separate elements (e.g. a logo mark above a wordmark) is
 * joined with a morphological closing whose radius is searched for at runtime, so the
 * cut line always encloses the WHOLE design as one piece. A fixed mm margin cannot do
 * this on its own: the gaps between elements grow with the sticker size while the
 * margin stays at 1.5-3.0mm, so above a certain size the elements stop merging.
 * Closing never grows the shape past its bounding box, so the margins reserved by
 * getCutLineMargins() still hold.
 */
export function getContourPoints(
  imageUrl: string,
  type: "contour" | "contour_inside" = "contour",
  widthMm: number = 50,
  heightMm: number = 50
): Promise<Point[][]> {
  if (typeof window === "undefined") {
    return Promise.resolve([[{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 1, y: 1 }, { x: 0, y: 1 }]]);
  }

  return new Promise((resolve) => {
    // Always use proxy for Firebase/external images to avoid canvas taint issues
    const isExternal = imageUrl.startsWith("http") || imageUrl.startsWith("https") || imageUrl.startsWith("/");
    const proxiedUrl = isExternal && !imageUrl.startsWith("/api/")
      ? `/api/proxy-image?url=${encodeURIComponent(imageUrl)}`
      : imageUrl;

    const processImage = (img: HTMLImageElement) => {
      try {
        const maxDimension = 400; // base size for fast grid analysis
        const w = img.naturalWidth || img.width || 400;
        const h = img.naturalHeight || img.height || 400;

        let scale = Math.min(maxDimension / w, maxDimension / h);
        if (scale > 1) scale = 1;

        const imgW = Math.max(1, Math.round(w * scale));
        const imgH = Math.max(1, Math.round(h * scale));

        const maxDimensionMm = Math.max(widthMm, heightMm) || 50;

        // Grid resolution actually achieved (imgW/imgH can be smaller than maxDimension
        // for low-resolution source images), used to convert real mm to grid pixels.
        const gridMaxDim = Math.max(imgW, imgH) || maxDimension;
        const pixelsPerMm = gridMaxDim / maxDimensionMm;

        // Calculate the margin in grid pixels (must be an integer for the raster ops)
        const isInside = type === "contour_inside";
        let marginMm: number;
        if (isInside) {
          // Inner contour: 0.5mm inset from graphic edge
          marginMm = 0.5;
        } else {
          // Outer contour: dynamic 1.5mm - 3.0mm outward margin based on sticker width
          const widthCm = (widthMm || maxDimensionMm) / 10;
          marginMm = getCutLineOffsetMm("contour", widthCm);
        }

        const offsetPixels = Math.max(1, Math.round(marginMm * pixelsPerMm));
        const baseDilate = isInside ? 0 : offsetPixels;
        const baseErode = isInside ? offsetPixels : 0;

        // Upper bound for the gap-bridging closing radius.
        const maxBridge = Math.max(8, Math.round(gridMaxDim * 0.25));

        const canvas = document.createElement("canvas");
        canvas.width = imgW;
        canvas.height = imgH;

        const ctx = canvas.getContext("2d", { willReadFrequently: true });
        if (!ctx) {
          resolve([[{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 1, y: 1 }, { x: 0, y: 1 }]]);
          return;
        }

        ctx.clearRect(0, 0, imgW, imgH);
        ctx.drawImage(img, 0, 0, imgW, imgH);

        const data = ctx.getImageData(0, 0, imgW, imgH).data;

        // Klasyfikacja tła (przezroczyste + prawie białe połączone z krawędzią)
        // jest wspólna z modułem przezroczystości, żeby linia cięcia i wybite tło
        // opisywały ten sam kształt.
        const imgFg = computeForegroundMask(data, imgW, imgH);

        // Padded canvas so the dilated outline can expand without clipping.
        let padding = baseDilate + 4;
        let canvasW = imgW + padding * 2;
        let canvasH = imgH + padding * 2;
        let fg = new Uint8Array(canvasW * canvasH);
        const repad = (pad: number) => {
          padding = pad;
          canvasW = imgW + pad * 2;
          canvasH = imgH + pad * 2;
          fg = new Uint8Array(canvasW * canvasH);
          for (let y = 0; y < imgH; y++) {
            const src = y * imgW;
            const dst = (y + pad) * canvasW + pad;
            for (let x = 0; x < imgW; x++) fg[dst + x] = imgFg[src + x];
          }
        };
        repad(padding);

        let dtFg = squaredDistanceTransform(fg, canvasW, canvasH);

        // Mask = artwork dilated by (baseDilate + bridge) pixels.
        const maskAt = (bridge: number) => {
          const rad = baseDilate + bridge;
          const rad2 = rad * rad;
          const mask = new Uint8Array(dtFg.length);
          for (let i = 0; i < dtFg.length; i++) mask[i] = dtFg[i] <= rad2 ? 1 : 0;
          return mask;
        };

        // Smallest bridging radius that pulls every element into one piece.
        // Connectivity is monotone in the radius, so a binary search is exact.
        let bridge = 0;
        let bridgeFailed = false;
        if (countComponents(maskAt(0), canvasW, canvasH) > 1) {
          let lo = 1;
          let hi = maxBridge;
          let found = -1;
          while (lo <= hi) {
            const mid = (lo + hi) >> 1;
            if (countComponents(maskAt(mid), canvasW, canvasH) === 1) {
              found = mid;
              hi = mid - 1;
            } else {
              lo = mid + 1;
            }
          }
          bridgeFailed = found < 0;
          bridge = bridgeFailed ? maxBridge : found;
        }

        // Closing = dilate by (offset + bridge), then erode the bridge back off, so
        // the line still sits exactly `marginMm` from the artwork everywhere except
        // across the bridged gaps.
        const ensurePadding = (bridgeR: number) => {
          const needed = baseDilate + bridgeR + 4;
          if (padding >= needed) return;
          repad(needed);
          dtFg = squaredDistanceTransform(fg, canvasW, canvasH);
        };

        const buildGrid = (bridgeR: number) => {
          const mask = maskAt(bridgeR);
          const eroRad = bridgeR + baseErode;
          if (eroRad <= 0) return mask;

          const complement = new Uint8Array(mask.length);
          for (let i = 0; i < mask.length; i++) complement[i] = mask[i] ? 0 : 1;
          const dtBg = squaredDistanceTransform(complement, canvasW, canvasH);

          const eroded = new Uint8Array(mask.length);
          const ero2 = eroRad * eroRad;
          for (let i = 0; i < eroded.length; i++) eroded[i] = dtBg[i] > ero2 ? 1 : 0;
          return eroded;
        };

        ensurePadding(bridge);
        let grid = buildGrid(bridge);
        let components = countComponents(grid, canvasW, canvasH);

        if (components === 0) {
          // Erosion erased the shape (tiny artwork with an inside cut): keep it un-eroded.
          grid = maskAt(bridge);
          components = countComponents(grid, canvasW, canvasH);
        } else {
          // Eroding the bridge back off can re-open a gap that only just closed.
          // Widen it a little and retry.
          let guard = 0;
          while (components > 1 && bridge < maxBridge && guard++ < 4) {
            bridge = Math.min(maxBridge, bridge + Math.max(2, Math.ceil(bridge * 0.5)));
            ensurePadding(bridge);
            grid = buildGrid(bridge);
            components = countComponents(grid, canvasW, canvasH);
          }
          if (components > 1) bridgeFailed = true;
        }

        const traceContours = (g: Uint8Array): Point[][] => {
          const visited = new Uint8Array(canvasW * canvasH);
          const list: Point[][] = [];

          // Moore-Neighborhood directions clockwise: N, NE, E, SE, S, SW, W, NW
          const dx = [0, 1, 1, 1, 0, -1, -1, -1];
          const dy = [-1, -1, 0, 1, 1, 1, 0, -1];

          // Generous safety net: the boundary of a blob on this grid is far shorter,
          // but a hard-coded cap would silently truncate (and so cut off) a contour.
          const stepLimit = Math.max(20000, (canvasW + canvasH) * 20);

          for (let y = 1; y < canvasH - 1; y++) {
            for (let x = 1; x < canvasW - 1; x++) {
              const start = y * canvasW + x;
              if (g[start] === 1 && g[start - 1] === 0 && !visited[start]) {
                const contour: Point[] = [];
                let cx = x;
                let cy = y;
                let backDir = 6;

                const startX = x;
                const startY = y;

                let limit = stepLimit;
                while (limit-- > 0) {
                  contour.push({ x: cx, y: cy });
                  visited[cy * canvasW + cx] = 1;

                  const searchDir = (backDir + 1) % 8;
                  let nextX = cx;
                  let nextY = cy;
                  let foundNext = false;

                  for (let i = 0; i < 8; i++) {
                    const dir = (searchDir + i) % 8;
                    const tx = cx + dx[dir];
                    const ty = cy + dy[dir];
                    if (tx >= 0 && tx < canvasW && ty >= 0 && ty < canvasH && g[ty * canvasW + tx] === 1) {
                      nextX = tx;
                      nextY = ty;
                      backDir = (dir + 4) % 8;
                      foundNext = true;
                      break;
                    }
                  }

                  if (!foundNext) break;
                  if (nextX === startX && nextY === startY) break;

                  cx = nextX;
                  cy = nextY;
                }

                if (contour.length > 5) {
                  let processed: Point[];
                  if (isInside) {
                    // Inner contour: track the real outline closely (tighter than the
                    // outer die-cut border) while still reading as a smooth curve.
                    // A moderate first smoothing pass kills the pixel staircase, a very
                    // small simplification tolerance keeps points dense along curves,
                    // and a final light smoothing pass removes the residual faceting so
                    // round shapes (e.g. a circle) look smooth. Windows 5+3 stay tighter
                    // on real corners than the outer border's 7+5.
                    processed = smoothPolygon(contour, 5);
                    processed = simplifyPoints(processed, 0.1);
                    processed = smoothPolygon(processed, 3);
                  } else {
                    processed = smoothPolygon(contour, 7);
                    processed = simplifyPoints(processed, 0.08);
                    processed = smoothPolygon(processed, 5);
                  }

                  if (processed.length > 2) {
                    const normalized = processed.map((p) => ({
                      x: (p.x + 0.5 - padding) / imgW,
                      y: (p.y + 0.5 - padding) / imgH,
                    }));
                    list.push(normalized);
                  }
                }
              }
            }
          }
          return list;
        };

        const contours = traceContours(grid);

        if (contours.length > 0) {
          if (bridgeFailed) {
            // Could not join the artwork into one piece within the bridging budget.
            // Enclose everything in its convex hull rather than silently cutting
            // parts of the design away.
            const hull = convexHull(contours.flat());
            resolve([hull.length > 2 ? hull : contours[0]]);
            return;
          }

          // One connected piece: the outer boundary is the largest-area contour
          // (the others are holes, e.g. the middle of an "O").
          contours.sort((a, b) => polygonArea(b) - polygonArea(a));
          resolve([contours[0]]);
        } else {
          // Fallback to image box boundaries
          resolve([[{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 1, y: 1 }, { x: 0, y: 1 }]]);
        }
      } catch (err) {
        console.error("Contour analysis error:", err);
        resolve([[{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 1, y: 1 }, { x: 0, y: 1 }]]);
      }
    };
    
    const cachedImg = imageCache.get(proxiedUrl);
    if (cachedImg && cachedImg.complete) {
      processImage(cachedImg);
      return;
    }
    
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      imageCache.set(proxiedUrl, img);
      processImage(img);
    };
    img.onerror = () => {
      resolve([[{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 1, y: 1 }, { x: 0, y: 1 }]]);
    };
    img.src = proxiedUrl;
  });
}
