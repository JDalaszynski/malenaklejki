import "server-only";

import { cookies } from "next/headers";
import { adminAuth } from "@/lib/firebase/admin";

export const SESSION_COOKIE = "mn_session";

/** Zwykły klient — dwa tygodnie, żeby nie logować się przy każdej wizycie. */
export const CLIENT_SESSION_MS = 14 * 24 * 60 * 60 * 1000;

/** Administrator — 12 godzin. Panel daje dostęp do danych wszystkich klientów. */
export const ADMIN_SESSION_MS = 12 * 60 * 60 * 1000;

/**
 * Maksimum akceptowane przez Firebase przy tworzeniu ciasteczka sesyjnego.
 * Token logowania starszy niż 5 minut jest odrzucany — to celowe, bo skraca
 * okno, w którym wykradziony token da się wymienić na długą sesję.
 */
const MAX_ID_TOKEN_AGE_MS = 5 * 60 * 1000;

export type SessionUser = {
  uid: string;
  email: string | null;
  emailVerified: boolean;
  isAdmin: boolean;
  signInProvider: string | null;
};

function cookieOptions(maxAgeMs: number) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: Math.floor(maxAgeMs / 1000),
  };
}

/**
 * Wymienia krótkotrwały token logowania z przeglądarki na długotrwałe
 * ciasteczko sesyjne HttpOnly. Od tego momentu przeglądarka nie ma dostępu
 * do żadnego tokenu — skrypt na stronie nie może go odczytać ani wykraść.
 */
export async function createSession(idToken: string): Promise<SessionUser> {
  const decoded = await adminAuth.verifyIdToken(idToken, true);

  if (Date.now() - decoded.auth_time * 1000 > MAX_ID_TOKEN_AGE_MS) {
    throw new Error("STALE_TOKEN");
  }

  // Uprawnienie administratora czytamy z aktualnego rekordu użytkownika,
  // a nie z tokenu — token mógł zostać wystawiony, zanim uprawnienie odebrano.
  const record = await adminAuth.getUser(decoded.uid);
  const isAdmin = record.customClaims?.role === "admin";

  const maxAge = isAdmin ? ADMIN_SESSION_MS : CLIENT_SESSION_MS;
  const sessionCookie = await adminAuth.createSessionCookie(idToken, {
    expiresIn: maxAge,
  });

  const store = await cookies();
  store.set(SESSION_COOKIE, sessionCookie, cookieOptions(maxAge));

  return {
    uid: decoded.uid,
    email: record.email ?? null,
    emailVerified: record.emailVerified,
    isAdmin,
    signInProvider: decoded.firebase?.sign_in_provider ?? null,
  };
}

/**
 * Odczytuje i weryfikuje sesję. `checkRevoked` sprawia, że sesja przestaje
 * działać natychmiast po zmianie hasła lub odebraniu uprawnień — bez tego
 * wykradzione ciasteczko żyłoby do końca swojej ważności.
 */
export async function readSession(): Promise<SessionUser | null> {
  const store = await cookies();
  const cookie = store.get(SESSION_COOKIE)?.value;
  if (!cookie) return null;

  try {
    const decoded = await adminAuth.verifySessionCookie(cookie, true);
    const record = await adminAuth.getUser(decoded.uid);

    return {
      uid: decoded.uid,
      email: record.email ?? null,
      emailVerified: record.emailVerified,
      isAdmin: record.customClaims?.role === "admin",
      signInProvider: decoded.firebase?.sign_in_provider ?? null,
    };
  } catch {
    // Wygasłe, unieważnione lub podrobione ciasteczko — traktujemy jak brak sesji.
    return null;
  }
}

export async function destroySession(): Promise<void> {
  const store = await cookies();
  const cookie = store.get(SESSION_COOKIE)?.value;

  if (cookie) {
    try {
      const decoded = await adminAuth.verifySessionCookie(cookie, false);
      // Unieważnia też wszystkie inne sesje tego użytkownika. Przy wylogowaniu
      // z cudzego lub zgubionego urządzenia to jedyny sposób, żeby odciąć dostęp.
      await adminAuth.revokeRefreshTokens(decoded.uid);
    } catch {
      /* nieważne ciasteczko — wystarczy je usunąć */
    }
  }

  store.delete(SESSION_COOKIE);
}
