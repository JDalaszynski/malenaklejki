import { headers } from "next/headers";
import { NextResponse } from "next/server";

import { getSession } from "@/lib/auth/dal";
import { getGallerySheets, readySheetsAccess } from "@/lib/sheets/public";
import { recordUsage } from "@/lib/sheets/usage";
import { isUsageEvent, isUsageSource, type UsagePayload } from "@/lib/sheets/usageEvents";
import { checkRateLimit } from "@/lib/utils/rateLimit";

export const dynamic = "force-dynamic";

const NO_STORE = { "Cache-Control": "no-store, private" };

/** Treść zdarzenia mieści się w kilkudziesięciu bajtach; reszta to nie nasz klient. */
const MAX_BODY_BYTES = 1024;

const done = () => new NextResponse(null, { status: 204, headers: NO_STORE });

/**
 * Przyjmuje zdarzenia z kreatora i dolicza je do dziennych sum
 * (`lib/sheets/usage.ts`).
 *
 * Adres jest publiczny, więc przyjmuje wyłącznie znane zdarzenia i znane
 * miejsca wejścia, a identyfikator zestawu tylko taki, który naprawdę jest
 * w galerii — inaczej każdy mógłby rozdymać dokument dowolnymi kluczami.
 * Odpowiedź jest zawsze pusta: klient nie dowiaduje się, czy zdarzenie
 * policzono. Nie liczymy administratora (jego klikanie w panelu i testy to
 * nie ruch klientów) ani podglądu, który widzi tylko on.
 */
export async function POST(request: Request) {
  const ip = (await headers()).get("x-forwarded-for") || "unknown";
  if (!checkRateLimit(`gotowe-zestawy-zdarzenie-${ip}`, 60, 60_000)) {
    return NextResponse.json({ error: "Zbyt wiele zdarzeń." }, { status: 429, headers: NO_STORE });
  }

  let raw: unknown;
  try {
    const text = await request.text();
    if (text.length > MAX_BODY_BYTES) return done();
    raw = JSON.parse(text);
  } catch {
    return NextResponse.json({ error: "Niepoprawne dane." }, { status: 400, headers: NO_STORE });
  }

  const body = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>;
  if (!isUsageEvent(body.event)) {
    return NextResponse.json({ error: "Niepoprawne dane." }, { status: 400, headers: NO_STORE });
  }

  const payload: UsagePayload = { event: body.event };

  try {
    const [access, session] = await Promise.all([readySheetsAccess(), getSession()]);
    if (!access.visible || access.preview || session?.isAdmin) return done();

    if (payload.event === "open") {
      if (isUsageSource(body.source)) payload.source = body.source;
    } else {
      const sheetId = typeof body.sheetId === "string" ? body.sheetId : "";
      if (!/^[A-Za-z0-9_-]{1,128}$/.test(sheetId)) return done();

      const { sheets } = await getGallerySheets();
      if (!sheets.some((sheet) => sheet.id === sheetId)) return done();
      payload.sheetId = sheetId;
    }

    await recordUsage(payload);
    return done();
  } catch (error) {
    // Liczniki nie mogą niczego psuć klientowi — błąd zostaje w logach.
    console.error("POST /api/gotowe-zestawy/zdarzenie error:", error);
    return done();
  }
}
