"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { ApiError, apiAsset, ebookApi, storeApi } from "@/lib/api";
import { StoreCover } from "@/components/store/store-cover";
import { formatPrice } from "@/lib/pricing";
import type { EbookStatusResponse, StoreDashboard, StoreProduct } from "@/lib/types";
import { Alert, Button, ButtonLink, Field, Spinner, TextAreaField, controlBase } from "@/components/ui";

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
          <PublishBar token={token!} store={store} onChange={setStore} />
          <Checklist store={store} />
          <ProfileForm token={token!} store={store} onChange={setStore} />
          <Products token={token!} store={store} ebooks={ebooks} onChange={setStore} />
          <StripeCard token={token!} store={store} onChange={setStore} />
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

// ---- Publish + share ---------------------------------------------------------

function PublishBar({ token, store, onChange }: {
  token: string; store: StoreDashboard; onChange: (s: StoreDashboard) => void;
}) {
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const path = `/store/${store.slug}`;
  const shown = `scrivetta.com${path}`;

  async function togglePublish() {
    setBusy(true);
    setError(null);
    try {
      onChange(store.published ? await storeApi.unpublish(token) : await storeApi.publish(token));
    } catch (e) {
      setError(message(e, "Could not change the store's visibility."));
    } finally {
      setBusy(false);
    }
  }

  async function copy() {
    try {
      await navigator.clipboard.writeText(`${window.location.origin}${path}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setError("Could not copy — select the address and copy it by hand.");
    }
  }

  return (
    <div className={card}>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex min-w-0 flex-wrap items-center gap-3">
          <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${store.published
            ? "border-[color-mix(in_oklab,var(--good)_35%,transparent)] bg-good-soft text-good"
            : "border-hairline-2 text-muted"}`}>
            {store.published ? "Live" : "Not published"}
          </span>
          <span className="truncate text-sm text-foreground-2">{shown}</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {store.published && (
            <>
              <Button variant="secondary" onClick={copy}>{copied ? "Copied" : "Copy link for your bio"}</Button>
              <ButtonLink href={path} variant="secondary">View store</ButtonLink>
            </>
          )}
          <Button variant={store.published ? "ghost" : "primary"} loading={busy}
            disabled={!store.published && !store.pro} onClick={togglePublish}>
            {store.published ? "Unpublish" : "Publish store"}
          </Button>
        </div>
      </div>
      {!store.pro && (
        <div className="mt-4">
          <Alert variant="info">
            Publishing and selling require Scrivetta PRO.{" "}
            <Link href="/billing" className="font-semibold underline">Upgrade</Link>
          </Alert>
        </div>
      )}
      {error && <div className="mt-4"><Alert>{error}</Alert></div>}
    </div>
  );
}

// ---- Ready-to-sell checklist ---------------------------------------------------

function Checklist({ store }: { store: StoreDashboard }) {
  const listed = store.products.filter((p) => p.active).length;
  const items: { done: boolean; label: string; href: string }[] = [
    { done: !!store.logoUrl && !!store.headline, label: "Store logo and headline", href: "#brand" },
    { done: !!store.description && !!store.photoUrl, label: "About you, with a photo", href: "#about-you" },
    { done: listed > 0, label: listed > 0 ? `${listed} ebook${listed === 1 ? "" : "s"} for sale` : "At least one ebook for sale", href: "#ebooks-sec" },
    { done: store.stripe.state === "READY", label: "Payments ready in Stripe", href: "#payments" },
    { done: store.published, label: "Store published", href: "#" },
  ];
  const done = items.filter((i) => i.done).length;
  if (done === items.length) return null;
  return (
    <div className={card}>
      <div className="flex items-baseline justify-between gap-3">
        <h2 className={h2}>Ready to sell?</h2>
        <span className="text-sm font-semibold text-muted">{done} of {items.length}</span>
      </div>
      <ul className="mt-4 flex flex-col gap-2.5 text-sm">
        {items.map((i) => (
          <li key={i.label} className="flex items-center gap-3">
            <span aria-hidden className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[11px] font-bold ${i.done ? "bg-good-soft text-good" : "border border-hairline-2 text-faint"}`}>
              {i.done ? "✓\uFE0E" : ""}
            </span>
            <span className={i.done ? "text-muted" : "text-foreground"}>{i.label}</span>
            {!i.done && i.href !== "#" && <a href={i.href} className="font-semibold text-accent hover:underline">Fix</a>}
            <span className="sr-only">{i.done ? "done" : "to do"}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

// ---- Profile: brand + about you -------------------------------------------------

function ProfileForm({ token, store, onChange }: {
  token: string; store: StoreDashboard; onChange: (s: StoreDashboard) => void;
}) {
  const [form, setForm] = useState({
    name: store.name,
    headline: store.headline ?? "",
    authorName: store.authorName ?? "",
    description: store.description ?? "",
    contactEmail: store.contactEmail ?? "",
    instagramUrl: store.instagramUrl ?? "",
    tiktokUrl: store.tiktokUrl ?? "",
    websiteUrl: store.websiteUrl ?? "",
  });
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [k]: e.target.value });
    setSaved(false);
  };

  async function save() {
    setBusy(true);
    setError(null);
    setFieldErrors({});
    try {
      onChange(await storeApi.update(token, { ...form, name: form.name.trim() }));
      setSaved(true);
    } catch (e) {
      if (e instanceof ApiError && e.fieldErrors) setFieldErrors(e.fieldErrors);
      setError(message(e, "Could not save."));
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <div id="brand" className={`${card} scroll-mt-6`}>
        <h2 className={h2}>Brand</h2>
        <div className="mt-4 flex flex-col gap-4">
          <ImagePicker token={token} kind="logo" url={store.logoUrl} round onChange={onChange}
            label="Logo" hint="PNG, JPG or WebP · square works best · up to 3 MB" />
          <Field label="Store name" name="storeName" value={form.name} maxLength={80} onChange={set("name")}
            error={fieldErrors.name} />
          <div className="flex flex-col gap-1.5">
            <Field label="Headline" name="headline" value={form.headline} maxLength={160} onChange={set("headline")}
              placeholder="Bake bread you're proud of — in your own kitchen." error={fieldErrors.headline} />
            <p className="text-xs text-faint">The first thing people see. Say what readers get, not what you sell.</p>
          </div>
        </div>
      </div>

      <div id="about-you" className={`${card} scroll-mt-6`}>
        <h2 className={h2}>About you</h2>
        <div className="mt-4 flex flex-col gap-4">
          <ImagePicker token={token} kind="photo" url={store.photoUrl} onChange={onChange}
            label="Your photo" hint="A friendly photo of you or your work · up to 3 MB" />
          <Field label="Your name (as readers see it)" name="authorName" value={form.authorName} maxLength={80}
            onChange={set("authorName")} placeholder="Jane Morrow" error={fieldErrors.authorName} />
          <TextAreaField label="About you" name="storeDescription" value={form.description} maxLength={2000}
            hint="2–3 sentences in your own words: who you are and what readers get." onChange={set("description")} />
          <Field label="Contact email for buyers" name="contactEmail" type="email" value={form.contactEmail}
            maxLength={254} onChange={set("contactEmail")} error={fieldErrors.contactEmail} />
          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="Instagram" name="instagramUrl" value={form.instagramUrl} placeholder="https://instagram.com/…"
              onChange={set("instagramUrl")} error={fieldErrors.instagramUrl} />
            <Field label="TikTok" name="tiktokUrl" value={form.tiktokUrl} placeholder="https://tiktok.com/@…"
              onChange={set("tiktokUrl")} error={fieldErrors.tiktokUrl} />
            <Field label="Website" name="websiteUrl" value={form.websiteUrl} placeholder="https://…"
              onChange={set("websiteUrl")} error={fieldErrors.websiteUrl} />
          </div>
          {error && <Alert>{error}</Alert>}
          <div className="flex items-center gap-3">
            <Button loading={busy} disabled={!form.name.trim()} onClick={save}>Save profile</Button>
            {saved && <span className="text-sm text-good">Saved — buyers see it right away.</span>}
          </div>
        </div>
      </div>
    </>
  );
}

function ImagePicker({ token, kind, url, round = false, label, hint, onChange }: {
  token: string; kind: "logo" | "photo"; url: string | null; round?: boolean; label: string; hint: string;
  onChange: (s: StoreDashboard) => void;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const input = useRef<HTMLInputElement>(null);
  const src = apiAsset(url);

  async function upload(file: File | undefined) {
    if (!file) return;
    setBusy(true);
    setError(null);
    try {
      onChange(await storeApi.uploadImage(token, kind, file));
    } catch (e) {
      setError(message(e, "Could not upload the image."));
    } finally {
      setBusy(false);
      if (input.current) input.current.value = "";
    }
  }

  async function remove() {
    setBusy(true);
    setError(null);
    try {
      onChange(await storeApi.removeImage(token, kind));
    } catch (e) {
      setError(message(e, "Could not remove the image."));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-4">
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt="" className={`h-16 w-16 object-cover ${round ? "rounded-full" : "rounded-xl"}`} />
      ) : (
        <span aria-hidden className={`flex h-16 w-16 items-center justify-center border border-dashed border-hairline-2 text-xs text-faint ${round ? "rounded-full" : "rounded-xl"}`}>
          None
        </span>
      )}
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <span className="text-sm font-medium text-foreground-2">{label}</span>
        <span className="text-xs text-faint">{hint}</span>
        {error && <span className="text-xs text-red-600 dark:text-red-400">{error}</span>}
      </div>
      <input ref={input} type="file" accept="image/png,image/jpeg,image/webp" className="hidden"
        aria-label={`Upload ${label.toLowerCase()}`} onChange={(e) => upload(e.target.files?.[0])} />
      <div className="flex gap-2">
        <Button variant="secondary" loading={busy} onClick={() => input.current?.click()}>{src ? "Replace" : "Upload"}</Button>
        {src && <Button variant="ghost" disabled={busy} onClick={remove}>Remove</Button>}
      </div>
    </div>
  );
}

// ---- Stripe status -----------------------------------------------------------

// Right after onboarding Stripe usually needs a moment to verify the account;
// while it does, re-check a few times so the card flips to ready on its own.
const VERIFY_POLL_MS = 5000;
const VERIFY_POLL_TRIES = 12;

function StripeCard({ token, store, onChange }: {
  token: string; store: StoreDashboard; onChange: (s: StoreDashboard) => void;
}) {
  const [country, setCountry] = useState("US");
  const [busy, setBusy] = useState(false);
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { state, currentlyDue } = store.stripe;
  const polls = useRef(0);

  useEffect(() => {
    if (state !== "PENDING_VERIFICATION" || polls.current >= VERIFY_POLL_TRIES) return;
    const id = setTimeout(async () => {
      polls.current += 1;
      try {
        onChange(await storeApi.syncStripe(token));
      } catch {
        polls.current = VERIFY_POLL_TRIES; // stop quietly; "Check again" still works
      }
    }, VERIFY_POLL_MS);
    return () => clearTimeout(id);
  }, [state, store, token, onChange]);

  async function checkStatus() {
    setChecking(true);
    setError(null);
    try {
      onChange(await storeApi.syncStripe(token));
    } catch (e) {
      setError(message(e, "Could not check your Stripe account."));
    } finally {
      setChecking(false);
    }
  }

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
    <div id="payments" className={`${card} scroll-mt-6`}>
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

      {state === "PENDING_VERIFICATION" && (
        <>
          <p className="mt-2 text-sm text-muted">
            You&apos;ve submitted everything Stripe asked for. Stripe is verifying your account — this usually takes a
            moment, sometimes longer. You&apos;ll be able to sell as soon as it&apos;s done.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Button loading={checking} onClick={checkStatus}>Check again</Button>
            <Button variant="ghost" loading={busy} onClick={openStripe}>Review in Stripe</Button>
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
    PENDING_VERIFICATION: ["Verifying", "border-hairline-2 text-muted"],
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
    <div id="ebooks-sec" className={`${card} scroll-mt-6`}>
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className={h2}>Ebooks</h2>
        <span className="text-xs text-faint">The first one is featured · prices in USD</span>
      </div>
      <p className="mt-1 text-sm text-muted">
        Each ebook gets its own page with its cover, chapter list and your description. Buyers get a download link by
        email.
      </p>

      {store.products.length > 0 && (
        <ul className="mt-4 divide-y divide-hairline">
          {store.products.map((p, i) => (
            <ProductRow key={p.id} token={token} product={p} slug={store.slug} published={store.published}
              first={i === 0} last={i === store.products.length - 1} onChange={onChange} />
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

function ProductRow({ token, product, slug, published, first, last, onChange }: {
  token: string; product: StoreProduct; slug: string; published: boolean; first: boolean; last: boolean;
  onChange: (s: StoreDashboard) => void;
}) {
  const [price, setPrice] = useState((product.priceCents / 100).toFixed(2));
  const [open, setOpen] = useState(false);
  const [description, setDescription] = useState(product.description ?? "");
  const [highlights, setHighlights] = useState(product.highlights ?? "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function run(fn: () => Promise<StoreDashboard>) {
    setBusy(true);
    setError(null);
    try {
      onChange(await fn());
    } catch (e) {
      setError(message(e, "Could not update."));
    } finally {
      setBusy(false);
    }
  }

  const cents = toCents(price);
  return (
    <li className="py-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex flex-col gap-0.5">
          <button type="button" aria-label={`Move ${product.title} up`} disabled={busy || first}
            onClick={() => run(() => storeApi.moveProduct(token, product.id, "up"))}
            className="rounded px-1.5 text-faint hover:text-foreground disabled:opacity-30">▲&#xFE0E;</button>
          <button type="button" aria-label={`Move ${product.title} down`} disabled={busy || last}
            onClick={() => run(() => storeApi.moveProduct(token, product.id, "down"))}
            className="rounded px-1.5 text-faint hover:text-foreground disabled:opacity-30">▼&#xFE0E;</button>
        </div>
        <div className="w-11 shrink-0"><StoreCover coverUrl={product.coverUrl} title={product.title} className="shadow-none" /></div>
        <div className="min-w-[160px] flex-1">
          <p className={`text-sm font-medium ${product.active ? "text-foreground" : "text-faint line-through"}`}>
            {product.title}
          </p>
          <p className="text-xs text-faint">
            {[first && product.active ? "Featured" : null, product.pageCount > 0 ? `${product.pageCount} pages` : null,
              formatPrice(product.priceCents), product.active ? null : "hidden"].filter(Boolean).join(" · ")}
          </p>
          {error && <p className="mt-1 text-xs text-red-600 dark:text-red-400">{error}</p>}
        </div>
        <input aria-label="Price in USD" className={`${controlBase} w-24`} inputMode="decimal" value={price}
          onChange={(e) => setPrice(e.target.value)} />
        <Button variant="secondary" disabled={busy || cents === null || cents === product.priceCents}
          onClick={() => cents !== null && run(() => storeApi.updateProduct(token, product.id, { priceCents: cents }))}>
          Save price
        </Button>
        <Button variant="ghost" disabled={busy} onClick={() => setOpen(!open)} aria-expanded={open}>
          {open ? "Close" : "Edit page"}
        </Button>
        <Button variant="ghost" disabled={busy}
          onClick={() => run(() => storeApi.updateProduct(token, product.id, { active: !product.active }))}>
          {product.active ? "Hide" : "Show"}
        </Button>
      </div>
      {open && (
        <div className="mt-4 flex flex-col gap-4 rounded-xl border border-hairline bg-surface-2 p-4">
          <TextAreaField label="Description" name={`desc-${product.id}`} value={description} maxLength={2000}
            hint="Shown under the title. Pre-filled from your book." onChange={(e) => setDescription(e.target.value)} />
          <TextAreaField label="What readers will be able to do" name={`hl-${product.id}`} value={highlights}
            maxLength={1500} hint="One point per line. Shown as a list on the ebook page."
            placeholder={"Start and keep a healthy starter\nShape a loaf that opens up in a home oven"}
            onChange={(e) => setHighlights(e.target.value)} />
          <div className="flex flex-wrap items-center gap-3">
            <Button loading={busy}
              onClick={() => run(() => storeApi.updateProduct(token, product.id, { description, highlights }))}>
              Save page
            </Button>
            {published && product.active && (
              <Link href={`/store/${slug}/${product.id}`} className="text-sm font-semibold text-accent hover:underline">
                View page
              </Link>
            )}
          </div>
        </div>
      )}
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
