"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Plus, Trash2, Wand2 } from "lucide-react";

import { createManualOrder, updateOrder } from "@/app/actions/admin";
import { PAYMENT_STATUSES } from "@/lib/orders/status";
import { FormAlert, SubmitButton } from "@/components/auth/fields";
import { Card } from "./AdminLayout";

const inputClass =
  "h-11 w-full rounded-xl border border-slate-300 dark:border-white/20 bg-background px-3 text-sm font-semibold focus-visible:outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20";

const schema = z.object({
  firstName: z.string().trim().min(1, { message: "Imię jest wymagane" }).max(100),
  lastName: z.string().trim().max(100),
  email: z.string().email({ message: "Podaj poprawny adres e-mail" }),
  phone: z.string().trim().max(30),
  deliveryMethod: z.string(),
  street: z.string().trim().max(100),
  building: z.string().trim().max(20),
  postalCode: z.string().trim().max(20),
  city: z.string().trim().max(100),
  lockerId: z.string().trim().max(100),
  lockerAddress: z.string().trim().max(250),
  wantsInvoice: z.boolean(),
  nip: z.string().trim().max(20),
  companyName: z.string().trim().max(200),
  paymentMethod: z.string(),
  shipping: z.number({ message: "Podaj kwotę" }).min(0).max(10000),
  internalNote: z.string().max(2000),
  source: z.string(),
  status: z.string(),
  createdAt: z.string(),
  paidAt: z.string(),
  items: z
    .array(
      z.object({
        id: z.string(),
        name: z.string().min(1, { message: "Nazwa pozycji jest wymagana" }).max(300),
        sheetQuantity: z.number({ message: "Podaj ilość" }).int().min(1).max(10000),
        pricePerSheet: z.number({ message: "Podaj cenę" }).min(0).max(100000),
        taxRate: z.number({ message: "Podaj stawkę" }).min(0).max(100),
      })
    )
    .min(1, { message: "Dodaj przynajmniej jedną pozycję" }),
});

export type OrderFormValues = z.infer<typeof schema>;

/** Typowa pozycja sklepu — jedno kliknięcie zamiast przepisywania z pamięci. */
const STANDARD_ITEM = {
  id: "",
  name: "Naklejki (1 szt.) wraz z dostawą",
  sheetQuantity: 1,
  pricePerSheet: 49,
  taxRate: 23,
};

function Field({
  label,
  error,
  children,
  className = "",
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <label className="text-sm font-bold mb-1.5 block">{label}</label>
      {children}
      {error && (
        <p className="inline-block bg-destructive/20 text-destructive text-xs font-bold px-2.5 py-1 rounded-lg mt-1.5">
          {error}
        </p>
      )}
    </div>
  );
}

export function OrderEditForm({
  mode,
  orderId,
  defaults,
}: {
  mode: "edit" | "create";
  orderId?: string;
  defaults: OrderFormValues;
}) {
  const router = useRouter();
  const [formError, setFormError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const {
    register,
    control,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<OrderFormValues>({ resolver: zodResolver(schema), defaultValues: defaults });

  const { fields, append, remove } = useFieldArray({ control, name: "items" });

  const deliveryMethod = watch("deliveryMethod");
  const wantsInvoice = watch("wantsInvoice");
  const status = watch("status");
  const items = watch("items");
  const shipping = watch("shipping");

  const subtotal = (items ?? []).reduce(
    (sum, item) => sum + (Number(item.pricePerSheet) || 0) * (Number(item.sheetQuantity) || 0),
    0
  );
  const total = subtotal + (Number(shipping) || 0);

  const onSubmit = async (values: OrderFormValues) => {
    setFormError(null);
    setSaved(false);

    const result =
      mode === "edit"
        ? await updateOrder({ ...values, orderId })
        : await createManualOrder(values);

    if (!result.success) {
      setFormError(result.error);
      return;
    }

    if (mode === "create" && "orderId" in result) {
      router.push(`/admin/zamowienia/${result.orderId}`);
      return;
    }

    setSaved(true);
    router.refresh();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6" noValidate>
      {formError && <FormAlert>{formError}</FormAlert>}
      {saved && <FormAlert tone="success">Zapisano zmiany w zamówieniu.</FormAlert>}

      {mode === "create" && (
        <Card title="Zamówienie" description="Dane potrzebne do rozliczenia i raportu.">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <Field label="Kanał sprzedaży">
              <select className={inputClass} {...register("source")}>
                <option value="manual">Dodane ręcznie</option>
                <option value="shop">Sklep</option>
                <option value="vinted">Vinted</option>
                <option value="allegro">Allegro</option>
                <option value="other">Inne</option>
              </select>
            </Field>
            <Field label="Status płatności">
              <select className={inputClass} {...register("status")}>
                {Object.entries(PAYMENT_STATUSES).map(([key, value]) => (
                  <option key={key} value={key}>
                    {value.label}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Data sprzedaży">
              <input type="date" className={inputClass} {...register("createdAt")} />
            </Field>
            {status === "PAID" && (
              <Field label="Data zapłaty">
                <input type="date" className={inputClass} {...register("paidAt")} />
              </Field>
            )}
          </div>
        </Card>
      )}

      <Card title="Klient">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Field label="Imię" error={errors.firstName?.message}>
            <input className={inputClass} {...register("firstName")} />
          </Field>
          <Field label="Nazwisko" error={errors.lastName?.message}>
            <input className={inputClass} {...register("lastName")} />
          </Field>
          <Field label="E-mail" error={errors.email?.message}>
            <input type="email" className={inputClass} {...register("email")} />
          </Field>
          <Field label="Telefon" error={errors.phone?.message}>
            <input className={inputClass} {...register("phone")} />
          </Field>
        </div>
      </Card>

      <Card title="Dostawa">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Field label="Metoda">
            <select className={inputClass} {...register("deliveryMethod")}>
              <option value="paczkomat">Paczkomat InPost</option>
              <option value="kurier">Kurier pod drzwi</option>
              <option value="vinted">Wysyłka Vinted</option>
              <option value="odbior">Odbiór osobisty</option>
            </select>
          </Field>

          {deliveryMethod === "kurier" && (
            <>
              <Field label="Ulica">
                <input className={inputClass} {...register("street")} />
              </Field>
              <Field label="Numer">
                <input className={inputClass} {...register("building")} />
              </Field>
              <Field label="Kod pocztowy">
                <input className={inputClass} placeholder="00-000" {...register("postalCode")} />
              </Field>
              <Field label="Miejscowość">
                <input className={inputClass} {...register("city")} />
              </Field>
            </>
          )}

          {deliveryMethod === "paczkomat" && (
            <>
              <Field label="Kod paczkomatu">
                <input className={inputClass} placeholder="POZ01A" {...register("lockerId")} />
              </Field>
              <Field label="Adres paczkomatu" className="lg:col-span-2">
                <input className={inputClass} {...register("lockerAddress")} />
              </Field>
            </>
          )}
        </div>
      </Card>

      <Card title="Płatność i faktura">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Field label="Metoda płatności">
            <select className={inputClass} {...register("paymentMethod")}>
              <option value="przelewy24">Przelewy24</option>
              <option value="blik">BLIK</option>
              <option value="przelew">Przelew tradycyjny</option>
              <option value="vinted">Vinted</option>
              <option value="manual">Inna / gotówka</option>
            </select>
          </Field>
          <Field label="Koszt dostawy (brutto)" error={errors.shipping?.message}>
            <input type="number" step="0.01" className={inputClass} {...register("shipping", { valueAsNumber: true })} />
          </Field>
        </div>

        <label className="flex items-center gap-3 cursor-pointer mt-5">
          <input
            type="checkbox"
            {...register("wantsInvoice")}
            className="w-5 h-5 rounded border-gray-300 text-foreground focus:ring-foreground shrink-0"
          />
          <span className="text-sm font-bold text-foreground">
            Wystawiona / do wystawienia faktura VAT
          </span>
        </label>
        <p className="text-xs font-medium text-muted-foreground mt-1.5 ml-8">
          Zamówienia z fakturą są domyślnie pomijane w ewidencji sprzedaży bezrachunkowej.
        </p>

        {wantsInvoice && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
            <Field label="Nazwa firmy">
              <input className={inputClass} {...register("companyName")} />
            </Field>
            <Field label="NIP nabywcy">
              <input className={inputClass} {...register("nip")} />
            </Field>
          </div>
        )}
      </Card>

      <Card
        title="Pozycje"
        description="Ceny brutto. Nazwa trafia do raportu i do BaseLinkera."
        actions={
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => append({ ...STANDARD_ITEM })}
              className="inline-flex items-center gap-1.5 rounded-xl text-xs font-bold bg-primary/10 text-primary border border-primary/30 hover:bg-primary/15 h-9 px-3 transition-colors cursor-pointer"
            >
              <Wand2 className="w-3.5 h-3.5" aria-hidden />
              Standardowa pozycja
            </button>
            <button
              type="button"
              onClick={() => append({ id: "", name: "", sheetQuantity: 1, pricePerSheet: 0, taxRate: 23 })}
              className="inline-flex items-center gap-1.5 rounded-xl text-xs font-bold bg-card border border-border/70 text-foreground hover:bg-muted/50 h-9 px-3 transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" aria-hidden />
              Pusta pozycja
            </button>
          </div>
        }
      >
        <div className="flex flex-col gap-3">
          {fields.map((field, index) => (
            <div
              key={field.id}
              className="grid grid-cols-1 sm:grid-cols-[1fr_90px_120px_90px_44px] gap-3 items-end p-3 rounded-xl border border-border/60 bg-muted/15"
            >
              <Field label="Nazwa" error={errors.items?.[index]?.name?.message}>
                <input className={inputClass} {...register(`items.${index}.name`)} />
              </Field>
              <Field label="Ilość">
                <input type="number" className={inputClass} {...register(`items.${index}.sheetQuantity`, { valueAsNumber: true })} />
              </Field>
              <Field label="Cena brutto">
                <input type="number" step="0.01" className={inputClass} {...register(`items.${index}.pricePerSheet`, { valueAsNumber: true })} />
              </Field>
              <Field label="VAT %">
                <input type="number" className={inputClass} {...register(`items.${index}.taxRate`, { valueAsNumber: true })} />
              </Field>
              <button
                type="button"
                onClick={() => remove(index)}
                disabled={fields.length === 1}
                aria-label="Usuń pozycję"
                className="h-11 w-11 flex items-center justify-center rounded-xl border border-border/70 text-muted-foreground hover:text-destructive hover:border-destructive/40 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Trash2 className="w-4 h-4" aria-hidden />
              </button>
            </div>
          ))}
        </div>

        {errors.items?.message && (
          <p className="inline-block bg-destructive/20 text-destructive text-xs font-bold px-2.5 py-1 rounded-lg mt-3">
            {errors.items.message}
          </p>
        )}

        <div className="mt-5 pt-4 border-t border-border/60 flex flex-col items-end gap-1 text-sm">
          <p className="font-medium text-muted-foreground tabular-nums">
            Pozycje: {subtotal.toFixed(2).replace(".", ",")} zł
          </p>
          <p className="font-medium text-muted-foreground tabular-nums">
            Dostawa: {(Number(shipping) || 0).toFixed(2).replace(".", ",")} zł
          </p>
          <p className="text-lg font-extrabold text-foreground tabular-nums">
            Razem: {total.toFixed(2).replace(".", ",")} zł
          </p>
        </div>
      </Card>

      <Card title="Notatka wewnętrzna" description="Widoczna tylko w panelu.">
        <textarea
          rows={3}
          {...register("internalNote")}
          className="w-full rounded-xl border border-slate-300 dark:border-white/20 bg-background px-3 py-2.5 text-sm font-semibold focus-visible:outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20"
        />
      </Card>

      <div className="sm:max-w-xs">
        <SubmitButton loading={isSubmitting}>
          {mode === "edit" ? "Zapisz zmiany" : "Dodaj zamówienie"}
        </SubmitButton>
      </div>
    </form>
  );
}
