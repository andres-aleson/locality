import Link from "next/link";
import { redirect } from "next/navigation";
import { format, parseISO } from "date-fns";
import {
  getBusinessForUser,
  getLatestContentDrafts,
  getLatestPlanForBusiness,
  getReviewForBusiness,
} from "@/lib/db";
import {
  generateContentForAction,
  generateNextWeeklyPlan,
  toggleActionStatus,
} from "@/lib/actions";
import { getSessionUser } from "@/lib/supabase-server";
import { signOut } from "@/lib/auth-actions";
import type { PlanAction } from "@/lib/types";
import { SiteHeader } from "@/components/SiteHeader";

// Per-account data — must never be prerendered/cached as static content.
export const dynamic = "force-dynamic";

function prettify(value: string): string {
  return value
    .split("_")
    .map((word) => word[0].toUpperCase() + word.slice(1))
    .join(" ");
}

export default async function DashboardPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");

  const business = await getBusinessForUser(user.id);
  if (!business) redirect("/onboarding");

  const plan = await getLatestPlanForBusiness(business.id);
  const drafts = plan ? await getLatestContentDrafts(plan.actions.map((a) => a.id)) : {};
  const doneCount = plan?.actions.filter((a) => a.status === "done").length ?? 0;
  const allDone = !!plan && plan.actions.length > 0 && doneCount === plan.actions.length;
  const atWeekLimit = !!plan && plan.week_number >= business.target_weeks;
  const review = atWeekLimit ? await getReviewForBusiness(business.id) : null;

  return (
    <>
      <SiteHeader right={<SignOutLink />} />
      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-8 px-6 py-16">
        <div className="flex flex-col gap-1">
          <span className="text-sm font-medium uppercase tracking-wide text-neutral-500">
            {business.name}
          </span>
          {plan ? (
            <>
              <h1 className="text-2xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-50">
                {plan.theme}
              </h1>
              <p className="text-sm text-neutral-500">
                Week {plan.week_number} of {business.target_weeks} · Starting{" "}
                {format(parseISO(plan.week_start), "MMM d, yyyy")} · {doneCount}/
                {plan.actions.length} done
              </p>
            </>
          ) : (
            <h1 className="text-2xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-50">
              No plan yet
            </h1>
          )}
        </div>

        {!plan ? (
          <p className="text-neutral-600 dark:text-neutral-400">
            Something went wrong generating your first plan. Try onboarding again.
          </p>
        ) : (
          <>
            <ol className="flex flex-col gap-5">
              {plan.actions.map((action, i) => (
                <ActionCard
                  key={action.id}
                  index={i + 1}
                  action={action}
                  draftText={drafts[action.id]?.draft_text ?? null}
                />
              ))}
            </ol>

            <div className="flex flex-col items-center gap-3 border-t border-neutral-200 pt-6 text-center dark:border-neutral-800">
              {atWeekLimit ? (
                <>
                  <p className="text-sm font-medium text-neutral-800 dark:text-neutral-200">
                    You&apos;ve completed your {business.target_weeks}-week plan.
                  </p>
                  {review ? (
                    <p className="text-sm text-neutral-500">
                      Thanks for your review — it&apos;s pending approval before it appears
                      publicly.
                    </p>
                  ) : (
                    <Link
                      href="/dashboard/review"
                      className="rounded-full bg-neutral-900 px-6 py-3 text-sm font-medium text-white transition hover:bg-neutral-700 dark:bg-neutral-50 dark:text-neutral-900 dark:hover:bg-neutral-200"
                    >
                      Leave a review
                    </Link>
                  )}
                </>
              ) : (
                <>
                  {allDone && (
                    <p className="text-sm text-neutral-600 dark:text-neutral-400">
                      Nice work — you cleared this week&apos;s plan.
                    </p>
                  )}
                  <form action={generateNextWeeklyPlan}>
                    <button
                      type="submit"
                      className="rounded-full bg-neutral-900 px-6 py-3 text-sm font-medium text-white transition hover:bg-neutral-700 dark:bg-neutral-50 dark:text-neutral-900 dark:hover:bg-neutral-200"
                    >
                      Generate next week&apos;s plan
                    </button>
                  </form>
                </>
              )}
            </div>
          </>
        )}
      </main>
    </>
  );
}

function SignOutLink() {
  return (
    <form action={signOut}>
      <button
        type="submit"
        className="text-xs font-medium text-neutral-500 hover:underline"
      >
        Sign out
      </button>
    </form>
  );
}

function ActionCard({
  index,
  action,
  draftText,
}: {
  index: number;
  action: PlanAction;
  draftText: string | null;
}) {
  const generateContent = generateContentForAction.bind(null, action.id);
  const toggleStatus = toggleActionStatus.bind(null, action.id, action.status);
  const isDone = action.status === "done";

  return (
    <li
      className={`flex flex-col gap-3 rounded-xl border p-5 transition ${
        isDone
          ? "border-neutral-200 bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-900/40"
          : "border-neutral-200 dark:border-neutral-800"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-col gap-1">
          <span className="text-xs font-medium text-neutral-500">Step {index}</span>
          <h2
            className={`text-base font-semibold text-neutral-900 dark:text-neutral-50 ${
              isDone ? "line-through decoration-neutral-400" : ""
            }`}
          >
            {action.title}
          </h2>
        </div>
        <span className="shrink-0 rounded-full bg-neutral-100 px-2.5 py-1 text-xs font-medium text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300">
          {prettify(action.platform)}
        </span>
      </div>

      <p className="text-sm text-neutral-700 dark:text-neutral-300">{action.description}</p>
      <p className="text-sm italic text-neutral-500">Why: {action.rationale}</p>

      <div className="flex items-center gap-4">
        <form action={toggleStatus}>
          <button
            type="submit"
            className={`rounded-full border px-4 py-1.5 text-xs font-medium transition ${
              isDone
                ? "border-neutral-300 text-neutral-500 hover:border-neutral-900 dark:border-neutral-700 dark:hover:border-neutral-100"
                : "border-neutral-900 text-neutral-900 hover:bg-neutral-900 hover:text-white dark:border-neutral-100 dark:text-neutral-100 dark:hover:bg-neutral-100 dark:hover:text-neutral-900"
            }`}
          >
            {isDone ? "✓ Done — undo" : "Mark done"}
          </button>
        </form>
      </div>

      {draftText ? (
        <div className="flex flex-col gap-2 rounded-lg bg-neutral-50 p-4 dark:bg-neutral-900">
          <span className="text-xs font-medium uppercase tracking-wide text-neutral-500">
            Draft content
          </span>
          <p className="whitespace-pre-wrap text-sm text-neutral-800 dark:text-neutral-200">
            {draftText}
          </p>
          <form action={generateContent}>
            <button
              type="submit"
              className="mt-1 text-xs font-medium text-neutral-600 underline underline-offset-2 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100"
            >
              Regenerate
            </button>
          </form>
        </div>
      ) : (
        <form action={generateContent}>
          <button
            type="submit"
            className="mt-1 self-start rounded-full border border-neutral-300 px-4 py-1.5 text-xs font-medium text-neutral-800 transition hover:border-neutral-900 dark:border-neutral-700 dark:text-neutral-200 dark:hover:border-neutral-100"
          >
            Generate content
          </button>
        </form>
      )}
    </li>
  );
}
