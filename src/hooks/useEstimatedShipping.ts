"use client";

import { useSyncExternalStore } from "react";

import { useVacation } from "@/components/layout/VacationProvider";

function addBusinessDays(startDate: Date, businessDays: number): Date {
  const date = new Date(startDate);
  let daysAdded = 0;
  while (daysAdded < businessDays) {
    date.setDate(date.getDate() + 1);
    const day = date.getDay();
    if (day !== 0 && day !== 6) {
      daysAdded++;
    }
  }
  return date;
}

function formatDate(date: Date): string {
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  return `${day}.${month}`;
}

function toDayKey(date: Date): string {
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const day = date.getDate().toString().padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}

/** Widełki „od–do", w których paczka wyjdzie ze sklepu przy normalnej pracy. */
function estimateWindow(): { text: string; lastDayKey: string } {
  // Get current time in Warsaw
  const now = new Date();
  const warsawTimeString = now.toLocaleString("en-US", { timeZone: "Europe/Warsaw" });
  const warsawNow = new Date(warsawTimeString);

  const hour = warsawNow.getHours();
  const isWeekend = warsawNow.getDay() === 0 || warsawNow.getDay() === 6;

  // Jeśli przed 12:00 (i dzień roboczy), wysyłka to 0-1 dni roboczych.
  // Jeśli po 12:00 (lub weekend), wysyłka to 1-2 dni roboczych.
  const maxDaysToAdd = (hour < 12 && !isWeekend) ? 1 : 2;
  const minDaysToAdd = maxDaysToAdd - 1;

  const minDate = addBusinessDays(warsawNow, minDaysToAdd);
  const maxDate = addBusinessDays(warsawNow, maxDaysToAdd);

  return {
    text: `Szacowana wysyłka: ${formatDate(minDate)}-${formatDate(maxDate)}`,
    lastDayKey: toDayKey(maxDate),
  };
}

export function getEstimatedShippingText(): string {
  return estimateWindow().text;
}

/**
 * Szacowana data wysyłki — z uwzględnieniem przerwy urlopowej.
 *
 * Podczas przerwy podmieniamy widełki na datę powrotu. Robimy to również
 * wtedy, gdy przerwa jeszcze nie trwa, ale paczka i tak wypadłaby już po jej
 * rozpoczęciu — inaczej klient tuż przed urlopem zobaczyłby termin, którego
 * nie da się dotrzymać.
 */
export function useEstimatedShipping() {
  const vacation = useVacation();

  // Termin zależy od zegara przeglądarki, więc na serwerze nie ma czego
  // policzyć — do czasu hydratacji zwracamy zastępczy tekst. Obie migawki
  // oddają napisy, dzięki czemu porównanie referencji w Reakcie wystarcza.
  const normalText = useSyncExternalStore(
    subscribeNever,
    () => estimateWindow().text,
    () => PLACEHOLDER
  );
  const lastDayKey = useSyncExternalStore(
    subscribeNever,
    () => estimateWindow().lastDayKey,
    () => ""
  );

  if (!lastDayKey) return PLACEHOLDER;

  if (vacation.status === "active") return vacation.shippingNote;

  if (vacation.status === "upcoming" && vacation.startsAt && lastDayKey >= vacation.startsAt) {
    return vacation.shippingNote;
  }

  return normalText;
}

const PLACEHOLDER = "Obliczanie...";

/** Upływ czasu nie zgłasza się sam — subskrypcja jest pusta. */
function subscribeNever(): () => void {
  return () => {};
}
