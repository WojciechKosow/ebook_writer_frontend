"use client";

import { itm, lst, txt } from "@/lib/store-design/core";
import { Cover, CustomCss, Photo, Rich, SLink, socialLinks, Unavailable, YEAR, initials, pagesLabel, type StyleProps } from "../kit";
import s from "./literary.module.css";

/** Literary — concept 1: warm paper, serif display, drifting pages. */
export function LiteraryStyle({ t, ctx, href }: StyleProps) {
  const S = t.sections;
  const { store, products, featured } = ctx;
  const rest = products.slice(1);
  const hero = S.hero;
  const book = (p: typeof featured) => (p ? href(p.id) : "#books");

  return (
    <div className={`${s.root} store-page store-literary`} style={{ "--accent": t.accent } as React.CSSProperties}>
      <CustomCss t={t} />
      {t.decor === "pages" && (
        <div aria-hidden className={s.amb}>
          <div className={s.page} style={{ left: "3%", top: 120, "--r": "-9deg" } as React.CSSProperties}><i /><i /><i /><i style={{ width: "80%" }} /><i /><i style={{ width: "60%" }} /><i /><i /></div>
          <div className={s.page} style={{ right: "2%", top: 300, "--r": "7deg", animationDuration: "28s" } as React.CSSProperties}><i /><i /><i style={{ width: "70%" }} /><i /><i /><i style={{ width: "55%" }} /><i /></div>
          <div className={s.page} style={{ left: "40%", top: 1040, "--r": "-4deg", width: 120, height: 160, animationDuration: "25s" } as React.CSSProperties}><i /><i /><i /><i style={{ width: "65%" }} /><i /></div>
          <div className={s.mini} style={{ left: "12%", top: 760, background: "#26205E", "--r": "10deg" } as React.CSSProperties} />
          <div className={s.mini} style={{ right: "9%", top: 820, background: "#1F3B33", "--r": "-12deg", animationDuration: "31s" } as React.CSSProperties} />
          <div className={s.mini} style={{ right: "30%", top: 40, background: "#5B2230", "--r": "6deg", width: 58, height: 82, animationDuration: "24s" } as React.CSSProperties} />
        </div>
      )}
      {t.decor !== "none" && (
        <div aria-hidden className={s.amb}>
          {[["22%", 640, 64, "g", 30], ["6%", 470, 44, "&", 36], ["78%", 140, 52, "a", 26], ["95%", 640, 72, "f", 40], ["52%", 900, 40, "¶", 33], ["30%", 70, 36, "p", 29], ["60%", 1180, 56, "y", 38]].map(([left, top, size, ch, dur], i) => (
            <span key={i} className={s.glyph} style={{ left: left as string, top: top as number, fontSize: size as number, animationDuration: `${dur}s` }}>{ch}</span>
          ))}
        </div>
      )}

      <header className={s.header}>
        <div className={s.headerIn}>
          <a href="#top" className={s.brand}>
            {store.logoUrl ? <Photo url={store.logoUrl} alt="" className={s.mark} /> : <span className={`${s.mark} ${s.serif}`}>{initials(store.name)}</span>}
            <span className={`${s.serif} ${s.brandName}`}>{store.name}</span>
          </a>
          <nav className={s.nav} aria-label="Store">
            <a href="#books">Books</a>
            {S.read.enabled && <a href="#read">Read a page</a>}
            {S.contents.enabled && itm(S.contents, "items").length > 0 && <a href="#inside">Contents</a>}
            {S.faq.enabled && <a href="#faq">FAQ</a>}
          </nav>
          <SLink to={book(featured)} className={s.headBtn}>Get the book</SLink>
        </div>
      </header>
      <Unavailable ctx={ctx} className={s.notice} />

      <section id="top" data-section="hero" className={s.wrap} style={{ paddingTop: 96, paddingBottom: 40 }}>
        <div className={s.hero}>
          <div>
            {txt(hero, "badge") && (
              <a href="#books" className={s.badge}>
                <span className={`${s.mono} ${s.badgeTag}`}>{txt(hero, "badgeTag")}</span>
                {txt(hero, "badge")}<span>→</span>
              </a>
            )}
            <h1 className={`${s.serif} ${s.h1}`}><Rich text={txt(hero, "headline")} em={s.em} /></h1>
            {txt(hero, "intro") && <p className={s.lead}>{txt(hero, "intro")}</p>}
            <div className={s.ctas}>
              {txt(hero, "primary") && <SLink to={book(featured)} className={s.btn}>{txt(hero, "primary")}</SLink>}
              {txt(hero, "secondary") && <a href={S.read.enabled ? "#read" : "#books"} className={s.ghost}>{txt(hero, "secondary")}</a>}
            </div>
            {lst(hero, "trust").length > 0 && (
              <div className={s.trust}>
                {lst(hero, "trust").map((x, i) => <span key={i}><span>✓</span> {x}</span>)}
              </div>
            )}
          </div>
          {featured && (
            <div className={`${s.heroArt} ${s.hideM}`} aria-hidden>
              {txt(hero, "excerpt") && <div className={s.sheet}>
                <div className={s.serif} style={{ fontSize: 22, fontStyle: "italic" }}>{txt(hero, "excerptTitle")}</div>
                <div className={s.serif} style={{ marginTop: 18, fontSize: 14.5, lineHeight: 1.8, color: "var(--body)", whiteSpace: "pre-line" }}>{txt(hero, "excerpt")}</div>
              </div>}
              <div className={s.heroBook}>
                <div className={s.edge} />
                <Cover product={featured} className={s.cover} fallbackClassName={s.coverFallback} />
              </div>
              {txt(hero, "card1Title") && (
                <div className={`${s.card} ${s.float}`} style={{ left: 0, top: 70 }}>
                  <span className={s.floatIcon}><svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M3 3.5h10M3 8h10M3 12.5h6" /></svg></span>
                  <div><div className={s.floatTitle}>{txt(hero, "card1Title")}</div><div className={s.floatText}>{txt(hero, "card1Text")}</div></div>
                </div>
              )}
              {txt(hero, "card2Title") && (
                <div className={`${s.card} ${s.float}`} style={{ right: 10, bottom: 50 }}>
                  <span className={s.floatIcon} style={{ borderRadius: "50%", background: "#2F6B4C", width: 30, height: 30 }}><svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 8.5l3 3 7-7" /></svg></span>
                  <div><div className={s.floatTitle}>{txt(hero, "card2Title")}</div><div className={s.floatText}>{txt(hero, "card2Text")}</div></div>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {S.strip.enabled && itm(S.strip, "items").length > 0 && (
        <section data-section="strip" className={s.wrap} style={{ paddingTop: 40 }}>
          <div className={s.strip}>
            {itm(S.strip, "items").map((it, i) => (
              <div key={i}><div className={`${s.mono} ${s.stripLabel}`}>{it.label}</div><div className={s.stripText}>{it.text}</div></div>
            ))}
          </div>
        </section>
      )}

      {S.read.enabled && (
        <section id="read" data-section="read" className={s.wrap} style={{ paddingTop: 140 }}>
          <div style={{ textAlign: "center" }}>
            <div className={s.eyebrow}>{txt(S.read, "eyebrow")}</div>
            <h2 className={s.h2} style={{ maxWidth: 720, marginLeft: "auto", marginRight: "auto" }}><Rich text={txt(S.read, "title")} em={s.em} /></h2>
          </div>
          <div style={{ position: "relative", margin: "56px auto 0", maxWidth: 1040 }}>
            <div className={s.spread}>
              <div className={`${s.leaf} ${s.leafL}`}>
                <div className={`${s.mono} ${s.runHead}`}>{txt(S.read, "leftLabel")}</div>
                <div className={`${s.serif} ${s.leafTitle}`}>{txt(S.read, "leftTitle")}</div>
                <div className={`${s.serif} ${s.leafText}`}>{txt(S.read, "leftText")}</div>
                <div className={`${s.serif} ${s.folio}`}>{txt(S.read, "leftPage")}</div>
              </div>
              <div className={`${s.leaf} ${s.leafR}`}>
                <div className={`${s.mono} ${s.runHead}`} style={{ textAlign: "right" }}>{txt(S.read, "rightLabel")}</div>
                <div className={`${s.serif} ${s.leafTitle}`}>{txt(S.read, "rightTitle")}</div>
                <div className={`${s.serif} ${s.leafText}`}>{txt(S.read, "rightText")}</div>
                <div className={`${s.serif} ${s.folio}`}>{txt(S.read, "rightPage")}</div>
              </div>
            </div>
            {txt(S.read, "note") && <div className={`${s.card} ${s.sticky} ${s.hideM}`}><span className={s.dot} />{txt(S.read, "note")}</div>}
          </div>
        </section>
      )}

      {S.inside.enabled && (
        <section data-section="inside" className={s.wrap} style={{ paddingTop: 150 }}>
          <div className={s.eyebrow}>{txt(S.inside, "eyebrow")}</div>
          <h2 className={s.h2} style={{ maxWidth: 680 }}><Rich text={txt(S.inside, "title")} em={s.em} /></h2>
          <div className={s.bento}>
            {itm(S.inside, "parts").length > 0 && (
              <div className={`${s.card} ${s.bcard} ${s.span2}`} style={{ display: "flex", flexDirection: "column", minHeight: 280 }}>
                <div className={s.bTitle}>{txt(S.inside, "partsTitle")}</div>
                <div className={s.bText}>{txt(S.inside, "partsText")}</div>
                <div className={s.parts}>
                  {itm(S.inside, "parts").map((p, i) => {
                    const look = [["#26205E", "#EDE6F7", "#D6B478"], ["#3A3270", "#EDE6F7", "#D6B478"], ["#B89A72", "#1D1B17", "#3D2E18"], ["#EADFC9", "#1D1B17", "#8B5E24"]][i % 4];
                    return (
                      <div key={i} className={s.part} style={{ background: look[0], color: look[1] }}>
                        <div className={`${s.mono} ${s.partN}`} style={{ color: look[2] }}>{p.n}</div>
                        <div className={`${s.serif} ${s.partName}`}>{p.name}</div>
                        {p.sub && <div style={{ marginTop: 4, fontSize: 12.5, opacity: 0.75 }}>{p.sub}</div>}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
            {txt(S.inside, "quote") && (
              <div className={`${s.card} ${s.bcard} ${s.quoteCard}`} style={{ minHeight: 280 }}>
                <div className={`${s.serif} ${s.qMark}`}>“</div>
                <div className={`${s.serif} ${s.qText}`}>{txt(S.inside, "quote")}</div>
                <div className={`${s.mono} ${s.qSrc}`}>{txt(S.inside, "quoteSource")}</div>
              </div>
            )}
            {itm(S.inside, "cards").map((c, i) => (
              <div key={i} className={`${s.card} ${s.bcard}`}>
                <div className={s.bTitle}>{c.title}</div>
                <div className={s.bText}>{c.text}</div>
                {i === 0 && <p className={`${s.serif} ${s.dropcap}`} style={{ margin: "22px 0 0" }}><span>{(featured?.title ?? "E")[0]}</span>very chapter opens like a printed book, with real margins and a quiet ornament.</p>}
                {i === 1 && <div className={s.phone} aria-hidden><div className={s.serif} style={{ fontSize: 11, fontStyle: "italic" }}>{featured?.title}</div><i style={{ width: "90%", marginTop: 10 }} /><i style={{ width: "70%" }} /><i style={{ width: "82%" }} /><i style={{ width: "55%" }} /></div>}
                {i === 2 && featured && (
                  <div className={s.mail}>
                    <span style={{ width: 28, height: 28, borderRadius: 8, background: "#26205E", flexShrink: 0 }} />
                    <div style={{ minWidth: 0 }}><div style={{ fontSize: 13, fontWeight: 600 }}>Your copy of {featured.title}</div><div style={{ fontSize: 12, color: "var(--soft-ink)" }}>PDF · download link</div></div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      <section id="books" data-section="books" className={s.wrap} style={{ paddingTop: 150 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: 24, flexWrap: "wrap" }}>
          <div>
            <div className={s.eyebrow}>{txt(S.books, "eyebrow")}</div>
            <h2 className={s.h2}><Rich text={txt(S.books, "title")} em={s.em} /></h2>
          </div>
          <div className={s.mono} style={{ fontSize: 12, color: "var(--faint)" }}>PDF · prices in USD</div>
        </div>
        {!featured ? (
          <p style={{ marginTop: 32, color: "var(--soft-ink)" }}>No books for sale yet.</p>
        ) : (
          <SLink to={href(featured.id)} className={`${s.feat} ${s.ring} ${s.lift}`}>
            <div className={s.featArt}>
              <div className={s.book} style={{ width: 236 }}>
                <div className={s.edge} style={{ right: -10, width: 14 }} />
                <Cover product={featured} className={s.cover} fallbackClassName={s.coverFallback} />
              </div>
            </div>
            <div className={s.featBody}>
              <div className={`${s.mono} ${s.chips}`}>
                {rest.length > 0 && <span className={s.chipOn}>Start here</span>}
                <span>{pagesLabel(featured)}</span>
                {featured.language && <span>{featured.language}</span>}
              </div>
              <h3 className={s.serif} style={{ margin: "22px 0 0", fontSize: 40, lineHeight: 1.05, fontWeight: 400, letterSpacing: "-.025em" }}>{featured.title}</h3>
              {(featured.description || featured.subtitle) && <p style={{ margin: "14px 0 0", fontSize: 16, lineHeight: 1.65, color: "var(--body)", maxWidth: 500 }}>{featured.description || featured.subtitle}</p>}
              {lst(S.books, "bullets").length > 0 && (
                <div className={s.bullets}>{lst(S.books, "bullets").map((b, i) => <div key={i}><b>—</b>{b}</div>)}</div>
              )}
              <div style={{ flex: 1 }} />
              <div className={s.priceRow}>
                <div><span className={s.serif} style={{ fontSize: 40, letterSpacing: "-.02em" }}>{ctx.price(featured)}</span><span className={s.mono} style={{ marginLeft: 10, fontSize: 11.5, color: "var(--faint)" }}>one-time · USD</span></div>
                <span className={s.btn} style={{ padding: "14px 22px", fontSize: 15 }}>{txt(S.books, "button")}</span>
              </div>
            </div>
          </SLink>
        )}
        {rest.length > 0 && (
          <div className={s.two}>
            {rest.map((p) => (
              <SLink key={p.id} to={href(p.id)} className={`${s.card} ${s.lift} ${s.small}`}>
                <div className={s.book} style={{ width: 116, flexShrink: 0 }}>
                  <Cover product={p} className={s.cover} fallbackClassName={s.coverFallback} />
                </div>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div className={s.mono} style={{ fontSize: 11, color: "var(--faint)" }}>{pagesLabel(p)}</div>
                  <h3 className={s.serif} style={{ margin: "8px 0 0", fontSize: 26, fontWeight: 400, letterSpacing: "-.02em" }}>{p.title}</h3>
                  {(p.description || p.subtitle) && <p style={{ margin: "8px 0 0", fontSize: 14.5, lineHeight: 1.6, color: "var(--body)" }}>{p.description || p.subtitle}</p>}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 16 }}><span className={s.serif} style={{ fontSize: 26 }}>{ctx.price(p)}</span><span style={{ fontSize: 14, color: "var(--body)" }}>View →</span></div>
                </div>
              </SLink>
            ))}
          </div>
        )}
      </section>

      {S.contents.enabled && itm(S.contents, "items").length > 0 && (
        <section id="inside" data-section="contents" className={s.wrap} style={{ paddingTop: 150 }}>
          <div className={s.toc}>
            <div>
              <div className={s.eyebrow}>{txt(S.contents, "eyebrow")}</div>
              <h2 className={s.h2} style={{ fontSize: 42 }}><Rich text={txt(S.contents, "title")} em={s.em} /></h2>
              {txt(S.contents, "text") && <p style={{ margin: "16px 0 0", fontSize: 15, lineHeight: 1.65, color: "var(--soft-ink)" }}>{txt(S.contents, "text")}</p>}
            </div>
            <div style={{ borderTop: "1px solid var(--line)" }}>
              {itm(S.contents, "items").map((c, i) => (
                <div key={i} className={s.tocRow}>
                  <span className={s.serif} style={{ fontSize: 22, fontStyle: "italic", color: "var(--accent)" }}>{c.n}</span>
                  <div><div className={s.serif} style={{ fontSize: 24 }}>{c.t}</div>{c.d && <div style={{ marginTop: 4, fontSize: 14.5, color: "var(--soft-ink)" }}>{c.d}</div>}</div>
                  <span className={s.mono} style={{ fontSize: 11.5, color: "var(--faint)" }}>{c.p}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {S.about.enabled && (txt(S.about, "text") || store.photoUrl) && (
        <section id="about" data-section="about" className={s.wrap} style={{ paddingTop: 150 }}>
          <div className={`${s.card} ${s.about}`}>
            {store.photoUrl ? <Photo url={store.photoUrl} alt={`Photo of ${ctx.who}`} className={s.portrait} /> : null}
            <div style={{ flex: "1 1 420px", minWidth: 0 }}>
              <div className={s.eyebrow}>{txt(S.about, "eyebrow")}</div>
              <div className={s.serif} style={{ marginTop: 10, fontSize: 32, letterSpacing: "-.02em" }}>{txt(S.about, "title")}</div>
              <p className={s.serif} style={{ margin: "10px 0 0", fontSize: 18, lineHeight: 1.7, color: "var(--ink2)", maxWidth: 640, fontWeight: 300, whiteSpace: "pre-line" }}>{txt(S.about, "text")}</p>
            </div>
            <div className={s.links}>{socialLinks(ctx).map((l) => <SLink key={l.label} to={l.href}>{l.label}{l.href.startsWith("http") ? " ↗" : ""}</SLink>)}</div>
          </div>
        </section>
      )}

      {S.faq.enabled && itm(S.faq, "items").length > 0 && (
        <section id="faq" data-section="faq" className={s.wrap} style={{ paddingTop: 150 }}>
          <div className={s.eyebrow}>{txt(S.faq, "eyebrow")}</div>
          <h2 className={s.h2} style={{ fontSize: 42, marginBottom: 40 }}>{txt(S.faq, "title")}</h2>
          <div className={s.faq}>
            {itm(S.faq, "items").map((q, i) => (
              <div key={i}><div className={s.serif} style={{ fontSize: 21 }}>{q.q}</div><p style={{ margin: "8px 0 0", fontSize: 15, lineHeight: 1.65, color: "var(--body)" }}>{q.a}</p></div>
            ))}
          </div>
        </section>
      )}

      {S.closing.enabled ? (
        <section data-section="closing" className={s.wrap} style={{ paddingTop: 160, paddingBottom: 140, textAlign: "center" }}>
          <div aria-hidden className={s.glow} />
          <h2 className={s.h2} style={{ position: "relative", margin: "0 auto", maxWidth: 760, fontSize: 62, lineHeight: 1.02 }}><Rich text={txt(S.closing, "title")} em={s.em} /></h2>
          <div className={s.ctas} style={{ position: "relative", justifyContent: "center" }}>
            {txt(S.closing, "primary") && <SLink to={book(featured)} className={s.btn}>{txt(S.closing, "primary")}</SLink>}
            {txt(S.closing, "secondary") && <a href="#books" className={s.ghost}>{txt(S.closing, "secondary")}</a>}
          </div>
          {txt(S.closing, "fine") && <div className={s.mono} style={{ position: "relative", marginTop: 22, fontSize: 11.5, color: "var(--faint)" }}>{txt(S.closing, "fine")}</div>}
        </section>
      ) : <div style={{ height: 120 }} />}

      <footer className={s.footer}>
        <div className={s.footIn}>
          <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
            <span>© {YEAR} {store.name}</span>
            <SLink to={`/store/${store.slug}/terms`}>Terms of sale</SLink>
            {store.contactEmail && <a href={`mailto:${store.contactEmail}`}>Contact</a>}
          </div>
          <SLink to="/" className={s.made}><span className={`${s.serif} ${s.madeS}`}>S</span>Made with Scrivetta</SLink>
        </div>
      </footer>
    </div>
  );
}
