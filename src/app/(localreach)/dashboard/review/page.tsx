import Link from "next/link";
import { redirect } from "next/navigation";
import { getBusinessForUser, getReviewForBusiness } from "@/lib/db";
import { submitReview } from "@/lib/actions";
import { getSessionUser } from "@/lib/session";
import { SiteHeader } from "@/components/SiteHeader";

// Per-account data — must never be prerendered/cached as static content.
export const dynamic = "force-dynamic";

export default async function ReviewPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");

  const business = await getBusinessForUser(user.id);
  if (!business) redirect("/onboarding");

  const existing = await getReviewForBusiness(business.id);
  if (existing) redirect("/dashboard");

  return (
    <>
      <SiteHeader />
      <main className="mx-auto flex w-full max-w-xl flex-1 flex-col gap-8 px-6 py-16">
        <Link href="/dashboard" className="text-xs font-medium text-neutral-500 hover:underline">
          ← Back to dashboard
        </Link>

        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-50">
            How was your {business.target_weeks}-week plan?
          </h1>
          <p className="text-sm text-neutral-600 dark:text-neutral-400">
            Your review may be shown publicly on the LocalReach site after we take a quick look —
            it helps other first-time owners decide whether to try it.
          </p>
        </div>

        <form action={submitReview} className="flex flex-col gap-5">
          <fieldset className="flex flex-col gap-1.5">
            <legend className="text-sm font-medium text-neutral-800 dark:text-neutral-200">
              Rating
            </legend>
            <div className="flex gap-4">
              {[1, 2, 3, 4, 5].map((value) => (
                <label key={value} className="flex items-center gap-1.5 text-sm">
                  <input
                    type="radio"
                    name="rating"
                    value={value}
                    defaultChecked={value === 5}
                    className="accent-neutral-900 dark:accent-neutral-100"
                  />
                  {value}
                </label>
              ))}
            </div>
          </fieldset>

          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-neutral-800 dark:text-neutral-200">
              Your review
            </span>
            <textarea
              name="body"
              required
              rows={5}
              placeholder="What was it like using LocalReach for your business?"
              className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-neutral-900 focus:outline-none dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100 dark:focus:border-neutral-100"
            />
          </label>

          <button
            type="submit"
            className="mt-2 self-start rounded-full bg-neutral-900 px-6 py-3 text-sm font-medium text-white transition hover:bg-neutral-700 dark:bg-neutral-50 dark:text-neutral-900 dark:hover:bg-neutral-200"
          >
            Submit review
          </button>
        </form>
      </main>
    </>
  );
}
