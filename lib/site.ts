// Central SEO / site-identity config. One place to tune how Scrivetta presents
// itself to search engines and social/link-preview crawlers.
//
// The canonical marketing origin. Production serves from www — the bare domain
// redirects there — so every canonical, sitemap, and JSON-LD URL must use the
// www host. Pointing them at the bare domain makes Search Console flag each
// sitemap entry as "Page with redirect" and splits signals across both hosts.
// NEXT_PUBLIC_SITE_URL can override it (absolute URL, no trailing slash).
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.scrivetta.com"
).replace(/\/$/, "");

// Google Search Console site-verification token (the value of the
// "google-site-verification" meta tag Google hands you when you add the
// property via the "HTML tag" method). Read server-side only and rendered
// into <head> by the metadata export. Left unset locally so no empty tag is
// emitted; set GOOGLE_SITE_VERIFICATION in Vercel to claim the property.
export const SITE_VERIFICATION_GOOGLE =
  process.env.GOOGLE_SITE_VERIFICATION?.trim() || undefined;

import { BRAND } from "./brand";

// One-line value proposition, kept keyword-aware for search without reading as
// keyword stuffing. Used as the default meta description and OG/Twitter copy.
export const SITE_DESCRIPTION =
  `${BRAND} is an AI ebook generator that turns what you know into a ` +
  `finished, typeset ebook. Upload your notes or documents, approve the ` +
  `chapter blueprint, and get every chapter written, edited, and exported ` +
  `as a print-ready PDF. Plan your book free.`;

// The phrase people actually search for. Feeds keywords + the OG image.
export const SITE_TAGLINE = "AI Ebook Generator & Writing Studio";

// Search terms we want to be associated with. Google largely ignores the
// keywords meta tag, but several other crawlers and AI answer engines still
// read it, and keeping the list here documents our target positioning.
export const SITE_KEYWORDS = [
  "AI ebook generator",
  "AI book writer",
  "write an ebook with AI",
  "AI writing studio",
  "create an ebook",
  "AI book writing software",
  "generate a book with AI",
  "ebook creator",
  "AI author tool",
  "self-publishing AI",
];

// What people see when a Scrivetta link is pasted into Discord, Slack,
// iMessage, X… Written for a person skimming a chat, not for a search engine —
// the keyword-aware title/description above stay on <title> and the meta
// description, where search ranking actually reads them.
export const SHARE_TITLE = `${BRAND} — turn what you know into a finished book`;
export const SHARE_DESCRIPTION =
  "Upload your notes, approve the chapter plan, and get a beautifully " +
  "typeset ebook written in your voice. Plan your first book free.";

// The generated share image (app/opengraph-image.tsx). Next only attaches it
// automatically to pages that don't declare their own `openGraph` — a page's
// openGraph replaces the layout's wholesale — so pages that set openGraph list
// it explicitly. The Twitter card falls back to it.
export const SHARE_IMAGE = { url: "/opengraph-image", width: 1200, height: 630, alt: SHARE_TITLE };
