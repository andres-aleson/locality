import { sql } from "drizzle-orm";
import {
  boolean,
  check,
  customType,
  index,
  integer,
  jsonb,
  numeric,
  pgSchema,
  primaryKey,
  text,
  uuid,
  date,
} from "drizzle-orm/pg-core";

// Everything lives in the `locality` Postgres schema on the shared database.
// LocalReach and Locality are separate products in this repo, but share the
// schema and the `users` table (one Google account, one user row).
export const locality = pgSchema("locality");

// timestamptz read back as an ISO-8601 string ("2026-09-28T12:34:56.789Z"),
// matching what the Supabase client used to return, so the app's types and
// date parsing don't change.
const timestamptz = customType<{ data: string; driverData: string | Date }>({
  dataType: () => "timestamp with time zone",
  fromDriver: (value) => new Date(value).toISOString(),
  toDriver: (value) => value,
});

const createdAt = () => timestamptz("created_at").notNull().default(sql`now()`);

// --- auth ------------------------------------------------------------------

/** One row per Google account, created on first sign-in (see src/lib/auth.ts). */
export const users = locality.table("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  googleSub: text("google_sub").notNull().unique(),
  email: text("email").notNull().default(""),
  name: text("name").notNull().default(""),
  createdAt: createdAt(),
});

// --- LocalReach ------------------------------------------------------------

export const businesses = locality.table(
  "businesses",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    user_id: uuid("user_id")
      .notNull()
      .unique()
      .references(() => users.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    category: text("category").notNull(),
    description: text("description").notNull(),
    target_customers: text("target_customers").notNull(),
    location: text("location").notNull(),
    goals: text("goals").notNull(),
    target_weeks: integer("target_weeks").notNull().default(4),
    website_or_socials: text("website_or_socials"),
    created_at: createdAt(),
  },
  (t) => [check("businesses_target_weeks_check", sql`${t.target_weeks} between 1 and 52`)]
);

export const weeklyPlans = locality.table(
  "weekly_plans",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    business_id: uuid("business_id")
      .notNull()
      .references(() => businesses.id, { onDelete: "cascade" }),
    week_number: integer("week_number").notNull().default(1),
    week_start: date("week_start", { mode: "string" }).notNull(),
    theme: text("theme").notNull(),
    created_at: createdAt(),
  },
  (t) => [index("weekly_plans_business_id_idx").on(t.business_id)]
);

export const planActions = locality.table(
  "plan_actions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    weekly_plan_id: uuid("weekly_plan_id")
      .notNull()
      .references(() => weeklyPlans.id, { onDelete: "cascade" }),
    order_index: integer("order_index").notNull(),
    title: text("title").notNull(),
    description: text("description").notNull(),
    rationale: text("rationale").notNull(),
    action_type: text("action_type").notNull(),
    platform: text("platform").notNull(),
    status: text("status").notNull().default("pending"),
    created_at: createdAt(),
  },
  (t) => [
    index("plan_actions_weekly_plan_id_idx").on(t.weekly_plan_id),
    check(
      "plan_actions_action_type_check",
      sql`${t.action_type} in ('content_post', 'review_request', 'local_outreach', 'profile_update', 'other')`
    ),
    check(
      "plan_actions_platform_check",
      sql`${t.platform} in ('google_business_profile', 'instagram', 'facebook', 'in_person', 'email', 'other')`
    ),
    check("plan_actions_status_check", sql`${t.status} in ('pending', 'done')`),
  ]
);

export const contentDrafts = locality.table(
  "content_drafts",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    plan_action_id: uuid("plan_action_id")
      .notNull()
      .references(() => planActions.id, { onDelete: "cascade" }),
    draft_text: text("draft_text").notNull(),
    created_at: createdAt(),
  },
  (t) => [index("content_drafts_plan_action_id_idx").on(t.plan_action_id)]
);

export const reviews = locality.table(
  "reviews",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    business_id: uuid("business_id")
      .notNull()
      .references(() => businesses.id, { onDelete: "cascade" }),
    rating: integer("rating").notNull(),
    body: text("body").notNull(),
    status: text("status").notNull().default("pending"),
    created_at: createdAt(),
  },
  (t) => [
    index("reviews_status_idx").on(t.status),
    index("reviews_business_id_idx").on(t.business_id),
    check("reviews_rating_check", sql`${t.rating} between 1 and 5`),
    check("reviews_status_check", sql`${t.status} in ('pending', 'approved', 'rejected')`),
  ]
);

// --- Locality --------------------------------------------------------------

// No foreign key to users, on purpose: seed "neighbor" rows exist before any
// real family signs up. For a real signed-in user, id equals their users.id.
export const localityProfiles = locality.table("locality_profiles", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull().default(""),
  avatar_color: text("avatar_color").notNull().default("#0284c7"),
  phone: text("phone").notNull().default(""),
  email: text("email").notNull().default(""),
  address: text("address").notNull().default(""),
  badges: text("badges").array().notNull().default(sql`'{}'`),
  reliability_score: numeric("reliability_score").notNull().default("5"),
  completed_rides: integer("completed_rides").notNull().default(0),
  phone_verified: boolean("phone_verified").notNull().default(false),
  email_verified: boolean("email_verified").notNull().default(false),
  address_verified: boolean("address_verified").notNull().default(false),
  school_verified: boolean("school_verified").notNull().default(false),
  license_verified: boolean("license_verified").notNull().default(false),
  parent_verified: boolean("parent_verified").notNull().default(false),
  license_submission_id: text("license_submission_id"),
  residence_submission_id: text("residence_submission_id"),
  tos_accepted_at: timestamptz("tos_accepted_at"),
  created_at: createdAt(),
});

export const localityChildren = locality.table(
  "locality_children",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    profile_id: uuid("profile_id")
      .notNull()
      .references(() => localityProfiles.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    grade: text("grade").notNull().default(""),
    school_id: text("school_id").notNull(),
  },
  (t) => [index("locality_children_profile_id_idx").on(t.profile_id)]
);

export const localityEmergencyContacts = locality.table(
  "locality_emergency_contacts",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    profile_id: uuid("profile_id")
      .notNull()
      .references(() => localityProfiles.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    phone: text("phone").notNull(),
    relationship: text("relationship").notNull().default(""),
    created_at: createdAt(),
  },
  (t) => [index("locality_emergency_contacts_profile_id_idx").on(t.profile_id)]
);

// Document-review submissions (license/residence photos). A profile stores the
// submission id it cares about in license_submission_id/residence_submission_id.
export const localitySubmissions = locality.table(
  "locality_submissions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    kind: text("kind").notNull(),
    uploader_name: text("uploader_name").notNull().default(""),
    uploader_email: text("uploader_email").notNull().default(""),
    file_name: text("file_name").notNull(),
    drive_file_id: text("drive_file_id").notNull(),
    drive_view_link: text("drive_view_link").notNull(),
    status: text("status").notNull().default("pending"),
    quality_check: jsonb("quality_check").notNull(),
    uploaded_at: timestamptz("uploaded_at").notNull().default(sql`now()`),
    reviewed_at: timestamptz("reviewed_at"),
  },
  (t) => [
    index("locality_submissions_status_idx").on(t.status),
    check("locality_submissions_kind_check", sql`${t.kind} in ('residence', 'license')`),
    check(
      "locality_submissions_status_check",
      sql`${t.status} in ('pending', 'auto_approved', 'approved', 'rejected')`
    ),
  ]
);

export const localityCircleMembers = locality.table(
  "locality_circle_members",
  {
    circle_id: text("circle_id").notNull(),
    profile_id: uuid("profile_id")
      .notNull()
      .references(() => localityProfiles.id, { onDelete: "cascade" }),
    joined_at: timestamptz("joined_at").notNull().default(sql`now()`),
  },
  (t) => [
    primaryKey({ columns: [t.circle_id, t.profile_id] }),
    index("locality_circle_members_profile_id_idx").on(t.profile_id),
  ]
);

export const localityInvites = locality.table(
  "locality_invites",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    circle_id: text("circle_id").notNull(),
    email: text("email").notNull(),
    invited_by: uuid("invited_by").references(() => localityProfiles.id, { onDelete: "set null" }),
    created_at: createdAt(),
  },
  (t) => [index("locality_invites_circle_id_idx").on(t.circle_id)]
);

export const localityRideOffers = locality.table(
  "locality_ride_offers",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    driver_id: uuid("driver_id")
      .notNull()
      .references(() => localityProfiles.id, { onDelete: "cascade" }),
    circle_id: text("circle_id").notNull(),
    days: text("days").array().notNull().default(sql`'{}'`),
    pickup_time: text("pickup_time").notNull(),
    seats_available: integer("seats_available").notNull().default(1),
    created_at: createdAt(),
  },
  (t) => [index("locality_ride_offers_circle_id_idx").on(t.circle_id)]
);

export const localityRideRequests = locality.table(
  "locality_ride_requests",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    requester_id: uuid("requester_id")
      .notNull()
      .references(() => localityProfiles.id, { onDelete: "cascade" }),
    circle_id: text("circle_id").notNull(),
    pickup: text("pickup").notNull(),
    dropoff: text("dropoff").notNull(),
    date: text("date").notNull().default(""),
    time: text("time").notNull().default(""),
    child_count: integer("child_count").notNull().default(1),
    notes: text("notes").notNull().default(""),
    created_at: createdAt(),
  },
  (t) => [index("locality_ride_requests_circle_id_idx").on(t.circle_id)]
);

export const localityRides = locality.table(
  "locality_rides",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    offer_id: uuid("offer_id").references(() => localityRideOffers.id, { onDelete: "set null" }),
    request_id: uuid("request_id").references(() => localityRideRequests.id, { onDelete: "set null" }),
    driver_id: uuid("driver_id")
      .notNull()
      .references(() => localityProfiles.id, { onDelete: "cascade" }),
    parent_id: uuid("parent_id")
      .notNull()
      .references(() => localityProfiles.id, { onDelete: "cascade" }),
    child_name: text("child_name").notNull().default(""),
    pickup: text("pickup").notNull().default(""),
    dropoff: text("dropoff").notNull().default(""),
    date: text("date").notNull().default(""),
    time: text("time").notNull().default(""),
    status: text("status").notNull().default("pending"),
    pickup_confirmed: boolean("pickup_confirmed").notNull().default(false),
    dropoff_confirmed: boolean("dropoff_confirmed").notNull().default(false),
    created_at: createdAt(),
  },
  (t) => [
    index("locality_rides_driver_id_idx").on(t.driver_id),
    index("locality_rides_parent_id_idx").on(t.parent_id),
    check("locality_rides_status_check", sql`${t.status} in ('pending', 'confirmed', 'completed', 'no-show')`),
  ]
);

export const localityMessages = locality.table(
  "locality_messages",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    ride_id: uuid("ride_id")
      .notNull()
      .references(() => localityRides.id, { onDelete: "cascade" }),
    sender_id: uuid("sender_id")
      .notNull()
      .references(() => localityProfiles.id, { onDelete: "cascade" }),
    driver_id: uuid("driver_id")
      .notNull()
      .references(() => localityProfiles.id, { onDelete: "cascade" }),
    parent_id: uuid("parent_id")
      .notNull()
      .references(() => localityProfiles.id, { onDelete: "cascade" }),
    text: text("text").notNull(),
    created_at: createdAt(),
  },
  (t) => [index("locality_messages_ride_id_idx").on(t.ride_id)]
);

export const localityCircleMessages = locality.table(
  "locality_circle_messages",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    circle_id: text("circle_id").notNull(),
    sender_id: uuid("sender_id")
      .notNull()
      .references(() => localityProfiles.id, { onDelete: "cascade" }),
    text: text("text").notNull(),
    created_at: createdAt(),
  },
  (t) => [index("locality_circle_messages_circle_id_idx").on(t.circle_id)]
);

export const localitySafetyReports = locality.table("locality_safety_reports", {
  id: uuid("id").primaryKey().defaultRandom(),
  ride_id: uuid("ride_id").references(() => localityRides.id, { onDelete: "set null" }),
  reporter_id: uuid("reporter_id")
    .notNull()
    .references(() => localityProfiles.id, { onDelete: "cascade" }),
  description: text("description").notNull(),
  created_at: createdAt(),
});
