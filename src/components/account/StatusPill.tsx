import type { StatusTone } from "@/lib/orders/status";

const TONES: Record<StatusTone, string> = {
  success: "bg-primary/12 text-primary border-primary/30",
  warning: "bg-[#FFCD08]/15 text-[#8a6d00] dark:text-[#FFCD08] border-[#FFCD08]/40",
  danger: "bg-destructive/12 text-destructive border-destructive/30",
  info: "bg-secondary/15 text-secondary border-secondary/35",
  neutral: "bg-muted/60 text-muted-foreground border-border/60",
};

export function StatusPill({
  tone,
  children,
  className = "",
}: {
  tone: StatusTone;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-extrabold whitespace-nowrap ${TONES[tone]} ${className}`}
    >
      {children}
    </span>
  );
}
