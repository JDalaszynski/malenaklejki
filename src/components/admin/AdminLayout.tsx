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
  children,
}: {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  adminEmail?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen text-foreground bg-[#edf6f2] dark:bg-[#002c2e]">
      <Header zen />

      <main className="flex-1 flex flex-col py-6 px-4 sm:px-6 lg:px-8 max-w-[1400px] mx-auto w-full">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-6">
          <div>
            <Link
              href="/admin"
              className="text-[11px] font-black uppercase tracking-[0.2em] text-primary hover:underline"
            >
              Panel administratora
            </Link>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground text-balance mt-1.5">
              {title}
            </h1>
            {subtitle && (
              <p className="text-muted-foreground mt-1.5 font-medium">{subtitle}</p>
            )}
          </div>
          {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <AdminNav />
          {adminEmail && <AdminUserBar email={adminEmail} />}
        </div>

        <div className="mt-6 flex flex-col gap-6">{children}</div>
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
}: {
  title?: string;
  description?: string;
  actions?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`bg-card border border-border/70 rounded-2xl p-5 sm:p-6 shadow-[0_8px_30px_rgba(0,0,0,0.02)] ${className}`}
    >
      {(title || actions) && (
        <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
          <div>
            {title && <h2 className="text-lg font-extrabold text-foreground">{title}</h2>}
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
  title,
  description,
  defaultOpen = false,
  children,
}: {
  title: string;
  description?: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  return (
    <details
      open={defaultOpen}
      className="group bg-card border border-border/70 rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.02)]"
    >
      <summary className="flex items-start justify-between gap-3 p-5 sm:p-6 cursor-pointer list-none [&::-webkit-details-marker]:hidden rounded-2xl hover:bg-muted/20 transition-colors">
        <div>
          <h2 className="text-lg font-extrabold text-foreground">{title}</h2>
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
      <div className="px-5 sm:px-6 pb-5 sm:pb-6">{children}</div>
    </details>
  );
}
