"use client";

import { createContext, useContext, useMemo, useSyncExternalStore } from "react";

import {
  DEFAULT_VACATION_SETTINGS,
  resolveVacation,
  warsawToday,
  type ResolvedVacation,
  type VacationSettings,
} from "@/lib/settings/vacation";

type VacationContextValue = {
  settings: VacationSettings;
  /** Dzień, według którego stan przerwy policzył serwer. */
  serverToday: string;
};

const VacationContext = createContext<VacationContextValue>({
  settings: DEFAULT_VACATION_SETTINGS,
  serverToday: "1970-01-01",
});

export function VacationProvider({
  settings,
  serverToday,
  children,
}: VacationContextValue & { children: React.ReactNode }) {
  const value = useMemo(() => ({ settings, serverToday }), [settings, serverToday]);
  return <VacationContext.Provider value={value}>{children}</VacationContext.Provider>;
}

/**
 * Stan przerwy urlopowej dla komponentów w przeglądarce.
 *
 * Strony sklepu są zapamiętywane, więc HTML może pochodzić sprzed kilku minut,
 * a przy przerwie ustawionej „na datę" liczy się dzień, nie minuta. Pierwsze
 * renderowanie korzysta więc z dnia policzonego przez serwer (dzięki temu
 * hydratacja nie zgłasza rozjazdu), a zaraz po zamontowaniu przeliczamy stan
 * według zegara przeglądarki — baner, który miał już zniknąć, znika.
 */
export function useVacation(): ResolvedVacation {
  const { settings, serverToday } = useContext(VacationContext);

  // Dzień z zegara przeglądarki pobieramy przez `useSyncExternalStore`:
  // podczas renderu na serwerze i hydratacji React bierze `serverToday`,
  // a od pierwszego renderu po hydratacji — datę lokalną. Bez tego trzeba by
  // ustawiać stan w efekcie, co wymusza dodatkowy przebieg renderowania.
  const today = useSyncExternalStore(subscribeNever, warsawToday, () => serverToday);

  return useMemo(() => resolveVacation(settings, today), [settings, today]);
}

/** Data dnia nie ma zdarzenia, na które dałoby się zapisać — subskrypcja jest pusta. */
function subscribeNever(): () => void {
  return () => {};
}
