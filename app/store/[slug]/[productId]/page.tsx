"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ApiError, apiAsset, publicStoreApi } from "@/lib/api";
import { formatPrice } from "@/lib/pricing";
import type { PublicProduct } from "@/lib/types";
import { MarketingShell } from "@/components/marketing-shell";
import { StoreShell } from "@/components/store/store-shell";
import { StoreCover } from "@/components/store/store-cover";
import { StoreFaq, TrustIcon } from "@/components/store/store-faq";
import { Alert, Button, ButtonLink, Spinner } from "@/components/ui";

/** One ebook's page in a creator store — where buyers decide and buy. */
export default function StoreProductPage() {
  const { slug, productId } = useParams<{ slug: string; productId: string }>();
  const [data, setData] = useState<PublicProduct | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [buying, setBuying] = useState(false);

  useEffect(() => {
    publicStoreApi
      .product(slug, productId)
      .then(setData)
      .catch((e) => (e instanceof ApiError && e.status === 404 ? setNotFound(true) : setError("Could not load this ebook.")));
  }, [slug, productId]);

  async function buy() {
    if (!data) return;
    setBuying(true);
    setError(null);
    try {
      const { checkoutUrl } = await publicStoreApi.checkout(data.id);
      window.location.assign(checkoutUrl);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Could not start checkout. Please try again.");
      setBuying(false);
    }
  }

  if (notFound) {
    return (
      <MarketingShell ambient="none">
        <div className="mx-auto max-w-md px-4 py-24 text-center">
          <h1 className="font-display text-3xl font-light text-foreground">Ebook not found</h1>
          <p className="mt-2 text-sm text-muted">It may no longer be for sale.</p>
          <div className="mt-6">
            <ButtonLink href={`/store/${slug}`} variant="secondary">Back to the store</ButtonLink>
          </div>
        </div>
      </MarketingShell>
    );
  }

  if (!data) {
    return (
      <StoreShell profile={null}>
        <div className="flex justify-center py-24 text-muted">{error ? <Alert>{error}</Alert> : <Spinner />}</div>
      </StoreShell>
    );
  }

  const { store } = data;
  const who = store.authorName || store.name;
  const price = formatPrice(data.priceCents);
  const chips = [
    "PDF",
    data.pageCount > 0 ? `${data.pageCount} pages` : null,
    data.language,
    data.updatedAt ? `Updated ${new Date(data.updatedAt).toLocaleDateString("en-US", { month: "short", year: "numeric" })}` : null,
  ].filter(Boolean) as string[];

  return (
    <StoreShell profile={store}>
      <div className="mx-auto w-full max-w-[1120px] px-4 pt-6 text-sm sm:px-6">
        <Link href={`/store/${store.slug}`} className="text-muted hover:text-foreground">← Back to all ebooks</Link>
      </div>

      <section className="mx-auto flex w-full max-w-[1120px] flex-wrap items-start gap-12 px-4 pb-14 pt-6 sm:px-6">
        <div className="flex min-w-0 flex-[1_1_380px] justify-center rounded-3xl bg-surface-2 px-10 py-12 sm:px-16">
          <div className="w-full max-w-[280px]">
            <StoreCover coverUrl={data.coverUrl} title={data.title} />
          </div>
        </div>

        <div className="flex min-w-0 flex-[1_1_420px] flex-col gap-5">
          <div className="flex flex-wrap gap-2">
            {chips.map((c) => (
              <span key={c} className="rounded-full bg-surface-2 px-3 py-1 text-xs font-semibold text-foreground-2">{c}</span>
            ))}
          </div>
          <h1 className="font-display text-[38px] font-light leading-[1.05] tracking-[-0.02em] text-foreground sm:text-[48px]">
            {data.title}
          </h1>
          {(data.subtitle || data.description) && (
            <p className="text-[18px] leading-relaxed text-foreground-2">{data.subtitle || data.description}</p>
          )}
          <p className="text-[15px] text-muted">
            by{" "}
            <Link href={`/store/${store.slug}#about`} className="font-semibold text-foreground hover:underline">{who}</Link>
          </p>

          <div className="flex flex-col gap-4 rounded-2xl border border-hairline bg-surface p-6">
            <div className="flex items-baseline gap-2.5">
              <span className="text-[34px] font-semibold text-foreground">{price}</span>
              <span className="text-sm text-muted">one-time · USD</span>
            </div>
            <Button
              onClick={buy}
              loading={buying}
              disabled={!store.purchasable || buying}
              className="min-h-[52px] text-base"
            >
              Buy now — {price}
            </Button>
            {!store.purchasable && store.unavailableReason && <Alert variant="info">{store.unavailableReason}</Alert>}
            {error && <Alert>{error}</Alert>}
            <ul className="flex flex-col gap-2.5 text-sm text-foreground-2">
              <li className="flex items-start gap-2.5"><TrustIcon name="mail" />Download link emailed right after payment — valid 30 days, up to 5 downloads</li>
              <li className="flex items-start gap-2.5"><TrustIcon name="lock" />Secure card checkout by Stripe</li>
              <li className="flex items-start gap-2.5"><TrustIcon name="person" />Sold by {who} — questions go straight to them</li>
            </ul>
          </div>

          {data.description && data.subtitle && (
            <p className="whitespace-pre-line text-[16px] leading-relaxed text-foreground-2">{data.description}</p>
          )}

          {data.highlights.length > 0 && (
            <div className="flex flex-col gap-3 pt-2">
              <h2 className="font-display text-[24px] font-normal text-foreground">What you&apos;ll be able to do</h2>
              <ul className="flex list-disc flex-col gap-2 pl-5 text-[16px] leading-relaxed text-foreground-2">
                {data.highlights.map((h) => <li key={h}>{h}</li>)}
              </ul>
            </div>
          )}
        </div>
      </section>

      {data.chapters.length > 0 && (
        <section className="border-y border-ip-hair bg-surface-2">
          <div className="mx-auto flex w-full max-w-[1120px] flex-wrap gap-12 px-4 py-14 sm:px-6">
            <div className="flex min-w-0 flex-[1_1_260px] flex-col gap-3">
              <h2 className="font-display text-[30px] font-normal text-foreground">Inside the book</h2>
              <p className="text-[15px] leading-relaxed text-muted">
                {data.chapters.length} {data.chapters.length === 1 ? "chapter" : "chapters"}
                {data.pageCount > 0 ? ` across ${data.pageCount} pages` : ""}.
              </p>
            </div>
            <ol className="min-w-0 flex-[2_1_440px]">
              {data.chapters.map((c) => (
                <li key={c.number} className="flex items-baseline gap-5 border-b border-hairline py-3">
                  <span className="w-8 shrink-0 font-display text-[18px] text-accent">{String(c.number).padStart(2, "0")}</span>
                  <span className="flex-1 text-[16px] font-semibold text-foreground">{c.title}</span>
                </li>
              ))}
            </ol>
          </div>
        </section>
      )}

      <section className="mx-auto flex w-full max-w-[1120px] flex-wrap gap-10 px-4 py-14 sm:px-6">
        <div className="flex min-w-0 flex-[1_1_380px] items-start gap-5">
          {store.photoUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={apiAsset(store.photoUrl)!} alt={`Photo of ${who}`} className="h-20 w-20 shrink-0 rounded-full object-cover" />
          )}
          <div className="flex flex-col gap-2">
            <p className="font-mono text-[12px] uppercase tracking-[0.14em] text-accent">Written by</p>
            <p className="font-display text-[24px] text-foreground">{who}</p>
            {store.description && <p className="text-[15px] leading-relaxed text-muted line-clamp-4">{store.description}</p>}
          </div>
        </div>
        {data.more.length > 0 && (
          <div className="flex min-w-0 flex-[1_1_380px] flex-col gap-4">
            <p className="text-[15px] font-semibold text-foreground">More from {who}</p>
            <div className="flex flex-wrap gap-4">
              {data.more.slice(0, 4).map((m) => (
                <Link key={m.id} href={`/store/${store.slug}/${m.id}`} className="flex flex-[1_1_200px] items-center gap-3.5 rounded-2xl border border-hairline bg-surface p-3 hover:border-muted">
                  <div className="w-12 shrink-0"><StoreCover coverUrl={m.coverUrl} title={m.title} className="shadow-none" /></div>
                  <span className="flex flex-col gap-1">
                    <span className="text-[15px] font-semibold text-foreground">{m.title}</span>
                    <span className="text-sm text-muted">{formatPrice(m.priceCents)}</span>
                  </span>
                </Link>
              ))}
            </div>
          </div>
        )}
      </section>

      <StoreFaq profile={store} />
    </StoreShell>
  );
}
