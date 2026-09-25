import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Anon-key Supabase client for use in Client Components — stays in sync with
 * the session cookies the server-side client (supabase-server.ts) sets, so
 * it carries the caller's identity for RLS-scoped reads (currently only
 * Locality's realtime message subscription). Never use this for writes that
 * matter — those go through server actions using the service-role client.
 */
export function getSupabaseBrowserClient(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;

  return createBrowserClient(url, key);
}
