"use client";

/**
 * Scrivetta product film — a single looping animation that plays the three
 * beats of the pitch, in order, with a real hand-off between them:
 *
 *   1. A finished 60-page ebook scrolling on a phone. The camera zooms out to
 *      the whole device, then the phone flies away…
 *   2. …handing off to the real generator on the site. The four fields type
 *      themselves in — what it's about, who it's for, how it should sound,
 *      how long — then "Generate" is clicked.
 *   3. The same window becomes the live generation view and steps through the
 *      pipeline: plans the chapters, writes the whole thing, edits it, and
 *      exports a PDF.
 *
 * Everything is derived from one master clock (ms into the loop), so the beats
 * stay in lock-step and the whole thing is deterministic and seamless. The UI
 * reuses the real design tokens and the real generation components
 * (StatusBadge, ProgressBar, stage messages) so it reads as the actual product.
 */

import { useEffect, useRef, useState } from "react";
import type { EbookStatus } from "@/lib/types";
import { StatusBadge, ProgressBar } from "@/components/ebook-ui";
import { STAGE_MESSAGE } from "@/lib/ebook-format";
import { Button, controlBase } from "@/components/ui";

/* ----------------------------------------------------------------- timeline */
// All times in ms into the loop. Windows are [start, end].
const T = {
  // Scene 1 — phone
  phoneIn: [0, 700],
  scroll: [850, 4700],
  zoomOut: [4700, 5700],
  phoneOut: [5850, 7050],
  // Scene 2 — generator (browser window enters as the phone leaves)
  winIn: [6400, 7300],
  topic: [7500, 9300],
  audience: [9600, 10600],
  style: [10900, 12100],
  length: [12400, 13000],
  hover: [13200, 13600],
  press: [13600, 13820],
  formOut: [13950, 14650],
  // Scene 3 — generation pipeline (same window)
  panelIn: [14350, 15100],
  planning: [15100, 17300],
  writing: [17300, 21200],
  editing: [21200, 22800],
  rendering: [22800, 23800],
  done: [23800, 25600],
} as const;

const TOTAL = 26600;

const CAPTIONS = {
  one: [6500, 6900] as const, // fades out over this window
  two: [6600, 13950] as const,
  three: [14200, TOTAL] as const,
} as const;

/* ------------------------------------------------------------------- content */

const BOOK = {
  title: "The Calm Startup",
  subtitle: "Building a company without burning out",
  meta: "60 pages · 8 chapters",
};

const CHAPTERS = [
  "The Myth of Hustle",
  "Systems Over Willpower",
  "Designing Your Week",
  "Saying No, Gracefully",
  "Hiring for Calm",
  "Rest as Strategy",
  "Metrics That Matter",
  "The Long Game",
];

const TOPIC_TEXT = "The Calm Startup — building a company without burning out";
const AUDIENCE_TEXT = "First-time founders";
const STYLE_TEXT = "Warm, direct, practical";
const LENGTH_TEXT = "60";

/* ---------------------------------------------------------------------- math */

const clamp01 = (n: number) => (n < 0 ? 0 : n > 1 ? 1 : n);
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
/** Linear progress (0→1) of `t` across a [start,end] window. */
const seg = (t: number, [a, b]: readonly [number, number]) => clamp01((t - a) / (b - a));
const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);
const easeIn = (t: number) => t * t * t;
const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

/* ---------------------------------------------------------------- the clock */

function useLoopClock(playing: boolean) {
  const [t, setT] = useState(0);
  const [nonce, setNonce] = useState(0); // changes to force a replay
  const elapsed = useRef(0);
  const last = useRef<number | null>(null);

  useEffect(() => {
    if (!playing) {
      last.current = null;
      return;
    }
    let raf = 0;
    const tick = (now: number) => {
      if (last.current != null) {
        elapsed.current = (elapsed.current + (now - last.current)) % TOTAL;
      }
      last.current = now;
      setT(elapsed.current);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [playing, nonce]);

  const replay = () => {
    elapsed.current = 0;
    last.current = null;
    setT(0);
    setNonce((n) => n + 1);
  };

  return { t, replay };
}

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const m = window.matchMedia("(prefers-reduced-motion: reduce)");
    const on = () => setReduced(m.matches);
    on();
    m.addEventListener("change", on);
    return () => m.removeEventListener("change", on);
  }, []);
  return reduced;
}

/* =============================================================== component */

export function Showcase({
  captions = true,
  controls = false,
  className = "",
}: {
  captions?: boolean;
  controls?: boolean;
  className?: string;
}) {
  const [playing, setPlaying] = useState(true);
  const reduced = usePrefersReducedMotion();
  const { t, replay } = useLoopClock(playing);

  return (
    <div className={`mx-auto w-full max-w-4xl ${className}`}>
      <div className="relative h-[560px] overflow-hidden rounded-[26px] border border-hairline bg-surface-2 shadow-float sm:h-[600px]">
        {/* soft studio backdrop */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-0"
          style={{
            background:
              "radial-gradient(80% 60% at 50% 8%, color-mix(in oklab, var(--accent) 12%, transparent), transparent 70%)",
          }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-0 opacity-[0.5]"
          style={{
            backgroundImage:
              "linear-gradient(var(--hairline) 1px, transparent 1px), linear-gradient(90deg, var(--hairline) 1px, transparent 1px)",
            backgroundSize: "44px 44px",
            maskImage: "radial-gradient(70% 70% at 50% 40%, #000, transparent 75%)",
            WebkitMaskImage: "radial-gradient(70% 70% at 50% 40%, #000, transparent 75%)",
          }}
        />

        <PhoneScene t={t} reduced={reduced} />
        <AppWindow t={t} reduced={reduced} />
      </div>

      {captions && <Captions t={t} />}

      {controls && (
        <div className="mt-4 flex items-center justify-center gap-3">
          <button
            onClick={() => setPlaying((p) => !p)}
            className="rounded-full border border-hairline-2 bg-surface px-4 py-1.5 text-xs font-semibold text-foreground-2 transition-colors hover:border-muted"
          >
            {playing ? "Pause" : "Play"}
          </button>
          <button
            onClick={replay}
            className="rounded-full border border-hairline-2 bg-surface px-4 py-1.5 text-xs font-semibold text-foreground-2 transition-colors hover:border-muted"
          >
            Replay
          </button>
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------- scene 1: phone */

function PhoneScene({ t, reduced }: { t: number; reduced: boolean }) {
  const enter = easeOut(seg(t, T.phoneIn));
  const fly = easeIn(seg(t, T.phoneOut));
  const zoomP = easeInOut(seg(t, T.zoomOut));
  const opacity = enter * (1 - fly);

  // Auto-scroll the reading column while the phone is being "read".
  const scrollP = easeInOut(seg(t, T.scroll));
  const scrollY = lerp(0, -486, scrollP);

  const scale =
    lerp(0.94, 1, enter) * // rise-in settle
    lerp(1.12, 1.0, zoomP) * // "get out of the phone" — zoom out to full device
    lerp(1, 0.68, fly); // fly away

  const transform = reduced
    ? "none"
    : `translateX(${lerp(0, -155, fly)}%) translateY(${lerp(20, 0, enter)}px) rotate(${lerp(0, -11, fly)}deg) scale(${scale})`;

  if (opacity <= 0.001) return null;

  return (
    <div
      className="absolute inset-0 z-10 grid place-items-center"
      style={{ opacity, transform, transformOrigin: "50% 46%" }}
      aria-hidden
    >
      {/* device */}
      <div className="relative h-[430px] w-[212px] rounded-[34px] border border-hairline-2 bg-surface p-2.5 shadow-float">
        <div className="absolute left-1/2 top-2 z-20 h-1.5 w-16 -translate-x-1/2 rounded-full bg-surface-3" />
        <div className="relative h-full w-full overflow-hidden rounded-[26px] bg-surface">
          {/* scrolling reading column */}
          <div
            className="absolute inset-x-0 top-0 px-5 pb-8"
            style={{ transform: reduced ? "none" : `translateY(${scrollY}px)` }}
          >
            {/* title page */}
            <div className="flex h-[430px] flex-col items-center justify-center text-center">
              <div className="h-px w-10 bg-brass" />
              <h3 className="mt-5 font-[family-name:var(--font-display)] text-[26px] font-medium italic leading-tight text-foreground">
                {BOOK.title}
              </h3>
              <p className="mt-3 px-2 text-[11px] leading-4 text-muted">{BOOK.subtitle}</p>
              <div className="mt-5 h-px w-10 bg-brass" />
              <p className="mt-5 text-[9px] font-semibold uppercase tracking-[0.14em] text-faint">
                {BOOK.meta}
              </p>
            </div>

            <BookChapter n={1} title={CHAPTERS[0]} lines={9} />
            <BookChapter n={2} title={CHAPTERS[1]} lines={9} />
          </div>

          {/* page fold shadow at the very bottom edge */}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-surface to-transparent" />
        </div>
      </div>
    </div>
  );
}

function BookChapter({ n, title, lines }: { n: number; title: string; lines: number }) {
  return (
    <div className="pt-2">
      <p className="text-center text-[8px] font-semibold uppercase tracking-[0.16em] text-brass">
        Chapter {n}
      </p>
      <h4 className="mt-1.5 text-center font-[family-name:var(--font-display)] text-[15px] font-medium text-foreground">
        {title}
      </h4>
      <div className="mt-3 flex flex-col gap-[7px]">
        {Array.from({ length: lines }).map((_, i) => (
          <span
            key={i}
            className="block h-[5px] rounded-full bg-surface-3"
            style={{ width: i === lines - 1 ? "58%" : `${92 - (i % 3) * 6}%` }}
          />
        ))}
      </div>
      <p className="mt-4 text-center text-[8px] text-faint">{n * 7 + 4}</p>
    </div>
  );
}

/* --------------------------------------------- scenes 2 + 3: the app window */

function AppWindow({ t, reduced }: { t: number; reduced: boolean }) {
  const enter = easeOut(seg(t, T.winIn));
  if (enter <= 0.001) return null;

  const transform = reduced
    ? "none"
    : `translateX(${lerp(64, 0, enter)}px) scale(${lerp(0.955, 1, enter)})`;

  const onGenerator = t < 14000;
  const url = onGenerator
    ? "app.scrivetta.com/ebooks/new"
    : "app.scrivetta.com/ebooks/the-calm-startup";

  const formOpacity = 1 - easeInOut(seg(t, T.formOut));
  const pipelineOpacity = easeOut(seg(t, T.panelIn));

  return (
    <div
      className="absolute inset-0 z-20 grid place-items-center px-5"
      style={{ opacity: enter, transform, transformOrigin: "50% 50%" }}
      aria-hidden
    >
      <div className="flex h-[520px] w-full max-w-[560px] flex-col overflow-hidden rounded-2xl border border-hairline bg-surface shadow-float">
        {/* browser chrome */}
        <div className="flex items-center gap-2 border-b border-hairline bg-surface-2 px-4 py-2.5">
          <div className="flex gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-hairline-2" />
            <span className="h-2.5 w-2.5 rounded-full bg-hairline-2" />
            <span className="h-2.5 w-2.5 rounded-full bg-hairline-2" />
          </div>
          <div className="ml-2 flex h-6 flex-1 items-center gap-2 rounded-lg border border-hairline bg-surface px-3 text-[11px] text-faint">
            <LockIcon />
            <span className="tabular-nums transition-opacity">{url}</span>
          </div>
        </div>

        {/* content — form and pipeline cross-fade in the same viewport */}
        <div className="relative flex-1 overflow-hidden">
          {formOpacity > 0.001 && (
            <div className="absolute inset-0" style={{ opacity: formOpacity }}>
              <GeneratorForm t={t} reduced={reduced} />
            </div>
          )}
          {pipelineOpacity > 0.001 && (
            <div className="absolute inset-0" style={{ opacity: pipelineOpacity }}>
              <PipelinePanel t={t} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------ scene 2: form */

function typed(text: string, t: number, window: readonly [number, number]) {
  const n = Math.round(text.length * clamp01(seg(t, window)));
  return text.slice(0, n);
}

function GeneratorForm({ t, reduced }: { t: number; reduced: boolean }) {
  const activeField =
    t >= T.topic[0] && t < T.audience[0]
      ? 0
      : t >= T.audience[0] && t < T.style[0]
        ? 1
        : t >= T.style[0] && t < T.length[0]
          ? 2
          : t >= T.length[0] && t < T.hover[0]
            ? 3
            : -1;

  const hover = seg(t, T.hover);
  const press = seg(t, T.press) - seg(t, [T.press[1], T.press[1] + 180]);

  return (
    <div className="flex h-full flex-col gap-3.5 overflow-hidden p-5">
      <div>
        <p className="text-[15px] font-semibold tracking-tight text-foreground">New ebook</p>
        <p className="mt-0.5 text-[11px] text-muted">
          Describe your book. We&apos;ll plan it, write it, edit it, and hand you a PDF.
        </p>
      </div>

      <ShowField label="Topic" area active={activeField === 0}>
        {typed(TOPIC_TEXT, t, T.topic)}
      </ShowField>

      <div className="grid grid-cols-2 gap-3">
        <ShowField label="Target audience" active={activeField === 1}>
          {typed(AUDIENCE_TEXT, t, T.audience)}
        </ShowField>
        <ShowField label="Writing style" active={activeField === 2}>
          {typed(STYLE_TEXT, t, T.style)}
        </ShowField>
        <ShowField label="Page count" active={activeField === 3}>
          {typed(LENGTH_TEXT, t, T.length)}
        </ShowField>
        <ShowField label="Language">English</ShowField>
      </div>

      <div className="mt-auto rounded-xl border border-hairline bg-surface-2 px-4 py-2.5">
        <div className="flex items-center justify-between text-[12px]">
          <span className="text-muted">Estimated cost</span>
          <span className="font-medium text-foreground">60 credits</span>
        </div>
        <div className="mt-1 flex items-center justify-between text-[12px]">
          <span className="text-muted">Your balance</span>
          <span className="font-medium text-foreground">120 credits</span>
        </div>
      </div>

      <div className="relative">
        {/* click ripple */}
        {press > 0 && !reduced && (
          <span className="pointer-events-none absolute left-8 top-1/2 -translate-y-1/2">
            <span
              className="block rounded-full bg-accent/30"
              style={{
                width: `${lerp(8, 46, press)}px`,
                height: `${lerp(8, 46, press)}px`,
                opacity: 1 - press,
                transform: "translate(-50%,-50%)",
              }}
            />
          </span>
        )}
        <Button
          className="w-full"
          style={{
            transform: reduced ? "none" : `scale(${lerp(1, 1.02, hover)})`,
            boxShadow: hover > 0.3 ? "0 8px 24px -10px color-mix(in oklab, var(--accent) 60%, transparent)" : undefined,
          }}
        >
          Generate ebook — 60 credits
        </Button>
        {/* pointer cursor gliding to the button */}
        {!reduced && t > T.length[1] && t < T.press[1] + 200 && <Pointer t={t} />}
      </div>
    </div>
  );
}

function ShowField({
  label,
  children,
  active = false,
  area = false,
}: {
  label: string;
  children: React.ReactNode;
  active?: boolean;
  area?: boolean;
}) {
  const text = String(children ?? "");
  const empty = text.length === 0;
  return (
    <div className="flex flex-col gap-1">
      <span className="text-[11px] font-medium text-foreground-2">{label}</span>
      <div
        className={`${controlBase} flex items-start ${area ? "min-h-[52px]" : "min-h-[38px]"} text-[12px] ${
          active ? "border-accent ring-2 ring-accent/25" : ""
        }`}
      >
        <span className={empty ? "text-faint" : "text-foreground"}>
          {empty && !active ? placeholderFor(label) : text}
          {active && <span className="caret-blink ml-px inline-block h-[1.05em] w-px -mb-[0.15em] bg-accent align-middle" />}
        </span>
      </div>
    </div>
  );
}

function placeholderFor(label: string) {
  switch (label) {
    case "Target audience":
      return "e.g. Junior developers";
    case "Writing style":
      return "e.g. Practical, easy to follow";
    case "Page count":
      return "30";
    default:
      return "";
  }
}

/* ---------------------------------------------------------- scene 3: pipeline */

function pipelineState(t: number): { status: EbookStatus; progress: number } {
  if (t < T.planning[1]) return { status: "PLANNING", progress: Math.round(lerp(4, 22, seg(t, T.planning))) };
  if (t < T.writing[1]) return { status: "WRITING", progress: Math.round(lerp(22, 78, seg(t, T.writing))) };
  if (t < T.editing[1]) return { status: "EDITING", progress: Math.round(lerp(78, 92, seg(t, T.editing))) };
  if (t < T.rendering[1]) return { status: "RENDERING", progress: Math.round(lerp(92, 100, seg(t, T.rendering))) };
  return { status: "COMPLETED", progress: 100 };
}

function PipelinePanel({ t }: { t: number }) {
  const { status, progress } = pipelineState(t);
  const completed = status === "COMPLETED";

  const revealed = Math.ceil(CHAPTERS.length * seg(t, T.planning));
  const written =
    status === "WRITING"
      ? Math.floor(CHAPTERS.length * seg(t, T.writing))
      : t >= T.writing[1]
        ? CHAPTERS.length
        : 0;
  const editing = status === "EDITING";
  const editRow = Math.min(CHAPTERS.length - 1, Math.floor(CHAPTERS.length * seg(t, T.editing)));

  return (
    <div className="flex h-full flex-col gap-3 overflow-hidden p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[15px] font-semibold tracking-tight text-foreground">{BOOK.title}</p>
          <p className="mt-0.5 text-[11px] text-muted">{BOOK.subtitle}</p>
        </div>
        <StatusBadge status={status} />
      </div>

      <div>
        <div className="mb-1.5 flex items-center justify-between text-[11px]">
          <span className="text-muted">{STAGE_MESSAGE[status]}</span>
          <span className="tabular-nums text-faint">{progress}%</span>
        </div>
        <ProgressBar value={progress} />
      </div>

      {completed ? (
        <div className="rounded-xl border border-[color-mix(in_oklab,var(--good)_35%,transparent)] bg-good-soft p-3.5">
          <p className="text-[12px] font-medium text-good">Your ebook is ready.</p>
          <p className="mt-1 text-[11px] text-muted">
            8 chapters · 60 pages · typeset PDF, cover to cover.
          </p>
          <div className="mt-3">
            <Button className="!py-2 text-[12px]">
              <PdfIcon /> Download PDF
            </Button>
          </div>
        </div>
      ) : (
        <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-accent-ink">
          Chapters
        </p>
      )}

      <ul className="relative flex flex-1 flex-col gap-1 overflow-hidden">
        {/* editing "consistency pass" sweep */}
        {editing && (
          <span
            className="pointer-events-none absolute inset-x-0 top-0 h-8 rounded-lg"
            style={{
              background:
                "linear-gradient(90deg, transparent, color-mix(in oklab, var(--accent) 22%, transparent), transparent)",
              animation: "edit-sweep 1.5s ease-in-out",
              transform: `translateY(${editRow * 34}px)`,
            }}
          />
        )}
        {CHAPTERS.map((title, i) => {
          const isRevealed = i < revealed || written > 0 || completed;
          const isWritten = i < written || completed;
          return (
            <li
              key={i}
              className="flex items-center gap-2.5 rounded-lg border border-hairline bg-surface px-3 py-1.5 text-[12px] transition-opacity duration-300"
              style={{
                opacity: isRevealed ? 1 : 0.18,
                transform: isRevealed ? "none" : "translateY(3px)",
              }}
            >
              <span
                className={`grid shrink-0 place-items-center rounded-full text-[9px] font-semibold ${
                  isWritten ? "bg-good-soft text-good" : "bg-surface-3 text-faint"
                }`}
                style={{ height: 18, width: 18 }}
              >
                {isWritten ? "✓" : i + 1}
              </span>
              <span className="min-w-0 flex-1 truncate text-foreground-2">{title}</span>
              <span className="shrink-0 text-[10px] text-faint">
                {isWritten ? (completed ? "Edited" : "Written") : isRevealed ? "Pending" : ""}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

/* ------------------------------------------------------------------ captions */

function Captions({ t }: { t: number }) {
  const oneOut = seg(t, CAPTIONS.one);
  const showOne = t < CAPTIONS.one[1] + 200;
  const showTwo = t >= CAPTIONS.two[0] && t < CAPTIONS.two[1] + 250;
  const showThree = t >= CAPTIONS.three[0];

  // clause activity for sentence 2 (typing) and 3 (pipeline)
  const a2 = [
    t >= T.topic[0] && t < T.audience[0],
    t >= T.audience[0] && t < T.style[0],
    t >= T.style[0] && t < T.length[0],
    t >= T.length[0] && t < T.formOut[0],
  ];
  const a3 = [
    t >= T.planning[0] && t < T.writing[0],
    t >= T.writing[0] && t < T.editing[0],
    t >= T.editing[0] && t < T.rendering[0],
    t >= T.rendering[0],
  ];

  return (
    <div className="relative mx-auto mt-6 flex h-16 max-w-2xl items-center justify-center px-4 text-center">
      {showOne && (
        <p
          className="absolute text-balance text-lg font-medium leading-snug text-foreground sm:text-xl"
          style={{ opacity: 1 - oneOut }}
        >
          This is a 60-page ebook — and it took{" "}
          <Clause on>4 minutes</Clause> to generate.
        </p>
      )}
      {showTwo && (
        <p
          className="absolute text-balance text-lg font-medium leading-snug text-foreground sm:text-xl"
          style={{ opacity: fadeInOut(t, CAPTIONS.two) }}
        >
          You type <Clause on={a2[0]}>what it&apos;s about</Clause>,{" "}
          <Clause on={a2[1]}>who it&apos;s for</Clause>,{" "}
          <Clause on={a2[2]}>how it should sound</Clause>, and{" "}
          <Clause on={a2[3]}>how long</Clause> you want it.
        </p>
      )}
      {showThree && (
        <p
          className="absolute text-balance text-lg font-medium leading-snug text-foreground sm:text-xl"
          style={{ opacity: easeOut(seg(t, [CAPTIONS.three[0], CAPTIONS.three[0] + 350])) }}
        >
          It <Clause on={a3[0]}>plans the chapters</Clause>,{" "}
          <Clause on={a3[1]}>writes the whole thing</Clause>,{" "}
          <Clause on={a3[2]}>edits it</Clause>, and{" "}
          <Clause on={a3[3]}>exports a PDF</Clause>.
        </p>
      )}
    </div>
  );
}

function fadeInOut(t: number, [a, b]: readonly [number, number]) {
  return easeOut(seg(t, [a, a + 350])) * (1 - easeIn(seg(t, [b - 250, b + 250])));
}

function Clause({ children, on = false }: { children: React.ReactNode; on?: boolean }) {
  return (
    <span
      className="font-[family-name:var(--font-display)] italic transition-colors duration-300"
      style={{ color: on ? "var(--accent)" : "var(--faint)" }}
    >
      {children}
    </span>
  );
}

/* ------------------------------------------------------------------- bits */

function Pointer({ t }: { t: number }) {
  // glide from lower-right toward the button center, then a small press dip.
  const glide = easeInOut(seg(t, [T.length[1], T.hover[1]]));
  const press = seg(t, T.press) - seg(t, [T.press[1], T.press[1] + 160]);
  const x = lerp(220, 96, glide);
  const y = lerp(70, 6, glide) + (press > 0 ? 2 : 0);
  return (
    <span
      className="pointer-events-none absolute left-0 top-0 z-30"
      style={{ transform: `translate(${x}px, ${y}px) scale(${press > 0 ? 0.9 : 1})` }}
    >
      <svg width="22" height="22" viewBox="0 0 24 24" className="drop-shadow">
        <path
          d="M5 3l14 7-6 1.5L10 18 5 3z"
          fill="var(--foreground)"
          stroke="var(--surface)"
          strokeWidth="1.4"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
}

function LockIcon() {
  return (
    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="4" y="11" width="16" height="10" rx="2" />
      <path d="M8 11V8a4 4 0 0 1 8 0v3" />
    </svg>
  );
}

function PdfIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3v12m0 0 4-4m-4 4-4-4" />
      <path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" />
    </svg>
  );
}
