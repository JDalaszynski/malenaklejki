import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/firebase/admin";
import { getTransactionBySessionId } from "@/lib/p24";
import { sweepAbandonedOrders } from "@/lib/orders/sweep";
import { buildUnpaidOrderSellerEmailHtml } from "@/lib/emails";
import { issueInvoiceForOrderSafely } from "@/lib/orders/invoicing";
import { sendPaidOrderNotifications } from "@/lib/orders/notifications";

export const dynamic = "force-dynamic";
// Wystawienie faktury w inFakcie to kilka sekund odpytywania o status zlecenia,
// a przy okazji nadrabiamy tu maile z arkuszami w załączniku.
export const maxDuration = 60;

async function sendEmail(payload: object): Promise<boolean> {
  const apiKey = process.env.BREVO_API_KEY;
  if (!apiKey) {
    console.error("BREVO_API_KEY is not set");
    return false;
  }
  const response = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      "api-key": apiKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    const text = await response.text();
    console.error("Brevo error:", response.status, text);
    return false;
  }
  return true;
}

/** Ile dni wstecz szukamy opłaconych zamówień bez wysłanego powiadomienia. */
const NOTIFICATION_LOOKBACK_DAYS = 3;

/**
 * Data wdrożenia znacznika `paidNotificationsSentAt`. Zamówienia opłacone
 * wcześniej znacznika nie mają, choć maile dostały — bez tego progu pierwszy
 * przebieg crona wysłałby je drugi raz.
 */
const NOTIFICATIONS_START_DATE = process.env.PAID_NOTIFICATIONS_START_DATE || "2026-08-27";

/**
 * Dosyła powiadomienia o płatności do zamówień, przy których webhook zdążył
 * ustawić PAID, ale przerwał się przed mailem.
 */
async function resendMissedPaidNotifications(): Promise<number> {
  const lookback = new Date(Date.now() - NOTIFICATION_LOOKBACK_DAYS * 24 * 60 * 60 * 1000).toISOString();
  const since = lookback > NOTIFICATIONS_START_DATE ? lookback : NOTIFICATIONS_START_DATE;

  const snapshot = await db
    .collection("orders")
    .where("status", "==", "PAID")
    .where("paidAt", ">=", since)
    .get();

  let sent = 0;
  for (const doc of snapshot.docs) {
    const order = doc.data();
    if (order.paidNotificationsSentAt) continue;

    console.log(`[Cron] Dosyłanie powiadomienia o płatności: ${order.orderNumber}`);
    try {
      await sendPaidOrderNotifications(order, { orderId: doc.id });
      sent += 1;
    } catch (error) {
      console.error(`[Cron] Nie udało się dosłać powiadomienia dla ${doc.id}:`, error);
    }
  }

  return sent;
}

export async function GET(req: NextRequest) {
  try {
    // 1. Zabezpieczenie endpointu w produkcji.
    //
    // Wcześniej warunek wymagał, żeby `CRON_SECRET` był ustawiony — przy braku
    // zmiennej cała kontrola była pomijana i endpoint stawał się publiczny.
    // A wywołuje on wysyłkę maili do klientów i do sprzedawcy (z załącznikami),
    // więc każdy mógł nim generować ruch na koncie Brevo. Teraz brak sekretu
    // na produkcji blokuje wywołanie zamiast je przepuszczać.
    const cronSecret = process.env.CRON_SECRET;
    const authHeader = req.headers.get("Authorization");

    if (process.env.NODE_ENV === "production") {
      if (!cronSecret) {
        console.error("CRON_SECRET nie jest ustawiony — endpoint Cron zablokowany.");
        return NextResponse.json({ error: "Not configured" }, { status: 503 });
      }
      if (authHeader !== `Bearer ${cronSecret}`) {
        console.warn("Próba nieautoryzowanego wywołania endpointu Cron.");
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
    }

    console.log("Uruchamianie Cron: Sprawdzanie nieopłaconych zamówień...");

    // Najpierw sprzątamy zamówienia porzucone przed wybraniem formy płatności —
    // nigdy nie zostaną opłacone, więc nie ma po co ich dalej sprawdzać.
    const sweep = await sweepAbandonedOrders();
    if (sweep.moved > 0) {
      console.log(`Cron: przeniesiono do kosza ${sweep.moved} porzuconych zamówień.`);
    }

    // 2. Pobranie zamówień oczekujących na płatność
    const ordersSnap = await db.collection("orders")
      .where("status", "==", "PENDING_PAYMENT")
      .get();

    const now = new Date();
    const timeThreshold = new Date(now.getTime() - 25 * 60 * 1000); // 25 minut temu

    const unpaidOrders: any[] = [];
    ordersSnap.forEach((doc) => {
      const data = doc.data();
      const createdAt = new Date(data.createdAt);
      const paymentMethod = data.payment?.method || data.paymentMethod;

      // Only check automatic payment methods (przelewy24, blik)
      if (
        createdAt < timeThreshold &&
        !data.failureNotificationSent &&
        (paymentMethod === "przelewy24" || paymentMethod === "blik")
      ) {
        unpaidOrders.push({ id: doc.id, ...data });
      }
    });

    console.log(`Znaleziono ${unpaidOrders.length} potencjalnie nieopłaconych zamówień.`);

    const adminEmail = process.env.ADMIN_EMAIL || "kontakt@malenaklejki.pl";
    const siteFromEmail = adminEmail;

    for (const order of unpaidOrders) {
      console.log(`Analizowanie zamówienia ${order.orderNumber} (ID: ${order.id})...`);
      
      let isActuallyPaid = false;
      let p24OrderId = null;

      // Ponowna próba płatności zakłada w P24 nową sesję (`<id>_retry<czas>`),
      // więc pierwotne ID pokazywałoby wtedy nieopłaconą sesję i opłacone
      // zamówienie dostawałoby alert o braku wpłaty. Sprawdzamy wszystkie sesje.
      const sessionIds: string[] = [
        order.id,
        ...((order.p24SessionIds as string[] | undefined) ?? []),
      ].filter((value, index, all) => all.indexOf(value) === index);

      for (const sessionId of sessionIds) {
        try {
          const p24Tx = await getTransactionBySessionId(sessionId);

          // P24 uznaje transakcję za opłaconą, gdy nada jej numer (`orderId`)
          // albo ustawi status wpłaty (1 = zaliczka, 2 = opłacona w całości).
          if (p24Tx && ((p24Tx.orderId && p24Tx.orderId > 0) || Number(p24Tx.status) >= 1)) {
            isActuallyPaid = true;
            p24OrderId = p24Tx.orderId ?? null;
            break;
          }
        } catch (err) {
          console.error(`Błąd pobierania szczegółów z P24 dla sesji ${sessionId}:`, err);
        }
      }

      const orderRef = db.collection("orders").doc(order.id);

      if (isActuallyPaid) {
        console.log(`[Cron Fallback] Zamówienie ${order.orderNumber} jest opłacone w P24 (P24 ID: ${p24OrderId}). Aktualizacja statusu na PAID.`);
        
        // Zmień status na PAID
        await orderRef.update({
          status: "PAID",
          paidAt: new Date().toISOString(),
          p24OrderId: p24OrderId,
          // Płatność odnaleziona po czasie wyjmuje zamówienie z kosza.
          deletedAt: null,
        });

        // Maile najpierw — faktura potrafi zająć kilkanaście sekund i nie może
        // zabrać czasu powiadomieniu o płatności.
        await sendPaidOrderNotifications({ ...order, status: "PAID" }, { orderId: order.id });

        // Faktura w inFakcie — płatność odnaleziona po czasie księguje się tak samo.
        await issueInvoiceForOrderSafely(order.id);

      } else {
        console.log(`Zamówienie ${order.orderNumber} NIE zostało opłacone. Oznaczanie jako PAYMENT_FAILED i wysyłanie alertu.`);

        // Zmień status na PAYMENT_FAILED i ustaw flagę powiadomienia
        await orderRef.update({
          status: "PAYMENT_FAILED",
          failureNotificationSent: true,
          paymentFailedAt: new Date().toISOString(),
        });

        // Wyślij e-mail o braku płatności do sprzedawcy
        const unpaidEmailPayload = {
          sender: { name: "MałeNaklejki - Alert płatności", email: siteFromEmail },
          to: [{ email: adminEmail, name: "MałeNaklejki - Sprzedawca" }],
          subject: `⚠️ Brak płatności dla zamówienia ${order.orderNumber} (${order.totals.total.toFixed(2).replace('.', ',')} zł)`,
          htmlContent: buildUnpaidOrderSellerEmailHtml(order, order.orderNumber),
        };
        await sendEmail(unpaidEmailPayload);
      }
    }

    // 3. Nadrobienie powiadomień o płatności.
    //
    // Webhook potrafi ustawić PAID, a potem paść (albo zostać ubity przez limit
    // czasu funkcji) przed wysyłką maili — zamówienie wypada wtedy z listy
    // nieopłaconych i nikt się o wpłacie nie dowiaduje. Znacznik
    // `paidNotificationsSentAt` pokazuje, przy których zamówieniach mail
    // faktycznie poszedł.
    // Osobne zabezpieczenie: zapytanie potrzebuje złożonego indeksu
    // (`status` + `paidAt`). Dopóki go nie ma, dosyłanie po prostu nie działa —
    // ale nie może przez to przewrócić głównej części zadania.
    let missedNotifications = 0;
    try {
      missedNotifications = await resendMissedPaidNotifications();
    } catch (error) {
      console.error("[Cron] Dosyłanie powiadomień o płatności nie powiodło się:", error);
    }

    return NextResponse.json({
      success: true,
      processedCount: unpaidOrders.length,
      missedNotifications,
    });
  } catch (error: any) {
    console.error("Cron Job Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
