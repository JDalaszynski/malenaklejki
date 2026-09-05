import "server-only";

import { escapeHtml } from "@/lib/utils/sanitize";

const BRAND_GREEN = "#02af7a";
const BRAND_DARK = "#004749";

export async function sendTransactionalEmail(payload: object): Promise<boolean> {
  const apiKey = process.env.BREVO_API_KEY;
  if (!apiKey) {
    console.error("BREVO_API_KEY is not set");
    return false;
  }
  try {
    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: { "api-key": apiKey, "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(20000),
    });
    if (!response.ok) {
      console.error("Brevo error:", response.status, await response.text());
      return false;
    }
    return true;
  } catch (error) {
    console.error("Brevo request failed:", error);
    return false;
  }
}

/**
 * Wspólna oprawa wiadomości systemowych — ten sam gradient, zaokrąglenia
 * i typografia co maile o zamówieniach, żeby klient rozpoznał nadawcę.
 */
function shell(opts: {
  heading: string;
  subheading?: string;
  body: string;
  ctaLabel?: string;
  ctaUrl?: string;
  footnote?: string;
}): string {
  const cta =
    opts.ctaLabel && opts.ctaUrl
      ? `
      <div style="text-align:center;margin:32px 0 8px;">
        <a href="${opts.ctaUrl}" style="display:inline-block;background:${BRAND_GREEN};color:#ffffff;text-decoration:none;font-size:16px;font-weight:800;padding:16px 36px;border-radius:16px;box-shadow:0 8px 20px -6px rgba(2,175,122,0.5);">
          ${escapeHtml(opts.ctaLabel)}
        </a>
      </div>
      <p style="font-size:12px;color:#94a3b8;text-align:center;line-height:1.6;margin:16px 0 0;">
        Jeśli przycisk nie działa, skopiuj ten adres do przeglądarki:<br/>
        <span style="color:#64748b;word-break:break-all;">${opts.ctaUrl}</span>
      </p>`
      : "";

  const footnote = opts.footnote
    ? `<div style="margin-top:28px;padding:16px 18px;background:#f4faf7;border:1.5px solid #d7ede4;border-radius:16px;">
         <p style="margin:0;font-size:13px;color:#475569;line-height:1.6;">${opts.footnote}</p>
       </div>`
    : "";

  return `<!DOCTYPE html>
<html lang="pl">
<head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/></head>
<body style="margin:0;padding:0;background-color:#f4faf7;font-family:'Inter',system-ui,-apple-system,sans-serif;">
  <div style="max-width:620px;margin:0 auto;padding:32px 16px;">

    <div style="background:linear-gradient(135deg,${BRAND_GREEN} 0%,${BRAND_DARK} 100%);border-radius:24px 24px 0 0;padding:36px 32px;text-align:center;">
      <div style="font-size:30px;font-weight:900;color:#ffffff;letter-spacing:-1px;margin-bottom:4px;">
        Małe<span style="color:#f4faf7;">Naklejki</span>
      </div>
      <div style="width:40px;height:3px;background:#ffffff;opacity:0.2;border-radius:2px;margin:8px auto 16px;"></div>
      <h1 style="color:#ffffff;margin:0;font-size:21px;font-weight:800;">${escapeHtml(opts.heading)}</h1>
      ${
        opts.subheading
          ? `<p style="color:#ffffff;opacity:0.95;margin:8px 0 0;font-size:14px;font-weight:500;">${escapeHtml(opts.subheading)}</p>`
          : ""
      }
    </div>

    <div style="background:#ffffff;padding:32px;border-left:1px solid #e2e8f0;border-right:1px solid #e2e8f0;">
      ${opts.body}
      ${cta}
      ${footnote}
    </div>

    <div style="background:#f1f5f9;border-radius:0 0 24px 24px;padding:22px 32px;text-align:center;border:1px solid #e2e8f0;border-top:none;">
      <p style="color:#64748b;font-size:12px;margin:0 0 6px;font-weight:500;">
        Wiadomość wysłana automatycznie przez sklep malenaklejki.pl
      </p>
      <p style="color:#94a3b8;font-size:11px;margin:0;">
        &copy; ${new Date().getFullYear()} MałeNaklejki &middot; Jakub Dalaszyński
      </p>
    </div>
  </div>
</body>
</html>`;
}

function sender() {
  const address = process.env.ADMIN_EMAIL || "kontakt@malenaklejki.pl";
  return { name: "MałeNaklejki", email: address };
}

/** Weryfikacja adresu przy rejestracji. */
export async function sendVerificationEmail(to: string, name: string, link: string) {
  const safeName = escapeHtml(name || "");
  return sendTransactionalEmail({
    sender: sender(),
    to: [{ email: to, name: name || to }],
    subject: "Potwierdź swój adres e-mail — MałeNaklejki",
    htmlContent: shell({
      heading: "Potwierdź swój adres e-mail",
      subheading: "Jeszcze jedno kliknięcie i konto jest gotowe",
      body: `
        <p style="font-size:16px;color:#334155;font-weight:600;margin-top:0;">
          ${safeName ? `Cześć <strong>${safeName}</strong>! 👋` : "Cześć! 👋"}
        </p>
        <p style="font-size:14px;color:#64748b;line-height:1.7;margin-bottom:0;">
          Dziękujemy za założenie konta w MałeNaklejki. Potwierdź adres e-mail, żeby odblokować
          historię zamówień i zamawiać wcześniejsze arkusze ponownie jednym kliknięciem.
        </p>`,
      ctaLabel: "Potwierdzam adres e-mail",
      ctaUrl: link,
      footnote:
        "Link jest ważny przez 1 godzinę. Jeśli to nie Ty zakładałeś konto, po prostu zignoruj tę wiadomość — bez kliknięcia nic się nie stanie.",
    }),
  });
}

/** Reset zapomnianego hasła. */
export async function sendPasswordResetEmail(to: string, name: string, link: string) {
  const safeName = escapeHtml(name || "");
  return sendTransactionalEmail({
    sender: sender(),
    to: [{ email: to, name: name || to }],
    subject: "Ustaw nowe hasło — MałeNaklejki",
    htmlContent: shell({
      heading: "Ustaw nowe hasło",
      subheading: "Prośba o zmianę hasła do konta",
      body: `
        <p style="font-size:16px;color:#334155;font-weight:600;margin-top:0;">
          ${safeName ? `Cześć <strong>${safeName}</strong>!` : "Cześć!"}
        </p>
        <p style="font-size:14px;color:#64748b;line-height:1.7;margin-bottom:0;">
          Ktoś (mamy nadzieję, że Ty) poprosił o ustawienie nowego hasła do konta
          <strong style="color:#0f172a;">${escapeHtml(to)}</strong>.
        </p>`,
      ctaLabel: "Ustawiam nowe hasło",
      ctaUrl: link,
      footnote:
        "Link jest ważny przez 1 godzinę i można go użyć tylko raz. <strong>Jeśli to nie Ty prosiłeś o zmianę hasła</strong>, zignoruj tę wiadomość — Twoje obecne hasło pozostaje aktywne.",
    }),
  });
}

/** Potwierdzenie nowego adresu przy zmianie e-maila. */
export async function sendEmailChangeVerification(to: string, name: string, link: string) {
  const safeName = escapeHtml(name || "");
  return sendTransactionalEmail({
    sender: sender(),
    to: [{ email: to, name: name || to }],
    subject: "Potwierdź nowy adres e-mail — MałeNaklejki",
    htmlContent: shell({
      heading: "Potwierdź nowy adres e-mail",
      subheading: "Zmiana adresu logowania do konta",
      body: `
        <p style="font-size:16px;color:#334155;font-weight:600;margin-top:0;">
          ${safeName ? `Cześć <strong>${safeName}</strong>!` : "Cześć!"}
        </p>
        <p style="font-size:14px;color:#64748b;line-height:1.7;margin-bottom:0;">
          Poprosiłeś o zmianę adresu e-mail w koncie MałeNaklejki na
          <strong style="color:#0f172a;">${escapeHtml(to)}</strong>.
          Adres zmieni się dopiero po kliknięciu poniższego przycisku — do tego czasu logujesz się
          starym adresem.
        </p>`,
      ctaLabel: "Potwierdzam nowy adres",
      ctaUrl: link,
      footnote:
        "Link jest ważny przez 1 godzinę. Jeśli nie prosiłeś o zmianę adresu, zignoruj tę wiadomość.",
    }),
  });
}

/** Ostrzeżenie na stary adres po zmianie e-maila lub hasła. */
export async function sendSecurityAlertEmail(
  to: string,
  name: string,
  change: { what: string; detail?: string }
) {
  const safeName = escapeHtml(name || "");
  return sendTransactionalEmail({
    sender: sender(),
    to: [{ email: to, name: name || to }],
    subject: `Zmiana w Twoim koncie — ${change.what}`,
    htmlContent: shell({
      heading: "Zmiana ustawień konta",
      subheading: change.what,
      body: `
        <p style="font-size:16px;color:#334155;font-weight:600;margin-top:0;">
          ${safeName ? `Cześć <strong>${safeName}</strong>!` : "Cześć!"}
        </p>
        <p style="font-size:14px;color:#64748b;line-height:1.7;margin-bottom:0;">
          Informujemy, że w Twoim koncie MałeNaklejki nastąpiła zmiana:
          <strong style="color:#0f172a;">${escapeHtml(change.what)}</strong>${
            change.detail ? ` — ${escapeHtml(change.detail)}` : ""
          }.
          Data: ${new Date().toLocaleString("pl-PL", { timeZone: "Europe/Warsaw" })}.
        </p>`,
      footnote:
        "<strong>Jeśli to nie Ty wprowadzałeś tę zmianę</strong>, natychmiast napisz na kontakt@malenaklejki.pl — pomożemy odzyskać dostęp do konta.",
    }),
  });
}

/** Skąd wzięło się konto — trafia do powiadomienia dla sklepu. */
export type AccountSource = "form" | "google" | "order";

const ACCOUNT_SOURCE_LABELS: Record<AccountSource, string> = {
  form: "formularz rejestracji",
  google: "logowanie przez Google",
  order: "przy składaniu zamówienia",
};

/**
 * Powiadomienie dla sklepu o nowym koncie.
 *
 * Idzie na adres z `ADMIN_EMAIL`, czyli tam, gdzie i tak lądują zamówienia.
 * Nigdy nie przerywa rejestracji — nieudana wysyłka trafia tylko do logów,
 * bo klient nie może stracić konta przez problem z pocztą.
 */
export async function sendNewAccountAdminNotification(account: {
  email: string;
  firstName?: string;
  lastName?: string;
  source: AccountSource;
  marketingConsent?: boolean;
}): Promise<void> {
  try {
    const adminEmail = process.env.ADMIN_EMAIL || "kontakt@malenaklejki.pl";
    const name = `${account.firstName ?? ""} ${account.lastName ?? ""}`.trim();
    const rows: [string, string][] = [
      ["Adres e-mail", account.email],
      ["Imię i nazwisko", name || "—"],
      ["Skąd", ACCOUNT_SOURCE_LABELS[account.source]],
      ["Zgoda marketingowa", account.marketingConsent ? "tak" : "nie"],
      ["Kiedy", new Date().toLocaleString("pl-PL", { timeZone: "Europe/Warsaw" })],
    ];

    await sendTransactionalEmail({
      sender: { name: "MałeNaklejki - System kont", email: adminEmail },
      to: [{ email: adminEmail, name: "MałeNaklejki - Sprzedawca" }],
      replyTo: { email: account.email, name: name || account.email },
      subject: `👤 Nowe konto w sklepie — ${account.email}`,
      htmlContent: shell({
        heading: "Nowe konto w sklepie",
        subheading: name || account.email,
        body: `
        <table role="presentation" style="width:100%;border-collapse:collapse;font-size:14px;color:#334155;">
          ${rows
            .map(
              ([label, value]) => `
            <tr>
              <td style="padding:9px 0;border-bottom:1px solid #e2e8f0;color:#64748b;font-weight:600;width:44%;">${escapeHtml(label)}</td>
              <td style="padding:9px 0;border-bottom:1px solid #e2e8f0;color:#0f172a;font-weight:700;">${escapeHtml(value)}</td>
            </tr>`
            )
            .join("")}
        </table>`,
        footnote:
          "Adres nie jest jeszcze potwierdzony — konto odsłania historię zamówień dopiero po kliknięciu w link weryfikacyjny.",
      }),
    });
  } catch (error) {
    console.error("sendNewAccountAdminNotification error:", error);
  }
}

/**
 * Zaproszenie dla gościa, który złożył zamówienie bez konta.
 * Hasło ustawia klikając link — nie wysyłamy żadnego hasła mailem.
 */
export async function sendClaimAccountEmail(
  to: string,
  name: string,
  link: string,
  orderNumber: string
) {
  const safeName = escapeHtml(name || "");
  return sendTransactionalEmail({
    sender: sender(),
    to: [{ email: to, name: name || to }],
    subject: `Zapisz zamówienie ${orderNumber} w swoim koncie — MałeNaklejki`,
    htmlContent: shell({
      heading: "Zachowaj swoje naklejki na przyszłość",
      subheading: `Zamówienie ${orderNumber} czeka, żeby trafić do Twojego konta`,
      body: `
        <p style="font-size:16px;color:#334155;font-weight:600;margin-top:0;">
          ${safeName ? `Cześć <strong>${safeName}</strong>! 👋` : "Cześć! 👋"}
        </p>
        <p style="font-size:14px;color:#64748b;line-height:1.7;margin-bottom:16px;">
          Załóż konto jednym kliknięciem — wystarczy, że ustawisz hasło. Zamówienie
          <strong style="color:#0f172a;">${escapeHtml(orderNumber)}</strong> od razu w nim wyląduje,
          razem z arkuszami, które zaprojektowałeś.
        </p>
        <div style="background:#f4faf7;border:1.5px solid ${BRAND_GREEN};border-radius:16px;padding:18px 20px;">
          <p style="margin:0 0 10px;font-size:13px;font-weight:800;color:${BRAND_DARK};text-transform:uppercase;letter-spacing:1px;">Co zyskujesz</p>
          <p style="margin:0;font-size:14px;color:#475569;line-height:1.8;">
            &bull; Podgląd wszystkich zamówień i ich statusów<br/>
            &bull; Zamówienie wcześniejszych arkuszy ponownie, bez projektowania od zera<br/>
            &bull; Formularz zamówienia wypełniony za Ciebie
          </p>
        </div>`,
      ctaLabel: "Ustawiam hasło i zakładam konto",
      ctaUrl: link,
      footnote:
        "Link jest ważny przez 30 dni. Nie musisz zakładać konta — Twoje zamówienie realizujemy tak czy inaczej.",
    }),
  });
}
