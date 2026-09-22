import { NextResponse } from "next/server";

import { countNewFormMessages } from "@/lib/admin/messages";
import { getSession } from "@/lib/auth/dal";

export const dynamic = "force-dynamic";

/**
 * Liczba nieodhaczonych wiadomości z formularzy — do odznaki przy zakładce.
 *
 * Osobny adres, a nie dane wliczone w render strony: `AdminLayout` jest
 * wspólny dla wszystkich sekcji panelu i dla ich ekranów wczytywania, więc
 * doczepienie tam zapytania do bazy wstrzymywałoby każdy z nich. Tutaj
 * odznaka dolatuje sama, po wyrysowaniu panelu.
 *
 * Zwraca wyłącznie liczbę i tylko administratorowi.
 */
export async function GET() {
  const session = await getSession();
  if (!session?.isAdmin) {
    return NextResponse.json({ error: "Brak uprawnień." }, { status: 403, headers: { "Cache-Control": "no-store" } });
  }

  const count = await countNewFormMessages();
  return NextResponse.json({ count }, { headers: { "Cache-Control": "no-store" } });
}
