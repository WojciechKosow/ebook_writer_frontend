"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { ApiError, ebookApi, storeApi } from "@/lib/api";
import { formatPrice } from "@/lib/pricing";
import type { EbookStatusResponse, StoreDashboard, StoreProduct } from "@/lib/types";
import { Alert, Button, Field, Spinner, TextAreaField, controlBase } from "@/components/ui";

const card = "mt-6 rounded-2xl border border-hairline bg-surface p-6";
const h2 = "font-display text-[22px] font-normal leading-tight text-foreground";

// Countries offered for a new Stripe account (it can't change afterwards).
// English-speaking markets first; Stripe validates the code.
const COUNTRIES: [string, string][] = [
  ["US", "United States"],
  ["GB", "United Kingdom"],
  ["CA", "Canada"],
  ["AU", "Australia"],
  ["NZ", "New Zealand"],
  ["IE", "Ireland"],
  ["DE", "Germany"],
  ["FR", "France"],
  ["ES", "Spain"],
  ["IT", "Italy"],
  ["NL", "Netherlands"],
  ["PL", "Poland"],
  ["SE", "Sweden"],
  ["SG", "Singapore"],
];

function message(e: unknown, fallback: string) {
  return e instanceof ApiError ? e.message : fallback;
}

/** "12.99" → 1299; null when not a valid amount. */
function toCents(value: string): number | null {
  const v = value.trim().replace(/^\$/, "");
  if (!/^\d+(\.\d{1,2})?$/.test(v)) return null;
  return Math.round(parseFloat(v) * 100);
}

function StoreInner() {
  const { token } = useAuth();
  const router = useRouter();
  const params = useSearchParams();
  const stripeReturn = params.get("stripe");

  const [store, setStore] = useState<StoreDashboard | null>(null);
  const [ebooks, setEbooks] = useState<EbookStatusResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const handledReturn = useRef(false);

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

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="font-display text-[34px] font-light leading-[1.05] tracking-[-0.02em] text-foreground sm:text-[40px]">
        Your store
      </h1>
      <p className="mt-2 text-sm text-muted">
        Sell your ebooks from your own page. Buyers pay you directly through your Stripe account — Scrivetta
        takes no commission.
      </p>
      {error && (
        <div className="mt-4">
          <Alert>{error}</Alert>
        </div>
      )}

      {!store ? (
        <CreateStore token={token!} onCreated={setStore} />
      ) : (
        <>
          <StoreSettings token={token!} store={store} onChange={setStore} />
          <StripeCard token={token!} store={store} />
          <Products token={token!} store={store} ebooks={ebooks} onChange={setStore} />
        </>
      )}
    </div>
  );
}

// ---- Create ------------------------------------------------------------------

function CreateStore({ token, onCreated }: { token: string; onCreated: (s: StoreDashboard) => void }) {
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setFieldErrors({});
    try {
      onCreated(await storeApi.create(token, { name: name.trim(), slug: slug.trim() }));
    } catch (err) {
      if (err instanceof ApiError && err.fieldErrors) setFieldErrors(err.fieldErrors);
      setError(message(err, "Could not create your store."));
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className={card}>
      <h2 className={h2}>Create your store</h2>
      <div className="mt-4 flex flex-col gap-4">
        <Field label="Store name" name="name" value={name} maxLength={80} required
          onChange={(e) => setName(e.target.value)} error={fieldErrors.name} />
        <Field label="Store address" name="slug" value={slug} maxLength={40} required
          placeholder="your-name"
          onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
          error={fieldErrors.slug} />
        <p className="-mt-2 text-xs text-faint">scrivetta.com/store/{slug || "your-name"}</p>
        {error && <Alert>{error}</Alert>}
        <div>
          <Button type="submit" loading={busy}>Create store</Button>
        </div>
      </div>
    </form>
  );
}

// ---- Settings + publish ------------------------------------------------------

function StoreSettings({ token, store, onChange }: {
  token: string; store: StoreDashboard; onChange: (s: StoreDashboard) => void;
}) {
  const [name, setName] = useState(store.name);
  const [description, setDescription] = useState(store.description ?? "");
  const [busy, setBusy] = useState<"save" | "publish" | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function save() {
    setBusy("save");
    setError(null);
    try {
      onChange(await storeApi.update(token, { name: name.trim(), description }));
    } catch (e) {
      setError(message(e, "Could not save."));
    } finally {
      setBusy(null);
    }
  }

  async function togglePublish() {
    setBusy("publish");
    setError(null);
    try {
      onChange(store.published ? await storeApi.unpublish(token) : await storeApi.publish(token));
    } catch (e) {
      setError(message(e, "Could not change the store's visibility."));
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className={card}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className={h2}>Store</h2>
          <p className="mt-1 text-sm text-muted">
            {store.published ? (
              <>
                Live at{" "}
                <Link href={`/store/${store.slug}`} className="font-medium text-accent hover:underline">
                  /store/{store.slug}
                </Link>
              </>
            ) : (
              <>Not published — only you can see this.</>
            )}
          </p>
        </div>
        <Button variant={store.published ? "secondary" : "primary"} loading={busy === "publish"}
          disabled={!store.published && !store.pro} onClick={togglePublish}>
          {store.published ? "Unpublish" : "Publish store"}
        </Button>
      </div>
      {!store.pro && (
        <div className="mt-4">
          <Alert variant="info">
            Publishing and selling require Scrivetta PRO.{" "}
            <Link href="/billing" className="font-semibold underline">Upgrade</Link>
          </Alert>
        </div>
      )}
      <div className="mt-5 flex flex-col gap-4">
        <Field label="Store name" name="storeName" value={name} maxLength={80}
          onChange={(e) => setName(e.target.value)} />
        <TextAreaField label="About" name="storeDescription" value={description} maxLength={2000}
          hint="A few words buyers see at the top of your store." onChange={(e) => setDescription(e.target.value)} />
        {error && <Alert>{error}</Alert>}
        <div>
          <Button variant="secondary" loading={busy === "save"} disabled={!name.trim()} onClick={save}>
            Save
          </Button>
        </div>
      </div>
    </div>
  );
}

// ---- Stripe status -----------------------------------------------------------

function StripeCard({ token, store }: { token: string; store: StoreDashboard }) {
  const [country, setCountry] = useState("US");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { state, currentlyDue } = store.stripe;

  async function openStripe() {
    setBusy(true);
    setError(null);
    try {
      const { url } = await storeApi.connectStripe(token, state === "NOT_CONNECTED" ? country : undefined);
      window.location.assign(url);
    } catch (e) {
      setError(message(e, "Could not open Stripe."));
      setBusy(false);
    }
  }

  return (
    <div className={card}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className={h2}>Payments</h2>
        <StatusPill state={state} />
      </div>

      {state === "NOT_CONNECTED" && (
        <>
          <p className="mt-2 text-sm text-muted">
            Connect a Stripe account to get paid. Buyers pay you directly; refunds, disputes and payouts are
            handled in your own Stripe Dashboard.
          </p>
          <div className="mt-4 flex flex-wrap items-end gap-3">
            <label className="flex flex-col gap-1.5 text-sm font-medium text-foreground-2">
              Country of your business
              <select className={controlBase} value={country} onChange={(e) => setCountry(e.target.value)}>
                {COUNTRIES.map(([code, label]) => (
                  <option key={code} value={code}>{label}</option>
                ))}
              </select>
            </label>
            <Button loading={busy} onClick={openStripe}>Connect Stripe</Button>
          </div>
        </>
      )}

      {state === "ACTION_REQUIRED" && (
        <>
          <p className="mt-2 text-sm text-muted">
            Stripe needs more information before you can accept payments
            {currentlyDue.length > 0 ? ` (${currentlyDue.length} item${currentlyDue.length === 1 ? "" : "s"} due)` : ""}.
          </p>
          <div className="mt-4">
            <Button loading={busy} onClick={openStripe}>Continue in Stripe</Button>
          </div>
        </>
      )}

      {state === "READY" && (
        <p className="mt-2 text-sm text-muted">
          Your Stripe account can accept payments. Manage refunds and payouts in your{" "}
          <a href="https://dashboard.stripe.com" target="_blank" rel="noopener noreferrer"
            className="font-medium text-accent hover:underline">Stripe Dashboard</a>.
        </p>
      )}

      {error && (
        <div className="mt-4">
          <Alert>{error}</Alert>
        </div>
      )}
    </div>
  );
}

function StatusPill({ state }: { state: StoreDashboard["stripe"]["state"] }) {
  const map = {
    NOT_CONNECTED: ["Not connected", "border-hairline-2 text-muted"],
    ACTION_REQUIRED: ["Action required", "border-amber-300 text-amber-700 dark:border-amber-700 dark:text-amber-300"],
    READY: ["Ready to sell", "border-[color-mix(in_oklab,var(--good)_35%,transparent)] bg-good-soft text-good"],
  } as const;
  const [label, cls] = map[state];
  return <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${cls}`}>{label}</span>;
}

// ---- Products ----------------------------------------------------------------

function Products({ token, store, ebooks, onChange }: {
  token: string; store: StoreDashboard; ebooks: EbookStatusResponse[]; onChange: (s: StoreDashboard) => void;
}) {
  const listed = new Set(store.products.map((p) => p.ebookId));
  const available = ebooks.filter((e) => e.status === "COMPLETED" && e.downloadReady && !listed.has(e.id));
  const [ebookId, setEbookId] = useState("");
  const [price, setPrice] = useState("9.99");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function add() {
    const cents = toCents(price);
    if (!ebookId || cents === null) {
      setError("Choose an ebook and enter a price like 9.99.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      onChange(await storeApi.addProduct(token, { ebookId, priceCents: cents }));
      setEbookId("");
    } catch (e) {
      setError(message(e, "Could not add the ebook."));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className={card}>
      <h2 className={h2}>Ebooks for sale</h2>
      <p className="mt-1 text-sm text-muted">Prices are in USD. Buyers get a download link by email.</p>

      {store.products.length > 0 && (
        <ul className="mt-4 divide-y divide-hairline">
          {store.products.map((p) => (
            <ProductRow key={p.id} token={token} product={p} onChange={onChange} />
          ))}
        </ul>
      )}

      <div className="mt-5 flex flex-wrap items-end gap-3">
        {available.length === 0 ? (
          <p className="text-sm text-faint">
            {store.products.length === 0 ? "Finish an ebook to put it on sale." : "All your finished ebooks are listed."}
          </p>
        ) : (
          <>
            <label className="flex min-w-[220px] flex-1 flex-col gap-1.5 text-sm font-medium text-foreground-2">
              Ebook
              <select className={controlBase} value={ebookId} onChange={(e) => setEbookId(e.target.value)}>
                <option value="">Choose a finished ebook…</option>
                {available.map((e) => (
                  <option key={e.id} value={e.id}>{e.title || "Untitled ebook"}</option>
                ))}
              </select>
            </label>
            <label className="flex w-32 flex-col gap-1.5 text-sm font-medium text-foreground-2">
              Price ($)
              <input className={controlBase} inputMode="decimal" value={price} onChange={(e) => setPrice(e.target.value)} />
            </label>
            <Button loading={busy} onClick={add}>Add to store</Button>
          </>
        )}
      </div>
      {error && (
        <div className="mt-4">
          <Alert>{error}</Alert>
        </div>
      )}
    </div>
  );
}

function ProductRow({ token, product, onChange }: {
  token: string; product: StoreProduct; onChange: (s: StoreDashboard) => void;
}) {
  const [price, setPrice] = useState((product.priceCents / 100).toFixed(2));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function update(input: { priceCents?: number; active?: boolean }) {
    setBusy(true);
    setError(null);
    try {
      onChange(await storeApi.updateProduct(token, product.id, input));
    } catch (e) {
      setError(message(e, "Could not update."));
    } finally {
      setBusy(false);
    }
  }

  const cents = toCents(price);
  return (
    <li className="flex flex-wrap items-center gap-3 py-3">
      <div className="min-w-[180px] flex-1">
        <p className={`text-sm font-medium ${product.active ? "text-foreground" : "text-faint line-through"}`}>
          {product.title}
        </p>
        <p className="text-xs text-faint">
          {formatPrice(product.priceCents)}
          {!product.active && " · hidden"}
        </p>
        {error && <p className="mt-1 text-xs text-red-600 dark:text-red-400">{error}</p>}
      </div>
      <input aria-label="Price in USD" className={`${controlBase} w-24`} inputMode="decimal" value={price}
        onChange={(e) => setPrice(e.target.value)} />
      <Button variant="secondary" disabled={busy || cents === null || cents === product.priceCents}
        onClick={() => cents !== null && update({ priceCents: cents })}>
        Save price
      </Button>
      <Button variant="ghost" disabled={busy} onClick={() => update({ active: !product.active })}>
        {product.active ? "Hide" : "Show"}
      </Button>
    </li>
  );
}

export default function StorePage() {
  return (
    <Suspense fallback={<div className="py-10 text-center text-faint">…</div>}>
      <StoreInner />
    </Suspense>
  );
}
