import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { ButtonLink } from "@/components/ui";
import { Hero } from "@/components/landing/hero";
import { HowItWorks } from "@/components/landing/how-it-works";
import { Plans } from "@/components/landing/plans";
import { Reveal } from "@/components/landing/reveal";
import { LandingGate } from "@/components/landing/landing-gate";

export default function Home() {
  return (
    <LandingGate>
      <SiteHeader />

      <main className="flex-1">
        <Hero />
        <HowItWorks />
        <Plans />

        {/* Closing CTA */}
        <section className="mx-auto w-full max-w-5xl px-6 pb-24">
          <Reveal>
            <div className="relative overflow-hidden rounded-3xl border border-hairline bg-foreground px-8 py-14 text-center">
              <h2 className="font-[family-name:var(--font-fraunces)] text-3xl font-medium tracking-tight text-background">
                Your first chapter is one prompt away.
              </h2>
              <p className="mx-auto mt-3 max-w-md text-background/70">
                Turn an idea into a complete, readable ebook in minutes.
              </p>
              <div className="mt-7 flex justify-center">
                <ButtonLink
                  href="/register"
                  className="border-transparent bg-background text-foreground hover:opacity-90"
                >
                  Start writing
                </ButtonLink>
              </div>
            </div>
          </Reveal>
        </section>
      </main>

      <SiteFooter />
    </LandingGate>
  );
}
