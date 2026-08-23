import "server-only";

import { cache } from "react";
import { redirect } from "next/navigation";
import { readSession, type SessionUser } from "./session";

/**
 * Warstwa dostępu do danych. Każde miejsce, które potrzebuje wiedzieć kim jest
 * użytkownik, przechodzi przez te funkcje — nigdy przez dane przysłane
 * z przeglądarki. `cache` sprawia, że w obrębie jednego renderu sesja jest
 * weryfikowana raz, niezależnie od liczby komponentów, które o nią pytają.
 */
export const getSession = cache(async (): Promise<SessionUser | null> => {
  return readSession();
});

/** Wymusza zalogowanie. Zwraca sesję albo przekierowuje na logowanie. */
export async function requireUser(returnTo?: string): Promise<SessionUser> {
  const session = await getSession();
  if (!session) {
    const target = returnTo ? `?powrot=${encodeURIComponent(returnTo)}` : "";
    redirect(`/logowanie${target}`);
  }
  return session;
}

/**
 * Wymusza zalogowanie i potwierdzony adres e-mail. Historia zamówień zawiera
 * adres i telefon, więc udostępniamy ją dopiero, gdy wiadomo, że skrzynka
 * naprawdę należy do tej osoby.
 */
export async function requireVerifiedUser(returnTo?: string): Promise<SessionUser> {
  const session = await requireUser(returnTo);
  if (!session.emailVerified) {
    redirect("/konto/potwierdz-email");
  }
  return session;
}

/** Wymusza uprawnienia administratora. */
export async function requireAdmin(): Promise<SessionUser> {
  const session = await getSession();
  if (!session) {
    redirect("/logowanie?powrot=%2Fadmin");
  }
  if (!session.isAdmin) {
    // Celowo 404 zamiast „brak uprawnień" — nie potwierdzamy, że pod tym
    // adresem cokolwiek jest.
    redirect("/");
  }
  return session;
}
