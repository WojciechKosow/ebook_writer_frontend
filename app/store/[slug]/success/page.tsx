"use client";

import { Suspense, useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { publicStoreApi } from "@/lib/api";
import type { StoreOrderStatusResponse } from "@/lib/types";
import { MarketingShell } from "@/components/marketing-shell";
import { Alert, ButtonLink, Spinner } from "@/components/ui";

const MAX_ATTEMPTS = 30; // ~60 s

/**
 * After Stripe Checkout. Never claims payment from the redirect alone: it polls
 * our order until the webhook has marked it PAID.
 */
function SuccessInner() {
  const { slug } = useParams<{ slug: string }>();
  const orderId = useSearchParams().get("order");
  const [order, setOrder] = useState<StoreOrderStatusResponse | null>(null);
  const [timedOut, setTimedOut] = useState(false);

  useEffect(() => {
    if (!orderId) return;
    let attempts = 0;
    let timer: ReturnType<typeof setTimeout>;
    let stopped = false;

    const poll = async () => {
      attempts += 1;
      try {
        const o = await publicStoreApi.order(orderId);
        if (stopped) return;
        setOrder(o);
        if (o.status !== "PENDING") return;
      } catch {
        // keep trying
      }
      if (attempts >= MAX_ATTEMPTS) {
        setTimedOut(true);
        return;
      }
      timer = setTimeout(poll, 2000);
    };
    poll();
    return () => {
      stopped = true;
      clearTimeout(timer);
    };
  }, [orderId]);

  const back = (
    <ButtonLink href={`/store/${slug}`} variant="secondary">
      Back to the store
    </ButtonLink>
  );

  if (!orderId) {
    return (
      <div className="text-center">
        <Alert>Missing order reference.</Alert>
        <div className="mt-4">{back}</div>
      </div>
    );
  }

  const status = order?.status ?? "PENDING";

  return (
    <div className="text-center">
      {status === "PENDING" && !timedOut && (
        <div className="flex flex-col items-center gap-3 py-10">
          <Spinner className="h-6 w-6 text-accent" />
          <p className="text-sm text-muted">Confirming payment…</p>
        </div>
      )}

      {status === "PENDING" && timedOut && (
        <div className="rounded-2xl border border-hairline bg-surface p-8">
          <p className="font-medium text-foreground">Still confirming your payment.</p>
          <p className="mt-1 text-sm text-muted">
            This can take a little longer. As soon as the payment is confirmed you&apos;ll get an email with your
            download link.
          </p>
          <div className="mt-6">{back}</div>
        </div>
      )}

      {status === "PAID" && (
        <div className="rounded-2xl border border-[color-mix(in_oklab,var(--good)_35%,transparent)] bg-good-soft p-8">
          <p className="text-lg font-semibold text-good">Payment confirmed</p>
          <p className="mt-1 text-sm text-good">
            {order?.productTitle ? <>Thanks for buying <strong>{order.productTitle}</strong>. </> : null}
            We&apos;ve emailed you a download link — it works for 30 days and up to 5 downloads.
          </p>
          <div className="mt-6">{back}</div>
        </div>
      )}

      {status === "EXPIRED" && (
        <div className="rounded-2xl border border-hairline bg-surface p-8">
          <p className="font-medium text-foreground">This checkout expired.</p>
          <p className="mt-1 text-sm text-muted">No payment was taken. You can start again from the store.</p>
          <div className="mt-6">{back}</div>
        </div>
      )}

      {status === "REFUNDED" && (
        <div className="rounded-2xl border border-hairline bg-surface p-8">
          <p className="font-medium text-foreground">This order was refunded.</p>
          <div className="mt-6">{back}</div>
        </div>
      )}
    </div>
  );
}

export default function StoreSuccessPage() {
  return (
    <MarketingShell ambient="none">
      <div className="mx-auto max-w-md px-4 py-16">
        <Suspense fallback={<div className="py-10 text-center text-faint">…</div>}>
          <SuccessInner />
        </Suspense>
      </div>
    </MarketingShell>
  );
}
