"use client";

import { useState } from "react";
import { ImageUploader } from "./ImageUploader";
import { AIGenerator } from "./AIGenerator";
import { A4Visualizer } from "./A4Visualizer";
import { UploadCloud, Wand2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface CreatorFlowProps {
  imageUrl: string | null;
  setImageUrl: (url: string | null) => void;
}

export function CreatorFlow({ imageUrl, setImageUrl }: CreatorFlowProps) {
  const [method, setMethod] = useState<"upload" | "ai">("upload");

  const handleReset = () => {
    setImageUrl(null);
  };

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col items-center">
      <AnimatePresence mode="wait">
        {!imageUrl ? (
          <motion.div
            key="creator"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="w-full space-y-6 bg-card border border-border/60 rounded-3xl p-6 sm:p-10 shadow-[0_12px_40px_rgba(0,0,0,0.02)]"
          >
            <div className="flex bg-muted/50 p-2 rounded-full w-full max-w-md mx-auto mb-8 border border-border/40">
              <button
                onClick={() => setMethod("upload")}
                className={`relative flex-1 flex items-center justify-center py-3 text-sm font-bold rounded-full transition-colors z-10 ${method === "upload"
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
                  }`}
              >
                {method === "upload" && (
                  <motion.div
                    layoutId="pill"
                    className="absolute inset-0 bg-background rounded-full shadow-sm border border-border/30"
                    style={{ zIndex: -1 }}
                    transition={{ type: "spring", bounce: 0.2, duration: 0.5 }}
                  />
                )}
                <UploadCloud className="w-5 h-5 mr-2" />
                Wgraj plik
              </button>
              <button
                onClick={() => setMethod("ai")}
                className={`relative flex-1 flex items-center justify-center py-3 text-sm font-bold rounded-full transition-colors z-10 ${method === "ai"
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
                  }`}
              >
                {method === "ai" && (
                  <motion.div
                    layoutId="pill"
                    className="absolute inset-0 bg-background rounded-full shadow-sm border border-border/30"
                    style={{ zIndex: -1 }}
                    transition={{ type: "spring", bounce: 0.2, duration: 0.5 }}
                  />
                )}
                <Wand2 className="w-5 h-5 mr-2" />
                Stwórz Naklejkę
              </button>
            </div>

            <div className="flex-1 w-full flex flex-col items-center justify-center min-h-[300px]">
              <AnimatePresence mode="wait">
                <motion.div
                  key={method}
                  initial={{ opacity: 0, x: method === "upload" ? -20 : 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: method === "upload" ? 20 : -20 }}
                  transition={{ duration: 0.2 }}
                  className="w-full flex justify-center"
                >
                  {method === "upload" ? (
                    <ImageUploader onImageUploaded={setImageUrl} />
                  ) : (
                    <div className="w-full max-w-md">
                      <AIGenerator onImageGenerated={setImageUrl} />
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="visualizer"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full flex flex-col items-center"
          >
            <A4Visualizer imageUrl={imageUrl} onImageChange={setImageUrl} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
