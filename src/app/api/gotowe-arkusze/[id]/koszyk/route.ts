import { randomUUID } from "node:crypto";

import { headers } from "next/headers";
import { NextResponse } from "next/server";

import { getBucket } from "@/lib/firebase/admin";
import { CART_LAYOUT_PREFIX, serializeLayout } from "@/lib/orders/layoutFormat";
import { getCatalogSheets, getPublishedSheetLayout } from "@/lib/sheets/public";
import { checkRateLimit } from "@/lib/utils/rateLimit";

export const dynamic = "force-dynamic";

const NO_STORE = { "Cache-Control": "no-store, private" };

/**
 * Układ gotowego arkusza dla pozycji koszyka dodawanej prosto ze strony arkusza.
 *
 * Kreator wgrywa układ do `layouts/carts/` z przeglądarki; tutaj robi to
 * serwer, więc strona produktu nie musi ładować Firebase ani wysyłać kilkuset
 * kilobajtów. Zamówienie przepina potem ten plik pod siebie tak samo jak układ
 * z kreatora (`attachCartLayout`), dzięki czemu arkusz da się otworzyć
 * z historii zamówień.
 */
export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const notFound = NextResponse.json({ error: "Nie ma takiego arkusza." }, { status: 404, headers: NO_STORE });
  if (!/^[A-Za-z0-9_-]{1,128}$/.test(id)) return notFound;

  const ip = (await headers()).get("x-forwarded-for") || "unknown";
  if (!checkRateLimit(`gotowy-arkusz-koszyk-${ip}`, 30, 60_000)) {
    return NextResponse.json({ error: "Zbyt wiele prób. Spróbuj za chwilę." }, { status: 429, headers: NO_STORE });
  }

  try {
    // Tylko arkusze z własną stroną w sklepie — te mają gotowe pliki do druku.
    const sheet = (await getCatalogSheets()).find((item) => item.id === id);
    if (!sheet) return notFound;

    const layout = await getPublishedSheetLayout(id);
    if (!layout) return notFound;

    const layoutPath = `${CART_LAYOUT_PREFIX}/${randomUUID()}.json`;
    await getBucket()
      .file(layoutPath)
      .save(serializeLayout(layout.stickers), {
        contentType: "application/json",
        resumable: false,
        metadata: { cacheControl: "no-store" },
      });

    return NextResponse.json({ layoutPath }, { headers: NO_STORE });
  } catch (error) {
    // Brak układu oznacza tylko brak edycji z historii — koszyk doda pozycję bez niego.
    console.error("POST /api/gotowe-arkusze/[id]/koszyk error:", error);
    return NextResponse.json({ error: "Nie udało się przygotować układu." }, { status: 500, headers: NO_STORE });
  }
}
