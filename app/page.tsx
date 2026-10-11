import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Hero } from "@/components/landing/hero";
import { Features } from "@/components/landing/features";
import { HowItWorks } from "@/components/landing/how-it-works";
import { Plans } from "@/components/landing/plans";
import { Faq } from "@/components/landing/faq";
import { Reveal } from "@/components/landing/reveal";
import { LandingGate } from "@/components/landing/landing-gate";
import { StructuredData } from "@/components/landing/structured-data";
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
      <SiteHeader />

      <main className="flex-1">
        <Hero />
        <Features />
        <HowItWorks />
        <Plans />
        <WhatYouGet />
        <Faq />

        {/* Closing CTA */}
        <section className="mx-auto w-full max-w-6xl px-6 pb-24">
          <Reveal>
            <div className="relative overflow-hidden rounded-3xl px-8 py-16 text-center text-white shadow-float">
              <div
                aria-hidden
                className="absolute inset-0 -z-10"
                style={{
                  background:
                    "radial-gradient(120% 140% at 50% 0%, #6d5ef0 0%, #3f32b0 60%, #241d5e 100%)",
                }}
              />
              <h2 className="text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
                Your book is already in{" "}
                <span className="font-[family-name:var(--font-display)] italic font-medium">
                  your notes
                </span>
                .
              </h2>
              <p className="mx-auto mt-3 max-w-md text-white/80">
                Plan it free: add your material, review the blueprint, and see the
                estimated length before you spend a credit.
              </p>
              <div className="mt-8 flex justify-center">
                <Link
                  href="/register"
                  className="inline-flex items-center justify-center rounded-xl bg-white px-5 py-3 text-sm font-semibold text-[#3f32b0] shadow-soft transition hover:bg-white/90"
                >
                  Plan your book free
                </Link>
              </div>
            </div>
          </Reveal>
        </section>
      </main>

      <SiteFooter />
    </LandingGate>
  );
}

function WhatYouGet() {
  return (
    <section className="mx-auto w-full max-w-3xl px-6 py-16 text-center">
      <Reveal>
        <p className="text-xs font-semibold uppercase tracking-[0.08em] text-accent-ink">
          What you get
        </p>
        <p className="mt-5 text-balance font-[family-name:var(--font-display)] text-2xl leading-snug tracking-tight text-foreground sm:text-3xl">
          A complete ebook built from your knowledge — a blueprint you approved, every
          chapter, an editorial pass, a quality check, and a typeset PDF.
        </p>
      </Reveal>
    </section>
  );
}
