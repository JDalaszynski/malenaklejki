"use client";

import { useEffect } from "react";
import { captureAttribution } from "@/lib/attribution";

/**
 * Zapamiętuje źródło wizyty z adresu pierwszej strony (patrz `lib/attribution`).
 * Siedzi w głównym layoucie, więc uruchamia się raz na wejście do sklepu —
 * przejścia między podstronami już go nie wołają.
 */
export function AttributionCapture() {
  useEffect(() => {
    captureAttribution(window.location.search);
  }, []);

  return null;
}
