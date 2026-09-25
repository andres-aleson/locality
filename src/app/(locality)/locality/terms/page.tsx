import Link from "next/link";
import { LocalityLogo } from "@/components/locality/Logo";

export default function LocalityTermsPage() {
  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 px-6 py-16">
      <Link href="/locality" className="self-start text-sm font-medium text-sky-600 dark:text-sky-400">
        ← Back to Locality
      </Link>
      <div className="flex flex-col items-start gap-3">
        <LocalityLogo />
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-50">
          Terms of Service
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Draft last revised: July 26, 2026 — not yet in effect for a real launch.
        </p>
      </div>

      <div className="rounded-lg border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-200">
        <strong>Not legal advice — not attorney-reviewed.</strong> This draft was written to reflect
        general California and U.S. legal principles (assumption-of-risk drafting, CA&apos;s
        cost-shared-carpool exemption, minors&apos; non-waivable claims), but it has not been
        reviewed by a licensed attorney. Two things deliberately left out for that reason: (1) a
        binding-arbitration / class-action-waiver clause — omitted because a 2022 federal law (the
        Ending Forced Arbitration Act) voids forced arbitration for sexual-assault and
        harassment-related claims, and an attorney should decide how to scope one around that
        carve-out rather than have one drafted blind; (2) any claim that a minor&apos;s own right to
        sue has been waived — California generally doesn&apos;t let a parent waive that on a
        child&apos;s behalf, so Section 7 says so plainly instead of pretending otherwise. Have an
        actual attorney review this — especially Sections 6–8 — before Locality handles real
        families&apos; data or coordinates real rides.
      </div>

      <div className="flex flex-col gap-6 text-sm text-slate-700 dark:text-slate-300">
        <section className="flex flex-col gap-2">
          <h2 className="font-semibold text-slate-900 dark:text-slate-50">1. Acceptance of terms</h2>
          <p>
            By creating an account or using Locality, you agree to these Terms of Service and our{" "}
            <Link href="/locality/privacy" className="font-medium text-sky-600 underline dark:text-sky-400">
              Privacy Policy
            </Link>
            . If you don&apos;t agree, don&apos;t use Locality.
          </p>
        </section>

        <section className="flex flex-col gap-2">
          <h2 className="font-semibold text-slate-900 dark:text-slate-50">2. Eligibility</h2>
          <p>
            Locality is for adults (18+) who are a parent or legal guardian of a school-age child in
            Mountain House, CA. Children do not create their own accounts, do not agree to these
            Terms, and should not use Locality directly — a parent or guardian account holder acts
            on their behalf for any ride coordination involving them.
          </p>
        </section>

        <section className="flex flex-col gap-2">
          <h2 className="font-semibold text-slate-900 dark:text-slate-50">3. What Locality is</h2>
          <p>
            Locality is a community platform that helps parents in Mountain House, CA coordinate
            school carpools with other families. Locality does not provide transportation, employ
            drivers, own or operate vehicles, or act as a rideshare or transportation company.
            Every ride is arranged directly between parents; Locality only provides the app they
            use to find and confirm each other.
          </p>
          <p>
            Locality does not process payments between users and is not a party to any cost-sharing
            arrangement between parents (for example, splitting gas money). Any such arrangement is
            private between the parents involved. Locality is not a Transportation Network Company
            and is not intended for arrangements where a driver is compensated beyond a pro-rata
            share of trip costs — using Locality to run a paid transportation service is not
            permitted under Section 10.
          </p>
        </section>

        <section className="flex flex-col gap-2">
          <h2 className="font-semibold text-slate-900 dark:text-slate-50">
            4. Account information is self-reported, not independently verified
          </h2>
          <p>
            When you create an account, you self-report your phone number, email, home address,
            school connection, driver&apos;s license/insurance/vehicle registration status, and
            parent or guardian status. <strong>Locality does not currently independently verify
            any of this information</strong> — there is no government ID check, no license or
            insurance check, no background check, and no document review at this time. Badges
            such as &quot;Identity Verified,&quot; &quot;Parent Verified,&quot; and &quot;Driver
            Verified&quot; reflect only that you confirmed this information yourself, not that
            Locality independently confirmed it.
          </p>
          <p>
            You are solely responsible for the truthfulness and accuracy of everything you submit.
            Providing false or misleading information is a violation of these Terms. Locality is
            not responsible or liable for any harm, loss, or damage arising from another user&apos;s
            reliance on information you (or any other user) self-reported.
          </p>
        </section>

        <section className="flex flex-col gap-2">
          <h2 className="font-semibold text-slate-900 dark:text-slate-50">
            5. Reliability and community conduct
          </h2>
          <p>
            By offering or requesting a ride, you agree to honor the pickup and drop-off
            commitments you make. Reliability scores and the &quot;Community Trusted&quot; badge
            are based on your history of completed rides within the app and are intended to help
            families make informed decisions — they are not a guarantee of safety, punctuality, or
            good conduct by any user.
          </p>
        </section>

        <section className="flex flex-col gap-2">
          <h2 className="font-semibold text-slate-900 dark:text-slate-50">
            6. Assumption of risk
          </h2>
          <p>
            Because account information is self-reported and not independently verified, parents
            are solely responsible for deciding whom to trust with their own children, and are
            strongly encouraged to independently confirm another family&apos;s identity,
            license/insurance, and trustworthiness (for example, through in-person contact, their
            school community, or other families) before relying on Locality to arrange a ride.
            Riding in a vehicle involves inherent risks, including the risk of traffic accidents.
            To the extent permitted by law, you participate in rides arranged through Locality
            entirely at your own risk and at your own discretion.
          </p>
        </section>

        <section className="flex flex-col gap-2">
          <h2 className="font-semibold text-slate-900 dark:text-slate-50">
            7. Children&apos;s safety and parental responsibility
          </h2>
          <p>
            Parents and guardians remain solely responsible for deciding whether and how their
            child participates in any ride arranged through Locality, and for supervising that
            decision the same way they would any other carpool arrangement made outside the app.
          </p>
          <p>
            <strong>Important limitation:</strong> in California and many other states, a parent
            generally cannot waive a minor child&apos;s own right to bring a claim for their own
            injuries, even by agreeing to these Terms. Nothing in this agreement is intended to,
            or does, waive any right that cannot be waived under applicable law on a child&apos;s
            behalf — Sections 6, 8, and 9 apply only to the fullest extent the law actually allows
            a parent to agree to them.
          </p>
        </section>

        <section className="flex flex-col gap-2">
          <h2 className="font-semibold text-slate-900 dark:text-slate-50">
            8. Limitation of liability
          </h2>
          <p>
            To the fullest extent permitted by law, Locality and its operators are not liable for
            any accident, injury, death, property damage, loss, dispute, or other incident arising
            from or related to a ride, communication, or interaction arranged through the app,
            including incidents caused by another user&apos;s misrepresentation, negligence, or
            misconduct. Locality is provided &quot;as is,&quot; without warranties of any kind. To
            the extent a limitation on damages is enforceable, Locality&apos;s total liability for
            any claim arising from these Terms or your use of the app will not exceed $100.
          </p>
        </section>

        <section className="flex flex-col gap-2">
          <h2 className="font-semibold text-slate-900 dark:text-slate-50">9. Indemnification</h2>
          <p>
            To the extent permitted by law, you agree to indemnify and hold harmless Locality and
            its operators from any claim, loss, or damage — including reasonable attorneys&apos;
            fees — arising from your use of Locality, your own misrepresentation of information, or
            your conduct during a ride.
          </p>
        </section>

        <section className="flex flex-col gap-2">
          <h2 className="font-semibold text-slate-900 dark:text-slate-50">10. Acceptable use</h2>
          <p>
            Don&apos;t use Locality to harass, defraud, or endanger others (including any child);
            to misrepresent your identity, credentials, or relationship to a child; to run a
            for-profit transportation service; to discriminate against another family; or to
            attempt to disrupt, scrape, or abuse the service.
          </p>
        </section>

        <section className="flex flex-col gap-2">
          <h2 className="font-semibold text-slate-900 dark:text-slate-50">
            11. Suspension and termination
          </h2>
          <p>
            We may suspend or terminate your account if we believe, in good faith, that you&apos;ve
            violated these Terms, misrepresented information relevant to a child&apos;s safety, or
            otherwise created risk for the community. You may stop using Locality and request
            account deletion at any time — see our{" "}
            <Link href="/locality/privacy" className="font-medium text-sky-600 underline dark:text-sky-400">
              Privacy Policy
            </Link>
            .
          </p>
        </section>

        <section className="flex flex-col gap-2">
          <h2 className="font-semibold text-slate-900 dark:text-slate-50">
            12. Governing law and venue
          </h2>
          <p>
            These Terms are governed by California law, without regard to conflict-of-laws rules.
            Any dispute not resolved informally will be brought in state or federal court located
            in San Joaquin County, California, and you consent to that venue. (No binding-arbitration
            or class-action-waiver clause is included in this draft — see the notice at the top of
            this page for why.)
          </p>
        </section>

        <section className="flex flex-col gap-2">
          <h2 className="font-semibold text-slate-900 dark:text-slate-50">13. Third-party services</h2>
          <p>
            Locality uses Google (for sign-in) and Supabase (for hosting and storing your data).
            Your use of Locality is also subject to those providers&apos; own terms.
          </p>
        </section>

        <section className="flex flex-col gap-2">
          <h2 className="font-semibold text-slate-900 dark:text-slate-50">14. Changes to these terms</h2>
          <p>
            We may update these terms from time to time. If we make a material change, we&apos;ll
            update the &quot;draft last revised&quot; date above and ask you to re-accept before you
            can continue using the app — continued use after a non-material change means you accept
            the update.
          </p>
        </section>

        <section className="flex flex-col gap-2">
          <h2 className="font-semibold text-slate-900 dark:text-slate-50">15. Miscellaneous</h2>
          <p>
            If any part of these Terms is found unenforceable, the rest remains in effect. Our
            failure to enforce any part of these Terms isn&apos;t a waiver of it. These Terms,
            together with our Privacy Policy, are the entire agreement between you and Locality
            regarding your use of the app.
          </p>
        </section>

        <section className="flex flex-col gap-2">
          <h2 className="font-semibold text-slate-900 dark:text-slate-50">16. Contact</h2>
          <p>Questions about these terms — placeholder contact email goes here.</p>
        </section>
      </div>
    </main>
  );
}
