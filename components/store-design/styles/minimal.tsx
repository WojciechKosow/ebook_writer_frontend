"use client";

import { itm, txt } from "@/lib/store-design/core";
import { Cover, CustomCss, Photo, Rich, SLink, socialLinks, Unavailable, YEAR, type StyleProps } from "../kit";
import s from "./minimal.module.css";

/** Minimal — concept 3: off-white, big type, thin rules. */
export function MinimalStyle({ t, ctx, href }: StyleProps) {
  const S = t.sections;
  const { store, products, featured } = ctx;
  const rest = products.slice(1);
  const hero = S.hero;
  const book = featured ? href(featured.id) : "#books";

  return (
    <div className={`${s.root} store-page store-minimal`} style={{ "--accent": t.accent } as React.CSSProperties}>
      <CustomCss t={t} />
      {t.decor === "grid" && (
        <div aria-hidden className={s.lines}><div className={`${s.wrap} ${s.g12}`}>{Array.from({ length: 12 }, (_, i) => <span key={i} />)}</div></div>
      )}

      <header className={s.header}>
        <div className={`${s.wrap} ${s.headerIn}`}>
          <a href="#top" className={s.brand}>{store.name}</a>
          <nav className={s.nav} aria-label="Store">
            <a href="#books">Ebooks <span className={s.mono} style={{ fontSize: 11 }}>({products.length})</span></a>
            {S.spread.enabled && <a href="#inside">Inside</a>}
            {S.faq.enabled && <a href="#faq">Help</a>}
          </nav>
        </div>
      </header>
      <Unavailable ctx={ctx} className={s.notice} />

      <section id="top" data-section="hero" className={s.wrap} style={{ paddingTop: 120 }}>
        <div className={s.hero}>
          <div>
            <div className={`${s.up} ${s.label}`}>{txt(hero, "kicker")}</div>
            <h1 className={`${s.h1} ${s.up} ${s.d1}`}><Rich text={txt(hero, "headline")} em={s.em} /></h1>
          </div>
          <div className={`${s.up} ${s.d2}`} style={{ paddingBottom: 10 }}>
            {txt(hero, "intro") && <p className={s.lead}>{txt(hero, "intro")}</p>}
            <div style={{ display: "flex", gap: 24, alignItems: "center", marginTop: 32, flexWrap: "wrap" }}>
              {txt(hero, "primary") && <SLink to={book} className={s.btn}>{txt(hero, "primary")}</SLink>}
              {txt(hero, "secondary") && <a href="#books" className={s.hov} style={{ textDecoration: "none", fontSize: 15, fontWeight: 500 }}>{txt(hero, "secondary")} <span className={s.arr}>→</span></a>}
            </div>
          </div>
        </div>
        <div className={s.rule} style={{ marginTop: 72 }} />
        {featured && (
          <SLink to={href(featured.id)} className={`${s.stage} ${s.hov}`}>
            <span className={s.cv}><Cover product={featured} className={s.cover} fallbackClassName={s.coverFallback} /></span>
            {txt(hero, "caption") && <span className={`${s.mono} ${s.caption}`} style={{ left: 24 }}>{txt(hero, "caption")}</span>}
            <span className={`${s.mono} ${s.caption}`} style={{ right: 24 }}>01 / {String(products.length).padStart(2, "0")}</span>
          </SLink>
        )}
      </section>

      {S.facts.enabled && itm(S.facts, "items").length > 0 && (
        <section data-section="facts" className={s.wrap}>
          <div className={s.facts}>
            {itm(S.facts, "items").map((f, i) => <div key={i}><div className={s.factV}>{f.value}</div><div className={s.label} style={{ marginTop: 6 }}>{f.label}</div></div>)}
          </div>
        </section>
      )}

      {S.spread.enabled && (
        <section id="inside" data-section="spread" className={s.wrap} style={{ paddingTop: 160 }}>
          <div className={s.two}>
            <div>
              <div className={s.label}>{txt(S.spread, "eyebrow")}</div>
              <h2 className={s.h2}><Rich text={txt(S.spread, "title")} em={s.em} /></h2>
              <p style={{ margin: "18px 0 0", fontSize: 16, lineHeight: 1.6, color: "var(--muted)", fontWeight: 300, maxWidth: 320 }}>{txt(S.spread, "text")}</p>
            </div>
            <div className={s.spread}>
              <div className={s.leaf}>
                <div className={s.mono} style={{ fontSize: 10.5, color: "var(--muted)" }}>{txt(S.spread, "leftLabel")}</div>
                <div style={{ marginTop: 44, fontSize: 28, fontWeight: 500, letterSpacing: "-.03em" }}>{txt(S.spread, "leftTitle")}</div>
                <p style={{ margin: "18px 0 0", fontSize: 15, lineHeight: 1.75, color: "var(--body)", fontWeight: 300, flex: 1, whiteSpace: "pre-line" }}>{txt(S.spread, "leftText")}</p>
                <div className={s.mono} style={{ fontSize: 11, color: "var(--muted)" }}>34</div>
              </div>
              <div className={s.leaf}>
                <div className={s.mono} style={{ fontSize: 10.5, color: "var(--muted)", textAlign: "right" }}>{txt(S.spread, "rightLabel")}</div>
                <div style={{ marginTop: 44, borderTop: "1px solid #111", flex: 1 }}>
                  {itm(S.spread, "rows").map((r, i) => <div key={i} className={s.row}><span className={s.mono} style={{ fontSize: 12 }}>{r.k}</span><span style={{ color: "var(--body)" }}>{r.v}</span></div>)}
                  {txt(S.spread, "tip") && <div className={s.tip}>{txt(S.spread, "tip")}</div>}
                </div>
                <div className={s.mono} style={{ fontSize: 11, color: "var(--muted)", textAlign: "right" }}>35</div>
              </div>
            </div>
          </div>
        </section>
      )}

      {S.changes.enabled && itm(S.changes, "items").length > 0 && (
        <section data-section="changes" className={s.wrap} style={{ paddingTop: 160 }}>
          <div className={s.label}>{txt(S.changes, "eyebrow")}</div>
          <div className={s.four}>
            {itm(S.changes, "items").map((c, i) => (
              <div key={i}>
                <div className={s.mono} style={{ fontSize: 12 }}>{String(i + 1).padStart(2, "0")}</div>
                <div style={{ marginTop: 44, fontSize: 22, fontWeight: 500, letterSpacing: "-.02em" }}>{c.title}</div>
                <p style={{ margin: "10px 0 0", fontSize: 15, lineHeight: 1.6, color: "var(--muted)", fontWeight: 300 }}>{c.text}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      <section id="books" data-section="books" className={s.wrap} style={{ paddingTop: 160 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}><div className={s.label}>{txt(S.books, "eyebrow")}</div><div className={s.label}>PDF · USD</div></div>
        {!featured ? <p style={{ marginTop: 32, color: "var(--muted)" }}>No ebooks for sale yet.</p> : (
          <SLink to={href(featured.id)} className={s.hov} style={{ textDecoration: "none", color: "inherit", display: "block", marginTop: 32, borderTop: "1px solid #111" }}>
            <div className={s.feat}>
              <div className={s.featStage}><span className={s.cv}><Cover product={featured} className={s.cover} fallbackClassName={s.coverFallback} /></span></div>
              <div>
                <div className={s.label}>01{featured.pageCount > 0 ? ` · ${featured.pageCount} pages` : ""}{rest.length > 0 ? " · Start here" : ""}</div>
                <h3 style={{ margin: "16px 0 0", fontSize: 52, lineHeight: 1, fontWeight: 400, letterSpacing: "-.045em" }}>{featured.title}</h3>
                {(featured.description || featured.subtitle) && <p style={{ margin: "20px 0 0", fontSize: 18, lineHeight: 1.6, color: "var(--body)", fontWeight: 300, maxWidth: 460 }}>{featured.description || featured.subtitle}</p>}
                {itm(S.books, "rows").length > 0 && (
                  <div style={{ marginTop: 28, borderTop: "1px solid var(--line)" }}>
                    {itm(S.books, "rows").map((r, i) => (
                      <div key={i} style={{ display: "flex", justifyContent: "space-between", gap: 16, padding: "12px 0", borderBottom: "1px solid var(--line)", fontSize: 14.5 }}><span>{r.text}</span><span className={s.mono} style={{ fontSize: 11, color: "var(--muted)" }}>{r.ref}</span></div>
                    ))}
                  </div>
                )}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 32, gap: 16, flexWrap: "wrap" }}>
                  <span style={{ fontSize: 40, fontWeight: 400, letterSpacing: "-.04em" }}>{ctx.price(featured)}</span>
                  <span className={s.btn} style={{ padding: "15px 26px" }}>{txt(S.books, "button")} <span className={s.arr}>→</span></span>
                </div>
              </div>
            </div>
          </SLink>
        )}
        {rest.length > 0 && (
          <div className={s.list}>
            {rest.map((p, i) => (
              <SLink key={p.id} to={href(p.id)} className={`${s.item} ${s.hov}`}>
                <span className={`${s.mono} ${s.num}`} style={{ fontSize: 12, color: "var(--muted)" }}>{String(i + 2).padStart(2, "0")}</span>
                <span className={s.cv}><Cover product={p} className={s.thumb} fallbackClassName={s.thumbFallback} /></span>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 24, fontWeight: 500, letterSpacing: "-.03em" }}>{p.title}</div>
                  <div style={{ marginTop: 4, fontSize: 15, color: "var(--muted)", fontWeight: 300 }}>{[p.description || p.subtitle, p.pageCount > 0 ? `${p.pageCount} pp.` : null].filter(Boolean).join(" · ")}</div>
                </div>
                <span style={{ fontSize: 22, letterSpacing: "-.02em" }}>{ctx.price(p)}</span>
                <span className={s.arr} style={{ fontSize: 18 }}>→</span>
              </SLink>
            ))}
          </div>
        )}
      </section>

      {S.about.enabled && txt(S.about, "quote") && (
        <section id="about" data-section="about" className={s.wrap} style={{ paddingTop: 160 }}>
          <div className={s.two} style={{ borderTop: "1px solid #111", paddingTop: 40 }}>
            <div className={s.label}>{txt(S.about, "eyebrow")}</div>
            <div>
              <p style={{ margin: 0, fontSize: 40, lineHeight: 1.18, fontWeight: 400, letterSpacing: "-.035em", whiteSpace: "pre-line" }}>{txt(S.about, "quote")}</p>
              <div style={{ display: "flex", alignItems: "center", gap: 18, marginTop: 36, flexWrap: "wrap" }}>
                <Photo url={store.photoUrl} alt={`Photo of ${ctx.who}`} className={s.avatar} />
                <div><div style={{ fontSize: 16, fontWeight: 500 }}>{txt(S.about, "name")}</div>{txt(S.about, "role") && <div style={{ fontSize: 14, color: "var(--muted)" }}>{txt(S.about, "role")}</div>}</div>
                <div style={{ flex: 1 }} />
                <div style={{ display: "flex", gap: 24, fontSize: 14 }}>{socialLinks(ctx).map((l) => <SLink key={l.label} to={l.href}>{l.label}</SLink>)}</div>
              </div>
            </div>
          </div>
        </section>
      )}

      {S.faq.enabled && itm(S.faq, "items").length > 0 && (
        <section id="faq" data-section="faq" className={s.wrap} style={{ paddingTop: 160 }}>
          <div className={s.two} style={{ borderTop: "1px solid #111", paddingTop: 40 }}>
            <div>
              <div className={s.label}>{txt(S.faq, "eyebrow")}</div>
              {txt(S.faq, "title") && <h2 className={s.h2} style={{ fontSize: 32 }}>{txt(S.faq, "title")}</h2>}
            </div>
            <div>
              {itm(S.faq, "items").map((q, i) => (
                <details key={i} open={i === 0} className={s.faqItem}>
                  <summary>{q.q}<span className={s.plus}>+</span></summary>
                  <p style={{ margin: "12px 0 0", fontSize: 16, lineHeight: 1.6, color: "var(--muted)", fontWeight: 300, maxWidth: 620 }}>{q.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>
      )}

      {S.closing.enabled ? (
        <section data-section="closing" className={s.wrap} style={{ paddingTop: 200, paddingBottom: 140 }}>
          <h2 className={s.big}><Rich text={txt(S.closing, "title")} em={s.em} /></h2>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: 24, marginTop: 48, paddingTop: 28, borderTop: "1px solid #111", flexWrap: "wrap" }}>
            <p style={{ margin: 0, maxWidth: 380, fontSize: 16, lineHeight: 1.6, color: "var(--muted)", fontWeight: 300 }}>{txt(S.closing, "fine")}</p>
            {txt(S.closing, "button") && <SLink to={book} className={s.btn} style={{ padding: "16px 28px" }}>{txt(S.closing, "button")}</SLink>}
          </div>
        </section>
      ) : <div style={{ height: 120 }} />}

      <footer className={`${s.wrap} ${s.footer}`}>
        <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
          <span>© {YEAR} {store.name}</span>
          <SLink to={`/store/${store.slug}/terms`}>Terms of sale</SLink>
          {store.contactEmail && <a href={`mailto:${store.contactEmail}`}>Contact</a>}
        </div>
        <SLink to="/" className={s.mono} style={{ fontSize: 12 }}>Made with Scrivetta</SLink>
      </footer>
    </div>
  );
}
