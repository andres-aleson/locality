import { redirect } from "next/navigation";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { getAccountStatus } from "@/lib/locality/actions";
import { getCircles, getLatestMessagePerCircle } from "@/lib/locality/db";
import { Avatar } from "@/components/locality/Avatar";

export const dynamic = "force-dynamic";

export default async function ChatHubPage() {
  const { profile: currentUser } = await getAccountStatus();
  if (!currentUser) redirect("/locality/login");

  const circles = await getCircles();
  const myCircles = circles.filter((c) => c.memberIds.includes(currentUser.id));
  const latestByCircle = await getLatestMessagePerCircle(myCircles.map((c) => c.id));

  const sorted = [...myCircles].sort((a, b) => {
    const aTime = latestByCircle[a.id]?.timestamp;
    const bTime = latestByCircle[b.id]?.timestamp;
    if (aTime && bTime) return new Date(bTime).getTime() - new Date(aTime).getTime();
    if (aTime) return -1;
    if (bTime) return 1;
    return a.name.localeCompare(b.name);
  });

  return (
    <main className="flex flex-1 flex-col gap-6 px-5 pb-6 pt-8">
      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-sky-600 dark:text-sky-400">Chat</p>
        <h1 className="mt-1 text-xl font-semibold tracking-tight text-slate-900 dark:text-slate-50">
          Your Circles
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          The fastest way to reach families you carpool with — just say hello.
        </p>
      </div>

      {sorted.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-slate-300 px-4 py-10 text-center dark:border-slate-700">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Join a community to start chatting with other families.
          </p>
          <Link
            href="/locality/app/circle"
            className="rounded-full bg-sky-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-sky-700 dark:bg-sky-500 dark:hover:bg-sky-400"
          >
            Browse communities →
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {sorted.map((circle) => {
            const latest = latestByCircle[circle.id];
            return (
              <Link
                key={circle.id}
                href={`/locality/app/circle/${circle.id}/chat`}
                className="flex items-center gap-3 rounded-2xl border border-slate-200 px-4 py-3 transition hover:border-sky-300 dark:border-slate-800 dark:hover:border-sky-700"
              >
                <Avatar name={circle.name} color="#0284c7" size={44} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-slate-900 dark:text-slate-50">
                    {circle.name}
                  </p>
                  <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                    {latest ? latest.text : "No messages yet — say hello"}
                  </p>
                </div>
                {latest && (
                  <span className="flex-none text-xs text-slate-400 dark:text-slate-500">
                    {formatDistanceToNow(new Date(latest.timestamp), { addSuffix: true })}
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      )}
    </main>
  );
}
