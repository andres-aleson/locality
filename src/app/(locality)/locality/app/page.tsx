import { redirect } from "next/navigation";
import { getAccountStatus } from "@/lib/locality/actions";
import { getRidesForProfile, getUsersByIds } from "@/lib/locality/db";
import { RideCard } from "@/components/locality/RideCard";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const { profile: currentUser } = await getAccountStatus();
  if (!currentUser) redirect("/locality/login");

  const myRides = await getRidesForProfile(currentUser.id);
  const otherIds = myRides.map((r) => (r.driverId === currentUser.id ? r.parentId : r.driverId));
  const users = await getUsersByIds(otherIds);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
  const firstName = currentUser.name ? currentUser.name.split(" ")[0] : "there";

  const incomingRequests = myRides.filter((r) => r.driverId === currentUser.id && r.status === "pending");
  const awaitingMyConfirm = myRides.filter((r) => r.parentId === currentUser.id && r.status === "pending");
  const upcoming = myRides.filter((r) => r.status === "confirmed");

  return (
    <main className="flex flex-1 flex-col gap-7 px-5 pb-6 pt-8">
      <div>
        <p className="text-sm text-slate-500 dark:text-slate-400">{greeting},</p>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-50">
          {firstName}
        </h1>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <a
          href="/locality/app/request"
          className="rounded-2xl bg-sky-600 px-4 py-4 text-center text-sm font-semibold text-white shadow-sm shadow-sky-600/20 transition hover:bg-sky-700 dark:bg-sky-500 dark:hover:bg-sky-400"
        >
          Request a ride
        </a>
        <a
          href="/locality/app/offer"
          className="rounded-2xl border border-emerald-600/30 bg-emerald-50 px-4 py-4 text-center text-sm font-semibold text-emerald-700 transition hover:bg-emerald-100 dark:border-emerald-400/30 dark:bg-emerald-500/10 dark:text-emerald-300 dark:hover:bg-emerald-500/20"
        >
          Offer a ride
        </a>
      </div>

      {incomingRequests.length > 0 && (
        <section className="flex flex-col gap-2">
          <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-50">New ride requests</h2>
          {incomingRequests.map((ride) => (
            <RideCard key={ride.id} ride={ride} otherUser={users[ride.parentId]} role="driving" />
          ))}
        </section>
      )}

      {awaitingMyConfirm.length > 0 && (
        <section className="flex flex-col gap-2">
          <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-50">
            Awaiting your confirmation
          </h2>
          {awaitingMyConfirm.map((ride) => (
            <RideCard key={ride.id} ride={ride} otherUser={users[ride.driverId]} role="riding" />
          ))}
        </section>
      )}

      <section className="flex flex-col gap-2">
        <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-50">Upcoming rides</h2>
        {upcoming.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-slate-300 px-4 py-6 text-center text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
            No rides yet — request a ride or offer one to get started.
          </p>
        ) : (
          <div className="flex flex-col gap-2">
            {upcoming.map((ride) => {
              const otherId = ride.driverId === currentUser.id ? ride.parentId : ride.driverId;
              const role = ride.driverId === currentUser.id ? "driving" : "riding";
              return <RideCard key={ride.id} ride={ride} otherUser={users[otherId]} role={role} />;
            })}
          </div>
        )}
      </section>
    </main>
  );
}
