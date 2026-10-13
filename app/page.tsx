import type { Metadata } from "next";
import { LandingGate } from "@/components/landing/landing-gate";
import { StructuredData } from "@/components/landing/structured-data";
import { MarketingShell } from "@/components/marketing-shell";
import { LandingHero } from "@/components/landing/landing-hero";
import {
  LandingAudience,
  LandingClosing,
  LandingCompare,
  LandingCraft,
  LandingEditor,
  LandingMarquee,
  LandingPillars,
  LandingPricing,
  LandingSample,
} from "@/components/landing/landing-sections";
import { LandingDemo } from "@/components/landing/landing-demo";
import { Faq } from "@/components/landing/faq";
import { BRAND } from "@/lib/brand";
import { SHARE_DESCRIPTION, SHARE_TITLE } from "@/lib/site";

// Title/description come from the root layout defaults; only the URL is set here.
// openGraph is restated in full because metadata objects merge shallowly.
export const metadata: Metadata = {
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: BRAND,
    title: SHARE_TITLE,
    description: SHARE_DESCRIPTION,
    url: "/",
    locale: "en_US",
  },
};

export default function Home() {
  return (
    <LandingGate>
      <StructuredData />
      <MarketingShell ambient="full">
        <LandingHero />
        <LandingPillars />
        <LandingMarquee />
        <LandingCraft />
        <LandingDemo />
        <LandingEditor />
        <LandingSample />
        <LandingCompare />
        <LandingAudience />
        <LandingPricing />
        <Faq />
        <LandingClosing />
      </MarketingShell>
    </LandingGate>
  );
}
