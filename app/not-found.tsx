import Link from "next/link";
import { MarketingShell } from "@/components/marketing-shell";

export default function NotFound() {
  return (
    <MarketingShell>
      <section className="mx-auto flex w-full max-w-[760px] flex-col items-center px-4 py-28 text-center sm:px-6 md:py-36">
        <span className="ip-eyebrow">Error 404</span>
        <h1 className="ip-display mb-0 mt-5 text-[clamp(44px,6.4vw,80px)] leading-none">
          This page was <em className="text-ip-brass">never written.</em>
        </h1>
        <p className="mb-0 mt-6 max-w-md text-lg text-ip-ink-2">
          The link may be old or mistyped. The rest of the book is still here.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link href="/" className="ip-cta rounded-[14px] bg-ip-ink px-6 py-4 font-semibold text-ip-bg">
            Back to the start
          </Link>
          <Link href="/blog" className="ip-cta rounded-[14px] border border-ip-line bg-ip-surface px-[22px] py-4 font-medium">
            Read the guides
          </Link>
        </div>
      </section>
    </MarketingShell>
  );
}
