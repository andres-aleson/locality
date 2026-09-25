import { redirect } from "next/navigation";
import Link from "next/link";
import { getAccountStatus, joinCircle, leaveCircle } from "@/lib/locality/actions";
import { getCircles, getInvitesForCircle, getUsersByIds } from "@/lib/locality/db";
import { Avatar } from "@/components/locality/Avatar";
import { BadgeRow, ReliabilityScore } from "@/components/locality/Badge";
import { InviteForm } from "./InviteForm";

export const dynamic = "force-dynamic";

export default async function CircleDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { profile: currentUser } = await getAccountStatus();
  if (!currentUser) redirect("/locality/login");

  const circles = await getCircles();
  const circle = circles.find((c) => c.id === id);

  if (!circle) {
    return (
      <main className="flex flex-1 flex-col items-center justify-center gap-3 px-6 text-center">
        <p className="text-sm text-slate-500 dark:text-slate-400">That community doesn&apos;t exist.</p>
        <Link href="/locality/app/circle" className="text-sm font-medium text-sky-600 dark:text-sky-400">
          ← Back to communities
        </Link>
      </main>
    );
  }

  const isMember = circle.memberIds.includes(currentUser.id);
  const [users, invites] = await Promise.all([
    getUsersByIds(circle.memberIds),
    getInvitesForCircle(circle.id),
  ]);
  const members = circle.memberIds.map((id) => users[id]).filter(Boolean);

  return (
    <main className="flex flex-1 flex-col gap-6 px-5 pb-6 pt-8">
      <Link
        href="/locality/app/circle"
        className="self-start text-xs font-medium text-sky-600 dark:text-sky-400"
      >
        ← All communities
      </Link>

      <div>
        <h1 className="text-xl font-semibold tracking-tight text-slate-900 dark:text-slate-50">
          {circle.name}
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          {members.length} verified {members.length === 1 ? "family" : "families"}
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {isMember ? (
          <>
            <Link
              href={`/locality/app/circle/${circle.id}/chat`}
              className="rounded-full bg-sky-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-sky-700 dark:bg-sky-500 dark:hover:bg-sky-400"
            >
              💬 Community chat
            </Link>
            <InviteForm circleId={circle.id} />
            <form action={leaveCircle.bind(null, circle.id)}>
              <button
                type="submit"
                className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:border-rose-300 hover:text-rose-600 dark:border-slate-700 dark:text-slate-300 dark:hover:border-rose-800 dark:hover:text-rose-400"
              >
                Leave community
              </button>
            </form>
          </>
        ) : (
          <form action={joinCircle.bind(null, circle.id)}>
            <button
              type="submit"
              className="rounded-full bg-sky-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-sky-700 dark:bg-sky-500 dark:hover:bg-sky-400"
            >
              Join this community
            </button>
          </form>
        )}
      </div>

      {invites.length > 0 && (
        <div className="flex flex-col gap-1.5">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">
            Pending invites
          </h2>
          {invites.map((invite) => (
            <div
              key={invite.email}
              className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2 text-sm text-slate-600 dark:bg-slate-900 dark:text-slate-300"
            >
              <span>{invite.email}</span>
              <span className="text-xs text-amber-600 dark:text-amber-400">Pending</span>
            </div>
          ))}
        </div>
      )}

      <div className="flex flex-col gap-3">
        {members.map((member) => (
          <div
            key={member.id}
            className="flex flex-col gap-3 rounded-2xl border border-slate-200 p-4 dark:border-slate-800"
          >
            <div className="flex items-center gap-3">
              <Avatar name={member.name} color={member.avatarColor} size={48} />
              <div className="flex-1">
                <p className="text-sm font-semibold text-slate-900 dark:text-slate-50">
                  {member.id === currentUser.id ? `${member.name} (you)` : member.name}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {member.children
                    .filter((c) => c.schoolId === circle.schoolId)
                    .map((c) => `${c.name} · ${c.grade}`)
                    .join(", ") || "No children listed at this school"}
                </p>
              </div>
              <ReliabilityScore score={member.reliabilityScore} />
            </div>
            <BadgeRow badges={member.badges} />
          </div>
        ))}
      </div>
    </main>
  );
}
