"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { useCredits } from "@/lib/credits-context";
import { ebookApi, ApiError } from "@/lib/api";
import type { EbookRequestInput } from "@/lib/types";
import { Alert, Button, ButtonLink, Field, TextAreaField } from "@/components/ui";

const initial: EbookRequestInput = {
  topic: "",
  targetAudience: "",
  style: "",
  approxPageCount: 30,
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
  pages: number;
};

const EXAMPLES: Example[] = [
  {
    tag: "Literary fiction",
    topic: "A quiet novel about two estranged sisters reunited one summer on the coast",
    audience: "Adult readers who love character-driven literary fiction",
    style: "Lyrical, introspective, emotionally honest",
    instructions:
      "Alternate points of view between the sisters. Let the sea and the tides mirror their relationship. Avoid melodrama.",
    pages: 220,
  },
  {
    tag: "SaaS & startups",
    topic: "Building and scaling a B2B SaaS product from zero to first 100 customers",
    audience: "Technical founders and early-stage product teams",
    style: "Practical, direct, example-driven",
    instructions:
      "Cover pricing, onboarding, churn, and go-to-market. Include real playbooks and checklists at the end of each chapter.",
    pages: 90,
  },
  {
    tag: "E-commerce",
    topic: "Launching a profitable Shopify store: from first product to repeat customers",
    audience: "First-time online store owners and side-hustlers",
    style: "Encouraging, step-by-step, no jargon",
    instructions:
      "Walk through product research, branding, product photography, ads, and email flows. Add a launch checklist and common mistakes.",
    pages: 70,
  },
  {
    tag: "Children's book",
    topic: "A bedtime story about a little fox who is afraid of the dark",
    audience: "Children aged 4–7 and the parents reading to them",
    style: "Warm, rhythmic, gently reassuring",
    instructions:
      "Keep sentences short and soothing. End on a calm, comforting note perfect for falling asleep.",
    pages: 24,
  },
  {
    tag: "Personal finance",
    topic: "A beginner's guide to investing your first $1,000 with confidence",
    audience: "Young adults new to money and investing",
    style: "Friendly, reassuring, jargon-free",
    instructions:
      "Explain index funds, compounding, and risk in plain language. Include a simple month-by-month starter plan.",
    pages: 60,
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

  // Rotate the example brief every few seconds so the placeholders keep
  // suggesting different kinds of books (fiction, SaaS, e-commerce…).
  useEffect(() => {
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
      approxPageCount: example.pages,
    }));
    setFieldErrors({});
    setError(null);
  }

  const cost = Math.max(1, form.approxPageCount || 0);
  const balance = credits?.balance ?? null;
  const insufficient = balance !== null && balance < cost;

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
      const created = await ebookApi.create(token, form);
      credits?.refresh();
      router.push(`/ebooks/${created.id}`);
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.status === 402) {
          const body = err.body as { required?: number; available?: number } | undefined;
          setError(
            `You need ${body?.required ?? cost} credits but have ${body?.available ?? balance ?? 0}.`,
          );
          credits?.refresh();
        } else {
          setFieldErrors(err.fieldErrors ?? {});
          setError(err.fieldErrors ? null : err.message);
        }
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
            label="Approx. page count"
            name="approxPageCount"
            type="number"
            min={1}
            max={500}
            required
            value={form.approxPageCount}
            onChange={(e) => update("approxPageCount", Number(e.target.value))}
            error={fieldErrors.approxPageCount}
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

        {/* Cost vs balance */}
        <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-900/40">
          <div className="flex items-center justify-between text-sm">
            <span className="text-zinc-600 dark:text-zinc-300">Estimated cost</span>
            <span className="font-medium text-zinc-900 dark:text-zinc-50">{cost} credits</span>
          </div>
          <div className="mt-1 flex items-center justify-between text-sm">
            <span className="text-zinc-600 dark:text-zinc-300">Your balance</span>
            <span className="font-medium text-zinc-900 dark:text-zinc-50">
              {balance === null ? "…" : `${balance} credits`}
            </span>
          </div>
          {insufficient && (
            <div className="mt-3 border-t border-zinc-200 pt-3 dark:border-zinc-800">
              <p className="text-sm text-amber-700 dark:text-amber-400">
                You need {cost} credits but have {balance}. Buy more to continue.
              </p>
            </div>
          )}
        </div>

        <div className="flex items-center gap-3">
          {insufficient ? (
            <ButtonLink href="/billing">Buy credits</ButtonLink>
          ) : (
            <Button type="submit" loading={submitting} disabled={balance === null}>
              Generate ebook — {cost} credits
            </Button>
          )}
          <span className="text-xs text-zinc-400">
            This can take several minutes — you can watch the progress on the next screen.
          </span>
        </div>
      </form>
    </div>
  );
}
