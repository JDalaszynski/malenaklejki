/**
 * Strony tematyczne gotowych arkuszy (np. `/naklejki-swiateczne`).
 *
 * Każda strona to osobny plik w `src/app/` z własną treścią; tutaj jest tylko
 * ich spis — żeby zapis arkusza w panelu wiedział, które strony odświeżyć,
 * a mapa strony i katalog — do których linkować. Temat to nazwa wpisywana
 * w panelu w polu „Temat" (wielkość liter i polskie znaki nie mają znaczenia).
 */
export type ThemePage = {
  /** Adres strony, z ukośnikiem na początku. */
  path: string;
  /** Temat arkuszy w panelu, które ta strona pokazuje. */
  category: string;
  /** Nazwa w nawigacji katalogu, np. „Naklejki świąteczne". */
  label: string;
  /** Data ostatniej realnej zmiany treści — do mapy strony. */
  lastModified: string;
};

export const THEME_PAGES: ThemePage[] = [];

/**
 * Wpisy blogowe z blokiem gotowych arkuszy (frontmatter `catalog: true`) —
 * zapis arkusza odświeża je razem z katalogiem.
 */
export const CATALOG_BLOG_POSTS = ["fajne-wzory-i-pomysly-na-naklejki-inspiracje-wg-zastosowania"];
