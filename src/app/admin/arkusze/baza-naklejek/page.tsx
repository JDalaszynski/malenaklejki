import Link from "next/link";
import type { Metadata } from "next";
import { ArrowLeft, Plus } from "lucide-react";

import { AdminLayout } from "@/components/admin/AdminLayout";
import type { SheetRef } from "@/components/sheets/LibraryStickerDialog";
import { StickerLibraryManager } from "@/components/sheets/StickerLibraryManager";
import { requireAdmin } from "@/lib/auth/dal";
import { listLibrary, listSheetLibraryIds } from "@/lib/sheets/store";

export const metadata: Metadata = {
  title: "Panel — baza naklejek",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function StickerLibraryPage() {
  const admin = await requireAdmin();
  const [items, sheets] = await Promise.all([listLibrary(), listSheetLibraryIds()]);

  const usedIn: Record<string, SheetRef[]> = {};
  for (const sheet of sheets) {
    for (const id of new Set(sheet.libraryIds)) {
      (usedIn[id] ??= []).push({ id: sheet.id, name: sheet.name });
    }
  }

  return (
    <AdminLayout
      adminEmail={admin.email ?? ""}
      title="Baza naklejek"
      subtitle="Wszystkie naklejki z gotowych arkuszy — z nazwą do wyszukiwania i ustawieniami, z jakimi trafiają na arkusz."
      actions={
        <>
          <Link
            href="/admin/arkusze"
            className="inline-flex items-center gap-2 rounded-xl text-sm font-bold h-11 px-4 border border-slate-300 dark:border-white/20 bg-background hover:bg-slate-50 dark:hover:bg-white/5 transition-all active:scale-[0.98]"
          >
            <ArrowLeft className="w-4 h-4" aria-hidden />
            Wszystkie arkusze
          </Link>
          <Link
            href="/admin/arkusze/nowy"
            className="inline-flex items-center gap-2 rounded-xl text-sm font-bold bg-primary text-primary-foreground hover:bg-primary/95 active:scale-[0.98] h-11 px-5 shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" aria-hidden />
            Nowy arkusz
          </Link>
        </>
      }
    >
      <StickerLibraryManager initialItems={items} usedIn={usedIn} />
    </AdminLayout>
  );
}
