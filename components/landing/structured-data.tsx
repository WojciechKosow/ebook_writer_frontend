import { BRAND } from "@/lib/brand";
import { SITE_URL, SITE_DESCRIPTION } from "@/lib/site";
import { SUBSCRIPTION } from "@/lib/pricing";

/**
 * JSON-LD structured data for the marketing landing. Helps search engines and
 * AI answer engines understand what Scrivetta is (a SaaS app), who publishes
 * it, and how it's priced — which can surface richer results.
 */
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
          "@type": "Offer",
          price: SUBSCRIPTION.priceLabel.replace(/[^0-9.]/g, ""),
          priceCurrency: "USD",
          category: "subscription",
        },
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
