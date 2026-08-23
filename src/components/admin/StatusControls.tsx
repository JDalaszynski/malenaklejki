"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, Loader2 } from "lucide-react";

import { updateOrderStatus } from "@/app/actions/admin";
import { FULFILLMENT_STATUSES, PAYMENT_STATUSES } from "@/lib/orders/status";
import { FormAlert } from "@/components/auth/fields";

const selectClass =
  "h-11 w-full rounded-xl border border-slate-300 dark:border-white/20 bg-background px-3 text-sm font-semibold focus-visible:outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20";

export function StatusControls({
  orderId,
  status,
  fulfillmentStatus,
  trackingNumber,
}: {
  orderId: string;
  status: string;
  fulfillmentStatus: string;
  trackingNumber: string | null;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [nextStatus, setNextStatus] = useState(status);
  const [nextFulfillment, setNextFulfillment] = useState(fulfillmentStatus);
  const [tracking, setTracking] = useState(trackingNumber ?? "");
  const [notify, setNotify] = useState(true);
  const [message, setMessage] = useState<{ tone: "success" | "error"; text: string } | null>(null);

  const becomingPaid = nextStatus === "PAID" && status !== "PAID";
  const dirty =
    nextStatus !== status ||
    nextFulfillment !== fulfillmentStatus ||
    tracking !== (trackingNumber ?? "");

  const save = () => {
    setMessage(null);
    startTransition(async () => {
      const result = await updateOrderStatus({
        orderId,
        status: nextStatus,
        fulfillmentStatus: nextFulfillment,
        trackingNumber: tracking,
        notify: becomingPaid && notify,
      });

      if (!result.success) {
        setMessage({ tone: "error", text: result.error });
        return;
      }
      setMessage({ tone: "success", text: "Zapisano." });
      router.refresh();
    });
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
            className="h-11 w-full rounded-xl border border-slate-300 dark:border-white/20 bg-background px-3 text-sm font-semibold focus-visible:outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20"
          />
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

      <div>
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
      </div>
    </div>
  );
}
