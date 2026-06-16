"use client";

import React, { useState, useRef } from "react";
import { PlacedSticker } from "@/types/creator";
import { ShoppingCart } from "lucide-react";

interface A4Visualizer3DProps {
  stickers: PlacedSticker[];
}

export function A4Visualizer3D({ stickers }: A4Visualizer3DProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [rotateX, setRotateX] = useState(10); // initial floating tilt
  const [rotateY, setRotateY] = useState(-15);
  const [glarePosition, setGlarePosition] = useState({ x: 50, y: 50 });
  const [isHovered, setIsHovered] = useState(false);

  // Constants (same as 2D Visualizer for scaling)
  const SHEET_WIDTH_MM = 210;
  const SHEET_HEIGHT_MM = 297;
  const MARGIN_MM = 10;

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const container = containerRef.current;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;

    // Position of mouse relative to center of container, normalized from -0.5 to 0.5
    const mouseX = (e.clientX - rect.left) / width - 0.5;
    const mouseY = (e.clientY - rect.top) / height - 0.5;

    // Rotate up to 25 degrees
    const rX = -mouseY * 30;
    const rY = mouseX * 30;

    setRotateX(rX);
    setRotateY(rY);

    // Glare position from 0 to 100
    const glareX = ((e.clientX - rect.left) / width) * 100;
    const glareY = ((e.clientY - rect.top) / height) * 100;
    setGlarePosition({ x: glareX, y: glareY });
  };

  const handlePointerEnter = () => {
    setIsHovered(true);
  };

  const handlePointerLeave = () => {
    setIsHovered(false);
    // Smooth reset to floating view
    setRotateX(10);
    setRotateY(-15);
  };

  return (
    <div
      ref={containerRef}
      onPointerMove={handlePointerMove}
      onPointerEnter={handlePointerEnter}
      onPointerLeave={handlePointerLeave}
      className="relative w-full max-w-[480px] aspect-[210/297] flex items-center justify-center cursor-default select-none overflow-visible touch-none"
      style={{
        perspective: "1200px",
        containerType: "inline-size",
      }}
    >
      {/* 3D Floating Sheet Wrapper */}
      <div
        className="relative w-full h-full bg-white transition-transform duration-300 ease-out shadow-[0_20px_50px_rgba(0,0,0,0.12),0_10px_20px_rgba(0,0,0,0.06)] border border-border/40 overflow-hidden cmyk-preview"
        style={{
          transformStyle: "preserve-3d",
          transform: isHovered
            ? `rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`
            : `rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1, 1, 1)`,
          backfaceVisibility: "hidden",
        }}
      >
        {/* Subtle physical paper edge (3D thickness look) */}
        <div
          className="absolute inset-0 border border-slate-300 pointer-events-none"
          style={{ transform: "translateZ(-1px)" }}
        />

        {/* Watermarks (znaki wodne) */}
        <div
          className="absolute left-0 right-0 top-0 flex items-center justify-center overflow-hidden pointer-events-none select-none text-secondary/35 font-extrabold tracking-wider whitespace-nowrap"
          style={{
            height: `${(MARGIN_MM / SHEET_HEIGHT_MM) * 100}%`,
            fontSize: "1.5cqw",
            transform: "translateZ(1px)",
          }}
        >
          {Array(50).fill("małe").join(" ")}
        </div>

        <div
          className="absolute left-0 right-0 bottom-0 flex items-center justify-center overflow-hidden pointer-events-none select-none text-secondary/35 font-extrabold tracking-wider whitespace-nowrap"
          style={{
            height: `${(MARGIN_MM / SHEET_HEIGHT_MM) * 100}%`,
            fontSize: "1.5cqw",
            transform: "translateZ(1px)",
          }}
        >
          {Array(35).fill("Naklejki").join(" ")}
        </div>

        {/* Render Stickers with 3D Depth */}
        {stickers.map((st) => {
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
              className="absolute flex items-center justify-center pointer-events-none"
              style={{
                left: `${(st.x / SHEET_WIDTH_MM) * 100}%`,
                top: `${(st.y / SHEET_HEIGHT_MM) * 100}%`,
                width: `${(wMm / SHEET_WIDTH_MM) * 100}%`,
                height: `${(hMm / SHEET_HEIGHT_MM) * 100}%`,
                transform: `rotate(${st.rotation || 0}deg) translateZ(2px)`,
                transformStyle: "preserve-3d",
              }}
            >
              {/* Sticker Image */}
              <img
                src={st.imageUrl}
                alt="Naklejka"
                className="max-w-full max-h-full object-contain select-none"
                draggable={false}
                style={{
                  borderRadius: "1.008cqw",
                }}
              />

              {/* Cut Lines floating slightly above sticker */}
              {(st.cutLineType === "contour" || st.cutLineType === "contour_inside") && (
                st.contourPolygons && st.contourPolygons.length > 0 ? (
                  <svg
                    className="absolute inset-0 w-full h-full pointer-events-none overflow-visible"
                    viewBox="0 0 1 1"
                    preserveAspectRatio="none"
                    style={{
                      transform: "translateZ(1px)",
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
                          stroke="#cbd5e1"
                          strokeWidth="1"
                          vectorEffect="non-scaling-stroke"
                        />
                      );
                    })}
                  </svg>
                ) : (
                  <div
                    className="absolute inset-0 pointer-events-none rounded-lg border border-solid border-slate-300"
                    style={{
                      transform: "translateZ(1px)",
                    }}
                  />
                )
              )}

              {(st.cutLineType === "rounded" || st.cutLineType === "rounded_inside") && (
                <div
                  className="absolute pointer-events-none border border-solid border-slate-300"
                  style={{
                    left: `${-offsetPercentX}%`,
                    right: `${-offsetPercentX}%`,
                    top: `${-offsetPercentY}%`,
                    bottom: `${-offsetPercentY}%`,
                    borderRadius: "1.008cqw",
                    transform: "translateZ(1px)",
                  }}
                />
              )}

              {(st.cutLineType === "circle" || st.cutLineType === "circle_inside") && (
                <div
                  className="absolute pointer-events-none rounded-[50%] border border-solid border-slate-300"
                  style={{
                    left: `${-offsetPercentX}%`,
                    right: `${-offsetPercentX}%`,
                    top: `${-offsetPercentY}%`,
                    bottom: `${-offsetPercentY}%`,
                    transform: "translateZ(1px)",
                  }}
                />
              )}
            </div>
          );
        })}

        {/* Dynamic glossy glare overlay (makes it slightly glossy) */}
        <div
          className="absolute inset-0 pointer-events-none transition-opacity duration-300"
          style={{
            opacity: isHovered ? 0.35 : 0.15,
            mixBlendMode: "color-dodge",
            background: isHovered
              ? `radial-gradient(circle at ${glarePosition.x}% ${glarePosition.y}%, rgba(255, 255, 255, 0.8) 0%, rgba(255, 255, 255, 0.05) 50%, transparent 100%)`
              : `radial-gradient(circle at 30% 20%, rgba(255, 255, 255, 0.6) 0%, rgba(255, 255, 255, 0.05) 60%, transparent 100%)`,
            transform: "translateZ(5px)",
          }}
        />

        {/* Additional linear reflective gloss sweep animation when not hovered */}
        {!isHovered && (
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              mixBlendMode: "overlay",
              background: "linear-gradient(105deg, transparent 30%, rgba(255,255,255,0.1) 40%, rgba(255,255,255,0.4) 45%, rgba(255,255,255,0.1) 50%, transparent 60%)",
              backgroundSize: "200% 100%",
              animation: "glossSweep 5s infinite linear",
              transform: "translateZ(4px)",
            }}
          />
        )}
      </div>
    </div>
  );
}
