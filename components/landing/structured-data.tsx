import { BRAND } from "@/lib/brand";
import { SITE_URL, SITE_DESCRIPTION } from "@/lib/site";
import { PACKS, SUBSCRIPTION } from "@/lib/pricing";
import { FAQ_ITEMS } from "./faq";

/**
 * JSON-LD structured data for the marketing landing. Helps search engines and
 * AI answer engines understand what Scrivetta is (a SaaS app), who publishes
 * it, how it's priced, and the answers to common questions — which can surface
 * richer results.
 */

// All published prices (subscription + one-time packs) as plain numbers, so the
// AggregateOffer's low/high price band tracks the real pricing config.
const PRICES = [SUBSCRIPTION.priceLabel, ...PACKS.map((p) => p.priceLabel)].map(
  (label) => Number(label.replace(/[^0-9.]/g, "")),
);

export function StructuredData() {
  const graph = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${SITE_URL}/#organization`,
        name: BRAND,
        url: SITE_URL,
        logo: `${SITE_URL}/web-app-manifest-512x512.png`,
      },
      {
        "@type": "WebSite",
        "@id": `${SITE_URL}/#website`,
        url: SITE_URL,
        name: BRAND,
        description: SITE_DESCRIPTION,
        publisher: { "@id": `${SITE_URL}/#organization` },
      },
      {
        "@type": "SoftwareApplication",
        "@id": `${SITE_URL}/#app`,
        name: BRAND,
        applicationCategory: "BusinessApplication",
        operatingSystem: "Web",
        url: SITE_URL,
        description: SITE_DESCRIPTION,
        publisher: { "@id": `${SITE_URL}/#organization` },
        offers: {
          "@type": "AggregateOffer",
          priceCurrency: "USD",
          lowPrice: Math.min(...PRICES).toString(),
          highPrice: Math.max(...PRICES).toString(),
          offerCount: PRICES.length,
        },
      },
      {
        "@type": "FAQPage",
        "@id": `${SITE_URL}/#faq`,
        mainEntity: FAQ_ITEMS.map((item) => ({
          "@type": "Question",
          name: item.q,
          acceptedAnswer: {
            "@type": "Answer",
            text: item.a,
          },
        })),
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      // Server-rendered constant; safe to inline.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(graph) }}
    />
  );
}
