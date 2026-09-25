"use client";

import { useEffect, useState } from "react";
import { LocalityLogo } from "@/components/locality/Logo";
import type { Submission, SubmissionStatus } from "@/lib/locality/types";

const KIND_LABELS: Record<Submission["kind"], string> = {
  residence: "Proof of residence",
  license: "Driver's license",
};

const STATUS_META: Record<SubmissionStatus, { label: string; className: string }> = {
  pending: {
    label: "Needs your review",
    className: "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300",
  },
  auto_approved: {
    label: "Auto-cleared",
    className: "bg-sky-50 text-sky-700 dark:bg-sky-500/10 dark:text-sky-300",
  },
  approved: {
    label: "Approved",
    className: "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300",
  },
  rejected: {
    label: "Rejected",
    className: "bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-300",
  },
};

const FILTERS: { label: string; value: SubmissionStatus | "all" }[] = [
  { label: "Needs review", value: "pending" },
  { label: "Auto-cleared", value: "auto_approved" },
  { label: "Approved", value: "approved" },
  { label: "Rejected", value: "rejected" },
  { label: "All", value: "all" },
];

export default function LocalityAdminPage() {
  const [submissions, setSubmissions] = useState<Submission[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<SubmissionStatus | "all">("pending");
  const [busyId, setBusyId] = useState<string | null>(null);

  async function load() {
    setError(null);
    try {
      const res = await fetch("/api/locality/submissions");
      if (!res.ok) throw new Error(`Failed to load submissions (${res.status}).`);
      const data = await res.json();
      setSubmissions(data.submissions);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load submissions.");
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time fetch on mount, not a render loop
    load();
  }, []);

  async function review(id: string, status: "approved" | "rejected") {
    setBusyId(id);
    try {
      const res = await fetch(`/api/locality/submissions/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error("Failed to update submission.");
      const data = await res.json();
      setSubmissions((prev) => prev?.map((s) => (s.id === id ? data.submission : s)) ?? prev);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update submission.");
    } finally {
      setBusyId(null);
    }
  }

  const visible = submissions?.filter((s) => filter === "all" || s.status === filter) ?? [];
  const pendingCount = submissions?.filter((s) => s.status === "pending").length ?? 0;

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-6 py-10">
      <div className="flex items-center justify-between">
        <LocalityLogo />
        <span className="text-xs font-medium uppercase tracking-wide text-slate-400 dark:text-slate-500">
          Admin
        </span>
      </div>

      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-50">
          Verification review
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Every upload is quality-checked automatically (readable, right document type) and synced
          to Google Drive. That check can&apos;t confirm a document is genuine — only flag the
          obviously-bad ones for you.
          {pendingCount > 0 && ` ${pendingCount} waiting on you now.`}
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${
              filter === f.value
                ? "bg-sky-600 text-white dark:bg-sky-500"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {error && (
        <p className="rounded-lg bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:bg-rose-500/10 dark:text-rose-300">
          {error}
        </p>
      )}

      {submissions === null && !error && (
        <p className="text-sm text-slate-400 dark:text-slate-500">Loading…</p>
      )}

      {submissions !== null && visible.length === 0 && (
        <p className="rounded-2xl border border-dashed border-slate-300 px-4 py-10 text-center text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
          Nothing here right now.
        </p>
      )}

      <div className="flex flex-col gap-3">
        {visible.map((s) => (
          <div
            key={s.id}
            className="flex flex-col gap-3 rounded-2xl border border-slate-200 p-4 dark:border-slate-800"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-slate-900 dark:text-slate-50">
                  {KIND_LABELS[s.kind]}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {s.uploaderName || "Unknown"} {s.uploaderEmail && `· ${s.uploaderEmail}`}
                </p>
                <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
                  {new Date(s.uploadedAt).toLocaleString()}
                </p>
              </div>
              <StatusPill status={s.status} />
            </div>

            <a
              href={s.driveViewLink}
              target="_blank"
              rel="noreferrer"
              className="self-start text-sm font-medium text-sky-600 hover:text-sky-700 dark:text-sky-400 dark:hover:text-sky-300"
            >
              View {s.fileName} in Drive ↗
            </a>

            {s.qualityCheck && (
              <div className="rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-500 dark:bg-slate-900 dark:text-slate-400">
                {s.qualityCheck.reasons.length > 0 ? (
                  <ul className="list-inside list-disc space-y-0.5">
                    {s.qualityCheck.reasons.map((r) => (
                      <li key={r}>{r}</li>
                    ))}
                  </ul>
                ) : (
                  <span>
                    Looked like the right document
                    {s.qualityCheck.matchedKeywords.length > 0 &&
                      ` (matched: ${s.qualityCheck.matchedKeywords.join(", ")})`}
                    .
                  </span>
                )}
              </div>
            )}

            {(s.status === "pending" || s.status === "auto_approved") && (
              <div className="flex gap-2">
                <button
                  disabled={busyId === s.id}
                  onClick={() => review(s.id, "approved")}
                  className="rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-40 dark:bg-emerald-500 dark:hover:bg-emerald-400"
                >
                  Approve
                </button>
                <button
                  disabled={busyId === s.id}
                  onClick={() => review(s.id, "rejected")}
                  className="rounded-full border border-rose-300 px-4 py-2 text-sm font-semibold text-rose-600 transition hover:bg-rose-50 disabled:opacity-40 dark:border-rose-800 dark:text-rose-400 dark:hover:bg-rose-500/10"
                >
                  Reject
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </main>
  );
}

function StatusPill({ status }: { status: SubmissionStatus }) {
  const meta = STATUS_META[status];
  return (
    <span className={`flex-none rounded-full px-2.5 py-1 text-[11px] font-medium ${meta.className}`}>
      {meta.label}
    </span>
  );
}
