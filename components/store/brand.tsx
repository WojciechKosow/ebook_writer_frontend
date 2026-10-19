"use client";

import { useEffect, useRef, useState } from "react";
import { ApiError, apiAsset, storeApi } from "@/lib/api";
import type { LibraryAsset, StoreDashboard } from "@/lib/types";
import { LibraryPicker, useLibraryNotice } from "@/components/asset-library";
import { Button, Field, TextAreaField } from "@/components/ui";
import { Dialog, DialogHeader } from "./kit";

type Profile = {
  name: string;
  headline: string;
  authorName: string;
  description: string;
  contactEmail: string;
  instagramUrl: string;
  tiktokUrl: string;
  websiteUrl: string;
};

function profileOf(s: StoreDashboard): Profile {
  return {
    name: s.name,
    headline: s.headline ?? "",
    authorName: s.authorName ?? "",
    description: s.description ?? "",
    contactEmail: s.contactEmail ?? "",
    instagramUrl: s.instagramUrl ?? "",
    tiktokUrl: s.tiktokUrl ?? "",
    websiteUrl: s.websiteUrl ?? "",
  };
}

/**
 * Brand & about you, written once and shown everywhere (store, every product
 * page, the thank-you page). Edits autosave as a draft; images are used right
 * away.
 */
export function BrandDialog({ open, token, store, onChange, onClose, onSaving }: {
  open: boolean;
  token: string;
  store: StoreDashboard;
  onChange: (s: StoreDashboard) => void;
  onClose: () => void;
  onSaving: (saving: boolean) => void;
}) {
  const [form, setForm] = useState<Profile>(() => profileOf(store));
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pending = useRef<Profile | null>(null);

  async function save(p: Profile) {
    if (!p.name.trim()) {
      setFieldErrors({ name: "Your store needs a name." });
      return;
    }
    onSaving(true);
    try {
      onChange(await storeApi.update(token, { ...p, name: p.name.trim() }));
      setFieldErrors({});
      setError(null);
    } catch (e) {
      if (e instanceof ApiError && e.fieldErrors) setFieldErrors(e.fieldErrors);
      else setError(e instanceof ApiError ? e.message : "Could not save your draft.");
    } finally {
      onSaving(false);
    }
  }

  function flush() {
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
    if (pending.current) {
      const p = pending.current;
      pending.current = null;
      void save(p);
    }
  }

  function edit(k: keyof Profile, value: string) {
    const next = { ...form, [k]: value };
    setForm(next);
    pending.current = next;
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => flushRef.current(), 900);
  }

  // Saves whatever is still waiting when the dialog goes away.
  const flushRef = useRef(flush);
  useEffect(() => {
    flushRef.current = flush;
  });
  useEffect(() => () => flushRef.current(), []);

  function close() {
    flush();
    onClose();
  }

  return (
    <Dialog open={open} onClose={close} labelledBy="brand-title">
      <DialogHeader id="brand-title" title="Brand & about you" onClose={close} />
      <div className="flex flex-col gap-5 px-6 pb-6">
        <p className="text-[13px] leading-relaxed text-muted">
          Shown on your store, every product page and the thank-you page. Changes save as a draft and go live when you
          publish; images are used right away.
        </p>
        <ImagePicker token={token} kind="logo" url={store.logoUrl} round onChange={onChange}
          label="Logo" hint="PNG, JPG or WebP · square works best · up to 3 MB" />
        <Field label="Store name" name="storeName" value={form.name} maxLength={80} onChange={(e) => edit("name", e.target.value)} onBlur={flush} error={fieldErrors.name} />
        <div className="flex flex-col gap-1.5">
          <Field label="Headline" name="headline" value={form.headline} maxLength={160} onChange={(e) => edit("headline", e.target.value)} onBlur={flush}
            placeholder="Bake bread you're proud of — in your own kitchen." error={fieldErrors.headline} />
          <p className="text-xs text-faint">The first thing people see. Say what readers get, not what you sell.</p>
        </div>
        <ImagePicker token={token} kind="photo" url={store.photoUrl} onChange={onChange}
          label="Your photo" hint="A friendly photo of you or your work · up to 3 MB" />
        <Field label="Your name (as readers see it)" name="authorName" value={form.authorName} maxLength={80}
          onChange={(e) => edit("authorName", e.target.value)} onBlur={flush} placeholder="Jane Morrow" error={fieldErrors.authorName} />
        <TextAreaField label="About you" name="storeDescription" value={form.description} maxLength={2000}
          hint="2–3 sentences in your own words: who you are and what readers get." onChange={(e) => edit("description", e.target.value)} onBlur={flush} />
        <Field label="Contact email for buyers" name="contactEmail" type="email" value={form.contactEmail}
          maxLength={254} onChange={(e) => edit("contactEmail", e.target.value)} onBlur={flush} error={fieldErrors.contactEmail} />
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Instagram" name="instagramUrl" value={form.instagramUrl} placeholder="https://instagram.com/…"
            onChange={(e) => edit("instagramUrl", e.target.value)} onBlur={flush} error={fieldErrors.instagramUrl} />
          <Field label="TikTok" name="tiktokUrl" value={form.tiktokUrl} placeholder="https://tiktok.com/@…"
            onChange={(e) => edit("tiktokUrl", e.target.value)} onBlur={flush} error={fieldErrors.tiktokUrl} />
          <Field label="Website" name="websiteUrl" value={form.websiteUrl} placeholder="https://…"
            onChange={(e) => edit("websiteUrl", e.target.value)} onBlur={flush} error={fieldErrors.websiteUrl} />
        </div>
        {error && <p className="text-sm text-red-700 dark:text-red-400">{error}</p>}
        <div className="flex justify-end">
          <Button onClick={close}>Done</Button>
        </div>
      </div>
    </Dialog>
  );
}

/** The brand summary on Your store. */
export function BrandCard({ store, onEdit }: { store: StoreDashboard; onEdit: () => void }) {
  const photo = apiAsset(store.photoUrl);
  const links = [store.contactEmail, store.instagramUrl && "Instagram", store.tiktokUrl && "TikTok", store.websiteUrl && "Website"].filter(Boolean);
  const empty = !store.headline && !store.authorName && !store.description && !store.logoUrl;
  return (
    <div className="flex min-w-0 flex-col gap-4 rounded-2xl border border-hairline bg-surface p-5">
      <div className="flex items-center justify-between gap-3">
        <h3 className="font-display text-[22px] font-normal">Brand &amp; about you</h3>
        <button type="button" onClick={onEdit} className="text-sm font-medium underline decoration-hairline-2 underline-offset-4 hover:decoration-foreground">
          {empty ? "Add brand" : "Edit"}
        </button>
      </div>
      {empty ? (
        <p className="text-sm text-muted">Logo, headline, a photo and a few words about you.</p>
      ) : (
        <>
          <div className="flex items-center gap-3">
            {photo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={photo} alt="" className="h-11 w-11 rounded-full object-cover" />
            ) : (
              <span aria-hidden className="h-11 w-11 rounded-full border border-dashed border-hairline-2" />
            )}
            <div className="flex min-w-0 flex-col">
              <span className="font-medium">{store.authorName || store.name}</span>
              <span className="truncate text-xs text-muted">{links.length ? links.join(" · ") : "No contact details yet"}</span>
            </div>
          </div>
          {store.headline && <p className="font-display text-[18px] leading-snug">“{store.headline}”</p>}
        </>
      )}
      <span className="text-xs leading-relaxed text-faint">Used on your store, every product page and the thank-you page.</span>
    </div>
  );
}

// ---- Images (used right away) ------------------------------------------------------

// The store takes raster images up to 3 MB (never SVG, which can carry script).
const STORE_IMAGE_TYPES = new Set(["image/png", "image/jpeg", "image/webp"]);

export function storeAccepts(asset: LibraryAsset): string | null {
  if (!STORE_IMAGE_TYPES.has(asset.contentType)) return "PNG, JPG or WebP only";
  if (asset.sizeBytes > 3 * 1024 * 1024) return "Larger than 3 MB";
  return null;
}

function ImagePicker({ token, kind, url, round = false, label, hint, onChange }: {
  token: string; kind: "logo" | "photo"; url: string | null; round?: boolean; label: string; hint: string;
  onChange: (s: StoreDashboard) => void;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [libraryOpen, setLibraryOpen] = useState(false);
  const { notice, afterUpload } = useLibraryNotice();
  const input = useRef<HTMLInputElement>(null);
  const src = apiAsset(url);

  async function run(fn: () => Promise<StoreDashboard>, uploaded = false) {
    setBusy(true);
    setError(null);
    try {
      onChange(await fn());
      if (uploaded) afterUpload();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Could not update the image.");
    } finally {
      setBusy(false);
      if (input.current) input.current.value = "";
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
        aria-label={`Upload ${label.toLowerCase()}`}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) void run(() => storeApi.uploadImage(token, kind, file), true);
        }} />
      <div className="flex gap-2">
        <Button variant="secondary" loading={busy} onClick={() => input.current?.click()}>{src ? "Replace" : "Upload"}</Button>
        <Button variant="ghost" disabled={busy} onClick={() => setLibraryOpen(true)}>From library</Button>
        {src && <Button variant="ghost" disabled={busy} onClick={() => run(() => storeApi.removeImage(token, kind))}>Remove</Button>}
      </div>
      {libraryOpen && (
        <LibraryPicker
          title={`Pick your ${label.toLowerCase()}`}
          accepts={storeAccepts}
          onPick={async (asset) => onChange(await storeApi.useLibraryImage(token, kind, asset.id))}
          onClose={() => setLibraryOpen(false)}
        />
      )}
      {notice}
    </div>
  );
}
