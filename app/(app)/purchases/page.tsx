"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { ApiError, purchasesApi } from "@/lib/api";
import { formatPrice } from "@/lib/pricing";
import { formatSize } from "@/lib/files";
import { fileName, fileNote } from "@/lib/store-design/product-page";
import type { Purchase, ProductFile } from "@/lib/types";
import { StoreCover } from "@/components/store/store-cover";
import { Alert, Spinner } from "@/components/ui";

const card = "rounded-2xl border border-hairline bg-surface p-5 sm:p-6";
const date = (iso: string, year = false) =>
  new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", ...(year ? { year: "numeric" } : {}) });

/**
 * My purchases — the buyer's library: everything they bought in Scrivetta
 * stores, theirs for good, with unlimited downloads (account perks included).
 * Purchases made as a guest with this (verified) email show up here
 * automatically. A file the author replaced is marked "Updated".
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
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="flex flex-col gap-2">
          <h1 className="font-display text-[34px] font-light leading-[1.05] tracking-[-0.02em] text-foreground sm:text-[40px]">
            Your books
          </h1>
          <p className="text-sm text-muted">Yours for good. Download as often as you like.</p>
        </div>
        {purchases && purchases.length > 0 && (
          <span className="text-sm text-muted">{purchases.length} purchase{purchases.length === 1 ? "" : "s"}</span>
        )}
      </div>

      {error && <Alert>{error}</Alert>}

      {!purchases && !error && (
        <div className="flex justify-center py-16 text-ink-soft"><Spinner /></div>
      )}

      {purchases && purchases.length === 0 && (
        <div className={`${card} text-sm text-muted`}>
          <p className="font-medium text-foreground">No purchases yet.</p>
          <p className="mt-1">
            Bought something with <strong className="text-foreground-2">{user?.email}</strong>? It appears here once
            the payment is confirmed. Purchases made with another email address stay available through the download
            link in their receipt email.
          </p>
        </div>
      )}

      {purchases && purchases.length > 0 && (
        <ul className="flex flex-col gap-4">
          {purchases.map((p) => (
            <PurchaseCard key={p.orderId} token={token!} purchase={p} />
          ))}
        </ul>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-hairline pt-5 text-sm text-muted">
        <span>Have something to teach? Scrivetta can help you write your own ebook.</span>
        <Link href="/ebooks/new" className="font-medium text-foreground underline decoration-hairline-2 underline-offset-4">Write your own →</Link>
      </div>
    </div>
  );
}

function PurchaseCard({ token, purchase }: { token: string; purchase: Purchase }) {
  const who = purchase.authorName || purchase.storeName;
  const updated = purchase.files.filter((f) => f.updated);
  return (
    <li className={`${card} flex flex-wrap gap-5`}>
      <div className="w-20 shrink-0">
        <StoreCover coverUrl={purchase.coverUrl} title={purchase.productTitle} className="shadow-none" />
      </div>
      <div className="flex min-w-0 flex-[1_1_280px] flex-col gap-1">
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="text-[17px] font-semibold text-foreground">{purchase.productTitle}</h2>
          {purchase.updatedAt && (
            <span className="inline-flex h-6 items-center rounded-full bg-accent-soft px-2.5 text-xs font-medium text-accent-ink">
              Updated {date(purchase.updatedAt)}
            </span>
          )}
        </div>
        <p className="text-sm text-muted">
          {[who ? `by ${who}` : null, purchase.purchasedAt ? `bought ${date(purchase.purchasedAt, true)}` : null, formatPrice(purchase.amount)]
            .filter(Boolean)
            .join(" · ")}
        </p>
        {purchase.storeSlug && (
          <Link href={purchase.onSale ? `/store/${purchase.storeSlug}/${purchase.productId}` : `/store/${purchase.storeSlug}`}
            className="self-start text-sm font-medium underline decoration-hairline-2 underline-offset-4">
            {purchase.storeName ?? "The store"} ↗
          </Link>
        )}
        {updated.length > 0 && (
          <p className="mt-2 rounded-xl bg-accent-soft px-3.5 py-2.5 text-[13px] text-accent-ink">
            {who ?? "The author"} updated {updated.map((f) => fileName(f).toLowerCase() === "the book" ? "the book" : `“${fileName(f)}”`).join(" and ")}.
            You already have the new version.
          </p>
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
  const name = fileName(file);

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

  const sub = [file.updated ? "New version" : null, file.accountOnly ? "Account perk" : null,
    file.label || file.id === "ebook-pdf" ? fileNote(file) : null, size].filter(Boolean).join(" · ");

  return (
    <li className="flex items-center gap-3 py-2.5">
      <span className="w-12 shrink-0 rounded-md bg-surface-2 px-1.5 py-1 text-center font-mono text-[11px] font-semibold text-foreground-2">{file.format}</span>
      <span className="min-w-0 flex-1 text-sm">
        <span className="block break-words font-medium text-foreground">{name}</span>
        {sub && <span className="block text-xs text-muted">{sub}</span>}
        {error && <span className="block text-xs text-red-600 dark:text-red-400">{error}</span>}
      </span>
      <button type="button" onClick={download} disabled={busy} aria-label={`Download ${name}`}
        className="inline-flex h-10 items-center gap-2 rounded-xl border border-hairline-2 bg-surface px-3.5 text-sm font-semibold hover:border-muted disabled:opacity-60">
        {busy ? <Spinner /> : (
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden><path d="M8 2v9M4 7.5l4 4 4-4M2.5 14h11" /></svg>
        )}
        <span className="hidden sm:inline">Download</span>
      </button>
    </li>
  );
}
