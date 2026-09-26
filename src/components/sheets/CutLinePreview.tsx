"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

import type { CutLineType } from "@/lib/sheets/types";
import { getCutLineOffsetMm } from "@/lib/utils/collision";
import { getContourPoints } from "@/lib/utils/contour";
import { getRenderImageUrl } from "@/lib/utils/transparentBackground";

/** Zapas wokół grafiki na linię cięcia — największy odstęp konturu to 7 mm. */
const PAD_MM = 8;
/** Promień narożnika prostokątnej linii cięcia, jak w kreatorze (25 px przy 2480 px na A4). */
const ROUNDED_RADIUS_MM = (25 / 2480) * 210;

/**
 * Pojedyncza naklejka z linią cięcia w wybranym rozmiarze — ta sama
 * geometria co na arkuszu (odstęp zależny od szerokości, obrys konturu
 * liczony z grafiki), tylko bez arkusza dookoła.
 */
export function CutLinePreview({
  imageUrl,
  aspectRatio,
  widthCm,
  cutLineType,
  className = "",
}: {
  imageUrl: string;
  aspectRatio: number;
  widthCm: number;
  cutLineType: CutLineType;
  className?: string;
}) {
  const wMm = widthCm * 10;
  const hMm = wMm / aspectRatio;
  const isContour = cutLineType === "contour" || cutLineType === "contour_inside";

  // Wyniki trzymamy razem z kluczem, dla którego powstały — po zmianie
  // grafiki, rozmiaru czy rodzaju linii stary wynik po prostu przestaje pasować.
  const contourKey = `${imageUrl}|${cutLineType}|${wMm}|${hMm}`;
  const [contour, setContour] = useState<{ key: string; polygons: { x: number; y: number }[][] | null } | null>(
    null
  );
  const [rendered, setRendered] = useState<{ key: string; url: string } | null>(null);

  const renderKey = `${imageUrl}|${cutLineType}`;
  const renderUrl = rendered?.key === renderKey ? rendered.url : imageUrl;
  const loading = isContour && contour?.key !== contourKey;
  // W trakcie przeliczania zostaje poprzedni obrys — mniej migania przy suwaku.
  const polygons = isContour ? contour?.polygons ?? null : null;

  useEffect(() => {
    let cancelled = false;
    getRenderImageUrl(imageUrl, cutLineType).then((url) => {
      if (!cancelled) setRendered({ key: renderKey, url });
    });
    return () => {
      cancelled = true;
    };
  }, [imageUrl, cutLineType, renderKey]);

  useEffect(() => {
    if (!isContour) return;
    let cancelled = false;
    // Obrys liczy się chwilę — przy przeciąganiu suwaka czekamy, aż ręka stanie.
    const timer = setTimeout(() => {
      getContourPoints(imageUrl, cutLineType, wMm, hMm)
        .then((result) => {
          if (!cancelled) setContour({ key: contourKey, polygons: result });
        })
        .catch(() => {
          if (!cancelled) setContour({ key: contourKey, polygons: null });
        });
    }, 250);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [imageUrl, cutLineType, isContour, wMm, hMm, contourKey]);

  const offset =
    cutLineType === "none" || isContour ? 0 : getCutLineOffsetMm(cutLineType, widthCm);
  const stroke = {
    fill: "none",
    stroke: "#ff5ebb",
    strokeWidth: 2,
    strokeDasharray: "5 4",
    vectorEffect: "non-scaling-stroke" as const,
  };

  return (
    <div className={`relative rounded-2xl border border-border/60 bg-white ${className}`}>
      <svg
        viewBox={`${-PAD_MM} ${-PAD_MM} ${wMm + 2 * PAD_MM} ${hMm + 2 * PAD_MM}`}
        className="w-full h-full"
        preserveAspectRatio="xMidYMid meet"
        role="img"
        aria-label="Podgląd linii cięcia"
      >
        <image href={renderUrl} x={0} y={0} width={wMm} height={hMm} preserveAspectRatio="none" />
        {(cutLineType === "rounded" || cutLineType === "rounded_inside") && (
          <rect
            x={-offset}
            y={-offset}
            width={wMm + 2 * offset}
            height={hMm + 2 * offset}
            rx={ROUNDED_RADIUS_MM}
            {...stroke}
          />
        )}
        {(cutLineType === "circle" || cutLineType === "circle_inside") && (
          <ellipse cx={wMm / 2} cy={hMm / 2} rx={wMm / 2 + offset} ry={hMm / 2 + offset} {...stroke} />
        )}
        {isContour &&
          polygons?.map((poly, index) => (
            <polygon
              key={index}
              points={poly.map((p) => `${p.x * wMm},${p.y * hMm}`).join(" ")}
              {...stroke}
            />
          ))}
      </svg>
      {isContour && loading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <Loader2 className="w-6 h-6 text-primary animate-spin" aria-hidden />
        </div>
      )}
      {cutLineType === "none" && (
        <p className="absolute bottom-2 inset-x-0 text-center text-[11px] font-black uppercase tracking-wider text-red-400">
          Bez linii cięcia
        </p>
      )}
    </div>
  );
}
