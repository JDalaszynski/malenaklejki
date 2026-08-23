"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Eye, EyeOff } from "lucide-react";

import { authErrorMessage, clearBrowserSession, googleSignIn, passwordSignIn } from "@/lib/auth/client";
import { registerWithPassword, startSession } from "@/app/actions/auth";
import { Divider, Field, FormAlert, GoogleButton, Input, SubmitButton } from "./fields";

const schema = z.object({
  firstName: z.string().trim().min(2, { message: "Imię jest wymagane" }).max(100),
  lastName: z.string().trim().max(100).optional(),
  email: z.string().email({ message: "Podaj poprawny adres e-mail" }),
  password: z
    .string()
    .min(8, { message: "Hasło musi mieć co najmniej 8 znaków" })
    .regex(/[A-Za-zĄĆĘŁŃÓŚŹŻąćęłńóśźż]/, { message: "Hasło musi zawierać literę" })
    .regex(/[0-9]/, { message: "Hasło musi zawierać cyfrę" }),
  marketingConsent: z.boolean(),
  termsAccepted: z.boolean().refine((v) => v === true, {
    message: "Akceptacja regulaminu jest wymagana",
  }),
});

type FormValues = z.infer<typeof schema>;

function safeReturnTo(raw: string | null): string {
  if (!raw) return "/konto";
  if (!raw.startsWith("/") || raw.startsWith("//")) return "/konto";
  return raw;
}

export function RegisterForm() {
  const router = useRouter();
  const params = useSearchParams();
  const returnTo = safeReturnTo(params.get("powrot"));

  const [formError, setFormError] = useState<string | null>(null);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { marketingConsent: false, termsAccepted: false, lastName: "" },
  });

  const onSubmit = async (values: FormValues) => {
    setFormError(null);

    const created = await registerWithPassword({
      ...values,
      lastName: values.lastName ?? "",
      termsAccepted: true as const,
    });

    if (!created.success) {
      setFormError(created.error);
      return;
    }

    // Konto powstało po stronie serwera — teraz logujemy w przeglądarce, żeby
    // od razu wejść na profil zamiast zmuszać do ręcznego logowania.
    try {
      const idToken = await passwordSignIn(values.email, values.password);
      const session = await startSession(idToken);
      await clearBrowserSession();

      if (!session.success) {
        router.push("/logowanie?zarejestrowano=1");
        return;
      }
      router.push(returnTo === "/konto" ? "/konto?powitanie=1" : returnTo);
      router.refresh();
    } catch {
      // Konto istnieje, tylko automatyczne logowanie się nie powiodło —
      // (albo adres był już zajęty i wysłaliśmy link do zmiany hasła).
      router.push("/logowanie?zarejestrowano=1");
    }
  };

  const onGoogle = async () => {
    setFormError(null);
    setGoogleLoading(true);
    try {
      const { idToken } = await googleSignIn();
      const result = await startSession(idToken);
      await clearBrowserSession();

      if (!result.success) {
        setFormError(result.error);
        return;
      }
      router.push(returnTo === "/konto" ? "/konto?powitanie=1" : returnTo);
      router.refresh();
    } catch (error) {
      setFormError(authErrorMessage((error as { code?: string })?.code));
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <GoogleButton onClick={onGoogle} loading={googleLoading} label="Kontynuuj przez Google" />

      <Divider label="albo e-mailem" />

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5" noValidate>
        {formError && <FormAlert>{formError}</FormAlert>}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <Field label="Imię" required error={errors.firstName?.message}>
            <Input autoComplete="given-name" {...register("firstName")} />
          </Field>
          <Field label="Nazwisko" error={errors.lastName?.message}>
            <Input autoComplete="family-name" {...register("lastName")} />
          </Field>
        </div>

        <Field label="Adres e-mail" required error={errors.email?.message}>
          <Input
            type="email"
            autoComplete="email"
            placeholder="jan@przyklad.pl"
            {...register("email")}
          />
        </Field>

        <Field
          label="Hasło"
          required
          error={errors.password?.message}
          hint="Minimum 8 znaków, w tym litera i cyfra."
        >
          <div className="relative">
            <Input
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              className="pr-12"
              {...register("password")}
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors cursor-pointer"
              aria-label={showPassword ? "Ukryj hasło" : "Pokaż hasło"}
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
        </Field>

        <div className="flex flex-col gap-3 pt-1">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              {...register("termsAccepted")}
              className="mt-1 w-5 h-5 rounded border-gray-300 text-foreground focus:ring-foreground shrink-0"
            />
            <span className="text-sm font-semibold text-muted-foreground leading-relaxed">
              Akceptuję{" "}
              <Link href="/regulamin" className="font-bold text-primary hover:underline" target="_blank">
                regulamin
              </Link>{" "}
              i{" "}
              <Link href="/polityka-prywatnosci" className="font-bold text-primary hover:underline" target="_blank">
                politykę prywatności
              </Link>
              <span className="text-destructive"> *</span>
            </span>
          </label>
          {errors.termsAccepted && (
            <p className="inline-block self-start bg-destructive/30 text-destructive-foreground text-xs font-bold px-3 py-1 rounded-lg border border-destructive/40">
              {errors.termsAccepted.message}
            </p>
          )}

          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              {...register("marketingConsent")}
              className="mt-1 w-5 h-5 rounded border-gray-300 text-foreground focus:ring-foreground shrink-0"
            />
            <span className="text-sm font-semibold text-muted-foreground leading-relaxed">
              Chcę dostawać e-maile o promocjach i nowych wzorach. Możesz zrezygnować w każdej chwili.
            </span>
          </label>
        </div>

        <SubmitButton loading={isSubmitting}>Załóż konto</SubmitButton>
      </form>
    </div>
  );
}
