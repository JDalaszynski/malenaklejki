"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2, Plus, Trash2 } from "lucide-react";

import { addManualSale, deleteManualSale } from "@/app/actions/admin";
import { FormAlert } from "@/components/auth/fields";
import { formatDate, formatPln } from "@/lib/orders/status";
import type { ManualSale } from "@/lib/admin/stats";
import { Card } from "./AdminLayout";

const inputClass =
  "h-11 w-full rounded-xl border border-slate-300 dark:border-white/20 bg-background px-3 text-sm font-semibold focus-visible:outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20";

/** Kwoty wpisuje się tak, jak się je mówi — „68,99" ma działać jak „68.99". */
const amountSchema = z
  .string()
  .max(20)
  .refine((value) => value.trim() === "" || !Number.isNaN(Number(value.replace(",", "."))), {
    message: "Kwota musi być liczbą",
  });

const schema = z.object({
  soldOn: z.string().min(1, { message: "Podaj datę sprzedaży" }),
  sheets: z
    .number({ message: "Podaj liczbę arkuszy" })
    .int({ message: "Podaj liczbę całkowitą" })
    .min(1, { message: "Minimum jeden arkusz" })
    .max(10000),
  amount: amountSchema,
  note: z.string().trim().max(200),
});

type FormValues = z.infer<typeof schema>;

/** Dzisiejsza data widziana z Polski — `sv-SE` daje gotowy format `RRRR-MM-DD`. */
function todayInWarsaw(): string {
  return new Date().toLocaleDateString("sv-SE", { timeZone: "Europe/Warsaw" });
}

function Field({
  label,
  hint,
  error,
  className = "",
  children,
}: {
  label: string;
  hint?: string;
  error?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={className}>
      <label className="text-sm font-bold mb-1.5 block">
        {label}
        {hint && <span className="font-medium text-muted-foreground"> {hint}</span>}
      </label>
      {children}
      {error && <p className="text-xs font-bold text-destructive mt-1">{error}</p>}
    </div>
  );
}

export function ManualSales({
  sales,
  profitPerSheet,
}: {
  sales: ManualSale[];
  /** Stawka z `lib/admin/stats` — moduł jest server-only, więc dostajemy ją propsem. */
  profitPerSheet: number;
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [added, setAdded] = useState<number | null>(null);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [isRemoving, startRemoving] = useTransition();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { soldOn: todayInWarsaw(), sheets: 1, amount: "", note: "" },
  });

  const onSubmit = async (values: FormValues) => {
    setError(null);
    setAdded(null);

    const result = await addManualSale({
      soldOn: values.soldOn,
      sheets: values.sheets,
      amount: values.amount.trim() === "" ? 0 : Number(values.amount.replace(",", ".")),
      note: values.note,
    });

    if (!result.success) {
      setError(result.error);
      return;
    }

    setAdded(values.sheets);
    reset({ soldOn: values.soldOn, sheets: 1, amount: "", note: "" });
    router.refresh();
  };

  const remove = (sale: ManualSale) => {
    if (!window.confirm(`Usunąć wpis na ${sale.sheets} ark. z ${formatDate(sale.soldAt)}?`)) return;
    setRemovingId(sale.id);
    setError(null);
    startRemoving(async () => {
      const result = await deleteManualSale(sale.id);
      setRemovingId(null);
      if (!result.success) {
        setError(result.error);
        return;
      }
      router.refresh();
    });
  };

  return (
    <Card
      title="Sprzedaż poza sklepem"
      description="Arkusze sprzedane mailem albo z ręki — dopisz je tutaj, a doliczą się do statystyk powyżej."
    >
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <Field label="Data sprzedaży" error={errors.soldOn?.message}>
            <input type="date" className={inputClass} {...register("soldOn")} />
          </Field>

          <Field label="Arkusze" error={errors.sheets?.message}>
            <input
              type="number"
              min={1}
              step={1}
              inputMode="numeric"
              className={inputClass}
              {...register("sheets", { valueAsNumber: true })}
            />
          </Field>

          <Field label="Kwota brutto" hint="(opcjonalnie)" error={errors.amount?.message}>
            <input
              type="text"
              inputMode="decimal"
              placeholder="np. 68,99"
              className={inputClass}
              {...register("amount")}
            />
          </Field>

          <Field label="Opis" hint="(opcjonalnie)" error={errors.note?.message}>
            <input
              type="text"
              placeholder="np. Kasia, zamówienie mailem"
              className={inputClass}
              {...register("note")}
            />
          </Field>
        </div>

        {error && <FormAlert>{error}</FormAlert>}
        {added !== null && !error && (
          <FormAlert tone="success">
            Dopisano {added} {added === 1 ? "arkusz" : "arkusze/arkuszy"} do statystyk.
          </FormAlert>
        )}

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center gap-2 rounded-xl text-sm font-bold bg-primary text-primary-foreground hover:bg-primary/95 active:scale-[0.98] h-11 px-5 shadow-sm transition-all disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
          >
            {isSubmitting ? (
              <Loader2 className="w-4 h-4 animate-spin" aria-hidden />
            ) : (
              <Plus className="w-4 h-4" aria-hidden />
            )}
            Dopisz sprzedaż
          </button>
          <p className="text-xs font-medium text-muted-foreground">
            Kwota wchodzi tylko do obrotu brutto — zysk liczy się od liczby arkuszy.
          </p>
        </div>
      </form>

      {sales.length > 0 && (
        <div className="mt-6 border-t border-border/60 pt-4">
          <p className="text-[11px] font-black uppercase tracking-wider text-muted-foreground mb-3">
            Dopisane wpisy ({sales.length})
          </p>
          <div
            aria-hidden
            className="hidden sm:flex items-center gap-x-4 pb-1.5 text-[11px] font-black uppercase tracking-wider text-muted-foreground"
          >
            <span className="w-24 shrink-0">Data</span>
            <span className="w-24 shrink-0">Arkusze</span>
            <span className="w-28 shrink-0">Zysk</span>
            <span className="w-28 shrink-0">Sprzedaż</span>
            <span className="flex-1 min-w-40">Opis</span>
          </div>
          <ul className="flex flex-col divide-y divide-border/40">
            {sales.map((sale) => (
              <li key={sale.id} className="flex flex-wrap items-center gap-x-4 gap-y-1 py-2.5">
                <span className="w-24 shrink-0 text-sm font-bold tabular-nums">
                  {formatDate(sale.soldAt)}
                </span>
                <span className="w-24 shrink-0 text-sm font-extrabold tabular-nums">
                  {sale.sheets} ark.
                </span>
                <span className="w-28 shrink-0 text-sm font-bold tabular-nums text-primary">
                  {formatPln(sale.sheets * profitPerSheet)}
                </span>
                <span className="w-28 shrink-0 text-sm font-medium tabular-nums text-muted-foreground">
                  {sale.amount ? formatPln(sale.amount) : "—"}
                </span>
                <span className="flex-1 min-w-40 text-sm font-medium text-muted-foreground truncate">
                  {sale.note || "—"}
                </span>
                <button
                  type="button"
                  onClick={() => remove(sale)}
                  disabled={isRemoving && removingId === sale.id}
                  aria-label={`Usuń wpis z ${formatDate(sale.soldAt)}`}
                  className="inline-flex items-center gap-1.5 rounded-lg text-xs font-bold text-muted-foreground hover:text-destructive hover:bg-destructive/10 px-2.5 py-1.5 transition-colors disabled:opacity-60 cursor-pointer"
                >
                  {isRemoving && removingId === sale.id ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" aria-hidden />
                  ) : (
                    <Trash2 className="w-3.5 h-3.5" aria-hidden />
                  )}
                  Usuń
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </Card>
  );
}
