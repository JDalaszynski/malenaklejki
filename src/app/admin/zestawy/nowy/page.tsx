import type { Metadata } from "next";

import { SheetEditorPage } from "@/components/sheets/SheetEditorPage";
import { requireAdmin } from "@/lib/auth/dal";
import { listCategoryNames, listLibrary } from "@/lib/sheets/store";

export const metadata: Metadata = {
  title: "Panel — nowy zestaw",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function NewSheetPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const admin = await requireAdmin();
  const params = await searchParams;
  const [library, categories] = await Promise.all([listLibrary(), listCategoryNames()]);

  // Z listy przefiltrowanej po kategorii nowy zestaw startuje w tej kategorii.
  const presetCategory = typeof params.kategoria === "string" ? params.kategoria.slice(0, 60) : "";

  return (
    <SheetEditorPage
      adminEmail={admin.email ?? ""}
      title="Nowy zestaw"
      sheet={{
        id: null,
        name: "",
        category: presetCategory,
        category2: "",
        slug: "",
        subtitle: "",
        description: "",
        motifs: [],
        status: "draft",
        updatedAt: null,
      }}
      initialStickers={[]}
      library={library}
      categories={categories}
    />
  );
}
