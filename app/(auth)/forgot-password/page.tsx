"use client";

import { useState } from "react";
import Link from "next/link";
import { authApi } from "@/lib/api";
import { AuthCard, Alert, Button, Field } from "@/components/ui";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await authApi.forgotPassword(email);
    } catch {
      // The endpoint never reveals whether the address exists — always succeed.
    } finally {
      setSent(true);
      setSubmitting(false);
    }
  }

  return (
    <AuthCard title="Reset your password" subtitle="We'll email you a reset link.">
      {sent ? (
        <div className="flex flex-col gap-4">
          <Alert variant="success">
            If an account exists for that email, a password reset link is on its way.
          </Alert>
          <Link
            href="/login"
            className="text-center text-sm font-medium text-accent hover:underline"
          >
            Back to log in
          </Link>
        </div>
      ) : (
        <form onSubmit={onSubmit} className="flex flex-col gap-4">
          <Field
            label="Email"
            name="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Button type="submit" variant="contrast" loading={submitting} className="w-full py-3">
            Send reset link
          </Button>
          <Link
            href="/login"
            className="text-center text-sm font-medium text-accent hover:underline"
          >
            Back to log in
          </Link>
        </form>
      )}
    </AuthCard>
  );
}
