import Link from "next/link";
import { Avatar } from "./Avatar";
import type { Ride, RideStatus, User } from "@/lib/locality/types";

const STATUS_META: Record<RideStatus, { label: string; className: string }> = {
  pending: {
    label: "Needs confirmation",
    className: "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300",
  },
  confirmed: {
    label: "Confirmed",
    className: "bg-sky-50 text-sky-700 dark:bg-sky-500/10 dark:text-sky-300",
  },
  completed: {
    label: "Completed",
    className: "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300",
  },
  "no-show": {
    label: "No-show reported",
    className: "bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-300",
  },
};

export function RideCard({
  ride,
  otherUser,
  role,
}: {
  ride: Ride;
  otherUser: User;
  role: "driving" | "riding";
}) {
  const status = STATUS_META[ride.status];
  return (
    <Link
      href={`/locality/app/ride/${ride.id}`}
      className="flex items-center gap-3 rounded-2xl border border-slate-200 px-4 py-3 transition hover:border-sky-300 dark:border-slate-800 dark:hover:border-sky-700"
    >
      <Avatar name={otherUser.name} color={otherUser.avatarColor} size={44} />
      <div className="flex-1">
        <p className="text-sm font-semibold text-slate-900 dark:text-slate-50">
          {role === "driving" ? `${otherUser.name}'s ${ride.childName}` : otherUser.name}
        </p>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          {role === "driving" ? "You're driving" : "They're driving"} · {ride.time} · {ride.date}
        </p>
      </div>
      <span className={`flex-none rounded-full px-2 py-1 text-[11px] font-medium ${status.className}`}>
        {status.label}
      </span>
    </Link>
  );
}
