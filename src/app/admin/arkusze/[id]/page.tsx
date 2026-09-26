import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { SheetEditorPage } from "@/components/sheets/SheetEditorPage";
import { requireAdmin } from "@/lib/auth/dal";
import { getSheet, listCategoryNames, listLibrary, readSheetLayout } from "@/lib/sheets/store";

export const metadata: Metadata = {
  title: "Panel — edycja arkusza",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function EditSheetPage({ params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin();
  const { id } = await params;

  const sheet = await getSheet(id);
  if (!sheet) notFound();

  const [stickers, library, categories] = await Promise.all([
    readSheetLayout(sheet.id),
    listLibrary(),
    listCategoryNames(),
  ]);

  return (
    <SheetEditorPage
      adminEmail={admin.email ?? ""}
      title="Edycja arkusza"
      sheet={{
        id: sheet.id,
        name: sheet.name,
        category: sheet.category,
        status: sheet.status,
        updatedAt: sheet.updatedAt,
      }}
      initialStickers={stickers ?? []}
      library={library}
      categories={categories}
    />
  );
}
