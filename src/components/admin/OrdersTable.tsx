import Link from "next/link";
import { Check, ExternalLink, Minus } from "lucide-react";

import type { AdminOrder } from "@/lib/admin/queries";
import { StatusPill } from "@/components/account/StatusPill";
import {
  DELIVERY_METHOD_LABELS,
  PAYMENT_METHOD_LABELS,
  formatDateTime,
  formatPln,
  paymentStatusOf,
} from "@/lib/orders/status";

/** Odhaczenie „tak/nie" — stan wynika z danych zamówienia, więc jest tylko do odczytu. */
function CheckCell({ checked, label }: { checked: boolean; label: string }) {
  return (
    <span
      role="img"
      aria-label={`${label}: ${checked ? "tak" : "nie"}`}
      title={checked ? "tak" : "nie"}
      className={`inline-flex items-center justify-center w-5 h-5 rounded-md border ${
        checked
          ? "border-primary/60 bg-primary/10 text-primary"
          : "border-border/60 bg-muted/25 text-muted-foreground/60"
      }`}
    >
      {checked ? (
        <Check className="w-3.5 h-3.5" aria-hidden />
      ) : (
        <Minus className="w-3.5 h-3.5" aria-hidden />
      )}
    </span>
  );
}

export function OrdersTable({
  orders,
  emptyMessage = "Brak zamówień dla wybranych filtrów.",
}: {
  orders: AdminOrder[];
  emptyMessage?: string;
}) {
  if (orders.length === 0) {
    return (
      <p className="text-sm font-medium text-muted-foreground py-8 text-center">{emptyMessage}</p>
    );
  }

  return (
    <div className="overflow-x-auto -mx-5 sm:-mx-6 px-5 sm:px-6">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="text-left">
            {["Numer", "Data", "Klient", "Kwota", "Płatność", "Base", "Faktura", "Metoda", ""].map(
              (heading) => (
                <th
                  key={heading}
                  className="pb-3 pr-4 text-[11px] font-black uppercase tracking-wider text-muted-foreground whitespace-nowrap border-b border-border/60"
                >
                  {heading}
                </th>
              )
            )}
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => {
            const payment = paymentStatusOf(order.status);
            const inBaselinker = order.baselinkerOrderId !== null;
            const hasInvoice = order.infakt?.status === "ISSUED" || Boolean(order.invoiceNumber);

            return (
              <tr key={order.id} className="border-b border-border/40 hover:bg-muted/25 transition-colors">
                <td className="py-3 pr-4 whitespace-nowrap">
                  <Link
                    href={`/admin/zamowienia/${order.id}`}
                    className="font-mono font-extrabold text-foreground hover:text-primary transition-colors"
                  >
                    {order.orderNumber}
                  </Link>
                  {order.billing.wantsInvoice && (
                    <span className="ml-2 text-[10px] font-black uppercase tracking-wider text-secondary">
                      FV
                    </span>
                  )}
                </td>
                <td className="py-3 pr-4 whitespace-nowrap font-medium text-muted-foreground tabular-nums">
                  {formatDateTime(order.createdAt)}
                </td>
                <td className="py-3 pr-4 max-w-[220px]">
                  <span className="block font-bold text-foreground truncate">
                    {`${order.customer.firstName} ${order.customer.lastName}`.trim() || "—"}
                  </span>
                  <span className="block text-xs font-medium text-muted-foreground truncate">
                    {order.customer.email}
                  </span>
                </td>
                <td className="py-3 pr-4 whitespace-nowrap font-extrabold text-foreground tabular-nums">
                  {formatPln(order.totals.total)}
                </td>
                <td className="py-3 pr-4">
                  <StatusPill tone={payment.tone}>{payment.label}</StatusPill>
                </td>
                <td className="py-3 pr-4">
                  <CheckCell checked={inBaselinker} label="BaseLinker" />
                </td>
                <td className="py-3 pr-4">
                  <CheckCell checked={hasInvoice} label="Faktura" />
                </td>
                <td className="py-3 pr-4 whitespace-nowrap text-xs font-semibold text-muted-foreground">
                  {PAYMENT_METHOD_LABELS[order.payment.method] ?? (order.payment.method || "—")}
                  <span className="block">
                    {DELIVERY_METHOD_LABELS[order.delivery.method] ?? order.delivery.method}
                  </span>
                </td>
                <td className="py-3 whitespace-nowrap">
                  <Link
                    href={`/admin/zamowienia/${order.id}`}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:underline"
                  >
                    Otwórz
                    <ExternalLink className="w-3.5 h-3.5" aria-hidden />
                  </Link>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
