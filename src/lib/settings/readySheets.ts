/**
 * Gotowe zestawy w sklepie — wspólny model ustawienia.
 *
 * Moduł jest czysty (bez Firestore i bez `server-only`), bo nazwy i opisy
 * trybów pokazuje zarówno panel, jak i trasy API strony głównej.
 */

/**
 * - `off` — sklep wygląda tak, jakby gotowych zestawów nie było,
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
  off: "Strona główna wygląda tak jak dotąd — gotowych zestawów nie widzi nikt.",
  preview:
    "Gotowe zestawy widzisz tylko Ty, zalogowany jako administrator — dokładnie tak, jak zobaczą je klienci.",
  on: "Przy kreatorze na stronie głównej pojawia się wejście do galerii — klienci wybierają wzór, edytują go i zamawiają.",
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
export const READY_SHEETS_MODE_TAG = "ustawienia-gotowe-zestawy";

/** Tag pamięci podręcznej opublikowanych zestawów — unieważniany przy każdej zmianie zestawu. */
export const READY_SHEETS_TAG = "gotowe-zestawy";

/**
 * Tag odpowiedzi na pytanie „czy katalog ma co pokazać". Od niej zależy link
 * do katalogu w stopce każdej strony, więc unieważniamy ją tylko wtedy, gdy
 * odpowiedź faktycznie się zmienia — nie przy każdym zapisie zestawu.
 */
export const CATALOG_VISIBILITY_TAG = "katalog-gotowych-zestawow";

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
