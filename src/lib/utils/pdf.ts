"use client";

import type {
  PDFDocumentProxy,
  PDFPageProxy,
} from "pdfjs-dist/legacy/build/pdf.mjs";
import { BG_ALPHA_MAX, BG_WHITE_MIN } from "./imageMask";

/**
 * Pliki PDF w kreatorze.
 *
 * Arkusz składa się z grafik rastrowych, więc stronę PDF zamieniamy w przeglądarce
 * na PNG i dalej traktujemy jak każdy wgrany obrazek (Storage, linia cięcia,
 * wybijanie tła). Oryginalny PDF nigdzie nie trafia - tylko gotowa grafika.
 *
 * PDF różni się od zdjęcia w trzech sprawach:
 *  1. Strona to zwykle cała kartka A4 z niewielkim projektem - przycinamy puste
 *     marginesy, inaczej naklejką byłaby pusta kartka.
 *  2. Wektory da się wyrenderować w dowolnej rozdzielczości - najpierw renderujemy
 *     małą stronę, żeby znaleźć projekt, a potem już sam projekt w jakości druku.
 *  3. PDF zna fizyczny rozmiar - naklejka trafia na arkusz w wymiarach z projektu.
 *
 * Biblioteka pdf.js (~0,5 MB) ładuje się dopiero przy pierwszym pliku PDF. Worker,
 * fonty i dekodery kopiuje do `public/pdfjs/` skrypt `scripts/kopiuj-zasoby-pdfjs.mjs`.
 */

export type { PDFDocumentProxy };

/** PDF nie trafia do Storage, więc limit dotyczy tylko pamięci przeglądarki. */
export const MAX_PDF_BYTES = 50 * 1024 * 1024;

/** Najdłuższy bok podglądu, na którym szukamy projektu na stronie. */
const DETECT_LONG_SIDE_PX = 1200;

/**
 * Najdłuższy bok gotowej grafiki. Arkusz drukujemy w 300 DPI (2480 × 3508 px),
 * a najdłuższy bok naklejki to najwyżej ~27 cm, czyli ~3200 px.
 */
const TARGET_LONG_SIDE_PX = 3000;

/** Limit pikseli płótna - Safari na iOS nie utworzy dużo większego. */
const MAX_RENDER_PIXELS = 9_000_000;

/** Reguły Storage przyjmują pliki poniżej 10 MB. */
const MAX_PNG_BYTES = 9.5 * 1024 * 1024;

/** Zapas wokół przyciętego projektu, żeby nie ściąć wygładzonych krawędzi. */
const TRIM_PADDING_PX = 2;

const PT_TO_CM = 2.54 / 72;

/**
 * Rozmiar naklejki z PDF-u na arkuszu. Projekt trafia w swoich wymiarach, o ile
 * mieści się w polu zadruku z zapasem na linię cięcia (A4 minus marginesy i narożne
 * znaczniki). Większy zmniejszamy do tego pola, a mikroskopijny dostaje domyślną
 * szerokość jak zwykły obrazek.
 */
const MAX_NATIVE_WIDTH_CM = 17;
const MAX_NATIVE_HEIGHT_CM = 25.5;
const MIN_NATIVE_SIDE_CM = 1;
const DEFAULT_WIDTH_CM = 5.25;

export function getPdfStickerWidthCm(widthCm: number, heightCm: number): number {
  if (Math.max(widthCm, heightCm) < MIN_NATIVE_SIDE_CM) return DEFAULT_WIDTH_CM;
  const fit = Math.min(1, MAX_NATIVE_WIDTH_CM / widthCm, MAX_NATIVE_HEIGHT_CM / heightCm);
  return Math.round(widthCm * fit * 100) / 100;
}

export function isPdfFile(file: File): boolean {
  return file.type === "application/pdf" || /\.pdf$/i.test(file.name);
}

export class EmptyPdfPageError extends Error {
  constructor(public pageNumber: number) {
    super(`Strona ${pageNumber} jest pusta`);
    this.name = "EmptyPdfPageError";
  }
}

export function describePdfError(err: unknown): string {
  if (err instanceof EmptyPdfPageError) {
    return `Strona ${err.pageNumber} pliku PDF jest pusta - nie ma na niej nic do wydrukowania.`;
  }
  const name = (err as { name?: string } | null)?.name;
  if (name === "PasswordException") {
    return "Ten plik PDF jest zabezpieczony hasłem. Zapisz go bez hasła i spróbuj ponownie.";
  }
  if (name === "InvalidPDFException") {
    return "Ten plik nie jest poprawnym dokumentem PDF.";
  }
  return "Nie udało się odczytać pliku PDF. Spróbuj zapisać go ponownie albo wyeksportować grafikę jako PNG.";
}

type PdfJs = typeof import("pdfjs-dist/legacy/build/pdf.mjs");
let pdfjsPromise: Promise<PdfJs> | null = null;

// Wersja "legacy" działa też na starszych Safari (iOS 16-17), na których
// nowoczesny build pdf.js się wywraca.
function loadPdfJs(): Promise<PdfJs> {
  if (!pdfjsPromise) {
    pdfjsPromise = import("pdfjs-dist/legacy/build/pdf.mjs").then((pdfjs) => {
      pdfjs.GlobalWorkerOptions.workerSrc = `${assetsBase(pdfjs)}pdf.worker.min.mjs`;
      return pdfjs;
    });
    pdfjsPromise.catch(() => {
      pdfjsPromise = null;
    });
  }
  return pdfjsPromise;
}

function assetsBase(pdfjs: PdfJs): string {
  return `/pdfjs/${pdfjs.version}/`;
}

// Jeden worker na całą sesję kreatora: bez tego każdy plik od nowa pobiera i parsuje
// ~1,3 MB skryptu. Worker przekazany do `getDocument` przeżywa zamknięcie dokumentu.
let sharedWorker: InstanceType<PdfJs["PDFWorker"]> | null = null;

export async function openPdf(file: File): Promise<PDFDocumentProxy> {
  const pdfjs = await loadPdfJs();
  const base = assetsBase(pdfjs);
  if (!sharedWorker || sharedWorker.destroyed) {
    sharedWorker = new pdfjs.PDFWorker();
  }
  return pdfjs.getDocument({
    worker: sharedWorker,
    data: new Uint8Array(await file.arrayBuffer()),
    cMapUrl: `${base}cmaps/`,
    standardFontDataUrl: `${base}standard_fonts/`,
    wasmUrl: `${base}wasm/`,
    iccUrl: `${base}iccs/`,
  }).promise;
}

/** Prostokąt w jednostkach strony (punkty PDF po obrocie strony). */
interface PageBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface PixelBounds {
  left: number;
  top: number;
  right: number;
  bottom: number;
}

function createCanvas(width: number, height: number) {
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(width));
  canvas.height = Math.max(1, Math.round(height));
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Brak pamięci na płótno PDF");
  return { canvas, ctx };
}

/** Safari trzyma pamięć płótna do czasu zbierania śmieci - zwalniamy ją od razu. */
function releaseCanvas(canvas: HTMLCanvasElement) {
  canvas.width = 0;
  canvas.height = 0;
}

async function renderPageBox(
  page: PDFPageProxy,
  scale: number,
  box: PageBox,
  background: string,
): Promise<HTMLCanvasElement> {
  const viewport = page.getViewport({
    scale,
    offsetX: -box.x * scale,
    offsetY: -box.y * scale,
  });
  const { canvas, ctx } = createCanvas(box.width * scale, box.height * scale);
  // Przekazany `canvas` pdf.js otwiera bez kanału alfa, więc tło zawsze wychodziłoby
  // kryjące. Własny kontekst zachowuje przezroczystość strony.
  await page.render({
    canvas: null,
    canvasContext: ctx,
    viewport,
    background,
    intent: "print",
  }).promise;
  return canvas;
}

/**
 * Granice projektu na wyrenderowanej stronie.
 *
 * `ink` = pomijaj też prawie białe piksele. Włączamy go tylko dla stron zamalowanych
 * od krawędzi do krawędzi (Canva, Word z białym tłem) - na stronie bez tła biała
 * obwódka typowa dla naklejek die-cut jest częścią projektu i nie wolno jej ściąć.
 */
function findBounds(canvas: HTMLCanvasElement, ink: boolean): PixelBounds | null {
  const { width: w, height: h } = canvas;
  const data = canvas.getContext("2d")!.getImageData(0, 0, w, h).data;
  let left = w;
  let top = h;
  let right = -1;
  let bottom = -1;

  for (let y = 0; y < h; y++) {
    let row = y * w * 4;
    for (let x = 0; x < w; x++, row += 4) {
      if (data[row + 3] < BG_ALPHA_MAX) continue;
      if (
        ink &&
        data[row] > BG_WHITE_MIN &&
        data[row + 1] > BG_WHITE_MIN &&
        data[row + 2] > BG_WHITE_MIN
      ) {
        continue;
      }
      if (x < left) left = x;
      if (x > right) right = x;
      if (y < top) top = y;
      if (y > bottom) bottom = y;
    }
  }

  return right < 0 ? null : { left, top, right: right + 1, bottom: bottom + 1 };
}

function padBounds(b: PixelBounds, pad: number, w: number, h: number): PixelBounds {
  return {
    left: Math.max(0, b.left - pad),
    top: Math.max(0, b.top - pad),
    right: Math.min(w, b.right + pad),
    bottom: Math.min(h, b.bottom + pad),
  };
}

function toBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) =>
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("Nie udało się zapisać PNG"))),
      "image/png",
    ),
  );
}

/** Zdjęcia w PDF-ach potrafią dać PNG ponad limit Storage - wtedy zmniejszamy grafikę. */
async function encodePngUnderLimit(canvas: HTMLCanvasElement): Promise<Blob> {
  let blob = await toBlob(canvas);
  let factor = 1;
  for (let attempt = 0; attempt < 4 && blob.size > MAX_PNG_BYTES; attempt++) {
    factor *= Math.sqrt(MAX_PNG_BYTES / blob.size) * 0.9;
    const { canvas: smaller, ctx } = createCanvas(
      canvas.width * factor,
      canvas.height * factor,
    );
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(canvas, 0, 0, smaller.width, smaller.height);
    blob = await toBlob(smaller);
    releaseCanvas(smaller);
  }
  if (blob.size > MAX_PNG_BYTES) throw new Error("Grafika z PDF jest za duża");
  return blob;
}

export interface RenderedPdfPage {
  pageNumber: number;
  blob: Blob;
  /** Fizyczne wymiary przyciętego projektu. */
  widthCm: number;
  heightCm: number;
}

/** Zamienia stronę PDF w przyciętą grafikę PNG w jakości druku. */
export async function renderPdfPageForSticker(
  doc: PDFDocumentProxy,
  pageNumber: number,
): Promise<RenderedPdfPage> {
  const page = await doc.getPage(pageNumber);
  const canvases: HTMLCanvasElement[] = [];

  try {
    const full = page.getViewport({ scale: 1 });
    const pageBox: PageBox = { x: 0, y: 0, width: full.width, height: full.height };

    // 1. Mały podgląd z przezroczystym tłem: gdzie na stronie jest projekt?
    const detectScale = DETECT_LONG_SIDE_PX / Math.max(full.width, full.height);
    const preview = await renderPageBox(page, detectScale, pageBox, "transparent");
    canvases.push(preview);

    const painted = findBounds(preview, false);
    if (!painted) throw new EmptyPdfPageError(pageNumber);

    const EDGE_PX = 2;
    const ink =
      painted.left <= EDGE_PX &&
      painted.top <= EDGE_PX &&
      painted.right >= preview.width - EDGE_PX &&
      painted.bottom >= preview.height - EDGE_PX;

    const found = ink ? findBounds(preview, true) : painted;
    if (!found) throw new EmptyPdfPageError(pageNumber);

    // Podgląd jest mało dokładny - bierzemy obszar z zapasem, a dokładnie
    // przycinamy dopiero w pełnej rozdzielczości.
    const rough = padBounds(found, 2, preview.width, preview.height);
    const region: PageBox = {
      x: rough.left / detectScale,
      y: rough.top / detectScale,
      width: (rough.right - rough.left) / detectScale,
      height: (rough.bottom - rough.top) / detectScale,
    };

    // 2. Sam projekt w jakości druku.
    const scale = Math.min(
      TARGET_LONG_SIDE_PX / Math.max(region.width, region.height),
      Math.sqrt(MAX_RENDER_PIXELS / (region.width * region.height)),
    );
    const detailed = await renderPageBox(page, scale, region, "transparent");
    canvases.push(detailed);

    // 3. Dokładne przycięcie.
    const exact = findBounds(detailed, ink);
    if (!exact) throw new EmptyPdfPageError(pageNumber);
    const trim = padBounds(exact, TRIM_PADDING_PX, detailed.width, detailed.height);
    const trimW = trim.right - trim.left;
    const trimH = trim.bottom - trim.top;

    const { canvas: output, ctx } = createCanvas(trimW, trimH);
    canvases.push(output);
    ctx.drawImage(detailed, trim.left, trim.top, trimW, trimH, 0, 0, trimW, trimH);

    return {
      pageNumber,
      blob: await encodePngUnderLimit(output),
      widthCm: (trimW / scale) * PT_TO_CM,
      heightCm: (trimH / scale) * PT_TO_CM,
    };
  } finally {
    canvases.forEach(releaseCanvas);
    page.cleanup();
  }
}

/** Miniatura strony do wyboru (na białym tle, tak jak wygląda kartka). */
export async function renderPdfThumbnail(
  doc: PDFDocumentProxy,
  pageNumber: number,
  longSidePx: number,
): Promise<string> {
  const page = await doc.getPage(pageNumber);
  try {
    const full = page.getViewport({ scale: 1 });
    const scale = longSidePx / Math.max(full.width, full.height);
    const canvas = await renderPageBox(
      page,
      scale,
      { x: 0, y: 0, width: full.width, height: full.height },
      "#ffffff",
    );
    const url = canvas.toDataURL("image/jpeg", 0.85);
    releaseCanvas(canvas);
    return url;
  } finally {
    page.cleanup();
  }
}
