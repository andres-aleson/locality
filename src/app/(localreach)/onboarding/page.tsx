import { redirect } from "next/navigation";
import { createBusinessAndPlan } from "@/lib/actions";
import { getBusinessForUser } from "@/lib/db";
import { getSessionUser } from "@/lib/session";
import { SiteHeader } from "@/components/SiteHeader";

// Depends on the caller's session — must never be prerendered/cached as static content.
export const dynamic = "force-dynamic";

function Field({
  name,
  label,
  placeholder,
  hint,
  textarea,
  required = true,
}: {
  name: string;
  label: string;
  placeholder: string;
  hint?: string;
  textarea?: boolean;
  required?: boolean;
}) {
  const sharedClassName =
    "w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-neutral-900 focus:outline-none dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100 dark:focus:border-neutral-100";

  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-sm font-medium text-neutral-800 dark:text-neutral-200">
        {label}
      </span>
      {textarea ? (
        <textarea
          name={name}
          placeholder={placeholder}
          required={required}
          rows={3}
          className={sharedClassName}
        />
      ) : (
        <input
          type="text"
          name={name}
          placeholder={placeholder}
          required={required}
          className={sharedClassName}
        />
      )}
      {hint && <span className="text-xs text-neutral-500">{hint}</span>}
    </label>
  );
}

export default async function OnboardingPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");

  const existing = await getBusinessForUser(user.id);
  if (existing) redirect("/dashboard");

  return (
    <>
      <SiteHeader />
      <main className="mx-auto flex w-full max-w-xl flex-1 flex-col gap-8 px-6 py-16">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-50">
            Tell us about your business
          </h1>
          <p className="text-sm text-neutral-600 dark:text-neutral-400">
            A couple minutes of detail now means a marketing plan that actually
            fits your business — not generic advice.
          </p>
        </div>

        <form action={createBusinessAndPlan} className="flex flex-col gap-5">
          <Field name="name" label="Business name" placeholder="e.g. Ramirez Electrical" />
          <Field
            name="category"
            label="What kind of business is it?"
            placeholder="e.g. Residential electrical contractor"
          />
          <Field
            name="description"
            label="What do you do, in your own words?"
            placeholder="e.g. We handle electrical repairs, panel upgrades, and small rewiring jobs for homeowners."
            textarea
          />
          <Field
            name="target_customers"
            label="Who are you trying to reach?"
            placeholder="e.g. Homeowners in the area who need reliable, licensed electrical work"
          />
          <Field
            name="location"
            label="Where are you based / where do you serve?"
            placeholder="e.g. Springfield, IL and surrounding suburbs"
          />
          <Field
            name="goals"
            label="What does growth look like for you right now?"
            placeholder="e.g. A few more calls a week from people who trust us before we even show up"
            textarea
          />
          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-neutral-800 dark:text-neutral-200">
              How many weeks would you like a plan for?
            </span>
            <select
              name="target_weeks"
              defaultValue="4"
              className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 focus:border-neutral-900 focus:outline-none dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100 dark:focus:border-neutral-100"
            >
              <option value="2">2 weeks</option>
              <option value="4">4 weeks</option>
              <option value="6">6 weeks</option>
              <option value="8">8 weeks</option>
              <option value="12">12 weeks</option>
            </select>
            <span className="text-xs text-neutral-500">
              After your last week, we&apos;ll ask you for a quick review.
            </span>
          </label>
          <Field
            name="website_or_socials"
            label="Existing website or social pages (optional)"
            placeholder="e.g. instagram.com/ramirezelectrical"
            required={false}
          />

          <button
            type="submit"
            className="mt-2 rounded-full bg-neutral-900 px-6 py-3 text-sm font-medium text-white transition hover:bg-neutral-700 dark:bg-neutral-50 dark:text-neutral-900 dark:hover:bg-neutral-200"
          >
            Generate my week 1 plan
          </button>
        </form>
      </main>
    </>
  );
}
