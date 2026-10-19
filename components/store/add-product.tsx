"use client";

import { useState } from "react";
import { ApiError, storeApi } from "@/lib/api";
import type { EbookStatusResponse, StoreDashboard } from "@/lib/types";
import { formatPrice } from "@/lib/pricing";
import { BookCover } from "@/components/library/book-cover";
import { Alert, Button, controlBase } from "@/components/ui";
import { Dialog, DialogHeader } from "./kit";

/** "12.99" → 1299; null when not a valid amount. */
export function toCents(value: string): number | null {
  const v = value.trim().replace(/^\$/, "");
  if (!/^\d+(\.\d{1,2})?$/.test(v)) return null;
  return Math.round(parseFloat(v) * 100);
}

type Source = "library" | "own";

/**
 * Add a product: pick a finished ebook by its cover (or, second, your own
 * files), set its price, and go straight to its page in the editor. It goes
 * live with the next publish.
 */
export function AddProductDialog({ open, token, store, ebooks, onClose, onAdded }: {
  open: boolean;
  token: string;
  store: StoreDashboard;
  ebooks: EbookStatusResponse[];
  onClose: () => void;
  /** The new product's id and whether its files come next (own files). */
  onAdded: (s: StoreDashboard, productId: string, own: boolean) => void;
}) {
  const [source, setSource] = useState<Source>("library");
  const listed = new Set(store.products.map((p) => p.ebookId));
  const ready = (e: EbookStatusResponse) => e.status === "COMPLETED" && e.downloadReady && !listed.has(e.id);
  const books = [...ebooks].sort((a, b) => Number(ready(b)) - Number(ready(a)));
  const [picked, setPicked] = useState<string | null>(() => books.find(ready)?.id ?? null);
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("9.99");
  const [featured, setFeatured] = useState(store.products.length === 0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const book = books.find((b) => b.id === picked) ?? null;
  const cents = toCents(price);
  const lead = store.products.find((p) => p.active);
  const canAdd = cents !== null && (source === "library" ? !!book && ready(book) : !!title.trim());

  async function add() {
    if (cents === null) {
      setError("Enter a price like 9.99.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const before = new Set(store.products.map((p) => p.id));
      const next = await storeApi.addProduct(token, source === "library"
        ? { ebookId: book!.id, priceCents: cents, featured }
        : { title: title.trim(), priceCents: cents, featured });
      const added = next.products.find((p) => (source === "library" ? p.ebookId === book!.id : !before.has(p.id)));
      onAdded(next, added?.id ?? "", source === "own");
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Could not add the product.");
    } finally {
      setBusy(false);
    }
  }

  const seg = (on: boolean) =>
    `flex flex-1 flex-col items-start gap-0.5 rounded-xl border px-4 py-3 text-left ${on ? "border-foreground bg-background" : "border-hairline hover:border-hairline-2"}`;

  return (
    <Dialog open={open} onClose={onClose} wide labelledBy="add-product-title">
      <DialogHeader id="add-product-title" title="Add a product" onClose={onClose} />
      <div className="flex flex-wrap gap-6 px-6 pb-6">
        <section className="flex min-w-0 flex-[3_1_420px] flex-col gap-4">
          <div className="flex flex-wrap gap-2">
            <button type="button" aria-pressed={source === "library"} onClick={() => setSource("library")} className={seg(source === "library")}>
              <span className="text-sm font-semibold">From your Scrivetta library</span>
              <span className="text-xs text-muted">A finished ebook — cover, chapters and free preview come with it.</span>
            </button>
            <button type="button" aria-pressed={source === "own"} onClick={() => setSource("own")} className={seg(source === "own")}>
              <span className="text-sm font-semibold">Your own files</span>
              <span className="text-xs text-muted">ZIP, PDF or EPUB you made elsewhere.</span>
            </button>
          </div>

          {source === "library" ? (
            <>
              <div className="flex items-baseline justify-between gap-3">
                <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-muted">Your ebooks · {books.length}</span>
                <span className="text-xs text-faint">Finished ones can be sold</span>
              </div>
              {books.length === 0 ? (
                <p className="rounded-xl bg-surface-2 px-4 py-3 text-sm text-muted">
                  You haven&apos;t written an ebook yet. Finish one in Your library — or sell your own files instead.
                </p>
              ) : (
                <div className="grid grid-cols-[repeat(auto-fill,minmax(128px,1fr))] gap-3">
                  {books.map((b) => {
                    const ok = ready(b);
                    const inStore = listed.has(b.id);
                    const done = b.chapters.filter((c) => c.status === "WRITTEN" || c.status === "EDITED").length;
                    const tag = inStore ? "Already in your store"
                      : b.status === "COMPLETED" && !b.downloadReady ? "Still rendering"
                      : !ok ? (b.chapters.length ? `Still writing · ${done} of ${b.chapters.length} chapters` : "Not finished yet")
                      : null;
                    return (
                      <button key={b.id} type="button" disabled={!ok} aria-pressed={picked === b.id} onClick={() => setPicked(b.id)}
                        className={`flex flex-col gap-2 rounded-xl border p-2 text-left ${picked === b.id ? "border-foreground ring-1 ring-foreground" : "border-hairline"} ${ok ? "hover:border-hairline-2" : "cursor-not-allowed opacity-55"}`}>
                        <BookCover book={b} />
                        <span className="line-clamp-2 text-[13px] font-medium leading-snug">{b.title || "Untitled ebook"}</span>
                        <span className="text-[11.5px] text-muted">{tag ?? (b.actualPageCount > 0 ? `${b.actualPageCount} pages` : "Finished")}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </>
          ) : (
            <div className="flex flex-col gap-3 rounded-xl border border-hairline p-4">
              <label className="flex flex-col gap-1.5 text-sm font-medium">
                Product name
                <input className={controlBase} value={title} maxLength={200} placeholder="Bakery templates bundle"
                  onChange={(e) => setTitle(e.target.value)} />
              </label>
              <p className="text-xs leading-relaxed text-muted">
                Next you&apos;ll upload its files (PDF, EPUB or ZIP) and give each a name buyers understand. It stays
                hidden until it has a file.
              </p>
            </div>
          )}
        </section>

        <aside className="flex min-w-0 flex-[2_1_280px] flex-col gap-4 rounded-2xl bg-background p-5">
          <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-muted">You&apos;re adding</span>
          <div className="flex items-center gap-3">
            {source === "library" && book ? (
              <div className="w-12 shrink-0"><BookCover book={book} thumb /></div>
            ) : (
              <span aria-hidden className="flex h-[72px] w-12 shrink-0 items-center justify-center rounded border border-dashed border-hairline-2 text-[10px] text-faint">FILES</span>
            )}
            <div className="flex min-w-0 flex-col gap-0.5">
              <span className="font-display text-[19px] leading-tight">
                {source === "library" ? (book?.title || "Pick an ebook") : (title.trim() || "Your product")}
              </span>
              <span className="text-xs text-muted">
                {source === "library"
                  ? (book ? ["Ebook", book.actualPageCount > 0 ? `${book.actualPageCount} pages` : null, book.chapters.length ? `${book.chapters.length} chapters` : null].filter(Boolean).join(" · ") : "Finished ebooks only")
                  : "Your files · added next"}
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="ap-price" className="text-sm font-medium">Price</label>
            <div className="flex items-center gap-2">
              <span className="text-muted">$</span>
              <input id="ap-price" className={`${controlBase} w-28`} inputMode="decimal" value={price} onChange={(e) => setPrice(e.target.value)} />
              <span className="text-xs text-muted">USD · one-time</span>
            </div>
            <span className="text-xs text-faint">Change it anytime. Every buy button on your pages updates with it.</span>
          </div>

          <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-hairline p-3">
            <input type="checkbox" checked={featured} onChange={(e) => setFeatured(e.target.checked)} className="mt-0.5 h-4 w-4 accent-[var(--foreground)]" />
            <span className="flex flex-col gap-0.5">
              <span className="text-sm font-medium">Feature it on your store</span>
              <span className="text-xs text-muted">{lead ? `Replaces ${lead.title} as the lead product.` : "It becomes the lead product on your store."}</span>
            </span>
          </label>

          {error && <Alert>{error}</Alert>}
          <div className="mt-auto flex flex-col gap-2">
            <Button loading={busy} disabled={!canAdd} onClick={add} className="h-12">
              {source === "library" ? "Add to store" : "Create product"}{cents !== null ? ` · ${formatPrice(cents)}` : ""}
            </Button>
            <span className="text-xs leading-relaxed text-faint">
              {source === "library"
                ? "Next, its page opens in the editor so you can add a description and extras. Buyers see it after you publish."
                : "Next, its Files & price tab opens so you can upload what buyers get."}
            </span>
          </div>
        </aside>
      </div>
    </Dialog>
  );
}
