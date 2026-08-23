import { Suspense } from "react";
import Link from "next/link";
import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { AuthShell } from "@/components/auth/AuthShell";
import { LoginForm } from "@/components/auth/LoginForm";
import { getSession } from "@/lib/auth/dal";

export const metadata: Metadata = {
  title: "Logowanie — MałeNaklejki",
  description: "Zaloguj się do konta MałeNaklejki, żeby zobaczyć historię zamówień i swoje arkusze naklejek.",
  robots: { index: false, follow: false },
};

export default async function LoginPage() {
  const session = await getSession();
  if (session) redirect("/konto");

  return (
    <AuthShell
      title="Zaloguj się"
      subtitle="Wróć do swoich arkuszy i zamówień."
      footer={
        <>
          Nie masz jeszcze konta?{" "}
          <Link href="/rejestracja" className="font-bold text-primary hover:underline underline-offset-4">
            Załóż je za darmo
          </Link>
        </>
      }
    >
      <Suspense
        fallback={
          <div className="h-72 animate-pulse rounded-2xl bg-muted/40" aria-hidden />
        }
      >
        <LoginForm />
      </Suspense>
    </AuthShell>
  );
}
