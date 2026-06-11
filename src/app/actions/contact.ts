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
      sender: { name: formData.name, email: formData.email },
      to: [{ email: adminEmail, name: "Kontakt MałeNaklejki" }],
      replyTo: { email: formData.email, name: formData.name },
      subject: `[Formularz Kontaktowy] ${formData.subject}`,
      htmlContent: `
        <div style="font-family: sans-serif; max-w: 600px; margin: 0 auto; background-color: #fcfcfc; padding: 25px; border-radius: 20px; border: 2px solid #eaeaea;">
          <h2 style="color: #9b51e0; margin-bottom: 20px; font-weight: 800;">Wiadomość z formularza kontaktowego</h2>
          
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 25px; font-size: 14px;">
            <tr>
              <td style="padding: 8px 0; font-weight: bold; border-bottom: 1px solid #eee; width: 140px; color: #555;">Imię i nazwisko:</td>
              <td style="padding: 8px 0; border-bottom: 1px solid #eee; font-weight: 600;">${formData.name}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: bold; border-bottom: 1px solid #eee; color: #555;">Adres e-mail:</td>
              <td style="padding: 8px 0; border-bottom: 1px solid #eee; font-weight: 600;"><a href="mailto:${formData.email}" style="color: #9b51e0;">${formData.email}</a></td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: bold; border-bottom: 1px solid #eee; color: #555;">Temat:</td>
              <td style="padding: 8px 0; border-bottom: 1px solid #eee; font-weight: 600;">${formData.subject}</td>
            </tr>
          </table>
          
          <h3 style="color: #333; margin-top: 20px; font-weight: 700;">Treść wiadomości:</h3>
          <p style="font-size: 15px; line-height: 1.6; white-space: pre-line; background-color: #ffffff; padding: 20px; border-radius: 12px; border: 1px solid #eaeaea; color: #333;">
            ${formData.message}
          </p>
          
          <p style="font-size: 11px; color: #888; margin-top: 30px; border-top: 1px solid #eee; padding-top: 15px; text-align: center;">
            Wiadomość wygenerowana automatycznie przez system sklepu MałeNaklejki.
          </p>
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
      throw new Error(`Brevo API error: ${response.statusText}`);
    }

    return { success: true };
  } catch (error: any) {
    console.error("sendContactMessage error:", error);
    return { success: false, error: "Nie udało się przesłać wiadomości. Spróbuj ponownie później." };
  }
}
