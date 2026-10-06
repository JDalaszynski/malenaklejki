import Link from "next/link";
import { AtSign, Phone, StickyNote } from "lucide-react";

import { Card } from "@/components/admin/AdminLayout";
import { StatsExclusionToggle } from "@/components/admin/OrderActions";
import { ProfitBreakdown } from "@/components/admin/ProfitStats";
import type { AdminOrder } from "@/lib/admin/queries";
import type { PeriodStats } from "@/lib/admin/stats";
import { DELIVERY_METHOD_LABELS, PAYMENT_METHOD_LABELS, formatPln } from "@/lib/orders/status";
import { CopyButton } from "./CopyButton";
import { OpenEditorButton } from "./OpenEditorButton";

function Label({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[11px] font-black uppercase tracking-wider text-muted-foreground mb-1.5">
      {children}
    </p>
  );
}

/** Wiersz z wartością i przyciskiem kopiowania po prawej. */
function CopyRow({
  value,
  copyLabel,
  children,
}: {
  value: string;
  copyLabel: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-2 min-w-0">
      <div className="min-w-0">{children}</div>
      {value && <CopyButton value={value} label={copyLabel} />}
    </div>
  );
}

function deliveryLines(order: AdminOrder): { title: string; lines: string[]; copy: string } {
  const { delivery } = order;
  const title = DELIVERY_METHOD_LABELS[delivery.method] ?? (delivery.method || "Nie podano");

  if (delivery.method === "paczkomat") {
    const lines = [delivery.lockerId, delivery.lockerAddress].filter(Boolean);
    return { title, lines, copy: lines.join(", ") };
  }

  const street = [delivery.street, delivery.building].filter(Boolean).join(" ");
  const place = [delivery.postalCode, delivery.city].filter(Boolean).join(" ");
  const lines = [street, place].filter(Boolean);
  return { title, lines, copy: lines.join(", ") };
}

/**
 * Wszystko, co trzeba wiedzieć o zamówieniu, zanim się je ruszy: kto, dokąd,
 * jak zapłacił i ile. Cztery kolumny w jednym pasku zamiast czterech kart pod
 * sobą — to ten pasek decyduje, czy podstawowe dane mieszczą się na ekranie.
 *
 * Dane tylko do odczytu; edycja siedzi w zwiniętym formularzu pod spodem.
 */
export function OrderInfoCard({ order }: { order: AdminOrder }) {
  const name = `${order.customer.firstName} ${order.customer.lastName}`.trim();
  const delivery = deliveryLines(order);
  const { billing, totals } = order;
  const itemsTotal = order.items.reduce((sum, item) => sum + item.pricePerSheet * item.sheetQuantity, 0);

  return (
    <Card dense>
      <div className="grid gap-x-6 gap-y-5 sm:grid-cols-2 xl:grid-cols-[1.15fr_1fr_1fr_1fr] xl:divide-x xl:divide-border/60">
        <div className="min-w-0">
          <div className="flex items-start justify-between gap-2">
            <Label>Klient</Label>
            <div className="-mt-1.5 xl:hidden">
              <OpenEditorButton targetId="edycja">Edytuj</OpenEditorButton>
            </div>
          </div>
          <p className="text-base font-extrabold text-foreground truncate">{name || "—"}</p>
          {order.userId ? (
            <Link
              href={`/admin/uzytkownicy/${order.userId}`}
              className="text-xs font-bold text-primary hover:underline"
            >
              Konto klienta
            </Link>
          ) : (
            <span className="text-xs font-medium text-muted-foreground">Zamówienie gościa</span>
          )}

          <div className="mt-2 flex flex-col text-sm font-semibold">
            <CopyRow value={order.customer.email} copyLabel="Kopiuj e-mail">
              {order.customer.email ? (
                <a
                  href={`mailto:${order.customer.email}`}
                  className="inline-flex items-center gap-1.5 break-all hover:text-primary hover:underline"
                >
                  <AtSign className="w-3.5 h-3.5 shrink-0 text-muted-foreground" aria-hidden />
                  {order.customer.email}
                </a>
              ) : (
                <span className="text-muted-foreground">Brak e-maila</span>
              )}
            </CopyRow>
            <CopyRow value={order.customer.phone} copyLabel="Kopiuj telefon">
              {order.customer.phone ? (
                <a
                  href={`tel:${order.customer.phone.replace(/\s/g, "")}`}
                  className="inline-flex items-center gap-1.5 tabular-nums hover:text-primary hover:underline"
                >
                  <Phone className="w-3.5 h-3.5 shrink-0 text-muted-foreground" aria-hidden />
                  {order.customer.phone}
                </a>
              ) : (
                <span className="text-muted-foreground">Brak telefonu</span>
              )}
            </CopyRow>
          </div>
        </div>

        <div className="min-w-0 xl:pl-6">
          <Label>Dostawa</Label>
          <CopyRow value={delivery.copy} copyLabel="Kopiuj adres dostawy">
            <p className="text-sm font-extrabold text-foreground">{delivery.title}</p>
            {delivery.lines.map((line, index) => (
              <p
                key={line}
                className={`text-sm ${
                  index === 0 && order.delivery.method === "paczkomat"
                    ? "font-mono font-extrabold text-foreground"
                    : "font-medium text-muted-foreground"
                }`}
              >
                {line}
              </p>
            ))}
          </CopyRow>
          {delivery.lines.length === 0 && order.delivery.method !== "odbior" && (
            <p className="text-xs font-bold text-destructive mt-0.5">Brak adresu dostawy</p>
          )}
        </div>

        <div className="min-w-0 xl:pl-6">
          <Label>Płatność</Label>
          <p className="text-sm font-extrabold text-foreground">
            {PAYMENT_METHOD_LABELS[order.payment.method] ?? (order.payment.method || "—")}
          </p>
          {order.payment.transactionId && (
            <p className="text-xs font-medium font-mono text-muted-foreground">
              ID {order.payment.transactionId}
            </p>
          )}
          {billing.wantsInvoice ? (
            <div className="mt-2">
              <p className="text-sm font-bold text-foreground truncate" title={billing.companyName ?? ""}>
                {billing.companyName || "Faktura VAT"}
              </p>
              {billing.nip && (
                <p className="text-xs font-medium font-mono text-muted-foreground">NIP {billing.nip}</p>
              )}
            </div>
          ) : (
            <p className="mt-2 text-xs font-medium text-muted-foreground">Bez faktury VAT</p>
          )}
        </div>

        <div className="min-w-0 xl:pl-6">
          <div className="flex items-start justify-between gap-2">
            <Label>Do zapłaty</Label>
            <div className="-mt-1.5 hidden xl:block">
              <OpenEditorButton targetId="edycja">Edytuj</OpenEditorButton>
            </div>
          </div>
          <dl className="flex flex-col gap-0.5 text-sm">
            {order.items.map((item, index) => (
              <div key={item.id} className="flex justify-between gap-3">
                <dt
                  className="min-w-0 truncate font-medium text-muted-foreground"
                  title={item.name}
                >
                  {order.items.length > 1 ? `Arkusz ${index + 1}` : "Naklejki"} · {item.sheetQuantity} ×{" "}
                  {formatPln(item.pricePerSheet)}
                </dt>
                <dd className="shrink-0 font-semibold tabular-nums">
                  {formatPln(item.pricePerSheet * item.sheetQuantity)}
                </dd>
              </div>
            ))}
            <div className="flex justify-between gap-3">
              <dt className="font-medium text-muted-foreground">Dostawa</dt>
              <dd className="font-semibold tabular-nums">{formatPln(totals.shipping)}</dd>
            </div>
            <div className="flex justify-between gap-3 border-t border-border/60 pt-1.5 mt-1">
              <dt className="font-extrabold self-center">Razem</dt>
              <dd className="text-xl font-extrabold tabular-nums text-primary">
                {formatPln(totals.total || itemsTotal + totals.shipping)}
              </dd>
            </div>
          </dl>
        </div>
      </div>

      {order.internalNote && (
        <div className="mt-4 flex gap-2.5 rounded-xl border border-[#FFCD08]/40 bg-[#FFCD08]/10 px-3 py-2">
          <StickyNote className="w-4 h-4 shrink-0 mt-0.5 text-[#8a6d00] dark:text-[#FFCD08]" aria-hidden />
          <p className="min-w-0 text-sm font-medium text-foreground whitespace-pre-wrap break-words">
            <span className="font-black uppercase tracking-wider text-[11px] text-[#8a6d00] dark:text-[#FFCD08] mr-2">
              Notatka
            </span>
            {order.internalNote}
          </p>
        </div>
      )}
    </Card>
  );
}

function Stat({ label, value, strong = false }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="min-w-0">
      <dt className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">{label}</dt>
      <dd
        className={`mt-0.5 text-base font-extrabold tabular-nums ${strong ? "text-primary" : "text-foreground"}`}
      >
        {value}
      </dd>
    </div>
  );
}

/**
 * Ile zostaje na czysto: cztery liczby od razu, pełny rachunek na żądanie.
 * Przy nieopłaconym zamówieniu to prognoza — do statystyk nie wchodzi.
 */
export function ProfitCard({
  order,
  finance,
  sheets,
  isPaid,
}: {
  order: AdminOrder;
  finance: PeriodStats;
  sheets: number;
  isPaid: boolean;
}) {
  return (
    <Card
      dense
      title="Rachunek"
      description={
        isPaid
          ? `Co zostaje z tego zamówienia (${sheets} ark.)`
          : `Prognoza na ${sheets} ark. — nieopłacone, poza statystykami`
      }
    >
      <dl className="grid grid-cols-2 gap-x-4 gap-y-3">
        <Stat label="Wpłata brutto" value={formatPln(finance.gross)} />
        <Stat label="Przychód netto" value={formatPln(finance.netRevenue)} />
        <Stat label="Koszty" value={`−${formatPln(finance.costTotal)}`} />
        <Stat label={`Zysk · marża ${finance.margin}%`} value={formatPln(finance.profit)} strong />
      </dl>

      <details className="group mt-3 rounded-xl border border-border/60 bg-muted/10">
        <summary className="flex items-center justify-between gap-3 px-3 py-2 cursor-pointer list-none [&::-webkit-details-marker]:hidden text-xs font-extrabold rounded-xl hover:bg-muted/20 transition-colors">
          Pełny rachunek i statystyki
          <span aria-hidden className="text-muted-foreground transition-transform group-open:rotate-180">
            ▾
          </span>
        </summary>
        <div className="px-3 pb-3 pt-2 flex flex-col gap-4">
          <ProfitBreakdown stats={finance} stacked />
          <StatsExclusionToggle orderId={order.id} excluded={order.excludedFromStats} />
        </div>
      </details>
    </Card>
  );
}
