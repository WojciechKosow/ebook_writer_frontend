"use client";

import { Fragment, useState } from "react";
import Link from "next/link";
import { apiAsset } from "@/lib/api";
import type { PublicStoreProduct } from "@/lib/types";
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

/** Social / contact links the author set in their profile. */
export function socialLinks(ctx: Ctx): { label: string; href: string }[] {
  const s = ctx.store;
  return [
    s.instagramUrl ? { label: "Instagram", href: s.instagramUrl } : null,
    s.tiktokUrl ? { label: "TikTok", href: s.tiktokUrl } : null,
    s.websiteUrl ? { label: "Website", href: s.websiteUrl } : null,
    s.contactEmail ? { label: "Email", href: `mailto:${s.contactEmail}` } : null,
  ].filter((x): x is { label: string; href: string } => !!x);
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
