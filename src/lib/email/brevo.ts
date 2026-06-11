export async function sendCustomerConfirmationEmail(orderData: any) {
  if (!process.env.BREVO_API_KEY) {
    console.error("BREVO_API_KEY is missing");
    return;
  }

  try {
    const adminEmail = process.env.ADMIN_EMAIL || "kontakt@malenaklejki.pl";

    const itemsHtml = orderData.items.map((item: any) => `
      <table cellpadding="0" cellspacing="0" border="0" style="width: 100%; margin-bottom: 12px; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; border-collapse: separate; overflow: hidden;">
        <tr>
          <td style="padding: 16px; width: 64px; vertical-align: middle;">
            <div style="width: 64px; height: 64px; background-color: #f8fafc; border-radius: 12px; border: 1px solid #f1f5f9; text-align: center; line-height: 60px;">
              <img src="${item.imageUrl}" style="max-width: 60px; max-height: 60px; vertical-align: middle; border-radius: 8px;" alt="Podgląd" />
            </div>
          </td>
          <td style="padding: 16px 8px 16px 0; vertical-align: middle; font-family: 'Inter', system-ui, -apple-system, sans-serif;">
            <h4 style="margin: 0; font-size: 15px; color: #0f172a; font-weight: 700;">Arkusz A4 z naklejkami</h4>
            <p style="margin: 4px 0 0 0; font-size: 13px; color: #64748b; font-weight: 500; line-height: 1.4;">
              Szerokość naklejki: <strong>${item.widthCm} cm</strong><br/>
              Naklejek na arkuszu: <strong>${item.stickersPerSheet} szt.</strong>
            </p>
            <p style="margin: 4px 0 0 0; font-size: 13px; color: #a855f7; font-weight: 700;">
              Liczba arkuszy: ${item.sheetQuantity} szt.
            </p>
          </td>
          <td style="padding: 16px; text-align: right; vertical-align: middle; font-family: 'Inter', system-ui, -apple-system, sans-serif; width: 100px;">
            <span style="font-size: 15px; font-weight: 800; color: #0f172a;">${(item.pricePerSheet * item.sheetQuantity).toFixed(2)} PLN</span>
          </td>
        </tr>
      </table>
    `).join('');

    const shippingInfo = orderData.delivery.method === 'kurier' 
      ? `Kurier pod drzwi:<br/><strong>${orderData.customer.firstName} ${orderData.customer.lastName}</strong><br/>${orderData.delivery.courierDetails.street} ${orderData.delivery.courierDetails.building}<br/>${orderData.delivery.courierDetails.postalCode} ${orderData.delivery.courierDetails.city}`
      : `Paczkomat InPost:<br/>Punkt: <strong>${orderData.delivery.paczkomatDetails.lockerId}</strong><br/>Adres: ${orderData.delivery.paczkomatDetails.address}`;

    const billingInfo = orderData.billing.wantsInvoice 
      ? `Faktura VAT:<br/>NIP: <strong>${orderData.billing.nip}</strong><br/>Firma: <strong>${orderData.billing.companyName}</strong>`
      : 'Paragon (brak żądania faktury VAT)';

    const payload = {
      // Must use a verified sender email address in Brevo (normally adminEmail)
      sender: { name: 'MałeNaklejki', email: adminEmail },
      to: [{ email: orderData.customer.email, name: `${orderData.customer.firstName} ${orderData.customer.lastName}` }],
      subject: `Twoje zamówienie w MałeNaklejki zostało opłacone! (Nr: ${orderData.id})`,
      htmlContent: `
        <div style="font-family: 'Inter', system-ui, -apple-system, sans-serif; background-color: #f8fafc; padding: 40px 20px; color: #1e293b; margin: 0;">
          <div style="max-w: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 24px; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05); overflow: hidden; border: 1px solid #e2e8f0;">
            <!-- Header Banner with Brand Colors -->
            <div style="background: linear-gradient(135deg, #a855f7 0%, #ec4899 100%); padding: 36px 24px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 800; letter-spacing: -0.5px;">MałeNaklejki</h1>
              <p style="color: rgba(255, 255, 255, 0.95); margin: 8px 0 0 0; font-size: 15px; font-weight: 500;">Dziękujemy za złożenie zamówienia! 🎉</p>
            </div>
            
            <!-- Body -->
            <div style="padding: 32px 24px;">
              <h2 style="color: #0f172a; margin-top: 0; margin-bottom: 8px; font-size: 20px; font-weight: 800;">Hej ${orderData.customer.firstName}!</h2>
              <p style="font-size: 15px; line-height: 1.6; color: #475569; margin-top: 0; margin-bottom: 24px;">
                Otrzymaliśmy płatność za Twoje zamówienie o numerze <strong style="color: #0f172a;">${orderData.id}</strong>. Maszyny drukarskie są już rozgrzewane i wkrótce rozpoczynamy produkcję!
              </p>
              
              <!-- Items List -->
              <h3 style="color: #0f172a; font-size: 16px; font-weight: 700; margin-top: 0; margin-bottom: 16px; border-bottom: 1px solid #f1f5f9; padding-bottom: 8px;">Zamówione produkty</h3>
              ${itemsHtml}
              
              <!-- Shipping & Billing Cards -->
              <table cellpadding="0" cellspacing="0" border="0" style="width: 100%; margin-top: 24px; margin-bottom: 24px;">
                <tr>
                  <td style="width: 50%; padding-right: 10px; vertical-align: top;">
                    <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 16px; padding: 16px; height: 140px;">
                      <h4 style="margin: 0 0 8px 0; font-size: 13px; font-weight: 800; color: #0f172a; text-transform: uppercase; letter-spacing: 0.5px;">Dostawa</h4>
                      <p style="margin: 0; font-size: 13px; color: #475569; line-height: 1.5; font-family: 'Inter', system-ui, sans-serif;">${shippingInfo}</p>
                    </div>
                  </td>
                  <td style="width: 50%; padding-left: 10px; vertical-align: top;">
                    <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 16px; padding: 16px; height: 140px;">
                      <h4 style="margin: 0 0 8px 0; font-size: 13px; font-weight: 800; color: #0f172a; text-transform: uppercase; letter-spacing: 0.5px;">Rozliczenie</h4>
                      <p style="margin: 0; font-size: 13px; color: #475569; line-height: 1.5; font-family: 'Inter', system-ui, sans-serif;">${billingInfo}</p>
                    </div>
                  </td>
                </tr>
              </table>
              
              <!-- Totals Table -->
              <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 16px; padding: 20px;">
                <table cellpadding="0" cellspacing="0" border="0" style="width: 100%; font-family: 'Inter', system-ui, -apple-system, sans-serif; font-size: 14px; color: #475569;">
                  <tr>
                    <td style="padding: 4px 0;">Wartość produktów:</td>
                    <td style="padding: 4px 0; text-align: right; font-weight: 600; color: #0f172a;">${orderData.totals.subtotal.toFixed(2)} PLN</td>
                  </tr>
                  <tr>
                    <td style="padding: 4px 0;">Koszt dostawy:</td>
                    <td style="padding: 4px 0; text-align: right; font-weight: 600; color: #0f172a;">${orderData.totals.shipping.toFixed(2)} PLN</td>
                  </tr>
                  <tr style="font-size: 16px; font-weight: 800;">
                    <td style="padding: 12px 0 0 0; border-top: 1px solid #e2e8f0; color: #0f172a;">Łączna kwota:</td>
                    <td style="padding: 12px 0 0 0; border-top: 1px solid #e2e8f0; text-align: right; color: #a855f7; font-size: 18px;">${orderData.totals.total.toFixed(2)} PLN</td>
                  </tr>
                </table>
              </div>
              
              <!-- Info Box -->
              <div style="margin-top: 32px; text-align: center;">
                <p style="font-size: 14px; color: #64748b; line-height: 1.5; margin: 0;">
                  Czas realizacji zamówienia wynosi zazwyczaj od <strong>1 do 3 dni roboczych</strong>.<br/>
                  Otrzymasz kolejną wiadomość, gdy tylko przesyłka wyruszy w drogę.
                </p>
              </div>
            </div>
            
            <!-- Footer -->
            <div style="background-color: #f1f5f9; padding: 24px; text-align: center; border-top: 1px solid #e2e8f0;">
              <p style="color: #64748b; font-size: 13px; margin: 0 0 8px 0; font-weight: 500;">Masz pytania? Odpowiedz na tego e-maila lub skontaktuj się z nami.</p>
              <p style="color: #94a3b8; font-size: 11px; margin: 0;">&copy; ${new Date().getFullYear()} MałeNaklejki. Wszelkie prawa zastrzeżone.</p>
            </div>
          </div>
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
      <table cellpadding="0" cellspacing="0" border="0" style="width: 100%; margin-bottom: 12px; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; border-collapse: separate; overflow: hidden;">
        <tr>
          <td style="padding: 16px; width: 64px; vertical-align: middle;">
            <div style="width: 64px; height: 64px; background-color: #f8fafc; border-radius: 12px; border: 1px solid #f1f5f9; text-align: center; line-height: 60px;">
              <img src="${item.imageUrl}" style="max-width: 60px; max-height: 60px; vertical-align: middle; border-radius: 8px;" alt="Podgląd" />
            </div>
          </td>
          <td style="padding: 16px; vertical-align: middle; font-family: 'Inter', system-ui, -apple-system, sans-serif;">
            <h4 style="margin: 0; font-size: 15px; color: #0f172a; font-weight: 700;">Arkusz #${index + 1}</h4>
            <p style="margin: 4px 0 0 0; font-size: 13px; color: #475569; line-height: 1.4;">
              Szerokość naklejki: <strong>${item.widthCm} cm</strong> | Ilość sztuk na arkuszu: <strong>${item.stickersPerSheet} szt.</strong><br/>
              Liczba arkuszy do wydruku: <strong style="color: #a855f7; font-size: 14px;">${item.sheetQuantity} szt.</strong>
            </p>
            <p style="margin: 6px 0 0 0; font-size: 12px;">
              <a href="${item.imageUrl}" style="color: #a855f7; text-decoration: none; font-weight: 700; border-bottom: 1px dashed #a855f7;" target="_blank">Pobierz obraz do druku &rarr;</a>
            </p>
          </td>
        </tr>
      </table>
    `).join('');

    const shippingInfo = orderData.delivery.method === 'kurier' 
      ? `<strong>Kurier DPD/InPost:</strong><br/>Odbiorca: ${orderData.customer.firstName} ${orderData.customer.lastName}<br/>Adres: ${orderData.delivery.courierDetails.street} ${orderData.delivery.courierDetails.building}<br/>Kod i miasto: ${orderData.delivery.courierDetails.postalCode} ${orderData.delivery.courierDetails.city}<br/>Telefon: <strong>${orderData.customer.phone}</strong>`
      : `<strong>Paczkomat InPost:</strong><br/>Punkt: <strong>${orderData.delivery.paczkomatDetails.lockerId}</strong><br/>Adres punktu: ${orderData.delivery.paczkomatDetails.address}<br/>Telefon klienta: <strong>${orderData.customer.phone}</strong>`;

    const billingInfo = orderData.billing.wantsInvoice 
      ? `<strong>Dane do faktury VAT:</strong><br/>NIP: <strong>${orderData.billing.nip}</strong><br/>Nazwa: ${orderData.billing.companyName}`
      : '<strong>Dokument sprzedaży:</strong> Paragon imienny';

    const payload = {
      // Must use a verified sender email address in Brevo (normally adminEmail)
      sender: { name: 'System MałeNaklejki', email: adminEmail },
      to: [{ email: adminEmail, name: 'Admin MałeNaklejki' }],
      subject: `Nowe opłacone zamówienie! (${orderData.totals.total.toFixed(2)} PLN) - ${orderData.id}`,
      htmlContent: `
        <div style="font-family: 'Inter', system-ui, -apple-system, sans-serif; background-color: #f8fafc; padding: 40px 20px; color: #1e293b; margin: 0;">
          <div style="max-w: 650px; margin: 0 auto; background-color: #ffffff; border-radius: 24px; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05); overflow: hidden; border: 1px solid #e2e8f0;">
            <!-- Header -->
            <div style="background-color: #0f172a; padding: 24px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 20px; font-weight: 800; letter-spacing: -0.5px;">Nowe zamówienie do realizacji! 🚀</h1>
              <p style="color: #94a3b8; margin: 4px 0 0 0; font-size: 13px; font-weight: 500;">ID: ${orderData.id} | Status: OPŁACONE</p>
            </div>
            
            <div style="padding: 24px;">
              <!-- Customer details -->
              <table cellpadding="0" cellspacing="0" border="0" style="width: 100%; margin-bottom: 24px; font-size: 14px; background-color: #f8fafc; border-radius: 16px; border: 1px solid #e2e8f0; border-collapse: separate; overflow: hidden;">
                <tr>
                  <td style="padding: 16px;">
                    <strong>Dane klienta:</strong><br/>
                    ${orderData.customer.firstName} ${orderData.customer.lastName}<br/>
                    E-mail: <a href="mailto:${orderData.customer.email}" style="color: #a855f7; text-decoration: none;">${orderData.customer.email}</a><br/>
                    Tel: ${orderData.customer.phone}
                  </td>
                </tr>
              </table>
              
              <!-- Items for print -->
              <h3 style="color: #0f172a; font-size: 15px; font-weight: 800; margin-top: 0; margin-bottom: 12px; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 1px solid #f1f5f9; padding-bottom: 6px;">Grafiki do wydruku</h3>
              ${itemsAdminHtml}
              
              <!-- Shipping & Billing -->
              <table cellpadding="0" cellspacing="0" border="0" style="width: 100%; margin-top: 24px; margin-bottom: 24px;">
                <tr>
                  <td style="width: 50%; padding-right: 10px; vertical-align: top;">
                    <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 16px; padding: 16px; min-height: 120px; font-size: 13px; line-height: 1.5; font-family: 'Inter', system-ui, sans-serif;">
                      ${shippingInfo}
                    </div>
                  </td>
                  <td style="width: 50%; padding-left: 10px; vertical-align: top;">
                    <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 16px; padding: 16px; min-height: 120px; font-size: 13px; line-height: 1.5; font-family: 'Inter', system-ui, sans-serif;">
                      ${billingInfo}
                    </div>
                  </td>
                </tr>
              </table>
              
              <!-- Cost Summary -->
              <div style="background-color: #0f172a; color: #ffffff; border-radius: 16px; padding: 16px; text-align: center; font-size: 16px; font-weight: 800;">
                Suma zamówienia: <span style="color: #ec4899; font-size: 20px;">${orderData.totals.total.toFixed(2)} PLN</span>
              </div>
            </div>
            
            <!-- Footer -->
            <div style="background-color: #f1f5f9; padding: 16px; text-align: center; border-top: 1px solid #e2e8f0; font-size: 12px; color: #94a3b8;">
              System automatyczny MałeNaklejki. Wszelkie prawa zastrzeżone.
            </div>
          </div>
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
