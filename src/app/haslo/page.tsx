import Link from "next/link";
import type { Metadata } from "next";

import { AuthShell } from "@/components/auth/AuthShell";
import { ResetRequestForm } from "@/components/auth/ResetRequestForm";

export const metadata: Metadata = {
  title: "Nie pamiętam hasła — MałeNaklejki",
  robots: { index: false, follow: false },
};

export default function PasswordResetPage() {
  return (
    <AuthShell
      title="Nie pamiętam hasła"
      subtitle="Wyślemy Ci link do ustawienia nowego."
      footer={
        <Link href="/logowanie" className="font-bold text-primary hover:underline underline-offset-4">
          Wróć do logowania
        </Link>
      }
    >
      <ResetRequestForm />
    </AuthShell>
  );
}
