import Link from "next/link";
import { LocalityLogo } from "@/components/locality/Logo";
import { WelcomeCtas } from "@/components/locality/WelcomeCtas";
import { EncryptionNotice } from "@/components/locality/EncryptionNotice";
import { getAccountStatus } from "@/lib/locality/actions";

// Depends on the caller's session — must never be prerendered/cached as static content.
export const dynamic = "force-dynamic";

const stats = [
  {
    value: "0",
    label: "Public bus or train routes in Mountain House",
  },
  {
    value: "1",
    label: "Circle per school — built around your kid's classmates, not strangers nearby",
  },
];

const steps = [
  {
    number: "01",
    title: "Get verified",
    body: "Confirm your phone, email, Mountain House address, and school connection to earn your Identity Verified badge.",
  },
  {
    number: "02",
    title: "Join your Circle",
    body: "Connect with the already-verified families in your child's school Carpool Circle.",
  },
  {
    number: "03",
    title: "Offer or request a ride",
    body: "Post open seats on your regular run, or ask your Circle for a lift when your plan falls through.",
  },
  {
    number: "04",
    title: "Confirm and go",
    body: "Check the driver's badges and reliability score, confirm the ride, and message right in the app.",
  },
];

const badges = [
  {
    title: "Identity Verified",
    body: "Phone and email confirmed at sign-up.",
  },
  {
    title: "Parent Verified",
    body: "Self-reported guardian status, school connection, and home address.",
  },
  {
    title: "Driver Verified",
    body: "Self-reported by the driver — Locality does not independently verify license or insurance.",
  },
  {
    title: "Community Trusted",
    body: "Earned over time through completed carpools and reliable communication.",
  },
];

export default async function LocalityWelcomePage() {
  const { accountApproved } = await getAccountStatus();

  return (
    <main className="flex flex-1 flex-col">
      <section className="relative flex flex-col items-center overflow-hidden px-6 py-20 text-center">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-b from-sky-50 via-white to-emerald-50 dark:from-sky-950/40 dark:via-slate-950 dark:to-emerald-950/30"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -left-24 -top-24 -z-10 h-72 w-72 rounded-full bg-sky-200/40 blur-3xl dark:bg-sky-500/10"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-24 -right-24 -z-10 h-72 w-72 rounded-full bg-emerald-200/40 blur-3xl dark:bg-emerald-500/10"
        />

        <LocalityLogo className="mb-8" />

        <h1 className="max-w-md text-4xl font-semibold tracking-tight text-slate-900 dark:text-slate-50 sm:text-5xl">
          Your city, connected
        </h1>

        <p className="mt-4 max-w-sm text-balance text-base text-slate-600 dark:text-slate-300">
          Locality helps verified Mountain House parents safely coordinate school carpools with
          trusted local families — no strangers, just neighbors.
        </p>

        <WelcomeCtas accountApproved={accountApproved} />

        <p className="mt-6 text-xs text-slate-400 dark:text-slate-500">
          Verified parents only · Mountain House, CA
        </p>
      </section>

      <section className="border-t border-slate-200 bg-white px-6 py-20 dark:border-slate-800 dark:bg-slate-950">
        <div className="mx-auto grid w-full max-w-4xl gap-12 sm:grid-cols-[1.1fr_0.9fr] sm:items-center">
          <div className="flex flex-col gap-4 text-left">
            <span className="text-sm font-medium uppercase tracking-wide text-sky-600 dark:text-sky-400">
              The problem
            </span>
            <h2 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-50 sm:text-3xl">
              No public transit means every school run falls on parents
            </h2>
            <p className="text-slate-600 dark:text-slate-300">
              Right now, most families coordinate carpools through informal WhatsApp and Facebook
              groups. There&apos;s no way to verify who&apos;s actually a trustworthy local parent,
              match compatible routes, or hold anyone accountable for showing up. Locality replaces
              that guesswork with small, verified circles of families you already trust.
            </p>
          </div>
          <div className="flex flex-col gap-4">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="rounded-2xl border border-slate-200 bg-slate-50 px-6 py-5 text-left dark:border-slate-800 dark:bg-slate-900"
              >
                <div className="text-3xl font-semibold tracking-tight text-slate-900 dark:text-slate-50">
                  {stat.value}
                </div>
                <div className="mt-1 text-sm text-slate-500 dark:text-slate-400">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-slate-200 bg-sky-50/50 px-6 py-20 dark:border-slate-800 dark:bg-sky-950/20">
        <div className="mx-auto flex w-full max-w-4xl flex-col gap-12">
          <div className="mx-auto flex max-w-xl flex-col items-center gap-3 text-center">
            <span className="text-sm font-medium uppercase tracking-wide text-sky-600 dark:text-sky-400">
              How it works
            </span>
            <h2 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-50 sm:text-3xl">
              From verified stranger to trusted carpool, in four steps
            </h2>
          </div>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((step) => (
              <div key={step.number} className="flex flex-col gap-2 text-left">
                <span className="text-sm font-semibold text-sky-500 dark:text-sky-400">
                  {step.number}
                </span>
                <h3 className="text-base font-semibold text-slate-900 dark:text-slate-50">
                  {step.title}
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-300">{step.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-slate-200 bg-white px-6 py-20 dark:border-slate-800 dark:bg-slate-950">
        <div className="mx-auto flex w-full max-w-4xl flex-col gap-12">
          <div className="mx-auto flex max-w-xl flex-col items-center gap-3 text-center">
            <span className="text-sm font-medium uppercase tracking-wide text-emerald-600 dark:text-emerald-400">
              Verified, not just vibes
            </span>
            <h2 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-50 sm:text-3xl">
              Every family you meet on Locality is who they say they are
            </h2>
          </div>
          <div className="grid gap-6 sm:grid-cols-2">
            {badges.map((badge) => (
              <div
                key={badge.title}
                className="flex items-start gap-3 rounded-2xl border border-emerald-600/15 bg-emerald-50/60 px-5 py-4 text-left dark:border-emerald-400/20 dark:bg-emerald-500/10"
              >
                <span
                  aria-hidden
                  className="mt-0.5 flex h-6 w-6 flex-none items-center justify-center rounded-full bg-emerald-600 text-xs font-bold text-white dark:bg-emerald-500"
                >
                  ✓
                </span>
                <div>
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-50">
                    {badge.title}
                  </h3>
                  <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{badge.body}</p>
                </div>
              </div>
            ))}
          </div>
          <p className="mx-auto max-w-2xl text-center text-sm text-slate-500 dark:text-slate-400">
            Every ride also gets a two-sided pickup confirmation, a reliability score out of 5, and
            a one-tap emergency contact button — because trust shouldn&apos;t stop at sign-up.
          </p>
        </div>
      </section>

      <section className="border-t border-slate-200 px-6 py-16 dark:border-slate-800">
        <div className="mx-auto flex w-full max-w-4xl flex-col items-center gap-2 text-center">
          <LocalityLogo />
          <p className="mt-2 max-w-sm text-sm text-slate-500 dark:text-slate-400">
            Locality is not a rideshare app. It only connects pre-approved, trusted families in
            your school community — never strangers.
          </p>
          <EncryptionNotice className="max-w-sm justify-center text-center" />
          <div className="mt-1 flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
            <Link href="/locality/terms" className="underline-offset-2 hover:underline">
              Terms of Service
            </Link>
            <Link href="/locality/privacy" className="underline-offset-2 hover:underline">
              Privacy Policy
            </Link>
          </div>
          <p className="text-xs text-slate-400 dark:text-slate-500">
            © {new Date().getFullYear()} Locality · Mountain House, CA
          </p>
        </div>
      </section>
    </main>
  );
}
