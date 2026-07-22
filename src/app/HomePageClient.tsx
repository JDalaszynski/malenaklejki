"use client";

import { getUUID } from "@/lib/uuid";
import { useState, useEffect, useMemo, useRef } from "react";
import Link from "next/link";
import NextImage from "next/image";
import dynamic from "next/dynamic";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { MiniHero } from "@/components/home/MiniHero";
import { LatestBlogPosts } from "@/components/blog/LatestBlogPosts";
import { NewA4Visualizer } from "@/components/creator/NewA4Visualizer";

// Heavy components loaded on-demand to reduce initial bundle size (~110KB → ~60KB)
const A4Visualizer3D = dynamic(
  () => import("@/components/creator/A4Visualizer3D").then(mod => ({ default: mod.A4Visualizer3D })),
  { ssr: false, loading: () => <div className="w-full aspect-[210/297] rounded-2xl bg-muted animate-pulse" /> }
);
const StickerEditModal = dynamic(
  () => import("@/components/creator/StickerEditModal").then(mod => ({ default: mod.StickerEditModal })),
  { ssr: false }
);
const AIGenerator = dynamic(
  () => import("@/components/creator/AIGenerator").then(mod => ({ default: mod.AIGenerator })),
  { ssr: false }
);
import { JsonLd } from "@/components/seo/JsonLd";
import { TrustBar } from "@/components/home/TrustBar";
import { UseCasesSection } from "@/components/home/UseCasesSection";
import { WhyUsSection } from "@/components/home/WhyUsSection";
import { PaymentsBar } from "@/components/home/PaymentsBar";
import { HowItWorksSection } from "@/components/home/HowItWorksSection";
import { PricingSection } from "@/components/home/PricingSection";
import { CreatorPowersSection } from "@/components/home/CreatorPowersSection";
import { FAQSection } from "@/components/home/FAQSection";
import { FinalCTASection } from "@/components/home/FinalCTASection";
import { PlacedSticker } from "@/types/creator";
import { useCartStore } from "@/store/cartStore";
import { checkOverlap, getRotatedSize, getCutLineMargins, getOuterMargins, getCutLineBoundingBox, checkStickersCollision, clampToUsableArea, getDisplayedWidthCm, getGraphicWidthFromDisplayed } from "@/lib/utils/collision";
import { getContourPoints } from "@/lib/utils/contour";
import { getStickersNoun, getIndividualStickersLabel } from "@/lib/utils/polish";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "@/lib/firebase/client";
import { useRouter } from "next/navigation";
import {
  UploadCloud, ImagePlus,
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
  ChevronDown,
  ChevronUp,
  Edit3,
  Eye,
  Wand2,
  LayoutGrid,
  ClipboardPaste,
  MousePointerClick,
  Keyboard,
  SmilePlus,
  ArrowRight,
  X,
  Maximize,
  Settings
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const StickerIcon = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    className={className}
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="m23.967 10.417a12.04 12.04 0 1 0 -13.55 13.55 3.812 3.812 0 0 0 .489.032 3.993 3.993 0 0 0 2.805-1.184l9.1-9.1a3.962 3.962 0 0 0 1.156-3.298zm-21.9.474a10.034 10.034 0 0 1 19.8-.884 12.006 12.006 0 0 0 -11.86 11.852 9.988 9.988 0 0 1 -7.944-10.968zm10.233 10.509a2.121 2.121 0 0 1 -.278.225 10 10 0 0 1 9.606-9.607 2.043 2.043 0 0 1 -.224.279z" />
  </svg>
);

const compressPNGOnServer = async (dataUrl: string): Promise<Blob> => {
  const response = await fetch("/api/compress-png", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ image: dataUrl }),
  });
  if (!response.ok) {
    throw new Error(`Failed to compress image on server: ${response.statusText}`);
  }
  return response.blob();
};

export function HomePageClient({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const addItem = useCartStore((state) => state.addItem);
  const updateItem = useCartStore((state) => state.updateItem);
  const cartItems = useCartStore((state) => state.items);

  // Creator state
  const [stickers, setStickers] = useState<PlacedSticker[]>([]);
  const [selectedStickerId, setSelectedStickerId] = useState<string | null>(null);
  const [sheetQuantity, setSheetQuantity] = useState<number>(1);
  const [deliveryForm, setDeliveryForm] = useState<"sheet" | "individual">("sheet");
  const [error, setError] = useState<string | null>(null);
  const [visualizerMode, setVisualizerMode] = useState<"2d" | "3d">("2d");
  const [editCartItemId, setEditCartItemId] = useState<string | null>(null);
  const [overlappingStickerIds, setOverlappingStickerIds] = useState<string[]>([]);
  const [isAIGeneratorOpen, setIsAIGeneratorOpen] = useState(false);
  const [showPasteModal, setShowPasteModal] = useState(false);
  const [isCalculatingContour, setIsCalculatingContour] = useState<string | null>(null);
  const [isPasteFocused, setIsPasteFocused] = useState(false);

  // Mount state for hydration check
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
    const params = new URLSearchParams(window.location.search);
    const editId = params.get("edit");
    if (editId) {
      setEditCartItemId(editId);
    }
  }, []);

  useEffect(() => {
    if (!error) {
      setOverlappingStickerIds([]);
    }
  }, [error]);

  useEffect(() => {
    if (mounted && editCartItemId && cartItems.length > 0) {
      const item = cartItems.find((i) => i.id === editCartItemId);
      if (item && item.stickers && item.stickers.length > 0) {
        setStickers(item.stickers);
        setSheetQuantity(item.sheetQuantity);
        setDeliveryForm(item.deliveryForm || "sheet");

        // Remove edit param from URL without reloading
        const url = new URL(window.location.href);
        url.searchParams.delete('edit');
        window.history.replaceState({}, '', url.toString());
      }
    }
  }, [mounted, editCartItemId, cartItems]);

  const summaryRef = useRef<HTMLDivElement>(null);
  const [isSummaryVisible, setIsSummaryVisible] = useState(false);

  const visualizerRef = useRef<HTMLDivElement>(null);
  const [isVisualizerVisible, setIsVisualizerVisible] = useState(false);

  useEffect(() => {
    if (!mounted) return;

    const summaryObserver = new IntersectionObserver(
      ([entry]) => {
        setIsSummaryVisible(entry.isIntersecting);
      },
      { threshold: 0.1 }
    );
    if (summaryRef.current) {
      summaryObserver.observe(summaryRef.current);
    }

    const visualizerObserver = new IntersectionObserver(
      ([entry]) => {
        setIsVisualizerVisible(entry.isIntersecting);
      },
      { threshold: 0.05 }
    );
    if (visualizerRef.current) {
      visualizerObserver.observe(visualizerRef.current);
    }

    return () => {
      summaryObserver.disconnect();
      visualizerObserver.disconnect();
    };
  }, [mounted]);

  const [showStickyHeader, setShowStickyHeader] = useState(false);
  const getTotalPrice = useCartStore((state) => state.getTotalPrice);
  const totalPrice = getTotalPrice();

  const [shouldHighlightSheet, setShouldHighlightSheet] = useState(false);

  const scrollToAndHighlightSheet = () => {
    const el = document.getElementById("sheet-preview-section");
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
      setShouldHighlightSheet(true);
      setTimeout(() => {
        setShouldHighlightSheet(false);
      }, 1500);
    }
  };

  useEffect(() => {
    if (!mounted) return;

    const handleScrollToSheet = () => {
      scrollToAndHighlightSheet();
    };

    const handleHashChange = () => {
      if (window.location.hash === "#sheet") {
        setTimeout(scrollToAndHighlightSheet, 300);
      }
    };

    // Run on initial mount if hash matches
    if (window.location.hash === "#sheet") {
      setTimeout(scrollToAndHighlightSheet, 800);
    }

    window.addEventListener("scroll-to-sheet", handleScrollToSheet);
    window.addEventListener("hashchange", handleHashChange);

    const handleScroll = () => {
      const section = document.getElementById("seo-marketing-section");
      if (section) {
        const rect = section.getBoundingClientRect();
        setShowStickyHeader(rect.top <= 80);
      } else {
        setShowStickyHeader(false);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener("scroll-to-sheet", handleScrollToSheet);
      window.removeEventListener("hashchange", handleHashChange);
      window.removeEventListener("scroll", handleScroll);
    };
  }, [mounted]);

  const [hasUserEverAddedStickers, setHasUserEverAddedStickers] = useState(false);
  const [isMobileStickerDetailsExpanded, setIsMobileStickerDetailsExpanded] = useState(false);
  const [mobileActiveTab, setMobileActiveTab] = useState<"resize" | "options" | "cutline">("resize");

  useEffect(() => {
    setIsMobileStickerDetailsExpanded(false);
    setMobileActiveTab("resize");
  }, [selectedStickerId]);

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
  const [addingMethod, setAddingMethod] = useState<"none" | "upload">("none");
  const [pendingImageUrl, setPendingImageUrl] = useState<string | null>(null);

  // Loaders
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isGeneratingPng, setIsGeneratingPng] = useState(false);
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


  // Automatically calculate contours for stickers that don't have them yet
  useEffect(() => {
    if (!mounted || stickers.length === 0) return;

    const stickersToCalculate = stickers.filter((st) => !st.contourPolygons);
    if (stickersToCalculate.length === 0) return;

    let hasUpdates = false;
    const updatedStickers = [...stickers];

    const promises = stickersToCalculate.map(async (st) => {
      try {
        const idx = updatedStickers.findIndex((s) => s.id === st.id);
        if (idx !== -1) {
          const currentSt = updatedStickers[idx];
          const wMm = currentSt.widthCm * 10;
          const hMm = currentSt.heightCm * 10;

          const polys = await getContourPoints(st.imageUrl, "contour", wMm, hMm);

          // Clamp using the new contour if the sticker uses custom contour cut line
          const margins = getOuterMargins(currentSt, { contourPolygons: polys });

          const clamped = clampToUsableArea(currentSt.x, currentSt.y, margins);
          let targetX = clamped.x;
          let targetY = clamped.y;

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

  const [widthInputValue, setWidthInputValue] = useState<string>("");

  useEffect(() => {
    if (selectedSticker) {
      setWidthInputValue(getDisplayedWidthCm(selectedSticker).toString().replace('.', ','));
    } else {
      setWidthInputValue("");
    }
  }, [selectedSticker]);

  const handleManualWidthCommit = (valStr: string) => {
    const sanitized = valStr.replace(",", ".");
    const num = parseFloat(sanitized);
    if (!isNaN(num)) {
      const clamped = Math.max(1, Math.min(19, num));
      const rounded = Math.round(clamped * 10) / 10;
      handleWidthChange(rounded);
      // Force sync widthInputValue in case handleWidthChange did not update the value
      if (selectedSticker) {
        setWidthInputValue(getDisplayedWidthCm(selectedSticker).toString().replace('.', ','));
      }
    } else {
      if (selectedSticker) {
        setWidthInputValue(getDisplayedWidthCm(selectedSticker).toString().replace('.', ','));
      }
    }
  };

  const selectedStickerDimension = selectedSticker ? stickerDimensions[selectedSticker.id] : null;
  const selectedStickerDpi = useMemo(() => {
    if (!selectedSticker || !selectedStickerDimension) return null;
    const widthInches = selectedSticker.widthCm / 2.54;
    return Math.round(selectedStickerDimension.width / widthInches);
  }, [selectedSticker, selectedStickerDimension]);

  const isLowRes = selectedStickerDpi !== null && selectedStickerDpi < 100;

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

    const startX = 11 + margins.left;
    const endX = 199 - margins.right;
    const startY = 11 + margins.top;
    const endY = 286 - margins.bottom;

    for (let candidateY = startY; candidateY <= endY; candidateY += step) {
      for (let candidateX = startX; candidateX <= endX; candidateX += step) {
        const clamped = clampToUsableArea(candidateX, candidateY, margins);
        if (Math.abs(clamped.x - candidateX) > 0.01 || Math.abs(clamped.y - candidateY) > 0.01) {
          continue; // overlaps corners or safety bounds
        }

        const candidateSticker = {
          x: candidateX,
          y: candidateY,
          widthCm: wMm / 10,
          heightCm: hMm / 10,
          rotation: rotation,
          cutLineType,
          contourPolygons,
        };

        const hasCollision = existing.some((st) => {
          return checkStickersCollision(candidateSticker, st);
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

      let pos = findFreePosition(wMm, hMm, 0, stickers);

      if (!pos) {
        // Zawsze pozwalamy dodać nową naklejkę na środku, ewentualnie wyświetli się czerwony konflikt
        pos = { x: 105, y: 148.5 };
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

      // Scroll to the visualizer sheet on mobile devices when adding a sticker
      if (typeof window !== "undefined" && window.matchMedia("(max-width: 639px)").matches) {
        setTimeout(() => {
          const target = visualizerRef.current || document.getElementById("sheet-preview-section");
          if (target) {
            target.scrollIntoView({ behavior: "smooth", block: "start" });
          }
        }, 150);
      }
    };

    img.onerror = () => {
      setError("Nie udało się pobrać wymiarów obrazu.");
      setIsPlacingSticker(false);
    };

    img.src = url;
  };

  const handleFillSheet = () => {
    if (!selectedSticker) return;

    let currentStickers = [...stickers];
    const wMm = selectedSticker.widthCm * 10;
    const hMm = selectedSticker.heightCm * 10;
    let added = 0;

    while (true) {
      const pos = findFreePosition(
        wMm,
        hMm,
        selectedSticker.rotation || 0,
        currentStickers,
        selectedSticker.cutLineType,
        selectedSticker.contourPolygons
      );
      if (!pos) break;

      const newSticker: PlacedSticker = {
        ...selectedSticker,
        id: getUUID(),
        x: pos.x,
        y: pos.y,
      };
      currentStickers.push(newSticker);
      added++;

      if (currentStickers.length > 300) break;
    }

    if (added > 0) {
      setStickers(currentStickers);
    } else {
      setError("Brak miejsca na arkuszu na więcej naklejek.");
    }
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

        const clamped = clampToUsableArea(tx, ty, margins);
        tx = clamped.x;
        ty = clamped.y;

        const leftBound = tx - margins.left;
        const rightBound = tx + margins.right;
        const topBound = ty - margins.top;
        const bottomBound = ty + margins.bottom;

        const CORNER_LIMIT = 17;
        const RIGHT_CORNER_LIMIT = 193;
        const BOTTOM_CORNER_LIMIT = 280;

        const overlapsCorner =
          (leftBound < CORNER_LIMIT && topBound < CORNER_LIMIT) ||
          (rightBound > RIGHT_CORNER_LIMIT && topBound < CORNER_LIMIT) ||
          (leftBound < CORNER_LIMIT && bottomBound > BOTTOM_CORNER_LIMIT) ||
          (rightBound > RIGHT_CORNER_LIMIT && bottomBound > BOTTOM_CORNER_LIMIT);

        const fitsIn =
          tx >= 11 + margins.left &&
          tx <= 199 - margins.right &&
          ty >= 11 + margins.top &&
          ty <= 286 - margins.bottom &&
          !overlapsCorner;

        if (!fitsIn) return null;

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
          let freePos = findFreePosition(15, 15 / aspect, activeEditSticker.rotation || 0, otherStickers);
          if (!freePos) {
            freePos = { x: activeEditSticker.x, y: activeEditSticker.y };
          }
          finalWidthCm = 1.5;
          finalHeightCm = 1.5 / aspect;
          finalX = freePos.x;
          finalY = freePos.y;
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
    const clamped = clampToUsableArea(selectedSticker.x, selectedSticker.y, margins);
    let targetX = clamped.x;
    let targetY = clamped.y;

    const leftBound = targetX - margins.left;
    const rightBound = targetX + margins.right;
    const topBound = targetY - margins.top;
    const bottomBound = targetY + margins.bottom;

    const CORNER_LIMIT = 17;
    const RIGHT_CORNER_LIMIT = 193;
    const BOTTOM_CORNER_LIMIT = 280;

    const overlapsCorner =
      (leftBound < CORNER_LIMIT && topBound < CORNER_LIMIT) ||
      (rightBound > RIGHT_CORNER_LIMIT && topBound < CORNER_LIMIT) ||
      (leftBound < CORNER_LIMIT && bottomBound > BOTTOM_CORNER_LIMIT) ||
      (rightBound > RIGHT_CORNER_LIMIT && bottomBound > BOTTOM_CORNER_LIMIT);

    const fitsInBounds =
      targetX >= 11 + margins.left &&
      targetX <= 199 - margins.right &&
      targetY >= 11 + margins.top &&
      targetY <= 286 - margins.bottom &&
      !overlapsCorner;

    if (fitsInBounds) {
      setStickers(
        stickers.map((s) =>
          s.id === selectedSticker.id ? { ...s, rotation: degrees, x: targetX, y: targetY } : s
        )
      );
    } else {
      setError("Brak miejsca na obrócenie naklejki (kontur wychodzi poza arkusz).");
    }
  };

  // Update selected sticker width with fluid margins-shifting & obstacle-clamping
  const handleWidthChange = (val: number) => {
    if (!selectedSticker) return;

    const clampedDisplayedVal = Math.max(1, Math.min(19, val));
    const targetGraphicWidth = getGraphicWidthFromDisplayed(selectedSticker, clampedDisplayedVal);
    const aspect = selectedSticker.aspectRatio;

    const otherStickers = stickers.filter((s) => s.id !== selectedSticker.id);

    const testFits = (w: number) => {
      const h = w / aspect;
      const margins = getOuterMargins(selectedSticker, { widthCm: w, heightCm: h });

      let tx = selectedSticker.x;
      let ty = selectedSticker.y;

      const clamped = clampToUsableArea(tx, ty, margins);
      tx = clamped.x;
      ty = clamped.y;

      const leftBound = tx - margins.left;
      const rightBound = tx + margins.right;
      const topBound = ty - margins.top;
      const bottomBound = ty + margins.bottom;

      const CORNER_LIMIT = 17;
      const RIGHT_CORNER_LIMIT = 193;
      const BOTTOM_CORNER_LIMIT = 280;

      const overlapsCorner =
        (leftBound < CORNER_LIMIT && topBound < CORNER_LIMIT) ||
        (rightBound > RIGHT_CORNER_LIMIT && topBound < CORNER_LIMIT) ||
        (leftBound < CORNER_LIMIT && bottomBound > BOTTOM_CORNER_LIMIT) ||
        (rightBound > RIGHT_CORNER_LIMIT && bottomBound > BOTTOM_CORNER_LIMIT);

      const fitsIn =
        tx >= 11 + margins.left &&
        tx <= 199 - margins.right &&
        ty >= 11 + margins.top &&
        ty <= 286 - margins.bottom &&
        !overlapsCorner;

      if (!fitsIn) return null;

      return { x: tx, y: ty, w, h };
    };

    let fitWidthCm = selectedSticker.widthCm;
    let fitHeightCm = selectedSticker.heightCm;
    let fitX = selectedSticker.x;
    let fitY = selectedSticker.y;
    let found = false;

    const result = testFits(targetGraphicWidth);
    if (result) {
      fitWidthCm = result.w;
      fitHeightCm = result.h;
      fitX = result.x;
      fitY = result.y;
      found = true;
    } else {
      // Binary search for the maximum graphic width that fits
      let low = selectedSticker.widthCm;
      let high = targetGraphicWidth;
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

    setIsCalculatingContour(type);

    let polys = selectedSticker.contourPolygons;
    if (type === "contour" || type === "contour_inside") {
      try {
        const contourType = type === "contour_inside" ? "contour_inside" : "contour";
        const wMm = selectedSticker.widthCm * 10;
        const hMm = selectedSticker.heightCm * 10;
        polys = await getContourPoints(selectedSticker.imageUrl, contourType, wMm, hMm);
      } catch (err) {
        console.error("Failed to compute contour points:", err);
      }
    }

    const wMm = selectedSticker.widthCm * 10;
    const hMm = selectedSticker.heightCm * 10;

    const margins = getOuterMargins(selectedSticker, { cutLineType: type, contourPolygons: polys });

    const clamped = clampToUsableArea(selectedSticker.x, selectedSticker.y, margins);
    let targetX = clamped.x;
    let targetY = clamped.y;

    const leftBound = targetX - margins.left;
    const rightBound = targetX + margins.right;
    const topBound = targetY - margins.top;
    const bottomBound = targetY + margins.bottom;

    const CORNER_LIMIT = 17;
    const RIGHT_CORNER_LIMIT = 193;
    const BOTTOM_CORNER_LIMIT = 280;

    const overlapsCorner =
      (leftBound < CORNER_LIMIT && topBound < CORNER_LIMIT) ||
      (rightBound > RIGHT_CORNER_LIMIT && topBound < CORNER_LIMIT) ||
      (leftBound < CORNER_LIMIT && bottomBound > BOTTOM_CORNER_LIMIT) ||
      (rightBound > RIGHT_CORNER_LIMIT && bottomBound > BOTTOM_CORNER_LIMIT);

    const fitsInBounds =
      targetX >= 11 + margins.left &&
      targetX <= 199 - margins.right &&
      targetY >= 11 + margins.top &&
      targetY <= 286 - margins.bottom &&
      !overlapsCorner;

    if (!fitsInBounds) {
      setError("Brak miejsca na zmianę linii cięcia (kontur wychodzi poza arkusz)!");
      setIsCalculatingContour(null);
      return;
    }

    setStickers(
      stickers.map((s) =>
        s.id === selectedSticker.id
          ? { ...s, cutLineType: type, contourPolygons: polys, x: targetX, y: targetY }
          : s
      )
    );
    setIsCalculatingContour(null);
  };

  // Duplicate selected sticker
  const handleDuplicateSticker = () => {
    if (!selectedSticker) return;
    setError(null);

    const wMm = selectedSticker.widthCm * 10;
    const hMm = selectedSticker.heightCm * 10;

    let pos = findFreePosition(
      wMm,
      hMm,
      selectedSticker.rotation || 0,
      stickers,
      selectedSticker.cutLineType,
      selectedSticker.contourPolygons
    );

    if (!pos) {
      pos = { x: selectedSticker.x + 10, y: selectedSticker.y + 10 };
    }

    const margins = getOuterMargins(selectedSticker);

    const clamped = clampToUsableArea(pos.x, pos.y, margins);
    let targetX = clamped.x;
    let targetY = clamped.y;

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
        offsetPx = 2 * MM_TO_PX;
      } else if (st.cutLineType === "rounded_inside" || st.cutLineType === "circle_inside") {
        offsetPx = -2 * MM_TO_PX;
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

    // Watermarks removed

    return canvas;
  };

  // Render high resolution 3D sheet visualization on hidden canvas
  const render3DSheetCanvas = async (): Promise<HTMLCanvasElement> => {
    const A4_W = 2480;
    const A4_H = 3508;
    const MM_TO_PX = A4_W / 210;

    // Create a temporary flat canvas to render the high-res flat sheet with realistic sticker look
    const flatCanvas = document.createElement("canvas");
    flatCanvas.width = A4_W;
    flatCanvas.height = A4_H;
    const flatCtx = flatCanvas.getContext("2d")!;

    // Fill white background for the A4 sheet
    flatCtx.fillStyle = "#ffffff";
    flatCtx.fillRect(0, 0, A4_W, A4_H);

    // Load sticker images
    const loadedImages = await Promise.all(
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

    // Draw realistic stickers on the flat canvas
    for (const st of stickers) {
      const drawX = st.x * MM_TO_PX;
      const drawY = st.y * MM_TO_PX;
      const drawW = st.widthCm * 10 * MM_TO_PX;
      const drawH = st.heightCm * 10 * MM_TO_PX;

      const wMm = st.widthCm * 10;
      const hMm = st.heightCm * 10;
      const isInside = st.cutLineType === "rounded_inside" || st.cutLineType === "circle_inside" || st.cutLineType === "contour_inside";
      const offsetMm = isInside ? -2 : 2;

      let sx = 1;
      let sy = 1;
      if (st.cutLineType !== "none") {
        sx = (wMm + 2 * offsetMm) / wMm;
        sy = (hMm + 2 * offsetMm) / hMm;
      }

      // Helper to define cut path
      const defineCutPath = (ctx: CanvasRenderingContext2D, w: number, h: number, type: string) => {
        const rx = -w / 2;
        const ry = -h / 2;
        if (type === "circle" || type === "circle_inside") {
          ctx.beginPath();
          ctx.ellipse(0, 0, w / 2, h / 2, 0, 0, 2 * Math.PI);
          ctx.closePath();
        } else if (type === "rounded" || type === "rounded_inside" || type === "none") {
          const radius = w * 0.05; // 5% border radius
          ctx.beginPath();
          ctx.moveTo(rx + radius, ry);
          ctx.lineTo(rx + w - radius, ry);
          ctx.quadraticCurveTo(rx + w, ry, rx + w, ry + radius);
          ctx.lineTo(rx + w, ry + h - radius);
          ctx.quadraticCurveTo(rx + w, ry + h, rx + w - radius, ry + h);
          ctx.lineTo(rx + radius, ry + h);
          ctx.quadraticCurveTo(rx, ry + h, rx, ry + h - radius);
          ctx.lineTo(rx, ry + radius);
          ctx.quadraticCurveTo(rx, ry, rx + radius, ry);
          ctx.closePath();
        } else if (type === "contour" || type === "contour_inside") {
          // Contour points are normalized to the RAW (unscaled) sticker box and already
          // bake in the scaled margin, so they must be mapped using drawW/drawH
          // (not the passed-in w/h, which may be pre-enlarged for rounded/circle shapes).
          if (st.contourPolygons && st.contourPolygons.length > 0) {
            ctx.beginPath();
            st.contourPolygons.forEach((poly) => {
              if (poly.length < 2) return;
              ctx.moveTo((poly[0].x - 0.5) * drawW, (poly[0].y - 0.5) * drawH);
              for (let i = 1; i < poly.length; i++) {
                ctx.lineTo((poly[i].x - 0.5) * drawW, (poly[i].y - 0.5) * drawH);
              }
            });
            ctx.closePath();
          } else {
            ctx.beginPath();
            ctx.rect(-drawW / 2, -drawH / 2, drawW, drawH);
            ctx.closePath();
          }
        }
      };

      // 1. Draw sticker shadow on the flat sheet (subtler offset and opacity)
      flatCtx.save();
      flatCtx.translate(drawX + drawW / 2, drawY + drawH / 2);
      flatCtx.rotate(((st.rotation || 0) * Math.PI) / 180);
      flatCtx.translate(0.4 * MM_TO_PX, 0.6 * MM_TO_PX);
      defineCutPath(flatCtx, drawW * sx, drawH * sy, st.cutLineType);
      flatCtx.fillStyle = "rgba(0, 0, 0, 0.05)";
      flatCtx.filter = "blur(3px)";
      flatCtx.fill();
      flatCtx.filter = "none";
      flatCtx.restore();

      // 2. Draw sticker vinyl backing (white background)
      flatCtx.save();
      flatCtx.translate(drawX + drawW / 2, drawY + drawH / 2);
      flatCtx.rotate(((st.rotation || 0) * Math.PI) / 180);
      flatCtx.fillStyle = "#ffffff";
      defineCutPath(flatCtx, drawW * sx, drawH * sy, st.cutLineType);
      flatCtx.fill();

      // 3. Clip and draw sticker image
      const loaded = loadedImages.find((item) => item?.id === st.id);
      if (loaded?.img) {
        flatCtx.save();
        defineCutPath(flatCtx, drawW * sx, drawH * sy, st.cutLineType);
        flatCtx.clip();
        flatCtx.drawImage(loaded.img, -drawW / 2, -drawH / 2, drawW, drawH);
        flatCtx.restore();
      }

      // 4. Draw cut outline (light gray, realistic cut lines look - thinner)
      if (st.cutLineType !== "none") {
        flatCtx.strokeStyle = "#cbd5e1";
        flatCtx.lineWidth = 0.3 * MM_TO_PX;
        defineCutPath(flatCtx, drawW * sx, drawH * sy, st.cutLineType);
        flatCtx.stroke();
      }
      flatCtx.restore();
    }

    // Now, create the target canvas for the 3D projection
    const destCanvas = document.createElement("canvas");
    destCanvas.width = 1240;
    destCanvas.height = 1754;
    const destCtx = destCanvas.getContext("2d")!;

    // Leave the background transparent so the shadow blends perfectly

    // Projection variables
    const thetaX = 10 * Math.PI / 180;
    const thetaY = -15 * Math.PI / 180;
    const d = 1200;
    const S = 0.35; // Scaling factor to fit comfortably with shadow padding

    const cosX = Math.cos(thetaX);
    const sinX = Math.sin(thetaX);
    const cosY = Math.cos(thetaY);
    const sinY = Math.sin(thetaY);

    const project = (x: number, y: number) => {
      const x0 = (x - A4_W / 2) * S;
      const y0 = (y - A4_H / 2) * S;
      const x1 = x0 * cosY;
      const y1 = y0;
      const z1 = -x0 * sinY;
      const x2 = x1;
      const y2 = y1 * cosX - z1 * sinX;
      const z2 = y1 * sinX + z1 * cosX;
      const u = (x2 * d) / (d - z2);
      const v = (y2 * d) / (d - z2);
      return {
        x: u + destCanvas.width / 2,
        y: v + destCanvas.height / 2,
      };
    };

    const projectShadow = (x: number, y: number) => {
      const x0 = (x - A4_W / 2) * S;
      const y0 = (y - A4_H / 2) * S;
      const z0 = -80; // offset in depth
      const x1 = x0 * cosY + z0 * sinY;
      const y1 = y0;
      const z1 = -x0 * sinY + z0 * cosY;
      const x2 = x1;
      const y2 = y1 * cosX - z1 * sinX;
      const z2 = y1 * sinX + z1 * cosX;
      const u = (x2 * d) / (d - z2);
      const v = (y2 * d) / (d - z2);
      return {
        x: u + destCanvas.width / 2 + 10,
        y: v + destCanvas.height / 2 + 35,
      };
    };

    // 1. Draw sheet shadow
    const s00 = projectShadow(0, 0);
    const s10 = projectShadow(A4_W, 0);
    const s11 = projectShadow(A4_W, A4_H);
    const s01 = projectShadow(0, A4_H);

    destCtx.save();
    destCtx.filter = "blur(40px)";
    destCtx.fillStyle = "rgba(0, 0, 0, 0.16)";
    destCtx.beginPath();
    destCtx.moveTo(s00.x, s00.y);
    destCtx.lineTo(s10.x, s10.y);
    destCtx.lineTo(s11.x, s11.y);
    destCtx.lineTo(s01.x, s01.y);
    destCtx.closePath();
    destCtx.fill();
    destCtx.filter = "none";
    destCtx.restore();

    // 2. Draw solid white sheet background underneath the mesh warp to ensure no background bleeds through subpixel gaps
    const pTL_bg = project(0, 0);
    const pTR_bg = project(A4_W, 0);
    const pBR_bg = project(A4_W, A4_H);
    const pBL_bg = project(0, A4_H);

    destCtx.save();
    destCtx.fillStyle = "#fffffc";
    destCtx.beginPath();
    destCtx.moveTo(pTL_bg.x, pTL_bg.y);
    destCtx.lineTo(pTR_bg.x, pTR_bg.y);
    destCtx.lineTo(pBR_bg.x, pBR_bg.y);
    destCtx.lineTo(pBL_bg.x, pBL_bg.y);
    destCtx.closePath();
    destCtx.fill();
    destCtx.restore();

    // Helper to draw projected triangles with slight inflation to prevent gaps
    const drawTriangle = (
      ctx: CanvasRenderingContext2D,
      src: HTMLCanvasElement,
      x0: number, y0: number,
      x1: number, y1: number,
      x2: number, y2: number,
      u0: number, v0: number,
      u1: number, v1: number,
      u2: number, v2: number
    ) => {
      // Calculate centroid of destination triangle
      const uc = (u0 + u1 + u2) / 3;
      const vc = (v0 + v1 + v2) / 3;

      // Inflate destination vertices slightly outwards from centroid (0.75px) to prevent subpixel antialiasing cracks
      const inflate = (u: number, v: number) => {
        const du = u - uc;
        const dv = v - vc;
        const len = Math.sqrt(du * du + dv * dv);
        if (len < 0.0001) return { u, v };
        return {
          u: u + (du / len) * 0.75,
          v: v + (dv / len) * 0.75,
        };
      };

      const p0 = inflate(u0, v0);
      const p1 = inflate(u1, v1);
      const p2 = inflate(u2, v2);

      const delta = x0 * (y1 - y2) + x1 * (y2 - y0) + x2 * (y0 - y1);
      if (Math.abs(delta) < 0.0001) return;

      const a = (p0.u * (y1 - y2) + p1.u * (y2 - y0) + p2.u * (y0 - y1)) / delta;
      const c = (p0.u * (x2 - x1) + p1.u * (x0 - x2) + p2.u * (x1 - x0)) / delta;
      const e = (p0.u * (x1 * y2 - x2 * y1) + p1.u * (x2 * y0 - x0 * y2) + p2.u * (x0 * y1 - x1 * y0)) / delta;

      const b = (p0.v * (y1 - y2) + p1.v * (y2 - y0) + p2.v * (y0 - y1)) / delta;
      const d = (p0.v * (x2 - x1) + p1.v * (x0 - x2) + p2.v * (x1 - x0)) / delta;
      const f = (p0.v * (x1 * y2 - x2 * y1) + p1.v * (x2 * y0 - x0 * y2) + p2.v * (x0 * y1 - x1 * y0)) / delta;

      ctx.save();
      ctx.beginPath();
      ctx.moveTo(p0.u, p0.v);
      ctx.lineTo(p1.u, p1.v);
      ctx.lineTo(p2.u, p2.v);
      ctx.closePath();
      ctx.clip();

      ctx.transform(a, b, c, d, e, f);
      ctx.drawImage(src, 0, 0);
      ctx.restore();
    };

    // 2. Warp flat sheet to 3D projected space on destination canvas
    const cols = 16;
    const rows = 16;
    const cellW = A4_W / cols;
    const cellH = A4_H / rows;

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const x0 = c * cellW;
        const y0 = r * cellH;
        const x1 = x0 + cellW;
        const y1 = y0 + cellH;

        const p00 = project(x0, y0);
        const p10 = project(x1, y0);
        const p01 = project(x0, y1);
        const p11 = project(x1, y1);

        drawTriangle(destCtx, flatCanvas, x0, y0, x1, y0, x0, y1, p00.x, p00.y, p10.x, p10.y, p01.x, p01.y);
        drawTriangle(destCtx, flatCanvas, x1, y0, x1, y1, x0, y1, p10.x, p10.y, p11.x, p11.y, p01.x, p01.y);
      }
    }

    // 3. Draw sheet physical outline edge
    const pTL = project(0, 0);
    const pTR = project(A4_W, 0);
    const pBR = project(A4_W, A4_H);
    const pBL = project(0, A4_H);

    destCtx.save();
    destCtx.strokeStyle = "rgba(0, 0, 0, 0.12)";
    destCtx.lineWidth = 1.5;
    destCtx.beginPath();
    destCtx.moveTo(pTL.x, pTL.y);
    destCtx.lineTo(pTR.x, pTR.y);
    destCtx.lineTo(pBR.x, pBR.y);
    destCtx.lineTo(pBL.x, pBL.y);
    destCtx.closePath();
    destCtx.stroke();
    destCtx.restore();

    // 4. Draw glossy glare overlay
    destCtx.save();
    destCtx.beginPath();
    destCtx.moveTo(pTL.x, pTL.y);
    destCtx.lineTo(pTR.x, pTR.y);
    destCtx.lineTo(pBR.x, pBR.y);
    destCtx.lineTo(pBL.x, pBL.y);
    destCtx.closePath();
    destCtx.clip();

    const glareCenter = project(A4_W * 0.3, A4_H * 0.2);
    const grad = destCtx.createRadialGradient(
      glareCenter.x, glareCenter.y, 0,
      glareCenter.x, glareCenter.y, 600
    );
    grad.addColorStop(0, "rgba(255, 255, 255, 0.4)");
    grad.addColorStop(0.5, "rgba(255, 255, 255, 0.05)");
    grad.addColorStop(1, "rgba(255, 255, 255, 0)");

    destCtx.fillStyle = grad;
    destCtx.globalCompositeOperation = "color-dodge";
    destCtx.fillRect(0, 0, destCanvas.width, destCanvas.height);
    destCtx.restore();

    return destCanvas;
  };

  // Add sheet to Cart
  const handleAddToCart = () => {
    if (stickers.length === 0) return;
    const stickersWithNoCutLine = stickers.filter((s) => s.cutLineType === "none");
    if (stickersWithNoCutLine.length > 0) {
      const count = stickersWithNoCutLine.length;
      const noun = count === 1 ? "naklejki" : "naklejek";
      setError(`Wybierz linię cięcia dla ${count} ${noun} na arkuszu!`);
      return;
    }

    // Sprawdź nachodzenie na siebie naklejek
    let hasOverlap = false;
    const overlaps = new Set<string>();
    for (let i = 0; i < stickers.length; i++) {
      for (let j = i + 1; j < stickers.length; j++) {
        if (checkStickersCollision(stickers[i], stickers[j])) {
          overlaps.add(stickers[i].id);
          overlaps.add(stickers[j].id);
          hasOverlap = true;
        }
      }
    }

    if (hasOverlap) {
      setOverlappingStickerIds(Array.from(overlaps));
      setError("Naklejki na arkuszu nachodzą na siebie! Uporządkuj je przed dodaniem do koszyka.");
      return;
    }

    executeAddToCart();
  };

  // Actual logic to save and add to cart after confirmation
  const executeAddToCart = async () => {
    setIsAddingToCart(true);
    setError(null);

    try {
      // Render print version (color, with sticker images)
      const printCanvas = await renderSheetCanvas("print");
      const printDataUrl = printCanvas.toDataURL("image/png");

      let printBlob: Blob;
      try {
        printBlob = await compressPNGOnServer(printDataUrl);
      } catch (err) {
        console.warn("Server compression failed for print image, falling back to uncompressed blob:", err);
        const rawBlob = await new Promise<Blob | null>((resolve) =>
          printCanvas.toBlob((b) => resolve(b), "image/png")
        );
        if (!rawBlob) throw new Error("Could not export print canvas to blob.");
        printBlob = rawBlob;
      }

      const printFileName = `composition-${getUUID()}.png`;
      const printRef = ref(storage, `uploads/${printFileName}`);
      const printSnapshot = await uploadBytes(printRef, printBlob);
      const printUrl = await getDownloadURL(printSnapshot.ref);

      // Render cut-lines version (black shapes on white, no images)
      const cutCanvas = await renderSheetCanvas("cut-lines");
      const cutDataUrl = cutCanvas.toDataURL("image/png");

      let cutBlob: Blob | null = null;
      try {
        cutBlob = await compressPNGOnServer(cutDataUrl);
      } catch (err) {
        console.warn("Server compression failed for cut-lines image, falling back to uncompressed blob:", err);
        cutBlob = await new Promise<Blob | null>((resolve) =>
          cutCanvas.toBlob((b) => resolve(b), "image/png")
        );
      }

      let cutLinesUrl: string | undefined;
      if (cutBlob) {
        const cutFileName = `composition-cutlines-${getUUID()}.png`;
        const cutRef = ref(storage, `uploads/${cutFileName}`);
        const cutSnapshot = await uploadBytes(cutRef, cutBlob);
        cutLinesUrl = await getDownloadURL(cutSnapshot.ref);
      }

      const cartItemData = {
        imageUrl: printUrl,
        cutLinesImageUrl: cutLinesUrl,
        widthCm: 21,
        heightCm: 29.7, // A4 sheet size
        stickersPerSheet: stickers.length,
        sheetQuantity: sheetQuantity,
        pricePerSheet: 49.00,
        stickers: stickers,
        deliveryForm: deliveryForm,
      };

      if (editCartItemId) {
        updateItem(editCartItemId, cartItemData);
        setEditCartItemId(null);
      } else {
        addItem(cartItemData);
      }

      router.push("/koszyk");
    } catch (err: any) {
      console.error(err);
      setError("Wystąpił błąd podczas zapisywania Twojej kompozycji.");
    } finally {
      setIsAddingToCart(false);
    }
  };

  // Download high-res PNG (print, cut-lines, or 3D visualization)
  const handleDownloadPNG = async (mode: "print" | "cut-lines" | "3d") => {
    if (stickers.length === 0) return;
    setIsGeneratingPng(true);
    setError(null);

    try {
      const canvas = mode === "3d" ? await render3DSheetCanvas() : await renderSheetCanvas(mode);
      const imgData = canvas.toDataURL("image/png");

      let downloadUrl = imgData;
      try {
        const compressedBlob = await compressPNGOnServer(imgData);
        downloadUrl = URL.createObjectURL(compressedBlob);
      } catch (compressErr) {
        console.warn("Server PNG compression failed, downloading uncompressed canvas image:", compressErr);
      }

      const link = document.createElement("a");
      link.href = downloadUrl;
      if (mode === "cut-lines") {
        link.download = "kompozycja-arkusza-A4-LINIE_CIECIA.png";
      } else if (mode === "print") {
        link.download = "kompozycja-arkusza-A4-DRUK.png";
      } else {
        link.download = "kompozycja-arkusza-A4-WIZUALIZACJA_3D.png";
      }
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      if (downloadUrl.startsWith("blob:")) {
        URL.revokeObjectURL(downloadUrl);
      }
    } catch (err: any) {
      console.error(err);
      setError(
        mode === "cut-lines"
          ? "Nie udało się wygenerować pliku PNG (linie cięcia)."
          : mode === "print"
            ? "Nie udało się wygenerować pliku PNG (druk arkusza)."
            : "Nie udało się wygenerować pliku PNG (wizualizacja 3D arkusza)."
      );
    } finally {
      setIsGeneratingPng(false);
    }
  };

  // Mobile upload file helper
  const handleMobileFileUpload = async (file: File, isPasted = false) => {
    if (!file || !file.type.startsWith("image/")) return;

    if (file.size > 10 * 1024 * 1024) {
      setError("Wybrany obraz jest za duży (maksymalnie 10 MB). Spróbuj użyć pliku o mniejszej rozdzielczości.");
      return;
    }

    setIsPageUploading(true);
    setError(null);

    try {
      const fileName = `mobile-upload-${getUUID()}-${file.name}`;
      const storageRef = ref(storage, `uploads/${fileName}`);
      const snapshot = await uploadBytes(storageRef, file, {
        contentType: file.type || "image/png"
      });
      const downloadUrl = await getDownloadURL(snapshot.ref);

      setPendingImageUrl(downloadUrl);
      setShowPasteModal(false); // Close paste modal if open

      if (isPasted) {
        // Skip background removal/crop modal for pasted stickers
        processAndAddSticker(downloadUrl);
      } else {
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
      }
    } catch (err) {
      console.error(err);
      setError("Nie udało się przesłać pliku.");
    } finally {
      setIsPageUploading(false);
    }
  };

  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      // Don't intercept paste if user is typing in an input or textarea
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        (e.target as HTMLElement).isContentEditable
      ) {
        return;
      }

      const items = e.clipboardData?.items;
      if (!items) return;

      for (let i = 0; i < items.length; i++) {
        if (items[i].type.startsWith("image/")) {
          const file = items[i].getAsFile();
          if (file) {
            e.preventDefault();
            handleMobileFileUpload(file, true);
            break;
          }
        }
      }
    };

    window.addEventListener("paste", handlePaste);
    return () => window.removeEventListener("paste", handlePaste);
  }, []);

  const triggerPasteFromClipboard = async () => {
    try {
      if (!navigator.clipboard || !navigator.clipboard.read) {
        // Safe fallback without throwing a red screen error in dev
        setShowPasteModal(true);
        return;
      }

      const clipboardItems = await navigator.clipboard.read();
      let foundImage = false;
      for (const item of clipboardItems) {
        const imageTypes = item.types.filter(type => type.startsWith("image/"));
        if (imageTypes.length > 0) {
          const blob = await item.getType(imageTypes[0]);
          const ext = imageTypes[0] === "image/png" ? "png" : "jpg";
          const file = new File([blob], `pasted-sticker.${ext}`, { type: imageTypes[0] });
          handleMobileFileUpload(file, true);
          foundImage = true;
          break;
        }
      }
      if (!foundImage) {
        setError("Schowek jest pusty lub nie zawiera obrazu. Skopiuj obrazek i spróbuj ponownie.");
      }
    } catch (err) {
      console.warn("Clipboard API:", err);
      // Safari blocks clipboard API on HTTP/Mobile. Fallback to manual paste modal.
      setShowPasteModal(true);
    }
  };


  if (!mounted) {
    return (
      <div className="min-h-screen text-foreground flex items-center justify-center">
        <div className="animate-pulse font-extrabold text-xl text-primary">MałeNaklejki...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen text-foreground relative">

      {/* Sticky Top Notification */}
      {error && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-[100] max-w-md w-full px-4 animate-in fade-in slide-in-from-top duration-300">
          <div className="bg-red-50 text-red-500 dark:bg-red-950/30 dark:text-red-400 p-4 rounded-2xl shadow-lg border border-red-200 dark:border-red-900/30 flex items-center justify-between gap-3">
            <span className="text-sm font-extrabold">{error}</span>
            <button
              onClick={() => setError(null)}
              className="text-xs bg-red-100 hover:bg-red-200 dark:bg-red-900/30 dark:hover:bg-red-900 text-red-600 dark:text-red-300 p-1 px-2.5 rounded-lg transition-all cursor-pointer"
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

      {/* Górna sekcja (Mini-Hero) z premium gradientem i wzorem kropek */}
      <div className="w-full bg-gradient-to-b from-white via-[#f3faf6] to-[#edf7f3] dark:from-[#021f21] dark:via-[#032a2d] dark:to-[#002c2e] border-b border-primary/10 dark:border-primary/20 flex flex-col relative overflow-hidden">
        {/* Wzór kropek w tle */}
        <div className="absolute inset-0 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] dark:bg-[radial-gradient(#1c3e41_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none opacity-50" />

        {/* Elementy ponad tłem */}
        <div className="relative z-10 flex flex-col w-full">
          <Header sticky={false} />
          <MiniHero />
        </div>
      </div>

      {/* Sekcja kreatora na wyróżnionym tle */}
      <div className="w-full bg-[#edf6f2] dark:bg-[#002c2e] border-b border-primary/15 dark:border-primary/25 pb-8 sm:pb-12 shadow-[inset_0_-6px_24px_rgba(0,0,0,0.03)] flex flex-col">
        <main id="creator-section" className="flex-1 flex flex-col py-3 sm:py-6 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto w-full justify-center relative gap-4 sm:gap-8">

          {/* Page Info */}
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
              Kreator Arkusza z Naklejkami
            </h2>
            <p className="text-muted-foreground text-sm font-semibold mt-1 theme-subtitle">
              Dodaj własne grafiki, ułóż je na arkuszu i wybierz kształt cięcia.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-8 items-start">

            {/* Left Column: Controls & Sidebar */}
            <div className="lg:col-span-6 space-y-3 sm:space-y-6 order-2 lg:order-1">

              {/* 1. Tool selection: Add Sticker */}
              {addingMethod === "none" && (
                <div className="hidden sm:block liquid-glass border border-border/40 rounded-3xl p-4 sm:p-6 shadow-sm space-y-3 sm:space-y-4">
                  <h3 className="hidden sm:flex text-lg font-black text-foreground items-center gap-2">
                    <Plus className="w-5 h-5 text-primary" />
                    Dodaj naklejkę na arkusz
                  </h3>

                  <div className="grid grid-cols-2 gap-4">
                    {/* Unified Direct File Picker */}
                    <label
                      className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-foreground/20 dark:border-foreground/30 hover:border-primary/45 rounded-2xl bg-muted/10 hover:bg-muted/30 transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer h-full group"
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
                      <ImagePlus className="w-8 h-8 text-muted-foreground group-hover:text-primary mb-2 opacity-75" />
                      <span className="text-sm font-bold text-foreground text-center">Dodaj Naklejkę</span>
                      <span className="text-[10px] font-semibold text-muted-foreground mt-0.5 text-center">Zdjęcie JPG / PNG</span>
                    </label>

                    {/* AI Generator Button */}
                    <button
                      onClick={() => setIsAIGeneratorOpen(true)}
                      className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-foreground/20 dark:border-foreground/30 hover:border-primary/45 rounded-2xl bg-muted/10 hover:bg-muted/30 transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer h-full group"
                    >
                      <Wand2 className="w-8 h-8 text-muted-foreground group-hover:text-primary mb-2 opacity-75" />
                      <span className="text-sm font-bold text-foreground text-center">Generator AI</span>
                      <span className="text-[10px] font-semibold text-muted-foreground mt-0.5 text-center">Opisz co chcesz stworzyć</span>
                    </button>
                  </div>
                </div>
              )}

              {/* 2. Selected Sticker Manager */}
              {selectedSticker ? (
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="hidden sm:block liquid-glass border-2 border-primary/40 rounded-3xl p-4 sm:p-6 shadow-sm space-y-4 sm:space-y-6"
                >
                  <div
                    className="flex justify-between items-center border-b border-border/40 pb-3 cursor-pointer sm:cursor-default select-none"
                    onClick={() => setIsMobileStickerDetailsExpanded(prev => !prev)}
                  >
                    <div className="flex items-center gap-2">
                      <Layers className="w-5 h-5 text-primary" />
                      <h3 className="text-lg font-black text-foreground">Wybrana Naklejka</h3>
                    </div>
                    <div className="sm:hidden text-muted-foreground hover:text-foreground transition-colors p-1">
                      {isMobileStickerDetailsExpanded ? (
                        <ChevronUp className="w-5 h-5" />
                      ) : (
                        <ChevronDown className="w-5 h-5" />
                      )}
                    </div>
                  </div>

                  {/* Miniature and Stacked Details Row */}
                  <div
                    className="flex items-center gap-5 bg-[#004749]/5 dark:bg-muted/20 border border-[#004749]/15 dark:border-border/40 p-3 rounded-2xl cursor-pointer sm:cursor-default hover:bg-[#004749]/10 dark:hover:bg-muted/30 transition-colors"
                    onClick={() => setIsMobileStickerDetailsExpanded(prev => !prev)}
                  >
                    <div className="w-16 h-16 bg-white rounded-xl border border-border/40 p-1 flex items-center justify-center flex-shrink-0 overflow-hidden">
                      <img
                        src={selectedSticker.imageUrl}
                        alt="Miniatura"
                        className="max-w-full max-h-full object-contain rounded-lg"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-black text-muted-foreground uppercase tracking-wide flex items-center justify-between">
                        <span>Szczegóły</span>
                        <span className="text-[10px] text-primary sm:hidden font-extrabold">
                          {isMobileStickerDetailsExpanded ? "zwiń ▲" : "rozwiń opcje ▼"}
                        </span>
                      </p>
                      <div className="text-xs font-bold text-foreground mt-0.5 space-y-0.5">
                        <p>Szerokość: {String(getDisplayedWidthCm(selectedSticker)).replace('.', ',')} cm</p>
                        <p>Wysokość: {selectedSticker.heightCm.toFixed(1).replace('.', ',')} cm</p>
                        <p>Linia cięcia: {
                          selectedSticker.cutLineType === "none" ? "Brak" :
                            selectedSticker.cutLineType === "contour" ? "Kontur" :
                              selectedSticker.cutLineType === "rounded" ? "Prostokąt" :
                                selectedSticker.cutLineType === "circle" ? "Koło" :
                                  selectedSticker.cutLineType === "rounded_inside" ? "Prostokąt wew." :
                                    selectedSticker.cutLineType === "circle_inside" ? "Koło wew." : selectedSticker.cutLineType
                        }</p>
                      </div>
                    </div>
                  </div>

                  {/* Collapsible content container for mobile */}
                  <div className={`space-y-6 ${isMobileStickerDetailsExpanded ? "block animate-in slide-in-from-top-2 duration-200" : "hidden sm:block"}`}>
                    {/* Standardized Actions Button Grid */}
                    <div className="flex flex-wrap sm:flex-nowrap items-center gap-1.5 w-full">
                      <button
                        type="button"
                        onClick={handleOpenEdit}
                        className="flex-1 inline-flex items-center justify-center gap-1 px-2 py-1.5 text-[11px] font-bold bg-muted hover:bg-muted/80 dark:bg-white/10 dark:hover:bg-white/20 text-foreground border border-border/40 rounded-xl transition-all active:scale-95 cursor-pointer"
                        title="Edytuj naklejkę"
                      >
                        <Crop className="w-3.5 h-3.5" />
                        <span>Kadruj/Tło</span>
                      </button>
                      <button
                        type="button"
                        onClick={handleDuplicateSticker}
                        className="flex-1 inline-flex items-center justify-center gap-1 px-2 py-1.5 text-[11px] font-bold bg-muted hover:bg-muted/80 dark:bg-white/10 dark:hover:bg-white/20 text-foreground border border-border/40 rounded-xl transition-all active:scale-95 cursor-pointer"
                        title="Zduplikuj"
                      >
                        <Copy className="w-3.5 h-3.5" />
                        <span>Zduplikuj</span>
                      </button>
                      <button
                        type="button"
                        onClick={handleFillSheet}
                        className="flex-1 inline-flex items-center justify-center gap-1 px-2 py-1.5 text-[11px] font-bold bg-muted hover:bg-muted/80 dark:bg-white/10 dark:hover:bg-white/20 text-foreground border border-border/40 rounded-xl transition-all active:scale-95 cursor-pointer"
                        title="Wypełnij arkusz"
                      >
                        <LayoutGrid className="w-3.5 h-3.5" />
                        <span>Wypełnij</span>
                      </button>
                      <button
                        type="button"
                        onClick={handleDownloadSticker}
                        className="flex-1 inline-flex items-center justify-center gap-1 px-2 py-1.5 text-[11px] font-bold bg-muted hover:bg-muted/80 dark:bg-white/10 dark:hover:bg-white/20 text-foreground border border-border/40 rounded-xl transition-all active:scale-95 cursor-pointer"
                        title="Pobierz"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Pobierz</span>
                      </button>
                      <button
                        type="button"
                        onClick={handleDeleteSticker}
                        className="flex-1 inline-flex items-center justify-center gap-1 px-2 py-1.5 text-[11px] font-bold bg-destructive/10 hover:bg-destructive/15 text-destructive border border-destructive/20 rounded-xl transition-all active:scale-95 cursor-pointer"
                        title="Usuń"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Usuń</span>
                      </button>
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
                      <div className="flex justify-between items-center text-sm font-bold">
                        <span className="text-foreground">Szerokość naklejki (cm)</span>
                        <div className="flex items-center gap-1 text-primary font-black">
                          <input
                            type="text"
                            value={widthInputValue}
                            onChange={(e) => setWidthInputValue(e.target.value)}
                            onBlur={() => handleManualWidthCommit(widthInputValue)}
                            onFocus={(e) => e.currentTarget.select()}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                handleManualWidthCommit(widthInputValue);
                                e.currentTarget.blur();
                              }
                            }}
                            className="w-10 bg-transparent text-right text-primary font-black focus:outline-none p-0 select-text cursor-pointer focus:cursor-text"
                          />
                          <span className="select-none">cm</span>
                        </div>
                      </div>
                      <input
                        type="range"
                        min={1}
                        max={19}
                        step={0.1}
                        value={getDisplayedWidthCm(selectedSticker)}
                        onChange={(e) => handleWidthChange(Number(e.target.value))}
                        className="w-full h-2 bg-foreground/10 dark:bg-muted-foreground/40 rounded-lg appearance-none cursor-pointer accent-primary focus:outline-none"
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
                        className="w-full h-2 bg-foreground/10 dark:bg-muted-foreground/40 rounded-lg appearance-none cursor-pointer accent-primary focus:outline-none"
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
                                ? "bg-secondary/20 text-foreground border-secondary/40"
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
                              disabled={isCalculatingContour !== null}
                              className={`py-3 px-1 text-[10px] sm:text-xs font-bold rounded-xl border text-center transition-all flex flex-col items-center justify-center gap-1.5 active:scale-95 whitespace-nowrap cursor-pointer ${selectedSticker.cutLineType === opt.type
                                ? "bg-primary text-primary-foreground border-primary shadow-sm"
                                : "bg-background text-muted-foreground border-border hover:bg-muted/40"
                                } ${isCalculatingContour === opt.type ? "opacity-70 pointer-events-none" : ""}`}
                            >
                              {isCalculatingContour === opt.type ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <Icon className="w-4 h-4" />
                              )}
                              <span>{opt.label}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ) : stickers.length === 0 ? (
                <div className="hidden sm:flex liquid-glass border border-border/40 rounded-3xl p-6 shadow-sm text-center py-8 text-muted-foreground font-semibold flex-col items-center gap-3 animate-pulse">
                  <ArrowUp className="w-6 h-6 text-primary" />
                  <span>Dodaj swoją pierwszą naklejkę na arkusz!</span>
                </div>
              ) : (
                <div className="hidden sm:block liquid-glass border border-border/40 rounded-3xl p-6 shadow-sm text-center py-8 text-muted-foreground font-semibold">
                  Kliknij na naklejkę na arkuszu, aby włączyć jej dopasowanie, zmienić rozmiar lub rodzaj cięcia.
                </div>
              )}

              {/* 3. Sticker Delivery Format Option */}
              {stickers.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="liquid-glass border border-border/40 rounded-3xl p-4 sm:p-6 shadow-sm space-y-4"
                >
                  <h3 className="text-base font-black text-foreground flex items-center gap-2">
                    <Scissors className="w-4.5 h-4.5 text-primary" />
                    Forma zestawu naklejek
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setDeliveryForm("sheet")}
                      className={`p-4 rounded-2xl border text-left transition-all flex flex-col justify-between cursor-pointer ${deliveryForm === "sheet"
                        ? "border-primary bg-primary/5 shadow-sm text-foreground"
                        : "border-border/60 bg-background/50 hover:bg-muted/30 text-muted-foreground hover:text-foreground"
                        }`}
                    >
                      <div className="flex items-center justify-between w-full mb-2">
                        <div className="flex items-center gap-2">
                          <Layers className={`w-4 h-4 ${deliveryForm === "sheet" ? "text-primary" : "text-muted-foreground"}`} />
                          <span className="font-extrabold text-xs text-foreground">Pozostawione na arkuszu</span>
                        </div>
                        <div className={`w-4.5 h-4.5 rounded-full border flex items-center justify-center transition-all ${deliveryForm === "sheet"
                          ? "border-primary bg-primary/10"
                          : "border-slate-300 dark:border-white/20 bg-background"
                          }`}>
                          {deliveryForm === "sheet" && (
                            <div className="w-2.5 h-2.5 rounded-full bg-primary" />
                          )}
                        </div>
                      </div>
                      <p className="text-[12px] leading-relaxed font-medium">
                        Naklejki otrzymasz na arkuszu A4. Wygodne do przechowywania i odklejania (kiss-cut).
                      </p>
                    </button>

                    <button
                      type="button"
                      onClick={() => setDeliveryForm("individual")}
                      className={`p-4 rounded-2xl border text-left transition-all flex flex-col justify-between cursor-pointer ${deliveryForm === "individual"
                        ? "border-primary bg-primary/5 shadow-sm text-foreground"
                        : "border-border/60 bg-background/50 hover:bg-muted/30 text-muted-foreground hover:text-foreground"
                        }`}
                    >
                      <div className="flex items-center justify-between w-full mb-2">
                        <div className="flex items-center gap-2">
                          <Scissors className={`w-4 h-4 ${deliveryForm === "individual" ? "text-primary" : "text-muted-foreground"}`} />
                          <span className="font-extrabold text-xs text-foreground">Pojedyncze sztuki</span>
                        </div>
                        <div className={`w-4.5 h-4.5 rounded-full border flex items-center justify-center transition-all ${deliveryForm === "individual"
                          ? "border-primary bg-primary/10"
                          : "border-slate-300 dark:border-white/20 bg-background"
                          }`}>
                          {deliveryForm === "individual" && (
                            <div className="w-2.5 h-2.5 rounded-full bg-primary" />
                          )}
                        </div>
                      </div>
                      <p className="text-[12px] leading-relaxed font-medium">
                        Każda naklejka zostanie docięta osobno do jej kształtu i dostarczona luzem (die-cut).
                      </p>
                    </button>
                  </div>
                </motion.div>
              )}

            </div>

            {/* Right Column: Visualizer Sheet */}
            <div
              ref={visualizerRef}
              id="sheet-preview-section"
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`relative lg:col-span-6 flex flex-col items-center justify-center -mx-4 sm:mx-0 rounded-none sm:rounded-3xl px-2 py-6 sm:p-8 min-h-[500px] order-1 lg:order-2 transition-all liquid-glass border-y border-x-0 sm:border border-border/40 shadow-[0_8px_30px_rgba(0,0,0,0.02)] ${shouldHighlightSheet ? "highlight-flash" : ""
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

              <div className="flex flex-col sm:flex-row items-center justify-between w-full mb-3 gap-3 border-b border-border/40 pb-2">
                <p className="text-xs font-black uppercase text-muted-foreground tracking-wider text-center sm:text-left">
                  Twój Zestaw Naklejek  <br />(Podgląd ułożenia)
                </p>

                <div className="flex bg-[#004749]/5 dark:bg-[#002224] p-1 rounded-2xl border border-[#004749]/10 dark:border-white/10 relative shadow-[inset_0_1.5px_3px_rgba(0,44,46,0.06)] gap-1">
                  <button
                    type="button"
                    onClick={() => setVisualizerMode("2d")}
                    className={`relative px-4 py-2 text-xs font-black rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${visualizerMode === "2d" ? "text-[#004749] dark:text-white" : "text-muted-foreground/80 hover:text-foreground"
                      }`}
                  >
                    {visualizerMode === "2d" && (
                      <motion.div
                        layoutId="activeVisualizerMode"
                        className="absolute inset-0 bg-white dark:bg-[#004749] rounded-xl shadow-[0_3px_10px_rgba(0,71,73,0.12),_0_1px_3px_rgba(0,71,73,0.04)] dark:shadow-[0_4px_12px_rgba(0,0,0,0.3)] border border-[#004749]/5 dark:border-white/10"
                        transition={{ type: "spring", stiffness: 380, damping: 30 }}
                      />
                    )}
                    <Edit3 className="w-3.5 h-3.5 relative z-10" />
                    <span className="relative z-10">Edycja</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setVisualizerMode("3d")}
                    className={`relative px-4 py-2 text-xs font-black rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${visualizerMode === "3d" ? "text-[#004749] dark:text-white" : "text-muted-foreground/80 hover:text-foreground"
                      }`}
                  >
                    {visualizerMode === "3d" && (
                      <motion.div
                        layoutId="activeVisualizerMode"
                        className="absolute inset-0 bg-white dark:bg-[#004749] rounded-xl shadow-[0_3px_10px_rgba(0,71,73,0.12),_0_1px_3px_rgba(0,71,73,0.04)] dark:shadow-[0_4px_12px_rgba(0,0,0,0.3)] border border-[#004749]/5 dark:border-white/10"
                        transition={{ type: "spring", stiffness: 380, damping: 30 }}
                      />
                    )}
                    <Eye className="w-3.5 h-3.5 relative z-10" />
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
                    onFillSheet={handleFillSheet}
                    onDeleteSticker={handleDeleteSticker}
                    onCutLineChange={handleCutLineChange}
                    onRotationChange={handleRotationChange}
                    isPresentationMode={false}
                    overlappingStickerIds={overlappingStickerIds}
                    deliveryForm={deliveryForm}
                  />
                ) : (
                  <A4Visualizer3D stickers={stickers} deliveryForm={deliveryForm} />
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
                    <div className="flex flex-col items-center justify-center bg-background/95 backdrop-blur-sm border-2 border-primary/30 py-8 px-10 rounded-[2rem] shadow-xl animate-bounce">
                      <ImagePlus className="w-10 h-10 text-primary mb-3" />
                      <span className="text-base font-black text-foreground">Dodaj naklejkę</span>
                      <span className="text-xs font-semibold text-muted-foreground mt-1">Wgraj zdjęcie z galerii</span>
                    </div>
                  </label>
                )}
              </div>



              <p className="text-[11px] text-muted-foreground bg-muted/20 border border-border/40 p-3 rounded-2xl font-bold mt-2 sm:mt-4 text-center max-w-md mx-auto">
                Uwaga: Po zmniejszeniu rozmiaru naklejki tekst i małe elementy mogą stać się nieczytelne.
              </p>

              {stickers.length > 0 && (
                <div className="flex justify-center mt-1.5 mb-0">
                  <button
                    onClick={() => {
                      if (window.confirm("Czy na pewno chcesz usunąć wszystkie naklejki z arkusza?")) {
                        setStickers([]);
                        setSelectedStickerId(null);
                      }
                    }}
                    className="text-xs font-semibold text-muted-foreground hover:text-destructive transition-colors flex items-center gap-1.5 cursor-pointer px-2 py-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Wyczyść arkusz
                  </button>
                </div>
              )}
            </div>

          </div>

          {/* Floating/Sticky Bottom Summary Bar */}
          <div ref={summaryRef} className="relative sm:sticky bottom-0 sm:bottom-4 z-40 liquid-glass border border-border/40 shadow-[0_8px_30px_rgba(0,0,0,0.04)] py-3 sm:py-4 px-4 sm:px-8 rounded-2xl mt-2 sm:mt-4 mb-32 sm:mb-0">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              {/* Left: Summary Info */}
              <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
                <div>
                  <p className="text-xs font-black uppercase text-muted-foreground tracking-wider">Podsumowanie</p>
                  <h4 className="text-2xl font-black text-foreground">
                    {(49.0 * sheetQuantity).toFixed(2).replace('.', ',')} zł <span className="text-xs font-semibold text-muted-foreground">({sheetQuantity} szt.)</span>
                  </h4>
                  {stickers.length > 0 && (
                    <p className="text-[10px] font-bold text-muted-foreground sm:hidden mt-0.5 animate-in fade-in duration-200">
                      {stickers.length} {deliveryForm === "individual" ? getIndividualStickersLabel(stickers.length) : getStickersNoun(stickers.length)} · <span className="text-primary">{deliveryForm === "individual" ? "Pojedyncze sztuki" : "Pozostawione na arkuszu"}</span> (Tylko {(49.00 / stickers.length).toFixed(2).replace('.', ',')} zł za 1 naklejkę!)
                    </p>
                  )}
                  {stickers.some((s) => s.cutLineType === "none") && (
                    <p className="text-[10px] font-bold text-destructive mt-1 animate-pulse">
                      Wybierz linię cięcia dla wszystkich naklejek!
                    </p>
                  )}
                </div>
                <div className="text-[10px] text-muted-foreground font-semibold border-l border-border/60 pl-4 hidden sm:block">
                  <p>
                    {deliveryForm === "individual"
                      ? `${stickers.length} ${getIndividualStickersLabel(stickers.length)}`
                      : `${stickers.length} ${getStickersNoun(stickers.length)} na arkuszu`
                    }
                  </p>
                  <p className="mt-0.5">
                    Forma: <span className="font-extrabold text-foreground">{deliveryForm === "individual" ? "Pojedyncze sztuki" : "Pozostawione na arkuszu"}</span>
                  </p>
                  {stickers.length > 0 && (
                    <p className="mt-0.5">
                      Tylko {(49.00 / stickers.length).toFixed(2).replace('.', ',')} zł za 1 naklejkę!
                    </p>
                  )}
                </div>
              </div>

              {/* Right: Actions & Quantity */}
              <div className="flex flex-wrap items-center justify-center gap-4 w-full md:w-auto">
                {/* Quantity Selector & Shipping Info */}
                <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto justify-center">
                  <div className="flex items-center gap-3 bg-muted/50 border border-border/30 px-3 py-1.5 rounded-2xl">
                    <span className="text-xs font-bold text-muted-foreground">Zestawy:</span>
                    <button
                      type="button"
                      onClick={() => setSheetQuantity(Math.max(1, sheetQuantity - 1))}
                      disabled={sheetQuantity <= 1}
                      className="w-8 h-8 rounded-xl bg-background hover:bg-muted border border-border flex items-center justify-center font-bold active:scale-95 transition-transform disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
                    >
                      <Minus className="w-3.5 h-3.5 text-foreground" />
                    </button>
                    <span className="text-sm font-black w-6 text-center text-foreground">{sheetQuantity}</span>
                    <button
                      type="button"
                      onClick={() => setSheetQuantity(sheetQuantity + 1)}
                      className="w-8 h-8 rounded-xl bg-background hover:bg-muted border border-border flex items-center justify-center font-bold active:scale-95 transition-transform cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5 text-foreground" />
                    </button>
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px] font-black text-secondary whitespace-nowrap">
                    <Truck className="w-4 h-4 text-secondary" />
                    <span>Wysyłka w ciągu 2 dni</span>
                  </div>
                </div>

                {/* CTA Buttons */}
                <div className="flex flex-col sm:flex-row items-center gap-2 w-full sm:w-auto">
                  <button
                    onClick={handleAddToCart}
                    disabled={isAddingToCart || stickers.length === 0}
                    className="w-full sm:w-auto inline-flex items-center justify-center rounded-2xl text-sm font-bold bg-primary text-primary-foreground hover:bg-primary/95 active:scale-[0.98] h-12 px-6 shadow-sm transition-all disabled:opacity-50 cursor-pointer"
                  >
                    {isAddingToCart ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <ShoppingCart className="w-4 h-4 mr-2" />
                    )}
                    {editCartItemId ? "Zaktualizuj w koszyku" : "Dodaj do koszyka"}
                  </button>


                </div>
              </div>
            </div>
          </div>

          {/* Sticky Mobile Add/Generate buttons */}
          <AnimatePresence>
            {!selectedStickerId && isVisualizerVisible && (
              <motion.div
                initial={{ y: 150, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 150, opacity: 0 }}
                className="fixed bottom-0 left-0 right-0 z-[100] sm:hidden pointer-events-none"
              >
                <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background/95 via-background/70 to-transparent pointer-events-none" />

                <div className="relative px-4 pb-5 pt-2 pointer-events-auto">
                  <div className="w-full liquid-glass border border-border/40 p-2 rounded-[28px] shadow-[0_-8px_30px_rgba(0,0,0,0.08)] dark:shadow-[0_-8px_30px_rgba(0,0,0,0.3)]">
                    <div className="grid grid-cols-3 gap-2">
                      <label className="w-full flex flex-col items-center justify-center gap-1 py-2 px-1 rounded-3xl bg-primary hover:bg-primary/90 border border-primary/20 transition-all active:scale-[0.98] cursor-pointer shadow-sm">
                        <input type="file" accept="image/*" className="hidden" onChange={(e) => { const file = e.target.files?.[0]; if (file) handleMobileFileUpload(file); e.target.value = ""; }} />
                        <ImagePlus className="w-5 h-5 text-white" />
                        <span className="text-[10px] font-extrabold text-white leading-tight">Dodaj z grafiki/zdjęcia</span>
                      </label>
                      <button
                        onClick={() => setShowPasteModal(true)}
                        className="w-full flex flex-col items-center justify-center gap-1 py-2 px-1 rounded-3xl bg-primary/10 hover:bg-primary border border-primary text-primary hover:text-primary-foreground transition-all active:scale-[0.98] cursor-pointer shadow-sm group"
                      >
                        <SmilePlus className="w-5 h-5 text-primary group-hover:text-primary-foreground" />
                        <span className="text-[10px] font-extrabold text-primary group-hover:text-primary-foreground text-center leading-tight">Z klawiatury<br />(Naklejki i Emoji)</span>
                      </button>
                      <button
                        onClick={() => setIsAIGeneratorOpen(true)}
                        className="w-full flex flex-col items-center justify-center gap-1 py-2 px-1 rounded-3xl bg-primary/10 hover:bg-primary border border-primary text-primary hover:text-primary-foreground transition-all active:scale-[0.98] cursor-pointer shadow-sm group"
                      >
                        <Wand2 className="w-5 h-5 text-primary group-hover:text-primary-foreground" />
                        <span className="text-[10px] font-extrabold text-primary group-hover:text-primary-foreground text-center leading-tight">Wygeneruj z opisu</span>
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Sticky Mobile Panel for Selected Sticker */}
          <AnimatePresence>
            {selectedSticker && isVisualizerVisible && (
              <motion.div
                initial={{ y: 150, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 150, opacity: 0 }}
                className="fixed bottom-0 left-0 right-0 z-[100] sm:hidden pointer-events-none"
              >
                <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-background/95 via-background/70 to-transparent pointer-events-none" />

                <div className="relative px-3 pb-5 pt-2 pointer-events-auto">
                  <div className="w-full liquid-glass border border-border/40 p-3 rounded-[28px] shadow-[0_-8px_30px_rgba(0,0,0,0.08)] dark:shadow-[0_-8px_30px_rgba(0,0,0,0.3)] bg-background flex flex-col gap-3">

                    {/* Title & Close Button */}
                    <div className="flex justify-between items-start px-2">
                      <div className="flex flex-col">
                        <h3 className="text-sm font-black text-foreground flex items-center gap-1.5">
                          <Layers className="w-4 h-4 text-primary" />
                          Wybrana naklejka
                        </h3>
                        {selectedSticker.cutLineType === "none" && (
                          <span className="text-[10px] font-bold text-destructive mt-0.5 animate-pulse">
                            Ustaw linie cięcia
                          </span>
                        )}
                      </div>
                      <button
                        onClick={() => setSelectedStickerId(null)}
                        className="p-1.5 rounded-full bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground transition-all active:scale-95"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Tabs */}
                    <div className="flex bg-[#004749]/5 dark:bg-[#002224] p-1 rounded-2xl border border-[#004749]/10 dark:border-white/10 relative shadow-[inset_0_1.5px_3px_rgba(0,44,46,0.06)] gap-1">
                      <button
                        onClick={() => setMobileActiveTab("resize")}
                        className={`relative flex-1 py-1.5 flex flex-col items-center gap-0.5 text-[10px] font-bold rounded-xl transition-all cursor-pointer ${mobileActiveTab === "resize" ? "text-[#004749] dark:text-white" : "text-muted-foreground/80 hover:text-foreground"}`}
                      >
                        {mobileActiveTab === "resize" && (
                          <motion.div
                            layoutId="mobileActiveTabIndicator"
                            className="absolute inset-0 bg-white dark:bg-[#004749] rounded-xl shadow-[0_3px_10px_rgba(0,71,73,0.12),_0_1px_3px_rgba(0,71,73,0.04)] dark:shadow-[0_4px_12px_rgba(0,0,0,0.3)] border border-[#004749]/5 dark:border-white/10"
                            transition={{ type: "spring", stiffness: 380, damping: 30 }}
                          />
                        )}
                        <Maximize className="w-4 h-4 mb-0.5 relative z-10" />
                        <span className="relative z-10">Rozmiar</span>
                      </button>
                      <button
                        onClick={() => setMobileActiveTab("cutline")}
                        className={`relative flex-1 py-1.5 flex flex-col items-center gap-0.5 text-[10px] font-bold rounded-xl transition-all cursor-pointer ${mobileActiveTab === "cutline"
                          ? "text-[#004749] dark:text-white"
                          : selectedSticker.cutLineType === "none"
                            ? "text-destructive animate-pulse scale-[1.05]"
                            : "text-muted-foreground/80 hover:text-foreground"
                          }`}
                      >
                        {mobileActiveTab === "cutline" && (
                          <motion.div
                            layoutId="mobileActiveTabIndicator"
                            className="absolute inset-0 bg-white dark:bg-[#004749] rounded-xl shadow-[0_3px_10px_rgba(0,71,73,0.12),_0_1px_3px_rgba(0,71,73,0.04)] dark:shadow-[0_4px_12px_rgba(0,0,0,0.3)] border border-[#004749]/5 dark:border-white/10"
                            transition={{ type: "spring", stiffness: 380, damping: 30 }}
                          />
                        )}
                        <Scissors className="w-4 h-4 mb-0.5 relative z-10" />
                        <span className="relative z-10">Linia Cięcia</span>
                      </button>
                      <button
                        onClick={() => setMobileActiveTab("options")}
                        className={`relative flex-1 py-1.5 flex flex-col items-center gap-0.5 text-[10px] font-bold rounded-xl transition-all cursor-pointer ${mobileActiveTab === "options" ? "text-[#004749] dark:text-white" : "text-muted-foreground/80 hover:text-foreground"}`}
                      >
                        {mobileActiveTab === "options" && (
                          <motion.div
                            layoutId="mobileActiveTabIndicator"
                            className="absolute inset-0 bg-white dark:bg-[#004749] rounded-xl shadow-[0_3px_10px_rgba(0,71,73,0.12),_0_1px_3px_rgba(0,71,73,0.04)] dark:shadow-[0_4px_12px_rgba(0,0,0,0.3)] border border-[#004749]/5 dark:border-white/10"
                            transition={{ type: "spring", stiffness: 380, damping: 30 }}
                          />
                        )}
                        <Settings className="w-4 h-4 mb-0.5 relative z-10" />
                        <span className="relative z-10">Opcje</span>
                      </button>
                    </div>

                    {/* Content */}
                    <div className="px-1 pb-1 h-[116px] flex flex-col justify-center">
                      {mobileActiveTab === "resize" && (
                        <div className="flex flex-col gap-4 animate-in fade-in duration-200">
                          <div className="flex justify-between items-center text-sm font-bold px-1">
                            <span className="text-foreground flex items-center gap-2">
                              Szerokość:
                              <span className="text-primary font-black">{String(getDisplayedWidthCm(selectedSticker)).replace('.', ',')} cm</span>
                            </span>
                            <span className="text-muted-foreground flex items-center gap-1 text-xs">
                              Wysokość: <span className="font-semibold">{selectedSticker.heightCm.toFixed(1).replace('.', ',')} cm</span>
                            </span>
                          </div>
                          <input
                            type="range"
                            min={1}
                            max={19}
                            step={0.1}
                            value={getDisplayedWidthCm(selectedSticker)}
                            onChange={(e) => handleWidthChange(Number(e.target.value))}
                            className="w-full h-2.5 bg-foreground/10 dark:bg-muted-foreground/40 rounded-lg appearance-none cursor-pointer accent-primary focus:outline-none"
                          />
                        </div>
                      )}

                      {mobileActiveTab === "cutline" && (
                        <div className="grid grid-cols-3 gap-2 animate-in fade-in duration-200">
                          {[
                            { type: "none", label: "Brak", icon: Ban },
                            { type: "contour", label: "Kontur", icon: Sparkles },
                            { type: "rounded", label: "Prostokąt", icon: Square },
                            { type: "circle", label: "Koło", icon: Circle },
                            { type: "rounded_inside", label: "Prost. wew.", icon: Square },
                            { type: "circle_inside", label: "Koło wew.", icon: Circle },
                          ].map((opt) => {
                            const Icon = opt.icon;
                            return (
                              <button
                                key={opt.type}
                                onClick={() => handleCutLineChange(opt.type as any)}
                                disabled={isCalculatingContour !== null}
                                className={`py-2 px-1 text-[10px] font-bold rounded-xl border text-center transition-all flex flex-col items-center justify-center gap-1.5 active:scale-95 ${selectedSticker.cutLineType === opt.type
                                  ? "bg-primary text-primary-foreground border-primary shadow-sm"
                                  : "bg-background text-muted-foreground border-border"
                                  } ${isCalculatingContour === opt.type ? "opacity-70 pointer-events-none" : ""}`}
                              >
                                {isCalculatingContour === opt.type ? <Loader2 className="w-4 h-4 animate-spin" /> : <Icon className="w-4 h-4" />}
                                <span className="leading-tight">{opt.label}</span>
                              </button>
                            );
                          })}
                        </div>
                      )}

                      {mobileActiveTab === "options" && (
                        <div className="flex flex-wrap items-center gap-2 w-full animate-in fade-in duration-200">
                          <button type="button" onClick={handleOpenEdit} className="flex-1 inline-flex flex-col items-center justify-center gap-1.5 px-1 py-2.5 text-[10px] font-bold bg-muted hover:bg-muted/80 text-foreground border border-border/40 rounded-2xl transition-all active:scale-95">
                            <Crop className="w-4.5 h-4.5" />
                            <span>Kadruj/Tło</span>
                          </button>
                          <button type="button" onClick={handleDuplicateSticker} className="flex-1 inline-flex flex-col items-center justify-center gap-1.5 px-1 py-2.5 text-[10px] font-bold bg-muted hover:bg-muted/80 text-foreground border border-border/40 rounded-2xl transition-all active:scale-95">
                            <Copy className="w-4.5 h-4.5" />
                            <span>Zduplikuj</span>
                          </button>
                          <button type="button" onClick={handleFillSheet} className="flex-1 inline-flex flex-col items-center justify-center gap-1.5 px-1 py-2.5 text-[10px] font-bold bg-muted hover:bg-muted/80 text-foreground border border-border/40 rounded-2xl transition-all active:scale-95">
                            <LayoutGrid className="w-4.5 h-4.5" />
                            <span>Wypełnij Arkusz</span>
                          </button>
                          <button type="button" onClick={handleDeleteSticker} className="flex-1 inline-flex flex-col items-center justify-center gap-1.5 px-1 py-2.5 text-[10px] font-bold bg-destructive/10 text-destructive border border-destructive/20 rounded-2xl transition-all active:scale-95">
                            <Trash2 className="w-4.5 h-4.5" />
                            <span>Usuń</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

        </main>
      </div>

      {/* Sekcja SEO i marketingowa z premium gradientem i wzorem kropek */}
      <div className="w-full bg-gradient-to-b from-white via-white to-[#edf6f2] dark:from-background dark:via-background/80 dark:to-[#002c2e] z-10 flex flex-col flex-grow relative overflow-hidden">
        {/* Wzór kropek w tle */}
        <div className="absolute inset-0 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] dark:bg-[radial-gradient(#1c3e41_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none opacity-50" />

        {/* Elementy ponad tłem */}
        <div className="relative z-10 flex flex-col flex-grow w-full">
          {children}

          <Footer>
            {stickers.length > 0 && (
              <div className="flex flex-wrap justify-center gap-4 mb-2 text-xs font-semibold text-muted-foreground/75">
                <button
                  onClick={() => handleDownloadPNG("print")}
                  disabled={isGeneratingPng}
                  className="hover:text-foreground transition-colors disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
                >
                  {isGeneratingPng ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Download className="w-3.5 h-3.5" />
                  )}
                  <span>Pobierz PNG (druk arkusza)</span>
                </button>
                <span className="text-muted-foreground/30 select-none">|</span>
                <button
                  onClick={() => handleDownloadPNG("cut-lines")}
                  disabled={isGeneratingPng}
                  className="hover:text-foreground transition-colors disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
                >
                  {isGeneratingPng ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Download className="w-3.5 h-3.5" />
                  )}
                  <span>Pobierz PNG (linie cięcia)</span>
                </button>
                <span className="text-muted-foreground/30 select-none">|</span>
                <button
                  onClick={() => handleDownloadPNG("3d")}
                  disabled={isGeneratingPng}
                  className="hover:text-foreground transition-colors disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
                >
                  {isGeneratingPng ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Download className="w-3.5 h-3.5" />
                  )}
                  <span>Pobierz PNG (wizualizacja 3D)</span>
                </button>
              </div>
            )}
          </Footer>
        </div>
      </div>

      {/* Sticky Header w formie menu po wjechaniu na sekcję SEO */}
      <AnimatePresence>
        {showStickyHeader && (
          <div className="fixed top-0 left-0 right-0 z-[120] pointer-events-none">
            <motion.div
              initial={{ y: -100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -100, opacity: 0 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="max-w-5xl mx-auto w-full pointer-events-auto flex justify-between items-center h-14 sm:h-16 px-5 sm:px-6 bg-background/90 backdrop-blur-md rounded-b-2xl rounded-t-none border-x border-b border-border/70 shadow-[0_8px_30px_rgba(0,0,0,0.06)]"
            >
              {/* Left: Minimized Logo */}
              <div className="flex justify-start items-center">
                <Link href="/" className="flex items-center">
                  <motion.div
                    whileTap={{ scale: 0.98 }}
                    className="relative h-8 sm:h-9 flex items-center"
                  >
                    <NextImage
                      src="/images/logo/malenaklejki-logo-light.png?v=3"
                      alt="małe Naklejki Logo"
                      width={220}
                      height={55}
                      className="h-full w-auto object-contain dark:hidden"
                      priority
                      unoptimized
                    />
                    <NextImage
                      src="/images/logo/malenaklejki-logo-dark.png?v=3"
                      alt="małe Naklejki Logo"
                      width={220}
                      height={55}
                      className="h-full w-auto object-contain hidden dark:block"
                      priority
                      unoptimized
                    />
                  </motion.div>
                </Link>
              </div>

              {/* Right: Minimized Actions & Cart info */}
              <div className="flex justify-end items-center gap-3 sm:gap-4">
                {/* Zamów Naklejki Personalizowane Button */}
                <button
                  type="button"
                  onClick={scrollToAndHighlightSheet}
                  className="hidden md:inline-flex items-center justify-center px-4 py-1.5 border border-primary text-[13px] font-extrabold rounded-lg text-primary bg-primary/10 hover:bg-primary hover:text-primary-foreground transition-all duration-300 shadow-sm hover:shadow-md whitespace-nowrap cursor-pointer"
                >
                  <StickerIcon className="w-3.5 h-3.5 mr-1.5" />
                  Zamów Zestaw Naklejek
                </button>

                {/* Zamów Projekt Button */}
                <Link
                  href="/zamow-projekt"
                  className="hidden md:inline-flex px-3.5 py-1.5 text-[13px] font-extrabold text-foreground hover:text-primary bg-muted/40 hover:bg-muted/85 rounded-lg border border-border/30 transition-all cursor-pointer hover:scale-[1.01] active:scale-[0.99] whitespace-nowrap"
                >
                  Zamów Projekt
                </Link>

                {/* Kontakt Button */}
                <Link
                  href="/kontakt"
                  className="hidden md:inline-flex px-3.5 py-1.5 text-[13px] font-extrabold text-foreground hover:text-primary bg-muted/40 hover:bg-muted/85 rounded-lg border border-border/30 transition-all cursor-pointer hover:scale-[1.01] active:scale-[0.99] whitespace-nowrap"
                >
                  Kontakt
                </Link>
                <Link href="/koszyk">
                  <div className="relative flex items-center p-1.5 rounded-xl hover:bg-muted/50 transition-colors cursor-pointer group">
                    <motion.div whileHover={{ scale: 1.05, rotate: 1 }} whileTap={{ scale: 0.95 }}>
                      <ShoppingCart className="w-5 h-5 text-foreground group-hover:text-primary transition-colors" />
                    </motion.div>
                    {cartItems.length > 0 && (
                      <span className="absolute top-0 right-0 -mt-1 -mr-1 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-primary border border-background text-[9px] font-bold text-primary-foreground">
                        {cartItems.length}
                      </span>
                    )}
                  </div>
                </Link>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Przycisk Scroll to Top (pływający w prawym dolnym rogu) */}
      <AnimatePresence>
        {showStickyHeader && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.2 }}
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="fixed bottom-6 right-6 z-[100] p-3 rounded-full bg-primary text-primary-foreground shadow-lg hover:bg-primary/90 hover:scale-105 active:scale-95 transition-all cursor-pointer border border-primary/20"
            title="Przewiń do góry"
          >
            <ArrowUp className="w-5 h-5" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* AI Generator Modal */}
      <AnimatePresence>
        {isAIGeneratorOpen && (
          <AIGenerator
            onClose={() => setIsAIGeneratorOpen(false)}
            onStickerGenerated={(url) => {
              processAndAddSticker(url);
              setIsAIGeneratorOpen(false);
            }}
          />
        )}
      </AnimatePresence>

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

      {/* Manual Paste Modal for Safari/Mobile Fallback */}
      <AnimatePresence>
        {showPasteModal && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowPasteModal(false)}
              className="absolute inset-0 bg-background/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative w-full max-w-md rounded-3xl p-6 border border-border bg-background shadow-xl flex flex-col"
            >
              <div>
                <h2 className="text-xl font-extrabold flex items-center gap-2 text-foreground">
                  <SmilePlus className="w-6 h-6 text-primary" />
                  Dodaj naklejkę lub emoji z klawiatury
                </h2>
                <p className="text-sm font-semibold text-muted-foreground pt-1 pb-2">
                  Zmień swoje emoji i systemowe naklejki z telefonu w prawdziwe! Postępuj zgodnie z instrukcją:
                </p>

                <div className="flex items-start justify-between gap-1 mt-2 mb-4 p-3 bg-muted/40 rounded-2xl text-[10px] sm:text-[11px] font-bold text-muted-foreground border border-border/50">
                  <div className="flex flex-col items-center text-center gap-2 flex-1">
                    <div className="w-10 h-10 rounded-full bg-background border border-border shadow-sm text-primary flex items-center justify-center">
                      <MousePointerClick className="w-5 h-5" />
                    </div>
                    <span className="leading-tight">1. Dotknij pola poniżej</span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-muted-foreground/30 flex-shrink-0 mt-3" />
                  <div className="flex flex-col items-center text-center gap-2 flex-1">
                    <div className="w-10 h-10 rounded-full bg-background border border-border shadow-sm text-primary flex items-center justify-center">
                      <Keyboard className="w-5 h-5" />
                    </div>
                    <span className="leading-tight">2. Wybierz naklejki lub emoji z klawiatury</span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-muted-foreground/30 flex-shrink-0 mt-3" />
                  <div className="flex flex-col items-center text-center gap-2 flex-1">
                    <div className="w-10 h-10 rounded-full bg-background border border-border shadow-sm text-primary flex items-center justify-center">
                      <SmilePlus className="w-5 h-5" />
                    </div>
                    <span className="leading-tight">3. Stuknij w wybraną, by dodać na arkusz!</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-center justify-center w-full mt-4">
                <div className="relative w-full h-40 border-2 border-dashed border-primary/40 rounded-2xl bg-muted/20 focus-within:border-primary focus-within:bg-primary/5 transition-all overflow-hidden">

                  {/* Placeholder Layer */}
                  <div className={`pointer-events-none absolute inset-0 flex flex-col items-center justify-center font-bold transition-opacity duration-300 ${isPasteFocused ? "opacity-20 text-muted-foreground/50" : "opacity-60 text-muted-foreground"}`}>
                    <ClipboardPaste className="w-8 h-8 mb-2" />
                    <span className="text-center px-4">Dotknij tutaj, a następnie stuknij ponownie, by Wkleić</span>
                  </div>

                  {/* Input Layer */}
                  <div
                    contentEditable
                    suppressContentEditableWarning={true}
                    onFocus={() => setIsPasteFocused(true)}
                    onBlur={() => setIsPasteFocused(false)}
                    className="absolute inset-0 w-full h-full outline-none text-transparent caret-primary text-center pt-[92px] text-base"
                    onInput={(e) => {
                      const target = e.currentTarget as HTMLDivElement;
                      const img = target.querySelector('img');
                      if (img && img.src) {
                        fetch(img.src)
                          .then(res => res.blob())
                          .then(blob => {
                            const file = new File([blob], "sticker.png", { type: blob.type });
                            setShowPasteModal(false);
                            handleMobileFileUpload(file, true);
                          });
                      } else {
                        const inputEvent = e.nativeEvent as InputEvent;
                        let fileFound = false;
                        if (inputEvent.dataTransfer && inputEvent.dataTransfer.files.length > 0) {
                          for (let i = 0; i < inputEvent.dataTransfer.files.length; i++) {
                            const file = inputEvent.dataTransfer.files[i];
                            if (file.type.startsWith("image/")) {
                              setShowPasteModal(false);
                              handleMobileFileUpload(file, true);
                              fileFound = true;
                              break;
                            }
                          }
                        }

                        if (!fileFound) {
                          const text = target.innerText.trim();
                          if (text && text.length <= 8) {
                            const canvas = document.createElement("canvas");
                            canvas.width = 512;
                            canvas.height = 512;
                            const ctx = canvas.getContext("2d");
                            if (ctx) {
                              ctx.clearRect(0, 0, 512, 512);
                              ctx.font = "400px sans-serif";
                              ctx.textAlign = "center";
                              ctx.textBaseline = "middle";
                              ctx.fillText(text, 256, 290);
                              canvas.toBlob((blob) => {
                                if (blob) {
                                  const file = new File([blob], "emoji.png", { type: "image/png" });
                                  setShowPasteModal(false);
                                  handleMobileFileUpload(file, true);
                                }
                              });
                            }
                          }
                        }
                      }
                      setTimeout(() => { target.innerHTML = ''; }, 10);
                    }}
                    onPaste={(e) => {
                      let fileFound = false;
                      for (let i = 0; i < e.clipboardData.items.length; i++) {
                        const item = e.clipboardData.items[i];
                        if (item.type.startsWith("image/")) {
                          const file = item.getAsFile();
                          if (file) {
                            e.preventDefault();
                            setShowPasteModal(false);
                            handleMobileFileUpload(file, true);
                            fileFound = true;
                            return;
                          }
                        }
                      }
                      // Do not call e.preventDefault() if no image found.
                      // This allows Gboard on Android to insert images into contenteditable
                      // or standard text emoji to be pasted, which triggers onInput!
                    }}
                  />
                </div>
                <button
                  onClick={() => setShowPasteModal(false)}
                  className="mt-6 w-full py-3 rounded-2xl bg-muted text-foreground font-bold hover:bg-muted/80 transition-all cursor-pointer z-20 relative"
                >
                  Anuluj
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
