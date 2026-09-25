"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getSupabaseServerClient } from "./supabase-server";

export async function signInWithGoogle(): Promise<void> {
  const supabase = await getSupabaseServerClient();
  if (!supabase) {
    throw new Error(
      "Google sign-in isn't configured yet — add NEXT_PUBLIC_SUPABASE_URL and " +
        "NEXT_PUBLIC_SUPABASE_ANON_KEY to .env.local and set up the Google provider in Supabase."
    );
  }

  const origin = (await headers()).get("origin");

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo: `${origin}/auth/callback` },
  });

  if (error || !data.url) {
    throw new Error(error?.message ?? "Failed to start Google sign-in");
  }

  redirect(data.url);
}

export async function signOut(): Promise<void> {
  const supabase = await getSupabaseServerClient();
  if (supabase) await supabase.auth.signOut();
  redirect("/");
}
