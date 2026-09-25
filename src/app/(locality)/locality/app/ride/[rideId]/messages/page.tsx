import { redirect } from "next/navigation";
import Link from "next/link";
import { getAccountStatus } from "@/lib/locality/actions";
import { getRide, getMessagesForRide, getUsersByIds } from "@/lib/locality/db";
import { Avatar } from "@/components/locality/Avatar";
import { BadgeChip } from "@/components/locality/Badge";
import { MessagesThread } from "./MessagesThread";

export const dynamic = "force-dynamic";

export default async function RideMessagesPage({ params }: { params: Promise<{ rideId: string }> }) {
  const { rideId } = await params;
  const { profile: currentUser } = await getAccountStatus();
  if (!currentUser) redirect("/locality/login");

  const ride = await getRide(rideId);
  if (!ride) {
    return (
      <main className="flex flex-1 flex-col items-center justify-center gap-3 px-6 text-center">
        <p className="text-sm text-slate-500 dark:text-slate-400">This ride thread doesn&apos;t exist.</p>
        <Link href="/locality/app" className="text-sm font-medium text-sky-600 dark:text-sky-400">
          ← Back to dashboard
        </Link>
      </main>
    );
  }

  const otherId = ride.driverId === currentUser.id ? ride.parentId : ride.driverId;
  const [users, messages] = await Promise.all([getUsersByIds([otherId]), getMessagesForRide(rideId)]);
  const other = users[otherId];

  return (
    <main className="flex flex-1 flex-col">
      <header className="sticky top-0 z-10 flex items-center gap-3 border-b border-slate-200 bg-white/90 px-4 py-3 backdrop-blur dark:border-slate-800 dark:bg-slate-950/90">
        <Link
          href={`/locality/app/ride/${ride.id}`}
          aria-label="Back"
          className="flex h-8 w-8 flex-none items-center justify-center rounded-full text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
        >
          ←
        </Link>
        <Avatar name={other.name} color={other.avatarColor} size={36} />
        <div className="flex-1">
          <p className="text-sm font-semibold text-slate-900 dark:text-slate-50">{other.name}</p>
          {other.badges.includes("identityVerified") && <BadgeChip type="identityVerified" />}
        </div>
      </header>

      <MessagesThread
        rideId={rideId}
        currentUserId={currentUser.id}
        otherFirstName={other.name.split(" ")[0]}
        initialMessages={messages}
      />
    </main>
  );
}
