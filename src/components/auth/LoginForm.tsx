"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Eye, EyeOff } from "lucide-react";

import { authErrorMessage, clearBrowserSession, googleSignIn, passwordSignIn } from "@/lib/auth/client";
import { checkLoginAttempt, clearLoginAttempts, startSession } from "@/app/actions/auth";
import { Divider, Field, FormAlert, GoogleButton, Input, SubmitButton } from "./fields";

const schema = z.object({
  email: z.string().email({ message: "Podaj poprawny adres e-mail" }),
  password: z.string().min(1, { message: "Podaj hasło" }),
});

type FormValues = z.infer<typeof schema>;

/**
 * Adres powrotu przychodzi z paska adresu, więc traktujemy go jak dane obce:
 * przepuszczamy tylko ścieżki wewnątrz sklepu. Bez tego link
 * `/logowanie?powrot=https://...` przerzuciłby zalogowaną osobę na obcą stronę.
 */
function safeReturnTo(raw: string | null): string {
  if (!raw) return "/konto";
  if (!raw.startsWith("/") || raw.startsWith("//")) return "/konto";
  return raw;
}

export function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const returnTo = safeReturnTo(params.get("powrot"));
  const passwordChanged = params.get("haslo-zmienione") === "1";
  const registered = params.get("zarejestrowano") === "1";

  const [formError, setFormError] = useState<string | null>(null);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const finish = (isAdmin: boolean) => {
    router.push(isAdmin && returnTo === "/konto" ? "/admin" : returnTo);
    router.refresh();
  };

  const onSubmit = async (values: FormValues) => {
    setFormError(null);

    const gate = await checkLoginAttempt(values.email);
    if (!gate.success) {
      setFormError(gate.error);
      return;
    }

    try {
      const idToken = await passwordSignIn(values.email, values.password);
      const result = await startSession(idToken);
      await clearBrowserSession();

      if (!result.success) {
        setFormError(result.error);
        return;
      }
      await clearLoginAttempts(values.email);
      finish(result.isAdmin);
    } catch (error) {
      setFormError(authErrorMessage((error as { code?: string })?.code));
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
      finish(result.isAdmin);
    } catch (error) {
      setFormError(authErrorMessage((error as { code?: string })?.code));
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {passwordChanged && (
        <FormAlert tone="success">
          Hasło zostało zmienione. Zaloguj się nowym hasłem.
        </FormAlert>
      )}
      {registered && (
        <FormAlert tone="success">
          Konto założone. Wysłaliśmy link potwierdzający na Twój adres e-mail.
        </FormAlert>
      )}

      <GoogleButton onClick={onGoogle} loading={googleLoading} label="Zaloguj się przez Google" />

      <Divider label="albo e-mailem" />

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5" noValidate>
        {formError && <FormAlert>{formError}</FormAlert>}

        <Field label="Adres e-mail" required error={errors.email?.message}>
          <Input
            type="email"
            autoComplete="email"
            placeholder="jan@przyklad.pl"
            {...register("email")}
          />
        </Field>

        <Field label="Hasło" required error={errors.password?.message}>
          <div className="relative">
            <Input
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
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

        <div className="flex justify-end -mt-2">
          <Link
            href="/haslo"
            className="text-sm font-bold text-primary hover:underline underline-offset-4"
          >
            Nie pamiętam hasła
          </Link>
        </div>

        <SubmitButton loading={isSubmitting}>Zaloguj się</SubmitButton>
      </form>
    </div>
  );
}
