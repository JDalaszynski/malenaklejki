import { NextRequest, NextResponse } from "next/server";

import { readSession } from "@/lib/auth/session";
import { loadReport, reportToCsv, reportFileName } from "@/lib/admin/report";
import { reportToPdf } from "@/lib/admin/reportPdf";
import { monthRange } from "@/lib/admin/filters";

export const dynamic = "force-dynamic";

/**
 * Pobranie ewidencji jako plik CSV (domyślnie) albo PDF (`format=pdf`).
 *
 * Uprawnienia sprawdzamy tu, a nie tylko na stronie panelu — adres da się
 * wywołać bezpośrednio. Odpowiadamy 404 zamiast 403, żeby nie potwierdzać,
 * że pod tym adresem cokolwiek jest.
 */
export async function GET(request: NextRequest) {
  const session = await readSession();
  if (!session?.isAdmin) {
    return new NextResponse("Not found", { status: 404 });
  }

  const params = request.nextUrl.searchParams;
  const month = params.get("miesiac");
  const range = month ? monthRange(month) : null;

  if (!range) {
    return new NextResponse("Podaj miesiąc w formacie RRRR-MM", { status: 400 });
  }

  const format = params.get("format") === "pdf" ? "pdf" : "csv";
  const options = {
    from: range.from,
    to: range.to,
    includeInvoiced: params.get("zFakturami") === "1",
  };

  const { summary, excluded } = await loadReport(options, session.email ?? "");
  const fileName = reportFileName(range.from, format);
  const headers = {
    "Content-Disposition": `attachment; filename="${fileName}"`,
    "Cache-Control": "no-store, private",
  };

  if (format === "pdf") {
    const pdf = await reportToPdf(summary, { ...options, excluded });
    return new NextResponse(new Uint8Array(pdf), {
      headers: { ...headers, "Content-Type": "application/pdf" },
    });
  }

  return new NextResponse(reportToCsv(summary, options), {
    headers: { ...headers, "Content-Type": "text/csv; charset=utf-8" },
  });
}
