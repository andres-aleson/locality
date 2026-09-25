import { redirect } from "next/navigation";
import Link from "next/link";
import { getAccountStatus } from "@/lib/locality/actions";
import { joinCircle } from "@/lib/locality/actions";
import { getCircles } from "@/lib/locality/db";
import { DISTRICT_NAME } from "@/lib/locality/seed";

export const dynamic = "force-dynamic";

export default async function CircleIndexPage() {
  const { profile: currentUser } = await getAccountStatus();
  if (!currentUser) redirect("/locality/login");

  const circles = await getCircles();
  const myCircles = circles.filter((c) => c.memberIds.includes(currentUser.id));
  const myCircleIds = new Set(myCircles.map((c) => c.id));
  const discoverable = circles.filter((c) => !myCircleIds.has(c.id));

  return (
    <main className="flex flex-1 flex-col gap-7 px-5 pb-6 pt-8">
      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-sky-600 dark:text-sky-400">
          Communities
        </p>
        <h1 className="mt-1 text-xl font-semibold tracking-tight text-slate-900 dark:text-slate-50">
          {DISTRICT_NAME}
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Join a Circle for every school your kids attend — you can be part of more than one.
        </p>
      </div>

      <section className="flex flex-col gap-2">
        <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-50">Your communities</h2>
        {myCircles.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-slate-300 px-4 py-6 text-center text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
            You haven&apos;t joined a community yet — pick one below to get started.
          </p>
        ) : (
          <div className="flex flex-col gap-2">
            {myCircles.map((circle) => (
              <Link
                key={circle.id}
                href={`/locality/app/circle/${circle.id}`}
                className="flex items-center justify-between rounded-2xl border border-slate-200 px-4 py-3 transition hover:border-sky-300 dark:border-slate-800 dark:hover:border-sky-700"
              >
                <div>
                  <p className="text-sm font-semibold text-slate-900 dark:text-slate-50">{circle.name}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {circle.memberIds.length} families
                  </p>
                </div>
                <span className="text-slate-300 dark:text-slate-600">→</span>
              </Link>
            ))}
          </div>
        )}
      </section>

      {discoverable.length > 0 && (
        <section className="flex flex-col gap-2">
          <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-50">
            Discover more communities
          </h2>
          <div className="flex flex-col gap-2">
            {discoverable.map((circle) => (
              <div
                key={circle.id}
                className="flex items-center justify-between rounded-2xl border border-slate-200 px-4 py-3 dark:border-slate-800"
              >
                <div>
                  <p className="text-sm font-semibold text-slate-900 dark:text-slate-50">{circle.name}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {circle.memberIds.length} families
                  </p>
                </div>
                <form action={joinCircle.bind(null, circle.id)}>
                  <button
                    type="submit"
                    className="flex-none rounded-full border border-sky-600/30 bg-sky-50 px-4 py-1.5 text-xs font-semibold text-sky-700 transition hover:bg-sky-100 dark:border-sky-400/30 dark:bg-sky-500/10 dark:text-sky-300 dark:hover:bg-sky-500/20"
                  >
                    Join
                  </button>
                </form>
              </div>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
