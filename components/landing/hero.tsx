import { ButtonLink } from "@/components/ui";

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      {/* soft ink glow + faint ruled paper */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(60% 50% at 50% 0%, color-mix(in oklab, var(--accent) 16%, transparent), transparent 70%)",
        }}
      />

      <div className="mx-auto w-full max-w-4xl px-6 pb-20 pt-20 text-center sm:pt-28">
        <span className="inline-flex items-center gap-2 rounded-full border border-hairline bg-paper px-3 py-1 text-xs font-medium text-ink-soft">
          <PenNib className="h-3.5 w-3.5 text-gold" />
          AI ebook studio
        </span>

        <h1 className="mx-auto mt-7 max-w-3xl font-[family-name:var(--font-fraunces)] text-5xl font-medium leading-[1.05] tracking-tight text-foreground sm:text-6xl">
          From a single idea to a{" "}
          <span className="relative whitespace-nowrap text-accent">
            finished book
            <InkUnderline />
          </span>
          .
        </h1>

        <p className="mx-auto mt-6 max-w-xl text-lg leading-8 text-ink-soft">
          Describe what you want to write. We plan the outline, write every chapter,
          edit it for consistency, and hand you a typeset PDF — cover to cover.
        </p>

        <div className="mt-9 flex items-center justify-center gap-3">
          <ButtonLink href="/register">Start writing</ButtonLink>
          <ButtonLink href="#how" variant="secondary">
            See how it works
          </ButtonLink>
        </div>

        <p className="mt-8 text-sm text-ink-soft">
          No blank page · Written chapter by chapter · Delivered as a PDF
        </p>
      </div>
    </section>
  );
}

function InkUnderline() {
  return (
    <svg
      className="ink-underline absolute -bottom-2 left-0 h-3 w-full"
      viewBox="0 0 300 12"
      fill="none"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <path
        d="M3 8C60 3 110 3 160 6C210 9 260 9 297 4"
        stroke="var(--gold)"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}

function PenNib({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M4 20l4-1 9-9a2.5 2.5 0 10-3.5-3.5l-9 9-1 4z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path d="M8 19l-3-3" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="9" cy="15" r="0.6" fill="currentColor" />
    </svg>
  );
}
