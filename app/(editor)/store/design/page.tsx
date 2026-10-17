"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { ApiError, storeApi } from "@/lib/api";
import type { StoreDashboard } from "@/lib/types";
import { DesignEditor } from "@/components/store-design/design-editor";
import { Alert, Spinner } from "@/components/ui";

/** The store page designer: pick a style, edit every section, preview on phone and desktop. */
export default function StoreDesignPage() {
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
  if (store === null) {
    return (
      <div className="mx-auto max-w-md py-16 text-center">
        <p className="text-sm text-muted">
          Create your store first, then come back to design it. <Link href="/store" className="font-medium text-accent hover:underline">Go to Your store</Link>
        </p>
      </div>
    );
  }
  return <DesignEditor token={token!} initial={store} />;
}
