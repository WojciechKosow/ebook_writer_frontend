# Inkwell — Frontend

Next.js (App Router) frontend for the AI ebook generator. Talks to the Spring
Boot backend (`ebook_writer`) over its JWT auth + ebook APIs.

## Getting started

```bash
npm install
cp .env.example .env.local   # set NEXT_PUBLIC_API_URL to your backend
npm run dev                  # http://localhost:3000
```

The backend must be running (default `http://localhost:8080`) and its CORS
`app.cors.allowed-origins` must include `http://localhost:3000`.

## What's here (V0.1)

- **Landing page** — `/`
- **Auth** — `/register`, `/check-email`, `/verify`, `/login`,
  `/forgot-password`, `/reset-password`
- **Dashboard** — `/dashboard` (protected placeholder; the ebook flow lands here next)

Auth state lives in `lib/auth-context.tsx`: the access token is kept in memory
+ `localStorage`, and a silent refresh via the httpOnly refresh cookie restores
the session on load (works when the cookie is same-site — always in local dev).

## Configuration

| Var | Purpose |
|-----|---------|
| `NEXT_PUBLIC_API_URL` | Base URL of the backend (no trailing slash). |

## Structure

- `lib/api.ts` — typed API client + `ApiError`
- `lib/auth-context.tsx` — auth provider + `useAuth()`
- `lib/brand.ts` — product name (rename here to rebrand)
- `components/` — UI primitives + site header/footer
- `app/` — routes (App Router)
