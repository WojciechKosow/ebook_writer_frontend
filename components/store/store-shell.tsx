"use client";

import { useState } from "react";
import Link from "next/link";
import { apiAsset } from "@/lib/api";
import type { StoreProfile } from "@/lib/types";
import { BrandMark } from "@/components/brand-mark";

/**
 * Frame for every buyer-facing store page. The store belongs to the author: their
 * logo and name lead, Scrivetta is only a small "Made with Scrivetta" badge. Same
 * Ink & Paper look as the rest of the site.
 */
export function StoreShell({
  profile,
  onStorePage = false,
  children,
}: {
  /** Null while loading or for a store that doesn't exist. */
  profile: StoreProfile | null;
  /** On the store page itself the nav links are in-page anchors. */
  onStorePage?: boolean;
  children: React.ReactNode;
}) {
  const base = profile ? (onStorePage ? "" : `/store/${profile.slug}`) : "";
  return (
    <div className="ink-paper relative flex min-h-full flex-1 flex-col overflow-x-clip">
      <header className="sticky top-0 z-30 border-b border-ip-hair bg-ip-glass backdrop-blur-md">
        <div className="mx-auto flex w-full max-w-[1120px] flex-wrap items-center justify-between gap-x-6 gap-y-2 px-4 py-3 sm:px-6">
          {profile ? (
            <Link href={`/store/${profile.slug}`} className="flex min-w-0 items-center gap-3">
              <StoreLogo profile={profile} />
              <span className="truncate font-display text-[22px] leading-none text-foreground">{profile.name}</span>
            </Link>
          ) : (
            <span />
          )}
          {profile && (
            <nav aria-label="Store" className="flex flex-wrap items-center gap-x-6 gap-y-1 text-sm font-medium text-foreground-2">
              <a href={`${base}#ebooks`} className="hover:text-foreground">Ebooks</a>
              {(profile.description || profile.photoUrl) && (
                <a href={`${base}#about`} className="hover:text-foreground">
                  About{profile.authorName ? ` ${firstName(profile.authorName)}` : ""}
                </a>
              )}
              <a href={`${base}#help`} className="hover:text-foreground">Help</a>
              <SocialIcons profile={profile} />
            </nav>
          )}
        </div>
      </header>

      <main className="relative z-[1] flex-1">{children}</main>

      <footer className="border-t border-ip-hair">
        <div className="mx-auto flex w-full max-w-[1120px] flex-wrap items-center justify-between gap-4 px-4 py-7 text-sm text-muted sm:px-6">
          <div className="flex flex-wrap gap-x-6 gap-y-2">
            {profile && <span>© {new Date().getFullYear()} {profile.name}</span>}
            {profile && (
              <Link href={`/store/${profile.slug}/terms`} className="hover:text-foreground">
                Terms of sale
              </Link>
            )}
            {profile?.contactEmail && (
              <a href={`mailto:${profile.contactEmail}`} className="hover:text-foreground">
                Contact
              </a>
            )}
          </div>
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-full border border-ip-hair py-1 pl-1 pr-3 text-xs font-semibold text-foreground-2 hover:border-muted"
          >
            <BrandMark className="h-5 w-5" />
            Made with Scrivetta
          </Link>
        </div>
      </footer>
    </div>
  );
}

export function StoreLogo({ profile, size = 40 }: { profile: Pick<StoreProfile, "name" | "logoUrl">; size?: number }) {
  const [failed, setFailed] = useState(false);
  const src = apiAsset(profile.logoUrl);
  const style = { width: size, height: size };
  if (src && !failed) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt="" style={style} className="shrink-0 rounded-full object-cover" onError={() => setFailed(true)} />;
  }
  return (
    <span
      aria-hidden
      style={{ ...style, fontSize: size * 0.4 }}
      className="flex shrink-0 items-center justify-center rounded-full bg-foreground font-display text-background"
    >
      {initials(profile.name)}
    </span>
  );
}

export function SocialIcons({ profile }: { profile: StoreProfile }) {
  const who = profile.authorName || profile.name;
  return (
    <>
      {profile.instagramUrl && (
        <a href={profile.instagramUrl} target="_blank" rel="noopener noreferrer" aria-label={`${who} on Instagram`} className="hover:text-foreground">
          <svg aria-hidden width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
            <rect x="3" y="3" width="18" height="18" rx="5" />
            <circle cx="12" cy="12" r="4" />
            <circle cx="17.5" cy="6.5" r="0.6" fill="currentColor" />
          </svg>
        </a>
      )}
      {profile.tiktokUrl && (
        <a href={profile.tiktokUrl} target="_blank" rel="noopener noreferrer" aria-label={`${who} on TikTok`} className="hover:text-foreground">
          <svg aria-hidden width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 3v11.5a3.5 3.5 0 1 1-3.5-3.5" />
            <path d="M14 3c.5 2.6 2.4 4.4 5 4.6" />
          </svg>
        </a>
      )}
      {profile.websiteUrl && (
        <a href={profile.websiteUrl} target="_blank" rel="noopener noreferrer" aria-label={`${who}'s website`} className="hover:text-foreground">
          <svg aria-hidden width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
            <circle cx="12" cy="12" r="9" />
            <path d="M3 12h18M12 3c2.5 2.6 3.8 5.6 3.8 9s-1.3 6.4-3.8 9c-2.5-2.6-3.8-5.6-3.8-9S9.5 5.6 12 3z" />
          </svg>
        </a>
      )}
    </>
  );
}

export function initials(name: string) {
  const parts = name.replace(/['’]s\b/g, "").split(/\s+/).filter(Boolean);
  return ((parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "")).toUpperCase() || "S";
}

export function firstName(name: string) {
  return name.trim().split(/\s+/)[0];
}
