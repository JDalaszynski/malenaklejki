import "server-only";

import { db } from "@/lib/firebase/admin";
import { listOrders, type AdminOrder } from "./queries";

/**
 * Zysk ze sprzedaży jednego arkusza A4.
 *
 * Marża jest stała niezależnie od ceny arkusza (rabaty ilościowe schodzą
 * z naszej części), więc zysk liczymy jako liczba arkuszy × ta stawka.
 */
export const PROFIT_PER_SHEET = 20;

const TIME_ZONE = "Europe/Warsaw";

/** Sprzedaż dopisana ręcznie — to, co poszło mailem, z ręki, poza sklepem. */
export type ManualSale = {
  id: string;
  /** Data sprzedaży (ISO) — po niej wpis trafia do właściwego miesiąca. */
  soldAt: string;
  sheets: number;
  /** Kwota brutto. Zero znaczy „nie podano" i nie wchodzi do obrotu. */
  amount: number;
  note: string;
  createdBy: string;
  createdAt: string;
};

/**
 * Wspólny kształt dla obu źródeł sprzedaży. Statystyki liczymy na nim, więc
 * arkusz ze sklepu i arkusz dopisany ręcznie liczą się dokładnie tak samo —
 * bez powielania sumowania w dwóch miejscach.
 */
export type SalesEntry = {
  date: string;
  sheets: number;
  gross: number;
  manual: boolean;
};

export type SheetStats = {
  /** Liczba opłaconych zamówień ze sklepu (wpisy ręczne nie są zamówieniami). */
  orders: number;
  /** Ile z arkuszy pochodzi z ręcznych dopisków. */
  manualSheets: number;
  sheets: number;
  profit: number;
  gross: number;
};

export type MonthlyStats = SheetStats & {
  /** `RRRR-MM` — klucz sortowania i identyfikator wiersza. */
  month: string;
  label: string;
};

/** Liczba arkuszy w zamówieniu — pocięte na sztuki liczą się tak samo jak całe. */
export function countSheets(order: AdminOrder): number {
  return order.items.reduce((sum, item) => sum + (item.sheetQuantity || 0), 0);
}

/**
 * Miesiąc, do którego wliczamy zamówienie: data zapłaty, a dla starszych
 * zamówień bez `paidAt` — data złożenia. Bez tego zapasowego pola opłacone
 * zamówienia sprzed wdrożenia znikałyby ze statystyk.
 */
export function statsDate(order: AdminOrder): string {
  return order.paidAt || order.createdAt;
}

export function toSalesEntries(orders: AdminOrder[], manual: ManualSale[]): SalesEntry[] {
  return [
    ...orders.map((order) => ({
      date: statsDate(order),
      sheets: countSheets(order),
      gross: order.totals.total,
      manual: false,
    })),
    ...manual.map((sale) => ({
      date: sale.soldAt,
      sheets: sale.sheets,
      gross: sale.amount,
      manual: true,
    })),
  ];
}

export function summarizeSheets(entries: SalesEntry[]): SheetStats {
  let sheets = 0;
  let manualSheets = 0;
  let orders = 0;
  let gross = 0;

  for (const entry of entries) {
    sheets += entry.sheets;
    if (entry.manual) manualSheets += entry.sheets;
    else orders += 1;
    gross = Math.round((gross + entry.gross) * 100) / 100;
  }

  return { orders, manualSheets, sheets, profit: sheets * PROFIT_PER_SHEET, gross };
}

/** `RRRR-MM` daty w strefie warszawskiej — ten sam podział miesięcy co w raportach. */
export function monthKey(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";

  const parts: Record<string, string> = {};
  for (const part of new Intl.DateTimeFormat("pl-PL", {
    timeZone: TIME_ZONE,
    year: "numeric",
    month: "2-digit",
  }).formatToParts(date)) {
    if (part.type !== "literal") parts[part.type] = part.value;
  }
  return `${parts.year}-${parts.month}`;
}

function monthLabel(month: string): string {
  const [year, index] = month.split("-").map(Number);
  return new Date(year, index - 1, 1).toLocaleDateString("pl-PL", {
    month: "long",
    year: "numeric",
  });
}

/** Ostatnie `count` miesięcy — także te bez sprzedaży, żeby wykres nie kłamał. */
export function monthlyBreakdown(entries: SalesEntry[], count = 12): MonthlyStats[] {
  const buckets = new Map<string, SalesEntry[]>();

  const now = new Date();
  for (let i = count - 1; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    buckets.set(`${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`, []);
  }

  for (const entry of entries) {
    const bucket = buckets.get(monthKey(entry.date));
    if (bucket) bucket.push(entry);
  }

  return [...buckets.entries()].map(([month, list]) => ({
    month,
    label: monthLabel(month),
    ...summarizeSheets(list),
  }));
}

/**
 * Opłacone zamówienia do statystyk.
 *
 * Filtrujemy po `createdAt`, mimo że statystyki układamy według daty zapłaty:
 * Firestore pomija w sortowaniu dokumenty bez danego pola, a `paidAt` pojawiło
 * się dopiero z panelem — sortowanie po nim wycięłoby starszą sprzedaż.
 */
export async function loadPaidOrders(limit = 3000): Promise<AdminOrder[]> {
  return listOrders({ dateField: "createdAt", status: "PAID" }, limit);
}

export async function loadManualSales(limit = 1000): Promise<ManualSale[]> {
  const snapshot = await db
    .collection("manualSales")
    .orderBy("soldAt", "desc")
    .limit(limit)
    .get();

  return snapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      soldAt: data.soldAt ?? "",
      sheets: data.sheets ?? 0,
      amount: data.amount ?? 0,
      note: data.note ?? "",
      createdBy: data.createdBy ?? "",
      createdAt: data.createdAt ?? "",
    };
  });
}
