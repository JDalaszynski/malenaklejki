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
  /** Pozycja powstała z gotowego arkusza — w raportach ma własny produkt. */
  readySheet?: AnalyticsReadySheet | null;
};

/** Gotowy arkusz w zdarzeniach: produkt nazywa się jak arkusz, a temat to kategoria. */
export type AnalyticsReadySheet = {
  id: string;
  slug?: string | null;
  name: string;
  category?: string;
  modified?: boolean;
};

const READY_SHEETS_CATEGORY = "Gotowe arkusze";

function readySheetFields(ready: AnalyticsReadySheet) {
  return {
    item_id: `gotowy-${ready.slug || ready.id}`,
    item_name: ready.name,
    item_category: READY_SHEETS_CATEGORY,
    ...(ready.category ? { item_category2: ready.category } : {}),
  };
}

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
    ...(sheet.readySheet
      ? {
          ...readySheetFields(sheet.readySheet),
          item_category3: sheet.readySheet.modified ? "zmieniony w kreatorze" : "bez zmian",
        }
      : {}),
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

/** Skąd klient ogląda gotowe arkusze — nazwa listy w raportach GA4. */
export type ReadySheetsList = "galeria w kreatorze" | "katalog" | `temat: ${string}` | "strona arkusza";

function readySheetItems(sheets: AnalyticsReadySheet[], listName: ReadySheetsList, price: number) {
  return sheets.map((sheet, index) => ({
    ...readySheetFields(sheet),
    price,
    quantity: 1,
    index,
    item_list_name: listName,
  }));
}

/** Klient zobaczył listę gotowych arkuszy (galeria, katalog albo strona tematu). */
export function trackViewReadySheets(sheets: AnalyticsReadySheet[], listName: ReadySheetsList, price: number) {
  if (sheets.length === 0) return;
  send("view_item_list", {
    item_list_name: listName,
    items: readySheetItems(sheets, listName, price),
  });
}

/** Klient wybrał arkusz z listy, żeby obejrzeć go z bliska. */
export function trackSelectReadySheet(sheet: AnalyticsReadySheet, listName: ReadySheetsList, price: number) {
  send("select_item", {
    item_list_name: listName,
    items: readySheetItems([sheet], listName, price),
  });
}

/** Klient otworzył stronę arkusza. */
export function trackViewReadySheet(sheet: AnalyticsReadySheet, price: number) {
  send("view_item", {
    currency: CURRENCY,
    value: price,
    items: readySheetItems([sheet], "strona arkusza", price),
  });
}

export function trackAddToCart(
  sheet: AnalyticsSheet,
  listName: "kreator" | "historia zamówień" | "strona arkusza"
) {
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
