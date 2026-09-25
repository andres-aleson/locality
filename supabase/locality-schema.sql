-- Locality schema.
-- Run this in the Supabase SQL editor (Project > SQL Editor > New query).
--
-- Kept in its own file, separate from schema.sql (LocalReach) — running one
-- must never DROP the other product's tables. Auth is Google sign-in via the
-- same Supabase Auth (auth.users) LocalReach already uses.
--
-- locality_profiles has NO foreign key to auth.users, on purpose: it lets a
-- handful of seed "neighbor" rows exist for a live-feeling demo/matching
-- experience before real families sign up. For a real signed-in user, id is
-- set equal to their auth.users id. Every other table is service-role only
-- (RLS off, ownership enforced in src/lib/locality/db.ts), except
-- locality_messages, which needs a narrow read policy for Realtime — see
-- below.
--
-- WARNING: this DROPS and recreates all locality_* tables. Fine pre-launch;
-- if you've already run an earlier version of this schema, running it again
-- wipes existing Locality data.

create extension if not exists "pgcrypto";

drop table if exists locality_safety_reports;
drop table if exists locality_circle_messages;
drop function if exists is_locality_circle_member;
drop table if exists locality_messages;
drop table if exists locality_rides;
drop table if exists locality_ride_requests;
drop table if exists locality_ride_offers;
drop table if exists locality_invites;
drop table if exists locality_circle_members;
drop table if exists locality_children;
drop table if exists locality_emergency_contacts;
drop table if exists locality_submissions;
drop table if exists locality_profiles;

create table locality_profiles (
  id uuid primary key default gen_random_uuid(),
  name text not null default '',
  avatar_color text not null default '#0284c7',
  phone text not null default '',
  email text not null default '',
  address text not null default '',
  badges text[] not null default '{}',
  reliability_score numeric not null default 5,
  completed_rides int not null default 0,
  phone_verified boolean not null default false,
  email_verified boolean not null default false,
  address_verified boolean not null default false,
  school_verified boolean not null default false,
  license_verified boolean not null default false,
  parent_verified boolean not null default false,
  license_submission_id text,
  residence_submission_id text,
  tos_accepted_at timestamptz,
  created_at timestamptz not null default now()
);

create table locality_children (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references locality_profiles(id) on delete cascade,
  name text not null,
  grade text not null default '',
  school_id text not null
);

create index locality_children_profile_id_idx on locality_children(profile_id);

create table locality_emergency_contacts (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references locality_profiles(id) on delete cascade,
  name text not null,
  phone text not null,
  relationship text not null default '',
  created_at timestamptz not null default now()
);

create index locality_emergency_contacts_profile_id_idx on locality_emergency_contacts(profile_id);

-- Document-review submissions (license/residence photos). Not linked to
-- locality_profiles via FK — a profile just stores the submission id it
-- cares about in license_submission_id/residence_submission_id, matching
-- the original file-based design this table replaces (see submissions.ts).
create table locality_submissions (
  id uuid primary key default gen_random_uuid(),
  kind text not null check (kind in ('residence', 'license')),
  uploader_name text not null default '',
  uploader_email text not null default '',
  file_name text not null,
  drive_file_id text not null,
  drive_view_link text not null,
  status text not null default 'pending' check (status in ('pending', 'auto_approved', 'approved', 'rejected')),
  quality_check jsonb not null,
  uploaded_at timestamptz not null default now(),
  reviewed_at timestamptz
);

create index locality_submissions_status_idx on locality_submissions(status);

create table locality_circle_members (
  circle_id text not null,
  profile_id uuid not null references locality_profiles(id) on delete cascade,
  joined_at timestamptz not null default now(),
  primary key (circle_id, profile_id)
);

create index locality_circle_members_profile_id_idx on locality_circle_members(profile_id);

create table locality_invites (
  id uuid primary key default gen_random_uuid(),
  circle_id text not null,
  email text not null,
  invited_by uuid references locality_profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

create index locality_invites_circle_id_idx on locality_invites(circle_id);

create table locality_ride_offers (
  id uuid primary key default gen_random_uuid(),
  driver_id uuid not null references locality_profiles(id) on delete cascade,
  circle_id text not null,
  days text[] not null default '{}',
  pickup_time text not null,
  seats_available int not null default 1,
  created_at timestamptz not null default now()
);

create index locality_ride_offers_circle_id_idx on locality_ride_offers(circle_id);

create table locality_ride_requests (
  id uuid primary key default gen_random_uuid(),
  requester_id uuid not null references locality_profiles(id) on delete cascade,
  circle_id text not null,
  pickup text not null,
  dropoff text not null,
  date text not null default '',
  time text not null default '',
  child_count int not null default 1,
  notes text not null default '',
  created_at timestamptz not null default now()
);

create index locality_ride_requests_circle_id_idx on locality_ride_requests(circle_id);

create table locality_rides (
  id uuid primary key default gen_random_uuid(),
  offer_id uuid references locality_ride_offers(id) on delete set null,
  request_id uuid references locality_ride_requests(id) on delete set null,
  driver_id uuid not null references locality_profiles(id) on delete cascade,
  parent_id uuid not null references locality_profiles(id) on delete cascade,
  child_name text not null default '',
  pickup text not null default '',
  dropoff text not null default '',
  date text not null default '',
  time text not null default '',
  status text not null default 'pending' check (status in ('pending', 'confirmed', 'completed', 'no-show')),
  pickup_confirmed boolean not null default false,
  dropoff_confirmed boolean not null default false,
  created_at timestamptz not null default now()
);

create index locality_rides_driver_id_idx on locality_rides(driver_id);
create index locality_rides_parent_id_idx on locality_rides(parent_id);

create table locality_messages (
  id uuid primary key default gen_random_uuid(),
  ride_id uuid not null references locality_rides(id) on delete cascade,
  sender_id uuid not null references locality_profiles(id) on delete cascade,
  -- Denormalized from the ride at insert time so the RLS policy below can
  -- scope reads without needing any grant on locality_rides.
  driver_id uuid not null references locality_profiles(id) on delete cascade,
  parent_id uuid not null references locality_profiles(id) on delete cascade,
  text text not null,
  created_at timestamptz not null default now()
);

create index locality_messages_ride_id_idx on locality_messages(ride_id);

-- Only table with RLS on: lets the browser's Realtime subscription (anon/
-- authenticated key) read just the messages for rides the caller is actually
-- part of. Every write still goes through the service-role server action,
-- which bypasses RLS entirely — this policy only governs the client-side
-- read used for live updates.
alter table locality_messages enable row level security;
grant select on locality_messages to authenticated;

create policy "participants can read their ride messages" on locality_messages
  for select using (auth.uid() = driver_id or auth.uid() = parent_id);

alter publication supabase_realtime add table locality_messages;

-- Per-Circle group chat, so every family in a community can talk to each
-- other (not just the 1:1 ride-scoped messages above). A circle can have
-- many members, so — unlike locality_messages — membership can't be
-- denormalized onto each row; instead a SECURITY DEFINER function checks
-- locality_circle_members on the RLS policy's behalf, without needing to
-- grant the authenticated role direct access to that table.
create table locality_circle_messages (
  id uuid primary key default gen_random_uuid(),
  circle_id text not null,
  sender_id uuid not null references locality_profiles(id) on delete cascade,
  text text not null,
  created_at timestamptz not null default now()
);

create index locality_circle_messages_circle_id_idx on locality_circle_messages(circle_id);

create function is_locality_circle_member(p_circle_id text, p_profile_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from locality_circle_members
    where circle_id = p_circle_id and profile_id = p_profile_id
  );
$$;

alter table locality_circle_messages enable row level security;
grant select on locality_circle_messages to authenticated;

create policy "circle members can read their circle's messages" on locality_circle_messages
  for select using (is_locality_circle_member(circle_id, auth.uid()));

alter publication supabase_realtime add table locality_circle_messages;

create table locality_safety_reports (
  id uuid primary key default gen_random_uuid(),
  ride_id uuid references locality_rides(id) on delete set null,
  reporter_id uuid not null references locality_profiles(id) on delete cascade,
  description text not null,
  created_at timestamptz not null default now()
);

-- Seed data: four demo neighbors + their circle memberships + demo offers,
-- matching what createSeedState() used to hand every browser. Idempotent so
-- re-running this file is safe.
insert into locality_profiles
  (id, name, avatar_color, phone, email, address, badges, reliability_score, completed_rides,
   phone_verified, email_verified, address_verified, school_verified, license_verified, parent_verified, tos_accepted_at)
values
  ('00000000-0000-0000-0000-00000000a001', 'Priya Nair', '#0284c7', '(209) 555-0142', 'priya.nair@example.com',
   '212 Meridian Way, Mountain House, CA',
   array['identityVerified','parentVerified','driverVerified','communityTrusted'], 4.9, 34,
   true, true, true, true, true, true, now()),
  ('00000000-0000-0000-0000-00000000a002', 'Daniel Cho', '#0d9488', '(209) 555-0187', 'daniel.cho@example.com',
   '88 Sundial Ct, Mountain House, CA',
   array['identityVerified','parentVerified','driverVerified'], 4.7, 19,
   true, true, true, true, true, true, now()),
  ('00000000-0000-0000-0000-00000000a003', 'Sofia Ramirez', '#059669', '(209) 555-0163', 'sofia.ramirez@example.com',
   '47 Lakeview Dr, Mountain House, CA',
   array['identityVerified','parentVerified','driverVerified','communityTrusted'], 5.0, 41,
   true, true, true, true, true, true, now()),
  ('00000000-0000-0000-0000-00000000a004', 'Marcus Webb', '#475569', '(209) 555-0129', 'marcus.webb@example.com',
   '305 Harvest Ln, Mountain House, CA',
   array['identityVerified','parentVerified'], 4.5, 6,
   true, true, true, true, false, true, now())
on conflict (id) do nothing;

insert into locality_children (profile_id, name, grade, school_id) values
  ('00000000-0000-0000-0000-00000000a001', 'Aanya', '5th grade', 'hansen'),
  ('00000000-0000-0000-0000-00000000a002', 'Ethan', '2nd grade', 'bethany'),
  ('00000000-0000-0000-0000-00000000a003', 'Mateo', '11th grade', 'mh-high'),
  ('00000000-0000-0000-0000-00000000a003', 'Luna', 'Kindergarten', 'bethany'),
  ('00000000-0000-0000-0000-00000000a004', 'Grace', '8th grade', 'costa')
on conflict do nothing;

insert into locality_circle_members (circle_id, profile_id) values
  ('circle-bethany', '00000000-0000-0000-0000-00000000a002'),
  ('circle-bethany', '00000000-0000-0000-0000-00000000a003'),
  ('circle-hansen', '00000000-0000-0000-0000-00000000a001'),
  ('circle-costa', '00000000-0000-0000-0000-00000000a004'),
  ('circle-mh-high', '00000000-0000-0000-0000-00000000a003')
on conflict do nothing;

insert into locality_ride_offers (id, driver_id, circle_id, days, pickup_time, seats_available) values
  ('00000000-0000-0000-0000-00000000b001', '00000000-0000-0000-0000-00000000a002', 'circle-bethany',
   array['Mon','Tue','Wed','Thu','Fri'], '7:15 AM', 3),
  ('00000000-0000-0000-0000-00000000b002', '00000000-0000-0000-0000-00000000a001', 'circle-hansen',
   array['Mon','Wed','Fri'], '7:30 AM', 2),
  ('00000000-0000-0000-0000-00000000b003', '00000000-0000-0000-0000-00000000a003', 'circle-mh-high',
   array['Tue','Thu'], '7:45 AM', 1)
on conflict (id) do nothing;
