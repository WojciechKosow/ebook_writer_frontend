// "Ambient pages": loose sheets and letters drifting far behind the content.
// Faint and softly blurred so they read as paper texture, not content; each
// sheet has its own depth (--b, the blur). Reduced motion stops the drift and
// hides the letters (globals.css).
//
// How much ambient a screen gets depends on what people do there:
//   full   — landing: the whole set
//   sparse — auth and content pages: a few at the edges
//   band   — workspace (library): only in a band above the page header
//   room   — the writing room: behind the whole page while a book is written
// The editor has none: it is for focus.

// [left %, top %, width px, rotation deg, animation, duration s, delay s, blur px]
const SHEETS: [number, number, number, number, string, number, number, number][] = [
  [4, 1.5, 120, -12, "ip-drift1", 34, 0, 1],
  [88, 3, 96, 9, "ip-drift2", 40, -6, 1.6],
  [2, 14, 84, 14, "ip-drift2", 38, -3, 2],
  [92, 22, 110, -10, "ip-drift1", 44, -18, 1],
  [6, 33, 100, -7, "ip-drift1", 42, -14, 1.6],
  [90, 42, 80, 12, "ip-drift2", 36, -4, 2.2],
  [3, 52, 92, 10, "ip-drift1", 38, -2, 1.2],
  [93, 61, 120, 5, "ip-drift2", 46, -8, 1],
  [5, 71, 104, -9, "ip-drift2", 40, -11, 1.8],
  [89, 80, 90, 8, "ip-drift1", 36, -5, 1.4],
  [7, 90, 110, -6, "ip-drift1", 42, -16, 2],
];

// Small, slow sheets for the band above a workspace header.
const BAND: typeof SHEETS = [
  [4, 6, 74, -12, "ip-drift1", 40, 0, 1],
  [22, -10, 60, 8, "ip-drift2", 46, -8, 1.6],
  [58, 2, 66, -6, "ip-drift1", 44, -14, 0.8],
  [80, -6, 84, 10, "ip-drift2", 50, -4, 1],
  [93, 22, 58, -9, "ip-drift1", 42, -20, 1.6],
];

// The writing room: around the edges, out of the way of the page and the book.
const ROOM: typeof SHEETS = [
  [2, 10, 110, -12, "ip-drift1", 38, 0, 1.4],
  [92, 6, 96, 9, "ip-drift2", 44, -6, 1],
  [6, 62, 92, 10, "ip-drift2", 40, -10, 2],
  [94, 58, 104, -8, "ip-drift1", 46, -16, 1.4],
  [40, 88, 80, -6, "ip-drift1", 36, -4, 2.4],
  [70, -6, 74, 12, "ip-drift2", 42, -12, 2.4],
  [24, -8, 70, 8, "ip-drift1", 40, -20, 2],
];

const GLYPHS = ["¶", "&", "A", "§", "ff", "“", "Q", "†", "g", "R"];

type Variant = "full" | "sparse" | "band" | "room";

export function AmbientLayer({ variant = "full", sparse }: { variant?: Variant; sparse?: boolean }) {
  const v: Variant = sparse ? "sparse" : variant;
  const sheets =
    v === "band" ? BAND : v === "room" ? ROOM : v === "sparse" ? SHEETS.filter((_, i) => i % 3 === 0) : SHEETS;
  const glyphs = v === "full" ? GLYPHS : v === "sparse" ? GLYPHS.slice(0, 3) : [];
  const cls = v === "band" ? "ip-ambient-band" : v === "room" ? "ip-ambient-room" : "ip-ambient";
  return (
    <div className={cls} aria-hidden="true">
      {sheets.map(([left, top, width, r, anim, dur, delay, blur], i) => (
        <div
          key={`s${i}`}
          className="ip-sheet"
          style={
            {
              left: `${left}%`,
              top: `${top}%`,
              width,
              "--r": `${r}deg`,
              "--b": `${blur}px`,
              animation: `${anim} ${dur}s ease-in-out ${delay}s infinite alternate`,
            } as React.CSSProperties
          }
        />
      ))}
      {glyphs.map((ch, i) => (
        <span
          key={`g${i}`}
          className="ip-glyph"
          style={{
            left: `${(i * 37 + 11) % 96}%`,
            top: `${(i * 23 + 8) % 92}%`,
            fontSize: 22 + ((i * 13) % 30),
            animation: `ip-rise ${18 + (i % 5) * 4}s linear ${-i * 3}s infinite`,
          }}
        >
          {ch}
        </span>
      ))}
    </div>
  );
}
