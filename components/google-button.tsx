"use client";

import { useEffect, useState } from "react";
import { startOAuthLogin } from "@/lib/oauth";
import { Spinner } from "./ui";

/** Google's four-colour "G" mark (unaltered, per Google's sign-in branding guidelines). */
function GoogleMark() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true" focusable="false">
      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
    </svg>
  );
}

/**
 * "Continue with Google". Follows Google's button branding (neutral light/dark
 * surfaces, standard "G" mark, "Continue with Google" copy). Disables itself
 * after the first click so a double-click can't start two logins.
 */
export function GoogleButton({
  rememberMe = true,
  next,
}: {
  rememberMe?: boolean;
  next?: string;
}) {
  const [redirecting, setRedirecting] = useState(false);

  // Coming back with the browser's Back button restores this page from the
  // bfcache with the spinner still showing — re-enable the button.
  useEffect(() => {
    const onShow = (e: PageTransitionEvent) => {
      if (e.persisted) setRedirecting(false);
    };
    window.addEventListener("pageshow", onShow);
    return () => window.removeEventListener("pageshow", onShow);
  }, []);

  function onClick() {
    if (redirecting) return;
    setRedirecting(true);
    startOAuthLogin("google", { rememberMe, next });
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={redirecting}
      aria-busy={redirecting}
      className="inline-flex w-full items-center justify-center gap-3 rounded-xl border border-[#747775] bg-white px-4 py-3 text-sm font-medium text-[#1F1F1F] shadow-soft transition-[background,box-shadow,transform] hover:bg-[#F8F9FA] active:translate-y-px disabled:cursor-not-allowed disabled:opacity-70 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background dark:border-[#8E918F] dark:bg-[#131314] dark:text-[#E3E3E3] dark:hover:bg-[#1f1f20]"
    >
      {redirecting ? <Spinner /> : <GoogleMark />}
      <span>{redirecting ? "Redirecting to Google…" : "Continue with Google"}</span>
    </button>
  );
}

/** "──── or continue with email ────" separator between Google and the form. */
export function AuthDivider({ label = "or continue with email" }: { label?: string }) {
  return (
    <div className="my-6 flex items-center gap-3 text-xs font-medium uppercase tracking-wide text-faint">
      <span className="h-px flex-1 bg-hairline-2" aria-hidden />
      {label}
      <span className="h-px flex-1 bg-hairline-2" aria-hidden />
    </div>
  );
}
