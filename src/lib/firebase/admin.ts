import * as admin from 'firebase-admin';

let appInstance: admin.app.App | null = null;

function getApp(): admin.app.App {
  if (appInstance) return appInstance;

  if (!admin.apps.length) {
    try {
      const rawKey = process.env.FIREBASE_PRIVATE_KEY;
      let formattedKey = rawKey;
      if (formattedKey) {
        formattedKey = formattedKey.trim();
        if (formattedKey.startsWith('"') && formattedKey.endsWith('"')) {
          formattedKey = formattedKey.substring(1, formattedKey.length - 1);
        }
        if (formattedKey.startsWith("'") && formattedKey.endsWith("'")) {
          formattedKey = formattedKey.substring(1, formattedKey.length - 1);
        }
        formattedKey = formattedKey.replace(/\\n/g, '\n');
      }

      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: formattedKey,
        }),
        storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      });
    } catch (error) {
      console.error('Firebase admin initialization error', error);
      throw error;
    }
  }

  appInstance = admin.app();
  return appInstance;
}

/**
 * Odracza inicjalizację Firebase Admin do pierwszego użycia. Bez tego moduł
 * wywraca się przy imporcie, gdy zmienne środowiskowe nie są jeszcze wczytane
 * (np. podczas budowania), a błąd jest wtedy nieczytelny.
 */
function lazy<T extends object>(resolve: () => T): T {
  return new Proxy({} as T, {
    get(_target, prop, receiver) {
      const actual = resolve();
      const value = Reflect.get(actual as object, prop, receiver);
      if (typeof value === 'function') {
        return value.bind(actual);
      }
      return value;
    },
  });
}

export const db = lazy<admin.firestore.Firestore>(() => getApp().firestore());

export const adminAuth = lazy<admin.auth.Auth>(() => getApp().auth());

/** Domyślny bucket Storage — używany do zapisu układów arkuszy. */
export function getBucket() {
  return getApp().storage().bucket();
}

export const FieldValue = admin.firestore.FieldValue;
export const Timestamp = admin.firestore.Timestamp;
