import { Reveal } from "./reveal";

const steps = [
  {
    k: "01",
    title: "Share what you know",
    body: "Describe the book, then upload notes, documents, or a project. Rough notes are fine.",
  },
  {
    k: "02",
    title: "Review your blueprint",
    body: "Scrivetta proposes the chapters and asks about anything your material doesn’t cover. Edit, answer, approve.",
  },
  {
    k: "03",
    title: "Choose the depth",
    body: "Quick, Standard, or Comprehensive. Scrivetta estimates the length before you spend a credit.",
  },
  {
    k: "04",
    title: "Get your book",
    body: "Chapters written from your knowledge, edited, and typeset as a PDF. Keep refining it in the editor.",
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
            From what you know to a finished book
          </h2>
        </Reveal>

        <div className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
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
                    className="absolute right-[-13px] top-9 hidden text-hairline-2 lg:block"
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

        <Reveal className="mx-auto mt-8 max-w-2xl">
          <p className="rounded-2xl border border-hairline bg-surface px-5 py-4 text-sm leading-6 text-muted">
            <span className="font-semibold text-foreground">In a hurry? Take the quick path.</span>{" "}
            Skip the materials and Scrivetta drafts the book from your brief alone — great
            for a fast first draft you rework in the editor. That draft leans on general
            knowledge, so read it, check the facts, and add your own experience before you
            publish.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
