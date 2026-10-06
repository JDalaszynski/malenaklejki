import Link from "next/link";
import type { Metadata } from "next";
import { Layers } from "lucide-react";

import { StatusPill } from "@/components/account/StatusPill";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { STATS_TABS, SectionTabs } from "@/components/admin/SectionTabs";
import { ReadySheetsUsage, USAGE_PATH, parseUsagePeriod } from "@/components/sheets/ReadySheetsUsage";
import type { AdminSearchParams } from "@/lib/admin/filters";
import { requireAdmin } from "@/lib/auth/dal";
import { READY_SHEETS_MODE_LABELS } from "@/lib/settings/readySheets";
import { getReadySheetsSettingsFresh } from "@/lib/settings/readySheetsStore";
import { listSheets } from "@/lib/sheets/store";
import { loadUsage } from "@/lib/sheets/usage";

export const metadata: Metadata = {
  title: "Panel — statystyki gotowych zestawów",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function SheetsUsagePage({
  searchParams,
}: {
  searchParams: Promise<AdminSearchParams>;
}) {
  const admin = await requireAdmin();
  const params = await searchParams;
  const period = parseUsagePeriod(params.okres);

  const [usage, sheets, readySheets] = await Promise.all([
    loadUsage(period),
    listSheets(),
    getReadySheetsSettingsFresh(),
  ]);

  return (
    <AdminLayout
      adminEmail={admin.email ?? ""}
      title="Statystyki"
      subtitle={
        <span className="inline-flex flex-wrap items-center gap-x-2 gap-y-1">
          Czy klienci w ogóle zaglądają do gotowych zestawów i czy kończy się to koszykiem.
          <Link href="/admin/ustawienia" className="inline-flex" title="Zmień w ustawieniach sklepu">
            <StatusPill
              tone={
                readySheets.mode === "on"
                  ? "success"
                  : readySheets.mode === "preview"
                    ? "warning"
                    : "neutral"
              }
              className="hover:opacity-80 transition-opacity"
            >
              W sklepie: {READY_SHEETS_MODE_LABELS[readySheets.mode].toLowerCase()}
            </StatusPill>
          </Link>
        </span>
      }
      actions={
        <Link
          href="/admin/zestawy"
          className="inline-flex items-center gap-2 rounded-xl text-sm font-bold h-11 px-5 border border-slate-300 dark:border-white/20 bg-background hover:bg-slate-50 dark:hover:bg-white/5 transition-all active:scale-[0.98]"
        >
          <Layers className="w-4 h-4" aria-hidden />
          Zarządzaj zestawami
        </Link>
      }
    >
      <SectionTabs tabs={STATS_TABS} current={USAGE_PATH} label="Widok statystyk" />

      <ReadySheetsUsage
        usage={usage}
        period={period}
        names={Object.fromEntries(sheets.map((sheet) => [sheet.id, sheet.name]))}
        isOn={readySheets.mode === "on"}
      />
    </AdminLayout>
  );
}
