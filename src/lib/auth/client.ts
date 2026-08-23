"use client";

import {
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut as firebaseSignOut,
} from "firebase/auth";
import { getClientAuth } from "@/lib/firebase/client";

/**
 * Tłumaczy kody błędów Firebase na komunikaty dla klienta.
 *
 * Przy włączonej ochronie przed wyliczaniem kont Firebase zwraca jeden kod
 * (`invalid-credential`) i dla złego hasła, i dla nieistniejącego adresu —
 * celowo nie rozróżniamy tego w komunikacie.
 */
export function authErrorMessage(code: string | undefined): string {
  switch (code) {
    case "auth/invalid-credential":
    case "auth/wrong-password":
    case "auth/user-not-found":
      return "Nieprawidłowy e-mail lub hasło.";
    case "auth/invalid-email":
      return "Podaj poprawny adres e-mail.";
    case "auth/user-disabled":
      return "To konto zostało zablokowane. Napisz na kontakt@malenaklejki.pl.";
    case "auth/too-many-requests":
      return "Zbyt wiele prób. Odczekaj chwilę albo ustaw nowe hasło.";
    case "auth/popup-closed-by-user":
    case "auth/cancelled-popup-request":
      return "Okno logowania Google zostało zamknięte.";
    case "auth/popup-blocked":
      return "Przeglądarka zablokowała okno Google. Zezwól na wyskakujące okna i spróbuj ponownie.";
    case "auth/account-exists-with-different-credential":
      return "Ten adres jest już używany z innym sposobem logowania. Zaloguj się hasłem.";
    case "auth/network-request-failed":
      return "Brak połączenia z siecią. Sprawdź internet i spróbuj ponownie.";
    // Poniższe oznaczają błąd konfiguracji, a nie pomyłkę użytkownika. Wcześniej
    // wpadały do gałęzi domyślnej i dawały bezużyteczne „coś poszło nie tak",
    // przez co brak zmiennych Firebase wyglądał jak losowa awaria logowania.
    case "auth/invalid-api-key":
    case "auth/api-key-not-valid":
    case "auth/configuration-not-found":
      return "Logowanie nie jest poprawnie skonfigurowane (brak lub błędny klucz Firebase).";
    case "auth/operation-not-allowed":
      return "Ten sposób logowania jest wyłączony w ustawieniach Firebase.";
    case "auth/unauthorized-domain":
      return "Ta domena nie jest dopuszczona do logowania w ustawieniach Firebase.";
    case "auth/requires-recent-login":
      return "Ze względów bezpieczeństwa zaloguj się ponownie.";
    case "auth/weak-password":
      return "Hasło jest zbyt proste. Użyj co najmniej 8 znaków z literą i cyfrą.";
    case "auth/email-already-in-use":
      return "Ten adres e-mail jest już zajęty.";
    default:
      return "Coś poszło nie tak. Spróbuj ponownie.";
  }
}

/** Loguje w przeglądarce i zwraca token do wymiany na ciasteczko sesyjne. */
export async function passwordSignIn(email: string, password: string): Promise<string> {
  const credential = await signInWithEmailAndPassword(getClientAuth(), email.trim(), password);
  return credential.user.getIdToken(true);
}

export async function googleSignIn(): Promise<{ idToken: string; isNewUser: boolean }> {
  const provider = new GoogleAuthProvider();
  // Zawsze pokazujemy wybór konta — inaczej osoba z kilkoma kontami Google
  // wpada z powrotem w to, którym logowała się ostatnio, bez możliwości zmiany.
  provider.setCustomParameters({ prompt: "select_account" });

  const credential = await signInWithPopup(getClientAuth(), provider);
  const idToken = await credential.user.getIdToken(true);
  const creationTime = credential.user.metadata.creationTime;
  const lastSignInTime = credential.user.metadata.lastSignInTime;

  return { idToken, isNewUser: creationTime === lastSignInTime };
}

/**
 * Zamyka sesję Firebase w przeglądarce. Po wymianie tokenu na ciasteczko
 * HttpOnly przeglądarka nie ma już powodu trzymać własnej kopii sesji —
 * a im mniej tokenów w localStorage, tym mniej jest do wykradzenia.
 */
export async function clearBrowserSession(): Promise<void> {
  try {
    await firebaseSignOut(getClientAuth());
  } catch {
    /* brak sesji przeglądarki — nic do zrobienia */
  }
}
