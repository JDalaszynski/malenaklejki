export async function sendCustomerConfirmationEmail(orderData: any) {
  if (!process.env.BREVO_API_KEY) {
    console.error("BREVO_API_KEY is missing");
    return;
  }

  try {
    const itemsHtml = orderData.items.map((item: any) => `
      <li>
        <strong>Arkusz A4</strong><br />
        Szerokość: ${item.widthCm}cm, Ilość sztuk na arkuszu: ${item.stickersPerSheet}<br />
        Ilość arkuszy: ${item.sheetQuantity}<br />
        <a href="${item.imageUrl}">Podgląd obrazka</a>
      </li>
    `).join('');

    const shippingInfo = orderData.delivery.method === 'kurier' 
      ? `Kurier: ${orderData.delivery.courierDetails.street} ${orderData.delivery.courierDetails.building}, ${orderData.delivery.courierDetails.postalCode} ${orderData.delivery.courierDetails.city}`
      : `Paczkomat InPost: ${orderData.delivery.paczkomatDetails.lockerId} (${orderData.delivery.paczkomatDetails.address})`;

    const billingInfo = orderData.billing.wantsInvoice 
      ? `Zostanie wystawiona faktura VAT na NIP: ${orderData.billing.nip} (${orderData.billing.companyName})`
      : 'Brak żądania faktury (paragon).';

    const payload = {
      sender: { name: 'MałeNaklejki', email: 'no-reply@malenaklejki.pl' },
      to: [{ email: orderData.customer.email, name: `${orderData.customer.firstName} ${orderData.customer.lastName}` }],
      subject: `Twoje zamówienie w MałeNaklejki opłacone! (Nr: ${orderData.id})`,
      htmlContent: `
        <div style="font-family: sans-serif; max-w: 600px; margin: 0 auto; background-color: #fcfcfc; padding: 20px; border-radius: 20px; border: 2px solid #eaeaea;">
          <h2 style="color: #9b51e0;">Nasza drukarka już się cieszy na Twoje naklejki! 🎉</h2>
          <p style="font-size: 16px;">Hej <strong>${orderData.customer.firstName}</strong>,</p>
          <p style="font-size: 16px;">Pieniążki dotarły, a my już rozgrzewamy maszyny! Twoje zamówienie (Nr: <strong>${orderData.id}</strong>) trafiło do realizacji i zaraz zaczynamy czarować.</p>
          
          <h3 style="color: #333;">Co spakujemy do paczki?</h3>
          <ul style="font-size: 15px;">${itemsHtml}</ul>
          
          <h3 style="color: #333;">Gdzie to wyślemy?</h3>
          <p style="font-size: 15px;">${shippingInfo}</p>
          
          <h3 style="color: #333;">Papiery i rachunki:</h3>
          <p style="font-size: 15px;">${billingInfo}</p>
          <p style="font-size: 15px;"><strong>Zapłacono:</strong> ${orderData.totals.total.toFixed(2)} PLN</p>
          
          <p style="font-size: 16px;">Czas realizacji zamówienia wynosi zazwyczaj od 1 do 3 dni roboczych. Wyślemy Ci kolejną sowę (albo po prostu maila), jak tylko przesyłka ruszy w drogę!</p>
          <p style="font-size: 16px;">Wielkie dzięki i przybijamy wirtualną piątkę!<br/><strong>Zespół MałeNaklejki</strong></p>
        </div>
      `,
    };

    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'api-key': process.env.BREVO_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`Brevo API error: ${response.statusText}`);
    }

    console.log("Customer email sent successfully.");
  } catch (error) {
    console.error("Failed to send customer email", error);
  }
}

export async function sendAdminFulfillmentAlert(orderData: any) {
  if (!process.env.BREVO_API_KEY) {
    console.error("BREVO_API_KEY is missing");
    return;
  }

  try {
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@malenaklejki.pl';
    
    const itemsAdminHtml = orderData.items.map((item: any, index: number) => `
      <div style="border: 1px solid #eee; padding: 10px; margin-bottom: 10px;">
        <p><strong>Arkusz ${index + 1}:</strong> Drukuj obrazek <a href="${item.imageUrl}">${item.imageUrl}</a> w szerokości <strong>${item.widthCm} cm</strong>.</p>
        <p>Ilość takich arkuszy: <strong>${item.sheetQuantity}</strong></p>
      </div>
    `).join('');

    const shippingInfo = orderData.delivery.method === 'kurier' 
      ? `Kurier: ${orderData.customer.firstName} ${orderData.customer.lastName}<br/>${orderData.delivery.courierDetails.street} ${orderData.delivery.courierDetails.building}<br/>${orderData.delivery.courierDetails.postalCode} ${orderData.delivery.courierDetails.city}<br/>Tel: ${orderData.customer.phone}`
      : `Paczkomat InPost: <strong>${orderData.delivery.paczkomatDetails.lockerId}</strong><br/>Tel: ${orderData.customer.phone}<br/>Email: ${orderData.customer.email}`;

    const billingInfo = orderData.billing.wantsInvoice 
      ? `WYSTAW FAKTURĘ: NIP ${orderData.billing.nip}, Firma: ${orderData.billing.companyName}`
      : 'Paragon imienny';

    const payload = {
      sender: { name: 'System MałeNaklejki', email: 'system@malenaklejki.pl' },
      to: [{ email: adminEmail }],
      subject: `Nowe opłacone zamówienie! (${orderData.totals.total.toFixed(2)} PLN) - ${orderData.id}`,
      htmlContent: `
        <div style="font-family: sans-serif;">
          <h2>Nowe zamówienie opłacone!</h2>
          <p>ID: ${orderData.id}</p>
          <p>Email klienta: ${orderData.customer.email}</p>
          
          <h3>Produkty do druku:</h3>
          ${itemsAdminHtml}
          
          <h3>Dostawa:</h3>
          <p>${shippingInfo}</p>
          
          <h3>Dokument sprzedaży:</h3>
          <p>${billingInfo}</p>
        </div>
      `,
    };

    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'api-key': process.env.BREVO_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`Brevo API error: ${response.statusText}`);
    }

    console.log("Admin email sent successfully.");
  } catch (error) {
    console.error("Failed to send admin email", error);
  }
}
