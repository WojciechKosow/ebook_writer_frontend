"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { ApiError, publicStoreApi } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import type { PublicProduct } from "@/lib/types";
import { MarketingShell } from "@/components/marketing-shell";
import { StoreShell } from "@/components/store/store-shell";
import { ProductPageView } from "@/components/store-design/product-page-view";
import { parseDesign } from "@/lib/store-design/core";
import { pageDataFromPublic, parsePageDoc } from "@/lib/store-design/product-page";
import { Alert, ButtonLink, Spinner } from "@/components/ui";

/**
 * One product's page in a creator store — where buyers decide and buy. Dressed
 * in the store's style, with the words and free preview the author designed.
 */
export default function StoreProductPage() {
  const { slug, productId } = useParams<{ slug: string; productId: string }>();
  const [data, setData] = useState<PublicProduct | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [buyError, setBuyError] = useState<string | null>(null);
  const [buying, setBuying] = useState(false);
  const { token, user } = useAuth();

  useEffect(() => {
    publicStoreApi
      .product(slug, productId)
      .then(setData)
      .catch((e) => (e instanceof ApiError && e.status === 404 ? setNotFound(true) : setError("Could not load this product.")));
  }, [slug, productId]);

  const design = useMemo(() => parseDesign(data?.themeSettings), [data]);
  const doc = useMemo(() => parsePageDoc(data?.pageSettings), [data]);
  const pageData = useMemo(() => (data ? pageDataFromPublic(data) : null), [data]);
  const loadSample = useCallback((n: number) => publicStoreApi.sample(slug, productId, n), [slug, productId]);

  async function buy() {
    if (!data) return;
    setBuying(true);
    setBuyError(null);
    try {
      // Signed in: the purchase is linked to the account (My Purchases).
      const { checkoutUrl } = await publicStoreApi.checkout(data.id, token);
      window.location.assign(checkoutUrl);
    } catch (e) {
      setBuyError(e instanceof ApiError ? e.message : "Could not start checkout. Please try again.");
      setBuying(false);
    }
  }

  if (notFound) {
    return (
      <MarketingShell ambient="none">
        <div className="mx-auto max-w-md px-4 py-24 text-center">
          <h1 className="font-display text-3xl font-light text-foreground">Product not found</h1>
          <p className="mt-2 text-sm text-muted">It may no longer be for sale.</p>
          <div className="mt-6">
            <ButtonLink href={`/store/${slug}`} variant="secondary">Back to the store</ButtonLink>
          </div>
        </div>
      </MarketingShell>
    );
  }

  if (!data || !pageData) {
    return (
      <StoreShell profile={null}>
        <div className="flex justify-center py-24 text-muted">{error ? <Alert>{error}</Alert> : <Spinner />}</div>
      </StoreShell>
    );
  }

  return (
    <ProductPageView design={design} data={pageData} doc={doc} sampleRefs={data.sampleChapters} loadSample={loadSample}
      onBuy={buy} buying={buying} buyError={buyError} buyerEmail={user?.email ?? null} />
  );
}
