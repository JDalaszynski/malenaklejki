import { initializeApp, getApps, getApp } from "firebase/app";
import { getStorage } from "firebase/storage";
import { browserLocalPersistence, getAuth, setPersistence, type Auth } from "firebase/auth";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
const storage = getStorage(app);

let authInstance: Auth | null = null;

/**
 * Uwierzytelnianie inicjalizujemy dopiero przy pierwszym użyciu w przeglądarce.
 *
 * Wywołanie `getAuth()` już przy imporcie modułu wywracało budowanie strony:
 * Next prerenderuje strony konta po stronie serwera, gdzie klucza API nie ma,
 * a Firebase rzuca wtedy `auth/invalid-api-key` zanim wykona się jakikolwiek
 * kod komponentu.
 */
export function getClientAuth(): Auth {
  if (typeof window === "undefined") {
    throw new Error("Uwierzytelnianie Firebase jest dostępne wyłącznie w przeglądarce.");
  }

  if (!authInstance) {
    authInstance = getAuth(app);
    // Firebase w przeglądarce służy tylko do samego aktu logowania — token jest
    // natychmiast wymieniany na ciasteczko HttpOnly po stronie serwera
    // (src/lib/auth/session.ts). Trwałość ustawiamy, żeby przeładowanie strony
    // w trakcie logowania (np. powrót z okna Google) nie gubiło stanu.
    setPersistence(authInstance, browserLocalPersistence).catch(() => {
      /* tryb prywatny przeglądarki — logowanie zadziała w ramach jednej karty */
    });
  }

  return authInstance;
}

export { app, storage };
