# LocalReach

AI marketing coach for first-time local business owners: onboard a business,
get an AI-generated weekly marketing plan, and generate ready-to-use draft
content for each action in the plan.

This repo also hosts **Locality** (a school carpool app) under `/locality`. The two products share one deployment, one database schema and one Google sign-in.

## Stack

- **Next.js (App Router) + TypeScript + Tailwind** — single deployable app on **Vercel**, Server Actions for all mutations (no separate API layer).
- **Postgres on Render** — everything lives in the `locality` schema of the shared Render database, accessed with [Drizzle ORM](https://orm.drizzle.team). Tables are defined in [`src/db/schema.ts`](src/db/schema.ts), migrations live in [`drizzle/`](drizzle).
- **Google sign-in (Auth.js)** — JWT sessions, no sessions table; each Google account gets a row in `locality.users` on first sign-in ([`src/lib/auth.ts`](src/lib/auth.ts)). Ownership is enforced server-side by scoping every query to the caller's user id; [`src/proxy.ts`](src/proxy.ts) gates the signed-in and admin areas.
- **Claude API (Anthropic)** — plan and content generation in [`src/lib/ai.ts`](src/lib/ai.ts). Falls back to deterministic mock output if `ANTHROPIC_API_KEY` is unset, so the full loop works before you have a key.
- Locality's ride and Circle chats refresh by polling every few seconds while the tab is visible.

## Database

- `DATABASE_URL` is used by the app. It connects as `locality_app`, a role that can only read and write rows in the `locality` schema.
- `MIGRATION_DATABASE_URL` is used only by drizzle-kit, and needs a role that can create tables in `locality` (the Render admin user). It is not set on Vercel.

First-time setup on the shared database (as the admin user; set a real password in the file first):

```bash
psql "$MIGRATION_DATABASE_URL" -f scripts/setup-db.sql
npm run db:migrate
```

To change the schema, edit `src/db/schema.ts`, then run:

```bash
npm run db:generate   # write a new SQL migration to drizzle/
npm run db:migrate    # apply it (needs MIGRATION_DATABASE_URL)
```

Apply migrations before deploying code that depends on them.

## Setup

1. `cp .env.example .env.local` and fill it in (each variable is described there).
2. Create a Google OAuth 2.0 Client ID (Web application) in [Google Cloud Console](https://console.cloud.google.com) with authorized redirect URIs `http://localhost:3000/api/auth/callback/google` and `https://<your-domain>/api/auth/callback/google`. Put the ID and secret in `AUTH_GOOGLE_ID` / `AUTH_GOOGLE_SECRET`.
3. `npm run dev` and open [http://localhost:3000](http://localhost:3000) (LocalReach) or [http://localhost:3000/locality](http://localhost:3000/locality).

## Deploy (Vercel)

Pushes to `main` deploy to production. Set every variable from `.env.example` except `MIGRATION_DATABASE_URL` in the Vercel project's Environment Variables, and run `npm run db:migrate` before pushing code that needs a new migration.

## Core loop

1. Sign in with Google (`/login`); first-time users land on `/onboarding` — business profile + goals form.
2. On submit, the server generates a weekly plan (3–4 concrete actions with title, description, rationale, platform) and redirects to `/dashboard`.
3. On the dashboard, each action has:
   - a "Generate content" button that produces ready-to-use draft copy for that specific action (caption, review-request email, profile copy, or in-person talking points, depending on platform), and
   - a "Mark done" toggle to track progress through the week.
4. Once ready, "Generate next week's plan" produces a new plan that's aware of what was and wasn't completed the previous week — the ongoing coaching loop, not a one-off plan.
5. Returning to `/dashboard` always shows the signed-in account's own business — one business per Google account.

Deliberately out of scope for v1: multiple businesses per account, editing generated content or the plan in place, and any outreach/discovery recommendations beyond what's in the plan itself.

## Project structure

```
src/
  app/
    page.tsx                Landing / marketing page
    login/page.tsx          Google sign-in
    api/auth/[...nextauth]  Auth.js routes (OAuth callback: /api/auth/callback/google)
    onboarding/page.tsx      Business profile form (redirects to /dashboard if one exists)
    dashboard/page.tsx       Weekly plan + actions + content drafts, for the signed-in account
    dashboard/review/page.tsx  Post-plan review form
  lib/
    types.ts             Shared TypeScript types
    auth.ts              Auth.js config (Google provider, users upsert)
    session.ts           getSessionUser() for the current request
    auth-actions.ts       Server Actions: signInWithGoogle, signOut
    ai.ts                 Claude integration + mock fallback
    db.ts                 LocalReach queries (Drizzle)
    actions.ts            Server Actions: createBusinessAndPlan, generateContentForAction,
                           toggleActionStatus, generateNextWeeklyPlan, submitReview
  proxy.ts               Gates /admin, /locality/admin (Basic Auth) and signed-in areas (Google session)
  db/
    schema.ts            Drizzle schema (LocalReach + Locality tables)
    index.ts             Postgres pool / Drizzle client
drizzle/                 SQL migrations (incl. Locality demo seed data)
scripts/setup-db.sql     One-time schema + app role setup
```
