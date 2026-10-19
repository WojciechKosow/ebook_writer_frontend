"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { ApiError, storeApi } from "@/lib/api";
import type { StoreDashboard } from "@/lib/types";
import { ProductEditor } from "@/components/store-design/product-editor";
import { Alert, Spinner } from "@/components/ui";

/** The product page designer: the sales page and the after-purchase page, in the store's style. */
export default function ProductDesignPage() {
  const { id } = useParams<{ id: string }>();
  const { token } = useAuth();
  const [store, setStore] = useState<StoreDashboard | null | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    storeApi
      .get(token)
      .then(setStore)
      .catch((e) => setError(e instanceof ApiError ? e.message : "Could not load your store."));
  }, [token]);

  if (error) return <div className="mx-auto w-full max-w-md p-6"><Alert>{error}</Alert></div>;
  if (store === undefined) {
    return (
      <div className="flex flex-1 items-center justify-center text-ink-soft">
        <Spinner />
      </div>
    );
  }
  if (!store || !store.products.some((p) => p.id === id)) {
    return (
      <div className="mx-auto max-w-md py-16 text-center">
        <p className="text-sm text-muted">
          This product isn&apos;t in your store. <Link href="/store" className="font-medium text-accent hover:underline">Go to Your store</Link>
        </p>
      </div>
    );
  }
  return <ProductEditor token={token!} initial={store} productId={id} />;
}
