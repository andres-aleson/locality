import Link from "next/link";

export function AppHeader({ title, backHref }: { title: string; backHref?: string }) {
  return (
    <header className="sticky top-0 z-10 flex items-center gap-3 border-b border-slate-200 bg-white/90 px-4 py-4 backdrop-blur dark:border-slate-800 dark:bg-slate-950/90">
      {backHref ? (
        <Link
          href={backHref}
          aria-label="Back"
          className="flex h-8 w-8 flex-none items-center justify-center rounded-full text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
        >
          ←
        </Link>
      ) : null}
      <h1 className="text-base font-semibold text-slate-900 dark:text-slate-50">{title}</h1>
    </header>
  );
}
