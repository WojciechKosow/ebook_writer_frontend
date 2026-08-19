"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { authApi } from "./api";
import type { User } from "./types";

const TOKEN_KEY = "ebook.accessToken";

interface AuthState {
  user: User | null;
  token: string | null;
  /** True while the initial session bootstrap is in flight. */
  loading: boolean;
  login: (email: string, password: string, rememberMe: boolean) => Promise<void>;
  register: (displayName: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const applyToken = useCallback((next: string | null) => {
    setToken(next);
    if (typeof window !== "undefined") {
      if (next) window.localStorage.setItem(TOKEN_KEY, next);
      else window.localStorage.removeItem(TOKEN_KEY);
    }
  }, []);

  // Bootstrap the session on first load: use a stored access token if it still
  // works, otherwise try a silent refresh (works when the refresh cookie is
  // same-site — always in local dev).
  useEffect(() => {
    let cancelled = false;

    (async () => {
      const stored =
        typeof window !== "undefined" ? window.localStorage.getItem(TOKEN_KEY) : null;

      if (stored) {
        try {
          const me = await authApi.me(stored);
          if (!cancelled) {
            setUser(me);
            setToken(stored);
          }
          if (!cancelled) setLoading(false);
          return;
        } catch {
          // fall through to refresh
        }
      }

      try {
        const res = await authApi.refresh();
        if (res.token) {
          const me = await authApi.me(res.token);
          if (!cancelled) {
            applyToken(res.token);
            setUser(me);
          }
        }
      } catch {
        if (!cancelled) {
          applyToken(null);
          setUser(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [applyToken]);

  const login = useCallback(
    async (email: string, password: string, rememberMe: boolean) => {
      const res = await authApi.login({ email, password, rememberMe });
      applyToken(res.token);
      if (res.user) {
        setUser(res.user);
      } else if (res.token) {
        setUser(await authApi.me(res.token));
      }
    },
    [applyToken],
  );

  const register = useCallback(
    async (displayName: string, email: string, password: string) => {
      await authApi.register({ displayName, email, password });
    },
    [],
  );

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch {
      // ignore — clear locally regardless
    }
    applyToken(null);
    setUser(null);
  }, [applyToken]);

  const value = useMemo<AuthState>(
    () => ({ user, token, loading, login, register, logout }),
    [user, token, loading, login, register, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
