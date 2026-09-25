import Link from "next/link";
import type { ReactNode } from "react";

export function SiteHeader({ right }: { right?: ReactNode }) {
  return (
    <header className="mx-auto flex w-full max-w-4xl items-center justify-between px-6 py-6">
      <Link
        href="/"
        className="text-sm font-semibold tracking-tight text-neutral-900 hover:text-neutral-600 dark:text-neutral-50 dark:hover:text-neutral-300"
      >
        LocalReach
      </Link>
      {right}
    </header>
  );
}
