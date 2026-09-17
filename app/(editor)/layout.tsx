"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { CreditsProvider } from "@/lib/credits-context";
import { Spinner } from "@/components/ui";

/**
 * Layout for the dedicated, full-screen editor workspace. Same session guard as
 * the main app area ({@link app/(app)/layout.tsx}) — wait for bootstrap, redirect
 * to /login when signed out, and expose the credits context — but deliberately
 * *without* the global {@link AppShell} nav. Entering an ebook here is a Canva-like
 * takeover: the generic sidebar is gone and the editor supplies its own chrome
 * (see components/editor/editor-shell.tsx). The frame fills the viewport so the
 * editor can own the full height.
 */
export default function EditorLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [loading, user, router]);

  if (loading || !user) {
    return (
      <div className="flex h-screen items-center justify-center text-ink-soft">
        <Spinner />
      </div>
    );
  }

  return (
    <CreditsProvider>
      <div className="flex h-screen flex-col overflow-hidden bg-surface-3">{children}</div>
    </CreditsProvider>
  );
}
