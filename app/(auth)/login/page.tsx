"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { authApi, ApiError } from "@/lib/api";
import { AuthCard, Alert, Button, Field } from "@/components/ui";
import { PasswordField } from "@/components/auth-fields";

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
    <AuthCard title="Welcome back">
      <form onSubmit={onSubmit} className="flex flex-col gap-5">
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
        <PasswordField
          label="Password"
          name="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={setPassword}
        />

        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 text-sm text-muted">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="h-4 w-4 rounded border-hairline-2 text-accent focus:ring-accent"
            />
            Remember me
          </label>
          <Link href="/forgot-password" className="text-sm font-medium text-accent hover:underline">
            Forgot password?
          </Link>
        </div>

        <Button type="submit" variant="contrast" loading={submitting} className="w-full py-3">
          Sign in
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted">
        Don&apos;t have an account?{" "}
        <Link href="/register" className="font-semibold text-foreground hover:underline">
          Create one
        </Link>
      </p>
    </AuthCard>
  );
}
