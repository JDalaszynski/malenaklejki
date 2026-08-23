import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const SESSION_COOKIE = "mn_session";

/**
 * Szybkie odsianie ruchu bez sesji, zanim serwer zacznie renderować stronę.
 *
 * To wyłącznie optymalizacja: sprawdzamy samą obecność ciasteczka, bez
 * weryfikacji podpisu (proxy nie ma dostępu do Firebase Admin SDK). Prawdziwa
 * kontrola uprawnień siedzi w warstwie dostępu do danych — `requireUser`
 * i `requireAdmin` w src/lib/auth/dal.ts — i to ona decyduje o dostępie.
 * Podrobienie ciasteczka pozwoli więc najwyżej dotrzeć do strony, która
 * i tak przekieruje z powrotem na logowanie.
 */
export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  // Strona obsługi linków z maili musi działać także dla wylogowanych —
  // to na niej potwierdza się adres e-mail i ustawia nowe hasło.
  if (pathname.startsWith("/konto/akcja")) {
    return NextResponse.next();
  }

  if (request.cookies.has(SESSION_COOKIE)) {
    return NextResponse.next();
  }

  const loginUrl = new URL("/logowanie", request.url);
  loginUrl.searchParams.set("powrot", `${pathname}${search}`);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/konto/:path*", "/admin/:path*"],
};
