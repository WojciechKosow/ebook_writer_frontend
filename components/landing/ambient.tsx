"use client";

import { useCallback, useSyncExternalStore } from "react";

// "Ambient pages": loose sheets and letters drifting behind the landing.
// Purely decorative; the visitor can switch it off from the header, and it
// stays off for them (stored per browser). Reduced motion stops the drift in CSS.
const KEY = "scrivetta.ambient";
const EVENT = "scrivetta:ambient-change";

function subscribe(onChange: () => void) {
  window.addEventListener(EVENT, onChange);
  window.addEventListener("storage", onChange);
  return () => {
    window.removeEventListener(EVENT, onChange);
    window.removeEventListener("storage", onChange);
  };
}

function getSnapshot(): boolean {
  try {
    return localStorage.getItem(KEY) !== "off";
  } catch {
    return true;
  }
}

export function useAmbient(): [boolean, (on: boolean) => void] {
  const on = useSyncExternalStore(subscribe, getSnapshot, () => true);
  const set = useCallback((next: boolean) => {
    try {
      if (next) localStorage.removeItem(KEY);
      else localStorage.setItem(KEY, "off");
    } catch {
      // Storage blocked: the choice still applies until the page reloads.
    }
    window.dispatchEvent(new Event(EVENT));
  }, []);
  return [on, set];
}

// [left %, top %, width px, rotation deg, animation, duration s, delay s, opacity]
const SHEETS: [number, number, number, number, string, number, number, number][] = [
  [4, 1.5, 120, -12, "ip-drift1", 34, 0, 0.9],
  [88, 3, 96, 9, "ip-drift2", 40, -6, 0.85],
  [2, 14, 84, 14, "ip-drift2", 38, -3, 0.8],
  [92, 22, 110, -10, "ip-drift1", 44, -18, 0.85],
  [6, 33, 100, -7, "ip-drift1", 42, -14, 0.8],
  [90, 42, 80, 12, "ip-drift2", 36, -4, 0.75],
  [3, 52, 92, 10, "ip-drift1", 38, -2, 0.8],
  [93, 61, 120, 5, "ip-drift2", 46, -8, 0.8],
  [5, 71, 104, -9, "ip-drift2", 40, -11, 0.75],
  [89, 80, 90, 8, "ip-drift1", 36, -5, 0.8],
  [7, 90, 110, -6, "ip-drift1", 42, -16, 0.8],
];

const GLYPHS = ["¶", "&", "A", "§", "ff", "“", "Q", "†", "g", "R"];

export function AmbientLayer() {
  const [on] = useAmbient();
  if (!on) return null;
  return (
    <div className="ip-ambient" aria-hidden="true">
      {SHEETS.map(([left, top, width, r, anim, dur, delay, opacity], i) => (
        <div
          key={`s${i}`}
          className="ip-sheet"
          style={
            {
              left: `${left}%`,
              top: `${top}%`,
              width,
              opacity,
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
