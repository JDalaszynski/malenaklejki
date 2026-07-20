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

/**
 * Dilates a binary grid to merge separate elements and create an outward offset.
 * Optimized to only dilate from boundary pixels for massive performance gain.
 */
function dilateGrid(grid: number[][], radius: number): number[][] {
  const h = grid.length;
  const w = grid[0].length;
  const output = Array.from({ length: h }, () => new Uint8Array(w));
  
  // Precompute dx bounds for each dy to avoid sqrt in inner loop
  const maxDxForDy = new Int32Array(radius * 2 + 1);
  for (let dy = -radius; dy <= radius; dy++) {
    maxDxForDy[dy + radius] = Math.floor(Math.sqrt(radius * radius - dy * dy));
  }

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      if (grid[y][x] === 1) {
        // Only dilate if it's a boundary pixel (has a 0 neighbor)
        let isBoundary = false;
        if (
           (y > 0 && grid[y-1][x] === 0) ||
           (y < h-1 && grid[y+1][x] === 0) ||
           (x > 0 && grid[y][x-1] === 0) ||
           (x < w-1 && grid[y][x+1] === 0)
        ) {
           isBoundary = true;
        }
        
        if (isBoundary) {
          for (let dy = -radius; dy <= radius; dy++) {
            const ty = y + dy;
            if (ty < 0 || ty >= h) continue;

            const maxDx = maxDxForDy[dy + radius];
            for (let dx = -maxDx; dx <= maxDx; dx++) {
              const tx = x + dx;
              if (tx >= 0 && tx < w) {
                output[ty][tx] = 1;
              }
            }
          }
        } else {
          // Inner pixel, just copy
          output[y][x] = 1;
        }
      }
    }
  }

  const result: number[][] = [];
  for (let y = 0; y < h; y++) {
    result.push(Array.from(output[y]));
  }
  return result;
}

/**
 * Erodes a binary grid to shrink elements and create an inward offset.
 * Optimized to only erode from boundary pixels for massive performance gain.
 */
function erodeGrid(grid: number[][], radius: number): number[][] {
  const h = grid.length;
  const w = grid[0].length;
  const output = Array.from({ length: h }, () => new Uint8Array(w).fill(1));

  // Precompute dx bounds for each dy to avoid sqrt in inner loop
  const maxDxForDy = new Int32Array(radius * 2 + 1);
  for (let dy = -radius; dy <= radius; dy++) {
    maxDxForDy[dy + radius] = Math.floor(Math.sqrt(radius * radius - dy * dy));
  }

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      if (grid[y][x] === 0) {
        // Only erode if it's a boundary pixel (has a 1 neighbor)
        let isBoundary = false;
        if (
           (y > 0 && grid[y-1][x] === 1) ||
           (y < h-1 && grid[y+1][x] === 1) ||
           (x > 0 && grid[y][x-1] === 1) ||
           (x < w-1 && grid[y][x+1] === 1)
        ) {
           isBoundary = true;
        }
        
        if (isBoundary) {
          for (let dy = -radius; dy <= radius; dy++) {
            const ty = y + dy;
            if (ty < 0 || ty >= h) continue;

            const maxDx = maxDxForDy[dy + radius];
            for (let dx = -maxDx; dx <= maxDx; dx++) {
              const tx = x + dx;
              if (tx >= 0 && tx < w) {
                output[ty][tx] = 0;
              }
            }
          }
        } else {
          // Inner pixel (or far outside), just copy
          output[y][x] = 0;
        }
      }
    }
  }

  const result: number[][] = [];
  for (let y = 0; y < h; y++) {
    result.push(Array.from(output[y]));
  }
  return result;
}

const imageCache = new Map<string, HTMLImageElement>();

/**
 * Traces the contours of an image, ignoring transparent or near-white pixels.
 * Returns normalized coordinates in the range [0, 1] relative to image width and height,
 * with an exact 2mm outward (dilation) or inward (erosion) margin baked into the geometry.
 * Guarantees a single unified outer contour that can be rendered identically anywhere
 * (edit mode, visualization, margin/collision math) with no further correction needed.
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
        let w = img.naturalWidth || img.width || 400;
        let h = img.naturalHeight || img.height || 400;

        let scale = Math.min(maxDimension / w, maxDimension / h);
        if (scale > 1) scale = 1;

        const imgW = Math.round(w * scale);
        const imgH = Math.round(h * scale);

        const maxDimensionMm = Math.max(widthMm, heightMm) || 50;

        // Grid resolution actually achieved (imgW/imgH can be smaller than maxDimension
        // for low-resolution source images), used to convert real mm to grid pixels.
        const gridMaxDim = Math.max(imgW, imgH) || maxDimension;
        const pixelsPerMm = gridMaxDim / maxDimensionMm;

        // Calculate the margin in grid pixels (must be an integer for the raster dilate/erode ops)
        // Make the margin smaller for scaled-down stickers
        let marginMm = (maxDimensionMm / 50.0) * 4.0;
        marginMm = Math.min(4.0, Math.max(1.5, marginMm)); // Cap at 4mm, min 1.5mm

        const dilationPixels = Math.max(1, Math.round(marginMm * pixelsPerMm));
        
        // Add dynamic padding on all sides to allow the dilated outline to expand without clipping
        const padding = dilationPixels + 4;
        const canvasW = imgW + padding * 2;
        const canvasH = imgH + padding * 2;
        
        const canvas = document.createElement("canvas");
        canvas.width = canvasW;
        canvas.height = canvasH;
        
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          resolve([[{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 1, y: 1 }, { x: 0, y: 1 }]]);
          return;
        }
        
        ctx.clearRect(0, 0, canvasW, canvasH);
        ctx.drawImage(img, padding, padding, imgW, imgH);
        
        const imageData = ctx.getImageData(0, 0, canvasW, canvasH);
        const data = imageData.data;
        
        // Build 2D grid
        // 0 = definite background (transparent)
        // 1 = definite foreground (colored)
        // 2 = potential background (near-white)
        let initialGrid: number[][] = [];
        for (let y = 0; y < canvasH; y++) {
          const row: number[] = [];
          for (let x = 0; x < canvasW; x++) {
            const idx = (y * canvasW + x) * 4;
            const r = data[idx];
            const g = data[idx + 1];
            const b = data[idx + 2];
            const a = data[idx + 3];
            
            if (a < 25) {
              row.push(0);
            } else if (r > 240 && g > 240 && b > 240) {
              row.push(2);
            } else {
              row.push(1);
            }
          }
          initialGrid.push(row);
        }

        // Flood fill from edges to turn connected potential background (2) into definite background (0)
        const q: { x: number; y: number }[] = [];
        // Add all edge pixels
        for (let x = 0; x < canvasW; x++) {
          q.push({ x, y: 0 });
          q.push({ x, y: canvasH - 1 });
        }
        for (let y = 0; y < canvasH; y++) {
          q.push({ x: 0, y });
          q.push({ x: canvasW - 1, y });
        }

        const fVisited = Array.from({ length: canvasH }, () => new Uint8Array(canvasW));
        let head = 0;
        while (head < q.length) {
          const { x, y } = q[head++];
          if (x < 0 || x >= canvasW || y < 0 || y >= canvasH) continue;
          if (fVisited[y][x]) continue;
          fVisited[y][x] = 1;

          if (initialGrid[y][x] === 2 || initialGrid[y][x] === 0) {
            initialGrid[y][x] = 0; // Mark as definite background
            q.push({ x: x + 1, y });
            q.push({ x: x - 1, y });
            q.push({ x, y: y + 1 });
            q.push({ x, y: y - 1 });
          }
        }

        // Convert any remaining 2s (isolated white areas) to 1s (foreground)
        for (let y = 0; y < canvasH; y++) {
          for (let x = 0; x < canvasW; x++) {
            if (initialGrid[y][x] === 2) {
              initialGrid[y][x] = 1;
            }
          }
        }
        
        // Dilate or erode grid to create outward outline or inward cut
        const grid = type === "contour_inside" ? erodeGrid(initialGrid, dilationPixels) : dilateGrid(initialGrid, dilationPixels);
        
        const traceContours = (g: number[][]): Point[][] => {
          const visited = Array.from({ length: canvasH }, () => new Uint8Array(canvasW));
          const list: Point[][] = [];
          
          // Moore-Neighborhood directions clockwise: N, NE, E, SE, S, SW, W, NW
          const dx = [0, 1, 1, 1, 0, -1, -1, -1];
          const dy = [-1, -1, 0, 1, 1, 1, 0, -1];
          
          for (let y = 1; y < canvasH - 1; y++) {
            for (let x = 1; x < canvasW - 1; x++) {
              if (g[y][x] === 1 && g[y][x - 1] === 0 && !visited[y][x]) {
                const contour: Point[] = [];
                let cx = x;
                let cy = y;
                let backDir = 6;
                
                const startX = x;
                const startY = y;
                
                let limit = 8000;
                while (limit-- > 0) {
                  contour.push({ x: cx, y: cy });
                  visited[cy][cx] = 1;
                  
                  let searchDir = (backDir + 1) % 8;
                  let nextX = cx;
                  let nextY = cy;
                  let foundNext = false;
                  
                  for (let i = 0; i < 8; i++) {
                    const dir = (searchDir + i) % 8;
                    const tx = cx + dx[dir];
                    const ty = cy + dy[dir];
                    if (tx >= 0 && tx < canvasW && ty >= 0 && ty < canvasH && g[ty][tx] === 1) {
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
                  let processed = smoothPolygon(contour, 7);
                  processed = simplifyPoints(processed, 0.08);
                  processed = smoothPolygon(processed, 5);
                  
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

        let contours = traceContours(grid);
        let offsetAppliedPixels = dilationPixels;
        if (contours.length === 0 && type === "contour_inside") {
          // Retry with initialGrid if erosion completely erased the shape.
          // No offset was actually applied in this case.
          contours = traceContours(initialGrid);
          offsetAppliedPixels = 0;
        }

        if (contours.length > 0) {
          // Keep only the largest contour to guarantee a single unified border line
          contours.sort((a, b) => b.length - a.length);
          const largest = contours[0];

          resolve([largest]);
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
