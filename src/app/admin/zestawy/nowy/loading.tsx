import { AdminPageSkeleton } from "@/components/admin/AdminSkeleton";
import { EDITOR_SUBTITLE, SheetEditorActions } from "@/components/sheets/SheetEditorChrome";
import { SheetEditorSkeleton } from "@/components/sheets/SheetsSkeletons";

export default function Loading() {
  return (
    <AdminPageSkeleton
      title="Nowy zestaw"
      subtitle={EDITOR_SUBTITLE}
      actions={<SheetEditorActions />}
      stickyHeader={false}
      label="Wczytywanie edytora zestawu…"
    >
      <SheetEditorSkeleton />
    </AdminPageSkeleton>
  );
}
