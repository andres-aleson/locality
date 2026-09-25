import { redirect } from "next/navigation";
import Link from "next/link";
import { getAccountStatus, confirmRide, confirmPickup, confirmDropoff } from "@/lib/locality/actions";
import { getEmergencyContacts, getRide, getUsersByIds } from "@/lib/locality/db";
import { AppHeader } from "@/components/locality/AppHeader";
import { Avatar } from "@/components/locality/Avatar";
import { BadgeRow, ReliabilityScore } from "@/components/locality/Badge";
import { EmergencyButton } from "@/components/locality/EmergencyButton";

export const dynamic = "force-dynamic";

export default async function RideDetailPage({ params }: { params: Promise<{ rideId: string }> }) {
  const { rideId } = await params;
  const { profile: currentUser } = await getAccountStatus();
  if (!currentUser) redirect("/locality/login");

  const ride = await getRide(rideId);

  if (!ride) {
    return (
      <main className="flex flex-1 flex-col">
        <AppHeader title="Ride" backHref="/locality/app" />
        <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 text-center">
          <p className="text-sm text-slate-500 dark:text-slate-400">This ride doesn&apos;t exist.</p>
          <Link href="/locality/app" className="text-sm font-medium text-sky-600 dark:text-sky-400">
            ← Back to dashboard
          </Link>
        </div>
      </main>
    );
  }

  const role: "driving" | "riding" = ride.driverId === currentUser.id ? "driving" : "riding";
  const otherId = role === "driving" ? ride.parentId : ride.driverId;
  const [users, emergencyContacts] = await Promise.all([
    getUsersByIds([otherId]),
    getEmergencyContacts(currentUser.id),
  ]);
  const otherUser = users[otherId];

  return (
    <main className="flex flex-1 flex-col">
      <AppHeader title="Ride details" backHref="/locality/app" />
      <div className="flex flex-1 flex-col gap-6 px-5 py-6">
        <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 p-5 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <Avatar name={otherUser.name} color={otherUser.avatarColor} size={52} />
            <div className="flex-1">
              <p className="text-base font-semibold text-slate-900 dark:text-slate-50">
                {otherUser.name}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {role === "driving" ? "Requesting a seat from you" : "Driving this ride"}
              </p>
            </div>
            <ReliabilityScore score={otherUser.reliabilityScore} />
          </div>
          <BadgeRow badges={otherUser.badges} />
        </div>

        <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 p-5 dark:border-slate-800">
          <Row label="Child" value={ride.childName} />
          <Row label="Date" value={ride.date || "Flexible"} />
          <Row label="Time" value={ride.time} />
          <Row label="Pickup" value={ride.pickup} />
          <Row label="Drop-off" value={ride.dropoff} />
          <Row label="Status" value={statusLabel(ride.status)} />
        </div>

        {ride.status === "pending" && (
          <form action={confirmRide.bind(null, ride.id)}>
            <button
              type="submit"
              className="rounded-full bg-sky-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-sky-700 dark:bg-sky-500 dark:hover:bg-sky-400"
            >
              Confirm ride
            </button>
          </form>
        )}

        {ride.status === "confirmed" && (
          <div className="flex flex-col gap-3 rounded-2xl border border-sky-600/20 bg-sky-50 p-4 dark:border-sky-400/20 dark:bg-sky-500/10">
            <p className="text-sm font-semibold text-sky-800 dark:text-sky-200">Pickup &amp; drop-off</p>
            <ConfirmRow
              label="Child picked up safely"
              done={ride.pickupConfirmed}
              action={confirmPickup.bind(null, ride.id)}
            />
            <ConfirmRow
              label="Drop-off confirmed"
              done={ride.dropoffConfirmed}
              disabled={!ride.pickupConfirmed}
              action={confirmDropoff.bind(null, ride.id)}
            />
          </div>
        )}

        {ride.status === "completed" && (
          <div className="rounded-2xl border border-emerald-600/20 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800 dark:border-emerald-400/20 dark:bg-emerald-500/10 dark:text-emerald-200">
            ✓ Ride completed — reliability scores updated for both families.
          </div>
        )}

        <div className="flex flex-col gap-2">
          <Link
            href={`/locality/app/ride/${ride.id}/messages`}
            className="rounded-full border border-slate-300 px-6 py-3 text-center text-sm font-semibold text-slate-700 transition hover:border-sky-300 hover:text-sky-700 dark:border-slate-700 dark:text-slate-200 dark:hover:border-sky-700 dark:hover:text-sky-300"
          >
            Message {otherUser.name.split(" ")[0]}
          </Link>
          <Link
            href={`/locality/app/safety?ride=${ride.id}`}
            className="rounded-full border border-rose-300 px-6 py-3 text-center text-sm font-semibold text-rose-600 transition hover:bg-rose-50 dark:border-rose-800 dark:text-rose-400 dark:hover:bg-rose-500/10"
          >
            Report an issue
          </Link>
          <EmergencyButton contacts={emergencyContacts} />
        </div>
      </div>
    </main>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-slate-500 dark:text-slate-400">{label}</span>
      <span className="font-medium text-slate-900 dark:text-slate-50">{value}</span>
    </div>
  );
}

function ConfirmRow({
  label,
  done,
  disabled,
  action,
}: {
  label: string;
  done: boolean;
  disabled?: boolean;
  action: () => Promise<void>;
}) {
  if (done) {
    return (
      <div className="flex items-center gap-2 text-sm font-medium text-emerald-700 dark:text-emerald-300">
        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-600 text-white dark:bg-emerald-500">
          <svg width="11" height="11" viewBox="0 0 20 20" fill="none" aria-hidden>
            <path d="M4 10.5 8 14.5 16 6" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
        {label}
      </div>
    );
  }
  return (
    <form action={action}>
      <button
        type="submit"
        disabled={disabled}
        className="self-start rounded-full border border-sky-600/40 bg-white px-4 py-1.5 text-xs font-semibold text-sky-700 transition hover:bg-sky-100 disabled:opacity-40 dark:border-sky-400/30 dark:bg-slate-900 dark:text-sky-300 dark:hover:bg-sky-500/10"
      >
        Mark: {label}
      </button>
    </form>
  );
}

function statusLabel(status: string): string {
  switch (status) {
    case "pending":
      return "Needs confirmation";
    case "confirmed":
      return "Confirmed";
    case "completed":
      return "Completed";
    default:
      return status;
  }
}
