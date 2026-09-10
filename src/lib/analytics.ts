/**
 * Zdarzenia e-commerce GA4.
 *
 * Wysyłamy je przez `gtag` zdefiniowany w `app/layout.tsx`, więc o tym, co
 * faktycznie trafi do Google Analytics, decyduje ustawiony tam consent mode
 * (domyślnie `denied`, aktualizowany przez `CookieBanner`). Bez
 * `NEXT_PUBLIC_GA_ID` gtag nie istnieje i wszystkie funkcje nic nie robią.
 *
 * Jednostką sprzedaży jest arkusz A4, więc każda pozycja koszyka to produkt
 * `arkusz-a4` z liczbą arkuszy w `quantity` — raporty GA4 pokazują wtedy wprost
 * liczbę arkuszy na zamówienie. `value` to wartość arkuszy brutto; dostawa idzie
 * osobno w `shipping`, bo w rachunku zysku jest neutralna.
 */

const CURRENCY = "PLN";

export type AnalyticsSheet = {
  sheetQuantity: number;
  pricePerSheet: number;
  deliveryForm?: "sheet" | "individual";
};

type Gtag = (command: "event", eventName: string, params: Record<string, unknown>) => void;

function send(eventName: string, params: Record<string, unknown>) {
  if (typeof window === "undefined") return;
  const gtag = (window as Window & { gtag?: Gtag }).gtag;
  if (typeof gtag !== "function") return;
  try {
    gtag("event", eventName, params);
  } catch (err) {
    // Analityka nigdy nie może przerwać zakupu.
    console.warn(`GA4: nie wysłano zdarzenia ${eventName}:`, err);
  }
}

export function toItems(sheets: AnalyticsSheet[], listName?: string) {
  return sheets.map((sheet, index) => ({
    item_id: "arkusz-a4",
    item_name: "Arkusz naklejek A4",
    item_variant: sheet.deliveryForm === "individual" ? "pojedyncze sztuki" : "na arkuszu",
    price: sheet.pricePerSheet,
    quantity: sheet.sheetQuantity,
    index,
    ...(listName ? { item_list_name: listName } : {}),
  }));
}

export function sheetsValue(sheets: AnalyticsSheet[]) {
  const sum = sheets.reduce((acc, sheet) => acc + sheet.pricePerSheet * sheet.sheetQuantity, 0);
  return Math.round(sum * 100) / 100;
}

export function trackAddToCart(sheet: AnalyticsSheet, listName: "kreator" | "historia zamówień") {
  send("add_to_cart", {
    currency: CURRENCY,
    value: sheetsValue([sheet]),
    items: toItems([sheet], listName),
  });
}

export function trackBeginCheckout(sheets: AnalyticsSheet[]) {
  send("begin_checkout", {
    currency: CURRENCY,
    value: sheetsValue(sheets),
    items: toItems(sheets),
  });
}

export function trackAddPaymentInfo(sheets: AnalyticsSheet[], paymentType: string) {
  send("add_payment_info", {
    currency: CURRENCY,
    value: sheetsValue(sheets),
    payment_type: paymentType,
    items: toItems(sheets),
  });
}

/**
 * Zakup wysyłamy raz na zamówienie: strona sukcesu bywa odświeżana, a klient
 * może do niej wrócić z maila. Znacznik w localStorage chroni przed duplikatem
 * w tej samej przeglądarce, a `transaction_id` pozwala GA4 odrzucić powtórkę
 * z innego urządzenia.
 */
export function trackPurchase(order: {
  orderId: string;
  orderNumber: string;
  sheets: AnalyticsSheet[];
  shipping: number;
  paymentType: string;
}) {
  const key = `ga4-purchase-${order.orderId}`;
  try {
    if (localStorage.getItem(key)) return;
  } catch {
    // Zablokowany localStorage nie może zablokować pomiaru.
  }

  send("purchase", {
    transaction_id: order.orderNumber,
    currency: CURRENCY,
    value: sheetsValue(order.sheets),
    shipping: order.shipping,
    payment_type: order.paymentType,
    items: toItems(order.sheets),
  });

  try {
    localStorage.setItem(key, "1");
  } catch {
    // jak wyżej
  }
}
