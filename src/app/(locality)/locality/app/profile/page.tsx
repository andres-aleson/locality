import { redirect } from "next/navigation";
import { getAccountStatus, signOutOfLocality } from "@/lib/locality/actions";
import { getEmergencyContacts, getRidesForProfile, getUsersByIds } from "@/lib/locality/db";
import { Avatar } from "@/components/locality/Avatar";
import { BadgeRow, ReliabilityScore } from "@/components/locality/Badge";
import { RideCard } from "@/components/locality/RideCard";
import { ProfileEditor } from "./ProfileEditor";
import { EmergencyContactsManager } from "./EmergencyContactsManager";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
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
      <div className="flex items-center gap-4">
        <Avatar name={currentUser.name} color={currentUser.avatarColor} size={64} />
        <div className="flex-1">
          <h1 className="text-xl font-semibold tracking-tight text-slate-900 dark:text-slate-50">
            {currentUser.name}
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {currentUser.completedRides} completed {currentUser.completedRides === 1 ? "ride" : "rides"}
          </p>
        </div>
        <ReliabilityScore score={currentUser.reliabilityScore} />
      </div>

      <BadgeRow badges={currentUser.badges} />

      <ProfileEditor currentUser={currentUser} />

      <EmergencyContactsManager initialContacts={emergencyContacts} />

      <section className="flex flex-col gap-2">
        <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-50">Children</h2>
        {currentUser.children.length === 0 ? (
          <p className="text-sm text-slate-400 dark:text-slate-500">None added yet.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {currentUser.children.map((child) => (
              <div
                key={child.id}
                className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-2.5 text-sm dark:bg-slate-900"
              >
                <span className="font-medium text-slate-900 dark:text-slate-50">{child.name}</span>
                <span className="text-slate-500 dark:text-slate-400">{child.grade}</span>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-50">Ride history</h2>
        {myRides.length === 0 ? (
          <p className="text-sm text-slate-400 dark:text-slate-500">No rides yet.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {myRides.map((ride) => {
              const otherId = ride.driverId === currentUser.id ? ride.parentId : ride.driverId;
              const role = ride.driverId === currentUser.id ? "driving" : "riding";
              return <RideCard key={ride.id} ride={ride} otherUser={users[otherId]} role={role} />;
            })}
          </div>
        )}
      </section>

      <form action={signOutOfLocality}>
        <button
          type="submit"
          className="mt-2 self-start rounded-full border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-600 transition hover:border-rose-300 hover:text-rose-600 dark:border-slate-700 dark:text-slate-300 dark:hover:border-rose-800 dark:hover:text-rose-400"
        >
          Log out
        </button>
      </form>
    </main>
  );
}
