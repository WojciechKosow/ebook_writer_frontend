"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { ApiError } from "@/lib/api";
import { AuthCard, Alert, Button, Field } from "@/components/ui";
import { PasswordField, PasswordChecklist } from "@/components/auth-fields";

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();

  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const mismatch = confirm.length > 0 && password !== confirm;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setFieldErrors({});

    if (password !== confirm) {
      setError("Passwords don't match.");
      return;
    }

    setSubmitting(true);
    try {
      await register(displayName, email, password);
      router.push(`/check-email?email=${encodeURIComponent(email)}`);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.fieldErrors ? null : err.message);
        setFieldErrors(err.fieldErrors ?? {});
      } else {
        setError("Something went wrong. Please try again.");
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthCard title="Create your account">
      <form onSubmit={onSubmit} className="flex flex-col gap-5">
        {error && <Alert>{error}</Alert>}

        <Field
          label="Username"
          name="displayName"
          autoComplete="username"
          required
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          error={fieldErrors.displayName}
        />
        <Field
          label="Email"
          name="email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={fieldErrors.email}
        />
        <div>
          <PasswordField
            label="Password"
            name="password"
            autoComplete="new-password"
            required
            minLength={8}
            value={password}
            onChange={setPassword}
            error={fieldErrors.password}
          />
          <PasswordChecklist password={password} />
        </div>
        <PasswordField
          label="Confirm password"
          name="confirmPassword"
          autoComplete="new-password"
          required
          value={confirm}
          onChange={setConfirm}
          error={mismatch ? "Passwords don't match." : undefined}
        />

        <Button type="submit" variant="contrast" loading={submitting} className="w-full py-3">
          Create account
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted">
        Already have an account?{" "}
        <Link href="/login" className="font-semibold text-foreground hover:underline">
          Sign in
        </Link>
      </p>
    </AuthCard>
  );
}
