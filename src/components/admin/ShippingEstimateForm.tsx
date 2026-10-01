"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Truck } from "lucide-react";

import { updateShippingEstimate } from "@/app/actions/settings";
import { FormAlert } from "@/components/auth/fields";
import { formatDateTime } from "@/lib/orders/status";
import { warsawToday } from "@/lib/settings/vacation";
import {
  SHIPPING_LIMITS,
  businessDaysLabel,
  estimateShippingAt,
  normalizeShippingEstimateSettings,
  type ShippingEstimateSettings,
} from "@/lib/settings/shippingEstimate";
import { Card } from "./AdminLayout";
import {
  SettingsField,
  SettingsSaveBar,
  settingsInputClass,
} from "./SettingsFields";

const days = z.coerce
  .number({ message: "Podaj liczbę dni." })
  .int({ message: "Podaj pełną liczbę dni." })
  .min(SHIPPING_LIMITS.days.min, { message: "Liczba dni nie może być ujemna." })
  .max(SHIPPING_LIMITS.days.max, { message: `Maksymalnie ${SHIPPING_LIMITS.days.max} dni.` });

const schema = z
  .object({
    cutoffHour: z.coerce.number().int().min(SHIPPING_LIMITS.cutoffHour.min).max(SHIPPING_LIMITS.cutoffHour.max),
    beforeMin: days,
    beforeMax: days,
    afterMin: days,
    afterMax: days,
  })
  .refine((value) => value.beforeMin <= value.beforeMax, {
    message: "Dolna granica nie może być wyższa od górnej.",
    path: ["beforeMin"],
  })
  .refine((value) => value.afterMin <= value.afterMax, {
    message: "Dolna granica nie może być wyższa od górnej.",
    path: ["afterMin"],
  });

type FormValues = z.input<typeof schema>;

const HOURS = Array.from(
  { length: SHIPPING_LIMITS.cutoffHour.max - SHIPPING_LIMITS.cutoffHour.min + 1 },
  (_, index) => SHIPPING_LIMITS.cutoffHour.min + index
);

function toValues(settings: ShippingEstimateSettings): FormValues {
  return {
    cutoffHour: settings.cutoffHour,
    beforeMin: settings.beforeMin,
    beforeMax: settings.beforeMax,
    afterMin: settings.afterMin,
    afterMax: settings.afterMax,
  };
}

const WEEKDAYS = ["niedziela", "poniedziałek", "wtorek", "środa", "czwartek", "piątek", "sobota"];

type Sample = { label: string; moment: Date };

/**
 * Trzy przykładowe zamówienia do podglądu: tuż przed godziną graniczną, tuż po
 * niej i w sobotę. Dzień roboczy bierzemy z dzisiejszego (albo najbliższego
 * poniedziałku), żeby przykład nie wpadał w weekend, gdy panel otwarto w niedzielę.
 */
function buildSamples(cutoffHour: number, today: string): Sample[] {
  const [year, month, day] = today.split("-").map(Number);
  const base = new Date(year, month - 1, day, 0, 0, 0);

  const weekday = new Date(base);
  while (weekday.getDay() === 0 || weekday.getDay() === 6) weekday.setDate(weekday.getDate() + 1);

  const saturday = new Date(base);
  while (saturday.getDay() !== 6) saturday.setDate(saturday.getDate() + 1);

  const at = (date: Date, hour: number, minute: number) => {
    const moment = new Date(date);
    moment.setHours(hour, minute, 0, 0);
    return moment;
  };
  const clock = (hour: number, minute: number) =>
    `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`;
  const describe = (date: Date) =>
    `${WEEKDAYS[date.getDay()]} ${date.getDate().toString().padStart(2, "0")}.${(date.getMonth() + 1)
      .toString()
      .padStart(2, "0")}`;

  const before = cutoffHour - 1;
  return [
    { label: `${describe(weekday)}, ${clock(before, 59)}`, moment: at(weekday, before, 59) },
    { label: `${describe(weekday)}, ${clock(cutoffHour, 0)}`, moment: at(weekday, cutoffHour, 0) },
    { label: `${describe(saturday)}, 10:00`, moment: at(saturday, 10, 0) },
  ];
}

function DaysRange({
  idPrefix,
  title,
  hint,
  minName,
  maxName,
  register,
  errors,
}: {
  idPrefix: string;
  title: string;
  hint: string;
  minName: "beforeMin" | "afterMin";
  maxName: "beforeMax" | "afterMax";
  register: ReturnType<typeof useForm<FormValues>>["register"];
  errors: ReturnType<typeof useForm<FormValues>>["formState"]["errors"];
}) {
  const error = errors[minName]?.message ?? errors[maxName]?.message;
  return (
    <fieldset className="rounded-2xl border border-border/60 bg-muted/20 p-4">
      <legend className="px-1 text-sm font-extrabold text-foreground">{title}</legend>
      <p className="text-xs font-medium text-muted-foreground mb-3">{hint}</p>
      <div className="grid grid-cols-2 gap-3">
        <SettingsField label="Od (dni roboczych)" htmlFor={`${idPrefix}-od`}>
          <input
            id={`${idPrefix}-od`}
            type="number"
            inputMode="numeric"
            min={SHIPPING_LIMITS.days.min}
            max={SHIPPING_LIMITS.days.max}
            className={settingsInputClass}
            {...register(minName)}
          />
        </SettingsField>
        <SettingsField label="Do (dni roboczych)" htmlFor={`${idPrefix}-do`}>
          <input
            id={`${idPrefix}-do`}
            type="number"
            inputMode="numeric"
            min={SHIPPING_LIMITS.days.min}
            max={SHIPPING_LIMITS.days.max}
            className={settingsInputClass}
            {...register(maxName)}
          />
        </SettingsField>
      </div>
      {error && (
        <p
          role="alert"
          className="inline-block bg-destructive/20 text-destructive text-xs font-bold px-2.5 py-1 rounded-lg mt-2"
        >
          {error}
        </p>
      )}
    </fieldset>
  );
}

/**
 * Widełki „Szacowana wysyłka" w koszyku.
 *
 * Klient widzi daty, a nie liczbę dni — formularz od razu pokazuje, jakie
 * daty wyjdą dla kilku przykładowych zamówień, bo „2–3 dni robocze" mówi
 * niewiele, dopóki nie zobaczy się ich w kalendarzu (zwłaszcza przy weekendzie).
 */
export function ShippingEstimateForm({
  settings,
  vacationActive,
}: {
  settings: ShippingEstimateSettings;
  /** Czy przerwa urlopowa już zastępuje widełki własnym tekstem. */
  vacationActive: boolean;
}) {
  const router = useRouter();
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: toValues(settings),
  });

  const values = watch();
  const draft = normalizeShippingEstimateSettings(values);
  const cutoff = draft.cutoffHour;

  const samples = buildSamples(cutoff, warsawToday());

  const onSubmit = async (formValues: FormValues) => {
    setFormError(null);
    const result = await updateShippingEstimate(formValues);
    if (!result.success) {
      setFormError(result.error);
      return;
    }
    // Zapisane wartości stają się nowym punktem odniesienia dla „niezapisanych zmian".
    reset(formValues);
    router.refresh();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
      {vacationActive && (
        <FormAlert tone="info">
          Trwa przerwa urlopowa — klienci widzą teraz termin z przerwy, a nie widełki poniżej.{" "}
          <Link href="#przerwa" className="underline">
            Przejdź do przerwy
          </Link>
        </FormAlert>
      )}

      <Card
        headingLevel={3}
        title="Widełki dni roboczych"
        description="Od złożenia zamówienia do wyjścia paczki. Soboty i niedziele się nie liczą."
      >
        <div className="flex flex-col gap-4">
          <SettingsField
            label="Godzina graniczna"
            htmlFor="wysylka-godzina"
            className="sm:max-w-xs"
            hint="Zamówienia złożone po tej godzinie (czas warszawski) i w weekend dostają drugie widełki."
          >
            <select
              id="wysylka-godzina"
              className={settingsInputClass}
              {...register("cutoffHour")}
            >
              {HOURS.map((hour) => (
                <option key={hour} value={hour}>
                  {hour.toString().padStart(2, "0")}:00
                </option>
              ))}
            </select>
          </SettingsField>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <DaysRange
              idPrefix="wysylka-przed"
              title={`Przed ${cutoff.toString().padStart(2, "0")}:00`}
              hint="Zamówienie złożone w dzień roboczy, przed godziną graniczną."
              minName="beforeMin"
              maxName="beforeMax"
              register={register}
              errors={errors}
            />
            <DaysRange
              idPrefix="wysylka-po"
              title={`Po ${cutoff.toString().padStart(2, "0")}:00 i w weekend`}
              hint="Zamówienie złożone po godzinie granicznej albo w sobotę i niedzielę."
              minName="afterMin"
              maxName="afterMax"
              register={register}
              errors={errors}
            />
          </div>
        </div>
      </Card>

      <Card
        headingLevel={3}
        title="Tak zobaczy to klient"
        description="Napis z koszyka dla przykładowych zamówień, liczony z widełek powyżej."
        actions={<Truck className="w-5 h-5 text-muted-foreground" aria-hidden />}
      >
        <ul className="flex flex-col divide-y divide-border/60 rounded-2xl border border-border/60 overflow-hidden">
          {samples.map((sample) => {
            const estimate = estimateShippingAt(draft, sample.moment);
            const min = estimate.afterCutoff ? draft.afterMin : draft.beforeMin;
            const max = estimate.afterCutoff ? draft.afterMax : draft.beforeMax;
            return (
              <li
                key={sample.label}
                className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 px-4 py-3 bg-muted/20"
              >
                <span className="text-sm font-bold text-foreground">
                  Zamówienie: {sample.label}
                  <span className="block text-xs font-medium text-muted-foreground">
                    {min === max ? businessDaysLabel(max) : `${min}–${businessDaysLabel(max)}`}
                  </span>
                </span>
                <span className="inline-flex items-center gap-1.5 self-start sm:self-auto bg-secondary/10 text-foreground border border-secondary/20 px-3 py-1.5 rounded-2xl text-xs font-black">
                  <Truck className="w-3.5 h-3.5 text-secondary" aria-hidden />
                  {estimate.text}
                </span>
              </li>
            );
          })}
        </ul>
        <p className="text-xs font-medium text-muted-foreground mt-3">
          Święta ustawowe nie są uwzględniane — na dni, w których nie pracujesz, użyj przerwy
          urlopowej poniżej.
        </p>
      </Card>

      <SettingsSaveBar
        dirty={isDirty}
        error={formError}
        saving={isSubmitting}
        onReset={() => {
          reset(toValues(settings));
          setFormError(null);
        }}
        lastChange={
          settings.updatedAt
            ? `${formatDateTime(settings.updatedAt)}${settings.updatedBy ? ` — ${settings.updatedBy}` : ""}`
            : null
        }
      />
    </form>
  );
}
