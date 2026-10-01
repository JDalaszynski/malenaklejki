"use server";

import { z } from "zod";
import { revalidatePath, updateTag } from "next/cache";

import { getSession } from "@/lib/auth/dal";
import { recordAudit } from "@/lib/admin/audit";
import {
  DEFAULT_VACATION_SETTINGS,
  VACATION_CACHE_TAG,
  formatDayMonth,
  normalizeVacationSettings,
  type VacationSettings,
} from "@/lib/settings/vacation";
import { getVacationSettingsFresh, saveVacationSettings } from "@/lib/settings/vacationStore";
import {
  SHIPPING_ESTIMATE_TAG,
  SHIPPING_LIMITS,
  businessDaysLabel,
  normalizeShippingEstimateSettings,
  type ShippingEstimateSettings,
} from "@/lib/settings/shippingEstimate";
import {
  getShippingEstimateSettingsFresh,
  saveShippingEstimateSettings,
} from "@/lib/settings/shippingEstimateStore";
import {
  READY_SHEETS_MODES,
  READY_SHEETS_MODE_LABELS,
  READY_SHEETS_MODE_TAG,
  type ReadySheetsMode,
} from "@/lib/settings/readySheets";
import {
  getReadySheetsSettingsFresh,
  saveReadySheetsMode,
} from "@/lib/settings/readySheetsStore";

type Result<T = object> = ({ success: true } & T) | { success: false; error: string };

const DENIED = { success: false, error: "Brak uprawnień." } as const;

/**
 * Uprawnienia sprawdzamy tu ponownie, mimo że strona panelu też je sprawdza.
 * Akcja serwerowa ma własny adres i da się ją wywołać z pominięciem interfejsu.
 */
async function requireAdminActor(): Promise<{ email: string } | null> {
  const session = await getSession();
  if (!session?.isAdmin) return null;
  return { email: session.email ?? "administrator" };
}

const dateField = z
  .string()
  .trim()
  .max(10)
  .regex(/^(\d{4}-\d{2}-\d{2})?$/, { message: "Podaj datę w formacie RRRR-MM-DD." })
  .optional()
  .default("");

const vacationSchema = z
  .object({
    enabled: z.boolean(),
    startsAt: dateField,
    endsAt: dateField,
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

export async function updateVacationSettings(raw: unknown): Promise<Result> {
  const actor = await requireAdminActor();
  if (!actor) return DENIED;

  const parsed = vacationSchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message || "Błędne dane." };
  }
  const input = parsed.data;

  const before = await getVacationSettingsFresh();

  const settings: VacationSettings = normalizeVacationSettings({
    ...DEFAULT_VACATION_SETTINGS,
    ...input,
    startsAt: input.startsAt || null,
    endsAt: input.endsAt || null,
  });

  try {
    await saveVacationSettings(settings, actor.email);
  } catch (error) {
    console.error("updateVacationSettings error:", error);
    return { success: false, error: "Nie udało się zapisać ustawień. Spróbuj ponownie." };
  }

  await recordAudit({
    actorEmail: actor.email,
    action: "Przerwa urlopowa",
    details: describeVacationChange(before, settings),
  });

  // Baner mieszka w układzie głównym, więc unieważniamy i dane, i wszystkie
  // wyrenderowane strony sklepu — inaczej zmiana byłaby widoczna dopiero po
  // wygaśnięciu pamięci podręcznej.
  updateTag(VACATION_CACHE_TAG);
  revalidatePath("/", "layout");

  return { success: true };
}

function describeRange(settings: VacationSettings): string {
  if (!settings.enabled) return "wyłączona";
  const from = settings.startsAt ? formatDayMonth(settings.startsAt) : "od zaraz";
  const to = settings.endsAt ? formatDayMonth(settings.endsAt) : "bezterminowo";
  return `włączona (${from} → ${to})`;
}

function describeVacationChange(before: VacationSettings, after: VacationSettings): string {
  const parts: string[] = [`przerwa: ${describeRange(before)} → ${describeRange(after)}`];
  if (before.pauseOrders !== after.pauseOrders) {
    parts.push(
      `blokada zamówień: ${before.pauseOrders ? "tak" : "nie"} → ${after.pauseOrders ? "tak" : "nie"}`
    );
  }
  if (before.title !== after.title || before.message !== after.message) {
    parts.push("zmieniono treść banera");
  }
  return parts.join("; ");
}

/* ------------------------------------------------------------------ */
/* Gotowe arkusze w sklepie                                            */
/* ------------------------------------------------------------------ */

const readySheetsModeSchema = z.enum(READY_SHEETS_MODES as [ReadySheetsMode, ...ReadySheetsMode[]]);

export async function updateReadySheetsMode(raw: unknown): Promise<Result> {
  const actor = await requireAdminActor();
  if (!actor) return DENIED;

  const parsed = readySheetsModeSchema.safeParse(raw);
  if (!parsed.success) return { success: false, error: "Wybierz jeden z trzech trybów." };

  const before = await getReadySheetsSettingsFresh();
  if (before.mode === parsed.data) return { success: true };

  try {
    await saveReadySheetsMode(parsed.data, actor.email);
  } catch (error) {
    console.error("updateReadySheetsMode error:", error);
    return { success: false, error: "Nie udało się zapisać ustawienia. Spróbuj ponownie." };
  }

  await recordAudit({
    actorEmail: actor.email,
    action: "Gotowe arkusze w sklepie",
    details: `${READY_SHEETS_MODE_LABELS[before.mode]} → ${READY_SHEETS_MODE_LABELS[parsed.data]}`,
  });

  // Kreator dopytuje o arkusze z przeglądarki, więc wystarczy unieważnić
  // zapamiętany tryb — strony sklepu nie trzeba przebudowywać.
  updateTag(READY_SHEETS_MODE_TAG);
  revalidatePath("/admin/ustawienia");
  revalidatePath("/admin/arkusze");

  return { success: true };
}

/* ------------------------------------------------------------------ */
/* Termin wysyłki w koszyku                                            */
/* ------------------------------------------------------------------ */

const daysField = z.coerce
  .number({ message: "Podaj liczbę dni." })
  .int({ message: "Podaj pełną liczbę dni." })
  .min(SHIPPING_LIMITS.days.min, { message: "Liczba dni nie może być ujemna." })
  .max(SHIPPING_LIMITS.days.max, { message: `Maksymalnie ${SHIPPING_LIMITS.days.max} dni.` });

const shippingEstimateSchema = z
  .object({
    cutoffHour: z.coerce
      .number({ message: "Podaj godzinę." })
      .int({ message: "Podaj pełną godzinę." })
      .min(SHIPPING_LIMITS.cutoffHour.min, { message: "Godzina od 1 do 23." })
      .max(SHIPPING_LIMITS.cutoffHour.max, { message: "Godzina od 1 do 23." }),
    beforeMin: daysField,
    beforeMax: daysField,
    afterMin: daysField,
    afterMax: daysField,
  })
  .refine((value) => value.beforeMin <= value.beforeMax, {
    message: "Dolna granica nie może być wyższa od górnej (zamówienia przed godziną graniczną).",
    path: ["beforeMin"],
  })
  .refine((value) => value.afterMin <= value.afterMax, {
    message: "Dolna granica nie może być wyższa od górnej (zamówienia po godzinie granicznej).",
    path: ["afterMin"],
  });

function describeShippingEstimate(settings: ShippingEstimateSettings): string {
  const range = (min: number, max: number) =>
    min === max ? businessDaysLabel(max) : `${min}–${businessDaysLabel(max)}`;
  return `przed ${settings.cutoffHour}:00 — ${range(settings.beforeMin, settings.beforeMax)}; po ${settings.cutoffHour}:00 i w weekend — ${range(settings.afterMin, settings.afterMax)}`;
}

export async function updateShippingEstimate(raw: unknown): Promise<Result> {
  const actor = await requireAdminActor();
  if (!actor) return DENIED;

  const parsed = shippingEstimateSchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message || "Błędne dane." };
  }

  const before = await getShippingEstimateSettingsFresh();
  const settings = normalizeShippingEstimateSettings(parsed.data);

  try {
    await saveShippingEstimateSettings(settings, actor.email);
  } catch (error) {
    console.error("updateShippingEstimate error:", error);
    return { success: false, error: "Nie udało się zapisać ustawień. Spróbuj ponownie." };
  }

  await recordAudit({
    actorEmail: actor.email,
    action: "Termin wysyłki w koszyku",
    details: `${describeShippingEstimate(before)} → ${describeShippingEstimate(settings)}`,
  });

  // Termin jest w układzie głównym (jak baner przerwy), więc unieważniamy
  // i dane, i wyrenderowane strony sklepu.
  updateTag(SHIPPING_ESTIMATE_TAG);
  revalidatePath("/", "layout");

  return { success: true };
}
