import type { AdminOrder } from "./queries";

/**
 * Pliki produkcyjne zamówienia: arkusz do druku i (jeśli jest) wersja z liniami
 * cięcia. Nazwy są te same, co w załącznikach maila o płatności
 * (`buildOrderAttachments`), żeby plik z panelu i z poczty nazywał się tak samo.
 */

export type ProductionFile = {
  /** Numer arkusza od 1 — taki jak w nazwie pliku i w adresie pobierania. */
  sheet: number;
  kind: "print" | "cut";
  url: string;
  fileName: string;
};

const KIND_SUFFIX = { print: "DRUK", cut: "LINIE-CIECIA" } as const;

/** Numer zamówienia bez znaków, które psują nazwę pliku. */
export function filePrefix(orderNumber: string): string {
  return orderNumber.replace(/[^a-zA-Z0-9-]/g, "_");
}

export function productionFiles(order: Pick<AdminOrder, "orderNumber" | "items">): ProductionFile[] {
  const prefix = filePrefix(order.orderNumber);
  const files: ProductionFile[] = [];

  order.items.forEach((item, index) => {
    const sheet = index + 1;
    const add = (kind: ProductionFile["kind"], url: string | null) => {
      if (!url) return;
      files.push({
        sheet,
        kind,
        url,
        fileName: `${prefix}-arkusz-${sheet}-${KIND_SUFFIX[kind]}.png`,
      });
    };
    add("print", item.imageUrl);
    add("cut", item.cutLinesImageUrl);
  });

  return files;
}

/** Adres pobrania — wszystkie arkusze albo jeden (numer od 1). */
export function filesDownloadUrl(orderId: string, sheet?: number): string {
  const base = `/admin/zamowienia/${encodeURIComponent(orderId)}/pliki`;
  return sheet ? `${base}?arkusz=${sheet}` : base;
}

/**
 * Adresy pochodzą z dokumentu zamówienia, który tworzy klient sklepu, więc
 * serwer nie może ufać im ślepo — inaczej panel pobierałby dowolny adres
 * w imieniu administratora. Wpuszczamy tylko magazyn plików sklepu.
 */
const ALLOWED_HOSTS = ["firebasestorage.googleapis.com", "storage.googleapis.com"];

export function isStorageUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "https:" && ALLOWED_HOSTS.includes(url.hostname);
  } catch {
    return false;
  }
}
