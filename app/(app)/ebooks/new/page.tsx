"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { useCredits } from "@/lib/credits-context";
import { ebookApi, ApiError } from "@/lib/api";
import type { EbookRequestInput, GenerationBudgetResponse } from "@/lib/types";
import { Alert, Spinner, controlBase } from "@/components/ui";
import { TargetLengthPicker, lengthBand } from "@/components/target-length-picker";
import { LanguagePicker } from "@/components/language-picker";
import { BookCoverPreview } from "@/components/book-cover-preview";
import { creditsToStart } from "@/lib/ebook-format";
import { languageLabel } from "@/lib/languages";

/** Used until the budget endpoint answers (mirrors the backend defaults). */
const FALLBACK_TARGETS = [20, 30, 50, 75, 100];
const FALLBACK_DEFAULT_TARGET = 30;

const FORM_ID = "new-ebook-form";
/** The unsent brief is kept on this device so a refresh doesn't lose it. */
const DRAFT_KEY = "scrivetta:new-ebook-brief";

const initial: EbookRequestInput = {
  topic: "",
  targetAudience: "",
  style: "",
  language: "English",
  additionalInstructions: "",
  sourceMaterial: "",
  authorName: "",
};

/**
 * Example briefs across very different genres — so the form shows the breadth
 * of what Scrivetta can write. Each is a complete, ready-to-run example.
 */
type Example = {
  tag: string;
  topic: string;
  audience: string;
  style: string;
  instructions: string;
};

const EXAMPLES: Example[] = [
  {
    tag: "Literary fiction",
    topic: "A quiet novel about two estranged sisters reunited one summer on the coast",
    audience: "Adult readers who love character-driven literary fiction",
    style: "Lyrical, introspective, emotionally honest",
    instructions:
      "Alternate points of view between the sisters. Let the sea and the tides mirror their relationship. Avoid melodrama.",
  },
  {
    tag: "SaaS",
    topic: "Building and scaling a B2B SaaS product from zero to first 100 customers",
    audience: "Technical founders and early-stage product teams",
    style: "Practical, direct, example-driven",
    instructions:
      "Cover pricing, onboarding, churn, and go-to-market. Include real playbooks and checklists at the end of each chapter.",
  },
  {
    tag: "E-commerce",
    topic: "Launching a profitable Shopify store: from first product to repeat customers",
    audience: "First-time online store owners and side-hustlers",
    style: "Encouraging, step-by-step, no jargon",
    instructions:
      "Walk through product research, branding, product photography, ads, and email flows. Add a launch checklist and common mistakes.",
  },
  {
    tag: "Children's book",
    topic: "A bedtime story about a little fox who is afraid of the dark",
    audience: "Children aged 4–7 and the parents reading to them",
    style: "Warm, rhythmic, gently reassuring",
    instructions:
      "Keep sentences short and soothing. End on a calm, comforting note perfect for falling asleep.",
  },
  {
    tag: "Personal finance",
    topic: "A beginner's guide to investing your first $1,000 with confidence",
    audience: "Young adults new to money and investing",
    style: "Friendly, reassuring, jargon-free",
    instructions:
      "Explain index funds, compounding, and risk in plain language. Include a simple month-by-month starter plan.",
  },
];

/** One-tap tone words that toggle in and out of the "Writing style" field. */
const STYLE_WORDS = ["Friendly", "Direct", "Academic", "Storytelling", "Witty", "Lyrical"];

function styleParts(style: string): string[] {
  return style
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

export default function NewEbookPage() {
  const router = useRouter();
  const { token } = useAuth();
  const credits = useCredits();

  const [form, setForm] = useState<EbookRequestInput>(initial);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [budget, setBudget] = useState<GenerationBudgetResponse | null>(null);
  // null = "not chosen yet" → the server's default target once the budget loads.
  const [target, setTarget] = useState<number | null>(null);
  const [showSource, setShowSource] = useState(false);
  // Becomes true once the saved brief (if any) has been restored, so the first
  // render's empty form never overwrites it.
  const [restored, setRestored] = useState(false);
  const [savedLocally, setSavedLocally] = useState(false);

  const formRef = useRef<HTMLFormElement>(null);
  const topicRef = useRef<HTMLTextAreaElement>(null);
  const errorRef = useRef<HTMLDivElement>(null);
  // Set once the draft is created, so a pending save can't bring the brief back.
  const createdRef = useRef(false);

  // Load the generation budget (min credits + orientational page range) so we can
  // frame this as a budget, never a fixed page order.
  useEffect(() => {
    if (!token) return;
    let active = true;
    ebookApi
      .generationBudget(token)
      .then((b) => {
        if (active) setBudget(b);
      })
      .catch(() => {
        /* non-fatal: the form still works, just without the estimate */
      });
    return () => {
      active = false;
    };
  }, [token]);

  // Restore an unsent brief from this device (client-only, after hydration).
  useEffect(() => {
    try {
      const raw = localStorage.getItem(DRAFT_KEY);
      if (raw) {
        const saved = JSON.parse(raw) as { form?: Partial<EbookRequestInput>; target?: number | null };
        /* eslint-disable react-hooks/set-state-in-effect */
        if (saved.form) setForm((f) => ({ ...f, ...saved.form }));
        if (typeof saved.target === "number") setTarget(saved.target);
        if (saved.form?.sourceMaterial?.trim()) setShowSource(true);
        if (saved.form?.topic?.trim()) setSavedLocally(true);
      }
    } catch {
      /* storage unavailable or corrupt — start fresh */
    }
    setRestored(true);
    /* eslint-enable react-hooks/set-state-in-effect */
  }, []);

  // Keep the brief on this device while it's being written.
  useEffect(() => {
    if (!restored) return;
    const t = setTimeout(() => {
      if (createdRef.current) return;
      try {
        const empty = Object.entries(form).every(([k, v]) => k === "language" || !String(v ?? "").trim());
        if (empty) {
          localStorage.removeItem(DRAFT_KEY);
          setSavedLocally(false);
        } else {
          localStorage.setItem(DRAFT_KEY, JSON.stringify({ form, target }));
          setSavedLocally(true);
        }
      } catch {
        /* storage unavailable — nothing to do */
      }
    }, 400);
    return () => clearTimeout(t);
  }, [form, target, restored]);

  // Grow the topic field with its text instead of scrolling inside it.
  useEffect(() => {
    const el = topicRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  }, [form.topic]);

  // Ctrl/⌘ + Enter submits from anywhere on the page.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
        e.preventDefault();
        formRef.current?.requestSubmit();
      }
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  const targetOptions = budget?.targetOptions?.length ? budget.targetOptions : FALLBACK_TARGETS;
  const targetPages = target ?? budget?.defaultTargetPages ?? FALLBACK_DEFAULT_TARGET;
  const balance = credits?.balance ?? budget?.balance ?? null;
  // Credits needed to start at this target (never more than the target itself).
  const minCredits = creditsToStart(budget?.minCredits ?? null, targetPages);
  // Pages the balance covers (capped server-side); follows the live balance.
  const affordablePages =
    balance === null ? null : Math.max(0, Math.min(balance, budget?.affordablePages ?? balance));
  // Enough budget to *generate* on the next step. Creating a draft is always
  // free, so this only drives messaging, not whether they can continue.
  const insufficient =
    balance !== null && minCredits !== null && balance < minCredits;
  // The book is planned at the smaller of the target and what the balance covers.
  const plannedPages = affordablePages === null ? targetPages : Math.min(targetPages, affordablePages);
  const overBudget = !insufficient && affordablePages !== null && targetPages > affordablePages;
  const estimate = insufficient ? targetPages : plannedPages;

  const band = lengthBand(targetPages);
  const topicError = fieldErrors.topic;
  const activeStyles = styleParts(form.style).map((s) => s.toLowerCase());

  const done = {
    topic: !!form.topic.trim(),
    voice: !!(form.targetAudience.trim() && form.style.trim()),
    notes: !!(form.additionalInstructions.trim() || form.sourceMaterial.trim()),
  };

  function update<K extends keyof EbookRequestInput>(key: K, value: EbookRequestInput[K]) {
    setForm((f) => ({ ...f, [key]: value }));
    if (fieldErrors[key]) {
      setFieldErrors((fe) => {
        const next = { ...fe };
        delete next[key];
        return next;
      });
    }
  }

  function applyExample(example: Example) {
    setForm((f) => ({
      ...f,
      topic: example.topic,
      targetAudience: example.audience,
      style: example.style,
      additionalInstructions: example.instructions,
    }));
    setFieldErrors({});
    setError(null);
  }

  function toggleStyle(word: string) {
    const parts = styleParts(form.style);
    const i = parts.findIndex((p) => p.toLowerCase() === word.toLowerCase());
    if (i >= 0) parts.splice(i, 1);
    else parts.push(word);
    update("style", parts.join(", "));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!token || submitting) return;
    setError(null);
    if (!form.topic.trim()) {
      setFieldErrors({ topic: "Describe the book in a sentence to continue." });
      topicRef.current?.focus();
      return;
    }
    setFieldErrors({});
    setSubmitting(true);
    try {
      // Create a draft — no credits are charged yet. The next screen lets the
      // user add assets and then generate (which reserves the credits).
      const created = await ebookApi.create(token, {
        ...form,
        authorName: form.authorName?.trim() || undefined,
        targetPages,
      });
      createdRef.current = true;
      try {
        localStorage.removeItem(DRAFT_KEY);
      } catch {
        /* storage unavailable */
      }
      router.push(`/ebooks/${created.id}`);
    } catch (err) {
      if (err instanceof ApiError) {
        setFieldErrors(err.fieldErrors ?? {});
        setError(err.fieldErrors ? null : err.message);
        if (err.fieldErrors?.topic) topicRef.current?.focus();
      } else {
        setError("Something went wrong. Please try again.");
      }
      setSubmitting(false);
      requestAnimationFrame(() => errorRef.current?.scrollIntoView({ block: "center", behavior: "smooth" }));
    }
  }

  return (
    <div className="pb-24 lg:pb-0">
      <Link href="/dashboard" className="text-sm text-muted transition-colors hover:text-foreground">
        ← Your ebooks
      </Link>

      <header className="mb-8 mt-3 flex flex-col gap-4 border-b border-hairline pb-6 sm:mb-9 sm:flex-row sm:items-end sm:justify-between sm:gap-6">
        <div>
          <h1 className="text-balance font-display text-[38px] leading-none tracking-tight text-foreground sm:text-[50px]">
            Start a new <em className="text-accent">book</em>
          </h1>
          <p className="mt-2.5 max-w-[52ch] text-[15px] text-muted">
            Describe it once. We plan, write and edit it — then hand you a finished PDF.
          </p>
        </div>
        <ol className="flex items-center gap-2 text-xs text-muted" aria-label="Steps">
          <Step on>Brief</Step>
          <li aria-hidden className="h-px w-[18px] bg-hairline-2" />
          <Step>Assets</Step>
          <li aria-hidden className="h-px w-[18px] bg-hairline-2" />
          <Step>Generate</Step>
        </ol>
      </header>

      <div className="grid gap-9 xl:grid-cols-[minmax(0,1fr)_320px] xl:items-start xl:gap-12">
        <form id={FORM_ID} ref={formRef} onSubmit={onSubmit} noValidate className="min-w-0">
          {error && (
            <div ref={errorRef} className="mb-6">
              <Alert>{error}</Alert>
            </div>
          )}

          <Section n={1} done={done.topic} title="What is the book about?" sub="One or two sentences. The more specific, the better the outline.">
            <label htmlFor="topic" className="sr-only">
              Topic
            </label>
            <textarea
              ref={topicRef}
              id="topic"
              name="topic"
              rows={2}
              required
              value={form.topic}
              onChange={(e) => update("topic", e.target.value)}
              placeholder={EXAMPLES[0].topic}
              aria-invalid={!!topicError}
              aria-describedby={topicError ? "topic-error" : undefined}
              className={`block min-h-[62px] w-full resize-none overflow-hidden border-0 border-b bg-transparent pb-3 font-display text-[23px] leading-[1.22] text-foreground transition-colors placeholder:italic placeholder:text-faint focus:outline-none sm:min-h-[78px] sm:text-[29px] ${
                topicError ? "border-red-500" : "border-hairline-2 focus:border-accent"
              }`}
            />
            {topicError && (
              <p id="topic-error" className="mt-1.5 text-xs text-red-600 dark:text-red-400">
                {topicError}
              </p>
            )}
            <div className="mt-2.5 flex flex-wrap items-center gap-1.5 text-xs text-muted">
              <span className="mr-0.5">Try:</span>
              {EXAMPLES.map((ex) => (
                <button
                  key={ex.tag}
                  type="button"
                  onClick={() => applyExample(ex)}
                  className="rounded-full border border-hairline-2 bg-surface px-2.5 py-1 text-xs text-foreground-2 transition-colors hover:border-accent hover:bg-accent-soft hover:text-accent-ink"
                >
                  {ex.tag}
                </button>
              ))}
            </div>
          </Section>

          <Section n={2} done={done.voice} title="Who is it for, and how should it sound?">
            <div className="grid gap-4 sm:grid-cols-2">
              <TextInput
                id="targetAudience"
                label="Target audience"
                value={form.targetAudience}
                onChange={(v) => update("targetAudience", v)}
                placeholder={EXAMPLES[0].audience}
                error={fieldErrors.targetAudience}
              />
              <div>
                <TextInput
                  id="style"
                  label="Writing style"
                  value={form.style}
                  onChange={(v) => update("style", v)}
                  placeholder={EXAMPLES[0].style}
                  error={fieldErrors.style}
                />
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {STYLE_WORDS.map((word) => {
                    const on = activeStyles.includes(word.toLowerCase());
                    return (
                      <button
                        key={word}
                        type="button"
                        aria-pressed={on}
                        onClick={() => toggleStyle(word)}
                        className={`rounded-lg border px-2.5 py-1 text-xs transition-colors ${
                          on
                            ? "border-foreground bg-foreground text-background"
                            : "border-hairline-2 text-muted hover:border-faint hover:text-foreground"
                        }`}
                      >
                        {word}
                      </button>
                    );
                  })}
                </div>
              </div>
              <LanguagePicker value={form.language} onChange={(v) => update("language", v)} />
              <TextInput
                id="authorName"
                label="Author name on cover"
                optional
                value={form.authorName ?? ""}
                onChange={(v) => update("authorName", v)}
                placeholder="Your name or pen name"
                maxLength={80}
                error={fieldErrors.authorName}
              />
            </div>
          </Section>

          <Section n={3} done={done.notes} title="Anything we should know?" sub="Optional — focus areas, things to include or avoid.">
            <label htmlFor="additionalInstructions" className="sr-only">
              Additional instructions
            </label>
            <textarea
              id="additionalInstructions"
              name="additionalInstructions"
              value={form.additionalInstructions}
              onChange={(e) => update("additionalInstructions", e.target.value)}
              placeholder={EXAMPLES[0].instructions}
              className={`min-h-24 w-full resize-y text-base leading-relaxed sm:text-sm ${controlBase}`}
            />
            <div className="mt-3.5 rounded-xl border border-hairline-2 bg-surface-2">
              <button
                type="button"
                aria-expanded={showSource}
                aria-controls="source-panel"
                onClick={() => setShowSource((s) => !s)}
                className="flex w-full items-center gap-2.5 px-3.5 py-3 text-left text-[13px] text-foreground-2"
              >
                <span
                  aria-hidden
                  className={`grid h-[18px] w-[18px] place-items-center rounded-[5px] border border-hairline-2 text-xs text-muted transition-transform ${
                    showSource ? "rotate-45" : ""
                  }`}
                >
                  +
                </span>
                Add source material or examples
                <span className="ml-auto text-[11px] text-faint">
                  {form.sourceMaterial.trim()
                    ? `${form.sourceMaterial.length.toLocaleString("en")} chars added`
                    : "optional"}
                </span>
              </button>
              {showSource && (
                <div id="source-panel" className="px-3.5 pb-3.5">
                  <label htmlFor="sourceMaterial" className="sr-only">
                    Source material or examples
                  </label>
                  <textarea
                    id="sourceMaterial"
                    name="sourceMaterial"
                    value={form.sourceMaterial}
                    onChange={(e) => update("sourceMaterial", e.target.value)}
                    placeholder="Paste notes, an article, or a sample chapter. We'll use it to ground the book."
                    className={`min-h-28 w-full resize-y text-base leading-relaxed sm:text-sm ${controlBase}`}
                  />
                  <p className="mt-1.5 text-xs text-muted">Plain text works best.</p>
                </div>
              )}
            </div>
          </Section>

          <Section n={4} done title="How long?">
            <TargetLengthPicker
              options={targetOptions}
              value={targetPages}
              onChange={setTarget}
              // With too few credits to generate at all, the credits card below
              // says so — don't also flag every length as uncovered.
              affordablePages={insufficient ? null : affordablePages}
            />
          </Section>
        </form>

        {/* Live preview + credits + the primary action. */}
        <aside className="grid gap-3.5 sm:grid-cols-2 sm:items-start xl:sticky xl:top-8 xl:flex xl:flex-col">
          <div className="rounded-[18px] border border-hairline bg-surface bg-[radial-gradient(120%_80%_at_50%_0%,var(--accent-soft),transparent_62%)] p-5 shadow-soft sm:row-span-3">
            <div className="mb-3 flex justify-between text-[11px] uppercase tracking-[0.06em] text-muted">
              <span>Preview</span>
              <span className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-good ring-[3px] ring-good-soft" />
                Live
              </span>
            </div>
            <BookCoverPreview
              topic={form.topic}
              audience={form.targetAudience}
              author={form.authorName ?? ""}
              pages={targetPages}
            />
            <p className="mt-2.5 text-center text-[11.5px] text-muted">
              Working title — the final title and cover are designed during generation.
            </p>
            <dl className="mt-4 grid grid-cols-3 overflow-hidden rounded-[10px] border border-hairline bg-surface">
              <Spec label="Length" value={`~${targetPages} pp`} />
              <Spec label="Language" value={languageLabel(form.language) || "English"} />
              <Spec label="Tone" value={styleParts(form.style)[0] ?? "—"} />
            </dl>
          </div>

          <div
            className={`rounded-[14px] border p-4 ${
              insufficient || overBudget
                ? "border-[color-mix(in_oklab,var(--warn)_40%,transparent)] bg-warn-soft"
                : "border-hairline bg-surface"
            }`}
          >
            <BillRow label="Estimated usage" value={`~${estimate} credits`} />
            <BillRow label="Your balance" value={balance === null ? "…" : `${balance.toLocaleString("en")} credits`} />
            <div className="mb-1 mt-3 h-[5px] overflow-hidden rounded-full bg-surface-3">
              <i
                className={`block h-full rounded-full transition-[width] duration-300 ${
                  insufficient || overBudget ? "bg-warn" : "bg-accent"
                }`}
                style={{
                  width: `${balance ? Math.min(100, (estimate / balance) * 100) : balance === 0 ? 100 : 0}%`,
                }}
              />
            </div>
            <div className="mt-1.5 border-t border-dashed border-hairline-2 pt-2.5">
              {insufficient ? (
                <BillRow label="Needed to generate" value={`${minCredits} credits`} strong />
              ) : (
                <BillRow
                  label="After this book"
                  value={balance === null ? "…" : `~${(balance - plannedPages).toLocaleString("en")} credits`}
                  strong
                />
              )}
            </div>
            <p className={`mt-2.5 text-[11.5px] leading-normal ${insufficient ? "text-foreground-2" : "text-muted"}`}>
              {insufficient
                ? `You need at least ${minCredits} credits to generate this book. You can still continue — add your images first and top up before generating.`
                : "1 credit = 1 final page, charged when you generate and only for the pages actually produced. Unused credits stay on your account."}
            </p>
            {(insufficient || overBudget) && (
              <Link href="/billing" className="mt-2.5 inline-block text-[12.5px] font-semibold text-accent hover:underline">
                Buy credits →
              </Link>
            )}
          </div>

          <div className="hidden lg:block">
            <button
              type="submit"
              form={FORM_ID}
              disabled={submitting}
              className="flex h-12 w-full items-center justify-between rounded-xl bg-foreground pl-[18px] pr-2 text-sm font-semibold text-background transition-[background,color,transform] hover:bg-accent hover:text-white active:translate-y-px disabled:cursor-wait disabled:opacity-70"
            >
              {submitting ? "Creating draft…" : "Continue to assets"}
              <span className="grid h-8 w-8 place-items-center rounded-lg bg-white/15">
                {submitting ? <Spinner /> : "→"}
              </span>
            </button>
            <div className="mt-2.5 flex flex-wrap justify-center gap-x-2.5 gap-y-1 text-center text-xs text-muted">
              <span>
                Creating the draft is free · <Kbd>Ctrl</Kbd> <Kbd>↵</Kbd>
              </span>
              {savedLocally && (
                <span className="flex items-center gap-1.5 text-faint">
                  <span className="h-[5px] w-[5px] rounded-full bg-good" />
                  Draft saved on this device
                </span>
              )}
            </div>
          </div>
        </aside>
      </div>

      {/* Sticky action bar on small screens. */}
      <div className="fixed inset-x-0 bottom-0 z-30 flex items-center gap-3 border-t border-hairline bg-[color-mix(in_srgb,var(--surface)_92%,transparent)] px-4 pb-[calc(12px+env(safe-area-inset-bottom))] pt-3 backdrop-blur-md lg:hidden">
        <div className="flex flex-col text-[11px] leading-tight text-muted">
          <span>Estimated · {band.name.toLowerCase()}</span>
          <b className="text-sm font-semibold text-foreground tabular-nums">
            ~{estimate} credits · {targetPages} pp
          </b>
        </div>
        <button
          type="submit"
          form={FORM_ID}
          disabled={submitting}
          className="ml-auto inline-flex h-[46px] items-center gap-2 rounded-xl bg-accent px-5 text-[15px] font-semibold text-white disabled:opacity-70"
        >
          {submitting && <Spinner />}
          Continue →
        </button>
      </div>
    </div>
  );
}

// ---- Pieces ----------------------------------------------------------------

function Step({ on = false, children }: { on?: boolean; children: React.ReactNode }) {
  return (
    <li className={`flex items-center gap-1.5 ${on ? "font-semibold text-foreground" : ""}`} aria-current={on ? "step" : undefined}>
      <span
        className={`h-[7px] w-[7px] rounded-full ${on ? "bg-accent ring-[3px] ring-accent-soft" : "bg-hairline-2"}`}
      />
      {children}
    </li>
  );
}

/** A numbered brief section; the number turns into a check once it's filled in. */
function Section({
  n,
  done,
  title,
  sub,
  children,
}: {
  n: number;
  done: boolean;
  title: string;
  sub?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="grid gap-x-2 pb-8 [&+&]:border-t [&+&]:border-dashed [&+&]:border-hairline-2 [&+&]:pt-7 sm:grid-cols-[40px_minmax(0,1fr)]">
      <span
        aria-hidden
        className={`mb-2 grid h-6 w-6 place-items-center rounded-full font-mono text-[11px] transition-colors sm:mb-0 ${
          done ? "bg-good-soft text-good" : "border border-hairline-2 text-faint"
        }`}
      >
        {done ? "✓" : String(n).padStart(2, "0")}
      </span>
      <div className="min-w-0">
        <h2 className="pt-0.5 text-[15px] font-semibold tracking-tight text-foreground">{title}</h2>
        {sub && <p className="mt-0.5 text-[13px] text-muted">{sub}</p>}
        <div className="mt-4">{children}</div>
      </div>
    </section>
  );
}

function TextInput({
  id,
  label,
  optional = false,
  value,
  onChange,
  placeholder,
  maxLength,
  error,
}: {
  id: string;
  label: string;
  optional?: boolean;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  maxLength?: number;
  error?: string;
}) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-xs font-medium text-muted">
        {label}
        {optional && <span className="font-normal text-faint"> · optional</span>}
      </label>
      <input
        id={id}
        name={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        maxLength={maxLength}
        aria-invalid={!!error}
        className={`w-full text-base sm:text-sm ${controlBase}`}
      />
      {error && <p className="mt-1.5 text-xs text-red-600 dark:text-red-400">{error}</p>}
    </div>
  );
}

function Spec({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0 px-2.5 py-2 [&+&]:border-l [&+&]:border-hairline">
      <dt className="text-[10px] uppercase tracking-[0.06em] text-muted">{label}</dt>
      <dd className="mt-0.5 truncate text-[13px] font-medium text-foreground">{value}</dd>
    </div>
  );
}

function BillRow({ label, value, strong = false }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className={`flex items-baseline justify-between py-0.5 text-[13px] ${strong ? "text-foreground" : "text-muted"}`}>
      <span>{label}</span>
      <b className="font-semibold tabular-nums text-foreground">{value}</b>
    </div>
  );
}

function Kbd({ children }: { children: React.ReactNode }) {
  return (
    <kbd className="rounded border border-b-2 border-hairline-2 px-1 font-mono text-[10.5px] text-muted">
      {children}
    </kbd>
  );
}
