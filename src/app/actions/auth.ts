"use server";

import { z } from "zod";
import { headers } from "next/headers";
import { FirebaseAuthError } from "firebase-admin/auth";

import { adminAuth, db } from "@/lib/firebase/admin";
import { createSession, destroySession } from "@/lib/auth/session";
import { getSession } from "@/lib/auth/dal";
import { consumeRateLimit, resetRateLimit, formatRetryAfter } from "@/lib/auth/rateLimit";
import { sendVerificationEmail, sendPasswordResetEmail } from "@/lib/email/auth";

type ActionResult<T = object> =
  | ({ success: true } & T)
  | { success: false; error: string };

async function clientIp(): Promise<string> {
  const headersList = await headers();
  return (headersList.get("x-forwarded-for") || "unknown").split(",")[0].trim();
}

function appUrl(): string {
  // Wartość w konfiguracji bywa zapisana z ukośnikiem na końcu — bez tego
  // linki w mailach wychodziłyby z podwójnym ukośnikiem.
  return (process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000").replace(/\/+$/, "");
}

/**
 * Wymagania hasła. Firebase dopuszcza 6 znaków, co przy sklepie z adresami
 * klientów jest za mało — 8 znaków z literą i cyfrą to rozsądne minimum,
 * które nie zniechęca do rejestracji.
 */
const passwordSchema = z
  .string()
  .min(8, "Hasło musi mieć co najmniej 8 znaków")
  .max(200, "Hasło jest zbyt długie")
  .refine((v) => /[A-Za-zĄĆĘŁŃÓŚŹŻąćęłńóśźż]/.test(v), "Hasło musi zawierać literę")
  .refine((v) => /[0-9]/.test(v), "Hasło musi zawierać cyfrę");

const registerSchema = z.object({
  email: z.string().email("Podaj poprawny adres e-mail").max(254),
  password: passwordSchema,
  firstName: z.string().trim().min(2, "Imię jest wymagane").max(100),
  lastName: z.string().trim().max(100).optional().default(""),
  marketingConsent: z.boolean().default(false),
  termsAccepted: z.literal(true, { message: "Akceptacja regulaminu jest wymagana" }),
});

/**
 * Zakłada konto. Walidacja i limit prób są po stronie serwera, bo tylko tam
 * nie da się ich ominąć. Samo zalogowanie wykonuje potem przeglądarka —
 * serwer nigdy nie przechowuje hasła.
 */
export async function registerWithPassword(raw: unknown): Promise<ActionResult> {
  const parsed = registerSchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message || "Błędne dane" };
  }
  const data = parsed.data;
  const email = data.email.toLowerCase().trim();

  if (data.password.toLowerCase().includes(email.split("@")[0].toLowerCase())) {
    return { success: false, error: "Hasło nie może zawierać Twojego adresu e-mail" };
  }

  const ip = await clientIp();
  const limit = await consumeRateLimit(`register:${ip}`, 5, 60 * 60 * 1000, true);
  if (!limit.ok) {
    return {
      success: false,
      error: `Zbyt wiele prób rejestracji z tego łącza. Spróbuj ${formatRetryAfter(limit.retryAfterMs)}.`,
    };
  }

  try {
    const record = await adminAuth.createUser({
      email,
      password: data.password,
      displayName: `${data.firstName} ${data.lastName}`.trim(),
      emailVerified: false,
    });

    await db.collection("users").doc(record.uid).set({
      uid: record.uid,
      email,
      firstName: data.firstName,
      lastName: data.lastName,
      phone: "",
      marketingConsent: data.marketingConsent,
      defaultAddress: null,
      defaultLocker: null,
      invoiceDetails: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ordersLinkedAt: null,
    });

    await dispatchVerificationEmail(email, data.firstName);
    return { success: true };
  } catch (error) {
    if (error instanceof FirebaseAuthError && error.code === "auth/email-already-exists") {
      // Konto już istnieje. Nie mówimy tego wprost — zamiast tego wysyłamy na ten
      // adres przypomnienie o resecie hasła i zwracamy taką samą odpowiedź jak
      // przy sukcesie, żeby nie dało się sprawdzać, kto ma u nas konto.
      await dispatchPasswordResetEmail(email);
      return { success: true };
    }
    console.error("registerWithPassword error:", error);
    return { success: false, error: "Nie udało się założyć konta. Spróbuj ponownie." };
  }
}

/**
 * Wymienia token logowania z przeglądarki na ciasteczko sesyjne HttpOnly.
 * Wywoływane po każdym udanym logowaniu — hasłem i przez Google.
 */
export async function startSession(idToken: string): Promise<ActionResult<{ isAdmin: boolean; emailVerified: boolean }>> {
  const ip = await clientIp();
  const limit = await consumeRateLimit(`session:${ip}`, 30, 15 * 60 * 1000, true);
  if (!limit.ok) {
    return {
      success: false,
      error: `Zbyt wiele prób logowania. Spróbuj ${formatRetryAfter(limit.retryAfterMs)}.`,
    };
  }

  if (typeof idToken !== "string" || idToken.length < 100 || idToken.length > 4096) {
    return { success: false, error: "Nieprawidłowa próba logowania." };
  }

  try {
    const user = await createSession(idToken);
    await resetRateLimit(`session:${ip}`);
    await ensureUserDocument(user.uid);

    if (user.emailVerified && user.email) {
      await linkGuestOrders(user.uid, user.email);
    }

    return { success: true, isAdmin: user.isAdmin, emailVerified: user.emailVerified };
  } catch (error) {
    console.error("startSession error:", error);
    return { success: false, error: "Nie udało się rozpocząć sesji. Zaloguj się ponownie." };
  }
}

export async function signOut(): Promise<ActionResult> {
  await destroySession();
  return { success: true };
}

/** Limit prób logowania per konto — chroni jedno konto przed atakiem z wielu adresów IP. */
export async function checkLoginAttempt(email: string): Promise<ActionResult> {
  const normalized = String(email || "").toLowerCase().trim();
  if (!normalized) return { success: false, error: "Podaj adres e-mail" };

  const ip = await clientIp();
  const [byAccount, byIp] = await Promise.all([
    consumeRateLimit(`login:acct:${normalized}`, 8, 15 * 60 * 1000, true),
    consumeRateLimit(`login:ip:${ip}`, 20, 15 * 60 * 1000, true),
  ]);

  if (!byAccount.ok || !byIp.ok) {
    const wait = Math.max(byAccount.retryAfterMs, byIp.retryAfterMs);
    return {
      success: false,
      error: `Zbyt wiele nieudanych prób logowania. Spróbuj ${formatRetryAfter(wait)} lub ustaw nowe hasło.`,
    };
  }
  return { success: true };
}

/** Po udanym logowaniu zwalniamy licznik, żeby literówki nie kumulowały się z czasem. */
export async function clearLoginAttempts(email: string): Promise<void> {
  const normalized = String(email || "").toLowerCase().trim();
  if (normalized) await resetRateLimit(`login:acct:${normalized}`);
}

export async function requestPasswordReset(rawEmail: unknown): Promise<ActionResult> {
  const parsed = z.string().email().max(254).safeParse(rawEmail);
  const ip = await clientIp();

  const limit = await consumeRateLimit(`reset:${ip}`, 5, 60 * 60 * 1000, true);
  if (!limit.ok) {
    return {
      success: false,
      error: `Zbyt wiele próśb o zmianę hasła. Spróbuj ${formatRetryAfter(limit.retryAfterMs)}.`,
    };
  }

  // Odpowiedź jest zawsze taka sama, niezależnie od tego, czy konto istnieje.
  if (parsed.success) {
    const email = parsed.data.toLowerCase().trim();
    const perAccount = await consumeRateLimit(`reset:acct:${email}`, 3, 60 * 60 * 1000, false);
    if (perAccount.ok) {
      await dispatchPasswordResetEmail(email);
    }
  }

  return { success: true };
}

export async function resendVerificationEmail(): Promise<ActionResult> {
  const session = await getSession();
  if (!session?.email) return { success: false, error: "Zaloguj się, żeby wysłać potwierdzenie." };
  if (session.emailVerified) return { success: false, error: "Ten adres jest już potwierdzony." };

  const limit = await consumeRateLimit(`verify:${session.uid}`, 3, 60 * 60 * 1000, false);
  if (!limit.ok) {
    return {
      success: false,
      error: `Wysłaliśmy już kilka wiadomości. Sprawdź folder spam i spróbuj ${formatRetryAfter(limit.retryAfterMs)}.`,
    };
  }

  const profile = await db.collection("users").doc(session.uid).get();
  await dispatchVerificationEmail(session.email, profile.data()?.firstName || "");
  return { success: true };
}

/**
 * Uruchamiane po potwierdzeniu adresu e-mail — przypina do konta zamówienia
 * złożone wcześniej jako gość.
 *
 * Warunkiem jest potwierdzony adres: bez tego wystarczyłoby zarejestrować się
 * cudzym e-mailem, żeby zobaczyć czyjeś adresy i numery telefonu.
 */
export async function linkGuestOrders(uid: string, email: string): Promise<number> {
  const normalized = email.toLowerCase().trim();
  try {
    const snapshot = await db
      .collection("orders")
      .where("customerEmailLower", "==", normalized)
      .get();

    const orphans = snapshot.docs.filter((doc) => !doc.data().userId);
    if (orphans.length === 0) {
      await db.collection("users").doc(uid).set(
        { ordersLinkedAt: new Date().toISOString() },
        { merge: true }
      );
      return 0;
    }

    // Firestore przyjmuje maksymalnie 500 operacji w jednej paczce.
    for (let i = 0; i < orphans.length; i += 400) {
      const batch = db.batch();
      for (const doc of orphans.slice(i, i + 400)) {
        batch.update(doc.ref, { userId: uid, linkedAt: new Date().toISOString() });
      }
      await batch.commit();
    }

    await db.collection("users").doc(uid).set(
      { ordersLinkedAt: new Date().toISOString() },
      { merge: true }
    );

    console.log(`Przypisano ${orphans.length} zamówień gościa do konta ${uid}`);
    return orphans.length;
  } catch (error) {
    console.error("linkGuestOrders error:", error);
    return 0;
  }
}

/**
 * Wywoływane po kliknięciu w link potwierdzający, gdy użytkownik jest już
 * zalogowany. Sesja czyta stan konta na świeżo, więc wystarczy dociągnąć
 * zamówienia złożone wcześniej jako gość.
 */
export async function completeEmailVerification(): Promise<ActionResult<{ linkedOrders: number }>> {
  const session = await getSession();
  if (!session?.email) return { success: false, error: "Zaloguj się, żeby dokończyć." };
  if (!session.emailVerified) return { success: false, error: "Adres nie został jeszcze potwierdzony." };

  const linkedOrders = await linkGuestOrders(session.uid, session.email);
  return { success: true, linkedOrders };
}

/* ------------------------------------------------------------------ */
/* Pomocnicze                                                          */
/* ------------------------------------------------------------------ */

async function dispatchVerificationEmail(email: string, firstName: string) {
  try {
    const link = await adminAuth.generateEmailVerificationLink(email, {
      url: `${appUrl()}/konto?powitanie=1`,
      handleCodeInApp: false,
    });
    await sendVerificationEmail(email, firstName, link);
  } catch (error) {
    console.error("dispatchVerificationEmail error:", error);
  }
}

async function dispatchPasswordResetEmail(email: string) {
  try {
    const record = await adminAuth.getUserByEmail(email);
    const link = await adminAuth.generatePasswordResetLink(email, {
      url: `${appUrl()}/logowanie?haslo-zmienione=1`,
      handleCodeInApp: false,
    });
    const profile = await db.collection("users").doc(record.uid).get();
    await sendPasswordResetEmail(email, profile.data()?.firstName || "", link);
  } catch (error) {
    // Nieistniejące konto trafia tutaj — celowo nic nie zwracamy na zewnątrz.
    if (!(error instanceof FirebaseAuthError && error.code === "auth/user-not-found")) {
      console.error("dispatchPasswordResetEmail error:", error);
    }
  }
}

/** Tworzy profil dla kont założonych przez Google, które nie przeszły przez rejestrację. */
async function ensureUserDocument(uid: string) {
  try {
    const ref = db.collection("users").doc(uid);
    const snap = await ref.get();
    if (snap.exists) return;

    const record = await adminAuth.getUser(uid);
    const [firstName, ...rest] = (record.displayName || "").split(" ");

    await ref.set({
      uid,
      email: record.email?.toLowerCase() || "",
      firstName: firstName || "",
      lastName: rest.join(" "),
      phone: record.phoneNumber || "",
      marketingConsent: false,
      defaultAddress: null,
      defaultLocker: null,
      invoiceDetails: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ordersLinkedAt: null,
    });
  } catch (error) {
    console.error("ensureUserDocument error:", error);
  }
}
