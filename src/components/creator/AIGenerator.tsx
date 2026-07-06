"use client";

import { getUUID } from "@/lib/uuid";
import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { generateStickerImage } from "@/app/actions/generateImage";
import {
  Loader2,
  Sparkles,
  Bot,
  Check,
  RefreshCw,
  X,
  ImagePlus,
  Crop,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { StickerEditModal } from "./StickerEditModal";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "@/lib/firebase/client";

interface AIGeneratorProps {
  onImageGenerated: (url: string) => void;
}

interface AttachedImage {
  base64: string;
  mimeType: string;
  previewUrl: string;
  fileName: string;
}

// Compress and resize image on the client to stay within Server Action payload limits
const compressImage = (
  file: File,
  maxPx = 1024,
  quality = 0.85
): Promise<{ base64: string; mimeType: string; previewUrl: string }> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = (e) => {
      const img = new Image();
      img.onerror = reject;
      img.onload = () => {
        let { width, height } = img;
        if (width > maxPx || height > maxPx) {
          if (width >= height) {
            height = Math.round((height * maxPx) / width);
            width = maxPx;
          } else {
            width = Math.round((width * maxPx) / height);
            height = maxPx;
          }
        }
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        canvas.getContext("2d")!.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL("image/jpeg", quality);
        const [, base64] = dataUrl.split(",");
        resolve({ base64, mimeType: "image/jpeg", previewUrl: dataUrl });
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  });

// Convert a Blob to base64 without uploading (used for pre-generation crop)
const blobToBase64 = (blob: Blob): Promise<{ base64: string; mimeType: string; previewUrl: string }> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = () => {
      const dataUrl = reader.result as string;
      const [, base64] = dataUrl.split(",");
      resolve({ base64, mimeType: blob.type || "image/png", previewUrl: dataUrl });
    };
    reader.readAsDataURL(blob);
  });

const uploadFileToFirebase = async (file: File): Promise<string> => {
  const fileName = `ai-ref-${getUUID()}-${file.name}`;
  const storageRef = ref(storage, `uploads/${fileName}`);
  const snapshot = await uploadBytes(storageRef, file);
  return await getDownloadURL(snapshot.ref);
};

const STYLES = [
  { id: "none", label: "Domyślny", prompt: "" },
  { id: "monochromatic", label: "Monochromatyczny", prompt: ", monochromatic illustration style, single unified color tone, minimalist aesthetic, clean negative space" },
  { id: "risograph", label: "Risografia", prompt: ", risograph print style, retro grainy texture, overlapping bold ink colors, misaligned screen-print look" },
  { id: "technicolor", label: "Technikolor", prompt: ", vintage technicolor movie style, high-contrast saturated colors, 1950s cinematic saturation, classic film photo style" },
  { id: "claymation", label: "Gotycka plastelina", prompt: ", gothic claymation style, stop-motion clay texture, eerie dark tones, handmade sculpt look, Tim Burton design style" },
  { id: "watercolor", label: "Akwarela", prompt: ", watercolor paint style, soft bleeding pigment washes, wet-on-wet watercolor texture, gentle brush strokes, light artistic paint drops" },
  { id: "sketch", label: "Szkic", prompt: ", hand-drawn pencil sketch, crosshatching pencil shading, paper texture, graphite outline style" },
  { id: "pastels", label: "Pastele", prompt: ", soft pastel color drawing, chalky texture, gentle muted colors, soft lines, dreamy atmosphere" },
  { id: "anime", label: "Anime", prompt: ", modern anime illustration style, clean line art, vibrant cel-shaded colors, studio anime aesthetic" },
  { id: "cartoon", label: "Kreskówka", prompt: ", playful cartoon style, bold outlines, bright solid colors, simple vector cartoon look" },
  { id: "render3d", label: "Render 3D", prompt: ", 3D clay render style, smooth octane render look, glossy toy plastic material, cute soft studio lighting" },
  { id: "surrealist", label: "Surrealistyczny", prompt: ", surrealist art style, dreamlike bizarre composition, weird fantastical combinations, Salvador Dali aesthetic" },
  { id: "photo", label: "Zdjęcie", prompt: ", realistic photographic sticker style, real-world texture, photorealistic rendering, detailed studio product photo style" }
];

export function AIGenerator({ onImageGenerated }: AIGeneratorProps) {
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    setIsMounted(true);
  }, []);
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [attachedImage, setAttachedImage] = useState<AttachedImage | null>(null);

  const [showCropModal, setShowCropModal] = useState(false);
  const [cropBlobSrc, setCropBlobSrc] = useState<string | null>(null);

  const [pendingAttachUrl, setPendingAttachUrl] = useState<string | null>(null);
  const [pendingFileName, setPendingFileName] = useState<string>("");
  const [isUploadingReference, setIsUploadingReference] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedStyleId, setSelectedStyleId] = useState("none");
  const [isDraggingFile, setIsDraggingFile] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.types.includes("Files")) {
      setIsDraggingFile(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingFile(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingFile(false);

    const file = e.dataTransfer.files?.[0];
    if (!file || !file.type.startsWith("image/")) return;

    setIsUploadingReference(true);
    setError(null);
    try {
      const downloadUrl = await uploadFileToFirebase(file);
      setPendingFileName(file.name);
      setPendingAttachUrl(downloadUrl);
    } catch (err) {
      console.error(err);
      setError("Nie udało się przesłać zdjęcia referencyjnego.");
    } finally {
      setIsUploadingReference(false);
    }
  };

  const handleOpenCrop = () => {
    if (previewUrl) {
      setCropBlobSrc(previewUrl);
      setShowCropModal(true);
    }
  };

  const handleCropComplete = (newUrl: string) => {
    setShowCropModal(false);
    setCropBlobSrc(null);
    setPreviewUrl(newUrl);
  };

  const handleCropCancel = () => {
    setShowCropModal(false);
    setCropBlobSrc(null);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) return;
    e.target.value = "";

    setIsUploadingReference(true);
    setError(null);
    try {
      const downloadUrl = await uploadFileToFirebase(file);
      setPendingFileName(file.name);
      setPendingAttachUrl(downloadUrl);
    } catch (err) {
      console.error(err);
      setError("Nie udało się przesłać zdjęcia referencyjnego.");
    } finally {
      setIsUploadingReference(false);
    }
  };

  const handleAttachEditComplete = async (newUrl: string) => {
    setPendingAttachUrl(null);
    setIsUploadingReference(true);
    try {
      const response = await fetch(`/api/proxy-image?url=${encodeURIComponent(newUrl)}`);
      if (!response.ok) throw new Error("Failed to fetch proxy image");
      const blob = await response.blob();
      const result = await blobToBase64(blob);
      setAttachedImage({
        base64: result.base64,
        mimeType: result.mimeType,
        previewUrl: result.previewUrl,
        fileName: pendingFileName || "reference.png",
      });
    } catch (err) {
      console.error(err);
      setError("Nie udało się zapisać wykadrowanego zdjęcia referencyjnego.");
    } finally {
      setIsUploadingReference(false);
    }
  };

  const handleAttachEditCancel = () => {
    setPendingAttachUrl(null);
    setPendingFileName("");
  };

  const handleGenerate = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!prompt.trim() && !attachedImage) return;

    setIsGenerating(true);
    setError(null);
    setPreviewUrl(null);

    try {
      const selectedStyle = STYLES.find((s) => s.id === selectedStyleId);
      const stylePrompt = selectedStyle ? selectedStyle.prompt : "";
      const finalPrompt = prompt.trim() + stylePrompt;

      const result = await generateStickerImage(
        finalPrompt,
        attachedImage
          ? { base64: attachedImage.base64, mimeType: attachedImage.mimeType }
          : null
      );
      if (result.success && result.url) {
        setPreviewUrl(result.url);
      } else {
        setError(
          result.error || "Ups! Coś poszło nie tak. Spróbuj jeszcze raz!"
        );
      }
    } catch (err: any) {
      setError(err?.message || "Wystąpił nieoczekiwany błąd. Bot chyba zasnął.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAccept = () => {
    if (previewUrl) {
      onImageGenerated(previewUrl);
      setPreviewUrl(null);
    }
  };

  const handleRegenerate = () => {
    setPreviewUrl(null);
    handleGenerate();
  };

  const canGenerate = !isGenerating && !isUploadingReference && (!!prompt.trim() || !!attachedImage);

  return (
    <>
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`relative flex flex-col gap-4 w-full p-4 rounded-3xl transition-all duration-300 border-2 ${isDraggingFile
          ? "border-dashed border-primary bg-primary/5 scale-[1.01]"
          : "border-transparent"
          }`}
      >
        {isUploadingReference && (
          <div className="absolute inset-0 z-50 bg-background/80 backdrop-blur-sm flex flex-col items-center justify-center rounded-3xl">
            <Loader2 className="w-10 h-10 animate-spin text-primary" />
            <p className="text-sm font-bold text-primary mt-2">Przetwarzanie zdjęcia...</p>
          </div>
        )}

        {/* Prompt input + generate button */}
        <form
          onSubmit={handleGenerate}
          className="flex flex-col sm:flex-row gap-3 w-full"
        >
          <input
            type="text"
            placeholder={
              attachedImage
                ? "Opcjonalnie: dodaj styl, opis... (np. cyberpunk, pastele)"
                : "np. Cool żaba w okularach..."
            }
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            disabled={isGenerating || isUploadingReference}
            className="flex h-14 w-full rounded-xl border border-slate-200 dark:border-border/70 bg-background px-4 py-2 text-base font-semibold placeholder:text-slate-400 dark:placeholder:text-slate-500 focus-visible:outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20 disabled:opacity-50 flex-1 shadow-none"
          />
          <motion.button
            whileTap={canGenerate ? { scale: 0.98 } : {}}
            type="submit"
            disabled={!canGenerate}
            className="inline-flex items-center justify-center whitespace-nowrap rounded-xl text-base font-bold bg-primary text-primary-foreground hover:bg-primary/95 active:scale-[0.98] h-14 px-6 shadow-sm transition-all disabled:pointer-events-none disabled:opacity-50"
          >
            {isGenerating ? (
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
            ) : (
              <Sparkles className="w-5 h-5 mr-2" />
            )}
            Stwórz!
          </motion.button>
        </form>

        {/* Photo attachment row */}
        <div className="flex items-center gap-3">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
            disabled={isGenerating || isUploadingReference}
          />

          {attachedImage ? (
            /* Thumbnail of attached image */
            <div className="flex items-center gap-3 bg-muted/40 border border-slate-200 dark:border-border/60 rounded-xl px-3 py-2 flex-1">
              <div className="w-10 h-10 rounded-lg overflow-hidden border border-border/50 flex-shrink-0 bg-white">
                <img
                  src={attachedImage.previewUrl}
                  alt="Załączone zdjęcie"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-foreground truncate">
                  {attachedImage.fileName}
                </p>
                <p className="text-[10px] text-muted-foreground font-medium mt-0.5">
                  Generator przetworzy to zdjęcie na naklejkę
                </p>
              </div>
              <button
                type="button"
                onClick={() => setAttachedImage(null)}
                className="p-1 rounded-full hover:bg-muted/60 text-muted-foreground hover:text-foreground transition-colors flex-shrink-0"
                title="Usuń zdjęcie"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            /* Attach button */
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isGenerating || isUploadingReference}
              className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-primary border border-slate-200 dark:border-border/60 hover:border-primary/40 bg-muted/30 hover:bg-muted/50 transition-all px-4 py-2.5 rounded-xl disabled:opacity-40 disabled:pointer-events-none w-full justify-center"
            >
              <ImagePlus className="w-4 h-4" />
              Wgraj swoje zdjęcie<span className="hidden sm:inline"> (lub przeciągnij tutaj)</span>
            </button>
          )}
        </div>

        {/* Style Selection Dropdown */}
        <div className="space-y-2">
          <label htmlFor="ai-style-select" className="text-xs font-black uppercase text-muted-foreground tracking-wider block">
            Styl naklejki
          </label>
          <select
            id="ai-style-select"
            value={selectedStyleId}
            onChange={(e) => setSelectedStyleId(e.target.value)}
            disabled={isGenerating || isUploadingReference}
            className="flex h-12 w-full rounded-xl border border-slate-200 dark:border-border/70 bg-background px-4 py-2 text-sm font-semibold focus-visible:outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20 disabled:opacity-50 shadow-none cursor-pointer"
          >
            {STYLES.map((style) => (
              <option key={style.id} value={style.id}>
                {style.label}
              </option>
            ))}
          </select>
        </div>

        {error && (
          <div className="bg-destructive/40 border border-destructive/60 text-destructive-foreground p-4 rounded-xl font-bold">
            {error}
          </div>
        )}

        <AnimatePresence mode="wait">
          {isGenerating && (
            <motion.div
              key="generating"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="w-full aspect-square bg-secondary/10 border-2 border-secondary/30 rounded-[2rem] flex flex-col items-center justify-center gap-4 text-foreground"
            >
              <motion.div
                animate={{ y: [0, -15, 0], rotate: [0, 5, -5, 0] }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                <Bot className="w-24 h-24 text-secondary" />
              </motion.div>
              <p className="font-extrabold text-xl">
                {attachedImage ? "Przekształcamy zdjęcie..." : "Mieszamy kolory..."}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Result Preview Modal */}
      <AnimatePresence>
        {isMounted && previewUrl && createPortal(
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-foreground/30 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={(e) => {
              if (e.target === e.currentTarget) setPreviewUrl(null);
            }}
          >
            <motion.div
              initial={{ scale: 0.92, opacity: 0, y: 16 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.92, opacity: 0, y: 16 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
              className="bg-card border border-border/80 rounded-3xl w-full max-w-lg p-6 flex flex-col items-center gap-5 shadow-[0_20px_60px_rgba(0,0,0,0.08)] relative"
            >
              {/* Close */}
              <button
                onClick={() => setPreviewUrl(null)}
                className="absolute top-4 right-4 p-1.5 rounded-full border border-border hover:bg-muted/50 transition-colors"
              >
                <X className="w-4 h-4 text-foreground" />
              </button>

              {/* Header */}
              <div className="flex items-center gap-2 self-start">
                <Sparkles className="w-5 h-5 text-primary" />
                <h3 className="text-lg font-extrabold text-foreground">
                  Gotowe!
                </h3>
              </div>

              {/* Generated sticker — always full size */}
              <div className="w-full aspect-square rounded-2xl overflow-hidden border border-border/60 bg-white shadow-sm">
                <img
                  src={previewUrl!}
                  alt="Wygenerowana naklejka"
                  className="w-full h-full object-contain"
                />
              </div>

              {/* Actions */}
              <div className="grid grid-cols-3 gap-2 w-full">
                <button
                  onClick={handleRegenerate}
                  disabled={isGenerating}
                  className="inline-flex items-center justify-center gap-1.5 rounded-xl text-sm font-bold bg-muted text-muted-foreground hover:bg-muted/80 h-12 transition-all active:scale-[0.98] disabled:opacity-50"
                >
                  <RefreshCw className="w-4 h-4" />
                  Generuj
                </button>
                <button
                  onClick={handleOpenCrop}
                  disabled={isGenerating}
                  className="inline-flex items-center justify-center gap-1.5 rounded-xl text-sm font-bold bg-muted text-foreground hover:bg-muted/80 h-12 transition-all active:scale-[0.98] disabled:opacity-50"
                >
                  <Crop className="w-4 h-4" />
                  Kadruj
                </button>
                <button
                  onClick={handleAccept}
                  className="inline-flex items-center justify-center gap-1.5 rounded-xl text-sm font-bold bg-primary text-primary-foreground hover:bg-primary/95 h-12 shadow-sm transition-all active:scale-[0.98] disabled:opacity-50"
                >
                  <Check className="w-4 h-4" />
                  Użyj tej!
                </button>
              </div>
            </motion.div>
          </motion.div>,
          document.body
        )}
      </AnimatePresence>

      {/* Sticker Edit/Crop Modal for generated result */}
      <AnimatePresence>
        {showCropModal && cropBlobSrc && (
          <StickerEditModal
            imageSrc={cropBlobSrc}
            onSave={handleCropComplete}
            onCancel={handleCropCancel}
          />
        )}
      </AnimatePresence>

      {/* Sticker Edit/Crop Modal for photo attachment (pre-generation) */}
      <AnimatePresence>
        {pendingAttachUrl && (
          <StickerEditModal
            imageSrc={pendingAttachUrl}
            onSave={handleAttachEditComplete}
            onCancel={handleAttachEditCancel}
          />
        )}
      </AnimatePresence>
    </>
  );
}
