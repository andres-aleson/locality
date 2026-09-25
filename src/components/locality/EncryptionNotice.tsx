export function EncryptionNotice({ className = "" }: { className?: string }) {
  return (
    <p
      className={`flex items-start gap-2 text-xs text-slate-500 dark:text-slate-400 ${className}`}
    >
      <svg
        width="14"
        height="14"
        viewBox="0 0 20 20"
        fill="none"
        className="mt-0.5 flex-none text-emerald-600 dark:text-emerald-400"
        aria-hidden
      >
        <rect x="4.5" y="9" width="11" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
        <path d="M6.5 9V6.5a3.5 3.5 0 0 1 7 0V9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <circle cx="10" cy="13" r="1.1" fill="currentColor" />
      </svg>
      <span>
        Everything you share with Locality — your info, addresses, and messages — is encrypted and
        never sold or shared publicly.
      </span>
    </p>
  );
}
