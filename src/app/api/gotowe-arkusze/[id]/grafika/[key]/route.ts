import { readySheetsAccess, renderSheetDisplayGraphic } from "@/lib/sheets/public";

export const dynamic = "force-dynamic";

const NO_STORE = { "Cache-Control": "no-store, private" };

/**
 * Klucz jest skrótem adresu oryginału, a oryginały w magazynie nigdy nie są
 * nadpisywane — pod tym samym adresem zawsze leży ta sama grafika. Po
 * pierwszym żądaniu odpowiada już brzeg sieci, bez budzenia funkcji.
 */
const IMMUTABLE = { "Cache-Control": "public, max-age=31536000, s-maxage=31536000, immutable" };

/** Lekka wersja grafiki naklejki z opublikowanego arkusza — do pokazania w kreatorze. */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string; key: string }> }
) {
  const { id, key } = await params;
  const notFound = new Response(null, { status: 404, headers: NO_STORE });

  if (!/^[A-Za-z0-9_-]{1,128}$/.test(id) || !/^[a-f0-9]{16}$/.test(key)) return notFound;

  try {
    const access = await readySheetsAccess();
    if (!access.visible) return notFound;

    const image = await renderSheetDisplayGraphic(id, key);
    if (!image) return notFound;

    return new Response(new Uint8Array(image), {
      headers: {
        "Content-Type": "image/webp",
        "Content-Length": String(image.length),
        // Podgląd administratora zależy od sesji, więc nie trafia do wspólnej pamięci.
        ...(access.preview ? NO_STORE : IMMUTABLE),
      },
    });
  } catch (error) {
    // Kreator sam wraca wtedy do oryginału grafiki.
    console.error("GET /api/gotowe-arkusze/[id]/grafika/[key] error:", error);
    return new Response(null, { status: 500, headers: NO_STORE });
  }
}
