import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="mx-auto flex w-full max-w-4xl flex-wrap items-center justify-between gap-4 px-6 py-8 text-xs text-neutral-500">
      <span>© {new Date().getFullYear()} LocalReach</span>
      <div className="flex gap-4">
        <Link href="/terms" className="hover:text-neutral-900 dark:hover:text-neutral-100">
          Terms &amp; Conditions
        </Link>
        <Link href="/privacy" className="hover:text-neutral-900 dark:hover:text-neutral-100">
          Privacy Policy
        </Link>
      </div>
    </footer>
  );
}
