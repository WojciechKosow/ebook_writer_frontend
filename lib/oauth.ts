// "Continue with Google" — client half of the backend-driven OAuth/OIDC flow.
//
// The whole OAuth exchange (state, nonce, PKCE, client secret, ID-token checks)
// runs on the backend. The browser only:
//   1. generates a random clientState, remembers it in sessionStorage, and
//      navigates to  {API}/api/auth/oauth2/google/authorize?client_state=…
//   2. lands back on /auth/callback#code=… (or ?error=…)
//   3. trades the one-time code + clientState for a normal session
//      (POST /api/auth/oauth2/exchange — same response shape as /login).
// The clientState binds the code to this tab, so a code planted in someone
// else's browser is useless.
import { API_URL } from "./api";

export type OAuthProviderId = "google";

const PENDING_KEY = "scrivetta.oauthPending";
/** A pending login older than this is ignored (the backend state lives 10 min). */
const PENDING_TTL_MS = 15 * 60 * 1000;

export interface PendingOAuthLogin {
  clientState: string;
  rememberMe: boolean;
  /** Same-origin path to open after sign-in. */
  next: string;
  startedAt: number;
}

function randomClientState(): string {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  let bin = "";
  bytes.forEach((b) => (bin += String.fromCharCode(b)));
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

/** Only same-origin absolute paths — never an open redirect. */
export function safeNextPath(next: string | null | undefined): string {
  if (!next || !next.startsWith("/") || next.startsWith("//") || next.startsWith("/\\")) {
    return "/dashboard";
  }
  return next;
}

/** Leave for the provider. Never resolves (the page navigates away). */
export function startOAuthLogin(
  provider: OAuthProviderId,
  opts: { rememberMe?: boolean; next?: string } = {},
): void {
  const pending: PendingOAuthLogin = {
    clientState: randomClientState(),
    rememberMe: opts.rememberMe ?? true,
    next: safeNextPath(opts.next),
    startedAt: Date.now(),
  };
  window.sessionStorage.setItem(PENDING_KEY, JSON.stringify(pending));
  // Absolute URL on the backend origin — a full navigation is required here.
  // eslint-disable-next-line @next/next/no-location-assign-relative-destination
  window.location.assign(
    `${API_URL}/api/auth/oauth2/${provider}/authorize?client_state=${encodeURIComponent(pending.clientState)}`,
  );
}

/** Read and clear the pending login started in this tab (null if none / stale). */
export function takePendingOAuthLogin(): PendingOAuthLogin | null {
  const raw = window.sessionStorage.getItem(PENDING_KEY);
  window.sessionStorage.removeItem(PENDING_KEY);
  if (!raw) return null;
  try {
    const p = JSON.parse(raw) as PendingOAuthLogin;
    if (!p.clientState || Date.now() - p.startedAt > PENDING_TTL_MS) return null;
    return { ...p, next: safeNextPath(p.next) };
  } catch {
    return null;
  }
}

/** Backend error codes (OAuthErrorCode) → what we tell the user. */
export function oauthErrorMessage(code: string | null | undefined): string {
  switch (code) {
    case "access_denied":
      return "Google sign-in was cancelled.";
    case "invalid_state":
    case "invalid_login_code":
    case "code_expired":
      return "Your sign-in attempt expired. Please try again.";
    case "email_not_verified":
      return "Your Google account's email address isn't verified. Verify it with Google, or sign up with email and password.";
    case "account_conflict":
      return "This Scrivetta account is already connected to a different Google account. Sign in with that Google account or with your email and password.";
    case "not_configured":
      return "Google sign-in isn't available right now. Please use your email and password.";
    case "provider_error":
      return "We couldn't complete sign-in with Google. Please try again.";
    default:
      return "Something went wrong signing in with Google. Please try again.";
  }
}
