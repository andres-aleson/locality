"use client";

import Link from "next/link";
import { useState } from "react";
import type { EmergencyContact } from "@/lib/locality/types";

export function EmergencyButton({ contacts }: { contacts: EmergencyContact[] }) {
  const [open, setOpen] = useState(false);
  const [calling, setCalling] = useState<EmergencyContact | null>(null);

  return (
    <>
      <button
        onClick={() => {
          setOpen((v) => !v);
          setCalling(null);
        }}
        className="rounded-full bg-rose-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-rose-700"
      >
        🚨 Emergency contact
      </button>

      {open && (
        <div className="flex flex-col gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 dark:border-rose-900 dark:bg-rose-500/10">
          {contacts.length === 0 ? (
            <p className="text-center text-xs text-rose-700 dark:text-rose-300">
              No emergency contacts saved yet.{" "}
              <Link href="/locality/app/profile" className="font-semibold underline">
                Add one from your profile
              </Link>
              .
            </p>
          ) : (
            <>
              <p className="text-center text-xs font-medium text-rose-700 dark:text-rose-300">
                Who do you want to call?
              </p>
              {contacts.map((contact) => (
                <a
                  key={contact.id}
                  href={`tel:${contact.phone}`}
                  onClick={() => setCalling(contact)}
                  className="flex items-center justify-between rounded-lg bg-white px-3 py-2.5 text-sm transition hover:bg-rose-100 dark:bg-slate-900 dark:hover:bg-rose-500/20"
                >
                  <span>
                    <span className="font-medium text-slate-900 dark:text-slate-50">{contact.name}</span>
                    {contact.relationship && (
                      <span className="text-slate-500 dark:text-slate-400"> · {contact.relationship}</span>
                    )}
                  </span>
                  <span className="font-semibold text-rose-600 dark:text-rose-400">Call</span>
                </a>
              ))}
            </>
          )}
        </div>
      )}

      {calling && (
        <p className="rounded-xl bg-rose-50 px-4 py-3 text-center text-xs text-rose-700 dark:bg-rose-500/10 dark:text-rose-300">
          Calling {calling.name}…
        </p>
      )}
    </>
  );
}
