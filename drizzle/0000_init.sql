CREATE TABLE "locality"."businesses" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"name" text NOT NULL,
	"category" text NOT NULL,
	"description" text NOT NULL,
	"target_customers" text NOT NULL,
	"location" text NOT NULL,
	"goals" text NOT NULL,
	"target_weeks" integer DEFAULT 4 NOT NULL,
	"website_or_socials" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "businesses_user_id_unique" UNIQUE("user_id"),
	CONSTRAINT "businesses_target_weeks_check" CHECK ("locality"."businesses"."target_weeks" between 1 and 52)
);
--> statement-breakpoint
CREATE TABLE "locality"."content_drafts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"plan_action_id" uuid NOT NULL,
	"draft_text" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "locality"."locality_children" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"profile_id" uuid NOT NULL,
	"name" text NOT NULL,
	"grade" text DEFAULT '' NOT NULL,
	"school_id" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "locality"."locality_circle_members" (
	"circle_id" text NOT NULL,
	"profile_id" uuid NOT NULL,
	"joined_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "locality_circle_members_circle_id_profile_id_pk" PRIMARY KEY("circle_id","profile_id")
);
--> statement-breakpoint
CREATE TABLE "locality"."locality_circle_messages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"circle_id" text NOT NULL,
	"sender_id" uuid NOT NULL,
	"text" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "locality"."locality_emergency_contacts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"profile_id" uuid NOT NULL,
	"name" text NOT NULL,
	"phone" text NOT NULL,
	"relationship" text DEFAULT '' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "locality"."locality_invites" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"circle_id" text NOT NULL,
	"email" text NOT NULL,
	"invited_by" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "locality"."locality_messages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"ride_id" uuid NOT NULL,
	"sender_id" uuid NOT NULL,
	"driver_id" uuid NOT NULL,
	"parent_id" uuid NOT NULL,
	"text" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "locality"."locality_profiles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text DEFAULT '' NOT NULL,
	"avatar_color" text DEFAULT '#0284c7' NOT NULL,
	"phone" text DEFAULT '' NOT NULL,
	"email" text DEFAULT '' NOT NULL,
	"address" text DEFAULT '' NOT NULL,
	"badges" text[] DEFAULT '{}' NOT NULL,
	"reliability_score" numeric DEFAULT '5' NOT NULL,
	"completed_rides" integer DEFAULT 0 NOT NULL,
	"phone_verified" boolean DEFAULT false NOT NULL,
	"email_verified" boolean DEFAULT false NOT NULL,
	"address_verified" boolean DEFAULT false NOT NULL,
	"school_verified" boolean DEFAULT false NOT NULL,
	"license_verified" boolean DEFAULT false NOT NULL,
	"parent_verified" boolean DEFAULT false NOT NULL,
	"license_submission_id" text,
	"residence_submission_id" text,
	"tos_accepted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "locality"."locality_ride_offers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"driver_id" uuid NOT NULL,
	"circle_id" text NOT NULL,
	"days" text[] DEFAULT '{}' NOT NULL,
	"pickup_time" text NOT NULL,
	"seats_available" integer DEFAULT 1 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "locality"."locality_ride_requests" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"requester_id" uuid NOT NULL,
	"circle_id" text NOT NULL,
	"pickup" text NOT NULL,
	"dropoff" text NOT NULL,
	"date" text DEFAULT '' NOT NULL,
	"time" text DEFAULT '' NOT NULL,
	"child_count" integer DEFAULT 1 NOT NULL,
	"notes" text DEFAULT '' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "locality"."locality_rides" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"offer_id" uuid,
	"request_id" uuid,
	"driver_id" uuid NOT NULL,
	"parent_id" uuid NOT NULL,
	"child_name" text DEFAULT '' NOT NULL,
	"pickup" text DEFAULT '' NOT NULL,
	"dropoff" text DEFAULT '' NOT NULL,
	"date" text DEFAULT '' NOT NULL,
	"time" text DEFAULT '' NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"pickup_confirmed" boolean DEFAULT false NOT NULL,
	"dropoff_confirmed" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "locality_rides_status_check" CHECK ("locality"."locality_rides"."status" in ('pending', 'confirmed', 'completed', 'no-show'))
);
--> statement-breakpoint
CREATE TABLE "locality"."locality_safety_reports" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"ride_id" uuid,
	"reporter_id" uuid NOT NULL,
	"description" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "locality"."locality_submissions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"kind" text NOT NULL,
	"uploader_name" text DEFAULT '' NOT NULL,
	"uploader_email" text DEFAULT '' NOT NULL,
	"file_name" text NOT NULL,
	"drive_file_id" text NOT NULL,
	"drive_view_link" text NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"quality_check" jsonb NOT NULL,
	"uploaded_at" timestamp with time zone DEFAULT now() NOT NULL,
	"reviewed_at" timestamp with time zone,
	CONSTRAINT "locality_submissions_kind_check" CHECK ("locality"."locality_submissions"."kind" in ('residence', 'license')),
	CONSTRAINT "locality_submissions_status_check" CHECK ("locality"."locality_submissions"."status" in ('pending', 'auto_approved', 'approved', 'rejected'))
);
--> statement-breakpoint
CREATE TABLE "locality"."plan_actions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"weekly_plan_id" uuid NOT NULL,
	"order_index" integer NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"rationale" text NOT NULL,
	"action_type" text NOT NULL,
	"platform" text NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "plan_actions_action_type_check" CHECK ("locality"."plan_actions"."action_type" in ('content_post', 'review_request', 'local_outreach', 'profile_update', 'other')),
	CONSTRAINT "plan_actions_platform_check" CHECK ("locality"."plan_actions"."platform" in ('google_business_profile', 'instagram', 'facebook', 'in_person', 'email', 'other')),
	CONSTRAINT "plan_actions_status_check" CHECK ("locality"."plan_actions"."status" in ('pending', 'done'))
);
--> statement-breakpoint
CREATE TABLE "locality"."reviews" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"business_id" uuid NOT NULL,
	"rating" integer NOT NULL,
	"body" text NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "reviews_rating_check" CHECK ("locality"."reviews"."rating" between 1 and 5),
	CONSTRAINT "reviews_status_check" CHECK ("locality"."reviews"."status" in ('pending', 'approved', 'rejected'))
);
--> statement-breakpoint
CREATE TABLE "locality"."users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"google_sub" text NOT NULL,
	"email" text DEFAULT '' NOT NULL,
	"name" text DEFAULT '' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_google_sub_unique" UNIQUE("google_sub")
);
--> statement-breakpoint
CREATE TABLE "locality"."weekly_plans" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"business_id" uuid NOT NULL,
	"week_number" integer DEFAULT 1 NOT NULL,
	"week_start" date NOT NULL,
	"theme" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "locality"."businesses" ADD CONSTRAINT "businesses_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "locality"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "locality"."content_drafts" ADD CONSTRAINT "content_drafts_plan_action_id_plan_actions_id_fk" FOREIGN KEY ("plan_action_id") REFERENCES "locality"."plan_actions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "locality"."locality_children" ADD CONSTRAINT "locality_children_profile_id_locality_profiles_id_fk" FOREIGN KEY ("profile_id") REFERENCES "locality"."locality_profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "locality"."locality_circle_members" ADD CONSTRAINT "locality_circle_members_profile_id_locality_profiles_id_fk" FOREIGN KEY ("profile_id") REFERENCES "locality"."locality_profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "locality"."locality_circle_messages" ADD CONSTRAINT "locality_circle_messages_sender_id_locality_profiles_id_fk" FOREIGN KEY ("sender_id") REFERENCES "locality"."locality_profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "locality"."locality_emergency_contacts" ADD CONSTRAINT "locality_emergency_contacts_profile_id_locality_profiles_id_fk" FOREIGN KEY ("profile_id") REFERENCES "locality"."locality_profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "locality"."locality_invites" ADD CONSTRAINT "locality_invites_invited_by_locality_profiles_id_fk" FOREIGN KEY ("invited_by") REFERENCES "locality"."locality_profiles"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "locality"."locality_messages" ADD CONSTRAINT "locality_messages_ride_id_locality_rides_id_fk" FOREIGN KEY ("ride_id") REFERENCES "locality"."locality_rides"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "locality"."locality_messages" ADD CONSTRAINT "locality_messages_sender_id_locality_profiles_id_fk" FOREIGN KEY ("sender_id") REFERENCES "locality"."locality_profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "locality"."locality_messages" ADD CONSTRAINT "locality_messages_driver_id_locality_profiles_id_fk" FOREIGN KEY ("driver_id") REFERENCES "locality"."locality_profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "locality"."locality_messages" ADD CONSTRAINT "locality_messages_parent_id_locality_profiles_id_fk" FOREIGN KEY ("parent_id") REFERENCES "locality"."locality_profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "locality"."locality_ride_offers" ADD CONSTRAINT "locality_ride_offers_driver_id_locality_profiles_id_fk" FOREIGN KEY ("driver_id") REFERENCES "locality"."locality_profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "locality"."locality_ride_requests" ADD CONSTRAINT "locality_ride_requests_requester_id_locality_profiles_id_fk" FOREIGN KEY ("requester_id") REFERENCES "locality"."locality_profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "locality"."locality_rides" ADD CONSTRAINT "locality_rides_offer_id_locality_ride_offers_id_fk" FOREIGN KEY ("offer_id") REFERENCES "locality"."locality_ride_offers"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "locality"."locality_rides" ADD CONSTRAINT "locality_rides_request_id_locality_ride_requests_id_fk" FOREIGN KEY ("request_id") REFERENCES "locality"."locality_ride_requests"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "locality"."locality_rides" ADD CONSTRAINT "locality_rides_driver_id_locality_profiles_id_fk" FOREIGN KEY ("driver_id") REFERENCES "locality"."locality_profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "locality"."locality_rides" ADD CONSTRAINT "locality_rides_parent_id_locality_profiles_id_fk" FOREIGN KEY ("parent_id") REFERENCES "locality"."locality_profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "locality"."locality_safety_reports" ADD CONSTRAINT "locality_safety_reports_ride_id_locality_rides_id_fk" FOREIGN KEY ("ride_id") REFERENCES "locality"."locality_rides"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "locality"."locality_safety_reports" ADD CONSTRAINT "locality_safety_reports_reporter_id_locality_profiles_id_fk" FOREIGN KEY ("reporter_id") REFERENCES "locality"."locality_profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "locality"."plan_actions" ADD CONSTRAINT "plan_actions_weekly_plan_id_weekly_plans_id_fk" FOREIGN KEY ("weekly_plan_id") REFERENCES "locality"."weekly_plans"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "locality"."reviews" ADD CONSTRAINT "reviews_business_id_businesses_id_fk" FOREIGN KEY ("business_id") REFERENCES "locality"."businesses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "locality"."weekly_plans" ADD CONSTRAINT "weekly_plans_business_id_businesses_id_fk" FOREIGN KEY ("business_id") REFERENCES "locality"."businesses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "content_drafts_plan_action_id_idx" ON "locality"."content_drafts" USING btree ("plan_action_id");--> statement-breakpoint
CREATE INDEX "locality_children_profile_id_idx" ON "locality"."locality_children" USING btree ("profile_id");--> statement-breakpoint
CREATE INDEX "locality_circle_members_profile_id_idx" ON "locality"."locality_circle_members" USING btree ("profile_id");--> statement-breakpoint
CREATE INDEX "locality_circle_messages_circle_id_idx" ON "locality"."locality_circle_messages" USING btree ("circle_id");--> statement-breakpoint
CREATE INDEX "locality_emergency_contacts_profile_id_idx" ON "locality"."locality_emergency_contacts" USING btree ("profile_id");--> statement-breakpoint
CREATE INDEX "locality_invites_circle_id_idx" ON "locality"."locality_invites" USING btree ("circle_id");--> statement-breakpoint
CREATE INDEX "locality_messages_ride_id_idx" ON "locality"."locality_messages" USING btree ("ride_id");--> statement-breakpoint
CREATE INDEX "locality_ride_offers_circle_id_idx" ON "locality"."locality_ride_offers" USING btree ("circle_id");--> statement-breakpoint
CREATE INDEX "locality_ride_requests_circle_id_idx" ON "locality"."locality_ride_requests" USING btree ("circle_id");--> statement-breakpoint
CREATE INDEX "locality_rides_driver_id_idx" ON "locality"."locality_rides" USING btree ("driver_id");--> statement-breakpoint
CREATE INDEX "locality_rides_parent_id_idx" ON "locality"."locality_rides" USING btree ("parent_id");--> statement-breakpoint
CREATE INDEX "locality_submissions_status_idx" ON "locality"."locality_submissions" USING btree ("status");--> statement-breakpoint
CREATE INDEX "plan_actions_weekly_plan_id_idx" ON "locality"."plan_actions" USING btree ("weekly_plan_id");--> statement-breakpoint
CREATE INDEX "reviews_status_idx" ON "locality"."reviews" USING btree ("status");--> statement-breakpoint
CREATE INDEX "reviews_business_id_idx" ON "locality"."reviews" USING btree ("business_id");--> statement-breakpoint
CREATE INDEX "weekly_plans_business_id_idx" ON "locality"."weekly_plans" USING btree ("business_id");