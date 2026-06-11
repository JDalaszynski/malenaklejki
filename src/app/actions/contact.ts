"use server";

export async function sendContactMessage(formData: {
  name: string;
  email: string;
  subject: string;
  message: string;
}) {
  if (!process.env.BREVO_API_KEY) {
    console.error("BREVO_API_KEY is missing");
    return { success: false, error: "Serwer pocztowy nie jest skonfigurowany. Spróbuj skontaktować się bezpośrednio przez e-mail." };
  }

  try {
    const adminEmail = process.env.ADMIN_EMAIL || "kontakt@malenaklejki.pl";
    const payload = {
      // Must use a verified sender email in Brevo (typically adminEmail) to avoid 400 Bad Request
      sender: { name: `${formData.name} (Formularz Kontaktowy)`, email: adminEmail },
      to: [{ email: adminEmail, name: "Kontakt MałeNaklejki" }],
      replyTo: { email: formData.email, name: formData.name },
      subject: `[Formularz Kontaktowy] ${formData.subject}`,
      htmlContent: `
        <div style="font-family: 'Inter', system-ui, -apple-system, sans-serif; background-color: #f8fafc; padding: 40px 20px; color: #1e293b; margin: 0;">
          <div style="max-w: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 24px; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05); overflow: hidden; border: 1px solid #e2e8f0;">
            <!-- Header with gradient -->
            <div style="background: linear-gradient(135deg, #a855f7 0%, #ec4899 100%); padding: 32px 24px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 26px; font-weight: 800; letter-spacing: -0.5px;">MałeNaklejki</h1>
              <p style="color: rgba(255, 255, 255, 0.9); margin: 6px 0 0 0; font-size: 14px; font-weight: 500;">Nowa wiadomość z formularza kontaktowego</p>
            </div>
            
            <!-- Content Body -->
            <div style="padding: 32px 24px;">
              <h2 style="color: #0f172a; margin-top: 0; margin-bottom: 24px; font-size: 18px; font-weight: 700; border-bottom: 1px solid #f1f5f9; padding-bottom: 12px;">Szczegóły zgłoszenia</h2>
              
              <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
                <tr>
                  <td style="padding: 10px 0; font-size: 14px; color: #64748b; font-weight: 600; width: 150px;">Nadawca:</td>
                  <td style="padding: 10px 0; font-size: 14px; color: #0f172a; font-weight: 700;">${formData.name}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 0; font-size: 14px; color: #64748b; font-weight: 600;">E-mail:</td>
                  <td style="padding: 10px 0; font-size: 14px; color: #0f172a; font-weight: 700;">
                    <a href="mailto:${formData.email}" style="color: #a855f7; text-decoration: none; border-bottom: 1px dashed #a855f7;">${formData.email}</a>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 10px 0; font-size: 14px; color: #64748b; font-weight: 600;">Temat:</td>
                  <td style="padding: 10px 0; font-size: 14px; color: #0f172a; font-weight: 700;">${formData.subject}</td>
                </tr>
              </table>
              
              <div style="background-color: #f8fafc; border-radius: 16px; border: 1px solid #e2e8f0; padding: 24px; margin-bottom: 32px;">
                <h3 style="color: #475569; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; margin-top: 0; margin-bottom: 12px;">Treść wiadomości:</h3>
                <p style="color: #334155; font-size: 15px; line-height: 1.6; margin: 0; white-space: pre-wrap;">${formData.message}</p>
              </div>
              
              <!-- Action Button -->
              <div style="text-align: center; margin-bottom: 16px;">
                <a href="mailto:${formData.email}?subject=Re: [Formularz Kontaktowy] ${encodeURIComponent(formData.subject)}" style="display: inline-block; background: linear-gradient(135deg, #a855f7 0%, #ec4899 100%); color: #ffffff; font-weight: 700; font-size: 14px; padding: 14px 32px; border-radius: 12px; text-decoration: none; box-shadow: 0 4px 12px rgba(168, 85, 247, 0.2);">
                  Odpowiedz na e-mail
                </a>
              </div>
            </div>
            
            <!-- Footer -->
            <div style="background-color: #f1f5f9; padding: 20px 24px; text-align: center; border-top: 1px solid #e2e8f0;">
              <p style="color: #94a3b8; font-size: 12px; margin: 0;">Wiadomość wygenerowana automatycznie przez system sklepu MałeNaklejki.</p>
            </div>
          </div>
        </div>
      `,
    };

    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "api-key": process.env.BREVO_API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Brevo API error details:", errorText);
      throw new Error(`Brevo API error: ${response.status} ${response.statusText} - ${errorText}`);
    }

    return { success: true };
  } catch (error: any) {
    console.error("sendContactMessage error:", error);
    return { success: false, error: "Nie udało się przesłać wiadomości. Spróbuj ponownie później." };
  }
}
