"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { formatPrice } from "@/lib/pricing";
import { formatSize } from "@/lib/files";
import type { ProductFile, SampleChapter } from "@/lib/types";
import { isColor, lst, itm, safeCss, txt, type DesignDoc, type StyleId } from "@/lib/store-design/core";
import { STYLES } from "@/lib/store-design/schemas";
import { STYLE_FONTS } from "@/lib/store-design/fonts";
import { PAGE_THEMES, pageThemeVars } from "@/lib/store-design/page-theme";
import {
  makeProductCtx,
  resolvePage,
  sampleChapters,
  type ProductCtx,
  type ProductPageData,
  type ProductPageDoc,
} from "@/lib/store-design/product-page";
import { BrandMark } from "@/components/brand-mark";
import { Cover, Photo, Rich, SLink, initials } from "./kit";
import s from "./product-page.module.css";

/** The store's look for this page: style, accent and the author's CSS. */
function useLook(design: DesignDoc, styleId?: StyleId) {
  const id = styleId ?? design.active;
  const settings = design.themes[id];
  const accent = isColor(settings?.accent) ? settings!.accent! : STYLES[id].accents[0];
  return { id, accent, css: safeCss(settings?.customCss) ?? "" };
}

function Frame({ design, styleId, data, children }: {
  design: DesignDoc; styleId?: StyleId; data: ProductPageData; children: React.ReactNode;
}) {
  const look = useLook(design, styleId);
  const { store } = data;
  return (
    <div className={`${STYLE_FONTS[look.id]} ${s.root} store-page store-${look.id} store-product-page`}
      style={pageThemeVars(PAGE_THEMES[look.id], look.accent)}>
      {look.css && <style>{look.css}</style>}
      <header className={s.header}>
        <div className={`${s.wrap} ${s.headerIn}`}>
          <SLink to={`/store/${store.slug}`} className={s.brand}>
            {store.logoUrl ? <Photo url={store.logoUrl} alt="" className={s.mark} /> : <span className={s.mark}>{initials(store.name)}</span>}
            <span className={s.brandName}>{store.name}</span>
          </SLink>
          <SLink to={`/store/${store.slug}`} className={s.back}>All products →</SLink>
        </div>
      </header>
      {children}
      <footer className={s.footer}>
        <div className={`${s.wrap} ${s.footerIn}`}>
          <span>© {new Date().getFullYear()} {store.name}</span>
          <Link href="/" className={s.made}><BrandMark className="h-5 w-5" />Made with Scrivetta</Link>
        </div>
      </footer>
    </div>
  );
}

// ---- The sales page ----------------------------------------------------------------

export function ProductPageView({ design, styleId, data, doc, sampleRefs, loadSample, onBuy, buying, buyError, buyerEmail, openFirstSample }: {
  design: DesignDoc;
  styleId?: StyleId;
  data: ProductPageData;
  doc: ProductPageDoc;
  /** The free-preview chapters as published (the editor passes its draft). */
  sampleRefs: { number: number; title: string }[];
  loadSample: (n: number) => Promise<SampleChapter>;
  onBuy?: () => void;
  buying?: boolean;
  buyError?: string | null;
  /** Signed-in buyer's email (the purchase lands in their My Purchases). */
  buyerEmail?: string | null;
  /** The editor's preview shows the first free chapter opened. */
  openFirstSample?: boolean;
}) {
  const ctx = useMemo(() => makeProductCtx(data), [data]);
  const S = useMemo(() => resolvePage(doc, "product", ctx), [doc, ctx]);
  const { store, product } = data;
  const hero = S.hero;
  const trust = lst(hero, "trust");
  const contents = lst(S.preview, "contents");
  const showPreview = S.preview.enabled && (contents.length > 0 || sampleRefs.length > 0 || !!txt(S.preview, "intro"));
  const faq = itm(S.faq, "items").filter((x) => x.q?.trim());

  return (
    <Frame design={design} styleId={styleId} data={data}>
      <main>
        <div className={s.wrap}>
          {!store.purchasable && store.unavailableReason && <div role="status" className={s.notice}>{store.unavailableReason}</div>}
          <section data-section="hero" className={s.hero}>
            <div className={s.coverStage}>
              <div className={s.coverBox}>
                <Cover product={{ coverUrl: product.coverUrl, title: txt(hero, "title") || product.title }} className={s.cover} fallbackClassName={s.coverFallback} />
              </div>
            </div>
            <div className={s.info}>
              {txt(hero, "eyebrow") && <span className={s.eyebrow}>{txt(hero, "eyebrow")}</span>}
              <h1 className={`${s.display} ${s.title}`}><Rich text={txt(hero, "title")} /></h1>
              {txt(hero, "subtitle") && <p className={s.subtitle}>{txt(hero, "subtitle")}</p>}
              <p className={s.by}>by <SLink to={`/store/${store.slug}`}>{ctx.who}</SLink></p>
              <div className={`${s.card} ${s.buyBox}`}>
                <div className={s.price}>
                  <span className={s.priceNum}>{ctx.price}</span>
                  <span className={s.muted}>one-time · USD</span>
                </div>
                <button type="button" className={s.btn} onClick={onBuy} disabled={!store.purchasable || buying}>
                  {buying ? "Opening checkout…" : txt(hero, "buyLabel") || `Buy now — ${ctx.price}`}
                </button>
                {buyError && <div role="alert" className={s.alert}>{buyError}</div>}
                {buyerEmail && <p className={s.small}>Signed in as {buyerEmail} — it goes straight to your My Purchases.</p>}
                {trust.length > 0 && <ul className={s.trust}>{trust.map((x, i) => <li key={i}>{x}</li>)}</ul>}
              </div>
            </div>
          </section>
        </div>

        {S.highlights.enabled && lst(S.highlights, "items").length > 0 && (
          <section data-section="highlights" className={`${s.wrap} ${s.section}`} style={{ paddingTop: 8 }}>
            <h2 className={`${s.display} ${s.h2}`}>{txt(S.highlights, "title")}</h2>
            <ul className={s.points}>{lst(S.highlights, "items").map((h, i) => <li key={i}>{h}</li>)}</ul>
          </section>
        )}

        {showPreview && (
          <section data-section="preview" className={s.band}>
            <div className={`${s.wrap} ${s.section} ${s.split}`}>
              <div className={s.splitSide}>
                <h2 className={`${s.display} ${s.h2}`}>{txt(S.preview, "title")}</h2>
                {txt(S.preview, "intro") && <p className={s.muted} style={{ margin: 0, fontSize: 15, lineHeight: 1.6 }}>{txt(S.preview, "intro")}</p>}
              </div>
              <div className={s.splitMain}>
                {contents.length > 0 && (
                  <ol className={s.toc}>
                    {contents.map((title, i) => {
                      const ch = product.chapters[i];
                      const free = !!ch && ch.title === title && sampleRefs.some((r) => r.number === ch.number);
                      return (
                        <li key={i}>
                          <span className={s.tocNum}>{String(i + 1).padStart(2, "0")}</span>
                          <span className={s.tocTitle}>{title}</span>
                          {free && <span className={s.free}>Free preview</span>}
                        </li>
                      );
                    })}
                  </ol>
                )}
                {sampleRefs.length > 0 && (
                  <div className={s.samples}>
                    <span className={s.eyebrow}>{txt(S.preview, "sampleTitle")}</span>
                    {sampleRefs.map((r, i) => <SampleCard key={r.number} chapter={r} load={loadSample} initiallyOpen={!!openFirstSample && i === 0} />)}
                  </div>
                )}
              </div>
            </div>
          </section>
        )}

        {S.about.enabled && txt(S.about, "text") && (
          <section data-section="about" className={`${s.wrap} ${s.section}`}>
            <h2 className={`${s.display} ${s.h2}`}>{txt(S.about, "title")}</h2>
            <p className={s.about}>{txt(S.about, "text")}</p>
          </section>
        )}

        {S.author.enabled && (
          <section data-section="author" className={`${s.wrap} ${s.section}`} style={{ paddingTop: S.about.enabled ? 0 : undefined }}>
            <div className={s.authorRow}>
              <Photo url={store.photoUrl} alt={`Photo of ${ctx.who}`} className={s.photo} />
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <span className={s.eyebrow}>{txt(S.author, "title")}</span>
                <span className={s.display} style={{ fontSize: 24 }}>{ctx.who}</span>
                {txt(S.author, "text") && <p className={s.muted} style={{ margin: 0, fontSize: 15, lineHeight: 1.65, whiteSpace: "pre-line" }}>{txt(S.author, "text")}</p>}
              </div>
            </div>
          </section>
        )}

        {S.more.enabled && data.more.length > 0 && (
          <section data-section="more" className={`${s.wrap} ${s.section}`} style={{ paddingTop: 0 }}>
            <MoreFrom title={txt(S.more, "title")} data={data} />
          </section>
        )}

        {S.faq.enabled && faq.length > 0 && (
          <section data-section="faq" className={`${s.wrap} ${s.section}`} style={{ paddingTop: 0 }}>
            <h2 className={`${s.display} ${s.h2}`}>Questions</h2>
            <div className={s.faq}>
              {faq.map((x, i) => (
                <details key={i} className={s.card}>
                  <summary>{x.q}</summary>
                  {x.a && <p>{x.a}</p>}
                </details>
              ))}
            </div>
          </section>
        )}
      </main>
    </Frame>
  );
}

function SampleCard({ chapter, load, initiallyOpen = false }: {
  chapter: { number: number; title: string }; load: (n: number) => Promise<SampleChapter>; initiallyOpen?: boolean;
}) {
  const [open, setOpen] = useState(initiallyOpen);
  const [text, setText] = useState<SampleChapter | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!initiallyOpen) return;
    let live = true;
    load(chapter.number)
      .then((t) => {
        if (!live) return;
        setText(t);
        setError(null);
      })
      .catch(() => live && setError("Loading the chapter…"));
    return () => {
      live = false;
    };
  }, [initiallyOpen, chapter.number, load]);

  function toggle() {
    const next = !open;
    setOpen(next);
    if (next && !text) {
      setError(null);
      load(chapter.number).then(setText).catch(() => setError("Could not load this chapter. Please try again."));
    }
  }

  return (
    <div className={`${s.card} ${s.sample}`}>
      <div className={s.sampleHead}>
        <span className={s.sampleTitle}>{String(chapter.number).padStart(2, "0")} · {chapter.title}</span>
        <button type="button" className={s.ghost} onClick={toggle} aria-expanded={open}>{open ? "Close" : "Read free"}</button>
      </div>
      {open && (
        <div className={s.reader}>
          {error ? <p className={s.small}>{error}</p> : !text ? <p className={s.small}>Loading…</p> : (
            // Sanitised by the backend (jsoup): text markup only, no scripts or images.
            <div className={s.prose} dangerouslySetInnerHTML={{ __html: text.html }} />
          )}
          {text && <p className={s.fade}>That&apos;s the end of the free preview — the full book is one click away.</p>}
        </div>
      )}
    </div>
  );
}

function MoreFrom({ title, data }: { title: string; data: ProductPageData }) {
  return (
    <>
      <h2 className={`${s.display} ${s.h2}`} style={{ fontSize: 26 }}>{title}</h2>
      <div className={s.moreGrid}>
        {data.more.slice(0, 4).map((m) => (
          <SLink key={m.id} to={`/store/${data.store.slug}/${m.id}`} className={`${s.card} ${s.moreCard}`}>
            <span className={s.moreCover}><Cover product={m} className={s.cover} fallbackClassName={s.coverFallback} /></span>
            <span style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <span style={{ fontWeight: 600, fontSize: 15 }}>{m.title}</span>
              <span className={s.muted} style={{ fontSize: 14 }}>{formatPrice(m.priceCents)}</span>
            </span>
          </SLink>
        ))}
      </div>
    </>
  );
}

// ---- After purchase ---------------------------------------------------------------

/**
 * What buyers see after paying, in the store's style: the author's thank-you,
 * the files (or, on the success page, the payment status) and what's next.
 */
export function PurchasePageView({ design, styleId, data, doc, files, fileHref, onFileClick, status, footnote }: {
  design: DesignDoc;
  styleId?: StyleId;
  data: ProductPageData;
  doc: ProductPageDoc;
  /** The files to download; null when they aren't shown here (the success page, before the email). */
  files: ProductFile[] | null;
  fileHref?: (f: ProductFile) => string;
  onFileClick?: () => void;
  /** Shown instead of the files (payment status) or under them. */
  status?: React.ReactNode;
  /** Small print under the files, e.g. downloads left. */
  footnote?: React.ReactNode;
}) {
  const ctx = useMemo(() => makeProductCtx(data), [data]);
  const S = useMemo(() => resolvePage(doc, "purchase", ctx), [doc, ctx]);
  const { product } = data;

  return (
    <Frame design={design} styleId={styleId} data={data}>
      <main className={s.wrap}>
        <section data-section="thanks" className={`${s.card} ${s.thanks}`}>
          <div className={s.thanksCover}>
            <Cover product={{ coverUrl: product.coverUrl, title: product.title }} className={s.cover} fallbackClassName={s.coverFallback} />
          </div>
          <div className={s.thanksInfo}>
            {txt(S.thanks, "eyebrow") && <span className={s.eyebrow}>{txt(S.thanks, "eyebrow")}</span>}
            <h1 className={`${s.display} ${s.title}`} style={{ fontSize: 36 }}><Rich text={txt(S.thanks, "title")} /></h1>
            {txt(S.thanks, "message") && <p className={s.message}>{txt(S.thanks, "message")}</p>}

            <div data-section="files" style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 6 }}>
              {status}
              {files && (
                <>
                  {txt(S.files, "title") && <span className={s.eyebrow}>{txt(S.files, "title")}</span>}
                  {files.length === 0 ? (
                    <div className={s.alert}>The files aren&apos;t available right now. Please contact {ctx.who}.</div>
                  ) : (
                    <ul className={s.files}>
                      {files.map((f, i) => (
                        <li key={f.id}>
                          <a href={fileHref ? fileHref(f) : "#"} onClick={onFileClick} rel="noreferrer"
                            className={i === 0 ? s.btn : s.ghost} style={i === 0 ? { minHeight: 48 } : { minHeight: 48 }}>
                            Download {f.format}
                          </a>
                          <span className={s.fileName}><b>{f.filename}</b>{formatSize(f.sizeBytes) ? ` · ${formatSize(f.sizeBytes)}` : ""}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                  {footnote}
                  {txt(S.files, "tip") && <p className={s.small}>Tip: {txt(S.files, "tip")}</p>}
                </>
              )}
            </div>

            {S.account.enabled && txt(S.account, "text") && (
              <p data-section="account" className={s.small} style={{ fontSize: 14, lineHeight: 1.6 }}>
                {txt(S.account, "text")}{" "}
                <SLink to="/register" className={s.back} style={{ color: "var(--pp-accent-text)", fontWeight: 600 }}>Create an account →</SLink>
              </p>
            )}
          </div>
        </section>

        {S.more.enabled && data.more.length > 0 && (
          <section data-section="more" style={{ marginTop: 56 }}>
            <MoreFrom title={txt(S.more, "title")} data={data} />
          </section>
        )}

        <p data-section="help" className={s.help}>
          {txt(S.help, "text")}
        </p>
      </main>
    </Frame>
  );
}

/** The free-preview chapters a draft picks, with titles from the product's chapters. */
export function sampleRefsOf(doc: ProductPageDoc, chapters: { number: number; title: string }[]) {
  const picked = sampleChapters(doc);
  return chapters.filter((c) => picked.includes(c.number));
}

export type { ProductCtx };
