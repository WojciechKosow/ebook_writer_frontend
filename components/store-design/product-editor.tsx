"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { ApiError, storeApi } from "@/lib/api";
import type { ProductFile, SampleChapter, StoreDashboard, StoreProduct } from "@/lib/types";
import { parseDesign, type FieldValue, type SectionEdits } from "@/lib/store-design/core";
import { STYLES } from "@/lib/store-design/schemas";
import {
  MAX_SAMPLE_CHAPTERS,
  PAGE_SECTIONS,
  PRODUCT_FIELDS,
  makeProductCtx,
  pageDataFromDashboard,
  parsePageDoc,
  resolvePage,
  sampleChapters,
  type PageKind,
  type ProductPageDoc,
} from "@/lib/store-design/product-page";
import { DevicePreview, type Device } from "./device-preview";
import {
  Chevron,
  FieldEditor,
  IconButton,
  IconDesktop,
  IconExternal,
  IconEye,
  IconEyeOff,
  IconPhone,
  IconPointer,
  IconRedo,
  IconReset,
  IconUndo,
  Switch,
  groupFields,
  leadOf,
  previewData,
  sublabel,
} from "./design-editor";

type Toast = { msg: string; error?: boolean } | null;
const HISTORY = 50;
const KINDS: { id: PageKind; label: string }[] = [
  { id: "product", label: "Product page" },
  { id: "purchase", label: "After purchase" },
];

/** The draft: the page document, with the product's own fields edited in place (see PRODUCT_FIELDS). */
function fromProduct(p: StoreProduct): ProductPageDoc {
  return parsePageDoc(p.pageSettings);
}

const key = (kind: PageKind, sec: string) => `${kind}.${sec}`;

/**
 * The product page designer: the product's sales page and the page buyers see
 * after paying, live in the store's style on phone and desktop, with
 * click-to-edit, the free preview (contents list and readable sample chapters)
 * and one Save for the page and the product's title, description and points.
 */
export function ProductEditor({ token, initial, productId }: { token: string; initial: StoreDashboard; productId: string }) {
  const [dashboard, setDashboard] = useState(initial);
  const product = dashboard.products.find((p) => p.id === productId)!;
  const [saved, setSaved] = useState<ProductPageDoc>(() => fromProduct(product));
  const [draft, setDraft] = useState<ProductPageDoc>(saved);
  const [past, setPast] = useState<ProductPageDoc[]>([]);
  const [future, setFuture] = useState<ProductPageDoc[]>([]);
  const [kind, setKind] = useState<PageKind>("product");
  const [device, setDevice] = useState<Device>("desktop");
  const [section, setSection] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<Toast>(null);
  const [samples, setSamples] = useState<SampleChapter[]>([]);
  const lastKey = useRef<{ key: string; at: number } | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const design = useMemo(() => parseDesign(dashboard.themeSettings), [dashboard.themeSettings]);
  const data = useMemo(() => pageDataFromDashboard(dashboard, product), [dashboard, product]);
  const ctx = useMemo(() => makeProductCtx(data), [data]);
  const schemas = PAGE_SECTIONS[kind];
  const resolved = useMemo(() => resolvePage(draft, kind, ctx), [draft, kind, ctx]);
  const dirty = JSON.stringify(draft) !== JSON.stringify(saved);
  const picked = sampleChapters(draft);
  const labels = useMemo(() => Object.fromEntries(schemas.map((s) => [s.id, s.label])), [schemas]);
  const files: ProductFile[] = useMemo(() => [
    ...(product.ebookId ? [{ id: "ebook-pdf", filename: `${product.title.replace(/[^a-zA-Z0-9-_ ]/g, "").trim().replace(/\s+/g, "_") || "ebook"}.pdf`, format: "PDF" as const, sizeBytes: 0, version: 1, updatedAt: null }] : []),
    ...product.files,
  ], [product]);

  const say = useCallback((msg: string, error = false) => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast({ msg, error });
    toastTimer.current = setTimeout(() => setToast(null), error ? 5000 : 2600);
  }, []);

  useEffect(() => {
    if (!dirty) return;
    const warn = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  // The free chapters' text, for the preview (the frame can't fetch it itself).
  useEffect(() => {
    const missing = picked.filter((n) => !samples.some((x) => x.number === n));
    if (!missing.length) return;
    let live = true;
    Promise.all(missing.map((n) => storeApi.sample(token, productId, n).catch(() => null)))
      .then((got) => live && setSamples((cur) => [...cur, ...got.filter((x): x is SampleChapter => !!x)]));
    return () => {
      live = false;
    };
  }, [picked, samples, token, productId]);

  // ---- history (same model as the store designer) ----------------------------

  const draftRef = useRef(draft);
  useEffect(() => {
    draftRef.current = draft;
  }, [draft]);

  const commit = useCallback((fn: (d: ProductPageDoc) => ProductPageDoc, k?: string) => {
    const now = Date.now();
    const merge = !!k && lastKey.current?.key === k && now - lastKey.current.at < 1200;
    lastKey.current = k ? { key: k, at: now } : null;
    const prev = draftRef.current;
    const next = fn(prev);
    draftRef.current = next;
    if (!merge) setPast((p) => [...p.slice(-(HISTORY - 1)), prev]);
    setFuture([]);
    setDraft(next);
  }, []);

  const undo = useCallback(() => {
    if (!past.length) return;
    lastKey.current = null;
    setFuture((f) => [draft, ...f]);
    setDraft(past[past.length - 1]);
    setPast((p) => p.slice(0, -1));
  }, [past, draft]);

  const redo = useCallback(() => {
    if (!future.length) return;
    lastKey.current = null;
    setPast((p) => [...p, draft]);
    setDraft(future[0]);
    setFuture((f) => f.slice(1));
  }, [future, draft]);

  const saveRef = useRef<() => void>(() => {});
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      const typing = !!t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable);
      const mod = e.metaKey || e.ctrlKey;
      if (mod && e.key.toLowerCase() === "s") {
        e.preventDefault();
        saveRef.current();
      } else if (mod && e.key.toLowerCase() === "z" && !typing) {
        e.preventDefault();
        if (e.shiftKey) redo();
        else undo();
      } else if (e.key === "Escape" && !typing) {
        setSection(null);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [undo, redo]);

  // ---- edits -----------------------------------------------------------------

  const editSection = (sec: string, fn: (e: SectionEdits) => SectionEdits, k?: string) =>
    commit((d) => {
      const sections = { ...(d.sections ?? {}) };
      const next = fn({ ...(sections[key(kind, sec)] ?? {}) });
      if (Object.keys(next).length) sections[key(kind, sec)] = next;
      else delete sections[key(kind, sec)];
      return { ...d, sections };
    }, k);
  const setField = (sec: string, k: string, v: FieldValue) => editSection(sec, (e) => ({ ...e, [k]: v }), `${kind}.${sec}.${k}`);
  const setShown = (sec: string, on: boolean) => editSection(sec, (e) => ({ ...e, enabled: on }));
  const resetSection = (sec: string) => {
    editSection(sec, (e) => (typeof e.enabled === "boolean" ? { enabled: e.enabled } : {}));
    say("Restored the default text");
  };
  const toggleSample = (n: number) =>
    commit((d) => {
      const cur = sampleChapters(d);
      const next = cur.includes(n) ? cur.filter((x) => x !== n) : [...cur, n].sort((a, b) => a - b);
      return { ...d, preview: { chapters: next } };
    });

  const openSection = useCallback((sec: string) => setSection(sec), []);
  const switchKind = (k: PageKind) => {
    setKind(k);
    setSection(null);
  };

  async function save() {
    // The product's own fields go to the product; the rest is the page document.
    const sales = resolvePage(draft, "product", ctx);
    const doc: ProductPageDoc = { v: 1, sections: { ...(draft.sections ?? {}) }, preview: { chapters: sampleChapters(draft) } };
    const fields: { title?: string; description?: string; highlights?: string } = {};
    for (const [name, at] of Object.entries(PRODUCT_FIELDS)) {
      const edits = doc.sections![key("product", at.section)];
      if (!edits || edits[at.key] === undefined) continue;
      const v = sales[at.section].values[at.key];
      if (name === "highlights") fields.highlights = (Array.isArray(v) ? (v as string[]) : []).filter((x) => x.trim()).join("\n");
      else fields[name as "title" | "description"] = typeof v === "string" ? v : "";
      const rest = { ...edits };
      delete rest[at.key];
      if (Object.keys(rest).length) doc.sections![key("product", at.section)] = rest;
      else delete doc.sections![key("product", at.section)];
    }
    if (fields.title !== undefined && !fields.title.trim()) {
      say("The title can't be empty.", true);
      return;
    }
    const empty = !Object.keys(doc.sections!).length && !doc.preview!.chapters!.length;
    setSaving(true);
    try {
      const next = await storeApi.updateProduct(token, productId, { ...fields, pageSettings: empty ? "" : JSON.stringify(doc) });
      setDashboard(next);
      const stored = fromProduct(next.products.find((p) => p.id === productId)!);
      setSaved(stored);
      setDraft(stored);
      setPast([]);
      setFuture([]);
      say(product.active && dashboard.published ? "Saved · buyers see it now" : "Saved");
    } catch (e) {
      say(e instanceof ApiError ? e.message : "Could not save the page.", true);
    } finally {
      setSaving(false);
    }
  }

  useEffect(() => {
    saveRef.current = () => {
      if (dirty && !saving) void save();
    };
  });

  const leave = (e: React.MouseEvent) => {
    if (dirty && !window.confirm("You have unsaved changes. Leave without saving them?")) e.preventDefault();
  };

  const status = dirty
    ? { dot: "bg-[#E8B05A]", label: "Unsaved changes" }
    : product.active && dashboard.published
      ? { dot: "bg-[#7CC99A]", label: "Live · up to date" }
      : { dot: "bg-faint", label: product.active ? "Saved · store not published yet" : "Saved · product hidden" };

  const current = section ? schemas.find((s) => s.id === section) ?? null : null;
  const liveUrl = kind === "product" ? `/store/${dashboard.slug}/${product.id}` : null;

  return (
    <div className="flex h-full min-h-0 flex-col bg-background text-foreground">
      <header className="flex min-h-[60px] shrink-0 flex-wrap items-center gap-3 border-b border-hairline bg-surface px-3 py-2 sm:pl-3 sm:pr-4 lg:h-[60px] lg:flex-nowrap lg:py-0">
        <div className="flex min-w-0 flex-[1_1_260px] items-center gap-2.5">
          <Link href="/store#ebooks-sec" onClick={leave} className="inline-flex h-9 items-center gap-1.5 rounded-[10px] pl-1.5 pr-2.5 text-sm text-foreground-2 hover:bg-surface-2">
            <Chevron dir="left" />
            Your store
          </Link>
          <span className="h-5 w-px bg-hairline-2" />
          <div className="flex min-w-0 flex-col gap-0.5">
            <span className="truncate font-display text-[18px] leading-tight text-foreground">{product.title}</span>
            <span className="flex items-center gap-1.5 text-xs text-muted" aria-live="polite">
              <span className={`h-1.5 w-1.5 rounded-full ${status.dot}`} />
              {status.label}
            </span>
          </div>
        </div>

        <div role="group" aria-label="Preview size" className="flex gap-0.5 rounded-xl border border-hairline bg-background p-[3px]">
          {(["desktop", "phone"] as Device[]).map((d) => (
            <button key={d} type="button" aria-pressed={device === d} onClick={() => setDevice(d)}
              className={`inline-flex h-8 items-center gap-1.5 rounded-[9px] px-3 text-[13px] font-medium capitalize ${device === d ? "bg-foreground text-background" : "text-muted hover:text-foreground"}`}>
              {d === "desktop" ? <IconDesktop /> : <IconPhone />}
              {d}
            </button>
          ))}
        </div>

        <div className="flex flex-[1_1_260px] items-center justify-end gap-1.5">
          <IconButton label="Undo" hint="Ctrl+Z" disabled={!past.length} onClick={undo}><IconUndo /></IconButton>
          <IconButton label="Redo" hint="Ctrl+Shift+Z" disabled={!future.length} onClick={redo}><IconRedo /></IconButton>
          {liveUrl && product.active && dashboard.published && (
            <a href={liveUrl} target="_blank" rel="noopener noreferrer"
              className="ml-1 inline-flex h-[38px] items-center gap-1.5 rounded-[11px] border border-hairline-2 px-3.5 text-sm font-medium text-foreground hover:bg-surface-2">
              View live <IconExternal />
            </a>
          )}
          <button type="button" onClick={save} disabled={!dirty || saving} title="Save (Ctrl+S)"
            className="h-[38px] rounded-[11px] bg-foreground px-[18px] text-sm font-semibold text-background transition hover:brightness-110 disabled:cursor-default disabled:opacity-40">
            {saving ? "Saving…" : "Save"}
          </button>
        </div>
      </header>

      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto lg:flex-row lg:overflow-hidden">
        <aside className="flex shrink-0 flex-col border-hairline bg-surface lg:h-full lg:w-[380px] lg:border-r">
          <div className="px-4 pt-4">
            <div role="tablist" aria-label="Page" className="grid grid-cols-2 gap-0.5 rounded-xl border border-hairline bg-background p-[3px]">
              {KINDS.map((k) => (
                <button key={k.id} type="button" role="tab" aria-selected={kind === k.id} onClick={() => switchKind(k.id)}
                  className={`h-9 rounded-[9px] text-sm font-medium ${kind === k.id ? "bg-surface-2 text-foreground shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]" : "text-muted hover:text-foreground"}`}>
                  {k.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-4 pb-6 pt-2 [scrollbar-color:var(--hairline-2)_transparent] [scrollbar-width:thin] lg:min-h-0">
            {!current && (
              <div className="animate-[sd-in_.18s_ease-out]">
                <div className="mx-0.5 my-3.5 flex items-center gap-2.5 rounded-xl bg-accent-soft px-3.5 py-3 text-[13px] leading-snug text-accent-ink">
                  <IconPointer />
                  <span>
                    {kind === "product"
                      ? "Click any part of the preview to edit it. The Buy button works as usual on the live page."
                      : "This is what buyers see right after paying — on the download page from their email."}
                  </span>
                </div>
                <h2 className="mx-0.5 mb-2 mt-1 font-display text-[22px] font-normal text-foreground">Page sections</h2>
                <div className="flex flex-col border-t border-hairline">
                  {schemas.map((sec, i) => {
                    const r = resolved[sec.id];
                    const shown = r?.enabled ?? true;
                    const lead = sec.id === "preview" && picked.length
                      ? `${picked.length} free chapter${picked.length === 1 ? "" : "s"} · ${leadOf(sec, r?.values ?? {})}`
                      : leadOf(sec, r?.values ?? {});
                    return (
                      <div key={sec.id} className="flex items-center border-b border-hairline">
                        <button type="button" onClick={() => openSection(sec.id)}
                          className="group flex min-w-0 flex-1 items-center gap-3 rounded-lg py-3 pl-1 pr-2 text-left hover:bg-surface-2">
                          <span className="w-[18px] shrink-0 font-mono text-[11px] text-faint">{String(i + 1).padStart(2, "0")}</span>
                          <span className={`flex min-w-0 flex-1 flex-col gap-0.5 ${shown ? "" : "opacity-45"}`}>
                            <span className="text-sm font-medium text-foreground">{sec.label}</span>
                            <span className="truncate text-[12.5px] text-muted">{lead || " "}</span>
                          </span>
                          <span className="opacity-45 transition group-hover:translate-x-0.5 group-hover:opacity-100"><Chevron dir="right" /></span>
                        </button>
                        {sec.optional ? (
                          <IconButton label={shown ? `Hide ${sec.label}` : `Show ${sec.label}`} pressed={!shown} onClick={() => setShown(sec.id, !shown)}>
                            {shown ? <IconEye /> : <IconEyeOff />}
                          </IconButton>
                        ) : (
                          <span className="ml-0.5 w-9 shrink-0" />
                        )}
                      </div>
                    );
                  })}
                </div>
                <p className="mx-0.5 mt-4 text-[12.5px] leading-relaxed text-muted">
                  The look — {STYLES[design.active].name} style, colors, fonts — comes from your{" "}
                  <Link href="/store/design" onClick={leave} className="text-foreground underline">store design</Link>. Price, cover and files
                  are in <Link href="/store#ebooks-sec" onClick={leave} className="text-foreground underline">Your store</Link>.
                </p>
              </div>
            )}

            {current && (
              <div key={`${kind}-${current.id}`} className="animate-[sd-in_.18s_ease-out] pt-2.5">
                <button type="button" onClick={() => setSection(null)}
                  className="inline-flex h-8 items-center gap-1 rounded-[9px] pl-1 pr-2.5 text-[13px] font-medium text-foreground-2 hover:bg-surface-2">
                  <Chevron dir="left" />
                  All sections
                </button>
                <div className="mx-0.5 mb-1 mt-2.5 flex items-center justify-between gap-3">
                  <h2 className="font-display text-[28px] font-normal leading-tight text-foreground">{current.label}</h2>
                  {current.optional && (
                    <Switch label="Show this section" on={resolved[current.id]?.enabled ?? true} onChange={(on) => setShown(current.id, on)}
                      text={(resolved[current.id]?.enabled ?? true) ? "Shown" : "Hidden"} />
                  )}
                </div>
                <p className="mx-0.5 mb-4 text-[13px] text-muted">Edits show in the preview as you type.</p>
                {!(resolved[current.id]?.enabled ?? true) && (
                  <div className="mx-0.5 mb-4 rounded-xl bg-warn-soft px-3.5 py-3 text-[13px] leading-snug text-warn">
                    This section is hidden. Turn it on to show it.
                  </div>
                )}

                {kind === "product" && current.id === "preview" && (
                  <SamplePicker product={product} picked={picked} onToggle={toggleSample} />
                )}

                <div className="flex flex-col gap-[18px] px-0.5">
                  {groupFields(current.fields).map((g, gi) => {
                    const fields = g.fields.map((f) => (
                      <FieldEditor key={`${kind}-${current.id}-${f.key}`} field={f} label={g.title ? sublabel(f.label) : f.label}
                        value={resolved[current.id]?.values[f.key]} onChange={(v) => setField(current.id, f.key, v)} />
                    ));
                    return g.title ? (
                      <fieldset key={gi} className="flex flex-col gap-3.5 rounded-xl border border-hairline p-3.5">
                        <legend className="px-1 text-[11.5px] font-semibold uppercase tracking-[0.08em] text-muted">{g.title}</legend>
                        {fields}
                      </fieldset>
                    ) : (
                      fields
                    );
                  })}
                </div>
                <button type="button" onClick={() => resetSection(current.id)}
                  className="mt-5 inline-flex h-[34px] items-center gap-1.5 rounded-[9px] px-2.5 text-[13px] font-medium text-muted hover:bg-surface-2 hover:text-foreground">
                  <IconReset />
                  Restore the default text
                </button>
              </div>
            )}
          </div>
        </aside>

        <main className="relative flex h-[78vh] min-w-0 shrink-0 flex-col gap-3 bg-background px-3 pb-4 pt-4 sm:px-6 lg:h-auto lg:min-h-0 lg:flex-1">
          <div className="flex items-center justify-between gap-3 px-1 text-[12.5px] text-muted">
            <span className="inline-flex items-center gap-2"><IconPointer /> Click anything on the page to edit it</span>
            <span>{kind === "product" ? "Product page" : "After purchase"} · {STYLES[design.active].name} style</span>
          </div>
          <div className="min-h-0 min-w-0 flex-1">
            <DevicePreview
              device={device}
              url={kind === "product" ? `scrivetta.com/store/${dashboard.slug}/${product.id.slice(0, 8)}…` : "scrivetta.com/download"}
              onPick={openSection}
              message={{
                doc: design, data: previewData(dashboard), styleId: design.active, focus: section,
                pick: { labels, selected: section },
                page: { kind, data, doc: draft, samples, files },
              }}
            />
          </div>
          {toast && (
            <div role="status"
              className={`absolute bottom-10 left-1/2 z-10 flex -translate-x-1/2 items-center gap-2.5 whitespace-nowrap rounded-xl px-[18px] py-3 text-sm font-medium shadow-[0_16px_40px_rgba(0,0,0,0.45)] ${toast.error ? "bg-red-700 text-white" : "bg-foreground text-background"}`}>
              {toast.msg}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

/** Which chapters anyone can read for free before buying (Scrivetta ebooks only). */
function SamplePicker({ product, picked, onToggle }: { product: StoreProduct; picked: number[]; onToggle: (n: number) => void }) {
  if (!product.ebookId) {
    return (
      <p className="mx-0.5 mb-5 rounded-xl bg-surface-2 px-3.5 py-3 text-[13px] leading-relaxed text-foreground-2">
        List what&apos;s in the bundle below — buyers see it before they buy. Readable sample chapters are available for
        Scrivetta ebooks.
      </p>
    );
  }
  const full = picked.length >= MAX_SAMPLE_CHAPTERS;
  return (
    <fieldset className="mx-0.5 mb-5 flex flex-col gap-2 rounded-xl border border-hairline p-3.5">
      <legend className="px-1 text-[11.5px] font-semibold uppercase tracking-[0.08em] text-muted">Free sample chapters</legend>
      <p className="text-xs leading-relaxed text-faint">
        Anyone can read these in full on the page, before buying (up to {MAX_SAMPLE_CHAPTERS}). Images stay in the paid book.
      </p>
      <ul className="flex max-h-[260px] flex-col overflow-y-auto">
        {product.chapters.map((c) => {
          const on = picked.includes(c.number);
          const disabled = !c.hasText || (!on && full);
          return (
            <li key={c.number}>
              <label className={`flex items-center gap-2.5 rounded-lg px-1.5 py-2 text-[13px] ${disabled && !on ? "opacity-45" : "cursor-pointer hover:bg-surface-2"}`}>
                <input type="checkbox" checked={on} disabled={disabled && !on} onChange={() => onToggle(c.number)} className="h-4 w-4 accent-[var(--foreground)]" />
                <span className="w-6 shrink-0 font-mono text-[11px] text-faint">{String(c.number).padStart(2, "0")}</span>
                <span className="min-w-0 flex-1 truncate text-foreground">{c.title}</span>
                {!c.hasText && <span className="text-[11px] text-faint">no text</span>}
              </label>
            </li>
          );
        })}
      </ul>
    </fieldset>
  );
}
