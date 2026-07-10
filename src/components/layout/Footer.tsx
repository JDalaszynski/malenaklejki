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
  const [theme, setTheme] = useState<"light" | "dark" | "system">("light");

  useEffect(() => {
    setMounted(true);
    if (typeof window !== "undefined") {
      if ("theme" in localStorage) {
        setTheme(localStorage.theme as "light" | "dark" | "system");
      } else {
        setTheme("light");
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

          {/* Social Media Links */}
          <div className="flex items-center gap-4 -mt-2">
            <a
              href="https://www.facebook.com/profile.php?id=61591604648504"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-full hover:bg-muted/60 text-muted-foreground hover:text-foreground transition-all duration-200"
              aria-label="Facebook"
            >
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
            </a>
            <a
              href="https://www.instagram.com/male_naklejki"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-full hover:bg-muted/60 text-muted-foreground hover:text-foreground transition-all duration-200"
              aria-label="Instagram"
            >
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.051.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"/>
              </svg>
            </a>
            <a
              href="https://pl.pinterest.com/MaleNaklejki/"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-full hover:bg-muted/60 text-muted-foreground hover:text-foreground transition-all duration-200"
              aria-label="Pinterest"
            >
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.162-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.966 1.406-5.966s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.211-.174.263-.403.156-1.49-.696-2.423-2.885-2.423-4.652 0-3.791 2.754-7.275 7.944-7.275 4.166 0 7.411 2.974 7.411 6.953 0 4.14-2.611 7.477-6.233 7.477-1.217 0-2.361-.632-2.751-1.379l-.749 2.853c-.271 1.033-1.002 2.324-1.492 3.12 1.095.339 2.253.522 3.456.522 6.621 0 11.988-5.367 11.988-11.987C24.01 5.367 18.643 0 12.017 0z"/>
              </svg>
            </a>
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
