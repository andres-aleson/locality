import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/session";
import { signInWithGoogleForLocality } from "@/lib/locality/actions";
import { LocalityLogo } from "@/components/locality/Logo";

// Depends on the caller's session — must never be prerendered/cached as static content.
export const dynamic = "force-dynamic";

export default async function LocalityLoginPage() {
  const user = await getSessionUser();
  if (user) redirect("/locality/verification");

  return (
    <main className="mx-auto flex w-full max-w-sm flex-1 flex-col items-center justify-center gap-6 px-6 py-16 text-center">
      <LocalityLogo />
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-50">
          Sign in to Locality
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Your Circles, rides, and messages live on your account.
        </p>
      </div>

      <form action={signInWithGoogleForLocality}>
        <button
          type="submit"
          className="flex items-center gap-2 rounded-full bg-sky-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-sky-700 dark:bg-sky-500 dark:hover:bg-sky-400"
        >
          Sign in with Google
        </button>
      </form>
    </main>
  );
}
