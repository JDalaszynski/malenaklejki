"use client";

import { getUUID } from "@/lib/uuid";
import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { UploadCloud, Loader2 } from "lucide-react";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { motion } from "framer-motion";
import { storage } from "@/lib/firebase/client";

interface ImageUploaderProps {
  onImageUploaded: (url: string) => void;
}

export function ImageUploader({ onImageUploaded }: ImageUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (!file) return;

      setIsUploading(true);
      setError(null);

      try {
        const ext = file.name.split(".").pop() || "png";
        const fileName = `${getUUID()}.${ext}`;
        const storageRef = ref(storage, `uploads/${fileName}`);

        const snapshot = await uploadBytes(storageRef, file);
        const downloadUrl = await getDownloadURL(snapshot.ref);

        onImageUploaded(downloadUrl);
      } catch (err) {
        console.error("Upload error:", err);
        setError("Wystąpił błąd podczas przesyłania pliku.");
      } finally {
        setIsUploading(false);
      }
    },
    [onImageUploaded]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/jpeg": [".jpeg", ".jpg"],
      "image/png": [".png"],
    },
    maxSize: 10 * 1024 * 1024, // 10MB
    multiple: false,
  });

  return (
    <motion.div
      whileHover={!isUploading ? { scale: 1.01 } : {}}
      whileTap={!isUploading ? { scale: 0.99 } : {}}
      {...(getRootProps() as any)}
      className={`border-2 border-dashed rounded-3xl w-full aspect-square max-h-[400px] flex flex-col items-center justify-center cursor-pointer transition-all ${isDragActive
          ? "border-primary bg-primary/5 shadow-sm scale-102"
          : "border-border bg-muted/15 hover:border-primary/40 hover:bg-muted/30"
        }`}
    >
      <input {...getInputProps()} />
      {isUploading ? (
        <div className="flex flex-col items-center gap-4 text-primary">
          <Loader2 className="w-16 h-16 animate-spin" />
          <p className="text-xl font-extrabold">Dodawanie na arkusz...</p>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-4 text-center px-6">
          <motion.div
            animate={isDragActive ? { y: [0, -10, 0] } : {}}
            transition={{ repeat: Infinity, duration: 1 }}
          >
            {isDragActive ? (
              <UploadCloud className="w-20 h-20 text-primary" />
            ) : (
              <UploadCloud className="w-20 h-20 text-muted-foreground opacity-50" />
            )}
          </motion.div>
          <p className="text-xl font-extrabold text-foreground">
            {isDragActive
              ? "Upuść plik tutaj!"
              : "Przeciągnij zdjęcie albo kliknij tutaj"}
          </p>
          <p className="text-sm font-bold text-muted-foreground opacity-70">PNG lub JPG (max 10MB)</p>
        </div>
      )}
      {error && <p className="mt-4 text-base font-bold text-destructive-foreground bg-destructive border border-foreground/10 px-4 py-2 rounded-xl shadow-sm">{error}</p>}
    </motion.div>
  );
}
