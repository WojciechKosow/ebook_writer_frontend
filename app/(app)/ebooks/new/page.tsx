"use client";

import { useState } from "react";
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

export default function NewEbookPage() {
  const router = useRouter();
  const { token } = useAuth();
  const credits = useCredits();

  const [form, setForm] = useState<EbookRequestInput>(initial);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

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

      <form onSubmit={onSubmit} className="flex flex-col gap-5">
        {error && <Alert>{error}</Alert>}

        <TextAreaField
          label="Topic"
          name="topic"
          required
          value={form.topic}
          onChange={(e) => update("topic", e.target.value)}
          error={fieldErrors.topic}
          placeholder="e.g. Building SaaS applications with Spring Boot"
        />

        <div className="grid gap-5 sm:grid-cols-2">
          <Field
            label="Target audience"
            name="targetAudience"
            value={form.targetAudience}
            onChange={(e) => update("targetAudience", e.target.value)}
            placeholder="e.g. Junior Java developers"
          />
          <Field
            label="Writing style"
            name="style"
            value={form.style}
            onChange={(e) => update("style", e.target.value)}
            placeholder="e.g. Practical, technical, easy to follow"
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
          placeholder="Focus on real-world development. Include practical examples and explain step by step."
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
