import type { Metadata } from "next";

import { AdminLayout } from "@/components/admin/AdminLayout";
import { VacationSettingsForm } from "@/components/admin/VacationSettingsForm";
import { requireAdmin } from "@/lib/auth/dal";
import { getVacationSettingsFresh } from "@/lib/settings/vacationStore";

export const metadata: Metadata = {
  title: "Panel — ustawienia sklepu",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  const admin = await requireAdmin();
  // Celowo pomijamy pamięć podręczną — panel ma pokazywać stan zapisany
  // w bazie, a nie to, co akurat widzą klienci.
  const vacation = await getVacationSettingsFresh();

  return (
    <AdminLayout
      adminEmail={admin.email ?? ""}
      title="Ustawienia sklepu"
      subtitle="Przerwa urlopowa: baner nad nagłówkiem, termin wysyłki w koszyku i — jeśli chcesz — wstrzymanie zamówień."
    >
      <VacationSettingsForm settings={vacation} />
    </AdminLayout>
  );
}
