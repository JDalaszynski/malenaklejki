import { escapeHtml } from "./utils/sanitize";
import sharp from "sharp";


/** Build customer confirmation email HTML */
export function buildCustomerEmailHtml(data: any, orderNumber: string): string {
  const safeFirstName = escapeHtml(data.firstName || data.customer?.firstName || "");
  const safeLastName = escapeHtml(data.lastName || data.customer?.lastName || "");
  const safeStreet = escapeHtml(data.street || data.delivery?.courierDetails?.street || "");
  const safeBuilding = escapeHtml(data.building || data.delivery?.courierDetails?.building || "");
  const safeCity = escapeHtml(data.city || data.delivery?.courierDetails?.city || "");
  const safePostalCode = escapeHtml(data.postalCode || data.delivery?.courierDetails?.postalCode || "");
  const safeLockerId = escapeHtml(data.lockerId || data.delivery?.paczkomatDetails?.lockerId || "");
  const safeLockerAddress = escapeHtml(data.lockerAddress || data.delivery?.paczkomatDetails?.address || "");

  const deliveryMethod = data.deliveryMethod || data.delivery?.method;
  const paymentMethod = data.paymentMethod || data.payment?.method;
  const isVinted = paymentMethod === "vinted" || deliveryMethod === "vinted";

  const subtotal = data.subtotal ?? data.totals?.subtotal ?? 0;
  const shippingCost = data.shippingCost ?? data.totals?.shipping ?? 0;
  const total = data.total ?? data.totals?.total ?? 0;

  const deliveryLabel =
    deliveryMethod === "paczkomat"
      ? `Paczkomat InPost: <strong>${safeLockerId}</strong><br/>${safeLockerAddress}`
      : `Kurier pod drzwi: ${safeStreet} ${safeBuilding}, ${safePostalCode} ${safeCity}`;

  const itemRows = (data.items || [])
    .map(
      (item: any, i: number) => `
    <tr>
      <td style="padding: 12px 0; border-bottom: 1px solid #f1f5f9; font-size: 14px; color: #334155; font-weight: 600;">
        Zestaw – ${item.stickersPerSheet} naklejek (${String(item.widthCm).replace('.', ',')}×${String(item.heightCm).replace('.', ',')} cm)<br/>
        <span style="font-size: 12px; color: #64748b; font-weight: 500;">
          Sposób dostarczenia: ${item.deliveryForm === "individual" ? "Pocięte na sztuki (pojedyncze)" : "W jednym arkuszu A4"}
        </span>
      </td>
      <td style="padding: 12px 0; border-bottom: 1px solid #f1f5f9; font-size: 14px; color: #334155; font-weight: 600; text-align: center;">
        ${item.sheetQuantity} szt.
      </td>
      <td style="padding: 12px 0; border-bottom: 1px solid #f1f5f9; font-size: 14px; color: #0f172a; font-weight: 700; text-align: right;">
        ${(item.pricePerSheet * item.sheetQuantity).toFixed(2).replace('.', ',')} zł
      </td>
    </tr>`
    )
    .join("");

  return `
<!DOCTYPE html>
<html lang="pl">
<head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/></head>
<body style="margin:0;padding:0;background-color:#f4faf7;font-family:'Inter',system-ui,-apple-system,sans-serif;">
  <div style="max-width:620px;margin:0 auto;padding:32px 16px;">

    <!-- Header -->
    <div style="background:linear-gradient(135deg,#02af7a 0%,#004749 100%);border-radius:24px 24px 0 0;padding:36px 32px;text-align:center;">
      <div style="font-size:32px;font-weight:900;color:#ffffff;letter-spacing:-1px;margin-bottom:4px;">
        Małe<span style="color:#f4faf7;">Naklejki</span>
      </div>
      <div style="width:40px;height:3px;background:#ffffff;opacity:0.2;border-radius:2px;margin:8px auto 16px;"></div>
      <h1 style="color:#ffffff;margin:0;font-size:22px;font-weight:800;">
       Zamówienie przyjęte i opłacone!
      </h1>
      <p style="color:#ffffff;opacity:0.85;margin:8px 0 0;font-size:14px;font-weight:500;">
        Dziękujemy! Twoje naklejki wkrótce trafią do produkcji.
      </p>
    </div>

    <!-- Body -->
    <div style="background:#ffffff;padding:32px;border-left:1px solid #e2e8f0;border-right:1px solid #e2e8f0;">

      <p style="font-size:16px;color:#334155;font-weight:600;margin-top:0;">
        Cześć <strong>${safeFirstName}</strong>! 👋
      </p>
      <p style="font-size:14px;color:#64748b;line-height:1.7;margin-bottom:24px;">
        Otrzymaliśmy płatność za Twoje zamówienie. Gdy paczka zostanie nadana, wyślemy Ci potwierdzenie z numerem śledzenia.
      </p>

      <!-- Order number badge -->
      <div style="background:linear-gradient(135deg,#f4faf7 0%,#e8f5f0 100%);border:1.5px solid #02af7a;border-radius:16px;padding:20px 24px;margin-bottom:28px;text-align:center;">
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
          <span style="font-size:14px;color:#0f172a;font-weight:700;">${subtotal.toFixed(2).replace('.', ',')} zł</span>
        </div>
        ${isVinted ? "" : `
        <div style="display:flex;justify-content:space-between;margin-bottom:12px;">
          <span style="font-size:14px;color:#64748b;font-weight:500;">Dostawa</span>
          <span style="font-size:14px;color:#0f172a;font-weight:700;">${shippingCost.toFixed(2).replace('.', ',')} zł</span>
        </div>
        `}
        <div style="border-top:1px solid #e2e8f0;padding-top:12px;display:flex;justify-content:space-between;">
          <span style="font-size:16px;color:#0f172a;font-weight:800;">Razem</span>
          <span style="font-size:18px;color:#0f172a;font-weight:900;">${total.toFixed(2).replace('.', ',')} zł</span>
        </div>
      </div>

      <!-- Delivery info -->
      <h2 style="font-size:14px;font-weight:800;text-transform:uppercase;letter-spacing:1px;color:#94a3b8;margin-bottom:12px;">
        Adres dostawy
      </h2>
      <div style="background:#f8fafc;border-radius:12px;border:1px solid #e2e8f0;padding:16px 20px;margin-bottom:24px;">
        <p style="font-size:14px;color:#334155;font-weight:600;margin:0;line-height:1.7;">
          ${isVinted ? "Wysyłka przez Vinted" : `
          ${safeFirstName} ${safeLastName}<br/>
          ${deliveryLabel}
          `}
        </p>
      </div>

      <p style="font-size:13px;color:#94a3b8;line-height:1.7;margin-bottom:0;">
        Masz pytania dotyczące zamówienia? Napisz do nas na
        <a href="mailto:kontakt@malenaklejki.pl" style="color:#02af7a;font-weight:700;text-decoration:none;">kontakt@malenaklejki.pl</a>
        podając numer zamówienia.
      </p>
    </div>

    <!-- Footer -->
    <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:0 0 24px 24px;padding:20px 32px;text-align:center;border-top:none;">
      <p style="font-size:12px;color:#94a3b8;margin:0 0 4px;">
        © ${new Date().getFullYear()} MałeNaklejki · <a href="https://www.malenaklejki.pl" style="color:#02af7a;text-decoration:none;">malenaklejki.pl</a>
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
export function buildSellerEmailHtml(data: any, orderNumber: string): string {
  const safeFirstName = escapeHtml(data.firstName || data.customer?.firstName || "");
  const safeLastName = escapeHtml(data.lastName || data.customer?.lastName || "");
  const safeEmail = escapeHtml(data.email || data.customer?.email || "");
  const safePhone = escapeHtml(data.phone || data.customer?.phone || "");

  const safeStreet = escapeHtml(data.street || data.delivery?.courierDetails?.street || "");
  const safeBuilding = escapeHtml(data.building || data.delivery?.courierDetails?.building || "");
  const safeCity = escapeHtml(data.city || data.delivery?.courierDetails?.city || "");
  const safePostalCode = escapeHtml(data.postalCode || data.delivery?.courierDetails?.postalCode || "");
  const safeLockerId = escapeHtml(data.lockerId || data.delivery?.paczkomatDetails?.lockerId || "");
  const safeLockerAddress = escapeHtml(data.lockerAddress || data.delivery?.paczkomatDetails?.address || "");

  const wantsInvoice = data.wantsInvoice ?? data.billing?.wantsInvoice;
  const safeCompanyName = escapeHtml(data.companyName || data.billing?.companyName || "");
  const safeNip = escapeHtml(data.nip || data.billing?.nip || "");

  const deliveryMethod = data.deliveryMethod || data.delivery?.method;
  const paymentMethod = data.paymentMethod || data.payment?.method;
  const isVinted = paymentMethod === "vinted" || deliveryMethod === "vinted";

  const subtotal = data.subtotal ?? data.totals?.subtotal ?? 0;
  const shippingCost = data.shippingCost ?? data.totals?.shipping ?? 0;
  const total = data.total ?? data.totals?.total ?? 0;

  const deliveryLabel =
    deliveryMethod === "paczkomat"
      ? `Paczkomat InPost: ${safeLockerId} — ${safeLockerAddress}`
      : `Kurier: ${safeStreet} ${safeBuilding}, ${safePostalCode} ${safeCity}`;

  const paymentMethodLabel = (() => {
    const method = data.paymentMethod || data.payment?.method;
    if (method === "przelewy24") return "Przelewy24 (szybki przelew/karta)";
    if (method === "blik") return "BLIK";
    if (method === "przelew") return "Przelew tradycyjny";
    if (method === "vinted") return "Przez Vinted";
    return method || "Nieznana";
  })();

  const itemRows = (data.items || [])
    .map(
      (item: any, i: number) => `
    <tr>
      <td style="padding:10px 0;border-bottom:1px solid #f1f5f9;font-size:13px;color:#334155;">
        ${i + 1}. Zestaw – ${item.stickersPerSheet} naklejek (${String(item.widthCm).replace('.', ',')}×${(item.heightCm?.toFixed ? item.heightCm.toFixed(1) : String(item.heightCm)).replace('.', ',')} cm)<br/>
        <strong style="color: ${item.deliveryForm === "individual" ? "#3b82f6" : "#02af7a"}; font-size: 11px; text-transform: uppercase;">
          Format: ${item.deliveryForm === "individual" ? "POCIĘTE NA SZTUKI" : "NA ARKUSZU"}
        </strong>
      </td>
      <td style="padding:10px 0;border-bottom:1px solid #f1f5f9;font-size:13px;color:#334155;text-align:center;">${item.sheetQuantity} szt.</td>
      <td style="padding:10px 0;border-bottom:1px solid #f1f5f9;font-size:13px;font-weight:700;color:#0f172a;text-align:right;">${(item.pricePerSheet * item.sheetQuantity).toFixed(2).replace('.', ',')} zł</td>
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
        🛒 Nowe zamówienie OPŁACONE!
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
            <td style="font-size:13px;color:#0f172a;padding:4px 0;font-weight:700;">${safeFirstName} ${safeLastName}</td>
          </tr>
          <tr>
            <td style="font-size:13px;color:#64748b;padding:4px 0;font-weight:600;">E-mail:</td>
            <td style="font-size:13px;color:#0f172a;padding:4px 0;font-weight:700;">${safeEmail}</td>
          </tr>
          <tr>
            <td style="font-size:13px;color:#64748b;padding:4px 0;font-weight:600;">Telefon:</td>
            <td style="font-size:13px;color:#0f172a;padding:4px 0;font-weight:700;">${safePhone}</td>
          </tr>
          <tr>
            <td style="font-size:13px;color:#64748b;padding:4px 0;font-weight:600;">Dostawa:</td>
            <td style="font-size:13px;color:#0f172a;padding:4px 0;font-weight:700;">${isVinted ? "Wysyłka przez Vinted" : deliveryLabel}</td>
          </tr>
          <tr>
            <td style="font-size:13px;color:#64748b;padding:4px 0;font-weight:600;">Płatność:</td>
            <td style="font-size:13px;color:#0f172a;padding:4px 0;font-weight:700;">${paymentMethodLabel}</td>
          </tr>
          ${wantsInvoice ? `
          <tr>
            <td style="font-size:13px;color:#64748b;padding:4px 0;font-weight:600;">Faktura VAT:</td>
            <td style="font-size:13px;color:#0f172a;padding:4px 0;font-weight:700;">${safeCompanyName} · NIP: ${safeNip}</td>
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
          <span style="font-size:13px;font-weight:700;color:#0f172a;">${subtotal.toFixed(2).replace('.', ',')} zł</span>
        </div>
        <div style="display:flex;justify-content:space-between;margin-bottom:12px;">
          <span style="font-size:13px;color:#64748b;">Dostawa</span>
          <span style="font-size:13px;font-weight:700;color:#0f172a;">${shippingCost.toFixed(2).replace('.', ',')} zł</span>
        </div>
        <div style="border-top:1px solid #a9e4d7;padding-top:12px;display:flex;justify-content:space-between;">
          <span style="font-size:16px;font-weight:800;color:#0f172a;">Do zapłaty</span>
          <span style="font-size:20px;font-weight:900;color:#0f172a;">${total.toFixed(2).replace('.', ',')} zł</span>
        </div>
      </div>
    </div>

  </div>
</body>
</html>`;
}

/** Build seller notification email HTML for new/pending orders */
export function buildNewOrderSellerEmailHtml(data: any, orderNumber: string): string {
  const safeFirstName = escapeHtml(data.firstName || data.customer?.firstName || "");
  const safeLastName = escapeHtml(data.lastName || data.customer?.lastName || "");
  const safeEmail = escapeHtml(data.email || data.customer?.email || "");
  const safePhone = escapeHtml(data.phone || data.customer?.phone || "");

  const safeStreet = escapeHtml(data.street || data.delivery?.courierDetails?.street || "");
  const safeBuilding = escapeHtml(data.building || data.delivery?.courierDetails?.building || "");
  const safeCity = escapeHtml(data.city || data.delivery?.courierDetails?.city || "");
  const safePostalCode = escapeHtml(data.postalCode || data.delivery?.courierDetails?.postalCode || "");
  const safeLockerId = escapeHtml(data.lockerId || data.delivery?.paczkomatDetails?.lockerId || "");
  const safeLockerAddress = escapeHtml(data.lockerAddress || data.delivery?.paczkomatDetails?.address || "");

  const wantsInvoice = data.wantsInvoice ?? data.billing?.wantsInvoice;
  const safeCompanyName = escapeHtml(data.companyName || data.billing?.companyName || "");
  const safeNip = escapeHtml(data.nip || data.billing?.nip || "");

  const deliveryMethod = data.deliveryMethod || data.delivery?.method;
  const paymentMethod = data.paymentMethod || data.payment?.method;
  const isVinted = paymentMethod === "vinted" || deliveryMethod === "vinted";

  const subtotal = data.subtotal ?? data.totals?.subtotal ?? 0;
  const shippingCost = data.shippingCost ?? data.totals?.shipping ?? 0;
  const total = data.total ?? data.totals?.total ?? 0;

  const deliveryLabel =
    deliveryMethod === "paczkomat"
      ? `Paczkomat InPost: ${safeLockerId} — ${safeLockerAddress}`
      : `Kurier: ${safeStreet} ${safeBuilding}, ${safePostalCode} ${safeCity}`;

  const paymentMethodLabel = (() => {
    const method = data.paymentMethod || data.payment?.method;
    if (method === "przelewy24") return "Przelewy24 (szybki przelew/karta)";
    if (method === "blik") return "BLIK";
    if (method === "przelew") return "Przelew tradycyjny";
    if (method === "vinted") return "Przez Vinted";
    return method || "Nieznana";
  })();

  const itemRows = (data.items || [])
    .map(
      (item: any, i: number) => `
    <tr>
      <td style="padding:10px 0;border-bottom:1px solid #f1f5f9;font-size:13px;color:#334155;">
        ${i + 1}. Zestaw – ${item.stickersPerSheet} naklejek (${String(item.widthCm).replace('.', ',')}×${(item.heightCm?.toFixed ? item.heightCm.toFixed(1) : String(item.heightCm)).replace('.', ',')} cm)<br/>
        <strong style="color: ${item.deliveryForm === "individual" ? "#3b82f6" : "#02af7a"}; font-size: 11px; text-transform: uppercase;">
          Format: ${item.deliveryForm === "individual" ? "POCIĘTE NA SZTUKI" : "NA ARKUSZU"}
        </strong>
      </td>
      <td style="padding:10px 0;border-bottom:1px solid #f1f5f9;font-size:13px;color:#334155;text-align:center;">${item.sheetQuantity} szt.</td>
      <td style="padding:10px 0;border-bottom:1px solid #f1f5f9;font-size:13px;font-weight:700;color:#0f172a;text-align:right;">${(item.pricePerSheet * item.sheetQuantity).toFixed(2).replace('.', ',')} zł</td>
    </tr>`
    )
    .join("");

  return `
<!DOCTYPE html>
<html lang="pl">
<head><meta charset="UTF-8"/></head>
<body style="margin:0;padding:0;background:#eff6ff;font-family:'Inter',system-ui,-apple-system,sans-serif;">
  <div style="max-width:660px;margin:0 auto;padding:32px 16px;">

    <!-- Header -->
    <div style="background:linear-gradient(135deg,#1e3a8a 0%,#3b82f6 100%);border-radius:24px 24px 0 0;padding:28px 32px;text-align:center;">
      <div style="font-size:14px;font-weight:800;text-transform:uppercase;letter-spacing:3px;color:#93c5fd;margin-bottom:8px;">
        MałeNaklejki · Panel Sprzedawcy
      </div>
      <h1 style="color:#ffffff;margin:0;font-size:22px;font-weight:900;">
        🛒 Nowe zamówienie (Nieopłacone)
      </h1>
    </div>

    <!-- Body -->
    <div style="background:#ffffff;padding:32px;border:1px solid #bfdbfe;border-top:none;">

      <!-- Order badge -->
      <div style="background:linear-gradient(135deg,#eff6ff,#dbeafe);border:2px solid #3b82f6;border-radius:16px;padding:18px 24px;margin-bottom:28px;text-align:center;">
        <p style="font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:2px;color:#1e40af;margin:0 0 4px;">Numer zamówienia</p>
        <p style="font-size:28px;font-weight:900;color:#0f172a;font-family:monospace;letter-spacing:2px;margin:0;">${orderNumber}</p>
        <p style="font-size:12px;color:#1e40af;margin:6px 0 0;">Oczekuje na płatność przez: <strong>${paymentMethodLabel}</strong></p>
        <p style="font-size:11px;color:#64748b;margin:6px 0 0;">${new Date().toLocaleString("pl-PL", { timeZone: "Europe/Warsaw" })}</p>
      </div>

      <!-- Customer info -->
      <h2 style="font-size:13px;font-weight:800;text-transform:uppercase;letter-spacing:1px;color:#94a3b8;margin-bottom:10px;margin-top:0;">Dane klienta</h2>
      <div style="background:#f8fafc;border-radius:12px;border:1px solid #e2e8f0;padding:16px 20px;margin-bottom:24px;">
        <table style="width:100%;border-collapse:collapse;">
          <tr>
            <td style="font-size:13px;color:#64748b;padding:4px 0;font-weight:600;width:130px;">Imię i nazwisko:</td>
            <td style="font-size:13px;color:#0f172a;padding:4px 0;font-weight:700;">${safeFirstName} ${safeLastName}</td>
          </tr>
          <tr>
            <td style="font-size:13px;color:#64748b;padding:4px 0;font-weight:600;">E-mail:</td>
            <td style="font-size:13px;color:#0f172a;padding:4px 0;font-weight:700;">${safeEmail}</td>
          </tr>
          <tr>
            <td style="font-size:13px;color:#64748b;padding:4px 0;font-weight:600;">Telefon:</td>
            <td style="font-size:13px;color:#0f172a;padding:4px 0;font-weight:700;">${safePhone}</td>
          </tr>
          <tr>
            <td style="font-size:13px;color:#64748b;padding:4px 0;font-weight:600;">Dostawa:</td>
            <td style="font-size:13px;color:#0f172a;padding:4px 0;font-weight:700;">${isVinted ? "Wysyłka przez Vinted" : deliveryLabel}</td>
          </tr>
          <tr>
            <td style="font-size:13px;color:#64748b;padding:4px 0;font-weight:600;">Płatność:</td>
            <td style="font-size:13px;color:#0f172a;padding:4px 0;font-weight:700;">${paymentMethodLabel}</td>
          </tr>
          ${wantsInvoice ? `
          <tr>
            <td style="font-size:13px;color:#64748b;padding:4px 0;font-weight:600;">Faktura VAT:</td>
            <td style="font-size:13px;color:#0f172a;padding:4px 0;font-weight:700;">${safeCompanyName} · NIP: ${safeNip}</td>
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
      <div style="background:#f0f9ff;border-radius:12px;border:1.5px solid #93c5fd;padding:16px 20px;margin-bottom:24px;">
        <div style="display:flex;justify-content:space-between;margin-bottom:8px;">
          <span style="font-size:13px;color:#64748b;">Naklejki</span>
          <span style="font-size:13px;font-weight:700;color:#0f172a;">${subtotal.toFixed(2).replace('.', ',')} zł</span>
        </div>
        ${isVinted ? "" : `
        <div style="display:flex;justify-content:space-between;margin-bottom:12px;">
          <span style="font-size:13px;color:#64748b;">Dostawa</span>
          <span style="font-size:13px;font-weight:700;color:#0f172a;">${shippingCost.toFixed(2).replace('.', ',')} zł</span>
        </div>
        `}
        <div style="border-top:1px solid #93c5fd;padding-top:12px;display:flex;justify-content:space-between;">
          <span style="font-size:16px;font-weight:800;color:#0f172a;">Do zapłaty</span>
          <span style="font-size:20px;font-weight:900;color:#0f172a;">${total.toFixed(2).replace('.', ',')} zł</span>
        </div>
      </div>
    </div>

  </div>
</body>
</html>`;
}

/** Build seller email HTML for unpaid/abandoned orders */
export function buildUnpaidOrderSellerEmailHtml(data: any, orderNumber: string): string {
  const safeFirstName = escapeHtml(data.firstName || data.customer?.firstName || "");
  const safeLastName = escapeHtml(data.lastName || data.customer?.lastName || "");
  const safeEmail = escapeHtml(data.email || data.customer?.email || "");
  const safePhone = escapeHtml(data.phone || data.customer?.phone || "");

  const safeStreet = escapeHtml(data.street || data.delivery?.courierDetails?.street || "");
  const safeBuilding = escapeHtml(data.building || data.delivery?.courierDetails?.building || "");
  const safeCity = escapeHtml(data.city || data.delivery?.courierDetails?.city || "");
  const safePostalCode = escapeHtml(data.postalCode || data.delivery?.courierDetails?.postalCode || "");
  const safeLockerId = escapeHtml(data.lockerId || data.delivery?.paczkomatDetails?.lockerId || "");
  const safeLockerAddress = escapeHtml(data.lockerAddress || data.delivery?.paczkomatDetails?.address || "");

  const deliveryMethod = data.deliveryMethod || data.delivery?.method;
  const paymentMethod = data.paymentMethod || data.payment?.method;
  const isVinted = paymentMethod === "vinted" || deliveryMethod === "vinted";

  const subtotal = data.subtotal ?? data.totals?.subtotal ?? 0;
  const shippingCost = data.shippingCost ?? data.totals?.shipping ?? 0;
  const total = data.total ?? data.totals?.total ?? 0;

  const deliveryLabel =
    deliveryMethod === "paczkomat"
      ? `Paczkomat InPost: ${safeLockerId} — ${safeLockerAddress}`
      : `Kurier: ${safeStreet} ${safeBuilding}, ${safePostalCode} ${safeCity}`;

  const paymentMethodLabel = (() => {
    const method = data.paymentMethod || data.payment?.method;
    if (method === "przelewy24") return "Przelewy24 (szybki przelew/karta)";
    if (method === "blik") return "BLIK";
    if (method === "przelew") return "Przelew tradycyjny";
    if (method === "vinted") return "Przez Vinted";
    return method || "Nieznana";
  })();

  const itemRows = (data.items || [])
    .map(
      (item: any, i: number) => `
    <tr>
      <td style="padding:10px 0;border-bottom:1px solid #f1f5f9;font-size:13px;color:#334155;">
        ${i + 1}. Zestaw – ${item.stickersPerSheet} naklejek (${String(item.widthCm).replace('.', ',')}×${(item.heightCm?.toFixed ? item.heightCm.toFixed(1) : String(item.heightCm)).replace('.', ',')} cm)<br/>
        <strong style="color: ${item.deliveryForm === "individual" ? "#3b82f6" : "#02af7a"}; font-size: 11px; text-transform: uppercase;">
          Format: ${item.deliveryForm === "individual" ? "POCIĘTE NA SZTUKI" : "NA ARKUSZU"}
        </strong>
      </td>
      <td style="padding:10px 0;border-bottom:1px solid #f1f5f9;font-size:13px;color:#334155;text-align:center;">${item.sheetQuantity} szt.</td>
      <td style="padding:10px 0;border-bottom:1px solid #f1f5f9;font-size:13px;font-weight:700;color:#0f172a;text-align:right;">${(item.pricePerSheet * item.sheetQuantity).toFixed(2).replace('.', ',')} zł</td>
    </tr>`
    )
    .join("");

  return `
<!DOCTYPE html>
<html lang="pl">
<head><meta charset="UTF-8"/></head>
<body style="margin:0;padding:0;background:#fef3c7;font-family:'Inter',system-ui,-apple-system,sans-serif;">
  <div style="max-width:660px;margin:0 auto;padding:32px 16px;">

    <!-- Header -->
    <div style="background:linear-gradient(135deg,#d97706 0%,#f59e0b 100%);border-radius:24px 24px 0 0;padding:28px 32px;text-align:center;">
      <div style="font-size:14px;font-weight:800;text-transform:uppercase;letter-spacing:3px;color:#ffffff;margin-bottom:8px;opacity:0.9;">
        MałeNaklejki · Powiadomienie o braku płatności
      </div>
      <h1 style="color:#ffffff;margin:0;font-size:22px;font-weight:900;">
        ⚠️ Płatność nie została sfinalizowana
      </h1>
    </div>

    <!-- Body -->
    <div style="background:#ffffff;padding:32px;border:1px solid #f59e0b;border-top:none;">

      <!-- Order badge -->
      <div style="background:linear-gradient(135deg,#fffbeb,#fef3c7);border:2px solid #f59e0b;border-radius:16px;padding:18px 24px;margin-bottom:28px;text-align:center;">
        <p style="font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:2px;color:#b45309;margin:0 0 4px;">Numer zamówienia</p>
        <p style="font-size:28px;font-weight:900;color:#0f172a;font-family:monospace;letter-spacing:2px;margin:0;">${orderNumber}</p>
        <p style="font-size:12px;color:#b45309;margin:6px 0 0;">Minęło ponad 25 minut bez potwierdzenia płatności w Przelewy24.</p>
      </div>

      <p style="font-size:14px;color:#4b5563;line-height:1.6;margin-bottom:24px;">
        To zamówienie zostało rozpoczęte, ale klient nie dokończył transakcji (zamknięcie okna, anulowanie płatności lub błąd bankowości). Zamówienie zostało oznaczone jako niesfinalizowane w bazie danych.
      </p>

      <!-- Customer info -->
      <h2 style="font-size:13px;font-weight:800;text-transform:uppercase;letter-spacing:1px;color:#9ca3af;margin-bottom:10px;margin-top:0;">Dane klienta</h2>
      <div style="background:#f9fafb;border-radius:12px;border:1px solid #e5e7eb;padding:16px 20px;margin-bottom:24px;">
        <table style="width:100%;border-collapse:collapse;">
          <tr>
            <td style="font-size:13px;color:#6b7280;padding:4px 0;font-weight:600;width:130px;">Imię i nazwisko:</td>
            <td style="font-size:13px;color:#0f172a;padding:4px 0;font-weight:700;">${safeFirstName} ${safeLastName}</td>
          </tr>
          <tr>
            <td style="font-size:13px;color:#6b7280;padding:4px 0;font-weight:600;">E-mail:</td>
            <td style="font-size:13px;color:#0f172a;padding:4px 0;font-weight:700;"><a href="mailto:${safeEmail}" style="color:#2563eb;text-decoration:none;">${safeEmail}</a></td>
          </tr>
          <tr>
            <td style="font-size:13px;color:#6b7280;padding:4px 0;font-weight:600;">Telefon:</td>
            <td style="font-size:13px;color:#0f172a;padding:4px 0;font-weight:700;">${safePhone}</td>
          </tr>
          <tr>
            <td style="font-size:13px;color:#6b7280;padding:4px 0;font-weight:600;width:130px;">Dostawa:</td>
            <td style="font-size:13px;color:#0f172a;padding:4px 0;font-weight:700;">${isVinted ? "Wysyłka przez Vinted" : deliveryLabel}</td>
          </tr>
          <tr>
            <td style="font-size:13px;color:#6b7280;padding:4px 0;font-weight:600;">Metoda płatności:</td>
            <td style="font-size:13px;color:#0f172a;padding:4px 0;font-weight:700;">${paymentMethodLabel}</td>
          </tr>
        </table>
      </div>

      <!-- Items -->
      <h2 style="font-size:13px;font-weight:800;text-transform:uppercase;letter-spacing:1px;color:#9ca3af;margin-bottom:10px;">Produkty w koszyku</h2>
      <table style="width:100%;border-collapse:collapse;margin-bottom:24px;">
        <thead>
          <tr>
            <th style="text-align:left;font-size:11px;font-weight:700;color:#9ca3af;text-transform:uppercase;padding-bottom:8px;">Produkt</th>
            <th style="text-align:center;font-size:11px;font-weight:700;color:#9ca3af;text-transform:uppercase;padding-bottom:8px;">Ilość</th>
            <th style="text-align:right;font-size:11px;font-weight:700;color:#9ca3af;text-transform:uppercase;padding-bottom:8px;">Cena</th>
          </tr>
        </thead>
        <tbody>${itemRows}</tbody>
      </table>

      <!-- Totals -->
      <div style="background:#f9fafb;border-radius:12px;border:1px solid #e5e7eb;padding:16px 20px;">
        <div style="display:flex;justify-content:space-between;margin-bottom:8px;">
          <span style="font-size:13px;color:#6b7280;">Suma produktów</span>
          <span style="font-size:13px;font-weight:700;color:#0f172a;">${subtotal.toFixed(2).replace('.', ',')} zł</span>
        </div>
        ${isVinted ? "" : `
        <div style="display:flex;justify-content:space-between;margin-bottom:12px;">
          <span style="font-size:13px;color:#6b7280;">Dostawa</span>
          <span style="font-size:13px;font-weight:700;color:#0f172a;">${shippingCost.toFixed(2).replace('.', ',')} zł</span>
        </div>
        `}
        <div style="border-top:1px solid #e5e7eb;padding-top:12px;display:flex;justify-content:space-between;">
          <span style="font-size:16px;font-weight:800;color:#0f172a;">Kwota nieopłacona</span>
          <span style="font-size:20px;font-weight:900;color:#dc2626;">${total.toFixed(2).replace('.', ',')} zł</span>
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

/** Build manual bank transfer instructions email HTML */
export function buildManualTransferEmailHtml(data: any, orderNumber: string): string {
  const safeFirstName = escapeHtml(data.firstName || data.customer?.firstName || "");
  const total = data.total ?? data.totals?.total ?? 0;

  return `
<!DOCTYPE html>
<html lang="pl">
<head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/></head>
<body style="margin:0;padding:0;background-color:#f4faf7;font-family:'Inter',system-ui,-apple-system,sans-serif;">
  <div style="max-width:620px;margin:0 auto;padding:32px 16px;">

    <!-- Header -->
    <div style="background:linear-gradient(135deg,#02af7a 0%,#004749 100%);border-radius:24px 24px 0 0;padding:36px 32px;text-align:center;">
      <div style="font-size:32px;font-weight:900;color:#ffffff;letter-spacing:-1px;margin-bottom:4px;">
        Małe<span style="color:#f4faf7;">Naklejki</span>
      </div>
      <div style="width:40px;height:3px;background:#ffffff;opacity:0.2;border-radius:2px;margin:8px auto 16px;"></div>
      <h1 style="color:#ffffff;margin:0;font-size:22px;font-weight:800;">
       Zamówienie oczekuje na opłacenie
      </h1>
      <p style="color:#ffffff;opacity:0.95;margin:8px 0 0;font-size:14px;font-weight:500;">
        Złożyłeś zamówienie wybierając przelew tradycyjny.
      </p>
    </div>

    <!-- Body -->
    <div style="background:#ffffff;padding:32px;border-left:1px solid #e2e8f0;border-right:1px solid #e2e8f0;">

      <p style="font-size:16px;color:#334155;font-weight:600;margin-top:0;">
        Cześć <strong>${safeFirstName}</strong>! 👋
      </p>
      <p style="font-size:14px;color:#64748b;line-height:1.7;margin-bottom:24px;">
        Dziękujemy za złożenie zamówienia. Prosimy o dokonanie wpłaty na poniższe dane. Twoje zamówienie zostanie przekazane do produkcji po zaksięgowaniu płatności na naszym koncie.
      </p>

      <!-- Order number badge -->
      <div style="background:linear-gradient(135deg,#f4faf7 0%,#e8f5f0 100%);border:1.5px solid #02af7a;border-radius:16px;padding:16px 20px;margin-bottom:28px;text-align:center;">
        <p style="font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:2px;color:#64748b;margin:0 0 6px;">
          Tytuł przelewu / Numer zamówienia
        </p>
        <p style="font-size:22px;font-weight:900;color:#0f172a;font-family:monospace;letter-spacing:1px;margin:0;">
          ${orderNumber}
        </p>
      </div>

      <!-- Transfer details -->
      <h2 style="font-size:14px;font-weight:800;text-transform:uppercase;letter-spacing:1px;color:#94a3b8;margin-bottom:12px;margin-top:0;">
        Dane do przelewu
      </h2>
      <div style="background:#f4faf7;border:1.5px solid #02af7a;border-radius:16px;padding:20px;margin-bottom:24px;">
        <table style="width:100%;border-collapse:collapse;">
          <tr>
            <td style="font-size:13px;color:#004749;padding:6px 0;font-weight:700;width:120px;">Odbiorca:</td>
            <td style="font-size:14px;color:#0f172a;padding:6px 0;font-weight:800;">Jakub Dalaszyński</td>
          </tr>
          <tr>
            <td style="font-size:13px;color:#004749;padding:6px 0;font-weight:700;">Adres:</td>
            <td style="font-size:14px;color:#0f172a;padding:6px 0;font-weight:600;">ul. Geodetów 41 64-100 Trzebiny</td>
          </tr>
          <tr>
            <td style="font-size:13px;color:#004749;padding:6px 0;font-weight:700;">Numer konta:</td>
            <td style="font-size:15px;color:#0f172a;padding:6px 0;font-weight:900;letter-spacing:1px;">64 1020 3088 0000 8002 0171 3445</td>
          </tr>
          <tr>
            <td style="font-size:13px;color:#004749;padding:6px 0;font-weight:700;">Bank:</td>
            <td style="font-size:14px;color:#0f172a;padding:6px 0;font-weight:600;">PKO BP</td>
          </tr>
          <tr>
            <td style="font-size:13px;color:#004749;padding:6px 0;font-weight:700;border-top:1px solid #02af7a;margin-top:8px;padding-top:14px;">Kwota do zapłaty:</td>
            <td style="font-size:18px;color:#02af7a;padding:6px 0;font-weight:900;border-top:1px solid #02af7a;margin-top:8px;padding-top:14px;">${total.toFixed(2).replace('.', ',')} zł</td>
          </tr>
        </table>
      </div>

      <p style="font-size:13px;color:#94a3b8;line-height:1.7;margin-bottom:0;">
        Pamiętaj, że wpisanie poprawnego numeru zamówienia w tytule przelewu przyspieszy jego weryfikację.
      </p>
    </div>

    <!-- Footer -->
    <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:0 0 24px 24px;padding:20px 32px;text-align:center;border-top:none;">
      <p style="font-size:12px;color:#64748b;margin:0 0 4px;">
        © ${new Date().getFullYear()} MałeNaklejki · <a href="https://www.malenaklejki.pl" style="color:#02af7a;text-decoration:none;">malenaklejki.pl</a>
      </p>
      <p style="font-size:11px;color:#94a3b8;margin:0;">
        Wiadomość wygenerowana automatycznie.
      </p>
    </div>
  </div>
</body>
</html>`;
}

async function downloadImageAsBase64(url: string): Promise<string | null> {
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Failed to fetch image: ${res.statusText}`);
    const arrayBuffer = await res.arrayBuffer();
    let buffer = Buffer.from(arrayBuffer);

    try {
      const contentType = res.headers.get("content-type") || "";
      if (contentType.includes("image/png") || url.toLowerCase().endsWith(".png")) {
        const compressed = await sharp(buffer)
          .png({ palette: true, quality: 85, compressionLevel: 9 })
          .toBuffer();
        buffer = Buffer.from(compressed);
      } else if (
        contentType.includes("image/jpeg") ||
        url.toLowerCase().endsWith(".jpg") ||
        url.toLowerCase().endsWith(".jpeg")
      ) {
        const compressed = await sharp(buffer)
          .jpeg({ quality: 80 })
          .toBuffer();
        buffer = Buffer.from(compressed);
      }
    } catch (compressError) {
      console.warn(`Could not compress attachment image (${url}) via sharp, sending original:`, compressError);
    }

    return buffer.toString("base64");
  } catch (error) {
    console.error(`Error downloading image from URL (${url}):`, error);
    return null;
  }
}

export async function buildOrderAttachments(
  items: any[],
  orderNumber: string
): Promise<Array<{ content: string; name: string; type: string }>> {
  const attachments: Array<{ content: string; name: string; type: string }> = [];
  const prefix = orderNumber.replace(/[^a-zA-Z0-9-]/g, "_");

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    const itemIndex = i + 1;

    // 1. Druk (imageUrl)
    if (item.imageUrl) {
      const printBase64 = await downloadImageAsBase64(item.imageUrl);
      if (printBase64) {
        attachments.push({
          content: printBase64,
          name: `${prefix}-arkusz-${itemIndex}-DRUK.png`,
          type: "image/png",
        });
      }
    }

    // 2. Linie cięcia (cutLinesImageUrl lub fallback do imageUrl)
    const cutUrl = item.cutLinesImageUrl || item.imageUrl;
    if (cutUrl) {
      const cutBase64 = await downloadImageAsBase64(cutUrl);
      if (cutBase64) {
        attachments.push({
          content: cutBase64,
          name: `${prefix}-arkusz-${itemIndex}-LINIE-CIECIA.png`,
          type: "image/png",
        });
      }
    }
  }

  return attachments;
}

export function buildVintedOrderCustomerEmailHtml(data: any, orderNumber: string): string {
  const safeFirstName = escapeHtml(data.firstName || data.customer?.firstName || "");
  const safeLastName = escapeHtml(data.lastName || data.customer?.lastName || "");

  const subtotal = data.subtotal ?? data.totals?.subtotal ?? 0;
  const total = data.total ?? data.totals?.total ?? 0;

  const itemRows = (data.items || [])
    .map(
      (item: any, i: number) => `
    <tr>
      <td style="padding: 12px 0; border-bottom: 1px solid #f1f5f9; font-size: 14px; color: #334155; font-weight: 600;">
        Zestaw – ${item.stickersPerSheet} naklejek (${String(item.widthCm).replace('.', ',')}×${String(item.heightCm).replace('.', ',')} cm)<br/>
        <span style="font-size: 12px; color: #64748b; font-weight: 500;">
          Sposób dostarczenia: ${item.deliveryForm === "individual" ? "Pocięte na sztuki (pojedyncze)" : "W jednym arkuszu A4"}
        </span>
      </td>
      <td style="padding: 12px 0; border-bottom: 1px solid #f1f5f9; font-size: 14px; color: #334155; font-weight: 600; text-align: center;">
        ${item.sheetQuantity} szt.
      </td>
      <td style="padding: 12px 0; border-bottom: 1px solid #f1f5f9; font-size: 14px; color: #0f172a; font-weight: 700; text-align: right;">
        ${(item.pricePerSheet * item.sheetQuantity).toFixed(2).replace('.', ',')} zł
      </td>
    </tr>`
    )
    .join("");

  return `
<!DOCTYPE html>
<html lang="pl">
<head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/></head>
<body style="margin:0;padding:0;background-color:#f0fdfa;font-family:'Inter',system-ui,-apple-system,sans-serif;">
  <div style="max-width:620px;margin:0 auto;padding:32px 16px;">

    <!-- Header -->
    <div style="background:linear-gradient(135deg,#09b1ba 0%,#004f54 100%);border-radius:24px 24px 0 0;padding:36px 32px;text-align:center;">
      <div style="font-size:32px;font-weight:900;color:#ffffff;letter-spacing:-1px;margin-bottom:4px;">
        Małe<span style="color:#f0fdfa;">Naklejki</span>
      </div>
      <div style="width:40px;height:3px;background:#ffffff;opacity:0.2;border-radius:2px;margin:8px auto 16px;"></div>
      <h1 style="color:#ffffff;margin:0;font-size:22px;font-weight:800;">
       Zamówienie oczekuje na zakup na Vinted
      </h1>
      <p style="color:#ffffff;opacity:0.95;margin:8px 0 0;font-size:14px;font-weight:500;">
        Wybrałeś bezpieczną płatność i realizację przez serwis Vinted.
      </p>
    </div>

    <!-- Body -->
    <div style="background:#ffffff;padding:32px;border-left:1px solid #e2e8f0;border-right:1px solid #e2e8f0;">

      <p style="font-size:16px;color:#334155;font-weight:600;margin-top:0;">
        Cześć <strong>${safeFirstName}</strong>! 👋
      </p>
      <p style="font-size:14px;color:#64748b;line-height:1.7;margin-bottom:24px;">
        Dziękujemy za złożenie zamówienia na naklejki!. Zgodnie z wybraną formą płatności, zrealizujemy je dzięki Vinted.
      </p>

      <!-- Steps Box -->
      <div style="background:#f0fdfa;border:1.5px solid #09b1ba;border-radius:16px;padding:20px;margin-bottom:28px;">
        <h3 style="font-size:15px;font-weight:800;color:#004f54;margin:0 0 12px;text-transform:uppercase;letter-spacing:0.5px;">Kolejne kroki:</h3>
        <ol style="margin:0;padding-left:20px;font-size:13px;color:#334155;line-height:1.6;">
          <li style="margin-bottom:8px;">Wystawimy dla Ciebie dedykowaną, bezpieczną ofertę na Vinted na kwotę <strong>${total.toFixed(2).replace('.', ',')} zł</strong>.</li>
          <li style="margin-bottom:8px;"><strong>W osobnej wiadomości e-mail wyślemy Ci bezpośredni link</strong> do tej oferty na Vinted.</li>
          <li style="margin-bottom:0;">Po kupieniu przez Ciebie naklejek na Vinted, przystąpimy do druku, cięcia i wysyłki Twoich naklejek.</li>
        </ol>
      </div>

      <!-- Order number badge -->
      <div style="background:linear-gradient(135deg,#f0fdfa 0%,#e6fcf9 100%);border:1.5px solid #09b1ba;border-radius:16px;padding:16px 20px;margin-bottom:28px;text-align:center;">
        <p style="font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:2px;color:#64748b;margin:0 0 6px;">
          Numer zamówienia
        </p>
        <p style="font-size:22px;font-weight:900;color:#0f172a;font-family:monospace;letter-spacing:1px;margin:0;">
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
          <span style="font-size:14px;color:#0f172a;font-weight:700;">${subtotal.toFixed(2).replace('.', ',')} zł</span>
        </div>
        <div style="border-top:1px solid #e2e8f0;padding-top:12px;display:flex;justify-content:space-between;">
          <span style="font-size:16px;color:#0f172a;font-weight:800;">Razem</span>
          <span style="font-size:18px;color:#0f172a;font-weight:900;">${total.toFixed(2).replace('.', ',')} zł</span>
        </div>
      </div>

      <!-- Delivery info -->
      <h2 style="font-size:14px;font-weight:800;text-transform:uppercase;letter-spacing:1px;color:#94a3b8;margin-bottom:12px;">
        Metoda dostawy
      </h2>
      <div style="background:#f8fafc;border-radius:12px;border:1px solid #e2e8f0;padding:16px 20px;margin-bottom:24px;">
        <p style="font-size:14px;color:#334155;font-weight:600;margin:0;line-height:1.7;">
          Wysyłka przez Vinted
        </p>
      </div>

      <p style="font-size:13px;color:#94a3b8;line-height:1.7;margin-bottom:0;">
        Masz pytania? Odpowiedz na ten e-mail lub napisz na
        <a href="mailto:kontakt@malenaklejki.pl" style="color:#09b1ba;font-weight:700;text-decoration:none;">kontakt@malenaklejki.pl</a>.
      </p>
    </div>

    <!-- Footer -->
    <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:0 0 24px 24px;padding:20px 32px;text-align:center;border-top:none;">
      <p style="font-size:12px;color:#64748b;margin:0 0 4px;">
        © ${new Date().getFullYear()} MałeNaklejki · <a href="https://www.malenaklejki.pl" style="color:#09b1ba;text-decoration:none;">malenaklejki.pl</a>
      </p>
      <p style="font-size:11px;color:#94a3b8;margin:0;">
        Wiadomość wygenerowana automatycznie.
      </p>
    </div>
  </div>
</body>
</html>`;
}

export function buildVintedOrderSellerEmailHtml(data: any, orderNumber: string): string {
  const safeFirstName = escapeHtml(data.firstName || data.customer?.firstName || "");
  const safeLastName = escapeHtml(data.lastName || data.customer?.lastName || "");
  const safeEmail = escapeHtml(data.email || data.customer?.email || "");
  const safePhone = escapeHtml(data.phone || data.customer?.phone || "");

  const wantsInvoice = data.wantsInvoice ?? data.billing?.wantsInvoice;
  const safeCompanyName = escapeHtml(data.companyName || data.billing?.companyName || "");
  const safeNip = escapeHtml(data.nip || data.billing?.nip || "");

  const subtotal = data.subtotal ?? data.totals?.subtotal ?? 0;
  const total = data.total ?? data.totals?.total ?? 0;

  const itemRows = (data.items || [])
    .map(
      (item: any, i: number) => `
    <tr>
      <td style="padding:10px 0;border-bottom:1px solid #f1f5f9;font-size:13px;color:#334155;">
        ${i + 1}. Zestaw – ${item.stickersPerSheet} naklejek (${String(item.widthCm).replace('.', ',')}×${(item.heightCm?.toFixed ? item.heightCm.toFixed(1) : String(item.heightCm)).replace('.', ',')} cm)<br/>
        <strong style="color: ${item.deliveryForm === "individual" ? "#3b82f6" : "#02af7a"}; font-size: 11px; text-transform: uppercase;">
          Format: ${item.deliveryForm === "individual" ? "POCIĘTE NA SZTUKI" : "NA ARKUSZU"}
        </strong>
      </td>
      <td style="padding:10px 0;border-bottom:1px solid #f1f5f9;font-size:13px;color:#334155;text-align:center;">${item.sheetQuantity} szt.</td>
      <td style="padding:10px 0;border-bottom:1px solid #f1f5f9;font-size:13px;font-weight:700;color:#0f172a;text-align:right;">${(item.pricePerSheet * item.sheetQuantity).toFixed(2).replace('.', ',')} zł</td>
    </tr>`
    )
    .join("");

  return `
<!DOCTYPE html>
<html lang="pl">
<head><meta charset="UTF-8"/></head>
<body style="margin:0;padding:0;background:#e0f2fe;font-family:'Inter',system-ui,-apple-system,sans-serif;">
  <div style="max-width:660px;margin:0 auto;padding:32px 16px;">

    <!-- Header -->
    <div style="background:linear-gradient(135deg,#0369a1 0%,#0c4a6e 100%);border-radius:24px 24px 0 0;padding:28px 32px;text-align:center;">
      <div style="font-size:14px;font-weight:800;text-transform:uppercase;letter-spacing:3px;color:#7dd3fc;margin-bottom:8px;">
        MałeNaklejki · Panel Sprzedawcy
      </div>
      <h1 style="color:#ffffff;margin:0;font-size:22px;font-weight:900;">
        👗 Nowe zamówienie przez VINTED!
      </h1>
    </div>

    <!-- Body -->
    <div style="background:#ffffff;padding:32px;border:1px solid #bae6fd;border-top:none;">

      <!-- Vinted Alert Box -->
      <div style="background:#f0f9ff;border:2px solid #0284c7;border-radius:16px;padding:20px;margin-bottom:28px;">
        <h3 style="font-size:14px;font-weight:800;color:#0369a1;margin:0 0 8px;text-transform:uppercase;letter-spacing:0.5px;">⚠️ Działanie wymagane:</h3>
        <p style="font-size:13px;color:#334155;margin:0;line-height:1.6;">
          Klient złożył zamówienie wybierając płatność przez Vinted. Musisz:<br/>
          1. Wystawić dedykowaną aukcję na swoim koncie Vinted o wartości <strong>${total.toFixed(2).replace('.', ',')} zł</strong>.<br/>
          2. Skopiować link do aukcji i wysłać go klientowi na adres e-mail: <a href="mailto:${safeEmail}" style="color:#0284c7;font-weight:700;text-decoration:none;">${safeEmail}</a>.<br/>
          3. Pliki produkcyjne (DRUK i LINIE CIĘCIA) zostały załączone do tej wiadomości.
        </p>
      </div>

      <!-- Order badge -->
      <div style="background:linear-gradient(135deg,#e0f2fe,#f0f9ff);border:1.5px solid #0284c7;border-radius:16px;padding:18px 24px;margin-bottom:28px;text-align:center;">
        <p style="font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:2px;color:#0369a1;margin:0 0 4px;">Numer zamówienia</p>
        <p style="font-size:28px;font-weight:900;color:#0f172a;font-family:monospace;letter-spacing:2px;margin:0;">${orderNumber}</p>
        <p style="font-size:11px;color:#64748b;margin:6px 0 0;">${new Date().toLocaleString("pl-PL", { timeZone: "Europe/Warsaw" })}</p>
      </div>

      <!-- Customer info -->
      <h2 style="font-size:13px;font-weight:800;text-transform:uppercase;letter-spacing:1px;color:#94a3b8;margin-bottom:10px;margin-top:0;">Dane klienta</h2>
      <div style="background:#f8fafc;border-radius:12px;border:1px solid #e2e8f0;padding:16px 20px;margin-bottom:24px;">
        <table style="width:100%;border-collapse:collapse;">
          <tr>
            <td style="font-size:13px;color:#64748b;padding:4px 0;font-weight:600;width:130px;">Imię i nazwisko:</td>
            <td style="font-size:13px;color:#0f172a;padding:4px 0;font-weight:700;">${safeFirstName} ${safeLastName}</td>
          </tr>
          <tr>
            <td style="font-size:13px;color:#64748b;padding:4px 0;font-weight:600;">E-mail:</td>
            <td style="font-size:13px;color:#0f172a;padding:4px 0;font-weight:700;"><a href="mailto:${safeEmail}" style="color:#0284c7;text-decoration:none;">${safeEmail}</a></td>
          </tr>
          <tr>
            <td style="font-size:13px;color:#64748b;padding:4px 0;font-weight:600;">Telefon:</td>
            <td style="font-size:13px;color:#0f172a;padding:4px 0;font-weight:700;">${safePhone}</td>
          </tr>
          <tr>
            <td style="font-size:13px;color:#64748b;padding:4px 0;font-weight:600;">Płatność:</td>
            <td style="font-size:13px;color:#0f172a;padding:4px 0;font-weight:700;">Vinted (aukcja)</td>
          </tr>
          ${wantsInvoice ? `
          <tr>
            <td style="font-size:13px;color:#64748b;padding:4px 0;font-weight:600;">Faktura VAT:</td>
            <td style="font-size:13px;color:#0f172a;padding:4px 0;font-weight:700;">${safeCompanyName} · NIP: ${safeNip}</td>
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
      <div style="background:#f0f9ff;border-radius:12px;border:1.5px solid #bae6fd;padding:16px 20px;margin-bottom:24px;">
        <div style="display:flex;justify-content:space-between;margin-bottom:8px;">
          <span style="font-size:13px;color:#64748b;">Naklejki</span>
          <span style="font-size:13px;font-weight:700;color:#0f172a;">${subtotal.toFixed(2).replace('.', ',')} zł</span>
        </div>
        <div style="border-top:1px solid #bae6fd;padding-top:12px;display:flex;justify-content:space-between;">
          <span style="font-size:16px;font-weight:800;color:#0f172a;">Kwota oferty</span>
          <span style="font-size:20px;font-weight:900;color:#0f172a;">${total.toFixed(2).replace('.', ',')} zł</span>
        </div>
      </div>
    </div>

  </div>
</body>
</html>`;
}


