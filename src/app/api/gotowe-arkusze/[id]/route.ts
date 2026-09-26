import { NextResponse } from "next/server";

import { getPublishedSheetLayout, readySheetsAccess } from "@/lib/sheets/public";

export const dynamic = "force-dynamic";

const NO_STORE = { "Cache-Control": "no-store, private" };

/** Układ opublikowanego arkusza do wczytania w kreatorze. Szkic i nieznany adres to 404. */
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const notFound = NextResponse.json({ error: "Nie ma takiego arkusza." }, { status: 404, headers: NO_STORE });

  if (!/^[A-Za-z0-9_-]{1,128}$/.test(id)) return notFound;

  try {
    const access = await readySheetsAccess();
    if (!access.visible) return notFound;

    const layout = await getPublishedSheetLayout(id);
    if (!layout) return notFound;

    return NextResponse.json(layout, { headers: NO_STORE });
  } catch (error) {
    console.error("GET /api/gotowe-arkusze/[id] error:", error);
    return NextResponse.json(
      { error: "Nie udało się wczytać arkusza." },
      { status: 500, headers: NO_STORE }
    );
  }
}
