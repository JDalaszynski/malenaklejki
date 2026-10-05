import { NextResponse } from "next/server";

import { getCatalogSheets } from "@/lib/sheets/public";
import { sheetPath } from "@/lib/sheets/schema";

export const dynamic = "force-dynamic";

/**
 * Katalog gotowych zestawów jako dane: nazwa, adres, motywy i liczba naklejek.
 * Korzysta z niego `scripts/generuj-llms-txt.mjs`, żeby `llms.txt` opisywał
 * te same zestawy co sklep. Przy niepublicznym katalogu lista jest pusta.
 */
export async function GET() {
  const sheets = await getCatalogSheets();
  return NextResponse.json(
    {
      sheets: sheets.map((sheet) => ({
        name: sheet.name,
        subtitle: sheet.subtitle,
        path: sheetPath(sheet.slug),
        categories: sheet.categories,
        motifs: sheet.motifs,
        stickerCount: sheet.stickerCount,
      })),
    },
    { headers: { "Cache-Control": "public, max-age=0, s-maxage=300" } }
  );
}
