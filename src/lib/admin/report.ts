import "server-only";

import type { AdminOrder } from "./queries";
import { PAYMENT_METHOD_LABELS } from "@/lib/orders/status";

export const SELLER = {
  name: "Jakub Dalaszyński",
  nip: "6972414844",
  address: "ul. Geodetów 41, 64-100 Trzebiny",
};

export const DEFAULT_VAT_RATE = 23;

/** Excel w polskiej wersji dzieli kolumny średnikiem, nie przecinkiem. */
const SEPARATOR = ";";

function escapeCell(value: string): string {
  if (/[";\n\r]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

/** Kwota w formacie, który polski Excel rozpozna jako liczbę. */
function money(amount: number): string {
  return amount.toFixed(2).replace(".", ",");
}

function polishDate(iso: string | null | undefined): string {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("pl-PL", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: "Europe/Warsaw",
  });
}

export type ReportRow = {
  lp: number;
  orderNumber: string;
  saleDate: string;
  paymentDate: string;
  buyer: string;
  goods: string;
  quantity: number;
  net: number;
  vatRate: number;
  vat: number;
  gross: number;
  paymentMethod: string;
  transactionId: string;
  email: string;
};

export type ReportSummary = {
  rows: ReportRow[];
  net: number;
  vat: number;
  gross: number;
};

export type ReportOptions = {
  from: string;
  to: string;
  vatRate?: number;
  /** Domyślnie zamówienia z fakturą nie wchodzą do ewidencji bezrachunkowej. */
  includeInvoiced?: boolean;
};

/**
 * Buduje wiersze ewidencji.
 *
 * Zasady ustalone ze sprzedawcą:
 *  - wchodzą wyłącznie zamówienia opłacone, filtrowane po dacie zapłaty
 *    (tak samo filtruje raport z Przelewy24, więc kwoty się schodzą);
 *  - jedno zamówienie to jeden wiersz, żeby odpowiadał jednej transakcji
 *    u operatora płatności;
 *  - zamówienia z wystawioną fakturą są pomijane, bo są już udokumentowane
 *    osobno;
 *  - ceny w sklepie są brutto, więc netto liczymy jako brutto ÷ (1 + VAT),
 *    zaokrąglając na poziomie pojedynczego zamówienia — dzięki temu suma
 *    raportu równa się sumie wierszy co do grosza.
 */
export function buildReport(orders: AdminOrder[], options: ReportOptions): ReportSummary {
  const vatRate = options.vatRate ?? DEFAULT_VAT_RATE;

  const eligible = orders
    .filter((order) => order.status === "PAID" && !order.deletedAt && order.paidAt)
    .filter((order) => options.includeInvoiced || !order.billing.wantsInvoice)
    .filter((order) => {
      const paid = order.paidAt as string;
      return paid >= options.from && paid <= options.to;
    })
    .sort((a, b) => (a.paidAt ?? "").localeCompare(b.paidAt ?? ""));

  let netSum = 0;
  let vatSum = 0;
  let grossSum = 0;

  const rows: ReportRow[] = eligible.map((order, index) => {
    const gross = order.totals.total;
    const net = Math.round((gross / (1 + vatRate / 100)) * 100) / 100;
    const vat = Math.round((gross - net) * 100) / 100;

    netSum = Math.round((netSum + net) * 100) / 100;
    vatSum = Math.round((vatSum + vat) * 100) / 100;
    grossSum = Math.round((grossSum + gross) * 100) / 100;

    const sheets = order.items.reduce((sum, item) => sum + item.sheetQuantity, 0);

    return {
      lp: index + 1,
      orderNumber: order.orderNumber,
      saleDate: polishDate(order.createdAt),
      paymentDate: polishDate(order.paidAt),
      buyer: `${order.customer.firstName} ${order.customer.lastName}`.trim(),
      goods: `Naklejki (${sheets} szt.) wraz z dostawą`,
      quantity: sheets,
      net,
      vatRate,
      vat,
      gross,
      paymentMethod: PAYMENT_METHOD_LABELS[order.payment.method] ?? order.payment.method,
      transactionId: order.payment.transactionId ?? "",
      email: order.customer.email,
    };
  });

  return { rows, net: netSum, vat: vatSum, gross: grossSum };
}

const HEADERS = [
  "Lp",
  "Nr zamówienia",
  "Data sprzedaży",
  "Data zapłaty",
  "Nabywca",
  "Towar",
  "Ilość",
  "Kwota netto",
  "Stawka VAT",
  "Kwota VAT",
  "Kwota brutto",
  "Metoda płatności",
  "ID transakcji",
  "E-mail",
];

export function reportToCsv(summary: ReportSummary, options: ReportOptions): string {
  const lines: string[] = [];

  lines.push(
    escapeCell(
      `Ewidencja sprzedaży bezrachunkowej za okres ${polishDate(options.from)} - ${polishDate(options.to)}`
    )
  );
  lines.push(escapeCell(`Sprzedawca: ${SELLER.name}, NIP ${SELLER.nip}, ${SELLER.address}`));
  lines.push("");

  lines.push(HEADERS.map(escapeCell).join(SEPARATOR));

  for (const row of summary.rows) {
    lines.push(
      [
        String(row.lp),
        row.orderNumber,
        row.saleDate,
        row.paymentDate,
        row.buyer,
        row.goods,
        String(row.quantity),
        money(row.net),
        `${row.vatRate}%`,
        money(row.vat),
        money(row.gross),
        row.paymentMethod,
        row.transactionId,
        row.email,
      ]
        .map(escapeCell)
        .join(SEPARATOR)
    );
  }

  lines.push(
    [
      "",
      "SUMA",
      "",
      "",
      "",
      "",
      String(summary.rows.reduce((sum, row) => sum + row.quantity, 0)),
      money(summary.net),
      "",
      money(summary.vat),
      money(summary.gross),
      "",
      "",
      "",
    ]
      .map(escapeCell)
      .join(SEPARATOR)
  );

  // Znacznik BOM — bez niego Excel czyta plik jako Windows-1250 i rozsypuje
  // polskie znaki, mimo poprawnego kodowania UTF-8.
  return `﻿${lines.join("\r\n")}\r\n`;
}

export function reportFileName(from: string): string {
  const date = new Date(from);
  if (Number.isNaN(date.getTime())) return "ewidencja.csv";
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `ewidencja-${year}-${month}.csv`;
}
