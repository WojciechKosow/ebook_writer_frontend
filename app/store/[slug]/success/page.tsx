"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { publicStoreApi } from "@/lib/api";
import type { PublicStore, StoreOrderStatusResponse } from "@/lib/types";
import { StoreShell } from "@/components/store/store-shell";
import { PurchasePageView } from "@/components/store-design/product-page-view";
import { parseDesign } from "@/lib/store-design/core";
import { parsePageDoc, type ProductPageData } from "@/lib/store-design/product-page";
import { Alert, ButtonLink, Spinner } from "@/components/ui";

const MAX_ATTEMPTS = 30; // ~60 s

/**
 * After Stripe Checkout: the author's after-purchase page, in the store's
 * style. Never claims payment from the redirect alone — it polls our order
 * until the webhook has marked it PAID. The files themselves come by email (and
 * in My purchases), not here.
 */
function SuccessInner({ slug }: { slug: string }) {
  const orderId = useSearchParams().get("order");
  const [order, setOrder] = useState<StoreOrderStatusResponse | null>(null);
  const [store, setStore] = useState<PublicStore | null>(null);
  const [timedOut, setTimedOut] = useState(false);

  useEffect(() => {
    publicStoreApi.store(slug).then(setStore).catch(() => setStore(null));
  }, [slug]);

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

  const design = useMemo(() => parseDesign(store?.themeSettings), [store]);
  const doc = useMemo(() => parsePageDoc(order?.pageSettings), [order]);
  const data: ProductPageData | null = useMemo(() => (store && order ? {
    store: store.store,
    product: {
      id: order.productId, title: order.productTitle ?? "Your purchase", subtitle: null, description: null, highlights: [],
      priceCents: 0, pageCount: 0, language: null, updatedAt: null, coverUrl: order.coverUrl, formats: [], chapters: [],
    },
    more: store.products.filter((p) => p.id !== order.productId),
  } : null), [store, order]);

  if (!orderId) {
    return (
      <StoreShell profile={store?.store ?? null}>
        <div className="mx-auto max-w-md px-4 py-16 text-center">
          <Alert>Missing order reference.</Alert>
          <div className="mt-4"><ButtonLink href={`/store/${slug}`} variant="secondary">Back to the store</ButtonLink></div>
        </div>
      </StoreShell>
    );
  }

  if (!data) {
    return (
      <StoreShell profile={store?.store ?? null}>
        <div className="flex flex-col items-center gap-3 py-24">
          <Spinner className="h-6 w-6 text-accent" />
          <p className="text-sm text-muted">Confirming payment…</p>
        </div>
      </StoreShell>
    );
  }

  const status = order!.status;
  const box = { padding: "14px 16px", borderRadius: 12, border: "1px solid var(--pp-line)", background: "var(--pp-surface2)", fontSize: 14.5, lineHeight: 1.6, color: "var(--pp-body)" };
  const statusNode =
    status === "PENDING" ? (
      <div role="status" style={box}>
        {timedOut
          ? "Still confirming your payment. This can take a little longer — as soon as it's confirmed you'll get an email with your download link."
          : "Confirming payment…"}
      </div>
    ) : status === "PAID" ? (
      <div role="status" style={box}>
        <strong style={{ color: "var(--pp-ink)" }}>Payment confirmed.</strong> We&apos;ve emailed you a download link — it works for
        30 days and up to 5 downloads per file. Check your spam folder if it isn&apos;t there in a few minutes. Have a Scrivetta
        account with that email? It&apos;s also in <Link href="/purchases" style={{ color: "var(--pp-accent-text)", fontWeight: 600 }}>My purchases</Link>.
      </div>
    ) : status === "EXPIRED" ? (
      <div role="status" style={box}>This checkout expired. No payment was taken — you can start again from the store.</div>
    ) : (
      <div role="status" style={box}>This order was refunded.</div>
    );

  // Until the payment is confirmed, the page doesn't say "ready".
  const shown = status === "PAID" ? doc : {
    ...doc,
    sections: { ...(doc.sections ?? {}), "purchase.thanks": { ...(doc.sections?.["purchase.thanks"] ?? {}), eyebrow: status === "PENDING" ? "One moment" : "Order update" } },
  };
  return <PurchasePageView design={design} data={data} doc={shown} files={null} status={statusNode} />;
}

export default function StoreSuccessPage() {
  const { slug } = useParams<{ slug: string }>();
  return (
    <Suspense fallback={<div className="py-10 text-center text-faint">…</div>}>
      <SuccessInner slug={slug} />
    </Suspense>
  );
}
