import type { MonthlyStatsWithTax, PeriodStats, TaxBreakdown } from "@/lib/admin/costs";
import { COST_RATES, TAX_RATES, round2 } from "@/lib/admin/costs";
import { formatPln } from "@/lib/orders/status";

function plural(count: number, one: string, few: string, many: string): string {
  if (count === 1) return one;
  const rest = count % 10;
  const teens = count % 100;
  return rest >= 2 && rest <= 4 && (teens < 12 || teens > 14) ? few : many;
}

const sheetsLabel = (count: number) => plural(count, "arkusz", "arkusze", "arkuszy");
const salesLabel = (count: number) => plural(count, "sprzedaż", "sprzedaże", "sprzedaży");
const daysLabel = (count: number) => plural(count, "dzień", "dni", "dni");

/** Ile sprzedaży weszło do rachunku zysku — wpisy bez kwoty są poza nim. */
export function pricedSales(stats: PeriodStats): number {
  return stats.orders + stats.manualEntries - stats.unpriced;
}

/** Skrót kwoty do jednego miejsca po przecinku — dla podpisów pod kafelkami. */
function shortPln(amount: number): string {
  return formatPln(Math.round(amount * 10) / 10);
}

export function StatTile({
  label,
  value,
  hint,
  accent = false,
  hero = false,
  className = "",
}: {
  label: string;
  value: string;
  hint: string;
  accent?: boolean;
  /** Liczba, po którą wchodzi się na stronę — większa i wyróżniona tłem. */
  hero?: boolean;
  className?: string;
}) {
  return (
    <div
      className={`rounded-2xl px-4 py-3.5 border shadow-[0_8px_30px_rgba(0,0,0,0.02)] ${
        accent || hero ? "bg-primary/10 border-primary/40" : "bg-card border-border/70"
      } ${className}`}
    >
      <p className="text-[11px] font-black uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <p
        className={`font-extrabold mt-1 tabular-nums ${hero ? "text-3xl sm:text-4xl" : "text-2xl"} ${
          accent || hero ? "text-primary" : "text-foreground"
        }`}
      >
        {value}
      </p>
      <p className="text-xs font-medium text-muted-foreground mt-0.5">{hint}</p>
    </div>
  );
}

/** Zmiana w procentach — bez punktu odniesienia nie ma czego liczyć. */
export function delta(current: number, previous: number): string {
  if (previous === 0) return current === 0 ? "brak danych" : "pierwszy taki miesiąc";
  const change = Math.round(((current - previous) / previous) * 100);
  if (change === 0) return "bez zmian";
  return `${change > 0 ? "+" : ""}${change}%`;
}

/**
 * Cztery liczby, po które wchodzi się na tę stronę: ile realnie zostaje na
 * koncie po ZUS, zdrowotnej i PIT, ile to daje dziennie, ile na jednym
 * zamówieniu i z ilu arkuszy. Zysk operacyjny (przed obciążeniami) jest
 * podpisany pod hero-kafelkiem i rozpisany w rachunku niżej — osobny kafelek
 * na niego dublowałby to, co już widać.
 */
export function ProfitSummary({
  stats,
  tax,
  days,
  profitPerDay,
}: {
  stats: PeriodStats;
  tax: TaxBreakdown;
  /** Dni, przez które dzielimy zysk — pominięte, gdy średnia dzienna nie ma sensu. */
  days?: number;
  profitPerDay?: number;
}) {
  const sales = pricedSales(stats);

  const sheetsHint = stats.manualSheets
    ? `${stats.orders} zam. + ${stats.manualSheets} ark. dopisanych`
    : `${stats.orders} ${plural(stats.orders, "zamówienie", "zamówienia", "zamówień")}`;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
      <StatTile
        label="Do ręki"
        value={formatPln(tax.profitAfterTax)}
        hint={`po ZUS, zdrowotnej i PIT — operacyjnie ${shortPln(stats.profit)}`}
        hero
        className="col-span-2"
      />
      <StatTile
        label="Średnio dziennie"
        value={days ? formatPln(profitPerDay ?? 0) : "—"}
        hint={days ? `do ręki ÷ ${days} ${daysLabel(days)}` : "poza skalą okresu"}
      />
      <StatTile
        label="Zysk z zamówienia"
        value={sales ? formatPln(stats.profitPerSale) : "—"}
        hint={sales ? `średnio z ${sales} ${salesLabel(sales)}, przed ZUS i PIT` : "brak sprzedaży"}
      />
      <StatTile
        label="Sprzedane arkusze"
        value={String(stats.sheets)}
        hint={sheetsHint}
      />
    </div>
  );
}

function BreakdownRow({
  label,
  hint,
  amount,
  sign,
  total = false,
}: {
  label: string;
  hint?: string;
  amount: number;
  sign: "+" | "−" | "=";
  total?: boolean;
}) {
  return (
    <div
      className={`flex items-baseline justify-between gap-4 py-2 ${
        total ? "border-t border-border/60 mt-1 pt-3" : "border-b border-border/30"
      }`}
    >
      <span className="flex items-baseline gap-2 min-w-0">
        <span
          className={`w-3 shrink-0 text-center font-black tabular-nums ${
            total ? "text-primary" : "text-muted-foreground"
          }`}
          aria-hidden
        >
          {sign}
        </span>
        <span className={`text-sm truncate ${total ? "font-extrabold" : "font-bold"}`}>
          {label}
          {hint && <span className="font-medium text-muted-foreground"> {hint}</span>}
        </span>
      </span>
      <span
        className={`shrink-0 tabular-nums ${
          total ? "text-lg font-extrabold text-primary" : "text-sm font-bold"
        }`}
      >
        {formatPln(amount)}
      </span>
    </div>
  );
}

/**
 * Cały rachunek okresu w jednej kolumnie: od tego, co wpłacili klienci, do
 * tego, co realnie zostaje w kieszeni po ZUS, zdrowotnej i PIT. Każda linia
 * jest sprawdzalna kalkulatorem.
 */
export function ProfitBreakdown({
  stats,
  tax,
  months = 0,
}: {
  stats: PeriodStats;
  /** Pominięte dla przykładu jednego zamówienia — ZUS i PIT nie liczą się od pojedynczej sprzedaży. */
  tax?: TaxBreakdown;
  /** Miesięcy w okresie — ZUS to stawka miesięczna, więc mnożnik podpisu. */
  months?: number;
}) {
  const sales = pricedSales(stats);

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_260px]">
      <div className="flex flex-col">
        <BreakdownRow label="Wpłaty klientów" hint="brutto, z dostawą" amount={stats.gross} sign="+" />
        <BreakdownRow
          label="VAT należny"
          hint={`${Math.round(COST_RATES.vatRate * 100)}% od sprzedaży`}
          amount={stats.vatDue}
          sign="−"
        />
        <BreakdownRow label="Przychód netto" amount={stats.netRevenue} sign="=" />
        <BreakdownRow
          label="Wydruk arkuszy"
          hint={`${stats.sheets} × ${formatPln(COST_RATES.sheetGross)} brutto`}
          amount={stats.sheetsCost}
          sign="−"
        />
        <BreakdownRow
          label="Przesyłki kurierskie"
          hint={`${sales} × ${formatPln(COST_RATES.shippingGross)} brutto`}
          amount={stats.shippingCost}
          sign="−"
        />
        <BreakdownRow
          label="Koszty dodatkowe"
          hint={`${sales} × ${formatPln(COST_RATES.extraGross)} brutto, bez VAT-u`}
          amount={stats.extraCost}
          sign="−"
        />
        <BreakdownRow label="Zysk operacyjny" amount={stats.profit} sign="=" total={!tax} />
        {tax && (
          <>
            <p className="text-[11px] font-black uppercase tracking-wider text-muted-foreground mt-4 pt-3 border-t border-border/60">
              Obciążenia właściciela
            </p>
            <BreakdownRow
              label="ZUS społeczny"
              hint={months > 1 ? `${months} × ${formatPln(TAX_RATES.zusSocialMonthly)}` : "pełny ZUS"}
              amount={tax.zusSocial}
              sign="−"
            />
            <BreakdownRow
              label="Składka zdrowotna"
              hint={`${Math.round(TAX_RATES.healthInsuranceRate * 100)}% dochodu po ZUS`}
              amount={tax.healthInsurance}
              sign="−"
            />
            <BreakdownRow
              label="PIT"
              hint={`skala ${Math.round(TAX_RATES.pitRateLow * 100)}/${Math.round(
                TAX_RATES.pitRateHigh * 100
              )}%, po uldze ${formatPln(TAX_RATES.taxReliefMonthly)}/mies.`}
              amount={tax.pit}
              sign="−"
            />
            <BreakdownRow label="Do ręki" amount={tax.profitAfterTax} sign="=" total />
          </>
        )}
        <p className="text-xs font-medium text-muted-foreground mt-2">
          Koszty z fakturą (arkusze, kurier) odejmujemy w kwotach netto — VAT z nich odliczasz.
          Koszt dodatkowy schodzi w pełnej kwocie brutto.
          {tax &&
            " ZUS i PIT liczone dla pełnego ZUS na skali podatkowej, próg 32% narastająco od stycznia — realna kwota zależy od Twojej bieżącej deklaracji ZUS."}
        </p>
      </div>

      <div className="flex flex-col gap-4 self-start">
        <div className="rounded-2xl border border-border/60 bg-muted/20 p-4 flex flex-col gap-3">
          <p className="text-[11px] font-black uppercase tracking-wider text-muted-foreground">
            VAT do urzędu
          </p>
          <dl className="flex flex-col gap-1.5 text-sm">
            <div className="flex justify-between gap-3">
              <dt className="font-medium text-muted-foreground">Należny</dt>
              <dd className="font-bold tabular-nums">{formatPln(stats.vatDue)}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="font-medium text-muted-foreground">Naliczony</dt>
              <dd className="font-bold tabular-nums">−{formatPln(stats.vatDeductible)}</dd>
            </div>
            <div className="flex justify-between gap-3 border-t border-border/60 pt-1.5">
              <dt className="font-extrabold">Do zapłaty</dt>
              <dd className="font-extrabold tabular-nums">{formatPln(stats.vatPayable)}</dd>
            </div>
          </dl>
          <p className="text-xs font-medium text-muted-foreground">
            Naliczony to VAT z faktur za arkusze i kuriera. Koszt dodatkowy nie wchodzi
            w koszty firmy, więc nie daje odliczenia.
          </p>
        </div>

        <div className="rounded-2xl border border-border/60 bg-muted/20 p-4 flex flex-col gap-1.5 text-sm">
          <div className="flex justify-between gap-3">
            <span className="font-medium text-muted-foreground">Marża</span>
            <span className="font-bold tabular-nums">{stats.margin}%</span>
          </div>
          <div className="flex justify-between gap-3">
            <span className="font-medium text-muted-foreground">Zysk operacyjny / arkusz</span>
            <span className="font-bold tabular-nums">
              {stats.sheets ? formatPln(stats.profitPerSheet) : "—"}
            </span>
          </div>

          {tax && (
            <>
              <p className="text-[11px] font-black uppercase tracking-wider text-muted-foreground mt-2 pt-2 border-t border-border/60">
                Na arkusz, średnio w tym okresie
              </p>
              <div className="flex justify-between gap-3">
                <span className="font-medium text-muted-foreground">− ZUS</span>
                <span className="font-bold tabular-nums">
                  {stats.sheets ? formatPln(tax.zusSocial / stats.sheets) : "—"}
                </span>
              </div>
              <div className="flex justify-between gap-3">
                <span className="font-medium text-muted-foreground">− Zdrowotna</span>
                <span className="font-bold tabular-nums">
                  {stats.sheets ? formatPln(tax.healthInsurance / stats.sheets) : "—"}
                </span>
              </div>
              <div className="flex justify-between gap-3">
                <span className="font-medium text-muted-foreground">− PIT</span>
                <span className="font-bold tabular-nums">
                  {stats.sheets ? formatPln(tax.pit / stats.sheets) : "—"}
                </span>
              </div>
              <div className="flex justify-between gap-3 border-t border-border/60 pt-1.5">
                <span className="font-extrabold">= Zysk właściwy / arkusz</span>
                <span className="font-extrabold tabular-nums">
                  {stats.sheets ? formatPln(tax.profitAfterTax / stats.sheets) : "—"}
                </span>
              </div>
              <p className="text-xs font-medium text-muted-foreground mt-1">
                ZUS to stała opłata miesięczna, nie rośnie z liczbą sprzedanych arkuszy — ta kwota
                to tylko koszt ZUS tego okresu rozłożony na sprzedane sztuki, więc mocno skacze
                między miesiącami słabszymi i mocniejszymi sprzedażowo. Zdrowotna i PIT liczą się
                od dochodu, więc trzymają się bliżej stałej stawki.
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * Rozkład zysku w czasie (po ZUS, zdrowotnej i PIT). Słupki są proporcjonalne
 * do najlepszego miesiąca — chodzi o wyłapanie trendu, nie o odczyt
 * dokładnych wartości (te są w tabeli).
 */
export function MonthlyChart({ months }: { months: MonthlyStatsWithTax[] }) {
  const max = Math.max(...months.map((month) => Math.max(month.profitAfterTax, 0)), 1);

  return (
    <div className="flex flex-col gap-2.5">
      {months.map((month) => (
        <div key={month.month} className="flex items-center gap-3">
          <span className="w-28 shrink-0 text-xs font-bold text-muted-foreground capitalize">
            {month.label}
          </span>
          <div className="flex-1 h-7 rounded-lg bg-muted/40 overflow-hidden">
            <div
              className="h-full rounded-lg bg-primary/80 min-w-[2px] transition-[width]"
              style={{ width: `${(Math.max(month.profitAfterTax, 0) / max) * 100}%` }}
            />
          </div>
          <span className="w-28 shrink-0 text-right text-xs font-extrabold tabular-nums text-primary">
            {formatPln(month.profitAfterTax)}
          </span>
          <span className="hidden sm:block w-24 shrink-0 text-right text-xs font-bold tabular-nums text-muted-foreground">
            {formatPln(month.profitAfterTaxPerDay)}/dzień
          </span>
          <span className="hidden lg:block w-24 shrink-0 text-right text-xs font-medium tabular-nums text-muted-foreground">
            {month.sheets} {sheetsLabel(month.sheets)}
          </span>
        </div>
      ))}
    </div>
  );
}

export function MonthlyTable({ months }: { months: MonthlyStatsWithTax[] }) {
  const total = months.reduce(
    (sum, month) => ({
      orders: sum.orders + month.orders,
      manualEntries: sum.manualEntries + month.manualEntries,
      sheets: sum.sheets + month.sheets,
      gross: round2(sum.gross + month.gross),
      costTotal: round2(sum.costTotal + month.costTotal),
      profit: round2(sum.profit + month.profit),
      netRevenue: round2(sum.netRevenue + month.netRevenue),
      zusAndPit: round2(sum.zusAndPit + month.zusSocial + month.healthInsurance + month.pit),
      profitAfterTax: round2(sum.profitAfterTax + month.profitAfterTax),
    }),
    {
      orders: 0,
      manualEntries: 0,
      sheets: 0,
      gross: 0,
      costTotal: 0,
      profit: 0,
      netRevenue: 0,
      zusAndPit: 0,
      profitAfterTax: 0,
    }
  );

  const totalMargin = total.netRevenue ? Math.round((total.profit / total.netRevenue) * 100) : 0;

  const headings = [
    "Miesiąc",
    "Sprzedaże",
    "Arkusze",
    "Obrót brutto",
    "Koszty",
    "Zysk operacyjny",
    "ZUS + zdrow. + PIT",
    "Do ręki",
    "Marża",
  ];

  return (
    <div className="overflow-x-auto -mx-5 sm:-mx-6 px-5 sm:px-6">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="text-left">
            {headings.map((heading) => (
              <th
                key={heading}
                className="pb-3 pr-4 text-[11px] font-black uppercase tracking-wider text-muted-foreground whitespace-nowrap border-b border-border/60"
              >
                {heading}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {months.map((month) => (
            <tr key={month.month} className="border-b border-border/40">
              <td className="py-2.5 pr-4 font-bold capitalize whitespace-nowrap">{month.label}</td>
              <td className="py-2.5 pr-4 tabular-nums whitespace-nowrap">
                {month.orders}
                {month.manualEntries > 0 && (
                  <span className="text-muted-foreground font-medium">
                    {" "}
                    + {month.manualEntries} ręcznie
                  </span>
                )}
              </td>
              <td className="py-2.5 pr-4 tabular-nums font-extrabold">{month.sheets}</td>
              <td className="py-2.5 pr-4 tabular-nums text-muted-foreground whitespace-nowrap">
                {formatPln(month.gross)}
              </td>
              <td className="py-2.5 pr-4 tabular-nums text-muted-foreground whitespace-nowrap">
                {formatPln(month.costTotal)}
              </td>
              <td className="py-2.5 pr-4 tabular-nums font-bold whitespace-nowrap">
                {formatPln(month.profit)}
              </td>
              <td className="py-2.5 pr-4 tabular-nums text-muted-foreground whitespace-nowrap">
                −{formatPln(month.zusSocial + month.healthInsurance + month.pit)}
              </td>
              <td className="py-2.5 pr-4 tabular-nums font-extrabold text-primary whitespace-nowrap">
                {formatPln(month.profitAfterTax)}
              </td>
              <td className="py-2.5 pr-4 tabular-nums text-muted-foreground">{month.margin}%</td>
            </tr>
          ))}
          <tr className="font-extrabold">
            <td className="py-3 pr-4">Razem</td>
            <td className="py-3 pr-4 tabular-nums">
              {total.orders}
              {total.manualEntries > 0 && (
                <span className="font-medium"> + {total.manualEntries} ręcznie</span>
              )}
            </td>
            <td className="py-3 pr-4 tabular-nums">{total.sheets}</td>
            <td className="py-3 pr-4 tabular-nums">{formatPln(total.gross)}</td>
            <td className="py-3 pr-4 tabular-nums">{formatPln(total.costTotal)}</td>
            <td className="py-3 pr-4 tabular-nums">{formatPln(total.profit)}</td>
            <td className="py-3 pr-4 tabular-nums">−{formatPln(total.zusAndPit)}</td>
            <td className="py-3 pr-4 tabular-nums text-primary">{formatPln(total.profitAfterTax)}</td>
            <td className="py-3 pr-4 tabular-nums">{totalMargin}%</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

/**
 * Ściągawka z rachunku — te same stawki, na których liczy się cała strona,
 * pokazane na jednym typowym zamówieniu.
 */
export function CostModel({ example }: { example: PeriodStats }) {
  const rates = [
    {
      label: "Arkusz A4",
      value: `${formatPln(COST_RATES.sheetGross)} brutto`,
      hint: `netto ${formatPln(COST_RATES.sheetGross / 1.23)} — w kosztach, VAT odliczony`,
    },
    {
      label: "Przesyłka kurierska",
      value: `${formatPln(COST_RATES.shippingGross)} brutto`,
      hint: `netto ${formatPln(COST_RATES.shippingGross / 1.23)} — w kosztach, VAT odliczony`,
    },
    {
      label: "Koszt dodatkowy",
      value: `${formatPln(COST_RATES.extraGross)} brutto`,
      hint: "od zamówienia — poza kosztami firmy, schodzi w całości",
    },
    {
      label: "VAT",
      value: `${Math.round(COST_RATES.vatRate * 100)}%`,
      hint: "od sprzedaży i od faktur kosztowych",
    },
  ];

  const ownerRates = [
    {
      label: "ZUS społeczny",
      value: `${formatPln(TAX_RATES.zusSocialMonthly)} / mies.`,
      hint: "pełny ZUS, stała kwota niezależna od sprzedaży",
    },
    {
      label: "Składka zdrowotna",
      value: `${Math.round(TAX_RATES.healthInsuranceRate * 100)}%`,
      hint: "od dochodu po ZUS społecznym, na skali",
    },
    {
      label: "PIT — skala",
      value: `${Math.round(TAX_RATES.pitRateLow * 100)} / ${Math.round(TAX_RATES.pitRateHigh * 100)}%`,
      hint: `do / powyżej ${formatPln(TAX_RATES.pitThreshold)} dochodu rocznie`,
    },
    {
      label: "Ulga podatkowa",
      value: `${formatPln(TAX_RATES.taxReliefMonthly)} / mies.`,
      hint: "kwota zmniejszająca PIT, bez przenoszenia na kolejny miesiąc",
    },
  ];

  return (
    <div className="flex flex-col gap-5">
      <div>
        <p className="text-[11px] font-black uppercase tracking-wider text-muted-foreground mb-3">
          Koszty sprzedaży
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {rates.map((rate) => (
            <div key={rate.label} className="rounded-2xl border border-border/60 bg-muted/20 p-4">
              <p className="text-[11px] font-black uppercase tracking-wider text-muted-foreground">
                {rate.label}
              </p>
              <p className="text-lg font-extrabold tabular-nums mt-1">{rate.value}</p>
              <p className="text-xs font-medium text-muted-foreground mt-0.5">{rate.hint}</p>
            </div>
          ))}
        </div>
      </div>

      <div>
        <p className="text-[11px] font-black uppercase tracking-wider text-muted-foreground mb-3">
          Obciążenia właściciela — skala podatkowa
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {ownerRates.map((rate) => (
            <div key={rate.label} className="rounded-2xl border border-border/60 bg-muted/20 p-4">
              <p className="text-[11px] font-black uppercase tracking-wider text-muted-foreground">
                {rate.label}
              </p>
              <p className="text-lg font-extrabold tabular-nums mt-1">{rate.value}</p>
              <p className="text-xs font-medium text-muted-foreground mt-0.5">{rate.hint}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-border/60 p-4 sm:p-5">
        <p className="text-[11px] font-black uppercase tracking-wider text-muted-foreground mb-3">
          Przykład: jedno zamówienie na 1 arkusz za {formatPln(example.gross)}
        </p>
        <ProfitBreakdown stats={example} />
        <p className="text-xs font-medium text-muted-foreground mt-3">
          ZUS jest miesięczny, nie od zamówienia, więc w przykładzie jednego zamówienia
          rachunek kończy się na zysku operacyjnym — pełny rachunek z ZUS i PIT jest w
          kartach zysku wyżej.
        </p>
      </div>
    </div>
  );
}
