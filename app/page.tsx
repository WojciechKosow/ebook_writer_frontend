import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { ButtonLink } from "@/components/ui";
import { BRAND } from "@/lib/brand";

const steps = [
  {
    title: "Describe your book",
    body: "Give a topic, audience, style, language, and rough length. One short brief is all it takes.",
  },
  {
    title: "AI writes it, chapter by chapter",
    body: "We plan the outline, write each chapter in order, then run an editorial pass for consistency.",
  },
  {
    title: "Download the PDF",
    body: "Get a clean, typeset ebook — cover, table of contents, chapters, and page numbers.",
  },
];

export default function Home() {
  return (
    <>
      <SiteHeader />

      <main className="flex-1">
        {/* Hero */}
        <section className="mx-auto w-full max-w-5xl px-6 py-24 sm:py-32">
          <div className="mx-auto max-w-2xl text-center">
            <span className="inline-flex items-center rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700 dark:border-indigo-900/60 dark:bg-indigo-950/40 dark:text-indigo-300">
              From one prompt to a finished ebook
            </span>
            <h1 className="mt-6 text-4xl font-semibold tracking-tight text-zinc-900 sm:text-5xl dark:text-zinc-50">
              Write a complete ebook from a single idea.
            </h1>
            <p className="mx-auto mt-5 max-w-xl text-lg leading-8 text-zinc-600 dark:text-zinc-400">
              {BRAND} plans, writes, and edits a full-length ebook for you — then hands
              you a polished PDF ready to read or sell. No outlines to fill in, no blank page.
            </p>
            <div className="mt-8 flex items-center justify-center gap-3">
              <ButtonLink href="/register">Start writing free</ButtonLink>
              <ButtonLink href="/login" variant="secondary">
                Log in
              </ButtonLink>
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="border-t border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900/40">
          <div className="mx-auto w-full max-w-5xl px-6 py-20">
            <h2 className="text-center text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
              How it works
            </h2>
            <div className="mt-12 grid gap-8 sm:grid-cols-3">
              {steps.map((step, i) => (
                <div key={step.title} className="flex flex-col">
                  <div className="grid h-9 w-9 place-items-center rounded-full bg-indigo-600 text-sm font-semibold text-white">
                    {i + 1}
                  </div>
                  <h3 className="mt-4 text-base font-semibold text-zinc-900 dark:text-zinc-50">
                    {step.title}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
                    {step.body}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="mx-auto w-full max-w-5xl px-6 py-20">
          <div className="rounded-2xl bg-indigo-600 px-8 py-12 text-center">
            <h2 className="text-2xl font-semibold tracking-tight text-white">
              Ready to write your first ebook?
            </h2>
            <p className="mx-auto mt-2 max-w-md text-indigo-100">
              Create an account and generate a complete draft in minutes.
            </p>
            <div className="mt-6 flex justify-center">
              <ButtonLink
                href="/register"
                variant="secondary"
                className="border-transparent bg-white text-indigo-700 hover:bg-indigo-50"
              >
                Get started
              </ButtonLink>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </>
  );
}
