import Link from "next/link";
import { Eye, LayoutGrid, Plus } from "lucide-react";

import { StatusPill } from "@/components/account/StatusPill";
import { SHEET_STATUS_LABELS, type StickerSheet } from "@/lib/sheets/types";
import { formatDateTime } from "@/lib/orders/status";
import { getStickersNoun } from "@/lib/utils/polish";
import { SheetCardActions } from "./SheetCardActions";

/**
 * Kafelki gotowych arkuszy. Podgląd to miniatura zapisywana przy każdym
 * zapisie arkusza — ta sama, którą docelowo zobaczy klient w sklepie.
 */
export function SheetGrid({
  sheets,
  emptyMessage,
  showCreate,
}: {
  sheets: StickerSheet[];
  emptyMessage: string;
  /** Pusta baza — zamiast komunikatu zachęta do pierwszego arkusza. */
  showCreate: boolean;
}) {
  if (sheets.length === 0) {
    return showCreate ? (
      <div className="flex flex-col items-center text-center gap-3 py-12">
        <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
          <LayoutGrid className="w-7 h-7 text-primary" aria-hidden />
        </div>
        <p className="text-lg font-extrabold text-foreground">Nie ma jeszcze żadnego arkusza</p>
        <p className="text-sm font-medium text-muted-foreground max-w-md">
          Ułóż pierwszy gotowy arkusz tematyczny. Naklejki, które na nim położysz, trafią do bazy
          i przydadzą się przy kolejnych.
        </p>
        <Link
          href="/admin/arkusze/nowy"
          className="mt-2 inline-flex items-center gap-2 rounded-xl text-sm font-bold bg-primary text-primary-foreground hover:bg-primary/95 active:scale-[0.98] h-11 px-5 shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" aria-hidden />
          Nowy arkusz
        </Link>
      </div>
    ) : (
      <p className="text-sm font-medium text-muted-foreground py-8 text-center">{emptyMessage}</p>
    );
  }

  return (
    <ul className="grid grid-cols-1 min-[440px]:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
      {sheets.map((sheet) => (
        <li
          key={sheet.id}
          className="flex flex-col rounded-2xl border border-border/60 bg-card overflow-hidden shadow-[0_8px_30px_rgba(0,0,0,0.02)]"
        >
          <Link
            href={`/admin/arkusze/${sheet.id}`}
            className="group relative block bg-[#edf6f2] dark:bg-[#002c2e] p-4"
            aria-label={`Edytuj arkusz ${sheet.name}`}
          >
            <div className="relative mx-auto w-full max-w-[15rem] aspect-[210/297] rounded-md bg-white shadow-[0_10px_30px_rgba(0,71,73,0.10)] overflow-hidden transition-transform group-hover:-translate-y-0.5">
              {sheet.previewUrl ? (
                // eslint-disable-next-line @next/next/no-img-element -- adres z tokenem Storage
                <img
                  src={sheet.previewUrl}
                  alt=""
                  loading="lazy"
                  className="absolute inset-0 w-full h-full object-cover"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-xs font-bold text-muted-foreground">
                  Brak podglądu
                </div>
              )}
            </div>
            <div className="absolute top-3 left-3">
              <StatusPill tone={sheet.status === "published" ? "success" : "neutral"}>
                {sheet.status === "published" && <Eye className="w-3.5 h-3.5" aria-hidden />}
                {SHEET_STATUS_LABELS[sheet.status]}
              </StatusPill>
            </div>
          </Link>

          <div className="flex flex-col gap-3 p-4 flex-1">
            <div className="min-w-0 flex-1">
              <p className="font-extrabold text-foreground leading-snug break-words">{sheet.name}</p>
              <p className="text-xs font-bold text-primary mt-0.5">
                {sheet.category || <span className="text-muted-foreground">bez kategorii</span>}
              </p>
              <p className="text-xs font-semibold text-muted-foreground mt-1.5">
                {sheet.stickerCount} {getStickersNoun(sheet.stickerCount)} · zmiana{" "}
                {formatDateTime(sheet.updatedAt)}
              </p>
            </div>
            <SheetCardActions id={sheet.id} name={sheet.name} status={sheet.status} />
          </div>
        </li>
      ))}
    </ul>
  );
}
