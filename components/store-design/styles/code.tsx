"use client";

import { itm, lst, txt } from "@/lib/store-design/core";
import { Cover, CustomCss, Photo, Rich, SLink, socialLinks, Unavailable, YEAR, initials, pagesLabel, type StyleProps } from "../kit";
import s from "./code.module.css";

const C = { k: "#C4A7FF", t: "#8AB4FF", s: "#A8E3B5", a: "#F5C88A", c: "#5B6573", p: "#D7DEE7" };
const KEYWORDS = new Set(
  ("abstract async await break case catch class const continue def default do else enum export extends false final finally for from " +
    "func function if implements import in interface let new nil none null override package private protected public return self " +
    "static struct super switch this throw throws true try type val var void while with yield fn pub use mut impl match select where " +
    "insert update delete create table values into and or not as is lambda elif except raise pass print").split(" "),
);

/** A tiny, language-agnostic highlighter: keywords, Types, @annotations, strings, numbers, comments. */
function highlight(line: string): { t: string; c: string }[] {
  const out: { t: string; c: string }[] = [];
  const re = /(\/\/.*$|#(?![\w-]*\()(?=\s|$).*$|--\s.*$)|("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|`[^`]*`)|(@[A-Za-z_]\w*)|(\b\d[\d_.]*\b)|([A-Za-z_]\w*)|(\s+)|([^\sA-Za-z_\d"'`@]+)/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(line))) {
    if (m[1]) out.push({ t: m[1], c: C.c });
    else if (m[2]) out.push({ t: m[2], c: C.s });
    else if (m[3]) out.push({ t: m[3], c: C.a });
    else if (m[4]) out.push({ t: m[4], c: C.a });
    else if (m[5]) out.push({ t: m[5], c: KEYWORDS.has(m[5].toLowerCase()) && m[5] === m[5].toLowerCase() ? C.k : /^[A-Z]/.test(m[5]) ? C.t : C.p });
    else out.push({ t: m[0], c: m[7] ? "#8B95A3" : C.p });
  }
  return out;
}

/** Sidebar lines: "  " = indented file; the first indented line is the open one. */
function tree(lines: string[]) {
  let activeDone = false;
  return lines.map((raw, i) => {
    const indented = /^\s{2,}/.test(raw);
    const nextIndented = !indented && /^\s{2,}/.test(lines[i + 1] ?? "");
    const active = indented && !activeDone;
    if (active) activeDone = true;
    return { name: raw.trim(), indented, open: nextIndented, active };
  });
}

/** Code — concept 2: dark, technical, an editor window with the author's own code. */
export function CodeStyle({ t, ctx, href }: StyleProps) {
  const S = t.sections;
  const { store, products, featured } = ctx;
  const rest = products.slice(1);
  const hero = S.hero;
  const ed = S.editor;
  const codeLines = txt(ed, "code").split("\n");
  const firstAdded = codeLines.findIndex((l) => l.startsWith("+"));
  const stream = (txt(ed, "code") + "\n\n" + txt(S.build, "shipCode") + "\n\n").repeat(4);
  const book = featured ? href(featured.id) : "#books";

  return (
    <div className={`${s.root} store-page store-code`} style={{ "--accent": t.accent } as React.CSSProperties}>
      <CustomCss t={t} />
      {t.decor === "beams" && (
        <div aria-hidden>
          <div className={s.spot} />
          <div className={s.floor} />
          {["12%", "31%", "69%", "88%"].map((l, i) => <div key={l} className={s.beam} style={{ left: l, animationDelay: `${[0, 2.4, 1.1, 3.6][i]}s` }} />)}
        </div>
      )}
      {t.decor === "stream" && (
        <div aria-hidden>
          <div className={s.spot} />
          <div className={s.stream} style={{ left: "2%" }}><pre>{stream}</pre></div>
          <div className={s.stream} style={{ right: "1%" }}><pre style={{ animationDuration: "90s", animationDirection: "reverse" }}>{stream.split("\n").reverse().join("\n")}</pre></div>
        </div>
      )}

      <header className={s.header}>
        <div className={s.headerIn}>
          <a href="#top" className={s.brand}>
            {store.logoUrl ? <Photo url={store.logoUrl} alt="" className={s.logo} /> : <span className={s.logo}>{initials(store.name)}</span>}
            <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{store.name}</span>
          </a>
          <nav className={s.nav} aria-label="Store">
            <a href="#books">Books</a>
            {S.build.enabled && <a href="#build">What you build</a>}
            {S.contents.enabled && itm(S.contents, "items").length > 0 && <a href="#inside">Contents</a>}
            {S.faq.enabled && <a href="#faq">FAQ</a>}
          </nav>
          <SLink to={book} className={s.headBtn}>Get the book</SLink>
        </div>
      </header>
      <Unavailable ctx={ctx} className={s.notice} />

      <section id="top" data-section="hero" className={s.wrap} style={{ paddingTop: 110, textAlign: "center" }}>
        {txt(hero, "badge") && (
          <a href="#books" className={s.pill}>
            <span className={`${s.mono} ${s.pillTag}`}>{txt(hero, "badgeTag")}</span>{txt(hero, "badge")}<span style={{ color: "var(--dimmer)" }}>→</span>
          </a>
        )}
        <h1 className={`${s.h1} ${s.h}`}><Rich text={txt(hero, "headline")} em={s.em} /></h1>
        {txt(hero, "intro") && <p className={s.lead}>{txt(hero, "intro")}</p>}
        <div className={s.ctas}>
          {txt(hero, "primary") && <SLink to={book} className={s.btn}>{txt(hero, "primary")}</SLink>}
          {txt(hero, "secondary") && <a href={S.contents.enabled ? "#inside" : "#books"} className={s.ghost}>{txt(hero, "secondary")}</a>}
        </div>

        {ed.enabled && (
          <div style={{ position: "relative", margin: "84px auto 0", maxWidth: 1120, textAlign: "left" }}>
            <div aria-hidden style={{ position: "absolute", inset: "-1px -1px auto -1px", height: 1, background: "linear-gradient(90deg, transparent, var(--mid), transparent)", zIndex: 2 }} />
            <div className={s.win}>
              <div className={s.titlebar}>
                <div className={s.dots}><span /><span /><span /></div>
                <div className={s.mono} style={{ flex: 1, textAlign: "center", fontSize: 12, color: "var(--dimmer)" }}>{txt(ed, "window")}</div>
              </div>
              <div className={s.ide}>
                <div className={s.side}>
                  <div className={s.mono} style={{ padding: "0 8px 10px", fontSize: 10.5, letterSpacing: ".12em", color: "var(--dimmer)" }}>CHAPTERS</div>
                  {tree(lst(ed, "tree")).map((n, i) => (
                    <div key={i} className={`${s.mono} ${s.node}`} style={{ paddingLeft: n.indented ? 28 : 8, background: n.active ? "rgba(255,255,255,.06)" : "transparent", color: n.active ? "#fff" : n.indented || n.open ? "var(--text)" : "var(--dim)" }}>
                      <span style={{ width: 10, fontSize: 10, color: "var(--dimmer)" }}>{n.indented ? "·" : n.open ? "⌄" : "›"}</span>{n.name}
                    </div>
                  ))}
                </div>
                <div style={{ minWidth: 0, display: "flex", flexDirection: "column" }}>
                  <div className={s.tabs}>
                    {lst(ed, "tabs").map((tab, i) => <div key={i} className={`${s.mono} ${s.tab} ${i === 0 ? s.tabOn : ""}`}>{tab}</div>)}
                  </div>
                  <div className={s.codeArea}>
                    {codeLines.map((raw, i) => {
                      const added = raw.startsWith("+");
                      const line = added ? raw.slice(1).replace(/^ /, "") : raw;
                      return (
                        <div key={i} className={`${s.mono} ${s.ln} ${added ? s.add : ""}`}>
                          <span>{i + 1}</span><span>{added ? "+" : " "}</span>
                          <span>{highlight(line).map((tk, j) => <span key={j} style={{ color: tk.c }}>{tk.t}</span>)}</span>
                        </div>
                      );
                    })}
                    {txt(ed, "callout") && firstAdded >= 0 && (
                      <div className={s.callout} style={{ top: 16 + firstAdded * 25 }}><span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--accent)" }} />{txt(ed, "callout")}</div>
                    )}
                  </div>
                  {txt(ed, "terminal") && (
                    <div className={s.term}>
                      <div className={`${s.mono} ${s.termTabs}`}><span>TERMINAL</span><span>PROBLEMS</span><span>TESTS</span></div>
                      <div className={`${s.mono} ${s.termBody}`}>
                        {txt(ed, "terminal").split("\n").map((l, i) => (
                          <div key={i}>
                            {l.startsWith("$") ? <><span style={{ color: "var(--accent)" }}>→</span> <span style={{ color: "var(--white)" }}>{l.replace(/^\$\s?/, "")}</span></>
                              : <span style={{ color: /success|passed|ok\b|✓/i.test(l) ? "#A8E3B5" : undefined }}>{l}</span>}
                          </div>
                        ))}
                        <div><span style={{ color: "var(--accent)" }}>→</span> <span className={s.caret} /></div>
                      </div>
                    </div>
                  )}
                  <div className={`${s.mono} ${s.status}`}><span><span style={{ color: "var(--accent)" }}>●</span> {txt(ed, "statusLeft")}</span><span className={s.hideM}>{txt(ed, "statusRight")}</span></div>
                </div>
              </div>
            </div>
          </div>
        )}
      </section>

      {S.stack.enabled && lst(S.stack, "items").length > 0 && (
        <section data-section="stack" className={s.wrap} style={{ paddingTop: 72 }}>
          <div className={`${s.mono} ${s.stack}`}>
            <span style={{ color: "#3A414B" }}>{txt(S.stack, "label")}</span>
            {lst(S.stack, "items").map((x, i) => <span key={i}>{x}</span>)}
          </div>
        </section>
      )}

      {S.build.enabled && (
        <section id="build" data-section="build" className={s.wrap} style={{ paddingTop: 150 }}>
          <div className={s.eyebrow}>{txt(S.build, "eyebrow")}</div>
          <h2 className={`${s.h2} ${s.h}`} style={{ maxWidth: 680 }}><Rich text={txt(S.build, "title")} em={s.em} /></h2>
          <div className={s.bento}>
            <div className={`${s.panel} ${s.bcard} ${s.span2}`} style={{ minHeight: 300, display: "flex", flexDirection: "column" }}>
              <div className={s.bTitle}>{txt(S.build, "flowTitle")}</div>
              <div className={s.bText}>{txt(S.build, "flowText")}</div>
              <div className={s.flow}>
                {lst(S.build, "flow").map((n, i, a) => (
                  <span key={i} style={{ display: "contents" }}>
                    <div className={`${s.mono} ${s.flowNode} ${i === 1 ? s.flowOn : ""}`}>{n}</div>
                    {i < a.length - 1 && <div className={s.flowLine} />}
                  </span>
                ))}
              </div>
              <div className={s.mono} style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 24, fontSize: 11.5, color: "var(--dim)" }}>
                {lst(S.build, "chips").map((c, i) => <span key={i} className={s.tag}>{c}</span>)}
              </div>
            </div>
            <div className={`${s.panel} ${s.bcard}`} style={{ minHeight: 300 }}>
              <div className={s.bTitle}>{txt(S.build, "commitsTitle")}</div>
              <div className={s.bText}>{txt(S.build, "commitsText")}</div>
              <div style={{ marginTop: 22 }}>
                {itm(S.build, "commits").map((c, i) => (
                  <div key={i} className={`${s.mono} ${s.commit}`}>
                    <span style={{ width: 7, height: 7, borderRadius: "50%", border: `1.5px solid ${i === 0 ? "var(--accent)" : "var(--dimmer)"}`, flexShrink: 0 }} />
                    <span style={{ color: "var(--dimmer)" }}>{c.h}</span>
                    <span style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{c.m}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className={`${s.panel} ${s.bcard}`}>
              <div className={s.bTitle}>{txt(S.build, "testsTitle")}</div>
              <div className={s.bText}>{txt(S.build, "testsText")}</div>
              <div aria-hidden className={s.tests}>{Array.from({ length: 42 }, (_, i) => <span key={i} style={{ opacity: 0.35 + ((i * 37) % 10) / 16 }} />)}</div>
              <div className={s.mono} style={{ marginTop: 14, fontSize: 12, color: "var(--accent)" }}>{txt(S.build, "testsLabel")}</div>
            </div>
            <div className={`${s.panel} ${s.bcard}`}>
              <div className={s.bTitle}>{txt(S.build, "shipTitle")}</div>
              <div className={s.bText}>{txt(S.build, "shipText")}</div>
              <pre className={`${s.mono} ${s.pre}`}>
                {txt(S.build, "shipCode").split("\n").map((l, i) => <div key={i}>{highlight(l).map((tk, j) => <span key={j} style={{ color: tk.c }}>{tk.t}</span>)}</div>)}
              </pre>
            </div>
            <div className={`${s.panel} ${s.bcard}`}>
              <div className={s.bTitle}>{txt(S.build, "noteTitle")}</div>
              <div className={s.bText}>{txt(S.build, "noteText")}</div>
              <div style={{ marginTop: 22, borderRadius: 10, border: "1px solid var(--line)", background: "#0A0C0F", padding: "14px 16px" }}>
                <div className={s.mono} style={{ fontSize: 12, color: "#F5C88A" }}>{txt(S.build, "noteCode")}</div>
                <div style={{ marginTop: 10, paddingLeft: 12, boxShadow: "inset 2px 0 0 var(--accent)", fontSize: 13, lineHeight: 1.5, color: "var(--dim)" }}>{txt(S.build, "noteBody")}</div>
              </div>
            </div>
          </div>
        </section>
      )}

      <section id="books" data-section="books" className={s.wrap} style={{ paddingTop: 160 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: 24, flexWrap: "wrap" }}>
          <div>
            <div className={s.eyebrow}>{txt(S.books, "eyebrow")}</div>
            <h2 className={`${s.h2} ${s.h}`}><Rich text={txt(S.books, "title")} em={s.em} /></h2>
          </div>
          <div className={s.mono} style={{ fontSize: 12, color: "var(--dimmer)" }}>{products.length} {products.length === 1 ? "book" : "books"} · PDF · USD</div>
        </div>
        {!featured ? <p style={{ marginTop: 32, color: "var(--dim)" }}>No books for sale yet.</p> : (
          <SLink to={href(featured.id)} className={`${s.feat} ${s.ring} ${s.cardHover}`}>
            <div className={s.featArt}>
              <div aria-hidden className={s.grid} />
              <div className={s.book} style={{ width: 236 }}>
                <div className={s.edge} />
                <Cover product={featured} className={s.cover} fallbackClassName={s.coverFallback} />
              </div>
            </div>
            <div className={s.featBody}>
              <div className={`${s.mono} ${s.chips}`}>
                {rest.length > 0 && <span className={s.chipOn}>Start here</span>}
                <span>{pagesLabel(featured)}</span>
                {ctx.chapters.length > 0 && <span>{ctx.chapters.length} chapters</span>}
              </div>
              <h3 style={{ margin: "22px 0 0", fontSize: 34, lineHeight: 1.1, fontWeight: 600, letterSpacing: "-.03em", color: "#fff" }}>{featured.title}</h3>
              {(featured.description || featured.subtitle) && <p style={{ margin: "14px 0 0", fontSize: 16, lineHeight: 1.65, color: "var(--dim)", maxWidth: 520 }}>{featured.description || featured.subtitle}</p>}
              <div className={s.checks}>
                {lst(S.books, "bullets").map((b, i) => (
                  <div key={i}><svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden><path d="M3 8.5l3 3 7-7" /></svg>{b}</div>
                ))}
              </div>
              <div style={{ flex: 1 }} />
              <div className={s.priceRow}>
                <div><span style={{ fontSize: 34, fontWeight: 600, letterSpacing: "-.03em", color: "#fff" }}>{ctx.price(featured)}</span><span className={s.mono} style={{ marginLeft: 10, fontSize: 12, color: "var(--dimmer)" }}>one-time</span></div>
                <span className={s.btn} style={{ padding: "13px 20px" }}>{txt(S.books, "button")}</span>
              </div>
            </div>
          </SLink>
        )}
        {rest.length > 0 && (
          <div className={s.two}>
            {rest.map((p) => (
              <SLink key={p.id} to={href(p.id)} className={`${s.panel} ${s.cardHover} ${s.small}`}>
                <div className={s.book} style={{ width: 120, flexShrink: 0 }}><Cover product={p} className={s.cover} fallbackClassName={s.coverFallback} /></div>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div className={s.mono} style={{ fontSize: 11.5, color: "var(--dimmer)" }}>{pagesLabel(p)}</div>
                  <h3 style={{ margin: "8px 0 0", fontSize: 21, fontWeight: 600, letterSpacing: "-.02em", color: "#fff" }}>{p.title}</h3>
                  {(p.description || p.subtitle) && <p style={{ margin: "8px 0 0", fontSize: 14.5, lineHeight: 1.6, color: "var(--dim)" }}>{p.description || p.subtitle}</p>}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 16 }}><span style={{ fontSize: 22, fontWeight: 600, color: "#fff" }}>{ctx.price(p)}</span><span style={{ fontSize: 14 }}>View →</span></div>
                </div>
              </SLink>
            ))}
          </div>
        )}
      </section>

      {S.contents.enabled && itm(S.contents, "items").length > 0 && (
        <section id="inside" data-section="contents" className={s.wrap} style={{ paddingTop: 160 }}>
          <div className={s.toc}>
            <div>
              <div className={s.eyebrow}>{txt(S.contents, "eyebrow")}</div>
              <h2 className={`${s.h2} ${s.h}`} style={{ fontSize: 40 }}><Rich text={txt(S.contents, "title")} em={s.em} /></h2>
              {txt(S.contents, "text") && <p style={{ margin: "16px 0 0", fontSize: 15, lineHeight: 1.65, color: "var(--dim)" }}>{txt(S.contents, "text")}</p>}
            </div>
            <div style={{ borderTop: "1px solid var(--line)" }}>
              {itm(S.contents, "items").map((c, i) => (
                <div key={i} className={s.tocRow}>
                  <span className={s.mono} style={{ fontSize: 13, color: "var(--accent)" }}>{c.n}</span>
                  <div><div style={{ fontSize: 17, fontWeight: 500, color: "var(--white)" }}>{c.t}</div>{c.d && <div style={{ marginTop: 4, fontSize: 14, color: "var(--dim)" }}>{c.d}</div>}</div>
                  <span className={s.mono} style={{ fontSize: 12, color: "var(--dimmer)" }}>{c.p}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {S.about.enabled && (txt(S.about, "text") || store.photoUrl) && (
        <section id="about" data-section="about" className={s.wrap} style={{ paddingTop: 160 }}>
          <div className={`${s.panel} ${s.about}`}>
            <Photo url={store.photoUrl} alt={`Photo of ${ctx.who}`} className={s.avatar} />
            <div style={{ flex: "1 1 420px", minWidth: 0 }}>
              <div className={s.eyebrow}>{txt(S.about, "eyebrow")}</div>
              <div style={{ marginTop: 10, fontSize: 26, fontWeight: 600, letterSpacing: "-.02em", color: "#fff" }}>{txt(S.about, "title")}</div>
              <p style={{ margin: "10px 0 0", fontSize: 16, lineHeight: 1.65, color: "var(--dim)", maxWidth: 640, whiteSpace: "pre-line" }}>{txt(S.about, "text")}</p>
            </div>
            <div className={s.mono} style={{ display: "flex", gap: 10, flexWrap: "wrap", fontSize: 13 }}>
              {socialLinks(ctx).map((l) => <SLink key={l.label} to={l.href} className={s.ghost} style={{ padding: "9px 14px", fontSize: 13 }}>{l.label}{l.href.startsWith("http") ? " ↗" : ""}</SLink>)}
            </div>
          </div>
        </section>
      )}

      {S.faq.enabled && itm(S.faq, "items").length > 0 && (
        <section id="faq" data-section="faq" className={s.wrap} style={{ paddingTop: 160 }}>
          <div className={s.eyebrow}>{txt(S.faq, "eyebrow")}</div>
          <h2 className={`${s.h2} ${s.h}`} style={{ fontSize: 40, marginBottom: 40 }}>{txt(S.faq, "title")}</h2>
          <div className={s.faq}>
            {itm(S.faq, "items").map((q, i) => (
              <div key={i}><div style={{ fontSize: 16, fontWeight: 500, color: "var(--white)" }}>{q.q}</div><p style={{ margin: "8px 0 0", fontSize: 14.5, lineHeight: 1.65, color: "var(--dim)" }}>{q.a}</p></div>
            ))}
          </div>
        </section>
      )}

      {S.closing.enabled ? (
        <section data-section="closing" className={s.wrap} style={{ paddingTop: 160, paddingBottom: 140, textAlign: "center" }}>
          <div aria-hidden className={s.glow} />
          <h2 className={`${s.h2} ${s.h}`} style={{ position: "relative", margin: "0 auto", maxWidth: 760, fontSize: 56, lineHeight: 1.04 }}><Rich text={txt(S.closing, "title")} em={s.em} /></h2>
          <div className={s.ctas} style={{ position: "relative", marginTop: 36 }}>
            {txt(S.closing, "primary") && <SLink to={book} className={s.btn}>{txt(S.closing, "primary")}</SLink>}
            {txt(S.closing, "secondary") && <a href="#books" className={s.ghost}>{txt(S.closing, "secondary")}</a>}
          </div>
          {txt(S.closing, "fine") && <div className={s.mono} style={{ position: "relative", marginTop: 22, fontSize: 12, color: "var(--dimmer)" }}>{txt(S.closing, "fine")}</div>}
        </section>
      ) : <div style={{ height: 120 }} />}

      <footer className={s.footer}>
        <div className={s.footIn}>
          <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
            <span>© {YEAR} {store.name}</span>
            <SLink to={`/store/${store.slug}/terms`}>Terms of sale</SLink>
            {store.contactEmail && <a href={`mailto:${store.contactEmail}`}>Contact</a>}
          </div>
          <SLink to="/" className={s.made}><span style={{ fontFamily: "Georgia, serif", fontStyle: "italic" }}>S</span>Made with Scrivetta</SLink>
        </div>
      </footer>
    </div>
  );
}
