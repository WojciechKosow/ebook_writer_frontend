"use client";

import { useState } from "react";
import Link from "next/link";
import { ApiError, storeApi } from "@/lib/api";
import type { StoreDashboard, StoreProduct } from "@/lib/types";
import { formatPrice } from "@/lib/pricing";
import { productState } from "@/lib/store/changes";
import { StoreCover } from "@/components/store/store-cover";
import { Button } from "@/components/ui";
import { toCents } from "./add-product";
import { Dialog, DialogHeader, FeaturedChip, MoreMenu, ProductStateChip } from "./kit";

/** "Ebook · 96 pages · book + 2 extras" / "Your files · ZIP + PDF". */
export function productMeta(p: StoreProduct): string {
  if (p.ebookId) {
    const extras = p.files.length;
    return ["Ebook", p.pageCount > 0 ? `${p.pageCount} pages` : null,
      extras ? `book + ${extras} extra${extras === 1 ? "" : "s"}` : "book only"].filter(Boolean).join(" · ");
  }
  if (!p.files.length) return "Your files · nothing uploaded yet · hidden from buyers until it has a file";
  return `Your files · ${[...new Set(p.files.map((f) => f.format))].join(" + ")}`;
}

/**
 * The products on Your store: one card per product with its state, an inline
 * price (a draft until published), one "Edit product" and everything else in
 * its ⋯ menu. Drag to reorder; the first one is featured.
 */
export function ProductList({ token, store, onChange, onSaving, onAdd }: {
  token: string;
  store: StoreDashboard;
  onChange: (s: StoreDashboard) => void;
  onSaving: (saving: boolean) => void;
  onAdd: () => void;
}) {
  const [dragging, setDragging] = useState<string | null>(null);
  const [over, setOver] = useState<string | null>(null);
  const [removing, setRemoving] = useState<StoreProduct | null>(null);
  const [error, setError] = useState<string | null>(null);
  const products = store.products;
  const featuredId = products.find((p) => p.active)?.id ?? null;

  async function run(fn: () => Promise<StoreDashboard>) {
    onSaving(true);
    setError(null);
    try {
      onChange(await fn());
      return true;
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Could not save that change.");
      return false;
    } finally {
      onSaving(false);
    }
  }

  function reorder(ids: string[]) {
    return run(() => storeApi.reorderProducts(token, ids));
  }

  function move(id: string, to: number) {
    const ids = products.map((p) => p.id).filter((x) => x !== id);
    ids.splice(Math.max(0, Math.min(to, ids.length)), 0, id);
    return reorder(ids);
  }

  return (
    <section className="flex flex-col gap-3">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="flex flex-col gap-1">
          <h2 className="font-display text-[26px] font-normal leading-tight">
            Products {products.length > 0 && <span className="text-muted">{products.length}</span>}
          </h2>
          <span className="hidden text-xs text-muted sm:block">
            {products.length > 1 ? "Drag to reorder how they appear on your store — the first one is featured. " : ""}Prices in USD.
          </span>
          <span className="text-xs text-muted sm:hidden">Tap a product to edit its page, files and price.</span>
        </div>
        {products.length > 0 && <Button variant="secondary" onClick={onAdd}>+ Add product</Button>}
      </div>

      {products.length === 0 ? (
        <div className="flex flex-wrap items-center gap-5 rounded-2xl border border-dashed border-hairline-2 bg-surface p-6">
          <div aria-hidden className="flex gap-1.5">
            {[0, 1, 2].map((i) => <span key={i} className="h-16 w-11 rounded border border-hairline bg-surface-2" />)}
          </div>
          <div className="flex min-w-[220px] flex-1 flex-col gap-1">
            <span className="font-medium">Nothing for sale yet</span>
            <span className="text-sm text-muted">Turn a finished ebook into a product. It gets its own page, your cover and a price.</span>
          </div>
          <Button variant="secondary" onClick={onAdd}>+ Add product</Button>
        </div>
      ) : (
        <ul className="flex flex-col gap-2">
          {products.map((p, i) => (
            <li key={p.id}
              onDragOver={(e) => {
                if (!dragging) return;
                e.preventDefault();
                setOver(p.id);
              }}
              onDragLeave={() => setOver((o) => (o === p.id ? null : o))}
              onDrop={(e) => {
                e.preventDefault();
                if (dragging && dragging !== p.id) void move(dragging, i);
                setDragging(null);
                setOver(null);
              }}
              className={over === p.id && dragging !== p.id ? "rounded-2xl ring-2 ring-foreground/30" : ""}>
              <ProductRow key={p.priceCents} token={token} store={store} product={p} index={i} featured={p.id === featuredId}
                onChange={onChange} run={run}
                onDragStart={() => setDragging(p.id)} onDragEnd={() => { setDragging(null); setOver(null); }}
                onMove={(to) => move(p.id, to)} onRemove={() => setRemoving(p)} />
            </li>
          ))}
        </ul>
      )}
      {error && <p role="alert" className="text-sm text-red-700 dark:text-red-400">{error}</p>}

      <RemoveDialog product={removing} onClose={() => setRemoving(null)}
        onConfirm={async () => {
          if (removing && await run(() => storeApi.removeProduct(token, removing.id))) setRemoving(null);
        }} />
    </section>
  );
}

function ProductRow({ token, store, product: p, index, featured, run, onDragStart, onDragEnd, onMove, onRemove }: {
  token: string;
  store: StoreDashboard;
  product: StoreProduct;
  index: number;
  featured: boolean;
  onChange: (s: StoreDashboard) => void;
  run: (fn: () => Promise<StoreDashboard>) => Promise<boolean>;
  onDragStart: () => void;
  onDragEnd: () => void;
  onMove: (to: number) => void;
  onRemove: () => void;
}) {
  const [price, setPrice] = useState((p.priceCents / 100).toFixed(2));
  const [priceError, setPriceError] = useState(false);
  const state = productState(p);
  const edit = `/store/products/${p.id}/design`;
  const last = store.products.length - 1;

  async function savePrice() {
    const cents = toCents(price);
    if (cents === null) {
      setPriceError(true);
      return;
    }
    setPriceError(false);
    if (cents !== p.priceCents) await run(() => storeApi.updateProduct(token, p.id, { priceCents: cents }));
  }

  const priceChanged = p.liveActive && p.priceCents !== p.livePriceCents;

  return (
    <>
    {/* Phone: one row, the whole card opens the product. */}
    <Link href={state === "needs-file" ? `${edit}?tab=files` : edit}
      className="flex items-center gap-3 rounded-2xl border border-hairline bg-surface p-3 sm:hidden">
      <span className="w-10 shrink-0"><StoreCover coverUrl={p.coverUrl} title={p.title} className="shadow-none" /></span>
      <span className="flex min-w-0 flex-1 flex-col gap-1">
        <span className="truncate font-medium">{p.title}</span>
        <span className="flex flex-wrap items-center gap-2 text-xs">
          <b className="font-semibold">{formatPrice(p.priceCents)}</b>
          {featured ? <FeaturedChip short /> : priceChanged ? <span className="text-warn">price not live yet</span> : <ProductStateChip state={state} />}
        </span>
      </span>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden className="shrink-0 text-muted"><path d="M9 6l6 6-6 6" /></svg>
    </Link>
    <div className="hidden items-center gap-x-4 gap-y-3 rounded-2xl border border-hairline bg-surface p-3 pr-4 sm:flex sm:flex-wrap lg:flex-nowrap">
      <span draggable onDragStart={(e) => {
        e.dataTransfer.effectAllowed = "move";
        onDragStart();
      }} onDragEnd={onDragEnd}
        title="Drag to reorder" aria-hidden
        className="hidden cursor-grab select-none px-1 text-faint hover:text-foreground sm:block">
        <svg width="14" height="20" viewBox="0 0 14 20" fill="currentColor"><circle cx="4" cy="4" r="1.5" /><circle cx="10" cy="4" r="1.5" /><circle cx="4" cy="10" r="1.5" /><circle cx="10" cy="10" r="1.5" /><circle cx="4" cy="16" r="1.5" /><circle cx="10" cy="16" r="1.5" /></svg>
      </span>
      <Link href={edit} className="w-11 shrink-0" aria-label={`Edit ${p.title}`}>
        <StoreCover coverUrl={p.coverUrl} title={p.title} className="shadow-none" />
      </Link>
      <div className="flex min-w-0 flex-[1_1_200px] flex-col gap-1">
        <div className="flex flex-wrap items-center gap-2">
          <Link href={edit} className="font-medium hover:underline">{p.title}</Link>
          {featured && <FeaturedChip />}
        </div>
        <span className="text-xs text-muted">{productMeta(p)}</span>
        {priceChanged && (
          <span className="inline-flex items-center gap-1.5 text-xs text-warn">
            <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-[#C4892B]" />
            Price changed from {formatPrice(p.livePriceCents)} — goes live when you publish
          </span>
        )}
      </div>
      <ProductStateChip state={state} />
      <label className={`flex h-10 items-center gap-1 rounded-xl border bg-background px-3 ${priceError ? "border-red-500" : "border-hairline-2"}`}>
        <span className="text-sm text-muted">$</span>
        <input aria-label={`Price for ${p.title}`} inputMode="decimal" value={price}
          onChange={(e) => setPrice(e.target.value)} onBlur={savePrice}
          onKeyDown={(e) => {
            if (e.key === "Enter") (e.target as HTMLInputElement).blur();
          }}
          className="w-[64px] bg-transparent text-sm outline-none" />
      </label>
      {state === "needs-file" ? (
        <Link href={`${edit}?tab=files`} className="inline-flex h-10 items-center rounded-xl border border-hairline-2 bg-surface px-4 text-sm font-semibold hover:border-muted">Add a file</Link>
      ) : (
        <Link href={edit} className="inline-flex h-10 items-center rounded-xl border border-hairline-2 bg-surface px-4 text-sm font-semibold hover:border-muted">Edit product</Link>
      )}
      <MoreMenu label={`More for ${p.title}`} items={[
        ...(!featured && p.active ? [{ label: "Feature on your store", onSelect: () => onMove(0) }] : []),
        { label: "Move up", onSelect: () => onMove(index - 1), disabled: index === 0 },
        { label: "Move down", onSelect: () => onMove(index + 1), disabled: index === last },
        ...(store.published && p.liveActive ? [{ label: "View page ↗", href: `/store/${store.slug}/${p.id}` }] : []),
        p.active
          ? { label: "Hide from store", onSelect: () => void run(() => storeApi.updateProduct(token, p.id, { active: false })) }
          : { label: "Show on store", disabled: !p.deliverable, onSelect: () => void run(() => storeApi.updateProduct(token, p.id, { active: true })) },
        "sep",
        { label: "Remove from store…", danger: true, onSelect: onRemove },
      ]} />
      {priceError && <span className="w-full text-xs text-red-700 dark:text-red-400">Enter a price like 9.99 (between $0.50 and $1,000).</span>}
    </div>
    </>
  );
}

function RemoveDialog({ product, onClose, onConfirm }: { product: StoreProduct | null; onClose: () => void; onConfirm: () => Promise<void> }) {
  const [busy, setBusy] = useState(false);
  return (
    <Dialog open={!!product} onClose={onClose} labelledBy="remove-product-title">
      {product && (
        <>
          <DialogHeader id="remove-product-title" title={`Remove ${product.title}?`} onClose={onClose} />
          <div className="flex flex-col gap-4 px-6 pb-6">
            <p className="text-sm leading-relaxed text-muted">
              It leaves your store right away — its page and files go with it. Buyers keep their downloads.
              {product.ebookId ? " You can add the ebook again later." : ""} To take it off sale for a while, hide it instead.
            </p>
            <div className="flex justify-end gap-2">
              <Button variant="secondary" onClick={onClose}>Keep it</Button>
              <Button loading={busy} className="!bg-red-700 !text-white"
                onClick={async () => {
                  setBusy(true);
                  await onConfirm();
                  setBusy(false);
                }}>Remove</Button>
            </div>
          </div>
        </>
      )}
    </Dialog>
  );
}
