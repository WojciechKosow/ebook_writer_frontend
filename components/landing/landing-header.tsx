"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { BrandMark } from "@/components/brand-mark";
import { ThemeToggle } from "@/components/theme-toggle";
import { BRAND } from "@/lib/brand";
import { useAmbient } from "./ambient";

const LINKS = [
  { href: "#features", label: "Features" },
  { href: "#how", label: "How it works" },
  { href: "#pricing", label: "Pricing" },
  { href: "#faq", label: "FAQ" },
  { href: "/blog", label: "Blog" },
];

export function LandingHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [ambient, setAmbient] = useAmbient();
  const menuRef = useRef<HTMLDivElement>(null);

  // Close the display menu on an outside click or Escape.
  useEffect(() => {
    if (!menuOpen) return;
    const onDown = (e: PointerEvent) => {
      if (!menuRef.current?.contains(e.target as Node)) setMenuOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [menuOpen]);

  return (
    <header className="sticky top-0 z-30 border-b border-ip-hair bg-ip-glass backdrop-blur-md">
      <div className="mx-auto flex w-full max-w-[1200px] flex-wrap items-center gap-x-7 gap-y-1.5 px-4 py-2.5 sm:px-6 md:py-3.5">
        <Link href="/" className="flex items-center gap-2.5">
          <BrandMark className="h-8 w-8" />
          <span className="font-display text-[23px] font-medium tracking-[-0.01em]">{BRAND}</span>
        </Link>

        <nav
          aria-label="Main"
          className="order-3 -mx-4 flex w-[calc(100%+2rem)] gap-1 overflow-x-auto px-2.5 [scrollbar-width:none] md:order-none md:mx-0 md:w-auto md:flex-1 md:overflow-visible md:px-0 [&::-webkit-scrollbar]:hidden"
        >
          {LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="shrink-0 whitespace-nowrap rounded-[10px] px-3 py-2 text-sm text-ip-ink-2 transition-colors hover:bg-ip-surface hover:text-ip-ink"
            >
              {l.label}
            </a>
          ))}
          <Link
            href="/login"
            className="shrink-0 whitespace-nowrap rounded-[10px] px-3 py-2 text-sm font-semibold text-ip-ink min-[441px]:hidden"
          >
            Log in
          </Link>
        </nav>

        <div ref={menuRef} className="relative ml-auto flex items-center gap-1.5 sm:gap-2.5">
          <ThemeToggle />
          <button
            type="button"
            aria-label="Display settings"
            aria-expanded={menuOpen}
            aria-haspopup="dialog"
            onClick={() => setMenuOpen((v) => !v)}
            className="grid h-9 w-9 place-items-center rounded-lg text-ip-muted transition-colors hover:bg-ip-surface hover:text-ip-ink"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" aria-hidden="true">
              <path d="M4 7h10M18 7h2M4 17h4M12 17h8" />
              <circle cx="16" cy="7" r="2" />
              <circle cx="10" cy="17" r="2" />
            </svg>
          </button>
          <Link
            href="/login"
            className="whitespace-nowrap px-3 py-2.5 text-sm font-medium max-[440px]:hidden"
          >
            Log in
          </Link>
          <Link
            href="/register"
            className="ip-cta whitespace-nowrap rounded-xl bg-ip-ink px-3.5 py-2.5 text-sm font-semibold text-ip-bg sm:px-[18px]"
          >
            Start writing
          </Link>

          {menuOpen && (
            <div
              role="dialog"
              aria-label="Display settings"
              className="ip-pop fixed inset-x-4 top-16 z-40 flex flex-col gap-4 rounded-[18px] border border-ip-hair bg-ip-surface p-[18px] ip-shadow sm:absolute sm:inset-x-auto sm:right-0 sm:top-14 sm:w-[300px]"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div id="ambient-label" className="text-sm font-semibold">Ambient pages</div>
                  <div className="mt-0.5 text-[13px] text-ip-muted">
                    Loose pages and letters drifting behind the content.
                  </div>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={ambient}
                  aria-labelledby="ambient-label"
                  onClick={() => setAmbient(!ambient)}
                  className={`relative mt-0.5 h-7 w-12 shrink-0 rounded-full transition-colors ${ambient ? "bg-ip-accent" : "bg-ip-line"}`}
                >
                  <span
                    className={`absolute left-[3px] top-[3px] h-[22px] w-[22px] rounded-full bg-white shadow transition-transform duration-200 ${ambient ? "translate-x-5" : ""}`}
                  />
                </button>
              </div>
              <div className="border-t border-ip-hair pt-3 text-xs text-ip-muted">
                Off automatically when your system asks for reduced motion.
              </div>
            </div>
          )}
        </div>
      </div>
      <div
        aria-hidden="true"
        className="ip-progress absolute inset-x-0 -bottom-px h-0.5 origin-left bg-ip-brass-l"
        style={{ transform: "scaleX(0)" }}
      />
    </header>
  );
}
