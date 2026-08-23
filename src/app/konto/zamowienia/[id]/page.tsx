import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArrowLeft, FileText, Truck } from "lucide-react";

import { AccountLayout, Panel } from "@/components/account/AccountLayout";
import { SheetActions } from "@/components/account/SheetActions";
import { StatusPill } from "@/components/account/StatusPill";
import { requireVerifiedUser } from "@/lib/auth/dal";
import { getUserOrder } from "@/lib/orders/queries";
import {
  DELIVERY_METHOD_LABELS,
  PAYMENT_METHOD_LABELS,
  formatDateTime,
  formatPln,
  fulfillmentStatusOf,
  paymentStatusOf,
} from "@/lib/orders/status";
import { getIndividualStickersLabel, getStickersNoun } from "@/lib/utils/polish";

export const metadata: Metadata = {
  title: "Szczegóły zamówienia — MałeNaklejki",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between gap-6 py-2 border-b border-border/40 last:border-b-0">
      <span className="text-sm font-bold text-muted-foreground shrink-0">{label}</span>
      <span className="text-sm font-semibold text-foreground text-right">{value}</span>
    </div>
  );
}

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await requireVerifiedUser(`/konto/zamowienia/${id}`);
  const order = await getUserOrder(id, session.uid);
  if (!order) notFound();

  const payment = paymentStatusOf(order.status);
  const fulfillment = fulfillmentStatusOf(order.fulfillmentStatus);

  const deliveryAddress =
    order.deliveryMethod === "paczkomat"
      ? `${order.delivery.lockerId ?? ""}${order.delivery.lockerAddress ? ` — ${order.delivery.lockerAddress}` : ""}`
      : [
          `${order.delivery.street ?? ""} ${order.delivery.building ?? ""}`.trim(),
          `${order.delivery.postalCode ?? ""} ${order.delivery.city ?? ""}`.trim(),
        ]
          .filter(Boolean)
          .join(", ");

  return (
    <AccountLayout
      title={order.orderNumber}
      subtitle={`Złożone ${formatDateTime(order.createdAt)}`}
      actions={
        <Link
          href="/konto/zamowienia"
          className="inline-flex items-center text-sm font-bold text-muted-foreground hover:text-primary transition-colors bg-card px-4 py-2.5 rounded-xl border border-border/60 self-start"
        >
          <ArrowLeft className="w-4 h-4 mr-2" aria-hidden />
          Wszystkie zamówienia
        </Link>
      }
    >
      <Panel>
        <div className="flex flex-wrap items-center gap-2">
          <StatusPill tone={payment.tone}>{payment.label}</StatusPill>
          {order.status === "PAID" && (
            <StatusPill tone={fulfillment.tone}>{fulfillment.label}</StatusPill>
          )}
          {order.trackingNumber && (
            <span className="inline-flex items-center gap-2 text-sm font-bold text-foreground bg-muted/50 border border-border/60 rounded-full px-3 py-1">
              <Truck className="w-4 h-4 text-primary" aria-hidden />
              Przesyłka: <span className="font-mono">{order.trackingNumber}</span>
            </span>
          )}
          {order.invoiceUrl && (
            <a
              href={order.invoiceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm font-bold text-primary bg-primary/10 border border-primary/30 rounded-full px-3 py-1 hover:bg-primary/15 transition-colors"
            >
              <FileText className="w-4 h-4" aria-hidden />
              Pobierz fakturę
            </a>
          )}
        </div>
      </Panel>

      <Panel title="Zamówione arkusze" description="Każdy arkusz możesz zamówić ponownie — trafi do koszyka jako nowa pozycja.">
        <div className="flex flex-col gap-4">
          {order.items.map((item, index) => (
            <div
              key={item.id}
              className="flex flex-col sm:flex-row gap-5 p-4 rounded-2xl border border-border/60 bg-muted/15"
            >
              <div className="w-28 h-28 shrink-0 bg-card rounded-xl overflow-hidden border border-border/40 p-2 flex items-center justify-center">
                {item.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={item.imageUrl}
                    alt={`Podgląd arkusza ${index + 1}`}
                    className="max-w-full max-h-full object-contain"
                    loading="lazy"
                  />
                ) : null}
              </div>

              <div className="flex-1 min-w-0 flex flex-col gap-3">
                <div>
                  <p className="font-extrabold text-foreground">Arkusz {index + 1}</p>
                  <p className="text-sm font-medium text-muted-foreground mt-1 leading-relaxed">
                    {item.stickersPerSheet}{" "}
                    {item.deliveryForm === "individual"
                      ? getIndividualStickersLabel(item.stickersPerSheet)
                      : getStickersNoun(item.stickersPerSheet)}
                    {" · "}
                    {item.deliveryForm === "individual"
                      ? "pocięte na pojedyncze sztuki"
                      : "pozostawione na arkuszu"}
                    {" · "}
                    {item.sheetQuantity} szt. &times; {formatPln(item.pricePerSheet)}
                  </p>
                </div>

                <SheetActions orderId={order.id} itemId={item.id} compact />
              </div>

              <div className="sm:text-right shrink-0">
                <p className="text-lg font-extrabold text-foreground">
                  {formatPln(item.pricePerSheet * item.sheetQuantity)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </Panel>

      <div className="grid gap-6 lg:grid-cols-2">
        <Panel title="Dostawa i płatność">
          <div className="flex flex-col">
            <Row
              label="Sposób dostawy"
              value={DELIVERY_METHOD_LABELS[order.deliveryMethod] ?? order.deliveryMethod ?? "—"}
            />
            <Row label="Adres" value={deliveryAddress || "—"} />
            <Row
              label="Płatność"
              value={PAYMENT_METHOD_LABELS[order.paymentMethod] ?? order.paymentMethod ?? "—"}
            />
            <Row label="Data opłacenia" value={formatDateTime(order.paidAt)} />
            <Row
              label="Odbiorca"
              value={`${order.customer.firstName} ${order.customer.lastName}`.trim() || "—"}
            />
            <Row label="Telefon" value={order.customer.phone || "—"} />
            {order.billing.wantsInvoice && (
              <>
                <Row label="Faktura na" value={order.billing.companyName || "—"} />
                <Row label="NIP" value={order.billing.nip || "—"} />
              </>
            )}
          </div>
        </Panel>

        <Panel title="Podsumowanie">
          <div className="flex flex-col">
            <Row label="Naklejki" value={formatPln(order.totals.subtotal)} />
            <Row label="Dostawa" value={formatPln(order.totals.shipping)} />
          </div>
          <div className="flex justify-between items-center pt-4 mt-3 border-t border-border/60">
            <span className="font-extrabold text-foreground">Razem</span>
            <span className="text-2xl font-extrabold text-primary">
              {formatPln(order.totals.total)}
            </span>
          </div>
        </Panel>
      </div>
    </AccountLayout>
  );
}
