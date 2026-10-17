"use client";

import Link from "next/link";
import { apiAsset } from "@/lib/api";
import { formatPrice } from "@/lib/pricing";
import { StoreShell, SocialIcons, firstName } from "@/components/store/store-shell";
import { StoreCover } from "@/components/store/store-cover";
import { StoreFaq, TRUST_POINTS, TrustIcon } from "@/components/store/store-faq";
import { Alert, ButtonLink } from "@/components/ui";
import { CustomCss, type StyleProps } from "../kit";

/** Classic — the original Scrivetta store page; its copy comes from the store profile. */
export function ClassicStyle({ t, ctx, href }: StyleProps) {
  const { store, products } = ctx;
  const who = store.authorName || store.name;
  const featured = products[0];

  return (
    <StoreShell profile={store} onStorePage>
      <CustomCss t={t} />
      {/* Hero */}
      <section className="mx-auto flex w-full max-w-[1120px] flex-wrap items-center gap-12 px-4 pb-14 pt-12 sm:px-6 sm:pt-16">
        <div className="flex min-w-0 flex-[1_1_420px] flex-col gap-5">
          <p className="font-mono text-[12px] uppercase tracking-[0.14em] text-accent">
            {store.authorName ? `Ebooks by ${store.authorName}` : `Ebooks from ${store.name}`}
          </p>
          <h1 className="font-display text-[38px] font-light leading-[1.05] tracking-[-0.02em] text-foreground sm:text-[54px]">
            {store.headline || store.name}
          </h1>
          {store.description && (
            <p className="max-w-[540px] text-[17px] leading-relaxed text-muted line-clamp-4">{store.description}</p>
          )}
          {featured && (
            <div className="mt-1 flex flex-wrap gap-3">
              <ButtonLink href={href(featured.id)}>
                Start with {featured.title} · {formatPrice(featured.priceCents)}
              </ButtonLink>
              {products.length > 1 && (
                <ButtonLink href="#ebooks" variant="secondary">
                  See all {products.length} ebooks
                </ButtonLink>
              )}
            </div>
          )}
        </div>
        {featured && (
          <div aria-hidden className="relative hidden h-[380px] min-w-0 flex-[1_1_340px] items-start justify-center sm:flex">
            {products[1] && (
              <div className="absolute left-[8%] top-12 w-[150px] -rotate-[8deg] sm:w-[180px]">
                <StoreCover coverUrl={products[1].coverUrl} title={products[1].title} />
              </div>
            )}
            {products[2] && (
              <div className="absolute right-[8%] top-14 w-[150px] rotate-[7deg] sm:w-[180px]">
                <StoreCover coverUrl={products[2].coverUrl} title={products[2].title} />
              </div>
            )}
            <div className="relative w-[190px] sm:w-[226px]">
              <StoreCover coverUrl={featured.coverUrl} title={featured.title} />
            </div>
          </div>
        )}
      </section>

      {/* Reassurance strip */}
      <div className="border-y border-ip-hair bg-surface-2">
        <div className="mx-auto flex w-full max-w-[1120px] flex-wrap justify-center gap-x-10 gap-y-2 px-4 py-4 text-sm font-semibold text-foreground-2 sm:px-6">
          {TRUST_POINTS(who).map((t) => (
            <span key={t.text} className="flex items-center gap-2">
              <TrustIcon name={t.icon} />
              {t.text}
            </span>
          ))}
        </div>
      </div>

      {!store.purchasable && store.unavailableReason && (
        <div className="mx-auto mt-8 w-full max-w-[1120px] px-4 sm:px-6">
          <Alert variant="info">{store.unavailableReason}</Alert>
        </div>
      )}

      {/* Ebooks */}
      <section id="ebooks" className="mx-auto w-full max-w-[1120px] scroll-mt-24 px-4 pb-8 pt-14 sm:px-6">
        <div className="mb-8 flex flex-wrap items-baseline justify-between gap-3">
          <h2 className="font-display text-[34px] font-normal text-foreground">Ebooks</h2>
          {products.length > 0 && (
            <span className="text-sm text-muted">
              {products.length} {products.length === 1 ? "guide" : "guides"} · PDF · prices in USD
            </span>
          )}
        </div>
        {products.length === 0 ? (
          <p className="text-sm text-faint">No ebooks for sale yet.</p>
        ) : (
          <div className="grid gap-8 [grid-template-columns:repeat(auto-fill,minmax(260px,1fr))]">
            {products.map((p, i) => (
              <article key={p.id} className={`flex-col gap-4 ${i === 0 ? "flex" : "hidden sm:flex"}`}>
                <Link href={href(p.id)} aria-label={`${p.title} — view details`} className="block rounded-2xl bg-surface-2 px-[22%] py-8">
                  <StoreCover coverUrl={p.coverUrl} title={p.title} />
                </Link>
                <div className="flex flex-col gap-1.5">
                  <p className="text-[13px] font-semibold text-muted">
                    {["PDF", p.pageCount > 0 ? `${p.pageCount} pages` : null, p.id === featured?.id && products.length > 1 ? "Start here" : null]
                      .filter(Boolean)
                      .join(" · ")}
                  </p>
                  <h3 className="font-display text-[23px] font-normal leading-tight text-foreground">
                    <Link href={href(p.id)} className="hover:underline">{p.title}</Link>
                  </h3>
                  {(p.description || p.subtitle) && (
                    <p className="text-[15px] leading-relaxed text-muted line-clamp-3">{p.description || p.subtitle}</p>
                  )}
                </div>
                <div className="mt-auto flex items-center justify-between gap-3">
                  <span className="text-lg font-semibold text-foreground">{formatPrice(p.priceCents)}</span>
                  <ButtonLink href={href(p.id)}>View ebook</ButtonLink>
                </div>
              </article>
            ))}
          </div>
        )}
        {products.length > 1 && (
          <div className="mt-6 flex flex-col gap-3 sm:hidden">
            <h3 className="font-display text-[22px] font-normal text-foreground">More ebooks</h3>
            {products.slice(1).map((p) => (
              <Link key={p.id} href={href(p.id)} className="flex items-center gap-3.5 rounded-2xl border border-hairline bg-surface p-3">
                <div className="w-16 shrink-0">
                  <StoreCover coverUrl={p.coverUrl} title={p.title} className="shadow-none" />
                </div>
                <span className="flex flex-1 flex-col gap-1">
                  <span className="text-[16px] font-semibold text-foreground">{p.title}</span>
                  {p.pageCount > 0 && <span className="text-[13px] text-muted">PDF · {p.pageCount} pages</span>}
                  <span className="text-[16px] font-semibold text-foreground">{formatPrice(p.priceCents)}</span>
                </span>
                <span aria-hidden className="text-muted">›</span>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* About the author */}
      {(store.description || store.photoUrl) && (
        <section id="about" className="mx-auto w-full max-w-[1120px] scroll-mt-24 px-4 py-12 sm:px-6">
          <div className="flex flex-wrap items-center gap-10 rounded-3xl border border-hairline bg-surface p-7 sm:p-10">
            {store.photoUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={apiAsset(store.photoUrl)!}
                alt={`Photo of ${who}`}
                className="h-[220px] w-[180px] shrink-0 rounded-2xl object-cover"
              />
            )}
            <div className="flex min-w-0 flex-[1_1_360px] flex-col gap-3">
              <p className="font-mono text-[12px] uppercase tracking-[0.14em] text-accent">About the author</p>
              <h2 className="font-display text-[32px] font-normal leading-tight text-foreground">
                {store.authorName ? `Hi, I'm ${firstName(store.authorName)}.` : `About ${store.name}`}
              </h2>
              {store.description && (
                <p className="max-w-[620px] whitespace-pre-line text-[16px] leading-relaxed text-foreground-2">{store.description}</p>
              )}
              <div className="flex flex-wrap items-center gap-5 text-sm font-semibold text-accent">
                <SocialIcons profile={store} />
                {store.contactEmail && (
                  <a href={`mailto:${store.contactEmail}`} className="hover:underline">{store.contactEmail}</a>
                )}
              </div>
            </div>
          </div>
        </section>
      )}

      <StoreFaq profile={store} />
    </StoreShell>
  );
}
