// "Ambient pages": loose sheets and letters drifting far behind the landing.
// Faint and slightly blurred so they read as paper texture, not content.
// Reduced motion stops the drift and hides the letters (globals.css).

// [left %, top %, width px, rotation deg, animation, duration s, delay s]
const SHEETS: [number, number, number, number, string, number, number][] = [
  [4, 1.5, 120, -12, "ip-drift1", 34, 0],
  [88, 3, 96, 9, "ip-drift2", 40, -6],
  [2, 14, 84, 14, "ip-drift2", 38, -3],
  [92, 22, 110, -10, "ip-drift1", 44, -18],
  [6, 33, 100, -7, "ip-drift1", 42, -14],
  [90, 42, 80, 12, "ip-drift2", 36, -4],
  [3, 52, 92, 10, "ip-drift1", 38, -2],
  [93, 61, 120, 5, "ip-drift2", 46, -8],
  [5, 71, 104, -9, "ip-drift2", 40, -11],
  [89, 80, 90, 8, "ip-drift1", 36, -5],
  [7, 90, 110, -6, "ip-drift1", 42, -16],
];

const GLYPHS = ["¶", "&", "A", "§", "ff", "“", "Q", "†", "g", "R"];

export function AmbientLayer() {
  return (
    <div className="ip-ambient" aria-hidden="true">
      {SHEETS.map(([left, top, width, r, anim, dur, delay], i) => (
        <div
          key={`s${i}`}
          className="ip-sheet"
          style={
            {
              left: `${left}%`,
              top: `${top}%`,
              width,
              "--r": `${r}deg`,
              animation: `${anim} ${dur}s ease-in-out ${delay}s infinite alternate`,
            } as React.CSSProperties
          }
        />
      ))}
      {GLYPHS.map((ch, i) => (
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
