"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, Loader2, Reply, RotateCcw, Trash2 } from "lucide-react";

import { deleteFormMessage, setFormMessageHandled } from "@/app/actions/messages";

const buttonClass =
  "inline-flex items-center justify-center gap-2 rounded-xl text-sm font-bold h-10 px-4 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]";

export function MessageActions({
  id,
  email,
  subject,
  handled,
}: {
  id: string;
  email: string;
  subject: string;
  handled: boolean;
}) {
  const router = useRouter();
  const [isToggling, startToggle] = useTransition();
  const [isDeleting, startDelete] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const toggle = () => {
    setError(null);
    startToggle(async () => {
      const result = await setFormMessageHandled({ id, handled: !handled });
      if (!result.success) {
        setError(result.error);
        return;
      }
      router.refresh();
    });
  };

  const remove = () => {
    if (!window.confirm("Usunąć tę wiadomość na stałe? Tej operacji nie da się cofnąć.")) return;

    setError(null);
    startDelete(async () => {
      const result = await deleteFormMessage(id);
      if (!result.success) {
        setError(result.error);
        return;
      }
      router.refresh();
    });
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap items-center gap-2">
        <a
          href={`mailto:${email}?subject=${encodeURIComponent(`Re: ${subject}`)}`}
          className={`${buttonClass} bg-primary text-primary-foreground hover:bg-primary/95 shadow-sm`}
        >
          <Reply className="w-4 h-4" aria-hidden />
          Odpowiedz
        </a>

        <button
          type="button"
          onClick={toggle}
          disabled={isToggling}
          className={`${buttonClass} border border-slate-300 dark:border-white/20 bg-background hover:bg-slate-50 dark:hover:bg-white/5`}
        >
          {isToggling ? (
            <Loader2 className="w-4 h-4 animate-spin" aria-hidden />
          ) : handled ? (
            <RotateCcw className="w-4 h-4" aria-hidden />
          ) : (
            <Check className="w-4 h-4" aria-hidden />
          )}
          {handled ? "Cofnij do nowych" : "Oznacz jako załatwioną"}
        </button>

        <button
          type="button"
          onClick={remove}
          disabled={isDeleting}
          className={`${buttonClass} border border-destructive/40 text-destructive hover:bg-destructive/10`}
        >
          {isDeleting ? (
            <Loader2 className="w-4 h-4 animate-spin" aria-hidden />
          ) : (
            <Trash2 className="w-4 h-4" aria-hidden />
          )}
          Usuń
        </button>
      </div>

      {error && (
        <p role="alert" className="text-xs font-bold text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}
