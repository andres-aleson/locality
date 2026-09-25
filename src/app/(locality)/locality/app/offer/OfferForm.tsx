"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { AppHeader } from "@/components/locality/AppHeader";
import { createOffer } from "@/lib/locality/actions";
import type { Circle } from "@/lib/locality/types";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri"];

export function OfferForm({ myCircles }: { myCircles: Circle[] }) {
  const [circleId, setCircleId] = useState(myCircles[0]?.id ?? "");
  const [days, setDays] = useState<string[]>(["Mon", "Wed", "Fri"]);
  const [pickupTime, setPickupTime] = useState("7:30 AM");
  const [seats, setSeats] = useState(2);
  const [posted, setPosted] = useState(false);
  const [pending, setPending] = useState(false);

  const postedCircleName = myCircles.find((c) => c.id === circleId)?.name ?? "your Circle";

  function toggleDay(day: string) {
    setDays((prev) => (prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!circleId || days.length === 0 || !pickupTime.trim() || seats < 1) return;
    setPending(true);
    try {
      await createOffer({ circleId, days, pickupTime: pickupTime.trim(), seatsAvailable: seats });
      setPosted(true);
    } finally {
      setPending(false);
    }
  }

  if (myCircles.length === 0) {
    return (
      <main className="flex flex-1 flex-col">
        <AppHeader title="Offer a ride" backHref="/locality/app" />
        <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 py-16 text-center">
          <h1 className="text-lg font-semibold text-slate-900 dark:text-slate-50">
            Join a community first
          </h1>
          <p className="max-w-xs text-sm text-slate-500 dark:text-slate-400">
            Offers go out to a specific school Circle — join one to start offering seats.
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

  if (posted) {
    return (
      <main className="flex flex-1 flex-col">
        <AppHeader title="Offer a ride" backHref="/locality/app" />
        <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 py-16 text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-600 text-white dark:bg-emerald-500">
            <svg width="22" height="22" viewBox="0 0 20 20" fill="none" aria-hidden>
              <path d="M4 10.5 8 14.5 16 6" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
          <h1 className="text-xl font-semibold tracking-tight text-slate-900 dark:text-slate-50">
            Your seats are posted to the Circle
          </h1>
          <p className="max-w-xs text-sm text-slate-500 dark:text-slate-400">
            Every verified family in {postedCircleName} can now request a seat on your run.
          </p>
          <Link
            href="/locality/app"
            className="mt-2 rounded-full bg-sky-600 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-sky-700 dark:bg-sky-500 dark:hover:bg-sky-400"
          >
            Back to dashboard →
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="flex flex-1 flex-col">
      <AppHeader title="Offer a ride" backHref="/locality/app" />
      <form onSubmit={handleSubmit} className="flex flex-1 flex-col gap-6 px-5 py-6">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="circle" className="text-sm font-medium text-slate-700 dark:text-slate-200">
            Community
          </label>
          <select
            id="circle"
            value={circleId}
            onChange={(e) => setCircleId(e.target.value)}
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
          <label className="text-sm font-medium text-slate-700 dark:text-slate-200">Days you drive</label>
          <div className="flex flex-wrap gap-2">
            {DAYS.map((day) => (
              <button
                type="button"
                key={day}
                onClick={() => toggleDay(day)}
                className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
                  days.includes(day)
                    ? "border-sky-600 bg-sky-600 text-white dark:border-sky-500 dark:bg-sky-500"
                    : "border-slate-300 text-slate-600 hover:border-sky-300 dark:border-slate-700 dark:text-slate-300"
                }`}
              >
                {day}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="pickup-time" className="text-sm font-medium text-slate-700 dark:text-slate-200">
            Pickup time
          </label>
          <input
            id="pickup-time"
            type="text"
            value={pickupTime}
            onChange={(e) => setPickupTime(e.target.value)}
            placeholder="7:30 AM"
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-sky-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-50"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="seats" className="text-sm font-medium text-slate-700 dark:text-slate-200">
            Seats available
          </label>
          <input
            id="seats"
            type="number"
            min={1}
            max={6}
            value={seats}
            onChange={(e) => setSeats(Number(e.target.value))}
            className="w-32 rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-sky-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-50"
          />
        </div>

        <button
          type="submit"
          disabled={!circleId || days.length === 0 || !pickupTime.trim() || seats < 1 || pending}
          className="mt-auto rounded-full bg-sky-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-sky-700 disabled:opacity-40 dark:bg-sky-500 dark:hover:bg-sky-400"
        >
          Post to your Circle
        </button>
      </form>
    </main>
  );
}
