"use client";

import { useEffect, useRef, useState } from "react";
import { ApiError, storeApi } from "@/lib/api";
import type { StoreDashboard } from "@/lib/types";
import { Alert, Button, controlBase } from "@/components/ui";
import { Chip } from "./kit";

// Countries offered for a new Stripe account (it can't change afterwards).
// English-speaking markets first; Stripe validates the code.
const COUNTRIES: [string, string][] = [
  ["US", "United States"],
  ["GB", "United Kingdom"],
  ["CA", "Canada"],
  ["AU", "Australia"],
  ["NZ", "New Zealand"],
  ["IE", "Ireland"],
  ["DE", "Germany"],
  ["FR", "France"],
  ["ES", "Spain"],
  ["IT", "Italy"],
  ["NL", "Netherlands"],
  ["PL", "Poland"],
  ["SE", "Sweden"],
  ["SG", "Singapore"],
];

// Right after onboarding Stripe usually needs a moment to verify the account;
// while it does, re-check a few times so the step flips to ready on its own.
const VERIFY_POLL_MS = 5000;
const VERIFY_POLL_TRIES = 12;

/**
 * Connecting Stripe, as one step: what it is, the one button, and what happens
 * next. Used in the setup checklist and — if Stripe ever needs something again —
 * on the live store.
 */
export function StripeStep({ token, store, onChange }: {
  token: string; store: StoreDashboard; onChange: (s: StoreDashboard) => void;
}) {
  const [country, setCountry] = useState("US");
  const [busy, setBusy] = useState(false);
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { state, currentlyDue } = store.stripe;
  const polls = useRef(0);

  useEffect(() => {
    if (state !== "PENDING_VERIFICATION" || polls.current >= VERIFY_POLL_TRIES) return;
    const id = setTimeout(async () => {
      polls.current += 1;
      try {
        onChange(await storeApi.syncStripe(token));
      } catch {
        polls.current = VERIFY_POLL_TRIES; // stop quietly; "Check again" still works
      }
    }, VERIFY_POLL_MS);
    return () => clearTimeout(id);
  }, [state, store, token, onChange]);

  async function checkStatus() {
    setChecking(true);
    setError(null);
    try {
      onChange(await storeApi.syncStripe(token));
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Could not check your Stripe account.");
    } finally {
      setChecking(false);
    }
  }

  async function openStripe() {
    setBusy(true);
    setError(null);
    try {
      const { url } = await storeApi.connectStripe(token, state === "NOT_CONNECTED" ? country : undefined);
      window.location.assign(url);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Could not open Stripe.");
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm leading-relaxed text-muted">
        Money goes straight to your own Stripe account. Scrivetta never holds it and takes no commission. Refunds and
        payouts stay in your Stripe dashboard.
      </p>

      {state === "NOT_CONNECTED" && (
        <div className="flex flex-wrap items-end gap-3">
          <label className="flex flex-col gap-1.5 text-sm font-medium text-foreground-2">
            Country of your business
            <select className={controlBase} value={country} onChange={(e) => setCountry(e.target.value)}>
              {COUNTRIES.map(([code, label]) => (
                <option key={code} value={code}>{label}</option>
              ))}
            </select>
          </label>
          <div className="flex flex-col gap-1">
            <Button loading={busy} onClick={openStripe} className="h-12 px-6">Connect Stripe ↗</Button>
          </div>
        </div>
      )}

      {state === "ACTION_REQUIRED" && (
        <div className="flex flex-col gap-2">
          <Alert variant="info">
            Stripe needs a bit more information before buyers can pay you
            {currentlyDue.length > 0 ? ` (${currentlyDue.length} item${currentlyDue.length === 1 ? "" : "s"})` : ""}.
          </Alert>
          <div><Button loading={busy} onClick={openStripe} className="h-12 px-6">Continue in Stripe ↗</Button></div>
        </div>
      )}

      {state === "PENDING_VERIFICATION" && (
        <div className="flex flex-col gap-3">
          <p className="text-sm">
            <b>Stripe is checking your details.</b> This usually takes a moment, sometimes longer — this step ticks
            itself off when it&apos;s done.
          </p>
          <div className="flex flex-wrap gap-2">
            <Button loading={checking} onClick={checkStatus}>Check again</Button>
            <Button variant="ghost" loading={busy} onClick={openStripe}>Review in Stripe ↗</Button>
          </div>
        </div>
      )}

      {state !== "READY" && state !== "PENDING_VERIFICATION" && (
        <span className="text-xs text-faint">Opens Stripe. You&apos;ll come back here when it&apos;s done.</span>
      )}
      {error && <Alert>{error}</Alert>}
      {state !== "NOT_CONNECTED" && <DisconnectStripe token={token} onChange={onChange} />}
    </div>
  );
}

/**
 * Unlinks the Stripe account from the store so another one can be connected.
 * The account itself stays the author's; buyers can't pay until one is connected again.
 */
function DisconnectStripe({ token, onChange }: { token: string; onChange: (s: StoreDashboard) => void }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function disconnect() {
    if (!window.confirm(
      "Disconnect this Stripe account from your store? Buyers can't pay until you connect an account again. " +
      "Your Stripe account, its payouts and past orders stay as they are.",
    )) return;
    setBusy(true);
    setError(null);
    try {
      onChange(await storeApi.disconnectStripe(token));
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Could not disconnect Stripe.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <button type="button" onClick={disconnect} disabled={busy}
        className="self-start text-sm font-medium text-muted underline decoration-hairline-2 underline-offset-4 hover:text-foreground hover:decoration-foreground disabled:opacity-60">
        {busy ? "Disconnecting…" : "Disconnect Stripe"}
      </button>
      {error && <Alert>{error}</Alert>}
    </>
  );
}

/** Payments on the live store: one quiet line while Stripe is ready. */
export function PaymentsSummary({ token, store, onChange }: {
  token: string; store: StoreDashboard; onChange: (s: StoreDashboard) => void;
}) {
  if (store.stripe.state !== "READY") {
    return (
      <section id="payments" className="flex flex-col gap-3 rounded-2xl border border-hairline bg-surface p-5">
        <div className="flex items-center gap-3">
          <h3 className="font-display text-[22px] font-normal">Payments</h3>
          <Chip tone="warn">Buyers can&apos;t pay yet</Chip>
        </div>
        <StripeStep token={token} store={store} onChange={onChange} />
      </section>
    );
  }
  return (
    <section id="payments" className="flex flex-wrap items-center gap-3 rounded-2xl border border-hairline bg-surface px-5 py-4">
      <Chip tone="live">
        <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden><path d="M3 8.5l3 3 7-7" /></svg>
        Ready to sell
      </Chip>
      <span className="min-w-0 flex-1 text-sm text-foreground-2">Stripe is connected. Payments go straight to you.</span>
      <a href="https://dashboard.stripe.com" target="_blank" rel="noopener noreferrer"
        className="text-sm font-medium underline decoration-hairline-2 underline-offset-4 hover:decoration-foreground">
        Refunds &amp; payouts in Stripe ↗
      </a>
      <div className="flex w-full flex-col gap-2 sm:w-auto">
        <DisconnectStripe token={token} onChange={onChange} />
      </div>
    </section>
  );
}
