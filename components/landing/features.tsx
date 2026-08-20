import { Reveal } from "./reveal";

export function Features() {
  return (
    <section id="features" className="mx-auto w-full max-w-6xl px-6 py-24">
      <Reveal className="mx-auto max-w-2xl text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.08em] text-accent-ink">
          Everything in one studio
        </p>
        <h2 className="mt-3 text-balance text-4xl font-semibold tracking-tight text-foreground">
          From premise to polished manuscript
        </h2>
        <p className="mt-3 text-lg text-muted">
          Not a chat window. A writing pipeline that keeps voice, plot, and structure
          consistent across a whole book.
        </p>
      </Reveal>

      <div className="mt-14 grid gap-4 md:grid-cols-3">
        {/* Wide feature: chapter-by-chapter */}
        <Reveal className="md:col-span-2">
          <Card className="flex h-full flex-col justify-between bg-gradient-to-br from-surface to-surface-2">
            <div>
              <Icon>{IconBook}</Icon>
              <h3 className="mt-4 text-lg font-semibold tracking-tight text-foreground">
                Written chapter by chapter
              </h3>
              <p className="mt-2 max-w-md text-sm leading-6 text-muted">
                Scrivetta drafts a full outline first, then writes each chapter in
                sequence — carrying characters, arguments, and tone forward so the last
                page still sounds like the first.
              </p>
            </div>
            <ChapterRail />
          </Card>
        </Reveal>

        <Reveal delay={80}>
          <Card className="h-full">
            <Icon>{IconPen}</Icon>
            <h3 className="mt-4 text-lg font-semibold tracking-tight text-foreground">
              Guided from one prompt
            </h3>
            <p className="mt-2 text-sm leading-6 text-muted">
              Give it a topic, an audience, and a length. Scrivetta asks the right
              follow-ups, then takes it from there.
            </p>
          </Card>
        </Reveal>

        <Reveal delay={40}>
          <Card className="h-full">
            <Icon tone="brass">{IconFile}</Icon>
            <h3 className="mt-4 text-lg font-semibold tracking-tight text-foreground">
              Typeset PDF export
            </h3>
            <p className="mt-2 text-sm leading-6 text-muted">
              A properly laid-out book with title page, chapters, and a cover — ready to
              publish or share.
            </p>
          </Card>
        </Reveal>

        <Reveal delay={80}>
          <Card className="h-full">
            <Icon>{IconCheck}</Icon>
            <h3 className="mt-4 text-lg font-semibold tracking-tight text-foreground">
              Consistency editor
            </h3>
            <p className="mt-2 text-sm leading-6 text-muted">
              A final editing pass catches contradictions, repeated points, and drifting
              tone across chapters.
            </p>
          </Card>
        </Reveal>

        <Reveal delay={120}>
          <Card className="h-full">
            <Icon>{IconClock}</Icon>
            <h3 className="mt-4 text-lg font-semibold tracking-tight text-foreground">
              Live progress
            </h3>
            <p className="mt-2 text-sm leading-6 text-muted">
              Watch chapters land in real time. Pick up any draft where you left off, from
              any device.
            </p>
          </Card>
        </Reveal>
      </div>
    </section>
  );
}

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={`rounded-2xl border border-hairline bg-surface p-6 shadow-soft transition-transform duration-200 hover:-translate-y-0.5 ${className}`}
    >
      {children}
    </div>
  );
}

function Icon({ children, tone = "accent" }: { children: React.ReactNode; tone?: "accent" | "brass" }) {
  const cls =
    tone === "brass" ? "bg-brass-soft text-brass" : "bg-accent-soft text-accent-ink";
  return <div className={`grid h-10 w-10 place-items-center rounded-xl ${cls}`}>{children}</div>;
}

function ChapterRail() {
  const rows = [
    { n: 1, label: "The premise", pct: 100, on: true },
    { n: 2, label: "Rising action", pct: 100, on: true },
    { n: 3, label: "The turn", pct: 58, on: false },
    { n: 4, label: "Resolution", pct: 0, on: false },
  ];
  return (
    <div className="mt-6 flex flex-col gap-2">
      {rows.map((r) => (
        <div key={r.n} className="flex items-center gap-3 text-[13px] text-foreground-2">
          <span
            className={`grid h-6 w-6 shrink-0 place-items-center rounded-[7px] text-[11px] font-bold ${
              r.on ? "bg-accent text-white" : "bg-surface-3 text-muted"
            }`}
          >
            {r.n}
          </span>
          <span className="w-24 shrink-0 truncate">{r.label}</span>
          <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-surface-3">
            <span
              className={`block h-full rounded-full bg-accent-2 ${r.pct > 0 && r.pct < 100 ? "bar-live" : ""}`}
              style={{ width: `${r.pct}%` }}
            />
          </span>
        </div>
      ))}
    </div>
  );
}

// ---- icons (as elements passed to <Icon>) ---------------------------------
const svg = "h-5 w-5";
const IconBook = (
  <svg className={svg} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2Z" />
  </svg>
);
const IconPen = (
  <svg className={svg} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 20h9" />
    <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />
  </svg>
);
const IconFile = (
  <svg className={svg} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 22V4a2 2 0 0 1 2-2h9l5 5v15" />
    <path d="M14 2v6h6" />
  </svg>
);
const IconCheck = (
  <svg className={svg} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 6 9 17l-5-5" />
  </svg>
);
const IconClock = (
  <svg className={svg} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3 2" />
  </svg>
);
