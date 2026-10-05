"use client";

import { useState } from "react";
import Image from "next/image";

/**
 * Obraz zestawu przez optymalizator obrazów: zamiast JPEG-a z panelu
 * przeglądarka dostaje WebP w rozmiarze, w jakim go rysuje. Gdyby
 * optymalizator odmówił, pokazujemy plik źródłowy.
 */
export function SheetImage({
  src,
  sizes,
  alt = "",
  eager = false,
  hero = false,
}: {
  src: string;
  sizes: string;
  alt?: string;
  eager?: boolean;
  /** Główny obraz strony — ładowany od razu, z wysokim priorytetem. */
  hero?: boolean;
}) {
  const [raw, setRaw] = useState(false);
  return (
    <Image
      src={src}
      alt={alt}
      fill
      sizes={sizes}
      unoptimized={raw}
      loading={hero || eager ? "eager" : "lazy"}
      fetchPriority={hero ? "high" : undefined}
      draggable={false}
      onError={() => setRaw(true)}
      className="object-cover select-none"
    />
  );
}
