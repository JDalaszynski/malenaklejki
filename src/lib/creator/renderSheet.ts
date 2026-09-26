"use client";

import type { PlacedSticker } from "@/types/creator";
import { getCutLineOffsetMm } from "@/lib/utils/collision";
import { getRenderImageUrl } from "@/lib/utils/transparentBackground";

/**
 * Rysowanie arkusza na płótnie — te same pliki, które kreator na stronie
 * głównej wysyła do druku (`print`, `cut-lines`) i pokazuje jako podgląd.
 *
 * Wymiary podajemy w pikselach szerokości; przy domyślnych 2480 px (A4 w 300 dpi)
 * wynik jest piksel w piksel taki sam jak z kreatora. Mniejsze płótno służy
 * do miniatur gotowych arkuszy w panelu.
 */

export const A4_PRINT_WIDTH_PX = 2480;
const A4_RATIO = 297 / 210;

function loadProxiedImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Failed to load image: " + url));
    // Wersje z wybitym tłem żyją jako blob: w tej karcie — proxy tylko by je popsuło.
    img.src =
      url.startsWith("blob:") || url.startsWith("data:")
        ? url
        : `/api/proxy-image?url=${encodeURIComponent(url)}`;
  });
}

/** Grafika gotowa do rysowania: dla konturu z wybitym białym tłem. */
async function loadStickerImage(st: PlacedSticker): Promise<HTMLImageElement> {
  const renderUrl = await getRenderImageUrl(st.imageUrl, st.cutLineType);
  return loadProxiedImage(renderUrl);
}

async function loadAll(stickers: PlacedSticker[]): Promise<Map<string, HTMLImageElement>> {
  const loaded = new Map<string, HTMLImageElement>();
  await Promise.all(
    stickers.map(async (st) => {
      try {
        loaded.set(st.id, await loadStickerImage(st));
      } catch (err) {
        console.error(err);
      }
    })
  );
  return loaded;
}

function roundedRectPath(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
}

/**
 * Arkusz w trzech wersjach kreatora:
 * - `print` — same grafiki, plik do druku,
 * - `cut-lines` — czarne kształty linii cięcia na białym tle, plik dla plotera,
 * - `normal` — grafiki z różową przerywaną linią cięcia (podgląd).
 */
export async function renderSheetCanvas(
  stickers: PlacedSticker[],
  mode: "normal" | "print" | "cut-lines" = "normal",
  widthPx: number = A4_PRINT_WIDTH_PX
): Promise<HTMLCanvasElement> {
  const A4_W = Math.round(widthPx);
  const A4_H = Math.round(widthPx * A4_RATIO);
  const MM_TO_PX = A4_W / 210;
  // Grubości i promienie kreatora są w pikselach płótna 2480 px.
  const px = A4_W / A4_PRINT_WIDTH_PX;

  const canvas = document.createElement("canvas");
  canvas.width = A4_W;
  canvas.height = A4_H;
  const ctx = canvas.getContext("2d")!;

  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, A4_W, A4_H);

  const images = mode === "cut-lines" ? new Map<string, HTMLImageElement>() : await loadAll(stickers);

  for (const st of stickers) {
    const drawX = st.x * MM_TO_PX;
    const drawY = st.y * MM_TO_PX;
    const drawW = st.widthCm * 10 * MM_TO_PX;
    const drawH = st.heightCm * 10 * MM_TO_PX;

    ctx.save();
    ctx.translate(drawX + drawW / 2, drawY + drawH / 2);
    ctx.rotate(((st.rotation || 0) * Math.PI) / 180);

    const relX = -drawW / 2;
    const relY = -drawH / 2;
    const offsetPx = getCutLineOffsetMm(st.cutLineType, st.widthCm) * MM_TO_PX;
    const cutX = relX - offsetPx;
    const cutY = relY - offsetPx;
    const cutW = drawW + 2 * offsetPx;
    const cutH = drawH + 2 * offsetPx;
    const cutR = 25 * px;

    const traceContour = () => {
      st.contourPolygons?.forEach((poly) => {
        if (poly.length < 2) return;
        ctx.moveTo(relX + poly[0].x * drawW, relY + poly[0].y * drawH);
        for (let i = 1; i < poly.length; i++) {
          ctx.lineTo(relX + poly[i].x * drawW, relY + poly[i].y * drawH);
        }
        ctx.closePath();
      });
    };

    if (mode === "cut-lines") {
      ctx.fillStyle = "#000000";
      if (st.cutLineType === "rounded" || st.cutLineType === "rounded_inside") {
        ctx.beginPath();
        roundedRectPath(ctx, cutX, cutY, cutW, cutH, cutR);
        ctx.closePath();
        ctx.fill();
      } else if (st.cutLineType === "circle" || st.cutLineType === "circle_inside") {
        ctx.beginPath();
        ctx.ellipse(0, 0, drawW / 2 + offsetPx, drawH / 2 + offsetPx, 0, 0, 2 * Math.PI);
        ctx.closePath();
        ctx.fill();
      } else if (st.cutLineType === "contour" || st.cutLineType === "contour_inside") {
        if (st.contourPolygons && st.contourPolygons.length > 0) {
          st.contourPolygons.forEach((poly) => {
            if (poly.length < 2) return;
            ctx.beginPath();
            ctx.moveTo(relX + poly[0].x * drawW, relY + poly[0].y * drawH);
            for (let i = 1; i < poly.length; i++) {
              ctx.lineTo(relX + poly[i].x * drawW, relY + poly[i].y * drawH);
            }
            ctx.closePath();
            ctx.fill();
          });
        } else {
          ctx.fillRect(relX, relY, drawW, drawH);
        }
      }
    } else {
      if (mode === "normal" && st.cutLineType !== "none") {
        ctx.strokeStyle = "#ff5ebb";
        ctx.lineWidth = 6 * px;
        ctx.setLineDash([15 * px, 10 * px]);
        ctx.lineJoin = "round";
        if (st.cutLineType === "rounded" || st.cutLineType === "rounded_inside") {
          ctx.beginPath();
          roundedRectPath(ctx, cutX, cutY, cutW, cutH, cutR);
          ctx.closePath();
          ctx.stroke();
        } else if (st.cutLineType === "circle" || st.cutLineType === "circle_inside") {
          ctx.beginPath();
          ctx.ellipse(0, 0, drawW / 2 + offsetPx, drawH / 2 + offsetPx, 0, 0, 2 * Math.PI);
          ctx.closePath();
          ctx.stroke();
        } else if (st.contourPolygons && st.contourPolygons.length > 0) {
          st.contourPolygons.forEach((poly) => {
            if (poly.length < 2) return;
            ctx.beginPath();
            ctx.moveTo(relX + poly[0].x * drawW, relY + poly[0].y * drawH);
            for (let i = 1; i < poly.length; i++) {
              ctx.lineTo(relX + poly[i].x * drawW, relY + poly[i].y * drawH);
            }
            ctx.closePath();
            ctx.stroke();
          });
        } else {
          ctx.strokeRect(relX, relY, drawW, drawH);
        }
        ctx.setLineDash([]);
      }

      const img = images.get(st.id);
      if (img) {
        ctx.save();
        const imgRadius = 2.5 * MM_TO_PX;
        ctx.beginPath();
        roundedRectPath(ctx, relX, relY, drawW, drawH, imgRadius);
        ctx.closePath();
        ctx.clip();

        const isInsideCut =
          st.cutLineType === "rounded_inside" ||
          st.cutLineType === "circle_inside" ||
          st.cutLineType === "contour_inside";
        if (mode === "normal" && isInsideCut) {
          ctx.save();
          ctx.beginPath();
          if (st.cutLineType === "rounded_inside") {
            roundedRectPath(ctx, cutX, cutY, cutW, cutH, cutR);
          } else if (st.cutLineType === "circle_inside") {
            ctx.ellipse(0, 0, drawW / 2 + offsetPx, drawH / 2 + offsetPx, 0, 0, 2 * Math.PI);
          } else if (st.contourPolygons && st.contourPolygons.length > 0) {
            traceContour();
          } else {
            ctx.rect(relX, relY, drawW, drawH);
          }
          ctx.closePath();
          ctx.clip();
          ctx.drawImage(img, relX, relY, drawW, drawH);
          ctx.restore();
        } else {
          ctx.drawImage(img, relX, relY, drawW, drawH);
        }
        ctx.restore();
      }
    }

    ctx.restore();
  }

  return canvas;
}

/**
 * Arkusz „jak na zdjęciu": białe podłoże winylu pod każdą naklejką, delikatny
 * cień i szara linia cięcia — płaski etap wizualizacji 3D z kreatora.
 * Z niego powstają miniatury gotowych arkuszy.
 */
export async function renderRealisticSheet(
  stickers: PlacedSticker[],
  widthPx: number
): Promise<HTMLCanvasElement> {
  const A4_W = Math.round(widthPx);
  const A4_H = Math.round(widthPx * A4_RATIO);
  const MM_TO_PX = A4_W / 210;
  const px = A4_W / A4_PRINT_WIDTH_PX;

  const canvas = document.createElement("canvas");
  canvas.width = A4_W;
  canvas.height = A4_H;
  const ctx = canvas.getContext("2d")!;

  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, A4_W, A4_H);

  const images = await loadAll(stickers);

  for (const st of stickers) {
    const drawX = st.x * MM_TO_PX;
    const drawY = st.y * MM_TO_PX;
    const drawW = st.widthCm * 10 * MM_TO_PX;
    const drawH = st.heightCm * 10 * MM_TO_PX;

    const wMm = st.widthCm * 10;
    const hMm = st.heightCm * 10;
    const isInside =
      st.cutLineType === "rounded_inside" ||
      st.cutLineType === "circle_inside" ||
      st.cutLineType === "contour_inside";
    const offsetMm = isInside ? -0.5 : getCutLineOffsetMm(st.cutLineType, st.widthCm);

    let sx = 1;
    let sy = 1;
    if (st.cutLineType !== "none") {
      sx = (wMm + 2 * offsetMm) / wMm;
      sy = (hMm + 2 * offsetMm) / hMm;
    }

    const defineCutPath = (w: number, h: number) => {
      const type = st.cutLineType;
      ctx.beginPath();
      if (type === "circle" || type === "circle_inside") {
        ctx.ellipse(0, 0, w / 2, h / 2, 0, 0, 2 * Math.PI);
      } else if (type === "contour" || type === "contour_inside") {
        // Punkty obrysu są względne do surowej grafiki i mają już wtopiony odstęp.
        if (st.contourPolygons && st.contourPolygons.length > 0) {
          st.contourPolygons.forEach((poly) => {
            if (poly.length < 2) return;
            ctx.moveTo((poly[0].x - 0.5) * drawW, (poly[0].y - 0.5) * drawH);
            for (let i = 1; i < poly.length; i++) {
              ctx.lineTo((poly[i].x - 0.5) * drawW, (poly[i].y - 0.5) * drawH);
            }
          });
        } else {
          ctx.rect(-drawW / 2, -drawH / 2, drawW, drawH);
        }
      } else {
        roundedRectPath(ctx, -w / 2, -h / 2, w, h, w * 0.05);
      }
      ctx.closePath();
    };

    // Cień pod naklejką.
    ctx.save();
    ctx.translate(drawX + drawW / 2, drawY + drawH / 2);
    ctx.rotate(((st.rotation || 0) * Math.PI) / 180);
    ctx.translate(0.4 * MM_TO_PX, 0.6 * MM_TO_PX);
    defineCutPath(drawW * sx, drawH * sy);
    ctx.fillStyle = "rgba(0, 0, 0, 0.05)";
    ctx.filter = `blur(${Math.max(1, 3 * px)}px)`;
    ctx.fill();
    ctx.filter = "none";
    ctx.restore();

    // Podłoże, grafika i linia cięcia.
    ctx.save();
    ctx.translate(drawX + drawW / 2, drawY + drawH / 2);
    ctx.rotate(((st.rotation || 0) * Math.PI) / 180);
    ctx.fillStyle = "#ffffff";
    defineCutPath(drawW * sx, drawH * sy);
    ctx.fill();

    const img = images.get(st.id);
    if (img) {
      ctx.save();
      defineCutPath(drawW * sx, drawH * sy);
      ctx.clip();
      ctx.drawImage(img, -drawW / 2, -drawH / 2, drawW, drawH);
      ctx.restore();
    }

    if (st.cutLineType !== "none") {
      ctx.strokeStyle = "#cbd5e1";
      ctx.lineWidth = Math.max(1, 0.3 * MM_TO_PX);
      defineCutPath(drawW * sx, drawH * sy);
      ctx.stroke();
    }
    ctx.restore();
  }

  return canvas;
}
