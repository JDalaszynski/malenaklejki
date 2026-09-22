/**
 * Sprawdza, czy sklep jest w stanie przyjąć zamówienie: Przelewy24, Brevo
 * (maile), BaseLinker i inFakt.
 *
 * Skrypt wyłącznie czyta. Nie rejestruje transakcji, nie wysyła maili, nie
 * zakłada zamówień ani faktur — każde zapytanie to odczyt stanu konta albo
 * słownika po stronie usługi. Nie wypisuje też żadnego klucza; pokazuje
 * najwyżej jego długość i kształt.
 *
 *   node scripts/sprawdz-integracje.mjs
 *
 * Uwaga: sprawdza konfigurację z lokalnego `.env.local`. Produkcja bierze
 * zmienne z Vercela — jeśli gdzieś się rozjechały, ten skrypt tego nie
 * zobaczy.
 */
import fs from "node:fs";

/* ------------------------------------------------------------------ */
/* Zmienne środowiskowe                                                */
/* ------------------------------------------------------------------ */

function readEnvFile() {
  for (const name of [".env.local", "env.local", ".env"]) {
    if (fs.existsSync(name)) return fs.readFileSync(name, "utf8");
  }
  console.error("Nie znalazłem pliku ze zmiennymi (.env.local ani env.local).");
  process.exit(1);
}

const env = {};
for (const line of readEnvFile().split("\n")) {
  const m = /^([A-Z0-9_]+)=(.*)$/.exec(line.trim());
  if (!m) continue;
  let v = m[2].trim();
  if (v.startsWith('"')) {
    const end = v.indexOf('"', 1);
    if (end > 0) v = v.slice(1, end);
  } else {
    v = v.split(" #")[0].trim();
  }
  env[m[1]] = v;
}

const ok = (t) => console.log(`  \x1b[32m✓\x1b[0m ${t}`);
const no = (t) => { bledy++; console.log(`  \x1b[31m✗\x1b[0m ${t}`); };
const uwaga = (t) => { ostrzezenia++; console.log(`  \x1b[33m!\x1b[0m ${t}`); };
const info = (t) => console.log(`  \x1b[90m·\x1b[0m ${t}`);

let bledy = 0;
let ostrzezenia = 0;

/** Opis klucza bez ujawniania go: długość i kształt. */
const opisKlucza = (v) => (v ? `${v.length} znaków` : "brak");

async function pobierz(url, init = {}) {
  return fetch(url, { ...init, signal: AbortSignal.timeout(20000) });
}

/* ------------------------------------------------------------------ */
/* 1. Przelewy24                                                       */
/* ------------------------------------------------------------------ */

console.log("\n\x1b[1m=== 1. PRZELEWY24 (przyjmowanie płatności) ===\x1b[0m");

const p24Env = (env.P24_ENV || "production").replace(/["']/g, "").trim();
const p24Base =
  p24Env === "sandbox"
    ? "https://sandbox.przelewy24.pl/api/v1"
    : "https://secure.przelewy24.pl/api/v1";

for (const v of ["P24_MERCHANT_ID", "P24_POS_ID", "P24_CRC", "P24_API_KEY"]) {
  env[v] ? ok(`${v} ustawione (${opisKlucza(env[v])})`) : no(`${v} — BRAK, płatności nie ruszą`);
}

if (p24Env === "production") ok("P24_ENV = production — transakcje idą przez prawdziwe P24");
else uwaga(`P24_ENV = ${p24Env} — sklep rozmawia z piaskownicą, klient NIE zapłaci naprawdę`);

if (env.P24_MERCHANT_ID && env.P24_POS_ID) {
  if (env.P24_MERCHANT_ID === env.P24_POS_ID) ok(`merchantId = posId = ${env.P24_MERCHANT_ID} (typowe dla jednego sklepu)`);
  else info(`merchantId ${env.P24_MERCHANT_ID}, posId ${env.P24_POS_ID}`);
  if (!/^\d+$/.test(env.P24_POS_ID)) no("P24_POS_ID nie jest liczbą — `parseInt` da NaN i rejestracja padnie");
}

if (env.P24_CRC) {
  // CRC dla REST API to 16 znaków hex. Zły CRC przechodzi `testAccess`
  // i wysypuje się dopiero przy rejestracji transakcji — dlatego kształt
  // sprawdzamy osobno.
  if (/^[0-9a-f]{16}$/i.test(env.P24_CRC)) ok("P24_CRC ma kształt klucza REST API (16 znaków hex)");
  else uwaga(`P24_CRC ma nietypowy kształt (${opisKlucza(env.P24_CRC)}) — dla REST API oczekiwane 16 znaków hex`);
}

if (env.P24_POS_ID && env.P24_API_KEY) {
  try {
    const auth = Buffer.from(`${env.P24_POS_ID}:${env.P24_API_KEY}`).toString("base64");
    const res = await pobierz(`${p24Base}/testAccess`, { headers: { Authorization: `Basic ${auth}` } });
    if (res.ok) ok(`testAccess: dostęp do API potwierdzony (${p24Base.includes("sandbox") ? "sandbox" : "produkcja"})`);
    else if (res.status === 401) no("testAccess: 401 — posId albo klucz API nieprawidłowy, płatności NIE ruszą");
    else no(`testAccess: HTTP ${res.status}`);
  } catch (e) {
    no(`testAccess: brak połączenia (${e.message})`);
  }
}

const appUrl = (env.NEXT_PUBLIC_APP_URL || "").replace(/\/+$/, "");
if (!appUrl) no("NEXT_PUBLIC_APP_URL — brak, P24 nie będzie miało dokąd odesłać klienta ani wysłać webhooka");
else if (appUrl.startsWith("http://localhost")) uwaga(`NEXT_PUBLIC_APP_URL = ${appUrl} — lokalny; webhook P24 tam nie dojdzie`);
else ok(`Adres zwrotny i webhook: ${appUrl}/api/webhooks/przelewy24`);

/* ------------------------------------------------------------------ */
/* 2. Brevo                                                            */
/* ------------------------------------------------------------------ */

console.log("\n\x1b[1m=== 2. BREVO (maile do klienta i do sprzedawcy) ===\x1b[0m");

const adminEmail = env.ADMIN_EMAIL || "kontakt@malenaklejki.pl";
info(`Adres sprzedawcy (nadawca i odbiorca powiadomień): ${adminEmail}`);

if (!env.BREVO_API_KEY) {
  no("BREVO_API_KEY — BRAK, żaden mail nie wyjdzie");
} else {
  ok(`BREVO_API_KEY ustawione (${opisKlucza(env.BREVO_API_KEY)})`);
  const naglowki = { "api-key": env.BREVO_API_KEY, Accept: "application/json" };

  try {
    const res = await pobierz("https://api.brevo.com/v3/account", { headers: naglowki });
    if (res.status === 401) {
      no("Konto: 401 — klucz API odrzucony, maile NIE wychodzą");
    } else if (!res.ok) {
      no(`Konto: HTTP ${res.status}`);
    } else {
      const konto = await res.json();
      ok(`Konto: ${konto.companyName ?? konto.email ?? "(bez nazwy)"}`);
      const plan = (konto.plan ?? [])[0];
      if (plan) {
        const zostalo = plan.credits;
        // Na planie `free` `sendLimit` to pozostały limit DZIENNY (300/dobę),
        // nie zapas kredytów — odnawia się co noc.
        const dzienny = plan.type === "free" && plan.creditsType === "sendLimit";
        info(`Plan Brevo: ${plan.type}${dzienny ? " (limit 300 maili na dobę)" : ""}`);
        if (typeof zostalo !== "number") {
          info(`Limit: ${plan.creditsType ?? "?"}`);
        } else if (zostalo <= 0) {
          no("Limit wysyłki wyczerpany — maile NIE wyjdą");
        } else if (zostalo < 30) {
          uwaga(`Zostało ${zostalo} maili${dzienny ? " na dziś" : ""} — jedno zamówienie to ~3 maile`);
        } else {
          ok(`Zostało ${zostalo} maili${dzienny ? " na dziś" : ""} (~${Math.floor(zostalo / 3)} zamówień)`);
        }
      }
    }
  } catch (e) {
    no(`Konto: brak połączenia (${e.message})`);
  }

  try {
    const res = await pobierz("https://api.brevo.com/v3/senders", { headers: naglowki });
    if (res.ok) {
      const { senders = [] } = await res.json();
      const nasz = senders.find((s) => s.email?.toLowerCase() === adminEmail.toLowerCase());
      if (!nasz) {
        no(`Nadawca ${adminEmail} NIE jest zdefiniowany w Brevo — wysyłka zostanie odrzucona`);
        info(`Zdefiniowani nadawcy: ${senders.map((s) => s.email).join(", ") || "(brak)"}`);
      } else if (nasz.active === false) {
        no(`Nadawca ${adminEmail} istnieje, ale jest NIEAKTYWNY (niepotwierdzony)`);
      } else {
        ok(`Nadawca ${adminEmail} zdefiniowany i aktywny`);
      }
    } else {
      uwaga(`Lista nadawców: HTTP ${res.status} — nie sprawdzono`);
    }
  } catch (e) {
    uwaga(`Lista nadawców: brak połączenia (${e.message})`);
  }

  // Uwierzytelnienie domeny decyduje o tym, ile maili wpada do spamu albo
  // wraca odbiciem — przy powiadomieniach o płatności to różnica między
  // "sprzedawca wie o zamówieniu" a "nie wie".
  try {
    const res = await pobierz("https://api.brevo.com/v3/senders/domains", { headers: naglowki });
    if (res.ok) {
      const { domains = [] } = await res.json();
      const domena = adminEmail.split("@")[1]?.toLowerCase();
      const nasza = domains.find((d) => d.domain_name?.toLowerCase() === domena || d.domain?.toLowerCase() === domena);
      if (!nasza) {
        uwaga(`Domena ${domena} nie jest dodana w Brevo — maile idą bez uwierzytelnienia (częste odbicia)`);
      } else {
        const uwierzytelniona = nasza.authenticated ?? nasza.dkim_verified ?? nasza.verified;
        uwierzytelniona
          ? ok(`Domena ${domena}: uwierzytelniona (DKIM/SPF)`)
          : uwaga(`Domena ${domena}: DODANA, ale NIEuwierzytelniona — maile trafiają do spamu i odbijają się`);
      }
    }
  } catch {
    /* opcjonalne — brak tej informacji niczego nie blokuje */
  }

  // Odbicia i blokady widać dopiero po fakcie — dlatego zaglądamy w statystyki
  // z ostatniego tygodnia, a nie tylko w konfigurację.
  try {
    const od = new Date(Date.now() - 7 * 24 * 3600 * 1000).toISOString().slice(0, 10);
    const dzis = new Date().toISOString().slice(0, 10);
    const res = await pobierz(
      `https://api.brevo.com/v3/smtp/statistics/aggregatedReport?startDate=${od}&endDate=${dzis}`,
      { headers: naglowki }
    );
    if (res.ok) {
      const st = await res.json();
      const odbite = (st.hardBounces ?? 0) + (st.softBounces ?? 0) + (st.blocked ?? 0) + (st.invalid ?? 0);
      const wyslane = st.requests ?? 0;
      info(`Ostatnie 7 dni: ${wyslane} wysłanych, ${st.delivered ?? 0} dostarczonych`);
      if (odbite === 0) ok("Bez odbić, blokad i zgłoszeń spamu w tym tygodniu");
      else uwaga(`Odbicia i blokady: ${odbite} z ${wyslane} — część powiadomień nie dotarła`);
    }
  } catch {
    /* jw. */
  }
}

/* ------------------------------------------------------------------ */
/* 3. BaseLinker                                                       */
/* ------------------------------------------------------------------ */

console.log("\n\x1b[1m=== 3. BASELINKER (zamówienia do realizacji) ===\x1b[0m");

/** Stałe z src/lib/baselinker.ts — muszą zgadzać się z kontem. */
const BL_PRODUKT_ID = "17059";
/** Magazyn, w którym produkt faktycznie leży — sklep Letica.pl podpięty do BaseLinkera. */
const BL_MAGAZYN = "shop_28234";
const BL_STATUS_ID = 65507;
const BL_POLE_UWAGI = "Uwagi";

async function bl(method, parameters = {}) {
  const body = new URLSearchParams();
  body.append("method", method);
  body.append("parameters", JSON.stringify(parameters));
  const res = await pobierz("https://api.baselinker.com/connector.php", {
    method: "POST",
    headers: { "X-BLToken": env.BASELINKER_TOKEN, "Content-Type": "application/x-www-form-urlencoded" },
    body: body.toString(),
  });
  return res.json();
}

if (!env.BASELINKER_TOKEN) {
  no("BASELINKER_TOKEN — BRAK, zamówienia nie trafią do realizacji");
} else {
  ok(`BASELINKER_TOKEN ustawione (${opisKlucza(env.BASELINKER_TOKEN)})`);
  try {
    const statusy = await bl("getOrderStatusList");
    if (statusy.status !== "SUCCESS") {
      no(`Token odrzucony: ${statusy.error_message ?? statusy.error_code ?? "nieznany błąd"}`);
    } else {
      ok("Token przyjęty przez API");
      const nowe = (statusy.statuses ?? []).find((s) => Number(s.id) === BL_STATUS_ID);
      nowe
        ? ok(`Status startowy ${BL_STATUS_ID} istnieje: „${nowe.name}"`)
        : no(`Status ${BL_STATUS_ID} NIE istnieje na koncie — zamówienie zostanie odrzucone lub wpadnie w przypadkowy status`);

      const pola = await bl("getOrderExtraFields");
      const uwagi = (pola.extra_fields ?? []).find(
        (f) => f.name?.trim().toLowerCase() === BL_POLE_UWAGI.toLowerCase()
      );
      if (uwagi) {
        ok(`Pole dodatkowe „${BL_POLE_UWAGI}" istnieje (id ${uwagi.extra_field_id})`);
      } else {
        // Nie blokuje zamówienia: ta sama treść leci w `user_comments`, które
        // BaseLinker pokazuje jako uwagi kupującego. Puste zostaje tylko pole
        // dodatkowe, a sklep przy każdym zamówieniu dopytuje o listę pól.
        uwaga(`Brak pola dodatkowego „${BL_POLE_UWAGI}" — uwagi i tak idą w komentarzu kupującego, pole zostaje puste`);
        info(`Pola na koncie: ${(pola.extra_fields ?? []).map((f) => `${f.name} (id ${f.extra_field_id})`).join(", ") || "(brak)"}`);
      }

      // Produkt leży w magazynie podpiętego sklepu, nie w katalogu BaseLinkera —
      // i właśnie ten magazyn sklep podaje w `addOrder`. Rozjazd między jednym
      // a drugim odbiera pozycji miniaturę, więc sprawdzamy dokładnie to miejsce,
      // które wskazuje kod.
      const dane = await bl("getProductsData", { storage_id: BL_MAGAZYN, products: [BL_PRODUKT_ID] });
      const produkt = dane?.status === "SUCCESS" ? dane.products?.[BL_PRODUKT_ID] : null;
      if (!produkt) {
        no(`Produktu ${BL_PRODUKT_ID} nie ma w magazynie ${BL_MAGAZYN} — pozycje zamówień zostaną bez miniatury`);
      } else {
        ok(`Produkt ${BL_PRODUKT_ID} w magazynie ${BL_MAGAZYN}: „${produkt.name}"`);
        const zdjecia = Array.isArray(produkt.images) ? produkt.images.filter(Boolean) : Object.values(produkt.images ?? {}).filter(Boolean);
        zdjecia.length
          ? ok("Produkt ma zdjęcie — miniatura w zamówieniu bierze się właśnie z niego")
          : uwaga("Produkt bez zdjęcia — dodaj je na karcie produktu w sklepie, API tego magazynu jest tylko do odczytu");
      }

      // Najmocniejszy dowód, że integracja działa: zamówienia, które sklep
      // już tam wstawił. Sama konfiguracja tego nie pokaże.
      const od = Math.floor(Date.now() / 1000) - 45 * 24 * 3600;
      // `getOrders` oddaje najwyżej 100 zamówień na stronę, rosnąco po ID.
      // Bez przewijania `id_from` widać wyłącznie najstarszą setkę — i ostatnie
      // zamówienie sklepu wypada wtedy o dwa tygodnie za wcześnie.
      const nasze = [];
      let idFrom = 0;
      for (let strona = 0; strona < 20; strona++) {
        const paczka = await bl("getOrders", {
          date_from: od,
          get_unconfirmed_orders: true,
          ...(idFrom ? { id_from: idFrom } : {}),
        });
        const orders = paczka.orders ?? [];
        nasze.push(
          ...orders.filter((o) => (o.products ?? []).some((pr) => (pr.name || "").includes("MałeNaklejki")))
        );
        if (orders.length < 100) break;
        idFrom = Number(orders[orders.length - 1].order_id) + 1;
      }
      if (nasze.length === 0) {
        uwaga("Brak zamówień ze sklepu w BaseLinkerze z ostatnich 45 dni — nie ma czym potwierdzić wysyłki");
      } else {
        const ostatnie = nasze[nasze.length - 1];
        ok(`Zamówienia ze sklepu docierają: ${nasze.length} z ostatnich 45 dni`);
        info(`Ostatnie #${ostatnie.order_id} z ${new Date(ostatnie.date_add * 1000).toISOString().slice(0, 10)}, opłacone w BaseLinkerze: ${ostatnie.payment_done > 0 ? "tak" : "nie (księgujesz ręcznie)"}`);
      }
    }
  } catch (e) {
    no(`Brak połączenia z BaseLinkerem (${e.message})`);
  }
}

/* ------------------------------------------------------------------ */
/* 4. inFakt                                                           */
/* ------------------------------------------------------------------ */

console.log("\n\x1b[1m=== 4. INFAKT (faktury) ===\x1b[0m");

const infaktUrl = (env.INFAKT_API_URL || "https://api.infakt.pl/api/v3").replace(/\/+$/, "");
const progFaktur = env.INFAKT_START_DATE || "2026-08-24";

if (!env.INFAKT_API_KEY) {
  no("INFAKT_API_KEY — BRAK, faktury nie powstaną (zamówienia przejdą)");
} else {
  ok(`INFAKT_API_KEY ustawione (${opisKlucza(env.INFAKT_API_KEY)})`);
  info(`Adres API: ${infaktUrl}`);
  try {
    const res = await pobierz(`${infaktUrl}/invoices.json?limit=1&offset=0`, {
      headers: { "X-inFakt-ApiKey": env.INFAKT_API_KEY, "Content-Type": "application/json" },
    });
    if (res.status === 401 || res.status === 403) {
      no(`Klucz odrzucony (HTTP ${res.status}) — faktury NIE będą wystawiane`);
    } else if (!res.ok) {
      no(`HTTP ${res.status} przy odczycie listy faktur`);
    } else {
      const dane = await res.json();
      ok(`Dostęp do konta potwierdzony (faktur w inFakcie: ${dane?.metainfo?.total_count ?? "?"})`);
      const ostatnia = dane?.entities?.[0];
      if (ostatnia) info(`Ostatnia faktura: ${ostatnia.number} z ${ostatnia.sale_date}`);
    }
  } catch (e) {
    no(`Brak połączenia z inFaktem (${e.message})`);
  }

  const dzis = new Date().toISOString().slice(0, 10);
  if (progFaktur > dzis) uwaga(`INFAKT_START_DATE = ${progFaktur} jest w przyszłości — każda faktura zostanie pominięta`);
  else ok(`Próg wystawiania faktur: ${progFaktur} (dzisiejsze zamówienia się łapią)`);
}

/* ------------------------------------------------------------------ */
/* Podsumowanie                                                        */
/* ------------------------------------------------------------------ */

console.log("\n\x1b[1m=== PODSUMOWANIE ===\x1b[0m");
if (bledy === 0 && ostrzezenia === 0) console.log("  \x1b[32mWszystko skonfigurowane — sklep może przyjmować zamówienia.\x1b[0m");
else if (bledy === 0) console.log(`  \x1b[33m${ostrzezenia} ostrzeżeń, żadnego błędu blokującego — zamówienia przejdą.\x1b[0m`);
else console.log(`  \x1b[31m${bledy} błędów\x1b[0m i ${ostrzezenia} ostrzeżeń — patrz wyżej.`);
console.log("");
process.exit(0);
