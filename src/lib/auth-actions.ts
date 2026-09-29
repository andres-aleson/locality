"use server";

import { signIn, signOut as authSignOut } from "./auth";

export async function signInWithGoogle(): Promise<void> {
  await signIn("google", { redirectTo: "/dashboard" });
}

export async function signOut(): Promise<void> {
  await authSignOut({ redirectTo: "/" });
}
