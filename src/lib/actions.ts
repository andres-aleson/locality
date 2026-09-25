"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { addWeeks, format, parseISO, startOfWeek } from "date-fns";
import { z } from "zod";
import { generateContentDraft, generateWeeklyPlan } from "./ai";
import { getSessionUser } from "./supabase-server";
import {
  createBusiness,
  createPlanActions,
  createReview,
  createWeeklyPlan,
  getBusinessForUser,
  getLatestPlanForBusiness,
  getOwnedPlanAction,
  getReviewForBusiness,
  saveContentDraft,
  setActionStatus,
  setReviewStatus,
} from "./db";
import type { ActionStatus, GeneratedPlan, ReviewStatus } from "./types";

async function requireOwnedBusiness() {
  const user = await getSessionUser();
  if (!user) throw new Error("Not signed in");

  const business = await getBusinessForUser(user.id);
  if (!business) throw new Error("No business found for this account");

  return business;
}

const businessInputSchema = z.object({
  name: z.string().trim().min(1, "Business name is required"),
  category: z.string().trim().min(1, "Category is required"),
  description: z.string().trim().min(1, "Description is required"),
  target_customers: z.string().trim().min(1, "Target customers is required"),
  location: z.string().trim().min(1, "Location is required"),
  goals: z.string().trim().min(1, "Goals is required"),
  target_weeks: z.coerce.number().int().min(1).max(52),
  website_or_socials: z.string().trim().optional(),
});

async function saveGeneratedPlan(
  businessId: string,
  weekNumber: number,
  weekStart: string,
  generated: GeneratedPlan
) {
  const plan = await createWeeklyPlan(businessId, weekNumber, weekStart, generated.theme);
  await createPlanActions(plan.id, generated.actions);
  return plan;
}

export async function createBusinessAndPlan(formData: FormData): Promise<void> {
  const user = await getSessionUser();
  if (!user) throw new Error("Not signed in");

  const existing = await getBusinessForUser(user.id);
  if (existing) redirect("/dashboard");

  const parsed = businessInputSchema.safeParse({
    name: formData.get("name"),
    category: formData.get("category"),
    description: formData.get("description"),
    target_customers: formData.get("target_customers"),
    location: formData.get("location"),
    goals: formData.get("goals"),
    target_weeks: formData.get("target_weeks"),
    website_or_socials: formData.get("website_or_socials"),
  });

  if (!parsed.success) {
    throw new Error(parsed.error.issues.map((i) => i.message).join(", "));
  }

  const business = await createBusiness({
    ...parsed.data,
    website_or_socials: parsed.data.website_or_socials || null,
    user_id: user.id,
  });

  const generated = await generateWeeklyPlan(business);
  const weekStart = format(startOfWeek(new Date(), { weekStartsOn: 1 }), "yyyy-MM-dd");
  await saveGeneratedPlan(business.id, 1, weekStart, generated);

  redirect("/dashboard");
}

export async function generateContentForAction(planActionId: string): Promise<void> {
  const business = await requireOwnedBusiness();
  const action = await getOwnedPlanAction(planActionId, business.id);
  if (!action) throw new Error("Plan action not found");

  const draftText = await generateContentDraft(business, action);
  await saveContentDraft(planActionId, draftText);

  revalidatePath("/dashboard");
}

export async function toggleActionStatus(
  actionId: string,
  currentStatus: ActionStatus
): Promise<void> {
  const business = await requireOwnedBusiness();
  const action = await getOwnedPlanAction(actionId, business.id);
  if (!action) throw new Error("Plan action not found");

  await setActionStatus(actionId, currentStatus === "done" ? "pending" : "done");
  revalidatePath("/dashboard");
}

export async function generateNextWeeklyPlan(): Promise<void> {
  const business = await requireOwnedBusiness();

  const previousPlan = await getLatestPlanForBusiness(business.id);
  if (previousPlan && previousPlan.week_number >= business.target_weeks) {
    // Already at (or past) the plan length the owner chose — the UI hides
    // this action once that happens, this is just a defense-in-depth guard.
    return;
  }

  const nextWeekNumber = previousPlan ? previousPlan.week_number + 1 : 1;
  const nextWeekStart = previousPlan
    ? format(addWeeks(parseISO(previousPlan.week_start), 1), "yyyy-MM-dd")
    : format(startOfWeek(new Date(), { weekStartsOn: 1 }), "yyyy-MM-dd");

  const generated = await generateWeeklyPlan(business, previousPlan?.actions);
  await saveGeneratedPlan(business.id, nextWeekNumber, nextWeekStart, generated);

  revalidatePath("/dashboard");
}

const reviewInputSchema = z.object({
  rating: z.coerce.number().int().min(1).max(5),
  body: z.string().trim().min(1, "Please write a few words about your experience"),
});

export async function submitReview(formData: FormData): Promise<void> {
  const business = await requireOwnedBusiness();

  const existing = await getReviewForBusiness(business.id);
  if (existing) throw new Error("A review has already been submitted for this business");

  const parsed = reviewInputSchema.safeParse({
    rating: formData.get("rating"),
    body: formData.get("body"),
  });
  if (!parsed.success) {
    throw new Error(parsed.error.issues.map((i) => i.message).join(", "));
  }

  await createReview({
    business_id: business.id,
    rating: parsed.data.rating,
    body: parsed.data.body,
  });

  redirect("/dashboard");
}

export async function approveReview(reviewId: string): Promise<void> {
  await setReviewStatus(reviewId, "approved" satisfies ReviewStatus);
  revalidatePath("/admin/reviews");
  revalidatePath("/");
}

export async function rejectReview(reviewId: string): Promise<void> {
  await setReviewStatus(reviewId, "rejected" satisfies ReviewStatus);
  revalidatePath("/admin/reviews");
}
