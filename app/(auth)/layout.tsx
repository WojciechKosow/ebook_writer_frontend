import type { Metadata } from "next";
import Link from "next/link";
import { BrandMark } from "@/components/brand-mark";
import { ThemeToggle } from "@/components/theme-toggle";
import { AmbientLayer } from "@/components/landing/ambient";
import { BRAND } from "@/lib/brand";

// Auth pages are thin and per-visitor — keep them out of the index so they
// don't dilute the site's ranking or compete with the marketing landing.
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

/**
 * The door between the landing and the app, in the landing's Ink & Paper look:
 * the form on the left, and on wide screens an ink panel with a finished book
 * on the right — what the visitor is signing up to make.
 */
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="ink-paper relative flex min-h-screen flex-1 flex-col overflow-x-clip">
      <AmbientLayer variant="full" />

      <header className="relative z-10 mx-auto flex w-full max-w-[1200px] items-center justify-between gap-4 px-4 py-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2.5">
          <BrandMark className="h-8 w-8" />
          <span className="font-display text-[23px] font-medium tracking-[-0.01em]">{BRAND}</span>
        </Link>
        <ThemeToggle />
      </header>

      <main className="relative z-[1] mx-auto grid w-full max-w-[1200px] flex-1 grid-cols-1 items-center gap-12 px-4 pb-12 pt-4 sm:px-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:pb-16">
        <div className="flex justify-center lg:justify-start lg:pl-[6%]">{children}</div>
        <AuthAside />
      </main>
    </div>
  );
}

function AuthAside() {
  return (
    <aside
      aria-hidden="true"
      className="relative hidden min-h-[560px] overflow-hidden rounded-[32px] bg-ip-ink p-12 text-ip-bg lg:flex lg:flex-col"
    >
      <span className="ip-eyebrow !text-ip-brass-l">Your knowledge in. A finished book out.</span>
      <p className="ip-display mt-5 max-w-[420px] text-[44px] leading-[1.05]">
        Your book is already in <em className="text-ip-brass-l">your notes.</em>
      </p>

      <div className="relative mt-auto flex items-end justify-end pr-[8%] pt-10 [perspective:1600px]">
        <div
          className="relative flex h-[300px] w-[210px] flex-col overflow-hidden rounded-[3px_8px_8px_3px] bg-ip-cover px-[22px] py-[30px]"
          style={{ transform: "rotateY(-18deg) rotateX(6deg)", boxShadow: "0 40px 80px -30px rgba(0,0,0,.6)" }}
        >
          <div className="absolute inset-[11px] border border-[rgba(217,174,104,.45)]" />
          <div className="absolute inset-y-0 left-0 w-3 bg-[linear-gradient(90deg,rgba(0,0,0,.35),transparent)]" />
          <div className="mt-3 text-center font-mono text-[8px] tracking-[0.2em] text-[#d9ae68]">A PRACTICAL GUIDE</div>
          <div className="mt-[18px] text-center font-display text-[28px] font-light leading-[1.02] text-[#f3e7cf]">
            The Quiet
            <br />
            <em>Productivity</em>
            <br />
            Method
          </div>
          <div className="mt-auto text-center font-mono text-[9px] tracking-[0.18em] text-[#d9ae68]">YOUR NAME</div>
        </div>

        <div className="absolute bottom-6 left-0 flex items-center gap-2.5 rounded-[14px] border border-ip-bg/15 bg-ip-bg/10 px-3.5 py-[11px] text-[13px] backdrop-blur-md">
          <span className="grid h-[26px] w-[26px] place-items-center rounded-lg bg-ip-bg text-ip-ink">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M4 6h16M4 12h10M4 18h13" />
            </svg>
          </span>
          <span>
            <b className="font-semibold">Blueprint approved</b>
            <br />
            <span className="opacity-70">7 chapters · from your notes</span>
          </span>
        </div>
        <div className="absolute left-[6%] top-20 flex items-center gap-2.5 rounded-[14px] border border-ip-bg/15 bg-ip-bg/10 px-3.5 py-[11px] text-[13px] backdrop-blur-md">
          <span className="grid h-[26px] w-[26px] place-items-center rounded-full bg-ip-good text-white">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              <path d="m5 12 4.5 4.5L19 7" />
            </svg>
          </span>
          <span>
            <b className="font-semibold">Ready to publish</b>
            <br />
            <span className="opacity-70">48 pages · typeset PDF</span>
          </span>
        </div>
      </div>

      <ul className="mt-8 flex flex-col gap-2 text-sm opacity-80">
        <li>✓ Planning is free — pay only for pages you get</li>
        <li>✓ Built from your own material, never made-up facts</li>
        <li>✓ Typeset 6×9″ PDF, yours to publish</li>
      </ul>
    </aside>
  );
}
