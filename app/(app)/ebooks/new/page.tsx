"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { useCredits } from "@/lib/credits-context";
import { ebookApi, ApiError } from "@/lib/api";
import type { EbookRequestInput, GenerationBudgetResponse } from "@/lib/types";
import { Alert, Button, Field, TextAreaField } from "@/components/ui";

const initial: EbookRequestInput = {
  topic: "",
  targetAudience: "",
  style: "",
  language: "English",
  additionalInstructions: "",
  sourceMaterial: "",
};

/**
 * Rotating example briefs across very different genres — so the form shows
 * the breadth of what Scrivetta can write, and never feels like a blank,
 * one-note SaaS form. Each is a complete, ready-to-run example.
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
    tag: "SaaS & startups",
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

export default function NewEbookPage() {
  const router = useRouter();
  const { token } = useAuth();
  const credits = useCredits();

  const [form, setForm] = useState<EbookRequestInput>(initial);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [exIdx, setExIdx] = useState(0);
  const [budget, setBudget] = useState<GenerationBudgetResponse | null>(null);

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

  // Rotate the example brief every few seconds so the placeholders keep
  // suggesting different kinds of books (fiction, SaaS, e-commerce…).
  useEffect(() => {
    // Randomise the starting example on the client only (doing it during render
    // would cause an SSR/CSR hydration mismatch).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setExIdx(Math.floor(Math.random() * EXAMPLES.length));
    const t = setInterval(() => setExIdx((n) => (n + 1) % EXAMPLES.length), 5000);
    return () => clearInterval(t);
  }, []);

  const example = EXAMPLES[exIdx];

  function useExample() {
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

  const balance = credits?.balance ?? budget?.balance ?? null;
  const minCredits = budget?.minCredits ?? null;
  // Enough budget to *generate* on the next step. Creating a draft is always
  // free, so this only drives messaging, not whether they can continue.
  const insufficient =
    balance !== null && minCredits !== null && balance < minCredits;

  function update<K extends keyof EbookRequestInput>(key: K, value: EbookRequestInput[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!token) return;
    setError(null);
    setFieldErrors({});
    setSubmitting(true);
    try {
      // Create a draft — no credits are charged yet. The next screen lets the
      // user add assets and then generate (which reserves the credits).
      const created = await ebookApi.create(token, form);
      router.push(`/ebooks/${created.id}`);
    } catch (err) {
      if (err instanceof ApiError) {
        setFieldErrors(err.fieldErrors ?? {});
        setError(err.fieldErrors ? null : err.message);
      } else {
        setError("Something went wrong. Please try again.");
      }
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6">
        <Link href="/dashboard" className="text-sm text-zinc-500 hover:underline dark:text-zinc-400">
          ← Back to your ebooks
        </Link>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
          New ebook
        </h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          Describe your book. We&apos;ll plan it, write it, edit it, and hand you a PDF.
        </p>
      </div>

      {/* Rotating inspiration — shows the breadth of what you can write. */}
      <div className="mb-5 flex flex-wrap items-center gap-2 rounded-xl border border-hairline bg-surface-2 px-4 py-3">
        <span className="text-sm text-muted">Need inspiration?</span>
        <span className="inline-flex items-center rounded-full bg-accent-soft px-2.5 py-0.5 text-xs font-semibold text-accent-ink">
          {example.tag}
        </span>
        <span key={exIdx} className="float-in min-w-0 flex-1 truncate text-sm text-foreground-2">
          “{example.topic}”
        </span>
        <button
          type="button"
          onClick={useExample}
          className="shrink-0 rounded-lg border border-hairline-2 bg-surface px-3 py-1.5 text-xs font-semibold text-accent transition-colors hover:border-accent"
        >
          Use this example
        </button>
      </div>

      <form onSubmit={onSubmit} className="flex flex-col gap-5">
        {error && <Alert>{error}</Alert>}

        <TextAreaField
          label="Topic"
          name="topic"
          required
          value={form.topic}
          onChange={(e) => update("topic", e.target.value)}
          error={fieldErrors.topic}
          placeholder={`e.g. ${example.topic}`}
        />

        <div className="grid gap-5 sm:grid-cols-2">
          <Field
            label="Target audience"
            name="targetAudience"
            value={form.targetAudience}
            onChange={(e) => update("targetAudience", e.target.value)}
            placeholder={`e.g. ${example.audience}`}
          />
          <Field
            label="Writing style"
            name="style"
            value={form.style}
            onChange={(e) => update("style", e.target.value)}
            placeholder={`e.g. ${example.style}`}
          />
          <Field
            label="Language"
            name="language"
            value={form.language}
            onChange={(e) => update("language", e.target.value)}
            placeholder="English"
          />
        </div>

        <TextAreaField
          label="Additional instructions"
          name="additionalInstructions"
          value={form.additionalInstructions}
          onChange={(e) => update("additionalInstructions", e.target.value)}
          hint="Optional. What to focus on, tone, things to include or avoid."
          placeholder={example.instructions}
        />

        <TextAreaField
          label="Source material / examples"
          name="sourceMaterial"
          value={form.sourceMaterial}
          onChange={(e) => update("sourceMaterial", e.target.value)}
          hint="Optional. Paste any reference text or examples to ground the book."
        />

        {/* Generation budget — not a page order. The charge happens when you
            generate on the next step, and only for the pages actually produced. */}
        <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-900/40">
          <div className="flex items-center justify-between text-sm">
            <span className="text-zinc-600 dark:text-zinc-300">Estimated usage</span>
            <span className="font-medium text-zinc-900 dark:text-zinc-50">
              {budget
                ? `~${budget.estimatedPagesLow}–${budget.estimatedPagesHigh} credits`
                : "…"}
            </span>
          </div>
          <div className="mt-1 flex items-center justify-between text-sm">
            <span className="text-zinc-600 dark:text-zinc-300">Your balance</span>
            <span className="font-medium text-zinc-900 dark:text-zinc-50">
              {balance === null ? "…" : `${balance} credits`}
            </span>
          </div>
          <p className="mt-3 border-t border-zinc-200 pt-3 text-sm text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
            {insufficient
              ? `You need at least ${minCredits} credits to generate a standard ebook — you can add assets first and buy credits before generating.`
              : `Scrivetta decides how long a complete ebook needs to be${
                  budget ? ` (usually ${budget.estimatedPagesLow}–${budget.estimatedPagesHigh} pages)` : ""
                } — a bigger topic can use more, up to your balance. Credits are the budget, not a page count: you're only charged for the pages actually produced, when you generate.`}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button type="submit" loading={submitting}>
            Continue → add assets
          </Button>
          <span className="text-xs text-zinc-400">
            Next: upload any images you want in the book, then generate.
          </span>
        </div>
      </form>
    </div>
  );
}
