import { signInWithGoogle } from "@/lib/auth-actions";
import { SiteHeader } from "@/components/SiteHeader";

export default function LoginPage() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto flex w-full max-w-sm flex-1 flex-col items-center justify-center gap-6 px-6 py-16 text-center">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-50">
            Sign in to LocalReach
          </h1>
          <p className="text-sm text-neutral-600 dark:text-neutral-400">
            Your marketing plan and progress live on your account.
          </p>
        </div>

        <form action={signInWithGoogle}>
          <button
            type="submit"
            className="flex items-center gap-2 rounded-full bg-neutral-900 px-6 py-3 text-sm font-medium text-white transition hover:bg-neutral-700 dark:bg-neutral-50 dark:text-neutral-900 dark:hover:bg-neutral-200"
          >
            Sign in with Google
          </button>
        </form>
      </main>
    </>
  );
}
