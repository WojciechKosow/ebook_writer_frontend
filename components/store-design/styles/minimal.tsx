"use client";

import { useEffect, useState } from "react";
import type { PublicStoreProduct, StoreProfile } from "@/lib/types";
import { itm, txt, type Ctx, type Item } from "@/lib/store-design/core";
import { Cover, CustomCss, Photo, Rich, SLink, socialLinks, Unavailable, YEAR, initials, type StyleProps } from "../kit";
import s from "./minimal.module.css";

/** Stage colors the featured carousel steps through; the first is the accent. */
const STAGES = [
  { bg: "", ink: "#111111" },
  { bg: "#C9D2C0", ink: "#111111" },
  { bg: "#2B2350", ink: "#F4F2EE" },
  { bg: "#E4E0D9", ink: "#111111" },
  { bg: "#1F3D2E", ink: "#E9EDE4" },
];

const nn = (n: number) => String(n).padStart(2, "0");

/** Minimal — concept 3: off-white, big type, thin rules and a featured shelf that turns. */
export function MinimalStyle({ t, ctx, href }: StyleProps) {
  const S = t.sections;
  const { store, products, featured } = ctx;
  const hero = S.hero;
  const book = featured ? href(featured.id) : "#ebooks";
  const facts = itm(S.facts, "items").filter((x) => x.value?.trim() || x.label?.trim());
  const changes = itm(S.changes, "items").filter((x) => x.title?.trim());
  const faq = itm(S.faq, "items").filter((x) => x.q?.trim());
  const showAbout = S.about.enabled && !!txt(S.about, "quote");
  const showFaq = S.faq.enabled && faq.length > 0;

  // Numbered section labels follow the sections that are shown.
  const order = [
    S.spread.enabled && "spread",
    S.changes.enabled && changes.length > 0 && "changes",
    "books",
    showAbout && "about",
    showFaq && "faq",
  ].filter((x): x is string => !!x);
  const num = (id: string) => `(${nn(order.indexOf(id) + 1)})`;

  return (
    <div className={`${s.root} store-page store-minimal`} style={{ "--accent": t.accent } as React.CSSProperties}>
      <CustomCss t={t} />
      <header className={s.header}>
        <div className={`${s.wrap} ${s.headerIn}`}>
          <a href="#top" className={s.brand}><span className={s.dot} />{store.name}</a>
          <nav className={s.nav} aria-label="Store">
            <a className={s.u} href="#ebooks">{txt(S.books, "eyebrow") || "Ebooks"} <span className={s.tab}>({products.length})</span></a>
            {order.includes("spread") && <a className={s.u} href="#inside">Inside</a>}
            {showAbout && <a className={s.u} href="#about">About</a>}
            {showFaq && <a className={s.u} href="#help">{txt(S.faq, "eyebrow") || "Help"}</a>}
          </nav>
          {featured && <SLink to={book} className={`${s.pill} ${s.pillSm}`}>Start reading <span className={s.faint}>·</span> {ctx.price(featured)}</SLink>}
        </div>
      </header>
      <div className={s.wrap}><Unavailable ctx={ctx} className={s.notice} /></div>

      <section id="top" data-section="hero" className={`${s.wrap} ${s.hero}`}>
        {(txt(hero, "kicker") || txt(hero, "note")) && (
          <div className={`${s.kicker} ${s.fade}`}><span>{txt(hero, "kicker")}</span>{txt(hero, "note") && <span className={s.hideSm}>{txt(hero, "note")}</span>}</div>
        )}
        <h1 className={s.h1}><Lines text={txt(hero, "headline")} /></h1>
        <div className={s.heroFoot}>
          {txt(hero, "intro") && <p className={`${s.lead} ${s.fade}`} style={{ animationDelay: ".35s" }}>{txt(hero, "intro")}</p>}
          {(txt(hero, "primary") || txt(hero, "secondary")) && (
            <div className={`${s.ctas} ${s.fade}`} style={{ animationDelay: ".45s" }}>
              {txt(hero, "primary") && <SLink to={book} className={s.pill}>{txt(hero, "primary")} <span className={s.arrow}>→</span></SLink>}
              {txt(hero, "secondary") && <a href="#ebooks" className={`${s.u} ${s.strong}`}>{txt(hero, "secondary")}</a>}
            </div>
          )}
        </div>
      </section>

      {products.length > 0 && <Featured products={products} ctx={ctx} href={href} accent={t.accent} button={txt(hero, "button")} />}

      {S.facts.enabled && facts.length > 0 && (
        <section data-section="facts" aria-label="At a glance" className={s.wrap}>
          <div className={s.facts} style={{ "--n": facts.length } as React.CSSProperties}>
            {facts.map((f, i) => <div key={i}><div className={s.factV}>{f.value}</div><div className={s.factL}>{f.label}</div></div>)}
          </div>
        </section>
      )}

      {order.includes("spread") && (
        <section id="inside" data-section="spread" className={`${s.wrap} ${s.section} ${s.first}`}>
          <div className={s.grow} />
          <div className={s.split}>
            <div className={`${s.side} ${s.reveal}`}>
              <div className={s.label}>{num("spread")} {txt(S.spread, "eyebrow")}</div>
              <h2 className={s.h2}><Rich text={txt(S.spread, "title")} em={s.soft} /></h2>
              {txt(S.spread, "text") && <p className={s.sideText}>{txt(S.spread, "text")}</p>}
              {featured && txt(S.spread, "link") && <SLink to={book} className={`${s.u} ${s.strong} ${s.self}`}>{txt(S.spread, "link")} <span className={s.arrow}>→</span></SLink>}
            </div>
            <div className={`${s.spread} ${s.reveal}`}>
              <div className={`${s.leaf} ${s.leafL}`}>
                <div className={s.runHead}>{txt(S.spread, "leftLabel")}</div>
                {txt(S.spread, "leftTitle") && <h3 className={s.leafTitle}>{txt(S.spread, "leftTitle")}</h3>}
                <p className={s.leafText}><Rich text={txt(S.spread, "leftText")} em={s.bold} /></p>
                <div className={s.folio}>{txt(S.spread, "leftPage")}</div>
              </div>
              <div className={s.leaf}>
                <div className={s.runHead} style={{ textAlign: "right" }}>{txt(S.spread, "rightLabel")}</div>
                {itm(S.spread, "rows").length > 0 && (
                  <div className={s.table}>
                    {itm(S.spread, "rows").map((r, i) => <div key={i}><span className={s.tk}>{r.k}</span><span>{r.v}</span></div>)}
                  </div>
                )}
                {txt(S.spread, "tip") && <div className={s.tip}><span className={s.tipDot} /><span><Rich text={txt(S.spread, "tip")} em={s.bold} /></span></div>}
                <div className={s.folio} style={{ textAlign: "right" }}>{txt(S.spread, "rightPage")}</div>
              </div>
            </div>
          </div>
        </section>
      )}

      {order.includes("changes") && (
        <section data-section="changes" aria-label={txt(S.changes, "eyebrow")} className={`${s.wrap} ${s.section} ${order[0] === "changes" ? s.first : ""}`}>
          <div className={s.grow} />
          <div className={`${s.head} ${s.reveal}`}>
            <div className={s.label}>{num("changes")} {txt(S.changes, "eyebrow")}</div>
            {txt(S.changes, "title") && <h2 className={s.h2}><Rich text={txt(S.changes, "title")} em={s.soft} /></h2>}
          </div>
          <div className={`${s.outcomes} ${s.reveal}`} style={{ "--n": changes.length } as React.CSSProperties}>
            {changes.map((c, i) => (
              <div key={i}><span className={s.oN}>{nn(i + 1)}</span><span className={s.oT}>{c.title}</span>{c.text && <span className={s.oD}>{c.text}</span>}</div>
            ))}
          </div>
        </section>
      )}

      <section id="ebooks" data-section="books" className={`${s.wrap} ${s.section} ${order[0] === "books" ? s.first : ""}`}>
        <div className={s.grow} />
        <div className={`${s.head} ${s.headRow} ${s.reveal}`}>
          <div className={s.headCol}>
            <div className={s.label}>{num("books")} {txt(S.books, "eyebrow")}</div>
            <h2 className={s.h2}><Rich text={txt(S.books, "title")} em={s.soft} /></h2>
          </div>
          {txt(S.books, "note") && <span className={s.label}>{txt(S.books, "note")}</span>}
        </div>
        {products.length === 0 ? <p className={s.sideText}>No ebooks for sale yet.</p> : (
          <div className={`${s.list} ${s.reveal}`}>
            {products.map((p, i) => (
              <SLink key={p.id} to={href(p.id)} className={s.row}>
                <span className={s.rowN}>{nn(i + 1)}</span>
                <span className={s.thumb}><Cover product={p} className={s.thumbImg} fallbackClassName={s.thumbFallback} /></span>
                <div className={s.rowBody}>
                  <div className={s.rowHead}>
                    <span className={s.rowTitle}>{p.title}</span>
                    {i === 0 && products.length > 1 && txt(S.books, "tag") && <span className={s.tag}>{txt(S.books, "tag")}</span>}
                  </div>
                  <div className={s.rowDesc}>{[p.description || p.subtitle, p.pageCount > 0 ? `${p.pageCount} pp.` : null].filter(Boolean).join(" · ")}</div>
                </div>
                <span className={s.rowPrice}>{ctx.price(p)}</span>
                <span aria-hidden className={`${s.roundArrow} ${s.arrow}`}>→</span>
              </SLink>
            ))}
          </div>
        )}
      </section>

      {showAbout && (
        <section id="about" data-section="about" className={`${s.wrap} ${s.section}`}>
          <div className={s.grow} />
          <div className={`${s.split} ${s.reveal}`}>
            <div className={s.side}>
              <div className={s.label}>{num("about")} {txt(S.about, "eyebrow")}</div>
              <div className={s.portrait}>
                {store.photoUrl ? <Photo url={store.photoUrl} alt={`Photo of ${ctx.who}`} className={s.portraitImg} /> : <span className={s.portraitInit}>{initials(ctx.who)}</span>}
              </div>
            </div>
            <div className={s.aboutMain}>
              <p className={s.quote}><Rich text={txt(S.about, "quote")} em={s.soft} /></p>
              <div className={s.aboutFoot}>
                <div><div className={s.aboutName}>{txt(S.about, "name")}</div>{txt(S.about, "role") && <div className={s.aboutRole}>{txt(S.about, "role")}</div>}</div>
                {socialLinks(ctx).length > 0 && (
                  <div className={s.socials}>{socialLinks(ctx).map((l) => <SLink key={l.kind} to={l.href} className={s.u}>{l.label}</SLink>)}</div>
                )}
              </div>
            </div>
          </div>
        </section>
      )}

      {showFaq && (
        <section id="help" data-section="faq" className={`${s.wrap} ${s.section}`}>
          <div className={s.grow} />
          <div className={s.split}>
            <div className={`${s.side} ${s.reveal}`}>
              <div className={s.label}>{num("faq")} {txt(S.faq, "eyebrow")}</div>
              {txt(S.faq, "title") && <h2 className={s.h2}>{txt(S.faq, "title")}</h2>}
            </div>
            <Faq items={faq} />
          </div>
        </section>
      )}

      {S.closing.enabled && (
        <section data-section="closing" className={s.closing}>
          <div className={`${s.wrap} ${s.closingIn}`}>
            <h2 className={`${s.big} ${s.reveal}`}><Rich text={txt(S.closing, "title")} em={s.closingEm} /></h2>
            <div className={s.closingFoot}>
              {txt(S.closing, "fine") && <span>{txt(S.closing, "fine")}</span>}
              {txt(S.closing, "button") && <SLink to={book} className={s.pill}>{txt(S.closing, "button")} <span className={s.arrow}>→</span></SLink>}
            </div>
          </div>
        </section>
      )}

      <Footer store={store} />
    </div>
  );
}

// ---- Pieces --------------------------------------------------------------------

/** The headline, one sliding line per line of text; a final period takes the accent. */
function Lines({ text }: { text: string }) {
  const lines = text.split("\n").filter((l, i, a) => l.trim() || a.length === 1);
  return (
    <>
      {lines.map((line, i) => {
        const last = i === lines.length - 1 && /\.$/.test(line) && !/\*$/.test(line);
        return (
          <span key={i} className={s.lineBox}>
            <span className={s.line} style={{ animationDelay: `${i * 0.09}s` }}>
              <Rich text={last ? line.slice(0, -1) : line} em={s.soft} />{last && <span className={s.accentText}>.</span>}
            </span>
          </span>
        );
      })}
    </>
  );
}

/** The featured shelf: one ebook at a time on a colored stage; turns by itself until someone uses the arrows. */
function Featured({ products, ctx, href, accent, button }: { products: PublicStoreProduct[]; ctx: Ctx; href: (id: string) => string; accent: string; button: string }) {
  const shelf = products.slice(0, STAGES.length);
  const n = shelf.length;
  const [i, setI] = useState(0);
  const [manual, setManual] = useState(false);
  useEffect(() => {
    if (manual || n < 2 || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = setInterval(() => setI((x) => (x + 1) % n), 6000);
    return () => clearInterval(id);
  }, [manual, n]);
  const cur = shelf[i % n];
  const stage = STAGES[i % n];
  const go = (d: number) => { setI((x) => (x + d + n) % n); setManual(true); };

  return (
    <section data-section="featured" aria-label="Featured ebook" className={s.wrap}>
      <div className={`${s.stage} ${s.fade}`} style={{ animationDelay: ".3s", background: stage.bg || accent, color: stage.ink }}>
        <div className={s.stageTop}>
          <span>Fig. {nn(i + 1)} — {cur.title}</span>{cur.pageCount > 0 && <span className={s.hideSm}>{cur.pageCount} pp.</span>}
        </div>
        <div className={s.stageCenter}>
          <div className={s.stageBook}>
            {shelf.map((p, k) => {
              const d = (k - i + n) % n;
              const pos = d === 0 ? s.bookOn : d === 1 ? s.bookNext : s.bookPrev;
              return (
                <SLink key={p.id} to={href(p.id)} className={`${s.stageCover} ${pos}`} label={p.title}>
                  <Cover product={p} className={s.coverImg} fallbackClassName={s.coverFallback} />
                </SLink>
              );
            })}
          </div>
        </div>
        {n > 1 && (
          <div className={s.stageBottom}>
            <div className={s.counter}>
              <span>{nn(i + 1)} / {nn(n)}</span>
              <span className={s.dashes}>{shelf.map((_, k) => <span key={k} className={k === i ? s.dashOn : ""} />)}</span>
            </div>
            <div className={s.ctl}>
              <button type="button" onClick={() => go(-1)} aria-label="Previous ebook"><Chevron d="M15 6l-6 6 6 6" /></button>
              <button type="button" onClick={() => go(1)} aria-label="Next ebook"><Chevron d="M9 6l6 6-6 6" /></button>
            </div>
          </div>
        )}
      </div>
      <div className={s.featBar}>
        <div className={s.featText}>
          <div className={s.featTitle}>{cur.title}</div>
          {(cur.subtitle || cur.description) && <div className={s.featBlurb}>{cur.subtitle || cur.description}</div>}
        </div>
        <div className={s.featBuy}>
          <span className={s.featPrice}>{ctx.price(cur)}</span>
          {button && <SLink to={href(cur.id)} className={`${s.pill} ${s.pillMd}`}>{button} <span className={s.arrow}>→</span></SLink>}
        </div>
      </div>
    </section>
  );
}

function Faq({ items }: { items: Item[] }) {
  const [open, setOpen] = useState(0);
  return (
    <div className={`${s.faq} ${s.reveal}`}>
      {items.map((x, i) => (
        <div key={i} className={s.faqRow}>
          <button type="button" className={s.faqQ} aria-expanded={open === i} onClick={() => setOpen(open === i ? -1 : i)}>
            <span>{x.q}</span><span aria-hidden className={s.plus}>+</span>
          </button>
          {open === i && x.a && <p className={s.faqA}>{x.a}</p>}
        </div>
      ))}
    </div>
  );
}

function Footer({ store }: { store: StoreProfile }) {
  return (
    <footer className={`${s.wrap} ${s.footer}`}>
      <div className={s.footLinks}>
        <span>© {YEAR} {store.name}</span>
        <SLink to={`/store/${store.slug}/terms`} className={s.u}>Terms of sale</SLink>
        {store.contactEmail && <a href={`mailto:${store.contactEmail}`} className={s.u}>Contact</a>}
      </div>
      <SLink to="/" className={`${s.u} ${s.made}`}><span className={s.madeS}>S</span>Made with Scrivetta</SLink>
    </footer>
  );
}

function Chevron({ d }: { d: string }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d={d} />
    </svg>
  );
}
