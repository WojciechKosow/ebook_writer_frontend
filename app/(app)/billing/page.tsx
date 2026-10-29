"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { useCredits } from "@/lib/credits-context";
import { creditApi, subscriptionApi, ApiError } from "@/lib/api";
import type { CreditBalanceResponse, CreditPack, CreditTransactionType, SubscriptionResponse } from "@/lib/types";
import { CREDIT_COSTS, PACKS, PRO, formatCredits, formatPrice, perCredit } from "@/lib/pricing";
import { Alert, Button } from "@/components/ui";

/** Short labels for the ledger, used when a row has no description. */
const TYPE_LABEL: Record<CreditTransactionType, string> = {
  SUBSCRIPTION_GRANT: "Pro — monthly credits",
  SUBSCRIPTION_EXPIRY: "Unused monthly credits expired",
  CREDIT_PURCHASE: "Credit pack",
  GENERATION: "Ebook generation",
  GENERATION_REFUND: "Refund",
  GENERATION_ADJUSTMENT: "Unused hold returned",
  COVER_GENERATION: "Cover regeneration",
  REFUND_CLAWBACK: "Payment refunded — credits removed",
  SIGNUP_BONUS: "Welcome credits",
  ECONOMY_MIGRATION: "Credit system update",
};

export default function BillingPage() {
  const { token } = useAuth();
  const credits = useCredits();

  const [data, setData] = useState<CreditBalanceResponse | null>(null);
  const [packs, setPacks] = useState<CreditPack[]>([]);
  const [sub, setSub] = useState<SubscriptionResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    let active = true;
    (async () => {
      try {
        const [balance, packList, subscription] = await Promise.all([
          creditApi.balance(token),
          creditApi.packs(token),
          subscriptionApi.get(token),
        ]);
        if (active) {
          setData(balance);
          setPacks(packList);
          setSub(subscription);
        }
      } catch {
        if (active) setError("Couldn't load your billing information.");
      }
    })();
    return () => {
      active = false;
    };
  }, [token]);

  async function subscribe() {
    if (!token) return;
    setBusy("subscribe");
    setError(null);
    try {
      const res = await subscriptionApi.checkout(token);
      window.location.assign(res.url);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not start checkout.");
      setBusy(null);
    }
  }

  async function buy(packId: string) {
    if (!token) return;
    setBusy(packId);
    setError(null);
    try {
      const res = await creditApi.purchase(token, packId);
      window.location.assign(res.url);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not start checkout.");
      setBusy(null);
    }
  }

  async function cancel() {
    if (!token) return;
    setBusy("cancel");
    try {
      setSub(await subscriptionApi.cancel(token));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not cancel.");
    } finally {
      setBusy(null);
    }
  }

  async function resume() {
    if (!token) return;
    setBusy("resume");
    try {
      setSub(await subscriptionApi.resume(token));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not resume.");
    } finally {
      setBusy(null);
    }
  }

  async function manage() {
    if (!token) return;
    setBusy("manage");
    setError(null);
    try {
      const res = await subscriptionApi.portal(token);
      window.location.assign(res.url);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not open the billing portal.");
      setBusy(null);
    }
  }

  const balance = credits?.balance ?? data?.balance ?? 0;

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="font-display text-[34px] font-light leading-[1.05] tracking-[-0.02em] text-foreground sm:text-[40px]">
        Billing &amp; credits
      </h1>

      {error && (
        <div className="mt-4">
          <Alert>{error}</Alert>
        </div>
      )}

      {/* Balance */}
      <div className="mt-6 rounded-2xl border border-hairline bg-surface p-6">
        <p className="text-sm text-muted">Current balance</p>
        <p className="mt-1 text-4xl font-semibold text-foreground">
          {data === null ? "…" : formatCredits(balance)}
          <span className="ml-2 text-base font-normal text-faint">credits</span>
        </p>
        {data && (
          <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
            <div className="rounded-xl bg-surface-2 px-4 py-3">
              <dt className="text-muted">Monthly Pro credits</dt>
              <dd className="mt-0.5 font-semibold text-foreground">{formatCredits(data.subscriptionCredits)}</dd>
              <dd className="mt-0.5 text-xs text-faint">Used first · replaced at each renewal</dd>
            </div>
            <div className="rounded-xl bg-surface-2 px-4 py-3">
              <dt className="text-muted">Pack credits</dt>
              <dd className="mt-0.5 font-semibold text-foreground">{formatCredits(data.purchasedCredits)}</dd>
              <dd className="mt-0.5 text-xs text-faint">Never expire</dd>
            </div>
          </dl>
        )}
        <p className="mt-4 text-sm text-muted">
          Credits measure AI work, not pages: writing uses about {CREDIT_COSTS.perPage} credits per finished page,
          an AI image {CREDIT_COSTS.perImage} and a cover {CREDIT_COSTS.perCover}. Planning, editing and PDF export are
          free. Every book shows its estimate before it starts, and you only pay for what is produced.
        </p>
      </div>

      {/* Subscription */}
      <div className="mt-6 rounded-2xl border border-hairline bg-surface p-6">
        <h2 className="font-display text-[22px] font-normal leading-tight text-foreground">Subscription</h2>
        {sub?.active ? (
          <div className="mt-2">
            <p className="text-sm text-foreground-2">
              Pro is active — monthly credits and your Marketplace storefront.
              {sub.currentPeriodEnd &&
                ` ${sub.cancelAtPeriodEnd ? "Ends" : "Renews"} on ${new Date(sub.currentPeriodEnd).toLocaleDateString("en", { dateStyle: "medium" })}.`}
              {sub.cancelAtPeriodEnd &&
                " It stays active until then; unused monthly credits end with it, pack credits stay."}
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              <Button onClick={manage} loading={busy === "manage"}>
                Manage subscription
              </Button>
              {sub.cancelAtPeriodEnd ? (
                <Button variant="secondary" onClick={resume} loading={busy === "resume"}>
                  Resume
                </Button>
              ) : (
                <Button variant="secondary" onClick={cancel} loading={busy === "cancel"}>
                  Cancel
                </Button>
              )}
            </div>
            <p className="mt-2 text-xs text-faint">
              Manage opens Stripe, where you can update your payment method, view invoices, and cancel.
            </p>
          </div>
        ) : (
          <div className="mt-2">
            <p className="text-sm text-foreground-2">
              <span className="font-semibold text-foreground">Pro</span> — {PRO.priceLabel}/{PRO.period} with{" "}
              {formatCredits(PRO.credits)} credits every billing period ({perCredit(PRO.priceCents, PRO.credits)} per
              credit), your own storefront on Scrivetta Marketplace, and top-ups whenever you need them.
            </p>
            <p className="mt-1 text-xs text-faint">
              Recurring monthly subscription — cancel anytime. Unused monthly credits don&apos;t roll over.
            </p>
            <div className="mt-4">
              <Button onClick={subscribe} loading={busy === "subscribe"}>
                Start Pro — {PRO.priceLabel}/{PRO.period}
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Credit packs */}
      <div className="mt-6">
        <h2 className="font-display text-[22px] font-normal leading-tight text-foreground">Buy credits</h2>
        <p className="mt-1 text-sm text-muted">
          One-time payment, not a subscription. Pack credits never expire and work on any plan.
        </p>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          {packs.map((pack) => (
            <div
              key={pack.id}
              className="flex flex-col rounded-2xl border border-hairline bg-surface p-6 text-center"
            >
              <p className="text-sm font-semibold text-foreground-2">
                {PACKS.find((p) => p.id === pack.id)?.name ?? pack.displayName}
              </p>
              <p className="mt-2 text-3xl font-semibold text-foreground">{formatCredits(pack.credits)}</p>
              <p className="text-sm text-muted">credits</p>
              <p className="mt-3 text-lg font-medium text-foreground">
                {formatPrice(pack.priceCents)}
              </p>
              <p className="text-xs text-faint">{perCredit(pack.priceCents, pack.credits)} per credit</p>
              <div className="mt-4">
                <Button
                  variant="secondary"
                  className="w-full"
                  onClick={() => buy(pack.id)}
                  loading={busy === pack.id}
                >
                  Buy
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent transactions */}
      {data && data.transactions.length > 0 && (
        <div className="mt-8">
          <h2 className="font-display text-[22px] font-normal leading-tight text-foreground">Recent activity</h2>
          <ul className="mt-3 divide-y divide-hairline rounded-xl border border-hairline">
            {data.transactions.map((t, i) => (
              <li key={i} className="flex items-center justify-between px-4 py-3 text-sm">
                <span className="text-foreground-2">
                  {t.description || TYPE_LABEL[t.type] || t.type}
                </span>
                <span
                  className={`font-medium tabular-nums ${
                    t.amount >= 0
                      ? "text-good"
                      : "text-muted"
                  }`}
                >
                  {t.amount >= 0 ? "+" : ""}
                  {formatCredits(t.amount)}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
