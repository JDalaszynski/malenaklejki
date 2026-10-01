"use client";

import { useSyncExternalStore } from "react";

import { useShippingEstimateSettings } from "@/components/layout/ShippingEstimateProvider";
import { useVacation } from "@/components/layout/VacationProvider";
import { estimateShipping } from "@/lib/settings/shippingEstimate";

/**
 * Szacowana data wysyłki — z uwzględnieniem przerwy urlopowej.
 *
 * Widełki wynikają z ustawień w panelu (`/admin/ustawienia`). Podczas przerwy
 * podmieniamy je na datę powrotu. Robimy to również wtedy, gdy przerwa jeszcze
 * nie trwa, ale paczka i tak wypadłaby już po jej rozpoczęciu — inaczej klient
 * tuż przed urlopem zobaczyłby termin, którego nie da się dotrzymać.
 */
export function useEstimatedShipping() {
  const vacation = useVacation();
  const settings = useShippingEstimateSettings();

  // Termin zależy od zegara przeglądarki, więc na serwerze nie ma czego
  // policzyć — do czasu hydratacji zwracamy zastępczy tekst. Obie migawki
  // oddają napisy, dzięki czemu porównanie referencji w Reakcie wystarcza.
  const normalText = useSyncExternalStore(
    subscribeNever,
    () => estimateShipping(settings).text,
    () => PLACEHOLDER
  );
  const lastDayKey = useSyncExternalStore(
    subscribeNever,
    () => estimateShipping(settings).lastDayKey,
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
