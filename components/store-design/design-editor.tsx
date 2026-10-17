"use client";

import { useEffect, useId, useMemo, useState } from "react";
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
import { Alert, Button, ButtonLink, controlBase } from "@/components/ui";
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

export function DesignEditor({ token, initial }: { token: string; initial: StoreDashboard }) {
  const [dashboard, setDashboard] = useState(initial);
  const [saved, setSaved] = useState<DesignDoc>(() => parseDesign(initial.themeSettings));
  const [draft, setDraft] = useState<DesignDoc>(saved);
  const [device, setDevice] = useState<Device>("desktop");
  const [open, setOpen] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [justSaved, setJustSaved] = useState(false);

  const data = useMemo(() => previewData(dashboard), [dashboard]);
  const ctx = useMemo(() => makeCtx(data), [data]);
  const id = draft.active;
  const schema = STYLES[id];
  const settings: StyleSettings = useMemo(() => draft.themes[id] ?? {}, [draft, id]);
  const resolved = useMemo(() => resolveStyle(schema, settings, ctx), [schema, settings, ctx]);
  const dirty = JSON.stringify(draft) !== JSON.stringify(saved);
  const css = settings.customCss ?? "";
  const cssError = css ? cssProblem(css) : null;

  useEffect(() => {
    if (!dirty) return;
    const warn = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  // ---- edits ---------------------------------------------------------------

  const update = (fn: (s: StyleSettings) => StyleSettings) => {
    setJustSaved(false);
    setDraft((d) => ({ ...d, themes: { ...d.themes, [d.active]: fn(d.themes[d.active] ?? {}) } }));
  };
  const setSection = (sec: string, fn: (e: Record<string, unknown>) => Record<string, unknown>) =>
    update((s) => {
      const next = fn({ ...(s.sections?.[sec] ?? {}) });
      const sections = { ...(s.sections ?? {}) };
      if (Object.keys(next).length) sections[sec] = next as never;
      else delete sections[sec];
      return { ...s, sections };
    });
  const setField = (sec: string, key: string, value: FieldValue) => setSection(sec, (e) => ({ ...e, [key]: value }));
  const toggle = (sec: string, on: boolean) =>
    setSection(sec, (e) => {
      const { enabled: _ignored, ...rest } = e;
      void _ignored;
      return on ? rest : { ...rest, enabled: false };
    });
  const resetSection = (sec: string) =>
    setSection(sec, (e) => (e.enabled === false ? { enabled: false } : {}));
  const pickStyle = (next: StyleId) => {
    setJustSaved(false);
    setOpen(null);
    setDraft((d) => ({ ...d, active: next }));
  };

  async function save() {
    if (cssError) {
      setError(cssError);
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const next = await storeApi.updateTheme(token, JSON.stringify(draft));
      setDashboard(next);
      setSaved(draft);
      setJustSaved(true);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Could not save your design.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Top bar */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <Link href="/store" className="text-sm text-muted hover:text-foreground">← Your store</Link>
          <h1 className="mt-1 font-display text-[34px] font-light leading-[1.05] tracking-[-0.02em] text-foreground">Store design</h1>
          <p className="mt-1 text-sm text-muted">Pick a style, then make every word of it yours. Changes show in the preview right away.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-sm text-muted" aria-live="polite">
            {dirty ? "Unsaved changes" : justSaved ? "Saved — your store shows this design" : saved.active === id ? "Live on your store" : ""}
          </span>
          {dashboard.published && <ButtonLink href={`/store/${dashboard.slug}`} variant="secondary">View store</ButtonLink>}
          <Button onClick={save} loading={saving} disabled={!dirty || !!cssError}>Save design</Button>
        </div>
      </div>
      {error && <Alert>{error}</Alert>}

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,380px)_minmax(0,1fr)]">
        {/* Preview (first on small screens) */}
        <div className="order-first flex flex-col gap-3 lg:sticky lg:top-6 lg:order-last">
          <div className="flex items-center justify-between gap-3">
            <span className="text-sm font-medium text-foreground-2">Preview · {schema.name}</span>
            <div role="radiogroup" aria-label="Preview size" className="inline-flex rounded-full border border-hairline-2 bg-surface p-1">
              {(["desktop", "phone"] as Device[]).map((d) => (
                <button key={d} type="button" role="radio" aria-checked={device === d} onClick={() => setDevice(d)}
                  className={`rounded-full px-4 py-1.5 text-sm font-medium capitalize ${device === d ? "bg-foreground text-background" : "text-foreground-2 hover:text-foreground"}`}>
                  {d}
                </button>
              ))}
            </div>
          </div>
          <div className="h-[560px] rounded-2xl border border-hairline bg-surface-2 p-3 lg:h-[calc(100vh-150px)]">
            <DevicePreview device={device} message={{ doc: draft, data, styleId: id, focus: open }} />
          </div>
        </div>

        {/* Controls */}
        <div className="flex min-w-0 flex-col gap-5">
          <Panel title="Style">
            <div className={`grid grid-cols-2 gap-3 ${ALL_STYLE_FONTS}`}>
              {STYLE_IDS.map((sid) => {
                const st = STYLES[sid];
                const on = sid === id;
                return (
                  <button key={sid} type="button" onClick={() => pickStyle(sid)} aria-pressed={on}
                    className={`group flex flex-col overflow-hidden rounded-2xl border text-left transition ${on ? "border-foreground ring-2 ring-foreground/20" : "border-hairline-2 hover:border-muted"}`}>
                    <span className="relative flex h-[86px] items-end justify-between px-3 pb-2.5" style={{ background: st.swatch.bg, color: st.swatch.fg }}>
                      <span style={{ fontFamily: st.swatch.font, fontSize: 34, lineHeight: 1, fontWeight: sid === "bold" ? 900 : sid === "modern" ? 800 : 400, letterSpacing: "-.04em" }}>{st.swatch.sample}</span>
                      <span className="mb-1 h-3.5 w-3.5 rounded-full" style={{ background: isColor(draft.themes[sid]?.accent) ? draft.themes[sid]!.accent : st.swatch.accent }} />
                      {saved.active === sid && <span className="absolute right-2 top-2 rounded-full bg-good-soft px-2 py-0.5 text-[10.5px] font-semibold text-good">Live</span>}
                    </span>
                    <span className="flex flex-col gap-0.5 bg-surface px-3 py-2.5">
                      <span className="text-sm font-semibold text-foreground">{st.name}</span>
                      <span className="line-clamp-2 text-xs leading-snug text-muted">{st.tagline}</span>
                    </span>
                  </button>
                );
              })}
            </div>
          </Panel>

          {id === "classic" ? (
            <Panel title="Classic">
              <p className="text-sm leading-relaxed text-muted">
                Classic takes its texts from your profile (name, headline, about you) and follows each reader&apos;s light or dark setting.
                Edit them on <Link href="/store" className="font-medium text-accent hover:underline">Your store</Link>, or pick another style to write every section yourself.
              </p>
            </Panel>
          ) : (
            <>
              <Panel title="Colors & effects">
                <div className="flex flex-col gap-4">
                  <div className="flex flex-col gap-2">
                    <span className="text-sm font-medium text-foreground-2">Accent color</span>
                    <div className="flex flex-wrap items-center gap-2">
                      {schema.accents.map((c) => (
                        <button key={c} type="button" onClick={() => update((s) => ({ ...s, accent: c }))} aria-label={`Accent ${c}`} aria-pressed={resolved.accent === c}
                          className={`h-9 w-9 rounded-full border-2 ${resolved.accent === c ? "border-foreground" : "border-transparent"}`}
                          style={{ background: c, boxShadow: "inset 0 0 0 1px rgba(0,0,0,.15)" }} />
                      ))}
                      <label className="flex items-center gap-2 rounded-full border border-hairline-2 py-1 pl-1 pr-3 text-sm text-foreground-2">
                        <input type="color" value={resolved.accent} onChange={(e) => update((s) => ({ ...s, accent: e.target.value }))} className="h-7 w-7 cursor-pointer rounded-full border-0 bg-transparent p-0" />
                        Custom
                      </label>
                    </div>
                  </div>
                  {schema.decor && (
                    <div className="flex flex-col gap-2">
                      <span className="text-sm font-medium text-foreground-2">Background effects</span>
                      <div className="flex flex-wrap gap-2">
                        {schema.decor.options.map((o) => (
                          <button key={o.id} type="button" onClick={() => update((s) => ({ ...s, decor: o.id }))} aria-pressed={resolved.decor === o.id}
                            className={`rounded-full border px-3.5 py-1.5 text-sm ${resolved.decor === o.id ? "border-foreground bg-foreground text-background" : "border-hairline-2 text-foreground-2 hover:border-muted"}`}>
                            {o.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </Panel>

              <Panel title="Sections" hint="Open a section to edit it — the preview jumps there. Texts left untouched follow your profile and ebooks.">
                <div className="flex flex-col divide-y divide-hairline">
                  {schema.sections.map((sec) => (
                    <SectionEditor
                      key={`${id}-${sec.id}`}
                      sec={sec}
                      open={open === sec.id}
                      onOpen={() => setOpen(open === sec.id ? null : sec.id)}
                      enabled={resolved.sections[sec.id]?.enabled ?? true}
                      values={resolved.sections[sec.id]?.values ?? {}}
                      edited={!!settings.sections?.[sec.id] && Object.keys(settings.sections[sec.id]).some((k) => k !== "enabled")}
                      onToggle={(on) => toggle(sec.id, on)}
                      onChange={(k, v) => setField(sec.id, k, v)}
                      onReset={() => resetSection(sec.id)}
                    />
                  ))}
                </div>
              </Panel>
            </>
          )}

          <Panel title="Custom CSS" hint="Optional, for fine-tuning. The page root is .store-page; sections are [data-section=&quot;hero&quot;], [data-section=&quot;books&quot;] and so on. url(), @import and backslashes aren't allowed.">
            <textarea
              value={css}
              onChange={(e) => update((s) => ({ ...s, customCss: e.target.value }))}
              spellCheck={false}
              rows={7}
              placeholder={`[data-section="hero"] h1 {\n  letter-spacing: -0.06em;\n}`}
              className={`${controlBase} w-full font-mono text-[12.5px] leading-relaxed`}
              aria-invalid={!!cssError}
            />
            {cssError && <p className="mt-2 text-xs text-red-600 dark:text-red-400">{cssError}</p>}
          </Panel>
        </div>
      </div>
    </div>
  );
}

function Panel({ title, hint, children }: { title: string; hint?: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-hairline bg-surface p-5">
      <h2 className="font-display text-[22px] font-normal text-foreground">{title}</h2>
      {hint && <p className="mt-1 text-xs leading-relaxed text-muted">{hint}</p>}
      <div className="mt-4">{children}</div>
    </section>
  );
}

function SectionEditor({ sec, open, onOpen, enabled, values, edited, onToggle, onChange, onReset }: {
  sec: SectionSchema;
  open: boolean;
  onOpen: () => void;
  enabled: boolean;
  values: Record<string, FieldValue>;
  edited: boolean;
  onToggle: (on: boolean) => void;
  onChange: (key: string, v: FieldValue) => void;
  onReset: () => void;
}) {
  return (
    <div className="py-1">
      <div className="flex items-center gap-3 py-2">
        <button type="button" onClick={onOpen} aria-expanded={open} className="flex flex-1 items-center gap-2 text-left">
          <span aria-hidden className={`text-muted transition-transform ${open ? "rotate-90" : ""}`}>›</span>
          <span className={`text-[15px] font-semibold ${enabled ? "text-foreground" : "text-faint line-through"}`}>{sec.label}</span>
          {edited && <span className="rounded-full bg-accent-soft px-2 py-0.5 text-[10.5px] font-semibold text-accent-ink">edited</span>}
        </button>
        {sec.optional && (
          <label className="flex cursor-pointer items-center gap-2 text-xs text-muted">
            <input type="checkbox" checked={enabled} onChange={(e) => onToggle(e.target.checked)} className="h-4 w-4 accent-[var(--accent)]" />
            Show
          </label>
        )}
      </div>
      {open && (
        <div className="flex flex-col gap-4 pb-4 pl-5">
          {sec.fields.map((f) => <FieldEditor key={f.key} field={f} value={values[f.key]} onChange={(v) => onChange(f.key, v)} />)}
          {edited && (
            <button type="button" onClick={onReset} className="self-start text-xs font-medium text-muted underline hover:text-foreground">
              Reset this section to the defaults
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function FieldEditor({ field, value, onChange }: { field: Field; value: FieldValue | undefined; onChange: (v: FieldValue) => void }) {
  const id = useId();
  const label = <label htmlFor={id} className="text-sm font-medium text-foreground-2">{field.label}</label>;
  const hint = field.hint ? <p className="text-xs leading-relaxed text-faint">{field.hint}</p> : null;

  if (field.type === "items") {
    const rows = Array.isArray(value) ? (value as Item[]) : [];
    const set = (next: Item[]) => onChange(next);
    const max = field.max ?? 12;
    return (
      <div className="flex flex-col gap-2">
        <span className="text-sm font-medium text-foreground-2">{field.label}</span>
        {hint}
        {rows.map((row, i) => (
          <div key={i} className="flex flex-col gap-2 rounded-xl border border-hairline bg-surface-2 p-3">
            {field.fields.map((sf) => {
              const v = typeof row?.[sf.key] === "string" ? row[sf.key] : "";
              const change = (nv: string) => set(rows.map((r, j) => (j === i ? { ...r, [sf.key]: nv } : r)));
              return sf.multiline ? (
                <textarea key={sf.key} aria-label={`${sf.label} ${i + 1}`} placeholder={sf.label} value={v} rows={2} onChange={(e) => change(e.target.value)} className={`${controlBase} w-full`} />
              ) : (
                <input key={sf.key} aria-label={`${sf.label} ${i + 1}`} placeholder={sf.label} value={v} onChange={(e) => change(e.target.value)} className={`${controlBase} w-full`} />
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
            className="self-start rounded-full border border-dashed border-hairline-2 px-3.5 py-1.5 text-sm text-foreground-2 hover:border-muted">
            + Add
          </button>
        )}
      </div>
    );
  }

  if (field.type === "list") {
    const lines = Array.isArray(value) ? (value as string[]) : [];
    return (
      <div className="flex flex-col gap-1.5">
        {label}
        <textarea id={id} value={lines.join("\n")} rows={Math.min(8, Math.max(3, lines.length + 1))} spellCheck={field.key !== "tree"}
          onChange={(e) => onChange(e.target.value.split("\n"))} className={`${controlBase} w-full ${field.key === "tree" ? "font-mono text-[12.5px]" : ""}`} />
        <p className="text-xs leading-relaxed text-faint">{field.hint ?? "One per line."}</p>
      </div>
    );
  }

  const text = typeof value === "string" ? value : "";
  return (
    <div className="flex flex-col gap-1.5">
      {label}
      {field.type === "text" ? (
        <input id={id} value={text} onChange={(e) => onChange(e.target.value)} className={`${controlBase} w-full`} />
      ) : (
        <textarea id={id} value={text} onChange={(e) => onChange(e.target.value)} spellCheck={field.type !== "code"}
          rows={field.type === "code" ? Math.min(18, Math.max(6, text.split("\n").length + 1)) : 3}
          className={`${controlBase} w-full ${field.type === "code" ? "whitespace-pre font-mono text-[12.5px] leading-relaxed" : ""}`}
          style={field.type === "code" ? { overflowX: "auto" } : undefined} wrap={field.type === "code" ? "off" : undefined} />
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
