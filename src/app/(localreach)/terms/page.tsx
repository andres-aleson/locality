import { SiteHeader } from "@/components/SiteHeader";

export default function TermsPage() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 px-6 py-16">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-50">
            Terms &amp; Conditions
          </h1>
          <p className="text-sm text-neutral-500">Last updated: placeholder — set before launch.</p>
        </div>

        <div className="rounded-lg border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-200">
          <strong>Not legal advice.</strong> This is standard placeholder language, not written or
          reviewed by a lawyer. Have an actual attorney review and adapt this before LocalReach
          handles real users&apos; data or reviews.
        </div>

        <div className="flex flex-col gap-6 text-sm text-neutral-700 dark:text-neutral-300">
          <section className="flex flex-col gap-2">
            <h2 className="font-semibold text-neutral-900 dark:text-neutral-50">
              1. Acceptance of terms
            </h2>
            <p>
              By using LocalReach, you agree to these Terms &amp; Conditions. If you don&apos;t
              agree, don&apos;t use the service.
            </p>
          </section>

          <section className="flex flex-col gap-2">
            <h2 className="font-semibold text-neutral-900 dark:text-neutral-50">
              2. What LocalReach does
            </h2>
            <p>
              LocalReach generates weekly marketing plans and draft marketing content for local
              businesses using AI (including third-party models from Anthropic). Suggestions and
              content are generated automatically and are not guaranteed to be accurate,
              effective, or suitable for your business — you&apos;re responsible for reviewing
              anything before you publish or send it.
            </p>
          </section>

          <section className="flex flex-col gap-2">
            <h2 className="font-semibold text-neutral-900 dark:text-neutral-50">
              3. Account access
            </h2>
            <p>
              Your dashboard is tied to your Google account and only accessible after signing
              in — one business per account.
            </p>
          </section>

          <section className="flex flex-col gap-2">
            <h2 className="font-semibold text-neutral-900 dark:text-neutral-50">
              4. Your content and reviews
            </h2>
            <p>
              You&apos;re responsible for the business information you submit and any reviews you
              write. By submitting a review, you grant LocalReach permission to display it
              publicly on the site (after moderation) with your business name. Don&apos;t submit
              anything false, defamatory, or that you don&apos;t have the right to share. We may
              remove content at our discretion.
            </p>
          </section>

          <section className="flex flex-col gap-2">
            <h2 className="font-semibold text-neutral-900 dark:text-neutral-50">
              5. Acceptable use
            </h2>
            <p>
              Don&apos;t use LocalReach to generate content that is illegal, deceptive,
              harassing, or infringes on someone else&apos;s rights. Don&apos;t attempt to
              disrupt, reverse-engineer, or abuse the service.
            </p>
          </section>

          <section className="flex flex-col gap-2">
            <h2 className="font-semibold text-neutral-900 dark:text-neutral-50">
              6. Third-party services
            </h2>
            <p>
              LocalReach relies on third-party providers — Vercel (hosting), Render (database), and
              Anthropic (AI generation). Your use of LocalReach is also subject to those
              providers&apos; own terms.
            </p>
          </section>

          <section className="flex flex-col gap-2">
            <h2 className="font-semibold text-neutral-900 dark:text-neutral-50">
              7. Disclaimer &amp; limitation of liability
            </h2>
            <p>
              LocalReach is provided &quot;as is,&quot; without warranties of any kind. We are not
              liable for business outcomes, lost customers, lost revenue, or damages arising from
              your use of AI-generated plans or content.
            </p>
          </section>

          <section className="flex flex-col gap-2">
            <h2 className="font-semibold text-neutral-900 dark:text-neutral-50">
              8. Changes to these terms
            </h2>
            <p>
              We may update these terms from time to time. Continued use of LocalReach after a
              change means you accept the updated terms.
            </p>
          </section>

          <section className="flex flex-col gap-2">
            <h2 className="font-semibold text-neutral-900 dark:text-neutral-50">9. Contact</h2>
            <p>Questions about these terms — placeholder contact email goes here.</p>
          </section>
        </div>
      </main>
    </>
  );
}
