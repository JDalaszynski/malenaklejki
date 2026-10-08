"use client";

import { useSyncExternalStore } from "react";

/**
 * Sezonowe linki do huba świątecznego (blog-agent/plan.md -> P4.3.2): stopka, kolumna
 * "Poradniki", oraz strona główna (`UseCasesSection`). Strony są statyczne, więc sam kod
 * nie "wie", że sezon minął - od 7.01.2027 oba linki chowają się po stronie przeglądarki
 * (tak samo jak link zniczowy w stopce). Ten plik i oba użycia usuń przy zamknięciu
 * sezonu (P4.3.8).
 */
export const SWIETA_HUB_HREF = "/blog/naklejki-swiateczne-i-etykiety-na-prezenty";
const SWIETA_LINK_HIDDEN_FROM = new Date("2027-01-07T00:00:00+01:00").getTime();

const subscribe = () => () => {};
const getSnapshot = () => Date.now() < SWIETA_LINK_HIDDEN_FROM;
// W HTML-u z serwera link zawsze jest - o jego ukryciu decyduje dopiero przeglądarka.
const getServerSnapshot = () => true;

export function useSwietaSeason(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
