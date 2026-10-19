"use client";

import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { ApiError, apiAsset, ebookApi, storeApi } from "@/lib/api";
import type { EbookStatusResponse, StoreDashboard } from "@/lib/types";
import { draftStatus, publishBlocker, storeAddress } from "@/lib/store/changes";
import { parseDesign } from "@/lib/store-design/core";
import { STYLES } from "@/lib/store-design/schemas";
import { BookCover } from "@/components/library/book-cover";
import { AddProductDialog } from "@/components/store/add-product";
import { BrandCard, BrandDialog } from "@/components/store/brand";
import { Dialog, DialogHeader, DraftDot, MoreMenu, StoreStateChip, useCopy } from "@/components/store/kit";
import { PaymentsSummary, StripeStep } from "@/components/store/payments";
import { ProductList } from "@/components/store/products";
import { PublishChanges } from "@/components/store/publish";
import { Alert, Button, ButtonLink, Spinner } from "@/components/ui";

function message(e: unknown, fallback: string) {
  return e instanceof ApiError ? e.message : fallback;
}

/**
 * Your store, in three states: the first run (name + address, nothing else),
 * the setup checklist while the store is a draft, and the live store. Every
 * edit here saves as a draft; "Publish changes" is the only way it reaches
 * buyers.
 */
function StoreInner() {
  const { token } = useAuth();
  const router = useRouter();
  const params = useSearchParams();
  const stripeReturn = params.get("stripe");

  const [store, setStore] = useState<StoreDashboard | null>(null);
  const [ebooks, setEbooks] = useState<EbookStatusResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSavingCount] = useState(0);
  const [adding, setAdding] = useState(false);
  const [brand, setBrand] = useState(false);
  const handledReturn = useRef(false);

  const onSaving = useCallback((on: boolean) => setSavingCount((n) => Math.max(0, n + (on ? 1 : -1))), []);

  useEffect(() => {
    if (!token) return;
    Promise.all([storeApi.get(token), ebookApi.list(token)])
      .then(([s, list]) => {
        setStore(s);
        setEbooks(list);
      })
      .catch((e) => setError(message(e, "Could not load your store.")))
      .finally(() => setLoading(false));
  }, [token]);

  // Back from Stripe: "return" → re-fetch the account server-side (never assume
  // ready); "refresh" → the link expired, so open a fresh one.
  useEffect(() => {
    if (!token || !stripeReturn || handledReturn.current) return;
    handledReturn.current = true;
    (async () => {
      try {
        if (stripeReturn === "refresh") {
          const { url } = await storeApi.connectStripe(token);
          window.location.assign(url);
          return;
        }
        setStore(await storeApi.syncStripe(token));
      } catch (e) {
        setError(message(e, "Could not check your Stripe account."));
      } finally {
        router.replace("/store");
      }
    })();
  }, [token, stripeReturn, router]);

  if (loading) {
    return (
      <div className="flex justify-center py-16 text-ink-soft">
        <Spinner />
      </div>
    );
  }

  if (!store) {
    return <FirstRun token={token!} ebooks={ebooks} error={error} onCreated={setStore} />;
  }

  const finished = ebooks.filter((e) => e.status === "COMPLETED" && e.downloadReady);

  return (
    <div className="mx-auto flex max-w-[1040px] flex-col gap-8 pb-20 sm:pb-0">
      {error && <Alert>{error}</Alert>}
      <StoreHeader token={token!} store={store} saving={saving > 0} onChange={setStore} onBrand={() => setBrand(true)} />

      {!store.published && (
        <SetupChecklist token={token!} store={store} onChange={setStore} onAdd={() => setAdding(true)} onBrand={() => setBrand(true)} />
      )}

      <ProductList token={token!} store={store} onChange={setStore} onSaving={onSaving} onAdd={() => setAdding(true)} />

      <div className="grid gap-4 md:grid-cols-2">
        <BrandCard store={store} onEdit={() => setBrand(true)} />
        <DesignCard store={store} />
      </div>

      {store.published && <PaymentsSummary token={token!} store={store} onChange={setStore} />}

      {adding && (
        <AddProductDialog open token={token!} store={store} ebooks={ebooks} onClose={() => setAdding(false)}
          onAdded={(s, id, own) => {
            setStore(s);
            setAdding(false);
            if (id) router.push(`/store/products/${id}/design${own ? "?tab=files" : ""}`);
          }} />
      )}
      {brand && (
        <BrandDialog open token={token!} store={store} onChange={setStore} onSaving={onSaving} onClose={() => setBrand(false)} />
      )}
      {finished.length === 0 && store.products.length === 0 && (
        <p className="text-sm text-muted">
          No finished ebook yet? <Link href="/ebooks/new" className="font-medium underline underline-offset-4">Write one</Link> — or add
          your own files as a product.
        </p>
      )}
    </div>
  );
}

// ---- First run ----------------------------------------------------------------------

function slugify(name: string): string {
  return name.toLowerCase().normalize("NFKD").replace(/[̀-ͯ]/g, "")
    .replace(/['’]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 40).replace(/-+$/, "");
}

const NEXT_STEPS: [string, string][] = [
  ["Connect Stripe", "So buyers can pay you."],
  ["Add your first product", "Pick an ebook, set a price."],
  ["Add your brand", "Logo, headline, a few words about you."],
  ["Choose a look", "5 themes, live preview."],
  ["Publish", "Get your link for your bio."],
];

function FirstRun({ token, ebooks, error: loadError, onCreated }: {
  token: string; ebooks: EbookStatusResponse[]; error: string | null; onCreated: (s: StoreDashboard) => void;
}) {
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [slugEdited, setSlugEdited] = useState(false);
  const [check, setCheck] = useState<{ slug: string; available: boolean; message: string | null } | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const finished = ebooks.filter((e) => e.status === "COMPLETED" && e.downloadReady);
  const address = slugEdited ? slug : slugify(name);

  // Is the address free? Checked as the author types (debounced).
  useEffect(() => {
    if (address.length < 3) return;
    const id = setTimeout(() => {
      storeApi.slugAvailable(token, address)
        .then((r) => setCheck({ slug: address, ...r }))
        .catch(() => setCheck(null));
    }, 350);
    return () => clearTimeout(id);
  }, [address, token]);
  const status = address.length < 3 ? null : check?.slug === address ? check : undefined;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setFieldErrors({});
    try {
      onCreated(await storeApi.create(token, { name: name.trim(), slug: address }));
    } catch (err) {
      if (err instanceof ApiError && err.fieldErrors) setFieldErrors(err.fieldErrors);
      setError(message(err, "Could not open your store."));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto flex max-w-[1040px] flex-wrap items-start gap-10 py-4">
      <section className="flex min-w-0 flex-[3_1_440px] flex-col gap-7">
        <div className="flex flex-col gap-3">
          <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-muted">Your store</span>
          <h1 className="font-display text-[38px] font-light leading-[1.05] tracking-[-0.02em] sm:text-[46px]">
            Sell your books from a page that looks like <em>yours</em>.
          </h1>
          <p className="max-w-[520px] text-[15px] leading-relaxed text-muted">
            Buyers pay you directly through your own Stripe account. Scrivetta takes no commission.
          </p>
        </div>
        {loadError && <Alert>{loadError}</Alert>}
        <form onSubmit={submit} className="flex flex-col gap-5 rounded-2xl border border-hairline bg-surface p-6 sm:p-7">
          <div className="flex flex-col gap-2">
            <label htmlFor="store-name" className="text-sm font-medium">Store name</label>
            <input id="store-name" required maxLength={80} value={name} onChange={(e) => setName(e.target.value)}
              placeholder="Jane's Kitchen"
              className="h-12 rounded-xl border border-hairline-2 bg-background px-3.5 text-[15px] outline-none focus:border-foreground" />
            {fieldErrors.name && <span className="text-xs text-red-700 dark:text-red-400">{fieldErrors.name}</span>}
          </div>
          <div className="flex flex-col gap-2">
            <label htmlFor="store-slug" className="text-sm font-medium">Store address</label>
            <div className="flex h-12 items-center overflow-hidden rounded-xl border border-hairline-2 bg-background focus-within:border-foreground">
              <span className="whitespace-nowrap pl-3.5 pr-0.5 text-[15px] text-muted">scrivetta.com/store/</span>
              <input id="store-slug" required maxLength={40} value={address}
                onChange={(e) => {
                  setSlugEdited(true);
                  setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""));
                }}
                className="h-full min-w-0 flex-1 bg-transparent text-[15px] font-medium outline-none" />
              {status && (
                <span className={`whitespace-nowrap px-3.5 text-[13px] ${status.available ? "text-good" : "text-red-700 dark:text-red-400"}`}>
                  {status.available ? "✓ Available" : "Not available"}
                </span>
              )}
            </div>
            <span className="text-xs text-muted">
              {status && !status.available && status.message
                ? status.message
                : fieldErrors.slug || "Made from your store name. This is the link you'll put in your bio."}
            </span>
          </div>
          {error && <Alert>{error}</Alert>}
          <div className="flex flex-wrap items-center gap-4 pt-1">
            <Button type="submit" loading={busy} disabled={!name.trim() || address.length < 3 || status?.available === false} className="h-12 px-6">
              Open my store →
            </Button>
            <span className="text-xs text-muted">Nothing is public until you publish. You can rename it later.</span>
          </div>
        </form>
      </section>

      <aside className="flex min-w-0 flex-[2_1_300px] flex-col gap-5">
        {finished.length > 0 && (
          <>
            <div className="flex items-end pl-2 pt-2">
              {finished.slice(0, 3).map((b, i) => (
                <div key={b.id} className="w-[92px] shrink-0" style={{ transform: `rotate(${[-4, 5, -2][i]}deg)`, marginLeft: i ? -16 : 0 }}>
                  <BookCover book={b} />
                </div>
              ))}
            </div>
            <div className="flex flex-col gap-1">
              <span className="font-semibold">{finished.length} finished ebook{finished.length === 1 ? " is" : "s are"} ready to sell</span>
              <span className="text-[13px] text-muted">{finished.slice(0, 3).map((b) => b.title || "Untitled").join(" · ")}</span>
            </div>
          </>
        )}
        <div className="flex flex-col">
          <span className="pb-2 font-mono text-[11px] uppercase tracking-[0.12em] text-muted">After this — 5 short steps</span>
          <ol>
            {NEXT_STEPS.map(([t, h], i) => (
              <li key={t} className={`flex items-start gap-3.5 border-t border-hairline py-3.5 ${i === NEXT_STEPS.length - 1 ? "border-b" : ""}`}>
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-hairline-2 font-mono text-xs text-muted">{i + 1}</span>
                <span className="flex flex-col"><span className="text-sm font-semibold">{t}</span><span className="text-xs text-muted">{h}</span></span>
              </li>
            ))}
          </ol>
        </div>
      </aside>
    </div>
  );
}

// ---- Header -------------------------------------------------------------------------

function StoreHeader({ token, store, saving, onChange, onBrand }: {
  token: string; store: StoreDashboard; saving: boolean; onChange: (s: StoreDashboard) => void; onBrand: () => void;
}) {
  const { copied, copy } = useCopy();
  const [unpublishing, setUnpublishing] = useState(false);
  const { path, shown } = storeAddress(store.slug);
  const logo = apiAsset(store.logoUrl);
  const status = draftStatus(store, saving);

  return (
    <header className="flex flex-col gap-4">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex min-w-0 items-center gap-4">
          {logo && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={logo} alt="" className="h-14 w-14 shrink-0 rounded-2xl object-cover" />
          )}
          <div className="flex min-w-0 flex-col gap-1.5">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="font-display text-[34px] font-light leading-[1.05] tracking-[-0.02em] sm:text-[40px]">{store.name}</h1>
              <StoreStateChip published={store.published} />
            </div>
            {store.published ? (
              <DraftDot {...status} />
            ) : (
              <span className="text-[13px] text-muted">{shown} · only you can see it for now</span>
            )}
          </div>
        </div>
        {store.published ? (
          <div className="hidden sm:block"><PublishChanges token={token} store={store} onChange={onChange} /></div>
        ) : (
          <ButtonLink href="/store/design" variant="secondary">Preview store</ButtonLink>
        )}
      </div>

      {store.published && (
        <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-hairline bg-surface p-2 pl-4">
          <span className="w-full min-w-0 truncate py-1 text-sm text-foreground-2 sm:w-auto sm:flex-1">{shown}</span>
          <Button variant="secondary" onClick={() => copy(`${window.location.origin}${path}`)}>{copied ? "Copied" : "Copy link for your bio"}</Button>
          <a href={path} target="_blank" rel="noopener noreferrer"
            className="inline-flex h-10 items-center rounded-xl border border-hairline-2 bg-surface px-4 text-sm font-semibold hover:border-muted">View store ↗</a>
          <MoreMenu label="More store actions" items={[
            { label: "Rename or edit brand…", onSelect: onBrand },
            "sep",
            { label: "Unpublish store…", danger: true, onSelect: () => setUnpublishing(true) },
          ]} />
        </div>
      )}
      {store.published && status.tone !== "live" && (
        // Phone: Publish stays in thumb reach.
        <div className="fixed inset-x-0 bottom-0 z-30 flex items-center justify-between gap-3 border-t border-hairline bg-surface px-4 py-3 sm:hidden">
          <DraftDot {...status} />
          <PublishChanges token={token} store={store} onChange={onChange} />
        </div>
      )}
      <UnpublishDialog open={unpublishing} token={token} store={store} onChange={onChange} onClose={() => setUnpublishing(false)} />
    </header>
  );
}

function UnpublishDialog({ open, token, store, onChange, onClose }: {
  open: boolean; token: string; store: StoreDashboard; onChange: (s: StoreDashboard) => void; onClose: () => void;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  return (
    <Dialog open={open} onClose={onClose} labelledBy="unpublish-title">
      <DialogHeader id="unpublish-title" title={`Unpublish ${store.name}?`} onClose={onClose} />
      <div className="flex flex-col gap-4 px-6 pb-6">
        <p className="text-sm leading-relaxed text-muted">
          Your store and product pages go offline and nobody can buy. Buyers keep their downloads. Your draft stays, and
          you can publish again anytime.
        </p>
        {error && <Alert>{error}</Alert>}
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={onClose}>Keep it live</Button>
          <Button loading={busy} className="!bg-red-700 !text-white" onClick={async () => {
            setBusy(true);
            setError(null);
            try {
              onChange(await storeApi.unpublish(token));
              onClose();
            } catch (e) {
              setError(message(e, "Could not unpublish the store."));
            } finally {
              setBusy(false);
            }
          }}>Unpublish</Button>
        </div>
      </div>
    </Dialog>
  );
}

// ---- Setup checklist (draft store) ------------------------------------------------------

function SetupChecklist({ token, store, onChange, onAdd, onBrand }: {
  token: string; store: StoreDashboard; onChange: (s: StoreDashboard) => void; onAdd: () => void; onBrand: () => void;
}) {
  const stripe = store.stripe.state === "READY";
  const product = store.products.some((p) => p.active && p.deliverable);
  const brand = !!store.headline && !!(store.description || store.authorName);
  const steps = [
    { done: true, title: "Open your store" },
    { done: stripe, title: "Connect Stripe so buyers can pay you" },
    { done: product, title: "Add your first product", hint: "Pick a finished ebook and set a price." },
    { done: brand, title: "Add your brand", hint: "Logo, headline, a photo and a few words about you." },
    { done: false, title: "Choose a look, then publish", hint: "Publishing unlocks once Stripe is connected and one product is added." },
  ];
  const done = steps.filter((s) => s.done).length;
  // The first open step is the one to do now; Stripe stays first until it's ready.
  const current = steps.findIndex((s) => !s.done);
  const blocker = publishBlocker(store);

  return (
    <section className="flex flex-col gap-1 rounded-2xl border border-hairline bg-surface p-5 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3">
        <div className="flex items-baseline gap-3">
          <h2 className="font-display text-[26px] font-normal leading-tight">Set up your store</h2>
          <span className="text-sm text-muted">{done} of {steps.length} done</span>
        </div>
        <div aria-hidden className="flex gap-1">
          {steps.map((s, i) => <span key={i} className={`h-1.5 w-8 rounded-full ${s.done ? "bg-good" : "bg-hairline-2"}`} />)}
        </div>
      </div>
      {!store.pro && (
        <div className="pb-3">
          <Alert variant="info">
            Opening a store and selling need Scrivetta PRO. You can set everything up first.{" "}
            <Link href="/billing" className="font-semibold underline">Upgrade</Link>
          </Alert>
        </div>
      )}
      <ol className="flex flex-col">
        {steps.map((s, i) => {
          const open = i === current;
          return (
            <li key={s.title} className={`flex gap-4 border-t border-hairline py-4 ${open ? "rounded-xl border-transparent bg-background px-4" : ""}`}>
              <span aria-hidden className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${s.done ? "bg-good-soft text-good" : open ? "bg-foreground text-background" : "border border-hairline-2 text-muted"}`}>
                {s.done ? "✓" : i + 1}
              </span>
              <div className="flex min-w-0 flex-1 flex-col gap-3">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex flex-col gap-0.5">
                    <span className={`text-[15px] ${s.done ? "text-muted line-through decoration-hairline-2" : "font-semibold"}`}>{s.title}</span>
                    {!s.done && s.hint && <span className="text-xs text-muted">{s.hint}</span>}
                    <span className="sr-only">{s.done ? "done" : "to do"}</span>
                  </div>
                  {!open && !s.done && i === 2 && <TertiaryButton onClick={onAdd}>Add product</TertiaryButton>}
                  {!open && !s.done && i === 3 && <TertiaryButton onClick={onBrand}>Add brand</TertiaryButton>}
                  {!open && i === 4 && (
                    <span className="inline-flex items-center gap-1.5 text-xs text-faint">
                      <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden><rect x="3" y="7" width="10" height="7" rx="1.5" /><path d="M5.5 7V5a2.5 2.5 0 015 0v2" /></svg>
                      Publish
                    </span>
                  )}
                </div>
                {open && i === 1 && <StripeStep token={token} store={store} onChange={onChange} />}
                {open && i === 2 && <div><Button onClick={onAdd} className="h-11 px-5">+ Add product</Button></div>}
                {open && i === 3 && <div><Button onClick={onBrand} className="h-11 px-5">Add brand</Button></div>}
                {open && i === 4 && (
                  <div className="flex flex-wrap items-center gap-3">
                    <ButtonLink href="/store/design" variant="secondary">Choose a look</ButtonLink>
                    <PublishChanges token={token} store={store} onChange={onChange} />
                    {blocker && <span className="text-xs text-muted">{blocker}</span>}
                  </div>
                )}
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
}

function TertiaryButton({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  return (
    <button type="button" onClick={onClick}
      className="text-sm font-medium underline decoration-hairline-2 underline-offset-4 hover:decoration-foreground">
      {children}
    </button>
  );
}

// ---- Design summary -------------------------------------------------------------------

function DesignCard({ store }: { store: StoreDashboard }) {
  const design = parseDesign(store.themeSettings);
  const style = STYLES[design.active];
  const accent = design.themes[design.active]?.accent ?? style.accents[0];
  return (
    <div className="flex min-w-0 flex-col gap-4 rounded-2xl border border-hairline bg-surface p-5">
      <div className="flex items-center justify-between gap-3">
        <h3 className="font-display text-[22px] font-normal">Design</h3>
        <ButtonLink href="/store/design" variant="secondary">Open designer</ButtonLink>
      </div>
      <div aria-hidden className="flex h-24 items-end gap-3 overflow-hidden rounded-xl p-4" style={{ background: style.swatch.bg, color: style.swatch.fg }}>
        <span className="text-[22px] leading-none" style={{ fontFamily: style.swatch.font }}>{style.swatch.sample}</span>
        <span className="ml-auto h-6 w-6 rounded-full" style={{ background: accent }} />
      </div>
      <span className="text-sm">
        <b className="font-semibold">{style.name} theme</b> <span className="text-muted">· {style.tagline}</span>
      </span>
    </div>
  );
}

export default function StorePage() {
  return (
    <Suspense fallback={<div className="py-10 text-center text-faint">…</div>}>
      <StoreInner />
    </Suspense>
  );
}
