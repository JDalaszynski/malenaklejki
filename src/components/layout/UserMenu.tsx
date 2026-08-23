"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { LayoutDashboard, LogOut, Package, ShieldCheck, User, UserRound } from "lucide-react";

import { signOut } from "@/app/actions/auth";
import { initials, invalidateSessionUser, useSessionUser } from "@/hooks/useSessionUser";

const MENU_LINKS = [
  { href: "/konto/zamowienia", label: "Moje zamówienia", icon: Package },
  { href: "/konto/dane", label: "Dane i adresy", icon: UserRound },
  { href: "/konto/bezpieczenstwo", label: "Bezpieczeństwo", icon: ShieldCheck },
];

export function UserMenu() {
  const { status, user } = useSessionUser();
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (event: MouseEvent | TouchEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("touchstart", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("touchstart", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const handleSignOut = () => {
    setOpen(false);
    startTransition(async () => {
      await signOut();
      invalidateSessionUser();
      router.push("/");
      router.refresh();
    });
  };

  // Przed poznaniem stanu sesji pokazujemy neutralną ikonę — tak samo jak
  // licznik koszyka, który też czeka na zamontowanie.
  if (status === "loading" || !user) {
    return (
      <Link
        href="/logowanie"
        aria-label="Zaloguj się"
        className="relative flex items-center p-2 rounded-2xl hover:bg-muted/50 transition-colors cursor-pointer group"
      >
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <User className="w-6 h-6 text-foreground group-hover:text-primary transition-colors" />
        </motion.div>
      </Link>
    );
  }

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Menu konta"
        className="flex items-center p-1 rounded-2xl hover:bg-muted/50 transition-colors cursor-pointer"
      >
        <motion.span
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-black select-none"
        >
          {initials(user.firstName, user.email)}
        </motion.span>
        {!user.emailVerified && (
          <span
            aria-hidden
            className="absolute -top-0.5 -right-0.5 h-3 w-3 rounded-full bg-destructive border-2 border-background"
          />
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            role="menu"
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={{ duration: 0.16, ease: "easeOut" }}
            className="absolute right-0 mt-3 w-64 origin-top-right rounded-2xl border border-border/70 bg-card shadow-[0_16px_40px_-12px_rgba(0,71,73,0.25)] overflow-hidden z-50"
          >
            <div className="px-4 py-3 border-b border-border/60 bg-muted/30">
              <p className="font-extrabold text-sm text-foreground truncate">
                {user.firstName || "Twoje konto"}
              </p>
              <p className="text-xs font-medium text-muted-foreground truncate">{user.email}</p>
            </div>

            {!user.emailVerified && (
              <Link
                href="/konto/potwierdz-email"
                onClick={() => setOpen(false)}
                role="menuitem"
                className="block px-4 py-3 text-xs font-bold text-destructive bg-destructive/10 hover:bg-destructive/15 transition-colors border-b border-border/60"
              >
                Potwierdź adres e-mail, żeby odblokować historię zamówień
              </Link>
            )}

            <div className="p-1.5 flex flex-col">
              {user.isAdmin && (
                <Link
                  href="/admin"
                  onClick={() => setOpen(false)}
                  role="menuitem"
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold text-primary hover:bg-primary/10 transition-colors"
                >
                  <LayoutDashboard className="w-4 h-4 shrink-0" aria-hidden />
                  Panel administratora
                </Link>
              )}

              {MENU_LINKS.map(({ href, label, icon: Icon }) => (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setOpen(false)}
                  role="menuitem"
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold text-foreground hover:bg-muted/60 hover:text-primary transition-colors"
                >
                  <Icon className="w-4 h-4 shrink-0" aria-hidden />
                  {label}
                </Link>
              ))}
            </div>

            <div className="p-1.5 border-t border-border/60">
              <button
                type="button"
                onClick={handleSignOut}
                disabled={isPending}
                role="menuitem"
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold text-muted-foreground hover:bg-muted/60 hover:text-destructive transition-colors cursor-pointer disabled:opacity-60"
              >
                <LogOut className="w-4 h-4 shrink-0" aria-hidden />
                {isPending ? "Wylogowywanie..." : "Wyloguj się"}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/** Pozycje konta w rozwijanym menu mobilnym. */
export function MobileAccountLinks({ onNavigate }: { onNavigate: () => void }) {
  const { status, user } = useSessionUser();
  const linkClass =
    "w-full inline-flex items-center justify-center px-4 py-3 text-[15px] font-extrabold text-foreground hover:text-primary bg-muted/30 hover:bg-muted/60 rounded-xl border border-border/30 transition-all cursor-pointer text-center active:scale-[0.99]";

  if (status === "loading" || !user) {
    return (
      <Link href="/logowanie" onClick={onNavigate} className={linkClass}>
        <User className="w-5 h-5 mr-2" aria-hidden />
        Zaloguj się
      </Link>
    );
  }

  return (
    <>
      {user.isAdmin && (
        <Link href="/admin" onClick={onNavigate} className={linkClass}>
          <LayoutDashboard className="w-5 h-5 mr-2" aria-hidden />
          Panel administratora
        </Link>
      )}
      <Link href="/konto" onClick={onNavigate} className={linkClass}>
        <User className="w-5 h-5 mr-2" aria-hidden />
        Moje konto
      </Link>
    </>
  );
}
