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
  `${BRAND} is an AI ebook generator that turns one idea into a finished, ` +
  `typeset ebook. It plans the outline, writes every chapter, edits for ` +
  `consistency, and exports a print-ready PDF — cover to cover. Start free.`;

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
