import Link from "next/link";
import { ChevronRight, Package } from "lucide-react";

import type { CustomerOrder } from "@/lib/orders/queries";
import {
  fulfillmentStatusOf,
  formatDate,
  formatPln,
  paymentStatusOf,
} from "@/lib/orders/status";
import { StatusPill } from "./StatusPill";

export function OrderCard({ order }: { order: CustomerOrder }) {
  const payment = paymentStatusOf(order.status);
  const fulfillment = fulfillmentStatusOf(order.fulfillmentStatus);
  const sheets = order.items.reduce((sum, item) => sum + item.sheetQuantity, 0);

  return (
    <Link
      href={`/konto/zamowienia/${order.id}`}
      className="group block bg-card border border-border/70 rounded-2xl p-5 shadow-sm hover:shadow-md hover:border-primary/40 transition-all"
    >
      <div className="flex flex-col sm:flex-row sm:items-center gap-5">
        <div className="flex -space-x-3 shrink-0">
          {order.items.slice(0, 3).map((item) => (
            <div
              key={item.id}
              className="w-16 h-16 bg-muted/30 rounded-xl overflow-hidden border-2 border-card p-1.5 flex items-center justify-center"
            >
              {item.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={item.imageUrl}
                  alt=""
                  className="max-w-full max-h-full object-contain"
                  loading="lazy"
                />
              ) : (
                <Package className="w-6 h-6 text-muted-foreground" aria-hidden />
              )}
            </div>
          ))}
          {order.items.length > 3 && (
            <div className="w-16 h-16 rounded-xl border-2 border-card bg-muted/60 flex items-center justify-center text-xs font-black text-muted-foreground">
              +{order.items.length - 3}
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <p className="font-mono text-sm font-extrabold text-foreground">{order.orderNumber}</p>
          <p className="text-sm font-medium text-muted-foreground mt-0.5">
            {formatDate(order.createdAt)} &middot; {sheets}{" "}
            {sheets === 1 ? "arkusz" : sheets < 5 ? "arkusze" : "arkuszy"}
          </p>
          <div className="flex flex-wrap gap-2 mt-3">
            <StatusPill tone={payment.tone}>{payment.label}</StatusPill>
            {order.status === "PAID" && (
              <StatusPill tone={fulfillment.tone}>{fulfillment.label}</StatusPill>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3 sm:flex-col sm:items-end sm:gap-1 shrink-0">
          <p className="text-xl font-extrabold text-foreground">{formatPln(order.totals.total)}</p>
          <span className="inline-flex items-center text-sm font-bold text-primary group-hover:gap-1.5 gap-1 transition-all">
            Szczegóły
            <ChevronRight className="w-4 h-4" aria-hidden />
          </span>
        </div>
      </div>
    </Link>
  );
}
