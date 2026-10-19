"use client";

import type { PublicStoreProduct, StoreProfile } from "@/lib/types";
import { itm, lst, txt } from "@/lib/store-design/core";
import { Cover, CustomCss, Photo, Rich, SLink, SocialIcon, socialLinks, Unavailable, YEAR, initials, type StyleProps } from "../kit";
import s from "./literary.module.css";

/** Scrivetta (literary) — concept 1: warm paper, a quiet serif and books on a shelf. */
export function LiteraryStyle({ t, ctx, href }: StyleProps) {
  const S = t.sections;
  const { store, products, featured } = ctx;
  const hero = S.hero;
  const tag = txt(hero, "badgeTag");
  const book = featured ? href(featured.id) : "#books";
  const steps = itm(S.strip, "items").filter((x) => x.label?.trim() || x.text?.trim());
  const faq = itm(S.faq, "items").filter((x) => x.q?.trim());
  const socials = socialLinks(ctx);
  const showAbout = S.about.enabled && (!!txt(S.about, "text") || !!store.photoUrl);
  const icons = [DownloadIcon, PageIcon, LockIcon];

  return (
    <div className={`${s.root} store-page store-literary`} style={{ "--accent": t.accent } as React.CSSProperties}>
      <CustomCss t={t} />
      <header className={s.header}>
        <div className={`${s.wrap} ${s.headerIn}`}>
          <a href="#top" className={s.brand}><Brand store={store} /></a>
          <nav className={s.nav} aria-label="Store">
            <a className={s.navLink} href="#books">Books</a>
            {S.read.enabled && <a className={s.navLink} href="#read">Read a sample</a>}
            {showAbout && <a className={s.navLink} href="#about">About</a>}
            {S.faq.enabled && faq.length > 0 && <a className={s.navLink} href="#faq">FAQ</a>}
          </nav>
          {featured && <SLink to={book} className={`${s.btn} ${s.headBtn}`}>Buy · {ctx.price(featured)}</SLink>}
        </div>
      </header>
      <div className={s.wrap}><Unavailable ctx={ctx} className={s.notice} /></div>

      <section id="top" data-section="hero" className={`${s.wrap} ${s.hero}`}>
        <div className={s.heroText}>
          {txt(hero, "eyebrow") && <div className={s.eyebrow}>{txt(hero, "eyebrow")}</div>}
          <h1 className={s.h1}><Rich text={txt(hero, "headline")} em={s.em} /></h1>
          {txt(hero, "intro") && <p className={s.lead}>{txt(hero, "intro")}</p>}
          {(txt(hero, "primary") || txt(hero, "secondary")) && (
            <div className={s.ctas}>
              {txt(hero, "primary") && <SLink to={book} className={s.btn}>{txt(hero, "primary")}</SLink>}
              {txt(hero, "secondary") && <a href={S.read.enabled ? "#read" : "#books"} className={s.link}>{txt(hero, "secondary")}</a>}
            </div>
          )}
          {lst(hero, "trust").length > 0 && (
            <ul className={s.trust}>
              {lst(hero, "trust").map((x, i) => {
                const Icon = icons[i % icons.length];
                return <li key={i}><Icon />{x}</li>;
              })}
            </ul>
          )}
        </div>
        {featured && (
          <div className={s.heroArt}>
            <SLink to={book} className={`${s.stage} ${s.heroStage} ${s.lift}`} label={`${featured.title} — ${ctx.price(featured)}`}>
              <div className={`${s.heroBook} ${s.bookMove}`}><Book product={featured} edge /></div>
            </SLink>
            <div className={s.caption}>
              <span>{tag && <span className={s.tag}>{tag}</span>}{[featured.title, pages(featured)].filter(Boolean).join(" · ")}</span>
              <span className={s.captionPrice}>{ctx.price(featured)}</span>
            </div>
          </div>
        )}
      </section>

      {S.strip.enabled && steps.length > 0 && (
        <section data-section="strip" aria-label="How buying works" className={s.stepsBand}>
          <ol className={`${s.wrap} ${s.steps}`} style={{ "--n": steps.length } as React.CSSProperties}>
            {steps.map((x, i) => (
              <li key={i}>
                <span className={s.stepN}>{i + 1}</span>
                <div><div className={s.stepT}>{x.label}</div>{x.text && <div className={s.stepD}>{x.text}</div>}</div>
              </li>
            ))}
          </ol>
        </section>
      )}

      <section id="books" data-section="books" className={`${s.wrap} ${s.section}`}>
        <div className={s.secHead}>
          <h2 className={s.h2}><Rich text={txt(S.books, "title")} em={s.em} /></h2>
          <span className={s.secNote}>
            {[products.length > 0 ? `${products.length} ${products.length === 1 ? "title" : "titles"}` : null, txt(S.books, "note")].filter(Boolean).join(" · ")}
          </span>
        </div>
        {products.length === 0 ? (
          <p className={s.small}>No books for sale yet.</p>
        ) : (
          // One book gets a wide card, two or four a pair of columns, the rest a shelf of three.
          <div className={`${s.books} ${products.length === 1 ? s.booksOne : products.length === 2 || products.length === 4 ? s.booksTwo : ""}`}>
            {products.map((p, i) => (
              <SLink key={p.id} to={href(p.id)} className={`${s.bookCard} ${s.lift}`}>
                <div className={`${s.stage} ${s.bookStage}`}>
                  <div className={`${s.book} ${s.bookMove}`}><Cover product={p} className={s.cover} fallbackClassName={s.coverFallback} /></div>
                </div>
                <div className={s.bookInfo}>
                  <div className={s.bookTop}>
                    <h3 className={s.bookTitle}>{p.title}</h3>
                    <span className={s.bookPrice}>{ctx.price(p)}</span>
                  </div>
                  {(p.description || p.subtitle) && <p className={s.bookDesc}>{p.description || p.subtitle}</p>}
                  <div className={s.bookMeta}>
                    {i === 0 && tag && products.length > 1 && <span className={s.tag}>{tag}</span>}
                    {[pages(p), p.language?.toUpperCase()].filter(Boolean).join(" · ")}
                  </div>
                  {products.length === 1 && <span className={`${s.btn} ${s.bookBtn}`}>See the book →</span>}
                </div>
              </SLink>
            ))}
          </div>
        )}
      </section>

      {S.read.enabled && (
        <section id="read" data-section="read" className={s.band}>
          <div className={`${s.wrap} ${s.section} ${s.readIn}`}>
            <div className={s.center}>
              {txt(S.read, "eyebrow") && <div className={s.eyebrow}>{txt(S.read, "eyebrow")}</div>}
              <h2 className={s.h2}><Rich text={txt(S.read, "title")} em={s.em} /></h2>
            </div>
            <div className={s.spread}>
              <div className={`${s.leaf} ${s.leafL}`}>
                <div className={s.runHead}>{txt(S.read, "leftLabel")}</div>
                <h3 className={s.leafTitle}>{txt(S.read, "leftTitle")}</h3>
                <p className={s.leafText}>{txt(S.read, "leftText")}</p>
                <div className={s.folio}>{txt(S.read, "leftPage")}</div>
              </div>
              <div className={`${s.leaf} ${s.leafR}`}>
                <div className={s.runHead} style={{ textAlign: "right" }}>{txt(S.read, "rightLabel")}</div>
                <h3 className={s.leafTitle}>{txt(S.read, "rightTitle")}</h3>
                <p className={s.leafText}>{txt(S.read, "rightText")}</p>
                <div className={s.folio}>{txt(S.read, "rightPage")}</div>
              </div>
            </div>
            {(txt(S.read, "button") || txt(S.read, "link")) && (
              <div className={s.ctas} style={{ justifyContent: "center", paddingTop: 0 }}>
                {txt(S.read, "button") && <SLink to={book} className={s.btn}>{txt(S.read, "button")}</SLink>}
                {txt(S.read, "link") && <SLink to={book} className={s.link}>{txt(S.read, "link")}</SLink>}
              </div>
            )}
          </div>
        </section>
      )}

      {showAbout && (
        <section id="about" data-section="about" className={`${s.wrap} ${s.section} ${s.author}`}>
          {store.photoUrl && <Photo url={store.photoUrl} alt={`Photo of ${ctx.who}`} className={s.portrait} />}
          <div className={s.authorText}>
            {txt(S.about, "eyebrow") && <div className={s.eyebrow}>{txt(S.about, "eyebrow")}</div>}
            <h2 className={s.h2}>{txt(S.about, "title")}</h2>
            {txt(S.about, "text") && <p className={s.note}>{txt(S.about, "text")}</p>}
            {socials.length > 0 && <Socials links={socials} />}
          </div>
        </section>
      )}

      {S.faq.enabled && faq.length > 0 && (
        <section id="faq" data-section="faq" className={s.ruled}>
          <div className={`${s.wrap} ${s.section} ${s.split}`}>
            <div className={s.splitSide}>
              <h2 className={s.h2}>{txt(S.faq, "title")}</h2>
              {store.contactEmail && <p className={s.sideNote}>Anything else? Write to <a href={`mailto:${store.contactEmail}`}>{store.contactEmail}</a></p>}
            </div>
            <dl className={`${s.splitMain} ${s.faq}`}>
              {faq.map((x, i) => <div key={i}><dt>{x.q}</dt>{x.a && <dd>{x.a}</dd>}</div>)}
            </dl>
          </div>
        </section>
      )}

      <div className={s.dark}>
        {S.closing.enabled && (
          <section data-section="closing" className={`${s.wrap} ${s.closing}`}>
            <h2 className={s.closingTitle}><Rich text={txt(S.closing, "title")} em={s.em} /></h2>
            {(txt(S.closing, "primary") || txt(S.closing, "secondary")) && (
              <div className={s.ctas} style={{ justifyContent: "center" }}>
                {txt(S.closing, "primary") && <SLink to={book} className={`${s.btn} ${s.btnLight}`}>{txt(S.closing, "primary")}</SLink>}
                {txt(S.closing, "secondary") && <a href="#books" className={s.link}>{txt(S.closing, "secondary")}</a>}
              </div>
            )}
            {txt(S.closing, "fine") && <div className={s.fine}>{txt(S.closing, "fine")}</div>}
          </section>
        )}
        <Footer store={store} />
      </div>
    </div>
  );
}

// ---- Pieces shared with the Scrivetta product and after-purchase pages -----------------------

export function Brand({ store }: { store: StoreProfile }) {
  return (
    <>
      {store.logoUrl ? <Photo url={store.logoUrl} alt="" className={s.mark} /> : <span className={s.mark}>{initials(store.name)}</span>}
      <span className={s.brandName}>{store.name}</span>
    </>
  );
}

export function Footer({ store }: { store: StoreProfile }) {
  return (
    <footer className={s.footer}>
      <div className={`${s.wrap} ${s.footIn}`}>
        <div className={s.footLinks}>
          <span>© {YEAR} {store.name}</span>
          <SLink to={`/store/${store.slug}/terms`} className={s.navLink}>Terms of sale</SLink>
          {store.contactEmail && <a href={`mailto:${store.contactEmail}`} className={s.navLink}>Contact</a>}
        </div>
        <SLink to="/" className={s.made}><span className={s.madeS}>S</span>Made with Scrivetta</SLink>
      </div>
    </footer>
  );
}

/** A cover as a book: the image (or a typographic fallback), with page edges when `edge`. */
export function Book({ product, edge, small }: { product: Pick<PublicStoreProduct, "coverUrl" | "title">; edge?: boolean; small?: boolean }) {
  return (
    <div className={s.book}>
      {edge && <div className={s.edge} />}
      <Cover product={product} className={`${s.cover} ${small ? s.coverSm : ""}`} fallbackClassName={s.coverFallback} />
    </div>
  );
}

export function Socials({ links }: { links: ReturnType<typeof socialLinks> }) {
  return (
    <div className={s.socials}>
      {links.map((l) => (
        <SLink key={l.kind} to={l.href} className={s.social}><SocialIcon kind={l.kind} />{l.label}</SLink>
      ))}
    </div>
  );
}

function pages(p: PublicStoreProduct) {
  return p.pageCount > 0 ? `${p.pageCount} pages` : "";
}

const icon = { width: 16, height: 16, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.6,
  strokeLinecap: "round" as const, strokeLinejoin: "round" as const, "aria-hidden": true };

export function DownloadIcon() {
  return <svg {...icon}><path d="M12 3v12" /><path d="m7 10 5 5 5-5" /><path d="M5 21h14" /></svg>;
}
export function PageIcon() {
  return <svg {...icon}><path d="M6 3h9l4 4v14H6z" /><path d="M14 3v5h5" /></svg>;
}
export function LockIcon() {
  return <svg {...icon}><rect x="5" y="11" width="14" height="10" rx="1.5" /><path d="M8 11V8a4 4 0 0 1 8 0v3" /></svg>;
}
