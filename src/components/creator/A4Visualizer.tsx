"use client";

import { useEffect, useState, useRef, useMemo } from "react";
import { useCartStore } from "@/store/cartStore";
import { Loader2, ShoppingCart, Minus, Plus, Crop, Download } from "lucide-react";
import { useRouter } from "next/navigation";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "@/lib/firebase/client";

interface A4VisualizerProps {
  imageUrl: string;
  onImageChange?: (url: string) => void;
}

export function A4Visualizer({ imageUrl, onImageChange }: A4VisualizerProps) {
  const router = useRouter();
  const [widthCm, setWidthCm] = useState<number>(5);
  const [imageAspect, setImageAspect] = useState<number | null>(null);
  const [loadedImage, setLoadedImage] = useState<HTMLImageElement | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [sheetQuantity, setSheetQuantity] = useState<number>(1);
  const [showCropModal, setShowCropModal] = useState(false);
  const [isReuploading, setIsReuploading] = useState(false);
  const [isFetchingCrop, setIsFetchingCrop] = useState(false);
  const [cropBlobSrc, setCropBlobSrc] = useState<string | null>(null);
  const [isGeneratingPng, setIsGeneratingPng] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const addItem = useCartStore((state) => state.addItem);

  // A4 Sheet dimensions in mm
  const SHEET_WIDTH_MM = 210;
  const SHEET_HEIGHT_MM = 297;
  const MARGIN_MM = 11; // 11mm margin

  // Usable area in mm after subtracting safety margins
  const USABLE_WIDTH_MM = SHEET_WIDTH_MM - 2 * MARGIN_MM;
  const USABLE_HEIGHT_MM = SHEET_HEIGHT_MM - 2 * MARGIN_MM;
  const SPACING_MM = 3;

  useEffect(() => {
    if (!imageUrl) {
      setLoadedImage(null);
      setImageAspect(null);
      return;
    }
    const img = new Image();
    img.src = imageUrl;
    img.onload = () => {
      setImageAspect(img.width / img.height);
      setLoadedImage(img);
    };
    img.onerror = () => {
      console.error("Failed to load image:", imageUrl);
    };
  }, [imageUrl]);

  const heightCm = useMemo(() => {
    if (!imageAspect) return widthCm;
    return widthCm / imageAspect;
  }, [widthCm, imageAspect]);

  const fitCalculation = useMemo(() => {
    if (!imageAspect) return { maxStickers: 0, bestOrientation: "standard" };

    const wMm = widthCm * 10;
    const hMm = heightCm * 10;

    // Standard fit
    const colsStandard = Math.floor((USABLE_WIDTH_MM + SPACING_MM) / (wMm + SPACING_MM));
    const rowsStandard = Math.floor((USABLE_HEIGHT_MM + SPACING_MM) / (hMm + SPACING_MM));
    const fitStandard = colsStandard * rowsStandard;

    // Rotated 90 degrees fit
    const colsRotated = Math.floor((USABLE_WIDTH_MM + SPACING_MM) / (hMm + SPACING_MM));
    const rowsRotated = Math.floor((USABLE_HEIGHT_MM + SPACING_MM) / (wMm + SPACING_MM));
    const fitRotated = colsRotated * rowsRotated;

    if (fitRotated > fitStandard) {
      return { maxStickers: fitRotated, bestOrientation: "rotated", cols: colsRotated, rows: rowsRotated };
    } else {
      return { maxStickers: fitStandard, bestOrientation: "standard", cols: colsStandard, rows: rowsStandard };
    }
  }, [widthCm, heightCm, imageAspect]);

  const drawCanvas = (img: HTMLImageElement) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // A4 size roughly at some scale for preview
    canvas.width = 400;
    canvas.height = (400 * SHEET_HEIGHT_MM) / SHEET_WIDTH_MM;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw background (white sheet)
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const scaleX = canvas.width / SHEET_WIDTH_MM;
    const scaleY = canvas.height / SHEET_HEIGHT_MM;

    // Draw safety margin (dashed border)
    ctx.strokeStyle = "#e4e4e7"; // light gray border
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);
    ctx.strokeRect(
      MARGIN_MM * scaleX,
      MARGIN_MM * scaleY,
      USABLE_WIDTH_MM * scaleX,
      USABLE_HEIGHT_MM * scaleY
    );
    ctx.setLineDash([]); // Reset line dash

    // Draw grid/stickers
    const { maxStickers, bestOrientation, cols, rows } = fitCalculation;
    if (maxStickers === 0 || !cols || !rows) return;

    const wMm = bestOrientation === "standard" ? widthCm * 10 : heightCm * 10;
    const hMm = bestOrientation === "standard" ? heightCm * 10 : widthCm * 10;

    const drawW = wMm * scaleX;
    const drawH = hMm * scaleY;
    const spacingX = SPACING_MM * scaleX;
    const spacingY = SPACING_MM * scaleY;

    // Center the grid within the usable area
    const usableW = USABLE_WIDTH_MM * scaleX;
    const usableH = USABLE_HEIGHT_MM * scaleY;
    const marginX = MARGIN_MM * scaleX;
    const marginY = MARGIN_MM * scaleY;

    const totalGridW = cols * drawW + (cols - 1) * spacingX;
    const totalGridH = rows * drawH + (rows - 1) * spacingY;

    const startX = marginX + (usableW - totalGridW) / 2;
    const startY = marginY + (usableH - totalGridH) / 2;

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const x = startX + c * (drawW + spacingX);
        const y = startY + r * (drawH + spacingY);

        ctx.save();
        if (bestOrientation === "rotated") {
          // Translate to center of image, rotate, then draw
          ctx.translate(x + drawW / 2, y + drawH / 2);
          ctx.rotate(Math.PI / 2);
          // original dimensions since we rotated the context
          const origW = widthCm * 10 * scaleX;
          const origH = heightCm * 10 * scaleY;
          ctx.drawImage(img, -origW / 2, -origH / 2, origW, origH);
        } else {
          ctx.drawImage(img, x, y, drawW, drawH);
        }
        ctx.restore();
      }
    }
  };

  // Re-draw when dimensions or image changes
  useEffect(() => {
    if (loadedImage) {
      drawCanvas(loadedImage);
    }
  }, [widthCm, heightCm, fitCalculation, loadedImage]);


  const handleAddToCart = () => {
    setIsAdding(true);

    addItem({
      imageUrl: imageUrl,
      widthCm,
      heightCm,
      stickersPerSheet: fitCalculation.maxStickers,
      sheetQuantity: sheetQuantity,
      pricePerSheet: 49.00,
    });

    setTimeout(() => {
      setIsAdding(false);
      router.push("/koszyk");
    }, 400);
  };

  const handleDownloadPNG = async () => {
    const { bestOrientation, cols, rows, maxStickers } = fitCalculation;
    if (!maxStickers || !cols || !rows) return;

    setIsGeneratingPng(true);
    try {
      // Fetch image via proxy to avoid tainted canvas
      const response = await fetch(`/api/proxy-image?url=${encodeURIComponent(imageUrl)}`);
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);

      const img = await new Promise<HTMLImageElement>((resolve, reject) => {
        const i = new Image();
        i.onload = () => resolve(i);
        i.onerror = reject;
        i.src = blobUrl;
      });

      // 300 DPI: 1mm = 300/25.4 ≈ 11.811 px
      const MM_TO_PX = 300 / 25.4;
      const A4_W = Math.round(210 * MM_TO_PX); // 2480
      const A4_H = Math.round(297 * MM_TO_PX); // 3508

      const canvas = document.createElement("canvas");
      canvas.width = A4_W;
      canvas.height = A4_H;
      const ctx = canvas.getContext("2d")!;

      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, A4_W, A4_H);

      const wMm = bestOrientation === "standard" ? widthCm * 10 : heightCm * 10;
      const hMm = bestOrientation === "standard" ? heightCm * 10 : widthCm * 10;
      const drawW = wMm * MM_TO_PX;
      const drawH = hMm * MM_TO_PX;
      const spacingX = SPACING_MM * MM_TO_PX;
      const spacingY = SPACING_MM * MM_TO_PX;
      const marginX = MARGIN_MM * MM_TO_PX;
      const marginY = MARGIN_MM * MM_TO_PX;
      const usableW = USABLE_WIDTH_MM * MM_TO_PX;
      const usableH = USABLE_HEIGHT_MM * MM_TO_PX;

      const totalGridW = cols * drawW + (cols - 1) * spacingX;
      const totalGridH = rows * drawH + (rows - 1) * spacingY;
      const startX = marginX + (usableW - totalGridW) / 2;
      const startY = marginY + (usableH - totalGridH) / 2;

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const x = startX + c * (drawW + spacingX);
          const y = startY + r * (drawH + spacingY);
          ctx.save();
          if (bestOrientation === "rotated") {
            ctx.translate(x + drawW / 2, y + drawH / 2);
            ctx.rotate(Math.PI / 2);
            const origW = widthCm * 10 * MM_TO_PX;
            const origH = heightCm * 10 * MM_TO_PX;
            ctx.drawImage(img, -origW / 2, -origH / 2, origW, origH);
          } else {
            ctx.drawImage(img, x, y, drawW, drawH);
          }
          ctx.restore();
        }
      }

      URL.revokeObjectURL(blobUrl);

      const imgData = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.href = imgData;
      link.download = `naklejki-A4-${widthCm}cm.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error("PNG generation error:", err);
    } finally {
      setIsGeneratingPng(false);
    }
  };

  const pricePerSticker = (49.00 / (fitCalculation.maxStickers || 1)).toFixed(2).replace('.', ',');

  return (
    <div className="flex flex-col md:flex-row gap-8 w-full mt-8 bg-card rounded-2xl p-6 sm:p-8 pb-28 md:pb-8 border border-border/70 shadow-[0_8px_30px_rgba(0,0,0,0.02)]">
      <div className="flex-1 space-y-6">
        <div>
          <h3 className="text-2xl font-extrabold mb-2 text-foreground">Dostosuj wymiary</h3>
          <p className="text-muted-foreground text-sm font-medium">
            Podaj szerokość naklejki. Wysokość ogarniemy automatycznie, żeby zachować super proporcje!
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-bold mb-2 block text-foreground">Szerokość (cm)</label>
            <input
              type="number"
              min={3}
              max={20}
              step={0.1}
              value={widthCm}
              onChange={(e) => setWidthCm(Number(e.target.value))}
              onBlur={(e) => {
                let val = Number(e.target.value) || 5;
                if (val < 3) val = 3;
                if (val > 20) val = 20;
                setWidthCm(val);
              }}
              className="flex h-12 w-full rounded-xl border border-border bg-background px-4 py-2 text-sm font-semibold shadow-none transition-colors focus-visible:outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20"
            />
          </div>
          <div>
            <label className="text-sm font-bold mb-2 block text-foreground">Wysokość (auto)</label>
            <input
              type="text"
              value={imageAspect ? heightCm.toFixed(1).replace('.', ',') : "Obliczanie..."}
              disabled
              className="flex h-12 w-full rounded-xl border border-transparent bg-muted px-4 py-2 text-sm font-bold text-muted-foreground"
            />
          </div>
        </div>

        {/* Wybór liczby arkuszy */}
        <div>
          <label className="text-sm font-bold mb-2 block text-foreground">Liczba arkuszy A4</label>
          <div className="flex items-center bg-muted/60 border border-border/40 rounded-xl p-1 w-full max-w-[150px]">
            <button
              type="button"
              onClick={() => {
                if (sheetQuantity > 1) {
                  setSheetQuantity(sheetQuantity - 1);
                }
              }}
              disabled={sheetQuantity <= 1}
              className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-background disabled:opacity-30 disabled:pointer-events-none transition-colors"
            >
              <Minus className="w-4 h-4 text-foreground" />
            </button>
            <span className="flex-1 text-center font-extrabold text-base">
              {sheetQuantity}
            </span>
            <button
              type="button"
              onClick={() => setSheetQuantity(sheetQuantity + 1)}
              className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-background transition-colors"
            >
              <Plus className="w-4 h-4 text-foreground" />
            </button>
          </div>
        </div>

        <div className="bg-secondary/35 border border-secondary/80 p-5 rounded-xl">
          <p className="text-lg font-extrabold text-foreground">
            Zmieścimy aż <span className="text-3xl font-black">{fitCalculation.maxStickers * sheetQuantity}</span> sztuk!
          </p>
          <p className="text-sm mt-2 font-medium text-foreground/90 leading-relaxed">
            Łącznie: <span className="font-extrabold text-primary text-base">{(49.00 * sheetQuantity).toFixed(2).replace('.', ',')} zł</span>
            <span className="block text-xs text-foreground/80 mt-1">
              (A4: {fitCalculation.maxStickers} szt./arkusz po {pricePerSticker} zł za sztukę)
            </span>
          </p>
        </div>

        {/* Przycisk "Pakujemy to!" - sticky na telefonach */}
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-background/95 backdrop-blur-md border-t border-border/60 shadow-lg md:static md:p-0 md:bg-transparent md:border-0 md:shadow-none z-30 flex items-center justify-between md:block gap-4">
          <div className="md:hidden flex-1">
            <p className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground">Suma ({sheetQuantity} ark.)</p>
            <p className="text-xl font-black text-primary leading-tight">{(49.00 * sheetQuantity).toFixed(2).replace('.', ',')} zł</p>
          </div>
          <button
            onClick={handleAddToCart}
            disabled={isAdding || fitCalculation.maxStickers === 0}
            className="flex-1 md:w-full inline-flex items-center justify-center whitespace-nowrap rounded-xl text-base font-bold bg-primary text-primary-foreground hover:bg-primary/95 active:scale-[0.98] h-14 px-8 shadow-sm transition-all disabled:pointer-events-none disabled:opacity-50"
          >
            {isAdding ? (
              <Loader2 className="w-6 h-6 mr-2 animate-spin" />
            ) : (
              <ShoppingCart className="w-6 h-6 mr-2" />
            )}
            {isAdding ? "Pakowanie..." : "Pakujemy to!"}
          </button>
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center bg-muted/10 rounded-2xl p-6 border border-border/60 overflow-hidden">
        <p className="text-sm font-bold mb-4 text-muted-foreground uppercase tracking-wider">Podgląd naklejek</p>
        <canvas
          ref={canvasRef}
          className="bg-white rounded-xl shadow-sm border border-border/50 max-w-full h-auto object-contain transition-all cmyk-preview"
          style={{ maxHeight: "500px" }}
        />
        <div className="mt-4 flex flex-col items-center gap-2">
          {onImageChange && (
            <button
              onClick={() => setShowCropModal(true)}
              disabled={isReuploading}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-primary transition-colors px-3 py-1.5 rounded-lg hover:bg-muted/60 disabled:opacity-40 disabled:pointer-events-none"
            >
              {isReuploading ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Crop className="w-3.5 h-3.5" />
              )}
              {isReuploading ? "Zapisywanie..." : "Kadruj ponownie"}
            </button>
          )}
          <button
            onClick={handleDownloadPNG}
            disabled={isGeneratingPng || fitCalculation.maxStickers === 0}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-primary transition-colors px-3 py-1.5 rounded-lg hover:bg-muted/60 disabled:opacity-40 disabled:pointer-events-none"
          >
            {isGeneratingPng ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Download className="w-3.5 h-3.5" />
            )}
            {isGeneratingPng ? "Generowanie PNG..." : "Pobierz PNG do druku (A4)"}
          </button>
        </div>
      </div>
    </div>
  );
}
