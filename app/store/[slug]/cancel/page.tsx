"use client";

import { useParams } from "next/navigation";
import { MarketingShell } from "@/components/marketing-shell";
import { ButtonLink } from "@/components/ui";

export default function StoreCancelPage() {
  const { slug } = useParams<{ slug: string }>();
  return (
    <MarketingShell ambient="none">
      <div className="mx-auto max-w-md px-4 py-16 text-center">
        <div className="rounded-2xl border border-hairline bg-surface p-8">
          <p className="font-medium text-foreground">Checkout cancelled</p>
          <p className="mt-1 text-sm text-muted">You haven&apos;t been charged.</p>
          <div className="mt-6">
            <ButtonLink href={`/store/${slug}`} variant="secondary">
              Back to the store
            </ButtonLink>
          </div>
        </div>
      </div>
    </MarketingShell>
  );
}
