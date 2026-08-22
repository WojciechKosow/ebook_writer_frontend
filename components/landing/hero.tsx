import { ButtonLink } from "@/components/ui";
import { Showcase } from "@/components/landing/showcase";

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      {/* soft ink glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[520px]"
        style={{
          background:
            "radial-gradient(60% 60% at 50% 0%, color-mix(in oklab, var(--accent) 15%, transparent), transparent 72%)",
        }}
      />
      {/* faint ruled paper, fading out */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 opacity-50"
        style={{
          backgroundImage: "linear-gradient(var(--hairline) 1px, transparent 1px)",
          backgroundSize: "100% 34px",
          maskImage: "linear-gradient(180deg, #000, transparent 55%)",
          WebkitMaskImage: "linear-gradient(180deg, #000, transparent 55%)",
        }}
      />

      <div className="mx-auto w-full max-w-6xl px-6 pb-8 pt-20 text-center sm:pt-24">
        <span className="inline-flex items-center gap-2 rounded-full border border-hairline-2 bg-surface px-3 py-1 text-xs font-semibold text-muted">
          <span className="h-1.5 w-1.5 rounded-full bg-brass" />
          AI writing studio for authors
        </span>

        <h1 className="mx-auto mt-6 max-w-3xl text-balance text-5xl font-semibold leading-[1.02] tracking-tight text-foreground sm:text-6xl">
          One idea in. A{" "}
          <span className="font-[family-name:var(--font-display)] italic font-medium text-accent">
            finished book
          </span>{" "}
          out.
        </h1>

        <p className="mx-auto mt-6 max-w-xl text-lg leading-8 text-muted">
          Describe what you want to write. Scrivetta plans the outline, writes every
          chapter, edits for consistency, and hands you a typeset PDF — cover to cover.
        </p>

        <div className="mt-8 flex items-center justify-center gap-3">
          <ButtonLink href="/register" className="px-5 py-3 text-[15px]">
            Start writing free
          </ButtonLink>
          <ButtonLink href="#how" variant="secondary" className="px-5 py-3 text-[15px]">
            See how it works →
          </ButtonLink>
        </div>

        <div className="mt-6 flex flex-wrap justify-center gap-x-5 gap-y-2 text-sm text-faint">
          <span>✓ No blank page</span>
          <span>✓ Chapter-by-chapter</span>
          <span>✓ Export-ready PDF</span>
        </div>

        <Showcase captions={false} className="mt-14" />
      </div>
    </section>
  );
}
