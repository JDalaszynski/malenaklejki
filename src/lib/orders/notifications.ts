import "server-only";

import { buildCustomerEmailHtml, buildSellerEmailHtml, buildOrderAttachments } from "@/lib/emails";
import { sendTransactionalEmail } from "@/lib/email/auth";

/**
 * Powiadomienia wysyłane po zaksięgowaniu płatności.
 *
 * Ta sama ścieżka obsługuje webhook Przelewy24 i ręczne oznaczenie zamówienia
 * jako opłacone w panelu — dzięki temu przelew tradycyjny i sprzedaż z Vinted
 * kończą się dokładnie tym samym zestawem wiadomości co płatność online.
 */
export async function sendPaidOrderNotifications(
  order: FirebaseFirestore.DocumentData,
  options: { orderId: string; withAttachments?: boolean } 
): Promise<void> {
  const adminEmail = process.env.ADMIN_EMAIL || "kontakt@malenaklejki.pl";
  const appUrl = (process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000").replace(/\/+$/, "");

  // Gość dostaje w potwierdzeniu propozycję zamiany zamówienia w konto.
  const claimUrl = order.userId
    ? undefined
    : `${appUrl}/zamowienie-sukces?orderNumber=${encodeURIComponent(order.orderNumber)}&orderId=${options.orderId}&konto=1`;

  if (order.customer?.email) {
    await sendTransactionalEmail({
      sender: { name: "MałeNaklejki", email: adminEmail },
      to: [
        {
          email: order.customer.email,
          name: `${order.customer.firstName ?? ""} ${order.customer.lastName ?? ""}`.trim(),
        },
      ],
      subject: `Opłacono zamówienie ${order.orderNumber} - MałeNaklejki`,
      htmlContent: buildCustomerEmailHtml(order, order.orderNumber, claimUrl),
    });
  }

  const sellerPayload: Record<string, unknown> = {
    sender: { name: "MałeNaklejki - System zamówień", email: adminEmail },
    to: [{ email: adminEmail, name: "MałeNaklejki - Sprzedawca" }],
    subject: `🛒 Zamówienie OPŁACONE ${order.orderNumber} - ${order.customer?.firstName ?? ""} ${order.customer?.lastName ?? ""} (${(order.totals?.total ?? 0).toFixed(2).replace(".", ",")} zł)`,
    htmlContent: buildSellerEmailHtml(order, order.orderNumber),
  };

  if (options.withAttachments !== false) {
    const attachments = await buildOrderAttachments(order.items ?? [], order.orderNumber);
    if (attachments.length > 0) sellerPayload.attachment = attachments;
  }

  await sendTransactionalEmail(sellerPayload);
}
