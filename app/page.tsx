import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Hero } from "@/components/landing/hero";
import { Features } from "@/components/landing/features";
import { HowItWorks } from "@/components/landing/how-it-works";
import { Plans } from "@/components/landing/plans";
import { Reveal } from "@/components/landing/reveal";
import { LandingGate } from "@/components/landing/landing-gate";
import { StructuredData } from "@/components/landing/structured-data";

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
                Your first chapter is{" "}
                <span className="font-[family-name:var(--font-display)] italic font-medium">
                  one prompt
                </span>{" "}
                away.
              </h2>
              <p className="mx-auto mt-3 max-w-md text-white/80">
                Turn an idea into a complete, readable ebook in minutes. Start free — no
                card required.
              </p>
              <div className="mt-8 flex justify-center">
                <Link
                  href="/register"
                  className="inline-flex items-center justify-center rounded-xl bg-white px-5 py-3 text-sm font-semibold text-[#3f32b0] shadow-soft transition hover:bg-white/90"
                >
                  Start writing free
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
          A complete ebook — outline, every chapter, a consistency pass, and a typeset
          PDF ready to read, publish, or share.
        </p>
      </Reveal>
    </section>
  );
}
