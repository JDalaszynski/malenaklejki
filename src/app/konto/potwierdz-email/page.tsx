import type { Metadata } from "next";

import { AuthShell } from "@/components/auth/AuthShell";
import { VerifyEmailPanel } from "@/components/account/VerifyEmailPanel";
import { requireUser } from "@/lib/auth/dal";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Potwierdź adres e-mail — MałeNaklejki",
  robots: { index: false, follow: false },
};

export default async function VerifyEmailPage() {
  const session = await requireUser("/konto/potwierdz-email");
  if (session.emailVerified) redirect("/konto");

  return (
    <AuthShell
      title="Potwierdź adres e-mail"
      subtitle="Ostatni krok, żeby odblokować historię zamówień."
    >
      <VerifyEmailPanel email={session.email ?? ""} />
    </AuthShell>
  );
}
