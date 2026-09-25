import "server-only";
import { getSupabase } from "./supabase";
import type {
  ActionStatus,
  Business,
  ContentDraft,
  GeneratedAction,
  PlanAction,
  Review,
  ReviewStatus,
  ReviewWithBusinessName,
  WeeklyPlan,
  WeeklyPlanWithActions,
} from "./types";

export async function createBusiness(
  input: Omit<Business, "id" | "created_at">
): Promise<Business> {
  const { data, error } = await getSupabase()
    .from("businesses")
    .insert(input)
    .select()
    .single();
  if (error) throw error;
  return data as Business;
}

export async function getBusinessForUser(userId: string): Promise<Business | null> {
  const { data, error } = await getSupabase()
    .from("businesses")
    .select()
    .eq("user_id", userId)
    .maybeSingle();
  if (error) throw error;
  return data as Business | null;
}

export async function createWeeklyPlan(
  businessId: string,
  weekNumber: number,
  weekStart: string,
  theme: string
): Promise<WeeklyPlan> {
  const { data, error } = await getSupabase()
    .from("weekly_plans")
    .insert({ business_id: businessId, week_number: weekNumber, week_start: weekStart, theme })
    .select()
    .single();
  if (error) throw error;
  return data as WeeklyPlan;
}

export async function getWeeklyPlan(id: string): Promise<WeeklyPlan | null> {
  const { data, error } = await getSupabase()
    .from("weekly_plans")
    .select()
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return data as WeeklyPlan | null;
}

export async function createPlanActions(
  weeklyPlanId: string,
  actions: GeneratedAction[]
): Promise<PlanAction[]> {
  const rows = actions.map((a, i) => ({
    weekly_plan_id: weeklyPlanId,
    order_index: i,
    title: a.title,
    description: a.description,
    rationale: a.rationale,
    action_type: a.action_type,
    platform: a.platform,
  }));
  const { data, error } = await getSupabase()
    .from("plan_actions")
    .insert(rows)
    .select();
  if (error) throw error;
  return data as PlanAction[];
}

export async function getLatestPlanForBusiness(
  businessId: string
): Promise<WeeklyPlanWithActions | null> {
  const { data: plan, error } = await getSupabase()
    .from("weekly_plans")
    .select()
    .eq("business_id", businessId)
    .order("week_start", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  if (!plan) return null;

  const { data: actions, error: actionsError } = await getSupabase()
    .from("plan_actions")
    .select()
    .eq("weekly_plan_id", plan.id)
    .order("order_index");
  if (actionsError) throw actionsError;

  return { ...(plan as WeeklyPlan), actions: (actions ?? []) as PlanAction[] };
}

export async function getPlanAction(id: string): Promise<PlanAction | null> {
  const { data, error } = await getSupabase()
    .from("plan_actions")
    .select()
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return data as PlanAction | null;
}

/**
 * Fetches a plan action and verifies it actually belongs to businessId
 * (action -> weekly_plan -> business_id), so a caller can't act on an action
 * from a different business by pairing a foreign actionId with an
 * unrelated businessId.
 */
export async function getOwnedPlanAction(
  actionId: string,
  businessId: string
): Promise<PlanAction | null> {
  const action = await getPlanAction(actionId);
  if (!action) return null;

  const plan = await getWeeklyPlan(action.weekly_plan_id);
  if (!plan || plan.business_id !== businessId) return null;

  return action;
}

export async function setActionStatus(
  id: string,
  status: ActionStatus
): Promise<PlanAction> {
  const { data, error } = await getSupabase()
    .from("plan_actions")
    .update({ status })
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data as PlanAction;
}

export async function saveContentDraft(
  planActionId: string,
  draftText: string
): Promise<ContentDraft> {
  const { data, error } = await getSupabase()
    .from("content_drafts")
    .insert({ plan_action_id: planActionId, draft_text: draftText })
    .select()
    .single();
  if (error) throw error;
  return data as ContentDraft;
}

export async function getLatestContentDrafts(
  planActionIds: string[]
): Promise<Record<string, ContentDraft>> {
  if (planActionIds.length === 0) return {};

  const { data, error } = await getSupabase()
    .from("content_drafts")
    .select()
    .in("plan_action_id", planActionIds)
    .order("created_at", { ascending: false });
  if (error) throw error;

  const latest: Record<string, ContentDraft> = {};
  for (const draft of (data ?? []) as ContentDraft[]) {
    if (!latest[draft.plan_action_id]) latest[draft.plan_action_id] = draft;
  }
  return latest;
}

export async function createReview(input: {
  business_id: string;
  rating: number;
  body: string;
}): Promise<Review> {
  const { data, error } = await getSupabase()
    .from("reviews")
    .insert({ ...input, status: "pending" })
    .select()
    .single();
  if (error) throw error;
  return data as Review;
}

export async function getReviewForBusiness(businessId: string): Promise<Review | null> {
  const { data, error } = await getSupabase()
    .from("reviews")
    .select()
    .eq("business_id", businessId)
    .maybeSingle();
  if (error) throw error;
  return data as Review | null;
}

export async function getPendingReviews(): Promise<ReviewWithBusinessName[]> {
  const { data, error } = await getSupabase()
    .from("reviews")
    .select("*, businesses(name)")
    .eq("status", "pending")
    .order("created_at", { ascending: true });
  if (error) throw error;

  return (data ?? []).map((row) => {
    const { businesses, ...review } = row as Review & { businesses: { name: string } | null };
    return { ...review, business_name: businesses?.name ?? "Unknown business" };
  });
}

export async function setReviewStatus(id: string, status: ReviewStatus): Promise<void> {
  const { error } = await getSupabase().from("reviews").update({ status }).eq("id", id);
  if (error) throw error;
}

export async function getApprovedReviews(limit = 6): Promise<ReviewWithBusinessName[]> {
  const { data, error } = await getSupabase()
    .from("reviews")
    .select("*, businesses(name)")
    .eq("status", "approved")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw error;

  return (data ?? []).map((row) => {
    const { businesses, ...review } = row as Review & { businesses: { name: string } | null };
    return { ...review, business_name: businesses?.name ?? "A LocalReach customer" };
  });
}
