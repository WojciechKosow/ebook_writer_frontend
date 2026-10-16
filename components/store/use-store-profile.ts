"use client";

import { useEffect, useState } from "react";
import { publicStoreApi } from "@/lib/api";
import type { StoreProfile } from "@/lib/types";

/** The store's public profile for pages that only need its header and footer. */
export function useStoreProfile(slug: string | null | undefined): StoreProfile | null {
  const [profile, setProfile] = useState<StoreProfile | null>(null);
  useEffect(() => {
    if (!slug) return;
    publicStoreApi.store(slug).then((s) => setProfile(s.store)).catch(() => setProfile(null));
  }, [slug]);
  return profile;
}
