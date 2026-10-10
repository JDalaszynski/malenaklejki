import "server-only";

import { db } from "@/lib/firebase/admin";
import { listOrders, type AdminOrder } from "./queries";
import { financeOf, round2, summarize, type ManualSale, type PeriodStats, type SaleFinance, type SalesEntry } from "./costs";

/**
 * Stawki i cała arytmetyka zysku siedzą w `lib/admin/costs` — module bez
 * `server-only`, więc panel liczy dokładnie to samo po obu stronach. Tutaj
 * zostaje to, co wymaga bazy albo kształtu zamówienia.
 */
export * from "./costs";

/** Liczba arkuszy w zamówieniu — pocięte na sztuki liczą się tak samo jak całe. */
export function countSheets(order: AdminOrder): number {
  return order.items.reduce((sum, item) => sum + (item.sheetQuantity || 0), 0);
}

/** Rachunek jednego zamówienia ze sklepu — ten sam, co w statystykach. */
export function orderFinance(order: AdminOrder): SaleFinance {
  return financeOf({ sheets: countSheets(order), gross: order.totals.total });
}

/**
 * Miesiąc, do którego wliczamy zamówienie: data zapłaty, a dla starszych
 * zamówień bez `paidAt` — data złożenia. Bez tego zapasowego pola opłacone
 * zamówienia sprzed wdrożenia znikałyby ze statystyk.
 */
export function statsDate(order: AdminOrder): string {
  return order.paidAt || order.createdAt;
}

/**
 * Zamówienie w kształcie statystyk — pojedyncza sprzedaż jest po prostu
 * okresem jednoelementowym, więc karta rachunku działa na nim bez zmian.
 */
export function orderStats(order: AdminOrder): PeriodStats {
  return summarize([
    {
      date: statsDate(order),
      sheets: countSheets(order),
      gross: order.totals.total,
      manual: false,
    },
  ]);
}

/**
 * Zamówienia i sprzedaż ręczna sprowadzone do wpisów statystyk.
 *
 * Zamówienia odhaczone w panelu jako wyłączone ze statystyk wypadają właśnie
 * tutaj — to jedyne wejście do liczenia zysku, a ewidencja sprzedaży
 * (`lib/admin/report`) idzie własną drogą i bierze je normalnie, bo do urzędu
 * musi trafić każda transakcja.
 */
export function toSalesEntries(orders: AdminOrder[], manual: ManualSale[]): SalesEntry[] {
  return [
    ...orders
      .filter((order) => !order.excludedFromStats)
      .map((order) => ({
        date: statsDate(order),
        sheets: countSheets(order),
        gross: order.totals.total,
        manual: false,
      })),
    ...manual.map((sale) => ({
      date: sale.soldAt,
      sheets: sale.sheets,
      gross: sale.amount,
      manual: true,
    })),
  ];
}

/** Zamówienia z reklam Google w jednym okresie — do zestawienia z wydatkami w Google Ads. */
export type AdsOrdersSummary = {
  orders: number;
  /** Wartość arkuszy brutto, bez dostawy — tak samo liczy ją zakup w GA4. */
  sheetsGross: number;
  /** Zysk z tych zamówień, zanim odejmiesz koszt reklamy. */
  profit: number;
  /** Słowa kluczowe reklam, od najczęstszego; zamówienia bez słowa tu nie trafiają. */
  keywords: Array<{ keyword: string; orders: number }>;
};

/**
 * Google Ads widzi tylko zakupy osób, które zgodziły się na cookies, więc
 * prawdziwy koszt zamówienia z reklamy liczy się z tych liczb: wydatki
 * kampanii podzielone przez `orders`.
 */
export function summarizeAdsOrders(orders: AdminOrder[]): AdsOrdersSummary {
  const fromAds = orders.filter((order) => order.acquisition && !order.excludedFromStats);
  const byKeyword = new Map<string, number>();
  for (const order of fromAds) {
    const keyword = order.acquisition?.keyword;
    if (keyword) byKeyword.set(keyword, (byKeyword.get(keyword) ?? 0) + 1);
  }

  return {
    orders: fromAds.length,
    sheetsGross: round2(fromAds.reduce((sum, order) => sum + order.totals.subtotal, 0)),
    profit: round2(fromAds.reduce((sum, order) => sum + orderFinance(order).profit, 0)),
    keywords: [...byKeyword]
      .map(([keyword, count]) => ({ keyword, orders: count }))
      .sort((a, b) => b.orders - a.orders || a.keyword.localeCompare(b.keyword, "pl")),
  };
}

/**
 * Opłacone zamówienia do statystyk.
 *
 * Filtrujemy po `createdAt`, mimo że statystyki układamy według daty zapłaty:
 * Firestore pomija w sortowaniu dokumenty bez danego pola, a `paidAt` pojawiło
 * się dopiero z panelem — sortowanie po nim wycięłoby starszą sprzedaż.
 */
export async function loadPaidOrders(limit = 3000): Promise<AdminOrder[]> {
  return listOrders({ dateField: "createdAt", status: "PAID" }, limit);
}

export async function loadManualSales(limit = 1000): Promise<ManualSale[]> {
  const snapshot = await db
    .collection("manualSales")
    .orderBy("soldAt", "desc")
    .limit(limit)
    .get();

  return snapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      soldAt: data.soldAt ?? "",
      sheets: data.sheets ?? 0,
      amount: data.amount ?? 0,
      note: data.note ?? "",
      createdBy: data.createdBy ?? "",
      createdAt: data.createdAt ?? "",
    };
  });
}
