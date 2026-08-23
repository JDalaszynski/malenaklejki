/**
 * Sprawdza stan konfiguracji wdrożenia kont i panelu.
 *
 * Skrypt wyłącznie czyta — nie zapisuje niczego w bazie, w magazynie plików
 * ani w kontach użytkowników. Można go uruchamiać po każdej zmianie
 * w konsoli Firebase, żeby zobaczyć, co jeszcze zostało.
 *
 *   node scripts/sprawdz-konfiguracje.mjs
 */
import fs from "node:fs";
import admin from "firebase-admin";
import { randomUUID } from "node:crypto";

/** Czyta plik ze zmiennymi bez uruchamiania powłoki. */
function readEnvFile() {
  for (const name of [".env.local", "env.local", ".env"]) {
    if (fs.existsSync(name)) return fs.readFileSync(name, "utf8");
  }
  console.error("Nie znalazłem pliku ze zmiennymi (.env.local ani env.local).");
  process.exit(1);
}

// --- wczytanie env.local bez uruchamiania powłoki ---
const env = {};
for (const line of readEnvFile().split("\n")) {
  const m = /^([A-Z0-9_]+)=(.*)$/.exec(line.trim());
  if (!m) continue;
  let v = m[2].trim();
  // odetnij komentarz po zamkniętym cudzysłowie
  if (v.startsWith('"')) {
    const end = v.indexOf('"', 1);
    if (end > 0) v = v.slice(1, end);
  } else {
    v = v.split(" #")[0].trim();
  }
  env[m[1]] = v;
}

const ok = (t) => console.log(`  \x1b[32m✓\x1b[0m ${t}`);
const no = (t) => console.log(`  \x1b[31m✗\x1b[0m ${t}`);
const info = (t) => console.log(`  \x1b[33m•\x1b[0m ${t}`);

console.log("\n=== 1. UWIERZYTELNIANIE (konfiguracja projektu) ===");
try {
  const res = await fetch(
    `https://identitytoolkit.googleapis.com/v1/projects?key=${env.NEXT_PUBLIC_FIREBASE_API_KEY}`
  );
  if (!res.ok) {
    no(`Nie udało się odczytać konfiguracji (HTTP ${res.status}) — Authentication prawdopodobnie nie jest jeszcze włączone.`);
  } else {
    const cfg = await res.json();
    // Uwaga: odpowiedź `getProjectConfig` wywołana kluczem publicznym zawiera
    // wyłącznie `projectId` i `authorizedDomains` — nie ma w niej sekcji
    // `signIn`. Sprawdzanie `cfg.signIn.email.enabled` dawało więc zawsze
    // `undefined`, czyli fałszywą informację o wyłączonym logowaniu.
    //
    // Stan dostawcy hasłowego rozpoznajemy po kodzie błędu nieudanego
    // logowania na nieistniejący adres: przy wyłączonym dostawcy Firebase
    // zwraca OPERATION_NOT_ALLOWED, przy włączonym — błąd o danych logowania.
    // Nic przy tym nie powstaje ani nie zmienia się w projekcie.
    try {
      const probe = await fetch(
        `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${env.NEXT_PUBLIC_FIREBASE_API_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: `diagnostyka-${randomUUID()}@example.invalid`,
            password: randomUUID(),
            returnSecureToken: true,
          }),
        }
      );
      const msg = (await probe.json())?.error?.message ?? "";
      if (msg.startsWith("OPERATION_NOT_ALLOWED")) no("Logowanie e-mail + hasło: WYŁĄCZONE");
      else if (msg.startsWith("INVALID_LOGIN_CREDENTIALS") || msg.startsWith("EMAIL_NOT_FOUND") || msg.startsWith("INVALID_PASSWORD")) ok("Logowanie e-mail + hasło: WŁĄCZONE");
      else info(`Logowanie e-mail + hasło: nie rozpoznano stanu (${msg || "brak komunikatu"})`);
    } catch {
      info("Nie udało się sprawdzić logowania e-mailem.");
    }

    // Konfiguracji dostawców zewnętrznych nie ma w tej odpowiedzi. Sprawdzamy ją
    // pytaniem o adres logowania Google — zwraca go tylko wtedy, gdy dostawca
    // jest włączony. Zapytanie niczego nie tworzy ani nie zmienia.
    try {
      const g = await fetch(
        `https://identitytoolkit.googleapis.com/v1/accounts:createAuthUri?key=${env.NEXT_PUBLIC_FIREBASE_API_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            providerId: "google.com",
            continueUri: `${(env.NEXT_PUBLIC_APP_URL || "http://localhost:3000").replace(/\/+$/, "")}/konto/akcja`,
          }),
        }
      );
      const gb = await g.json();
      gb?.authUri ? ok("Logowanie przez Google: WŁĄCZONE") : no("Logowanie przez Google: WYŁĄCZONE");
    } catch {
      info("Nie udało się sprawdzić logowania Google.");
    }

    const domains = cfg?.authorizedDomains ?? [];
    info(`Dozwolone domeny: ${domains.join(", ") || "(brak)"}`);
    for (const d of ["malenaklejki.pl", "www.malenaklejki.pl"]) {
      domains.includes(d) ? ok(`Domena ${d} dopisana`) : no(`Brakuje domeny ${d}`);
    }
  }
} catch (e) {
  no(`Błąd zapytania: ${e.message}`);
}

// --- Admin SDK ---
let key = env.FIREBASE_PRIVATE_KEY ?? "";
key = key.replace(/\\n/g, "\n");
admin.initializeApp({
  credential: admin.credential.cert({
    projectId: env.FIREBASE_PROJECT_ID,
    clientEmail: env.FIREBASE_CLIENT_EMAIL,
    privateKey: key,
  }),
  storageBucket: env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
});
const db = admin.firestore();

console.log("\n=== 2. KONTO ADMINISTRATORA ===");
try {
  const u = await admin.auth().getUserByEmail("jakub.dalaszynski@gmail.com");
  ok(`Konto istnieje (uid ${u.uid.slice(0, 8)}…)`);
  u.emailVerified ? ok("Adres e-mail potwierdzony") : no("Adres e-mail NIEpotwierdzony — historia zamówień będzie zablokowana");
  u.customClaims?.role === "admin"
    ? ok("Uprawnienie administratora nadane")
    : no("Brak uprawnienia administratora — uruchom scripts/nadaj-admina.ts");
  info(`Metody logowania: ${u.providerData.map((p) => p.providerId).join(", ") || "brak"}`);
} catch (e) {
  if (e.code === "auth/user-not-found") no("Konto jakub.dalaszynski@gmail.com jeszcze nie istnieje — zarejestruj się na stronie");
  else no(`Nie udało się sprawdzić: ${e.message}`);
}

console.log("\n=== 3. INDEKS DLA HISTORII ZAMÓWIEŃ ===");
try {
  await db.collection("orders").where("userId", "==", "__diagnostyka__").orderBy("createdAt", "desc").limit(1).get();
  ok("Indeks złożony (userId + createdAt) istnieje — historia zamówień zadziała");
} catch (e) {
  if (String(e.message).includes("index")) {
    no("BRAK indeksu złożonego (userId + createdAt) — /konto/zamowienia wyrzuci błąd");
    const link = /https:\/\/console\.firebase\.google\.com\S+/.exec(e.message);
    if (link) info(`Utwórz jednym kliknięciem: ${link[0]}`);
  } else {
    no(`Zapytanie nie przeszło: ${e.message.slice(0, 160)}`);
  }
}

console.log("\n=== 4. DANE ZAMÓWIEŃ (czy przebiegł skrypt uzupełniający) ===");
try {
  const snap = await db.collection("orders").get();
  const total = snap.size;
  let withEmailLower = 0, withUserIdField = 0, withDeletedField = 0, withFulfil = 0, withLayout = 0;
  snap.forEach((d) => {
    const x = d.data();
    if (x.customerEmailLower) withEmailLower++;
    if (x.userId !== undefined) withUserIdField++;
    if (x.deletedAt !== undefined) withDeletedField++;
    if (x.fulfillmentStatus) withFulfil++;
    if ((x.items ?? []).some((i) => i.layoutPath)) withLayout++;
  });
  info(`Zamówień w bazie: ${total}`);
  withEmailLower === total
    ? ok(`Pole customerEmailLower: ${withEmailLower}/${total}`)
    : no(`Pole customerEmailLower: ${withEmailLower}/${total} — uruchom scripts/uzupelnij-email-zamowien.ts`);
  info(`Pole deletedAt: ${withDeletedField}/${total} · fulfillmentStatus: ${withFulfil}/${total}`);
  info(`Zamówienia z zapisanym układem arkusza: ${withLayout}/${total}`);
} catch (e) {
  no(`Nie udało się odczytać zamówień: ${e.message.slice(0, 160)}`);
}

console.log("\n=== 5. PROFILE UŻYTKOWNIKÓW ===");
try {
  const users = await db.collection("users").get();
  info(`Profili w kolekcji users: ${users.size}`);
  const list = await admin.auth().listUsers(20);
  info(`Kont w Firebase Auth: ${list.users.length}${list.pageToken ? "+" : ""}`);
} catch (e) {
  no(`Nie udało się odczytać: ${e.message.slice(0, 160)}`);
}

console.log("\n=== 6. MAGAZYN PLIKÓW ===");
try {
  const bucket = admin.storage().bucket();
  const [exists] = await bucket.exists();
  exists ? ok(`Bucket ${bucket.name} dostępny`) : no("Bucket niedostępny");
  const [cartLayouts] = await bucket.getFiles({ prefix: "layouts/carts/", maxResults: 5 });
  const [orderLayouts] = await bucket.getFiles({ prefix: "layouts/", maxResults: 5 });
  info(`Plików w layouts/carts/: ${cartLayouts.length}${cartLayouts.length === 5 ? "+" : ""}`);
  info(`Plików w layouts/ łącznie: ${orderLayouts.length}${orderLayouts.length === 5 ? "+" : ""}`);
  if (orderLayouts.length === 0) {
    info("Brak zapisanych układów — to normalne, dopóki nikt nie dodał arkusza do koszyka po wdrożeniu nowych reguł Storage.");
  }
} catch (e) {
  no(`Nie udało się odczytać magazynu: ${e.message.slice(0, 160)}`);
}

console.log("\n=== 7. ZMIENNE ŚRODOWISKOWE (lokalnie) ===");
for (const v of ["NEXT_PUBLIC_APP_URL", "BREVO_API_KEY", "ADMIN_EMAIL", "CRON_SECRET"]) {
  env[v] ? ok(`${v} ustawione${v === "NEXT_PUBLIC_APP_URL" ? ` = ${env[v]}` : ""}`) : no(`${v} — brak`);
}
console.log("");
process.exit(0);
