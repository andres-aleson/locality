import Link from "next/link";

export function WelcomeCtas({ accountApproved }: { accountApproved: boolean }) {
  return (
    <div className="mt-10 flex flex-col items-center gap-3">
      <div className="flex w-full max-w-xs flex-col gap-3 sm:max-w-none sm:flex-row sm:justify-center">
        <Link
          href="/locality/verification"
          className="rounded-full bg-sky-600 px-8 py-3 text-sm font-semibold text-white shadow-sm shadow-sky-600/20 transition hover:bg-sky-700 dark:bg-sky-500 dark:shadow-sky-500/20 dark:hover:bg-sky-400"
        >
          Create account
        </Link>
        <Link
          href={accountApproved ? "/locality/app/circle" : "/locality/verification"}
          className="rounded-full border border-emerald-600/30 bg-emerald-50 px-8 py-3 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-100 dark:border-emerald-400/30 dark:bg-emerald-500/10 dark:text-emerald-300 dark:hover:bg-emerald-500/20"
        >
          Join community
        </Link>
      </div>
      {!accountApproved && (
        <p className="max-w-xs text-center text-xs text-slate-400 dark:text-slate-500">
          New here? Joining a community starts with creating your verified account.
        </p>
      )}
    </div>
  );
}
