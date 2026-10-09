"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Copy, EyeOff, Loader2, Pencil, Rocket, Trash2 } from "lucide-react";

import { deleteSheet, duplicateSheet, setSheetBestseller, setSheetStatus } from "@/app/actions/sheets";
import type { SheetStatus } from "@/lib/sheets/types";

const iconButton =
  "inline-flex items-center justify-center gap-1.5 h-9 px-2 rounded-xl text-xs font-bold border whitespace-nowrap transition-all active:scale-[0.97] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed";

const textButton =
  "inline-flex items-center gap-1.5 text-xs font-bold text-muted-foreground hover:text-foreground transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed";

/** Szybkie akcje pod kafelkiem zestawu. */
export function SheetCardActions({
  id,
  name,
  status,
  bestseller,
}: {
  id: string;
  name: string;
  status: SheetStatus;
  bestseller: boolean;
}) {
  const router = useRouter();
  const [pending, setPending] = useState<"status" | "duplicate" | "delete" | "bestseller" | null>(
    null
  );
  const [, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [blockers, setBlockers] = useState<string[]>([]);

  const run = async (
    kind: "status" | "duplicate" | "delete" | "bestseller",
    action: () => Promise<void>
  ) => {
    setError(null);
    setBlockers([]);
    setPending(kind);
    try {
      await action();
    } finally {
      setPending(null);
    }
  };

  const toggleStatus = () =>
    run("status", async () => {
      const next: SheetStatus = status === "published" ? "draft" : "published";
      if (
        next === "draft" &&
        !window.confirm(`Zdjąć „${name}” ze sklepu? Zestaw zostanie w szkicach.`)
      ) {
        return;
      }
      const result = await setSheetStatus({ id, status: next });
      if (!result.success) {
        setError(result.error);
        setBlockers(result.blockers ?? []);
        return;
      }
      startTransition(() => router.refresh());
    });

  const toggleBestseller = (next: boolean) =>
    run("bestseller", async () => {
      const result = await setSheetBestseller({ id, bestseller: next });
      if (!result.success) {
        setError(result.error);
        return;
      }
      startTransition(() => router.refresh());
    });

  const duplicate = () =>
    run("duplicate", async () => {
      const result = await duplicateSheet(id);
      if (!result.success) {
        setError(result.error);
        return;
      }
      router.push(`/admin/zestawy/${result.id}`);
    });

  const remove = () =>
    run("delete", async () => {
      const warning =
        status === "published"
          ? `Zestaw „${name}” jest opublikowany — zniknie ze sklepu. Usunąć go na stałe?`
          : `Usunąć zestaw „${name}” na stałe? Tej operacji nie da się cofnąć.`;
      if (!window.confirm(warning)) return;
      const result = await deleteSheet(id);
      if (!result.success) {
        setError(result.error);
        return;
      }
      startTransition(() => router.refresh());
    });

  return (
    <div className="flex flex-col gap-2">
      <div className="grid grid-cols-2 gap-1.5">
        <Link
          href={`/admin/zestawy/${id}`}
          className={`${iconButton} bg-primary text-primary-foreground border-primary hover:bg-primary/95`}
        >
          <Pencil className="w-3.5 h-3.5" aria-hidden />
          Edytuj
        </Link>
        <button
          type="button"
          onClick={toggleStatus}
          disabled={pending !== null}
          title={status === "published" ? "Zdejmij ze sklepu i przenieś do szkiców" : "Opublikuj w sklepie"}
          className={`${iconButton} border-slate-300 dark:border-white/20 bg-background hover:bg-slate-50 dark:hover:bg-white/5`}
        >
          {pending === "status" ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" aria-hidden />
          ) : status === "published" ? (
            <EyeOff className="w-3.5 h-3.5" aria-hidden />
          ) : (
            <Rocket className="w-3.5 h-3.5" aria-hidden />
          )}
          {status === "published" ? "Do szkiców" : "Opublikuj"}
        </button>
      </div>

      <label
        title="Oznaczenie „Bestseller” przy zestawie w galerii kreatora"
        className="flex items-center gap-2 px-0.5 text-xs font-bold text-foreground cursor-pointer select-none"
      >
        <input
          type="checkbox"
          checked={bestseller}
          disabled={pending !== null}
          onChange={(event) => toggleBestseller(event.target.checked)}
          className="w-4 h-4 rounded border-border text-primary focus:ring-primary cursor-pointer disabled:cursor-not-allowed disabled:opacity-60"
        />
        Bestseller
        {pending === "bestseller" && (
          <Loader2 className="w-3.5 h-3.5 animate-spin text-muted-foreground" aria-hidden />
        )}
      </label>

      <div className="flex items-center gap-4 px-0.5">
        <button
          type="button"
          onClick={duplicate}
          disabled={pending !== null}
          title="Kopia zestawu jako nowy szkic"
          className={textButton}
        >
          {pending === "duplicate" ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" aria-hidden />
          ) : (
            <Copy className="w-3.5 h-3.5" aria-hidden />
          )}
          Duplikuj
        </button>
        <button
          type="button"
          onClick={remove}
          disabled={pending !== null}
          className={`${textButton} hover:text-destructive`}
        >
          {pending === "delete" ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" aria-hidden />
          ) : (
            <Trash2 className="w-3.5 h-3.5" aria-hidden />
          )}
          Usuń
        </button>
      </div>

      {error && (
        <div role="alert" className="text-xs font-bold text-destructive">
          <p>{error}</p>
          {blockers.length > 0 && (
            <ul className="mt-1 list-disc pl-4 font-semibold text-destructive/90">
              {blockers.map((reason) => (
                <li key={reason}>{reason}</li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
