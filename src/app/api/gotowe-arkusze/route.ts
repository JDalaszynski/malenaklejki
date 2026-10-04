import { NextResponse } from "next/server";

import { getGallerySheets, readySheetsAccess } from "@/lib/sheets/public";
import type { PublicSheetsResponse } from "@/lib/sheets/types";

export const dynamic = "force-dynamic";

const NO_STORE = { "Cache-Control": "no-store, private" };

/**
 * Lista gotowych arkuszy do galerii w kreatorze.
 *
 * Osobny adres, a nie dane wliczone w render strony: listę dociąga dopiero
 * otwarta galeria, więc strona główna nie płaci za nią ani bajtem, a w trybie
 * podglądu odpowiedź zależy od tego, czy patrzy administrator. Przy
 * wyłączonym trybie odpowiedź jest pusta.
 */
export async function GET() {
  const empty: PublicSheetsResponse = { sheets: [], categories: [], preview: false };

  try {
    const access = await readySheetsAccess();
    if (!access.visible) return NextResponse.json(empty, { headers: NO_STORE });

    const { sheets, categories } = await getGallerySheets();
    const body: PublicSheetsResponse = { sheets, categories, preview: access.preview };
    return NextResponse.json(body, { headers: NO_STORE });
  } catch (error) {
    // Kreator ma działać dalej — najwyżej bez gotowych arkuszy.
    console.error("GET /api/gotowe-arkusze error:", error);
    return NextResponse.json(empty, { headers: NO_STORE });
  }
}
