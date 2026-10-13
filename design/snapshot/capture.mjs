// Captures every Scrivetta screen as a static HTML frame (no JS, real CSS) and
// lays them out on a Figma-like board: design/snapshot/out/index.html.
//
//   npx next build && npx next start -p 3100
//   NODE_PATH=$(npm root -g) node design/snapshot/capture.mjs   # BASE=http://localhost:3100
//
// The backend is mocked (mocks.mjs), so signed-in screens show sample data.

import { createRequire } from "node:module";
import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { mockApi } from "./mocks.mjs";

const require = createRequire(import.meta.url);
let chromium;
try {
  ({ chromium } = require("playwright"));
} catch {
  ({ chromium } = require("/opt/node-tools/node_modules/playwright"));
}

const BASE = process.env.BASE || "http://localhost:3100";
const API = process.env.API || "http://localhost:8080";
const HERE = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(HERE, "out");
const ASSETS = path.join(OUT, "assets");

const DESKTOP = { width: 1440, height: 900 };
const MOBILE = { width: 390, height: 844 };

// [id, section, title, path, options]
const SCREENS = [
  ["dashboard", "Workspace", "Dashboard / library", "/dashboard", { auth: true }],
  ["dashboard-empty", "Workspace", "Dashboard — empty library", "/dashboard", { auth: true, emptyLibrary: true }],
  ["new-ebook", "Workspace", "New ebook — brief form", "/ebooks/new", { auth: true }],
  ["ebook-draft", "Workspace", "Ebook draft — knowledge + blueprint", "/ebooks/b-draft", { auth: true }],
  ["ebook-writing", "Workspace", "Ebook — generating", "/ebooks/b-writing", { auth: true }],
  ["ebook-completed", "Workspace", "Ebook — completed", "/ebooks/b-done", { auth: true }],
  ["ebook-failed", "Workspace", "Ebook — failed / resumable", "/ebooks/b-failed", { auth: true }],
  ["billing", "Workspace", "Billing & credits", "/billing", { auth: true }],
  ["editor", "Workspace", "Editor", "/ebooks/b-done/edit", { auth: true, fullPage: false, wait: 3500 }],

  ["landing", "Marketing", "Landing page", "/", {}],
  ["landing-cookie", "Marketing", "Landing — cookie banner (first visit)", "/", { consent: false, fullPage: false }],
  ["ai-ebook-generator", "Marketing", "AI ebook generator (SEO page)", "/ai-ebook-generator", {}],
  ["how-to", "Marketing", "How to write an ebook with AI", "/how-to-write-an-ebook-with-ai", {}],
  ["blog", "Marketing", "Blog index", "/blog", {}],
  ["blog-post", "Marketing", "Blog post", "/blog/plan-an-ebook-outline-with-ai", {}],
  ["terms", "Marketing", "Terms", "/terms", {}],
  ["privacy", "Marketing", "Privacy", "/privacy", {}],

  ["login", "Auth", "Log in", "/login", {}],
  ["register", "Auth", "Register", "/register", {}],
  ["forgot-password", "Auth", "Forgot password", "/forgot-password", {}],
  ["check-email", "Auth", "Check your email", "/check-email?email=anna%40example.com", {}],
  ["reset-password", "Auth", "Reset password", "/reset-password?tokenId=x&token=y", {}],

  ["landing-dark", "Dark mode", "Landing — dark", "/", { dark: true }],
  ["login-dark", "Dark mode", "Log in — dark", "/login", { dark: true }],
  ["dashboard-dark", "Dark mode", "Dashboard — dark", "/dashboard", { auth: true, dark: true }],
  ["ebook-completed-dark", "Dark mode", "Ebook completed — dark", "/ebooks/b-done", { auth: true, dark: true }],
  ["editor-dark", "Dark mode", "Editor — dark", "/ebooks/b-done/edit", { auth: true, dark: true, fullPage: false, wait: 3500 }],

  ["m-landing", "Mobile", "Landing — mobile", "/", { mobile: true }],
  ["m-login", "Mobile", "Log in — mobile", "/login", { mobile: true }],
  ["m-dashboard", "Mobile", "Dashboard — mobile", "/dashboard", { auth: true, mobile: true }],
  ["m-new-ebook", "Mobile", "New ebook — mobile", "/ebooks/new", { auth: true, mobile: true }],
  ["m-ebook-completed", "Mobile", "Ebook completed — mobile", "/ebooks/b-done", { auth: true, mobile: true }],
];

const only = process.argv.slice(2);

fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(path.join(OUT, "frames"), { recursive: true });
fs.mkdirSync(ASSETS, { recursive: true });

const cssCache = new Map(); // remote href -> local rel path (from out/)

function hashName(buf, ext) {
  return createHash("sha1").update(buf).digest("hex").slice(0, 12) + ext;
}

function saveAsset(buf, ext, sub) {
  const dir = path.join(ASSETS, sub);
  fs.mkdirSync(dir, { recursive: true });
  const name = hashName(buf, ext);
  const file = path.join(dir, name);
  if (!fs.existsSync(file)) fs.writeFileSync(file, buf);
  return `assets/${sub}/${name}`;
}

async function localCss(href) {
  const abs = new URL(href, BASE).href;
  if (cssCache.has(abs)) return cssCache.get(abs);
  let css = await (await fetch(abs)).text();
  const urls = [...new Set([...css.matchAll(/url\(\s*["']?([^"')]+)["']?\s*\)/g)].map((m) => m[1]))];
  for (const u of urls) {
    if (u.startsWith("data:") || u.startsWith("#")) continue;
    const res = await fetch(new URL(u, abs));
    if (!res.ok) continue;
    const buf = Buffer.from(await res.arrayBuffer());
    const rel = saveAsset(buf, path.extname(new URL(u, abs).pathname) || ".bin", "media");
    // CSS lives in assets/css/, so media is ../media/
    css = css.split(u).join("../" + rel.replace(/^assets\//, ""));
  }
  const rel = saveAsset(Buffer.from(css), ".css", "css");
  cssCache.set(abs, rel);
  return rel;
}

const EXT = { "image/png": ".png", "image/jpeg": ".jpg", "image/webp": ".webp", "image/svg+xml": ".svg", "image/gif": ".gif", "image/avif": ".avif" };

async function snapshot(page, opts) {
  // Replace iframes (book preview) with a screenshot of what they show.
  const frames = await page.$$("iframe");
  for (let i = 0; i < frames.length; i++) {
    const box = await frames[i].boundingBox();
    if (!box || box.width < 2 || box.height < 2) {
      await frames[i].evaluate((el) => el.setAttribute("data-snap-drop", ""));
      continue;
    }
    const buf = await frames[i].screenshot();
    const rel = saveAsset(buf, ".png", "img");
    await frames[i].evaluate((el, src) => el.setAttribute("data-snap-img", src), "../" + rel);
  }

  const data = await page.evaluate(async (vh) => {
    // Pin viewport-relative heights to the captured viewport, so a tall frame
    // doesn't stretch h-screen / min-h-screen blocks to its own height.
    const pin = document.createElement("style");
    pin.setAttribute("data-snap", "");
    pin.textContent = `.h-screen{height:${vh}px!important}.min-h-screen{min-height:${vh}px!important}.reveal{opacity:1!important;animation:none!important}`;
    document.head.appendChild(pin);
    window.scrollTo(0, 0);
    const height = Math.ceil(document.documentElement.getBoundingClientRect().height);
    // Persist live form state into attributes.
    for (const el of document.querySelectorAll("input")) {
      if (el.type === "checkbox" || el.type === "radio") el.toggleAttribute("checked", el.checked);
      else if (el.type !== "file" && el.type !== "password") el.setAttribute("value", el.value);
    }
    for (const el of document.querySelectorAll("textarea")) el.textContent = el.value;
    for (const el of document.querySelectorAll("select")) {
      for (const o of el.options) o.toggleAttribute("selected", o.selected);
    }
    for (const el of document.querySelectorAll("[contenteditable]")) el.removeAttribute("contenteditable");

    for (const f of document.querySelectorAll("iframe[data-snap-drop]")) f.remove();
    for (const f of document.querySelectorAll("iframe[data-snap-img]")) {
      const img = document.createElement("img");
      img.src = f.getAttribute("data-snap-img");
      img.className = f.className;
      img.setAttribute("style", (f.getAttribute("style") || "") + ";object-fit:contain;object-position:top;display:block");
      const r = f.getBoundingClientRect();
      img.width = Math.round(r.width);
      img.height = Math.round(r.height);
      f.replaceWith(img);
    }

    // Inline images (incl. blob: and next/image URLs) as raw bytes.
    const images = [];
    const toB64 = async (url) => {
      const res = await fetch(url);
      const type = res.headers.get("content-type") || "image/png";
      const buf = new Uint8Array(await res.arrayBuffer());
      let s = "";
      for (let i = 0; i < buf.length; i += 0x8000) s += String.fromCharCode(...buf.subarray(i, i + 0x8000));
      return { type: type.split(";")[0], b64: btoa(s) };
    };
    let n = 0;
    for (const img of document.querySelectorAll("img")) {
      const src = img.currentSrc || img.src;
      img.removeAttribute("srcset");
      img.removeAttribute("sizes");
      img.removeAttribute("loading");
      if (!src || src.includes("data-snap") || img.getAttribute("src")?.startsWith("../assets/")) continue;
      try {
        const key = `__IMG${n++}__`;
        images.push({ key, ...(await toB64(src)) });
        img.setAttribute("src", key);
      } catch {
        /* leave as is */
      }
    }

    const sheets = [...document.querySelectorAll('link[rel="stylesheet"]')].map((l) => l.getAttribute("href"));
    for (const el of document.querySelectorAll('script, link[rel="preload"], link[rel="modulepreload"], link[rel="stylesheet"], link[rel="manifest"], next-route-announcer, nextjs-portal')) el.remove();

    return {
      images,
      sheets,
      htmlAttrs: [...document.documentElement.attributes].map((a) => [a.name, a.value]),
      head: document.head.innerHTML,
      body: document.body.outerHTML,
      height,
    };
  }, opts.mobile ? MOBILE.height : DESKTOP.height);

  let body = data.body;
  for (const img of data.images) {
    const rel = saveAsset(Buffer.from(img.b64, "base64"), EXT[img.type] || ".png", "img");
    body = body.split(img.key).join("../" + rel);
  }
  const links = [];
  for (const href of data.sheets) links.push(`<link rel="stylesheet" href="../${await localCss(href)}">`);

  const attrs = data.htmlAttrs.map(([k, v]) => `${k}="${v.replace(/"/g, "&quot;")}"`).join(" ");
  const html = `<!doctype html>
<html ${attrs}>
<head>
${data.head}
${links.join("\n")}
<style>
html{scrollbar-width:thin}
</style>
</head>
${body}
</html>`;
  return { html, height: opts.fullPage === false ? null : data.height };
}

const browser = await chromium.launch();
const manifest = [];

for (const [id, section, title, route, opts] of SCREENS) {
  if (only.length && !only.includes(id)) continue;
  const viewport = opts.mobile ? MOBILE : DESKTOP;
  const context = await browser.newContext({
    viewport,
    deviceScaleFactor: 1,
    colorScheme: opts.dark ? "dark" : "light",
    isMobile: !!opts.mobile,
    hasTouch: !!opts.mobile,
  });
  await context.addInitScript(
    ({ auth, dark, consent }) => {
      try {
        if (auth) localStorage.setItem("ebook.accessToken", "demo-token");
        else localStorage.removeItem("ebook.accessToken");
        localStorage.setItem("theme", dark ? "dark" : "light");
        if (consent) localStorage.setItem("scrivetta.consent.v1", JSON.stringify({ analytics: false, at: "2026-01-01T00:00:00Z" }));
      } catch {}
    },
    { auth: !!opts.auth, dark: !!opts.dark, consent: opts.consent !== false },
  );
  await context.route(`${API}/**`, async (r) => {
    const req = r.request();
    const u = new URL(req.url());
    if (req.method() === "OPTIONS") {
      return r.fulfill({ status: 204, headers: { "access-control-allow-origin": BASE, "access-control-allow-credentials": "true", "access-control-allow-headers": "*", "access-control-allow-methods": "*" } });
    }
    const hit = opts.auth || u.pathname !== "/api/auth/refresh" ? mockApi(req.method(), u.pathname + u.search, opts) : null;
    const [status, body, type] = hit ?? [404, JSON.stringify({ message: "Not found" }), "application/json"];
    r.fulfill({ status, body, headers: { "content-type": type, "access-control-allow-origin": BASE, "access-control-allow-credentials": "true" } });
  });
  // Keep third-party analytics out of the snapshot.
  await context.route(/googletagmanager|google-analytics|vercel-insights|_vercel/, (r) => r.abort());

  const page = await context.newPage();
  await page.goto(BASE + route, { waitUntil: "networkidle" });
  await page.waitForTimeout(opts.wait ?? 1200);
  if (opts.fullPage !== false) {
    // Scroll through so scroll-triggered sections render, then back to top.
    await page.evaluate(async () => {
      for (let y = 0; y < document.body.scrollHeight; y += 500) {
        window.scrollTo(0, y);
        await new Promise((r) => setTimeout(r, 60));
      }
      window.scrollTo(0, 0);
    });
    await page.waitForTimeout(800);
  }
  const shot = await page.screenshot({ fullPage: opts.fullPage !== false });
  fs.mkdirSync(path.join(OUT, "screens"), { recursive: true });
  fs.writeFileSync(path.join(OUT, "screens", `${id}.png`), shot);

  const { html } = await snapshot(page, opts);
  const height = opts.fullPage === false ? null : shot.readUInt32BE(20); // PNG IHDR height
  fs.writeFileSync(path.join(OUT, "frames", `${id}.html`), html);
  manifest.push({ id, section, title, route, width: viewport.width, height: height ?? viewport.height, mobile: !!opts.mobile, dark: !!opts.dark });
  console.log(`✓ ${id} (${viewport.width}×${height ?? viewport.height})`);
  await context.close();
}

await browser.close();
fs.writeFileSync(path.join(OUT, "manifest.json"), JSON.stringify(manifest, null, 2));
fs.copyFileSync(path.join(HERE, "board.html"), path.join(OUT, "index.html"));
// Optional design brief (design/snapshot/brief.html) shown in the board's sidebar.
const briefFile = path.join(HERE, "brief.html");
const brief = fs.existsSync(briefFile) ? `<div class="brief">${fs.readFileSync(briefFile, "utf8")}</div>` : "";
const boardJs = fs
  .readFileSync(path.join(OUT, "index.html"), "utf8")
  .replace("/*__MANIFEST__*/[]", JSON.stringify(manifest))
  .replace("<!--__BRIEF__-->", brief);
fs.writeFileSync(path.join(OUT, "index.html"), boardJs);
console.log(`\nBoard: ${path.join(OUT, "index.html")}`);
