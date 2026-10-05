import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { getCatalogSheets } from "@/lib/sheets/public";
import { CATALOG_PATH, formatPrice } from "@/lib/sheets/schema";
import { SHEET_PRICE } from "@/lib/sheets/types";
import { CatalogListTracker } from "./CatalogListTracker";
import { SheetGrid } from "./blocks";

/** Ile zestawów pokazuje blok — reszta czeka w katalogu. */
const SHOWCASE_LIMIT = 6;

/**
 * Gotowe zestawy z cenami wewnątrz wpisu blogowego.
 *
 * Wpis o wzorach odpowiadał artykułem tam, gdzie szukający chce produktu
 * (170 wyświetleń, 0 kliknięć). Ten blok stawia produkt pod wstępem.
 * Przy niepublicznym katalogu nie renderuje niczego.
 */
export async function ReadySheetsShowcase() {
  const sheets = (await getCatalogSheets()).slice(0, SHOWCASE_LIMIT);
  if (sheets.length === 0) return null;

  return (
    <section
      aria-labelledby="gotowe-zestawy-we-wpisie"
      className="not-prose my-10 rounded-3xl border border-border/40 bg-[#edf6f2] dark:bg-[#002c2e] p-5 sm:p-7 space-y-5"
    >
      <CatalogListTracker sheets={sheets} list="katalog" />
      <div>
        <h2
          id="gotowe-zestawy-we-wpisie"
          className="text-2xl sm:text-3xl font-black text-foreground font-heading"
        >
          Gotowe zestawy naklejek - wzory do zamówienia od ręki
        </h2>
        <p className="mt-2 text-sm sm:text-base text-muted-foreground font-medium leading-relaxed">
          Nie chcesz szukać grafiki? Każdy z tych zestawów zamówisz od razu za {formatPrice(SHEET_PRICE)}{" "}
          brutto albo otworzysz w kreatorze i zmienisz po swojemu.
        </p>
      </div>
      <SheetGrid sheets={sheets} />
      <Link
        href={CATALOG_PATH}
        className="inline-flex items-center gap-2 text-sm sm:text-base font-extrabold text-primary underline decoration-primary/40 underline-offset-4 hover:decoration-primary"
      >
        Zobacz wszystkie gotowe zestawy
        <ArrowRight className="w-4 h-4" aria-hidden />
      </Link>
    </section>
  );
}
