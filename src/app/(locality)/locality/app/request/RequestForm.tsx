"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AppHeader } from "@/components/locality/AppHeader";
import { Avatar } from "@/components/locality/Avatar";
import { BadgeRow, ReliabilityScore } from "@/components/locality/Badge";
import { createRequest, confirmMatch } from "@/lib/locality/actions";
import type { Circle } from "@/lib/locality/types";
import type { CandidateMatch } from "@/lib/locality/db";

export function RequestForm({ myCircles }: { myCircles: Circle[] }) {
  const router = useRouter();

  const [circleId, setCircleId] = useState(myCircles[0]?.id ?? "");
  const [pickup, setPickup] = useState("");
  const [dropoff, setDropoff] = useState(myCircles[0]?.name.replace(" Carpool Circle", "") ?? "");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [childCount, setChildCount] = useState(1);
  const [notes, setNotes] = useState("");
  const [result, setResult] = useState<{ requestId: string; matches: CandidateMatch[] } | null>(null);
  const [pending, setPending] = useState(false);

  function handleCircleChange(id: string) {
    setCircleId(id);
    const circle = myCircles.find((c) => c.id === id);
    if (circle) setDropoff(circle.name.replace(" Carpool Circle", ""));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!circleId || !pickup.trim() || !dropoff.trim()) return;
    setPending(true);
    try {
      const res = await createRequest({
        circleId,
        pickup: pickup.trim(),
        dropoff: dropoff.trim(),
        date,
        time,
        childCount,
        notes: notes.trim(),
      });
      setResult(res);
    } finally {
      setPending(false);
    }
  }

  async function handleSelect(offerId: string) {
    if (!result) return;
    const rideId = await confirmMatch(result.requestId, offerId);
    router.push(`/locality/app/ride/${rideId}`);
  }

  if (myCircles.length === 0) {
    return (
      <main className="flex flex-1 flex-col">
        <AppHeader title="Request a ride" backHref="/locality/app" />
        <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 py-16 text-center">
          <h1 className="text-lg font-semibold text-slate-900 dark:text-slate-50">
            Join a community first
          </h1>
          <p className="max-w-xs text-sm text-slate-500 dark:text-slate-400">
            Ride requests are matched within a specific school Circle — join one to get started.
          </p>
          <Link
            href="/locality/app/circle"
            className="rounded-full bg-sky-600 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-sky-700 dark:bg-sky-500 dark:hover:bg-sky-400"
          >
            Browse communities →
          </Link>
        </div>
      </main>
    );
  }

  if (result) {
    return (
      <main className="flex flex-1 flex-col">
        <AppHeader title="Request a ride" backHref="/locality/app" />
        <div className="flex flex-1 flex-col gap-4 px-5 py-6">
          <div>
            <h1 className="text-lg font-semibold text-slate-900 dark:text-slate-50">
              {result.matches.length > 0 ? "Matches from your Circle" : "No matches yet"}
            </h1>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              {result.matches.length > 0
                ? "Pick a verified family to confirm the ride."
                : "No open offers match that day right now — check back soon or try a different date."}
            </p>
          </div>

          {result.matches.map(({ offer, driver }) => (
            <button
              key={offer.id}
              onClick={() => handleSelect(offer.id)}
              className="flex flex-col gap-3 rounded-2xl border border-slate-200 p-4 text-left transition hover:border-sky-300 dark:border-slate-800 dark:hover:border-sky-700"
            >
              <div className="flex items-center gap-3">
                <Avatar name={driver.name} color={driver.avatarColor} size={44} />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-slate-900 dark:text-slate-50">
                    {driver.name}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {offer.pickupTime} · {offer.days.join("/")} · {offer.seatsAvailable} seats left
                  </p>
                </div>
                <ReliabilityScore score={driver.reliabilityScore} />
              </div>
              <BadgeRow badges={driver.badges} />
            </button>
          ))}

          {result.matches.length === 0 && (
            <Link
              href="/locality/app"
              className="mt-2 rounded-full bg-sky-600 px-6 py-2.5 text-center text-sm font-semibold text-white transition hover:bg-sky-700 dark:bg-sky-500 dark:hover:bg-sky-400"
            >
              Back to dashboard
            </Link>
          )}
        </div>
      </main>
    );
  }

  return (
    <main className="flex flex-1 flex-col">
      <AppHeader title="Request a ride" backHref="/locality/app" />
      <form onSubmit={handleSubmit} className="flex flex-1 flex-col gap-5 px-5 py-6">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="circle" className="text-sm font-medium text-slate-700 dark:text-slate-200">
            Community
          </label>
          <select
            id="circle"
            value={circleId}
            onChange={(e) => handleCircleChange(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-sky-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-50"
          >
            {myCircles.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="pickup" className="text-sm font-medium text-slate-700 dark:text-slate-200">
            Pickup location
          </label>
          <input
            id="pickup"
            type="text"
            value={pickup}
            onChange={(e) => setPickup(e.target.value)}
            placeholder="Your address"
            required
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-sky-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-50"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="dropoff" className="text-sm font-medium text-slate-700 dark:text-slate-200">
            Drop-off location
          </label>
          <input
            id="dropoff"
            type="text"
            value={dropoff}
            onChange={(e) => setDropoff(e.target.value)}
            required
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-sky-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-50"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="date" className="text-sm font-medium text-slate-700 dark:text-slate-200">
              Date
            </label>
            <input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-sky-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-50"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="time" className="text-sm font-medium text-slate-700 dark:text-slate-200">
              Time
            </label>
            <input
              id="time"
              type="text"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              placeholder="7:30 AM"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-sky-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-50"
            />
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="child-count" className="text-sm font-medium text-slate-700 dark:text-slate-200">
            Number of children
          </label>
          <input
            id="child-count"
            type="number"
            min={1}
            max={4}
            value={childCount}
            onChange={(e) => setChildCount(Number(e.target.value))}
            className="w-24 rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-sky-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-50"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="notes" className="text-sm font-medium text-slate-700 dark:text-slate-200">
            Notes <span className="font-normal text-slate-400 dark:text-slate-500">(optional)</span>
          </label>
          <textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            placeholder="Anything the driver should know"
            className="w-full resize-none rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-sky-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-50"
          />
        </div>

        <button
          type="submit"
          disabled={!circleId || !pickup.trim() || !dropoff.trim() || pending}
          className="mt-auto rounded-full bg-sky-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-sky-700 disabled:opacity-40 dark:bg-sky-500 dark:hover:bg-sky-400"
        >
          Find a ride in my Circle
        </button>
      </form>
    </main>
  );
}
