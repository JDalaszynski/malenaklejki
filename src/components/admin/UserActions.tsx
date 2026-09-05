"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Lock, MailCheck, Unlock } from "lucide-react";

import { resendUserVerificationEmail, setUserDisabled } from "@/app/actions/users";
import { FormAlert } from "@/components/auth/fields";

export function UserActions({
  uid,
  disabled,
  emailVerified,
  isSelf,
}: {
  uid: string;
  disabled: boolean;
  emailVerified: boolean;
  /** Własne konto administratora — nie da się go stąd zablokować. */
  isSelf: boolean;
}) {
  const router = useRouter();
  const [isTogglingAccess, startAccessTransition] = useTransition();
  const [isResending, startResendTransition] = useTransition();
  const [message, setMessage] = useState<{ tone: "success" | "error"; text: string } | null>(null);

  const toggleAccess = () => {
    if (!disabled && !window.confirm("Zablokować logowanie temu klientowi?")) return;

    setMessage(null);
    startAccessTransition(async () => {
      const result = await setUserDisabled(uid, !disabled);
      if (!result.success) {
        setMessage({ tone: "error", text: result.error });
        return;
      }
      setMessage({
        tone: "success",
        text: disabled ? "Logowanie odblokowane." : "Logowanie zablokowane.",
      });
      router.refresh();
    });
  };

  const resendVerification = () => {
    setMessage(null);
    startResendTransition(async () => {
      const result = await resendUserVerificationEmail(uid);
      if (!result.success) {
        setMessage({ tone: "error", text: result.error });
        return;
      }
      setMessage({ tone: "success", text: "Link weryfikacyjny wysłany ponownie." });
      router.refresh();
    });
  };

  return (
    <div className="flex flex-col gap-4">
      {message && <FormAlert tone={message.tone}>{message.text}</FormAlert>}

      <div className="flex flex-wrap items-center gap-3">
        {!emailVerified && (
          <button
            type="button"
            onClick={resendVerification}
            disabled={isResending}
            className="inline-flex items-center justify-center gap-2 rounded-xl text-sm font-bold border border-slate-300 dark:border-white/20 bg-background hover:bg-slate-50 dark:hover:bg-white/5 active:scale-[0.98] h-11 px-5 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isResending ? (
              <Loader2 className="w-4 h-4 animate-spin" aria-hidden />
            ) : (
              <MailCheck className="w-4 h-4" aria-hidden />
            )}
            Wyślij link weryfikacyjny ponownie
          </button>
        )}

        {isSelf ? (
          <span className="text-xs font-semibold text-muted-foreground">
            To Twoje konto — nie możesz go stąd zablokować.
          </span>
        ) : (
          <button
            type="button"
            onClick={toggleAccess}
            disabled={isTogglingAccess}
            className={`inline-flex items-center justify-center gap-2 rounded-xl text-sm font-bold h-11 px-5 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] ${
              disabled
                ? "bg-primary text-primary-foreground hover:bg-primary/95 shadow-sm"
                : "border border-destructive/40 text-destructive hover:bg-destructive/10"
            }`}
          >
            {isTogglingAccess ? (
              <Loader2 className="w-4 h-4 animate-spin" aria-hidden />
            ) : disabled ? (
              <Unlock className="w-4 h-4" aria-hidden />
            ) : (
              <Lock className="w-4 h-4" aria-hidden />
            )}
            {disabled ? "Odblokuj logowanie" : "Zablokuj logowanie"}
          </button>
        )}
      </div>
    </div>
  );
}
