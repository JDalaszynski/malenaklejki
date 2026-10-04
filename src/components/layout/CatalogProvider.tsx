"use client";

import { createContext, useContext } from "react";

const CatalogContext = createContext(false);

/**
 * Czy sklep ma publiczny katalog gotowych arkuszy — dla komponentów
 * w przeglądarce, które do niego linkują (stopka, sekcja SEO strony głównej).
 * Bez tego link prowadziłby na 404 przy wyłączonych gotowych arkuszach.
 */
export function CatalogProvider({ visible, children }: { visible: boolean; children: React.ReactNode }) {
  return <CatalogContext.Provider value={visible}>{children}</CatalogContext.Provider>;
}

export function useCatalogVisible(): boolean {
  return useContext(CatalogContext);
}
