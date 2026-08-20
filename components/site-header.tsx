"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { useCredits } from "@/lib/credits-context";
import { Button, ButtonLink } from "./ui";
import { ThemeToggle } from "./theme-toggle";
import { Wordmark } from "./brand-mark";

const LINKS = [
  { href: "/#features", label: "Features" },
  { href: "/#how", label: "How it works" },
  { href: "/#pricing", label: "Pricing" },
];

export function SiteHeader() {
  const { user, loading, logout } = useAuth();
  const credits = useCredits();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-30 border-b bg-background/80 backdrop-blur transition-colors ${
        scrolled ? "border-hairline" : "border-transparent"
      }`}
    >
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center gap-7 px-6">
        <Wordmark href="/" />

        <nav className="hidden gap-1 md:flex">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="rounded-lg px-3 py-2 text-sm font-medium text-muted transition-colors hover:bg-surface-2 hover:text-foreground"
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="flex flex-1 items-center justify-end gap-2.5">
          <ThemeToggle />
          {loading ? null : user ? (
            <>
              {credits && credits.balance !== null && (
                <Link
                  href="/billing"
                  className="hidden items-center gap-1.5 rounded-full border border-hairline-2 bg-surface px-3 py-1.5 text-sm font-medium text-foreground-2 transition-colors hover:border-muted sm:inline-flex"
                  title="Credits — click to buy more"
                >
                  <span className="text-accent">◆</span>
                  <span className="tabular-nums">{credits.balance}</span>
                </Link>
              )}
              <ButtonLink href="/dashboard" variant="secondary" className="px-3.5 py-2">
                Dashboard
              </ButtonLink>
              <Button variant="ghost" className="hidden px-3.5 py-2 sm:inline-flex" onClick={() => logout()}>
                Log out
              </Button>
            </>
          ) : (
            <>
              <ButtonLink href="/login" variant="ghost" className="hidden px-3.5 py-2 sm:inline-flex">
                Log in
              </ButtonLink>
              <ButtonLink href="/register" variant="primary" className="px-3.5 py-2">
                Start writing
              </ButtonLink>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
