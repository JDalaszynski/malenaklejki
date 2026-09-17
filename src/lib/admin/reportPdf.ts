import "server-only";

import { readFile } from "node:fs/promises";
import path from "node:path";
import { jsPDF } from "jspdf";

import {
  REPORT_SCOPE,
  SELLER,
  polishDate,
  type ReportOptions,
  type ReportRow,
  type ReportSummary,
} from "./report";

/**
 * Ewidencja sprzedaży jako PDF — ta sama treść co CSV, ale w formie gotowej
 * do wydruku i archiwum księgowej.
 *
 * Standardowe fonty PDF (Helvetica i spółka) nie mają polskich znaków, więc
 * osadzamy Liberation Sans z `src/lib/admin/fonts`. Na Vercelu te pliki
 * trafiają do funkcji dzięki `outputFileTracingIncludes` w `next.config.ts`.
 */

const FONT_FAMILY = "LiberationSans";
const FONT_DIR = path.join(process.cwd(), "src", "lib", "admin", "fonts");

let fontsPromise: Promise<{ regular: string; bold: string }> | null = null;

function loadFonts() {
  fontsPromise ??= Promise.all([
    readFile(path.join(FONT_DIR, "LiberationSans-Regular.ttf")),
    readFile(path.join(FONT_DIR, "LiberationSans-Bold.ttf")),
  ])
    .then(([regular, bold]) => ({
      regular: regular.toString("base64"),
      bold: bold.toString("base64"),
    }))
    .catch((error) => {
      fontsPromise = null;
      throw error;
    });
  return fontsPromise;
}

/* ------------------------------------------------------------------ */
/* Wygląd                                                              */
/* ------------------------------------------------------------------ */

const PAGE = { width: 297, height: 210, margin: 12, footer: 9 };

const COLORS = {
  text: "#0f2e2f",
  heading: "#004749",
  muted: "#5b7373",
  accent: "#02af7a",
  headerFill: "#e3f2ec",
  stripeFill: "#f4faf7",
  line: "#d3e4dd",
  strongLine: "#8fb5a8",
};

/** Punkty typograficzne na milimetry. */
const PT = 0.3528;

const TABLE_FONT_SIZE = 7.5;
const LINE_HEIGHT = TABLE_FONT_SIZE * PT * 1.3;
const CELL_PAD_X = 1.6;
const CELL_PAD_Y = 1.5;

type Column = {
  header: string;
  value: (row: ReportRow) => string;
  align?: "left" | "right";
  /** Kolumna może się zawijać i dostaje wolne miejsce. */
  flex?: boolean;
  bold?: boolean;
};

/** Kwota bez waluty — waluta jest w nagłówku kolumny. */
function money(amount: number): string {
  const [whole, cents] = amount.toFixed(2).split(".");
  return `${whole.replace(/\B(?=(\d{3})+(?!\d))/g, " ")},${cents}`;
}

const COLUMNS: Column[] = [
  { header: "Lp", value: (row) => String(row.lp), align: "right" },
  { header: "Nr zamówienia", value: (row) => row.orderNumber },
  { header: "Nr faktury", value: (row) => row.invoiceNumber || "—" },
  { header: "Data sprzedaży", value: (row) => row.saleDate },
  { header: "Data zapłaty", value: (row) => row.paymentDate },
  { header: "Nabywca", value: (row) => row.buyer || "—", flex: true },
  { header: "Towar", value: (row) => row.goods, flex: true },
  { header: "Netto (zł)", value: (row) => money(row.net), align: "right" },
  { header: "VAT", value: (row) => `${row.vatRate}%`, align: "right" },
  { header: "Kwota VAT (zł)", value: (row) => money(row.vat), align: "right" },
  { header: "Brutto (zł)", value: (row) => money(row.gross), align: "right", bold: true },
  { header: "Płatność", value: (row) => row.paymentMethod, flex: true },
  { header: "ID transakcji", value: (row) => row.transactionId || "—" },
];

/* ------------------------------------------------------------------ */
/* Rysowanie                                                           */
/* ------------------------------------------------------------------ */

function setFont(doc: jsPDF, size: number, weight: "normal" | "bold", color = COLORS.text) {
  doc.setFont(FONT_FAMILY, weight);
  doc.setFontSize(size);
  doc.setTextColor(color);
}

/** Linia bazowa tekstu tak, żeby wiersz był wizualnie wyśrodkowany w swojej wysokości. */
function baseline(top: number, lineIndex: number, fontSize = TABLE_FONT_SIZE): number {
  return top + CELL_PAD_Y + lineIndex * LINE_HEIGHT + fontSize * PT * 0.95;
}

/**
 * Szerokości kolumn liczone z treści: kolumny sztywne dostają tyle, ile
 * potrzebuje najdłuższa wartość, a elastyczne dzielą resztę szerokości strony.
 */
function columnWidths(doc: jsPDF, rows: string[][], totals: string[]): number[] {
  const available = PAGE.width - PAGE.margin * 2;

  const natural = COLUMNS.map((column, index) => {
    setFont(doc, TABLE_FONT_SIZE, "bold");
    const headerWord = Math.max(...column.header.split(" ").map((word) => doc.getTextWidth(word)));
    const totalWidth = doc.getTextWidth(totals[index]);
    setFont(doc, TABLE_FONT_SIZE, column.bold ? "bold" : "normal");
    const cells = rows.map((values) => doc.getTextWidth(values[index]));
    // Zapas na zaokrąglenia — bez niego „Lp” potrafi złamać się na dwie linie.
    return Math.max(headerWord, totalWidth, ...cells) + CELL_PAD_X * 2 + 0.5;
  });

  const fixed = natural.reduce((sum, width, index) => (COLUMNS[index].flex ? sum : sum + width), 0);
  const flexNatural = natural.reduce((sum, width, index) => (COLUMNS[index].flex ? sum + width : sum), 0);
  const flexCount = COLUMNS.filter((column) => column.flex).length;
  const flexSpace = Math.max(available - fixed, flexCount * 18);

  return natural.map((width, index) =>
    COLUMNS[index].flex ? (width / flexNatural) * flexSpace : width
  );
}

type RowStyle = "header" | "body" | "stripe" | "total";

type MeasuredRow = { lines: string[][]; height: number; style: RowStyle };

function measureRow(doc: jsPDF, values: string[], widths: number[], style: RowStyle): MeasuredRow {
  const lines = values.map((value, index) => {
    const bold = style === "header" || style === "total" || Boolean(COLUMNS[index].bold);
    setFont(doc, TABLE_FONT_SIZE, bold ? "bold" : "normal");
    return doc.splitTextToSize(value, widths[index] - CELL_PAD_X * 2) as string[];
  });
  const height = Math.max(...lines.map((cell) => cell.length)) * LINE_HEIGHT + CELL_PAD_Y * 2;
  return { lines, height, style };
}

function drawRow(doc: jsPDF, row: MeasuredRow, top: number, widths: number[]): number {
  const tableWidth = widths.reduce((sum, width) => sum + width, 0);
  const emphasized = row.style === "header" || row.style === "total";

  if (row.style !== "body") {
    doc.setFillColor(emphasized ? COLORS.headerFill : COLORS.stripeFill);
    doc.rect(PAGE.margin, top, tableWidth, row.height, "F");
  }

  let x = PAGE.margin;
  COLUMNS.forEach((column, index) => {
    const bold = emphasized || Boolean(column.bold);
    setFont(doc, TABLE_FONT_SIZE, bold ? "bold" : "normal", emphasized ? COLORS.heading : COLORS.text);
    const textX = column.align === "right" ? x + widths[index] - CELL_PAD_X : x + CELL_PAD_X;
    row.lines[index].forEach((line, lineIndex) => {
      doc.text(line, textX, baseline(top, lineIndex), { align: column.align ?? "left" });
    });
    x += widths[index];
  });

  if (row.style !== "header") {
    const total = row.style === "total";
    doc.setDrawColor(total ? COLORS.strongLine : COLORS.line);
    doc.setLineWidth(total ? 0.35 : 0.15);
    if (total) doc.line(PAGE.margin, top, PAGE.margin + tableWidth, top);
    doc.line(PAGE.margin, top + row.height, PAGE.margin + tableWidth, top + row.height);
  }

  return top + row.height;
}

/** Nagłówek dokumentu z pierwszej strony. Zwraca pozycję, od której zaczyna się tabela. */
function drawDocumentHeader(
  doc: jsPDF,
  summary: ReportSummary,
  options: ReportOptions & { excluded: number }
): number {
  const left = PAGE.margin;
  const right = PAGE.width - PAGE.margin;
  let y = PAGE.margin + 3;

  setFont(doc, 9, "bold", COLORS.accent);
  doc.text("malenaklejki.pl", left, y);

  setFont(doc, 8, "normal", COLORS.muted);
  const generatedAt = new Date().toLocaleString("pl-PL", {
    timeZone: "Europe/Warsaw",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
  doc.text(`Wygenerowano ${generatedAt}`, right, y, { align: "right" });

  y += 8;
  setFont(doc, 17, "bold", COLORS.heading);
  doc.text("Ewidencja sprzedaży bezrachunkowej", left, y);

  y += 6.5;
  setFont(doc, 10.5, "bold", COLORS.text);
  doc.text(`Okres: ${polishDate(options.from)} – ${polishDate(options.to)}`, left, y);

  y += 5.5;
  setFont(doc, 9, "normal", COLORS.text);
  doc.text(REPORT_SCOPE, left, y);

  y += 4.5;
  doc.text(`Sprzedawca: ${SELLER.name}, NIP ${SELLER.nip}, ${SELLER.address}`, left, y);

  doc.setDrawColor(COLORS.accent);
  doc.setLineWidth(0.6);
  doc.line(left, y + 3.5, right, y + 3.5);

  // Podsumowanie w kafelkach — ten sam układ co w panelu.
  y += 8;
  const tiles = [
    { label: "POZYCJI", value: String(summary.rows.length) },
    { label: "NETTO", value: `${money(summary.net)} zł` },
    { label: "VAT 23%", value: `${money(summary.vat)} zł` },
    { label: "BRUTTO", value: `${money(summary.gross)} zł` },
  ];
  const gap = 4;
  const tileWidth = (right - left - gap * (tiles.length - 1)) / tiles.length;
  const tileHeight = 14;
  tiles.forEach((tile, index) => {
    const x = left + index * (tileWidth + gap);
    doc.setFillColor(COLORS.stripeFill);
    doc.setDrawColor(COLORS.line);
    doc.setLineWidth(0.2);
    doc.roundedRect(x, y, tileWidth, tileHeight, 2.5, 2.5, "FD");
    setFont(doc, 6.5, "bold", COLORS.muted);
    doc.text(tile.label, x + 4, y + 5, { charSpace: 0.3 });
    setFont(doc, 12, "bold", COLORS.heading);
    doc.text(tile.value, x + 4, y + 11);
  });
  y += tileHeight + 5;

  if (options.includeInvoiced) {
    setFont(doc, 8, "normal", COLORS.muted);
    doc.text("Zestawienie obejmuje także zamówienia z fakturą na firmę.", left, y);
    y += 5;
  } else if (options.excluded > 0) {
    setFont(doc, 8, "normal", COLORS.muted);
    const noun = options.excluded === 1 ? "zamówienie" : "zamówień";
    doc.text(
      `Pominięto ${options.excluded} ${noun} z fakturą na firmę — udokumentowane fakturą, poza ewidencją bezrachunkową.`,
      left,
      y
    );
    y += 5;
  }

  return y;
}

function drawFooters(doc: jsPDF, options: ReportOptions) {
  const pages = doc.getNumberOfPages();
  const period = polishDate(options.from).slice(3);
  for (let page = 1; page <= pages; page++) {
    doc.setPage(page);
    const y = PAGE.height - PAGE.footer + 3;
    doc.setDrawColor(COLORS.line);
    doc.setLineWidth(0.2);
    doc.line(PAGE.margin, y - 4, PAGE.width - PAGE.margin, y - 4);
    setFont(doc, 7.5, "normal", COLORS.muted);
    doc.text(
      `Ewidencja sprzedaży bezrachunkowej za ${period} · ${SELLER.name}, NIP ${SELLER.nip} · malenaklejki.pl`,
      PAGE.margin,
      y
    );
    doc.text(`Strona ${page} z ${pages}`, PAGE.width - PAGE.margin, y, { align: "right" });
  }
}

export async function reportToPdf(
  summary: ReportSummary,
  options: ReportOptions & { excluded: number }
): Promise<Buffer> {
  const fonts = await loadFonts();

  const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4", compress: true });
  doc.addFileToVFS("LiberationSans-Regular.ttf", fonts.regular);
  doc.addFont("LiberationSans-Regular.ttf", FONT_FAMILY, "normal");
  doc.addFileToVFS("LiberationSans-Bold.ttf", fonts.bold);
  doc.addFont("LiberationSans-Bold.ttf", FONT_FAMILY, "bold");
  doc.setLanguage("pl");
  doc.setProperties({
    title: `Ewidencja sprzedaży bezrachunkowej ${polishDate(options.from)} – ${polishDate(options.to)}`,
    subject: REPORT_SCOPE,
    author: SELLER.name,
    creator: "malenaklejki.pl",
  });

  let y = drawDocumentHeader(doc, summary, options);

  if (summary.rows.length === 0) {
    setFont(doc, 10, "normal", COLORS.muted);
    doc.text("Brak opłaconych zamówień w tym okresie.", PAGE.width / 2, y + 12, { align: "center" });
  } else {
    const rows = summary.rows.map((row) => COLUMNS.map((column) => column.value(row)));
    const totals = COLUMNS.map((column) => {
      if (column.header === "Nr zamówienia") return "SUMA";
      if (column.header === "Netto (zł)") return money(summary.net);
      if (column.header === "Kwota VAT (zł)") return money(summary.vat);
      if (column.header === "Brutto (zł)") return money(summary.gross);
      return "";
    });

    const widths = columnWidths(doc, rows, totals);
    const header = measureRow(doc, COLUMNS.map((column) => column.header), widths, "header");
    const bottom = PAGE.height - PAGE.margin - PAGE.footer;

    const place = (row: MeasuredRow) => {
      if (y + row.height > bottom) {
        doc.addPage();
        y = drawRow(doc, header, PAGE.margin, widths);
      }
      y = drawRow(doc, row, y, widths);
    };

    y = drawRow(doc, header, y, widths);
    rows.forEach((values, index) =>
      place(measureRow(doc, values, widths, index % 2 === 1 ? "stripe" : "body"))
    );
    place(measureRow(doc, totals, widths, "total"));
  }

  drawFooters(doc, options);

  return Buffer.from(doc.output("arraybuffer"));
}
