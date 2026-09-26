/**
 * Gotowe arkusze w sklepie — wspólny model ustawienia.
 *
 * Moduł jest czysty (bez Firestore i bez `server-only`), bo nazwy i opisy
 * trybów pokazuje zarówno panel, jak i trasy API strony głównej.
 */

/**
 * - `off` — sklep wygląda tak, jakby gotowych arkuszy nie było,
 * - `preview` — widzi je wyłącznie zalogowany administrator, tak jak klient,
 * - `on` — widzą je wszyscy.
 */
export type ReadySheetsMode = "off" | "preview" | "on";

export const READY_SHEETS_MODES: readonly ReadySheetsMode[] = ["off", "preview", "on"] as const;

export const READY_SHEETS_MODE_LABELS: Record<ReadySheetsMode, string> = {
  off: "Wyłączony",
  preview: "Podgląd",
  on: "Włączony",
};

export const READY_SHEETS_MODE_DESCRIPTIONS: Record<ReadySheetsMode, string> = {
  off: "Strona główna wygląda tak jak dotąd — gotowych arkuszy nie widzi nikt.",
  preview:
    "Gotowe arkusze widzisz tylko Ty, zalogowany jako administrator — dokładnie tak, jak zobaczą je klienci.",
  on: "Klienci widzą opublikowane arkusze w kreatorze na stronie głównej i mogą je zamawiać.",
};

export type ReadySheetsSettings = {
  mode: ReadySheetsMode;
  updatedAt: string | null;
  updatedBy: string | null;
};

export const DEFAULT_READY_SHEETS_SETTINGS: ReadySheetsSettings = {
  mode: "off",
  updatedAt: null,
  updatedBy: null,
};

/** Tag pamięci podręcznej trybu — unieważniany przy zapisie ustawienia. */
export const READY_SHEETS_MODE_TAG = "ustawienia-gotowe-arkusze";

/** Tag pamięci podręcznej opublikowanych arkuszy — unieważniany przy każdej zmianie arkusza. */
export const READY_SHEETS_TAG = "gotowe-arkusze";

export function normalizeReadySheetsSettings(raw: unknown): ReadySheetsSettings {
  const data = (raw ?? {}) as Record<string, unknown>;
  return {
    mode: READY_SHEETS_MODES.includes(data.mode as ReadySheetsMode)
      ? (data.mode as ReadySheetsMode)
      : "off",
    updatedAt: typeof data.updatedAt === "string" ? data.updatedAt : null,
    updatedBy: typeof data.updatedBy === "string" ? data.updatedBy : null,
  };
}
