"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Printer, Trash2 } from "lucide-react";

import { updateProductionCost } from "@/app/actions/settings";
import { FormAlert } from "@/components/auth/fields";
import { COST_RATES, financeOf } from "@/lib/admin/costs";
import { formatDateTime, formatPln } from "@/lib/orders/status";
import {
  dayBefore,
  formValuesOf,
  formatCostDay,
  grossOfNet,
  isValidDay,
  parseCostAmount,
  productionCostFormSchema,
  settingsOfFormValues,
  sheetCostAt,
  upcomingSheetCost,
  type ProductionCostFormValues,
  type ProductionCostSettings,
} from "@/lib/settings/productionCost";
import { warsawToday } from "@/lib/settings/vacation";
import { SHEET_PRICE } from "@/lib/sheets/types";
import { Card } from "./AdminLayout";
import { SettingsSaveBar, settingsInputClass } from "./SettingsFields";

/** Zysk operacyjny zamówienia na jeden arkusz przy danej stawce — miara skutku zmiany. */
function oneSheetProfit(net: number): number {
  return financeOf({ sheets: 1, gross: SHEET_PRICE + COST_RATES.shippingGross, sheetNet: net }).profit;
}

/** Dzień po podanym — domyślna data kolejnej zmiany, gdy dzisiejsza jest zajęta. */
function dayAfter(day: string): string {
  const [year, month, dayOfMonth] = day.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, dayOfMonth + 1)).toISOString().slice(0, 10);
}

type RowState = { label: string; tone: "current" | "planned" | "past" | "invalid" };

/**
 * Okres obowiązywania wiersza liczony z całej historii (wiersze w formularzu
 * mogą stać w dowolnej kolejności — zapis je posortuje).
 */
function rowState(from: string | null, sortedDays: string[], today: string): RowState {
  if (from !== null && !isValidDay(from)) return { label: "Brak daty", tone: "invalid" };
  const next = sortedDays.find((day) => from === null || day > from) ?? null;
  if (from !== null && from > today) {
    return { label: next ? `Zaplanowana, do ${formatCostDay(dayBefore(next))}` : "Zaplanowana", tone: "planned" };
  }
  if (next && next <= today) return { label: `Do ${formatCostDay(dayBefore(next))}`, tone: "past" };
  return { label: next ? `Obowiązuje, do ${formatCostDay(dayBefore(next))}` : "Obowiązuje", tone: "current" };
}

const TONE_CLASSES: Record<RowState["tone"], string> = {
  current: "bg-primary/10 text-primary border-primary/30",
  planned: "bg-secondary/10 text-foreground border-secondary/30",
  past: "bg-muted/40 text-muted-foreground border-border/60",
  invalid: "bg-destructive/10 text-destructive border-destructive/30",
};

/**
 * Koszt wydruku arkusza u dostawcy — historia stawek z datami.
 *
 * Jedna kwota rządzi trzema miejscami: ceną pozycji w BaseLinkerze, kosztem
 * w statystykach i rachunkiem przy zamówieniu. Dlatego formularz od razu
 * pokazuje, co zmiana zrobi w każdym z nich, zanim się ją zapisze.
 */
export function ProductionCostForm({ settings }: { settings: ProductionCostSettings }) {
  const router = useRouter();
  const [formError, setFormError] = useState<string | null>(null);
  const [saved, setSaved] = useState(settings);

  const {
    register,
    control,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<ProductionCostFormValues>({
    resolver: zodResolver(productionCostFormSchema),
    defaultValues: formValuesOf(settings),
  });
  const { fields, append, remove } = useFieldArray({ control, name: "rates" });

  const values = watch();
  const today = warsawToday();
  const draft = settingsOfFormValues(values);
  const current = sheetCostAt(draft, today);
  const upcoming = upcomingSheetCost(draft, today);
  const currentIndex = draft.rates.findIndex((rate) => rate.from === current.from);
  const previous = currentIndex > 0 ? draft.rates[currentIndex - 1] : null;
  const sortedDays = draft.rates.flatMap((rate) => (rate.from ? [rate.from] : []));

  const profit = oneSheetProfit(current.net);
  const previousProfit = previous ? oneSheetProfit(previous.net) : null;

  const onSubmit = async (formValues: ProductionCostFormValues) => {
    setFormError(null);
    const result = await updateProductionCost(formValues);
    if (!result.success) {
      setFormError(result.error);
      return;
    }
    // Zapis sortuje stawki po dacie — formularz bierze stan z bazy jako nowy
    // punkt odniesienia dla „niezapisanych zmian".
    setSaved(result.settings);
    reset(formValuesOf(result.settings));
    router.refresh();
  };

  const addRate = () => {
    const taken = new Set((values.rates ?? []).map((rate) => rate.from));
    let day = today;
    while (taken.has(day)) day = dayAfter(day);
    append({ from: day, net: current.net.toFixed(2).replace(".", ",") });
  };

  const rateErrors = errors.rates;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
      <Card
        headingLevel={3}
        title="Stawka na dziś"
        description={
          isDirty
            ? "Podgląd z niezapisanych zmian — po zapisie zacznie obowiązywać."
            : "Tyle kosztuje wydruk jednego arkusza A4 w zamówieniach opłaconych dzisiaj."
        }
        actions={<Printer className="w-5 h-5 text-muted-foreground" aria-hidden />}
      >
        <div className="flex flex-col gap-4">
          <div>
            <p className="text-3xl font-extrabold tabular-nums text-foreground">
              {formatPln(current.net)} <span className="text-base font-bold text-muted-foreground">netto</span>
            </p>
            <p className="text-sm font-medium text-muted-foreground mt-0.5">
              {formatPln(current.gross)} brutto
              {current.from ? ` · od ${formatCostDay(current.from)}` : " · od początku sklepu"}
              {previous && `, wcześniej ${formatPln(previous.net)} netto`}
            </p>
          </div>

          <dl className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="rounded-2xl border border-border/60 bg-muted/20 p-4">
              <dt className="text-[11px] font-black uppercase tracking-wider text-muted-foreground">
                BaseLinker
              </dt>
              <dd className="text-lg font-extrabold tabular-nums mt-1">{formatPln(current.gross)}</dd>
              <dd className="text-xs font-medium text-muted-foreground mt-0.5">
                cena brutto pozycji za arkusz w każdym nowym zamówieniu
              </dd>
            </div>
            <div className="rounded-2xl border border-border/60 bg-muted/20 p-4">
              <dt className="text-[11px] font-black uppercase tracking-wider text-muted-foreground">
                Statystyki
              </dt>
              <dd className="text-lg font-extrabold tabular-nums mt-1">{formatPln(current.net)}</dd>
              <dd className="text-xs font-medium text-muted-foreground mt-0.5">
                koszt arkusza netto; VAT {formatPln(current.gross - current.net)} odliczasz
              </dd>
            </div>
            <div className="rounded-2xl border border-primary/30 bg-primary/5 p-4">
              <dt className="text-[11px] font-black uppercase tracking-wider text-muted-foreground">
                Zysk z 1 arkusza
              </dt>
              <dd className="text-lg font-extrabold tabular-nums mt-1 text-primary">{formatPln(profit)}</dd>
              <dd className="text-xs font-medium text-muted-foreground mt-0.5">
                zamówienie za {formatPln(SHEET_PRICE + COST_RATES.shippingGross)} z dostawą, przed
                zdrowotną i PIT
                {previousProfit !== null && `; przy ${formatPln(previous!.net)} było ${formatPln(previousProfit)}`}
              </dd>
            </div>
          </dl>

          {upcoming && (
            <FormAlert tone="info">
              Od {formatCostDay(upcoming.from!)} wejdzie stawka {formatPln(upcoming.net)} netto (
              {formatPln(grossOfNet(upcoming.net))} brutto) — sama, bez dodatkowego zapisu. Zysk
              z zamówienia na 1 arkusz wyniesie wtedy {formatPln(oneSheetProfit(upcoming.net))}.
            </FormAlert>
          )}
        </div>
      </Card>

      <Card
        headingLevel={3}
        title="Historia stawek"
        description="Każda stawka obowiązuje od swojego dnia do dnia przed następną. Zamówienie bierze stawkę z dnia zapłaty (czas polski)."
      >
        <ul className="flex flex-col divide-y divide-border/60 rounded-2xl border border-border/60 overflow-hidden">
          {fields.map((field, index) => {
            const row = values.rates?.[index];
            const from = index === 0 ? null : (row?.from ?? "");
            const net = parseCostAmount(row?.net ?? "");
            const state = rowState(from, sortedDays, today);
            const fromError = rateErrors?.[index]?.from?.message;
            const netError = rateErrors?.[index]?.net?.message;
            return (
              <li
                key={field.id}
                className="grid grid-cols-1 sm:grid-cols-[minmax(0,1fr)_9rem_2.75rem] gap-3 sm:items-start px-4 py-3 bg-muted/10"
              >
                <div className="min-w-0">
                  {index === 0 ? (
                    <>
                      <span className="block text-sm font-bold mb-1.5">Od dnia</span>
                      <p className="h-11 flex items-center text-sm font-extrabold text-foreground">
                        Od początku sklepu
                      </p>
                    </>
                  ) : (
                    <>
                      <label htmlFor={`koszt-od-${index}`} className="block text-sm font-bold mb-1.5">
                        Od dnia
                      </label>
                      <input
                        id={`koszt-od-${index}`}
                        type="date"
                        className={settingsInputClass}
                        aria-invalid={fromError ? true : undefined}
                        {...register(`rates.${index}.from`)}
                      />
                    </>
                  )}
                  <span
                    className={`inline-block mt-2 rounded-lg border px-2 py-0.5 text-[11px] font-extrabold ${TONE_CLASSES[state.tone]}`}
                  >
                    {state.label}
                  </span>
                  {fromError && (
                    <p
                      role="alert"
                      className="block w-fit bg-destructive/20 text-destructive text-xs font-bold px-2.5 py-1 rounded-lg mt-2"
                    >
                      {fromError}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor={`koszt-netto-${index}`} className="block text-sm font-bold mb-1.5">
                    Netto za arkusz
                  </label>
                  <div className="relative">
                    <input
                      id={`koszt-netto-${index}`}
                      type="text"
                      inputMode="decimal"
                      autoComplete="off"
                      className={`${settingsInputClass} pr-9 tabular-nums`}
                      aria-invalid={netError ? true : undefined}
                      {...register(`rates.${index}.net`)}
                    />
                    <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm font-bold text-muted-foreground">
                      zł
                    </span>
                  </div>
                  <p className="text-xs font-medium text-muted-foreground mt-1.5 tabular-nums">
                    {net !== null ? `${formatPln(grossOfNet(net))} brutto` : "—"}
                  </p>
                  {netError && (
                    <p
                      role="alert"
                      className="inline-block bg-destructive/20 text-destructive text-xs font-bold px-2.5 py-1 rounded-lg mt-1"
                    >
                      {netError}
                    </p>
                  )}
                </div>

                <div className="sm:pt-[1.875rem]">
                  {index > 0 && (
                    <button
                      type="button"
                      onClick={() => remove(index)}
                      className="inline-flex items-center justify-center gap-1.5 h-11 px-3 sm:w-11 sm:px-0 rounded-xl border border-border/70 text-sm font-bold text-muted-foreground hover:text-destructive hover:border-destructive/40 hover:bg-destructive/5 transition-colors cursor-pointer"
                      aria-label={`Usuń stawkę ${row?.from ? `od ${row.from}` : ""}`.trim()}
                    >
                      <Trash2 className="w-4 h-4" aria-hidden />
                      <span className="sm:hidden">Usuń</span>
                    </button>
                  )}
                </div>
              </li>
            );
          })}
        </ul>

        <button
          type="button"
          onClick={addRate}
          className="mt-3 inline-flex items-center justify-center gap-2 h-11 px-4 rounded-xl border border-dashed border-primary/50 text-sm font-bold text-primary hover:bg-primary/5 transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" aria-hidden />
          Dodaj zmianę stawki
        </button>

        <ul className="mt-4 flex flex-col gap-1.5 text-xs font-medium text-muted-foreground list-disc pl-4">
          <li>Nowa cena od jutra albo od pierwszego dnia miesiąca? Wpisz ją z wyprzedzeniem — wejdzie sama.</li>
          <li>
            Data wsteczna przelicza statystyki od tego dnia, ale nie zmienia ceny w zamówieniach już
            wysłanych do BaseLinkera — tam popraw ją ręcznie.
          </li>
          <li>Cena dla klientów ({formatPln(SHEET_PRICE)} za arkusz) się od tego nie zmienia.</li>
        </ul>
      </Card>

      <SettingsSaveBar
        dirty={isDirty}
        error={formError}
        saving={isSubmitting}
        onReset={() => {
          reset(formValuesOf(saved));
          setFormError(null);
        }}
        lastChange={
          saved.updatedAt
            ? `${formatDateTime(saved.updatedAt)}${saved.updatedBy ? ` — ${saved.updatedBy}` : ""}`
            : null
        }
      />
    </form>
  );
}
