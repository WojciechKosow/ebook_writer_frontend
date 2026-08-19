"use client";

import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { BRAND } from "@/lib/brand";
import { Button, ButtonLink } from "./ui";

export function SiteHeader() {
  const { user, loading, logout } = useAuth();

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
