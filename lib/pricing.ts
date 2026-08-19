// Subscription display copy. The actual charge amount lives in Stripe and the
// monthly credit grant lives in the backend config (credits.subscription-
// monthly-grant) — keep these in sync with those.
export const SUBSCRIPTION = {
  priceLabel: "$19.99",
  period: "month",
  credits: 150,
};

// One-time credit packs for the public marketing page. Keep in sync with the
// backend CreditPack enum (the in-app /billing page reads the real values).
export const PACKS = [
  { credits: 25, priceLabel: "$5" },
  { credits: 60, priceLabel: "$9" },
  { credits: 150, priceLabel: "$19" },
];

/** Format integer cents as a dollar string, e.g. 1900 -> "$19". */
export function formatPrice(cents: number): string {
  const dollars = cents / 100;
  return Number.isInteger(dollars) ? `$${dollars}` : `$${dollars.toFixed(2)}`;
}
