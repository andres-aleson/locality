import { getPendingReviews } from "@/lib/db";
import { approveReview, rejectReview } from "@/lib/actions";
import { SiteHeader } from "@/components/SiteHeader";

// Reads the live review queue — must never be prerendered at build time.
export const dynamic = "force-dynamic";

export default async function AdminReviewsPage() {
  const reviews = await getPendingReviews();

  return (
    <>
      <SiteHeader />
      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-8 px-6 py-16">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-50">
            Pending reviews
          </h1>
          <p className="text-sm text-neutral-600 dark:text-neutral-400">
            Approve a review to show it publicly on the landing page.
          </p>
        </div>

        {reviews.length === 0 ? (
          <p className="text-sm text-neutral-500">Nothing waiting on approval.</p>
        ) : (
          <ul className="flex flex-col gap-4">
            {reviews.map((review) => {
              const approve = approveReview.bind(null, review.id);
              const reject = rejectReview.bind(null, review.id);
              return (
                <li
                  key={review.id}
                  className="flex flex-col gap-3 rounded-xl border border-neutral-200 p-5 dark:border-neutral-800"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-neutral-900 dark:text-neutral-50">
                      {review.business_name}
                    </span>
                    <span className="text-sm text-neutral-500">{"★".repeat(review.rating)}</span>
                  </div>
                  <p className="text-sm text-neutral-700 dark:text-neutral-300">{review.body}</p>
                  <div className="flex gap-3">
                    <form action={approve}>
                      <button
                        type="submit"
                        className="rounded-full bg-neutral-900 px-4 py-1.5 text-xs font-medium text-white transition hover:bg-neutral-700 dark:bg-neutral-50 dark:text-neutral-900 dark:hover:bg-neutral-200"
                      >
                        Approve
                      </button>
                    </form>
                    <form action={reject}>
                      <button
                        type="submit"
                        className="rounded-full border border-neutral-300 px-4 py-1.5 text-xs font-medium text-neutral-800 transition hover:border-neutral-900 dark:border-neutral-700 dark:text-neutral-200 dark:hover:border-neutral-100"
                      >
                        Reject
                      </button>
                    </form>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </main>
    </>
  );
}
