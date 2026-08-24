import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArrowLeft, Download, FileText } from "lucide-react";

import { AdminLayout, Card } from "@/components/admin/AdminLayout";
import { BaseLinkerButton, DangerZone, InvoiceControls } from "@/components/admin/OrderActions";
import { OrderEditForm } from "@/components/admin/OrderEditForm";
import { StatusControls } from "@/components/admin/StatusControls";
import { StatusPill } from "@/components/account/StatusPill";
import { requireAdmin } from "@/lib/auth/dal";
import { getOrder } from "@/lib/admin/queries";
import { listAuditForOrder } from "@/lib/admin/audit";
import { isBeforeInvoicing } from "@/lib/orders/invoicing";
import {
  formatDateTime,
  formatPln,
  fulfillmentStatusOf,
  normalizePaymentStatus,
  paymentStatusOf,
} from "@/lib/orders/status";

export const metadata: Metadata = {
  title: "Panel — zamówienie",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";
// Ręczne wystawienie faktury czeka na odpowiedź inFaktu.
export const maxDuration = 30;

function isoDateInput(iso: string | null): string {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 10);
}

export default async function AdminOrderPage({ params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin();
  const { id } = await params;

  const order = await getOrder(id);
  if (!order) notFound();

  const audit = await listAuditForOrder(id);
  const payment = paymentStatusOf(order.status);
  const fulfillment = fulfillmentStatusOf(order.fulfillmentStatus);

  return (
    <AdminLayout
      adminEmail={admin.email ?? ""}
      title={order.orderNumber}
      subtitle={`${formatDateTime(order.createdAt)} · ${formatPln(order.totals.total)} · ${order.customer.email}`}
      actions={
        <Link
          href="/admin"
          className="inline-flex items-center gap-2 rounded-xl text-sm font-bold bg-card border border-border/70 text-foreground hover:bg-muted/50 h-11 px-5 transition-all"
        >
          <ArrowLeft className="w-4 h-4" aria-hidden />
          Lista zamówień
        </Link>
      }
    >
      <Card>
        <div className="flex flex-wrap items-center gap-2">
          <StatusPill tone={payment.tone}>{payment.label}</StatusPill>
          <StatusPill tone={fulfillment.tone}>{fulfillment.label}</StatusPill>
          {order.billing.wantsInvoice && <StatusPill tone="info">Faktura VAT</StatusPill>}
          {order.deletedAt && <StatusPill tone="danger">W koszu</StatusPill>}
          <StatusPill tone="neutral">Źródło: {order.source}</StatusPill>
          {order.userId ? (
            <StatusPill tone="success">Przypisane do konta</StatusPill>
          ) : (
            <StatusPill tone="neutral">Zamówienie gościa</StatusPill>
          )}
        </div>
      </Card>

      <Card title="Statusy" description="Ręczna zmiana działa tak samo jak zaksięgowanie płatności online.">
        <StatusControls
          orderId={order.id}
          status={order.status}
          fulfillmentStatus={order.fulfillmentStatus}
          trackingNumber={order.trackingNumber}
        />
      </Card>

      <Card
        title="Faktura"
        description="inFakt wystawia ją automatycznie po zaksięgowaniu płatności. Faktura nigdzie nie jest wysyłana."
      >
        <InvoiceControls
          orderId={order.id}
          isPaid={normalizePaymentStatus(order.status) === "PAID"}
          isHistorical={isBeforeInvoicing(order)}
          invoice={order.infakt}
        />
      </Card>

      <Card
        title="Pliki produkcyjne"
        description="Podgląd i wersja z liniami cięcia. Lista zamówień celowo ich nie ładuje."
        actions={<BaseLinkerButton orderId={order.id} baselinkerOrderId={order.baselinkerOrderId} />}
      >
        {order.items.every((item) => !item.imageUrl) ? (
          <p className="text-sm font-medium text-muted-foreground">
            To zamówienie nie ma plików (dodane ręcznie).
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {order.items.map((item, index) => (
              <div key={item.id} className="rounded-2xl border border-border/60 bg-muted/15 p-4">
                <div className="h-32 bg-card rounded-xl border border-border/40 p-2 flex items-center justify-center overflow-hidden">
                  {item.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={item.imageUrl}
                      alt={`Arkusz ${index + 1}`}
                      className="max-w-full max-h-full object-contain"
                      loading="lazy"
                    />
                  ) : (
                    <span className="text-xs font-bold text-muted-foreground">Brak podglądu</span>
                  )}
                </div>

                <p className="font-extrabold text-sm text-foreground mt-3">Arkusz {index + 1}</p>
                <p className="text-xs font-medium text-muted-foreground mt-0.5">
                  {item.sheetQuantity} szt. ·{" "}
                  {item.deliveryForm === "individual" ? "pocięte na sztuki" : "na arkuszu"}
                  {item.hasLayout ? " · układ zapisany" : ""}
                </p>

                <div className="flex flex-wrap gap-2 mt-3">
                  {item.imageUrl && (
                    <a
                      href={item.imageUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:underline"
                    >
                      <Download className="w-3.5 h-3.5" aria-hidden />
                      Do druku
                    </a>
                  )}
                  {item.cutLinesImageUrl && (
                    <a
                      href={item.cutLinesImageUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-secondary hover:underline"
                    >
                      <FileText className="w-3.5 h-3.5" aria-hidden />
                      Linie cięcia
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      <OrderEditForm
        mode="edit"
        orderId={order.id}
        defaults={{
          firstName: order.customer.firstName,
          lastName: order.customer.lastName,
          email: order.customer.email,
          phone: order.customer.phone,
          deliveryMethod: order.delivery.method || "paczkomat",
          street: order.delivery.street,
          building: order.delivery.building,
          postalCode: order.delivery.postalCode,
          city: order.delivery.city,
          lockerId: order.delivery.lockerId,
          lockerAddress: order.delivery.lockerAddress,
          wantsInvoice: order.billing.wantsInvoice,
          nip: order.billing.nip ?? "",
          companyName: order.billing.companyName ?? "",
          paymentMethod: order.payment.method || "przelewy24",
          shipping: order.totals.shipping,
          internalNote: order.internalNote ?? "",
          source: order.source,
          status: order.status,
          createdAt: isoDateInput(order.createdAt),
          paidAt: isoDateInput(order.paidAt),
          items: order.items.map((item) => ({
            id: item.id,
            name: item.name,
            sheetQuantity: item.sheetQuantity,
            pricePerSheet: item.pricePerSheet,
            taxRate: item.taxRate,
          })),
        }}
      />

      <Card title="Dziennik zmian" description="Kto, kiedy i co zmienił w tym zamówieniu.">
        {audit.length === 0 ? (
          <p className="text-sm font-medium text-muted-foreground">
            Brak zapisanych zmian — zamówienie nie było jeszcze modyfikowane w panelu.
          </p>
        ) : (
          <ul className="flex flex-col gap-3">
            {audit.map((entry) => (
              <li key={entry.id} className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-4 pb-3 border-b border-border/40 last:border-b-0 last:pb-0">
                <span className="text-xs font-mono font-semibold text-muted-foreground whitespace-nowrap tabular-nums">
                  {formatDateTime(entry.at)}
                </span>
                <span className="flex-1 text-sm">
                  <span className="font-extrabold text-foreground">{entry.action}</span>
                  {entry.details && (
                    <span className="text-muted-foreground font-medium"> — {entry.details}</span>
                  )}
                  <span className="block text-xs font-medium text-muted-foreground mt-0.5">
                    {entry.actorEmail}
                  </span>
                </span>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <DangerZone
        orderId={order.id}
        orderNumber={order.orderNumber}
        inTrash={Boolean(order.deletedAt)}
      />
    </AdminLayout>
  );
}
