"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { MailCheck, RefreshCw } from "lucide-react";

import { resendVerificationEmail } from "@/app/actions/auth";
import { FormAlert } from "@/components/auth/fields";

export function VerifyEmailPanel({ email }: { email: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<{ tone: "success" | "error"; text: string } | null>(null);

  const resend = () => {
    setMessage(null);
    startTransition(async () => {
      const result = await resendVerificationEmail();
      setMessage(
        result.success
          ? { tone: "success", text: "Wysłaliśmy nową wiadomość. Sprawdź skrzynkę i folder spam." }
          : { tone: "error", text: result.error }
      );
    });
  };

  return (
    <div className="flex flex-col items-center text-center gap-5">
      <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
        <MailCheck className="w-8 h-8 text-primary" aria-hidden />
      </div>

      <div>
        <p className="text-sm font-medium text-muted-foreground leading-relaxed max-w-sm">
          Wysłaliśmy link potwierdzający na adres{" "}
          <strong className="text-foreground">{email}</strong>. Kliknij go, a wrócisz tutaj z pełnym
          dostępem do konta.
        </p>
        <p className="text-sm font-medium text-muted-foreground leading-relaxed max-w-sm mt-3">
          Potwierdzenie adresu jest też warunkiem dołączenia do konta zamówień, które złożyłeś
          wcześniej bez logowania — dzięki temu nikt obcy nie zobaczy Twoich danych.
        </p>
      </div>

      {message && <FormAlert tone={message.tone}>{message.text}</FormAlert>}

      <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
        <button
          type="button"
          onClick={resend}
          disabled={isPending}
          className="inline-flex items-center justify-center gap-2 rounded-xl text-base font-bold bg-primary text-primary-foreground hover:bg-primary/95 active:scale-[0.98] h-12 px-6 shadow-sm transition-all disabled:opacity-60 cursor-pointer"
        >
          <RefreshCw className={`w-4 h-4 ${isPending ? "animate-spin" : ""}`} aria-hidden />
          Wyślij link ponownie
        </button>
        <button
          type="button"
          onClick={() => router.refresh()}
          className="inline-flex items-center justify-center rounded-xl text-base font-bold bg-card border border-border/70 text-foreground hover:bg-muted/50 active:scale-[0.98] h-12 px-6 transition-all cursor-pointer"
        >
          Już kliknąłem
        </button>
      </div>
    </div>
  );
}
