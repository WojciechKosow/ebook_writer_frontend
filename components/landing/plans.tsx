import { ButtonLink } from "@/components/ui";
import { PACKS, SUBSCRIPTION } from "@/lib/pricing";
import { Reveal } from "./reveal";

const SUB_FEATURES = [
  "Full-length ebooks, cover to cover",
  "Outline, chapters, and an editorial pass",
  "Typeset PDF export",
  "Unused credits roll over",
];

export function Plans() {
  return (
    <section id="pricing" className="mx-auto w-full max-w-6xl px-6 py-24">
      <Reveal className="mx-auto max-w-2xl text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.08em] text-accent-ink">
          Pricing
        </p>
        <h2 className="mt-3 text-balance text-4xl font-semibold tracking-tight text-foreground">
          Pay for the pages you write
        </h2>
        <p className="mt-3 text-lg text-muted">
          1 credit writes roughly one page. Subscribe for monthly credits, or top up
          any time — credits never expire.
        </p>
      </Reveal>

      <div className="mx-auto mt-14 grid max-w-4xl gap-5 lg:grid-cols-5">
        {/* Subscription — featured */}
        <Reveal className="lg:col-span-3">
          <div className="relative h-full overflow-hidden rounded-2xl border border-[color-mix(in_oklab,var(--accent)_45%,var(--hairline))] bg-surface p-8 shadow-float">
            <div
              aria-hidden
              className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-accent/10 blur-3xl"
            />
            <span className="inline-flex items-center rounded-full bg-accent px-3 py-1 text-xs font-semibold text-white">
              Best value
            </span>
            <div className="mt-5 flex items-end gap-2">
              <span className="text-5xl font-bold tracking-tight text-foreground tabular-nums">
                {SUBSCRIPTION.priceLabel}
              </span>
              <span className="pb-1.5 text-muted">/ {SUBSCRIPTION.period}</span>
            </div>
            <p className="mt-3 text-foreground-2">
              <span className="font-semibold text-foreground">{SUBSCRIPTION.credits} credits</span> every{" "}
              {SUBSCRIPTION.period} — about {SUBSCRIPTION.credits} pages of finished writing.
            </p>
            <ul className="mt-6 space-y-3 text-sm text-foreground-2">
              {SUB_FEATURES.map((f) => (
                <li key={f} className="flex items-start gap-2.5">
                  <Check /> {f}
                </li>
              ))}
            </ul>
            <div className="mt-8">
              <ButtonLink href="/register" className="px-5 py-3">
                Start writing
              </ButtonLink>
            </div>
          </div>
        </Reveal>

        {/* Credit packs */}
        <Reveal className="lg:col-span-2" delay={120}>
          <div className="flex h-full flex-col rounded-2xl border border-hairline bg-surface p-8 shadow-soft">
            <h3 className="font-semibold text-foreground">One-time credit packs</h3>
            <p className="mt-1 text-sm text-muted">No subscription — just top up.</p>
            <ul className="mt-6 space-y-3">
              {PACKS.map((pack) => (
                <li
                  key={pack.credits}
                  className="flex items-center justify-between rounded-xl border border-hairline bg-surface-2 px-4 py-3"
                >
                  <span className="text-foreground">
                    <span className="font-semibold tabular-nums">{pack.credits}</span> credits
                  </span>
                  <span className="text-lg font-semibold text-foreground tabular-nums">
                    {pack.priceLabel}
                  </span>
                </li>
              ))}
            </ul>
            <div className="mt-auto pt-6">
              <ButtonLink href="/register" variant="secondary" className="w-full px-5 py-3">
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
    <svg className="mt-0.5 h-4 w-4 shrink-0 text-good" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
