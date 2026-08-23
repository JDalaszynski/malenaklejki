import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

export function AuthShell({
  title,
  subtitle,
  children,
  aside,
  footer,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  aside?: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen text-foreground bg-[#edf6f2] dark:bg-[#002c2e]">
      <Header />

      <main className="flex-1 flex flex-col py-6 sm:py-10 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto w-full">
        <div
          className={`w-full mx-auto grid gap-8 items-start ${
            aside ? "lg:grid-cols-[minmax(0,1fr)_minmax(0,0.85fr)] max-w-5xl" : "max-w-md"
          }`}
        >
          <div className="w-full">
            <div className="mb-7 text-center lg:text-left">
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground text-balance">
                {title}
              </h1>
              {subtitle && (
                <p className="text-muted-foreground mt-2 font-medium text-base sm:text-lg">
                  {subtitle}
                </p>
              )}
            </div>

            <div className="bg-card border border-border/70 rounded-3xl p-6 sm:p-8 shadow-[0_8px_30px_rgba(0,0,0,0.03)]">
              {children}
            </div>

            {footer && (
              <div className="mt-6 text-center text-sm font-semibold text-muted-foreground">
                {footer}
              </div>
            )}
          </div>

          {aside && <div className="w-full lg:sticky lg:top-24">{aside}</div>}
        </div>
      </main>

      <Footer />
    </div>
  );
}

/** Panel korzyści przy rejestracji — mówi, co konto realnie daje. */
export function AccountBenefits() {
  const benefits = [
    {
      title: "Twoje arkusze zawsze pod ręką",
      text: "Zamów te same naklejki ponownie jednym kliknięciem — bez szukania plików i projektowania od zera.",
    },
    {
      title: "Historia i statusy zamówień",
      text: "Sprawdzisz, co jest w produkcji, a co już wyjechało, bez szukania maili w skrzynce.",
    },
    {
      title: "Formularz wypełniony za Ciebie",
      text: "Adres, telefon i dane do faktury podstawiają się same przy kolejnym zamówieniu.",
    },
  ];

  return (
    <div className="bg-card/70 border border-border/60 rounded-3xl p-6 sm:p-8">
      <p className="text-[11px] font-black uppercase tracking-[0.2em] text-primary mb-5">
        Co daje konto
      </p>
      <ul className="flex flex-col gap-5">
        {benefits.map((b) => (
          <li key={b.title} className="flex gap-4">
            <span
              aria-hidden
              className="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full bg-primary"
            />
            <div>
              <p className="font-extrabold text-foreground leading-snug">{b.title}</p>
              <p className="text-sm font-medium text-muted-foreground mt-1 leading-relaxed">
                {b.text}
              </p>
            </div>
          </li>
        ))}
      </ul>
      <p className="text-sm font-medium text-muted-foreground mt-6 pt-6 border-t border-border/50">
        Konto jest darmowe i nie jest wymagane, żeby złożyć zamówienie. Możesz je założyć także{" "}
        <Link href="/koszyk" className="font-bold text-primary hover:underline">
          po zakupach
        </Link>
        .
      </p>
    </div>
  );
}
