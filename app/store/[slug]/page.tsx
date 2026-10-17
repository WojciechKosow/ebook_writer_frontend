"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { ApiError, publicStoreApi } from "@/lib/api";
import type { PublicStore } from "@/lib/types";
import { MarketingShell } from "@/components/marketing-shell";
import { StoreShell } from "@/components/store/store-shell";
import { StoreDesignView } from "@/components/store-design/store-design-view";
import { parseDesign } from "@/lib/store-design/core";
import { Alert, Spinner } from "@/components/ui";

/**
 * A creator's public store, in the style the author designed. Buyers need no
 * account; each ebook has its own page.
 */
export default function PublicStorePage() {
  const { slug } = useParams<{ slug: string }>();
  const [data, setData] = useState<PublicStore | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    publicStoreApi
      .store(slug)
      .then(setData)
      .catch((e) => (e instanceof ApiError && e.status === 404 ? setNotFound(true) : setError("Could not load this store.")));
  }, [slug]);

  if (notFound || (error && !data)) {
    return (
      <MarketingShell ambient="none">
        <div className="mx-auto max-w-md px-4 py-24 text-center">
          {notFound ? (
            <>
              <h1 className="font-display text-3xl font-light text-foreground">Store not found</h1>
              <p className="mt-2 text-sm text-muted">This store doesn&apos;t exist or isn&apos;t open yet.</p>
            </>
          ) : (
            <Alert>{error}</Alert>
          )}
        </div>
      </MarketingShell>
    );
  }

  if (!data) {
    return (
      <StoreShell profile={null}>
        <div className="flex justify-center py-24 text-muted">
          <Spinner />
        </div>
      </StoreShell>
    );
  }

  return (
    <StoreDesignView
      doc={parseDesign(data.themeSettings)}
      data={{ store: data.store, products: data.products, chapters: data.featuredChapters ?? [] }}
    />
  );
}
