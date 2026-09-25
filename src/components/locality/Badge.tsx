import type { BadgeType } from "@/lib/locality/types";

const BADGE_META: Record<BadgeType, { label: string; className: string }> = {
  identityVerified: {
    label: "Identity Verified",
    className:
      "bg-sky-50 text-sky-700 border-sky-600/20 dark:bg-sky-500/10 dark:text-sky-300 dark:border-sky-400/20",
  },
  parentVerified: {
    label: "Parent Verified",
    className:
      "bg-emerald-50 text-emerald-700 border-emerald-600/20 dark:bg-emerald-500/10 dark:text-emerald-300 dark:border-emerald-400/20",
  },
  driverVerified: {
    label: "Driver Verified",
    className:
      "bg-amber-50 text-amber-700 border-amber-600/20 dark:bg-amber-500/10 dark:text-amber-300 dark:border-amber-400/20",
  },
  communityTrusted: {
    label: "Community Trusted",
    className:
      "bg-violet-50 text-violet-700 border-violet-600/20 dark:bg-violet-500/10 dark:text-violet-300 dark:border-violet-400/20",
  },
};

export function BadgeChip({ type }: { type: BadgeType }) {
  const meta = BADGE_META[type];
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-medium ${meta.className}`}
    >
      <svg width="11" height="11" viewBox="0 0 20 20" fill="none" aria-hidden>
        <path
          d="M4 10.5 8 14.5 16 6"
          stroke="currentColor"
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      {meta.label}
    </span>
  );
}

export function BadgeRow({ badges }: { badges: BadgeType[] }) {
  if (badges.length === 0) {
    return <span className="text-xs text-slate-400 dark:text-slate-500">No badges yet</span>;
  }
  return (
    <div className="flex flex-wrap gap-1.5">
      {badges.map((badge) => (
        <BadgeChip key={badge} type={badge} />
      ))}
    </div>
  );
}

export function ReliabilityScore({ score }: { score: number }) {
  return (
    <span className="inline-flex items-center gap-1 text-sm font-semibold text-slate-700 dark:text-slate-200">
      <svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor" className="text-amber-500" aria-hidden>
        <path d="M10 1.5l2.6 5.6 6.1.7-4.5 4.2 1.2 6-5.4-3-5.4 3 1.2-6-4.5-4.2 6.1-.7L10 1.5z" />
      </svg>
      {score.toFixed(1)}
      <span className="font-normal text-slate-400 dark:text-slate-500">/5</span>
    </span>
  );
}
