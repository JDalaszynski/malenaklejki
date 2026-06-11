"use client";

import { getUUID } from "@/lib/uuid";
import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { NewA4Visualizer } from "@/components/creator/NewA4Visualizer";
import { A4Visualizer3D } from "@/components/creator/A4Visualizer3D";
import { StickerEditModal } from "@/components/creator/StickerEditModal";
import { AIGenerator } from "@/components/creator/AIGenerator";
import { PlacedSticker } from "@/types/creator";
import { useCartStore } from "@/store/cartStore";
import { checkOverlap, getRotatedSize, getCutLineMargins, getOuterMargins, getCutLineBoundingBox } from "@/lib/utils/collision";
import { getContourPoints } from "@/lib/utils/contour";
import { getStickersNoun } from "@/lib/utils/polish";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "@/lib/firebase/client";
import { useRouter } from "next/navigation";
import jsPDF from "jspdf";
import {
  UploadCloud,
  Wand2,
  Plus,
  Minus,
  ShoppingCart,
  Download,
  Trash2,
  Crop,
  Layers,
  Sparkles,
  Loader2,
  Scissors,
  Copy,
  ArrowUp,
  Ban,
  Square,
  Circle,
  AlertTriangle,
  Truck,
  X
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Home() {
  const router = useRouter();
  const addItem = useCartStore((state) => state.addItem);
  const cartItems = useCartStore((state) => state.items);

  // Creator state
  const [stickers, setStickers] = useState<PlacedSticker[]>([]);
  const [selectedStickerId, setSelectedStickerId] = useState<string | null>(null);
  const [sheetQuantity, setSheetQuantity] = useState<number>(1);
  const [error, setError] = useState<string | null>(null);
  const [visualizerMode, setVisualizerMode] = useState<"2d" | "3d">("2d");
  const [hasUserEverAddedStickers, setHasUserEverAddedStickers] = useState(false);

  useEffect(() => {
    if (stickers.length > 0 && !hasUserEverAddedStickers) {
      setHasUserEverAddedStickers(true);
    }
  }, [stickers, hasUserEverAddedStickers]);

  const [stickerDimensions, setStickerDimensions] = useState<Record<string, { width: number; height: number }>>({});

  useEffect(() => {
    stickers.forEach((st) => {
      if (stickerDimensions[st.id]) return;
      const img = new Image();
      img.onload = () => {
        setStickerDimensions((prev) => ({
          ...prev,
          [st.id]: { width: img.naturalWidth || img.width, height: img.naturalHeight || img.height },
        }));
      };
      img.src = st.imageUrl;
    });
  }, [stickers, stickerDimensions]);

  // Modals & Panels
  const [showEditModal, setShowEditModal] = useState(false);
  const [activeEditSticker, setActiveEditSticker] = useState<PlacedSticker | null>(null);
  const [addingMethod, setAddingMethod] = useState<"none" | "upload" | "ai">("none");
  const [pendingImageUrl, setPendingImageUrl] = useState<string | null>(null);
  const [showConfirmCartModal, setShowConfirmCartModal] = useState(false);

  // Loaders
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [isPlacingSticker, setIsPlacingSticker] = useState(false);

  // Drag-and-drop states
  const [isDraggingOverSheet, setIsDraggingOverSheet] = useState(false);
  const [isPageUploading, setIsPageUploading] = useState(false);

  // Drag & drop handlers for the A4 visualizer sheet preview column
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.types.includes("Files")) {
      setIsDraggingOverSheet(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOverSheet(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOverSheet(false);

    const files = Array.from(e.dataTransfer.files);
    const file = files[0];
    if (!file || !file.type.startsWith("image/")) return;

    setIsPageUploading(true);
    setError(null);

    try {
      const fileName = `dropped-${getUUID()}-${file.name}`;
      const storageRef = ref(storage, `uploads/${fileName}`);
      const snapshot = await uploadBytes(storageRef, file);
      const downloadUrl = await getDownloadURL(snapshot.ref);

      setPendingImageUrl(downloadUrl);
      // Open unified modal immediately
      setActiveEditSticker({
        id: "new-upload",
        imageUrl: downloadUrl,
        x: 15,
        y: 15,
        widthCm: 5,
        heightCm: 5,
        aspectRatio: 1,
        cutLineType: "none",
      });
      setShowEditModal(true);
    } catch (err: any) {
      console.error(err);
      setError("Wystąpił błąd podczas przesłania upuszczonego zdjęcia.");
    } finally {
      setIsPageUploading(false);
    }
  };

  // Mount state for hydration check
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  // Automatically calculate contours for stickers that don't have them yet
  useEffect(() => {
    if (!mounted || stickers.length === 0) return;

    const stickersToCalculate = stickers.filter((st) => !st.contourPolygons);
    if (stickersToCalculate.length === 0) return;

    let hasUpdates = false;
    const updatedStickers = [...stickers];

    const promises = stickersToCalculate.map(async (st) => {
      try {
        const polys = await getContourPoints(st.imageUrl);
        const idx = updatedStickers.findIndex((s) => s.id === st.id);
        if (idx !== -1) {
          const currentSt = updatedStickers[idx];
          const wMm = currentSt.widthCm * 10;
          const hMm = currentSt.heightCm * 10;

          // Clamp using the new contour if the sticker uses custom contour cut line
          const margins = getOuterMargins(currentSt, { contourPolygons: polys });

          let targetX = currentSt.x;
          let targetY = currentSt.y;
          if (targetX < 10 + margins.left) targetX = 10 + margins.left;
          if (targetX > 200 - margins.right) targetX = 200 - margins.right;
          if (targetY < 10 + margins.top) targetY = 10 + margins.top;
          if (targetY > 287 - margins.bottom) targetY = 287 - margins.bottom;

          updatedStickers[idx] = {
            ...currentSt,
            contourPolygons: polys || [[{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 1, y: 1 }, { x: 0, y: 1 }]],
            x: targetX,
            y: targetY,
          };
          hasUpdates = true;
        }
      } catch (err) {
        console.error("Failed to compute contour for sticker:", st.id, err);
        const idx = updatedStickers.findIndex((s) => s.id === st.id);
        if (idx !== -1) {
          updatedStickers[idx] = {
            ...updatedStickers[idx],
            contourPolygons: [[{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 1, y: 1 }, { x: 0, y: 1 }]],
          };
          hasUpdates = true;
        }
      }
    });

    Promise.all(promises).then(() => {
      if (hasUpdates) {
        setStickers(updatedStickers);
      }
    });
  }, [stickers, mounted]);

  const selectedSticker = stickers.find((s) => s.id === selectedStickerId);

  const selectedStickerDimension = selectedSticker ? stickerDimensions[selectedSticker.id] : null;
  const selectedStickerDpi = useMemo(() => {
    if (!selectedSticker || !selectedStickerDimension) return null;
    const widthInches = selectedSticker.widthCm / 2.54;
    return Math.round(selectedStickerDimension.width / widthInches);
  }, [selectedSticker, selectedStickerDimension]);

  const isLowRes = selectedStickerDpi !== null && selectedStickerDpi < 150;

  // Helper to find a free position using grid search with rotation support
  const findFreePosition = (
    wMm: number,
    hMm: number,
    rotation: number,
    existing: PlacedSticker[],
    cutLineType: PlacedSticker["cutLineType"] = "none",
    contourPolygons?: { x: number; y: number }[][]
  ): { x: number; y: number } | null => {
    const spacing = 3; // mm space between stickers
    const step = 5; // mm step for grid search

    const margins = getOuterMargins({
      widthCm: wMm / 10,
      heightCm: hMm / 10,
      rotation,
      cutLineType,
      contourPolygons,
    });

    const startX = 10 + margins.left;
    const endX = 200 - margins.right;
    const startY = 10 + margins.top;
    const endY = 287 - margins.bottom;

    for (let candidateY = startY; candidateY <= endY; candidateY += step) {
      for (let candidateX = startX; candidateX <= endX; candidateX += step) {
        const candidateRect = getCutLineBoundingBox({
          x: candidateX,
          y: candidateY,
          widthCm: wMm / 10,
          heightCm: hMm / 10,
          rotation: rotation,
          cutLineType,
          contourPolygons,
        });

        const hasCollision = existing.some((st) => {
          return checkOverlap(candidateRect, getCutLineBoundingBox(st), spacing);
        });

        if (!hasCollision) {
          return { x: candidateX, y: candidateY };
        }
      }
    }
    return null;
  };

  // Pre-process added image URL (measure aspect ratio and place it)
  const processAndAddSticker = (url: string) => {
    setIsPlacingSticker(true);
    setError(null);
    setVisualizerMode("2d");

    const img = new Image();
    img.onload = () => {
      const aspect = img.width / img.height;
      const defaultWidthCm = 5.25; // 1/4 of A4 width (21cm)
      const defaultHeightCm = defaultWidthCm / aspect;

      const wMm = defaultWidthCm * 10;
      const hMm = defaultHeightCm * 10;

      // Find free space on the sheet (0 rotation initially)
      const pos = findFreePosition(wMm, hMm, 0, stickers);

      if (!pos) {
        setError("Brak miejsca na nową naklejkę! Uporządkuj lub powiększ istniejące naklejki.");
        setIsPlacingSticker(false);
        return;
      }

      const newSticker: PlacedSticker = {
        id: getUUID(),
        imageUrl: url,
        x: pos.x,
        y: pos.y,
        widthCm: defaultWidthCm,
        heightCm: defaultHeightCm,
        aspectRatio: aspect,
        cutLineType: "none",
      };

      setStickers([...stickers, newSticker]);
      setSelectedStickerId(newSticker.id);
      setAddingMethod("none");
      setIsPlacingSticker(false);
    };

    img.onerror = () => {
      setError("Nie udało się pobrać wymiarów obrazu.");
      setIsPlacingSticker(false);
    };

    img.src = url;
  };

  // Open edit modal for selected sticker
  const handleOpenEdit = () => {
    if (selectedSticker) {
      setActiveEditSticker(selectedSticker);
      setShowEditModal(true);
      setVisualizerMode("2d");
    }
  };

  const handleSaveEdit = (newUrl: string) => {
    if (!activeEditSticker) return;
    setVisualizerMode("2d");

    // Load new image to verify aspect ratio
    const img = new Image();
    img.onload = () => {
      const aspect = img.width / img.height;
      const newHeightCm = activeEditSticker.widthCm / aspect;

      // Validate bounds and collisions
      let finalWidthCm = activeEditSticker.widthCm;
      let finalHeightCm = newHeightCm;
      let finalX = activeEditSticker.x;
      let finalY = activeEditSticker.y;

      const otherStickers = stickers.filter((s) => s.id !== activeEditSticker.id);

      const testFits = (w: number) => {
        const h = w / aspect;
        const margins = getOuterMargins(activeEditSticker, { widthCm: w, heightCm: h });

        let tx = activeEditSticker.x;
        let ty = activeEditSticker.y;

        // Clamp to safety boundaries
        if (tx < 10 + margins.left) tx = 10 + margins.left;
        if (tx > 200 - margins.right) tx = 200 - margins.right;
        if (ty < 10 + margins.top) ty = 10 + margins.top;
        if (ty > 287 - margins.bottom) ty = 287 - margins.bottom;

        const fitsIn =
          tx >= 10 + margins.left &&
          tx <= 200 - margins.right &&
          ty >= 10 + margins.top &&
          ty <= 287 - margins.bottom;

        if (!fitsIn) return null;

        const rotRect = getCutLineBoundingBox(activeEditSticker, {
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

      const fitResult = testFits(finalWidthCm);
      if (fitResult) {
        finalX = fitResult.x;
        finalY = fitResult.y;
      } else {
        // Try to scale down to find a fit without collisions
        let found = false;
        for (let w = finalWidthCm; w >= 1.5; w -= 0.1) {
          const res = testFits(w);
          if (res) {
            finalWidthCm = res.w;
            finalHeightCm = res.h;
            finalX = res.x;
            finalY = res.y;
            found = true;
            break;
          }
        }

        if (!found) {
          // If scaling down in place doesn't work, try finding a free position on the sheet
          const freePos = findFreePosition(15, 15 / aspect, activeEditSticker.rotation || 0, otherStickers);
          if (freePos) {
            finalWidthCm = 1.5;
            finalHeightCm = 1.5 / aspect;
            finalX = freePos.x;
            finalY = freePos.y;
          } else {
            setError("Brak miejsca na zaktualizowaną naklejkę! Uporządkuj lub usuń inne naklejki.");
            setShowEditModal(false);
            setActiveEditSticker(null);
            return;
          }
        }
      }

      // Update sticker URL and dimensions
      setStickers(
        stickers.map((s) =>
          s.id === activeEditSticker.id
            ? {
              ...s,
              imageUrl: newUrl,
              widthCm: Math.round(finalWidthCm * 10) / 10,
              heightCm: Math.round(finalHeightCm * 10) / 10,
              aspectRatio: aspect,
              x: finalX,
              y: finalY,
              contourPolygons: undefined,
            }
            : s
        )
      );
      setShowEditModal(false);
      setActiveEditSticker(null);
    };
    img.onerror = () => {
      setError("Nie udało się zweryfikować wymiarów wykadrowanego obrazu.");
      setShowEditModal(false);
      setActiveEditSticker(null);
    };
    img.src = newUrl;
  };

  // Update selected sticker rotation
  const handleRotationChange = (degrees: number) => {
    if (!selectedSticker) return;

    const wMm = selectedSticker.widthCm * 10;
    const hMm = selectedSticker.heightCm * 10;

    // Bounding Box of new rotation
    const size = getRotatedSize(wMm, hMm, degrees);
    const offsetX = (size.w - wMm) / 2;
    const offsetY = (size.h - hMm) / 2;

    const margins = getOuterMargins(selectedSticker, { rotation: degrees });

    // Check bounds compensating for rotated pivot offset
    let targetX = selectedSticker.x;
    let targetY = selectedSticker.y;

    if (targetX < 10 + margins.left) targetX = 10 + margins.left;
    if (targetX > 200 - margins.right) targetX = 200 - margins.right;
    if (targetY < 10 + margins.top) targetY = 10 + margins.top;
    if (targetY > 287 - margins.bottom) targetY = 287 - margins.bottom;

    const fitsInBounds =
      targetX >= 10 + margins.left &&
      targetX <= 200 - margins.right &&
      targetY >= 10 + margins.top &&
      targetY <= 287 - margins.bottom;

    // Check collision with other stickers
    const otherStickers = stickers.filter((s) => s.id !== selectedSticker.id);

    const rotRect = getCutLineBoundingBox(selectedSticker, {
      x: targetX,
      y: targetY,
      rotation: degrees,
    });

    const collision = otherStickers.some((other) => {
      return checkOverlap(rotRect, getCutLineBoundingBox(other), 1.0);
    });

    if (!collision && fitsInBounds) {
      setStickers(
        stickers.map((s) =>
          s.id === selectedSticker.id ? { ...s, rotation: degrees, x: targetX, y: targetY } : s
        )
      );
    } else if (!fitsInBounds) {
      setError("Brak miejsca na obrócenie naklejki (kontur wychodzi poza arkusz).");
    } else {
      setError("Brak miejsca na obrócenie naklejki w tym ułożeniu! Przesuń ją najpierw.");
    }
  };

  // Update selected sticker width with fluid margins-shifting & obstacle-clamping
  const handleWidthChange = (val: number) => {
    if (!selectedSticker) return;

    const clampedVal = Math.max(1, Math.min(19, val));
    const aspect = selectedSticker.aspectRatio;

    const otherStickers = stickers.filter((s) => s.id !== selectedSticker.id);

    const testFits = (w: number) => {
      const h = w / aspect;
      const wMm = w * 10;
      const hMm = h * 10;
      const size = getRotatedSize(wMm, hMm, selectedSticker.rotation || 0);
      const offsetX = (size.w - wMm) / 2;
      const offsetY = (size.h - hMm) / 2;
      const margins = getOuterMargins(selectedSticker, { widthCm: w, heightCm: h });

      let tx = selectedSticker.x;
      let ty = selectedSticker.y;

      if (tx < 10 + margins.left) tx = 10 + margins.left;
      if (tx > 200 - margins.right) tx = 200 - margins.right;
      if (ty < 10 + margins.top) ty = 10 + margins.top;
      if (ty > 287 - margins.bottom) ty = 287 - margins.bottom;

      const fitsIn =
        tx >= 10 + margins.left &&
        tx <= 200 - margins.right &&
        ty >= 10 + margins.top &&
        ty <= 287 - margins.bottom;

      if (!fitsIn) return null;

      const rotRect = getCutLineBoundingBox(selectedSticker, {
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

    let fitWidthCm = selectedSticker.widthCm;
    let fitHeightCm = selectedSticker.heightCm;
    let fitX = selectedSticker.x;
    let fitY = selectedSticker.y;
    let found = false;

    const result = testFits(clampedVal);
    if (result) {
      fitWidthCm = result.w;
      fitHeightCm = result.h;
      fitX = result.x;
      fitY = result.y;
      found = true;
    } else {
      // Binary search for the maximum width that fits
      let low = selectedSticker.widthCm;
      let high = clampedVal;
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
      setStickers(
        stickers.map((s) =>
          s.id === selectedSticker.id
            ? { ...s, widthCm: Math.round(fitWidthCm * 10) / 10, heightCm: Math.round(fitHeightCm * 10) / 10, x: fitX, y: fitY }
            : s
        )
      );
    } else {
      setError("Brak miejsca na powiększenie w tym ułożeniu!");
    }
  };

  // Update selected sticker cut line type
  const handleCutLineChange = async (type: PlacedSticker["cutLineType"]) => {
    if (!selectedSticker) return;

    let polys = selectedSticker.contourPolygons;
    if (type === "contour" || type === "contour_inside") {
      try {
        const contourType = type === "contour_inside" ? "contour_inside" : "contour";
        polys = await getContourPoints(selectedSticker.imageUrl, contourType);
      } catch (err) {
        console.error("Failed to compute contour points:", err);
      }
    }

    const wMm = selectedSticker.widthCm * 10;
    const hMm = selectedSticker.heightCm * 10;

    const margins = getOuterMargins(selectedSticker, { cutLineType: type, contourPolygons: polys });

    let targetX = selectedSticker.x;
    let targetY = selectedSticker.y;

    if (targetX < 10 + margins.left) targetX = 10 + margins.left;
    if (targetX > 200 - margins.right) targetX = 200 - margins.right;
    if (targetY < 10 + margins.top) targetY = 10 + margins.top;
    if (targetY > 287 - margins.bottom) targetY = 287 - margins.bottom;

    const fitsInBounds =
      targetX >= 10 + margins.left &&
      targetX <= 200 - margins.right &&
      targetY >= 10 + margins.top &&
      targetY <= 287 - margins.bottom;

    if (!fitsInBounds) {
      setError("Brak miejsca na zmianę linii cięcia (kontur wychodzi poza arkusz)!");
      return;
    }

    // Check collision with other stickers
    const otherStickers = stickers.filter((s) => s.id !== selectedSticker.id);
    const rotRect = getCutLineBoundingBox(selectedSticker, {
      x: targetX,
      y: targetY,
      cutLineType: type,
      contourPolygons: polys,
    });

    const collision = otherStickers.some((other) => {
      return checkOverlap(rotRect, getCutLineBoundingBox(other), 1.0);
    });

    if (collision) {
      setError("Brak miejsca na zmianę linii cięcia (kolizja z inną naklejką)!");
      return;
    }

    setStickers(
      stickers.map((s) =>
        s.id === selectedSticker.id
          ? { ...s, cutLineType: type, contourPolygons: polys, x: targetX, y: targetY }
          : s
      )
    );
  };

  // Duplicate selected sticker
  const handleDuplicateSticker = () => {
    if (!selectedSticker) return;
    setError(null);

    const wMm = selectedSticker.widthCm * 10;
    const hMm = selectedSticker.heightCm * 10;

    const pos = findFreePosition(
      wMm,
      hMm,
      selectedSticker.rotation || 0,
      stickers,
      selectedSticker.cutLineType,
      selectedSticker.contourPolygons
    );

    if (!pos) {
      setError("Brak miejsca na zduplikowanie naklejki! Uporządkuj lub zmniejsz istniejące naklejki.");
      return;
    }

    const margins = getOuterMargins(selectedSticker);

    let targetX = pos.x;
    let targetY = pos.y;
    if (targetX < 10 + margins.left) targetX = 10 + margins.left;
    if (targetX > 200 - margins.right) targetX = 200 - margins.right;
    if (targetY < 10 + margins.top) targetY = 10 + margins.top;
    if (targetY > 287 - margins.bottom) targetY = 287 - margins.bottom;

    const duplicated: PlacedSticker = {
      ...selectedSticker,
      id: getUUID(),
      x: targetX,
      y: targetY,
    };

    setStickers([...stickers, duplicated]);
    setSelectedStickerId(duplicated.id);
  };

  // Download selected sticker image
  const handleDownloadSticker = async () => {
    if (!selectedSticker) return;
    try {
      const response = await fetch(`/api/proxy-image?url=${encodeURIComponent(selectedSticker.imageUrl)}`);
      if (!response.ok) throw new Error("Failed to fetch image via proxy");
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = `naklejka-${selectedSticker.id.slice(0, 8)}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);
    } catch (err) {
      console.error(err);
      setError("Nie udało się pobrać pliku naklejki.");
    }
  };

  // Delete selected sticker
  const handleDeleteSticker = () => {
    if (!selectedStickerId) return;
    setStickers(stickers.filter((s) => s.id !== selectedStickerId));
    setSelectedStickerId(null);
    setError(null);
  };

  // Helper to load image via proxy
  const loadProxiedImage = (url: string): Promise<HTMLImageElement> =>
    new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => resolve(img);
      img.onerror = (e) => reject(new Error("Failed to load image: " + url));
      img.src = `/api/proxy-image?url=${encodeURIComponent(url)}`;
    });

  // Render high resolution sheet on hidden canvas
  const renderSheetCanvas = async (mode: "normal" | "print" | "cut-lines" = "normal"): Promise<HTMLCanvasElement> => {
    const A4_W = 2480;
    const A4_H = 3508;
    const MM_TO_PX = A4_W / 210;

    const canvas = document.createElement("canvas");
    canvas.width = A4_W;
    canvas.height = A4_H;
    const ctx = canvas.getContext("2d")!;

    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, A4_W, A4_H);

    const loadedImages = mode === "cut-lines" ? [] : await Promise.all(
      stickers.map(async (st) => {
        try {
          const img = await loadProxiedImage(st.imageUrl);
          return { id: st.id, img };
        } catch (err) {
          console.error(err);
          return null;
        }
      })
    );

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
      let offsetPx = 0;
      if (st.cutLineType === "rounded" || st.cutLineType === "circle") {
        offsetPx = Math.max(st.widthCm, st.heightCm) * 10 * (8 / 120) * MM_TO_PX;
      } else if (st.cutLineType === "rounded_inside" || st.cutLineType === "circle_inside") {
        offsetPx = -Math.max(st.widthCm, st.heightCm) * 10 * (8 / 120) * MM_TO_PX;
      }

      if (mode === "cut-lines") {
        ctx.fillStyle = "#000000";
        if (st.cutLineType === "rounded" || st.cutLineType === "rounded_inside") {
          const rx = relX - offsetPx;
          const ry = relY - offsetPx;
          const rw = drawW + 2 * offsetPx;
          const rh = drawH + 2 * offsetPx;
          const r = 25;
          ctx.beginPath();
          ctx.moveTo(rx + r, ry);
          ctx.lineTo(rx + rw - r, ry);
          ctx.quadraticCurveTo(rx + rw, ry, rx + rw, ry + r);
          ctx.lineTo(rx + rw, ry + rh - r);
          ctx.quadraticCurveTo(rx + rw, ry + rh, rx + rw - r, ry + rh);
          ctx.lineTo(rx + r, ry + rh);
          ctx.quadraticCurveTo(rx, ry + rh, rx, ry + rh - r);
          ctx.lineTo(rx, ry + r);
          ctx.quadraticCurveTo(rx, ry, rx + r, ry);
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
        // Normal or Print mode
        if (mode === "normal") {
          if (st.cutLineType === "rounded" || st.cutLineType === "rounded_inside") {
            ctx.strokeStyle = "#ff5ebb";
            ctx.lineWidth = 6;
            ctx.setLineDash([15, 10]);
            const rx = relX - offsetPx;
            const ry = relY - offsetPx;
            const rw = drawW + 2 * offsetPx;
            const rh = drawH + 2 * offsetPx;
            const r = 25;
            ctx.beginPath();
            ctx.moveTo(rx + r, ry);
            ctx.lineTo(rx + rw - r, ry);
            ctx.quadraticCurveTo(rx + rw, ry, rx + rw, ry + r);
            ctx.lineTo(rx + rw, ry + rh - r);
            ctx.quadraticCurveTo(rx + rw, ry + rh, rx + rw - r, ry + rh);
            ctx.lineTo(rx + r, ry + rh);
            ctx.quadraticCurveTo(rx, ry + rh, rx, ry + rh - r);
            ctx.lineTo(rx, ry + r);
            ctx.quadraticCurveTo(rx, ry, rx + r, ry);
            ctx.closePath();
            ctx.stroke();
          } else if (st.cutLineType === "circle" || st.cutLineType === "circle_inside") {
            ctx.strokeStyle = "#ff5ebb";
            ctx.lineWidth = 6;
            ctx.setLineDash([15, 10]);
            ctx.beginPath();
            ctx.ellipse(0, 0, drawW / 2 + offsetPx, drawH / 2 + offsetPx, 0, 0, 2 * Math.PI);
            ctx.closePath();
            ctx.stroke();
          } else if (st.cutLineType === "contour" || st.cutLineType === "contour_inside") {
            ctx.strokeStyle = "#ff5ebb";
            ctx.lineWidth = 6;
            ctx.setLineDash([15, 10]);
            ctx.lineJoin = "round";

            if (st.contourPolygons && st.contourPolygons.length > 0) {
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
          }
        }

        const loaded = loadedImages.find((item) => item?.id === st.id);
        if (loaded?.img) {
          ctx.save();
          const imgRadius = 2.5 * MM_TO_PX;
          ctx.beginPath();
          ctx.moveTo(relX + imgRadius, relY);
          ctx.lineTo(relX + drawW - imgRadius, relY);
          ctx.quadraticCurveTo(relX + drawW, relY, relX + drawW, relY + imgRadius);
          ctx.lineTo(relX + drawW, relY + drawH - imgRadius);
          ctx.quadraticCurveTo(relX + drawW, relY + drawH, relX + drawW - imgRadius, relY + drawH);
          ctx.lineTo(relX + imgRadius, relY + drawH);
          ctx.quadraticCurveTo(relX, relY + drawH, relX, relY + drawH - imgRadius);
          ctx.lineTo(relX, relY + imgRadius);
          ctx.quadraticCurveTo(relX, relY, relX + imgRadius, relY);
          ctx.closePath();
          ctx.clip();

          const isInsideCut = st.cutLineType === "rounded_inside" || st.cutLineType === "circle_inside" || st.cutLineType === "contour_inside";
          if (mode === "normal" && isInsideCut) {
            ctx.save();
            ctx.beginPath();
            if (st.cutLineType === "rounded_inside") {
              const rx = relX - offsetPx;
              const ry = relY - offsetPx;
              const rw = drawW + 2 * offsetPx;
              const rh = drawH + 2 * offsetPx;
              const r = 25;
              ctx.moveTo(rx + r, ry);
              ctx.lineTo(rx + rw - r, ry);
              ctx.quadraticCurveTo(rx + rw, ry, rx + rw, ry + r);
              ctx.lineTo(rx + rw, ry + rh - r);
              ctx.quadraticCurveTo(rx + rw, ry + rh, rx + rw - r, ry + rh);
              ctx.lineTo(rx + r, ry + rh);
              ctx.quadraticCurveTo(rx, ry + rh, rx, ry + rh - r);
              ctx.lineTo(rx, ry + r);
              ctx.quadraticCurveTo(rx, ry, rx + r, ry);
            } else if (st.cutLineType === "circle_inside") {
              ctx.ellipse(0, 0, drawW / 2 + offsetPx, drawH / 2 + offsetPx, 0, 0, 2 * Math.PI);
            } else if (st.cutLineType === "contour_inside") {
              if (st.contourPolygons && st.contourPolygons.length > 0) {
                st.contourPolygons.forEach((poly) => {
                  if (poly.length < 2) return;
                  ctx.moveTo(relX + poly[0].x * drawW, relY + poly[0].y * drawH);
                  for (let i = 1; i < poly.length; i++) {
                    ctx.lineTo(relX + poly[i].x * drawW, relY + poly[i].y * drawH);
                  }
                });
              } else {
                ctx.rect(relX, relY, drawW, drawH);
              }
            }
            ctx.closePath();
            ctx.clip();
            ctx.drawImage(loaded.img, relX, relY, drawW, drawH);
            ctx.restore();
          } else {
            ctx.drawImage(loaded.img, relX, relY, drawW, drawH);
          }
          ctx.restore();
        }
      }

      ctx.restore();
    }

    return canvas;
  };

  // Add sheet to Cart
  const handleAddToCart = () => {
    if (stickers.length === 0 || stickers.some((s) => s.cutLineType === "none")) return;
    setShowConfirmCartModal(true);
  };

  // Actual logic to save and add to cart after confirmation
  const executeAddToCart = async () => {
    setIsAddingToCart(true);
    setError(null);

    try {
      const canvas = await renderSheetCanvas("print");
      const blob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob((b) => resolve(b), "image/jpeg", 0.85)
      );

      if (!blob) throw new Error("Could not export canvas to blob.");

      const fileName = `composition-${getUUID()}.jpg`;
      const storageRef = ref(storage, `uploads/${fileName}`);
      const snapshot = await uploadBytes(storageRef, blob);
      const downloadUrl = await getDownloadURL(snapshot.ref);

      addItem({
        imageUrl: downloadUrl,
        widthCm: 21,
        heightCm: 29.7, // A4 sheet size
        stickersPerSheet: stickers.length,
        sheetQuantity: sheetQuantity,
        pricePerSheet: 49.00,
      });

      setShowConfirmCartModal(false);
      router.push("/koszyk");
    } catch (err: any) {
      console.error(err);
      setError("Wystąpił błąd podczas zapisywania Twojej kompozycji.");
    } finally {
      setIsAddingToCart(false);
    }
  };

  // Download high-res PDF
  const handleDownloadPDF = async (mode: "print" | "cut-lines") => {
    if (stickers.length === 0) return;
    setIsGeneratingPdf(true);
    setError(null);

    try {
      const canvas = await renderSheetCanvas(mode);
      const imgData = canvas.toDataURL("image/jpeg", 0.85);

      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      pdf.addImage(imgData, "JPEG", 0, 0, 210, 297);

      const fileSuffix = mode === "print" ? "DRUK" : "LINIE_CIECIA";
      pdf.save(`kompozycja-arkusza-A4-${fileSuffix}.pdf`);
    } catch (err: any) {
      console.error(err);
      setError("Nie udało się wygenerować pliku PDF.");
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  // Mobile upload file helper
  const handleMobileFileUpload = async (file: File) => {
    if (!file || !file.type.startsWith("image/")) return;
    setIsPageUploading(true);
    setError(null);

    try {
      const fileName = `mobile-upload-${getUUID()}-${file.name}`;
      const storageRef = ref(storage, `uploads/${fileName}`);
      const snapshot = await uploadBytes(storageRef, file);
      const downloadUrl = await getDownloadURL(snapshot.ref);

      setPendingImageUrl(downloadUrl);
      // Open crop/bg removal modal for the newly uploaded sticker immediately
      setActiveEditSticker({
        id: "new-upload",
        imageUrl: downloadUrl,
        x: 15,
        y: 15,
        widthCm: 5,
        heightCm: 5,
        aspectRatio: 1,
        cutLineType: "none",
      });
      setShowEditModal(true);
      setVisualizerMode("2d");
    } catch (err) {
      console.error(err);
      setError("Nie udało się przesłać pliku.");
    } finally {
      setIsPageUploading(false);
    }
  };

  if (!mounted) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="animate-pulse font-extrabold text-xl text-primary">Ładowanie kreatora...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground pb-6 relative">
      {/* Sticky Top Notification */}
      {error && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-[100] max-w-md w-full px-4 animate-in fade-in slide-in-from-top duration-300">
          <div className="bg-red-50 text-red-500 dark:bg-red-950/30 dark:text-red-400 p-4 rounded-2xl shadow-lg border border-red-200 dark:border-red-900/30 flex items-center justify-between gap-3">
            <span className="text-sm font-extrabold">{error}</span>
            <button
              onClick={() => setError(null)}
              className="text-xs bg-red-100 hover:bg-red-200 dark:bg-red-900/30 dark:hover:bg-red-900 text-red-600 dark:text-red-300 p-1 px-2.5 rounded-lg transition-all"
            >
              Zamknij
            </button>
          </div>
        </div>
      )}

      {isPageUploading && (
        <div className="fixed inset-0 z-[150] bg-background/80 backdrop-blur-sm flex flex-col items-center justify-center">
          <div className="flex flex-col items-center gap-4 text-primary">
            <Loader2 className="w-16 h-16 animate-spin" />
            <p className="text-xl font-extrabold">Dodawanie na arkusz...</p>
          </div>
        </div>
      )}

      <Header />

      <main className="flex-1 flex flex-col py-6 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto w-full justify-center relative gap-8">

        {/* Page Info */}
        <div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Dodaj Naklejki na Arkusz
          </h1>
          <p className="text-muted-foreground text-sm font-semibold mt-1">
            Dodaj różne naklejki z komputera lub stwórz je za pomocą naszego generatora obrazów.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* Left Column: Controls & Sidebar */}
          <div className="lg:col-span-6 space-y-6 order-2 lg:order-1">

            {/* 1. Tool selection: Add Sticker */}
            <div className="bg-card border border-border/60 rounded-3xl p-6 shadow-sm space-y-4">
              <h3 className="text-lg font-black text-foreground flex items-center gap-2">
                <Plus className="w-5 h-5 text-primary" />
                Dodaj naklejkę na arkusz
              </h3>

              {addingMethod === "none" ? (
                <div className="grid grid-cols-2 gap-4">
                  {/* Unified Direct File Picker */}
                  <label
                    className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-border/70 hover:border-primary/45 rounded-2xl bg-muted/10 hover:bg-muted/30 transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
                  >
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleMobileFileUpload(file);
                        e.target.value = "";
                      }}
                    />
                    <UploadCloud className="w-8 h-8 text-muted-foreground group-hover:text-primary mb-2 opacity-75" />
                    <span className="text-sm font-bold text-foreground">Wgraj zdjęcie</span>
                    <span className="text-[10px] font-semibold text-muted-foreground mt-0.5">JPG / PNG</span>
                  </label>

                  <button
                    onClick={() => setAddingMethod("ai")}
                    className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-border/70 hover:border-secondary/45 rounded-2xl bg-muted/10 hover:bg-muted/30 transition-all hover:scale-[1.01]"
                  >
                    <Wand2 className="w-8 h-8 text-muted-foreground group-hover:text-secondary mb-2 opacity-75" />
                    <span className="text-sm font-bold text-foreground">Wygeneruj przez AI</span>
                    <span className="text-[10px] font-semibold text-muted-foreground mt-0.5">Opisz swój pomysł</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex justify-between items-center pb-2 border-b border-border/20">
                    <span className="text-xs font-black uppercase tracking-wider text-muted-foreground">
                      Tworzenie przez AI
                    </span>
                    <button
                      onClick={() => setAddingMethod("none")}
                      className="text-xs font-bold text-muted-foreground hover:text-foreground bg-muted/40 hover:bg-muted/70 px-2.5 py-1 rounded-md"
                    >
                      Anuluj
                    </button>
                  </div>

                  <AIGenerator
                    onImageGenerated={(url) => {
                      setPendingImageUrl(url);
                      // Open crop/bg removal modal for AI generated sticker immediately
                      setActiveEditSticker({
                        id: "new-ai",
                        imageUrl: url,
                        x: 15,
                        y: 15,
                        widthCm: 5,
                        heightCm: 5,
                        aspectRatio: 1,
                        cutLineType: "none",
                      });
                      setShowEditModal(true);
                      setVisualizerMode("2d");
                    }}
                  />
                </div>
              )}
            </div>

            {/* 2. Selected Sticker Manager */}
            {selectedSticker ? (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-card border-2 border-primary/40 rounded-3xl p-6 shadow-sm space-y-6"
              >
                <div className="flex justify-between items-center border-b border-border/40 pb-3">
                  <div className="flex items-center gap-2">
                    <Layers className="w-5 h-5 text-primary" />
                    <h3 className="text-lg font-black text-foreground">Wybrana Naklejka</h3>
                  </div>
                </div>

                {/* Standardized Actions Button Grid */}
                <div className="flex flex-wrap sm:flex-nowrap items-center gap-1.5 w-full">
                  <button
                    type="button"
                    onClick={handleOpenEdit}
                    className="flex-1 inline-flex items-center justify-center gap-1 px-2 py-1.5 text-[11px] font-bold bg-muted/65 hover:bg-muted text-foreground border border-border/40 rounded-xl transition-all active:scale-95"
                    title="Edytuj naklejkę"
                  >
                    <Crop className="w-3.5 h-3.5" />
                    <span>Edytuj</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleDuplicateSticker}
                    className="flex-1 inline-flex items-center justify-center gap-1 px-2 py-1.5 text-[11px] font-bold bg-muted/65 hover:bg-muted text-foreground border border-border/40 rounded-xl transition-all active:scale-95"
                    title="Zduplikuj"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>Zduplikuj</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleDownloadSticker}
                    className="flex-1 inline-flex items-center justify-center gap-1 px-2 py-1.5 text-[11px] font-bold bg-muted/65 hover:bg-muted text-foreground border border-border/40 rounded-xl transition-all active:scale-95"
                    title="Pobierz"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Pobierz</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleDeleteSticker}
                    className="flex-1 inline-flex items-center justify-center gap-1 px-2 py-1.5 text-[11px] font-bold bg-destructive/10 hover:bg-destructive/15 text-destructive border border-destructive/20 rounded-xl transition-all active:scale-95"
                    title="Usuń"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Usuń</span>
                  </button>
                </div>

                {/* Miniature and Stacked Details Row */}
                <div className="flex items-center gap-5 bg-muted/20 border border-border/40 p-3 rounded-2xl">
                  <div className="w-16 h-16 bg-white rounded-xl border border-border/40 p-1 flex items-center justify-center flex-shrink-0">
                    <img
                      src={selectedSticker.imageUrl}
                      alt="Miniatura"
                      className="max-w-full max-h-full object-contain"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-black text-muted-foreground uppercase tracking-wide">Szczegóły</p>
                    <div className="text-xs font-bold text-foreground mt-0.5 space-y-0.5">
                      <p>Szerokość: {selectedSticker.widthCm} cm</p>
                      <p>Wysokość: {selectedSticker.heightCm.toFixed(1)} cm</p>
                    </div>
                  </div>
                </div>

                {isLowRes && (
                  <div className="bg-red-50 border border-red-200 text-red-500 dark:bg-red-950/30 dark:border-red-900/30 dark:text-red-400 text-xs font-bold p-3 rounded-2xl flex items-start gap-2 mt-2">
                    <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-extrabold text-[12px]">Uwaga: niska jakość pliku!</p>
                      <p className="text-[10px] leading-relaxed mt-0.5 font-semibold text-red-500/80 dark:text-red-400/80">
                        Ta naklejka może być rozmazana w druku. Zalecamy dodanie pliku o lepszej jakości.
                      </p>
                    </div>
                  </div>
                )}

                {/* Resize control */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm font-bold">
                    <span className="text-foreground">Szerokość naklejki (cm)</span>
                    <span className="text-primary font-black">{selectedSticker.widthCm} cm</span>
                  </div>
                  <input
                    type="range"
                    min={3}
                    max={19}
                    step={0.1}
                    value={selectedSticker.widthCm}
                    onChange={(e) => handleWidthChange(Number(e.target.value))}
                    className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
                  />
                  <p className="text-[10px] text-muted-foreground font-semibold">
                    Wysokość jest wyliczana automatycznie proporcjonalnie do grafiki (maksymalnie 19 cm).
                  </p>
                </div>

                {/* Rotation control */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm font-bold">
                    <span className="text-foreground">Obrót naklejki (stopnie)</span>
                    <span className="text-primary font-black">{selectedSticker.rotation || 0}°</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={360}
                    step={1}
                    value={selectedSticker.rotation || 0}
                    onChange={(e) => handleRotationChange(Number(e.target.value))}
                    className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
                  />
                  <div className="relative w-full h-8 mt-2">
                    {[0, 90, 180, 270, 360].map((deg) => {
                      const pct = (deg / 360) * 100;
                      return (
                        <button
                          key={deg}
                          type="button"
                          onClick={() => handleRotationChange(deg)}
                          style={{
                            left: `${pct}%`,
                            transform: `translateX(-${pct}%)`,
                          }}
                          className={`absolute text-[10px] font-extrabold rounded-md border transition-all px-2 py-0.5 ${(selectedSticker.rotation || 0) === deg
                            ? "bg-secondary/20 text-secondary-foreground border-secondary/40"
                            : "bg-muted/40 hover:bg-muted text-muted-foreground border-transparent"
                            }`}
                        >
                          {deg}°
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Cut line options */}
                <div className="space-y-3">
                  <span className="text-sm font-bold text-foreground block">Rodzaj linii cięcia (naklejki)</span>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { type: "none", label: "Brak", icon: Ban },
                      { type: "contour", label: "Kontur", icon: Sparkles },
                      { type: "rounded", label: "Prostokąt", icon: Square },
                      { type: "circle", label: "Koło", icon: Circle },
                      { type: "rounded_inside", label: "Prostokąt wew.", icon: Square },
                      { type: "circle_inside", label: "Koło wew.", icon: Circle },
                    ].map((opt) => {
                      const Icon = opt.icon;
                      return (
                        <button
                          key={opt.type}
                          onClick={() => handleCutLineChange(opt.type as any)}
                          className={`py-3 px-1 text-xs font-bold rounded-xl border text-center transition-all flex flex-col items-center justify-center gap-1.5 active:scale-95 ${selectedSticker.cutLineType === opt.type
                            ? "bg-primary text-primary-foreground border-primary shadow-sm"
                            : "bg-background text-muted-foreground border-border hover:bg-muted/40"
                            }`}
                        >
                          <Icon className="w-4 h-4" />
                          <span>{opt.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </motion.div>
            ) : stickers.length === 0 ? (
              <div className="bg-card border border-border/60 rounded-3xl p-6 shadow-sm text-center py-8 text-muted-foreground font-semibold flex flex-col items-center gap-3 animate-pulse">
                <ArrowUp className="w-6 h-6 text-primary" />
                <span>Dodaj swoją pierwszą naklejkę na arkusz!</span>
              </div>
            ) : (
              <div className="hidden sm:block bg-card border border-border/60 rounded-3xl p-6 shadow-sm text-center py-8 text-muted-foreground font-semibold">
                Kliknij na naklejkę na arkuszu, aby włączyć jej dopasowanie, zmienić rozmiar lub rodzaj cięcia.
              </div>
            )}

          </div>

          {/* Right Column: Visualizer Sheet */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`relative lg:col-span-6 flex flex-col items-center justify-center rounded-3xl p-6 sm:p-8 min-h-[500px] order-1 lg:order-2 transition-all ${
              stickers.length === 0
                ? "bg-transparent sm:bg-card border-none sm:border sm:border-border/60 shadow-none sm:shadow-[0_8px_30px_rgba(0,0,0,0.02)]"
                : "bg-card border border-border/60 shadow-[0_8px_30px_rgba(0,0,0,0.02)]"
            }`}
          >
            {/* Local Drag Overlay */}
            {isDraggingOverSheet && (
              <div className="absolute inset-0 z-[50] bg-primary/20 backdrop-blur-md flex flex-col items-center justify-center border-4 border-dashed border-primary rounded-3xl animate-in fade-in duration-200 m-2 pointer-events-none">
                <div className="bg-background/90 p-8 rounded-2xl shadow-xl flex flex-col items-center gap-3 text-center max-w-xs">
                  <UploadCloud className="w-12 h-12 text-primary animate-bounce" />
                  <h3 className="text-lg font-extrabold text-foreground">Upuść plik tutaj!</h3>
                  <p className="text-xs text-muted-foreground font-semibold">Dodaj naklejkę bezpośrednio na arkusz</p>
                </div>
              </div>
            )}

            <div className="flex flex-col sm:flex-row items-center justify-between w-full mb-6 gap-3 border-b border-border/40 pb-4">
              <p className="text-xs font-black uppercase text-muted-foreground tracking-wider">
                Twój Arkusz A4 (Podgląd ułożenia)
              </p>

              <div className="flex bg-muted/60 p-0.5 rounded-xl border border-border/30 relative">
                <button
                  type="button"
                  onClick={() => setVisualizerMode("2d")}
                  className={`relative px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${visualizerMode === "2d" ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                    }`}
                >
                  {visualizerMode === "2d" && (
                    <motion.div
                      layoutId="activeVisualizerMode"
                      className="absolute inset-0 bg-background rounded-lg shadow-sm"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                  <span className="relative z-10">Edycja</span>
                </button>
                <button
                  type="button"
                  onClick={() => setVisualizerMode("3d")}
                  className={`relative px-4 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 ${visualizerMode === "3d" ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                    }`}
                >
                  {visualizerMode === "3d" && (
                    <motion.div
                      layoutId="activeVisualizerMode"
                      className="absolute inset-0 bg-background rounded-lg shadow-sm"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                  <span className="relative z-10">Wizualizacja</span>
                </button>
              </div>
            </div>

            <div className="relative w-full max-w-[480px] aspect-[210/297] flex items-center justify-center">
              {visualizerMode === "2d" ? (
                <NewA4Visualizer
                  stickers={stickers}
                  selectedStickerId={selectedStickerId}
                  onSelectSticker={setSelectedStickerId}
                  onUpdateStickers={setStickers}
                  onError={setError}
                  onEditSticker={handleOpenEdit}
                  onDuplicateSticker={handleDuplicateSticker}
                  onDeleteSticker={handleDeleteSticker}
                  onCutLineChange={handleCutLineChange}
                  isPresentationMode={stickers.length === 0 && !hasUserEverAddedStickers}
                />
              ) : (
                <A4Visualizer3D stickers={stickers} />
              )}

              {stickers.length === 0 && (
                <label className="absolute inset-0 flex sm:hidden flex-col items-center justify-center bg-transparent cursor-pointer z-40 rounded-lg">
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleMobileFileUpload(file);
                      e.target.value = "";
                    }}
                  />
                  <div className="flex flex-col items-center justify-center bg-background/95 backdrop-blur-sm border border-border/80 py-4 px-6 rounded-2xl shadow-lg animate-bounce">
                    <UploadCloud className="w-6 h-6 text-primary mb-1.5" />
                    <span className="text-xs font-extrabold text-foreground">Wgraj zdjęcie</span>
                    <span className="text-[9px] font-semibold text-muted-foreground mt-0.5">Dodaj pierwszą naklejkę</span>
                  </div>
                </label>
              )}
            </div>

            <div className="flex flex-wrap items-center justify-center gap-2 mt-4 w-full max-w-md">
              <button
                onClick={() => handleDownloadPDF("print")}
                disabled={isGeneratingPdf || stickers.length === 0}
                className="flex-1 inline-flex items-center justify-center rounded-2xl text-xs font-bold bg-muted text-muted-foreground hover:bg-muted/80 h-12 px-4 transition-all disabled:opacity-50"
                title="Pobierz plik PDF do druku (bez linii cięcia)"
              >
                {isGeneratingPdf ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
                ) : (
                  <Download className="w-4 h-4 mr-1.5" />
                )}
                PDF Druk
              </button>

              <button
                onClick={() => handleDownloadPDF("cut-lines")}
                disabled={isGeneratingPdf || stickers.length === 0}
                className="flex-1 inline-flex items-center justify-center rounded-2xl text-xs font-bold bg-secondary/20 text-secondary-foreground hover:bg-secondary/35 h-12 px-4 transition-all disabled:opacity-50"
                title="Pobierz plik PDF z liniami cięcia (czarne sylwetki)"
              >
                <Scissors className="w-4 h-4 mr-1.5" />
                PDF Linie
              </button>
            </div>

            <p className="text-[11px] text-muted-foreground bg-muted/20 border border-border/40 p-3 rounded-2xl font-bold mt-4 text-center max-w-md mx-auto">
              Uwaga: Po zmniejszeniu rozmiaru naklejki tekst i małe elementy mogą stać się nieczytelne.
            </p>
          </div>

        </div>

        {/* Floating/Sticky Bottom Summary Bar */}
        <div className="relative sm:sticky bottom-0 sm:bottom-4 z-40 bg-background/95 backdrop-blur-md border border-border shadow-[0_8px_30px_rgba(0,0,0,0.08)] py-4 px-6 sm:px-8 rounded-2xl mt-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Left: Summary Info */}
            <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
              <div>
                <p className="text-xs font-black uppercase text-muted-foreground tracking-wider">Podsumowanie</p>
                <h4 className="text-xl font-black text-foreground">
                  {(49.0 * sheetQuantity).toFixed(2)} zł <span className="text-xs font-semibold text-muted-foreground">({sheetQuantity} szt.)</span>
                </h4>
                {stickers.length > 0 && (
                  <p className="text-[10px] font-bold text-muted-foreground sm:hidden mt-0.5 animate-in fade-in duration-200">
                    {stickers.length} {getStickersNoun(stickers.length)} (Tylko {(49.00 / stickers.length).toFixed(2)} zł za 1 naklejkę!)
                  </p>
                )}
                {stickers.some((s) => s.cutLineType === "none") && (
                  <p className="text-[10px] font-bold text-destructive mt-1 animate-pulse">
                    Wybierz linię cięcia dla wszystkich naklejek!
                  </p>
                )}
              </div>
              <div className="text-[10px] text-muted-foreground font-semibold border-l border-border/60 pl-4 hidden sm:block">
                <p>Cena: 49.00 zł / arkusz A4</p>
                <p>{stickers.length} {getStickersNoun(stickers.length)} na arkuszu</p>
                {stickers.length > 0 && (
                  <p className="mt-0.5">
                    Tylko {(49.00 / stickers.length).toFixed(2)} zł za 1 naklejkę!
                  </p>
                )}
              </div>
            </div>

            {/* Right: Actions & Quantity */}
            <div className="flex flex-wrap items-center justify-center gap-4 w-full md:w-auto">
              {/* Quantity Selector & Shipping Info */}
              <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto justify-center">
                <div className="flex items-center gap-3 bg-muted/50 border border-border/30 px-3 py-1.5 rounded-2xl">
                  <span className="text-xs font-bold text-muted-foreground">Arkusze:</span>
                  <button
                    type="button"
                    onClick={() => setSheetQuantity(Math.max(1, sheetQuantity - 1))}
                    disabled={sheetQuantity <= 1}
                    className="w-8 h-8 rounded-xl bg-background hover:bg-muted border border-border flex items-center justify-center font-bold active:scale-95 transition-transform disabled:opacity-30 disabled:pointer-events-none"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="text-sm font-black w-6 text-center text-foreground">{sheetQuantity}</span>
                  <button
                    type="button"
                    onClick={() => setSheetQuantity(sheetQuantity + 1)}
                    className="w-8 h-8 rounded-xl bg-background hover:bg-muted border border-border flex items-center justify-center font-bold active:scale-95 transition-transform"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="flex items-center gap-1.5 text-[11px] font-black text-secondary whitespace-nowrap">
                  <Truck className="w-4 h-4 text-secondary" />
                  <span>Wysyłka w ciągu 3 dni</span>
                </div>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row items-center gap-2 w-full sm:w-auto">
                <button
                  onClick={handleAddToCart}
                  disabled={isAddingToCart || stickers.length === 0 || stickers.some((s) => s.cutLineType === "none")}
                  className="w-full sm:w-auto inline-flex items-center justify-center rounded-2xl text-sm font-bold bg-primary text-primary-foreground hover:bg-primary/95 active:scale-[0.98] h-12 px-6 shadow-sm transition-all disabled:opacity-50"
                >
                  {isAddingToCart ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <ShoppingCart className="w-4 h-4 mr-2" />
                  )}
                  Dodaj do koszyka
                </button>

              </div>
            </div>
          </div>
        </div>

      </main>

      {/* Edit Modal (Crop + AI background removal) */}
      <AnimatePresence>
        {showEditModal && activeEditSticker && (
          <StickerEditModal
            imageSrc={activeEditSticker.imageUrl}
            onSave={(url) => {
              if (activeEditSticker.id === "new-upload" || activeEditSticker.id === "new-ai") {
                processAndAddSticker(url);
                setShowEditModal(false);
                setActiveEditSticker(null);
                setPendingImageUrl(null);
              } else {
                handleSaveEdit(url);
              }
            }}
            onCancel={() => {
              setShowEditModal(false);
              setActiveEditSticker(null);
              setPendingImageUrl(null);
            }}
          />
        )}
      </AnimatePresence>

      {/* Confirm Cart Modal */}
      <AnimatePresence>
        {showConfirmCartModal && (
          <div className="fixed inset-0 z-[150] bg-foreground/30 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="bg-card border border-border/80 rounded-3xl w-full max-w-md p-6 sm:p-8 flex flex-col gap-4 shadow-[0_12px_40px_rgba(0,0,0,0.06)] relative animate-in fade-in zoom-in-95 duration-200"
            >
              {/* Header */}
              <div className="flex justify-between items-center w-full pb-2 border-b border-border/30">
                <div className="flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5 text-primary" />
                  <h3 className="text-lg font-extrabold text-foreground">Czy arkusz jest gotowy?</h3>
                </div>
                {!isAddingToCart && (
                  <button
                    onClick={() => setShowConfirmCartModal(false)}
                    className="p-1.5 rounded-full border border-border hover:bg-muted/50 active:scale-95 transition-all cursor-pointer"
                  >
                    <X className="w-4 h-4 text-foreground" />
                  </button>
                )}
              </div>

              {/* Message */}
              <div className="py-2">
                <p className="text-sm font-semibold text-muted-foreground leading-relaxed text-left">
                  Po dodaniu do koszyka <strong>nie będziesz mieć możliwości edycji</strong> tego arkusza.
                </p>
              </div>

              {/* Actions */}
              <div className="grid grid-cols-2 gap-3 w-full pt-3 border-t border-border/30">
                <button
                  type="button"
                  onClick={() => setShowConfirmCartModal(false)}
                  disabled={isAddingToCart}
                  className="w-full inline-flex items-center justify-center rounded-xl text-xs sm:text-sm font-bold bg-muted hover:bg-muted/80 text-foreground h-11 transition-all active:scale-[0.98] disabled:opacity-50 cursor-pointer whitespace-nowrap"
                >
                  Edytuj dalej
                </button>
                <button
                  type="button"
                  onClick={executeAddToCart}
                  disabled={isAddingToCart}
                  className="w-full inline-flex items-center justify-center rounded-xl text-xs sm:text-sm font-bold bg-primary text-primary-foreground hover:bg-primary/95 h-11 shadow-sm transition-all active:scale-[0.98] disabled:opacity-50 cursor-pointer whitespace-nowrap"
                >
                  {isAddingToCart ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                      Zapisujemy...
                    </>
                  ) : (
                    "Tak, dodaj do koszyka!"
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <footer className="py-8 text-center text-sm text-muted-foreground border-t mt-12 bg-gradient-to-r from-[#fdf2f8] via-[#f5f3ff] to-[#ecfeff] border-t border-border/60">
        <div className="max-w-5xl mx-auto flex flex-col items-center px-4 gap-4">
          <div className="flex flex-wrap justify-center gap-x-6 gap-y-2">
            <Link href="/regulamin" className="hover:underline">Regulamin</Link>
            <Link href="/polityka-prywatnosci" className="hover:underline">Polityka prywatności</Link>
            <Link href="/pliki-cookies" className="hover:underline">Pliki cookies</Link>
            <Link href="/kontakt" className="hover:underline">Kontakt</Link>
          </div>
          <p className="text-xs text-muted-foreground/80 mt-2">&copy; {new Date().getFullYear()} MałeNaklejki. Wszelkie prawa zastrzeżone.</p>
        </div>
      </footer>
    </div>
  );
}
