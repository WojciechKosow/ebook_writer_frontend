// Central SEO / site-identity config. One place to tune how Scrivetta presents
// itself to search engines and social/link-preview crawlers.
//
// The canonical marketing origin. Set NEXT_PUBLIC_SITE_URL in the environment
// (e.g. Vercel project env vars) to the real production domain — it must be an
// absolute URL with no trailing slash. The default is a safe fallback for
// local/preview builds so `metadataBase` never breaks the build.
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://scrivetta.com"
).replace(/\/$/, "");

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
