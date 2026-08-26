"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Eye, Palmtree } from "lucide-react";

import { updateVacationSettings } from "@/app/actions/settings";
import { FormAlert, SubmitButton } from "@/components/auth/fields";
import { VacationBannerView } from "@/components/layout/VacationBanner";
import {
  normalizeVacationSettings,
  resolveVacation,
  warsawToday,
  type VacationSettings,
} from "@/lib/settings/vacation";
import { Card } from "./AdminLayout";

const inputClass =
  "h-11 w-full rounded-xl border border-slate-300 dark:border-white/20 bg-background px-3 text-sm font-semibold focus-visible:outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20";

const textareaClass =
  "w-full rounded-xl border border-slate-300 dark:border-white/20 bg-background px-3 py-2.5 text-sm font-semibold leading-relaxed focus-visible:outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20";

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

function Field({
  label,
  hint,
  error,
  children,
  className = "",
}: {
  label: string;
  hint?: string;
  error?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <label className="text-sm font-bold mb-1.5 block">{label}</label>
      {children}
      {hint && !error && (
        <p className="text-xs font-medium text-muted-foreground mt-1.5">{hint}</p>
      )}
      {error && (
        <p className="inline-block bg-destructive/20 text-destructive text-xs font-bold px-2.5 py-1 rounded-lg mt-1.5">
          {error}
        </p>
      )}
    </div>
  );
}

function Toggle({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <label className="flex items-start gap-3 rounded-2xl border border-border/60 bg-muted/30 hover:bg-muted/50 p-4 cursor-pointer transition-colors select-none">
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="mt-0.5 w-4 h-4 rounded border-border text-primary focus:ring-primary cursor-pointer"
      />
      <span className="min-w-0">
        <span className="block text-sm font-extrabold text-foreground">{label}</span>
        <span className="block text-xs font-medium text-muted-foreground leading-relaxed mt-0.5">
          {description}
        </span>
      </span>
    </label>
  );
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
  const [saved, setSaved] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      enabled: settings.enabled,
      startsAt: settings.startsAt ?? "",
      endsAt: settings.endsAt ?? "",
      announceDaysBefore: settings.announceDaysBefore,
      title: settings.title,
      message: settings.message,
      shippingNote: settings.shippingNote,
      pauseOrders: settings.pauseOrders,
      tone: settings.tone,
    },
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
    setSaved(false);

    const result = await updateVacationSettings(formValues);
    if (!result.success) {
      setFormError(result.error);
      return;
    }

    setSaved(true);
    router.refresh();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6" noValidate>
      {formError && <FormAlert>{formError}</FormAlert>}
      {saved && <FormAlert tone="success">Zapisano ustawienia przerwy urlopowej.</FormAlert>}

      <Card
        title="Przerwa urlopowa"
        description="Jeden włącznik dla baneru na stronie, terminu wysyłki w koszyku i informacji w mailach."
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
              hint="Puste = przerwa trwa od zaraz."
              error={errors.startsAt?.message}
            >
              <input type="date" className={inputClass} {...register("startsAt")} />
            </Field>
            <Field
              label="Ostatni dzień przerwy"
              hint="Puste = bezterminowo, do ręcznego wyłączenia."
              error={errors.endsAt?.message}
            >
              <input type="date" className={inputClass} {...register("endsAt")} />
            </Field>
            <Field
              label="Zapowiedź (dni przed)"
              hint="0 = bez zapowiedzi. Baner pojawi się tyle dni przed startem."
              error={errors.announceDaysBefore?.message}
            >
              <input
                type="number"
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
        </div>
      </Card>

      <Card
        title="Treść komunikatu"
        description="Zostaw pola puste, a teksty ułożą się same z ustawionych dat."
      >
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Field
              label="Nagłówek"
              className="sm:col-span-2"
              error={errors.title?.message}
              hint={`Domyślnie: „${preview.title}"`}
            >
              <input
                className={inputClass}
                placeholder={preview.title}
                {...register("title")}
              />
            </Field>
            <Field label="Wygląd" error={errors.tone?.message}>
              <select className={inputClass} {...register("tone")}>
                <option value="info">Spokojny (zielony)</option>
                <option value="warning">Ostrzegawczy (czerwony)</option>
              </select>
            </Field>
          </div>

          <Field
            label="Treść banera"
            error={errors.message?.message}
            hint={`Domyślnie: „${preview.message}"`}
          >
            <textarea
              rows={3}
              className={textareaClass}
              placeholder={preview.message}
              {...register("message")}
            />
          </Field>

          <Field
            label="Termin wysyłki w koszyku i kreatorze"
            error={errors.shippingNote?.message}
            hint={`Zastępuje „Szacowana wysyłka: …". Domyślnie: „${preview.shippingNote}"`}
          >
            <input
              className={inputClass}
              placeholder={preview.shippingNote}
              {...register("shippingNote")}
            />
          </Field>
        </div>
      </Card>

      <Card
        title="Zamówienia w czasie przerwy"
        description="Domyślnie sklep sprzedaje dalej, a paczki czekają na powrót."
      >
        <Toggle
          label="Wstrzymaj przyjmowanie nowych zamówień"
          description="Kasa zostaje zablokowana na czas trwania przerwy — także wtedy, gdy ktoś ominie interfejs i wywoła zapis zamówienia bezpośrednio. Zapowiedź przerwy niczego nie blokuje."
          checked={Boolean(values.pauseOrders)}
          onChange={(value) => setValue("pauseOrders", value, { shouldDirty: true })}
        />
      </Card>

      <Card
        title="Podgląd"
        description="Tak wygląda pasek nad nagłówkiem sklepu. Podgląd pokazujemy niezależnie od włącznika i dat."
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

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <p className="text-xs font-medium text-muted-foreground">
          {settings.updatedAt
            ? `Ostatnia zmiana: ${new Date(settings.updatedAt).toLocaleString("pl-PL")}${
                settings.updatedBy ? ` — ${settings.updatedBy}` : ""
              }`
            : "Ustawienia nie były jeszcze zapisywane."}
        </p>
        <SubmitButton loading={isSubmitting} className="sm:w-auto sm:px-10">
          Zapisz ustawienia
        </SubmitButton>
      </div>
    </form>
  );
}
