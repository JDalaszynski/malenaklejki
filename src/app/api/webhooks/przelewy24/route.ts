import { NextRequest, NextResponse } from "next/server";
import { verifyWebhookSignature, verifyTransaction } from "@/lib/p24";
import { db } from "@/lib/firebase/admin";
import { sendPaidOrderNotifications } from "@/lib/orders/notifications";
import { issueInvoiceForOrderSafely } from "@/lib/orders/invoicing";

export const dynamic = "force-dynamic";
// Wystawienie faktury w inFakcie to kilka sekund odpytywania o status zlecenia,
// a maile do sprzedawcy niosą arkusze do druku. Budżet z zapasem, żeby funkcja
// nie została ubita w połowie — wcześniej gubiła w ten sposób maile o płatności.
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    console.log("P24 Webhook Received:", body);

    // 1. Sprawdzenie sygnatury z webhooka
    if (!verifyWebhookSignature(body)) {
      console.error("Nieprawidłowa sygnatura webhooka P24");
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    const sessionId = body.sessionId; // to nasz orderRef.id, lub orderRef.id + "_retry..."
    const orderIdFromSession = sessionId.split('_')[0];
    const orderId = body.orderId;
    const amount = body.amount;
    const currency = body.currency;

    // 2. Weryfikacja transakcji w P24 (wymagane przez API P24 by zakończyć płatność)
    try {
      await verifyTransaction({
        sessionId,
        orderId,
        amount,
        currency,
      });
      console.log(`P24: Transakcja ${sessionId} zweryfikowana pomyślnie`);
    } catch (e: any) {
      console.error(`P24: Błąd weryfikacji transakcji ${sessionId}:`, e);
      return NextResponse.json({ error: "Verification failed" }, { status: 400 });
    }

    // 3. Aktualizacja zamówienia w Firestore
    const orderRef = db.collection("orders").doc(orderIdFromSession);
    const orderSnap = await orderRef.get();

    if (!orderSnap.exists) {
      console.error(`P24: Zamówienie ${sessionId} nie istnieje w bazie.`);
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const orderData = orderSnap.data()!;
    // Duplikat od P24 pomijamy tylko, jeśli mail o płatności faktycznie poszedł.
    // Sam `status === "PAID"` to za mało: poprzednie wywołanie mogło ustawić
    // status i zostać ubite (limit czasu, zawieszony fetch) tuż przed wysyłką
    // maila — wtedy każdy kolejny retry P24 trafiałby w tę gałąź i mail nigdy
    // by nie poszedł, mimo ponawianych webhooków.
    if (orderData.status === "PAID" && orderData.paidNotificationsSentAt) {
      console.log(`P24: Zamówienie ${sessionId} jest już opłacone i powiadomione.`);
      return NextResponse.json({ status: "ok" }, { status: 200 }); // Ignorujemy duplikaty
    }

    if (orderData.status !== "PAID") {
      await orderRef.update({
        status: "PAID",
        paidAt: new Date().toISOString(),
        p24OrderId: orderId,
        // Spóźniona płatność wyjmuje zamówienie z kosza. Nieopłacone zamówienia
        // trafiają tam po tygodniu, a przelew tradycyjny bywa księgowany później —
        // bez tego opłacone zamówienie zostałoby w koszu i wypadło z ewidencji.
        deletedAt: null,
      });
      console.log(`P24: Zamówienie ${sessionId} oznaczone jako PAID.`);
    } else {
      console.log(`P24: Zamówienie ${sessionId} już PAID, ale bez potwierdzenia wysyłki — ponawiam powiadomienia.`);
    }

    // Najpierw maile, dopiero potem faktura.
    //
    // Odwrotna kolejność kosztowała nas powiadomienia o płatności: wystawianie
    // faktury to kilkanaście sekund odpytywania inFaktu, więc funkcja bywała
    // ubijana zanim doszła do wysyłki i sprzedawcy zostawał w skrzynce wyłącznie
    // mail o zamówieniu oczekującym na płatność.
    await sendPaidOrderNotifications({ ...orderData, status: "PAID" }, { orderId: orderIdFromSession });

    // Płatności celowo nie przenosimy do BaseLinkera — zamówienie ma tam
    // zostać nieopłacone, sprzedawca księguje wpłatę ręcznie.

    // Faktura w inFakcie — wystawiana automatycznie za każde opłacone zamówienie.
    await issueInvoiceForOrderSafely(orderIdFromSession);

    return NextResponse.json({ status: "ok" }, { status: 200 });

  } catch (error) {
    console.error("P24 Webhook error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
