"use client";

import { useEffect } from "react";
import { captureAttribution } from "@/lib/attribution";

/**
 * Zapamiętuje pierwszą stronę i źródło wizyty z adresu wejścia (patrz `lib/attribution`).
 * Siedzi w głównym layoucie, więc uruchamia się raz na wejście do sklepu —
 * przejścia między podstronami już go nie wołają.
 */
export function AttributionCapture() {
  useEffect(() => {
    captureAttribution(window.location.search, window.location.pathname);
  }, []);

  return null;
}
