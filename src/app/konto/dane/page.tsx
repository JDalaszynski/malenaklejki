import type { Metadata } from "next";

import { AccountLayout } from "@/components/account/AccountLayout";
import { ProfileForm } from "@/components/account/ProfileForm";
import { requireUser } from "@/lib/auth/dal";
import { getProfile } from "@/app/actions/profile";

export const metadata: Metadata = {
  title: "Dane i adresy — MałeNaklejki",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const session = await requireUser("/konto/dane");
  const profile = await getProfile();

  return (
    <AccountLayout
      title="Dane i adresy"
      subtitle="Uzupełnij raz — formularz zamówienia wypełni się sam."
    >
      <ProfileForm
        profile={
          profile ?? {
            firstName: "",
            lastName: "",
            phone: "",
            marketingConsent: false,
            defaultAddress: null,
            defaultLocker: null,
            invoiceDetails: null,
          }
        }
        email={session.email ?? ""}
      />
    </AccountLayout>
  );
}
