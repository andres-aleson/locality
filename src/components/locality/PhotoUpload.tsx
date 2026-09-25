"use client";

import { useRef, useState } from "react";
import type { SubmissionKind, SubmissionStatus } from "@/lib/locality/types";

type Status = "idle" | "uploading" | "done" | "error";

export function PhotoUpload({
  label,
  kind,
  uploaderName,
  uploaderEmail,
  onUploaded,
}: {
  label: string;
  kind: SubmissionKind;
  uploaderName: string;
  uploaderEmail: string;
  onUploaded: (uploaded: boolean, submissionId?: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState<Status>("idle");
  const [fileName, setFileName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [resultStatus, setResultStatus] = useState<SubmissionStatus | null>(null);

  async function handleFile(file: File) {
    setFileName(file.name);
    setStatus("uploading");
    setError(null);
    setResultStatus(null);
    onUploaded(false);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("kind", kind);
    formData.append("uploaderName", uploaderName);
    formData.append("uploaderEmail", uploaderEmail);

    try {
      const res = await fetch("/api/locality/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed.");
      setStatus("done");
      setResultStatus(data.submission?.status ?? null);
      onUploaded(true, data.submission?.id);
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Upload failed.");
      onUploaded(false);
    }
  }

  function reset() {
    setStatus("idle");
    setFileName(null);
    setError(null);
    setResultStatus(null);
    onUploaded(false);
    if (inputRef.current) inputRef.current.value = "";
  }

  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-medium text-slate-500 dark:text-slate-400">{label}</label>

      {status === "done" && fileName && (
        <div className="flex flex-col gap-1">
          <div className="flex items-center justify-between gap-2 rounded-lg border border-emerald-600/20 bg-emerald-50 px-3 py-2.5 text-sm text-emerald-700 dark:border-emerald-400/20 dark:bg-emerald-500/10 dark:text-emerald-300">
            <span className="flex min-w-0 items-center gap-1.5">
              <svg width="14" height="14" viewBox="0 0 20 20" fill="none" className="flex-none" aria-hidden>
                <path d="M4 10.5 8 14.5 16 6" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span className="truncate">{fileName}</span>
            </span>
            <button type="button" onClick={reset} className="flex-none text-xs font-semibold underline">
              Change
            </button>
          </div>
          {resultStatus === "pending" && (
            <p className="text-xs text-amber-600 dark:text-amber-400">
              Sent to our team for a closer look.
            </p>
          )}
          {resultStatus === "auto_approved" && (
            <p className="text-xs text-slate-400 dark:text-slate-500">Passed the quality check.</p>
          )}
        </div>
      )}

      {status === "uploading" && (
        <div className="flex items-center gap-2 rounded-lg border border-sky-600/20 bg-sky-50 px-3 py-2.5 text-sm text-sky-700 dark:border-sky-400/20 dark:bg-sky-500/10 dark:text-sky-300">
          <span className="h-3.5 w-3.5 flex-none animate-spin rounded-full border-2 border-sky-600 border-t-transparent dark:border-sky-300 dark:border-t-transparent" />
          <span className="truncate">Checking {fileName}…</span>
        </div>
      )}

      {(status === "idle" || status === "error") && (
        <>
          <label className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border-2 border-dashed border-slate-300 px-3 py-4 text-sm text-slate-500 transition hover:border-sky-400 hover:text-sky-600 dark:border-slate-700 dark:text-slate-400 dark:hover:border-sky-500 dark:hover:text-sky-400">
            <svg width="16" height="16" viewBox="0 0 20 20" fill="none" aria-hidden>
              <path
                d="M10 13V4m0 0L6.5 7.5M10 4l3.5 3.5M4 14.5v1a1.5 1.5 0 0 0 1.5 1.5h9a1.5 1.5 0 0 0 1.5-1.5v-1"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Upload a photo
            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFile(file);
              }}
            />
          </label>
          <p className="text-xs text-slate-400 dark:text-slate-500">
            Use a clear, well-lit, non-blurry photo — blurry uploads are rejected automatically.
          </p>
          {status === "error" && error && (
            <p className="text-xs text-rose-600 dark:text-rose-400">{error}</p>
          )}
        </>
      )}
    </div>
  );
}
