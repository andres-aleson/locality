import Link from "next/link";
import { LocalityLogo } from "@/components/locality/Logo";

export function ComingSoon({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <main className="flex min-h-screen flex-1 flex-col items-center justify-center gap-6 px-6 text-center">
      <LocalityLogo />
      <h1 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-50">
        {title}
      </h1>
      <p className="max-w-sm text-sm text-slate-600 dark:text-slate-300">{description}</p>
      <Link
        href="/locality"
        className="text-sm font-medium text-sky-600 hover:text-sky-700 dark:text-sky-400 dark:hover:text-sky-300"
      >
        ← Back to welcome
      </Link>
    </main>
  );
}
