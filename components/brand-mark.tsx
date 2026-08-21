import Image from "next/image";
import Link from "next/link";
import { BRAND } from "@/lib/brand";
import logo from "@/app/logo.png";

/** The Scrivetta logo glyph (self-contained rounded-square app icon). */
export function BrandMark({ className = "h-8 w-8" }: { className?: string }) {
  return (
    <Image
      src={logo}
      alt={`${BRAND} logo`}
      sizes="40px"
      className={`shrink-0 object-contain ${className}`}
    />
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
