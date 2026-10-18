"use client";

import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { ApiError, storeApi } from "@/lib/api";
import type { StoreDashboard } from "@/lib/types";
import {
  STYLE_IDS,
  cssProblem,
  isColor,
  makeCtx,
  parseDesign,
  resolveStyle,
  type DesignContext,
  type DesignDoc,
  type Field,
  type FieldValue,
  type Item,
  type SectionSchema,
  type StyleId,
  type StyleSettings,
} from "@/lib/store-design/core";
import { STYLES } from "@/lib/store-design/schemas";
import { ALL_STYLE_FONTS } from "@/lib/store-design/fonts";
import { DevicePreview, type Device } from "./device-preview";

/** What the preview needs, built from the dashboard (the store as buyers would see it). */
export function previewData(d: StoreDashboard): DesignContext {
  return {
    store: {
      slug: d.slug, name: d.name, description: d.description, headline: d.headline, authorName: d.authorName,
      contactEmail: d.contactEmail, instagramUrl: d.instagramUrl, tiktokUrl: d.tiktokUrl, websiteUrl: d.websiteUrl,
      logoUrl: d.logoUrl, photoUrl: d.photoUrl, purchasable: true, unavailableReason: null,
    },
    products: d.products.filter((p) => p.active).map((p) => ({
      id: p.id, title: p.title, subtitle: null, description: p.description, priceCents: p.priceCents,
      currency: p.currency, pageCount: p.pageCount, language: null, coverUrl: p.coverUrl,
    })),
    chapters: d.featuredChapters ?? [],
  };
}

/** Notes shown under sections whose content comes from elsewhere. */
const NOTES: Record<string, string> = {
  books: "Which ebooks appear, their covers, descriptions and prices come from Your store.",
  contents: "Starts from the chapters of your first ebook. Edit the list to change what buyers see.",
};

type Tab = "look" | "content";
type Toast = { msg: string; error?: boolean } | null;
const HISTORY = 50;

export function DesignEditor({ token, initial }: { token: string; initial: StoreDashboard }) {
  const [dashboard, setDashboard] = useState(initial);
  const [saved, setSaved] = useState<DesignDoc>(() => parseDesign(initial.themeSettings));
  const [draft, setDraft] = useState<DesignDoc>(saved);
  const [past, setPast] = useState<DesignDoc[]>([]);
  const [future, setFuture] = useState<DesignDoc[]>([]);
  const [device, setDevice] = useState<Device>("desktop");
  const [tab, setTab] = useState<Tab>("look");
  const [section, setSection] = useState<string | null>(null);
  const [advanced, setAdvanced] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [toast, setToast] = useState<Toast>(null);
  const lastKey = useRef<{ key: string; at: number } | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const data = useMemo(() => previewData(dashboard), [dashboard]);
  const ctx = useMemo(() => makeCtx(data), [data]);
  const id = draft.active;
  const schema = STYLES[id];
  const settings: StyleSettings = useMemo(() => draft.themes[id] ?? {}, [draft, id]);
  const resolved = useMemo(() => resolveStyle(schema, settings, ctx), [schema, settings, ctx]);
  const dirty = JSON.stringify(draft) !== JSON.stringify(saved);
  const css = settings.customCss ?? "";
  const cssError = css ? cssProblem(css) : null;
  const labels = useMemo(() => {
    const l: Record<string, string> = {};
    schema.sections.forEach((s) => (l[s.id] = s.label));
    return l;
  }, [schema]);

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

  // ---- history -------------------------------------------------------------

  const draftRef = useRef(draft);
  useEffect(() => {
    draftRef.current = draft;
  }, [draft]);

  /** Apply a change; keystrokes in the same field within 1.2 s are one undo step. */
  const commit = useCallback((fn: (d: DesignDoc) => DesignDoc, key?: string) => {
    const now = Date.now();
    const merge = !!key && lastKey.current?.key === key && now - lastKey.current.at < 1200;
    lastKey.current = key ? { key, at: now } : null;
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

  // Ctrl/⌘+Z undo, +Shift redo (outside text fields, which keep their own undo),
  // Ctrl/⌘+S publish, Esc back to the section list.
  const publishRef = useRef<() => void>(() => {});
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      const typing = !!t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable);
      const mod = e.metaKey || e.ctrlKey;
      if (mod && e.key.toLowerCase() === "s") {
        e.preventDefault();
        publishRef.current();
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

  // ---- edits ---------------------------------------------------------------

  const update = (fn: (s: StyleSettings) => StyleSettings, key?: string) =>
    commit((d) => ({ ...d, themes: { ...d.themes, [d.active]: fn(d.themes[d.active] ?? {}) } }), key);
  const editSection = (sec: string, fn: (e: Record<string, unknown>) => Record<string, unknown>, key?: string) =>
    update((s) => {
      const next = fn({ ...(s.sections?.[sec] ?? {}) });
      const sections = { ...(s.sections ?? {}) };
      if (Object.keys(next).length) sections[sec] = next as never;
      else delete sections[sec];
      return { ...s, sections };
    }, key);
  const setField = (sec: string, key: string, value: FieldValue) => editSection(sec, (e) => ({ ...e, [key]: value }), `${id}.${sec}.${key}`);
  const setShown = (sec: string, on: boolean) => editSection(sec, (e) => ({ ...e, enabled: on }));
  const resetSection = (sec: string) => {
    editSection(sec, (e) => (typeof e.enabled === "boolean" ? { enabled: e.enabled } : {}));
    say("Restored the template text");
  };

  const pickStyle = (next: StyleId) => {
    if (next === id) return;
    commit((d) => carryOver({ ...d, active: next }, d.active, next));
    setSection(null);
    say(`Switched to ${STYLES[next].name} · your text came with you`);
  };

  const openSection = useCallback((sec: string) => {
    setTab("content");
    setSection(sec);
  }, []);

  async function publish() {
    if (cssError) {
      setTab("look");
      setAdvanced(true);
      say(cssError, true);
      return;
    }
    setPublishing(true);
    try {
      const next = await storeApi.updateTheme(token, JSON.stringify(draft));
      setDashboard(next);
      setSaved(draft);
      say(dashboard.published ? "Published · your store is updated" : "Saved · publish your store to make it public");
    } catch (e) {
      say(e instanceof ApiError ? e.message : "Could not publish your design.", true);
    } finally {
      setPublishing(false);
    }
  }

  useEffect(() => {
    publishRef.current = () => {
      if (dirty && !publishing) void publish();
    };
  });

  const leave = (e: React.MouseEvent) => {
    if (dirty && !window.confirm("You have unpublished changes. Leave without publishing them?")) e.preventDefault();
  };

  const status = dirty
    ? { dot: "bg-[#E8B05A]", label: "Unpublished changes" }
    : dashboard.published
      ? { dot: "bg-[#7CC99A]", label: "Live · up to date" }
      : { dot: "bg-faint", label: "Saved · store not published yet" };

  const current = section ? schema.sections.find((s) => s.id === section) ?? null : null;

  return (
    <div className="flex h-full min-h-0 flex-col bg-background text-foreground">
      {/* Top bar */}
      <header className="flex min-h-[60px] shrink-0 flex-wrap items-center gap-3 border-b border-hairline bg-surface px-3 py-2 sm:pl-3 sm:pr-4 lg:h-[60px] lg:flex-nowrap lg:py-0">
        <div className="flex min-w-0 flex-[1_1_260px] items-center gap-2.5">
          <Link href="/store" onClick={leave} className="inline-flex h-9 items-center gap-1.5 rounded-[10px] pl-1.5 pr-2.5 text-sm text-foreground-2 hover:bg-surface-2">
            <Chevron dir="left" />
            Your store
          </Link>
          <span className="h-5 w-px bg-hairline-2" />
          <div className="flex min-w-0 flex-col gap-0.5">
            <span className="truncate font-display text-[18px] leading-tight text-foreground">{dashboard.name}</span>
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
          {dashboard.published && (
            <a href={`/store/${dashboard.slug}`} target="_blank" rel="noopener noreferrer"
              className="ml-1 inline-flex h-[38px] items-center gap-1.5 rounded-[11px] border border-hairline-2 px-3.5 text-sm font-medium text-foreground hover:bg-surface-2">
              View live <IconExternal />
            </a>
          )}
          <button type="button" onClick={publish} disabled={!dirty || publishing} title="Publish (Ctrl+S)"
            className="h-[38px] rounded-[11px] bg-foreground px-[18px] text-sm font-semibold text-background transition hover:brightness-110 disabled:cursor-default disabled:opacity-40">
            {publishing ? "Publishing…" : "Publish"}
          </button>
        </div>
      </header>

      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto lg:flex-row lg:overflow-hidden">
        {/* Panel */}
        <aside className="flex shrink-0 flex-col border-hairline bg-surface lg:h-full lg:w-[380px] lg:border-r">
          <div className="px-4 pt-4">
            <div role="tablist" aria-label="Editor" className="grid grid-cols-2 gap-0.5 rounded-xl border border-hairline bg-background p-[3px]">
              {(["look", "content"] as Tab[]).map((t) => (
                <button key={t} type="button" role="tab" aria-selected={tab === t}
                  onClick={() => { setTab(t); if (t === "content") setSection(null); }}
                  className={`h-9 rounded-[9px] text-sm font-medium capitalize ${tab === t ? "bg-surface-2 text-foreground shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]" : "text-muted hover:text-foreground"}`}>
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-4 pb-6 pt-2 [scrollbar-color:var(--hairline-2)_transparent] [scrollbar-width:thin] lg:min-h-0">
            {tab === "look" && (
              <>
                <PanelSection title="Theme" aside="Your text stays when you switch">
                  <div className={`grid grid-cols-3 gap-2.5 ${ALL_STYLE_FONTS}`}>
                    {STYLE_IDS.map((sid) => {
                      const st = STYLES[sid];
                      const on = sid === id;
                      const dot = isColor(draft.themes[sid]?.accent) ? draft.themes[sid]!.accent! : st.swatch.accent;
                      return (
                        <button key={sid} type="button" onClick={() => pickStyle(sid)} aria-pressed={on} aria-label={`${st.name} theme`}
                          className="group flex flex-col gap-2 text-left">
                          <span className={`relative flex h-16 w-full items-end justify-between rounded-xl p-2.5 transition group-hover:-translate-y-0.5 ${on ? "ring-2 ring-foreground ring-offset-2 ring-offset-surface" : "shadow-[inset_0_0_0_1px_rgba(128,110,90,0.25)]"}`}
                            style={{ background: st.swatch.bg }}>
                            <span style={{ fontFamily: st.swatch.font, color: st.swatch.fg, fontSize: 24, lineHeight: 1, letterSpacing: "-0.02em", fontWeight: sid === "bold" ? 900 : sid === "modern" ? 800 : sid === "literary" ? 400 : 600 }}>
                              {st.swatch.sample}
                            </span>
                            <span className="h-[9px] w-[9px] rounded-full shadow-[0_0_0_1px_rgba(0,0,0,0.15)]" style={{ background: dot }} />
                            {on && (
                              <span className="absolute right-1.5 top-1.5 flex h-[18px] w-[18px] items-center justify-center rounded-full bg-foreground text-background">
                                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M5 12l5 5 9-10" /></svg>
                              </span>
                            )}
                            {saved.active === sid && !on && (
                              <span className="absolute right-1.5 top-1.5 rounded-full bg-good-soft px-1.5 py-0.5 text-[9.5px] font-semibold text-good">Live</span>
                            )}
                          </span>
                          <span className={`pl-0.5 text-[13px] font-medium ${on ? "text-foreground" : "text-muted"}`}>{st.name}</span>
                        </button>
                      );
                    })}
                  </div>
                  <p className="mt-3.5 text-[13px] leading-relaxed text-muted">{schema.tagline}</p>
                </PanelSection>

                <PanelSection title="Accent">
                  <div className="flex flex-wrap items-center gap-2.5">
                    {schema.accents.map((c, i) => {
                      const on = resolved.accent.toLowerCase() === c.toLowerCase();
                      return (
                        <button key={c} type="button" aria-label={i === 0 ? "Theme default accent" : `Accent ${c}`} aria-pressed={on}
                          onClick={() => update((s) => { const n = { ...s }; if (i === 0) delete n.accent; else n.accent = c; return n; })}
                          className={`h-9 w-9 rounded-full ${on ? "ring-2 ring-foreground ring-offset-2 ring-offset-surface" : "shadow-[inset_0_0_0_1px_rgba(255,255,255,0.18)]"}`}
                          style={{ background: c }} />
                      );
                    })}
                    <label className="inline-flex h-9 cursor-pointer items-center gap-2 rounded-full border border-hairline-2 pl-1.5 pr-3 text-[13px] text-foreground-2">
                      <input type="color" value={resolved.accent} onChange={(e) => update((s) => ({ ...s, accent: e.target.value }), "accent.custom")}
                        className="h-6 w-6 cursor-pointer rounded-full border-0 bg-transparent p-0" />
                      Custom
                    </label>
                  </div>
                  <p className="mt-3 text-[13px] text-muted">Used for buttons, links and highlights.</p>
                </PanelSection>

                {schema.decor && (
                  <PanelSection>
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <h2 className="mb-1 font-display text-[22px] font-normal text-foreground">Moving background</h2>
                        <p className="text-[13px] leading-relaxed text-muted">Decoration behind the page. Still for visitors who turn motion off.</p>
                      </div>
                      <Switch label="Moving background" on={resolved.decor !== "none"}
                        onChange={(on) => update((s) => ({ ...s, decor: on ? schema.decor!.options.find((o) => o.id !== "none")!.id : "none" }))} />
                    </div>
                    {resolved.decor !== "none" && schema.decor.options.filter((o) => o.id !== "none").length > 1 && (
                      <div className="mt-3.5 flex flex-wrap gap-2">
                        {schema.decor.options.filter((o) => o.id !== "none").map((o) => (
                          <button key={o.id} type="button" aria-pressed={resolved.decor === o.id} onClick={() => update((s) => ({ ...s, decor: o.id }))}
                            className={`rounded-full border px-3 py-1.5 text-[13px] ${resolved.decor === o.id ? "border-foreground bg-foreground text-background" : "border-hairline-2 text-foreground-2 hover:border-muted"}`}>
                            {o.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </PanelSection>
                )}

                <div className="pt-3.5">
                  <button type="button" aria-expanded={advanced} onClick={() => setAdvanced(!advanced)}
                    className="flex w-full items-center justify-between rounded-lg px-0.5 py-3 text-[13px] font-medium text-foreground-2 hover:bg-surface-2">
                    <span>Advanced · Custom CSS</span>
                    <span className={`transition-transform ${advanced ? "rotate-90" : ""}`}><Chevron dir="right" /></span>
                  </button>
                  {advanced && (
                    <div className="flex flex-col gap-2 px-0.5 pt-1">
                      <label htmlFor="css-box" className="text-xs leading-relaxed text-muted">
                        For fine-tuning only. The page is .store-page; sections are [data-section=&quot;hero&quot;], [data-section=&quot;books&quot;] and so on. url(), @import and backslashes aren&apos;t allowed.
                      </label>
                      <textarea id="css-box" rows={7} spellCheck={false} value={css}
                        onChange={(e) => update((s) => ({ ...s, customCss: e.target.value }), "css")}
                        placeholder={'[data-section="hero"] h1 { letter-spacing: -0.04em; }'}
                        aria-invalid={!!cssError}
                        className={`${fieldCls} resize-y font-mono text-[12.5px] leading-relaxed`} />
                      {cssError && <p className="text-xs text-red-600 dark:text-red-400">{cssError}</p>}
                    </div>
                  )}
                </div>
              </>
            )}

            {tab === "content" && !current && (
              <div className="animate-[sd-in_.18s_ease-out]">
                <div className="mx-0.5 my-3.5 flex items-center gap-2.5 rounded-xl bg-accent-soft px-3.5 py-3 text-[13px] leading-snug text-accent-ink">
                  <IconPointer />
                  <span>Tip: click any part of the preview to jump straight to it.</span>
                </div>
                <h2 className="mx-0.5 mb-2 mt-1 font-display text-[22px] font-normal text-foreground">Page sections</h2>
                <div className="flex flex-col border-t border-hairline">
                  {schema.sections.map((sec, i) => {
                    const r = resolved.sections[sec.id];
                    const shown = r?.enabled ?? true;
                    return (
                      <div key={sec.id} className="flex items-center border-b border-hairline">
                        <button type="button" onClick={() => openSection(sec.id)}
                          className="group flex min-w-0 flex-1 items-center gap-3 rounded-lg py-3 pl-1 pr-2 text-left hover:bg-surface-2">
                          <span className="w-[18px] shrink-0 font-mono text-[11px] text-faint">{String(i + 1).padStart(2, "0")}</span>
                          <span className={`flex min-w-0 flex-1 flex-col gap-0.5 ${shown ? "" : "opacity-45"}`}>
                            <span className="text-sm font-medium text-foreground">{sec.label}</span>
                            <span className="truncate text-[12.5px] text-muted">{leadOf(sec, r?.values ?? {}) || " "}</span>
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
                  Ebooks, prices and chapters come from <Link href="/store" onClick={leave} className="text-foreground underline">Your store</Link>. Change them there and the page updates on its own.
                </p>
              </div>
            )}

            {tab === "content" && current && (
              <div key={current.id} className="animate-[sd-in_.18s_ease-out] pt-2.5">
                <button type="button" onClick={() => setSection(null)}
                  className="inline-flex h-8 items-center gap-1 rounded-[9px] pl-1 pr-2.5 text-[13px] font-medium text-foreground-2 hover:bg-surface-2">
                  <Chevron dir="left" />
                  All sections
                </button>
                <div className="mx-0.5 mb-1 mt-2.5 flex items-center justify-between gap-3">
                  <h2 className="font-display text-[28px] font-normal leading-tight text-foreground">{current.label}</h2>
                  {current.optional && (
                    <Switch label="Show this section" on={resolved.sections[current.id]?.enabled ?? true} onChange={(on) => setShown(current.id, on)}
                      text={(resolved.sections[current.id]?.enabled ?? true) ? "Shown" : "Hidden"} />
                  )}
                </div>
                <p className="mx-0.5 mb-4 text-[13px] text-muted">Edits show in the preview as you type.</p>
                {!(resolved.sections[current.id]?.enabled ?? true) && (
                  <div className="mx-0.5 mb-4 rounded-xl bg-warn-soft px-3.5 py-3 text-[13px] leading-snug text-warn">
                    This section is hidden on your store. Turn it on to show it.
                  </div>
                )}
                <div className="flex flex-col gap-[18px] px-0.5">
                  {groupFields(current.fields).map((g, gi) => {
                    const fields = g.fields.map((f) => (
                      <FieldEditor key={`${id}-${current.id}-${f.key}`} field={f} label={g.title ? sublabel(f.label) : f.label}
                        value={resolved.sections[current.id]?.values[f.key]} onChange={(v) => setField(current.id, f.key, v)} />
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
                {NOTES[current.id] && (
                  <p className="mx-0.5 mt-5 rounded-xl bg-surface-2 px-3.5 py-3 text-[13px] leading-relaxed text-foreground-2">
                    {NOTES[current.id]} <Link href="/store" onClick={leave} className="text-foreground underline">Open Your store</Link>
                  </p>
                )}
                <button type="button" onClick={() => resetSection(current.id)}
                  className="mt-5 inline-flex h-[34px] items-center gap-1.5 rounded-[9px] px-2.5 text-[13px] font-medium text-muted hover:bg-surface-2 hover:text-foreground">
                  <IconReset />
                  Restore the template text
                </button>
              </div>
            )}
          </div>
        </aside>

        {/* Preview */}
        <main className="relative flex h-[78vh] min-w-0 shrink-0 flex-col gap-3 bg-background px-3 pb-4 pt-4 sm:px-6 lg:h-auto lg:min-h-0 lg:flex-1">
          <div className="flex items-center justify-between gap-3 px-1 text-[12.5px] text-muted">
            <span className="inline-flex items-center gap-2"><IconPointer /> Click anything on your store to edit it</span>
            <span>{schema.name} theme</span>
          </div>
          <div className="min-h-0 min-w-0 flex-1">
            <DevicePreview
              device={device}
              url={`scrivetta.com/store/${dashboard.slug}`}
              onPick={openSection}
              message={{ doc: draft, data, styleId: id, focus: tab === "content" ? section : null, pick: { labels, selected: tab === "content" ? section : null } }}
            />
          </div>
          {toast && (
            <div role="status"
              className={`absolute bottom-10 left-1/2 z-10 flex -translate-x-1/2 items-center gap-2.5 whitespace-nowrap rounded-xl px-[18px] py-3 text-sm font-medium shadow-[0_16px_40px_rgba(0,0,0,0.45)] ${toast.error ? "bg-red-700 text-white" : "bg-foreground text-background"}`}>
              {!toast.error && <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M5 12l5 5 9-10" /></svg>}
              {toast.msg}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

/**
 * On a style switch, bring along what the author already wrote: any field the
 * old style and the new one share (same section, same key, same kind) that was
 * edited in the old style and not yet in the new one.
 */
function carryOver(doc: DesignDoc, from: StyleId, to: StyleId): DesignDoc {
  const src = doc.themes[from]?.sections ?? {};
  const dst = { ...(doc.themes[to]?.sections ?? {}) };
  const fromSchema = STYLES[from];
  let changed = false;
  for (const sec of STYLES[to].sections) {
    const fromSec = fromSchema.sections.find((s) => s.id === sec.id);
    const edits = src[sec.id];
    if (!fromSec || !edits) continue;
    for (const f of sec.fields) {
      const ff = fromSec.fields.find((x) => x.key === f.key);
      if (!ff || ff.type !== f.type || edits[f.key] === undefined || dst[sec.id]?.[f.key] !== undefined) continue;
      dst[sec.id] = { ...(dst[sec.id] ?? {}), [f.key]: edits[f.key] };
      changed = true;
    }
  }
  return changed ? { ...doc, themes: { ...doc.themes, [to]: { ...(doc.themes[to] ?? {}), sections: dst } } } : doc;
}

/** What a section says, for its row in the list: its headline or title first, never a small label. */
const LEAD_KEYS = ["headline", "title", "quote", "text", "intro", "window", "items", "flowTitle", "partsTitle"];
const SKIP_KEYS = new Set(["eyebrow", "badgeTag", "badge", "label", "kicker"]);

export function leadOf<C>(sec: SectionSchema<C>, values: Record<string, FieldValue>): string {
  const order = [
    ...LEAD_KEYS.map((k) => sec.fields.find((f) => f.key === k)).filter((f): f is Field<C> => !!f),
    ...sec.fields.filter((f) => !LEAD_KEYS.includes(f.key) && !SKIP_KEYS.has(f.key)),
  ];
  for (const f of order) {
    const v = values[f.key];
    if (typeof v === "string" && v.trim()) return v.replace(/\*/g, "").replace(/\s*\n\s*/g, " ");
    if (Array.isArray(v) && v.length) {
      const first = v[0];
      if (typeof first === "string") {
        const list = v.filter((x): x is string => typeof x === "string" && !!x.trim());
        if (list.length) return list.join(" · ");
      } else if (first && typeof first === "object") {
        const text = Object.values(first as Item).find((x) => x && x.trim());
        if (text) return text;
      }
    }
  }
  return "";
}

// ---- small UI pieces ----------------------------------------------------------

export const fieldCls =
  "box-border w-full rounded-[10px] border border-hairline-2 bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-faint transition-colors focus:border-foreground/50 focus:outline-none";

export function PanelSection({ title, aside, children }: { title?: string; aside?: string; children: React.ReactNode }) {
  return (
    <section className="border-b border-hairline px-0.5 py-[22px] first:pt-[18px]">
      {title && (
        <div className="mb-3.5 flex items-baseline justify-between gap-3">
          <h2 className="font-display text-[22px] font-normal text-foreground">{title}</h2>
          {aside && <span className="text-xs text-muted">{aside}</span>}
        </div>
      )}
      {children}
    </section>
  );
}

export function Switch({ label, on, onChange, text }: { label: string; on: boolean; onChange: (on: boolean) => void; text?: string }) {
  return (
    <button type="button" role="switch" aria-checked={on} aria-label={label} onClick={() => onChange(!on)}
      className="inline-flex shrink-0 items-center gap-2.5 text-[13px] font-medium text-foreground-2">
      {text && <span>{text}</span>}
      <span className={`flex h-7 w-[46px] rounded-full p-[3px] ${on ? "justify-end bg-foreground" : "justify-start bg-hairline-2"}`}>
        <span className={`h-[22px] w-[22px] rounded-full ${on ? "bg-background" : "bg-muted"}`} />
      </span>
    </button>
  );
}

export function IconButton({ label, hint, onClick, disabled, pressed, children }: {
  label: string; hint?: string; onClick: () => void; disabled?: boolean; pressed?: boolean; children: React.ReactNode;
}) {
  return (
    <button type="button" aria-label={label} title={hint ? `${label} (${hint})` : label} aria-pressed={pressed} disabled={disabled} onClick={onClick}
      className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] text-foreground-2 hover:bg-surface-2 disabled:cursor-default disabled:opacity-35 disabled:hover:bg-transparent">
      {children}
    </button>
  );
}

/**
 * Fields named "Group — part" next to each other become one titled group
 * ("Floating card 1" → title, text), so long sections read as a few blocks.
 */
export function groupFields<C>(fields: Field<C>[]): { title: string | null; fields: Field<C>[] }[] {
  const out: { title: string | null; fields: Field<C>[] }[] = [];
  for (const f of fields) {
    const m = f.label.match(/^(.+?) — (.+)$/);
    const title = m ? m[1] : null;
    const last = out[out.length - 1];
    if (last && title && last.title === title) last.fields.push(f);
    else out.push({ title, fields: [f] });
  }
  // A "group" of one is just a field.
  return out.flatMap((g) => (g.title && g.fields.length === 1 ? [{ title: null, fields: g.fields }] : [g]));
}

export function sublabel(label: string) {
  const part = label.split(" — ").slice(1).join(" — ");
  return part ? part[0].toUpperCase() + part.slice(1) : label;
}

export function FieldEditor<C>({ field, label: labelText, value, onChange }: {
  field: Field<C>; label?: string; value: FieldValue | undefined; onChange: (v: FieldValue) => void;
}) {
  const id = useId();
  const label = labelText ?? field.label;
  const head = (count?: string) => (
    <div className="flex items-baseline justify-between gap-2.5">
      <label htmlFor={id} className="text-[13px] font-medium text-foreground-2">{label}</label>
      {count && <span className="font-mono text-[11px] text-faint">{count}</span>}
    </div>
  );
  const hint = field.hint ? <p className="text-xs leading-relaxed text-faint">{field.hint}</p> : null;

  if (field.type === "items") {
    const rows = Array.isArray(value) ? (value as Item[]) : [];
    const set = (next: Item[]) => onChange(next);
    const max = field.max ?? 12;
    return (
      <div className="flex flex-col gap-2">
        <div className="flex items-baseline justify-between gap-2.5">
          <span className="text-[13px] font-medium text-foreground-2">{label}</span>
          <span className="font-mono text-[11px] text-faint">{rows.length} / {max}</span>
        </div>
        {hint}
        {rows.map((row, i) => (
          <div key={i} className="flex flex-col gap-2 rounded-xl border border-hairline bg-background/60 p-3">
            {field.fields.map((sf) => {
              const v = typeof row?.[sf.key] === "string" ? row[sf.key] : "";
              const change = (nv: string) => set(rows.map((r, j) => (j === i ? { ...r, [sf.key]: nv } : r)));
              return sf.multiline ? (
                <textarea key={sf.key} aria-label={`${sf.label} ${i + 1}`} placeholder={sf.label} value={v} rows={2} onChange={(e) => change(e.target.value)} className={`${fieldCls} resize-y`} />
              ) : (
                <input key={sf.key} aria-label={`${sf.label} ${i + 1}`} placeholder={sf.label} value={v} onChange={(e) => change(e.target.value)} className={fieldCls} />
              );
            })}
            <div className="flex gap-3 text-xs text-muted">
              <button type="button" disabled={i === 0} onClick={() => set(swap(rows, i, i - 1))} className="hover:text-foreground disabled:opacity-40">↑ Up</button>
              <button type="button" disabled={i === rows.length - 1} onClick={() => set(swap(rows, i, i + 1))} className="hover:text-foreground disabled:opacity-40">↓ Down</button>
              <button type="button" onClick={() => set(rows.filter((_, j) => j !== i))} className="ml-auto hover:text-red-600">Remove</button>
            </div>
          </div>
        ))}
        {rows.length < max && (
          <button type="button" onClick={() => set([...rows, Object.fromEntries(field.fields.map((sf) => [sf.key, ""]))])}
            className="self-start rounded-full border border-dashed border-hairline-2 px-3.5 py-1.5 text-[13px] text-foreground-2 hover:border-muted">
            + Add
          </button>
        )}
      </div>
    );
  }

  if (field.type === "list") {
    const lines = Array.isArray(value) ? (value as string[]) : [];
    const mono = field.key === "tree";
    return (
      <div className="flex flex-col gap-[7px]">
        {head(`${lines.filter((l) => l.trim()).length} items`)}
        <textarea id={id} value={lines.join("\n")} rows={Math.min(9, Math.max(3, lines.length + 1))} spellCheck={!mono}
          onChange={(e) => onChange(e.target.value.split("\n"))} className={`${fieldCls} resize-y ${mono ? "font-mono text-[12.5px]" : ""}`} />
        <p className="text-xs leading-relaxed text-faint">{field.hint ?? "One per line."}</p>
      </div>
    );
  }

  const text = typeof value === "string" ? value : "";
  const code = field.type === "code";
  return (
    <div className="flex flex-col gap-[7px]">
      {head(code ? `${text.split("\n").length} lines` : undefined)}
      {field.type === "text" ? (
        <input id={id} type="text" value={text} onChange={(e) => onChange(e.target.value)} className={`${fieldCls} h-[42px] py-0`} />
      ) : (
        <textarea id={id} value={text} onChange={(e) => onChange(e.target.value)} spellCheck={!code} wrap={code ? "off" : undefined}
          rows={code ? Math.min(18, Math.max(6, text.split("\n").length + 1)) : Math.min(8, Math.max(2, Math.ceil(text.length / 42) + 1))}
          className={`${fieldCls} resize-y ${code ? "overflow-x-auto whitespace-pre font-mono text-[12.5px] leading-relaxed" : "leading-normal"}`} />
      )}
      {hint}
    </div>
  );
}

function swap<T>(a: T[], i: number, j: number): T[] {
  const b = [...a];
  [b[i], b[j]] = [b[j], b[i]];
  return b;
}

// ---- icons (stroke, 24px grid) ----------------------------------------------------

const ic = { fill: "none", stroke: "currentColor", strokeWidth: 1.7, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, "aria-hidden": true };
export const Chevron = ({ dir }: { dir: "left" | "right" }) => <svg width="15" height="15" viewBox="0 0 24 24" {...ic}><path d={dir === "left" ? "M15 18l-6-6 6-6" : "M9 6l6 6-6 6"} /></svg>;
export const IconDesktop = () => <svg width="15" height="15" viewBox="0 0 24 24" {...ic}><rect x="3" y="4" width="18" height="12" rx="2" /><path d="M8 20h8M12 16v4" /></svg>;
export const IconPhone = () => <svg width="15" height="15" viewBox="0 0 24 24" {...ic}><rect x="7" y="3" width="10" height="18" rx="2" /><path d="M11 18h2" /></svg>;
export const IconUndo = () => <svg width="17" height="17" viewBox="0 0 24 24" {...ic}><path d="M9 14L4 9l5-5" /><path d="M4 9h10.5a5.5 5.5 0 0 1 0 11H11" /></svg>;
export const IconRedo = () => <svg width="17" height="17" viewBox="0 0 24 24" {...ic}><path d="M15 14l5-5-5-5" /><path d="M20 9H9.5a5.5 5.5 0 0 0 0 11H13" /></svg>;
export const IconExternal = () => <svg width="14" height="14" viewBox="0 0 24 24" {...ic}><path d="M14 4h6v6" /><path d="M20 4l-9 9" /><path d="M19 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h5" /></svg>;
export const IconPointer = () => <svg width="15" height="15" viewBox="0 0 24 24" {...ic} style={{ flexShrink: 0 }}><path d="M5 3l14 7-6 2-2 6z" /></svg>;
export const IconEye = () => <svg width="17" height="17" viewBox="0 0 24 24" {...ic}><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" /><circle cx="12" cy="12" r="3" /></svg>;
export const IconEyeOff = () => <svg width="17" height="17" viewBox="0 0 24 24" {...ic}><path d="M3 3l18 18" /><path d="M10.6 5.1A10.6 10.6 0 0 1 12 5c6.5 0 10 7 10 7a17 17 0 0 1-3.2 4.2M6.6 6.6A17.4 17.4 0 0 0 2 12s3.5 7 10 7a10 10 0 0 0 5.4-1.6" /><path d="M9.9 9.9a3 3 0 0 0 4.2 4.2" /></svg>;
export const IconReset = () => <svg width="14" height="14" viewBox="0 0 24 24" {...ic}><path d="M3 12a9 9 0 1 0 3-6.7L3 8" /><path d="M3 3v5h5" /></svg>;
