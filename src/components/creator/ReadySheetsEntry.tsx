"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { ChevronRight, Eye, LayoutGrid } from "lucide-react";

import { useSessionUser } from "@/hooks/useSessionUser";
import { loadReadySheets } from "@/lib/sheets/client";
import {
  toReadySheetsTeaser,
  type HomeReadySheets,
  type ReadySheetsTeaser,
} from "@/lib/sheets/types";
import { getDesignsNoun } from "@/lib/utils/polish";

/**
 * Zapowiedź gotowych arkuszy dla kreatora.
 *
 * Przy włączonym trybie przychodzi razem ze stroną, więc wejście do galerii
 * rysuje się od razu, bez dopytywania serwera i bez przesuwania układu.
 * W trybie podglądu strona nie niesie nic — o listę pyta dopiero przeglądarka
 * zalogowanego administratora, a zwykły klient nie wysyła żadnego żądania.
 */
export function useReadySheetsTeaser(home: HomeReadySheets): ReadySheetsTeaser | null {
  const session = useSessionUser();
  const isAdmin = home.state === "preview" && !!session.user?.isAdmin;
  const [previewTeaser, setPreviewTeaser] = useState<ReadySheetsTeaser | null>(null);

  useEffect(() => {
    if (!isAdmin) return;
    let cancelled = false;
    loadReadySheets()
      .then((data) => {
        if (cancelled || data.sheets.length === 0) return;
        setPreviewTeaser(toReadySheetsTeaser(data.sheets, data.categories, data.preview));
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [isAdmin]);

  if (home.state === "on") return home.teaser;
  return isAdmin ? previewTeaser : null;
}

/**
 * Podgląd arkusza przez optymalizator obrazów: zamiast JPEG-a 720 px z panelu
 * przeglądarka dostaje WebP w rozmiarze, w jakim go rysuje. Gdyby
 * optymalizator odmówił, pokazujemy plik źródłowy.
 */
export function SheetPreviewImage({
  src,
  sizes,
  eager = false,
}: {
  src: string;
  sizes: string;
  eager?: boolean;
}) {
  const [raw, setRaw] = useState(false);
  return (
    <Image
      src={src}
      alt=""
      fill
      sizes={sizes}
      unoptimized={raw}
      loading={eager ? "eager" : "lazy"}
      draggable={false}
      onError={() => setRaw(true)}
      className="object-cover select-none"
    />
  );
}

const FAN_SLOTS = [
  "left-0 top-1 -rotate-[9deg]",
  "left-[0.8rem] top-0 z-10",
  "left-[1.6rem] top-1 rotate-[9deg]",
];

/** Wachlarz miniaturowych arkuszy — znak rozpoznawczy wejścia do galerii. */
function SheetFan({ thumbs }: { thumbs: string[] }) {
  if (thumbs.length === 0) {
    return (
      <span
        aria-hidden
        className="shrink-0 w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center"
      >
        <LayoutGrid className="w-5 h-5 text-primary" />
      </span>
    );
  }

  // Jeden arkusz stoi prosto na środku; dwa i trzy rozkładają się w wachlarz.
  const slots = thumbs.length === 1 ? [FAN_SLOTS[1]] : FAN_SLOTS.slice(0, thumbs.length);

  return (
    <span aria-hidden className="relative block shrink-0 w-[3.6rem] h-[3.1rem]">
      {slots.map((slot, index) => (
        <span
          key={thumbs[index]}
          className={`absolute ${slot} block w-8 aspect-[210/297] rounded-[3px] bg-white border border-[#004749]/15 shadow-[0_2px_6px_rgba(0,71,73,0.16)] overflow-hidden transition-transform duration-200 group-hover:-translate-y-0.5`}
        >
          <SheetPreviewImage src={thumbs[index]} sizes="32px" />
        </span>
      ))}
    </span>
  );
}

/**
 * Wejście do galerii gotowych arkuszy. Celowo skromne: gotowe arkusze są
 * dodatkiem do kreatora, więc stoją obok „Dodaj naklejkę", a nie przed nią.
 */
export function ReadySheetsEntry({
  teaser,
  activeName,
  onOpen,
  onIntent,
  className = "",
}: {
  teaser: ReadySheetsTeaser;
  /** Nazwa gotowego arkusza leżącego teraz w kreatorze. */
  activeName: string | null;
  onOpen: () => void;
  /** Najechanie albo dotknięcie — dobry moment, żeby zacząć pobierać galerię. */
  onIntent: () => void;
  className?: string;
}) {
  const categories = teaser.categories.slice(0, 3).join(", ");

  return (
    <button
      type="button"
      onClick={onOpen}
      onPointerEnter={onIntent}
      onFocus={onIntent}
      aria-haspopup="dialog"
      className={`group flex items-center gap-3 rounded-2xl border border-border/60 bg-background/70 hover:bg-background hover:border-primary/45 px-3 py-2.5 text-left transition-all active:scale-[0.99] cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 ${className}`}
    >
      <SheetFan thumbs={teaser.thumbs} />
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-2 text-sm font-extrabold text-foreground">
          Gotowe arkusze
          {teaser.preview && (
            <span className="inline-flex items-center gap-1 rounded-full border border-[#FFCD08]/50 bg-[#FFCD08]/15 px-1.5 py-0.5 text-[10px] font-extrabold text-[#8a6d00] dark:text-[#FFCD08]">
              <Eye className="w-3 h-3" aria-hidden />
              Podgląd
            </span>
          )}
        </span>
        <span className="block text-[11px] font-semibold text-muted-foreground truncate mt-0.5">
          {activeName
            ? `Na arkuszu: ${activeName}`
            : `${teaser.count} ${getDesignsNoun(teaser.count)} do edycji${categories ? ` · ${categories}` : ""}`}
        </span>
      </span>
      <ChevronRight
        className="w-4 h-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary"
        aria-hidden
      />
    </button>
  );
}
