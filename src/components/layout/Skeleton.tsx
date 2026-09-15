import { cn } from "@/lib/utils";

/**
 * Klocki, z których składamy ekrany wczytywania (`loading.tsx`).
 *
 * Konto i panel administratora są w całości dynamiczne — każde wejście czeka
 * na sesję z ciasteczka i na zapytania do Firestore. Bez zastępników
 * przeglądarka trzyma poprzednią stronę do końca tego oczekiwania i klik
 * w menu wygląda, jakby nic nie zrobił.
 *
 * Pulsowanie siedzi na pojedynczym klocku, a nie na wspólnym rodzicu:
 * `animate-pulse` animuje przezroczystość całego poddrzewa, więc na
 * opakowaniu przygasiłoby też nagłówek i menu, które są prawdziwe i klikalne.
 * Wszystkie klocki montują się w tej samej klatce, więc i tak pulsują zgodnie.
 *
 * Kolor bierzemy z `--muted-foreground` (ciemna zieleń w dzień, jasna mięta
 * w nocy) z małą przezroczystością — `--muted` jest prawie biały i na karcie
 * byłby niewidoczny.
 */
export function SkeletonBar({ className }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={cn(
        "block rounded-lg bg-muted-foreground/10 dark:bg-muted-foreground/20 motion-safe:animate-pulse",
        className
      )}
    />
  );
}

/** Pasek w miejscu nagłówka `h1` — dla stron z tytułem zależnym od danych. */
export function SkeletonTitle({ className }: { className?: string }) {
  return <SkeletonBar className={cn("h-9 sm:h-10 w-56 max-w-full", className)} />;
}

/** Pasek w miejscu zdania pod nagłówkiem. */
export function SkeletonSubtitle({ className }: { className?: string }) {
  return <SkeletonBar className={cn("h-6 sm:h-7 w-80 max-w-full", className)} />;
}

/** Kilka linii tekstu — ostatnia krótsza, żeby wyglądało jak akapit. */
export function SkeletonLines({
  count = 3,
  className,
}: {
  count?: number;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-2.5", className)}>
      {Array.from({ length: count }, (_, index) => (
        <SkeletonBar
          key={index}
          className={cn("h-4", index === count - 1 ? "w-2/3" : "w-full")}
        />
      ))}
    </div>
  );
}

/** Etykieta i pole formularza. */
export function SkeletonField({ className }: { className?: string }) {
  return (
    <div className={className}>
      <SkeletonBar className="h-4 w-24 mb-2" />
      <SkeletonBar className="h-12 w-full rounded-xl" />
    </div>
  );
}

/**
 * Opakowanie ekranu wczytywania. Klocki są `aria-hidden`, więc bez tego
 * czytnik ekranu ogłosiłby pustą stronę — komunikat mówi, na co czekamy.
 */
export function SkeletonScreen({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <>
      <p role="status" className="sr-only">
        {label}
      </p>
      {children}
    </>
  );
}
