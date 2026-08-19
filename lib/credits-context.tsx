"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { useAuth } from "./auth-context";
import { creditApi } from "./api";

interface CreditsState {
  balance: number | null;
  loading: boolean;
  refresh: () => Promise<void>;
}

const CreditsContext = createContext<CreditsState | null>(null);

export function CreditsProvider({ children }: { children: React.ReactNode }) {
  const { token } = useAuth();
  const [balance, setBalance] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  // Manual refresh — called from event handlers (purchase, generation, return
  // from Stripe), never from inside an effect.
  const refresh = useCallback(async () => {
    if (!token) return;
    try {
      const res = await creditApi.balance(token);
      setBalance(res.balance);
    } catch {
      // leave the last known balance in place
    } finally {
      setLoading(false);
    }
  }, [token]);

  // Initial load on mount / token change.
  useEffect(() => {
    if (!token) return;
    let active = true;
    (async () => {
      try {
        const res = await creditApi.balance(token);
        if (active) setBalance(res.balance);
      } catch {
        // ignore
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [token]);

  return (
    <CreditsContext.Provider value={{ balance, loading, refresh }}>
      {children}
    </CreditsContext.Provider>
  );
}

/** Returns the credits state, or null when used outside the app (no provider). */
export function useCredits(): CreditsState | null {
  return useContext(CreditsContext);
}
