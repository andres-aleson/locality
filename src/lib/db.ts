import "server-only";
import { asc, desc, eq, getTableColumns, inArray } from "drizzle-orm";
import { getDb } from "@/db";
import { businesses, contentDrafts, planActions, reviews, weeklyPlans } from "@/db/schema";
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
  const [row] = await getDb().insert(businesses).values(input).returning();
  return row;
}

export async function getBusinessForUser(userId: string): Promise<Business | null> {
  const [row] = await getDb().select().from(businesses).where(eq(businesses.user_id, userId)).limit(1);
  return row ?? null;
}

export async function createWeeklyPlan(
  businessId: string,
  weekNumber: number,
  weekStart: string,
  theme: string
): Promise<WeeklyPlan> {
  const [row] = await getDb()
    .insert(weeklyPlans)
    .values({ business_id: businessId, week_number: weekNumber, week_start: weekStart, theme })
    .returning();
  return row;
}

export async function getWeeklyPlan(id: string): Promise<WeeklyPlan | null> {
  const [row] = await getDb().select().from(weeklyPlans).where(eq(weeklyPlans.id, id)).limit(1);
  return row ?? null;
}

export async function createPlanActions(
  weeklyPlanId: string,
  actions: GeneratedAction[]
): Promise<PlanAction[]> {
  if (actions.length === 0) return [];
  const rows = actions.map((a, i) => ({
    weekly_plan_id: weeklyPlanId,
    order_index: i,
    title: a.title,
    description: a.description,
    rationale: a.rationale,
    action_type: a.action_type,
    platform: a.platform,
  }));
  return (await getDb().insert(planActions).values(rows).returning()) as PlanAction[];
}

export async function getLatestPlanForBusiness(
  businessId: string
): Promise<WeeklyPlanWithActions | null> {
  const [plan] = await getDb()
    .select()
    .from(weeklyPlans)
    .where(eq(weeklyPlans.business_id, businessId))
    .orderBy(desc(weeklyPlans.week_start))
    .limit(1);
  if (!plan) return null;

  const actions = await getDb()
    .select()
    .from(planActions)
    .where(eq(planActions.weekly_plan_id, plan.id))
    .orderBy(asc(planActions.order_index));

  return { ...plan, actions: actions as PlanAction[] };
}

export async function getPlanAction(id: string): Promise<PlanAction | null> {
  const [row] = await getDb().select().from(planActions).where(eq(planActions.id, id)).limit(1);
  return (row as PlanAction | undefined) ?? null;
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
  const [row] = await getDb().update(planActions).set({ status }).where(eq(planActions.id, id)).returning();
  if (!row) throw new Error("Plan action not found");
  return row as PlanAction;
}

export async function saveContentDraft(
  planActionId: string,
  draftText: string
): Promise<ContentDraft> {
  const [row] = await getDb()
    .insert(contentDrafts)
    .values({ plan_action_id: planActionId, draft_text: draftText })
    .returning();
  return row;
}

export async function getLatestContentDrafts(
  planActionIds: string[]
): Promise<Record<string, ContentDraft>> {
  if (planActionIds.length === 0) return {};

  const rows = await getDb()
    .select()
    .from(contentDrafts)
    .where(inArray(contentDrafts.plan_action_id, planActionIds))
    .orderBy(desc(contentDrafts.created_at));

  const latest: Record<string, ContentDraft> = {};
  for (const draft of rows) {
    if (!latest[draft.plan_action_id]) latest[draft.plan_action_id] = draft;
  }
  return latest;
}

export async function createReview(input: {
  business_id: string;
  rating: number;
  body: string;
}): Promise<Review> {
  const [row] = await getDb()
    .insert(reviews)
    .values({ ...input, status: "pending" })
    .returning();
  return row as Review;
}

export async function getReviewForBusiness(businessId: string): Promise<Review | null> {
  const [row] = await getDb().select().from(reviews).where(eq(reviews.business_id, businessId)).limit(1);
  return (row as Review | undefined) ?? null;
}

async function getReviewsWithBusinessName(
  status: ReviewStatus,
  order: "asc" | "desc",
  fallbackName: string,
  limit?: number
): Promise<ReviewWithBusinessName[]> {
  const query = getDb()
    .select({ ...getTableColumns(reviews), business_name: businesses.name })
    .from(reviews)
    .leftJoin(businesses, eq(reviews.business_id, businesses.id))
    .where(eq(reviews.status, status))
    .orderBy(order === "asc" ? asc(reviews.created_at) : desc(reviews.created_at));

  const rows = limit ? await query.limit(limit) : await query;
  return rows.map((row) => ({ ...(row as Review), business_name: row.business_name ?? fallbackName }));
}

export async function getPendingReviews(): Promise<ReviewWithBusinessName[]> {
  return getReviewsWithBusinessName("pending", "asc", "Unknown business");
}

export async function setReviewStatus(id: string, status: ReviewStatus): Promise<void> {
  await getDb().update(reviews).set({ status }).where(eq(reviews.id, id));
}

export async function getApprovedReviews(limit = 6): Promise<ReviewWithBusinessName[]> {
  return getReviewsWithBusinessName("approved", "desc", "A LocalReach customer", limit);
}
