"use client";

import { Fragment, useState } from "react";
import Link from "next/link";
import { apiAsset } from "@/lib/api";
import type { PublicStoreProduct, StoreProfile } from "@/lib/types";
import type { Ctx, ResolvedStyle } from "@/lib/store-design/core";

/** What every style component gets. */
export interface StyleProps {
  t: ResolvedStyle;
  ctx: Ctx;
  /** A product's page in this store. */
  href: (productId: string) => string;
}

/**
 * Author-written text: `*words*` become highlighted, new lines become line
 * breaks. Always rendered as text, never as HTML.
 */
export function Rich({ text, em }: { text: string; em?: string }) {
  const lines = text.split("\n");
  return (
    <>
      {lines.map((line, i) => (
        <Fragment key={i}>
          {i > 0 && <br />}
          {line.split(/(\*[^*\n]+\*)/g).map((part, j) =>
            /^\*[^*\n]+\*$/.test(part) ? (
              <em key={j} className={em}>
                {part.slice(1, -1)}
              </em>
            ) : (
              <Fragment key={j}>{part}</Fragment>
            ),
          )}
        </Fragment>
      ))}
    </>
  );
}

/** A link inside the store: anchors stay plain, pages use client navigation. */
export function SLink({ to, className, style, children, label }: {
  to: string;
  className?: string;
  style?: React.CSSProperties;
  children: React.ReactNode;
  label?: string;
}) {
  if (to.startsWith("#") || to.startsWith("mailto:") || to.startsWith("http")) {
    const ext = to.startsWith("http");
    return (
      <a href={to} className={className} style={style} aria-label={label}
        {...(ext ? { target: "_blank", rel: "noopener noreferrer" } : {})}>
        {children}
      </a>
    );
  }
  return (
    <Link href={to} className={className} style={style} aria-label={label}>
      {children}
    </Link>
  );
}

/** The ebook's real cover (first PDF page), filling its frame; a typographic fallback. */
export function Cover({ product, className, fallbackClassName }: {
  product: Pick<PublicStoreProduct, "coverUrl" | "title">;
  className?: string;
  fallbackClassName?: string;
}) {
  const [failed, setFailed] = useState(false);
  const src = apiAsset(product.coverUrl);
  if (src && !failed) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt={`Cover of ${product.title}`} loading="lazy" onError={() => setFailed(true)} className={className} />;
  }
  return (
    <div role="img" aria-label={`Cover of ${product.title}`} className={`${className ?? ""} ${fallbackClassName ?? ""}`}>
      <span>{product.title}</span>
    </div>
  );
}

/** The author's photo or logo, or nothing. */
export function Photo({ url, alt, className }: { url: string | null; alt: string; className?: string }) {
  const [failed, setFailed] = useState(false);
  const src = apiAsset(url);
  if (!src || failed) return null;
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={src} alt={alt} className={className} onError={() => setFailed(true)} />;
}

export function initials(name: string) {
  const parts = name.replace(/['’]s\b/g, "").split(/\s+/).filter(Boolean);
  return ((parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "")).toUpperCase() || "S";
}

export type SocialKind = "instagram" | "tiktok" | "website" | "email";

/** Social / contact links the author set in their profile. */
export function socialLinks(ctx: { store: StoreProfile }): { label: string; href: string; kind: SocialKind }[] {
  const s = ctx.store;
  return [
    s.instagramUrl ? { label: "Instagram", href: s.instagramUrl, kind: "instagram" as const } : null,
    s.tiktokUrl ? { label: "TikTok", href: s.tiktokUrl, kind: "tiktok" as const } : null,
    s.websiteUrl ? { label: "Website", href: s.websiteUrl, kind: "website" as const } : null,
    s.contactEmail ? { label: "Email", href: `mailto:${s.contactEmail}`, kind: "email" as const } : null,
  ].filter((x) => !!x);
}

/** A line icon for a social / contact link; takes the text color. */
export function SocialIcon({ kind, size = 18 }: { kind: SocialKind; size?: number }) {
  const p = { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.7,
    strokeLinecap: "round" as const, strokeLinejoin: "round" as const, "aria-hidden": true };
  switch (kind) {
    case "instagram":
      return <svg {...p}><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r=".6" fill="currentColor" /></svg>;
    case "tiktok":
      return <svg {...p}><path d="M14 3v11.5a3.5 3.5 0 1 1-3.5-3.5" /><path d="M14 3c.4 2.6 2.2 4.4 5 4.7" /></svg>;
    case "website":
      return <svg {...p}><circle cx="12" cy="12" r="9" /><path d="M3 12h18" /><path d="M12 3c2.5 2.6 3.8 5.6 3.8 9s-1.3 6.4-3.8 9c-2.5-2.6-3.8-5.6-3.8-9S9.5 5.6 12 3z" /></svg>;
    case "email":
      return <svg {...p}><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3.5 6.5 8.5 6.5 8.5-6.5" /></svg>;
  }
}

export function pagesLabel(p: PublicStoreProduct) {
  return ["PDF", p.pageCount > 0 ? `${p.pageCount} pages` : null].filter(Boolean).join(" · ");
}

/** Shown under the header when the store can't take payments right now. */
export function Unavailable({ ctx, className }: { ctx: Ctx; className?: string }) {
  if (ctx.store.purchasable || !ctx.store.unavailableReason) return null;
  return (
    <div role="status" className={className}>
      {ctx.store.unavailableReason}
    </div>
  );
}

/** The author's own CSS (already checked: no fetches, can't leave the style element). */
export function CustomCss({ t }: { t: ResolvedStyle }) {
  if (!t.customCss) return null;
  return <style>{t.customCss}</style>;
}

export const YEAR = new Date().getFullYear();
