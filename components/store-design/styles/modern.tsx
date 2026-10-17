"use client";

import { useEffect, useState } from "react";
import { itm, lst, txt } from "@/lib/store-design/core";
import { Cover, CustomCss, Photo, Rich, SLink, socialLinks, Unavailable, YEAR, pagesLabel, type StyleProps } from "../kit";
import s from "./modern.module.css";

const CHAIN = [0, 1, 2, 3, 4, 6, 7, 8, 9, 11, 12, 13];

/** Modern — concept 4: dark glass, glowing orbs, a bold grotesque. */
export function ModernStyle({ t, ctx, href }: StyleProps) {
  const S = t.sections;
  const { store, products, featured } = ctx;
  const rest = products.slice(1);
  const hero = S.hero;
  const book = featured ? href(featured.id) : "#books";
  const words = lst(hero, "words").filter(Boolean).slice(0, 4);
  const marquee = lst(S.marquee, "items");

  return (
    <div className={`${s.root} store-page store-modern`} style={{ "--accent": t.accent } as React.CSSProperties}>
      <CustomCss t={t} />
      {t.decor === "orbs" && <div aria-hidden className={s.orbs}><div className={`${s.orb} ${s.o1}`} /><div className={`${s.orb} ${s.o2}`} /><div className={`${s.orb} ${s.o3}`} /></div>}
      {t.decor === "dots" && <div aria-hidden className={s.dots} />}

      <header className={s.header}>
        <div className={`${s.glass} ${s.headerIn}`}>
          <a href="#top" className={`${s.d} ${s.brand}`}>{store.name}<span style={{ color: "var(--accent)" }}>.</span></a>
          <nav className={s.nav} aria-label="Store">
            <a href="#books">Books</a>
            {S.inside.enabled && <a href="#inside">Inside</a>}
            {S.plan.enabled && <a href="#plan">The plan</a>}
            {S.faq.enabled && <a href="#faq">FAQ</a>}
          </nav>
          <SLink to={book} className={s.headBtn}>Get the books</SLink>
        </div>
      </header>
      <Unavailable ctx={ctx} className={`${s.glass} ${s.notice}`} />

      <section id="top" data-section="hero" className={s.wrap} style={{ paddingTop: 100, paddingBottom: 60 }}>
        <div className={s.hero}>
          <div>
            {txt(hero, "badge") && <a href="#books" className={`${s.up} ${s.glass} ${s.pill}`}><span className={s.pillTag}>{txt(hero, "badgeTag")}</span>{txt(hero, "badge")}</a>}
            <h1 className={`${s.h1} ${s.d} ${s.up} ${s.d1}`}>
              <Rich text={txt(hero, "headline")} em={s.em} />
              {words.length > 0 && (
                <>
                  {" "}
                  <RotatingWords words={words} />
                </>
              )}
            </h1>
            {txt(hero, "intro") && <p className={`${s.lead} ${s.up} ${s.d2}`}>{txt(hero, "intro")}</p>}
            <div className={`${s.up} ${s.d3}`} style={{ display: "flex", gap: 12, marginTop: 38, flexWrap: "wrap" }}>
              {txt(hero, "primary") && <SLink to={book} className={s.btn}>{txt(hero, "primary")}</SLink>}
              {txt(hero, "secondary") && <a href={S.inside.enabled ? "#inside" : "#books"} className={`${s.glass} ${s.ghostBtn}`}>{txt(hero, "secondary")}</a>}
            </div>
            {lst(hero, "trust").length > 0 && (
              <div className={`${s.up} ${s.d4}`} style={{ display: "flex", gap: 22, marginTop: 28, flexWrap: "wrap", fontSize: 13.5, color: "var(--dimmer)" }}>
                {lst(hero, "trust").map((x, i) => <span key={i}><span style={{ color: "var(--accent)" }}>●</span> {x}</span>)}
              </div>
            )}
          </div>
          {featured && (
            <div aria-hidden className={`${s.heroArt} ${s.hideM}`}>
              <div className={s.stack}>
                <div className={s.stackBack} style={{ background: "#FF7A45", transform: "translateZ(-90px) translateX(80px) rotate(9deg)" }} />
                <div className={s.stackBack} style={{ background: "#3B2BD9", transform: "translateZ(-45px) translateX(40px) rotate(4deg)" }} />
                <Cover product={featured} className={s.cover} fallbackClassName={s.coverFallback} />
              </div>
              {txt(hero, "chipTitle") && (
                <div className={`${s.glass} ${s.chip}`} style={{ left: -10, top: 70, display: "flex", gap: 12, alignItems: "center" }}>
                  <svg width="44" height="44" viewBox="0 0 100 100"><circle cx="50" cy="50" r="45" fill="none" stroke="rgba(255,255,255,.1)" strokeWidth="10" /><circle className={s.ringc} cx="50" cy="50" r="45" fill="none" stroke="var(--accent)" strokeWidth="10" strokeLinecap="round" transform="rotate(-90 50 50)" /></svg>
                  <div><div style={{ fontSize: 14, fontWeight: 600, color: "#fff" }}>{txt(hero, "chipTitle")}</div><div style={{ fontSize: 12.5, color: "var(--dim)" }}>{txt(hero, "chipText")}</div></div>
                </div>
              )}
              {txt(hero, "barsLabel") && (
                <div className={`${s.glass} ${s.chip}`} style={{ right: -6, bottom: 70, animationDelay: "-3s" }}>
                  <div className={s.mono} style={{ fontSize: 10.5, color: "var(--dimmer)" }}>{txt(hero, "barsLabel")}</div>
                  <div style={{ display: "flex", gap: 6, alignItems: "flex-end", height: 44, marginTop: 8 }}>
                    {[60, 20, 85, 20, 100, 30, 20].map((h, i) => <span key={i} className={s.bar} style={{ width: 12, height: `${h}%`, borderRadius: 4, background: h > 50 ? "var(--accent)" : "rgba(255,255,255,.15)", animationDelay: `${0.5 + i * 0.1}s` }} />)}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {S.marquee.enabled && marquee.length > 0 && (
        <div aria-hidden data-section="marquee" className={s.marquee}>
          <div className={`${s.mq} ${s.d}`}>
            {[...marquee, ...marquee].map((m, i) => <span key={i} style={{ display: "contents" }}><span>{m}</span><span style={{ color: "var(--accent)" }}>✦</span></span>)}
          </div>
        </div>
      )}

      {S.inside.enabled && (
        <section id="inside" data-section="inside" className={s.wrap} style={{ paddingTop: 140, textAlign: "center" }}>
          <div className={s.eyebrow}>{txt(S.inside, "eyebrow")}</div>
          <h2 className={s.h2} style={{ maxWidth: 760, margin: "14px auto 0", fontSize: 60 }}><Rich text={txt(S.inside, "title")} em={s.em} /></h2>
          <p style={{ margin: "18px auto 0", maxWidth: 520, fontSize: 17, lineHeight: 1.6, color: "var(--dim)" }}>{txt(S.inside, "text")}</p>
          <div className={s.phones}>
            <div aria-hidden style={{ position: "absolute", width: 640, maxWidth: "100%", height: 360, borderRadius: "50%", background: "radial-gradient(closest-side, var(--soft), transparent)" }} />
            <div className={`${s.phone} ${s.p1} ${s.hideM}`} style={{ transform: "rotate(-7deg) translateX(-250px)" }}>
              <div className={s.screen} style={{ background: "#F2F2F5", color: "#0B0B0E" }}>
                <div className={s.mono} style={{ fontSize: 9.5, color: "#6E6E7A" }}>{txt(S.inside, "leftLabel")}</div>
                <div className={s.d} style={{ marginTop: 14, fontWeight: 800, fontSize: 26, lineHeight: 0.95, letterSpacing: "-.04em" }}>{txt(S.inside, "leftTitle")}</div>
                <div style={{ marginTop: 20, display: "flex", flexDirection: "column", gap: 9, fontSize: 12.5 }}>
                  {lst(S.inside, "leftChecks").map((c, i) => {
                    const done = /^x\s/i.test(c);
                    return (
                      <div key={i} style={{ display: "flex", gap: 10, alignItems: "center" }}>
                        <span className={s.check} style={done ? { background: "#0B0B0E", color: "var(--accent)" } : { border: "1.5px solid #C4C4CE" }}>{done ? "✓" : ""}</span>{c.replace(/^x\s+/i, "")}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
            <div className={`${s.phone} ${s.p3} ${s.hideM}`} style={{ transform: "rotate(7deg) translateX(250px)" }}>
              <div className={s.screen} style={{ background: "#FF7A45", color: "#1A0E08" }}>
                <div className={s.mono} style={{ fontSize: 9.5, opacity: 0.7 }}>{txt(S.inside, "rightLabel")}</div>
                <div className={s.d} style={{ marginTop: 14, fontWeight: 800, fontSize: 26, lineHeight: 0.95, letterSpacing: "-.04em" }}>{txt(S.inside, "rightTitle")}</div>
                <div style={{ marginTop: 22, display: "grid", gridTemplateColumns: "repeat(6, minmax(0, 1fr))", gap: 6 }}>
                  {Array.from({ length: 30 }, (_, i) => <span key={i} style={{ aspectRatio: "1", borderRadius: 5, background: CHAIN.includes(i) ? "#1A0E08" : "rgba(26,14,8,.18)" }} />)}
                </div>
              </div>
            </div>
            <div className={s.phone} style={{ position: "relative", zIndex: 2, width: 260, height: 530, borderRadius: 42 }}>
              <div className={s.screen} style={{ background: "#131318", border: "1px solid var(--line)", borderRadius: 34 }}>
                <div className={s.mono} style={{ fontSize: 9.5, color: "var(--accent)" }}>{txt(S.inside, "mainLabel")}</div>
                <div className={s.d} style={{ marginTop: 14, fontWeight: 800, fontSize: 28, lineHeight: 0.95, letterSpacing: "-.04em", color: "#fff" }}>{txt(S.inside, "mainTitle")}</div>
                <div style={{ marginTop: 22 }}>
                  {itm(S.inside, "mainRows").map((r, i) => <div key={i} style={{ display: "flex", justifyContent: "space-between", gap: 8, padding: "11px 0", borderBottom: "1px solid var(--line)", fontSize: 13 }}><span>{r.n}</span><span className={s.mono} style={{ fontSize: 11.5, color: "var(--dim)" }}>{r.r}</span></div>)}
                </div>
                {txt(S.inside, "mainTip") && <div style={{ marginTop: 18, padding: "12px 14px", borderRadius: 14, background: "var(--soft)", fontSize: 12, lineHeight: 1.5 }}><span style={{ color: "var(--accent)", fontWeight: 600 }}>Tip · </span>{txt(S.inside, "mainTip")}</div>}
              </div>
            </div>
          </div>
        </section>
      )}

      {S.why.enabled && (
        <section data-section="why" className={s.wrap} style={{ paddingTop: 150 }}>
          <div className={s.eyebrow}>{txt(S.why, "eyebrow")}</div>
          <h2 className={s.h2} style={{ maxWidth: 680 }}><Rich text={txt(S.why, "title")} em={s.em} /></h2>
          <div className={s.bento}>
            <div className={`${s.panel} ${s.bcard} ${s.s2}`} style={{ minHeight: 290, display: "flex", flexDirection: "column" }}>
              <div className={s.bTitle}>{txt(S.why, "planTitle")}</div>
              <div className={s.bText}>{txt(S.why, "planText")}</div>
              <div style={{ flex: 1, display: "grid", gridTemplateColumns: "repeat(6, minmax(0, 1fr))", gap: 8, marginTop: 24, alignItems: "end", minHeight: 120 }}>
                {[30, 44, 58, 70, 84, 100].map((h, i) => (
                  <div key={i} style={{ display: "flex", flexDirection: "column", gap: 8, height: "100%", justifyContent: "flex-end" }}>
                    <span className={s.bar} style={{ height: `${h}%`, borderRadius: 10, background: i < 2 ? "rgba(255,255,255,.12)" : i < 4 ? "var(--mid)" : "var(--accent)", animationDelay: `${0.2 + i * 0.1}s` }} />
                    <div className={s.mono} style={{ fontSize: 10.5, color: "var(--dimmer)", textAlign: "center" }}>{i + 1}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className={s.bcard} style={{ minHeight: 290, background: "var(--accent)", color: "#0B0B0E", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
              <div style={{ fontSize: 15, fontWeight: 600 }}>{txt(S.why, "statLabel")}</div>
              <div><div className={s.d} style={{ fontWeight: 800, fontSize: 96, lineHeight: 0.85, letterSpacing: "-.06em" }}>{txt(S.why, "statNumber")}</div><div style={{ fontSize: 15, fontWeight: 600, marginTop: 6 }}>{txt(S.why, "statText")}</div></div>
            </div>
            <div className={`${s.panel} ${s.bcard}`} style={{ minHeight: 290, display: "flex", flexDirection: "column", justifyContent: "space-between", gap: 16 }}>
              <div className={s.bTitle}>{txt(S.why, "chipsTitle")}</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 8 }}>
                {lst(S.why, "chips").map((c, i) => <span key={i} style={{ padding: 10, borderRadius: 12, background: "#1B1B22", fontSize: 13, textAlign: "center" }}>{c}</span>)}
              </div>
            </div>
            {txt(S.why, "quote") && (
              <div className={`${s.panel} ${s.bcard}`} style={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                <div className={s.d} style={{ fontSize: 52, lineHeight: 0.6, color: "var(--accent)" }}>“</div>
                <div className={s.d} style={{ fontWeight: 700, fontSize: 22, lineHeight: 1.15, letterSpacing: "-.02em", color: "#fff" }}>{txt(S.why, "quote")}</div>
              </div>
            )}
            <div className={`${s.panel} ${s.bcard} ${s.s2}`} style={{ display: "flex", gap: 28, alignItems: "center", flexWrap: "wrap" }}>
              <svg aria-hidden width="120" height="120" viewBox="0 0 100 100" style={{ flexShrink: 0 }}><circle cx="50" cy="50" r="45" fill="none" stroke="rgba(255,255,255,.08)" strokeWidth="8" /><circle className={s.ringc} cx="50" cy="50" r="45" fill="none" stroke="var(--accent)" strokeWidth="8" strokeLinecap="round" transform="rotate(-90 50 50)" /></svg>
              <div style={{ flex: "1 1 240px", minWidth: 0 }}><div className={s.bTitle}>{txt(S.why, "progressTitle")}</div><div className={s.bText}>{txt(S.why, "progressText")}</div></div>
            </div>
            <div className={`${s.panel} ${s.bcard}`} style={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
              <div className={s.bTitle}>{txt(S.why, "keepTitle")}</div>
              <div className={s.bText}>{txt(S.why, "keepText")}</div>
            </div>
          </div>
        </section>
      )}

      <section id="books" data-section="books" className={s.wrap} style={{ paddingTop: 150 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: 24, flexWrap: "wrap" }}>
          <h2 className={s.h2} style={{ margin: 0, fontSize: 60 }}><Rich text={txt(S.books, "title")} em={s.em} /></h2>
          <div className={s.mono} style={{ fontSize: 12, color: "var(--dimmer)" }}>{products.length} {products.length === 1 ? "book" : "books"} · PDF · USD</div>
        </div>
        {!featured ? <p style={{ marginTop: 32, color: "var(--dim)" }}>No books for sale yet.</p> : (
          <SLink to={href(featured.id)} className={`${s.feat} ${s.ring} ${s.card}`}>
            <div className={s.featArt}><div className={s.cv} style={{ width: 230 }}><Cover product={featured} className={s.cover} fallbackClassName={s.coverFallback} /></div></div>
            <div className={s.featBody}>
              <div className={s.tags}>
                {rest.length > 0 && <span className={s.tagOn}>Start here</span>}
                {featured.pageCount > 0 && <span>{featured.pageCount} pages</span>}
                {ctx.chapters.length > 0 && <span>{ctx.chapters.length} chapters</span>}
              </div>
              <h3 className={s.d} style={{ margin: "22px 0 0", fontWeight: 800, fontSize: 46, lineHeight: 0.95, letterSpacing: "-.045em", color: "#fff" }}>{featured.title}</h3>
              {(featured.description || featured.subtitle) && <p style={{ margin: "16px 0 0", fontSize: 16.5, lineHeight: 1.6, color: "var(--dim)", maxWidth: 480 }}>{featured.description || featured.subtitle}</p>}
              <div className={s.ticks}>{lst(S.books, "bullets").map((b, i) => <div key={i}><i>✓</i>{b}</div>)}</div>
              <div style={{ flex: 1 }} />
              <div className={s.priceRow}>
                <span className={s.d} style={{ fontWeight: 800, fontSize: 44, letterSpacing: "-.04em", color: "#fff" }}>{ctx.price(featured)}</span>
                <span className={s.btn} style={{ padding: "15px 24px", fontSize: 15 }}>{txt(S.books, "button")}</span>
              </div>
            </div>
          </SLink>
        )}
        {rest.length > 0 && (
          <div className={s.two}>
            {rest.map((p, i) => (
              <SLink key={p.id} to={href(p.id)} className={`${s.panel} ${s.card} ${s.small}`}>
                <div className={s.smallStage} style={{ background: ["#17152A", "#2A1A14", "#14212A"][i % 3] }}><div className={s.cv}><Cover product={p} className={s.cover} fallbackClassName={s.coverFallback} /></div></div>
                <div style={{ minWidth: 0, flex: 1, paddingRight: 14 }}>
                  <div style={{ fontSize: 12.5, color: "var(--dimmer)" }}>{pagesLabel(p)}</div>
                  <h3 className={s.d} style={{ margin: "8px 0 0", fontWeight: 700, fontSize: 26, letterSpacing: "-.03em", color: "#fff" }}>{p.title}</h3>
                  {(p.description || p.subtitle) && <p style={{ margin: "8px 0 0", fontSize: 14.5, lineHeight: 1.55, color: "var(--dim)" }}>{p.description || p.subtitle}</p>}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 14 }}>
                    <span className={s.d} style={{ fontWeight: 800, fontSize: 26, color: "#fff" }}>{ctx.price(p)}</span>
                    <span style={{ width: 42, height: 42, borderRadius: "50%", background: "#22222A", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--accent)" }}>→</span>
                  </div>
                </div>
              </SLink>
            ))}
          </div>
        )}
      </section>

      {S.plan.enabled && itm(S.plan, "items").length > 0 && (
        <section id="plan" data-section="plan" className={s.wrap} style={{ paddingTop: 150 }}>
          <div className={s.eyebrow}>{txt(S.plan, "eyebrow")}</div>
          <h2 className={s.h2} style={{ fontSize: 52, marginBottom: 40 }}><Rich text={txt(S.plan, "title")} em={s.em} /></h2>
          <div className={s.weeks}>
            {itm(S.plan, "items").map((p, i) => (
              <div key={i} className={s.panel} style={{ borderRadius: 24, padding: 28 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
                  <span className={s.mono} style={{ fontSize: 12, padding: "5px 10px", borderRadius: 999, background: "var(--soft)", color: "var(--accent)" }}>{p.w}</span>
                  <span className={s.mono} style={{ fontSize: 11.5, color: "var(--dimmer)" }}>{p.pp}</span>
                </div>
                <div className={s.d} style={{ marginTop: 26, fontWeight: 700, fontSize: 26, letterSpacing: "-.03em", color: "#fff" }}>{p.t}</div>
                {p.d && <p style={{ margin: "10px 0 0", fontSize: 14.5, lineHeight: 1.6, color: "var(--dim)" }}>{p.d}</p>}
              </div>
            ))}
          </div>
        </section>
      )}

      {S.about.enabled && (txt(S.about, "text") || store.photoUrl) && (
        <section id="about" data-section="about" className={s.wrap} style={{ paddingTop: 150 }}>
          <div className={s.aboutGrid}>
            <div className={s.panel} style={{ borderRadius: 24, padding: 34, display: "flex", flexDirection: "column", justifyContent: "flex-end", minHeight: 300 }}>
              <div className={s.eyebrow}>{txt(S.about, "eyebrow")}</div>
              <p className={s.d} style={{ margin: "14px 0 0", fontWeight: 700, fontSize: 26, lineHeight: 1.15, letterSpacing: "-.025em", color: "#fff", whiteSpace: "pre-line" }}>{txt(S.about, "text")}</p>
            </div>
            {store.photoUrl && (
              <div style={{ borderRadius: 24, border: "1px solid var(--line)", overflow: "hidden", minHeight: 300, background: "linear-gradient(160deg, #2A2A34, #141419)" }}>
                <Photo url={store.photoUrl} alt={`Photo of ${ctx.who}`} className={s.photoFill} />
              </div>
            )}
            {socialLinks(ctx).length > 0 && (
              <div style={{ borderRadius: 24, background: "var(--accent)", color: "#0B0B0E", padding: 32, display: "flex", flexDirection: "column", justifyContent: "space-between", minHeight: 300 }}>
                <div style={{ fontWeight: 600, fontSize: 15 }}>{txt(S.about, "follow")}</div>
                <div className={s.d} style={{ display: "flex", flexDirection: "column", gap: 10, fontWeight: 700, fontSize: 24 }}>
                  {socialLinks(ctx).map((l) => <SLink key={l.label} to={l.href} style={{ color: "#0B0B0E", textDecoration: "none" }}>{l.label}{l.href.startsWith("http") ? " ↗" : ""}</SLink>)}
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {S.faq.enabled && itm(S.faq, "items").length > 0 && (
        <section id="faq" data-section="faq" className={s.wrap} style={{ paddingTop: 150, maxWidth: 860 }}>
          <h2 className={s.h2} style={{ margin: "0 0 32px", fontSize: 48 }}>{txt(S.faq, "title")}</h2>
          {itm(S.faq, "items").map((q, i) => (
            <details key={i} open={i === 0} className={`${s.panel} ${s.faqItem}`}>
              <summary>{q.q}<span className={s.plus}>+</span></summary>
              <p style={{ margin: "12px 0 0", fontSize: 16, lineHeight: 1.6, color: "var(--dim)" }}>{q.a}</p>
            </details>
          ))}
        </section>
      )}

      {S.closing.enabled ? (
        <section data-section="closing" className={s.wrap} style={{ paddingTop: 170, paddingBottom: 140, textAlign: "center" }}>
          <div aria-hidden className={s.glow} />
          <h2 className={s.h2} style={{ position: "relative", margin: "0 auto", maxWidth: 900, fontSize: 80, lineHeight: 0.92 }}><Rich text={txt(S.closing, "title")} em={s.em} /></h2>
          <div style={{ position: "relative", display: "flex", gap: 12, justifyContent: "center", marginTop: 40, flexWrap: "wrap" }}>
            {txt(S.closing, "primary") && <SLink to={book} className={s.btn}>{txt(S.closing, "primary")}</SLink>}
            {txt(S.closing, "secondary") && <a href="#books" className={`${s.glass} ${s.ghostBtn}`}>{txt(S.closing, "secondary")}</a>}
          </div>
        </section>
      ) : <div style={{ height: 120 }} />}

      <footer className={s.footer}>
        <div className={s.footIn}>
          <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
            <span>© {YEAR} {store.name}</span>
            <SLink to={`/store/${store.slug}/terms`}>Terms of sale</SLink>
            {store.contactEmail && <a href={`mailto:${store.contactEmail}`}>Contact</a>}
          </div>
          <SLink to="/" className={s.glass} style={{ textDecoration: "none", padding: "8px 14px", borderRadius: 999, fontSize: 13 }}>Made with Scrivetta</SLink>
        </div>
      </footer>
    </div>
  );
}

/** The last words of the headline, cycling in place. */
function RotatingWords({ words }: { words: string[] }) {
  const [i, setI] = useState(0);
  useEffect(() => {
    if (words.length < 2 || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = setInterval(() => setI((n) => (n + 1) % words.length), 2600);
    return () => clearInterval(id);
  }, [words.length]);
  return (
    <span className={s.words}>
      <span style={{ transform: `translateY(-${(i % words.length) * 100}%)` }}>
        {words.map((w, j) => <span key={j}>{w}</span>)}
      </span>
    </span>
  );
}
