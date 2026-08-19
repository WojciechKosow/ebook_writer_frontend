"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { useCredits } from "@/lib/credits-context";
import { creditApi, subscriptionApi, ApiError } from "@/lib/api";
import type { CreditBalanceResponse, CreditPack, SubscriptionResponse } from "@/lib/types";
import { SUBSCRIPTION, formatPrice } from "@/lib/pricing";
import { Alert, Button } from "@/components/ui";

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

  const balance = credits?.balance ?? data?.balance ?? 0;

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
        Billing &amp; credits
      </h1>

      {error && (
        <div className="mt-4">
          <Alert>{error}</Alert>
        </div>
      )}

      {/* Balance */}
      <div className="mt-6 rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
        <p className="text-sm text-zinc-500 dark:text-zinc-400">Current balance</p>
        <p className="mt-1 text-4xl font-semibold text-zinc-900 dark:text-zinc-50">
          {data === null ? "…" : balance}
          <span className="ml-2 text-base font-normal text-zinc-400">credits</span>
        </p>
        <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
          1 credit ≈ 1 ebook page.
        </p>
      </div>

      {/* Subscription */}
      <div className="mt-6 rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">Subscription</h2>
        {sub?.active ? (
          <div className="mt-2">
            <p className="text-sm text-zinc-600 dark:text-zinc-300">
              Active — {SUBSCRIPTION.credits} credits every {SUBSCRIPTION.period}.
              {sub.cancelAtPeriodEnd && " Cancels at the end of the current period."}
            </p>
            <div className="mt-4">
              {sub.cancelAtPeriodEnd ? (
                <Button variant="secondary" onClick={resume} loading={busy === "resume"}>
                  Resume subscription
                </Button>
              ) : (
                <Button variant="secondary" onClick={cancel} loading={busy === "cancel"}>
                  Cancel subscription
                </Button>
              )}
            </div>
          </div>
        ) : (
          <div className="mt-2">
            <p className="text-sm text-zinc-600 dark:text-zinc-300">
              {SUBSCRIPTION.priceLabel}/{SUBSCRIPTION.period} — {SUBSCRIPTION.credits} credits every {SUBSCRIPTION.period}.
            </p>
            <div className="mt-4">
              <Button onClick={subscribe} loading={busy === "subscribe"}>
                Subscribe — {SUBSCRIPTION.priceLabel}/{SUBSCRIPTION.period}
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Credit packs */}
      <div className="mt-6">
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">Buy credits</h2>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">One-time purchase, no subscription.</p>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          {packs.map((pack) => (
            <div
              key={pack.id}
              className="flex flex-col rounded-2xl border border-zinc-200 bg-white p-6 text-center dark:border-zinc-800 dark:bg-zinc-900"
            >
              <p className="text-3xl font-semibold text-zinc-900 dark:text-zinc-50">{pack.credits}</p>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">credits</p>
              <p className="mt-3 text-lg font-medium text-zinc-800 dark:text-zinc-200">
                {formatPrice(pack.priceCents)}
              </p>
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
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">Recent activity</h2>
          <ul className="mt-3 divide-y divide-zinc-200 rounded-xl border border-zinc-200 dark:divide-zinc-800 dark:border-zinc-800">
            {data.transactions.map((t, i) => (
              <li key={i} className="flex items-center justify-between px-4 py-3 text-sm">
                <span className="text-zinc-600 dark:text-zinc-300">
                  {t.description || t.type}
                </span>
                <span
                  className={`font-medium tabular-nums ${
                    t.amount >= 0
                      ? "text-emerald-600 dark:text-emerald-400"
                      : "text-zinc-500 dark:text-zinc-400"
                  }`}
                >
                  {t.amount >= 0 ? "+" : ""}
                  {t.amount}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
