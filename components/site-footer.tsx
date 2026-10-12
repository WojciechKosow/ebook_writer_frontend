import Link from "next/link";
import { BRAND } from "@/lib/brand";
import { CookieSettingsLink } from "@/components/cookie-consent";

const COLUMNS: { title: string; links: { label: string; href: string }[] }[] = [
  {
    title: "Product",
    links: [
      { label: "Features", href: "/#features" },
      { label: "How it works", href: "/#how" },
      { label: "Pricing", href: "/#pricing" },
      { label: "FAQ", href: "/#faq" },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "Blog", href: "/blog" },
      { label: "AI ebook generator", href: "/ai-ebook-generator" },
      { label: "Write an ebook with AI", href: "/how-to-write-an-ebook-with-ai" },
    ],
  },
  {
    title: "Account",
    links: [
      { label: "Log in", href: "/login" },
      { label: "Start writing", href: "/register" },
    ],
  },
];

const linkClass = "py-0.5 text-ip-ink-2 transition-colors hover:text-ip-ink";

/** Footer of the public site, in the Ink & Paper look (inside a `.ink-paper` shell). */
export function SiteFooter() {
  return (
    <footer className="relative z-[1] border-t border-ip-hair bg-ip-glass">
      <div className="mx-auto grid w-full max-w-[1200px] grid-cols-2 gap-8 px-4 py-12 text-sm sm:px-6 md:grid-cols-[1.6fr_repeat(4,1fr)]">
        <div className="col-span-2 flex min-w-0 flex-col gap-2.5 md:col-span-1">
          <span className="font-display text-2xl">{BRAND}</span>
          <span className="max-w-[320px] text-ip-muted">
            The AI writing studio that turns what you know into a finished, typeset ebook.
          </span>
        </div>
        {COLUMNS.map((col) => (
          <div key={col.title} className="flex flex-col gap-2">
            <span className="font-mono text-[11px] uppercase tracking-[0.1em] text-ip-muted">{col.title}</span>
            {col.links.map((l) => (
              <Link key={l.label} href={l.href} className={linkClass}>
                {l.label}
              </Link>
            ))}
          </div>
        ))}
        <div className="flex flex-col gap-2">
          <span className="font-mono text-[11px] uppercase tracking-[0.1em] text-ip-muted">Legal</span>
          <Link href="/privacy" className={linkClass}>
            Privacy
          </Link>
          <Link href="/terms" className={linkClass}>
            Terms
          </Link>
          <CookieSettingsLink className={`text-left ${linkClass}`} />
        </div>
      </div>
      <div className="mx-auto flex w-full max-w-[1200px] flex-wrap items-center justify-between gap-3 border-t border-ip-hair px-4 py-6 text-sm text-ip-muted sm:px-6">
        <span>
          © {new Date().getFullYear()} {BRAND}. All rights reserved.
        </span>
        <span>www.scrivetta.com</span>
      </div>
    </footer>
  );
}
