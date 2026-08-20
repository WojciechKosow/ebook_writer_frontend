"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { authApi, ApiError } from "@/lib/api";
import { AuthCard, Alert, ButtonLink, Spinner } from "@/components/ui";

function VerifyInner() {
  const params = useSearchParams();
  const tokenId = params.get("tokenId");
  const token = params.get("token");
  const hasParams = Boolean(tokenId && token);

  const [state, setState] = useState<"loading" | "ok" | "error">("loading");
  const [message, setMessage] = useState("We couldn't verify this link.");
  const ran = useRef(false);

  useEffect(() => {
    if (!hasParams || ran.current) return;
    ran.current = true;

    authApi
      .verify(tokenId as string, token as string)
      .then(() => setState("ok"))
      .catch((err) => {
        setMessage(err instanceof ApiError ? err.message : "We couldn't verify this link.");
        setState("error");
      });
  }, [hasParams, tokenId, token]);

  if (!hasParams) {
    return (
      <AuthCard title="Invalid verification link">
        <div className="flex flex-col gap-4">
          <Alert>This verification link is missing information.</Alert>
          <ButtonLink href="/login" variant="secondary">
            Back to log in
          </ButtonLink>
        </div>
      </AuthCard>
    );
  }

  if (state === "loading") {
    return (
      <AuthCard title="Verifying your account">
        <div className="flex items-center gap-3 text-sm text-muted">
          <Spinner /> Checking your link…
        </div>
      </AuthCard>
    );
  }

  if (state === "ok") {
    return (
      <AuthCard title="Account activated" subtitle="You're all set.">
        <div className="flex flex-col gap-4">
          <Alert variant="success">Your email is verified. You can log in now.</Alert>
          <ButtonLink href="/login" variant="contrast" className="w-full py-3">Continue to log in</ButtonLink>
        </div>
      </AuthCard>
    );
  }

  return (
    <AuthCard title="Verification failed">
      <div className="flex flex-col gap-4">
        <Alert>{message}</Alert>
        <p className="text-sm text-muted">
          The link may have expired or already been used.
        </p>
        <ButtonLink href="/login" variant="secondary">
          Back to log in
        </ButtonLink>
      </div>
    </AuthCard>
  );
}

export default function VerifyPage() {
  return (
    <Suspense fallback={<AuthCard title="Verifying your account">…</AuthCard>}>
      <VerifyInner />
    </Suspense>
  );
}
