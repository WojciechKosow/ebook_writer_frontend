"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";

/**
 * The marketing landing is for logged-out visitors. Once the session resolves
 * and a user is present, send them straight to their dashboard instead.
 */
export function LandingGate({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.replace("/dashboard");
    }
  }, [loading, user, router]);

  // Don't flash the marketing page once we know the user is logged in.
  if (!loading && user) return null;

  return <>{children}</>;
}
