"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { CreditsProvider } from "@/lib/credits-context";
import { AppShell } from "@/components/app-shell";
import { Spinner } from "@/components/ui";

/**
 * Guards the authenticated app area: waits for the session bootstrap, redirects
 * to /login if there's no user, and wraps everything in the sidebar shell.
 */
export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [loading, user, router]);

  if (loading || !user) {
    return (
      <div className="flex flex-1 items-center justify-center text-ink-soft">
        <Spinner />
      </div>
    );
  }

  return (
    <CreditsProvider>
      <AppShell>{children}</AppShell>
    </CreditsProvider>
  );
}
