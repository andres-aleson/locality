import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let client: SupabaseClient | null = null;

/**
 * Server-only Supabase client using the service role key. There is no
 * end-user auth in v1 (single-tenant demo), so every business is reachable
 * by anyone who has its URL — do not import this from client components.
 */
export function getSupabase(): SupabaseClient {
  if (client) return client;

  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error(
      "Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY. Copy .env.local.example to .env.local, " +
        "create a Supabase project, run supabase/schema.sql in its SQL editor, and fill in the values."
    );
  }

  client = createClient(url, key, { auth: { persistSession: false } });
  return client;
}
