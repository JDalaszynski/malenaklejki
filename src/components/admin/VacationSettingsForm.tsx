"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Eye, Palmtree } from "lucide-react";

import { updateVacationSettings } from "@/app/actions/settings";
import { VacationBannerView } from "@/components/layout/VacationBanner";
import {
  normalizeVacationSettings,
  resolveVacation,
  warsawToday,
  type VacationSettings,
} from "@/lib/settings/vacation";
import { formatDateTime } from "@/lib/orders/status";
import { Card, CollapsibleCard } from "./AdminLayout";
import {
  SettingsField as Field,
  SettingsSaveBar,
  SettingsToggle as Toggle,
  settingsInputClass as inputClass,
  settingsTextareaClass as textareaClass,
} from "./SettingsFields";

const schema = z
  .object({
    enabled: z.boolean(),
    startsAt: z.string().trim(),
    endsAt: z.string().trim(),
    announceDaysBefore: z.coerce.number().int().min(0).max(90),
    title: z.string().trim().max(120),
    message: z.string().trim().max(600),
    shippingNote: z.string().trim().max(160),
    pauseOrders: z.boolean(),
    tone: z.enum(["info", "warning"]),
  })
  .refine((value) => !value.startsAt || !value.endsAt || value.endsAt >= value.startsAt, {
    message: "Ostatni dzień przerwy nie może wypadać przed pierwszym.",
    path: ["endsAt"],
  });

type FormValues = z.input<typeof schema>;

function toValues(settings: VacationSettings): FormValues {
  return {
    enabled: settings.enabled,
    startsAt: settings.startsAt ?? "",
    endsAt: settings.endsAt ?? "",
    announceDaysBefore: settings.announceDaysBefore,
    title: settings.title,
    message: settings.message,
    shippingNote: settings.shippingNote,
    pauseOrders: settings.pauseOrders,
    tone: settings.tone,
  };
}

/**
 * Ustawienia przerwy urlopowej.
 *
 * Formularz pokazuje na żywo dokładnie ten sam pasek, który zobaczy klient —
 * łącznie z tekstami generowanymi automatycznie z dat, gdy pola opisowe
 * zostaną puste. Bez podglądu trudno ocenić, czy „zostaw puste" da sensowne
 * zdanie, a pomyłka w tym miejscu jest widoczna na całym sklepie.
 */
export function VacationSettingsForm({ settings }: { settings: VacationSettings }) {
  const router = useRouter();
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: toValues(settings),
  });

  const values = watch();

  // Podgląd liczymy tą samą funkcją co strona sklepu, żeby nie powstała druga
  // — rozjeżdżająca się z czasem — definicja tego, co widzi klient.
  const draft = normalizeVacationSettings({
    ...values,
    announceDaysBefore: Number(values.announceDaysBefore),
    startsAt: values.startsAt || null,
    endsAt: values.endsAt || null,
    updatedAt: settings.updatedAt,
  });
  const today = warsawToday();
  const preview = resolveVacation({ ...draft, enabled: true }, today);
  const liveState = resolveVacation(draft, today);

  const onSubmit = async (formValues: FormValues) => {
    setFormError(null);

    const result = await updateVacationSettings(formValues);
    if (!result.success) {
      setFormError(result.error);
      return;
    }

    // Zapisane wartości stają się nowym punktem odniesienia dla „niezapisanych zmian".
    reset(formValues);
    router.refresh();
  };

  const hasCustomTexts = Boolean(
    values.title || values.message || values.shippingNote || values.tone === "warning"
  );

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
      <Card
        headingLevel={3}
        title="Termin przerwy"
        description="Włącznik i daty. Decydują o tym, kiedy baner, koszyk i maile mówią o przerwie."
        actions={
          <span
            className={`inline-flex items-center gap-2 rounded-xl border px-3 py-1.5 text-xs font-black uppercase tracking-wide ${
              liveState.status === "active"
                ? "bg-primary/10 border-primary/30 text-primary"
                : liveState.status === "upcoming"
                  ? "bg-secondary/10 border-secondary/30 text-secondary"
                  : "bg-muted/50 border-border/60 text-muted-foreground"
            }`}
          >
            <Palmtree className="w-3.5 h-3.5" aria-hidden />
            {liveState.status === "active"
              ? "Trwa"
              : liveState.status === "upcoming"
                ? liveState.visible
                  ? "Zapowiadana"
                  : "Zaplanowana"
                : "Wyłączona"}
          </span>
        }
      >
        <div className="flex flex-col gap-4">
          <Toggle
            label="Włącz przerwę urlopową"
            description="Wyłączona — nic się nigdzie nie pokazuje. Włączona — o terminie decydują daty poniżej."
            checked={Boolean(values.enabled)}
            onChange={(value) => setValue("enabled", value, { shouldDirty: true })}
          />

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Field
              label="Pierwszy dzień przerwy"
              htmlFor="przerwa-start"
              hint="Puste = przerwa trwa od zaraz."
              error={errors.startsAt?.message}
            >
              <input id="przerwa-start" type="date" className={inputClass} {...register("startsAt")} />
            </Field>
            <Field
              label="Ostatni dzień przerwy"
              htmlFor="przerwa-koniec"
              hint="Puste = bezterminowo, do ręcznego wyłączenia."
              error={errors.endsAt?.message}
            >
              <input id="przerwa-koniec" type="date" className={inputClass} {...register("endsAt")} />
            </Field>
            <Field
              label="Zapowiedź (dni przed)"
              htmlFor="przerwa-zapowiedz"
              hint="0 = bez zapowiedzi. Baner pojawi się tyle dni przed startem."
              error={errors.announceDaysBefore?.message}
            >
              <input
                id="przerwa-zapowiedz"
                type="number"
                inputMode="numeric"
                min={0}
                max={90}
                className={inputClass}
                {...register("announceDaysBefore")}
              />
            </Field>
          </div>

          {liveState.resumesAt && (
            <p className="text-xs font-bold text-muted-foreground">
              Pierwszy dzień pracy po przerwie: {liveState.resumesAt}. Tę datę podajemy klientom
              w banerze, w koszyku i w mailu z potwierdzeniem.
            </p>
          )}

          <Toggle
            label="Wstrzymaj przyjmowanie nowych zamówień"
            description="Kasa zostaje zablokowana na czas trwania przerwy — także wtedy, gdy ktoś ominie interfejs i wywoła zapis zamówienia bezpośrednio. Zapowiedź przerwy niczego nie blokuje. Domyślnie sklep sprzedaje dalej, a paczki czekają na powrót."
            checked={Boolean(values.pauseOrders)}
            onChange={(value) => setValue("pauseOrders", value, { shouldDirty: true })}
          />
        </div>
      </Card>

      <CollapsibleCard
        headingLevel={3}
        title="Własne teksty komunikatu"
        description="Opcjonalne — zostaw puste, a teksty ułożą się same z ustawionych dat."
        defaultOpen={hasCustomTexts}
      >
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Field
              label="Nagłówek"
              htmlFor="przerwa-naglowek"
              className="sm:col-span-2"
              error={errors.title?.message}
              hint={`Domyślnie: „${preview.title}"`}
            >
              <input
                id="przerwa-naglowek"
                maxLength={120}
                className={inputClass}
                placeholder={preview.title}
                {...register("title")}
              />
            </Field>
            <Field label="Wygląd" htmlFor="przerwa-wyglad" error={errors.tone?.message}>
              <select id="przerwa-wyglad" className={inputClass} {...register("tone")}>
                <option value="info">Spokojny (zielony)</option>
                <option value="warning">Ostrzegawczy (czerwony)</option>
              </select>
            </Field>
          </div>

          <Field
            label="Treść banera"
            htmlFor="przerwa-tresc"
            error={errors.message?.message}
            hint={`Domyślnie: „${preview.message}"`}
          >
            <textarea
              id="przerwa-tresc"
              rows={3}
              maxLength={600}
              className={textareaClass}
              placeholder={preview.message}
              {...register("message")}
            />
          </Field>

          <Field
            label="Termin wysyłki w koszyku"
            htmlFor="przerwa-wysylka"
            error={errors.shippingNote?.message}
            hint={`Zastępuje „Szacowana wysyłka: …" na czas przerwy. Domyślnie: „${preview.shippingNote}"`}
          >
            <input
              id="przerwa-wysylka"
              maxLength={160}
              className={inputClass}
              placeholder={preview.shippingNote}
              {...register("shippingNote")}
            />
          </Field>
        </div>
      </CollapsibleCard>

      <Card
        headingLevel={3}
        title="Podgląd baneru"
        description="Tak wygląda pasek nad nagłówkiem sklepu. Pokazujemy go niezależnie od włącznika i dat."
        actions={
          <span className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-wide text-muted-foreground">
            <Eye className="w-3.5 h-3.5" aria-hidden />
            Na żywo
          </span>
        }
      >
        <div className="rounded-2xl bg-[#edf6f2] dark:bg-[#002c2e] py-2 pb-6 -mx-1 overflow-hidden">
          <VacationBannerView info={preview} />
        </div>
        {!liveState.visible && (
          <p className="text-xs font-bold text-muted-foreground mt-3">
            Uwaga: przy obecnych ustawieniach klienci tego paska dziś nie zobaczą
            {values.enabled ? " — przerwa jest zaplanowana poza oknem zapowiedzi." : " — przerwa jest wyłączona."}
          </p>
        )}
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
