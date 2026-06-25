"use server";

import { checkRateLimit } from "@/lib/utils/rateLimit";
import { escapeHtml } from "@/lib/utils/sanitize";
import { headers } from "next/headers";

export async function sendContactMessage(formData: {
  name: string;
  email: string;
  subject: string;
  message: string;
}) {
  const headersList = await headers();
  const ip = headersList.get("x-forwarded-for") || "unknown";

  // Rate limiting (max 5 requests per hour)
  if (!checkRateLimit(`contact-${ip}`, 5, 3600000)) {
    return { success: false, error: "Wysłano zbyt wiele wiadomości. Spróbuj ponownie później." };
  }

  if (!process.env.BREVO_API_KEY) {
    console.error("BREVO_API_KEY is missing");
    return { success: false, error: "Serwer pocztowy nie jest skonfigurowany. Spróbuj skontaktować się bezpośrednio przez e-mail." };
  }

  try {
    const adminEmail = process.env.ADMIN_EMAIL || "kontakt@malenaklejki.pl";
    const year = new Date().getFullYear();

    const safeName = escapeHtml(formData.name);
    const safeEmail = escapeHtml(formData.email);
    const safeSubject = escapeHtml(formData.subject);
    const safeMessage = escapeHtml(formData.message);

    const htmlContent = `
<!DOCTYPE html>
<html lang="pl">
<head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/></head>
<body style="margin:0;padding:0;background-color:#f0fdf9;font-family:'Inter',system-ui,-apple-system,sans-serif;">
  <div style="max-width:620px;margin:0 auto;padding:32px 16px;">

    <!-- Header -->
    <div style="background:linear-gradient(135deg,#0f172a 0%,#1e293b 100%);border-radius:24px 24px 0 0;padding:28px 32px;text-align:center;">
      <div style="font-size:13px;font-weight:800;text-transform:uppercase;letter-spacing:3px;color:#a9e4d7;margin-bottom:8px;">
        MałeNaklejki · Formularz Kontaktowy
      </div>
      <h1 style="color:#ffffff;margin:0;font-size:22px;font-weight:900;">
        ✉️ Nowa wiadomość
      </h1>
    </div>

    <!-- Body -->
    <div style="background:#ffffff;padding:32px;border:1px solid #e2e8f0;border-top:none;">

      <!-- Sender badge -->
      <div style="background:linear-gradient(135deg,#f0fdf9,#ecfdf5);border:1.5px solid #a9e4d7;border-radius:16px;padding:18px 24px;margin-bottom:28px;">
        <p style="font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:2px;color:#64748b;margin:0 0 4px;">Od</p>
        <p style="font-size:20px;font-weight:900;color:#0f172a;margin:0;">${safeName}</p>
        <a href="mailto:${safeEmail}" style="font-size:14px;color:#a9e4d7;font-weight:700;text-decoration:none;">${safeEmail}</a>
      </div>

      <!-- Subject -->
      <h2 style="font-size:13px;font-weight:800;text-transform:uppercase;letter-spacing:1px;color:#94a3b8;margin-bottom:8px;margin-top:0;">Temat</h2>
      <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:14px 20px;margin-bottom:24px;">
        <p style="font-size:15px;font-weight:700;color:#0f172a;margin:0;">${safeSubject}</p>
      </div>

      <!-- Message -->
      <h2 style="font-size:13px;font-weight:800;text-transform:uppercase;letter-spacing:1px;color:#94a3b8;margin-bottom:8px;">Treść wiadomości</h2>
      <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:20px 24px;margin-bottom:28px;">
        <p style="font-size:14px;color:#334155;line-height:1.75;margin:0;white-space:pre-wrap;">${safeMessage}</p>
      </div>

      <!-- CTA -->
      <div style="text-align:center;">
        <a href="mailto:${safeEmail}?subject=Re: ${encodeURIComponent(formData.subject)}"
           style="display:inline-block;background:linear-gradient(135deg,#a9e4d7 0%,#6ee7b7 100%);color:#0f172a;font-weight:800;font-size:14px;padding:14px 36px;border-radius:14px;text-decoration:none;letter-spacing:0.2px;">
          Odpowiedz na wiadomość
        </a>
      </div>
    </div>

    <!-- Footer -->
    <div style="background:#f8fafc;border:1px solid #e2e8f0;border-top:none;border-radius:0 0 24px 24px;padding:16px 32px;text-align:center;">
      <p style="font-size:12px;color:#94a3b8;margin:0;">
        MałeNaklejki · System powiadomień · ${year}
      </p>
    </div>
  </div>
</body>
</html>`;

    const payload = {
      sender: { name: "MałeNaklejki – Formularz Kontaktowy", email: adminEmail },
      to: [{ email: adminEmail, name: "Kontakt MałeNaklejki" }],
      replyTo: { email: formData.email, name: formData.name },
      subject: `[Kontakt] ${formData.subject} — od ${formData.name}`,
      htmlContent,
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

export async function sendDesignInquiry(formData: {
  email: string;
  message: string;
}) {
  const headersList = await headers();
  const ip = headersList.get("x-forwarded-for") || "unknown";

  // Rate limiting (max 5 requests per hour)
  if (!checkRateLimit(`design-${ip}`, 5, 3600000)) {
    return { success: false, error: "Wysłano zbyt wiele zapytań. Spróbuj ponownie później." };
  }

  if (!process.env.BREVO_API_KEY) {
    console.error("BREVO_API_KEY is missing");
    return { success: false, error: "Serwer pocztowy nie jest skonfigurowany. Spróbuj skontaktować się bezpośrednio przez e-mail." };
  }

  try {
    const adminEmail = process.env.ADMIN_EMAIL || "kontakt@malenaklejki.pl";
    const year = new Date().getFullYear();

    const safeEmail = escapeHtml(formData.email);
    const safeMessage = escapeHtml(formData.message);

    const htmlContent = `
<!DOCTYPE html>
<html lang="pl">
<head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/></head>
<body style="margin:0;padding:0;background-color:#f0fdf9;font-family:'Inter',system-ui,-apple-system,sans-serif;">
  <div style="max-width:620px;margin:0 auto;padding:32px 16px;">

    <!-- Header -->
    <div style="background:linear-gradient(135deg,#02af7a 0%,#004749 100%);border-radius:24px 24px 0 0;padding:28px 32px;text-align:center;">
      <div style="font-size:13px;font-weight:800;text-transform:uppercase;letter-spacing:3px;color:#a9e4d7;margin-bottom:8px;">
        MałeNaklejki · Zapytanie o Projekt
      </div>
      <h1 style="color:#ffffff;margin:0;font-size:22px;font-weight:900;">
        🎨 Nowe zapytanie o projekt naklejki
      </h1>
    </div>

    <!-- Body -->
    <div style="background:#ffffff;padding:32px;border:1px solid #e2e8f0;border-top:none;">

      <!-- Sender badge -->
      <div style="background:linear-gradient(135deg,#f0fdf9,#ecfdf5);border:1.5px solid #a9e4d7;border-radius:16px;padding:18px 24px;margin-bottom:28px;">
        <p style="font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:2px;color:#64748b;margin:0 0 4px;">Klient</p>
        <a href="mailto:${safeEmail}" style="font-size:18px;color:#004749;font-weight:800;text-decoration:none;">${safeEmail}</a>
      </div>

      <!-- Message -->
      <h2 style="font-size:13px;font-weight:800;text-transform:uppercase;letter-spacing:1px;color:#94a3b8;margin-bottom:8px;">Opis pomysłu na naklejkę</h2>
      <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:20px 24px;margin-bottom:28px;">
        <p style="font-size:14px;color:#334155;line-height:1.75;margin:0;white-space:pre-wrap;">${safeMessage}</p>
      </div>

      <!-- CTA -->
      <div style="text-align:center;">
        <a href="mailto:${safeEmail}?subject=Re: Zapytanie o projekt naklejki"
           style="display:inline-block;background:linear-gradient(135deg,#02af7a 0%,#40be88 100%);color:#ffffff;font-weight:800;font-size:14px;padding:14px 36px;border-radius:14px;text-decoration:none;letter-spacing:0.2px;">
          Odpowiedz na zapytanie
        </a>
      </div>
    </div>

    <!-- Footer -->
    <div style="background:#f8fafc;border:1px solid #e2e8f0;border-top:none;border-radius:0 0 24px 24px;padding:16px 32px;text-align:center;">
      <p style="font-size:12px;color:#94a3b8;margin:0;">
        MałeNaklejki · System powiadomień · ${year}
      </p>
    </div>
  </div>
</body>
</html>`;

    const payload = {
      sender: { name: "MałeNaklejki – Zamówienie Projektu", email: adminEmail },
      to: [{ email: adminEmail, name: "Kontakt MałeNaklejki" }],
      replyTo: { email: formData.email, name: formData.email },
      subject: `[Projekt Naklejki] Nowe zapytanie od ${formData.email}`,
      htmlContent,
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
    console.error("sendDesignInquiry error:", error);
    return { success: false, error: "Nie udało się przesłać zapytania. Spróbuj ponownie później." };
  }
}
