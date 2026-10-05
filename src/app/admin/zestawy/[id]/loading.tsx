import { AdminPageSkeleton } from "@/components/admin/AdminSkeleton";
import { EDITOR_SUBTITLE, SheetEditorActions } from "@/components/sheets/SheetEditorChrome";
import { SheetEditorSkeleton } from "@/components/sheets/SheetsSkeletons";

export default function Loading() {
  return (
    <AdminPageSkeleton
      title="Edycja zestawu"
      subtitle={EDITOR_SUBTITLE}
      actions={<SheetEditorActions />}
      stickyHeader={false}
      label="Wczytywanie zestawu…"
    >
      <SheetEditorSkeleton />
    </AdminPageSkeleton>
  );
}
