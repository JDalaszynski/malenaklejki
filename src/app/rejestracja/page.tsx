import { Suspense } from "react";
import Link from "next/link";
import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { AccountBenefits, AuthShell } from "@/components/auth/AuthShell";
import { RegisterForm } from "@/components/auth/RegisterForm";
import { getSession } from "@/lib/auth/dal";

export const metadata: Metadata = {
  title: "Załóż konto — MałeNaklejki",
  description: "Darmowe konto w MałeNaklejki: historia zamówień, zapisane arkusze i szybsze zamawianie.",
  robots: { index: false, follow: false },
};

export default async function RegisterPage() {
  const session = await getSession();
  if (session) redirect("/konto");

  return (
    <AuthShell
      title="Załóż konto"
      subtitle="Za darmo, w kilkanaście sekund."
      aside={<AccountBenefits />}
      footer={
        <>
          Masz już konto?{" "}
          <Link href="/logowanie" className="font-bold text-primary hover:underline underline-offset-4">
            Zaloguj się
          </Link>
        </>
      }
    >
      <Suspense
        fallback={<div className="h-96 animate-pulse rounded-2xl bg-muted/40" aria-hidden />}
      >
        <RegisterForm />
      </Suspense>
    </AuthShell>
  );
}
