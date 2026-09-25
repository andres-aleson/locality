export interface Business {
  id: string;
  user_id: string;
  name: string;
  category: string;
  description: string;
  target_customers: string;
  location: string;
  goals: string;
  target_weeks: number;
  website_or_socials: string | null;
  created_at: string;
}

export type ActionType =
  | "content_post"
  | "review_request"
  | "local_outreach"
  | "profile_update"
  | "other";

export type Platform =
  | "google_business_profile"
  | "instagram"
  | "facebook"
  | "in_person"
  | "email"
  | "other";

export interface WeeklyPlan {
  id: string;
  business_id: string;
  week_number: number;
  week_start: string;
  theme: string;
  created_at: string;
}

export type ActionStatus = "pending" | "done";

export interface PlanAction {
  id: string;
  weekly_plan_id: string;
  order_index: number;
  title: string;
  description: string;
  rationale: string;
  action_type: ActionType;
  platform: Platform;
  status: ActionStatus;
  created_at: string;
}

export interface WeeklyPlanWithActions extends WeeklyPlan {
  actions: PlanAction[];
}

export interface ContentDraft {
  id: string;
  plan_action_id: string;
  draft_text: string;
  created_at: string;
}

export interface GeneratedAction {
  title: string;
  description: string;
  rationale: string;
  action_type: ActionType;
  platform: Platform;
}

export interface GeneratedPlan {
  theme: string;
  actions: GeneratedAction[];
}

export type ReviewStatus = "pending" | "approved" | "rejected";

export interface Review {
  id: string;
  business_id: string;
  rating: number;
  body: string;
  status: ReviewStatus;
  created_at: string;
}

export interface ReviewWithBusinessName extends Review {
  business_name: string;
}
