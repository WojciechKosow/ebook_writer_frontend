import Link from "next/link";

const CHECK = (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="shrink-0 text-ip-brass">
    <path d="m5 12 4.5 4.5L19 7" />
  </svg>
);

/** Headline words fade up one after another on load. */
function Word({ children, delay, em = false }: { children: React.ReactNode; delay: number; em?: boolean }) {
  const Tag = em ? "em" : "span";
  return (
    <Tag className={`ip-word${em ? " italic text-ip-brass" : ""}`} style={{ animationDelay: `${delay}s` }}>
      {children}
    </Tag>
  );
}

export function LandingHero() {
  return (
    <section className="mx-auto grid w-full max-w-[1200px] grid-cols-1 items-center gap-14 px-4 pb-16 pt-14 sm:px-6 md:pt-[88px] lg:grid-cols-2">
      <div className="flex min-w-0 flex-col gap-7">
        <a
          href="#faq"
          className="ip-in inline-flex items-center gap-2.5 self-start rounded-full border border-ip-hair bg-ip-surface py-[7px] pl-2 pr-3.5 text-[13px] text-ip-ink-2"
        >
          <span className="rounded-full bg-ip-ink px-2.5 py-[3px] font-mono text-[11px] tracking-[0.05em] text-ip-bg">SOON</span>
          A dedicated fiction builder is on the way →
        </a>
        <h1 className="ip-display text-[clamp(44px,6.4vw,92px)] leading-none tracking-[-0.025em]">
          <Word delay={0.05}>Your</Word> <Word delay={0.15}>knowledge</Word> <Word delay={0.25}>in.</Word>
          <br />
          <Word delay={0.45}>A</Word> <Word delay={0.6} em>finished book</Word> <Word delay={0.8}>out.</Word>
        </h1>
        <p className="ip-in m-0 max-w-[520px] text-[19px] leading-relaxed text-ip-ink-2" style={{ animationDelay: "1s" }}>
          Upload your notes, documents, or project. Scrivetta maps what you know, asks about the
          gaps, and writes a typeset ebook in your voice — cover to cover.
        </p>
        <div className="ip-in flex flex-wrap items-center gap-3" style={{ animationDelay: "1.15s" }}>
          <Link
            href="/register"
            className="ip-cta inline-flex items-center gap-2.5 rounded-[14px] bg-ip-ink px-6 py-4 font-semibold text-ip-bg"
          >
            Plan your book free
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M5 12h14M13 6l6 6-6 6" />
            </svg>
          </Link>
          <a href="#how" className="ip-cta rounded-[14px] border border-ip-line bg-ip-surface px-[22px] py-4 font-medium">
            See how it works
          </a>
        </div>
        <div className="ip-in flex flex-wrap gap-x-[22px] gap-y-2.5 text-sm text-ip-muted" style={{ animationDelay: "1.3s" }}>
          <span className="inline-flex items-center gap-[7px]">{CHECK}Built from your own material</span>
          <span className="inline-flex items-center gap-[7px]">{CHECK}You approve the plan</span>
          <span className="inline-flex items-center gap-[7px]">{CHECK}Pay only for pages you get</span>
        </div>
      </div>

      <HeroArt />
    </section>
  );
}

/** A finished cover with a typeset page behind it — what the reader gets. */
function HeroArt() {
  return (
    <div
      className="ip-in ip-hero-art relative mx-auto flex h-[580px] w-full max-w-[560px] items-center justify-center [perspective:1800px]"
      style={{ animationDelay: ".4s", animationDuration: "1.4s" }}
      aria-hidden="true"
    >
      <div className="ip-page absolute right-[2%] top-10 flex h-[450px] w-[320px] flex-col gap-3 rounded border border-ip-hair bg-ip-paper px-[38px] py-11 ip-shadow">
        <div className="font-mono text-[10px] tracking-[0.14em] text-ip-brass">CHAPTER THREE</div>
        <div className="font-display text-[26px] leading-[1.1]">Designing your morning</div>
        <div className="my-1 h-px w-9 bg-ip-brass-l" />
        <div className="font-display text-[12.5px] leading-[1.65] text-ip-ink-2">
          <span className="float-left pr-1.5 pt-1 text-[46px] leading-[.85] text-ip-ink">T</span>
          he first hour sets the tone for everything that follows. Not because mornings are magic,
          but because they are the only part of the day you fully own — before the inbox, before
          the calls, before anyone else&apos;s priorities arrive at your door.
        </div>
        <div className="mt-auto text-center font-display text-[11px] text-ip-muted">14</div>
      </div>

      <div className="ip-book relative left-[-12%] h-[440px] w-[300px]">
        <div
          className="absolute inset-0 flex flex-col overflow-hidden rounded-[3px_8px_8px_3px] bg-ip-cover px-[30px] py-10"
          style={{ transform: "translateZ(14px)", boxShadow: "0 50px 90px -30px rgba(20,14,40,.55)" }}
        >
          <div className="absolute inset-3.5 rounded-sm border border-[rgba(217,174,104,.45)]" />
          <div className="absolute inset-y-0 left-0 w-4 bg-[linear-gradient(90deg,rgba(0,0,0,.35),rgba(255,255,255,.06)_60%,transparent)]" />
          <div className="mt-[18px] text-center font-mono text-[10px] tracking-[0.2em] text-[#d9ae68]">A PRACTICAL GUIDE</div>
          <div className="mt-[26px] text-center font-display text-[38px] font-light leading-[1.02] text-[#f3e7cf]">
            The Quiet
            <br />
            <em>Productivity</em>
            <br />
            Method
          </div>
          <svg width="44" height="18" viewBox="0 0 44 18" fill="none" className="mt-6 self-center">
            <path d="M2 9h14M28 9h14" stroke="#D9AE68" strokeWidth="1" />
            <path d="M22 3l5 6-5 6-5-6z" stroke="#D9AE68" strokeWidth="1" />
          </svg>
          <div className="mt-4 text-center font-display text-sm italic text-[rgba(243,231,207,.75)]">
            Build calm, focused routines that last
          </div>
          <div className="mt-auto text-center font-mono text-[11px] tracking-[0.18em] text-[#d9ae68]">YOUR NAME</div>
        </div>
        <div
          className="absolute -right-3 bottom-1.5 top-1.5 w-[26px] origin-left bg-[repeating-linear-gradient(to_bottom,#f4eee2_0_2px,#e3dac8_2px_3px)]"
          style={{ transform: "rotateY(90deg)" }}
        />
      </div>

      <div className="ip-chip absolute left-0 top-[70px] flex items-center gap-2.5 rounded-[14px] border border-ip-hair bg-ip-glass px-3.5 py-[11px] text-[13px] backdrop-blur-md ip-shadow-sm">
        <span className="grid h-[26px] w-[26px] place-items-center rounded-lg bg-ip-ink text-ip-bg">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M4 6h16M4 12h10M4 18h13" />
          </svg>
        </span>
        <span>
          <b className="font-semibold">Blueprint approved</b>
          <br />
          <span className="text-ip-muted">7 chapters · from your notes</span>
        </span>
      </div>
      <div
        className="ip-chip absolute bottom-[70px] right-0 flex items-center gap-2.5 rounded-[14px] border border-ip-hair bg-ip-glass px-3.5 py-[11px] text-[13px] backdrop-blur-md ip-shadow-sm"
        style={{ animationDuration: "7s", animationDelay: "1.2s" }}
      >
        <span className="grid h-[26px] w-[26px] place-items-center rounded-full bg-ip-good text-white">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
            <path d="m5 12 4.5 4.5L19 7" />
          </svg>
        </span>
        <span>
          <b className="font-semibold">Ready to publish</b>
          <br />
          <span className="text-ip-muted">48 pages · typeset 6×9″ PDF</span>
        </span>
      </div>
    </div>
  );
}
