"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { formatPrice } from "@/lib/pricing";
import { formatSize } from "@/lib/files";
import type { ProductFileFormat, SampleChapter } from "@/lib/types";
import { itm, lst, txt } from "@/lib/store-design/core";
import { STYLE_FONTS } from "@/lib/store-design/fonts";
import { PAGE_THEMES, pageLook, pageThemeVars } from "@/lib/store-design/page-theme";
import { fileName, fileNote, makeProductCtx, resolvePage, withPrice, type ProductPageData } from "@/lib/store-design/product-page";
import type { ProductPageProps, PurchasePageProps } from "../product-page-view";
import { Rich, SLink, socialLinks } from "../kit";
import { Book, Brand, DownloadIcon, Footer, LockIcon, Socials } from "./literary";
import s from "./literary.module.css";

/** The Scrivetta product and after-purchase pages: the store's paper, type and books, page by page. */
function Frame({ design, styleId, data, back, children }: Pick<ProductPageProps, "design" | "styleId" | "data"> & {
  back: string;
  children: React.ReactNode;
}) {
  const look = pageLook(design, styleId);
  const { store } = data;
  return (
    <div className={`${STYLE_FONTS.literary} ${s.root} store-page store-literary store-product-page`}
      style={{ ...pageThemeVars(PAGE_THEMES.literary, look.accent), "--accent": look.accent } as React.CSSProperties}>
      {look.css && <style>{look.css}</style>}
      <header className={s.header}>
        <div className={`${s.wrap} ${s.headerIn}`}>
          <SLink to={`/store/${store.slug}`} className={s.brand}><Brand store={store} /></SLink>
          <SLink to={`/store/${store.slug}`} className={`${s.back} ${s.navLink}`}>{back}</SLink>
        </div>
      </header>
      {children}
      <Footer store={store} />
    </div>
  );
}

// ---- The sales page ----------------------------------------------------------------

export function LiteraryProductPage({ design, styleId, data, doc, sampleRefs, loadSample, onBuy, buying, buyError, buyerEmail, openFirstSample }: ProductPageProps) {
  const ctx = useMemo(() => makeProductCtx(data), [data]);
  const S = useMemo(() => resolvePage(doc, "product", ctx), [doc, ctx]);
  const { store, product } = data;
  const hero = S.hero;
  const title = txt(hero, "title") || product.title;
  const contents = lst(S.preview, "contents");
  const faq = itm(S.faq, "items").filter((x) => x.q?.trim());
  const included = product.included;
  const highlights = S.highlights.enabled ? lst(S.highlights, "items") : [];
  const aboutText = S.about.enabled ? txt(S.about, "text") : "";
  const buyLabel = buying ? "Opening checkout…" : withPrice(txt(hero, "buyLabel"), ctx) || `Buy now — ${ctx.price}`;
  const canBuy = store.purchasable && !!onBuy;

  // Contents rows that are free chapters open their sample in place; free chapters the list doesn't name are listed under it.
  const freeAt = (i: number) => {
    const ch = product.chapters[i];
    return ch && ch.title === contents[i] && sampleRefs.some((r) => r.number === ch.number) ? ch : null;
  };
  const inList = new Set(contents.map((_, i) => freeAt(i)?.number).filter((n): n is number => n != null));
  const extraSamples = sampleRefs.filter((r) => !inList.has(r.number));
  const showPreview = S.preview.enabled && (contents.length > 0 || sampleRefs.length > 0 || !!txt(S.preview, "intro"));
  const [open, setOpen] = useState<number | null>(openFirstSample && sampleRefs[0] ? sampleRefs[0].number : null);

  // The buy bar appears once the buy box has scrolled away, so the price and Buy stay in reach.
  const buyBox = useRef<HTMLDivElement>(null);
  const [barShown, setBarShown] = useState(false);
  useEffect(() => {
    const el = buyBox.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(([e]) => setBarShown(!e.isIntersecting && e.boundingClientRect.top < 0));
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const reader = (n: number) => open === n && (
    <Reader number={n} load={loadSample}
      buy={canBuy ? { label: `Get the full ${product.chapters.length ? "book" : "product"} — ${ctx.price}`, onBuy: onBuy!, buying } : null} />
  );

  return (
    <Frame design={design} styleId={styleId} data={data} back="← All books">
      <main>
        {!store.purchasable && store.unavailableReason && <div className={s.wrap}><div role="status" className={s.notice}>{store.unavailableReason}</div></div>}
        <section data-section="hero" className={`${s.wrap} ${s.pHero}`}>
          <div className={`${s.stage} ${s.pStage}`}>
            <div className={s.pBook}><Book product={{ coverUrl: product.coverUrl, title }} edge /></div>
          </div>
          <div className={s.pInfo}>
            {txt(hero, "eyebrow") && <div className={s.eyebrow}>{txt(hero, "eyebrow")}</div>}
            <h1 className={s.pTitle}><Rich text={title} em={s.em} /></h1>
            {txt(hero, "subtitle") && <p className={s.pSub}>{txt(hero, "subtitle")}</p>}
            <p className={s.by}>by <SLink to={`/store/${store.slug}`}>{ctx.who}</SLink></p>

            <div ref={buyBox} className={s.buy}>
              <div className={s.price}>
                <span className={s.priceNum}>{ctx.price}</span>
                <span className={s.small}>one-time payment · USD</span>
              </div>
              <button type="button" className={`${s.btn} ${s.wide}`} onClick={onBuy} disabled={!store.purchasable || buying}>{buyLabel}</button>
              {showPreview && sampleRefs.length > 0 && (
                <a href="#preview" className={`${s.ghost} ${s.wide}`} onClick={() => setOpen((o) => o ?? sampleRefs[0].number)}>Read a free sample</a>
              )}
              {buyError && <div role="alert" className={s.alert}>{buyError}</div>}
              {buyerEmail && <p className={s.small}>Signed in as {buyerEmail} — it goes straight to your My Purchases.</p>}
              {lst(hero, "trust").length > 0 && (
                <ul className={s.checks}>{lst(hero, "trust").map((x, i) => <li key={i}><CheckIcon />{x}</li>)}</ul>
              )}
            </div>

            {S.included.enabled && included.length > 0 && (
              <div data-section="included" style={{ marginTop: 14 }}>
                <div className={s.label}>{withPrice(txt(S.included, "title"), ctx)}</div>
                <ul className={s.gets}>
                  {included.map((f) => (
                    <li key={f.id}>
                      <span className={s.fileIcon}><FormatIcon format={f.format} /></span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div className={s.fileName}>{fileName(f)}</div>
                        <div className={s.fileNote}>{[fileNote(f, product.pageCount), f.accountOnly ? "with a free Scrivetta account" : null].filter(Boolean).join(" · ")}</div>
                      </div>
                    </li>
                  ))}
                </ul>
                {txt(S.included, "note") && <p className={s.small} style={{ marginTop: 12 }}>{txt(S.included, "note")}</p>}
              </div>
            )}
          </div>
        </section>

        {(aboutText || highlights.length > 0) && (
          <section data-section={aboutText ? "about" : "highlights"} className={s.ruled}>
            <div className={`${s.wrap} ${s.section} ${s.split}`}>
              <h2 className={`${s.h2s} ${s.splitSide}`}>{aboutText ? txt(S.about, "title") : txt(S.highlights, "title")}</h2>
              <div className={s.splitMain} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                {aboutText && <p className={s.prose}>{aboutText}</p>}
                {highlights.length > 0 && <ul data-section="highlights" className={s.points}>{highlights.map((h, i) => <li key={i}>{h}</li>)}</ul>}
              </div>
            </div>
          </section>
        )}

        {showPreview && (
          <section id="preview" data-section="preview" className={s.band}>
            <div className={`${s.wrap} ${s.section} ${s.split}`}>
              <div className={s.splitSide}>
                <h2 className={s.h2s}>{txt(S.preview, "title")}</h2>
                {txt(S.preview, "intro") && <p className={s.sideNote} style={{ marginTop: 14 }}>{txt(S.preview, "intro")}</p>}
              </div>
              <div className={s.splitMain} style={{ display: "flex", flexDirection: "column", gap: 28 }}>
                {contents.length > 0 && (
                  <ol className={s.toc}>
                    {contents.map((t, i) => {
                      const free = freeAt(i);
                      const row = (
                        <>
                          <span className={s.tocN}>{String(i + 1).padStart(2, "0")}</span>
                          <span className={s.tocT}>{t}</span>
                          {free && <span className={s.tocCta}>{open === free.number ? "Close" : "Read free →"}</span>}
                        </>
                      );
                      return (
                        <li key={i} className={free ? s.tocFree : undefined}>
                          {free ? (
                            <button type="button" className={s.tocRow} aria-expanded={open === free.number}
                              onClick={() => setOpen(open === free.number ? null : free.number)}>{row}</button>
                          ) : <div className={s.tocRow}>{row}</div>}
                          {free && reader(free.number)}
                        </li>
                      );
                    })}
                  </ol>
                )}
                {extraSamples.length > 0 && (
                  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    {txt(S.preview, "sampleTitle") && <div className={s.eyebrow}>{txt(S.preview, "sampleTitle")}</div>}
                    <ol className={s.toc}>
                      {extraSamples.map((r) => (
                        <li key={r.number} className={s.tocFree}>
                          <button type="button" className={s.tocRow} aria-expanded={open === r.number} onClick={() => setOpen(open === r.number ? null : r.number)}>
                            <span className={s.tocN}>{String(r.number).padStart(2, "0")}</span>
                            <span className={s.tocT}>{r.title}</span>
                            <span className={s.tocCta}>{open === r.number ? "Close" : "Read free →"}</span>
                          </button>
                          {reader(r.number)}
                        </li>
                      ))}
                    </ol>
                  </div>
                )}
              </div>
            </div>
          </section>
        )}

        {S.author.enabled && (
          <section data-section="author" className={showPreview ? undefined : s.ruled}>
            <div className={`${s.wrap} ${s.section} ${s.split}`}>
              <div className={s.splitSide}>
                <div className={s.eyebrow}>{txt(S.author, "title")}</div>
                <h2 className={s.h2s} style={{ marginTop: 14 }}>{ctx.who}</h2>
              </div>
              {(txt(S.author, "text") || socialLinks(data).length > 0) && (
                <div className={s.splitMain} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                  {txt(S.author, "text") && <p className={s.prose}>{txt(S.author, "text")}</p>}
                  {socialLinks(data).length > 0 && <Socials links={socialLinks(data)} />}
                </div>
              )}
            </div>
          </section>
        )}

        {S.more.enabled && data.more.length > 0 && (
          <section data-section="more" className={`${s.wrap} ${s.section}`} style={{ paddingTop: S.author.enabled ? 0 : undefined }}>
            <h2 className={s.h2s} style={{ marginBottom: 32, fontSize: "clamp(30px, 3vw, 40px)" }}>{txt(S.more, "title")}</h2>
            <More data={data} />
          </section>
        )}

        {S.faq.enabled && faq.length > 0 && (
          <section data-section="faq" className={s.ruled}>
            <div className={`${s.wrap} ${s.section} ${s.split}`}>
              <h2 className={`${s.h2s} ${s.splitSide}`}>Questions</h2>
              <dl className={`${s.splitMain} ${s.faq}`}>
                {faq.map((x, i) => <div key={i}><dt>{x.q}</dt>{x.a && <dd>{x.a}</dd>}</div>)}
              </dl>
            </div>
          </section>
        )}
      </main>
      {barShown && canBuy && (
        <div role="region" aria-label="Buy" className={s.buyBar}>
          <span style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column" }}>
            <span style={{ fontSize: 19, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{title}</span>
            <span className={s.small} style={{ fontSize: 13 }}>{included.length > 1 ? `${fileName(included[0])} + ${included.length - 1} more` : "One-time · USD"}</span>
          </span>
          <button type="button" className={`${s.btn} ${s.headBtn}`} onClick={onBuy} disabled={buying}>{buying ? "Opening…" : `Buy · ${ctx.price}`}</button>
        </div>
      )}
    </Frame>
  );
}

/** A free chapter, opened in place under its contents row. */
function Reader({ number, load, buy }: {
  number: number;
  load: (n: number) => Promise<SampleChapter>;
  buy: { label: string; onBuy: () => void; buying?: boolean } | null;
}) {
  const [text, setText] = useState<SampleChapter | null>(null);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    let live = true;
    load(number)
      .then((t) => {
        if (live) setText(t);
      })
      .catch(() => {
        if (live) setError("Could not load this chapter. Please try again.");
      });
    return () => {
      live = false;
    };
  }, [number, load]);

  return (
    <div className={s.reader}>
      {error ? <p className={s.small} style={{ paddingTop: 16 }}>{error}</p> : !text ? <p className={s.small} style={{ paddingTop: 16 }}>Loading…</p> : (
        // Sanitised by the backend (jsoup): text markup only, no scripts or images.
        <div className={s.readerText} dangerouslySetInnerHTML={{ __html: text.html }} />
      )}
      {text && (
        <div className={s.readerEnd}>
          <p className={s.small}>That&apos;s the end of the free preview.</p>
          {buy && <button type="button" className={`${s.btn} ${s.fileBtn}`} onClick={buy.onBuy} disabled={buy.buying}>{buy.label}</button>}
        </div>
      )}
    </div>
  );
}

function More({ data, small }: { data: ProductPageData; small?: boolean }) {
  return (
    <div className={`${s.more} ${small ? s.moreSm : ""}`}>
      {data.more.slice(0, 4).map((m) => (
        <SLink key={m.id} to={`/store/${data.store.slug}/${m.id}`} className={s.moreCard}>
          <div className={s.moreCover}><Book product={m} small /></div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className={s.moreTitle}>{m.title}</div>
            {!small && (m.subtitle || m.pageCount > 0) && (
              <div className={s.fileNote} style={{ marginTop: 4 }}>{[m.subtitle, m.pageCount > 0 ? `${m.pageCount} pages` : null].filter(Boolean).join(" · ")}</div>
            )}
          </div>
          <span className={s.morePrice}>{formatPrice(m.priceCents)}</span>
        </SLink>
      ))}
    </div>
  );
}

// ---- After purchase ---------------------------------------------------------------

export function LiteraryPurchasePage({ design, styleId, data, doc, files, perks = [], fileHref, onFileClick, status, footnote }: PurchasePageProps) {
  const ctx = useMemo(() => makeProductCtx(data), [data]);
  const S = useMemo(() => resolvePage(doc, "purchase", ctx), [doc, ctx]);
  const { product } = data;
  const count = (files?.length ?? 0) + perks.length;

  return (
    <Frame design={design} styleId={styleId} data={data} back="All books">
      <main className={s.purchase}>
        <section data-section="thanks" style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          {txt(S.thanks, "eyebrow") && (
            <div className={`${s.eyebrow} ${s.status}`} style={files ? { color: "#2F5A3F" } : undefined}>
              {files && <span className={s.okDot}><CheckIcon size={14} /></span>}
              {txt(S.thanks, "eyebrow")}
            </div>
          )}
          <h1 className={s.thanksTitle}><Rich text={txt(S.thanks, "title")} em={s.em} /></h1>
          {txt(S.thanks, "message") && <p className={s.message}>{txt(S.thanks, "message")}</p>}
        </section>

        <section data-section="files" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {status}
          {files && (
            <>
              {files.length === 0 ? (
                <div className={s.alert}>The files aren&apos;t available right now. Please contact {ctx.who}.</div>
              ) : (
                <div className={s.box}>
                  <div className={s.boxHead}>
                    <div className={s.boxCover}><Book product={{ coverUrl: product.coverUrl, title: product.title }} small /></div>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: 24, lineHeight: 1.15 }}>{product.title}</div>
                      <div className={s.fileNote} style={{ marginTop: 4 }}>
                        {[`by ${ctx.who}`, txt(S.files, "title") ? `${count} ${count === 1 ? "file" : "files"}` : null].filter(Boolean).join(" · ")}
                      </div>
                    </div>
                  </div>
                  {files.map((f, i) => {
                    const used = f.downloadsLeft === 0;
                    return (
                      <div key={f.id} className={s.fileRow}>
                        <span className={s.fileIcon}><FormatIcon format={f.format} /></span>
                        <div className={s.fileText}>
                          <div className={s.fileName}>{fileName(f)}</div>
                          <div className={s.fileNote}>
                            {[fileNote(f, product.pageCount), formatSize(f.sizeBytes) || null,
                              f.downloadsLeft != null ? `${f.downloadsLeft} of ${product.downloadLimit} downloads left` : null].filter(Boolean).join(" · ")}
                          </div>
                        </div>
                        {used ? (
                          <span className={`${s.ghost} ${s.fileBtn}`} style={{ opacity: 0.55, cursor: "default" }}>No downloads left</span>
                        ) : (
                          <a href={fileHref ? fileHref(f) : "#"} onClick={onFileClick} rel="noreferrer" className={`${i === 0 ? s.btn : s.ghost} ${s.fileBtn}`}>
                            <DownloadIcon />Download {f.format}
                          </a>
                        )}
                      </div>
                    );
                  })}
                  {perks.map((f) => (
                    <div key={f.id} className={s.fileRow}>
                      <span className={s.fileIcon}><FormatIcon format={f.format} /></span>
                      <div className={s.fileText}>
                        <div className={s.fileName}>{fileName(f)}</div>
                        <div className={s.fileNote}>{[f.format, "unlocks with a free account", formatSize(f.sizeBytes) || null].filter(Boolean).join(" · ")}</div>
                      </div>
                      <SLink to="/register" className={`${s.unlock} ${s.navLink}`}><LockIcon />Unlock free</SLink>
                    </div>
                  ))}
                </div>
              )}
              {(footnote || txt(S.files, "tip")) && (
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {footnote}
                  {txt(S.files, "tip") && <p className={s.small}>{txt(S.files, "tip")}</p>}
                </div>
              )}
            </>
          )}
        </section>

        {S.account.enabled && txt(S.account, "text") && (
          <section data-section="account" className={s.keep}>
            <div className={s.keepText}>
              <div style={{ fontSize: 22 }}>Keep it for good</div>
              {/* The default text opens with the same words — say them once. */}
              <p className={s.fileNote} style={{ margin: "6px 0 0", fontSize: 15, lineHeight: 1.55 }}>{txt(S.account, "text").replace(/^Keep it for good:\s*/i, "").replace(/^./, (c) => c.toUpperCase())}</p>
            </div>
            <SLink to="/register" className={`${s.btn} ${s.fileBtn}`}>Create free account</SLink>
          </section>
        )}

        {S.more.enabled && data.more.length > 0 && (
          <section data-section="more" className={s.ruled} style={{ paddingTop: 20 }}>
            <h2 className={s.h2s} style={{ marginBottom: 18, fontSize: 30 }}>{txt(S.more, "title")}</h2>
            <More data={data} small />
          </section>
        )}

        {txt(S.help, "text") && <p data-section="help" className={s.small}>{txt(S.help, "text")}</p>}
      </main>
    </Frame>
  );
}

// ---- Icons ----------------------------------------------------------------------------

const icon = { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeLinecap: "round" as const, strokeLinejoin: "round" as const, "aria-hidden": true };

function CheckIcon({ size = 16 }: { size?: number }) {
  return <svg {...icon} width={size} height={size} strokeWidth={2.2}><path d="m5 12.5 4.5 4.5L19 7.5" /></svg>;
}

function FormatIcon({ format }: { format: ProductFileFormat }) {
  const p = { ...icon, width: 20, height: 20, strokeWidth: 1.6 };
  if (format === "EPUB") return <svg {...p}><rect x="6" y="2.5" width="12" height="19" rx="2" /><path d="M10 18h4" /></svg>;
  if (format === "ZIP") return <svg {...p}><rect x="4" y="3" width="16" height="18" rx="2" /><path d="M12 3v2M12 7v2M12 11v2" /><rect x="10.5" y="14" width="3" height="4" rx="1" /></svg>;
  return <svg {...p}><path d="M6 3h9l4 4v14H6z" /><path d="M14 3v5h5" /></svg>;
}

