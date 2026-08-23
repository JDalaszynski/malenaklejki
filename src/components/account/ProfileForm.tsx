"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Check } from "lucide-react";

import { updateProfile, type Profile } from "@/app/actions/profile";
import { Field, FormAlert, Input, SubmitButton } from "@/components/auth/fields";
import { Panel } from "./AccountLayout";

const schema = z.object({
  firstName: z.string().trim().min(2, { message: "Imię jest wymagane" }).max(100),
  lastName: z.string().trim().max(100),
  phone: z
    .string()
    .trim()
    .refine((v) => v === "" || /^[0-9+\s\-()]{7,20}$/.test(v), {
      message: "Podaj poprawny numer telefonu",
    }),
  street: z.string().trim().max(100),
  building: z.string().trim().max(20),
  postalCode: z
    .string()
    .trim()
    .refine((v) => v === "" || /^\d{2}-\d{3}$/.test(v), { message: "Format 00-000" }),
  city: z.string().trim().max(100),
  companyName: z.string().trim().max(200),
  nip: z
    .string()
    .trim()
    .refine((v) => v === "" || /^[0-9\s-]{10,20}$/.test(v), { message: "NIP to 10 cyfr" }),
  marketingConsent: z.boolean(),
});

type FormValues = z.infer<typeof schema>;

export function ProfileForm({ profile, email }: { profile: Profile; email: string }) {
  const [saved, setSaved] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      firstName: profile.firstName,
      lastName: profile.lastName,
      phone: profile.phone,
      street: profile.defaultAddress?.street ?? "",
      building: profile.defaultAddress?.building ?? "",
      postalCode: profile.defaultAddress?.postalCode ?? "",
      city: profile.defaultAddress?.city ?? "",
      companyName: profile.invoiceDetails?.companyName ?? "",
      nip: profile.invoiceDetails?.nip ?? "",
      marketingConsent: profile.marketingConsent,
    },
  });

  const onSubmit = async (values: FormValues) => {
    setFormError(null);
    setSaved(false);
    const result = await updateProfile(values);
    if (!result.success) {
      setFormError(result.error);
      return;
    }
    setSaved(true);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6" noValidate>
      {formError && <FormAlert>{formError}</FormAlert>}
      {saved && (
        <FormAlert tone="success">
          <span className="inline-flex items-center gap-2">
            <Check className="w-4 h-4" aria-hidden />
            Zapisane. Te dane podstawią się przy następnym zamówieniu.
          </span>
        </FormAlert>
      )}

      <Panel title="Dane kontaktowe">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <Field label="Imię" required error={errors.firstName?.message}>
            <Input autoComplete="given-name" {...register("firstName")} />
          </Field>
          <Field label="Nazwisko" error={errors.lastName?.message}>
            <Input autoComplete="family-name" {...register("lastName")} />
          </Field>
          <Field label="Telefon" error={errors.phone?.message}>
            <Input type="tel" autoComplete="tel" placeholder="600 100 200" {...register("phone")} />
          </Field>
          <Field label="Adres e-mail" hint="Adres zmienisz w zakładce Bezpieczeństwo.">
            <Input value={email} disabled readOnly />
          </Field>
        </div>
      </Panel>

      <Panel
        title="Domyślny adres dostawy"
        description="Uzupełnij, jeśli zwykle zamawiasz kuriera pod ten sam adres."
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div className="sm:col-span-2">
            <Field label="Ulica" error={errors.street?.message}>
              <Input autoComplete="address-line1" {...register("street")} />
            </Field>
          </div>
          <Field label="Numer domu / lokalu" error={errors.building?.message}>
            <Input {...register("building")} />
          </Field>
          <Field label="Kod pocztowy" error={errors.postalCode?.message}>
            <Input placeholder="00-000" autoComplete="postal-code" {...register("postalCode")} />
          </Field>
          <div className="sm:col-span-2">
            <Field label="Miejscowość" error={errors.city?.message}>
              <Input autoComplete="address-level2" {...register("city")} />
            </Field>
          </div>
        </div>
      </Panel>

      <Panel title="Dane do faktury" description="Wypełnij, jeśli zamawiasz na firmę.">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <Field label="Nazwa firmy" error={errors.companyName?.message}>
            <Input autoComplete="organization" {...register("companyName")} />
          </Field>
          <Field label="NIP" error={errors.nip?.message}>
            <Input placeholder="0000000000" {...register("nip")} />
          </Field>
        </div>
      </Panel>

      <Panel title="Zgody">
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            {...register("marketingConsent")}
            className="mt-1 w-5 h-5 rounded border-gray-300 text-foreground focus:ring-foreground shrink-0"
          />
          <span className="text-sm font-semibold text-muted-foreground leading-relaxed">
            Chcę dostawać e-maile o promocjach i nowych wzorach. Możesz wyłączyć to w każdej chwili.
          </span>
        </label>
      </Panel>

      <div className="sm:max-w-xs">
        <SubmitButton loading={isSubmitting}>Zapisz zmiany</SubmitButton>
      </div>
    </form>
  );
}
