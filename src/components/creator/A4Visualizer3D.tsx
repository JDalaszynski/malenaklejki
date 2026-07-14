"use client";

import React, { useState, useRef } from "react";
import { PlacedSticker } from "@/types/creator";
import { ShoppingCart } from "lucide-react";

interface A4Visualizer3DProps {
  stickers: PlacedSticker[];
  deliveryForm?: "sheet" | "individual";
}

export function A4Visualizer3D({ stickers, deliveryForm = "sheet" }: A4Visualizer3DProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [rotateX, setRotateX] = useState(10); // initial floating tilt
  const [rotateY, setRotateY] = useState(-15);
  const [glarePosition, setGlarePosition] = useState({ x: 50, y: 50 });
  const [isHovered, setIsHovered] = useState(false);

  // Constants (same as 2D Visualizer for scaling)
  const SHEET_WIDTH_MM = 210;
  const SHEET_HEIGHT_MM = 297;
  const MARGIN_MM = 11;

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
      {/* SVG clipPath definitions for contour stickers - placed at root 2D container for browser rendering safety */}
      <svg style={{ position: "absolute", width: 0, height: 0, overflow: "hidden", pointerEvents: "none" }} aria-hidden="true">
        <defs>
          {stickers.map((st) => {
            if (
              (st.cutLineType === "contour" || st.cutLineType === "contour_inside") &&
              st.contourPolygons &&
              st.contourPolygons.length > 0
            ) {
              const wMm = st.widthCm * 10;
              const hMm = st.heightCm * 10;
              const scaleX = (st.cutLineType === "contour" && Math.max(wMm, hMm) * (8 / 120) < 2)
                ? (wMm / 2 + 2) / (wMm / 2 + Math.max(wMm, hMm) * (8 / 120))
                : 1;
              const scaleY = (st.cutLineType === "contour" && Math.max(wMm, hMm) * (8 / 120) < 2)
                ? (hMm / 2 + 2) / (hMm / 2 + Math.max(wMm, hMm) * (8 / 120))
                : 1;

              return (
                <clipPath id={`clip-${st.id}`} clipPathUnits="objectBoundingBox" key={st.id}>
                  {st.contourPolygons.map((poly, idx) => {
                    const pointsStr = poly
                      .map((p) => {
                        const px = 0.5 + (p.x - 0.5) / scaleX;
                        const py = 0.5 + (p.y - 0.5) / scaleY;
                        return `${px},${py}`;
                      })
                      .join(" ");
                    return <polygon key={idx} points={pointsStr} />;
                  })}
                </clipPath>
              );
            }
            return null;
          })}
        </defs>
      </svg>

      {/* 3D Floating Sheet Wrapper */}
      <div
        className={`relative w-full h-full transition-transform duration-300 ease-out overflow-hidden cmyk-preview ${
          deliveryForm === "individual"
            ? "bg-transparent"
            : "bg-[#fcfcfc] border border-border/40 shadow-[0_20px_50px_rgba(0,0,0,0.12),0_10px_20px_rgba(0,0,0,0.06)]"
        }`}
        style={{
          transformStyle: "preserve-3d",
          transform: deliveryForm === "individual"
            ? "none"
            : (isHovered
              ? `rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`
              : `rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1, 1, 1)`),
          backfaceVisibility: "hidden",
        }}
      >
        {/* Subtle physical paper edge (3D thickness look) */}
        {deliveryForm !== "individual" && (
          <div
            className="absolute inset-0 border border-slate-300 pointer-events-none"
            style={{ transform: "translateZ(-1px)" }}
          />
        )}

        {/* Render Stickers with 3D Depth */}
        {stickers.map((st) => {
          const wMm = st.widthCm * 10;
          const hMm = st.heightCm * 10;
          const isInside = st.cutLineType === "rounded_inside" || st.cutLineType === "circle_inside";
          const offsetMm = isInside ? -2 : 2;
          const offsetPercentX = (offsetMm / wMm) * 100;
          const offsetPercentY = (offsetMm / hMm) * 100;

          // Determine scale factors sx and sy
          let sx = 1;
          let sy = 1;

          if (
            st.cutLineType === "rounded" ||
            st.cutLineType === "rounded_inside" ||
            st.cutLineType === "circle" ||
            st.cutLineType === "circle_inside"
          ) {
            sx = (wMm + 2 * offsetMm) / wMm;
            sy = (hMm + 2 * offsetMm) / hMm;
          } else if (st.cutLineType === "contour" || st.cutLineType === "contour_inside") {
            const scaleX = (st.cutLineType === "contour" && Math.max(wMm, hMm) * (8 / 120) < 2)
              ? (wMm / 2 + 2) / (wMm / 2 + Math.max(wMm, hMm) * (8 / 120))
              : 1;
            const scaleY = (st.cutLineType === "contour" && Math.max(wMm, hMm) * (8 / 120) < 2)
              ? (hMm / 2 + 2) / (hMm / 2 + Math.max(wMm, hMm) * (8 / 120))
              : 1;
            sx = scaleX;
            sy = scaleY;
          }

          const getClipPathStyle = () => {
            if (st.cutLineType === "circle" || st.cutLineType === "circle_inside") {
              return "ellipse(50% 50% at 50% 50%)";
            }
            if (st.cutLineType === "rounded" || st.cutLineType === "rounded_inside" || st.cutLineType === "none") {
              return "inset(0% round 1.008cqw)";
            }
            if (
              (st.cutLineType === "contour" || st.cutLineType === "contour_inside") &&
              st.contourPolygons &&
              st.contourPolygons.length > 0
            ) {
              return `url(#clip-${st.id})`;
            }
            return undefined;
          };

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
              {/* Sticker Shadow (cast onto the sheet) */}
              <div
                className="absolute bg-black/9"
                style={{
                  left: "50%",
                  top: "50%",
                  width: `${sx * 100}%`,
                  height: `${sy * 100}%`,
                  transform: "translate(calc(-50% + 0.6px), calc(-50% + 1px)) translateZ(0.05px)",
                  clipPath: getClipPathStyle(),
                  filter: "blur(1.2px)",
                }}
              />

              {/* Contour White Backing (Vinyl Base) - rendered as SVG polygon to ensure solid white background in all browsers */}
              {(st.cutLineType === "contour" || st.cutLineType === "contour_inside") && st.contourPolygons && st.contourPolygons.length > 0 && (
                <svg
                  className="absolute inset-0 w-full h-full pointer-events-none overflow-visible"
                  viewBox="0 0 1 1"
                  preserveAspectRatio="none"
                  style={{
                    transformOrigin: "center",
                    transform: (st.cutLineType === "contour" && Math.max(wMm, hMm) * (8 / 120) < 2)
                      ? `translateZ(0.1px) scaleX(${(wMm / 2 + 2) / (wMm / 2 + Math.max(wMm, hMm) * (8 / 120))}) scaleY(${(hMm / 2 + 2) / (hMm / 2 + Math.max(wMm, hMm) * (8 / 120))})`
                      : "translateZ(0.1px)",
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
                        fill="#ffffff"
                        stroke="none"
                      />
                    );
                  })}
                </svg>
              )}

              {/* Sticker Body (Vinyl base + Image) clipped to cut line */}
              <div
                className="absolute bg-white overflow-hidden"
                style={{
                  left: "50%",
                  top: "50%",
                  width: `${sx * 100}%`,
                  height: `${sy * 100}%`,
                  transform: "translate(-50%, -50%) translateZ(0.15px)",
                  transformStyle: "preserve-3d",
                  clipPath: getClipPathStyle(),
                }}
              >
                {/* Sticker Image */}
                <img
                  src={st.imageUrl}
                  alt="Naklejka"
                  className="absolute select-none object-contain"
                  draggable={false}
                  style={{
                    left: "50%",
                    top: "50%",
                    width: `${(1 / sx) * 100}%`,
                    height: `${(1 / sy) * 100}%`,
                    transform: "translate(-50%, -50%)",
                  }}
                />
              </div>

              {/* Cut Lines floating slightly above sticker */}
              {(st.cutLineType === "contour" || st.cutLineType === "contour_inside") && (
                st.contourPolygons && st.contourPolygons.length > 0 ? (
                  <svg
                    className="absolute inset-0 w-full h-full pointer-events-none overflow-visible"
                    viewBox="0 0 1 1"
                    preserveAspectRatio="none"
                    style={{
                      transformOrigin: "center",
                      transform: (st.cutLineType === "contour" && Math.max(wMm, hMm) * (8 / 120) < 2)
                        ? `translateZ(1px) scaleX(${(wMm / 2 + 2) / (wMm / 2 + Math.max(wMm, hMm) * (8 / 120))}) scaleY(${(hMm / 2 + 2) / (hMm / 2 + Math.max(wMm, hMm) * (8 / 120))})`
                        : "translateZ(1px)",
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
            opacity: deliveryForm === "individual"
              ? (isHovered ? 0.35 : 0)
              : (isHovered ? 0.35 : 0.15),
            mixBlendMode: "color-dodge",
            background: isHovered
              ? `radial-gradient(circle at ${glarePosition.x}% ${glarePosition.y}%, rgba(255, 255, 255, 0.8) 0%, rgba(255, 255, 255, 0.05) 50%, transparent 100%)`
              : `radial-gradient(circle at 30% 20%, rgba(255, 255, 255, 0.6) 0%, rgba(255, 255, 255, 0.05) 60%, transparent 100%)`,
            transform: "translateZ(5px)",
          }}
        />

        {/* Additional linear reflective gloss sweep animation when not hovered */}
        {deliveryForm !== "individual" && !isHovered && (
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
