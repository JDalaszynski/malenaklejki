import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { AdminLayout, Card, CollapsibleCard } from "@/components/admin/AdminLayout";
import { BaseLinkerButton, DangerZone, InvoiceControls } from "@/components/admin/OrderActions";
import { OrderEditForm } from "@/components/admin/OrderEditForm";
import { StatusControls } from "@/components/admin/StatusControls";
import { StatusPill } from "@/components/account/StatusPill";
import type { AuditEntry } from "@/lib/admin/audit";
import { filesDownloadUrl, productionFiles } from "@/lib/admin/orderFiles";
import type { AdminOrder } from "@/lib/admin/queries";
import { countSheets, orderStats } from "@/lib/admin/stats";
import { isBeforeInvoicing } from "@/lib/orders/invoicing";
import {
  formatDateTime,
  fulfillmentStatusOf,
  normalizePaymentStatus,
  paymentStatusOf,
} from "@/lib/orders/status";
import { DownloadButton } from "./DownloadButton";
import { OrderFiles, type SheetFile } from "./OrderFiles";
import { OrderInfoCard, ProfitCard } from "./OrderSummary";

const SOURCE_LABELS: Record<string, string> = {
  shop: "Sklep",
  manual: "Dodane ręcznie",
  allegro: "Allegro",
  other: "Inne",
};

function isoDateInput(iso: string | null): string {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 10);
}

/**
 * Cały ekran szczegółów zamówienia. Strona (`/admin/zamowienia/[id]`) tylko
 * sprawdza uprawnienia i pobiera dane — układ jest tutaj, żeby dało się go
 * obejrzeć na danych próbnych bez logowania do produkcyjnego panelu.
 *
 * Układ: dwie kolumny. Po lewej to, co się robi z zamówieniem (pliki,
 * statusy i maile, faktura), po prawej to, czego dotyczy (klient, dostawa,
 * pozycje, rachunek). Edycja pól i dziennik zmian są zwinięte pod spodem.
 */
export function OrderDetailView({
  order,
  audit,
  adminEmail,
}: {
  order: AdminOrder;
  audit: AuditEntry[];
  adminEmail: string;
}) {
  const payment = paymentStatusOf(order.status);
  const fulfillment = fulfillmentStatusOf(order.fulfillmentStatus);
  const isPaid = normalizePaymentStatus(order.status) === "PAID";
  const finance = orderStats(order);
  const sheets = countSheets(order);

  const files = productionFiles(order);
  const sheetFiles: SheetFile[] = order.items.flatMap((item, index) =>
    item.imageUrl
      ? [
          {
            number: index + 1,
            imageUrl: item.imageUrl,
            cutLinesImageUrl: item.cutLinesImageUrl,
            quantity: item.sheetQuantity,
            individual: item.deliveryForm === "individual",
            stickers: item.stickersPerSheet,
            hasLayout: item.hasLayout,
            downloadUrl: filesDownloadUrl(order.id, index + 1),
          },
        ]
      : []
  );

  const trash = order.deletedAt ? (
    <DangerZone orderId={order.id} orderNumber={order.orderNumber} inTrash />
  ) : null;

  return (
    <AdminLayout
      compact
      adminEmail={adminEmail}
      title={order.orderNumber}
      subtitle={`Złożone ${formatDateTime(order.createdAt)}`}
      meta={
        <div className="flex flex-wrap items-center gap-1.5">
          <StatusPill tone={payment.tone}>{payment.label}</StatusPill>
          <StatusPill tone={fulfillment.tone}>{fulfillment.label}</StatusPill>
          {order.billing.wantsInvoice && <StatusPill tone="info">Faktura VAT</StatusPill>}
          {order.deletedAt && <StatusPill tone="danger">W koszu</StatusPill>}
          {order.excludedFromStats && <StatusPill tone="warning">Poza statystykami</StatusPill>}
          <StatusPill tone="neutral">{SOURCE_LABELS[order.source] ?? order.source}</StatusPill>
        </div>
      }
      actions={
        <Link
          href={order.deletedAt ? "/admin/kosz" : "/admin"}
          className="inline-flex items-center gap-2 rounded-xl text-sm font-bold bg-card border border-border/70 text-foreground hover:bg-muted/50 h-10 px-4 transition-all"
        >
          <ArrowLeft className="w-4 h-4" aria-hidden />
          Lista zamówień
        </Link>
      }
    >
      {trash}

      <OrderInfoCard order={order} />

      <div className="grid gap-4 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] lg:items-start">
        <div className="flex flex-col gap-4 min-w-0">
          <Card
            dense
            title="Pliki produkcyjne"
            description={
              sheetFiles.length > 0
                ? `${sheetFiles.length} ${sheetFiles.length === 1 ? "arkusz" : "arkusze"} — kliknij miniaturę, żeby obejrzeć plik.`
                : undefined
            }
            actions={
              files.length > 0 ? (
                <DownloadButton
                  href={filesDownloadUrl(order.id)}
                  label={files.length > 1 ? "Pobierz pliki" : "Pobierz plik"}
                />
              ) : undefined
            }
          >
            {sheetFiles.length === 0 ? (
              <p className="text-sm font-medium text-muted-foreground">
                To zamówienie nie ma plików (dodane ręcznie).
              </p>
            ) : (
              <OrderFiles sheets={sheetFiles} />
            )}
          </Card>

          <div className="grid gap-4 sm:grid-cols-2 sm:items-start">
            <Card
              dense
              title="Faktura"
              description="inFakt wystawia ją sam po zaksięgowaniu płatności."
            >
              <InvoiceControls
                orderId={order.id}
                isPaid={isPaid}
                isHistorical={isBeforeInvoicing(order)}
                invoice={order.infakt}
              />
            </Card>

            <ProfitCard order={order} finance={finance} sheets={sheets} isPaid={isPaid} />
          </div>
        </div>

        <Card
          dense
          title="Realizacja"
          actions={<BaseLinkerButton orderId={order.id} baselinkerOrderId={order.baselinkerOrderId} />}
        >
          <StatusControls
            orderId={order.id}
            status={order.status}
            fulfillmentStatus={order.fulfillmentStatus}
            trackingNumber={order.trackingNumber}
            trackingUrl={order.trackingUrl}
            customerEmail={order.customer.email}
            inProductionEmailSentAt={order.inProductionEmailSentAt}
            shippedEmailSentAt={order.shippedEmailSentAt}
          />
        </Card>
      </div>

      <CollapsibleCard
        bare
        id="edycja"
        title="Edycja zamówienia"
        description="Dane klienta, dostawa, płatność, pozycje i notatka wewnętrzna."
      >
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
      </CollapsibleCard>

      <CollapsibleCard
        title="Dziennik zmian"
        description={
          audit.length === 0
            ? "Zamówienie nie było jeszcze modyfikowane w panelu."
            : `Kto, kiedy i co zmienił — ${audit.length} ${audit.length === 1 ? "wpis" : "wpisów"}.`
        }
      >
        {audit.length === 0 ? (
          <p className="text-sm font-medium text-muted-foreground">
            Brak zapisanych zmian — zamówienie nie było jeszcze modyfikowane w panelu.
          </p>
        ) : (
          <ul className="flex flex-col gap-3">
            {audit.map((entry) => (
              <li
                key={entry.id}
                className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-4 pb-3 border-b border-border/40 last:border-b-0 last:pb-0"
              >
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
      </CollapsibleCard>

      {!order.deletedAt && (
        <DangerZone orderId={order.id} orderNumber={order.orderNumber} inTrash={false} />
      )}
    </AdminLayout>
  );
}
