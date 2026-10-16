"use client";

import { useState } from "react";
import { apiAsset } from "@/lib/api";

/**
 * An ebook cover: the first page of the book's own PDF, served by the backend.
 * Falls back to a plain typographic cover if the image can't be loaded.
 */
export function StoreCover({
  coverUrl,
  title,
  className = "",
}: {
  coverUrl: string | null;
  title: string;
  className?: string;
}) {
  const [failed, setFailed] = useState(false);
  const src = apiAsset(coverUrl);
  const frame = `block w-full aspect-[2/3] overflow-hidden rounded-[3px_10px_10px_3px] shadow-[0_18px_40px_rgba(27,24,20,.2)] ${className}`;
  if (src && !failed) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={src} alt={`Cover of ${title}`} loading="lazy" onError={() => setFailed(true)} className={`${frame} bg-surface-2 object-cover`} />
    );
  }
  return (
    <div role="img" aria-label={`Cover of ${title}`} className={`${frame} flex flex-col justify-end bg-foreground p-[10%] text-background`}>
      <span className="font-display text-[clamp(14px,2.2vw,26px)] leading-[1.1]">{title}</span>
    </div>
  );
}
