import type { LibrarySticker } from "@/lib/sheets/types";

/**
 * Miniatura naklejki na drobnej szachownicy — przezroczyste tło grafiki
 * widać od razu, a to ono decyduje, czy kontur ma po czym biec.
 */
export function StickerThumb({
  sticker,
  className = "",
  imageClassName = "",
}: {
  sticker: Pick<LibrarySticker, "imageUrl" | "thumbUrl" | "name">;
  className?: string;
  imageClassName?: string;
}) {
  return (
    <div
      className={`relative flex items-center justify-center overflow-hidden rounded-xl border border-border/50 bg-white bg-[linear-gradient(45deg,#f1f5f9_25%,transparent_25%,transparent_75%,#f1f5f9_75%),linear-gradient(45deg,#f1f5f9_25%,transparent_25%,transparent_75%,#f1f5f9_75%)] [background-size:12px_12px] [background-position:0_0,6px_6px] ${className}`}
    >
      {/* eslint-disable-next-line @next/next/no-img-element -- adresy z tokenem Storage, bez optymalizacji Next */}
      <img
        src={sticker.thumbUrl || sticker.imageUrl}
        alt={sticker.name}
        loading="lazy"
        draggable={false}
        className={`max-w-full max-h-full object-contain select-none ${imageClassName}`}
      />
    </div>
  );
}
