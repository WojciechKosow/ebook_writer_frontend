import { marked } from "marked";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
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
    <>
      <SiteHeader />
      <main className="flex-1">
        <article className="mx-auto w-full max-w-2xl px-6 pb-20 pt-16 sm:pt-20">
          <p className="text-xs text-faint">
            Last updated <time dateTime={LEGAL_UPDATED}>{formatPostDate(LEGAL_UPDATED)}</time>
          </p>
          <h1 className="mt-3 text-balance text-4xl font-semibold leading-[1.1] tracking-tight text-foreground">
            {title}
          </h1>
          <p className="mt-4 text-lg leading-8 text-muted">{intro}</p>
          <hr className="my-8 border-hairline" />
          <Prose html={html} />
          {children}
        </article>
      </main>
      <SiteFooter />
    </>
  );
}
