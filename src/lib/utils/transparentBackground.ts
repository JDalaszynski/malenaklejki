"use client";

import { useEffect, useState } from "react";
import { PlacedSticker } from "@/types/creator";
import { BG_WHITE_MIN, computeForegroundMask } from "./imageMask";

/**
 * Wybijanie białego tła do przezroczystości dla naklejek z linią cięcia „kontur".
 *
 * Grafika z białym tłem jest w plikach zawsze prostokątem. Przy konturze linia
 * cięcia biegnie po kształcie grafiki, więc prostokąty sąsiednich naklejek mogą
 * się legalnie na siebie nakładać (kolizje liczone są na wielokątach, nie na
 * ramkach). Bez tego kroku biały prostokąt jednej naklejki zasłaniałby grafikę
 * drugiej — w kreatorze i w gotowym PNG do druku.
 *
 * Maska tła jest ta sama, z której powstaje linia cięcia (`computeForegroundMask`),
 * więc wybite tło kończy się dokładnie tam, gdzie zaczyna się obrys.
 */

/** Powyżej tego progu przeskalowujemy grafikę przed analizą (pamięć przeglądarki). */
const MAX_PIXELS = 8_000_000;

/**
 * Pas wygaszania krawędzi: piksele grafiki stykające się z wybitym tłem, jaśniejsze
 * niż ten próg, to antyaliasing bieli — wygaszamy je proporcjonalnie, żeby po
 * wycięciu nie został biały rąbek.
 */
const FEATHER_MIN = 200;

export function usesContourCut(cutLineType: PlacedSticker["cutLineType"]): boolean {
  return cutLineType === "contour" || cutLineType === "contour_inside";
}

const loadedImages = new Map<string, Promise<HTMLImageElement>>();
/** imageUrl źródłowy -> URL wersji z przezroczystym tłem (lub oryginał, gdy nie ma czego wybijać). */
const transparentUrls = new Map<string, Promise<string>>();

function toLoadableUrl(url: string): string {
  // blob:/data: są już lokalne — proxy tylko by je popsuło.
  if (url.startsWith("blob:") || url.startsWith("data:")) return url;
  if (url.startsWith("/api/")) return url;
  return `/api/proxy-image?url=${encodeURIComponent(url)}`;
}

function loadImage(url: string): Promise<HTMLImageElement> {
  const cached = loadedImages.get(url);
  if (cached) return cached;

  const promise = new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Nie udało się wczytać grafiki: " + url));
    img.src = toLoadableUrl(url);
  });
  promise.catch(() => loadedImages.delete(url));
  loadedImages.set(url, promise);
  return promise;
}

/**
 * Zwraca kopię grafiki z wybitym białym tłem albo `null`, gdy nie było czego
 * wybijać (tło już przezroczyste) lub gdy analiza się nie powiodła.
 */
function stripWhiteBackground(img: HTMLImageElement): HTMLCanvasElement | null {
  const naturalW = img.naturalWidth || img.width;
  const naturalH = img.naturalHeight || img.height;
  if (!naturalW || !naturalH) return null;

  let scale = 1;
  const pixels = naturalW * naturalH;
  if (pixels > MAX_PIXELS) scale = Math.sqrt(MAX_PIXELS / pixels);

  const w = Math.max(1, Math.round(naturalW * scale));
  const h = Math.max(1, Math.round(naturalH * scale));

  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) return null;

  ctx.clearRect(0, 0, w, h);
  ctx.drawImage(img, 0, 0, w, h);

  const imageData = ctx.getImageData(0, 0, w, h);
  const data = imageData.data;
  const fg = computeForegroundMask(data, w, h);

  let removed = 0;
  for (let i = 0; i < fg.length; i++) {
    if (fg[i]) continue;
    const idx = i * 4;
    if (data[idx + 3] !== 0) removed++;
    // Kolor zerujemy razem z alfą, żeby skalowanie i kompresja nie wyciągnęły
    // z powrotem białej poświaty z przezroczystych pikseli.
    data[idx] = 0;
    data[idx + 1] = 0;
    data[idx + 2] = 0;
    data[idx + 3] = 0;
  }

  // Nic nie było białym tłem — grafika ma już przezroczyste tło, zostawiamy oryginał.
  if (removed === 0) return null;

  // Wygaszenie rąbka antyaliasingu: tylko piksele grafiki stykające się z wybitym tłem.
  const feathered = new Uint8ClampedArray(data.length);
  feathered.set(data);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = y * w + x;
      if (!fg[i]) continue;
      const touchesBg =
        (x > 0 && !fg[i - 1]) ||
        (x < w - 1 && !fg[i + 1]) ||
        (y > 0 && !fg[i - w]) ||
        (y < h - 1 && !fg[i + w]);
      if (!touchesBg) continue;

      const idx = i * 4;
      const minC = Math.min(data[idx], data[idx + 1], data[idx + 2]);
      if (minC <= FEATHER_MIN) continue;
      const t = Math.min(1, (minC - FEATHER_MIN) / (BG_WHITE_MIN - FEATHER_MIN));
      feathered[idx + 3] = Math.round(data[idx + 3] * (1 - t));
    }
  }
  imageData.data.set(feathered);

  ctx.putImageData(imageData, 0, 0);
  return canvas;
}

function canvasToObjectUrl(canvas: HTMLCanvasElement): Promise<string> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error("Nie udało się wyeksportować grafiki z wybitym tłem."));
        return;
      }
      resolve(URL.createObjectURL(blob));
    }, "image/png");
  });
}

/**
 * URL grafiki gotowej do wyświetlenia i do druku. Dla konturu: wersja z wybitym
 * białym tłem (liczona raz na grafikę i cache'owana). Dla pozostałych linii cięcia
 * — a także gdy nie ma czego wybijać lub analiza zawiedzie — oryginalny URL, bo
 * przy prostokącie i kółku białe tło jest częścią naklejki.
 */
export function getRenderImageUrl(
  imageUrl: string,
  cutLineType: PlacedSticker["cutLineType"]
): Promise<string> {
  if (typeof window === "undefined" || !imageUrl || !usesContourCut(cutLineType)) {
    return Promise.resolve(imageUrl);
  }

  const cached = transparentUrls.get(imageUrl);
  if (cached) return cached;

  const promise = (async () => {
    try {
      const img = await loadImage(imageUrl);
      const canvas = stripWhiteBackground(img);
      if (!canvas) return imageUrl;
      return await canvasToObjectUrl(canvas);
    } catch (err) {
      console.error("Nie udało się wybić białego tła:", err);
      // Nieudana próba (np. chwilowy błąd sieci) nie zostaje w pamięci — przy
      // następnym użyciu, najpóźniej przy pliku do druku, liczymy od nowa.
      transparentUrls.delete(imageUrl);
      return imageUrl;
    }
  })();

  transparentUrls.set(imageUrl, promise);
  return promise;
}

/**
 * Lekkie wersje ekranowe grafik (gotowe arkusze): adres oryginału -> adres
 * wersji do pokazania. Zarejestrowaną grafikę kreator rysuje na ekranie z lekkiej
 * wersji; `getRenderImageUrl`, z którego powstaje plik do druku, tej mapy nie
 * widzi i zawsze sięga po oryginał.
 */
const displaySources = new Map<string, string>();
/** imageUrl źródłowy -> URL lekkiej wersji z wybitym tłem. */
const displayUrls = new Map<string, Promise<string>>();

export function registerDisplaySources(sources: Record<string, string>): void {
  for (const [imageUrl, displayUrl] of Object.entries(sources)) {
    if (imageUrl && displayUrl) displaySources.set(imageUrl, displayUrl);
  }
}

/**
 * Lekka wersja ma kilkaset pikseli — w sam raz dla naklejek do tej wielkości.
 * Większe pokazujemy z oryginału, żeby powiększona naklejka nie wyglądała
 * na ekranie na rozmytą.
 */
const DISPLAY_SOURCE_MAX_CM = 7.5;

type SizedSticker = Pick<PlacedSticker, "imageUrl" | "widthCm" | "heightCm">;

function needsOriginal(st: SizedSticker): boolean {
  return Math.max(st.widthCm, st.heightCm) > DISPLAY_SOURCE_MAX_CM;
}

/** Adres, spod którego naklejkę pokazujemy na ekranie: lekka wersja, a bez niej oryginał. */
export function getDisplaySource(st: SizedSticker): string {
  if (needsOriginal(st)) return st.imageUrl;
  return displaySources.get(st.imageUrl) ?? st.imageUrl;
}

/**
 * URL grafiki do wyświetlenia. Dla grafik z lekką wersją tło wybijamy na niej
 * (ułamek pikseli oryginału); pozostałe idą dotychczasową drogą.
 */
function getDisplayImageUrl(
  imageUrl: string,
  cutLineType: PlacedSticker["cutLineType"]
): Promise<string> {
  const source = displaySources.get(imageUrl);
  if (typeof window === "undefined" || !source) return getRenderImageUrl(imageUrl, cutLineType);
  if (!usesContourCut(cutLineType)) return Promise.resolve(source);

  const cached = displayUrls.get(imageUrl);
  if (cached) return cached;

  const promise = (async () => {
    try {
      const img = await loadImage(source);
      const canvas = stripWhiteBackground(img);
      if (!canvas) return source;
      return await canvasToObjectUrl(canvas);
    } catch (err) {
      // Lekka wersja zawiodła — ta grafika wraca do oryginału, jak każda inna.
      console.error("Nie udało się wczytać lekkiej wersji grafiki:", err);
      displaySources.delete(imageUrl);
      displayUrls.delete(imageUrl);
      return getRenderImageUrl(imageUrl, cutLineType);
    }
  })();

  displayUrls.set(imageUrl, promise);
  return promise;
}

/**
 * Przygotowuje grafikę do pliku do druku, zanim klient kliknie „Dodaj do
 * koszyka": pobiera oryginał i — dla konturu — wybija mu tło. Wynik zostaje
 * w tych samych pamięciach, z których korzysta render arkusza.
 */
export function preloadPrintImage(
  imageUrl: string,
  cutLineType: PlacedSticker["cutLineType"]
): Promise<void> {
  const work = usesContourCut(cutLineType)
    ? getRenderImageUrl(imageUrl, cutLineType)
    : loadImage(imageUrl);
  return work.then(
    () => undefined,
    () => undefined
  );
}

/**
 * Mapa `imageUrl źródłowy -> URL do wyświetlenia` dla naklejek z konturem
 * i dla grafik z lekką wersją ekranową. Klucz to oryginalny URL, więc duplikaty
 * tej samej grafiki dzielą jedną wersję.
 */
export function useRenderImageUrls(
  stickers: (SizedSticker & Pick<PlacedSticker, "cutLineType">)[]
): Record<string, string> {
  const [urls, setUrls] = useState<Record<string, string>>({});

  const contour = new Set(
    stickers.filter((st) => usesContourCut(st.cutLineType) && st.imageUrl).map((st) => st.imageUrl)
  );
  const registered = new Set(
    stickers.filter((st) => displaySources.has(st.imageUrl)).map((st) => st.imageUrl)
  );
  // Wystarczy jedna duża naklejka z daną grafiką, żeby cała grafika szła z oryginału.
  const light = new Set(registered);
  for (const st of stickers) {
    if (needsOriginal(st)) light.delete(st.imageUrl);
  }

  const pending = Array.from(new Set([...contour, ...registered]));
  // Ta sama grafika bywa raz z konturem, raz bez, raz mała, raz duża — to,
  // jak ją liczymy, wchodzi do klucza.
  const key = pending
    .map((url) => `${contour.has(url) ? "k" : "p"}${light.has(url) ? "l" : "o"}${url}`)
    .join("|");

  useEffect(() => {
    let cancelled = false;
    pending.forEach((imageUrl) => {
      const cutLineType = contour.has(imageUrl) ? "contour" : "none";
      const resolving = light.has(imageUrl)
        ? getDisplayImageUrl(imageUrl, cutLineType)
        : getRenderImageUrl(imageUrl, cutLineType);
      resolving.then((resolved) => {
        if (cancelled) return;
        setUrls((prev) => (prev[imageUrl] === resolved ? prev : { ...prev, [imageUrl]: resolved }));
      });
    });
    return () => {
      cancelled = true;
    };
    // `key` opisuje dokładnie zbiór adresów do przeliczenia.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  return urls;
}
