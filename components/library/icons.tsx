type IconProps = { className?: string };

const stroke = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

export function IconDownload({ className = "h-4 w-4" }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" {...stroke} aria-hidden>
      <path d="M12 4v11m0 0-4-4m4 4 4-4M5 20h14" />
    </svg>
  );
}
export function IconEdit({ className = "h-4 w-4" }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" {...stroke} aria-hidden>
      <path d="M4 20h4L19 9l-4-4L4 16v4Z" />
    </svg>
  );
}
export function IconCheck({ className = "h-4 w-4" }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" {...stroke} strokeWidth={2.6} aria-hidden>
      <path d="m5 12.5 4.5 4.5L19 7.5" />
    </svg>
  );
}
export function IconChevron({ className = "h-4 w-4" }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" {...stroke} aria-hidden>
      <path d="m9 6 6 6-6 6" />
    </svg>
  );
}
export function IconSearch({ className = "h-4 w-4" }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" {...stroke} strokeWidth={1.8} aria-hidden>
      <circle cx="11" cy="11" r="6.5" />
      <path d="m20 20-4-4" />
    </svg>
  );
}
export function IconGrid({ className = "h-4 w-4" }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" {...stroke} strokeWidth={1.8} aria-hidden>
      <rect x="4" y="4" width="6" height="8" rx="1" />
      <rect x="14" y="4" width="6" height="8" rx="1" />
      <rect x="4" y="15" width="6" height="5" rx="1" />
      <rect x="14" y="15" width="6" height="5" rx="1" />
    </svg>
  );
}
export function IconList({ className = "h-4 w-4" }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" {...stroke} strokeWidth={1.8} aria-hidden>
      <path d="M9 6h11M9 12h11M9 18h11M4 6h1M4 12h1M4 18h1" />
    </svg>
  );
}
export function IconPlus({ className = "h-4 w-4" }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" {...stroke} aria-hidden>
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}
