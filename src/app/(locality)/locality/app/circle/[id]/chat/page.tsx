import { redirect } from "next/navigation";
import Link from "next/link";
import { getAccountStatus } from "@/lib/locality/actions";
import { getCircles, getCircleMessages, getUsersByIds } from "@/lib/locality/db";
import { CircleChatThread } from "./CircleChatThread";

export const dynamic = "force-dynamic";

export default async function CircleChatPage({ params }: { params: Promise<{ id: string }> }) {
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

  if (!circle.memberIds.includes(currentUser.id)) {
    return (
      <main className="flex flex-1 flex-col items-center justify-center gap-3 px-6 text-center">
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Join {circle.name} to see and post in its community chat.
        </p>
        <Link
          href={`/locality/app/circle/${circle.id}`}
          className="text-sm font-medium text-sky-600 dark:text-sky-400"
        >
          ← Back to {circle.name}
        </Link>
      </main>
    );
  }

  const [members, messages] = await Promise.all([
    getUsersByIds(circle.memberIds),
    getCircleMessages(circle.id),
  ]);

  return (
    <main className="flex flex-1 flex-col">
      <header className="sticky top-0 z-10 flex items-center gap-3 border-b border-slate-200 bg-white/90 px-4 py-3 backdrop-blur dark:border-slate-800 dark:bg-slate-950/90">
        <Link
          href={`/locality/app/circle/${circle.id}`}
          aria-label="Back"
          className="flex h-8 w-8 flex-none items-center justify-center rounded-full text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
        >
          ←
        </Link>
        <div className="flex-1">
          <p className="text-sm font-semibold text-slate-900 dark:text-slate-50">{circle.name}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {circle.memberIds.length} {circle.memberIds.length === 1 ? "family" : "families"}
          </p>
        </div>
      </header>

      <CircleChatThread
        circleId={circle.id}
        currentUserId={currentUser.id}
        members={members}
        initialMessages={messages}
      />
    </main>
  );
}
