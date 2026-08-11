export interface BLProduct {
  product_id?: string;
  name: string;
  price_brutto: number;
  tax_rate: number;
  quantity: number;
  weight?: number;
}

export interface BLOrderParameters {
  order_status_id?: number;
  custom_source_id?: number;
  date_add: number;
  user_comments?: string;
  admin_comments?: string;
  phone: string;
  email: string;
  user_login: string;
  currency: string;
  payment_method: string;
  payment_method_cod: number;
  paid: number;
  delivery_method: string;
  delivery_price: number;
  delivery_fullname: string;
  delivery_company: string;
  delivery_address: string;
  delivery_city: string;
  delivery_postcode: string;
  delivery_country_code: string;
  invoice_fullname: string;
  invoice_company: string;
  invoice_nip: string;
  invoice_address: string;
  invoice_city: string;
  invoice_postcode: string;
  invoice_country_code: string;
  want_invoice: number;
  extra_field_1?: string;
  extra_field_2?: string;
  custom_extra_fields?: Record<number, string>;
  products: BLProduct[];
}

/**
 * Zwraca token do BaseLinkera z process.env.
 * Funkcja wewnetrzna.
 */
function getBLToken(): string {
  const token = process.env.BASELINKER_TOKEN;
  if (!token) {
    console.warn("Brak BASELINKER_TOKEN w .env.local!");
  }
  return token || "";
}

/**
 * Wykonuje żądanie do API BaseLinkera
 */
async function callBaseLinkerAPI(method: string, parameters: object) {
  const token = getBLToken();
  if (!token) {
    return { status: "ERROR", error_message: "Brak tokenu BaseLinker" };
  }

  const url = "https://api.baselinker.com/connector.php";
  const body = new URLSearchParams();
  body.append("method", method);
  body.append("parameters", JSON.stringify(parameters));

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "X-BLToken": token,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: body.toString(),
    });

    if (!response.ok) {
      throw new Error(`HTTP Error: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error: any) {
    console.error(`BaseLinker API Error [${method}]:`, error);
    return { status: "ERROR", error_message: error.message };
  }
}

/**
 * Wysyła nowe zamówienie do systemu BaseLinker
 */
export async function addOrderToBaseLinker(params: BLOrderParameters) {
  return await callBaseLinkerAPI("addOrder", params);
}

/**
 * Oznacza zamówienie jako opłacone w systemie BaseLinker
 */
export async function setOrderPayment(orderId: number, paymentAmount: number, paymentDate: number, paymentComment: string) {
  return await callBaseLinkerAPI("setOrderPayment", {
    order_id: orderId,
    payment_done: paymentAmount,
    payment_date: paymentDate,
    payment_comment: paymentComment,
  });
}
