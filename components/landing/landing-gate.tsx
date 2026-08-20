"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { TOKEN_KEY } from "@/lib/session-boot";

/**
 * The marketing landing is for logged-out visitors only. Once a session is
 * present, logged-in users are sent to their dashboard and never shown (or
 * allowed back onto) the marketing page — including via browser back-navigation.
 */
export function LandingGate({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.replace("/dashboard");
    }
  }, [loading, user, router]);

  // Once we know a user is logged in, don't render the marketing page at all.
  if (!loading && user) return null;

  // While the session is still resolving, if there's a stored token the visitor
  // is almost certainly logged in — hold the marketing page back to avoid a
  // flash before the redirect kicks in.
  if (
    loading &&
    typeof window !== "undefined" &&
    window.localStorage.getItem(TOKEN_KEY)
  ) {
    return null;
  }

  return <>{children}</>;
}
