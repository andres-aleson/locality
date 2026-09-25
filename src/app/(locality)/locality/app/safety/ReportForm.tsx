"use client";

import { useState, type FormEvent } from "react";
import { reportIssue } from "@/lib/locality/actions";
import type { Ride, User } from "@/lib/locality/types";

export function ReportForm({
  myRides,
  currentUserId,
  users,
  initialRideId,
}: {
  myRides: Ride[];
  currentUserId: string;
  users: Record<string, User>;
  initialRideId: string;
}) {
  const [rideId, setRideId] = useState(initialRideId);
  const [description, setDescription] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [pending, setPending] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!description.trim()) return;
    setPending(true);
    try {
      await reportIssue(rideId || undefined, description.trim());
      setDescription("");
      setSubmitted(true);
    } finally {
      setPending(false);
    }
  }

  if (submitted) {
    return (
      <p className="rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300">
        Thanks — your report was submitted. Our safety team would review this within 24 hours.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      {myRides.length > 0 && (
        <select
          value={rideId}
          onChange={(e) => setRideId(e.target.value)}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-sky-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-50"
        >
          <option value="">Not tied to a specific ride</option>
          {myRides.map((r) => {
            const otherId = r.driverId === currentUserId ? r.parentId : r.driverId;
            return (
              <option key={r.id} value={r.id}>
                {users[otherId]?.name} · {r.date} {r.time}
              </option>
            );
          })}
        </select>
      )}
      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        rows={4}
        required
        placeholder="What happened?"
        className="w-full resize-none rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-sky-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-50"
      />
      <button
        type="submit"
        disabled={!description.trim() || pending}
        className="self-start rounded-full bg-rose-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-rose-700 disabled:opacity-40"
      >
        Submit report
      </button>
    </form>
  );
}
