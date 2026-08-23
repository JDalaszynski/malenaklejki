/**
 * Nadaje lub odbiera uprawnienia administratora.
 *
 * Uprawnienie żyje jako „custom claim" w podpisanym tokenie Firebase, a nie
 * jako lista adresów w kodzie — dzięki temu nie da się go podrobić po stronie
 * przeglądarki, a odebranie dostępu nie wymaga wdrożenia nowej wersji strony.
 *
 *   npx tsx scripts/nadaj-admina.ts jakub.dalaszynski@gmail.com
 *   npx tsx scripts/nadaj-admina.ts jakub.dalaszynski@gmail.com --odbierz
 *
 * Po zmianie trzeba się wylogować i zalogować ponownie — uprawnienie wchodzi
 * do tokenu dopiero przy nowym logowaniu.
 */
import * as admin from "firebase-admin";
import fs from "node:fs";

/**
 * Wczytuje zmienne z pliku `.env.local`.
 *
 * Skrypty uruchamiane przez `tsx` nie przechodzą przez Next.js, więc nikt nie
 * wczyta ich za nas — bez tego Admin SDK dostaje puste dane logowania.
 */
function loadEnv() {
  for (const name of [".env.local", "env.local", ".env"]) {
    if (!fs.existsSync(name)) continue;
    for (const line of fs.readFileSync(name, "utf8").split("\n")) {
      const match = /^([A-Z0-9_]+)=(.*)$/.exec(line.trim());
      if (!match) continue;
      let value = match[2].trim();
      if (value.startsWith('"')) {
        const end = value.indexOf('"', 1);
        if (end > 0) value = value.slice(1, end);
      } else {
        value = value.split(" #")[0].trim();
      }
      if (process.env[match[1]] === undefined) process.env[match[1]] = value;
    }
    return;
  }
  console.error("Nie znalazłem pliku ze zmiennymi (.env.local).");
  process.exit(1);
}


function initialize() {
  if (admin.apps.length) return;
  loadEnv();

  let privateKey = process.env.FIREBASE_PRIVATE_KEY?.trim();
  if (privateKey?.startsWith('"') && privateKey.endsWith('"')) {
    privateKey = privateKey.slice(1, -1);
  }
  privateKey = privateKey?.replace(/\\n/g, "\n");

  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey,
    }),
  });
}

async function main() {
  const email = process.argv[2];
  const revoke = process.argv.includes("--odbierz");

  if (!email) {
    console.error("Podaj adres e-mail: npx tsx scripts/nadaj-admina.ts adres@example.com");
    process.exit(1);
  }

  initialize();

  const user = await admin.auth().getUserByEmail(email);
  const claims = { ...(user.customClaims ?? {}) };

  if (revoke) delete claims.role;
  else claims.role = "admin";

  await admin.auth().setCustomUserClaims(user.uid, claims);
  // Unieważnia istniejące sesje, żeby zmiana zadziałała natychmiast.
  await admin.auth().revokeRefreshTokens(user.uid);

  console.log(
    revoke
      ? `Odebrano uprawnienia administratora: ${email} (${user.uid})`
      : `Nadano uprawnienia administratora: ${email} (${user.uid})`
  );
  console.log("Zaloguj się ponownie, żeby uprawnienie weszło do sesji.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
