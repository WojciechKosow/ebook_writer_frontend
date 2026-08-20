"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { useCredits } from "@/lib/credits-context";
import { paymentApi } from "@/lib/api";
import { Alert, ButtonLink, Spinner } from "@/components/ui";

function SuccessInner() {
  const params = useSearchParams();
  const orderId = params.get("order");
  const { token } = useAuth();
  const credits = useCredits();

  const [state, setState] = useState<"pending" | "paid" | "timeout">("pending");
  const [granted, setGranted] = useState<number | null>(null);
  const started = useRef(false);

  useEffect(() => {
    if (!token || !orderId || started.current) return;
    started.current = true;

    let attempts = 0;
    let timer: ReturnType<typeof setTimeout>;

    const poll = async () => {
      attempts += 1;
      try {
        const order = await paymentApi.order(token, orderId);
        if (order.status === "PAID") {
          setGranted(order.creditsGranted);
          setState("paid");
          credits?.refresh();
          return;
        }
      } catch {
        // keep trying
      }
      if (attempts >= 12) {
        setState("timeout");
        return;
      }
      timer = setTimeout(poll, 2000);
    };

    poll();
    return () => clearTimeout(timer);
    // credits is intentionally not a dep — we only want one polling loop.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, orderId]);

  if (!orderId) {
    return (
      <div className="mx-auto max-w-md text-center">
        <Alert>Missing order reference.</Alert>
        <div className="mt-4">
          <ButtonLink href="/billing" variant="secondary">
            Back to billing
          </ButtonLink>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md text-center">
      {state === "pending" && (
        <div className="flex flex-col items-center gap-3 py-10">
          <Spinner className="h-6 w-6 text-accent" />
          <p className="text-sm text-zinc-500 dark:text-zinc-400">Confirming your payment…</p>
        </div>
      )}

      {state === "paid" && (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-8 dark:border-emerald-900/50 dark:bg-emerald-950/30">
          <p className="text-lg font-semibold text-emerald-800 dark:text-emerald-300">
            Payment successful
          </p>
          {granted !== null && granted > 0 && (
            <p className="mt-1 text-sm text-emerald-700 dark:text-emerald-400">
              {granted} credits added to your account.
            </p>
          )}
          <div className="mt-6 flex justify-center gap-3">
            <ButtonLink href="/ebooks/new">Create an ebook</ButtonLink>
            <ButtonLink href="/billing" variant="secondary">
              Billing
            </ButtonLink>
          </div>
        </div>
      )}

      {state === "timeout" && (
        <div className="rounded-2xl border border-zinc-200 bg-white p-8 dark:border-zinc-800 dark:bg-zinc-900">
          <p className="font-medium text-zinc-800 dark:text-zinc-200">
            Payment is processing.
          </p>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            Your credits will appear shortly once the payment is confirmed.
          </p>
          <div className="mt-6 flex justify-center">
            <ButtonLink href="/billing" variant="secondary">
              Back to billing
            </ButtonLink>
          </div>
        </div>
      )}
    </div>
  );
}

export default function BillingSuccessPage() {
  return (
    <Suspense fallback={<div className="py-10 text-center text-zinc-400">…</div>}>
      <SuccessInner />
    </Suspense>
  );
}
