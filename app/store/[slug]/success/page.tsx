"use client";

import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { publicStoreApi } from "@/lib/api";
import type { PublicStore, StoreOrderStatusResponse } from "@/lib/types";
import { formatPrice } from "@/lib/pricing";
import { StoreShell } from "@/components/store/store-shell";
import { PurchasePageView } from "@/components/store-design/product-page-view";
import { parseDesign } from "@/lib/store-design/core";
import { DOWNLOAD_DAYS, DOWNLOAD_LIMIT, parsePageDoc, type ProductPageData } from "@/lib/store-design/product-page";
import { Alert, ButtonLink, Spinner } from "@/components/ui";

const MAX_ATTEMPTS = 30; // ~60 s

const date = (iso: string) => new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" });

/**
 * After Stripe Checkout: the author's after-purchase page, in the store's
 * style, with the files to download right here. Never claims payment from the
 * redirect alone — it polls our order until the webhook has marked it PAID.
 * Stripe's redirect carries the Checkout Session id; with it the backend lists
 * this buyer's files (the same downloads as the emailed link).
 */
function SuccessInner({ slug }: { slug: string }) {
  const params = useSearchParams();
  const orderId = params.get("order");
  const sessionId = params.get("session_id");
  const [order, setOrder] = useState<StoreOrderStatusResponse | null>(null);
  const [store, setStore] = useState<PublicStore | null>(null);
  const [timedOut, setTimedOut] = useState(false);

  useEffect(() => {
    publicStoreApi.store(slug).then(setStore).catch(() => setStore(null));
  }, [slug]);

  const refresh = useCallback(() => {
    if (orderId) publicStoreApi.order(orderId, sessionId).then(setOrder).catch(() => {});
  }, [orderId, sessionId]);

  useEffect(() => {
    if (!orderId) return;
    let attempts = 0;
    let timer: ReturnType<typeof setTimeout>;
    let stopped = false;

    const poll = async () => {
      attempts += 1;
      try {
        const o = await publicStoreApi.order(orderId, sessionId);
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
  }, [orderId, sessionId]);

  const design = useMemo(() => parseDesign(store?.themeSettings), [store]);
  const doc = useMemo(() => parsePageDoc(order?.pageSettings), [order]);
  const data: ProductPageData | null = useMemo(() => (store && order ? {
    store: store.store,
    product: {
      id: order.productId, title: order.productTitle ?? "Your purchase", subtitle: null, description: null, highlights: [],
      priceCents: order.amount ?? 0, pageCount: 0, language: null, updatedAt: null, coverUrl: order.coverUrl, formats: [], chapters: [],
      included: [...(order.files ?? []), ...(order.perks ?? [])],
      downloadLimit: order.downloadLimit ?? DOWNLOAD_LIMIT, downloadDays: DOWNLOAD_DAYS,
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

  const o = order!;
  const status = o.status;
  const box = { padding: "14px 16px", borderRadius: 12, border: "1px solid var(--pp-line)", background: "var(--pp-surface2)", fontSize: 14.5, lineHeight: 1.6, color: "var(--pp-body)" };
  const strong = { color: "var(--pp-ink)" };
  const link = { color: "var(--pp-accent-text)", fontWeight: 600 };
  const files = status === "PAID" ? o.files : null;

  const statusNode =
    status === "PENDING" ? (
      <div role="status" style={box}>
        {timedOut
          ? "Still confirming your payment. This can take a little longer — as soon as it's confirmed you'll get an email with your download link."
          : "Confirming your payment — your files appear here in a moment…"}
      </div>
    ) : status === "PAID" ? (
      <div role="status" style={box}>
        <strong style={strong}>Payment confirmed{o.amount != null ? ` · ${formatPrice(o.amount)}` : ""}.</strong>{" "}
        {files
          ? <>We also emailed {o.buyerEmail ? <>this page to <strong style={strong}>{o.buyerEmail}</strong></> : "you a link to this page"}, so you can come back to it. Check spam if it isn&apos;t there in a few minutes.</>
          : <>We&apos;ve emailed you a download link — it works for {DOWNLOAD_DAYS} days, with up to {o.downloadLimit} downloads of each file. Check your spam folder if it isn&apos;t there in a few minutes.</>}
        {o.inLibrary && <> It&apos;s also in <Link href="/purchases" style={link}>My purchases</Link>, yours for good.</>}
      </div>
    ) : status === "EXPIRED" ? (
      <div role="status" style={box}>This checkout expired. No payment was taken — you can start again from the store.</div>
    ) : (
      <div role="status" style={box}>This order was refunded.</div>
    );

  // Until the payment is confirmed, the page doesn't say "ready"; an account holder isn't asked to sign up.
  const sections = { ...(doc.sections ?? {}) };
  if (status !== "PAID") {
    sections["purchase.thanks"] = { ...(sections["purchase.thanks"] ?? {}), eyebrow: status === "PENDING" ? "One moment" : "Order update" };
  }
  if (o.inLibrary) sections["purchase.account"] = { ...(sections["purchase.account"] ?? {}), enabled: false };
  const shown = { ...doc, sections };

  return (
    <PurchasePageView design={design} data={data} doc={shown} files={files} perks={o.inLibrary ? [] : (o.perks ?? [])}
      fileHref={(f) => publicStoreApi.orderFileUrl(o.orderId, sessionId!, f.id)}
      onFileClick={() => setTimeout(refresh, 3000)}
      status={statusNode}
      footnote={o.expiresAt ? (
        <p style={{ margin: 0, fontSize: 12.5, color: "var(--pp-muted)" }}>
          Up to {o.downloadLimit} downloads of each file, until {date(o.expiresAt)}.
        </p>
      ) : null} />
  );
}

export default function StoreSuccessPage() {
  const { slug } = useParams<{ slug: string }>();
  return (
    <Suspense fallback={<div className="py-10 text-center text-faint">…</div>}>
      <SuccessInner slug={slug} />
    </Suspense>
  );
}
