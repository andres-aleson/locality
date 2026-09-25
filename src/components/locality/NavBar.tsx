"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  {
    href: "/locality/app",
    label: "Home",
    icon: (
      <path d="M4 10.5 12 4l8 6.5V19a1 1 0 0 1-1 1h-4.5v-6h-5v6H5a1 1 0 0 1-1-1v-8.5Z" />
    ),
    isActive: (pathname: string) => pathname === "/locality/app",
  },
  {
    href: "/locality/app/chat",
    label: "Chat",
    icon: (
      <path d="M4 5.5h16a1 1 0 0 1 1 1V15a1 1 0 0 1-1 1H9l-4 3.5V16H4a1 1 0 0 1-1-1V6.5a1 1 0 0 1 1-1Z" />
    ),
    isActive: (pathname: string) => pathname.startsWith("/locality/app/chat") || /\/circle\/[^/]+\/chat/.test(pathname),
  },
  {
    href: "/locality/app/circle",
    label: "Circle",
    icon: (
      <>
        <circle cx="8.5" cy="8" r="3" />
        <circle cx="16" cy="9" r="2.4" />
        <path d="M2.5 19c.6-3.4 2.9-5.3 6-5.3s5.4 1.9 6 5.3M14.5 19c.4-2.5 1.8-4 3.9-4.4" />
      </>
    ),
    isActive: (pathname: string) => pathname.startsWith("/locality/app/circle") && !/\/circle\/[^/]+\/chat/.test(pathname),
  },
  {
    href: "/locality/app/safety",
    label: "Safety",
    icon: <path d="M12 3.5 19 6.5v5.2c0 4.4-3 7.6-7 8.8-4-1.2-7-4.4-7-8.8V6.5L12 3.5Z" />,
    isActive: (pathname: string) => pathname.startsWith("/locality/app/safety"),
  },
  {
    href: "/locality/app/profile",
    label: "Profile",
    icon: (
      <>
        <circle cx="12" cy="8.3" r="3.3" />
        <path d="M4.8 19.4c1.1-3.4 3.6-5.2 7.2-5.2s6.1 1.8 7.2 5.2" />
      </>
    ),
    isActive: (pathname: string) => pathname.startsWith("/locality/app/profile"),
  },
];

export function NavBar() {
  const pathname = usePathname() ?? "";

  return (
    <nav className="sticky bottom-0 z-10 flex items-center justify-around border-t border-slate-200 bg-white/95 px-2 py-2 backdrop-blur dark:border-slate-800 dark:bg-slate-950/95">
      {TABS.map((tab) => {
        const active = tab.isActive(pathname);
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`flex min-w-16 flex-col items-center gap-1 rounded-xl px-3 py-1.5 text-[11px] font-medium transition ${
              active
                ? "text-sky-600 dark:text-sky-400"
                : "text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300"
            }`}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              {tab.icon}
            </svg>
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
