"use client";

import { getUUID } from "@/lib/uuid";
import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { X, Crop, Sparkles, Loader2, RotateCcw, Maximize2, Check, Wand2 } from "lucide-react";
import { motion } from "framer-motion";
import { removeStickerBackground, enhanceStickerQuality } from "@/app/actions/generateImage";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "@/lib/firebase/client";

interface StickerEditModalProps {
  imageSrc: string;
  onSave: (newUrl: string) => void;
  onCancel: () => void;
}

// Convert a Blob to base64
const blobToBase64 = (blob: Blob): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = () => {
      const dataUrl = reader.result as string;
      const [, base64] = dataUrl.split(",");
      resolve(base64);
    };
    reader.readAsDataURL(blob);
  });

export function StickerEditModal({ imageSrc, onSave, onCancel }: StickerEditModalProps) {
  const [mounted, setMounted] = useState(false);
  const [currentUrl, setCurrentUrl] = useState(imageSrc);
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingMessage, setProcessingMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Crop State
  const [zoom] = useState(1);
  const [rotation] = useState(0);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [imgSize, setImgSize] = useState({ width: 0, height: 0 });
  const [customWidth, setCustomWidth] = useState(300);
  const [customHeight, setCustomHeight] = useState(240);
  const [isResizingViewport, setIsResizingViewport] = useState(false);

  const resizeStart = useRef({ x: 0, y: 0, w: 0, h: 0, posX: 0, posY: 0, handle: "br" });
  const imageRef = useRef<HTMLImageElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const lastInitializedUrl = useRef<string | null>(null);

  // Reset position and size
  const initializeLayout = (imgEl: HTMLImageElement, forceReset = true) => {
    if (!imgEl || !imgEl.naturalWidth || !imgEl.naturalHeight) return;
    const naturalAspect = imgEl.naturalWidth / imgEl.naturalHeight;

    let targetVw = customWidth;
    let targetVh = customHeight;

    if (forceReset) {
      const maxDim = 260;
      let vw = maxDim;
      let vh = maxDim;

      if (naturalAspect > 1) {
        vw = maxDim;
        vh = Math.round(maxDim / naturalAspect);
        if (vh < 60) {
          vh = 60;
          vw = Math.round(vh * naturalAspect);
        }
      } else {
        vh = maxDim;
        vw = Math.round(maxDim * naturalAspect);
        if (vw < 60) {
          vw = 60;
          vh = Math.round(vw / naturalAspect);
        }
      }

      vw = Math.max(60, Math.min(320, vw));
      vh = Math.max(60, Math.min(320, vh));

      targetVw = vw;
      targetVh = vh;

      setCustomWidth(vw);
      setCustomHeight(vh);
    }

    let w = targetVw;
    let h = targetVh;

    if (naturalAspect > targetVw / targetVh) {
      h = targetVh;
      w = h * naturalAspect;
    } else {
      w = targetVw;
      h = w / naturalAspect;
    }

    setImgSize({ width: w, height: h });
    setPosition({
      x: (targetVw - w) / 2,
      y: (targetVh - h) / 2,
    });
  };

  // Pre-fetch the image as a Blob URL to avoid browser CORS/caching/0x0 dimensions bugs
  useEffect(() => {
    if (!currentUrl) return;

    let isMounted = true;
    let objectUrl: string | null = null;

    const fetchImage = async () => {
      try {
        setBlobUrl(null);
        
        let urlToFetch = currentUrl;
        if (currentUrl.startsWith("http") && !currentUrl.startsWith("blob:")) {
          urlToFetch = `/api/proxy-image?url=${encodeURIComponent(currentUrl)}`;
        } else if (currentUrl.startsWith("blob:")) {
          // If it's already a blob, just use it
          if (isMounted) setBlobUrl(currentUrl);
          return;
        }

        const res = await fetch(urlToFetch);
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        
        const blob = await res.blob();
        if (isMounted) {
          objectUrl = URL.createObjectURL(blob);
          setBlobUrl(objectUrl);
        }
      } catch (e: any) {
        console.error("Failed to fetch image for editor:", e);
        if (isMounted) setError("Nie udało się wczytać obrazu do edytora.");
      }
    };

    fetchImage();

    return () => {
      isMounted = false;
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [currentUrl]);

  useEffect(() => {
    if (mounted && blobUrl && imageRef.current && imageRef.current.complete) {
      const img = imageRef.current;
      if (img.naturalWidth && img.naturalHeight && lastInitializedUrl.current !== blobUrl) {
        const isInitial = lastInitializedUrl.current === null;
        lastInitializedUrl.current = blobUrl;
        initializeLayout(img, isInitial);
      }
    }
  }, [blobUrl, mounted]);

  useEffect(() => {
    setMounted(true);
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  // Pointer drag for moving image
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isProcessing || isResizingViewport) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging || isProcessing || isResizingViewport) return;
    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handlePointerUp = () => {
    setIsDragging(false);
  };

  // Viewport resize handles
  const handleResizeBRPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.stopPropagation();
    setIsResizingViewport(true);
    resizeStart.current = {
      x: e.clientX,
      y: e.clientY,
      w: customWidth,
      h: customHeight,
      posX: position.x,
      posY: position.y,
      handle: "br",
    };
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handleResizeTLPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.stopPropagation();
    setIsResizingViewport(true);
    resizeStart.current = {
      x: e.clientX,
      y: e.clientY,
      w: customWidth,
      h: customHeight,
      posX: position.x,
      posY: position.y,
      handle: "tl",
    };
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handleResizePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isResizingViewport) return;
    e.stopPropagation();
    const dx = e.clientX - resizeStart.current.x;
    const dy = e.clientY - resizeStart.current.y;

    if (resizeStart.current.handle === "br") {
      setCustomWidth(Math.max(60, Math.min(320, resizeStart.current.w + dx)));
      setCustomHeight(Math.max(60, Math.min(320, resizeStart.current.h + dy)));
    } else {
      // Top-Left handle: moving down-right (dx > 0, dy > 0) decreases size, up-left increases it
      const newWidth = Math.max(60, Math.min(320, resizeStart.current.w - dx));
      const newHeight = Math.max(60, Math.min(320, resizeStart.current.h - dy));

      setCustomWidth(newWidth);
      setCustomHeight(newHeight);

      // Adjust position to anchor the bottom-right corner in image space
      setPosition({
        x: resizeStart.current.posX + (newWidth - resizeStart.current.w),
        y: resizeStart.current.posY + (newHeight - resizeStart.current.h),
      });
    }
  };

  const handleResizePointerUp = () => {
    setIsResizingViewport(false);
  };

  // Run crop and immediately call onSave
  const handleCropAndSave = async () => {
    const imgEl = imageRef.current;
    if (!imgEl || isProcessing) return;

    setIsProcessing(true);
    setProcessingMessage("Zapisywanie naklejki...");
    setError(null);

    try {
      // Get cropped image via blobUrl to prevent tainted canvas and double network request
      const proxiedUrl = blobUrl || `/api/proxy-image?url=${encodeURIComponent(currentUrl)}`;
      const imgLoadPromise = new Promise<HTMLImageElement>((resolve, reject) => {
        const i = new Image();
        if (!blobUrl) {
          i.crossOrigin = "anonymous";
        }
        i.onload = () => resolve(i);
        i.onerror = reject;
        i.src = proxiedUrl;
      });

      const proxiedImg = await imgLoadPromise;

      const dpr = 4;
      const canvas = document.createElement("canvas");
      canvas.width = customWidth * dpr;
      canvas.height = customHeight * dpr;

      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Could not get 2d context");

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.scale(dpr, dpr);

      const centerX = position.x + imgSize.width / 2;
      const centerY = position.y + imgSize.height / 2;

      ctx.translate(centerX, centerY);
      ctx.rotate((rotation * Math.PI) / 180);
      ctx.scale(zoom, zoom);

      ctx.drawImage(
        proxiedImg,
        -imgSize.width / 2,
        -imgSize.height / 2,
        imgSize.width,
        imgSize.height
      );

      canvas.toBlob(
        async (blob) => {
          if (blob) {
            try {
              const fileName = `cropped-${getUUID()}.png`;
              const storageRef = ref(storage, `uploads/${fileName}`);
              const snapshot = await uploadBytes(storageRef, blob);
              const downloadUrl = await getDownloadURL(snapshot.ref);
              onSave(downloadUrl);
            } catch (err: any) {
              setError("Nie udało się zapisać wykadrowanego obrazu.");
              setIsProcessing(false);
            }
          } else {
            setError("Błąd podczas generowania kadru.");
            setIsProcessing(false);
          }
        },
        "image/png",
        0.95
      );
    } catch (err) {
      console.error("Cropping error:", err);
      setError("Wystąpił błąd podczas kadrowania obrazu.");
      setIsProcessing(false);
    } finally {
      setProcessingMessage(null);
    }
  };

  // AI Background Removal
  const handleRemoveBackground = async () => {
    setIsProcessing(true);
    setProcessingMessage("Usuwanie tła...");
    setError(null);

    try {
      const targetUrl = blobUrl || currentUrl;
      const response = await fetch(targetUrl);
      if (!response.ok) throw new Error("Failed to fetch image data");
      const blob = await response.blob();
      const base64 = await blobToBase64(blob);

      const result = await removeStickerBackground({
        base64,
        mimeType: blob.type || "image/png",
      });

      if (result.success && result.url) {
        setCurrentUrl(result.url);
      } else {
        setError(result.error || "Nie udało się usunąć tła.");
      }
    } catch (err: any) {
      console.error(err);
      setError(err?.message || "Wystąpił błąd podczas usuwania tła.");
    } finally {
      setIsProcessing(false);
      setProcessingMessage(null);
    }
  };

  // AI Quality Enhancement
  const handleEnhanceQuality = async () => {
    setIsProcessing(true);
    setProcessingMessage("Poprawianie jakości AI...");
    setError(null);

    try {
      const targetUrl = blobUrl || currentUrl;
      const response = await fetch(targetUrl);
      if (!response.ok) throw new Error("Failed to fetch image data");
      const blob = await response.blob();
      const base64 = await blobToBase64(blob);

      const result = await enhanceStickerQuality({
        base64,
        mimeType: blob.type || "image/png",
      });

      if (result.success && result.url) {
        setCurrentUrl(result.url);
      } else {
        setError(result.error || "Nie udało się poprawić jakości.");
      }
    } catch (err: any) {
      console.error(err);
      setError(err?.message || "Wystąpił błąd podczas poprawy jakości.");
    } finally {
      setIsProcessing(false);
      setProcessingMessage(null);
    }
  };

  if (!mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-[10000] bg-foreground/30 backdrop-blur-sm flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        className="bg-card border border-border/80 rounded-3xl w-full max-w-lg p-6 sm:p-8 flex flex-col gap-5 shadow-[0_12px_40px_rgba(0,0,0,0.06)] relative"
      >
        {/* Header */}
        <div className="flex justify-between items-center w-full pb-2 border-b border-border/30">
          <div className="flex items-center gap-2">
            <Wand2 className="w-5 h-5 text-primary" />
            <h3 className="text-xl font-extrabold text-foreground">Edycja i Kadrowanie</h3>
          </div>
          <button
            onClick={onCancel}
            disabled={isProcessing}
            className="p-1.5 rounded-full border border-border hover:bg-muted/50 active:scale-95 transition-all cursor-pointer"
          >
            <X className="w-4 h-4 text-foreground" />
          </button>
        </div>

        {error && (
          <div className="bg-destructive/10 border border-destructive/20 text-destructive-foreground p-3 rounded-xl text-xs font-bold text-center animate-in fade-in duration-200">
            {error}
          </div>
        )}

        {/* Workspace area */}
        <div className="w-full flex flex-col items-center justify-center min-h-[300px] bg-muted/10 border border-dashed border-border/50 rounded-2xl p-4 overflow-hidden relative">
          {isProcessing && (
            <div className="absolute inset-0 bg-background/80 backdrop-blur-[1px] flex flex-col items-center justify-center gap-2 z-30 animate-in fade-in duration-200">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
              <span className="text-xs font-bold text-primary">{processingMessage || "Dodawanie..."}</span>
            </div>
          )}

          {/* Crop Container (handles can spill out of this) */}
          <div
            style={{
              width: `${customWidth}px`,
              height: `${customHeight}px`,
            }}
            className="relative"
          >
            {/* Crop Viewport (clips the image) */}
            <div
              ref={viewportRef}
              style={{
                width: "100%",
                height: "100%",
                backgroundImage: "radial-gradient(var(--border) 1px, transparent 1px)",
                backgroundSize: "12px 12px",
                touchAction: "none",
              }}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerCancel={handlePointerUp}
              className="w-full h-full overflow-hidden bg-[#eaeaea] select-none shadow-[inset_0_2px_8px_rgba(0,0,0,0.02)] cursor-grab active:cursor-grabbing touch-none"
            >
              {blobUrl && (
                <img
                  ref={imageRef}
                  src={blobUrl}
                  alt="Workspace image"
                  draggable={false}
                  onLoad={(e) => {
                    const img = e.currentTarget;
                    if (img.naturalWidth && img.naturalHeight && lastInitializedUrl.current !== blobUrl) {
                      const isInitial = lastInitializedUrl.current === null;
                      lastInitializedUrl.current = blobUrl;
                      initializeLayout(img, isInitial);
                    }
                  }}
                  style={{
                    width: `${imgSize.width}px`,
                    height: `${imgSize.height}px`,
                    transform: `translate(${position.x}px, ${position.y}px) scale(${zoom}) rotate(${rotation}deg)`,
                    transformOrigin: "center center",
                    pointerEvents: "none",
                  }}
                  className="absolute top-0 left-0 max-w-none"
                />
              )}

              {/* Guidelines */}
              <div className="absolute inset-0 border border-foreground/5 pointer-events-none grid grid-cols-3 grid-rows-3 animate-in fade-in duration-100">
                <div className="border-r border-b border-foreground/5" />
                <div className="border-r border-b border-foreground/5" />
                <div className="border-b border-foreground/5" />
                <div className="border-r border-b border-foreground/5" />
                <div className="border-r border-b border-foreground/5" />
                <div className="border-b border-foreground/5" />
                <div className="border-r border-foreground/5" />
                <div className="border-r border-foreground/5" />
                <div className="" />
              </div>

              {/* Frame Border Overlay */}
              <div className="absolute inset-0 border-2 border-primary pointer-events-none z-10" />
            </div>

            {/* Top-Left Resize handle */}
            <div
              onPointerDown={handleResizeTLPointerDown}
              onPointerMove={handleResizePointerMove}
              onPointerUp={handleResizePointerUp}
              onPointerCancel={handleResizePointerUp}
              style={{ touchAction: "none" }}
              className="absolute left-0 top-0 -translate-x-1/2 -translate-y-1/2 w-7 h-7 rounded-full border border-primary bg-primary text-primary-foreground flex items-center justify-center cursor-nwse-resize shadow-md hover:scale-105 active:scale-95 transition-transform z-20 touch-none"
              title="Zmień proporcje kadru (lewy górny róg)"
            >
              <Maximize2 className="w-3.5 h-3.5 rotate-45" />
            </div>

            {/* Bottom-Right Resize handle */}
            <div
              onPointerDown={handleResizeBRPointerDown}
              onPointerMove={handleResizePointerMove}
              onPointerUp={handleResizePointerUp}
              onPointerCancel={handleResizePointerUp}
              style={{ touchAction: "none" }}
              className="absolute right-0 bottom-0 translate-x-1/2 translate-y-1/2 w-7 h-7 rounded-full border border-primary bg-primary text-primary-foreground flex items-center justify-center cursor-nwse-resize shadow-md hover:scale-105 active:scale-95 transition-transform z-20 touch-none"
              title="Zmień proporcje kadru (prawy dolny róg)"
            >
              <Maximize2 className="w-3.5 h-3.5 rotate-45" />
            </div>
          </div>
        </div>

        {/* AI Action Row */}
        <div className="flex flex-col sm:flex-row gap-2.5 w-full">
          <button
            type="button"
            onClick={handleRemoveBackground}
            disabled={isProcessing}
            className="w-full sm:flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl text-xs font-bold bg-primary/15 text-primary hover:bg-primary/25 border border-primary/25 h-12 px-3 shadow-none transition-all active:scale-[0.98] disabled:opacity-50 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Usuń tło
          </button>



          <button
            type="button"
            onClick={() => imageRef.current && initializeLayout(imageRef.current, true)}
            disabled={isProcessing}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 rounded-xl text-xs font-bold bg-muted text-muted-foreground hover:bg-muted/80 border border-border/30 h-12 px-4 transition-all active:scale-[0.98] disabled:opacity-50 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Resetuj kadr
          </button>
        </div>

        {/* Footer Actions */}
        <div className="flex gap-4 w-full pt-3 border-t border-border/30">
          <button
            onClick={onCancel}
            disabled={isProcessing}
            className="flex-1 inline-flex items-center justify-center rounded-xl text-sm font-bold bg-muted text-muted-foreground hover:bg-muted/80 h-11 transition-all active:scale-[0.98] cursor-pointer"
          >
            Anuluj
          </button>
          <button
            onClick={handleCropAndSave}
            disabled={isProcessing}
            className="flex-1 inline-flex items-center justify-center rounded-xl text-sm font-bold bg-primary text-primary-foreground hover:bg-primary/95 h-11 shadow-sm transition-all disabled:opacity-50 active:scale-[0.98] cursor-pointer"
          >
            <Check className="w-4 h-4 mr-1.5" />
            Dodaj naklejkę
          </button>
        </div>
      </motion.div>
    </div>,
    document.body
  );
}
