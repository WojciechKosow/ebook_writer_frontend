"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { publicStoreApi } from "@/lib/api";
import type { StoreProfile } from "@/lib/types";
import { StoreShell } from "@/components/store/store-shell";
import { Spinner } from "@/components/ui";

/**
 * The store's terms of sale: a plain statement of how this store sells — who the
 * seller is, what you get, delivery, the withdrawal waiver accepted at checkout
 * and how to ask for a refund. The same for every creator store.
 */
export default function StoreTermsPage() {
  const { slug } = useParams<{ slug: string }>();
  const [store, setStore] = useState<StoreProfile | null>(null);

  useEffect(() => {
    publicStoreApi.store(slug).then((s) => setStore(s.store)).catch(() => setStore(null));
  }, [slug]);

  if (!store) {
    return (
      <StoreShell profile={null}>
        <div className="flex justify-center py-24 text-muted"><Spinner /></div>
      </StoreShell>
    );
  }

  const seller = store.authorName ? `${store.authorName} (${store.name})` : store.name;
  const contact = store.contactEmail ? (
    <a href={`mailto:${store.contactEmail}`} className="font-medium text-accent hover:underline">{store.contactEmail}</a>
  ) : (
    "the seller (reply to your receipt email)"
  );

  return (
    <StoreShell profile={store}>
      <article className="mx-auto w-full max-w-[720px] px-4 py-14 text-[16px] leading-relaxed text-foreground-2 sm:px-6">
        <h1 className="font-display text-[38px] font-light leading-tight text-foreground">Terms of sale</h1>
        <div className="mt-8 flex flex-col gap-6">
          <section>
            <h2 className="font-display text-[22px] text-foreground">Seller</h2>
            <p className="mt-2">
              Ebooks in this store are sold by {seller}. You buy directly from the seller. Payments are processed by
              Stripe on the seller&apos;s behalf. Scrivetta provides the store software and is not the seller.
            </p>
          </section>
          <section>
            <h2 className="font-display text-[22px] text-foreground">What you get</h2>
            <p className="mt-2">
              A digital ebook in PDF format for your personal use. Prices are shown in US dollars and charged once.
            </p>
          </section>
          <section>
            <h2 className="font-display text-[22px] text-foreground">Delivery</h2>
            <p className="mt-2">
              Right after your payment is confirmed you receive an email with a download link. The link is valid for 30
              days and up to 5 downloads.
            </p>
          </section>
          <section>
            <h2 className="font-display text-[22px] text-foreground">Right of withdrawal</h2>
            <p className="mt-2">
              At checkout you ask for immediate access to the digital content and acknowledge that you lose your right
              of withdrawal once the download is made available to you.
            </p>
          </section>
          <section>
            <h2 className="font-display text-[22px] text-foreground">Questions and refunds</h2>
            <p className="mt-2">
              For any problem with your purchase, contact {contact}. Refunds are handled by the seller. If a payment is
              refunded in full, the download link stops working.
            </p>
          </section>
        </div>
        <p className="mt-10 text-sm">
          <Link href={`/store/${store.slug}`} className="text-muted hover:text-foreground">← Back to the store</Link>
        </p>
      </article>
    </StoreShell>
  );
}
