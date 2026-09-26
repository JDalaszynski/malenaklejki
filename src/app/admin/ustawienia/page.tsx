import type { Metadata } from "next";

import { AdminLayout } from "@/components/admin/AdminLayout";
import { ReadySheetsModeForm } from "@/components/admin/ReadySheetsModeForm";
import { VacationSettingsForm } from "@/components/admin/VacationSettingsForm";
import { requireAdmin } from "@/lib/auth/dal";
import { getReadySheetsSettingsFresh } from "@/lib/settings/readySheetsStore";
import { getVacationSettingsFresh } from "@/lib/settings/vacationStore";
import { countPublishedSheets } from "@/lib/sheets/store";

export const metadata: Metadata = {
  title: "Panel — ustawienia sklepu",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  const admin = await requireAdmin();
  // Celowo pomijamy pamięć podręczną — panel ma pokazywać stan zapisany
  // w bazie, a nie to, co akurat widzą klienci.
  const [vacation, readySheets, publishedCount] = await Promise.all([
    getVacationSettingsFresh(),
    getReadySheetsSettingsFresh(),
    countPublishedSheets(),
  ]);

  return (
    <AdminLayout
      adminEmail={admin.email ?? ""}
      title="Ustawienia sklepu"
      subtitle="Gotowe arkusze na stronie głównej i przerwa urlopowa: baner, termin wysyłki w koszyku, wstrzymanie zamówień."
    >
      <ReadySheetsModeForm settings={readySheets} publishedCount={publishedCount} />
      <VacationSettingsForm settings={vacation} />
    </AdminLayout>
  );
}
