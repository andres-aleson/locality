"use client";

import { useState } from "react";
import { updateProfile } from "@/lib/locality/actions";
import type { User } from "@/lib/locality/types";

export function ProfileEditor({ currentUser }: { currentUser: User }) {
  const [editing, setEditing] = useState(false);
  const [pending, setPending] = useState(false);
  const [form, setForm] = useState({
    name: currentUser.name,
    phone: currentUser.phone,
    email: currentUser.email,
    address: currentUser.address,
  });

  async function saveEdits() {
    setPending(true);
    try {
      await updateProfile(form);
      setEditing(false);
    } finally {
      setPending(false);
    }
  }

  return (
    <section className="flex flex-col gap-3 rounded-2xl border border-slate-200 p-4 dark:border-slate-800">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-50">Your info</h2>
        {!editing && (
          <button
            onClick={() => setEditing(true)}
            className="text-xs font-semibold text-sky-600 dark:text-sky-400"
          >
            Edit
          </button>
        )}
      </div>

      {editing ? (
        <div className="flex flex-col gap-2.5">
          {(
            [
              ["name", "Name"],
              ["phone", "Phone"],
              ["email", "Email"],
              ["address", "Address"],
            ] as const
          ).map(([key, label]) => (
            <div key={key} className="flex flex-col gap-1">
              <label className="text-xs font-medium text-slate-500 dark:text-slate-400">{label}</label>
              <input
                type="text"
                value={form[key]}
                onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-sky-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-50"
              />
            </div>
          ))}
          <div className="mt-1 flex gap-2">
            <button
              onClick={saveEdits}
              disabled={pending}
              className="rounded-full bg-sky-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-sky-700 disabled:opacity-40 dark:bg-sky-500 dark:hover:bg-sky-400"
            >
              Save
            </button>
            <button
              onClick={() => setEditing(false)}
              className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-600 dark:border-slate-700 dark:text-slate-300"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-2 text-sm">
          <Row label="Phone" value={currentUser.phone || "—"} />
          <Row label="Email" value={currentUser.email || "—"} />
          <Row label="Address" value={currentUser.address || "—"} />
        </div>
      )}
    </section>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-slate-500 dark:text-slate-400">{label}</span>
      <span className="font-medium text-slate-900 dark:text-slate-50">{value}</span>
    </div>
  );
}
