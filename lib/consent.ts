// Cookie consent, stored per browser. Only optional analytics (Google
// Analytics) waits for consent; strictly necessary storage (sign-in, theme,
// drafts) and cookieless Vercel Analytics don't need it.

export type Consent = {
  analytics: boolean;
  /** ISO timestamp of the decision, kept as a record of when it was given. */
  at: string;
};

// Bump the version to ask everyone again (e.g. when a new optional tool is added).
const KEY = "scrivetta.consent.v1";
const CHANGE_EVENT = "scrivetta:consent-change";
const OPEN_EVENT = "scrivetta:consent-open";

export function readConsent(): Consent | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<Consent>;
    return typeof parsed.analytics === "boolean"
      ? { analytics: parsed.analytics, at: parsed.at ?? "" }
      : null;
  } catch {
    return null;
  }
}

export function saveConsent(analytics: boolean) {
  const consent: Consent = { analytics, at: new Date().toISOString() };
  try {
    localStorage.setItem(KEY, JSON.stringify(consent));
  } catch {
    // Storage blocked: the choice still applies for this page view.
  }
  if (!analytics) clearAnalyticsCookies();
  window.dispatchEvent(new CustomEvent<Consent>(CHANGE_EVENT, { detail: consent }));
}

export function onConsentChange(handler: (consent: Consent) => void) {
  const listener = (e: Event) => handler((e as CustomEvent<Consent>).detail);
  window.addEventListener(CHANGE_EVENT, listener);
  return () => window.removeEventListener(CHANGE_EVENT, listener);
}

/** Reopens the cookie settings panel (footer link, privacy page). */
export function openCookieSettings() {
  window.dispatchEvent(new Event(OPEN_EVENT));
}

export function onOpenCookieSettings(handler: () => void) {
  window.addEventListener(OPEN_EVENT, handler);
  return () => window.removeEventListener(OPEN_EVENT, handler);
}

// Withdrawing consent must stop tracking, not just future script loads: remove
// the GA cookies (_ga, _ga_<id>) on this host and its parent domain.
function clearAnalyticsCookies() {
  const names = document.cookie
    .split(";")
    .map((c) => c.split("=")[0].trim())
    .filter((n) => n === "_ga" || n.startsWith("_ga_") || n === "_gid");
  const host = location.hostname;
  const domains = ["", host, `.${host}`, `.${host.replace(/^www\./, "")}`];
  for (const name of names) {
    for (const domain of domains) {
      document.cookie =
        `${name}=; Max-Age=0; path=/` + (domain ? `; domain=${domain}` : "");
    }
  }
}
