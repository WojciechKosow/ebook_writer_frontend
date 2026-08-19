import { Reveal } from "./reveal";
import { PhoneMockup } from "./phone-mockup";

const steps = [
  {
    title: "Describe your idea",
    body: "Topic, audience, style, language, and a rough length. One short brief is all it takes.",
  },
  {
    title: "We plan the book",
    body: "A working title, a chapter outline, and writing guidelines — structured, never generic.",
  },
  {
    title: "Every chapter, written & edited",
    body: "Chapters are written in order, then an editorial pass keeps the tone and terminology consistent.",
  },
  {
    title: "Read it on any device",
    body: "A typeset PDF with a cover, table of contents, and page numbers — ready to read or sell.",
  },
];

export function HowItWorks() {
  return (
    <section id="how" className="border-y border-hairline bg-paper-soft/50">
      <div className="mx-auto w-full max-w-5xl px-6 py-24">
        <Reveal className="text-center">
          <p className="font-[family-name:var(--font-fraunces)] text-sm uppercase tracking-[0.3em] text-gold">
            The process
          </p>
          <h2 className="mt-3 font-[family-name:var(--font-fraunces)] text-4xl font-medium tracking-tight text-foreground">
            How it works
          </h2>
        </Reveal>

        <div className="mt-16 grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          {/* Steps */}
          <ol className="relative">
            {/* connecting line */}
            <span
              aria-hidden
              className="absolute left-[15px] top-2 bottom-2 w-px bg-hairline"
            />
            {steps.map((step, i) => (
              <Reveal key={step.title} delay={i * 120}>
                <li className="relative flex gap-5 pb-9 last:pb-0">
                  <span className="relative z-10 grid h-8 w-8 shrink-0 place-items-center rounded-full border border-hairline bg-paper font-[family-name:var(--font-fraunces)] text-sm font-semibold text-accent">
                    {i + 1}
                  </span>
                  <div className="pt-0.5">
                    <h3 className="font-medium text-foreground">{step.title}</h3>
                    <p className="mt-1 text-sm leading-6 text-ink-soft">{step.body}</p>
                  </div>
                </li>
              </Reveal>
            ))}
          </ol>

          {/* Result: the phone */}
          <Reveal delay={200}>
            <PhoneMockup />
          </Reveal>
        </div>
      </div>
    </section>
  );
}
