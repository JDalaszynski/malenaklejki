"use client";

import { getDownloadURL, ref, uploadBytes } from "firebase/storage";

import {
  createLibrarySticker,
  findLibraryStickerByFileHash,
} from "@/app/actions/sheets";
import { storage } from "@/lib/firebase/client";
import { getUUID } from "@/lib/uuid";
import type { CutLineType, LibrarySticker } from "./types";

/**
 * Wgrywanie grafik do bazy naklejek z przeglądarki.
 *
 * Pliki idą do `uploads/` tą samą drogą co w kreatorze (reguły Storage
 * przyjmują tam obrazy do 10 MB), a do Firestore trafia tylko wpis z adresem —
 * przez akcję serwerową, która sprawdza uprawnienia administratora.
 */

export const MAX_IMAGE_BYTES = 10 * 1024 * 1024;
const THUMB_LONG_SIDE_PX = 320;

export async function sha256Hex(blob: Blob): Promise<string | null> {
  try {
    const digest = await crypto.subtle.digest("SHA-256", await blob.arrayBuffer());
    return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
  } catch {
    // crypto.subtle działa tylko w bezpiecznym kontekście — bez niego po prostu nie deduplikujemy.
    return null;
  }
}

function loadImage(src: string, crossOrigin = false): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    if (crossOrigin) img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Nie udało się wczytać grafiki."));
    img.src = src;
  });
}

/** Grafika z magazynu, wczytana tak, żeby dało się ją narysować na płótnie. */
function loadRemoteImage(url: string): Promise<HTMLImageElement> {
  const src =
    url.startsWith("blob:") || url.startsWith("data:")
      ? url
      : `/api/proxy-image?url=${encodeURIComponent(url)}`;
  return loadImage(src, true);
}

function thumbnailBlob(img: HTMLImageElement): Promise<Blob | null> {
  const width = img.naturalWidth || img.width;
  const height = img.naturalHeight || img.height;
  if (!width || !height) return Promise.resolve(null);

  const scale = Math.min(1, THUMB_LONG_SIDE_PX / Math.max(width, height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(width * scale));
  canvas.height = Math.max(1, Math.round(height * scale));
  const ctx = canvas.getContext("2d");
  if (!ctx) return Promise.resolve(null);
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

  // WebP trzyma przezroczystość i waży ułamek PNG. Safari potrafi go nie
  // zakodować i oddaje wtedy PNG — typ bierzemy z tego, co faktycznie wyszło.
  return new Promise((resolve) => canvas.toBlob((blob) => resolve(blob), "image/webp", 0.86));
}

async function uploadBlob(blob: Blob, fileName: string): Promise<string> {
  const dateFolder = new Date().toISOString().split("T")[0];
  const storageRef = ref(storage, `uploads/${dateFolder}/${fileName}`);
  const snapshot = await uploadBytes(storageRef, blob, { contentType: blob.type || "image/png" });
  return getDownloadURL(snapshot.ref);
}

async function uploadThumbnail(img: HTMLImageElement): Promise<string | null> {
  try {
    const blob = await thumbnailBlob(img);
    if (!blob) return null;
    const extension = blob.type === "image/webp" ? "webp" : "png";
    return await uploadBlob(blob, `naklejka-miniatura-${getUUID()}.${extension}`);
  } catch (error) {
    // Bez miniatury lista pokaże oryginał — wolniej, ale poprawnie.
    console.warn("Miniatura naklejki:", error);
    return null;
  }
}

export type AddToLibraryResult =
  | { ok: true; sticker: LibrarySticker; existing: boolean }
  | { ok: false; error: string };

/**
 * Plik (albo wyrenderowana strona PDF) do bazy. Ta sama grafika wgrana
 * ponownie nie tworzy drugiej pozycji — dostajemy istniejącą.
 */
export async function addBlobToLibrary(options: {
  blob: Blob;
  fileName: string;
  name: string;
  cutLineType: CutLineType;
  widthCm: number;
}): Promise<AddToLibraryResult> {
  const { blob } = options;
  const hash = await sha256Hex(blob);

  if (hash) {
    const lookup = await findLibraryStickerByFileHash(hash);
    if (!lookup.success) return { ok: false, error: lookup.error };
    if (lookup.sticker) return { ok: true, sticker: lookup.sticker, existing: true };
  }

  const localUrl = URL.createObjectURL(blob);
  let img: HTMLImageElement;
  try {
    img = await loadImage(localUrl);
  } catch {
    URL.revokeObjectURL(localUrl);
    return { ok: false, error: `Nie udało się odczytać grafiki „${options.fileName}".` };
  }

  try {
    const safeName = options.fileName.replace(/[^a-zA-Z0-9._-]+/g, "-").slice(-80);
    const [imageUrl, thumbUrl] = await Promise.all([
      uploadBlob(blob, `naklejka-baza-${getUUID()}-${safeName}`),
      uploadThumbnail(img),
    ]);

    const width = img.naturalWidth || img.width;
    const height = img.naturalHeight || img.height;
    const created = await createLibrarySticker({
      name: options.name,
      imageUrl,
      thumbUrl,
      aspectRatio: width / height,
      pixelWidth: width || null,
      pixelHeight: height || null,
      widthCm: options.widthCm,
      cutLineType: options.cutLineType,
      hash,
    });
    if (!created.success) return { ok: false, error: created.error };
    return { ok: true, sticker: created.sticker, existing: created.existing };
  } catch (error) {
    console.error(error);
    return { ok: false, error: `Nie udało się wgrać „${options.fileName}".` };
  } finally {
    URL.revokeObjectURL(localUrl);
  }
}

/**
 * Grafika, która już jest w magazynie — np. po kadrowaniu albo usunięciu tła,
 * gdzie okno edycji samo wgrywa wynik i oddaje tylko adres.
 */
export async function addUrlToLibrary(options: {
  imageUrl: string;
  name: string;
  cutLineType: CutLineType;
  widthCm: number;
}): Promise<AddToLibraryResult> {
  let img: HTMLImageElement;
  try {
    img = await loadRemoteImage(options.imageUrl);
  } catch {
    return { ok: false, error: "Nie udało się odczytać grafiki naklejki." };
  }

  const thumbUrl = await uploadThumbnail(img);
  const width = img.naturalWidth || img.width;
  const height = img.naturalHeight || img.height;
  const created = await createLibrarySticker({
    name: options.name,
    imageUrl: options.imageUrl,
    thumbUrl,
    aspectRatio: width / height,
    pixelWidth: width || null,
    pixelHeight: height || null,
    widthCm: options.widthCm,
    cutLineType: options.cutLineType,
    hash: null,
  });
  if (!created.success) return { ok: false, error: created.error };
  return { ok: true, sticker: created.sticker, existing: created.existing };
}

/* ------------------------------------------------------------------ */
/* Pliki arkusza przygotowywane przy publikacji                        */
/* ------------------------------------------------------------------ */

function canvasBlob(canvas: HTMLCanvasElement, type: string, quality?: number): Promise<Blob> {
  return new Promise((resolve, reject) =>
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("Nie udało się wyeksportować arkusza."))),
      type,
      quality
    )
  );
}

/**
 * PNG arkusza tak samo, jak robi to kreator przy „Dodaj do koszyka": najpierw
 * kompresja na serwerze, a gdy ta zawiedzie (np. za duże żądanie) — plik
 * prosto z płótna.
 */
async function sheetPngBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  try {
    const response = await fetch("/api/compress-png", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ image: canvas.toDataURL("image/png") }),
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.blob();
  } catch (error) {
    console.warn("Kompresja PNG na serwerze nie powiodła się, wgrywam plik z płótna:", error);
    return canvasBlob(canvas, "image/png");
  }
}

export type SheetAssets = {
  productImageUrl: string;
  printUrl: string;
  cutLinesUrl: string;
};

/**
 * Komplet plików opublikowanego arkusza: obraz produktu na stronę w sklepie
 * oraz plik do druku i plik linii cięcia — te same, które powstają w kreatorze
 * przy dodawaniu do koszyka. Dzięki nim gotowy arkusz trafia do koszyka prosto
 * ze strony produktu, bez składania go w przeglądarce klienta.
 */
export async function uploadSheetAssets(canvases: {
  product: HTMLCanvasElement;
  print: HTMLCanvasElement;
  cutLines: HTMLCanvasElement;
}): Promise<SheetAssets> {
  const [product, print, cutLines] = await Promise.all([
    canvasBlob(canvases.product, "image/jpeg", 0.9),
    sheetPngBlob(canvases.print),
    sheetPngBlob(canvases.cutLines),
  ]);

  const [productImageUrl, printUrl, cutLinesUrl] = await Promise.all([
    uploadBlob(product, `gotowy-arkusz-produkt-${getUUID()}.jpg`),
    uploadBlob(print, `gotowy-arkusz-druk-${getUUID()}.png`),
    uploadBlob(cutLines, `gotowy-arkusz-linie-${getUUID()}.png`),
  ]);
  return { productImageUrl, printUrl, cutLinesUrl };
}
