import { ButtonLink } from "@/components/ui";

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

        <ProductPreview />
      </div>
    </section>
  );
}

/** A framed screenshot-style mock of the app dashboard. */
function ProductPreview() {
  return (
    <div className="mx-auto mt-14 max-w-4xl overflow-hidden rounded-2xl border border-hairline bg-surface text-left shadow-float">
      <div className="flex items-center gap-2 border-b border-hairline bg-surface-2 px-4 py-3">
        <div className="flex gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-hairline-2" />
          <span className="h-2.5 w-2.5 rounded-full bg-hairline-2" />
          <span className="h-2.5 w-2.5 rounded-full bg-hairline-2" />
        </div>
        <div className="ml-2 hidden h-6 max-w-xs flex-1 items-center rounded-lg border border-hairline bg-surface px-3 text-xs text-faint sm:flex">
          app.scrivetta.com/dashboard
        </div>
      </div>
      <div className="grid min-h-[320px] grid-cols-1 sm:grid-cols-[190px_1fr]">
        <div className="hidden flex-col gap-1 border-r border-hairline bg-surface-2 p-3 sm:flex">
          <PreviewNav active label="New ebook" />
          <PreviewNav label="Your library" />
          <PreviewNav label="Billing" />
        </div>
        <div className="p-5">
          <div className="flex items-center justify-between">
            <p className="text-[17px] font-semibold text-foreground">Your library</p>
            <span className="rounded-full border border-hairline bg-accent-soft px-2.5 py-0.5 text-[11px] font-semibold text-accent-ink">
              3 in progress
            </span>
          </div>
          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <PreviewCard title="The Tide Between Us" meta="Literary fiction · 12 chapters" pct={100} state="done" />
            <PreviewCard title="Systems of Small Wins" meta="Self-help · chapter 6 of 10" pct={62} state="writing" />
            <PreviewCard title="Marrow & Ash" meta="Fantasy · outlining" pct={18} state="draft" />
            <PreviewCard title="A Quiet Ledger" meta="Memoir · 9 chapters" pct={100} state="done" />
          </div>
        </div>
      </div>
    </div>
  );
}

function PreviewNav({ label, active = false }: { label: string; active?: boolean }) {
  return (
    <div
      className={`flex items-center gap-2 rounded-lg px-2.5 py-2 text-[13px] font-medium ${
        active ? "bg-accent-soft text-accent-ink" : "text-muted"
      }`}
    >
      <span className="h-3.5 w-3.5 rounded-[5px] bg-current opacity-70" />
      {label}
    </div>
  );
}

const STATE_STYLES = {
  done: { label: "Done", cls: "bg-good-soft text-good" },
  writing: { label: "Writing", cls: "bg-accent-soft text-accent-ink" },
  draft: { label: "Draft", cls: "bg-surface-3 text-muted" },
} as const;

function PreviewCard({
  title,
  meta,
  pct,
  state,
}: {
  title: string;
  meta: string;
  pct: number;
  state: keyof typeof STATE_STYLES;
}) {
  const s = STATE_STYLES[state];
  return (
    <div className="rounded-xl border border-hairline bg-surface p-3.5">
      <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold ${s.cls}`}>
        ● {s.label}
      </span>
      <p className="mt-2 text-sm font-semibold text-foreground">{title}</p>
      <p className="text-xs text-faint">{meta}</p>
      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-surface-3">
        <div
          className={`h-full rounded-full bg-gradient-to-r from-accent to-accent-2 ${pct < 100 ? "bar-live" : ""}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
