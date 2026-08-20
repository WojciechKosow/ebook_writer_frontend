// Single source of truth for the stored access-token key.
export const TOKEN_KEY = "ebook.accessToken";

/**
 * Pre-paint session guard, injected as an inline script before any page markup.
 *
 * Our public-only routes (landing + auth entry) are statically prerendered, so
 * their HTML would paint before the client bootstraps auth — a logged-in user
 * refreshing `/` briefly sees the landing page before the client redirects to
 * the dashboard, which reads as the landing and dashboard flashing at once.
 *
 * Running synchronously in <body> before that markup is parsed, this mirrors an
 * SPA route guard: a visitor who already has a session is sent straight to the
 * app, so the public-only page never paints for them. Visitors with no stored
 * token fall through untouched and get the normal (SEO-friendly) landing page.
 */
export const sessionBootScript = `(function(){try{var p=location.pathname;if((p==='/'||p==='/login'||p==='/register')&&localStorage.getItem('${TOKEN_KEY}')){location.replace('/dashboard');}}catch(e){}})();`;
