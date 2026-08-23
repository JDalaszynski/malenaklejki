"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { MailCheck } from "lucide-react";

import { requestPasswordReset } from "@/app/actions/auth";
import { Field, FormAlert, Input, SubmitButton } from "./fields";

const schema = z.object({
  email: z.string().email({ message: "Podaj poprawny adres e-mail" }),
});

type FormValues = z.infer<typeof schema>;

export function ResetRequestForm() {
  const [sentTo, setSentTo] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const onSubmit = async (values: FormValues) => {
    setFormError(null);
    const result = await requestPasswordReset(values.email);
    if (!result.success) {
      setFormError(result.error);
      return;
    }
    setSentTo(values.email);
  };

  if (sentTo) {
    return (
      <div className="flex flex-col items-center text-center gap-4 py-2">
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
          <MailCheck className="w-8 h-8 text-primary" aria-hidden />
        </div>
        <h2 className="text-xl font-extrabold text-foreground">Sprawdź skrzynkę</h2>
        <p className="text-sm font-medium text-muted-foreground leading-relaxed max-w-sm">
          Jeśli konto o adresie <strong className="text-foreground">{sentTo}</strong> istnieje,
          wysłaliśmy na nie link do ustawienia nowego hasła. Link jest ważny przez godzinę.
        </p>
        <p className="text-sm font-medium text-muted-foreground">
          Nie ma wiadomości? Zajrzyj do folderu spam.
        </p>
        <Link
          href="/logowanie"
          className="mt-2 inline-flex items-center justify-center rounded-xl text-base font-bold bg-primary text-primary-foreground hover:bg-primary/95 active:scale-[0.98] h-12 px-8 shadow-sm transition-all"
        >
          Wróć do logowania
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5" noValidate>
      {formError && <FormAlert>{formError}</FormAlert>}

      <p className="text-sm font-medium text-muted-foreground leading-relaxed">
        Podaj adres e-mail przypisany do konta. Wyślemy na niego link, którym ustawisz nowe hasło.
      </p>

      <Field label="Adres e-mail" required error={errors.email?.message}>
        <Input type="email" autoComplete="email" placeholder="jan@przyklad.pl" {...register("email")} />
      </Field>

      <SubmitButton loading={isSubmitting}>Wyślij link</SubmitButton>
    </form>
  );
}
