import type { Metadata } from "next";
import { Layers, Palmtree, Truck } from "lucide-react";

import { AdminLayout } from "@/components/admin/AdminLayout";
import { ReadySheetsModeForm } from "@/components/admin/ReadySheetsModeForm";
import { SettingsNav, type SettingsNavGroup } from "@/components/admin/SettingsNav";
import { SettingsSection } from "@/components/admin/SettingsSection";
import { ShippingEstimateForm } from "@/components/admin/ShippingEstimateForm";
import { VacationSettingsForm } from "@/components/admin/VacationSettingsForm";
import { requireAdmin } from "@/lib/auth/dal";
import { READY_SHEETS_MODE_LABELS } from "@/lib/settings/readySheets";
import { getReadySheetsSettingsFresh } from "@/lib/settings/readySheetsStore";
import { businessDaysLabel } from "@/lib/settings/shippingEstimate";
import { getShippingEstimateSettingsFresh } from "@/lib/settings/shippingEstimateStore";
import { resolveVacation, warsawToday } from "@/lib/settings/vacation";
import { getVacationSettingsFresh } from "@/lib/settings/vacationStore";
import { countPublishedSheets } from "@/lib/sheets/store";

export const metadata: Metadata = {
  title: "Panel — ustawienia sklepu",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

function daysRange(min: number, max: number): string {
  return min === max ? businessDaysLabel(max) : `${min}–${businessDaysLabel(max)}`;
}

export default async function AdminSettingsPage() {
  const admin = await requireAdmin();
  // Celowo pomijamy pamięć podręczną — panel ma pokazywać stan zapisany
  // w bazie, a nie to, co akurat widzą klienci.
  const [vacation, readySheets, shipping, publishedCount] = await Promise.all([
    getVacationSettingsFresh(),
    getReadySheetsSettingsFresh(),
    getShippingEstimateSettingsFresh(),
    countPublishedSheets(),
  ]);

  const vacationState = resolveVacation(vacation, warsawToday());

  const groups: SettingsNavGroup[] = [
    {
      label: "Wysyłka",
      items: [
        {
          id: "termin-wysylki",
          label: "Termin wysyłki w koszyku",
          status: vacationState.status === "active"
            ? "Zastąpiony przerwą"
            : `${daysRange(shipping.beforeMin, shipping.beforeMax)} / ${daysRange(shipping.afterMin, shipping.afterMax)}`,
          tone: vacationState.status === "active" ? "warning" : "neutral",
        },
        {
          id: "przerwa",
          label: "Przerwa urlopowa",
          status:
            vacationState.status === "active"
              ? "Trwa"
              : vacationState.status === "upcoming"
                ? vacationState.visible
                  ? "Zapowiadana"
                  : "Zaplanowana"
                : "Wyłączona",
          tone:
            vacationState.status === "active"
              ? "warning"
              : vacationState.status === "upcoming"
                ? "info"
                : "neutral",
        },
      ],
    },
    {
      label: "Sklep",
      items: [
        {
          id: "gotowe-zestawy",
          label: "Gotowe zestawy",
          status: READY_SHEETS_MODE_LABELS[readySheets.mode],
          tone:
            readySheets.mode === "on" ? "success" : readySheets.mode === "preview" ? "warning" : "neutral",
        },
      ],
    },
  ];

  return (
    <AdminLayout
      adminEmail={admin.email ?? ""}
      title="Ustawienia sklepu"
      subtitle="Terminy i komunikaty dla klientów oraz widoczność gotowych zestawów. Każdą sekcję zapisujesz osobno."
    >
      <div className="grid grid-cols-1 lg:grid-cols-[17rem_minmax(0,1fr)] gap-6 lg:gap-10 items-start">
        <SettingsNav groups={groups} />

        <div className="flex flex-col gap-12 max-w-3xl min-w-0">
          <SettingsSection
            id="termin-wysylki"
            icon={Truck}
            title="Termin wysyłki w koszyku"
            description="Napis „Szacowana wysyłka” pod przyciskiem zamówienia. Klient widzi daty, które wyliczają się z widełek ustawionych tutaj."
          >
            <ShippingEstimateForm settings={shipping} vacationActive={vacationState.status === "active"} />
          </SettingsSection>

          <SettingsSection
            id="przerwa"
            icon={Palmtree}
            title="Przerwa urlopowa"
            description="Jeden włącznik dla baneru na stronie, terminu wysyłki w koszyku i informacji w mailach."
          >
            <VacationSettingsForm settings={vacation} />
          </SettingsSection>

          <SettingsSection
            id="gotowe-zestawy"
            icon={Layers}
            title="Gotowe zestawy"
            description="Czy klienci widzą opublikowane gotowe zestawy w kreatorze na stronie głównej."
          >
            <ReadySheetsModeForm settings={readySheets} publishedCount={publishedCount} />
          </SettingsSection>
        </div>
      </div>
    </AdminLayout>
  );
}
