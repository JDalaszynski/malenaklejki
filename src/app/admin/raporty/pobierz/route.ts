import { NextRequest, NextResponse } from "next/server";

import { readSession } from "@/lib/auth/session";
import { listOrders } from "@/lib/admin/queries";
import { buildReport, reportToCsv, reportFileName } from "@/lib/admin/report";
import { monthRange } from "@/lib/admin/filters";

export const dynamic = "force-dynamic";

/**
 * Pobranie ewidencji jako plik CSV.
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

  const includeInvoiced = params.get("zFakturami") === "1";

  const orders = await listOrders({
    from: range.from,
    to: range.to,
    dateField: "paidAt",
    status: "PAID",
  });

  const summary = buildReport(orders, {
    from: range.from,
    to: range.to,
    includeInvoiced,
  });

  const csv = reportToCsv(summary, { from: range.from, to: range.to, includeInvoiced });
  const fileName = reportFileName(range.from);

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${fileName}"`,
      "Cache-Control": "no-store, private",
    },
  });
}
