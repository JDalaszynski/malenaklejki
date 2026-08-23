import { Suspense } from "react";
import type { Metadata } from "next";

import { AdminLayout, Card } from "@/components/admin/AdminLayout";
import { ReportControls } from "@/components/admin/ReportControls";
import { requireAdmin } from "@/lib/auth/dal";
import { listOrders } from "@/lib/admin/queries";
import { buildReport, SELLER } from "@/lib/admin/report";
import { currentMonthValue, monthRange, type AdminSearchParams } from "@/lib/admin/filters";
import { formatPln } from "@/lib/orders/status";

export const metadata: Metadata = {
  title: "Panel — raporty",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

function polishDate(iso: string): string {
  return new Date(iso).toLocaleDateString("pl-PL", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: "Europe/Warsaw",
  });
}

export default async function ReportsPage({
  searchParams,
}: {
  searchParams: Promise<AdminSearchParams>;
}) {
  const admin = await requireAdmin();
  const params = await searchParams;

  const month = (typeof params.miesiac === "string" ? params.miesiac : "") || currentMonthValue();
  const includeInvoiced = params.zFakturami === "1";
  const range = monthRange(month) ?? monthRange(currentMonthValue())!;

  const orders = await listOrders({
    from: range.from,
    to: range.to,
    dateField: "paidAt",
    status: "PAID",
  });

  const report = buildReport(orders, { ...range, includeInvoiced });
  const excluded = orders.filter((order) => order.billing.wantsInvoice).length;

  return (
    <AdminLayout
      adminEmail={admin.email ?? ""}
      title="Ewidencja sprzedaży"
      subtitle="Podgląd jest tym samym, co trafi do pliku CSV — sprawdź, zanim wyślesz księgowej."
    >
      <Card>
        <Suspense fallback={<div className="h-24 animate-pulse rounded-xl bg-muted/40" />}>
          <ReportControls month={month} includeInvoiced={includeInvoiced} />
        </Suspense>
      </Card>

      <Card>
        <div className="border-b border-border/60 pb-4 mb-4">
          <p className="font-extrabold text-foreground">
            Ewidencja sprzedaży bezrachunkowej za okres {polishDate(range.from)} –{" "}
            {polishDate(range.to)}
          </p>
          <p className="text-sm font-medium text-muted-foreground mt-1">
            Sprzedawca: {SELLER.name}, NIP {SELLER.nip}, {SELLER.address}
          </p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
          {[
            { label: "Pozycji", value: String(report.rows.length) },
            { label: "Netto", value: formatPln(report.net) },
            { label: "VAT 23%", value: formatPln(report.vat) },
            { label: "Brutto", value: formatPln(report.gross) },
          ].map((tile) => (
            <div key={tile.label} className="rounded-2xl border border-border/60 bg-muted/20 px-4 py-3">
              <p className="text-[11px] font-black uppercase tracking-wider text-muted-foreground">
                {tile.label}
              </p>
              <p className="text-xl font-extrabold text-foreground mt-0.5 tabular-nums">
                {tile.value}
              </p>
            </div>
          ))}
        </div>

        {!includeInvoiced && excluded > 0 && (
          <p className="text-sm font-semibold text-muted-foreground bg-muted/30 border border-border/60 rounded-xl px-4 py-3 mb-5">
            Pominięto {excluded}{" "}
            {excluded === 1 ? "zamówienie z fakturą" : "zamówień z fakturą"} — te są udokumentowane
            fakturą, więc do ewidencji bezrachunkowej nie wchodzą.
          </p>
        )}

        {report.rows.length === 0 ? (
          <p className="text-sm font-medium text-muted-foreground py-8 text-center">
            Brak opłaconych zamówień w tym okresie.
          </p>
        ) : (
          <div className="overflow-x-auto -mx-5 sm:-mx-6 px-5 sm:px-6">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="text-left">
                  {[
                    "Lp",
                    "Nr zamówienia",
                    "Data sprzedaży",
                    "Data zapłaty",
                    "Nabywca",
                    "Towar",
                    "Netto",
                    "VAT",
                    "Kwota VAT",
                    "Brutto",
                    "Płatność",
                    "ID transakcji",
                  ].map((heading) => (
                    <th
                      key={heading}
                      className="pb-3 pr-4 text-[11px] font-black uppercase tracking-wider text-muted-foreground whitespace-nowrap border-b border-border/60"
                    >
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {report.rows.map((row) => (
                  <tr key={row.orderNumber} className="border-b border-border/40">
                    <td className="py-2.5 pr-4 tabular-nums text-muted-foreground">{row.lp}</td>
                    <td className="py-2.5 pr-4 font-mono font-bold whitespace-nowrap">
                      {row.orderNumber}
                    </td>
                    <td className="py-2.5 pr-4 whitespace-nowrap tabular-nums">{row.saleDate}</td>
                    <td className="py-2.5 pr-4 whitespace-nowrap tabular-nums">{row.paymentDate}</td>
                    <td className="py-2.5 pr-4 whitespace-nowrap">{row.buyer}</td>
                    <td className="py-2.5 pr-4 whitespace-nowrap text-muted-foreground">
                      {row.goods}
                    </td>
                    <td className="py-2.5 pr-4 whitespace-nowrap tabular-nums">
                      {formatPln(row.net)}
                    </td>
                    <td className="py-2.5 pr-4 whitespace-nowrap tabular-nums">{row.vatRate}%</td>
                    <td className="py-2.5 pr-4 whitespace-nowrap tabular-nums">
                      {formatPln(row.vat)}
                    </td>
                    <td className="py-2.5 pr-4 whitespace-nowrap tabular-nums font-extrabold">
                      {formatPln(row.gross)}
                    </td>
                    <td className="py-2.5 pr-4 whitespace-nowrap text-muted-foreground">
                      {row.paymentMethod}
                    </td>
                    <td className="py-2.5 pr-4 whitespace-nowrap font-mono text-xs text-muted-foreground">
                      {row.transactionId || "—"}
                    </td>
                  </tr>
                ))}
                <tr className="font-extrabold">
                  <td className="py-3 pr-4" />
                  <td className="py-3 pr-4">SUMA</td>
                  <td className="py-3 pr-4" colSpan={4} />
                  <td className="py-3 pr-4 tabular-nums">{formatPln(report.net)}</td>
                  <td className="py-3 pr-4" />
                  <td className="py-3 pr-4 tabular-nums">{formatPln(report.vat)}</td>
                  <td className="py-3 pr-4 tabular-nums">{formatPln(report.gross)}</td>
                  <td className="py-3 pr-4" colSpan={2} />
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </AdminLayout>
  );
}
