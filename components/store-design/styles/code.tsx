"use client";

import { Fragment, useEffect, useState } from "react";
import type { PublicStoreProduct, StoreProfile } from "@/lib/types";
import { itm, lst, txt, type Ctx, type Item, type ResolvedSection } from "@/lib/store-design/core";
import { Cover, CustomCss, Photo, Rich, SLink, socialLinks, Unavailable, YEAR, initials, type StyleProps } from "../kit";
import s from "./code.module.css";

type Palette = { k: string; t: string; a: string; s: string; c: string; p: string };
/** The readable listing in "inside a chapter". */
const BRIGHT: Palette = { k: "#8EA9D8", t: "#B5C0CC", a: "#E3B873", s: "#A8C7A0", c: "#5C6672", p: "#D5DAE0" };
/** The faded code behind the hero book. */
const FADED: Palette = { k: "#4B5D80", t: "#5B6572", a: "#776745", s: "#4F6650", c: "#353C46", p: "#353D47" };

const KEYWORDS = new Set(
  ("abstract async await break case catch class const continue def default do else enum export extends false final finally for from " +
    "func function if implements import in interface let new nil none null override package private protected public return self " +
    "static struct super switch this throw throws true try type val var void while with yield fn pub use mut impl match select where " +
    "insert update delete create table values into and or not as is lambda elif except raise pass print").split(" "),
);

/** A tiny, language-agnostic highlighter: keywords, Types, @annotations, strings, numbers, comments. */
function highlight(line: string, c: Palette) {
  const out: { t: string; c: string }[] = [];
  const re = /(\/\/.*$|#(?![\w-]*\()(?=\s|$).*$|--\s.*$)|("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|`[^`]*`)|(@[A-Za-z_]\w*)|(\b\d[\d_.]*\b)|([A-Za-z_]\w*)|(\s+)|([^\sA-Za-z_\d"'`@]+)/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(line))) {
    if (m[1]) out.push({ t: m[1], c: c.c });
    else if (m[2]) out.push({ t: m[2], c: c.s });
    else if (m[3]) out.push({ t: m[3], c: c.a });
    else if (m[4]) out.push({ t: m[4], c: c.a });
    else if (m[5]) out.push({ t: m[5], c: KEYWORDS.has(m[5]) ? c.k : /^[A-Z]/.test(m[5]) ? c.t : c.p });
    else out.push({ t: m[0], c: c.p });
  }
  return out;
}

function Hl({ line, palette }: { line: string; palette: Palette }) {
  return <>{highlight(line, palette).map((tk, j) => <span key={j} style={{ color: tk.c }}>{tk.t}</span>)}</>;
}

/** "3-5, 9" → {3, 4, 5, 9}. */
function lineSet(spec: string | undefined): Set<number> {
  const out = new Set<number>();
  for (const part of (spec ?? "").split(/[,\s]+/)) {
    const m = part.match(/^(\d+)(?:[-–](\d+))?$/);
    if (!m) continue;
    const a = Number(m[1]);
    const b = Math.min(Number(m[2] ?? m[1]), a + 200);
    for (let i = a; i <= b; i++) out.add(i);
  }
  return out;
}

/** Text with `backticks` shown as code. */
function Ticks({ text }: { text: string }) {
  return (
    <>
      {text.split(/(`[^`\n]+`)/g).map((part, i) =>
        /^`[^`]+`$/.test(part) ? <code key={i} className={s.tick}>{part.slice(1, -1)}</code> : <Fragment key={i}>{part}</Fragment>,
      )}
    </>
  );
}

/** Code — concept 2: near-black, Geist, and a chapter explained line by line. */
export function CodeStyle({ t, ctx, href }: StyleProps) {
  const S = t.sections;
  const { store, products, featured } = ctx;
  const hero = S.hero;
  const book = featured ? href(featured.id) : "#books";
  const price = featured ? ctx.price(featured) : "";
  const notes = itm(S.inside, "notes").filter((x) => x.text?.trim());
  const faq = itm(S.faq, "items").filter((x) => x.q?.trim());
  const fileRows = itm(S.files, "rows").filter((x) => x.name?.trim());
  const tree = lst(S.files, "tree");
  const glance = itm(S.glance, "items").filter((x) => x.value?.trim() || x.label?.trim());
  const stack = lst(S.glance, "stack");
  const showGlance = S.glance.enabled && (glance.length > 0 || stack.length > 0);
  const showAbout = S.about.enabled && (!!txt(S.about, "quote") || !!txt(S.about, "text") || !!store.photoUrl);
  const showFaq = S.faq.enabled && faq.length > 0;
  const motion = t.decor !== "none";

  // Numbered section labels follow the sections that are shown.
  const order = [
    S.inside.enabled && "inside",
    S.files.enabled && (fileRows.length > 0 || tree.length > 0) && "files",
    "books",
    showAbout && "about",
    showFaq && "faq",
  ].filter((x): x is string => !!x);
  const num = (id: string) => nn(order.indexOf(id) + 1);

  return (
    <div className={`${s.root} ${motion ? s.motion : ""} store-page store-code`} style={{ "--accent": t.accent } as React.CSSProperties}>
      <CustomCss t={t} />
      <header className={s.header}>
        <div className={`${s.wrap} ${s.headerIn}`}>
          <a href="#top" className={s.brand}><Brand store={store} /></a>
          <nav className={s.nav} aria-label="Store">
            {order.includes("inside") && <a className={s.navLink} href="#inside">{txt(S.inside, "eyebrow") || "Inside"}</a>}
            {order.includes("files") && <a className={s.navLink} href="#download">{txt(S.files, "eyebrow") || "What you get"}</a>}
            <a className={s.navLink} href="#books">Books</a>
            {showFaq && <a className={s.navLink} href="#faq">FAQ</a>}
          </nav>
          {featured && <BuyButton to={book} label={txt(hero, "primary") || "Get the book"} price={price} small />}
        </div>
        <div aria-hidden className={s.progress} />
      </header>
      <div className={s.wrap}><Unavailable ctx={ctx} className={s.notice} /></div>

      <section id="top" data-section="hero" className={s.heroBand}>
        <div aria-hidden className={`${s.dots} ${s.dotsHero}`} />
        <div className={`${s.wrap} ${s.hero}`}>
          <div className={s.heroText}>
            {txt(hero, "badge") && (
              <SLink to={book} className={`${s.pill} ${s.ghostHover} ${s.rise}`}>
                {txt(hero, "badgeTag") && <span className={s.pillTag}><span className={s.pulse} />{txt(hero, "badgeTag")}</span>}
                {txt(hero, "badge")}<span className={s.arrow} aria-hidden>→</span>
              </SLink>
            )}
            <h1 className={`${s.h1} ${s.rise}`} style={{ animationDelay: ".08s" }}><Rich text={txt(hero, "headline")} em={s.em} /></h1>
            {txt(hero, "intro") && <p className={`${s.lead} ${s.rise}`} style={{ animationDelay: ".16s" }}>{txt(hero, "intro")}</p>}
            <div className={`${s.ctas} ${s.rise}`} style={{ animationDelay: ".24s" }}>
              {txt(hero, "primary") && <BuyButton to={book} label={txt(hero, "primary")} price={price} />}
              {txt(hero, "secondary") && (
                <a href={order.includes("inside") ? "#inside" : "#books"} className={s.ghost}><Rich text={txt(hero, "secondary")} em={s.em} /></a>
              )}
            </div>
            <div className={`${s.byline} ${s.rise}`} style={{ animationDelay: ".32s" }}>
              <Avatar store={store} who={ctx.who} />
              <div>Written by <span className={s.white}>{ctx.who}</span>{txt(hero, "byline") && <><br />{txt(hero, "byline")}</>}</div>
            </div>
          </div>

          {featured && (
            <div className={s.heroArt}>
              {motion && <HeroCode tabs={lst(hero, "tabs")} code={txt(hero, "code")} status={lst(hero, "status")} />}
              <div className={`${s.heroBookWrap} ${s.rise}`} style={{ animationDelay: ".2s" }}>
                <div aria-hidden className={s.bookShadow} />
                <div className={s.float}>
                  <SLink to={book} className={s.heroBook} label={`${featured.title} — view book`}>
                    <div aria-hidden className={s.edge} />
                    <BookCover product={featured} who={ctx.who} big />
                    <div aria-hidden className={s.sheen} />
                  </SLink>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {showGlance && (
        <section data-section="glance" aria-label="At a glance" className={s.glance}>
          {glance.length > 0 && (
            <div className={s.wrap}>
              <div className={s.stats} style={{ "--n": glance.length } as React.CSSProperties}>
                {glance.map((x, i) => <div key={i}><div className={s.statN}>{x.value}</div><div className={s.statL}>{x.label}</div></div>)}
              </div>
            </div>
          )}
          {stack.length > 0 && (
            <div className={`${s.wrap} ${s.stack}`} style={glance.length ? undefined : { borderTop: 0 }}>
              {txt(S.glance, "stackLabel") && <><span>{txt(S.glance, "stackLabel")}</span><span className={s.sep}>/</span></>}
              {stack.map((x, i) => <Fragment key={i}>{i > 0 && <span className={s.sep}>·</span>}<span className={s.stackItem}>{x}</span></Fragment>)}
            </div>
          )}
        </section>
      )}

      {order.includes("inside") && (
        <section id="inside" data-section="inside" className={`${s.wrap} ${s.section}`}>
          <Eyebrow n={num("inside")} label={txt(S.inside, "eyebrow")} />
          <div className={`${s.secHead} ${s.reveal}`}>
            <h2 className={s.h2}><Rich text={txt(S.inside, "title")} em={s.em} /></h2>
            {txt(S.inside, "text") && <p className={s.secText}>{txt(S.inside, "text")}</p>}
          </div>
          <Chapter sec={S.inside} notes={notes} />
          {itm(S.inside, "cards").length > 0 && (
            <div className={`${s.cards} ${s.reveal}`}>
              {itm(S.inside, "cards").map((c, i) => (
                <div key={i}>
                  {c.cmd && <div className={s.cmd}>{c.cmd}</div>}
                  <div className={s.cardT}>{c.title}</div>
                  {c.text && <div className={s.cardD}>{c.text}</div>}
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {order.includes("files") && (
        <section id="download" data-section="files" className={s.bandAlt}>
          <div className={`${s.wrap} ${s.section}`}>
            <Eyebrow n={num("files")} label={txt(S.files, "eyebrow")} />
            <div className={s.split}>
              <div className={`${s.splitText} ${s.reveal}`}>
                <h2 className={s.h2}><Rich text={txt(S.files, "title")} em={s.em} /></h2>
                {txt(S.files, "text") && <p className={s.secText}>{txt(S.files, "text")}</p>}
                {fileRows.length > 0 && (
                  <ul className={s.fileList}>
                    {fileRows.map((r, i) => (
                      <li key={i}><span className={s.ext}>{r.ext}</span><span className={s.fileName}>{r.name}</span><span className={s.size}>{r.size}</span></li>
                    ))}
                  </ul>
                )}
              </div>
              {tree.length > 0 && <TreeTerminal window={txt(S.files, "window")} root={txt(S.files, "root")} lines={tree} />}
            </div>
          </div>
        </section>
      )}

      <section id="books" data-section="books" className={s.ruled}>
        <div className={`${s.wrap} ${s.section}`}>
          <Eyebrow n={num("books")} label={txt(S.books, "eyebrow")} note={txt(S.books, "note")} />
          <h2 className={`${s.h2} ${s.reveal}`} style={{ marginBottom: 48 }}><Rich text={txt(S.books, "title")} em={s.em} /></h2>
          {products.length === 0 ? (
            <p className={s.secText}>No books for sale yet.</p>
          ) : (
            // One book gets a wide card, two or four a pair of columns, the rest rows of three.
            <div className={`${s.books} ${products.length === 1 ? s.booksOne : products.length === 2 || products.length === 4 ? s.booksTwo : ""}`}>
              {products.map((p, i) => (
                <BookCard key={p.id} p={p} ctx={ctx} to={href(p.id)} chapters={i === 0 ? ctx.chapters.length : 0}
                  tag={i === 0 && products.length > 1 ? txt(S.books, "tag") : ""} button={txt(S.books, "button")} />
              ))}
            </div>
          )}
        </div>
      </section>

      {showAbout && (
        <section id="about" data-section="about" className={s.ruled}>
          <div className={`${s.wrap} ${s.section}`}>
            <Eyebrow n={num("about")} label={txt(S.about, "eyebrow")} />
            <div className={`${s.author} ${s.reveal}`}>
              <div className={s.authorSide}>
                <div className={s.portrait}>
                  {store.photoUrl ? <Photo url={store.photoUrl} alt={`Photo of ${ctx.who}`} className={s.portraitImg} /> : <span className={s.portraitInit}>{initials(ctx.who)}</span>}
                </div>
                <div className={s.gitName}>$ git config user.name<br /><span className={s.white}>{ctx.who}</span></div>
              </div>
              <div className={s.authorMain}>
                {txt(S.about, "quote") && <p className={s.quote}><Rich text={txt(S.about, "quote")} em={s.em} /></p>}
                {txt(S.about, "text") && <p className={s.secText} style={{ whiteSpace: "pre-line" }}>{txt(S.about, "text")}</p>}
                {socialLinks(ctx).length > 0 && (
                  <div className={s.socials}>
                    {socialLinks(ctx).map((l) => (
                      <SLink key={l.kind} to={l.href} className={`${s.social} ${s.ghostHover}`}>
                        {l.label.toLowerCase()}{l.href.startsWith("http") && <span className={s.arrow} aria-hidden>↗</span>}
                      </SLink>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      )}

      {showFaq && (
        <section id="faq" data-section="faq" className={`${s.ruled} ${s.bandAlt}`}>
          <div className={`${s.wrap} ${s.section}`}>
            <Eyebrow n={num("faq")} label={txt(S.faq, "eyebrow")} />
            <div className={s.split}>
              <div className={`${s.faqSide} ${s.reveal}`}>
                <h2 className={s.h2}>{txt(S.faq, "title")}</h2>
                {store.contactEmail && <p className={s.secText}>Anything else? Write to <a className={s.mail} href={`mailto:${store.contactEmail}`}>{store.contactEmail}</a></p>}
              </div>
              <Faq items={faq} />
            </div>
          </div>
        </section>
      )}

      {S.closing.enabled && (
        <section data-section="closing" className={`${s.ruled} ${s.closingBand}`}>
          <div aria-hidden className={`${s.dots} ${s.dotsClosing}`} />
          <div className={`${s.wrap} ${s.closing}`}>
            <div className={`${s.closingText} ${s.reveal}`}>
              <h2 className={s.closingTitle}><Rich text={txt(S.closing, "title")} em={s.em} /></h2>
              {((featured && txt(S.closing, "primary")) || txt(S.closing, "secondary")) && (
                <div className={s.ctas}>
                  {featured && txt(S.closing, "primary") && <BuyButton to={book} label={txt(S.closing, "primary")} price={price} />}
                  {txt(S.closing, "secondary") && <a href="#books" className={s.ghost}>{txt(S.closing, "secondary")}</a>}
                </div>
              )}
              {lst(S.closing, "fine").length > 0 && <div className={s.fine}>{lst(S.closing, "fine").map((x, i) => <span key={i}>{x}</span>)}</div>}
            </div>
            {txt(S.closing, "terminal").trim() && <ShipTerminal window={txt(S.closing, "window")} code={txt(S.closing, "terminal")} />}
          </div>
        </section>
      )}

      <Footer store={store} products={products} href={href} text={txt(S.footer, "text")} faq={showFaq} />
    </div>
  );
}

// ---- Pieces --------------------------------------------------------------------

const nn = (n: number) => String(n).padStart(2, "0");

function Brand({ store }: { store: StoreProfile }) {
  return (
    <>
      {store.logoUrl ? <Photo url={store.logoUrl} alt="" className={s.mark} /> : <span className={s.mark}>{initials(store.name)}</span>}
      <span className={s.brandName}>{store.name}</span>
    </>
  );
}

function Avatar({ store, who }: { store: StoreProfile; who: string }) {
  return store.photoUrl
    ? <Photo url={store.photoUrl} alt="" className={s.avatar} />
    : <span className={s.avatar}>{initials(who)}</span>;
}

function BuyButton({ to, label, price, small }: { to: string; label: string; price: string; small?: boolean }) {
  return (
    <SLink to={to} className={`${s.btn} ${small ? s.btnSm : ""}`}>
      {label}{price && <span className={s.chip}>{price}</span>}
    </SLink>
  );
}

function Eyebrow({ n, label, note }: { n: string; label: string; note?: string }) {
  return (
    <div className={`${s.eyebrow} ${s.reveal}`}>
      <span className={s.accentText}>{n}</span>{label && <span>{label}</span>}<span className={s.rule} />{note && <span>{note}</span>}
    </div>
  );
}

/** The faded editor behind the hero book: decoration only, never scrolls. */
function HeroCode({ tabs, code, status }: { tabs: string[]; code: string; status: string[] }) {
  const lines = code.split("\n").slice(0, 24);
  const lastAdded = lines.reduce((at, l, i) => (l.startsWith("+") ? i : at), -1);
  // The highlight band steps through the first run of added lines (up to five), then starts over.
  const from = lines.findIndex((l) => l.startsWith("+"));
  let run = 0;
  while (from >= 0 && run < 5 && lines[from + run]?.startsWith("+")) run++;
  return (
    <div aria-hidden className={s.heroCode}>
      {tabs.length > 0 && (
        <div className={s.heroTabs}>{tabs.slice(0, 4).map((x, i) => <span key={i} className={i === 0 ? s.heroTabOn : ""}>{x}</span>)}</div>
      )}
      <div className={s.heroLines}>
        {run > 0 && <div className={s.band} style={{ top: 20 + from * 28 }} data-steps={run} />}
        {lines.map((raw, i) => {
          const plus = raw.startsWith("+");
          const line = plus ? raw.slice(1).replace(/^ /, "") : raw;
          return (
            <div key={i} className={s.cl}>
              <span className={s.ln}>{i + 1}</span>
              <span className={s.gm}>{plus ? "+" : ""}</span>
              {i === lastAdded ? (
                <span>{line.match(/^\s*/)![0]}<span className={s.type} style={{ "--chars": line.trim().length } as React.CSSProperties}>{line.trim()}</span><span className={s.caret} /></span>
              ) : (
                <span><Hl line={line} palette={FADED} /></span>
              )}
            </div>
          );
        })}
      </div>
      {status.length > 0 && (
        <div className={s.heroStatus}>{status.map((x, i) => <span key={i} className={i === status.length - 1 ? s.statusOn : ""}>{x}</span>)}</div>
      )}
    </div>
  );
}

/** A cover: the ebook's own image, or a typographic one in the style. */
function BookCover({ product, who, big }: { product: Pick<PublicStoreProduct, "coverUrl" | "title">; who?: string; big?: boolean }) {
  return (
    <div className={`${s.cover} ${big ? s.coverBig : ""}`}>
      <Cover product={product} className={s.coverImg} fallbackClassName={s.coverFallback} />
      {!product.coverUrl && (
        <div aria-hidden className={s.coverArt}>
          {big && who && <div className={s.coverWho}>{who}</div>}
          <div className={s.coverCmd}>$ open book<br /><span className={s.accentText}>ready</span></div>
          <div className={s.coverFoot}><div className={s.coverBar} /><div className={s.coverTitle}>{product.title}</div></div>
        </div>
      )}
      <div aria-hidden className={s.spine} />
    </div>
  );
}

/** "Inside a chapter": a page with notes, and the code they explain. Notes take turns; hover or click picks one. */
function Chapter({ sec, notes }: { sec: ResolvedSection; notes: Item[] }) {
  const [step, setStep] = useState(0);
  const [manual, setManual] = useState(false);
  const count = notes.length;
  useEffect(() => {
    if (manual || count < 2 || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = setInterval(() => setStep((x) => (x + 1) % count), 5200);
    return () => clearInterval(id);
  }, [manual, count]);
  const on = count ? step % count : -1;
  const pick = (i: number) => { setStep(i); setManual(true); };

  const sets = notes.map((n) => lineSet(n.lines));
  const firstOf = sets.map((set) => (set.size ? Math.min(...set) : -1));
  const lines = txt(sec, "code").split("\n");
  const anyLines = sets.some((x) => x.size > 0);

  return (
    <div className={`${s.chapter} ${s.reveal}`}>
      <div className={s.pagePane}>
        <div className={s.paneBar}>
          <span className={s.paneFile}><FileIcon />{txt(sec, "file")}</span><span>{txt(sec, "page")}</span>
        </div>
        <div className={s.pageBody}>
          {txt(sec, "label") && <div className={s.pageLabel}>{txt(sec, "label")}</div>}
          {txt(sec, "heading") && <h3 className={s.h3}>{txt(sec, "heading")}</h3>}
          {txt(sec, "pageText") && <p className={s.pageText}>{txt(sec, "pageText")}</p>}
          {notes.map((n, i) => (
            <button key={i} type="button" className={`${s.note} ${i === on ? s.noteOn : ""}`} aria-pressed={i === on}
              onClick={() => pick(i)} onMouseEnter={() => pick(i)} onFocus={() => pick(i)}>
              <span className={s.noteN}>{i + 1}</span>
              <span className={s.noteText}><Ticks text={n.text} /></span>
            </button>
          ))}
          {count > 1 && (
            <div className={s.steps}>
              {notes.map((_, i) => <span key={i} className={i === on ? s.stepOn : ""} />)}
              <span className={s.stepLabel}>note {on + 1} of {count}</span>
            </div>
          )}
        </div>
      </div>
      <div className={s.codePane}>
        <div className={`${s.paneBar} ${s.paneBarCode}`}>
          <span className={s.paneFile}><span className={s.fileDot} />{txt(sec, "codeFile")}</span><span className={s.panePath}>{txt(sec, "codePath")}</span>
        </div>
        <div className={`${s.listing} ${s.noBar}`}>
          {lines.map((line, i) => {
            const n = i + 1;
            const hit = on >= 0 && sets[on]?.has(n);
            const mark = firstOf.indexOf(n);
            return (
              <div key={i} className={`${s.row} ${hit ? s.rowOn : ""} ${anyLines && !hit ? s.rowDim : ""}`}>
                <span className={`${s.rowN} ${sets.some((x) => x.has(n)) ? s.rowNMarked : ""}`}>{n}</span>
                <span><Hl line={line} palette={BRIGHT} /></span>
                {mark >= 0 && <span className={s.rowMark}>{mark + 1}</span>}
              </div>
            );
          })}
        </div>
        {txt(sec, "test") && (
          <div className={s.testBar}><span className={s.accentText}>✓</span><span>{txt(sec, "test")}</span><span className={s.muted}>{txt(sec, "testResult")}</span></div>
        )}
      </div>
    </div>
  );
}

function TreeTerminal({ window: title, root, lines }: { window: string; root: string; lines: string[] }) {
  const rows = lines.map((raw) => {
    const hi = raw.startsWith(">");
    const body = hi ? raw.slice(1).replace(/^ /, "") : raw;
    const at = body.indexOf("#");
    return { hi, name: (at >= 0 ? body.slice(0, at) : body).replace(/\s+$/, ""), pad: at >= 0 ? body.slice(0, at).match(/\s*$/)![0] : "", note: at >= 0 ? body.slice(at) : "" };
  });
  const dirs = rows.filter((r) => r.name.endsWith("/")).length;
  const files = rows.length - dirs;
  return (
    <div className={`${s.term} ${s.reveal}`}>
      <TermBar title={title} />
      <div className={`${s.termBody} ${s.noBar}`}>
        <div><span className={s.accentText}>~</span> <span className={s.muted}>$</span> tree {root.replace(/\/$/, "")} -L 1</div>
        <div className={s.white}>{root}</div>
        {rows.map((r, i) => (
          <div key={i} className={r.hi ? s.treeOn : ""}>
            <span className={s.treeGlyph}>{i === rows.length - 1 ? "└── " : "├── "}</span>
            <span className={r.hi ? s.bright : ""}>{r.name}</span>{r.pad || (r.note ? "  " : "")}
            {r.note && <span className={r.hi ? s.accentText : s.comment}>{r.note}</span>}
          </div>
        ))}
        <div className={s.treeSum}>{dirs} {dirs === 1 ? "directory" : "directories"}, {files} {files === 1 ? "file" : "files"}</div>
      </div>
    </div>
  );
}

function ShipTerminal({ window: title, code }: { window: string; code: string }) {
  const lines = code.split("\n");
  return (
    <div className={s.term}>
      <TermBar title={title} />
      <div className={`${s.termBody} ${s.noBar}`}>
        {lines.map((l, i) => (
          <div key={i} className={s.termLine} style={{ "--i": i } as React.CSSProperties}>
            {l.startsWith("$") ? <><span className={s.muted}>$</span>{l.slice(1)}</> : <span className={/success|passed|✓/i.test(l) ? s.accentText : undefined}>{l}</span>}
          </div>
        ))}
        <div className={s.termLine} style={{ "--i": lines.length } as React.CSSProperties}><span className={s.muted}>$</span> <span className={s.caret} /></div>
      </div>
    </div>
  );
}

function TermBar({ title }: { title: string }) {
  return <div className={s.termBar}><span /><span /><span />{title && <span className={s.termTitle}>{title}</span>}</div>;
}

function BookCard({ p, ctx, to, chapters, tag, button }: { p: PublicStoreProduct; ctx: Ctx; to: string; chapters: number; tag: string; button: string }) {
  const rows = [
    p.pageCount > 0 ? ["pages", String(p.pageCount)] : null,
    chapters > 0 ? ["chapters", String(chapters)] : null,
    p.language ? ["language", p.language.toUpperCase()] : null,
    ["format", "pdf"],
  ].filter((x): x is string[] => !!x);
  return (
    <SLink to={to} className={`${s.card} ${s.reveal}`}>
      <div className={s.cardArt}>
        {tag && <span className={s.cardTag}>{tag}</span>}
        <div className={s.cardCover}><BookCover product={p} /></div>
      </div>
      <div className={s.cardBody}>
        <h3 className={s.cardTitle}>{p.title}</h3>
        {(p.description || p.subtitle) && <p className={s.cardDesc}>{p.description || p.subtitle}</p>}
        <dl className={s.facts}>{rows.map(([k, v]) => <div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}</dl>
        <div className={s.cardFoot}><span className={s.cardPrice}>{ctx.price(p)}</span>{button && <span className={s.cardLink}>{button}</span>}</div>
      </div>
    </SLink>
  );
}

function Faq({ items }: { items: Item[] }) {
  const [open, setOpen] = useState(0);
  return (
    <div className={`${s.faq} ${s.reveal}`}>
      {items.map((x, i) => (
        <div key={i} className={s.faqRow}>
          <button type="button" className={s.faqQ} aria-expanded={open === i} onClick={() => setOpen(open === i ? -1 : i)}>
            <span>{x.q}</span><span aria-hidden className={s.faqIcon}>+</span>
          </button>
          {open === i && x.a && <p className={s.faqA}>{x.a}</p>}
        </div>
      ))}
    </div>
  );
}

function Footer({ store, products, href, text, faq }: { store: StoreProfile; products: PublicStoreProduct[]; href: (id: string) => string; text: string; faq: boolean }) {
  return (
    <footer className={s.footer}>
      <div className={`${s.wrap} ${s.footTop}`}>
        <div className={s.footAbout}>
          <div className={s.brand}><Brand store={store} /></div>
          {text && <p>{text}</p>}
        </div>
        <div className={s.footCols}>
          {products.length > 0 && (
            <div className={s.footCol}>
              <div className={s.footHead}>books</div>
              {products.slice(0, 6).map((p) => <SLink key={p.id} to={href(p.id)} className={s.navLink}>{p.title}</SLink>)}
            </div>
          )}
          <div className={s.footCol}>
            <div className={s.footHead}>store</div>
            {faq && <a href="#faq" className={s.navLink}>FAQ</a>}
            <SLink to={`/store/${store.slug}/terms`} className={s.navLink}>Terms of sale</SLink>
            {store.contactEmail && <a href={`mailto:${store.contactEmail}`} className={s.navLink}>Contact</a>}
          </div>
        </div>
      </div>
      <div className={`${s.wrap} ${s.footBottom}`}>
        <span>© {YEAR} {store.name}</span>
        <SLink to="/" className={`${s.made} ${s.ghostHover}`}><span className={s.madeS}>S</span>Made with Scrivetta</SLink>
      </div>
    </footer>
  );
}

function FileIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M6 3h9l4 4v14H6z" /><path d="M14 3v5h5" />
    </svg>
  );
}
