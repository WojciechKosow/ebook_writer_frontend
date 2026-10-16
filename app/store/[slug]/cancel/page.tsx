"use client";

import { useParams } from "next/navigation";
import { StoreShell } from "@/components/store/store-shell";
import { useStoreProfile } from "@/components/store/use-store-profile";
import { ButtonLink } from "@/components/ui";

export default function StoreCancelPage() {
  const { slug } = useParams<{ slug: string }>();
  const profile = useStoreProfile(slug);
  return (
    <StoreShell profile={profile}>
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
    </StoreShell>
  );
}
