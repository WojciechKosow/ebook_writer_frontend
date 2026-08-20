import { Reveal } from "./reveal";

const steps = [
  {
    k: "01",
    title: "Describe your book",
    body: "Topic, genre, audience, and length. A sentence is enough to start.",
  },
  {
    k: "02",
    title: "Scrivetta writes it",
    body: "Outline, chapters, and a consistency edit — while you watch progress fill in.",
  },
  {
    k: "03",
    title: "Export & publish",
    body: "Download a typeset PDF, or keep editing. It’s your manuscript.",
  },
];

export function HowItWorks() {
  return (
    <section id="how" className="mx-auto w-full max-w-6xl px-6 py-8">
      <div className="rounded-3xl border border-hairline bg-surface-2 px-6 py-16 sm:px-10">
        <Reveal className="mx-auto max-w-xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.08em] text-accent-ink">
            How it works
          </p>
          <h2 className="mt-3 text-balance text-4xl font-semibold tracking-tight text-foreground">
            Three steps to a finished book
          </h2>
        </Reveal>

        <div className="mt-12 grid gap-4 md:grid-cols-3">
          {steps.map((s, i) => (
            <Reveal key={s.k} delay={i * 110}>
              <div className="relative h-full rounded-2xl border border-hairline bg-surface p-6">
                <span className="font-[family-name:var(--font-display)] text-2xl italic font-medium text-accent">
                  {s.k}
                </span>
                <h3 className="mt-2 text-[17px] font-semibold text-foreground">{s.title}</h3>
                <p className="mt-1.5 text-sm leading-6 text-muted">{s.body}</p>
                {i < steps.length - 1 && (
                  <svg
                    className="absolute right-[-13px] top-9 hidden text-hairline-2 md:block"
                    width="26"
                    height="26"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    aria-hidden
                  >
                    <path d="M5 12h14M13 6l6 6-6 6" />
                  </svg>
                )}
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
