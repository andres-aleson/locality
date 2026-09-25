# LocalReach

AI marketing coach for first-time local business owners: onboard a business,
get an AI-generated weekly marketing plan, and generate ready-to-use draft
content for each action in the plan.

## Stack

- **Next.js (App Router) + TypeScript + Tailwind** — single deployable app, Server Actions for all mutations (no separate API layer).
- **Supabase (Postgres)** — `businesses`, `weekly_plans`, `plan_actions`, `content_drafts`. Schema in [`supabase/schema.sql`](supabase/schema.sql).
- **Claude API (Anthropic)** — plan and content generation in [`src/lib/ai.ts`](src/lib/ai.ts). Falls back to deterministic mock output if `ANTHROPIC_API_KEY` is unset, so the full loop works before you have a key.
- **Google sign-in (Supabase Auth)** — one business per account. `/dashboard` and `/onboarding` require a session; ownership is enforced server-side by scoping every query to the caller's `user_id` (see [`src/lib/supabase-server.ts`](src/lib/supabase-server.ts), [`src/proxy.ts`](src/proxy.ts)).

## Setup

1. Copy the env template and fill it in:

   ```bash
   cp .env.local.example .env.local
   ```

2. Create a [Supabase](https://supabase.com) project, then run [`supabase/schema.sql`](supabase/schema.sql) in its SQL editor (Project > SQL Editor > New query). Copy the project URL and **service role key** (Project Settings > API) into `.env.local`.

3. Set up Google sign-in: create an OAuth 2.0 Client ID (Web application) in [Google Cloud Console](https://console.cloud.google.com), with authorized redirect URI `https://<your-project-ref>.supabase.co/auth/v1/callback`. Paste the Client ID + Secret into Supabase Dashboard > Authentication > Providers > Google. Then copy the project's **anon/public key** (Project Settings > API) into `.env.local` as `NEXT_PUBLIC_SUPABASE_ANON_KEY` (along with `NEXT_PUBLIC_SUPABASE_URL`).

4. (Optional but recommended) Get an API key from [console.anthropic.com](https://console.anthropic.com) and add it as `ANTHROPIC_API_KEY`. Without it, plans and content are generated from a deterministic mock so you can still exercise the full flow.

5. Run the dev server:

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000).

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
    auth/callback/route.ts  OAuth code exchange
    onboarding/page.tsx      Business profile form (redirects to /dashboard if one exists)
    dashboard/page.tsx       Weekly plan + actions + content drafts, for the signed-in account
    dashboard/review/page.tsx  Post-plan review form
  lib/
    types.ts             Shared TypeScript types
    supabase.ts          Server-only Supabase client (service role key)
    supabase-server.ts   Cookie-aware Supabase client + getSessionUser()
    auth-actions.ts       Server Actions: signInWithGoogle, signOut
    ai.ts                 Claude integration + mock fallback
    db.ts                 Supabase queries
    actions.ts            Server Actions: createBusinessAndPlan, generateContentForAction,
                           toggleActionStatus, generateNextWeeklyPlan, submitReview
  proxy.ts               Gates /admin (Basic Auth) and /dashboard, /onboarding (Google session)
supabase/
  schema.sql       Database schema
```
