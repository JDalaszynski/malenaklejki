"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { motion, AnimatePresence } from "framer-motion";
import { Search, ArrowUp, FileText, Shield, Cookie, CornerDownRight, X, ChevronRight } from "lucide-react";

export interface DocSection {
  id: string;
  title: string;
  content: React.ReactNode;
  searchText?: string; // Plain text version for searching
}

interface DocLayoutProps {
  title: string;
  description?: string;
  lastUpdated: string;
  activeTab: "regulamin" | "polityka-prywatnosci" | "pliki-cookies";
  sections: DocSection[];
  children?: React.ReactNode; // Optional extra content below sections
}

export function DocLayout({
  title,
  description,
  lastUpdated,
  activeTab,
  sections,
  children,
}: DocLayoutProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeSectionId, setActiveSectionId] = useState("");
  const [showScrollTop, setShowScrollTop] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Tabs configuration
  const tabs = [
    { id: "regulamin", label: "Regulamin", href: "/regulamin", icon: FileText },
    { id: "polityka-prywatnosci", label: "Polityka Prywatności", href: "/polityka-prywatnosci", icon: Shield },
    { id: "pliki-cookies", label: "Pliki Cookies", href: "/pliki-cookies", icon: Cookie },
  ];

  // Monitor scroll to show/hide back-to-top button
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Track active section on scroll
  useEffect(() => {
    // Disconnect existing observer
    if (observerRef.current) observerRef.current.disconnect();

    const observerCallback = (entries: IntersectionObserverEntry[]) => {
      // Find the first entry that is intersecting
      const visibleEntry = entries.find((entry) => entry.isIntersecting);
      if (visibleEntry) {
        setActiveSectionId(visibleEntry.target.id);
      }
    };

    observerRef.current = new IntersectionObserver(observerCallback, {
      rootMargin: "-20% 0px -60% 0px", // Trigger when section is in upper-middle of viewport
      threshold: 0.1,
    });

    sections.forEach((section) => {
      const element = document.getElementById(section.id);
      if (element && observerRef.current) {
        observerRef.current.observe(element);
      }
    });

    return () => {
      if (observerRef.current) observerRef.current.disconnect();
    };
  }, [sections, searchQuery]); // Re-observe if sections or filter changes

  // Filter sections by search query
  const filteredSections = sections.filter((section) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    const matchesTitle = section.title.toLowerCase().includes(query);
    const matchesContent = section.searchText
      ? section.searchText.toLowerCase().includes(query)
      : false;
    return matchesTitle || matchesContent;
  });

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const offset = 100; // Offset for header
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = element.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
      setActiveSectionId(id);
    }
  };

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <div
      className="flex flex-col min-h-screen bg-white text-foreground selection:bg-primary/20 selection:text-primary transition-colors duration-300 always-light"
      style={{
        backgroundColor: "#FFFFFF",
        color: "#004749",
        "--background": "#FFFFFF",
        "--foreground": "#004749",
        "--card": "#FFFFFF",
        "--card-foreground": "#004749",
        "--muted": "#F4FAF7",
        "--muted-foreground": "#004749",
        "--border": "#E2E8F0",
        "--ring": "#02af7a",
      } as React.CSSProperties}
    >
      <Header />

      {/* Hero Header Section */}
      <section className="relative overflow-hidden pt-12 pb-16 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto w-full">
        {/* Soft Background Blobs */}
        <div className="absolute -top-12 -left-12 w-72 h-72 bg-gradient-to-tr from-primary/10 to-transparent rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-12 -right-12 w-72 h-72 bg-gradient-to-bl from-secondary/10 to-transparent rounded-full blur-3xl pointer-events-none" />

        <div className="relative text-center max-w-3xl mx-auto space-y-4">


          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-foreground"
          >
            {title}
          </motion.h1>

          {description && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-muted-foreground text-sm sm:text-base max-w-2xl mx-auto font-medium"
            >
              {description}
            </motion.p>
          )}

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="text-xs font-bold text-muted-foreground/80"
          >
            Ostatnia aktualizacja: {lastUpdated}
          </motion.p>
        </div>

        {/* Tab Navigator */}
        <div className="mt-12 flex justify-center">
          <div className="relative flex bg-muted/40 p-1.5 rounded-2xl border border-border/40 shadow-sm max-w-full overflow-x-auto no-scrollbar">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <Link key={tab.id} href={tab.href} className="relative z-10">
                  <span
                    className={`relative flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-black transition-colors duration-200 cursor-pointer whitespace-nowrap ${isActive ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                      }`}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="activeDocTabBubble"
                        className="absolute inset-0 bg-background rounded-xl shadow-sm border border-border/30"
                        transition={{ type: "spring", stiffness: 350, damping: 28 }}
                      />
                    )}
                    <Icon className="w-4 h-4 relative z-10 text-primary" />
                    <span className="relative z-10">{tab.label}</span>
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Main Content & Sidebar */}
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-8 pb-24">
        {/* Search Bar */}
        <div className="max-w-3xl mx-auto mb-10">
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-muted-foreground group-focus-within:text-primary transition-colors">
              <Search className="w-5 h-5" />
            </div>
            <input
              type="text"
              placeholder="Szukaj w treści dokumentu..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="block w-full pl-12 pr-10 py-3.5 bg-card border border-border/80 rounded-2xl text-sm font-semibold text-foreground placeholder-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
          {searchQuery && (
            <div className="mt-2 text-xs text-muted-foreground font-bold px-1">
              Znaleziono sekcji: <span className="text-primary">{filteredSections.length}</span>
            </div>
          )}
        </div>

        {filteredSections.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12 bg-card border border-border/50 rounded-3xl"
          >
            <p className="text-muted-foreground font-semibold">
              Brak wyników pasujących do frazy &quot;{searchQuery}&quot;. Spróbuj innego słowa kluczowego.
            </p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-10 items-start">
            {/* Sidebar Table of Contents */}
            <aside className="hidden lg:block lg:col-span-1 sticky top-24 max-h-[calc(100vh-160px)] overflow-y-auto pr-2 no-scrollbar">
              <div className="space-y-4">
                <h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground/60 px-3">
                  Spis Treści
                </h3>
                <nav className="space-y-1">
                  {filteredSections.map((section) => {
                    const isActive = activeSectionId === section.id;
                    return (
                      <button
                        key={section.id}
                        onClick={() => scrollToSection(section.id)}
                        className={`w-full text-left flex items-start gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer ${isActive
                            ? "bg-primary/5 text-primary shadow-sm border-l-2 border-primary"
                            : "text-muted-foreground hover:bg-muted/40 hover:text-foreground"
                          }`}
                      >
                        <ChevronRight
                          className={`w-3.5 h-3.5 mt-0.5 shrink-0 transition-transform ${isActive ? "rotate-90 text-primary" : "text-muted-foreground/40"
                            }`}
                        />
                        <span>{section.title}</span>
                      </button>
                    );
                  })}
                </nav>
              </div>
            </aside>

            {/* Mobile TOC Horizontal Scroll */}
            <div className="lg:hidden col-span-1 bg-card/65 backdrop-blur-md border border-border/60 rounded-2xl p-3 mb-2 sticky top-4 z-40 overflow-x-auto flex gap-2 no-scrollbar shadow-sm">
              {filteredSections.map((section) => {
                const isActive = activeSectionId === section.id;
                return (
                  <button
                    key={section.id}
                    onClick={() => scrollToSection(section.id)}
                    className={`shrink-0 px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${isActive
                        ? "bg-primary text-primary-foreground font-black"
                        : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground"
                      }`}
                  >
                    {section.title.split(".")[0] || section.title}
                  </button>
                );
              })}
            </div>

            {/* Content List */}
            <div className="lg:col-span-3 space-y-8">
              <AnimatePresence mode="popLayout">
                {filteredSections.map((section, idx) => (
                  <motion.section
                    key={section.id}
                    id={section.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.4, delay: Math.min(idx * 0.05, 0.3) }}
                    className="group bg-card border border-border/60 hover:border-border rounded-3xl p-6 sm:p-8 shadow-[0_4px_20px_rgba(0,0,0,0.01)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.02)] transition-all duration-300"
                  >
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0 border border-primary/20">
                        <span className="text-primary font-black text-sm">{idx + 1}</span>
                      </div>
                      <h2 className="text-xl sm:text-2xl font-black text-foreground tracking-tight group-hover:text-primary transition-colors">
                        {section.title}
                      </h2>
                    </div>

                    <div className="text-sm sm:text-base text-justify leading-relaxed text-foreground/90 space-y-4 font-medium prose prose-teal dark:prose-invert max-w-none">
                      {section.content}
                    </div>
                  </motion.section>
                ))}
              </AnimatePresence>

              {/* Extra children nodes (e.g. action buttons) */}
              {children && (
                <motion.div
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  className="bg-card border border-border/40 rounded-3xl p-6 sm:p-8 flex flex-col items-center text-center gap-4"
                >
                  {children}
                </motion.div>
              )}
            </div>
          </div>
        )}
      </main>

      <Footer />

      {/* Floating Scroll to Top Button */}
      <AnimatePresence>
        {showScrollTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            onClick={scrollToTop}
            className="fixed bottom-8 right-8 z-50 w-12 h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-black rounded-full shadow-lg flex items-center justify-center hover:scale-105 active:scale-95 transition-all cursor-pointer border border-primary/20"
            title="Powrót na górę"
          >
            <ArrowUp className="w-5 h-5 stroke-[2.5]" />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
