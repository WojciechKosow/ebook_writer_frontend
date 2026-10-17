"use client";

import { itm, lst, txt } from "@/lib/store-design/core";
import { Cover, CustomCss, Photo, Rich, SLink, socialLinks, Unavailable, YEAR, initials, pagesLabel, type StyleProps } from "../kit";
import s from "./bold.module.css";

const CARD_BG = ["var(--accent)", "#FF9BD2", "#7CF29A", "#8AB4FF", "#FF8A3D"];

/** Bold — concept 5: loud colors, thick outlines, hard shadows. */
export function BoldStyle({ t, ctx, href }: StyleProps) {
  const S = t.sections;
  const { store, products, featured } = ctx;
  const hero = S.hero;
  const decor = t.decor !== "none";
  const book = featured ? href(featured.id) : "#books";
  const ticker = lst(S.ticker, "items");

  return (
    <div className={`${s.root} store-page store-bold`} style={{ "--accent": t.accent } as React.CSSProperties}>
      <CustomCss t={t} />
      <header className={s.header}>
        <a href="#top" className={s.brand}>
          {store.logoUrl ? <Photo url={store.logoUrl} alt="" className={s.logo} /> : <span className={s.logo}>{initials(store.name)}</span>}
          <span>{store.name}</span>
        </a>
        <a href="#books" className={`${s.headBtn} ${s.press}`}>Shop the {products.length === 1 ? "guide" : "guides"}</a>
      </header>
      <div style={{ padding: "0 24px" }}><Unavailable ctx={ctx} className={s.notice} /></div>

      <section id="top" data-section="hero" className={s.wrap} style={{ paddingTop: 80, paddingBottom: 100 }}>
        <div className={s.hero}>
          <div>
            {txt(hero, "badge") && <div className={s.badge}>{txt(hero, "badge")}</div>}
            <h1 className={s.h1}><Rich text={txt(hero, "headline")} em={s.box} /></h1>
            {txt(hero, "intro") && <p className={s.lead}>{txt(hero, "intro")}</p>}
            <div style={{ display: "flex", gap: 14, marginTop: 36, flexWrap: "wrap" }}>
              {txt(hero, "primary") && <SLink to={book} className={`${s.btn} ${s.press}`} style={{ background: "var(--accent)" }}>{txt(hero, "primary")}</SLink>}
              {txt(hero, "secondary") && <a href="#books" className={`${s.btn} ${s.press}`} style={{ background: "#fff", fontWeight: 800 }}>{txt(hero, "secondary")}</a>}
            </div>
          </div>
          {featured && (
            <div aria-hidden className={s.art}>
              <div className={s.back} />
              <Cover product={featured} className={s.cover} fallbackClassName={s.coverFallback} />
              {decor && txt(hero, "sticker") && <div className={s.sticker}>{txt(hero, "sticker")}</div>}
              {decor && <svg className={s.spin} width="90" height="90" viewBox="0 0 100 100"><path d="M50 0 L58 38 L100 50 L58 62 L50 100 L42 62 L0 50 L42 38 Z" fill="#141414" /></svg>}
            </div>
          )}
        </div>
      </section>

      {decor && S.ticker.enabled && ticker.length > 0 && (
        <div aria-hidden data-section="ticker" className={s.tickerBand}>
          <div className={s.ticker}>
            {[...ticker, ...ticker].map((x, i) => <span key={i} style={{ display: "contents" }}><span>{x}</span><span style={{ color: "var(--accent)" }}>★</span></span>)}
          </div>
        </div>
      )}

      <section id="books" data-section="books" className={s.wrap} style={{ paddingTop: 110, paddingBottom: 100 }}>
        <h2 className={s.h2}><Rich text={txt(S.books, "title")} em={s.box} /></h2>
        {products.length === 0 ? <p style={{ fontWeight: 600 }}>No guides for sale yet.</p> : (
          <div className={s.grid}>
            {products.map((p, i) => (
              <SLink key={p.id} to={href(p.id)} className={`${s.card} ${s.press}`}>
                <div className={s.cardArt} style={{ background: CARD_BG[i % CARD_BG.length] }}>
                  <Cover product={p} className={s.mini} fallbackClassName={s.miniFallback} />
                  <div className={s.tag}>{i === 0 && products.length > 1 && txt(S.books, "startTag") ? txt(S.books, "startTag") : p.pageCount > 0 ? `${p.pageCount} PAGES` : "PDF"}</div>
                </div>
                <div style={{ padding: "22px 22px 24px", display: "flex", flexDirection: "column", gap: 10, flexGrow: 1 }}>
                  <h3 style={{ margin: 0, fontWeight: 900, fontSize: 24, letterSpacing: "-.03em", lineHeight: 1.05 }}>{p.title}</h3>
                  <p style={{ margin: 0, fontSize: 16, lineHeight: 1.5, fontWeight: 500, color: "#3C3C3C", flexGrow: 1 }}>{p.description || p.subtitle || pagesLabel(p)}</p>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 10 }}>
                    <span style={{ fontWeight: 900, fontSize: 32, letterSpacing: "-.04em" }}>{ctx.price(p)}</span>
                    <span className={s.get}>{txt(S.books, "button")}</span>
                  </div>
                </div>
              </SLink>
            ))}
          </div>
        )}
      </section>

      {S.about.enabled && (txt(S.about, "text") || store.photoUrl) && (
        <section id="about" data-section="about" className={s.wrap} style={{ paddingBottom: 100 }}>
          <div className={s.about}>
            <Photo url={store.photoUrl} alt={`Photo of ${ctx.who}`} className={s.avatar} />
            <div style={{ flex: "1 1 420px", minWidth: 0 }}>
              <div style={{ fontWeight: 900, fontSize: 48, letterSpacing: "-.04em", lineHeight: 0.95, textTransform: "uppercase" }}>{txt(S.about, "title")}</div>
              <p style={{ margin: "16px 0 0", fontSize: 19, lineHeight: 1.5, fontWeight: 500, maxWidth: 620, whiteSpace: "pre-line" }}>{txt(S.about, "text")}</p>
              <div style={{ display: "flex", gap: 12, marginTop: 22, flexWrap: "wrap" }}>
                {socialLinks(ctx).map((l) => <SLink key={l.label} to={l.href} className={s.social}>{l.label === "Email" ? `Email ${ctx.first}` : l.label}</SLink>)}
              </div>
            </div>
          </div>
        </section>
      )}

      {S.faq.enabled && itm(S.faq, "items").length > 0 && (
        <section id="faq" data-section="faq" className={s.wrap} style={{ maxWidth: 820, paddingBottom: 110 }}>
          <h2 className={s.h2} style={{ fontSize: 48, marginBottom: 28 }}>{txt(S.faq, "title")}</h2>
          {itm(S.faq, "items").map((q, i) => (
            <details key={i} open={i === 0} className={s.faq}>
              <summary>{q.q}<span className={s.plus}>+</span></summary>
              <p style={{ margin: "10px 0 0", fontSize: 16, lineHeight: 1.55, fontWeight: 500 }}>{q.a}</p>
            </details>
          ))}
        </section>
      )}

      <footer className={s.footer}>
        <div className={s.footIn}>
          <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
            <span>© {YEAR} {store.name}</span>
            <SLink to={`/store/${store.slug}/terms`}>Terms of sale</SLink>
            {store.contactEmail && <a href={`mailto:${store.contactEmail}`}>Contact</a>}
          </div>
          <SLink to="/" className={s.made}>Made with Scrivetta</SLink>
        </div>
      </footer>
    </div>
  );
}
