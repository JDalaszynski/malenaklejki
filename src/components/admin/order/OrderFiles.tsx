"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  ImageOff,
  Loader2,
  Maximize2,
  Scissors,
  Printer,
  X,
  ZoomIn,
  ZoomOut,
} from "lucide-react";

import { DownloadButton } from "./DownloadButton";

export type SheetFile = {
  /** Numer arkusza od 1 — ten sam, co w nazwach plików i w adresie pobierania. */
  number: number;
  imageUrl: string;
  cutLinesImageUrl: string | null;
  quantity: number;
  /** Klient chce naklejki pocięte na sztuki, nie cały arkusz. */
  individual: boolean;
  stickers: number;
  hasLayout: boolean;
  /** Adresy pobrania plików tego arkusza; linie cięcia tylko, gdy arkusz je ma. */
  downloadPrintUrl: string;
  downloadCutUrl: string | null;
};

type View = "print" | "cut";

const VIEW_LABELS: Record<View, string> = { print: "Do druku", cut: "Linie cięcia" };

/** Szachownica pod przezroczystym PNG — biały arkusz i przezroczysty wyglądałyby tak samo. */
const CHECKERBOARD =
  "bg-[#eef3f1] [background-image:conic-gradient(rgba(0,71,73,0.06)_25%,transparent_0_50%,rgba(0,71,73,0.06)_0_75%,transparent_0)] [background-size:20px_20px]";

function pieces(count: number): string {
  return `${count} szt.`;
}

function Thumbnail({ sheet, onOpen }: { sheet: SheetFile; onOpen: () => void }) {
  const [broken, setBroken] = useState(false);

  return (
    <button
      type="button"
      onClick={onOpen}
      aria-label={`Podgląd arkusza ${sheet.number}`}
      className={`group relative shrink-0 w-28 sm:w-32 aspect-[210/297] rounded-xl border border-border/60 overflow-hidden cursor-zoom-in focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 ${CHECKERBOARD}`}
    >
      {broken ? (
        <span className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 p-2 text-center text-[11px] font-bold text-muted-foreground">
          <ImageOff className="w-5 h-5" aria-hidden />
          Brak pliku w magazynie
        </span>
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={sheet.imageUrl}
          alt=""
          loading="lazy"
          decoding="async"
          onError={() => setBroken(true)}
          className="absolute inset-0 w-full h-full object-contain"
        />
      )}
      <span className="absolute inset-0 flex items-center justify-center bg-foreground/0 group-hover:bg-foreground/35 group-focus-visible:bg-foreground/35 transition-colors">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-card/95 text-foreground text-[11px] font-extrabold px-2.5 py-1 opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100 transition-opacity shadow-sm">
          <Maximize2 className="w-3 h-3" aria-hidden />
          Podgląd
        </span>
      </span>
    </button>
  );
}

function FileLine({ icon: Icon, children, ok = true }: { icon: typeof Printer; children: React.ReactNode; ok?: boolean }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 text-xs font-semibold ${
        ok ? "text-foreground" : "text-muted-foreground"
      }`}
    >
      <Icon className={`w-3.5 h-3.5 ${ok ? "text-primary" : ""}`} aria-hidden />
      {children}
    </span>
  );
}

/**
 * Pliki do druku i cięcia: miniatury z podglądem po kliknięciu.
 *
 * Pobieranie jest poza tym komponentem (jeden przycisk w nagłówku karty),
 * a tu zostaje to, co pozwala sprawdzić pliki zanim pójdą do druku: duży
 * podgląd z przełączaniem „do druku / linie cięcia” i przejściem między arkuszami.
 */
export function OrderFiles({ sheets }: { sheets: SheetFile[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [view, setView] = useState<View>("print");
  const [zoomed, setZoomed] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);

  const sheet = openIndex === null ? null : sheets[openIndex];

  const open = (index: number) => {
    setOpenIndex(index);
    setView("print");
    setZoomed(false);
  };

  const close = useCallback(() => {
    setOpenIndex(null);
    setZoomed(false);
  }, []);

  const go = useCallback(
    (step: number) => {
      setOpenIndex((current) => {
        if (current === null) return current;
        return (current + step + sheets.length) % sheets.length;
      });
      setView("print");
      setZoomed(false);
    },
    [sheets.length]
  );

  // Natywny <dialog>: Esc, pułapka fokusu i warstwa nad całą stroną są po stronie przeglądarki.
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (openIndex !== null && !dialog.open) dialog.showModal();
    if (openIndex === null && dialog.open) dialog.close();
  }, [openIndex]);

  useEffect(() => {
    if (openIndex === null) return;
    const previous = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";
    return () => {
      document.documentElement.style.overflow = previous;
    };
  }, [openIndex]);

  useEffect(() => {
    if (openIndex === null || sheets.length < 2) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "ArrowLeft") go(-1);
      if (event.key === "ArrowRight") go(1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [openIndex, sheets.length, go]);

  const src = sheet ? (view === "cut" && sheet.cutLinesImageUrl ? sheet.cutLinesImageUrl : sheet.imageUrl) : "";

  return (
    <>
      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {sheets.map((item, index) => (
          <li
            key={item.number}
            className="flex gap-4 rounded-2xl border border-border/60 bg-muted/15 p-3"
          >
            <Thumbnail sheet={item} onOpen={() => open(index)} />

            <div className="min-w-0 flex flex-col justify-between gap-3 py-0.5">
              <div>
                <p className="font-extrabold text-foreground">Arkusz {item.number}</p>
                <p className="mt-1 flex flex-wrap items-center gap-1.5 text-xs font-bold">
                  <span className="rounded-md bg-primary/10 text-primary border border-primary/25 px-1.5 py-0.5 tabular-nums">
                    {pieces(item.quantity)}
                  </span>
                  {item.individual && (
                    <span className="rounded-md bg-[#FFCD08]/20 text-[#8a6d00] dark:text-[#FFCD08] border border-[#FFCD08]/40 px-1.5 py-0.5">
                      Pocięte na sztuki
                    </span>
                  )}
                </p>
                <p className="mt-1.5 text-xs font-medium text-muted-foreground">
                  {item.stickers > 0 ? `${item.stickers} naklejek na arkuszu` : "Liczba naklejek nieznana"}
                  {item.individual ? "" : " · w całości"}
                  {item.hasLayout ? " · układ zapisany" : ""}
                </p>
              </div>

              <div className="flex flex-col gap-1">
                <FileLine icon={Printer}>Plik do druku</FileLine>
                <FileLine icon={Scissors} ok={Boolean(item.cutLinesImageUrl)}>
                  {item.cutLinesImageUrl ? "Linie cięcia" : "Brak linii cięcia"}
                </FileLine>
              </div>
            </div>
          </li>
        ))}
      </ul>

      <dialog
        ref={dialogRef}
        aria-label={sheet ? `Podgląd arkusza ${sheet.number}` : "Podgląd pliku"}
        onClose={close}
        onClick={(event) => {
          // Kliknięcie w półprzezroczyste tło (sam <dialog>) zamyka podgląd.
          if (event.target === event.currentTarget) close();
        }}
        className="m-0 p-0 w-screen h-screen max-w-none max-h-none bg-[#021f20]/90 text-foreground backdrop:bg-transparent"
      >
        {sheet && (
          <div
            className="flex h-full flex-col"
            onClick={(event) => {
              if (event.target === event.currentTarget) close();
            }}
          >
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 bg-card border-b border-border/70 px-4 py-3 sm:px-6">
              <div className="min-w-0">
                <p className="text-sm font-extrabold">
                  Arkusz {sheet.number}
                  {sheets.length > 1 && (
                    <span className="text-muted-foreground font-bold"> z {sheets.length}</span>
                  )}
                  <span className="text-muted-foreground font-bold"> · {pieces(sheet.quantity)}</span>
                </p>
              </div>

              <div
                role="group"
                aria-label="Który plik pokazać"
                className="inline-flex rounded-xl bg-muted/60 p-1 gap-1"
              >
                {(["print", "cut"] as const).map((option) => {
                  const available = option === "print" || Boolean(sheet.cutLinesImageUrl);
                  const active = view === option;
                  return (
                    <button
                      key={option}
                      type="button"
                      disabled={!available}
                      aria-pressed={active}
                      onClick={() => {
                        setView(option);
                        setZoomed(false);
                      }}
                      title={available ? undefined : "Ten arkusz nie ma osobnej wersji z liniami cięcia"}
                      className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-extrabold transition-colors cursor-pointer disabled:cursor-not-allowed disabled:opacity-40 ${
                        active
                          ? "bg-card text-foreground shadow-sm"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {option === "print" ? (
                        <Printer className="w-3.5 h-3.5" aria-hidden />
                      ) : (
                        <Scissors className="w-3.5 h-3.5" aria-hidden />
                      )}
                      {VIEW_LABELS[option]}
                    </button>
                  );
                })}
              </div>

              <div className="ml-auto flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setZoomed((value) => !value)}
                  className="hidden sm:inline-flex items-center gap-1.5 rounded-xl border border-border/70 bg-card hover:bg-muted/50 text-xs font-bold h-9 px-3 transition-colors cursor-pointer"
                >
                  {zoomed ? (
                    <ZoomOut className="w-4 h-4" aria-hidden />
                  ) : (
                    <ZoomIn className="w-4 h-4" aria-hidden />
                  )}
                  {zoomed ? "Dopasuj do ekranu" : "Pełna rozdzielczość"}
                </button>
                <DownloadButton
                  href={sheet.downloadPrintUrl}
                  label="Pobierz do druku"
                  size="sm"
                  title="Pobierz plik do druku tego arkusza"
                />
                {sheet.downloadCutUrl && (
                  <DownloadButton
                    href={sheet.downloadCutUrl}
                    label="Pobierz linie cięcia"
                    variant="outline"
                    size="sm"
                    title="Pobierz plik z liniami cięcia tego arkusza"
                  />
                )}
                <button
                  type="button"
                  onClick={close}
                  aria-label="Zamknij podgląd"
                  className="inline-flex items-center justify-center w-9 h-9 rounded-xl border border-border/70 bg-card hover:bg-muted/50 transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" aria-hidden />
                </button>
              </div>
            </div>

            <div
              className={`relative flex-1 min-h-0 overflow-auto p-4 sm:p-6 flex ${
                zoomed ? "items-start justify-start" : "items-center justify-center"
              }`}
              onClick={(event) => {
                if (event.target === event.currentTarget) close();
              }}
            >
              <PreviewImage
                key={src}
                src={src}
                alt={`Arkusz ${sheet.number} — ${VIEW_LABELS[view].toLowerCase()}`}
                zoomed={zoomed}
                onToggleZoom={() => setZoomed((value) => !value)}
              />

              {sheets.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={() => go(-1)}
                    aria-label="Poprzedni arkusz"
                    className="fixed left-3 sm:left-5 top-1/2 -translate-y-1/2 inline-flex items-center justify-center w-11 h-11 rounded-full bg-card/95 border border-border/70 shadow-lg hover:bg-card transition-colors cursor-pointer"
                  >
                    <ChevronLeft className="w-5 h-5" aria-hidden />
                  </button>
                  <button
                    type="button"
                    onClick={() => go(1)}
                    aria-label="Następny arkusz"
                    className="fixed right-3 sm:right-5 top-1/2 -translate-y-1/2 inline-flex items-center justify-center w-11 h-11 rounded-full bg-card/95 border border-border/70 shadow-lg hover:bg-card transition-colors cursor-pointer"
                  >
                    <ChevronRight className="w-5 h-5" aria-hidden />
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </dialog>
    </>
  );
}

/** Duży podgląd z wskaźnikiem wczytywania — arkusz do druku ma po kilka megabajtów. */
function PreviewImage({
  src,
  alt,
  zoomed,
  onToggleZoom,
}: {
  src: string;
  alt: string;
  zoomed: boolean;
  onToggleZoom: () => void;
}) {
  const [state, setState] = useState<"loading" | "ready" | "error">("loading");

  return (
    <>
      {state === "loading" && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <span className="inline-flex items-center gap-2 rounded-full bg-card/95 px-4 py-2 text-sm font-bold shadow-lg">
            <Loader2 className="w-4 h-4 animate-spin" aria-hidden />
            Wczytuję plik…
          </span>
        </div>
      )}

      {state === "error" ? (
        <div className="m-auto max-w-sm rounded-2xl bg-card p-6 text-center shadow-xl">
          <ImageOff className="w-8 h-8 mx-auto text-muted-foreground" aria-hidden />
          <p className="mt-3 font-extrabold">Nie udało się wczytać pliku</p>
          <p className="mt-1 text-sm font-medium text-muted-foreground">
            Sklep usuwa pliki projektów 30 dni po realizacji zamówienia — przy starszych zamówieniach
            ich już nie ma.
          </p>
        </div>
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={alt}
          onLoad={() => setState("ready")}
          onError={() => setState("error")}
          onClick={onToggleZoom}
          draggable={false}
          className={`rounded-lg shadow-2xl ${CHECKERBOARD} ${
            zoomed
              ? "max-w-none w-auto h-auto cursor-zoom-out"
              : "max-w-full max-h-full object-contain cursor-zoom-in"
          } ${state === "ready" ? "" : "invisible"}`}
        />
      )}
    </>
  );
}
