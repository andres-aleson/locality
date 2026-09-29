import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { getApprovedReviews } from "@/lib/db";
import { getSessionUser } from "@/lib/session";

// Shows live approved reviews and the caller's session — never prerender.
export const dynamic = "force-dynamic";

const steps = [
  {
    number: "01",
    title: "Tell us about your business",
    body: "A couple minutes on who you are, who you serve, and what growth looks like — no marketing jargon required.",
  },
  {
    number: "02",
    title: "Get this week's plan",
    body: "3–4 concrete actions, each with what to do and why it matters for your specific business.",
  },
  {
    number: "03",
    title: "Get the content, done for you",
    body: "Ready-to-use captions, review requests, and profile copy for each action — copy, paste, go.",
  },
];

const benefits = [
  {
    title: "Get discovered — without a marketing degree",
    body: "No ad budget, no agency, no guessing what to post. Just this week's next step.",
  },
  {
    title: "Feel confident about growth",
    body: "A small, achievable plan every week beats staring at a blank page wondering where the next customer comes from.",
  },
  {
    title: "Look professional online",
    body: "Build a trustworthy presence — profile, reviews, consistent posts — without touching a design tool.",
  },
];

export default async function Home() {
  // Testimonials are decoration — if the database is unreachable (or not
  // configured yet), render the page without them instead of failing it.
  const reviews = await getApprovedReviews().catch((error) => {
    console.error("Failed to load approved reviews:", error);
    return [];
  });
  const user = await getSessionUser();

  return (
    <>
      <SiteHeader
        right={
          <Link
            href={user ? "/dashboard" : "/login"}
            className="text-xs font-medium text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100"
          >
            {user ? "My dashboard →" : "Sign in →"}
          </Link>
        }
      />

      <main className="flex flex-1 flex-col">
        <section className="flex flex-col items-center gap-6 px-6 py-20 text-center">
          <span className="text-sm font-medium uppercase tracking-wide text-neutral-500">
            AI marketing coach for local businesses
          </span>
          <h1 className="max-w-xl text-4xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-50">
            Your AI marketing coach for getting noticed locally
          </h1>
          <p className="max-w-md text-balance text-neutral-600 dark:text-neutral-400">
            Tell us about your business and we&apos;ll build this week&apos;s marketing
            plan — exactly what to do, why it matters, and the content to go with it.
          </p>
          <Link
            href="/onboarding"
            className="mt-2 rounded-full bg-neutral-900 px-6 py-3 text-sm font-medium text-white transition hover:bg-neutral-700 dark:bg-neutral-50 dark:text-neutral-900 dark:hover:bg-neutral-200"
          >
            Get my first weekly plan
          </Link>
        </section>

        <section className="border-t border-neutral-200 bg-neutral-50 px-6 py-20 dark:border-neutral-800 dark:bg-neutral-950">
          <div className="mx-auto flex w-full max-w-4xl flex-col gap-12">
            <h2 className="text-center text-2xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-50">
              How it works
            </h2>
            <div className="grid gap-8 sm:grid-cols-3">
              {steps.map((step) => (
                <div key={step.number} className="flex flex-col gap-2">
                  <span className="text-sm font-semibold text-neutral-400">{step.number}</span>
                  <h3 className="text-base font-semibold text-neutral-900 dark:text-neutral-50">
                    {step.title}
                  </h3>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400">{step.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="border-t border-neutral-200 px-6 py-20 dark:border-neutral-800">
          <div className="mx-auto flex w-full max-w-4xl flex-col gap-12">
            <h2 className="text-center text-2xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-50">
              Built for the first-time founder
            </h2>
            <div className="grid gap-8 sm:grid-cols-3">
              {benefits.map((benefit) => (
                <div key={benefit.title} className="flex flex-col gap-2">
                  <h3 className="text-base font-semibold text-neutral-900 dark:text-neutral-50">
                    {benefit.title}
                  </h3>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400">{benefit.body}</p>
                </div>
              ))}
            </div>
            <p className="mx-auto max-w-2xl text-center text-sm text-neutral-500">
              In our research, a first-time contractor with just two online reviews and almost
              no new customers didn&apos;t need more marketing tools — they needed someone to
              tell them exactly what to do next.
            </p>
          </div>
        </section>

        <section className="border-t border-neutral-200 bg-neutral-50 px-6 py-20 dark:border-neutral-800 dark:bg-neutral-950">
          <div className="mx-auto flex w-full max-w-4xl flex-col gap-8">
            <h2 className="text-center text-2xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-50">
              Not another content generator
            </h2>
            <div className="grid gap-6 sm:grid-cols-3">
              <div className="flex flex-col gap-2 rounded-xl border border-neutral-200 p-5 dark:border-neutral-800">
                <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-50">
                  Canva / ChatGPT
                </h3>
                <p className="text-sm text-neutral-600 dark:text-neutral-400">
                  Make content when you already know what you want to say. They don&apos;t tell
                  you what to do or when.
                </p>
              </div>
              <div className="flex flex-col gap-2 rounded-xl border border-neutral-200 p-5 dark:border-neutral-800">
                <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-50">
                  Marketing agencies
                </h3>
                <p className="text-sm text-neutral-600 dark:text-neutral-400">
                  Full-service, but priced for businesses that already have marketing budgets to
                  spare.
                </p>
              </div>
              <div className="flex flex-col gap-2 rounded-xl border border-neutral-900 p-5 dark:border-neutral-100">
                <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-50">
                  LocalReach
                </h3>
                <p className="text-sm text-neutral-600 dark:text-neutral-400">
                  Tells you exactly what marketing action to take this week, why it matters, and
                  writes the content for you — an ongoing coach, not a one-off tool.
                </p>
              </div>
            </div>
          </div>
        </section>

        {reviews.length > 0 && (
          <section className="border-t border-neutral-200 px-6 py-20 dark:border-neutral-800">
            <div className="mx-auto flex w-full max-w-4xl flex-col gap-12">
              <h2 className="text-center text-2xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-50">
                What business owners say
              </h2>
              <div className="grid gap-6 sm:grid-cols-3">
                {reviews.map((review) => (
                  <div
                    key={review.id}
                    className="flex flex-col gap-2 rounded-xl border border-neutral-200 p-5 dark:border-neutral-800"
                  >
                    <span className="text-sm text-neutral-500">{"★".repeat(review.rating)}</span>
                    <p className="text-sm text-neutral-700 dark:text-neutral-300">
                      {review.body}
                    </p>
                    <span className="text-xs font-medium text-neutral-500">
                      {review.business_name}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        <section className="flex flex-col items-center gap-4 px-6 py-20 text-center">
          <h2 className="text-2xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-50">
            Ready for this week&apos;s plan?
          </h2>
          <Link
            href="/onboarding"
            className="rounded-full bg-neutral-900 px-6 py-3 text-sm font-medium text-white transition hover:bg-neutral-700 dark:bg-neutral-50 dark:text-neutral-900 dark:hover:bg-neutral-200"
          >
            Get my first weekly plan
          </Link>
        </section>
      </main>
    </>
  );
}
