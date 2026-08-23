import { NextResponse } from "next/server";

import { readSession } from "@/lib/auth/session";
import { db } from "@/lib/firebase/admin";

export const dynamic = "force-dynamic";

/**
 * Minimalny opis zalogowanej osoby dla nagłówka strony.
 *
 * Nagłówek jest komponentem klienckim obecnym na każdej podstronie, więc
 * czytanie sesji w głównym layoucie wyłączyłoby statyczne generowanie całego
 * bloga i stron ofertowych. Zamiast tego nagłówek dopytuje o sesję po
 * zamontowaniu — dokładnie tak, jak robi to już licznik koszyka.
 *
 * Zwracamy wyłącznie to, co nagłówek wyświetla. Żadnych adresów ani telefonów.
 */
export async function GET() {
  const session = await readSession();

  if (!session) {
    return NextResponse.json(
      { user: null },
      { headers: { "Cache-Control": "no-store, private" } }
    );
  }

  let firstName = "";
  try {
    const profile = await db.collection("users").doc(session.uid).get();
    firstName = profile.data()?.firstName || "";
  } catch {
    /* brak profilu nie może wywrócić nagłówka */
  }

  return NextResponse.json(
    {
      user: {
        email: session.email,
        firstName,
        emailVerified: session.emailVerified,
        isAdmin: session.isAdmin,
      },
    },
    { headers: { "Cache-Control": "no-store, private" } }
  );
}
