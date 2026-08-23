"use client";

import Link from "next/link";
import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { LogOut, Store } from "lucide-react";

import { signOut } from "@/app/actions/auth";
import { invalidateSessionUser } from "@/hooks/useSessionUser";

/**
 * Nagłówek panelu jest w trybie „zen" (bez nawigacji sklepu), więc dostęp do
 * konta i wylogowania musi być tutaj — inaczej z panelu nie dałoby się wyjść
 * inaczej niż przez wpisanie adresu.
 */
export function AdminUserBar({ email }: { email: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-xs font-bold text-muted-foreground bg-card border border-border/60 rounded-full px-3 py-1.5 max-w-[220px] truncate">
        {email}
      </span>

      <Link
        href="/"
        className="inline-flex items-center gap-1.5 rounded-xl text-xs font-bold bg-card border border-border/60 text-foreground hover:bg-muted/50 hover:text-primary h-9 px-3 transition-colors"
      >
        <Store className="w-3.5 h-3.5" aria-hidden />
        Sklep
      </Link>

      <button
        type="button"
        disabled={isPending}
        onClick={() =>
          startTransition(async () => {
            await signOut();
            invalidateSessionUser();
            router.push("/");
            router.refresh();
          })
        }
        className="inline-flex items-center gap-1.5 rounded-xl text-xs font-bold bg-card border border-border/60 text-muted-foreground hover:bg-muted/50 hover:text-destructive h-9 px-3 transition-colors cursor-pointer disabled:opacity-60"
      >
        <LogOut className="w-3.5 h-3.5" aria-hidden />
        {isPending ? "Wylogowywanie…" : "Wyloguj"}
      </button>
    </div>
  );
}
