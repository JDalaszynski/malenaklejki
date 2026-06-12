"use server";

import { db } from "@/lib/firebase/admin";

/**
 * Generates a human-readable order number: MNK-YYYYMMDD-XXXX
 */
function generateOrderNumber(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // skip confusable chars
  let suffix = "";
  for (let i = 0; i < 4; i++) {
    suffix += chars[Math.floor(Math.random() * chars.length)];
  }
  return `MNK-${year}${month}${day}-${suffix}`;
}

/**
 * Sends an email via Brevo. Returns true on success.
 */
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

/** Build customer confirmation email HTML */
function buildCustomerEmailHtml(data: any, orderNumber: string): string {
  const deliveryLabel =
    data.deliveryMethod === "paczkomat"
      ? `Paczkomat InPost: <strong>${data.lockerId}</strong><br/>${data.lockerAddress ?? ""}`
      : `Kurier pod drzwi: ${data.street} ${data.building}, ${data.postalCode} ${data.city}`;

  const itemRows = data.items
    .map(
      (item: any, i: number) => `
    <tr>
      <td style="padding: 12px 0; border-bottom: 1px solid #f1f5f9; font-size: 14px; color: #334155; font-weight: 600;">
        Arkusz A4 – ${item.stickersPerSheet} naklejek (${item.widthCm}×${item.heightCm} cm)
      </td>
      <td style="padding: 12px 0; border-bottom: 1px solid #f1f5f9; font-size: 14px; color: #334155; font-weight: 600; text-align: center;">
        ${item.sheetQuantity} szt.
      </td>
      <td style="padding: 12px 0; border-bottom: 1px solid #f1f5f9; font-size: 14px; color: #0f172a; font-weight: 700; text-align: right;">
        ${(item.pricePerSheet * item.sheetQuantity).toFixed(2)} zł
      </td>
    </tr>`
    )
    .join("");

  return `
<!DOCTYPE html>
<html lang="pl">
<head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/></head>
<body style="margin:0;padding:0;background-color:#f0fdf9;font-family:'Inter',system-ui,-apple-system,sans-serif;">
  <div style="max-width:620px;margin:0 auto;padding:32px 16px;">

    <!-- Header -->
    <div style="background:linear-gradient(135deg,#a9e4d7 0%,#6ee7b7 100%);border-radius:24px 24px 0 0;padding:36px 32px;text-align:center;">
      <div style="font-size:32px;font-weight:900;color:#0f172a;letter-spacing:-1px;margin-bottom:4px;">
        Małe<span style="color:#1e293b;">Naklejki</span>
      </div>
      <div style="width:40px;height:3px;background:#0f172a;opacity:0.2;border-radius:2px;margin:8px auto 16px;"></div>
      <h1 style="color:#0f172a;margin:0;font-size:22px;font-weight:800;">
       Zamówienie przyjęte!
      </h1>
      <p style="color:#1e293b;opacity:0.75;margin:8px 0 0;font-size:14px;font-weight:500;">
        Dziękujemy! Twoje naklejki są już w produkcji.
      </p>
    </div>

    <!-- Body -->
    <div style="background:#ffffff;padding:32px;border-left:1px solid #e2e8f0;border-right:1px solid #e2e8f0;">

      <p style="font-size:16px;color:#334155;font-weight:600;margin-top:0;">
        Cześć <strong>${data.firstName}</strong>! 👋
      </p>
      <p style="font-size:14px;color:#64748b;line-height:1.7;margin-bottom:24px;">
        Twoje zamówienie zostało przyjęte i trafiło do realizacji.
        Gdy Twoja paczka zostanie nadana, wyślemy Ci potwierdzenie z numerem śledzenia.
      </p>

      <!-- Order number badge -->
      <div style="background:linear-gradient(135deg,#f0fdf9 0%,#ecfdf5 100%);border:1.5px solid #a9e4d7;border-radius:16px;padding:20px 24px;margin-bottom:28px;text-align:center;">
        <p style="font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:2px;color:#64748b;margin:0 0 6px;">
          Numer zamówienia
        </p>
        <p style="font-size:26px;font-weight:900;color:#0f172a;font-family:monospace;letter-spacing:2px;margin:0;">
          ${orderNumber}
        </p>
      </div>

      <!-- Items table -->
      <h2 style="font-size:14px;font-weight:800;text-transform:uppercase;letter-spacing:1px;color:#94a3b8;margin-bottom:12px;margin-top:0;">
        Zamówione produkty
      </h2>
      <table style="width:100%;border-collapse:collapse;margin-bottom:24px;">
        <thead>
          <tr>
            <th style="text-align:left;font-size:11px;font-weight:700;color:#94a3b8;text-transform:uppercase;letter-spacing:0.5px;padding-bottom:8px;">Produkt</th>
            <th style="text-align:center;font-size:11px;font-weight:700;color:#94a3b8;text-transform:uppercase;letter-spacing:0.5px;padding-bottom:8px;">Ilość</th>
            <th style="text-align:right;font-size:11px;font-weight:700;color:#94a3b8;text-transform:uppercase;letter-spacing:0.5px;padding-bottom:8px;">Cena</th>
          </tr>
        </thead>
        <tbody>${itemRows}</tbody>
      </table>

      <!-- Totals -->
      <div style="background:#f8fafc;border-radius:12px;border:1px solid #e2e8f0;padding:16px 20px;margin-bottom:24px;">
        <div style="display:flex;justify-content:space-between;margin-bottom:8px;">
          <span style="font-size:14px;color:#64748b;font-weight:500;">Naklejki</span>
          <span style="font-size:14px;color:#0f172a;font-weight:700;">${data.subtotal.toFixed(2)} zł</span>
        </div>
        <div style="display:flex;justify-content:space-between;margin-bottom:12px;">
          <span style="font-size:14px;color:#64748b;font-weight:500;">Dostawa</span>
          <span style="font-size:14px;color:#0f172a;font-weight:700;">${data.shippingCost.toFixed(2)} zł</span>
        </div>
        <div style="border-top:1px solid #e2e8f0;padding-top:12px;display:flex;justify-content:space-between;">
          <span style="font-size:16px;color:#0f172a;font-weight:800;">Razem</span>
          <span style="font-size:18px;color:#0f172a;font-weight:900;">${data.total.toFixed(2)} zł</span>
        </div>
      </div>

      <!-- Delivery info -->
      <h2 style="font-size:14px;font-weight:800;text-transform:uppercase;letter-spacing:1px;color:#94a3b8;margin-bottom:12px;">
        Adres dostawy
      </h2>
      <div style="background:#f8fafc;border-radius:12px;border:1px solid #e2e8f0;padding:16px 20px;margin-bottom:24px;">
        <p style="font-size:14px;color:#334155;font-weight:600;margin:0;line-height:1.7;">
          ${data.firstName} ${data.lastName}<br/>
          ${deliveryLabel}
        </p>
      </div>

      <p style="font-size:13px;color:#94a3b8;line-height:1.7;margin-bottom:0;">
        Masz pytania dotyczące zamówienia? Napisz do nas na
        <a href="mailto:kontakt@malenaklejki.pl" style="color:#a9e4d7;font-weight:700;text-decoration:none;">kontakt@malenaklejki.pl</a>
        podając numer zamówienia.
      </p>
    </div>

    <!-- Footer -->
    <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:0 0 24px 24px;padding:20px 32px;text-align:center;border-top:none;">
      <p style="font-size:12px;color:#94a3b8;margin:0 0 4px;">
        © ${new Date().getFullYear()} MałeNaklejki · <a href="https://malenaklejki.pl" style="color:#a9e4d7;text-decoration:none;">malenaklejki.pl</a>
      </p>
      <p style="font-size:11px;color:#cbd5e1;margin:0;">
        To jest automatyczne potwierdzenie zamówienia. Nie odpowiadaj na ten email.
      </p>
    </div>
  </div>
</body>
</html>`;
}

/** Build seller notification email HTML */
function buildSellerEmailHtml(data: any, orderNumber: string): string {
  const deliveryLabel =
    data.deliveryMethod === "paczkomat"
      ? `Paczkomat InPost: ${data.lockerId} — ${data.lockerAddress ?? ""}`
      : `Kurier: ${data.street} ${data.building}, ${data.postalCode} ${data.city}`;

  const itemRows = data.items
    .map(
      (item: any, i: number) => `
    <tr>
      <td style="padding:10px 0;border-bottom:1px solid #f1f5f9;font-size:13px;color:#334155;">${i + 1}. Arkusz A4 – ${item.stickersPerSheet} naklejek (${item.widthCm}×${item.heightCm?.toFixed ? item.heightCm.toFixed(1) : item.heightCm} cm)</td>
      <td style="padding:10px 0;border-bottom:1px solid #f1f5f9;font-size:13px;color:#334155;text-align:center;">${item.sheetQuantity} szt.</td>
      <td style="padding:10px 0;border-bottom:1px solid #f1f5f9;font-size:13px;font-weight:700;color:#0f172a;text-align:right;">${(item.pricePerSheet * item.sheetQuantity).toFixed(2)} zł</td>
    </tr>`
    )
    .join("");

  return `
<!DOCTYPE html>
<html lang="pl">
<head><meta charset="UTF-8"/></head>
<body style="margin:0;padding:0;background:#f0fdf9;font-family:'Inter',system-ui,-apple-system,sans-serif;">
  <div style="max-width:660px;margin:0 auto;padding:32px 16px;">

    <!-- Header -->
    <div style="background:linear-gradient(135deg,#0f172a 0%,#1e293b 100%);border-radius:24px 24px 0 0;padding:28px 32px;text-align:center;">
      <div style="font-size:14px;font-weight:800;text-transform:uppercase;letter-spacing:3px;color:#a9e4d7;margin-bottom:8px;">
        MałeNaklejki · Panel Sprzedawcy
      </div>
      <h1 style="color:#ffffff;margin:0;font-size:22px;font-weight:900;">
        🛒 Nowe zamówienie!
      </h1>
    </div>

    <!-- Body -->
    <div style="background:#ffffff;padding:32px;border:1px solid #e2e8f0;border-top:none;">

      <!-- Order badge -->
      <div style="background:linear-gradient(135deg,#f0fdf9,#ecfdf5);border:2px solid #a9e4d7;border-radius:16px;padding:18px 24px;margin-bottom:28px;text-align:center;">
        <p style="font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:2px;color:#64748b;margin:0 0 4px;">Numer zamówienia</p>
        <p style="font-size:28px;font-weight:900;color:#0f172a;font-family:monospace;letter-spacing:2px;margin:0;">${orderNumber}</p>
        <p style="font-size:12px;color:#64748b;margin:6px 0 0;">${new Date().toLocaleString("pl-PL", { timeZone: "Europe/Warsaw" })}</p>
      </div>

      <!-- Customer info -->
      <h2 style="font-size:13px;font-weight:800;text-transform:uppercase;letter-spacing:1px;color:#94a3b8;margin-bottom:10px;margin-top:0;">Dane klienta</h2>
      <div style="background:#f8fafc;border-radius:12px;border:1px solid #e2e8f0;padding:16px 20px;margin-bottom:24px;">
        <table style="width:100%;border-collapse:collapse;">
          <tr>
            <td style="font-size:13px;color:#64748b;padding:4px 0;font-weight:600;width:130px;">Imię i nazwisko:</td>
            <td style="font-size:13px;color:#0f172a;padding:4px 0;font-weight:700;">${data.firstName} ${data.lastName}</td>
          </tr>
          <tr>
            <td style="font-size:13px;color:#64748b;padding:4px 0;font-weight:600;">E-mail:</td>
            <td style="font-size:13px;color:#0f172a;padding:4px 0;font-weight:700;">${data.email}</td>
          </tr>
          <tr>
            <td style="font-size:13px;color:#64748b;padding:4px 0;font-weight:600;">Telefon:</td>
            <td style="font-size:13px;color:#0f172a;padding:4px 0;font-weight:700;">${data.phone}</td>
          </tr>
          <tr>
            <td style="font-size:13px;color:#64748b;padding:4px 0;font-weight:600;">Dostawa:</td>
            <td style="font-size:13px;color:#0f172a;padding:4px 0;font-weight:700;">${deliveryLabel}</td>
          </tr>
          ${data.wantsInvoice ? `
          <tr>
            <td style="font-size:13px;color:#64748b;padding:4px 0;font-weight:600;">Faktura VAT:</td>
            <td style="font-size:13px;color:#0f172a;padding:4px 0;font-weight:700;">${data.companyName} · NIP: ${data.nip}</td>
          </tr>` : ""}
        </table>
      </div>

      <!-- Items -->
      <h2 style="font-size:13px;font-weight:800;text-transform:uppercase;letter-spacing:1px;color:#94a3b8;margin-bottom:10px;">Zamówione produkty</h2>
      <table style="width:100%;border-collapse:collapse;margin-bottom:24px;">
        <thead>
          <tr>
            <th style="text-align:left;font-size:11px;font-weight:700;color:#94a3b8;text-transform:uppercase;padding-bottom:8px;">Produkt</th>
            <th style="text-align:center;font-size:11px;font-weight:700;color:#94a3b8;text-transform:uppercase;padding-bottom:8px;">Ilość</th>
            <th style="text-align:right;font-size:11px;font-weight:700;color:#94a3b8;text-transform:uppercase;padding-bottom:8px;">Cena</th>
          </tr>
        </thead>
        <tbody>${itemRows}</tbody>
      </table>

      <!-- Totals -->
      <div style="background:#f0fdf9;border-radius:12px;border:1.5px solid #a9e4d7;padding:16px 20px;margin-bottom:24px;">
        <div style="display:flex;justify-content:space-between;margin-bottom:8px;">
          <span style="font-size:13px;color:#64748b;">Naklejki</span>
          <span style="font-size:13px;font-weight:700;color:#0f172a;">${data.subtotal.toFixed(2)} zł</span>
        </div>
        <div style="display:flex;justify-content:space-between;margin-bottom:12px;">
          <span style="font-size:13px;color:#64748b;">Dostawa</span>
          <span style="font-size:13px;font-weight:700;color:#0f172a;">${data.shippingCost.toFixed(2)} zł</span>
        </div>
        <div style="border-top:1px solid #a9e4d7;padding-top:12px;display:flex;justify-content:space-between;">
          <span style="font-size:16px;font-weight:800;color:#0f172a;">Do zapłaty</span>
          <span style="font-size:20px;font-weight:900;color:#0f172a;">${data.total.toFixed(2)} zł</span>
        </div>
      </div>
    </div>

    <!-- Footer -->
    <div style="background:#f8fafc;border:1px solid #e2e8f0;border-top:none;border-radius:0 0 24px 24px;padding:16px 32px;text-align:center;">
      <p style="font-size:12px;color:#94a3b8;margin:0;">
        MałeNaklejki · System zarządzania zamówieniami · ${new Date().getFullYear()}
      </p>
    </div>
  </div>
</body>
</html>`;
}

export async function createOrder(data: any) {
  try {
    // 1. Generate unique order number
    const orderNumber = generateOrderNumber();

    // 2. Create Firestore Document
    const orderRef = db.collection("orders").doc();

    const orderData = {
      id: orderRef.id,
      orderNumber,
      status: "PENDING_PAYMENT",
      createdAt: new Date().toISOString(),
      customer: {
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone,
      },
      delivery: {
        method: data.deliveryMethod,
        courierDetails:
          data.deliveryMethod === "kurier"
            ? {
              street: data.street,
              building: data.building,
              city: data.city,
              postalCode: data.postalCode,
            }
            : null,
        paczkomatDetails:
          data.deliveryMethod === "paczkomat"
            ? {
              lockerId: data.lockerId,
              address: data.lockerAddress,
            }
            : null,
      },
      billing: {
        wantsInvoice: data.wantsInvoice,
        nip: data.wantsInvoice ? data.nip : null,
        companyName: data.wantsInvoice ? data.companyName : null,
      },
      items: data.items,
      totals: {
        subtotal: data.subtotal,
        shipping: data.shippingCost,
        total: data.total,
      },
    };

    await orderRef.set(orderData);

    // 3. Build PDF attachments for seller email
    const attachments: Array<{ content: string; name: string; type: string }> = [];
    if (data.pdfAttachments && Array.isArray(data.pdfAttachments)) {
      for (const att of data.pdfAttachments) {
        // Prepend order number to the file name
        const prefix = orderNumber.replace(/[^a-zA-Z0-9-]/g, "_");
        const attachmentName = `${prefix}-${att.name}`;
        attachments.push({
          content: att.base64, // base64 string
          name: attachmentName,
          type: "application/pdf",
        });
      }
    }

    const adminEmail = process.env.ADMIN_EMAIL || "kontakt@malenaklejki.pl";
    const siteFromEmail = adminEmail;

    // 4. Send customer confirmation email
    const customerEmailPayload = {
      sender: { name: "MałeNaklejki", email: siteFromEmail },
      to: [{ email: data.email, name: `${data.firstName} ${data.lastName}` }],
      subject: `Potwierdzenie zamówienia ${orderNumber} – MałeNaklejki`,
      htmlContent: buildCustomerEmailHtml(data, orderNumber),
    };
    await sendEmail(customerEmailPayload);

    // 5. Send seller notification email (with PDF attachments)
    const sellerEmailPayload: any = {
      sender: { name: "MałeNaklejki – System zamówień", email: siteFromEmail },
      to: [{ email: adminEmail, name: "MałeNaklejki – Sprzedawca" }],
      subject: `🛒 Nowe zamówienie ${orderNumber} – ${data.firstName} ${data.lastName} (${data.total.toFixed(2)} zł)`,
      htmlContent: buildSellerEmailHtml(data, orderNumber),
    };
    if (attachments.length > 0) {
      sellerEmailPayload.attachment = attachments;
    }
    await sendEmail(sellerEmailPayload);

    return {
      success: true,
      orderId: orderRef.id,
      orderNumber,
    };
  } catch (error: any) {
    console.error("createOrder error:", error);
    return { success: false, error: error.message };
  }
}
