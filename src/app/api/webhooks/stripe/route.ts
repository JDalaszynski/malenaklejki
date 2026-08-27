import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe/server";
import { db } from "@/lib/firebase/admin";
import { sendCustomerConfirmationEmail, sendAdminFulfillmentAlert } from "@/lib/email/brevo";
import { issueInvoiceForOrderSafely } from "@/lib/orders/invoicing";

// Wystawienie faktury w inFakcie to kilka sekund odpytywania o status zlecenia.
export const maxDuration = 60;

export async function POST(req: Request) {
  const body = await req.text();
  const signature = (await headers()).get("Stripe-Signature") as string;

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (error: any) {
    console.error("Webhook Error:", error.message);
    return new NextResponse(`Webhook Error: ${error.message}`, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as any;
    const orderId = session.client_reference_id;

    if (!orderId) {
      console.error("Missing client_reference_id in session");
      return new NextResponse("Missing client_reference_id", { status: 400 });
    }

    try {
      const orderRef = db.collection("orders").doc(orderId);
      const orderSnapshot = await orderRef.get();

      if (!orderSnapshot.exists) {
        console.error("Order not found in Firestore:", orderId);
        return new NextResponse("Order not found", { status: 404 });
      }

      const orderData = orderSnapshot.data();

      if (!orderData) {
        console.error("Order data is missing for:", orderId);
        return new NextResponse("Order data is missing", { status: 404 });
      }
      // Update order status to PAID
      await orderRef.update({
        status: "PAID",
        paidAt: new Date().toISOString(),
        stripeSessionId: session.id,
      });

      console.log(`Order ${orderId} marked as PAID.`);

      // Maile idą przed fakturą — wystawianie w inFakcie trwa kilkanaście sekund
      // i przy dłuższej odpowiedzi potrafi zabrać funkcji czas na powiadomienia.
      await sendCustomerConfirmationEmail(orderData);
      await sendAdminFulfillmentAlert(orderData);

      // Płatności celowo nie przenosimy do BaseLinkera — zamówienie ma tam
      // zostać nieopłacone, sprzedawca księguje wpłatę ręcznie.

      // Faktura w inFakcie — ta sama ścieżka co przy płatności przez Przelewy24.
      await issueInvoiceForOrderSafely(orderId);

    } catch (error) {
      console.error("Error processing webhook:", error);
      return new NextResponse("Internal Server Error", { status: 500 });
    }
  }

  return new NextResponse(null, { status: 200 });
}
