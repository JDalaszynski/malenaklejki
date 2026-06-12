import * as admin from 'firebase-admin';

let dbInstance: admin.firestore.Firestore | null = null;

function getDb(): admin.firestore.Firestore {
  if (!dbInstance) {
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
        });
      } catch (error) {
        console.error('Firebase admin initialization error', error);
        throw error;
      }
    }
    dbInstance = admin.firestore();
  }
  return dbInstance;
}

export const db = new Proxy({} as admin.firestore.Firestore, {
  get(target, prop, receiver) {
    const actualDb = getDb();
    const value = Reflect.get(actualDb, prop, receiver);
    if (typeof value === 'function') {
      return value.bind(actualDb);
    }
    return value;
  }
});

