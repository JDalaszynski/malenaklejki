import { NextResponse } from "next/server";

import { getPublishedSheetLayout, readySheetsAccess } from "@/lib/sheets/public";

export const dynamic = "force-dynamic";

const NO_STORE = { "Cache-Control": "no-store, private" };

/**
 * Układ pod adresem z aktualnym znacznikiem wersji się nie zmienia — zapis
 * arkusza w panelu daje nowy znacznik, a więc i nowy adres. Dlatego może
 * leżeć w pamięci przeglądarki i na brzegu sieci zamiast za każdym razem
 * budzić funkcję.
 */
const VERSIONED = { "Cache-Control": "public, max-age=86400, s-maxage=604800, immutable" };

/** Układ opublikowanego arkusza do wczytania w kreatorze. Szkic i nieznany adres to 404. */
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const notFound = NextResponse.json({ error: "Nie ma takiego arkusza." }, { status: 404, headers: NO_STORE });

  if (!/^[A-Za-z0-9_-]{1,128}$/.test(id)) return notFound;

  try {
    const access = await readySheetsAccess();
    if (!access.visible) return notFound;

    const layout = await getPublishedSheetLayout(id);
    if (!layout) return notFound;

    // Podgląd administratora zależy od sesji, więc nie może trafić do wspólnej pamięci.
    const version = new URL(request.url).searchParams.get("v");
    const cacheable = !access.preview && version === layout.version;

    return NextResponse.json(layout, { headers: cacheable ? VERSIONED : NO_STORE });
  } catch (error) {
    console.error("GET /api/gotowe-arkusze/[id] error:", error);
    return NextResponse.json(
      { error: "Nie udało się wczytać arkusza." },
      { status: 500, headers: NO_STORE }
    );
  }
}
