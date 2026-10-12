import Link from "next/link";
import { BrandMark } from "@/components/brand-mark";
import { ThemeToggle } from "@/components/theme-toggle";
import { BRAND } from "@/lib/brand";

const LINKS = [
  { href: "#features", label: "Features" },
  { href: "#how", label: "How it works" },
  { href: "#pricing", label: "Pricing" },
  { href: "#faq", label: "FAQ" },
  { href: "/blog", label: "Blog" },
];

export function LandingHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-ip-hair bg-ip-glass backdrop-blur-md">
      <div className="mx-auto flex w-full max-w-[1200px] flex-wrap items-center gap-x-7 gap-y-1.5 px-4 py-2.5 sm:px-6 md:py-3.5">
        <Link href="/" className="flex items-center gap-2.5">
          <BrandMark className="h-8 w-8" />
          <span className="font-display text-[23px] font-medium tracking-[-0.01em]">{BRAND}</span>
        </Link>

        <nav
          aria-label="Main"
          className="order-3 -mx-4 flex w-[calc(100%+2rem)] gap-1 overflow-x-auto px-2.5 [scrollbar-width:none] md:order-none md:mx-0 md:w-auto md:flex-1 md:overflow-visible md:px-0 [&::-webkit-scrollbar]:hidden"
        >
          {LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="shrink-0 whitespace-nowrap rounded-[10px] px-3 py-2 text-sm text-ip-ink-2 transition-colors hover:bg-ip-surface hover:text-ip-ink"
            >
              {l.label}
            </a>
          ))}
          <Link
            href="/login"
            className="shrink-0 whitespace-nowrap rounded-[10px] px-3 py-2 text-sm font-semibold text-ip-ink min-[441px]:hidden"
          >
            Log in
          </Link>
        </nav>

        <div className="ml-auto flex items-center gap-1.5 sm:gap-2.5">
          <ThemeToggle />
          <Link
            href="/login"
            className="whitespace-nowrap px-3 py-2.5 text-sm font-medium max-[440px]:hidden"
          >
            Log in
          </Link>
          <Link
            href="/register"
            className="ip-cta whitespace-nowrap rounded-xl bg-ip-ink px-3.5 py-2.5 text-sm font-semibold text-ip-bg sm:px-[18px]"
          >
            Start writing
          </Link>
        </div>
      </div>
      <div
        aria-hidden="true"
        className="ip-progress absolute inset-x-0 -bottom-px h-0.5 origin-left bg-ip-brass-l"
        style={{ transform: "scaleX(0)" }}
      />
    </header>
  );
}
