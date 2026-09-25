"use client";

import { useState, type FormEvent } from "react";
import { inviteFamily } from "@/lib/locality/actions";

export function InviteForm({ circleId }: { circleId: string }) {
  const [show, setShow] = useState(false);
  const [email, setEmail] = useState("");
  const [pending, setPending] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setPending(true);
    try {
      await inviteFamily(circleId, email.trim());
      setEmail("");
      setShow(false);
    } finally {
      setPending(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setShow((s) => !s)}
        className="rounded-full border border-sky-600/30 bg-sky-50 px-4 py-2 text-sm font-semibold text-sky-700 transition hover:bg-sky-100 dark:border-sky-400/30 dark:bg-sky-500/10 dark:text-sky-300 dark:hover:bg-sky-500/20"
      >
        + Invite a family
      </button>

      {show && (
        <form
          onSubmit={handleSubmit}
          className="mt-2 flex w-full flex-col gap-2 rounded-2xl border border-slate-200 p-4 dark:border-slate-800 sm:flex-row"
        >
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="family@example.com"
            required
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-sky-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-50"
          />
          <button
            type="submit"
            disabled={pending}
            className="flex-none rounded-lg bg-sky-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-sky-700 disabled:opacity-40 dark:bg-sky-500 dark:hover:bg-sky-400"
          >
            Send invite
          </button>
        </form>
      )}
    </>
  );
}
