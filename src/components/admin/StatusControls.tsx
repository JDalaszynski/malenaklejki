"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, Loader2, Mail } from "lucide-react";

import {
  updateOrderStatus,
  resendPaidOrderNotifications,
  sendCustomerStatusEmail,
} from "@/app/actions/admin";
import {
  FULFILLMENT_STATUSES,
  PAYMENT_STATUSES,
  formatDateTime,
  normalizePaymentStatus,
} from "@/lib/orders/status";
import { FormAlert } from "@/components/auth/fields";

const selectClass =
  "h-11 w-full rounded-xl border border-slate-300 dark:border-white/20 bg-background px-3 text-sm font-semibold focus-visible:outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20";

type CustomerEmailKind = "IN_PRODUCTION" | "SHIPPED";

/** Nazwy maili tak, jak widzi je klient w temacie wiadomości. */
const CUSTOMER_EMAILS: { kind: CustomerEmailKind; label: string }[] = [
  { kind: "IN_PRODUCTION", label: "Realizujemy Twoje zamówienie" },
  { kind: "SHIPPED", label: "Wysłane" },
];

function isCustomerEmailKind(value: string): value is CustomerEmailKind {
  return value === "IN_PRODUCTION" || value === "SHIPPED";
}

export function StatusControls({
  orderId,
  status,
  fulfillmentStatus,
  trackingNumber,
  trackingUrl,
  customerEmail,
  inProductionEmailSentAt,
  shippedEmailSentAt,
}: {
  orderId: string;
  status: string;
  fulfillmentStatus: string;
  trackingNumber: string | null;
  trackingUrl: string | null;
  customerEmail: string;
  inProductionEmailSentAt: string | null;
  shippedEmailSentAt: string | null;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [nextStatus, setNextStatus] = useState(status);
  const [nextFulfillment, setNextFulfillment] = useState(fulfillmentStatus);
  const [tracking, setTracking] = useState(trackingNumber ?? "");
  const [trackingLink, setTrackingLink] = useState(trackingUrl ?? "");
  const [notify, setNotify] = useState(true);
  const [notifyCustomer, setNotifyCustomer] = useState(true);
  const [message, setMessage] = useState<{ tone: "success" | "error"; text: string } | null>(null);
  const [isResending, startResendTransition] = useTransition();
  const [sendingKind, setSendingKind] = useState<CustomerEmailKind | null>(null);
  const [, startSendTransition] = useTransition();

  const becomingPaid = nextStatus === "PAID" && status !== "PAID";
  const paidAfterSave = normalizePaymentStatus(nextStatus) === "PAID";
  const fulfillmentEmailKind =
    nextFulfillment !== fulfillmentStatus && isCustomerEmailKind(nextFulfillment)
      ? nextFulfillment
      : null;
  const dirty =
    nextStatus !== status ||
    nextFulfillment !== fulfillmentStatus ||
    tracking !== (trackingNumber ?? "") ||
    trackingLink !== (trackingUrl ?? "");

  const sentAt: Record<CustomerEmailKind, string | null> = {
    IN_PRODUCTION: inProductionEmailSentAt,
    SHIPPED: shippedEmailSentAt,
  };
  const isPaid = normalizePaymentStatus(status) === "PAID";

  const save = () => {
    setMessage(null);
    startTransition(async () => {
      const result = await updateOrderStatus({
        orderId,
        status: nextStatus,
        fulfillmentStatus: nextFulfillment,
        trackingNumber: tracking,
        trackingUrl: trackingLink,
        notify: becomingPaid && notify,
        notifyCustomer: Boolean(fulfillmentEmailKind) && paidAfterSave && notifyCustomer,
      });

      if (!result.success) {
        setMessage({ tone: "error", text: result.error });
        return;
      }
      setMessage(
        result.notice
          ? { tone: "error", text: result.notice }
          : { tone: "success", text: "Zapisano." }
      );
      router.refresh();
    });
  };

  const resendNotifications = () => {
    setMessage(null);
    startResendTransition(async () => {
      const result = await resendPaidOrderNotifications(orderId);
      if (!result.success) {
        setMessage({ tone: "error", text: result.error });
        return;
      }
      setMessage({ tone: "success", text: "Powiadomienia wysłane ponownie." });
      router.refresh();
    });
  };

  const sendCustomerEmail = (kind: CustomerEmailKind, label: string) => {
    setMessage(null);
    setSendingKind(kind);
    startSendTransition(async () => {
      const result = await sendCustomerStatusEmail({ orderId, kind });
      setSendingKind(null);
      if (!result.success) {
        setMessage({ tone: "error", text: result.error });
        return;
      }
      setMessage({ tone: "success", text: `Mail „${label}” wysłany do klienta.` });
      router.refresh();
    });
  };

  /** Dlaczego przycisk wysyłki jest nieaktywny — albo null, gdy można wysyłać. */
  const sendBlocker = (kind: CustomerEmailKind): string | null => {
    if (!customerEmail) return "Zamówienie nie ma adresu e-mail.";
    if (!isPaid) return "Zamówienie nie jest opłacone.";
    if (fulfillmentStatus !== kind) {
      return `Dostępny przy zapisanym statusie „${FULFILLMENT_STATUSES[kind].label}”.`;
    }
    if (dirty) return "Najpierw zapisz zmiany w statusach.";
    return null;
  };

  return (
    <div className="flex flex-col gap-4">
      {message && <FormAlert tone={message.tone}>{message.text}</FormAlert>}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className="text-sm font-bold mb-2 block">Status płatności</label>
          <select
            className={selectClass}
            value={nextStatus}
            onChange={(event) => setNextStatus(event.target.value)}
          >
            {Object.entries(PAYMENT_STATUSES).map(([key, value]) => (
              <option key={key} value={key}>
                {value.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-sm font-bold mb-2 block">Status realizacji</label>
          <select
            className={selectClass}
            value={nextFulfillment}
            onChange={(event) => setNextFulfillment(event.target.value)}
          >
            {Object.entries(FULFILLMENT_STATUSES).map(([key, value]) => (
              <option key={key} value={key}>
                {value.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-sm font-bold mb-2 block">Numer przesyłki</label>
          <input
            value={tracking}
            onChange={(event) => setTracking(event.target.value)}
            placeholder="np. 6200000000000"
            className={selectClass}
          />
        </div>

        <div className="sm:col-span-3">
          <label htmlFor={`tracking-url-${orderId}`} className="text-sm font-bold mb-2 block">
            Link do śledzenia przesyłki
          </label>
          <input
            id={`tracking-url-${orderId}`}
            type="url"
            inputMode="url"
            value={trackingLink}
            onChange={(event) => setTrackingLink(event.target.value)}
            placeholder="https://inpost.pl/sledzenie-przesylek?number=…"
            className={selectClass}
          />
          <p className="text-xs font-medium text-muted-foreground mt-1.5">
            Trafia do maila „Wysłane” jako przycisk „Śledź przesyłkę” i do zamówienia w koncie klienta.
          </p>
        </div>
      </div>

      {becomingPaid && (
        <label className="flex items-start gap-3 cursor-pointer rounded-2xl border border-primary/30 bg-primary/5 px-4 py-3">
          <input
            type="checkbox"
            checked={notify}
            onChange={(event) => setNotify(event.target.checked)}
            className="mt-0.5 w-5 h-5 rounded border-gray-300 text-foreground focus:ring-foreground shrink-0"
          />
          <span className="text-sm font-semibold text-foreground leading-relaxed">
            Wyślij powiadomienia jak po płatności online — potwierdzenie do klienta i wiadomość
            do Ciebie z plikami produkcyjnymi. Płatność trafi też do BaseLinkera.
          </span>
        </label>
      )}

      {fulfillmentEmailKind && paidAfterSave && (
        <label className="flex items-start gap-3 cursor-pointer rounded-2xl border border-primary/30 bg-primary/5 px-4 py-3">
          <input
            type="checkbox"
            checked={notifyCustomer}
            onChange={(event) => setNotifyCustomer(event.target.checked)}
            className="mt-0.5 w-5 h-5 rounded border-gray-300 text-foreground focus:ring-foreground shrink-0"
          />
          <span className="text-sm font-semibold text-foreground leading-relaxed">
            {fulfillmentEmailKind === "IN_PRODUCTION"
              ? "Po zapisaniu wyślij klientowi mail „Realizujemy Twoje zamówienie”."
              : "Po zapisaniu wyślij klientowi mail „Wysłane”."}
            {fulfillmentEmailKind === "SHIPPED" && !trackingLink.trim() && (
              <span className="block text-xs font-bold text-[#8a6d00] dark:text-[#FFCD08] mt-1">
                Brak linku do śledzenia — mail pójdzie bez przycisku „Śledź przesyłkę”.
              </span>
            )}
          </span>
        </label>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={save}
          disabled={!dirty || isPending}
          className="inline-flex items-center justify-center gap-2 rounded-xl text-sm font-bold bg-primary text-primary-foreground hover:bg-primary/95 active:scale-[0.98] h-11 px-6 shadow-sm transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isPending ? (
            <Loader2 className="w-4 h-4 animate-spin" aria-hidden />
          ) : (
            <Check className="w-4 h-4" aria-hidden />
          )}
          Zapisz statusy
        </button>

        {status === "PAID" && (
          <button
            type="button"
            onClick={resendNotifications}
            disabled={isResending}
            className="inline-flex items-center justify-center gap-2 rounded-xl text-sm font-bold border border-slate-300 dark:border-white/20 bg-background hover:bg-slate-50 dark:hover:bg-white/5 active:scale-[0.98] h-11 px-6 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isResending && <Loader2 className="w-4 h-4 animate-spin" aria-hidden />}
            Wyślij ponownie mail o płatności
          </button>
        )}
      </div>

      <div className="mt-2 pt-5 border-t border-border/60">
        <p className="text-sm font-extrabold text-foreground">Maile do klienta</p>
        <p className="text-xs font-medium text-muted-foreground mt-0.5 break-all">
          {customerEmail ? `Adresat: ${customerEmail}` : "Brak adresu e-mail w zamówieniu."}
        </p>

        <ul className="flex flex-col gap-3 mt-3">
          {CUSTOMER_EMAILS.map(({ kind, label }) => {
            const blocker = sendBlocker(kind);
            const sending = sendingKind === kind;
            return (
              <li
                key={kind}
                className="flex flex-col sm:flex-row sm:items-center gap-3 rounded-2xl border border-border/60 bg-muted/15 px-4 py-3"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-extrabold text-foreground">„{label}”</p>
                  <p
                    className={`text-xs font-bold mt-0.5 ${sentAt[kind] ? "text-primary" : "text-muted-foreground"}`}
                  >
                    {sentAt[kind] ? `Wysłano ${formatDateTime(sentAt[kind])}` : "Jeszcze nie wysłano"}
                  </p>
                  {blocker && (
                    <p className="text-xs font-medium text-muted-foreground mt-0.5">{blocker}</p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => sendCustomerEmail(kind, label)}
                  disabled={Boolean(blocker) || sendingKind !== null}
                  className="self-start sm:self-auto inline-flex items-center justify-center gap-2 rounded-xl text-sm font-bold bg-card border border-border/70 text-foreground hover:bg-muted/50 hover:text-primary h-11 px-5 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
                >
                  {sending ? (
                    <Loader2 className="w-4 h-4 animate-spin" aria-hidden />
                  ) : (
                    <Mail className="w-4 h-4" aria-hidden />
                  )}
                  {sentAt[kind] ? "Wyślij ponownie" : "Wyślij"}
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
