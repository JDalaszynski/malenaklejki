"use client";

import React, { useRef, useState, useEffect } from "react";
import { PlacedSticker } from "@/types/creator";
import { checkOverlap, getRotatedSize, getCutLineMargins, getOuterMargins, getCutLineBoundingBox } from "@/lib/utils/collision";
import { MoreVertical, Scissors } from "lucide-react";

interface NewA4VisualizerProps {
  stickers: PlacedSticker[];
  selectedStickerId: string | null;
  onSelectSticker: (id: string | null) => void;
  onUpdateStickers: (stickers: PlacedSticker[]) => void;
  onError?: (msg: string | null) => void;
  onEditSticker?: () => void;
  onDuplicateSticker?: () => void;
  onDeleteSticker?: () => void;
  onCutLineChange?: (type: PlacedSticker["cutLineType"]) => void;
  isPresentationMode?: boolean;
}

export function NewA4Visualizer({
  stickers,
  selectedStickerId,
  onSelectSticker,
  onUpdateStickers,
  onError,
  onEditSticker,
  onDuplicateSticker,
  onDeleteSticker,
  onCutLineChange,
  isPresentationMode,
}: NewA4VisualizerProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Quick Menu states
  const [showQuickMenu, setShowQuickMenu] = useState(false);
  const [showCutMenu, setShowCutMenu] = useState(false);
  useEffect(() => {
    setShowQuickMenu(false);
    setShowCutMenu(false);
  }, [selectedStickerId]);
  
  // Drag state
  const [activeDrag, setActiveDrag] = useState<{
    id: string;
    startX: number; // pointer clientX
    startY: number; // pointer clientY
    initX: number; // sticker initial X in mm
    initY: number; // sticker initial Y in mm
  } | null>(null);

  // Resize state
  const [activeResize, setActiveResize] = useState<{
    id: string;
    startX: number; // pointer clientX
    startY: number; // pointer clientY
    initWidthCm: number; // sticker initial width in cm
    initHeightCm: number; // sticker initial height in cm
    aspectRatio: number;
  } | null>(null);

  // Constants
  const SHEET_WIDTH_MM = 210;
  const SHEET_HEIGHT_MM = 297;
  const MARGIN_MM = 10;
  const USABLE_WIDTH_MM = SHEET_WIDTH_MM - 2 * MARGIN_MM; // 190
  const USABLE_HEIGHT_MM = SHEET_HEIGHT_MM - 2 * MARGIN_MM; // 277

  // Presentation State
  const [demoStickers, setDemoStickers] = useState<PlacedSticker[]>([]);

  useEffect(() => {
    if (!isPresentationMode) {
      setDemoStickers([]);
      return;
    }

    const DEMO_SEQUENCE_ROWS: PlacedSticker[][] = [
      [
        { id: "demo-1", imageUrl: "/images/naklejka-2dcb1324.png", x: 20, y: 20, widthCm: 4, heightCm: 4, aspectRatio: 1, rotation: 0, cutLineType: "none" },
        { id: "demo-2", imageUrl: "/images/naklejka-49863c60.png", x: 75, y: 20, widthCm: 4, heightCm: 4, aspectRatio: 1, rotation: 0, cutLineType: "none" },
        { id: "demo-3", imageUrl: "/images/naklejka-72bf19ad.png", x: 130, y: 20, widthCm: 4, heightCm: 4, aspectRatio: 1, rotation: 0, cutLineType: "none" },
      ],
      [
        { id: "demo-4", imageUrl: "/images/naklejka-b118d987.png", x: 25, y: 75, widthCm: 5, heightCm: 5, aspectRatio: 1, rotation: 0, cutLineType: "none" },
        { id: "demo-5", imageUrl: "/images/naklejka-b571e0b1.png", x: 85, y: 75, widthCm: 5, heightCm: 5, aspectRatio: 1, rotation: 0, cutLineType: "none" },
        { id: "demo-6", imageUrl: "/images/naklejka-cba65f42.png", x: 145, y: 75, widthCm: 5, heightCm: 5, aspectRatio: 1, rotation: 0, cutLineType: "none" },
      ],
      [
        { id: "demo-7", imageUrl: "/images/naklejka-daee25aa.png", x: 30, y: 140, widthCm: 6, heightCm: 6, aspectRatio: 1, rotation: 0, cutLineType: "none" },
        { id: "demo-8", imageUrl: "/images/naklejka-2dcb1324.png", x: 120, y: 140, widthCm: 6, heightCm: 6, aspectRatio: 1, rotation: 0, cutLineType: "none" },
      ],
      [
        { id: "demo-9", imageUrl: "/images/naklejka-49863c60.png", x: 20, y: 215, widthCm: 4.5, heightCm: 4.5, aspectRatio: 1, rotation: 0, cutLineType: "none" },
        { id: "demo-10", imageUrl: "/images/naklejka-72bf19ad.png", x: 80, y: 215, widthCm: 4.5, heightCm: 4.5, aspectRatio: 1, rotation: 0, cutLineType: "none" },
        { id: "demo-11", imageUrl: "/images/naklejka-b118d987.png", x: 140, y: 215, widthCm: 4.5, heightCm: 4.5, aspectRatio: 1, rotation: 0, cutLineType: "none" },
      ]
    ];

    let timeoutId: NodeJS.Timeout;
    
    const runDemo = (rowIndex: number) => {
      if (rowIndex < DEMO_SEQUENCE_ROWS.length) {
        const nextRow = DEMO_SEQUENCE_ROWS[rowIndex];
        setDemoStickers(prev => [...prev, ...nextRow]);
        timeoutId = setTimeout(() => runDemo(rowIndex + 1), 800);
      } else {
        timeoutId = setTimeout(() => {
          setDemoStickers([]);
          timeoutId = setTimeout(() => runDemo(0), 400);
        }, 2000);
      }
    };

    runDemo(0);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [isPresentationMode]);

  const displayStickers = isPresentationMode ? demoStickers : stickers;

  const handlePointerDown = (e: React.PointerEvent, sticker: PlacedSticker) => {
    if (isPresentationMode) return;
    e.stopPropagation();
    onSelectSticker(sticker.id);
    onError?.(null);

    setActiveDrag({
      id: sticker.id,
      startX: e.clientX,
      startY: e.clientY,
      initX: sticker.x,
      initY: sticker.y,
    });

    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handleResizeStart = (e: React.PointerEvent, sticker: PlacedSticker) => {
    if (isPresentationMode) return;
    e.stopPropagation();
    onSelectSticker(sticker.id);
    onError?.(null);

    setActiveResize({
      id: sticker.id,
      startX: e.clientX,
      startY: e.clientY,
      initWidthCm: sticker.widthCm,
      initHeightCm: sticker.heightCm,
      aspectRatio: sticker.aspectRatio,
    });

    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    const container = containerRef.current;
    if (!container) return;

    // Scale factor: pixels to mm
    const containerWidthPx = container.clientWidth;
    const pxToMm = SHEET_WIDTH_MM / containerWidthPx;

    if (activeDrag) {
      const dragSticker = stickers.find((s) => s.id === activeDrag.id);
      if (!dragSticker) return;

      const dxPx = e.clientX - activeDrag.startX;
      const dyPx = e.clientY - activeDrag.startY;

      const dxMm = dxPx * pxToMm;
      const dyMm = dyPx * pxToMm;

      const targetX = activeDrag.initX + dxMm;
      const targetY = activeDrag.initY + dyMm;

      const wMm = dragSticker.widthCm * 10;
      const hMm = dragSticker.heightCm * 10;

      const size = getRotatedSize(wMm, hMm, dragSticker.rotation || 0);
      const offsetX = (size.w - wMm) / 2;
      const offsetY = (size.h - hMm) / 2;

      const margins = getOuterMargins(dragSticker);

      const clampedX = Math.max(MARGIN_MM + margins.left, Math.min(SHEET_WIDTH_MM - MARGIN_MM - margins.right, targetX));
      const clampedY = Math.max(MARGIN_MM + margins.top, Math.min(SHEET_HEIGHT_MM - MARGIN_MM - margins.bottom, targetY));

      const otherStickers = stickers.filter((s) => s.id !== dragSticker.id);

      let finalX = dragSticker.x;
      let finalY = dragSticker.y;

      const dragRectX = getCutLineBoundingBox(dragSticker, { x: clampedX, y: dragSticker.y });
      const xCollision = otherStickers.some((other) => {
        return checkOverlap(dragRectX, getCutLineBoundingBox(other), 1.0);
      });

      if (!xCollision) {
        finalX = clampedX;
      }

      const dragRectY = getCutLineBoundingBox(dragSticker, { x: finalX, y: clampedY });
      const yCollision = otherStickers.some((other) => {
        return checkOverlap(dragRectY, getCutLineBoundingBox(other), 1.0);
      });

      if (!yCollision) {
        finalY = clampedY;
      }

      if (finalX !== dragSticker.x || finalY !== dragSticker.y) {
        onUpdateStickers(
          stickers.map((s) =>
            s.id === dragSticker.id ? { ...s, x: finalX, y: finalY } : s
          )
        );
      }
    } else if (activeResize) {
      const resizeSticker = stickers.find((s) => s.id === activeResize.id);
      if (!resizeSticker) return;

      const dxPx = e.clientX - activeResize.startX;
      const dxMm = dxPx * pxToMm;
      const dxCm = dxMm / 10;

      let targetWidthCm = activeResize.initWidthCm + dxCm;
      targetWidthCm = Math.max(2, Math.min(19, targetWidthCm)); // limit max width to 19cm
      const targetHeightCm = targetWidthCm / activeResize.aspectRatio;

      const otherStickers = stickers.filter((s) => s.id !== resizeSticker.id);

      const testFits = (w: number) => {
        const h = w / activeResize.aspectRatio;
        const wMm = w * 10;
        const hMm = h * 10;
        const size = getRotatedSize(wMm, hMm, resizeSticker.rotation || 0);
        const offsetX = (size.w - wMm) / 2;
        const offsetY = (size.h - hMm) / 2;
        const margins = getOuterMargins(resizeSticker, { widthCm: w, heightCm: h });

        let tx = resizeSticker.x;
        let ty = resizeSticker.y;

        if (tx < MARGIN_MM + margins.left) tx = MARGIN_MM + margins.left;
        if (tx > SHEET_WIDTH_MM - MARGIN_MM - margins.right) tx = SHEET_WIDTH_MM - MARGIN_MM - margins.right;
        if (ty < MARGIN_MM + margins.top) ty = MARGIN_MM + margins.top;
        if (ty > SHEET_HEIGHT_MM - MARGIN_MM - margins.bottom) ty = SHEET_HEIGHT_MM - MARGIN_MM - margins.bottom;

        const fitsIn = 
          tx >= MARGIN_MM + margins.left &&
          tx <= SHEET_WIDTH_MM - MARGIN_MM - margins.right &&
          ty >= MARGIN_MM + margins.top &&
          ty <= SHEET_HEIGHT_MM - MARGIN_MM - margins.bottom;

        if (!fitsIn) return null;

        const rotRect = getCutLineBoundingBox(resizeSticker, {
          x: tx,
          y: ty,
          widthCm: w,
          heightCm: h,
        });

        const collision = otherStickers.some((other) => {
          return checkOverlap(rotRect, getCutLineBoundingBox(other), 1.0);
        });

        if (collision) return null;
        return { x: tx, y: ty, w, h };
      };

      let fitWidthCm = resizeSticker.widthCm;
      let fitHeightCm = resizeSticker.heightCm;
      let fitX = resizeSticker.x;
      let fitY = resizeSticker.y;
      let found = false;

      const result = testFits(targetWidthCm);
      if (result) {
        fitWidthCm = result.w;
        fitHeightCm = result.h;
        fitX = result.x;
        fitY = result.y;
        found = true;
      } else {
        // Binary search for the maximum width that fits
        let low = resizeSticker.widthCm;
        let high = targetWidthCm;
        if (high < low) {
          const shrinkResult = testFits(high);
          if (shrinkResult) {
            fitWidthCm = shrinkResult.w;
            fitHeightCm = shrinkResult.h;
            fitX = shrinkResult.x;
            fitY = shrinkResult.y;
            found = true;
          }
        } else {
          for (let i = 0; i < 8; i++) {
            const mid = (low + high) / 2;
            const midResult = testFits(mid);
            if (midResult) {
              fitWidthCm = midResult.w;
              fitHeightCm = midResult.h;
              fitX = midResult.x;
              fitY = midResult.y;
              low = mid;
              found = true;
            } else {
              high = mid;
            }
          }
        }
      }

      if (found) {
        onUpdateStickers(
          stickers.map((s) =>
            s.id === resizeSticker.id
              ? {
                  ...s,
                  x: fitX,
                  y: fitY,
                  widthCm: Math.round(fitWidthCm * 10) / 10,
                  heightCm: Math.round(fitHeightCm * 10) / 10,
                }
              : s
          )
        );
      } else {
        onError?.("Brak miejsca na zmianę rozmiaru w tym ułożeniu!");
      }
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (activeDrag) {
      setActiveDrag(null);
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    }
    if (activeResize) {
      setActiveResize(null);
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    }
  };

  const handleSheetClick = (e: React.MouseEvent) => {
    if (isPresentationMode) return;
    if (e.target === e.currentTarget) {
      onSelectSticker(null);
      onError?.(null);
    }
  };

  return (
    <div
      ref={containerRef}
      onClick={handleSheetClick}
      className="relative bg-white border border-border/80 shadow-[0_12px_45px_rgba(0,0,0,0.04)] aspect-[210/297] w-full max-w-[480px] rounded-lg select-none cursor-default overflow-hidden transition-all duration-300 hover:shadow-[0_16px_50px_rgba(0,0,0,0.06)]"
      style={{
        containerType: "inline-size",
        transform: "translate3d(0,0,0)",
      }}
    >
      {/* Grid pattern background */}
      <div className="absolute inset-0 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none opacity-60" />

      {/* Safety Margins (10mm) indicator */}
      <div
        className="absolute border-2 border-dashed border-destructive/50 pointer-events-none"
        style={{
          left: `${(MARGIN_MM / SHEET_WIDTH_MM) * 100}%`,
          right: `${(MARGIN_MM / SHEET_WIDTH_MM) * 100}%`,
          top: `${(MARGIN_MM / SHEET_HEIGHT_MM) * 100}%`,
          bottom: `${(MARGIN_MM / SHEET_HEIGHT_MM) * 100}%`,
          borderRadius: "1.008cqw",
        }}
      >
        <span className="absolute top-1 left-2 text-[9px] font-black text-destructive/80 tracking-wider uppercase">
          Margines Bezpieczeństwa
        </span>
      </div>

      {/* Render Stickers */}
      {displayStickers.map((st) => {
        const isSelected = !isPresentationMode && st.id === selectedStickerId;
        const wMm = st.widthCm * 10;
        const hMm = st.heightCm * 10;
        const baseOffsetMm = Math.max(wMm, hMm) * (8 / 120);
        const isInside = st.cutLineType === "rounded_inside" || st.cutLineType === "circle_inside";
        const offsetMm = isInside ? -2 : baseOffsetMm;
        const offsetPercentX = (offsetMm / wMm) * 100;
        const offsetPercentY = (offsetMm / hMm) * 100;

        return (
          <div
            key={st.id}
            onPointerDown={(e) => handlePointerDown(e, st)}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            className={`absolute flex items-center justify-center transition-shadow touch-none ${
              isSelected
                ? "z-30 ring-2 ring-primary ring-offset-2 rounded-none"
                : isPresentationMode
                ? "pointer-events-none rounded-none"
                : "cursor-grab active:cursor-grabbing group hover:ring-1 hover:ring-primary/40 hover:ring-offset-1 rounded-none"
            } ${isPresentationMode ? "animate-in fade-in zoom-in-50 duration-300 ease-out" : ""}`}
            style={{
              left: `${(st.x / SHEET_WIDTH_MM) * 100}%`,
              top: `${(st.y / SHEET_HEIGHT_MM) * 100}%`,
              width: `${(wMm / SHEET_WIDTH_MM) * 100}%`,
              height: `${(hMm / SHEET_HEIGHT_MM) * 100}%`,
              transform: `rotate(${st.rotation || 0}deg)`,
            }}
          >
            <img
              src={st.imageUrl}
              alt="Naklejka"
              draggable={false}
              className="max-w-full max-h-full object-contain pointer-events-none select-none"
              style={{
                borderRadius: "1.008cqw",
              }}
            />

            {/* Cut line visualizer */}
            {(st.cutLineType === "contour" || st.cutLineType === "contour_inside") && (
              st.contourPolygons && st.contourPolygons.length > 0 ? (
                <svg
                  className="absolute inset-0 w-full h-full pointer-events-none overflow-visible animate-pulse z-10"
                  viewBox="0 0 1 1"
                  preserveAspectRatio="none"
                  style={{
                    filter: "drop-shadow(0 0 2px #ff5ebb)",
                  }}
                >
                  {st.contourPolygons.map((poly, idx) => {
                    const pointsStr = poly
                      .map((p) => `${p.x},${p.y}`)
                      .join(" ");
                    return (
                      <polygon
                        key={idx}
                        points={pointsStr}
                        fill="none"
                        stroke="#ff5ebb"
                        strokeWidth="2"
                        strokeDasharray="4 3"
                        vectorEffect="non-scaling-stroke"
                      />
                    );
                  })}
                </svg>
              ) : (
                <div
                  className="absolute inset-0 pointer-events-none rounded-lg border border-dashed border-[#ff5ebb] animate-pulse z-10"
                  style={{
                    filter: "drop-shadow(0 0 2px #ff5ebb)",
                  }}
                />
              )
            )}
            {(st.cutLineType === "rounded" || st.cutLineType === "rounded_inside") && (
              <div
                className="absolute pointer-events-none border-2 border-dashed border-[#ff5ebb] animate-pulse z-10"
                style={{
                  left: `${-offsetPercentX}%`,
                  right: `${-offsetPercentX}%`,
                  top: `${-offsetPercentY}%`,
                  bottom: `${-offsetPercentY}%`,
                  borderRadius: "1.008cqw",
                  filter: "drop-shadow(0 0 2px #ff5ebb)",
                }}
              />
            )}
            {(st.cutLineType === "circle" || st.cutLineType === "circle_inside") && (
              <div
                className="absolute pointer-events-none rounded-[50%] border-2 border-dashed border-[#ff5ebb] animate-pulse z-10"
                style={{
                  left: `${-offsetPercentX}%`,
                  right: `${-offsetPercentX}%`,
                  top: `${-offsetPercentY}%`,
                  bottom: `${-offsetPercentY}%`,
                  filter: "drop-shadow(0 0 2px #ff5ebb)",
                }}
              />
            )}

            {/* Quick Action Badges on hover */}
            {isSelected && (
              <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-[10px] font-extrabold px-2 py-0.5 rounded-md shadow-md pointer-events-none">
                {st.widthCm} cm
              </div>
            )}

            {/* Quick Action Menu Button */}
            {isSelected && (
              <div 
                className="absolute top-0 left-0 -translate-x-1/2 -translate-y-1/2 z-[45] pointer-events-auto"
                style={{ transform: `rotate(${-(st.rotation || 0)}deg)` }}
              >
                <button
                  type="button"
                  onPointerDown={(e) => e.stopPropagation()}
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowQuickMenu(!showQuickMenu);
                  }}
                  className="w-6 h-6 rounded-full bg-white text-foreground hover:bg-muted border border-border flex items-center justify-center shadow-md active:scale-95 transition-transform"
                  title="Opcje naklejki"
                >
                  <MoreVertical className="w-3.5 h-3.5" />
                </button>
                {showQuickMenu && (
                  <div
                    onPointerDown={(e) => e.stopPropagation()}
                    className="absolute top-7 left-0 bg-background border border-border rounded-xl shadow-lg py-1.5 min-w-[100px] z-50 text-left"
                  >
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowQuickMenu(false);
                        onEditSticker?.();
                      }}
                      className="w-full text-left px-3 py-1.5 text-xs font-bold hover:bg-muted text-foreground transition-colors"
                    >
                      Edytuj
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowQuickMenu(false);
                        onDuplicateSticker?.();
                      }}
                      className="w-full text-left px-3 py-1.5 text-xs font-bold hover:bg-muted text-foreground transition-colors"
                    >
                      Zduplikuj
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowQuickMenu(false);
                        onDeleteSticker?.();
                      }}
                      className="w-full text-left px-3 py-1.5 text-xs font-bold hover:bg-muted text-destructive transition-colors"
                    >
                      Usuń
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Cut Line Selection Menu Button */}
            {isSelected && (
              <div 
                className="absolute top-0 right-0 translate-x-1/2 -translate-y-1/2 z-[45] pointer-events-auto"
                style={{ transform: `rotate(${-(st.rotation || 0)}deg)` }}
              >
                <button
                  type="button"
                  onPointerDown={(e) => e.stopPropagation()}
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowCutMenu(!showCutMenu);
                  }}
                  className="w-6 h-6 rounded-full bg-white text-foreground hover:bg-muted border border-border flex items-center justify-center shadow-md active:scale-95 transition-transform"
                  title="Wybierz linię cięcia"
                >
                  <Scissors className="w-3.5 h-3.5" />
                </button>
                {showCutMenu && (
                  <div
                    onPointerDown={(e) => e.stopPropagation()}
                    className="absolute top-7 right-0 bg-background border border-border rounded-xl shadow-lg py-1.5 min-w-[100px] z-50 text-left"
                  >
                    {[
                      { type: "none", label: "Brak" },
                      { type: "contour", label: "Kontur" },
                      { type: "rounded", label: "Prostokąt" },
                      { type: "circle", label: "Koło" },
                      { type: "rounded_inside", label: "Prostokąt wew." },
                      { type: "circle_inside", label: "Koło wew." },
                    ].map((opt) => (
                      <button
                        key={opt.type}
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowCutMenu(false);
                          onCutLineChange?.(opt.type as any);
                        }}
                        className={`w-full text-left px-3 py-1.5 text-xs font-bold hover:bg-muted transition-colors ${
                          st.cutLineType === opt.type ? "text-primary bg-primary/5" : "text-foreground"
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Scale Handle on Selected Sticker */}
            {isSelected && (
              <div
                onPointerDown={(e) => handleResizeStart(e, st)}
                className="absolute right-0 bottom-0 translate-x-1/2 translate-y-1/2 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center cursor-se-resize shadow-md hover:scale-110 active:scale-95 transition-transform z-40 border-2 border-white select-none pointer-events-auto touch-none"
                title="Przeciągnij, aby zmienić rozmiar"
              >
                <svg
                  className="w-3.5 h-3.5 rotate-45 text-white"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 15L12 18.75 15.75 15m-7.5-6L12 5.25 15.75 9" />
                </svg>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
