"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { ApiError, publicStoreApi } from "@/lib/api";
import { formatPrice } from "@/lib/pricing";
import type { PublicStore } from "@/lib/types";
import { MarketingShell } from "@/components/marketing-shell";
import { Alert, Button, Spinner } from "@/components/ui";

/** A creator's public store. Buyers need no account; checkout runs on Stripe. */
export default function PublicStorePage() {
  const { slug } = useParams<{ slug: string }>();
  const [store, setStore] = useState<PublicStore | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [buying, setBuying] = useState<string | null>(null);

  useEffect(() => {
    publicStoreApi
      .store(slug)
      .then(setStore)
      .catch((e) => (e instanceof ApiError && e.status === 404 ? setNotFound(true) : setError("Could not load this store.")));
  }, [slug]);

  async function buy(productId: string) {
    setBuying(productId);
    setError(null);
    try {
      const { checkoutUrl } = await publicStoreApi.checkout(productId);
      window.location.assign(checkoutUrl);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Could not start checkout. Please try again.");
      setBuying(null);
    }
  }

  return (
    <MarketingShell ambient="none">
      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
        {!store && !notFound && !error && (
          <div className="flex justify-center py-16 text-muted">
            <Spinner />
          </div>
        )}

        {notFound && (
          <div className="py-16 text-center">
            <h1 className="font-display text-3xl font-light text-foreground">Store not found</h1>
            <p className="mt-2 text-sm text-muted">This store doesn&apos;t exist or isn&apos;t open yet.</p>
          </div>
        )}

        {store && (
          <>
            <h1 className="font-display text-[34px] font-light leading-[1.05] tracking-[-0.02em] text-foreground sm:text-[40px]">
              {store.name}
            </h1>
            {store.description && <p className="mt-3 whitespace-pre-line text-muted">{store.description}</p>}

            {!store.purchasable && store.unavailableReason && (
              <div className="mt-6">
                <Alert variant="info">{store.unavailableReason}</Alert>
              </div>
            )}

            {store.products.length === 0 ? (
              <p className="mt-10 text-sm text-faint">No ebooks for sale yet.</p>
            ) : (
              <ul className="mt-8 grid gap-4 sm:grid-cols-2">
                {store.products.map((p) => (
                  <li key={p.id} className="flex flex-col rounded-2xl border border-hairline bg-surface p-6">
                    <h2 className="font-display text-[22px] font-normal leading-tight text-foreground">{p.title}</h2>
                    {p.description && <p className="mt-2 flex-1 text-sm text-muted">{p.description}</p>}
                    <div className="mt-5 flex items-center justify-between gap-3">
                      <span className="text-lg font-semibold text-foreground">{formatPrice(p.priceCents)}</span>
                      <Button
                        onClick={() => buy(p.id)}
                        loading={buying === p.id}
                        disabled={!store.purchasable || buying !== null}
                        title={store.purchasable ? undefined : store.unavailableReason ?? undefined}
                      >
                        Buy ebook
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            )}

            {error && (
              <div className="mt-6">
                <Alert>{error}</Alert>
              </div>
            )}

            <p className="mt-10 text-xs text-faint">
              Sold by {store.name}. Payments are processed securely by Stripe on the seller&apos;s behalf. Instant
              PDF download by email after payment.
            </p>
          </>
        )}

        {error && !store && <Alert>{error}</Alert>}
      </div>
    </MarketingShell>
  );
}
