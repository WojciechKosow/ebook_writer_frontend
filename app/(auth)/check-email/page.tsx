"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { authApi } from "@/lib/api";
import { AuthCard, Alert, Button } from "@/components/ui";

function CheckEmailInner() {
  const params = useSearchParams();
  const email = params.get("email") ?? "";
  const [resent, setResent] = useState(false);
  const [busy, setBusy] = useState(false);

  async function resend() {
    if (!email) return;
    setBusy(true);
    try {
      await authApi.resendVerification(email);
    } catch {
      // best-effort
    } finally {
      setResent(true);
      setBusy(false);
    }
  }

  return (
    <AuthCard title="Check your email" subtitle="One more step to activate your account.">
      <div className="flex flex-col gap-4">
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          We sent a verification link{email ? <> to <strong className="text-zinc-800 dark:text-zinc-200">{email}</strong></> : ""}.
          Click it to activate your account, then log in.
        </p>

        {resent && <Alert variant="success">Verification email sent again.</Alert>}

        {email && !resent && (
          <Button variant="secondary" onClick={resend} loading={busy}>
            Resend verification email
          </Button>
        )}

        <Link
          href="/login"
          className="text-center text-sm font-medium text-accent hover:underline"
        >
          Back to log in
        </Link>
      </div>
    </AuthCard>
  );
}

export default function CheckEmailPage() {
  return (
    <Suspense fallback={<AuthCard title="Check your email">…</AuthCard>}>
      <CheckEmailInner />
    </Suspense>
  );
}
