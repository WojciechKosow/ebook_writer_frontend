"use client";

import Link from "next/link";
import { useEffect, useId, useState, useSyncExternalStore } from "react";
import { Button } from "@/components/ui";
import {
  onConsentChange,
  onOpenCookieSettings,
  openCookieSettings,
  readConsent,
  saveConsent,
} from "@/lib/consent";

/**
 * The cookie banner. Shown until the visitor decides, and again from the
 * "Cookie settings" link. Rejecting is as easy as accepting (same row, same
 * weight), and nothing optional runs before a choice is made.
 */
export function CookieConsent() {
  // Read from localStorage; the server snapshot says "decided" so the banner
  // never renders into static HTML (it appears after hydration if needed).
  const decided = useSyncExternalStore(
    (notify) => onConsentChange(notify),
    () => readConsent() !== null,
    () => true,
  );
  const [reopened, setReopened] = useState(false);
  const [details, setDetails] = useState(false);
  const [analytics, setAnalytics] = useState(false);
  const titleId = useId();

  useEffect(
    () =>
      onOpenCookieSettings(() => {
        setAnalytics(readConsent()?.analytics ?? false);
        setDetails(true);
        setReopened(true);
      }),
    [],
  );

  if (decided && !reopened) return null;

  const decide = (value: boolean) => {
    saveConsent(value);
    setReopened(false);
    setDetails(false);
  };

  return (
    <div
      role="dialog"
      aria-labelledby={titleId}
      className="fixed inset-x-4 bottom-4 z-50 mx-auto max-w-lg rounded-2xl border border-hairline bg-surface p-5 shadow-float sm:left-6 sm:right-auto sm:mx-0"
    >
      <h2 id={titleId} className="text-[15px] font-semibold text-foreground">
        Cookies on Scrivetta
      </h2>
      <p className="mt-1.5 text-sm leading-6 text-muted">
        We use necessary storage to keep you signed in. With your permission we&apos;d
        also like to use Google Analytics cookies to see which pages help people.
        Details in our{" "}
        <Link href="/privacy#cookies" className="font-medium text-accent-ink underline underline-offset-2">
          Privacy Policy
        </Link>
        .
      </p>

      {details && (
        <div className="mt-4 flex flex-col gap-3 rounded-xl border border-hairline bg-surface-2 p-4">
          <label className="flex items-start justify-between gap-4 text-sm">
            <span>
              <span className="font-medium text-foreground">Necessary</span>
              <span className="mt-0.5 block text-muted">Sign-in, security, and your preferences. Always on.</span>
            </span>
            <input type="checkbox" checked disabled className="mt-1 h-4 w-4 accent-[var(--accent)]" />
          </label>
          <label className="flex cursor-pointer items-start justify-between gap-4 text-sm">
            <span>
              <span className="font-medium text-foreground">Analytics</span>
              <span className="mt-0.5 block text-muted">Google Analytics: which pages are visited and how people find us.</span>
            </span>
            <input
              type="checkbox"
              checked={analytics}
              onChange={(e) => setAnalytics(e.target.checked)}
              className="mt-1 h-4 w-4 accent-[var(--accent)]"
            />
          </label>
        </div>
      )}

      <div className="mt-4 flex flex-wrap gap-2">
        <Button variant="secondary" className="px-4 py-2" onClick={() => decide(false)}>
          Reject
        </Button>
        {details ? (
          <Button className="px-4 py-2" onClick={() => decide(analytics)}>
            Save choices
          </Button>
        ) : (
          <>
            <Button variant="secondary" className="px-4 py-2" onClick={() => decide(true)}>
              Accept
            </Button>
            <Button variant="ghost" className="px-4 py-2" onClick={() => setDetails(true)}>
              Settings
            </Button>
          </>
        )}
      </div>
    </div>
  );
}

/** Footer / privacy-page link that reopens the banner in settings mode. */
export function CookieSettingsLink({ className = "" }: { className?: string }) {
  return (
    <button
      type="button"
      onClick={openCookieSettings}
      className={className}
    >
      Cookie settings
    </button>
  );
}
