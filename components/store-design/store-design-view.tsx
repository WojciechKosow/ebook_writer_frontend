"use client";

import { useMemo } from "react";
import { makeCtx, resolveStyle, type DesignContext, type DesignDoc, type StyleId } from "@/lib/store-design/core";
import { STYLES } from "@/lib/store-design/schemas";
import { STYLE_FONTS } from "@/lib/store-design/fonts";
import type { StyleProps } from "./kit";
import { ClassicStyle } from "./styles/classic";
import { LiteraryStyle } from "./styles/literary";
import { CodeStyle } from "./styles/code";
import { MinimalStyle } from "./styles/minimal";
import { ModernStyle } from "./styles/modern";
import { BoldStyle } from "./styles/bold";

const COMPONENTS: Record<StyleId, (p: StyleProps) => React.ReactNode> = {
  classic: ClassicStyle,
  literary: LiteraryStyle,
  code: CodeStyle,
  minimal: MinimalStyle,
  modern: ModernStyle,
  bold: BoldStyle,
};

/** A store's home page in its chosen style (or `styleId` to preview another). */
export function StoreDesignView({ doc, data, styleId }: { doc: DesignDoc; data: DesignContext; styleId?: StyleId }) {
  const id = styleId ?? doc.active;
  const ctx = useMemo(() => makeCtx(data), [data]);
  const t = useMemo(() => resolveStyle(STYLES[id], doc.themes[id], ctx), [id, doc, ctx]);
  const Style = COMPONENTS[id];
  const href = (productId: string) => `/store/${data.store.slug}/${productId}`;
  return (
    <div className={`${STYLE_FONTS[id]} flex min-h-full flex-1 flex-col`}>
      <Style t={t} ctx={ctx} href={href} />
    </div>
  );
}
