"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { authApi, ApiError } from "@/lib/api";
import { AuthCard, Alert, Button, ButtonLink } from "@/components/ui";
import { PasswordField } from "@/components/auth-fields";

function ResetPasswordInner() {
  const params = useSearchParams();
  const tokenId = params.get("tokenId");
  const token = params.get("token");

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [fieldError, setFieldError] = useState<string | undefined>();
  const [done, setDone] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  if (!tokenId || !token) {
    return (
      <AuthCard title="Invalid reset link">
        <div className="flex flex-col gap-4">
          <Alert>This password reset link is missing information.</Alert>
          <ButtonLink href="/forgot-password" variant="secondary">
            Request a new link
          </ButtonLink>
        </div>
      </AuthCard>
    );
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setFieldError(undefined);

    if (password !== confirm) {
      setError("Passwords don't match.");
      return;
    }

    setSubmitting(true);
    try {
      await authApi.resetPassword(tokenId!, token!, password);
      setDone(true);
    } catch (err) {
      if (err instanceof ApiError) {
        setFieldError(err.fieldErrors?.newPassword);
        setError(err.fieldErrors ? null : err.message);
      } else {
        setError("Something went wrong. Please try again.");
      }
    } finally {
      setSubmitting(false);
    }
  }

  if (done) {
    return (
      <AuthCard title="Password changed" subtitle="You can log in with your new password.">
        <div className="flex flex-col gap-4">
          <Alert variant="success">Your password has been updated.</Alert>
          <ButtonLink href="/login" variant="contrast" className="w-full py-3">Continue to log in</ButtonLink>
        </div>
      </AuthCard>
    );
  }

  return (
    <AuthCard title="Set a new password">
      <form onSubmit={onSubmit} className="flex flex-col gap-4">
        {error && <Alert>{error}</Alert>}
        <PasswordField
          label="New password"
          name="newPassword"
          autoComplete="new-password"
          required
          minLength={8}
          value={password}
          onChange={setPassword}
          error={fieldError}
          placeholder="At least 8 characters"
        />
        <PasswordField
          label="Confirm password"
          name="confirmPassword"
          autoComplete="new-password"
          required
          value={confirm}
          onChange={setConfirm}
        />
        <Button type="submit" variant="contrast" loading={submitting} className="w-full py-3">
          Update password
        </Button>
        <Link
          href="/login"
          className="text-center text-sm font-medium text-accent hover:underline"
        >
          Back to log in
        </Link>
      </form>
    </AuthCard>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<AuthCard title="Set a new password">…</AuthCard>}>
      <ResetPasswordInner />
    </Suspense>
  );
}
