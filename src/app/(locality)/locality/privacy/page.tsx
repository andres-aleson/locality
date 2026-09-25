import Link from "next/link";
import { LocalityLogo } from "@/components/locality/Logo";

export default function LocalityPrivacyPage() {
  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 px-6 py-16">
      <Link href="/locality" className="self-start text-sm font-medium text-sky-600 dark:text-sky-400">
        ← Back to Locality
      </Link>
      <div className="flex flex-col items-start gap-3">
        <LocalityLogo />
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-50">
          Privacy Policy
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Draft last revised: July 26, 2026 — not yet in effect for a real launch.
        </p>
      </div>

      <div className="rounded-lg border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-200">
        <strong>Not legal advice — not attorney-reviewed.</strong> This draft was written to track
        the general structure of California&apos;s CCPA/CPRA (Section 5) and COPPA&apos;s treatment
        of children&apos;s information (Section 6), but a licensed attorney has not reviewed it or
        confirmed it&apos;s complete for Locality&apos;s actual data practices. Have an attorney
        review this before Locality handles real families&apos; data — including whether the
        children&apos;s information collected here (name, grade, school, entered by a parent) needs
        anything beyond what Section 6 describes.
      </div>

      <div className="flex flex-col gap-6 text-sm text-slate-700 dark:text-slate-300">
        <section className="flex flex-col gap-2">
          <h2 className="font-semibold text-slate-900 dark:text-slate-50">1. Scope</h2>
          <p>
            This Privacy Policy explains what personal information Locality collects, how it&apos;s
            used, and the choices you have about it. It applies to anyone who creates a Locality
            account. It does not apply to information about a child beyond what a parent or
            guardian chooses to enter on that child&apos;s behalf — see Section 6.
          </p>
        </section>

        <section className="flex flex-col gap-2">
          <h2 className="font-semibold text-slate-900 dark:text-slate-50">2. What we collect</h2>
          <ul className="list-disc pl-5">
            <li>
              <strong>Account info</strong>: your name and email (from Google sign-in), plus phone
              number and home address that you self-report.
            </li>
            <li>
              <strong>Children&apos;s info</strong>: first name, grade, and school, entered by you
              as the parent/guardian account holder.
            </li>
            <li>
              <strong>Community activity</strong>: which school Circles you join, ride offers and
              requests you post, ride history, and messages you send to other users.
            </li>
            <li>
              <strong>Reliability data</strong>: your completed-ride count and reliability score,
              and any safety reports you submit.
            </li>
            <li>
              <strong>Emergency contacts</strong>: name, phone number, and relationship, if you
              choose to add any.
            </li>
          </ul>
          <p>
            Locality does not currently collect driver&apos;s license photos, proof-of-residence
            documents, or other identity documents — account verification is self-reported only
            at this time (see our{" "}
            <Link href="/locality/terms" className="font-medium text-sky-600 underline dark:text-sky-400">
              Terms of Service
            </Link>
            ). We don&apos;t collect precise device geolocation, and we don&apos;t use any
            advertising or analytics trackers.
          </p>
        </section>

        <section className="flex flex-col gap-2">
          <h2 className="font-semibold text-slate-900 dark:text-slate-50">3. How we use it</h2>
          <p>
            To operate the app: create and manage your account, match you with other families in
            your school Circle, let you coordinate and confirm rides, enable messaging between
            users you&apos;re matched with, calculate reliability scores and badges, and respond to
            safety reports. We don&apos;t use your information for advertising, and we don&apos;t
            build advertising profiles.
          </p>
        </section>

        <section className="flex flex-col gap-2">
          <h2 className="font-semibold text-slate-900 dark:text-slate-50">4. Who we share it with</h2>
          <p>We use third-party services to run Locality, which process data on our behalf:</p>
          <ul className="list-disc pl-5">
            <li>
              <strong>Supabase</strong> — hosts our database, including your account, ride, and
              message data.
            </li>
            <li>
              <strong>Google</strong> — used only to sign you in; we don&apos;t receive your
              Google password.
            </li>
          </ul>
          <p>
            Other Locality users in your Circle can see your name, badges, reliability score, and
            information you post in offers/requests. <strong>We do not sell or share (as those
            terms are defined under the CCPA) any personal information</strong>, including any
            information about minors, in exchange for money or other valuable consideration, and we
            don&apos;t use it for cross-context behavioral advertising.
          </p>
        </section>

        <section className="flex flex-col gap-2">
          <h2 className="font-semibold text-slate-900 dark:text-slate-50">
            5. Your California privacy rights (CCPA/CPRA)
          </h2>
          <p>
            If you&apos;re a California resident, you have the right to:
          </p>
          <ul className="list-disc pl-5">
            <li>
              <strong>Know</strong> what personal information we&apos;ve collected about you and
              why (summarized in Sections 2–4 above).
            </li>
            <li>
              <strong>Access</strong> a copy of that information.
            </li>
            <li>
              <strong>Correct</strong> inaccurate personal information.
            </li>
            <li>
              <strong>Delete</strong> your personal information, subject to limited exceptions
              (for example, records we need to keep to investigate an active safety report).
            </li>
            <li>
              <strong>Opt out</strong> of sale or sharing — not applicable today, since we don&apos;t
              sell or share personal information, but you can still tell us if you&apos;d like this
              on record.
            </li>
            <li>
              <strong>Non-discrimination</strong> — we won&apos;t deny you access to Locality,
              charge you a different amount, or provide a different level of service for
              exercising any of these rights.
            </li>
          </ul>
          <p>
            To exercise any of these rights, contact us using the details in Section 9. Because your
            account is tied to Google sign-in, we&apos;ll verify a request by confirming it comes
            from your signed-in account (or, for a request made through an authorized agent, by
            asking for proof of that authorization).
          </p>
        </section>

        <section className="flex flex-col gap-2">
          <h2 className="font-semibold text-slate-900 dark:text-slate-50">
            6. Children&apos;s privacy
          </h2>
          <p>
            Locality is intended for use by parents and guardians, not directly by children.
            Children do not create Locality accounts, do not sign in, and do not submit any
            information themselves. The limited information we hold about a child (first name,
            grade, school) is entered by the parent/guardian account holder for the sole purpose of
            coordinating that child&apos;s carpool within their school Circle, and is visible only
            to other verified parents in that same Circle — never sold, shared, or used for
            advertising.
          </p>
          <p>
            If we ever learn that a child has created their own account directly (bypassing a
            parent), we&apos;ll delete that account and associated data. If you believe your
            child has submitted information to Locality directly, contact us using the details in
            Section 9 and we&apos;ll investigate and delete it.
          </p>
        </section>

        <section className="flex flex-col gap-2">
          <h2 className="font-semibold text-slate-900 dark:text-slate-50">
            7. Data retention &amp; deletion
          </h2>
          <p>
            We keep your account data for as long as your account is active. If you delete your
            account or ask us to delete your data, we&apos;ll remove it within a reasonable time,
            except for records we&apos;re required to keep or need to retain to investigate an open
            safety report or resolve a dispute — in that case we keep only what&apos;s necessary for
            that purpose, for as long as it&apos;s needed.
          </p>
        </section>

        <section className="flex flex-col gap-2">
          <h2 className="font-semibold text-slate-900 dark:text-slate-50">8. Data security</h2>
          <p>
            Your data is stored with Supabase using encryption in transit (TLS) and at rest, behind
            access controls that require your Google sign-in — only you can access your own
            profile, and only members of a Circle can see that Circle&apos;s families and messages.
            No method of storage or transmission is 100% secure, and we can&apos;t guarantee
            absolute security.
          </p>
        </section>

        <section className="flex flex-col gap-2">
          <h2 className="font-semibold text-slate-900 dark:text-slate-50">9. Contact &amp; changes</h2>
          <p>
            Questions about this policy, or requests to access/correct/delete your data — placeholder
            contact email goes here. If we make a material change to this policy, we&apos;ll update
            the &quot;draft last revised&quot; date above and, where required, ask you to
            re-acknowledge it.
          </p>
        </section>
      </div>
    </main>
  );
}
