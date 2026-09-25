export function LocalityLogo({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <svg
        width="36"
        height="36"
        viewBox="0 0 36 36"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden
      >
        <defs>
          <linearGradient id="locality-mark" x1="0" y1="0" x2="36" y2="36" gradientUnits="userSpaceOnUse">
            <stop stopColor="#0284c7" />
            <stop offset="1" stopColor="#059669" />
          </linearGradient>
        </defs>
        <circle cx="18" cy="18" r="18" fill="url(#locality-mark)" />
        <path
          d="M18 9c-3.87 0-7 3.13-7 7 0 5.25 7 11 7 11s7-5.75 7-11c0-3.87-3.13-7-7-7Z"
          fill="white"
          fillOpacity="0.95"
        />
        <circle cx="18" cy="16" r="2.6" fill="url(#locality-mark)" />
      </svg>
      <span className="text-lg font-semibold tracking-tight text-slate-900 dark:text-slate-50">
        Locality
      </span>
    </div>
  );
}
