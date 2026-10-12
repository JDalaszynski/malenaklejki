"use client";

import { getDownloadURL, ref, uploadBytes, uploadBytesResumable } from "firebase/storage";

import { storage } from "@/lib/firebase/client";

/**
 * Plik PNG arkusza: z płótna do magazynu. Wspólne dla kreatora („Dodaj do
 * koszyka”, pobieranie PNG) i dla publikacji gotowych zestawów w panelu.
 *
 * Arkusz to A4 w 300 dpi (2480 × 3508 px) zapisany bez strat, bo idzie do
 * druku. Z samymi grafikami waży ułamek megabajta, ale wypełniony zdjęciami —
 * kilkanaście megabajtów (same piksele to niecałe 35 MB, więcej plik mieć nie
 * może). Reguły Storage przyjmują takie pliki do 40 MB, po nazwie — patrz
 * `storage.rules`.
 */

/**
 * Powyżej tego rozmiaru nie pytamy serwera o kompresję. Funkcja na Vercelu
 * przyjmuje żądania do 4,5 MB, a PNG jedzie tam w base64 (o jedną trzecią
 * cięższy), więc większy plik wracał z błędem 413 — po wysłaniu kilkunastu
 * megabajtów na darmo. Taki arkusz zostaje plikiem prosto z płótna.
 */
const SERVER_COMPRESSION_MAX_BYTES = 3 * 1024 * 1024;

/**
 * Od tego rozmiaru plik jedzie do magazynu w kawałkach: kilkanaście megabajtów
 * wysyłane z telefonu jednym żądaniem po zerwaniu połączenia zaczynałoby od
 * zera. Mniejsze pliki idą jednym żądaniem, bo tak jest po prostu szybciej.
 */
const CHUNKED_UPLOAD_FROM_BYTES = 10 * 1024 * 1024;

function canvasToPng(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) =>
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("Nie udało się zapisać arkusza do PNG."))),
      "image/png"
    )
  );
}

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error ?? new Error("Nie udało się odczytać pliku."));
    reader.readAsDataURL(blob);
  });
}

async function compressPngOnServer(png: Blob): Promise<Blob> {
  const response = await fetch("/api/compress-png", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ image: await blobToDataUrl(png) }),
  });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return response.blob();
}

/**
 * PNG z płótna arkusza. Mały plik przechodzi jeszcze przez kompresję na
 * serwerze; gdy ta zawiedzie albo plik jest na nią za duży, zostaje wersja
 * z przeglądarki — pełnej jakości, tylko cięższa.
 */
export async function sheetCanvasToPng(canvas: HTMLCanvasElement): Promise<Blob> {
  const png = await canvasToPng(canvas);
  if (png.size > SERVER_COMPRESSION_MAX_BYTES) return png;

  try {
    return await compressPngOnServer(png);
  } catch (error) {
    console.warn("Kompresja PNG na serwerze nie powiodła się, zostaje plik z płótna:", error);
    return png;
  }
}

/**
 * Wgrywa PNG arkusza do `uploads/` i oddaje adres pobierania.
 *
 * Nazwa musi pasować do reguły dla plików arkuszy w `storage.rules`
 * (`composition-…` albo `gotowy-zestaw-druk-…`), inaczej obowiązuje zwykły
 * limit 10 MB.
 */
export async function uploadSheetPng(png: Blob, fileName: string): Promise<string> {
  const dateFolder = new Date().toISOString().split("T")[0];
  const storageRef = ref(storage, `uploads/${dateFolder}/${fileName}`);
  const metadata = { contentType: "image/png" };
  const snapshot =
    png.size >= CHUNKED_UPLOAD_FROM_BYTES
      ? await uploadBytesResumable(storageRef, png, metadata)
      : await uploadBytes(storageRef, png, metadata);
  return getDownloadURL(snapshot.ref);
}
