/**
 * Nazwy i podział kwoty zamówienia na pozycje sprzedaży — jedno źródło dla
 * faktury w inFakcie, tytułu transakcji w Przelewy24 i ewidencji w panelu,
 * żeby to samo zamówienie wszędzie nazywało się tak samo.
 *
 * Plik nie ma zależności serwerowych: nazwę towaru bierze też formularz
 * ręcznego zamówienia w panelu.
 */

export const GOODS_LINE_NAME = "Naklejki personalizowane";

/** Jedna nazwa dla kuriera i paczkomatu — obie dostawy kosztują tyle samo. */
export const SHIPPING_LINE_NAME = "Przesyłka kurierska";

export interface BillingLine {
  name: string;
  /** Wartość brutto w groszach. */
  gross: number;
}

function toGrosze(amount?: number | null): number {
  return Math.round(((amount ?? 0) + Number.EPSILON) * 100);
}

/**
 * Rozbija kwotę zamówienia na towar i dostawę. Towar to reszta po odjęciu
 * dostawy, więc suma pozycji zawsze równa się kwocie zapłaconej przez klienta
 * co do grosza. Pozycja o zerowej wartości nie powstaje — ręczne zamówienie
 * bez dostawy ma samą pozycję towaru.
 */
export function splitBillingLines(
  totals?: { total?: number; shipping?: number } | null
): BillingLine[] {
  const total = toGrosze(totals?.total);
  const shipping = Math.min(Math.max(toGrosze(totals?.shipping), 0), total);

  return [
    { name: GOODS_LINE_NAME, gross: total - shipping },
    { name: SHIPPING_LINE_NAME, gross: shipping },
  ].filter((line) => line.gross > 0);
}
