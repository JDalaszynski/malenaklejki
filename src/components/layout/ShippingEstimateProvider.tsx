"use client";

import { createContext, useContext } from "react";

import {
  DEFAULT_SHIPPING_ESTIMATE_SETTINGS,
  type ShippingEstimateSettings,
} from "@/lib/settings/shippingEstimate";

const ShippingEstimateContext = createContext<ShippingEstimateSettings>(
  DEFAULT_SHIPPING_ESTIMATE_SETTINGS
);

/** Ustawienia terminu wysyłki z panelu — dla komponentów w przeglądarce. */
export function ShippingEstimateProvider({
  settings,
  children,
}: {
  settings: ShippingEstimateSettings;
  children: React.ReactNode;
}) {
  return (
    <ShippingEstimateContext.Provider value={settings}>{children}</ShippingEstimateContext.Provider>
  );
}

export function useShippingEstimateSettings(): ShippingEstimateSettings {
  return useContext(ShippingEstimateContext);
}
