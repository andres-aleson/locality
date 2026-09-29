-- Demo "neighbor" profiles, their children, Circle memberships and ride
-- offers, so matching and Circles feel alive before real families sign up.
-- Carried over from supabase/locality-schema.sql. Idempotent.
insert into "locality"."locality_profiles"
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
--> statement-breakpoint
insert into "locality"."locality_children" (profile_id, name, grade, school_id) values
  ('00000000-0000-0000-0000-00000000a001', 'Aanya', '5th grade', 'hansen'),
  ('00000000-0000-0000-0000-00000000a002', 'Ethan', '2nd grade', 'bethany'),
  ('00000000-0000-0000-0000-00000000a003', 'Mateo', '11th grade', 'mh-high'),
  ('00000000-0000-0000-0000-00000000a003', 'Luna', 'Kindergarten', 'bethany'),
  ('00000000-0000-0000-0000-00000000a004', 'Grace', '8th grade', 'costa')
on conflict do nothing;
--> statement-breakpoint
insert into "locality"."locality_circle_members" (circle_id, profile_id) values
  ('circle-bethany', '00000000-0000-0000-0000-00000000a002'),
  ('circle-bethany', '00000000-0000-0000-0000-00000000a003'),
  ('circle-hansen', '00000000-0000-0000-0000-00000000a001'),
  ('circle-costa', '00000000-0000-0000-0000-00000000a004'),
  ('circle-mh-high', '00000000-0000-0000-0000-00000000a003')
on conflict do nothing;
--> statement-breakpoint
insert into "locality"."locality_ride_offers" (id, driver_id, circle_id, days, pickup_time, seats_available) values
  ('00000000-0000-0000-0000-00000000b001', '00000000-0000-0000-0000-00000000a002', 'circle-bethany',
   array['Mon','Tue','Wed','Thu','Fri'], '7:15 AM', 3),
  ('00000000-0000-0000-0000-00000000b002', '00000000-0000-0000-0000-00000000a001', 'circle-hansen',
   array['Mon','Wed','Fri'], '7:30 AM', 2),
  ('00000000-0000-0000-0000-00000000b003', '00000000-0000-0000-0000-00000000a003', 'circle-mh-high',
   array['Tue','Thu'], '7:45 AM', 1)
on conflict (id) do nothing;
