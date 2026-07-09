"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X, Wand2, Sparkles, Check, ChevronDown } from "lucide-react";
import { generateStickerImage } from "@/app/actions/generateImage";

const STYLES = [
  { id: "default", label: "Domyślny", suffix: "" },
  { id: "monochrome", label: "Monochromatyczny", suffix: ", monochromatic illustration style, single unified color tone, minimalist aesthetic, clean negative space" },
  { id: "riso", label: "Risografia", suffix: ", risograph print style, retro grainy texture, overlapping bold ink colors, misaligned screen-print look" },
  { id: "technicolor", label: "Technikolor", suffix: ", vintage technicolor movie style, high-contrast saturated colors, 1950s cinematic saturation, classic film photo style" },
  { id: "clay", label: "Gotycka plastelina", suffix: ", gothic claymation style, stop-motion clay texture, eerie dark tones, handmade sculpt look, Tim Burton design style" },
  { id: "watercolor", label: "Akwarela", suffix: ", watercolor paint style, soft bleeding pigment washes, wet-on-wet watercolor texture, gentle brush strokes, light artistic paint drops" },
  { id: "sketch", label: "Szkic", suffix: ", hand-drawn pencil sketch, crosshatching pencil shading, paper texture, graphite outline style" },
  { id: "pastel", label: "Pastele", suffix: ", soft pastel color drawing, chalky texture, gentle muted colors, soft lines, dreamy atmosphere" },
  { id: "anime", label: "Anime", suffix: ", modern anime illustration style, clean line art, vibrant cel-shaded colors, studio anime aesthetic" },
  { id: "cartoon", label: "Kreskówka", suffix: ", playful cartoon style, bold outlines, bright solid colors, simple vector cartoon look" },
  { id: "3d", label: "Render 3D", suffix: ", 3D clay render style, smooth octane render look, glossy toy plastic material, cute soft studio lighting" },
  { id: "surreal", label: "Surrealistyczny", suffix: ", surrealist art style, dreamlike bizarre composition, weird fantastical combinations, Salvador Dali aesthetic" },
  { id: "photo", label: "Zdjęcie", suffix: ", realistic photographic style, real-world texture, photorealistic rendering, detailed studio product photo style" },
];

interface AIGeneratorProps {
  onClose: () => void;
  onStickerGenerated: (url: string) => void;
}

export function AIGenerator({ onClose, onStickerGenerated }: AIGeneratorProps) {
  const [mounted, setMounted] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [selectedStyleId, setSelectedStyleId] = useState("default");

  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedUrl, setGeneratedUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setError("Proszę wpisać opis naklejki.");
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const selectedStyle = STYLES.find((s) => s.id === selectedStyleId);
      const fullPrompt = `${prompt}${selectedStyle?.suffix || ""}`;

      const result = await generateStickerImage(fullPrompt);

      if (result.success && result.url) {
        setGeneratedUrl(result.url);
      } else {
        setError(result.error || "Wystąpił nieznany błąd podczas generowania.");
      }
    } catch (err: any) {
      setError(err?.message || "Błąd sieci lub serwera.");
    } finally {
      setIsGenerating(false);
    }
  };

  if (!mounted) return null;

  const renderContent = () => {
    if (isGenerating) {
      return (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="flex flex-col items-center justify-center py-20 gap-6"
        >
          <div className="relative w-24 h-24">
            <div className="absolute inset-0 bg-primary/20 rounded-full animate-ping" />
            <div className="absolute inset-0 bg-primary/10 rounded-full animate-pulse" />
            <div className="absolute inset-0 flex items-center justify-center">
              <Sparkles className="w-10 h-10 text-primary animate-pulse" />
            </div>
          </div>
          <div className="text-center">
            <h3 className="text-xl font-extrabold text-foreground mb-2">Tworzenie naklejki...</h3>
            <p className="text-sm font-semibold text-muted-foreground max-w-xs mx-auto">
              Generuje się naklejka na podstawie Twojego opisu.
            </p>
          </div>
        </motion.div>
      );
    }

    if (generatedUrl) {
      return (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center gap-6"
        >
          <div className="relative w-64 h-64 sm:w-80 sm:h-80 bg-white rounded-3xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] p-4 border border-border/50">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={generatedUrl}
              alt="Wygenerowana naklejka"
              className="w-full h-full object-contain rounded-2xl"
            />
          </div>

          <div className="w-full max-w-sm mt-4 shrink-0">
            <button
              onClick={() => onStickerGenerated(generatedUrl)}
              className="w-full h-12 min-h-[48px] shrink-0 inline-flex items-center justify-center gap-2 rounded-xl text-sm font-bold bg-primary text-primary-foreground hover:bg-primary/95 shadow-lg shadow-primary/20 transition-all active:scale-[0.98] cursor-pointer"
            >
              <Check className="w-4 h-4" />
              Dodaj do arkusza
            </button>
          </div>
        </motion.div>
      );
    }

    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="flex flex-col gap-6"
      >
        {/* Prompt Input */}
        <div className="space-y-3">
          <label className="text-sm font-bold text-foreground">Co chcesz wygenerować?</label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="np. Cool żaba w okularach"
            className="w-full min-h-[100px] bg-muted/30 border border-border/50 rounded-2xl p-4 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none font-medium"
          />
        </div>

        {/* Style Selection */}
        <div className="space-y-3 relative">
          <label className="text-sm font-bold text-foreground">Wybierz styl naklejki</label>
          <div className="relative">
            <select
              value={selectedStyleId}
              onChange={(e) => setSelectedStyleId(e.target.value)}
              className="w-full h-12 px-4 bg-muted/30 border border-border/50 rounded-2xl text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm font-bold cursor-pointer appearance-none hover:bg-muted/40 transition-all pr-10"
            >
              {STYLES.map((style) => (
                <option key={style.id} value={style.id} className="bg-card text-foreground font-bold py-2">
                  {style.label}
                </option>
              ))}
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
              <ChevronDown className="w-4 h-4 text-muted-foreground" />
            </div>
          </div>
        </div>
      </motion.div>
    );
  };

  return createPortal(
    <div className="fixed inset-0 z-[1000] bg-background/30 dark:bg-background/20 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-6">
      {/* Tap outside to close on backdrop area */}
      <div className="absolute inset-0 -z-10" onClick={onClose} />

      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 30, stiffness: 300 }}
        className="bg-card w-full sm:max-w-2xl max-h-[85vh] sm:max-h-[95vh] rounded-t-3xl rounded-b-none sm:rounded-3xl shadow-2xl border-t sm:border border-border/50 flex flex-col overflow-hidden relative"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-border/30 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
              <Wand2 className="w-4 h-4 text-primary" />
            </div>
            <h2 className="text-lg font-black text-foreground">Generator Naklejki</h2>
          </div>
          <button
            onClick={onClose}
            disabled={isGenerating}
            className="p-2 rounded-full hover:bg-muted/50 transition-colors disabled:opacity-50 cursor-pointer"
          >
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-5 sm:p-6 overflow-y-auto shrink overflow-x-hidden relative custom-scrollbar">
          <AnimatePresence mode="wait">
            {error && !isGenerating && !generatedUrl && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-4 bg-destructive/10 text-destructive-foreground p-3 rounded-xl border border-destructive/20 text-sm font-bold flex items-center justify-between"
              >
                <span>{error}</span>
                <button onClick={() => setError(null)} className="p-1 hover:bg-destructive/10 rounded-md cursor-pointer">
                  <X className="w-4 h-4" />
                </button>
              </motion.div>
            )}
            {renderContent()}
          </AnimatePresence>
        </div>

        {/* Footer Actions */}
        {!isGenerating && !generatedUrl && (
          <div className="p-5 border-t border-border/30 shrink-0 flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 h-12 rounded-xl text-sm font-bold bg-muted text-muted-foreground hover:bg-muted/80 transition-all active:scale-[0.98] cursor-pointer"
            >
              Anuluj
            </button>
            <button
              onClick={handleGenerate}
              className="flex-[2] h-12 inline-flex items-center justify-center gap-2 rounded-xl text-sm font-bold bg-primary text-primary-foreground hover:bg-primary/95 shadow-lg shadow-primary/20 transition-all active:scale-[0.98] cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              Generuj Naklejkę
            </button>
          </div>
        )}
      </motion.div>

    </div>,
    document.body
  );
}
