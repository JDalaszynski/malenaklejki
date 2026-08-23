"use server";

import { z } from "zod";
import { FirebaseAuthError } from "firebase-admin/auth";

import { adminAuth, db } from "@/lib/firebase/admin";
import { getSession } from "@/lib/auth/dal";
import { destroySession } from "@/lib/auth/session";
import { consumeRateLimit } from "@/lib/auth/rateLimit";
import { sendEmailChangeVerification, sendSecurityAlertEmail } from "@/lib/email/auth";

type Result<T = object> = ({ success: true } & T) | { success: false; error: string };

/** Ponowne logowanie starsze niż 5 minut nie jest dowodem — token mógł zostać przechwycony. */
const REAUTH_MAX_AGE_MS = 5 * 60 * 1000;

const passwordSchema = z
  .string()
  .min(8, "Hasło musi mieć co najmniej 8 znaków")
  .max(200, "Hasło jest zbyt długie")
  .refine((v) => /[A-Za-zĄĆĘŁŃÓŚŹŻąćęłńóśźż]/.test(v), "Hasło musi zawierać literę")
  .refine((v) => /[0-9]/.test(v), "Hasło musi zawierać cyfrę");

function appUrl(): string {
  return (process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000").replace(/\/+$/, "");
}

/**
 * Sprawdza, że osoba wykonująca operację właśnie potwierdziła tożsamość —
 * hasłem albo kontem Google. Bez tego przejęta sesja wystarczyłaby, żeby
 * zmienić hasło i odciąć właściciela od konta.
 */
async function requireFreshAuth(idToken: unknown): Promise<{ uid: string; email: string } | null> {
  const session = await getSession();
  if (!session) return null;
  if (typeof idToken !== "string" || idToken.length < 100 || idToken.length > 4096) return null;

  try {
    const decoded = await adminAuth.verifyIdToken(idToken, true);
    if (decoded.uid !== session.uid) return null;
    if (Date.now() - decoded.auth_time * 1000 > REAUTH_MAX_AGE_MS) return null;
    return { uid: session.uid, email: session.email ?? "" };
  } catch {
    return null;
  }
}

export type SecurityOverview = {
  email: string;
  emailVerified: boolean;
  hasPassword: boolean;
  hasGoogle: boolean;
  lastSignIn: string | null;
};

export async function getSecurityOverview(): Promise<SecurityOverview | null> {
  const session = await getSession();
  if (!session) return null;

  const record = await adminAuth.getUser(session.uid);
  const providers = record.providerData.map((provider) => provider.providerId);

  return {
    email: record.email ?? "",
    emailVerified: record.emailVerified,
    hasPassword: providers.includes("password"),
    hasGoogle: providers.includes("google.com"),
    lastSignIn: record.metadata.lastSignInTime ?? null,
  };
}

/**
 * Ustawia nowe hasło. Działa też dla kont założonych przez Google — wtedy
 * po prostu dokłada drugi sposób logowania do tego samego konta.
 */
export async function changePassword(input: {
  idToken: string;
  newPassword: string;
}): Promise<Result> {
  const auth = await requireFreshAuth(input?.idToken);
  if (!auth) {
    return { success: false, error: "Potwierdź tożsamość jeszcze raz i spróbuj ponownie." };
  }

  const limit = await consumeRateLimit(`password-change:${auth.uid}`, 5, 60 * 60 * 1000, true);
  if (!limit.ok) return { success: false, error: "Zbyt wiele zmian hasła. Spróbuj później." };

  const parsed = passwordSchema.safeParse(input?.newPassword);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message || "Błędne hasło" };
  }

  try {
    await adminAuth.updateUser(auth.uid, { password: parsed.data });
    // Unieważnia wszystkie inne sesje — jeśli ktoś obcy był zalogowany, traci dostęp.
    await adminAuth.revokeRefreshTokens(auth.uid);

    const profile = await db.collection("users").doc(auth.uid).get();
    await sendSecurityAlertEmail(auth.email, profile.data()?.firstName || "", {
      what: "zmiana hasła",
    });

    await destroySession();
    return { success: true };
  } catch (error) {
    console.error("changePassword error:", error);
    return { success: false, error: "Nie udało się zmienić hasła. Spróbuj ponownie." };
  }
}

/**
 * Zmiana adresu e-mail. Adres podmienia się dopiero po kliknięciu w link
 * wysłany na nowy adres — literówka nie odcina więc dostępu do konta.
 * Na stary adres leci ostrzeżenie, żeby przejęcie konta nie przeszło niezauważone.
 */
export async function requestEmailChange(input: {
  idToken: string;
  newEmail: string;
}): Promise<Result> {
  const auth = await requireFreshAuth(input?.idToken);
  if (!auth) {
    return { success: false, error: "Potwierdź tożsamość jeszcze raz i spróbuj ponownie." };
  }

  const limit = await consumeRateLimit(`email-change:${auth.uid}`, 3, 60 * 60 * 1000, true);
  if (!limit.ok) return { success: false, error: "Zbyt wiele prób zmiany adresu. Spróbuj później." };

  const parsed = z.string().email("Podaj poprawny adres e-mail").max(254).safeParse(input?.newEmail);
  if (!parsed.success) return { success: false, error: "Podaj poprawny adres e-mail." };

  const newEmail = parsed.data.toLowerCase().trim();
  if (newEmail === auth.email.toLowerCase()) {
    return { success: false, error: "To jest Twój obecny adres e-mail." };
  }

  try {
    const link = await adminAuth.generateVerifyAndChangeEmailLink(auth.email, newEmail, {
      url: `${appUrl()}/konto/bezpieczenstwo`,
      handleCodeInApp: false,
    });

    const profile = await db.collection("users").doc(auth.uid).get();
    const firstName = profile.data()?.firstName || "";

    await sendEmailChangeVerification(newEmail, firstName, link);
    await sendSecurityAlertEmail(auth.email, firstName, {
      what: "prośba o zmianę adresu e-mail",
      detail: `nowy adres: ${newEmail}`,
    });

    return { success: true };
  } catch (error) {
    if (error instanceof FirebaseAuthError && error.code === "auth/email-already-exists") {
      // Nie potwierdzamy, że ten adres ma już konto.
      return { success: true };
    }
    console.error("requestEmailChange error:", error);
    return { success: false, error: "Nie udało się wysłać potwierdzenia. Spróbuj ponownie." };
  }
}

/** Wylogowuje ze wszystkich urządzeń. */
export async function signOutEverywhere(): Promise<Result> {
  const session = await getSession();
  if (!session) return { success: false, error: "Nie jesteś zalogowany." };

  try {
    await adminAuth.revokeRefreshTokens(session.uid);
    await destroySession();
    return { success: true };
  } catch (error) {
    console.error("signOutEverywhere error:", error);
    return { success: false, error: "Nie udało się wylogować. Spróbuj ponownie." };
  }
}

/**
 * Usuwa konto na życzenie klienta (RODO).
 *
 * Zamówienia zostają w bazie — dokumentację sprzedaży trzeba przechowywać
 * przez 5 lat od końca roku podatkowego, więc nie wolno ich skasować razem
 * z kontem. Zrywamy natomiast powiązanie z kontem i usuwamy profil,
 * czyli wszystko, co nie jest potrzebne do rozliczeń.
 */
export async function deleteAccount(input: { idToken: string }): Promise<Result> {
  const auth = await requireFreshAuth(input?.idToken);
  if (!auth) {
    return { success: false, error: "Potwierdź tożsamość jeszcze raz i spróbuj ponownie." };
  }

  try {
    const orders = await db.collection("orders").where("userId", "==", auth.uid).get();
    for (let i = 0; i < orders.docs.length; i += 400) {
      const batch = db.batch();
      for (const doc of orders.docs.slice(i, i + 400)) {
        batch.update(doc.ref, { userId: null, accountDeletedAt: new Date().toISOString() });
      }
      await batch.commit();
    }

    await db.collection("users").doc(auth.uid).delete();
    await adminAuth.deleteUser(auth.uid);
    await destroySession();

    return { success: true };
  } catch (error) {
    console.error("deleteAccount error:", error);
    return { success: false, error: "Nie udało się usunąć konta. Napisz na kontakt@malenaklejki.pl." };
  }
}
