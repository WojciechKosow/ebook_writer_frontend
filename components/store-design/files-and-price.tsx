"use client";

import { useEffect, useRef, useState } from "react";
import { ApiError, storeApi } from "@/lib/api";
import type { ProductFile, StoreDashboard, StoreProduct } from "@/lib/types";
import { formatPrice } from "@/lib/pricing";
import { PRODUCT_FILE_ACCEPT, formatSize } from "@/lib/files";
import { DOWNLOAD_DAYS, DOWNLOAD_LIMIT, EBOOK_PDF_ID, fileName, fileNote } from "@/lib/store-design/product-page";
import { LibraryPicker, useLibraryNotice } from "@/components/asset-library";
import { StoreCover } from "@/components/store/store-cover";
import { storeAccepts } from "@/components/store/brand";
import { toCents } from "@/components/store/add-product";
import { AccountPerkChip, Chip, MoreMenu } from "@/components/store/kit";
import { Alert, Button } from "@/components/ui";

type Run = (fn: (onProgress: (p: number) => void) => Promise<StoreDashboard>) => Promise<boolean>;

const card = "flex flex-col gap-4 rounded-2xl border border-hairline bg-surface p-5 sm:p-6";
const h2 = "font-display text-[24px] font-normal leading-tight";

/**
 * Files & price: the price every button uses, the cover, and what buyers get —
 * the book and its extras, each with a name buyers understand, what it's for,
 * and whether it comes with a free account. Beside it: what buyers will see.
 * Names, notes, perks and the price are drafts; uploads are used right away.
 */
export function FilesAndPrice({ token, store, product, onChange, onSaving }: {
  token: string;
  store: StoreDashboard;
  product: StoreProduct;
  onChange: (s: StoreDashboard) => void;
  onSaving: (on: boolean) => void;
}) {
  const [progress, setProgress] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dropping, setDropping] = useState(false);
  const input = useRef<HTMLInputElement>(null);

  const run: Run = async (fn) => {
    onSaving(true);
    setError(null);
    setProgress(0);
    try {
      onChange(await fn(setProgress));
      return true;
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Could not save that change.");
      return false;
    } finally {
      onSaving(false);
      setProgress(null);
    }
  };

  const upload = (file: File | undefined) => {
    if (file) void run((p) => storeApi.uploadProductFile(token, product.id, file, p));
  };

  const book: ProductFile | null = product.ebookId ? {
    id: EBOOK_PDF_ID, filename: null, format: "PDF", sizeBytes: 0, version: 1, updatedAt: null,
    label: null, note: null, accountOnly: false, downloadsLeft: null, updated: false,
  } : null;
  const included = [...(book ? [book] : []), ...product.files];

  return (
    <div className="min-h-0 flex-1 overflow-y-auto bg-background">
      <div className="mx-auto flex max-w-[1180px] flex-wrap items-start gap-6 px-4 py-6 sm:px-6">
        <div className="flex min-w-0 flex-[3_1_520px] flex-col gap-5">
          <PriceCard key={product.priceCents} token={token} product={product} run={run} />

          <section className={card}>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="flex flex-col gap-1">
                <h2 className={h2}>What buyers get</h2>
                <span className="text-[13px] text-muted">Shown on the sales page as “What&apos;s included”, and as downloads after purchase.</span>
              </div>
              <Button variant="secondary" disabled={progress !== null} onClick={() => input.current?.click()}>+ Add extra</Button>
            </div>

            {book && (
              <div className="flex flex-wrap items-center gap-3 rounded-xl border border-hairline bg-background p-3.5">
                <FormatBadge format="PDF" />
                <div className="flex min-w-0 flex-1 flex-col">
                  <span className="text-sm font-semibold">The book — {product.title}</span>
                  <span className="text-xs text-muted">Always the latest version of your ebook{product.pageCount > 0 ? ` · ${product.pageCount} pages` : ""}</span>
                </div>
                <Chip tone="mute">Everyone</Chip>
              </div>
            )}

            {product.files.length > 0 && (
              <div className="flex flex-col gap-3">
                <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-muted">
                  {book ? "Extras" : "Files"} · {product.files.length}
                </span>
                {product.files.map((f) => (
                  <ExtraCard key={f.id} token={token} product={product} file={f} run={run} onSaving={onSaving} onChange={onChange} />
                ))}
              </div>
            )}

            <input ref={input} type="file" accept={PRODUCT_FILE_ACCEPT} className="hidden" aria-label="Add a file"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (input.current) input.current.value = "";
                upload(file);
              }} />
            <button type="button" onClick={() => input.current?.click()}
              onDragOver={(e) => {
                e.preventDefault();
                setDropping(true);
              }}
              onDragLeave={() => setDropping(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDropping(false);
                upload(e.dataTransfer.files?.[0]);
              }}
              className={`flex min-h-[72px] flex-col items-center justify-center gap-1 rounded-xl border border-dashed px-4 py-4 text-sm ${dropping ? "border-foreground bg-surface-2" : "border-hairline-2 text-muted hover:border-muted"}`}>
              {progress !== null ? `Uploading… ${progress}%` : `Drop a ZIP, PDF or EPUB here to add ${included.length ? "another extra" : "the first file"}`}
              <span className="text-xs text-faint">or click to choose · stored exactly as uploaded · private</span>
            </button>
            {error && <Alert>{error}</Alert>}
            <p className="text-xs leading-relaxed text-faint">
              Uploading or replacing a file takes effect right away: every buyer gets the new version, and buyers with an
              account see “Updated” in My purchases. Names, notes and perks wait for Publish changes.
            </p>
          </section>

          <CoverCard token={token} product={product} onChange={onChange} />
        </div>

        <BuyersWillSee store={store} product={product} included={included} />
      </div>
    </div>
  );
}

function FormatBadge({ format }: { format: string }) {
  return (
    <span className="flex h-11 w-9 shrink-0 items-end justify-center rounded-md bg-surface-2 pb-1.5 font-mono text-[10px] font-semibold text-foreground-2">{format}</span>
  );
}

// ---- Price ---------------------------------------------------------------------------

function PriceCard({ token, product, run }: { token: string; product: StoreProduct; run: Run }) {
  const [price, setPrice] = useState((product.priceCents / 100).toFixed(2));
  const [bad, setBad] = useState(false);

  async function save() {
    const cents = toCents(price);
    if (cents === null || cents < 50 || cents > 100000) {
      setBad(true);
      return;
    }
    setBad(false);
    if (cents !== product.priceCents) await run(() => storeApi.updateProduct(token, product.id, { priceCents: cents }));
  }

  return (
    <section className={card}>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h2 className={h2}>Price</h2>
          <span className="text-[13px] text-muted">Every buy button, the hero and the closing call to action use this number.</span>
        </div>
        <label className={`flex h-12 items-center gap-2 rounded-xl border bg-background px-4 ${bad ? "border-red-500" : "border-hairline-2"}`}>
          <span className="text-muted">$</span>
          <input aria-label="Price" inputMode="decimal" value={price} onChange={(e) => setPrice(e.target.value)} onBlur={save}
            onKeyDown={(e) => {
              if (e.key === "Enter") (e.target as HTMLInputElement).blur();
            }}
            className="w-24 bg-transparent text-lg font-semibold outline-none" />
          <span className="text-xs text-muted">USD · one-time</span>
        </label>
      </div>
      {bad && <span className="text-xs text-red-700 dark:text-red-400">Enter a price between $0.50 and $1,000, like 9.99.</span>}
      {product.liveActive && product.priceCents !== product.livePriceCents && (
        <span className="text-xs text-warn">Buyers pay {formatPrice(product.livePriceCents)} until you publish.</span>
      )}
    </section>
  );
}

// ---- One extra -------------------------------------------------------------------------

function ExtraCard({ token, product, file, run, onSaving, onChange }: {
  token: string; product: StoreProduct; file: ProductFile; run: Run;
  onSaving: (on: boolean) => void; onChange: (s: StoreDashboard) => void;
}) {
  const [label, setLabel] = useState(file.label ?? "");
  const [note, setNote] = useState(file.note ?? "");
  const [error, setError] = useState<string | null>(null);
  const replaceInput = useRef<HTMLInputElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pending = useRef<{ label?: string; note?: string }>({});

  async function save(input: { label?: string; note?: string; accountOnly?: boolean }) {
    onSaving(true);
    setError(null);
    try {
      onChange(await storeApi.updateProductFile(token, product.id, file.id, input));
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Could not save.");
    } finally {
      onSaving(false);
    }
  }

  function flush() {
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
    const p = pending.current;
    pending.current = {};
    if (p.label !== undefined || p.note !== undefined) void save(p);
  }

  function edit(k: "label" | "note", v: string) {
    if (k === "label") setLabel(v);
    else setNote(v);
    pending.current = { ...pending.current, [k]: v };
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(flush, 900);
  }

  const flushRef = useRef(flush);
  useEffect(() => {
    flushRef.current = flush;
  });
  useEffect(() => () => flushRef.current(), []);

  const replaced = file.version > 1 && file.updatedAt
    ? ` · version ${file.version} · replaced ${new Date(file.updatedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}`
    : "";
  const id = `x-${file.id}`;

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-hairline bg-background p-4">
      <div className="flex items-start gap-3">
        <FormatBadge format={file.format} />
        <div className="grid min-w-0 flex-1 gap-3 sm:grid-cols-2">
          <label htmlFor={`${id}-n`} className="flex flex-col gap-1.5 text-[13px] font-medium">
            Name buyers see
            <input id={`${id}-n`} value={label} maxLength={120} placeholder={file.filename ?? ""} onChange={(e) => edit("label", e.target.value)} onBlur={flush}
              className="h-10 rounded-lg border border-hairline-2 bg-surface px-3 text-sm font-normal outline-none focus:border-foreground" />
          </label>
          <label htmlFor={`${id}-d`} className="flex flex-col gap-1.5 text-[13px] font-medium">
            What it&apos;s for
            <input id={`${id}-d`} value={note} maxLength={300} placeholder={fileNote({ ...file, note: null })} onChange={(e) => edit("note", e.target.value)} onBlur={flush}
              className="h-10 rounded-lg border border-hairline-2 bg-surface px-3 text-sm font-normal outline-none focus:border-foreground" />
          </label>
        </div>
        <MoreMenu label={`More for ${fileName(file)}`} items={[
          { label: "Replace file…", onSelect: () => replaceInput.current?.click() },
          "sep",
          {
            label: "Remove…", danger: true, onSelect: () => {
              if (window.confirm(`Remove ${fileName(file)}? Buyers won't get it any more.`)) {
                void run(() => storeApi.removeProductFile(token, product.id, file.id));
              }
            },
          },
        ]} />
      </div>
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 pl-12 text-xs text-muted">
        <span className="break-all">{file.filename}{formatSize(file.sizeBytes) ? ` · ${formatSize(file.sizeBytes)}` : ""}{replaced}</span>
        <button type="button" onClick={() => replaceInput.current?.click()} className="font-medium text-foreground underline decoration-hairline-2 underline-offset-4">
          Replace file
        </button>
        <input ref={replaceInput} type="file" accept={PRODUCT_FILE_ACCEPT} className="hidden" aria-label={`Replace ${fileName(file)}`}
          onChange={(e) => {
            const next = e.target.files?.[0];
            if (replaceInput.current) replaceInput.current.value = "";
            if (next) void run((p) => storeApi.replaceProductFile(token, product.id, file.id, next, p));
          }} />
      </div>
      <label className="ml-12 flex cursor-pointer items-start gap-3 rounded-lg border border-hairline px-3 py-2.5">
        <input type="checkbox" checked={file.accountOnly} onChange={(e) => void save({ accountOnly: e.target.checked })}
          className="mt-0.5 h-4 w-4 accent-[var(--foreground)]" />
        <span className="text-[13px] leading-snug">
          <b>Account perk</b> —{" "}
          {file.accountOnly
            ? "only buyers with a free Scrivetta account get this file, in My purchases. Guests see it as “comes with a free account”."
            : "off: every buyer gets this file, with or without an account."}
        </span>
      </label>
      {error && <span className="text-xs text-red-700 dark:text-red-400">{error}</span>}
    </div>
  );
}

// ---- Cover ---------------------------------------------------------------------------

function CoverCard({ token, product, onChange }: { token: string; product: StoreProduct; onChange: (s: StoreDashboard) => void }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [libraryOpen, setLibraryOpen] = useState(false);
  const { notice, afterUpload } = useLibraryNotice();
  const input = useRef<HTMLInputElement>(null);

  async function run(fn: () => Promise<StoreDashboard>, uploaded = false) {
    setBusy(true);
    setError(null);
    try {
      onChange(await fn());
      if (uploaded) afterUpload();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Could not update the cover.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className={card}>
      <div className="flex flex-wrap items-center gap-4">
        <div className="w-14 shrink-0"><StoreCover coverUrl={product.coverUrl} title={product.title} className="shadow-none" /></div>
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <h2 className={h2}>Cover</h2>
          <span className="text-xs text-muted">
            {product.customCover ? "Your own cover." : product.ebookId ? "The first page of your ebook." : "No cover yet."}{" "}
            PNG, JPG or WebP · up to 3 MB · used right away · not part of the download
          </span>
          {error && <span className="text-xs text-red-600 dark:text-red-400">{error}</span>}
        </div>
        <input ref={input} type="file" accept="image/png,image/jpeg,image/webp" className="hidden" aria-label="Upload cover"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (input.current) input.current.value = "";
            if (file) void run(() => storeApi.uploadProductCover(token, product.id, file), true);
          }} />
        <div className="flex gap-2">
          <Button variant="secondary" loading={busy} onClick={() => input.current?.click()}>{product.customCover ? "Replace" : "Upload"}</Button>
          <Button variant="ghost" disabled={busy} onClick={() => setLibraryOpen(true)}>From library</Button>
          {product.customCover && <Button variant="ghost" disabled={busy} onClick={() => run(() => storeApi.removeProductCover(token, product.id))}>Remove</Button>}
        </div>
      </div>
      {libraryOpen && (
        <LibraryPicker title="Pick a cover" accepts={storeAccepts}
          onPick={async (asset) => onChange(await storeApi.useLibraryProductCover(token, product.id, asset.id))}
          onClose={() => setLibraryOpen(false)} />
      )}
      {notice}
    </section>
  );
}

// ---- What buyers will see -------------------------------------------------------------

function BuyersWillSee({ store, product, included }: { store: StoreDashboard; product: StoreProduct; included: ProductFile[] }) {
  const forAll = included.filter((f) => !f.accountOnly);
  const perks = included.filter((f) => f.accountOnly);
  return (
    <aside className="flex min-w-0 flex-[2_1_320px] flex-col gap-4 lg:sticky lg:top-6">
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm font-semibold">Buyers will see</span>
        {store.published && product.liveActive && (
          <a href={`/store/${store.slug}/${product.id}`} target="_blank" rel="noopener noreferrer" className="text-xs underline underline-offset-4">Open live page ↗</a>
        )}
      </div>
      <div className="flex flex-col gap-3 rounded-2xl border border-hairline bg-surface p-5">
        <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-muted">What&apos;s included</span>
        <span className="font-display text-[22px] leading-tight">Everything you get for {formatPrice(product.priceCents)}</span>
        {included.length === 0 ? (
          <p className="text-sm text-muted">Nothing yet — add a file so buyers get something. Until then the product stays hidden.</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {included.map((f) => (
              <li key={f.id} className="flex items-center gap-3 text-sm">
                <span className="w-11 shrink-0 font-mono text-[10.5px] font-semibold text-muted">{f.format}</span>
                <span className="min-w-0 flex-1"><b className="font-semibold">{fileName(f)}</b> · <span className="text-muted">{fileNote(f, product.pageCount)}</span></span>
                {f.accountOnly && <AccountPerkChip />}
              </li>
            ))}
          </ul>
        )}
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-2 rounded-2xl border border-hairline bg-surface p-4 text-[13px] leading-relaxed">
          <span className="font-semibold">Guest</span>
          <ul className="flex flex-col gap-1 text-muted">
            {forAll.map((f) => <li key={f.id}>{fileName(f)}</li>)}
            <li>Link for {DOWNLOAD_DAYS} days</li>
            <li>{DOWNLOAD_LIMIT} downloads per file</li>
          </ul>
        </div>
        <div className="flex flex-col gap-2 rounded-2xl border border-foreground/20 bg-surface p-4 text-[13px] leading-relaxed">
          <span className="font-semibold">Free account</span>
          <ul className="flex flex-col gap-1 text-muted">
            <li>Everything a guest gets</li>
            {perks.map((f) => <li key={f.id}>+ {fileName(f)}</li>)}
            <li>+ New versions when you update files</li>
            <li>+ Yours for good, unlimited downloads</li>
          </ul>
        </div>
      </div>
      <p className="text-xs leading-relaxed text-faint">
        These lists also write the “account” line under the buy button and the “Keep it for good” box after purchase.
      </p>
    </aside>
  );
}
