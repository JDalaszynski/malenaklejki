"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Sun, Moon, Contrast } from "lucide-react";
import { motion } from "framer-motion";

interface FooterProps {
  children?: React.ReactNode;
}

export function Footer({ children }: FooterProps = {}) {
  const [mounted, setMounted] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark" | "system">("system");

  useEffect(() => {
    setMounted(true);
    if (typeof window !== "undefined") {
      if ("theme" in localStorage) {
        setTheme(localStorage.theme as "light" | "dark" | "system");
      } else {
        setTheme("system");
      }
    }
  }, []);

  useEffect(() => {
    if (!mounted || theme !== "system") return;

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    
    // Apply system theme immediately on mount/activation
    document.documentElement.classList.remove("dark");
    if (mediaQuery.matches) {
      document.documentElement.classList.add("dark");
    }

    const handleChange = (e: MediaQueryListEvent) => {
      document.documentElement.classList.remove("dark");
      if (e.matches) {
        document.documentElement.classList.add("dark");
      }
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [mounted, theme]);

  const handleThemeChange = (newTheme: "light" | "dark" | "system") => {
    setTheme(newTheme);
    document.documentElement.classList.remove("dark");

    if (newTheme === "system") {
      localStorage.theme = "system";
      const systemMatchesDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      if (systemMatchesDark) {
        document.documentElement.classList.add("dark");
      }
    } else {
      localStorage.theme = newTheme;
      if (newTheme === "dark") {
        document.documentElement.classList.add("dark");
      }
    }
  };

  return (
    <footer className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-auto">
      <div className="py-8 text-center text-sm text-muted-foreground liquid-glass-footer rounded-t-3xl border-t border-x border-border/10 shadow-sm">
        <div className="max-w-5xl mx-auto flex flex-col items-center px-4 gap-6">
          {children}

          {/* Footer Links */}
          <div className="flex flex-wrap justify-center gap-x-6 gap-y-2">
            <Link href="/regulamin" className="hover:underline font-semibold transition-colors">
              Regulamin
            </Link>
            <Link href="/polityka-prywatnosci" className="hover:underline font-semibold transition-colors">
              Polityka prywatności
            </Link>
            <Link href="/pliki-cookies" className="hover:underline font-semibold transition-colors">
              Pliki cookies
            </Link>
            <Link href="/blog" className="hover:underline font-semibold transition-colors">
              Blog
            </Link>
            <Link href="/zamow-projekt" className="hover:underline font-semibold transition-colors">
              Zamów Projekt
            </Link>
            <Link href="/kontakt" className="hover:underline font-semibold transition-colors">
              Kontakt
            </Link>
          </div>

          {/* Theme Toggler - Premium Pill Selector */}
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-muted-foreground/80">Motyw strony:</span>
            <div className="relative flex bg-muted/40 p-1 rounded-full border border-border/30">
              {!mounted ? (
                // Skeleton loading state to prevent layout shift
                <div className="flex gap-1">
                  <div className="w-[70px] h-[28px] rounded-full bg-muted/20 animate-pulse" />
                  <div className="w-[70px] h-[28px] rounded-full bg-muted/20 animate-pulse" />
                  <div className="w-[70px] h-[28px] rounded-full bg-muted/20 animate-pulse" />
                </div>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => handleThemeChange("system")}
                    className={`relative px-3 py-1.5 text-xs font-black rounded-full transition-colors duration-200 flex items-center gap-1 focus:outline-none z-10 cursor-pointer ${
                      theme === "system" ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {theme === "system" && (
                      <motion.div
                        layoutId="activeThemeBubble"
                        className="absolute inset-0 bg-background rounded-full shadow-sm border border-border/20"
                        transition={{ type: "spring", stiffness: 380, damping: 30 }}
                      />
                    )}
                    <Contrast className="w-3.5 h-3.5 relative z-10" />
                    <span className="relative z-10">System</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleThemeChange("light")}
                    className={`relative px-3 py-1.5 text-xs font-black rounded-full transition-colors duration-200 flex items-center gap-1 focus:outline-none z-10 cursor-pointer ${
                      theme === "light" ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {theme === "light" && (
                      <motion.div
                        layoutId="activeThemeBubble"
                        className="absolute inset-0 bg-background rounded-full shadow-sm border border-border/20"
                        transition={{ type: "spring", stiffness: 380, damping: 30 }}
                      />
                    )}
                    <Sun className="w-3.5 h-3.5 relative z-10" />
                    <span className="relative z-10">Jasny</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleThemeChange("dark")}
                    className={`relative px-3 py-1.5 text-xs font-black rounded-full transition-colors duration-200 flex items-center gap-1 focus:outline-none z-10 cursor-pointer ${
                      theme === "dark" ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {theme === "dark" && (
                      <motion.div
                        layoutId="activeThemeBubble"
                        className="absolute inset-0 bg-background rounded-full shadow-sm border border-border/20"
                        transition={{ type: "spring", stiffness: 380, damping: 30 }}
                      />
                    )}
                    <Moon className="w-3.5 h-3.5 relative z-10" />
                    <span className="relative z-10">Ciemny</span>
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Copyright */}
          <p className="text-xs text-muted-foreground/80 font-medium">
            &copy; {new Date().getFullYear()} MałeNaklejki. Wszelkie prawa zastrzeżone.
          </p>
        </div>
      </div>
    </footer>
  );
}
