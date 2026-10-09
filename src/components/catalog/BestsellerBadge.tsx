import { Star } from "lucide-react";

const SIZES = {
  sm: "text-[10px] pl-1.5 pr-2 py-0.5",
  md: "text-[11px] pl-2 pr-2.5 py-1",
  /** Obok pigułek tematów na stronie zestawu. */
  lg: "text-xs pl-2.5 pr-3 py-1 uppercase tracking-wide",
};

/** Oznaczenie zestawu wybranego w panelu jako bestseller — galeria kreatora i katalog. */
export function BestsellerBadge({
  size = "sm",
  className = "",
}: {
  size?: keyof typeof SIZES;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full bg-[#FFCD08] text-[#004749] font-extrabold ${SIZES[size]} ${className}`}
    >
      <Star className="w-3 h-3 fill-current" aria-hidden />
      Bestseller
    </span>
  );
}
