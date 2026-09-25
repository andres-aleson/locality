import { redirect } from "next/navigation";
import { getAccountStatus } from "@/lib/locality/actions";
import { getEmergencyContacts, getRidesForProfile, getUsersByIds } from "@/lib/locality/db";
import { RideCard } from "@/components/locality/RideCard";
import { EmergencyButton } from "@/components/locality/EmergencyButton";
import { ReportForm } from "./ReportForm";

const GUIDELINES = [
  "Verify before you ride. Only confirm rides with families who carry the badges you're comfortable with — Identity, Parent, and Driver Verified.",
  "Confirm every pickup and drop-off. Both sides tap to confirm so there's always a record of who had your child, and when.",
  "Communicate in-app. Ride-scoped messaging keeps a record and means you never have to share your personal number.",
  "Report anything that feels off. No-shows, late pickups, or unsafe driving — flagging it keeps the whole Circle accountable.",
];

export const dynamic = "force-dynamic";

export default async function SafetyCenterPage({
  searchParams,
}: {
  searchParams: Promise<{ ride?: string }>;
}) {
  const { ride: initialRideId } = await searchParams;
  const { profile: currentUser } = await getAccountStatus();
  if (!currentUser) redirect("/locality/login");

  const myRides = await getRidesForProfile(currentUser.id);
  const otherIds = myRides.map((r) => (r.driverId === currentUser.id ? r.parentId : r.driverId));
  const [users, emergencyContacts] = await Promise.all([
    getUsersByIds(otherIds),
    getEmergencyContacts(currentUser.id),
  ]);

  return (
    <main className="flex flex-1 flex-col gap-7 px-5 pb-6 pt-8">
      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-rose-600 dark:text-rose-400">
          Safety Center
        </p>
        <h1 className="mt-1 text-xl font-semibold tracking-tight text-slate-900 dark:text-slate-50">
          You&apos;re never on your own
        </h1>
      </div>

      <div className="flex flex-col gap-2">
        <EmergencyButton contacts={emergencyContacts} />
      </div>

      <section className="flex flex-col gap-3 rounded-2xl border border-slate-200 p-4 dark:border-slate-800">
        <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-50">
          Report a safety concern
        </h2>
        <ReportForm
          myRides={myRides}
          currentUserId={currentUser.id}
          users={users}
          initialRideId={initialRideId ?? ""}
        />
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-50">
          Community guidelines
        </h2>
        <ul className="flex flex-col gap-2">
          {GUIDELINES.map((g) => (
            <li
              key={g}
              className="rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-600 dark:bg-slate-900 dark:text-slate-300"
            >
              {g}
            </li>
          ))}
        </ul>
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-50">Ride history</h2>
        {myRides.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-slate-300 px-4 py-6 text-center text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
            No rides yet.
          </p>
        ) : (
          myRides.map((ride) => {
            const otherId = ride.driverId === currentUser.id ? ride.parentId : ride.driverId;
            const role = ride.driverId === currentUser.id ? "driving" : "riding";
            return <RideCard key={ride.id} ride={ride} otherUser={users[otherId]} role={role} />;
          })
        )}
      </section>
    </main>
  );
}
