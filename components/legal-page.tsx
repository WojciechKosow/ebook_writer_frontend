import { marked } from "marked";
import { MarketingShell } from "@/components/marketing-shell";
import { Prose } from "@/components/prose";
import { formatPostDate } from "@/lib/blog";
import { LEGAL_UPDATED } from "@/lib/legal";

/** Shared frame for the Privacy Policy and Terms: title, effective date, Markdown body. */
export async function LegalPage({
  title,
  intro,
  body,
  children,
}: {
  title: string;
  intro: string;
  body: string;
  children?: React.ReactNode;
}) {
  const html = await marked.parse(body);
  return (
    <MarketingShell ambient="none">
      <article className="mx-auto w-full max-w-[720px] px-4 pb-24 pt-12 sm:px-6 md:pt-16">
        <p className="m-0 font-mono text-[11px] uppercase tracking-[0.1em] text-ip-muted">
          Last updated <time dateTime={LEGAL_UPDATED}>{formatPostDate(LEGAL_UPDATED)}</time>
        </p>
        <h1 className="ip-display mb-0 mt-4 text-[clamp(40px,5.6vw,60px)] leading-[1.02]">{title}</h1>
        <p className="mb-0 mt-5 text-lg leading-relaxed text-ip-ink-2">{intro}</p>
        <hr className="my-10 border-ip-line" />
        <Prose html={html} />
        {children}
      </article>
    </MarketingShell>
  );
}
