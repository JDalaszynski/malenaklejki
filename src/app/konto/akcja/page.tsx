import { Suspense } from "react";
import type { Metadata } from "next";

import { AuthShell } from "@/components/auth/AuthShell";
import { ActionHandler } from "@/components/auth/ActionHandler";

export const metadata: Metadata = {
  title: "Twoje konto — MałeNaklejki",
  robots: { index: false, follow: false },
};

export default function AccountActionPage() {
  return (
    <AuthShell title="Bezpieczeństwo konta" subtitle="Kończymy to, co zaczęliśmy w e-mailu.">
      <Suspense
        fallback={<div className="h-56 animate-pulse rounded-2xl bg-muted/40" aria-hidden />}
      >
        <ActionHandler />
      </Suspense>
    </AuthShell>
  );
}
