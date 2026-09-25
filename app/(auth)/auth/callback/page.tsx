"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { ApiError } from "@/lib/api";
import { oauthErrorMessage, takePendingOAuthLogin } from "@/lib/oauth";
import { AuthCard, Alert, ButtonLink, Spinner } from "@/components/ui";

/**
 * Landing page after "Continue with Google". The backend redirects here with a
 * one-time code in the URL fragment (never sent to any server) or an ?error=
 * code. We trade the code for a normal session and move on.
 */
export default function OAuthCallbackPage() {
  const router = useRouter();
  const { loading, completeOAuthLogin } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const ran = useRef(false);

  useEffect(() => {
    // Wait for the initial session bootstrap so it can't overwrite the new session.
    if (loading || ran.current) return;
    ran.current = true;

    const url = new URL(window.location.href);
    const errorCode = url.searchParams.get("error");
    const code = new URLSearchParams(url.hash.slice(1)).get("code");
    // Drop the code from the address bar/history right away.
    window.history.replaceState(null, "", url.pathname);

    const pending = takePendingOAuthLogin();

    // Every setState below happens asynchronously, after the exchange settles.
    const finish: Promise<void> =
      errorCode || !code
        ? Promise.reject(errorCode ?? "invalid_login_code")
        : !pending
          ? // Started in another tab/browser, or too old.
            Promise.reject("invalid_state")
          : completeOAuthLogin(code, pending.clientState, pending.rememberMe).then(() =>
              router.replace(pending.next),
            );

    finish.catch((err: unknown) => {
      const errCode =
        typeof err === "string"
          ? err
          : err instanceof ApiError && err.body && typeof err.body === "object"
            ? ((err.body as Record<string, unknown>).error as string | undefined)
            : undefined;
      setError(oauthErrorMessage(errCode));
    });
  }, [loading, completeOAuthLogin, router]);

  if (error) {
    return (
      <AuthCard title="Couldn't sign you in">
        <div className="flex flex-col gap-4">
          <Alert>{error}</Alert>
          <ButtonLink href="/login" variant="contrast" className="w-full py-3">
            Back to sign in
          </ButtonLink>
        </div>
      </AuthCard>
    );
  }

  return (
    <AuthCard title="Signing you in">
      <div className="flex items-center justify-center gap-3 text-sm text-muted">
        <Spinner /> Finishing sign-in with Google…
      </div>
    </AuthCard>
  );
}
