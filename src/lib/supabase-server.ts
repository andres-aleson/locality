import "server-only";
import { cache } from "react";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Anon-key Supabase client for the current request, cookie-aware so it can
 * read/refresh the caller's Google sign-in session. This is only used to
 * identify who's logged in — all real data queries go through the
 * service-role client in src/lib/supabase.ts.
 *
 * Returns null if NEXT_PUBLIC_SUPABASE_URL/ANON_KEY aren't set yet, so pages
 * that only check "is someone logged in" (e.g. the landing page) degrade to
 * a logged-out view instead of crashing before Google OAuth is configured.
 */
export async function getSupabaseServerClient(): Promise<SupabaseClient | null> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;

  const cookieStore = await cookies();

  return createServerClient(url, key, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options);
          }
        } catch {
          // Called from a Server Component render, where cookies can't be
          // set — the proxy's session refresh covers this case instead.
        }
      },
    },
  });
}

/** DAL-style helper: the logged-in user for this request, or null. */
export const getSessionUser = cache(async () => {
  const supabase = await getSupabaseServerClient();
  if (!supabase) return null;
  const { data } = await supabase.auth.getUser();
  return data.user;
});
