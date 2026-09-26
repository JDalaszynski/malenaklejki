import Link from "next/link";
import { ArrowLeft, Library } from "lucide-react";

/**
 * Nagłówek edytora — osobno od samego edytora, bo korzysta z niego też
 * ekran wczytywania, a ten nie powinien ciągnąć za sobą kodu kreatora.
 */
export const EDITOR_SUBTITLE =
  "Układasz arkusz na tych samych zasadach co klient w kreatorze: margines 11 mm, wcięcia w narożnikach i odstępy między liniami cięcia.";

const linkClass =
  "inline-flex items-center gap-2 rounded-xl text-sm font-bold h-11 px-4 border border-slate-300 dark:border-white/20 bg-background hover:bg-slate-50 dark:hover:bg-white/5 transition-all active:scale-[0.98]";

export function SheetEditorActions() {
  return (
    <>
      <Link href="/admin/arkusze" className={linkClass}>
        <ArrowLeft className="w-4 h-4" aria-hidden />
        Wszystkie arkusze
      </Link>
      <Link href="/admin/arkusze/baza-naklejek" className={linkClass}>
        <Library className="w-4 h-4" aria-hidden />
        Baza naklejek
      </Link>
    </>
  );
}
