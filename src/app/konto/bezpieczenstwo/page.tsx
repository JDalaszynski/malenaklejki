import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { AccountLayout } from "@/components/account/AccountLayout";
import { SecurityPanels } from "@/components/account/SecurityPanels";
import { requireUser } from "@/lib/auth/dal";
import { getSecurityOverview } from "@/app/actions/security";

export const metadata: Metadata = {
  title: "Bezpieczeństwo konta — MałeNaklejki",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function SecurityPage() {
  await requireUser("/konto/bezpieczenstwo");
  const overview = await getSecurityOverview();
  if (!overview) redirect("/logowanie");

  return (
    <AccountLayout
      title="Bezpieczeństwo"
      subtitle="Hasło, adres e-mail i dostęp do konta."
    >
      <SecurityPanels overview={overview} />
    </AccountLayout>
  );
}
