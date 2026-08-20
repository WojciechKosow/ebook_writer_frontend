import Link from "next/link";
import { BRAND } from "@/lib/brand";
import { Wordmark } from "./brand-mark";

const COLUMNS: { title: string; links: { label: string; href: string }[] }[] = [
  {
    title: "Product",
    links: [
      { label: "Features", href: "/#features" },
      { label: "How it works", href: "/#how" },
      { label: "Pricing", href: "/#pricing" },
    ],
  },
  {
    title: "Account",
    links: [
      { label: "Log in", href: "/login" },
      { label: "Start writing", href: "/register" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy", href: "/#" },
      { label: "Terms", href: "/#" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-hairline">
      <div className="mx-auto w-full max-w-6xl px-6 py-14">
        <div className="grid gap-10 md:grid-cols-[1.6fr_1fr_1fr_1fr]">
          <div>
            <Wordmark />
            <p className="mt-3 max-w-xs text-sm text-muted">
              The AI writing studio that turns one idea into a finished, typeset
              ebook — cover to cover.
            </p>
          </div>
          {COLUMNS.map((col) => (
            <div key={col.title}>
              <h4 className="text-xs font-semibold uppercase tracking-[0.08em] text-faint">
                {col.title}
              </h4>
              <ul className="mt-3.5 space-y-1">
                {col.links.map((l) => (
                  <li key={l.label}>
                    <Link
                      href={l.href}
                      className="inline-block py-1 text-sm text-muted transition-colors hover:text-foreground"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-10 flex flex-wrap items-center justify-between gap-3 border-t border-hairline pt-6 text-sm text-faint">
          <span>© {new Date().getFullYear()} {BRAND}. All rights reserved.</span>
          <span>www.scrivetta.com</span>
        </div>
      </div>
    </footer>
  );
}
