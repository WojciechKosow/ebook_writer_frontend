// A phone showing a reading app with a real novel scrolling by — the finished
// ebook at the end of the pipeline. The text is Dostoevsky's "Crime and
// Punishment" (public domain, Constance Garnett translation): a small easter
// egg for anyone who reads it.

const PARAGRAPHS = [
  "On an exceptionally hot evening early in July a young man came out of the garret in which he lodged in S. Place and walked slowly, as though in hesitation, towards K. bridge.",
  "He had successfully avoided meeting his landlady on the staircase. His garret was under the roof of a high, five-storied house and was more like a cupboard than a room. The landlady who provided him with garret, dinners, and attendance, lived on the floor below, and every time he went out he was obliged to pass her kitchen, the door of which invariably stood open.",
  "And each time he passed, the young man had a sick, frightened feeling, which made him scowl and feel ashamed. He was hopelessly in debt to his landlady, and was afraid of meeting her.",
  "This was not because he was cowardly and abject, quite the contrary; but for some time past he had been in an overstrained, irritable condition, verging on hypochondria. He had become so completely absorbed in himself, and isolated from his fellows that he dreaded meeting, not only his landlady, but anyone at all.",
];

function Page() {
  return (
    <div className="px-5 pt-4">
      <p className="mb-3 text-center font-[family-name:var(--font-fraunces)] text-[13px] uppercase tracking-[0.3em] text-ink-soft">
        Chapter I
      </p>
      {PARAGRAPHS.map((p, i) => (
        <p
          key={i}
          className="mb-3 text-justify font-[family-name:var(--font-fraunces)] text-[13.5px] leading-[1.75] text-foreground/90"
        >
          {p}
        </p>
      ))}
    </div>
  );
}

export function PhoneMockup() {
  return (
    <div className="relative mx-auto w-[260px] sm:w-[280px]">
      {/* Soft glow behind the device */}
      <div
        aria-hidden
        className="absolute -inset-8 -z-10 rounded-full bg-accent/15 blur-3xl"
      />

      <div className="relative rounded-[2.6rem] border border-hairline bg-paper-soft p-2.5 shadow-2xl shadow-black/20 ring-1 ring-black/5">
        {/* Screen */}
        <div className="relative h-[540px] overflow-hidden rounded-[2rem] bg-paper">
          {/* Reading-app top bar */}
          <div className="relative z-20 flex items-center justify-between border-b border-hairline/70 bg-paper/90 px-4 py-3 backdrop-blur">
            <span className="text-ink-soft">‹</span>
            <span className="truncate px-2 text-center text-[11px] font-medium text-ink-soft">
              Crime and Punishment
            </span>
            <span className="text-ink-soft">⋯</span>
          </div>

          {/* Scrolling text */}
          <div className="relative h-[calc(540px-46px)] overflow-hidden">
            <div className="book-scroll-track">
              <Page />
              <Page />
            </div>

            {/* top/bottom fades */}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-x-0 top-0 h-12 bg-gradient-to-b from-paper to-transparent"
            />
            <div
              aria-hidden
              className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-paper to-transparent"
            />
          </div>

          {/* progress bar */}
          <div className="absolute inset-x-0 bottom-0 z-20 px-5 pb-4">
            <div className="h-1 w-full overflow-hidden rounded-full bg-hairline">
              <div className="h-full w-1/3 rounded-full bg-accent" />
            </div>
            <p className="mt-1.5 text-center text-[10px] text-ink-soft">Page 1 of 492</p>
          </div>
        </div>

        {/* Camera notch */}
        <div
          aria-hidden
          className="absolute left-1/2 top-[18px] h-1.5 w-16 -translate-x-1/2 rounded-full bg-black/20 dark:bg-white/15"
        />
      </div>
    </div>
  );
}
