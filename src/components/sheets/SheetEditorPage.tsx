import { AdminLayout } from "@/components/admin/AdminLayout";
import { SheetEditor, type SheetEditorProps } from "./SheetEditor";
import { EDITOR_SUBTITLE, SheetEditorActions } from "./SheetEditorChrome";

/** Wspólna oprawa edytora dla nowego i istniejącego arkusza. */
export function SheetEditorPage({
  adminEmail,
  title,
  ...editorProps
}: SheetEditorProps & { adminEmail: string; title: string }) {
  return (
    <AdminLayout
      adminEmail={adminEmail}
      title={title}
      subtitle={EDITOR_SUBTITLE}
      actions={<SheetEditorActions />}
      stickyHeader={false}
    >
      <SheetEditor {...editorProps} />
    </AdminLayout>
  );
}
