import { NextRequest, NextResponse } from "next/server";

import { getOrder } from "@/lib/admin/queries";
import {
  KIND_PARAMS,
  filePrefix,
  isStorageUrl,
  productionFiles,
  type ProductionFile,
} from "@/lib/admin/orderFiles";
import { buildZip, streamOf } from "@/lib/admin/zip";
import { readSession } from "@/lib/auth/session";

export const dynamic = "force-dynamic";
// Kilka arkuszy po kilka megabajtów z magazynu plików.
export const maxDuration = 60;

const FETCH_TIMEOUT_MS = 25_000;

const NO_STORE = { "Cache-Control": "no-store, private" };

function text(message: string, status: number) {
  return new NextResponse(message, { status, headers: NO_STORE });
}

async function download(file: ProductionFile): Promise<Uint8Array> {
  const response = await fetch(file.url, { signal: AbortSignal.timeout(FETCH_TIMEOUT_MS) });
  if (!response.ok) throw new Error(`${file.fileName}: ${response.status}`);
  return new Uint8Array(await response.arrayBuffer());
}

/**
 * Pliki produkcyjne zamówienia jednym pobraniem.
 *
 * Bez `?arkusz=` — wszystkie arkusze, z `?arkusz=2` — tylko drugi. Bez
 * `?plik=` — druk i linie cięcia razem, z `?plik=druk` albo `?plik=ciecie` —
 * tylko ten rodzaj. Dwa pliki i więcej wychodzą jako ZIP, pojedynczy plik jako
 * zwykły PNG, żeby nie pakować jednego obrazka w archiwum.
 *
 * Magazyn nie zwraca nagłówków CORS, więc przeglądarka nie pobierze tych
 * plików sama — robi to serwer. Uprawnienia sprawdzamy tu, nie tylko na
 * stronie panelu: adres da się wywołać bezpośrednio. Dla obcych 404 zamiast
 * 403, żeby nie potwierdzać, że cokolwiek tu jest.
 */
export async function GET(request: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const session = await readSession();
  if (!session?.isAdmin) return new NextResponse("Not found", { status: 404 });

  const { id } = await ctx.params;
  const order = await getOrder(id);
  if (!order) return new NextResponse("Not found", { status: 404 });

  const sheetParam = request.nextUrl.searchParams.get("arkusz");
  const sheet = sheetParam === null ? null : Number(sheetParam);
  if (sheet !== null && (!Number.isInteger(sheet) || sheet < 1)) {
    return text("Numer arkusza musi być liczbą całkowitą od 1.", 400);
  }

  const kindParam = request.nextUrl.searchParams.get("plik");
  if (kindParam !== null && !Object.hasOwn(KIND_PARAMS, kindParam)) {
    return text("Parametr „plik” musi mieć wartość „druk” albo „ciecie”.", 400);
  }
  const kind = kindParam === null ? null : KIND_PARAMS[kindParam as keyof typeof KIND_PARAMS];

  const files = productionFiles(order).filter(
    (file) => (sheet === null || file.sheet === sheet) && (kind === null || file.kind === kind)
  );
  if (files.length === 0) return text("To zamówienie nie ma plików do pobrania.", 404);
  if (files.some((file) => !isStorageUrl(file.url))) {
    return text("Adres pliku wskazuje poza magazyn sklepu — pobieranie wstrzymane.", 422);
  }

  // Wszystko pobieramy przed wysłaniem pierwszego bajtu: błąd magazynu daje
  // wtedy czytelną odpowiedź zamiast urwanego w połowie archiwum.
  let contents: Uint8Array[];
  try {
    contents = await Promise.all(files.map(download));
  } catch (error) {
    console.error("Pobieranie plików zamówienia nie powiodło się:", error);
    return text("Nie udało się pobrać plików z magazynu. Spróbuj ponownie za chwilę.", 502);
  }

  const prefix = filePrefix(order.orderNumber);

  if (files.length === 1) {
    return new NextResponse(streamOf([contents[0]]), {
      headers: {
        ...NO_STORE,
        "Content-Type": "image/png",
        "Content-Disposition": `attachment; filename="${files[0].fileName}"`,
      },
    });
  }

  const archive = buildZip(files.map((file, index) => ({ name: file.fileName, data: contents[index] })));
  const scope = sheet === null ? "" : `-arkusz-${sheet}`;
  const what = kind === "print" ? "-DRUK" : kind === "cut" ? "-LINIE-CIECIA" : sheet === null ? "-pliki" : "";
  const zipName = `${prefix}${scope}${what}.zip`;

  return new NextResponse(streamOf(archive), {
    headers: {
      ...NO_STORE,
      "Content-Type": "application/zip",
      "Content-Disposition": `attachment; filename="${zipName}"`,
    },
  });
}
