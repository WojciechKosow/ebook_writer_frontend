import type { Metadata } from "next";
import { LandingGate } from "@/components/landing/landing-gate";
import { StructuredData } from "@/components/landing/structured-data";
import { AmbientLayer } from "@/components/landing/ambient";
import { LandingHeader } from "@/components/landing/landing-header";
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
import { LandingFooter } from "@/components/landing/landing-footer";
import { BRAND } from "@/lib/brand";
import { SITE_DESCRIPTION, SITE_TAGLINE } from "@/lib/site";

// Title/description come from the root layout defaults; only the URL is set here.
// openGraph is restated in full because metadata objects merge shallowly.
export const metadata: Metadata = {
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: BRAND,
    title: `${BRAND} — ${SITE_TAGLINE}`,
    description: SITE_DESCRIPTION,
    url: "/",
    locale: "en_US",
  },
};

export default function Home() {
  return (
    <LandingGate>
      <StructuredData />
      {/* "Ink & Paper": the landing's own palette, scoped so the app keeps its own. */}
      <div className="ink-paper relative flex min-h-full flex-1 flex-col overflow-x-clip">
        <AmbientLayer />
        <LandingHeader />
        <main className="relative z-[1] flex-1">
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
        </main>
        <LandingFooter />
      </div>
    </LandingGate>
  );
}
