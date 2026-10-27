// Public pricing — the single source for every marketing and in-app pricing view.
// Keep in sync with the backend: the PRO charge lives in Stripe
// (STRIPE_SUBSCRIPTION_PRICE_ID), the monthly grant and operation costs in
// application.yml (credits.*), and the packs in the CreditPack enum. The in-app
// /billing page reads packs from the API, so a checkout can never disagree with
// the server.

export const PRO = {
  name: "Pro",
  priceCents: 2999,
  priceLabel: "$29.99",
  period: "month",
  credits: 3000,
};

/** BASIC — free, no credits included, no storefront. */
export const BASIC = {
  name: "Basic",
  priceLabel: "$0",
};

export type PublicPack = {
  id: "STARTER" | "CREATOR" | "STUDIO";
  name: string;
  credits: number;
  priceCents: number;
  tag?: string;
};

// One-time credit packs. Ids match the backend CreditPack enum.
export const PACKS: PublicPack[] = [
  { id: "STARTER", name: "Starter", credits: 500, priceCents: 799 },
  { id: "CREATOR", name: "Creator", credits: 1200, priceCents: 1999 },
  { id: "STUDIO", name: "Studio", credits: 2500, priceCents: 3499, tag: "Best pack rate" },
];

/**
 * What each paid AI operation costs, mirrored from the backend policy
 * (credits.pricing.*; also served by GET /api/credits/pricing). Planning — the
 * brief, source analysis, the blueprint and the length estimate — is free.
 */
export const CREDIT_COSTS = {
  perPage: 11,
  perImage: 15,
  perCover: 30,
};

/**
 * Reference workload behind the "about 260 pages" ballpark: a text-led book
 * with a handful of illustrations and a cover. An estimate, never a promise.
 */
export const REFERENCE_PAGES = 260;

/** Format integer cents as a dollar string, e.g. 1900 -> "$19", 2999 -> "$29.99". */
export function formatPrice(cents: number): string {
  const dollars = cents / 100;
  return Number.isInteger(dollars) ? `$${dollars}` : `$${dollars.toFixed(2)}`;
}

/** Thousands separators, e.g. 3000 -> "3,000". */
export function formatCredits(n: number): string {
  return n.toLocaleString("en-US");
}

/** Price per credit, e.g. "$0.016". */
export function perCredit(priceCents: number, credits: number): string {
  return `$${(priceCents / 100 / credits).toFixed(3)}`;
}

/** Roughly how many finished text pages `credits` cover — for "≈ pages" hints only. */
export function approxPages(credits: number, perPage: number = CREDIT_COSTS.perPage): number {
  return Math.max(0, Math.floor(credits / Math.max(1, perPage)));
}

/**
 * "1,234 credits used" — or, for a book made under the old system where one
 * credit bought one page (creditsPerPage 1), "34 page credits used".
 */
export function creditsUsedLabel(book: { creditsCharged: number; creditsPerPage?: number }): string {
  const legacy = (book.creditsPerPage ?? 1) <= 1;
  return `${formatCredits(book.creditsCharged)} ${legacy ? "page credits" : "credits"} used`;
}
