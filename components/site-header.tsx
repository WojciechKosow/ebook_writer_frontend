"use client";

import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { useCredits } from "@/lib/credits-context";
import { BRAND } from "@/lib/brand";
import { Button, ButtonLink } from "./ui";

export function SiteHeader() {
  const { user, loading, logout } = useAuth();
  const credits = useCredits();

  return (
    <header className="sticky top-0 z-10 border-b border-zinc-200 bg-white/80 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/80">
      <div className="mx-auto flex h-16 w-full max-w-5xl items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-2 font-semibold text-zinc-900 dark:text-zinc-50">
          <span className="grid h-7 w-7 place-items-center rounded-md bg-indigo-600 text-sm text-white">
            {BRAND.charAt(0)}
          </span>
          {BRAND}
        </Link>

        <nav className="flex items-center gap-2">
          {loading ? null : user ? (
            <>
              {credits && credits.balance !== null && (
                <Link
                  href="/billing"
                  className="inline-flex items-center gap-1.5 rounded-full border border-zinc-200 bg-white px-3 py-1.5 text-sm font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
                  title="Credits — click to buy more"
                >
                  <span className="text-indigo-600 dark:text-indigo-400">◆</span>
                  {credits.balance}
                </Link>
              )}
              <ButtonLink href="/dashboard" variant="ghost">
                Dashboard
              </ButtonLink>
              <Button variant="secondary" onClick={() => logout()}>
                Log out
              </Button>
            </>
          ) : (
            <>
              <ButtonLink href="/login" variant="ghost">
                Log in
              </ButtonLink>
              <ButtonLink href="/register" variant="primary">
                Get started
              </ButtonLink>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
