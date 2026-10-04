"use client";

import { useEffect } from "react";

import { trackViewReadySheets, type AnalyticsReadySheet, type ReadySheetsList } from "@/lib/analytics";
import { SHEET_PRICE } from "@/lib/sheets/types";

/** Zdarzenie „klient zobaczył listę arkuszy" dla stron renderowanych na serwerze. */
export function CatalogListTracker({
  sheets,
  list,
}: {
  sheets: AnalyticsReadySheet[];
  list: ReadySheetsList;
}) {
  useEffect(() => {
    trackViewReadySheets(sheets, list, SHEET_PRICE);
    // Lista jest stała dla wyrenderowanej strony.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [list]);

  return null;
}
