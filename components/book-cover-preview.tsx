/**
 * Live 3D mock of the book being briefed on the new-ebook form. It shows the
 * topic as a working title — the real title and cover are produced during
 * generation — and thickens the page block with the target length.
 */

/** Curated cover palettes: [from, to, ink]. Picked by hashing the topic. */
const PALETTES: [string, string, string][] = [
  ["#3b2f8f", "#1c1640", "#f6f2ff"],
  ["#1f4d3f", "#0f2620", "#f1f6ee"],
  ["#7a2b2b", "#3a1414", "#fbf1ea"],
  ["#1d3557", "#0d1b2e", "#eef3fb"],
  ["#c9a45c", "#8a6a2c", "#1d1609"],
  ["#e9e3d6", "#cfc6b3", "#2a2419"],
];

function hash(s: string): number {
  let h = 0;
  for (const c of s) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return h;
}

export function BookCoverPreview({
  topic,
  audience,
  author,
  pages,
}: {
  topic: string;
  audience: string;
  author: string;
  pages: number;
}) {
  const title = topic.trim();
  const reader = audience.trim().replace(/^for\s+/i, "");
  const [from, to, ink] = PALETTES[title ? hash(title) % PALETTES.length : 0];

  return (
    <div>
      <div className="brief-book-stage">
        <div className="brief-book">
          <div
            className="brief-book-cover"
            style={{ background: `linear-gradient(160deg, ${from}, ${to})`, color: ink }}
          >
            <p className="font-mono text-[8.5px] uppercase tracking-[0.14em] opacity-70">Working title</p>
            <span className="my-3 block h-px w-6 bg-current opacity-50" />
            <p
              className={`line-clamp-5 font-display text-[20px] leading-[1.12] ${
                title ? "" : "italic opacity-45"
              }`}
            >
              {title || "Your working title appears here"}
            </p>
            <p className="mt-auto line-clamp-2 pt-2.5 text-[9.5px] leading-snug opacity-75">
              {reader ? `For ${reader}` : "For the readers you describe below"}
            </p>
            <div
              className="mt-2.5 flex justify-between gap-2 border-t pt-2 font-mono text-[8px] uppercase tracking-[0.1em] opacity-75"
              style={{ borderColor: `color-mix(in srgb, ${ink} 22%, transparent)` }}
            >
              <span className="truncate">{author.trim() || "Scrivetta"}</span>
              <span className="shrink-0">~{pages} pp</span>
            </div>
          </div>
          <div className="brief-book-pages" style={{ width: `${8 + pages * 0.28}px` }} />
        </div>
      </div>
      <div className="brief-book-shadow" />
    </div>
  );
}
