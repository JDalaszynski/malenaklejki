"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AlertTriangle, Check, Eye, EyeOff, Loader2, Store } from "lucide-react";

import { updateReadySheetsMode } from "@/app/actions/settings";
import { StatusPill } from "@/components/account/StatusPill";
import { formatDateTime } from "@/lib/orders/status";
import {
  READY_SHEETS_MODES,
  READY_SHEETS_MODE_DESCRIPTIONS,
  READY_SHEETS_MODE_LABELS,
  type ReadySheetsMode,
  type ReadySheetsSettings,
} from "@/lib/settings/readySheets";
import { Card } from "./AdminLayout";

const ICONS: Record<ReadySheetsMode, typeof Eye> = {
  off: EyeOff,
  preview: Eye,
  on: Store,
};

const TONES: Record<ReadySheetsMode, "neutral" | "warning" | "success"> = {
  off: "neutral",
  preview: "warning",
  on: "success",
};

/**
 * Włącznik gotowych arkuszy na stronie głównej.
 *
 * Zmiana idzie przyciskiem, nie samym kliknięciem w opcję — „Włączony"
 * pokazuje arkusze wszystkim klientom, więc pomyłka nie może zadziałać od razu.
 */
export function ReadySheetsModeForm({
  settings,
  publishedCount,
}: {
  settings: ReadySheetsSettings;
  publishedCount: number;
}) {
  const router = useRouter();
  const [selected, setSelected] = useState<ReadySheetsMode>(settings.mode);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const changed = selected !== settings.mode;

  const save = () => {
    setError(null);
    setSaved(false);
    startTransition(async () => {
      const result = await updateReadySheetsMode(selected);
      if (!result.success) {
        setError(result.error);
        return;
      }
      setSaved(true);
      router.refresh();
    });
  };

  return (
    <Card
      title="Gotowe arkusze w sklepie"
      description="Czy klienci widzą opublikowane gotowe arkusze w kreatorze na stronie głównej."
      actions={
        <StatusPill tone={TONES[settings.mode]}>{READY_SHEETS_MODE_LABELS[settings.mode]}</StatusPill>
      }
    >
      <div className="flex flex-col gap-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3" role="radiogroup" aria-label="Tryb gotowych arkuszy">
          {READY_SHEETS_MODES.map((mode) => {
            const Icon = ICONS[mode];
            const active = selected === mode;
            return (
              <button
                key={mode}
                type="button"
                role="radio"
                aria-checked={active}
                onClick={() => {
                  setSelected(mode);
                  setSaved(false);
                }}
                className={`text-left rounded-2xl border p-4 transition-all cursor-pointer ${
                  active
                    ? "border-primary bg-primary/5 shadow-sm"
                    : "border-border/60 bg-muted/20 hover:bg-muted/40"
                }`}
              >
                <span className="flex items-center justify-between gap-2">
                  <span className="flex items-center gap-2 text-sm font-extrabold text-foreground">
                    <Icon className={`w-4 h-4 ${active ? "text-primary" : "text-muted-foreground"}`} aria-hidden />
                    {READY_SHEETS_MODE_LABELS[mode]}
                  </span>
                  <span
                    className={`shrink-0 w-4.5 h-4.5 rounded-full border flex items-center justify-center ${
                      active ? "border-primary bg-primary/10" : "border-slate-300 dark:border-white/20 bg-background"
                    }`}
                  >
                    {active && <span className="w-2.5 h-2.5 rounded-full bg-primary" />}
                  </span>
                </span>
                <span className="block text-xs font-medium text-muted-foreground leading-relaxed mt-2">
                  {READY_SHEETS_MODE_DESCRIPTIONS[mode]}
                </span>
              </button>
            );
          })}
        </div>

        {selected !== "off" && publishedCount === 0 && (
          <p className="flex items-start gap-2 text-xs font-bold text-[#8a6d00] dark:text-[#FFCD08] bg-[#FFCD08]/10 border border-[#FFCD08]/40 rounded-xl px-3 py-2.5">
            <AlertTriangle className="w-4 h-4 shrink-0" aria-hidden />
            Nie ma jeszcze żadnego opublikowanego arkusza — na stronie głównej nic się nie pokaże,
            dopóki nie opublikujesz pierwszego.
          </p>
        )}

        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <button
            type="button"
            onClick={save}
            disabled={!changed || isPending}
            className="inline-flex items-center justify-center gap-2 rounded-xl text-sm font-bold h-11 px-5 bg-primary text-primary-foreground hover:bg-primary/95 shadow-sm transition-all active:scale-[0.98] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPending ? <Loader2 className="w-4 h-4 animate-spin" aria-hidden /> : <Check className="w-4 h-4" aria-hidden />}
            Zapisz tryb
          </button>
          {saved && !changed && (
            <span role="status" className="text-sm font-bold text-primary">
              Zapisano.
            </span>
          )}
          <span className="text-xs font-semibold text-muted-foreground">
            Opublikowanych arkuszy: {publishedCount} ·{" "}
            <Link href="/admin/arkusze" className="font-bold text-primary hover:underline">
              zarządzaj arkuszami
            </Link>
            {settings.mode !== "off" && (
              <>
                {" · "}
                <a href="/#sheet" target="_blank" rel="noreferrer" className="font-bold text-primary hover:underline">
                  zobacz stronę główną
                </a>
              </>
            )}
          </span>
        </div>

        {settings.updatedAt && (
          <p className="text-[11px] font-medium text-muted-foreground">
            Ostatnia zmiana {formatDateTime(settings.updatedAt)}
            {settings.updatedBy ? ` — ${settings.updatedBy}` : ""}
          </p>
        )}

        {error && (
          <p role="alert" className="text-sm font-bold text-destructive">
            {error}
          </p>
        )}
      </div>
    </Card>
  );
}
