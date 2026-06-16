import crypto from "crypto";
import { z } from "zod";

const p24EnvSchema = z.object({
  P24_MERCHANT_ID: z.string().min(1, "Brak P24_MERCHANT_ID"),
  P24_POS_ID: z.string().min(1, "Brak P24_POS_ID"),
  P24_CRC: z.string().min(1, "Brak P24_CRC"),
  P24_API_KEY: z.string().min(1, "Brak P24_API_KEY"),
  P24_ENV: z.enum(["sandbox", "production"]).default("production"),
});

export function getP24Config() {
  const parsed = p24EnvSchema.safeParse(process.env);
  if (!parsed.success) {
    throw new Error(`Błąd konfiguracji P24: ${parsed.error.message}`);
  }
  return parsed.data;
}

export function getP24BaseUrl(env: "sandbox" | "production") {
  return env === "sandbox"
    ? "https://sandbox.przelewy24.pl/api/v1"
    : "https://secure.przelewy24.pl/api/v1";
}

export function generateP24Sign(data: Record<string, any>): string {
  const jsonString = JSON.stringify(data);
  return crypto.createHash("sha384").update(jsonString).digest("hex");
}

export async function registerTransaction(data: {
  sessionId: string;
  amount: number; // w groszach
  currency: string;
  description: string;
  email: string;
  client: string;
  urlReturn: string;
  urlStatus: string;
}) {
  const config = getP24Config();
  const merchantId = parseInt(config.P24_MERCHANT_ID, 10);
  const posId = parseInt(config.P24_POS_ID, 10);

  const signData = {
    sessionId: data.sessionId,
    merchantId,
    amount: data.amount,
    currency: data.currency,
    crc: config.P24_CRC,
  };

  const sign = generateP24Sign(signData);

  const payload = {
    merchantId,
    posId,
    sessionId: data.sessionId,
    amount: data.amount,
    currency: data.currency,
    description: data.description,
    email: data.email,
    client: data.client,
    country: "PL",
    language: "pl",
    urlReturn: data.urlReturn,
    urlStatus: data.urlStatus,
    sign,
  };

  const url = `${getP24BaseUrl(config.P24_ENV)}/transaction/register`;

  const auth = Buffer.from(`${merchantId}:${config.P24_API_KEY}`).toString("base64");

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Basic ${auth}`,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Błąd rejestracji transakcji P24: ${response.status} ${errorText}`);
  }

  const result = await response.json();
  if (result.data && result.data.token) {
    const paymentUrl = config.P24_ENV === "sandbox"
      ? `https://sandbox.przelewy24.pl/trnRequest/${result.data.token}`
      : `https://secure.przelewy24.pl/trnRequest/${result.data.token}`;
    return { token: result.data.token, paymentUrl };
  }

  throw new Error("Brak tokena w odpowiedzi P24");
}

export async function verifyTransaction(data: {
  sessionId: string;
  orderId: number;
  amount: number; // w groszach
  currency: string;
}) {
  const config = getP24Config();
  const merchantId = parseInt(config.P24_MERCHANT_ID, 10);
  const posId = parseInt(config.P24_POS_ID, 10);

  const signData = {
    sessionId: data.sessionId,
    orderId: data.orderId,
    amount: data.amount,
    currency: data.currency,
    crc: config.P24_CRC,
  };

  const sign = generateP24Sign(signData);

  const payload = {
    merchantId,
    posId,
    sessionId: data.sessionId,
    amount: data.amount,
    currency: data.currency,
    orderId: data.orderId,
    sign,
  };

  const url = `${getP24BaseUrl(config.P24_ENV)}/transaction/verify`;
  const auth = Buffer.from(`${merchantId}:${config.P24_API_KEY}`).toString("base64");

  const response = await fetch(url, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Basic ${auth}`,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Błąd weryfikacji transakcji P24: ${response.status} ${errorText}`);
  }

  const result = await response.json();
  return result;
}

export function verifyWebhookSignature(payload: any): boolean {
  try {
    const config = getP24Config();
    const signData = {
      merchantId: payload.merchantId,
      posId: payload.posId,
      sessionId: payload.sessionId,
      amount: payload.amount,
      originAmount: payload.originAmount,
      currency: payload.currency,
      orderId: payload.orderId,
      methodId: payload.methodId,
      statement: payload.statement,
      crc: config.P24_CRC,
    };
    
    const expectedSign = generateP24Sign(signData);
    return payload.sign === expectedSign;
  } catch (e) {
    return false;
  }
}
