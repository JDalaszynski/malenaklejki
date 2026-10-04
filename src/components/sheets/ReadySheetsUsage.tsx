import Link from "next/link";

import { Card } from "@/components/admin/AdminLayout";
import { StatTile } from "@/components/admin/ProfitStats";
import type { UsageSummary } from "@/lib/sheets/usage";
import { USAGE_SOURCE_LABELS, USAGE_EVENT_LABELS } from "@/lib/sheets/usageEvents";

export const USAGE_PERIODS = [7, 30, 90] as const;
export type UsagePeriod = (typeof USAGE_PERIODS)[number];

export function parseUsagePeriod(value: string | string[] | undefined): UsagePeriod {
  const raw = Number(Array.isArray(value) ? value[0] : value);
  return (USAGE_PERIODS as readonly number[]).includes(raw) ? (raw as UsagePeriod) : 30;
}

function percent(part: number, whole: number): string {
  return whole > 0 ? `${Math.round((part / whole) * 100)}%` : "—";
}

function formatDay(day: string): string {
  const [, month, date] = day.split("-");
  return `${Number(date)}.${month}`;
}

/** Słupki otwarć galerii dzień po dniu — trend w jednej linii, bez osi. */
function DailyBars({ daily }: { daily: UsageSummary["daily"] }) {
  const max = Math.max(1, ...daily.map((day) => day.open));
  const summary = daily.map((day) => `${formatDay(day.day)}: ${day.open}`).join(", ");

  return (
    <div>
      <div role="img" aria-label={`Otwarcia galerii dzień po dniu. ${summary}`} className="flex items-end gap-px h-16">
        {daily.map((day) => (
          <div
            key={day.day}
            title={`${formatDay(day.day)} — ${day.open}`}
            className={`flex-1 rounded-t-sm ${day.open > 0 ? "bg-primary" : "bg-border/70"}`}
            style={{ height: day.open > 0 ? `${Math.max(6, (day.open / max) * 100)}%` : "2px" }}
          />
        ))}
      </div>
      <div className="flex justify-between mt-1.5 text-[11px] font-semibold text-muted-foreground tabular-nums">
        <span>{formatDay(daily[0].day)}</span>
        <span>{formatDay(daily[daily.length - 1].day)}</span>
      </div>
    </div>
  );
}

const TH = "py-2 pr-3 text-left text-[11px] font-black uppercase tracking-wider text-muted-foreground";
const TD = "py-2 pr-3 text-sm font-semibold text-foreground tabular-nums";

/**
 * Zainteresowanie gotowymi arkuszami w kreatorze: od otwarcia galerii do
 * koszyka. Liczby pochodzą z własnych liczników sklepu (`lib/sheets/usage.ts`),
 * więc obejmują też klientów, którzy odrzucili cookies analityczne.
 */
export function ReadySheetsUsage({
  usage,
  period,
  names,
  isOn,
}: {
  usage: UsageSummary;
  period: UsagePeriod;
  /** Nazwy arkuszy po identyfikatorze — usunięty arkusz zostaje tylko w licznikach. */
  names: Record<string, string>;
  isOn: boolean;
}) {
  const { totals } = usage;
  const hasData = Object.values(totals).some((value) => value > 0);

  return (
    <Card
      title="Czy klienci klikają w gotowe arkusze?"
      description="Liczy kliknięcia w kreatorze: otwarcie galerii, obejrzenie wzoru, wczytanie go do kreatora i dodanie arkusza do koszyka."
      actions={
        <nav aria-label="Okres" className="flex items-center gap-1">
          {USAGE_PERIODS.map((days) => (
            <Link
              key={days}
              href={days === 30 ? "/admin/arkusze" : `/admin/arkusze?okres=${days}`}
              aria-current={days === period ? "true" : undefined}
              className={`rounded-xl px-3 py-1.5 text-xs font-black transition-colors ${
                days === period
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              {days} dni
            </Link>
          ))}
        </nav>
      }
    >
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatTile
          label={USAGE_EVENT_LABELS.open}
          value={String(totals.open)}
          hint={`w ostatnich ${usage.days} dniach`}
          hero
        />
        <StatTile
          label={USAGE_EVENT_LABELS.select}
          value={String(totals.select)}
          hint={totals.open > 0 ? `średnio ${(totals.select / totals.open).toFixed(1).replace(".", ",")} na otwarcie` : "—"}
        />
        <StatTile
          label={USAGE_EVENT_LABELS.use}
          value={String(totals.use)}
          hint={`${percent(totals.use, totals.open)} otwarć galerii`}
        />
        <StatTile
          label={USAGE_EVENT_LABELS.cart}
          value={String(totals.cart)}
          hint={`${percent(totals.cart, totals.use)} wczytanych`}
        />
      </div>

      {!hasData ? (
        <p className="mt-5 rounded-2xl border border-dashed border-border bg-muted/40 px-4 py-6 text-center text-sm font-semibold text-muted-foreground">
          {isOn
            ? "Brak kliknięć w tym okresie. Liczniki liczą dopiero od wdrożenia tej funkcji — pierwsze liczby pojawią się, gdy klienci otworzą galerię."
            : "Liczniki działają dopiero przy trybie „Włączony” — w podglądzie galerię widzisz tylko Ty, a Twoich kliknięć nie liczymy."}
        </p>
      ) : (
        <div className="mt-6 space-y-6">
          <div>
            <h3 className="text-sm font-extrabold text-foreground mb-2">Otwarcia galerii dzień po dniu</h3>
            <DailyBars daily={usage.daily} />
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <div>
              <h3 className="text-sm font-extrabold text-foreground mb-1">Skąd klienci otwierają galerię</h3>
              {usage.sources.length === 0 ? (
                <p className="text-sm font-medium text-muted-foreground">Brak otwarć w tym okresie.</p>
              ) : (
                <table className="w-full">
                  <thead>
                    <tr>
                      <th className={TH}>Wejście</th>
                      <th className={`${TH} text-right`}>Otwarcia</th>
                      <th className={`${TH} text-right`}>Udział</th>
                    </tr>
                  </thead>
                  <tbody>
                    {usage.sources.map(({ source, open }) => (
                      <tr key={source} className="border-t border-border/60">
                        <td className={`${TD} font-medium`}>{USAGE_SOURCE_LABELS[source]}</td>
                        <td className={`${TD} text-right`}>{open}</td>
                        <td className={`${TD} text-right text-muted-foreground`}>
                          {percent(open, totals.open)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            <div>
              <h3 className="text-sm font-extrabold text-foreground mb-1">Które wzory przyciągają</h3>
              {usage.sheets.length === 0 ? (
                <p className="text-sm font-medium text-muted-foreground">Nikt jeszcze nie oglądał wzoru.</p>
              ) : (
                <table className="w-full">
                  <thead>
                    <tr>
                      <th className={TH}>Arkusz</th>
                      <th className={`${TH} text-right`}>Obejrzany</th>
                      <th className={`${TH} text-right`}>Wczytany</th>
                      <th className={`${TH} text-right`}>W koszyku</th>
                    </tr>
                  </thead>
                  <tbody>
                    {usage.sheets.slice(0, 15).map((sheet) => (
                      <tr key={sheet.id} className="border-t border-border/60">
                        <td className={`${TD} font-medium`}>
                          {names[sheet.id] ?? <span className="text-muted-foreground">usunięty arkusz</span>}
                        </td>
                        <td className={`${TD} text-right`}>{sheet.select}</td>
                        <td className={`${TD} text-right`}>{sheet.use}</td>
                        <td className={`${TD} text-right`}>{sheet.cart}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      )}

      <p className="mt-5 text-xs font-medium text-muted-foreground">
        To liczba kliknięć, nie liczba osób: dwa otwarcia galerii przez jednego klienta liczą się jako dwa. Twoje własne
        wejścia (zalogowany administrator) są pomijane.
      </p>
    </Card>
  );
}
