"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const StickerIcon = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    className={className}
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="m23.967 10.417a12.04 12.04 0 1 0 -13.55 13.55 3.812 3.812 0 0 0 .489.032 3.993 3.993 0 0 0 2.805-1.184l9.1-9.1a3.962 3.962 0 0 0 1.156-3.298zm-21.9.474a10.034 10.034 0 0 1 19.8-.884 12.006 12.006 0 0 0 -11.86 11.852 9.988 9.988 0 0 1 -7.944-10.968zm10.233 10.509a2.121 2.121 0 0 1 -.278.225 10 10 0 0 1 9.606-9.607 2.043 2.043 0 0 1 -.224.279z" />
  </svg>
);

export function StickyCTAButton() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const banner = document.getElementById("first-article-banner");
    if (!banner) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        const rect = entry.boundingClientRect;
        const isBelow = rect.top < 0;
        setIsVisible(!entry.isIntersecting && isBelow);
      },
      {
        threshold: 0,
      }
    );

    observer.observe(banner);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      className={`fixed z-50 transition-all duration-500 ease-in-out
        bottom-0 left-0 right-0 w-full p-4 bg-white/95 dark:bg-[#002c2e]/95 backdrop-blur border-t border-border/40
        md:bottom-6 md:left-1/2 md:right-auto md:-translate-x-1/2 md:max-w-md md:p-0 md:bg-transparent md:dark:bg-transparent md:backdrop-blur-none md:border-none
        ${
          isVisible
            ? "translate-y-0 opacity-100 pointer-events-auto"
            : "translate-y-full opacity-100 pointer-events-none md:opacity-0 md:translate-y-10"
        }
      `}
    >
      <Link
        href="/"
        className="group relative flex items-center justify-center gap-2 md:gap-3 px-5 py-4 md:px-8 md:py-4 w-full bg-[#02af7a] hover:bg-[#029668] text-white text-base md:text-lg font-black tracking-wide uppercase rounded-2xl shadow-[0_8px_30px_rgba(2,175,122,0.4)] hover:shadow-[0_12px_35px_rgba(2,175,122,0.6)] transform active:scale-95 transition-all duration-300 overflow-hidden border border-white/10"
      >
        <div
          className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          style={{
            mixBlendMode: "overlay",
            background: "linear-gradient(105deg, transparent 30%, rgba(255,255,255,0.1) 40%, rgba(255,255,255,0.4) 45%, rgba(255,255,255,0.1) 50%, transparent 60%)",
            backgroundSize: "200% 100%",
            animation: "glossSweep 2s infinite linear",
          }}
        />
        <StickerIcon className="w-5 h-5 md:w-6 md:h-6 text-white transition-transform duration-300 group-hover:rotate-12 group-hover:scale-110" />
        <span className="relative z-10">Zamów Zestaw Naklejek</span>
      </Link>
    </div>
  );
}
