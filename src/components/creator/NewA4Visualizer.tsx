"use client";

import React, { useRef, useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { PlacedSticker } from "@/types/creator";
import { checkOverlap, getRotatedSize, getCutLineMargins, getOuterMargins, getCutLineBoundingBox, checkStickersCollision } from "@/lib/utils/collision";
import { MoreVertical, Scissors, RotateCw, Crop, Copy, Trash2, Ban, Sparkles, Square, Circle } from "lucide-react";

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
  onRotationChange?: (degrees: number) => void;
  isPresentationMode?: boolean;
  overlappingStickerIds?: string[];
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
  onRotationChange,
  isPresentationMode,
  overlappingStickerIds = [],
}: NewA4VisualizerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const selectedSticker = stickers.find((s) => s.id === selectedStickerId);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Quick Menu states
  const [showQuickMenu, setShowQuickMenu] = useState(false);
  const [showCutMenu, setShowCutMenu] = useState(false);
  const [showRotationMenu, setShowRotationMenu] = useState(false);

  useEffect(() => {
    setShowQuickMenu(false);
    setShowCutMenu(false);
    setShowRotationMenu(false);
  }, [selectedStickerId]);

  const toggleQuickMenu = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowQuickMenu(prev => {
      const next = !prev;
      if (next) {
        setShowCutMenu(false);
        setShowRotationMenu(false);
      }
      return next;
    });
  };

  const toggleCutMenu = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowCutMenu(prev => {
      const next = !prev;
      if (next) {
        setShowQuickMenu(false);
        setShowRotationMenu(false);
      }
      return next;
    });
  };

  const toggleRotationMenu = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowRotationMenu(prev => {
      const next = !prev;
      if (next) {
        setShowQuickMenu(false);
        setShowCutMenu(false);
      }
      return next;
    });
  };

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

      const otherStickers = stickers.filter((s) => s.id !== dragSticker.id);

      let snapX = targetX;
      let snapY = targetY;
      const SNAP_DIST = 4; // mm
      const PAD = 1.0; // mm

      const dragLeft = targetX - margins.left;
      const dragRight = targetX + margins.right;
      const dragTop = targetY - margins.top;
      const dragBottom = targetY + margins.bottom;

      let minDiffX = SNAP_DIST;
      let minDiffY = SNAP_DIST;

      otherStickers.forEach(other => {
        const otherMargins = getOuterMargins(other);
        const otherLeft = other.x - otherMargins.left;
        const otherRight = other.x + otherMargins.right;
        const otherTop = other.y - otherMargins.top;
        const otherBottom = other.y + otherMargins.bottom;

        // Snap X
        let diff = Math.abs(dragRight - (otherLeft - PAD));
        if (diff < minDiffX) {
           minDiffX = diff;
           snapX = otherLeft - PAD - margins.right;
        }
        diff = Math.abs(dragLeft - (otherRight + PAD));
        if (diff < minDiffX) {
           minDiffX = diff;
           snapX = otherRight + PAD + margins.left;
        }
        // Align centers on X if close
        diff = Math.abs(targetX - other.x);
        if (diff < minDiffX) {
           minDiffX = diff;
           snapX = other.x;
        }
        
        // Snap Y
        diff = Math.abs(dragBottom - (otherTop - PAD));
        if (diff < minDiffY) {
           minDiffY = diff;
           snapY = otherTop - PAD - margins.bottom;
        }
        diff = Math.abs(dragTop - (otherBottom + PAD));
        if (diff < minDiffY) {
           minDiffY = diff;
           snapY = otherBottom + PAD + margins.top;
        }
        // Align centers on Y if close
        diff = Math.abs(targetY - other.y);
        if (diff < minDiffY) {
           minDiffY = diff;
           snapY = other.y;
        }
      });

      let finalX = Math.max(MARGIN_MM + margins.left, Math.min(SHEET_WIDTH_MM - MARGIN_MM - margins.right, snapX));
      let finalY = Math.max(MARGIN_MM + margins.top, Math.min(SHEET_HEIGHT_MM - MARGIN_MM - margins.bottom, snapY));

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
      className="relative bg-white border border-border/80 shadow-[0_15px_45px_rgba(0,71,73,0.08),_0_4px_12px_rgba(0,71,73,0.03)] dark:shadow-[0_15px_45px_rgba(0,0,0,0.35),_0_4px_12px_rgba(0,0,0,0.2)] aspect-[210/297] w-full max-w-[480px] rounded-lg select-none cursor-default overflow-hidden transition-all duration-300 hover:shadow-[0_22px_60px_rgba(0,71,73,0.14),_0_6px_20px_rgba(0,71,73,0.05)] dark:hover:shadow-[0_22px_60px_rgba(0,0,0,0.45),_0_6px_20px_rgba(0,0,0,0.25)]"
      style={{
        containerType: "inline-size",
        transform: "translate3d(0,0,0)",
      }}
    >
      {/* Grid pattern background */}
      <div className="absolute inset-0 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none opacity-60" />

      {/* Safety Margins (10mm) indicator */}
      <div
        className="absolute border-2 border-dashed border-destructive/50 pointer-events-none z-20"
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
        const baseOffsetMm = Math.max(3, Math.max(wMm, hMm) * (8 / 120));
        const isInside = st.cutLineType === "rounded_inside" || st.cutLineType === "circle_inside";
        const offsetMm = isInside ? -2 : baseOffsetMm;
        const offsetPercentX = (offsetMm / wMm) * 100;
        const offsetPercentY = (offsetMm / hMm) * 100;

        return (
          <React.Fragment key={st.id}>
            <div
              onPointerDown={(e) => handlePointerDown(e, st)}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              className={`absolute flex items-center justify-center transition-shadow touch-none ${isSelected
                ? (showQuickMenu || showCutMenu || showRotationMenu ? "z-[60]" : "z-30") + " ring-2 ring-primary ring-offset-2 rounded-none"
                : isPresentationMode
                  ? "pointer-events-none rounded-none"
                  : overlappingStickerIds.includes(st.id) 
                    ? "cursor-grab active:cursor-grabbing group ring-2 ring-red-500 ring-offset-2 shadow-[0_0_15px_rgba(239,68,68,0.6)] z-20 rounded-none animate-pulse"
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
                      transformOrigin: "center",
                      transform: (st.cutLineType === "contour" && Math.max(wMm, hMm) * (8 / 120) < 3) 
                        ? `scaleX(${(wMm/2 + 3) / (wMm/2 + Math.max(wMm, hMm) * (8/120))}) scaleY(${(hMm/2 + 3) / (hMm/2 + Math.max(wMm, hMm) * (8/120))})` 
                        : "none",
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
                    left: "50%",
                    top: "50%",
                    width: `calc(100% + ${2 * offsetPercentX}%)`,
                    height: `calc(100% + ${2 * offsetPercentY}%)`,
                    borderRadius: "1.008cqw",
                    transform: "translate(-50%, -50%)",
                    filter: "drop-shadow(0 0 2px #ff5ebb)",
                  }}
                />
              )}
              {(st.cutLineType === "circle" || st.cutLineType === "circle_inside") && (
                <div
                  className="absolute pointer-events-none border-2 border-dashed border-[#ff5ebb] rounded-[50%] animate-pulse z-10"
                  style={{
                    left: "50%",
                    top: "50%",
                    width: `calc(100% + ${2 * offsetPercentX}%)`,
                    height: `calc(100% + ${2 * offsetPercentY}%)`,
                    transform: "translate(-50%, -50%)",
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
                  className={`absolute top-0 left-0 -translate-x-1/2 -translate-y-1/2 ${showQuickMenu ? "z-[70]" : "z-[40]"} pointer-events-auto`}
                  style={{ transform: `rotate(${-(st.rotation || 0)}deg)` }}
                >
                  <button
                    type="button"
                    onPointerDown={(e) => e.stopPropagation()}
                    onClick={toggleQuickMenu}
                    className="w-6 h-6 rounded-full bg-background text-foreground hover:bg-muted border border-border flex items-center justify-center shadow-md active:scale-95 transition-transform"
                    title="Opcje naklejki"
                  >
                    <MoreVertical className="w-3.5 h-3.5" />
                  </button>
                  {showQuickMenu && (
                    <div
                      onPointerDown={(e) => e.stopPropagation()}
                      className="hidden sm:block absolute top-7 left-0 bg-background border border-border rounded-xl shadow-lg py-1.5 min-w-[140px] z-[80] text-left"
                    >
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowQuickMenu(false);
                          onEditSticker?.();
                        }}
                        className="w-full text-left px-3 py-1.5 text-xs font-bold hover:bg-muted text-foreground transition-colors whitespace-nowrap"
                      >
                        Kadruj/Usuń tło
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowQuickMenu(false);
                          onDuplicateSticker?.();
                        }}
                        className="w-full text-left px-3 py-1.5 text-xs font-bold hover:bg-muted text-foreground transition-colors whitespace-nowrap"
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
                        className="w-full text-left px-3 py-1.5 text-xs font-bold hover:bg-muted text-destructive transition-colors whitespace-nowrap"
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
                  className={`absolute top-0 right-0 translate-x-1/2 -translate-y-1/2 ${showCutMenu ? "z-[70]" : "z-[40]"} pointer-events-auto`}
                  style={{ transform: `rotate(${-(st.rotation || 0)}deg)` }}
                >
                  <button
                    type="button"
                    onPointerDown={(e) => e.stopPropagation()}
                    onClick={toggleCutMenu}
                    className={`w-6 h-6 rounded-full flex items-center justify-center shadow-md active:scale-95 transition-all duration-300 border ${
                      st.cutLineType === "none"
                        ? "bg-red-400 text-white border-red-400 hover:bg-red-500 red-shadow-pulse z-50"
                        : "bg-background text-foreground hover:bg-muted border-border"
                    }`}
                    title="Wybierz linię cięcia"
                  >
                    <Scissors className="w-3.5 h-3.5" />
                  </button>
                  {showCutMenu && (
                    <div
                      onPointerDown={(e) => e.stopPropagation()}
                      className="hidden sm:block absolute top-7 right-0 bg-background border border-border rounded-xl shadow-lg py-1.5 w-[135px] z-[80] text-left"
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
                          className={`w-full text-left px-3 py-1.5 text-xs font-bold hover:bg-muted transition-colors whitespace-nowrap ${st.cutLineType === opt.type ? "text-primary bg-primary/5" : "text-foreground"
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

            {/* Rotation Menu Button (Bottom-Left in static Sheet coordinates) */}
            {isSelected && (
              <div
                className={`absolute ${showRotationMenu ? "z-[70]" : "z-[40]"} pointer-events-auto`}
                style={{
                  left: `${(st.x / SHEET_WIDTH_MM) * 100}%`,
                  top: `${((st.y + hMm) / SHEET_HEIGHT_MM) * 100}%`,
                  transform: "translate(-50%, -50%)",
                }}
              >
                <button
                  type="button"
                  onPointerDown={(e) => e.stopPropagation()}
                  onClick={toggleRotationMenu}
                  className="w-6 h-6 rounded-full bg-background text-foreground hover:bg-muted border border-border flex items-center justify-center shadow-md active:scale-95 transition-transform"
                  title="Obróć naklejkę"
                >
                  <RotateCw className="w-3.5 h-3.5" />
                </button>
                {showRotationMenu && (
                  <div
                    onPointerDown={(e) => e.stopPropagation()}
                    className="hidden sm:block absolute bottom-7 left-0 bg-background border border-border rounded-xl shadow-lg p-3 min-w-[160px] z-[80] text-left flex flex-col gap-2"
                  >
                    <div className="flex justify-between items-center text-[10px] font-bold text-foreground whitespace-nowrap">
                      <span>Obrót</span>
                      <span className="text-primary font-black">{st.rotation || 0}°</span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={360}
                      step={1}
                      value={st.rotation || 0}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        onRotationChange?.(val);
                      }}
                      className="w-full h-1.5 bg-foreground/10 dark:bg-muted-foreground/40 rounded-lg appearance-none cursor-pointer accent-primary focus:outline-none"
                    />
                    <div className="flex gap-1 justify-between mt-1">
                      {[0, 90, 180, 270].map((deg) => (
                        <button
                          key={deg}
                          type="button"
                          onClick={() => {
                            onRotationChange?.(deg);
                          }}
                          className={`text-[9px] font-black px-1.5 py-0.5 rounded border transition-colors cursor-pointer ${(st.rotation || 0) === deg
                            ? "bg-primary text-primary-foreground border-primary"
                            : "bg-muted hover:bg-muted/80 text-muted-foreground border-transparent"
                            }`}
                        >
                          {deg}°
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* No Cut Line Minimalist Warning Label (Centered under unrotated sticker boundaries) */}
            {st.cutLineType === "none" && (
              <div
                className="absolute font-black text-red-400/90 dark:text-red-400/85 whitespace-nowrap z-25 pointer-events-none uppercase tracking-wider text-center"
                style={{
                  left: `${((st.x + wMm / 2) / SHEET_WIDTH_MM) * 100}%`,
                  top: `${((st.y + hMm + 6) / SHEET_HEIGHT_MM) * 100}%`,
                  transform: "translateX(-50%)",
                  fontSize: `${Math.max(6, st.widthCm * 1.6)}px`,
                }}
              >
                Ustaw linię cięcia
              </div>
            )}
          </React.Fragment>
        );
      })}

      {/* MOBILE BOTTOM DRAWER */}
      {isMounted && selectedSticker && (showQuickMenu || showCutMenu || showRotationMenu) && createPortal(
        <div className="fixed inset-x-0 bottom-0 z-[100] sm:hidden flex flex-col justify-end">
          {/* Backdrop (Fully transparent with no blur, captures clicks to close menu) */}
          <div
            className="fixed inset-0 bg-transparent"
            onClick={() => {
              setShowQuickMenu(false);
              setShowCutMenu(false);
              setShowRotationMenu(false);
            }}
          />
          {/* Bottom Sheet */}
          <div className="relative bg-background border-t border-border rounded-t-3xl px-6 pb-8 pt-4 shadow-2xl z-10 flex flex-col animate-in slide-in-from-bottom duration-300 ease-out animate-duration-200">
            {/* Handle */}
            <div className="w-12 h-1 bg-muted rounded-full mx-auto mb-5" />

            {/* Content based on active menu */}
            {showQuickMenu && (
              <div className="flex flex-col gap-3">
                <h3 className="text-sm font-black text-muted-foreground uppercase tracking-wider mb-1">Opcje naklejki</h3>
                <button
                  type="button"
                  onClick={() => {
                    setShowQuickMenu(false);
                    onEditSticker?.();
                  }}
                  className="w-full py-3.5 px-4 bg-muted hover:bg-muted/80 rounded-2xl text-sm font-extrabold text-foreground transition-all flex items-center gap-3"
                >
                  <Crop className="w-5 h-5 text-muted-foreground" />
                  <span>Kadruj / Usuń Tło</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowQuickMenu(false);
                    onDuplicateSticker?.();
                  }}
                  className="w-full py-3.5 px-4 bg-muted hover:bg-muted/80 rounded-2xl text-sm font-extrabold text-foreground transition-all flex items-center gap-3"
                >
                  <Copy className="w-5 h-5 text-muted-foreground" />
                  <span>Zduplikuj naklejkę</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowQuickMenu(false);
                    onDeleteSticker?.();
                  }}
                  className="w-full py-3.5 px-4 bg-destructive/10 hover:bg-destructive/20 rounded-2xl text-sm font-extrabold text-destructive transition-all flex items-center gap-3"
                >
                  <Trash2 className="w-5 h-5 text-destructive" />
                  <span>Usuń naklejkę</span>
                </button>
              </div>
            )}

            {showCutMenu && (
              <div className="flex flex-col gap-3">
                <h3 className="text-sm font-black text-muted-foreground uppercase tracking-wider mb-1">Wybierz linię cięcia</h3>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { type: "none", label: "Brak", icon: Ban },
                    { type: "contour", label: "Kontur", icon: Sparkles },
                    { type: "rounded", label: "Prostokąt", icon: Square },
                    { type: "circle", label: "Koło", icon: Circle },
                    { type: "rounded_inside", label: "Prostokąt wew.", icon: Square },
                    { type: "circle_inside", label: "Koło wew.", icon: Circle },
                  ].map((opt) => {
                    const isActive = selectedSticker.cutLineType === opt.type;
                    const Icon = opt.icon;
                    return (
                      <button
                        key={opt.type}
                        type="button"
                        onClick={() => {
                          setShowCutMenu(false);
                          onCutLineChange?.(opt.type as any);
                        }}
                        className={`py-3 px-4 rounded-xl text-xs font-bold transition-all border flex items-center justify-center gap-2 ${isActive
                          ? "bg-primary text-primary-foreground border-primary shadow-sm"
                          : "bg-muted hover:bg-muted/80 border-transparent text-foreground"
                          }`}
                      >
                        <Icon className="w-4 h-4 flex-shrink-0" />
                        <span>{opt.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {showRotationMenu && (
              <div className="flex flex-col gap-4">
                <div className="flex justify-between items-center mb-1">
                  <div className="flex items-center gap-2">
                    <RotateCw className="w-4 h-4 text-muted-foreground" />
                    <h3 className="text-sm font-black text-muted-foreground uppercase tracking-wider">Obrót naklejki</h3>
                  </div>
                  <span className="text-sm font-black text-primary">{selectedSticker.rotation || 0}°</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={360}
                  step={1}
                  value={selectedSticker.rotation || 0}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    onRotationChange?.(val);
                  }}
                  className="w-full h-2 bg-foreground/10 dark:bg-muted-foreground/40 rounded-lg appearance-none cursor-pointer accent-primary focus:outline-none"
                />
                <div className="grid grid-cols-4 gap-2 mt-1">
                  {[0, 90, 180, 270].map((deg) => (
                    <button
                      key={deg}
                      type="button"
                      onClick={() => {
                        onRotationChange?.(deg);
                      }}
                      className={`py-2 px-3 rounded-lg text-xs font-bold border transition-all ${(selectedSticker.rotation || 0) === deg
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-muted border-transparent text-foreground"
                        }`}
                    >
                      {deg}°
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
