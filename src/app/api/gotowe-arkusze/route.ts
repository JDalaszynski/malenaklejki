import { NextResponse } from "next/server";

import { getPublishedSheets, readySheetsAccess } from "@/lib/sheets/public";
import type { PublicSheetsResponse } from "@/lib/sheets/types";

export const dynamic = "force-dynamic";

const NO_STORE = { "Cache-Control": "no-store, private" };

/**
 * Gotowe arkusze do kreatora na stronie głównej.
 *
 * Osobny adres, a nie dane wliczone w render strony: strona główna jest
 * statyczna, a w trybie podglądu lista zależy od tego, czy patrzy
 * administrator. Przy wyłączonym trybie odpowiedź jest pusta i kreator
 * wygląda dokładnie tak jak wcześniej.
 */
export async function GET() {
  const empty: PublicSheetsResponse = { sheets: [], categories: [], preview: false };

  try {
    const access = await readySheetsAccess();
    if (!access.visible) return NextResponse.json(empty, { headers: NO_STORE });

    const { sheets, categories } = await getPublishedSheets();
    const body: PublicSheetsResponse = { sheets, categories, preview: access.preview };
    return NextResponse.json(body, { headers: NO_STORE });
  } catch (error) {
    // Kreator ma działać dalej — najwyżej bez gotowych arkuszy.
    console.error("GET /api/gotowe-arkusze error:", error);
    return NextResponse.json(empty, { headers: NO_STORE });
  }
}
