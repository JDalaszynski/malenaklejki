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
