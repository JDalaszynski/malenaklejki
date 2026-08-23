"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { applyActionCode, checkActionCode, confirmPasswordReset, verifyPasswordResetCode } from "firebase/auth";
import { CheckCircle2, Eye, EyeOff, Loader2, XCircle } from "lucide-react";

import { getClientAuth } from "@/lib/firebase/client";
import { authErrorMessage } from "@/lib/auth/client";
import { completeEmailVerification } from "@/app/actions/auth";
import { Field, FormAlert, Input, SubmitButton } from "./fields";

type Phase =
  | { kind: "working" }
  | { kind: "password"; email: string }
  | { kind: "done"; title: string; message: string; cta: { href: string; label: string } }
  | { kind: "error"; message: string };

const passwordSchema = z.object({
  password: z
    .string()
    .min(8, { message: "Hasło musi mieć co najmniej 8 znaków" })
    .regex(/[A-Za-zĄĆĘŁŃÓŚŹŻąćęłńóśźż]/, { message: "Hasło musi zawierać literę" })
    .regex(/[0-9]/, { message: "Hasło musi zawierać cyfrę" }),
});

type PasswordValues = z.infer<typeof passwordSchema>;

/**
 * Obsługa linków wysyłanych z maili systemowych (potwierdzenie adresu, nowe
 * hasło, zmiana adresu). W konsoli Firebase adres tej strony jest ustawiony
 * jako „action URL", dzięki czemu linki prowadzą na malenaklejki.pl,
 * a nie na firebaseapp.com.
 *
 * Parametr `continueUrl` z adresu celowo ignorujemy — pochodzi z zewnątrz,
 * a przekierowanie pod dowolny adres byłoby gotowym narzędziem do phishingu.
 */
export function ActionHandler() {
  const params = useSearchParams();
  const router = useRouter();
  const mode = params.get("mode");
  const oobCode = params.get("oobCode");

  const [phase, setPhase] = useState<Phase>({ kind: "working" });
  const [formError, setFormError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const handled = useRef(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<PasswordValues>({ resolver: zodResolver(passwordSchema) });

  const run = useCallback(async () => {
    if (!mode || !oobCode) {
      setPhase({
        kind: "error",
        message: "Ten link jest niekompletny. Otwórz go bezpośrednio z wiadomości e-mail.",
      });
      return;
    }

    try {
      switch (mode) {
        case "verifyEmail": {
          await applyActionCode(getClientAuth(), oobCode);
          const result = await completeEmailVerification();
          const linked = result.success ? result.linkedOrders : 0;
          setPhase({
            kind: "done",
            title: "Adres e-mail potwierdzony",
            message:
              linked > 0
                ? `Wszystko gotowe. Znaleźliśmy ${linked} ${linked === 1 ? "wcześniejsze zamówienie" : "wcześniejszych zamówień"} złożone na ten adres i dodaliśmy je do Twojego konta.`
                : "Wszystko gotowe. Twoje konto jest w pełni aktywne.",
            cta: { href: "/konto", label: "Przejdź do konta" },
          });
          return;
        }

        case "resetPassword": {
          const email = await verifyPasswordResetCode(getClientAuth(), oobCode);
          setPhase({ kind: "password", email });
          return;
        }

        case "verifyAndChangeEmail": {
          const info = await checkActionCode(getClientAuth(), oobCode);
          await applyActionCode(getClientAuth(), oobCode);
          setPhase({
            kind: "done",
            title: "Nowy adres e-mail zapisany",
            message: `Od teraz logujesz się adresem ${info.data.email ?? "podanym w wiadomości"}. Zaloguj się ponownie, żeby odświeżyć sesję.`,
            cta: { href: "/logowanie", label: "Zaloguj się" },
          });
          return;
        }

        case "recoverEmail": {
          const info = await checkActionCode(getClientAuth(), oobCode);
          await applyActionCode(getClientAuth(), oobCode);
          setPhase({
            kind: "done",
            title: "Przywróciliśmy poprzedni adres e-mail",
            message: `Twoje konto znów jest przypisane do adresu ${info.data.email ?? ""}. Dla bezpieczeństwa ustaw też nowe hasło.`,
            cta: { href: "/haslo", label: "Ustaw nowe hasło" },
          });
          return;
        }

        default:
          setPhase({ kind: "error", message: "Nieznany typ linku." });
      }
    } catch (error) {
      const code = (error as { code?: string })?.code;
      setPhase({
        kind: "error",
        message:
          code === "auth/invalid-action-code" || code === "auth/expired-action-code"
            ? "Ten link wygasł albo został już użyty. Poproś o nowy — linki są ważne przez godzinę."
            : authErrorMessage(code),
      });
    }
  }, [mode, oobCode]);

  useEffect(() => {
    // W trybie deweloperskim React montuje komponent dwukrotnie, a kod
    // jednorazowy przy drugim wywołaniu jest już zużyty i zwróciłby błąd.
    if (handled.current) return;
    handled.current = true;
    void run();
  }, [run]);

  const onSetPassword = async (values: PasswordValues) => {
    if (!oobCode) return;
    setFormError(null);
    try {
      await confirmPasswordReset(getClientAuth(), oobCode, values.password);
      router.push("/logowanie?haslo-zmienione=1");
    } catch (error) {
      setFormError(authErrorMessage((error as { code?: string })?.code));
    }
  };

  if (phase.kind === "working") {
    return (
      <div className="flex flex-col items-center gap-4 py-8 text-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" aria-hidden />
        <p className="font-bold text-muted-foreground">Sprawdzamy link...</p>
      </div>
    );
  }

  if (phase.kind === "error") {
    return (
      <div className="flex flex-col items-center gap-4 py-2 text-center">
        <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center">
          <XCircle className="w-8 h-8 text-destructive" aria-hidden />
        </div>
        <h2 className="text-xl font-extrabold text-foreground">Nie udało się otworzyć linku</h2>
        <p className="text-sm font-medium text-muted-foreground leading-relaxed max-w-sm">
          {phase.message}
        </p>
        <Link
          href="/logowanie"
          className="mt-2 inline-flex items-center justify-center rounded-xl text-base font-bold bg-primary text-primary-foreground hover:bg-primary/95 active:scale-[0.98] h-12 px-8 shadow-sm transition-all"
        >
          Przejdź do logowania
        </Link>
      </div>
    );
  }

  if (phase.kind === "done") {
    return (
      <div className="flex flex-col items-center gap-4 py-2 text-center">
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
          <CheckCircle2 className="w-8 h-8 text-primary" aria-hidden />
        </div>
        <h2 className="text-xl font-extrabold text-foreground">{phase.title}</h2>
        <p className="text-sm font-medium text-muted-foreground leading-relaxed max-w-sm">
          {phase.message}
        </p>
        <Link
          href={phase.cta.href}
          className="mt-2 inline-flex items-center justify-center rounded-xl text-base font-bold bg-primary text-primary-foreground hover:bg-primary/95 active:scale-[0.98] h-12 px-8 shadow-sm transition-all"
        >
          {phase.cta.label}
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSetPassword)} className="flex flex-col gap-5" noValidate>
      {formError && <FormAlert>{formError}</FormAlert>}

      <p className="text-sm font-medium text-muted-foreground leading-relaxed">
        Ustawiasz nowe hasło dla konta{" "}
        <strong className="text-foreground">{phase.email}</strong>.
      </p>

      <Field
        label="Nowe hasło"
        required
        error={errors.password?.message}
        hint="Minimum 8 znaków, w tym litera i cyfra."
      >
        <div className="relative">
          <Input
            type={showPassword ? "text" : "password"}
            autoComplete="new-password"
            className="pr-12"
            autoFocus
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

      <SubmitButton loading={isSubmitting}>Zapisz nowe hasło</SubmitButton>
    </form>
  );
}
