"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { EXAMPLES, saveExampleBrief } from "@/lib/brief";
import { BookCover } from "./book-cover";

/** Starter ideas: a short cover title plus the full example brief they pre-fill. */
const IDEAS = [
  { title: "Your First $1,000", tag: "Personal finance", pages: 30 },
  { title: "From First Product to Repeat Customers", tag: "E-commerce", pages: 50 },
  { title: "The Little Fox Who Feared the Dark", tag: "Children's book", pages: 20 },
].flatMap((idea) => {
  const example = EXAMPLES.find((e) => e.tag === idea.tag);
  return example ? [{ ...idea, example }] : [];
});

/** Silhouettes on the empty shelf: [width, height, kind]. */
const GHOSTS: [number, number, "" | "first" | "lean"][] = [
  [62, 150, ""],
  [48, 170, ""],
  [118, 176, "first"],
  [44, 160, ""],
  [56, 140, "lean"],
  [40, 150, ""],
  [52, 128, ""],
];

export function EmptyLibrary({ balance }: { balance: number | null }) {
  const router = useRouter();

  function pickIdea(idea: (typeof IDEAS)[number]) {
    saveExampleBrief(idea.example, idea.pages);
    router.push("/ebooks/new");
  }

  return (
    <section className="mt-8 overflow-hidden rounded-[22px] border border-hairline bg-surface shadow-soft">
      <div className="bg-[radial-gradient(70%_90%_at_50%_100%,var(--accent-soft),transparent_70%)] px-5 pt-9 text-center sm:px-10 sm:pt-13">
        <h2 className="text-balance font-display text-[30px] leading-[1.05] text-foreground sm:text-[40px]">
          An empty shelf is <em className="text-accent">a good start.</em>
        </h2>
        <p className="mx-auto mt-2.5 max-w-[52ch] text-[15px] text-muted">
          Describe a book in a few lines. We plan it, write it, edit it — and put it right here.
        </p>
        <div className="mt-9 flex items-end justify-center gap-2.5 px-5">
          {GHOSTS.map(([w, h, kind], i) =>
            kind === "first" ? (
              <Link
                key={i}
                href="/ebooks/new"
                style={{ width: w, height: h }}
                className="flex shrink-0 flex-col justify-between rounded-[2px_5px_5px_2px] bg-accent py-3.5 pl-4 pr-3 text-left text-white shadow-[inset_4px_0_0_rgba(0,0,0,.18),0_18px_30px_-14px_color-mix(in_oklab,var(--accent)_70%,transparent)] transition-transform hover:-translate-y-1.5"
              >
                <span className="font-display text-[30px] leading-none">+</span>
                <span>
                  <span className="block font-display text-[21px] leading-[1.05]">Your first book</span>
                  <small className="mt-2 block font-mono text-[9px] uppercase tracking-[0.12em] opacity-80">
                    Start here
                  </small>
                </span>
              </Link>
            ) : (
              <span
                key={i}
                aria-hidden
                style={{ width: w, height: h }}
                className={`shrink-0 rounded-[2px_5px_5px_2px] border-[1.5px] border-dashed border-hairline-2 bg-surface-2 ${
                  kind === "lean" ? "mr-1.5 origin-bottom-right -rotate-[7deg]" : ""
                } ${i === 0 || i === GHOSTS.length - 1 ? "hidden sm:block" : ""}`}
              />
            ),
          )}
        </div>
        <div className="mx-auto h-2.5 max-w-[520px] rounded-[3px] bg-gradient-to-b from-hairline-2 to-hairline shadow-[0_10px_18px_-10px_rgba(20,16,40,.3)]" />
      </div>

      <div className="border-t border-hairline px-4 py-6 sm:px-10 sm:py-9">
        <div className="mb-4 flex flex-wrap items-baseline justify-between gap-3">
          <b className="text-[15px] font-semibold text-foreground">Not sure what to write?</b>
          <span className="text-[13px] text-muted">
            Pick one — we&apos;ll fill in the brief and you can change anything.
          </span>
        </div>
        <div className="grid gap-3.5 md:grid-cols-3">
          {IDEAS.map((idea) => (
            <button
              key={idea.tag}
              type="button"
              onClick={() => pickIdea(idea)}
              className="grid grid-cols-[60px_minmax(0,1fr)] items-center gap-3.5 rounded-[14px] border border-hairline-2 bg-surface-2 p-3.5 text-left transition-colors hover:border-accent hover:bg-accent-soft"
            >
              <BookCover
                book={{
                  id: `idea-${idea.tag}`,
                  status: "COMPLETED",
                  title: idea.title,
                  progress: 100,
                  targetPages: idea.pages,
                  actualPageCount: idea.pages,
                }}
              />
              <span className="min-w-0">
                <span className="block font-semibold leading-snug text-foreground">{idea.title}</span>
                <span className="mt-1 block text-xs text-muted">
                  {idea.tag} · ~{idea.pages} pages
                </span>
                <span className="mt-2 block text-xs font-semibold text-accent">Use this idea →</span>
              </span>
            </button>
          ))}
        </div>
      </div>

      {balance !== null && (
        <p className="border-t border-dashed border-hairline-2 bg-surface-2 px-5 py-4 text-center text-[13px] text-muted">
          You have <b className="font-semibold text-foreground">{balance.toLocaleString("en")} credits</b>
          {balance >= 30 ? ` — about ${Math.floor(balance / 30)} books of ~30 pages` : ""}. You only pay
          for pages actually written.
        </p>
      )}
    </section>
  );
}
