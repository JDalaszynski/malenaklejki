import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { AccountNav } from "./AccountNav";

export function AccountLayout({
  title,
  subtitle,
  actions,
  banner,
  children,
}: {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  banner?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen text-foreground bg-[#edf6f2] dark:bg-[#002c2e]">
      <Header />

      <main className="flex-1 flex flex-col py-6 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto w-full">
        <div className="mb-7 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground text-balance">
              {title}
            </h1>
            {subtitle && (
              <p className="text-muted-foreground mt-2 font-medium text-base sm:text-lg">
                {subtitle}
              </p>
            )}
          </div>
          {actions}
        </div>

        {banner && <div className="mb-6">{banner}</div>}

        <div className="grid gap-6 lg:grid-cols-[220px_minmax(0,1fr)] items-start">
          <div className="lg:sticky lg:top-24">
            <AccountNav />
          </div>
          <div className="min-w-0 flex flex-col gap-6">{children}</div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

/** Karta treści na koncie — ten sam styl co karty w koszyku. */
export function Panel({
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
      className={`bg-card border border-border/70 rounded-2xl p-6 sm:p-7 shadow-[0_8px_30px_rgba(0,0,0,0.02)] ${className}`}
    >
      {(title || actions) && (
        <div className="flex flex-wrap items-start justify-between gap-3 mb-5">
          <div>
            {title && <h2 className="text-xl font-extrabold text-foreground">{title}</h2>}
            {description && (
              <p className="text-sm font-medium text-muted-foreground mt-1">{description}</p>
            )}
          </div>
          {actions}
        </div>
      )}
      {children}
    </section>
  );
}
