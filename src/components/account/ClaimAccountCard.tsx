"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff, Sparkles } from "lucide-react";

import { claimOrderAccount } from "@/app/actions/claimAccount";
import { startSession } from "@/app/actions/auth";
import { authErrorMessage, clearBrowserSession, passwordSignIn } from "@/lib/auth/client";
import { invalidateSessionUser, useSessionUser } from "@/hooks/useSessionUser";
import { Field, FormAlert, Input, SubmitButton } from "@/components/auth/fields";

const BENEFITS = [
  "Zamówisz te same naklejki ponownie jednym kliknięciem, bez projektowania od zera",
  "Masz podgląd wszystkich zamówionych arkuszy w jednym miejscu",
  "Sprawdzisz status zamówienia bez szukania maili",
];

/**
 * Propozycja założenia konta na ekranie podziękowania — moment, w którym
 * klient właśnie zobaczył, co dostał, więc korzyść z zapisania arkusza jest
 * najbardziej oczywista.
 */
export function ClaimAccountCard({
  orderId,
  orderNumber,
}: {
  orderId: string;
  orderNumber: string;
}) {
  const router = useRouter();
  const params = useSearchParams();
  const { status, user } = useSessionUser();

  const [expanded, setExpanded] = useState(params.get("konto") === "1");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [marketingConsent, setMarketingConsent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const formRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (expanded && params.get("konto") === "1") {
      formRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [expanded, params]);

  // Zalogowani mają zamówienie już w koncie — nie ma czego proponować.
  if (status === "loading" || user) return null;

  const submit = async () => {
    setError(null);
    setBusy(true);
    try {
      const result = await claimOrderAccount({
        orderId,
        orderNumber,
        password,
        marketingConsent,
      });

      if (!result.success) {
        setError(result.error);
        return;
      }

      const idToken = await passwordSignIn(result.email, password);
      const session = await startSession(idToken);
      await clearBrowserSession();
      invalidateSessionUser();

      router.push(session.success ? "/konto?powitanie=1" : "/logowanie?zarejestrowano=1");
      router.refresh();
    } catch (caught) {
      setError(authErrorMessage((caught as { code?: string })?.code));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div
      ref={formRef}
      className="mt-8 bg-card border-2 border-primary/30 rounded-3xl p-6 sm:p-8 shadow-[0_10px_40px_-12px_rgba(2,175,122,0.25)]"
    >
      <div className="flex items-start gap-4">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <Sparkles className="w-5 h-5" aria-hidden />
        </span>
        <div className="flex-1 min-w-0">
          <h2 className="text-xl font-extrabold text-foreground text-balance">
            Zachowaj ten arkusz na przyszłość
          </h2>
          <p className="text-sm font-medium text-muted-foreground mt-1.5 leading-relaxed">
            Załóż konto — ustawiasz tylko hasło, resztę danych mamy już z zamówienia.
          </p>
        </div>
      </div>

      <ul className="mt-5 flex flex-col gap-2.5">
        {BENEFITS.map((benefit) => (
          <li key={benefit} className="flex gap-3 text-sm font-semibold text-muted-foreground">
            <span aria-hidden className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
            <span className="leading-relaxed">{benefit}</span>
          </li>
        ))}
      </ul>

      {!expanded ? (
        <button
          type="button"
          onClick={() => setExpanded(true)}
          className="mt-6 w-full sm:w-auto inline-flex items-center justify-center rounded-xl text-base font-bold bg-primary text-primary-foreground hover:bg-primary/95 active:scale-[0.98] h-14 px-8 shadow-sm transition-all cursor-pointer"
        >
          Załóż konto w 10 sekund
        </button>
      ) : (
        <div className="mt-6 pt-6 border-t border-border/60 flex flex-col gap-5">
          {error && <FormAlert>{error}</FormAlert>}

          <Field label="Ustaw hasło" required hint="Minimum 8 znaków, w tym litera i cyfra.">
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                className="pr-12"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
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

          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={marketingConsent}
              onChange={(event) => setMarketingConsent(event.target.checked)}
              className="mt-1 w-5 h-5 rounded border-gray-300 text-foreground focus:ring-foreground shrink-0"
            />
            <span className="text-sm font-semibold text-muted-foreground leading-relaxed">
              Chcę dostawać e-maile o promocjach i nowych wzorach.
            </span>
          </label>

          <p className="text-xs font-medium text-muted-foreground leading-relaxed">
            Zakładając konto akceptujesz{" "}
            <Link href="/regulamin" className="font-bold text-primary hover:underline" target="_blank">
              regulamin
            </Link>{" "}
            i{" "}
            <Link
              href="/polityka-prywatnosci"
              className="font-bold text-primary hover:underline"
              target="_blank"
            >
              politykę prywatności
            </Link>
            .
          </p>

          <div className="sm:max-w-xs">
            <SubmitButton type="button" loading={busy} onClick={submit}>
              Zakładam konto
            </SubmitButton>
          </div>
        </div>
      )}
    </div>
  );
}
