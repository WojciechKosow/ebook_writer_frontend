"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { authApi, ApiError } from "@/lib/api";
import { AuthCard, Alert, Button, Field } from "@/components/ui";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [needsVerify, setNeedsVerify] = useState(false);
  const [resent, setResent] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setNeedsVerify(false);
    setResent(false);
    setSubmitting(true);
    try {
      await login(email, password, rememberMe);
      router.push("/dashboard");
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "Something went wrong. Please try again.";
      setError(message);
      if (message.toLowerCase().includes("verify")) setNeedsVerify(true);
    } finally {
      setSubmitting(false);
    }
  }

  async function resend() {
    try {
      await authApi.resendVerification(email);
      setResent(true);
    } catch {
      // resend is best-effort; ignore
      setResent(true);
    }
  }

  return (
    <AuthCard title="Welcome back" subtitle="Log in to your account.">
      <form onSubmit={onSubmit} className="flex flex-col gap-4">
        {error && <Alert>{error}</Alert>}
        {needsVerify && !resent && (
          <button
            type="button"
            onClick={resend}
            className="text-left text-sm font-medium text-accent hover:underline"
          >
            Resend verification email
          </button>
        )}
        {resent && <Alert variant="success">Verification email sent. Check your inbox.</Alert>}

        <Field
          label="Email"
          name="email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <Field
          label="Password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="h-4 w-4 rounded border-zinc-300 text-accent focus:ring-accent"
            />
            Remember me
          </label>
          <Link
            href="/forgot-password"
            className="text-sm font-medium text-accent hover:underline"
          >
            Forgot password?
          </Link>
        </div>

        <Button type="submit" loading={submitting}>
          Log in
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-zinc-500 dark:text-zinc-400">
        No account?{" "}
        <Link href="/register" className="font-medium text-accent hover:underline">
          Create one
        </Link>
      </p>
    </AuthCard>
  );
}
