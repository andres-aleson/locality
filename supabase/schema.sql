-- LocalReach schema.
-- Run this in the Supabase SQL editor (Project > SQL Editor > New query).
--
-- Auth: Google sign-in via Supabase Auth (auth.users). All real data access
-- still goes through the server-side service role key (see
-- src/lib/supabase.ts), so Row Level Security is left off here — ownership
-- is instead enforced by scoping every query to the caller's user_id in
-- src/lib/db.ts. One business per account, hence the unique constraint
-- below.
--
-- WARNING: this DROPS and recreates all tables. Fine pre-launch; if you've
-- already run an earlier version of this schema, running it again wipes
-- existing data.

create extension if not exists "pgcrypto";

drop table if exists content_drafts;
drop table if exists plan_actions;
drop table if exists weekly_plans;
drop table if exists reviews;
drop table if exists businesses;

create table businesses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  name text not null,
  category text not null,
  description text not null,
  target_customers text not null,
  location text not null,
  goals text not null,
  target_weeks int not null default 4 check (target_weeks between 1 and 52),
  website_or_socials text,
  created_at timestamptz not null default now()
);

create table weekly_plans (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references businesses(id) on delete cascade,
  week_number int not null default 1,
  week_start date not null,
  theme text not null,
  created_at timestamptz not null default now()
);

create index weekly_plans_business_id_idx on weekly_plans(business_id);

create table plan_actions (
  id uuid primary key default gen_random_uuid(),
  weekly_plan_id uuid not null references weekly_plans(id) on delete cascade,
  order_index int not null,
  title text not null,
  description text not null,
  rationale text not null,
  action_type text not null check (action_type in ('content_post', 'review_request', 'local_outreach', 'profile_update', 'other')),
  platform text not null check (platform in ('google_business_profile', 'instagram', 'facebook', 'in_person', 'email', 'other')),
  status text not null default 'pending' check (status in ('pending', 'done')),
  created_at timestamptz not null default now()
);

create index plan_actions_weekly_plan_id_idx on plan_actions(weekly_plan_id);

create table content_drafts (
  id uuid primary key default gen_random_uuid(),
  plan_action_id uuid not null references plan_actions(id) on delete cascade,
  draft_text text not null,
  created_at timestamptz not null default now()
);

create index content_drafts_plan_action_id_idx on content_drafts(plan_action_id);

create table reviews (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references businesses(id) on delete cascade,
  rating int not null check (rating between 1 and 5),
  body text not null,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  created_at timestamptz not null default now()
);

create index reviews_status_idx on reviews(status);
create index reviews_business_id_idx on reviews(business_id);
