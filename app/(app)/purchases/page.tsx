"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { ApiError, purchasesApi } from "@/lib/api";
import { formatPrice } from "@/lib/pricing";
import { formatSize } from "@/lib/files";
import type { Purchase, ProductFile } from "@/lib/types";
import { StoreCover } from "@/components/store/store-cover";
import { Alert, Button, Spinner } from "@/components/ui";

const card = "rounded-2xl border border-hairline bg-surface p-5 sm:p-6";

/**
 * My Purchases: everything the signed-in buyer bought in creator stores, with
 * unlimited downloads. Purchases made as a guest with this (verified) email
 * show up here automatically.
 */
export default function PurchasesPage() {
  const { token, user } = useAuth();
  const [purchases, setPurchases] = useState<Purchase[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    purchasesApi
      .list(token)
      .then(setPurchases)
      .catch((e) => setError(e instanceof ApiError ? e.message : "Could not load your purchases."));
  }, [token]);

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="font-display text-[34px] font-light leading-[1.05] tracking-[-0.02em] text-foreground sm:text-[40px]">
        My purchases
      </h1>
      <p className="mt-2 text-sm text-muted">
        Everything you&apos;ve bought from Scrivetta creator stores. Download your files as often as you like.
      </p>

      {error && <div className="mt-6"><Alert>{error}</Alert></div>}

      {!purchases && !error && (
        <div className="flex justify-center py-16 text-ink-soft"><Spinner /></div>
      )}

      {purchases && purchases.length === 0 && (
        <div className={`${card} mt-6 text-sm text-muted`}>
          <p className="font-medium text-foreground">No purchases yet.</p>
          <p className="mt-1">
            Bought something with <strong className="text-foreground-2">{user?.email}</strong>? It appears here once
            the payment is confirmed. Purchases made with another email address stay available through the download
            link in their receipt email.
          </p>
        </div>
      )}

      {purchases && purchases.length > 0 && (
        <ul className="mt-6 flex flex-col gap-4">
          {purchases.map((p) => (
            <PurchaseCard key={p.orderId} token={token!} purchase={p} />
          ))}
        </ul>
      )}
    </div>
  );
}

function PurchaseCard({ token, purchase }: { token: string; purchase: Purchase }) {
  const who = purchase.authorName || purchase.storeName;
  const date = purchase.purchasedAt
    ? new Date(purchase.purchasedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
    : null;
  return (
    <li className={`${card} flex flex-wrap gap-5`}>
      <div className="w-20 shrink-0">
        <StoreCover coverUrl={purchase.coverUrl} title={purchase.productTitle} className="shadow-none" />
      </div>
      <div className="flex min-w-0 flex-[1_1_280px] flex-col gap-1">
        <p className="text-[17px] font-semibold text-foreground">{purchase.productTitle}</p>
        <p className="text-sm text-muted">
          {[who ? `by ${who}` : null, date ? `bought ${date}` : null, formatPrice(purchase.amount)]
            .filter(Boolean)
            .join(" · ")}
        </p>
        {purchase.storeSlug && purchase.onSale && (
          <Link href={`/store/${purchase.storeSlug}/${purchase.productId}`} className="text-sm font-medium text-accent hover:underline">
            View in store
          </Link>
        )}
        {purchase.files.length === 0 ? (
          <div className="mt-3">
            <Alert variant="info">
              The files aren&apos;t available right now.
              {purchase.contactEmail ? (
                <> Contact the author at <a className="font-semibold underline" href={`mailto:${purchase.contactEmail}`}>{purchase.contactEmail}</a>.</>
              ) : null}
            </Alert>
          </div>
        ) : (
          <ul className="mt-3 flex flex-col divide-y divide-hairline">
            {purchase.files.map((f) => (
              <FileRow key={f.id} token={token} orderId={purchase.orderId} file={f} />
            ))}
          </ul>
        )}
      </div>
    </li>
  );
}

function FileRow({ token, orderId, file }: { token: string; orderId: string; file: ProductFile }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const size = formatSize(file.sizeBytes);

  async function download() {
    setBusy(true);
    setError(null);
    try {
      await purchasesApi.download(token, orderId, file.id);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Could not start the download.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <li className="flex flex-wrap items-center gap-3 py-2.5">
      <span className="rounded-md bg-surface-2 px-2 py-0.5 font-mono text-[11px] font-semibold text-foreground-2">{file.format}</span>
      <span className="min-w-0 flex-1 text-sm">
        <span className="break-words text-foreground">{file.filename}</span>
        {size && <span className="text-faint"> · {size}</span>}
        {error && <span className="block text-xs text-red-600 dark:text-red-400">{error}</span>}
      </span>
      <Button variant="secondary" loading={busy} onClick={download}>Download</Button>
    </li>
  );
}
