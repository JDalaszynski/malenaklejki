import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { AdminNav } from "./AdminNav";
import { AdminUserBar } from "./AdminUserBar";

export function AdminLayout({
  title,
  subtitle,
  actions,
  adminEmail,
  userBar,
  stickyHeader = true,
  compact = false,
  meta,
  children,
}: {
  /** Węzeł, a nie tekst — ekran wczytywania podstawia tu pasek zastępczy. */
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  actions?: React.ReactNode;
  adminEmail?: string;
  /** Zastępuje pasek konta, gdy adresu admina jeszcze nie znamy. */
  userBar?: React.ReactNode;
  /** Edytor arkusza przykleja własną kolumnę — nagłówek sklepu zabierałby jej miejsce. */
  stickyHeader?: boolean;
  /**
   * Niższy nagłówek strony — dla widoków roboczych (szczegóły zamówienia),
   * gdzie każde zaoszczędzone 60 px to jedna sekcja więcej bez przewijania.
   */
  compact?: boolean;
  /** Wiersz pod podtytułem — na przykład statusy zamówienia. */
  meta?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen text-foreground bg-[#edf6f2] dark:bg-[#002c2e]">
      <Header zen sticky={stickyHeader} />

      <main
        className={`flex-1 flex flex-col px-4 sm:px-6 lg:px-8 max-w-[1400px] mx-auto w-full ${
          compact ? "py-4" : "py-6"
        }`}
      >
        <div
          className={`flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 ${
            compact ? "mb-4" : "mb-6"
          }`}
        >
          <div>
            <Link
              href="/admin"
              className="text-[11px] font-black uppercase tracking-[0.2em] text-primary hover:underline"
            >
              Panel administratora
            </Link>
            {/* W widoku roboczym statusy stoją obok numeru, nie pod nim —
                jeden wiersz mniej nad treścią. */}
            <div
              className={
                compact ? "flex flex-wrap items-center gap-x-4 gap-y-1.5 mt-1" : undefined
              }
            >
              <h1
                className={`font-extrabold tracking-tight text-foreground text-balance ${
                  compact ? "text-2xl sm:text-3xl" : "text-3xl sm:text-4xl mt-1.5"
                }`}
              >
                {title}
              </h1>
              {compact && meta}
            </div>
            {subtitle && (
              <p className="text-muted-foreground mt-1.5 font-medium">{subtitle}</p>
            )}
            {!compact && meta && <div className="mt-2.5">{meta}</div>}
          </div>
          {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
        </div>

        {/* Zakładki i pasek konta dzielą rząd od 1280 px — sześć zakładek
            mieści się obok paska, a poniżej zakładki dostają całą szerokość. */}
        <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-3">
          <div className="min-w-0">
            <AdminNav />
          </div>
          <div className="shrink-0 self-start xl:self-auto">
            {userBar ?? (adminEmail ? <AdminUserBar email={adminEmail} /> : null)}
          </div>
        </div>

        <div className={`flex flex-col ${compact ? "mt-4 gap-4" : "mt-6 gap-6"}`}>{children}</div>
      </main>
    </div>
  );
}

export function Card({
  title,
  description,
  actions,
  children,
  className = "",
  headingLevel = 2,
  dense = false,
}: {
  title?: React.ReactNode;
  description?: React.ReactNode;
  actions?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
  /** Strony z własnymi nagłówkami sekcji (ustawienia) schodzą z kartami na `h3`. */
  headingLevel?: 2 | 3;
  /** Ciaśniejsza karta dla widoków roboczych, gdzie liczy się gęstość informacji. */
  dense?: boolean;
}) {
  const Heading = headingLevel === 3 ? "h3" : "h2";
  return (
    <section
      className={`bg-card border border-border/70 rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.02)] ${
        dense ? "p-4 sm:p-5" : "p-5 sm:p-6"
      } ${className}`}
    >
      {(title || actions) && (
        <div className={`flex flex-wrap items-start justify-between gap-3 ${dense ? "mb-3" : "mb-4"}`}>
          <div>
            {title && (
              <Heading
                className={`font-extrabold text-foreground ${dense ? "text-base" : "text-lg"}`}
              >
                {title}
              </Heading>
            )}
            {description && (
              <p className="text-sm font-medium text-muted-foreground mt-0.5">{description}</p>
            )}
          </div>
          {actions}
        </div>
      )}
      {children}
    </section>
  );
}

/**
 * Karta, która zaczyna się zwinięta.
 *
 * Świadomie na `<details>`, nie na stanie Reacta — sekcja rozwija się bez
 * JS-a, a strona statystyk może trzymać komplet danych bez rozciągania się
 * na kilka ekranów.
 */
export function CollapsibleCard({
  id,
  title,
  description,
  defaultOpen = false,
  children,
  headingLevel = 2,
  bare = false,
}: {
  /** Kotwica — pozwala przyciskowi w innym miejscu strony rozwinąć kartę. */
  id?: string;
  title: string;
  description?: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
  headingLevel?: 2 | 3;
  /**
   * Tylko pasek nagłówka jest kartą, a zawartość leży pod nim bez ramki —
   * dla treści, która sama składa się z kart (formularz zamówienia).
   */
  bare?: boolean;
}) {
  const Heading = headingLevel === 3 ? "h3" : "h2";
  return (
    <details
      id={id}
      open={defaultOpen}
      className={`group scroll-mt-24 ${
        bare ? "" : "bg-card border border-border/70 rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.02)]"
      }`}
    >
      <summary
        className={`flex items-start justify-between gap-3 p-5 sm:p-6 cursor-pointer list-none [&::-webkit-details-marker]:hidden rounded-2xl hover:bg-muted/20 transition-colors ${
          bare ? "bg-card border border-border/70 shadow-[0_8px_30px_rgba(0,0,0,0.02)]" : ""
        }`}
      >
        <div>
          <Heading className="text-lg font-extrabold text-foreground">{title}</Heading>
          {description && (
            <p className="text-sm font-medium text-muted-foreground mt-0.5">{description}</p>
          )}
        </div>
        <span className="shrink-0 inline-flex items-center gap-1.5 text-xs font-bold text-muted-foreground">
          <span className="hidden sm:inline group-open:hidden">Rozwiń</span>
          <span className="hidden group-open:sm:inline">Zwiń</span>
          <ChevronDown
            className="w-4 h-4 transition-transform group-open:rotate-180"
            aria-hidden
          />
        </span>
      </summary>
      <div className={bare ? "mt-4" : "px-5 sm:px-6 pb-5 sm:pb-6"}>{children}</div>
    </details>
  );
}
