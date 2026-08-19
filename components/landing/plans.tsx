import { ButtonLink } from "@/components/ui";
import { PACKS, SUBSCRIPTION } from "@/lib/pricing";
import { Reveal } from "./reveal";

export function Plans() {
  return (
    <section id="plans" className="mx-auto w-full max-w-5xl px-6 py-24">
      <Reveal className="text-center">
        <p className="font-[family-name:var(--font-fraunces)] text-sm uppercase tracking-[0.3em] text-gold">
          Simple pricing
        </p>
        <h2 className="mt-3 font-[family-name:var(--font-fraunces)] text-4xl font-medium tracking-tight text-foreground">
          Pay by the page
        </h2>
        <p className="mx-auto mt-3 max-w-lg text-ink-soft">
          1 credit writes roughly one page. Subscribe for monthly credits, or top up any time.
        </p>
      </Reveal>

      <div className="mt-14 grid gap-6 lg:grid-cols-5">
        {/* Subscription — featured */}
        <Reveal className="lg:col-span-3">
          <div className="relative h-full overflow-hidden rounded-3xl border border-accent/30 bg-paper p-8 shadow-xl shadow-accent/5">
            <div
              aria-hidden
              className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-accent/10 blur-3xl"
            />
            <span className="inline-flex items-center rounded-full bg-accent/10 px-3 py-1 text-xs font-medium text-accent">
              Best value
            </span>
            <div className="mt-5 flex items-end gap-2">
              <span className="font-[family-name:var(--font-fraunces)] text-5xl font-medium text-foreground">
                {SUBSCRIPTION.priceLabel}
              </span>
              <span className="pb-1.5 text-ink-soft">/ {SUBSCRIPTION.period}</span>
            </div>
            <p className="mt-3 text-foreground">
              <span className="font-semibold">{SUBSCRIPTION.credits} credits</span> every {SUBSCRIPTION.period}
              {" "}— about {SUBSCRIPTION.credits} pages of finished writing.
            </p>
            <ul className="mt-6 space-y-2.5 text-sm text-ink-soft">
              {[
                "Full-length ebooks, cover to cover",
                "Outline, chapters, and an editorial pass",
                "Typeset PDF export",
                "Unused credits roll over",
              ].map((f) => (
                <li key={f} className="flex items-center gap-2.5">
                  <Check /> {f}
                </li>
              ))}
            </ul>
            <div className="mt-8">
              <ButtonLink href="/register">Start writing</ButtonLink>
            </div>
          </div>
        </Reveal>

        {/* Credit packs */}
        <Reveal className="lg:col-span-2" delay={120}>
          <div className="flex h-full flex-col rounded-3xl border border-hairline bg-paper p-8">
            <h3 className="font-medium text-foreground">One-time credit packs</h3>
            <p className="mt-1 text-sm text-ink-soft">No subscription — just top up.</p>
            <ul className="mt-6 space-y-3">
              {PACKS.map((pack) => (
                <li
                  key={pack.credits}
                  className="flex items-center justify-between rounded-xl border border-hairline bg-paper-soft/50 px-4 py-3"
                >
                  <span className="text-foreground">
                    <span className="font-semibold">{pack.credits}</span> credits
                  </span>
                  <span className="font-[family-name:var(--font-fraunces)] text-lg text-foreground">
                    {pack.priceLabel}
                  </span>
                </li>
              ))}
            </ul>
            <div className="mt-auto pt-6">
              <ButtonLink href="/register" variant="secondary" className="w-full">
                Create an account
              </ButtonLink>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function Check() {
  return (
    <svg className="h-4 w-4 shrink-0 text-accent" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
