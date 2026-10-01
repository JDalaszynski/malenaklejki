/**
 * Sekcja strony ustawień — nagłówek z ikoną i opisem nad kartami.
 *
 * `id` służy za kotwicę dla bocznego menu; `scroll-mt` zostawia miejsce na
 * przyklejony nagłówek sklepu, żeby tytuł sekcji nie chował się pod nim.
 */
export function SettingsSection({
  id,
  icon: Icon,
  title,
  description,
  children,
}: {
  id: string;
  icon: React.ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} aria-labelledby={`${id}-tytul`} className="scroll-mt-28 flex flex-col gap-4">
      <header className="flex items-start gap-3">
        <span className="shrink-0 w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
          <Icon className="w-5 h-5" aria-hidden />
        </span>
        <div>
          <h2 id={`${id}-tytul`} className="text-2xl font-extrabold tracking-tight text-foreground">
            {title}
          </h2>
          <p className="text-sm font-medium text-muted-foreground mt-0.5 max-w-2xl">
            {description}
          </p>
        </div>
      </header>
      {children}
    </section>
  );
}
