import { SiteHeader } from "@/components/SiteHeader";

export default function PrivacyPage() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 px-6 py-16">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-50">
            Privacy Policy
          </h1>
          <p className="text-sm text-neutral-500">Last updated: placeholder — set before launch.</p>
        </div>

        <div className="rounded-lg border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-200">
          <strong>Not legal advice.</strong> This is standard placeholder language, not written or
          reviewed by a lawyer. Have an actual attorney review this — especially around GDPR/CCPA
          applicability — before LocalReach handles real users&apos; data.
        </div>

        <div className="flex flex-col gap-6 text-sm text-neutral-700 dark:text-neutral-300">
          <section className="flex flex-col gap-2">
            <h2 className="font-semibold text-neutral-900 dark:text-neutral-50">
              1. What we collect
            </h2>
            <ul className="list-disc pl-5">
              <li>
                <strong>Business profile data</strong>: whatever you enter during onboarding
                (business name, category, description, target customers, location, goals).
              </li>
              <li>
                <strong>Generated content</strong>: the marketing plans and drafts created for
                your business.
              </li>
              <li>
                <strong>Reviews</strong>: any review you submit, including your rating and
                written feedback.
              </li>
            </ul>
            <p>
              LocalReach doesn&apos;t currently have accounts or sign-in, so we don&apos;t collect
              your name or email unless you include it yourself in a form field.
            </p>
          </section>

          <section className="flex flex-col gap-2">
            <h2 className="font-semibold text-neutral-900 dark:text-neutral-50">
              2. How we use it
            </h2>
            <p>
              To operate the service: generate your weekly marketing plans and content, show your
              business dashboard, and — if you submit a review and we approve it — display it
              publicly with your business name.
            </p>
          </section>

          <section className="flex flex-col gap-2">
            <h2 className="font-semibold text-neutral-900 dark:text-neutral-50">
              3. Who we share it with
            </h2>
            <p>We use third-party services to run LocalReach, which process data on our behalf:</p>
            <ul className="list-disc pl-5">
              <li>
                <strong>Supabase</strong> — hosts our database (your business and review data).
              </li>
              <li>
                <strong>Anthropic</strong> — your business profile is sent to generate your
                marketing plans and content.
              </li>
            </ul>
            <p>We don&apos;t sell your data.</p>
          </section>

          <section className="flex flex-col gap-2">
            <h2 className="font-semibold text-neutral-900 dark:text-neutral-50">
              4. Data retention &amp; deletion
            </h2>
            <p>
              We keep business data indefinitely unless you ask us to delete it — contact us using
              the details below.
            </p>
          </section>

          <section className="flex flex-col gap-2">
            <h2 className="font-semibold text-neutral-900 dark:text-neutral-50">
              5. Access control
            </h2>
            <p>
              Your dashboard is tied to your Google account — only you can sign in and view or
              edit your business&apos;s data.
            </p>
          </section>

          <section className="flex flex-col gap-2">
            <h2 className="font-semibold text-neutral-900 dark:text-neutral-50">
              6. Your choices
            </h2>
            <p>
              You can request a copy of your business&apos;s data or ask us to delete it by
              contacting us.
            </p>
          </section>

          <section className="flex flex-col gap-2">
            <h2 className="font-semibold text-neutral-900 dark:text-neutral-50">7. Contact</h2>
            <p>Questions about this policy — placeholder contact email goes here.</p>
          </section>
        </div>
      </main>
    </>
  );
}
