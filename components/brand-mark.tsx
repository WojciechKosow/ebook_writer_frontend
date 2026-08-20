import Link from "next/link";
import { BRAND } from "@/lib/brand";

/** The Scrivetta logo glyph — a serif initial in an accent gradient tile. */
export function BrandMark({ className = "h-8 w-8 text-lg rounded-[9px]" }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={`grid shrink-0 place-items-center bg-gradient-to-br from-accent to-accent-2 font-[family-name:var(--font-display)] italic text-white shadow-[0_4px_12px_-4px_color-mix(in_oklab,var(--accent)_65%,transparent)] ${className}`}
    >
      {BRAND.charAt(0)}
    </span>
  );
}

/** Logo glyph + wordmark, optionally linked. */
export function Wordmark({
  href,
  onClick,
  className = "",
}: {
  href?: string;
  onClick?: () => void;
  className?: string;
}) {
  const inner = (
    <span className={`flex items-center gap-2.5 font-semibold tracking-tight text-foreground ${className}`}>
      <BrandMark />
      <span className="text-[18px]">{BRAND}</span>
    </span>
  );
  if (href) {
    return (
      <Link href={href} onClick={onClick} className="inline-flex">
        {inner}
      </Link>
    );
  }
  return inner;
}
