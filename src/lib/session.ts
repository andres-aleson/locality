import "server-only";
import { cache } from "react";
import { auth } from "./auth";

export interface SessionUser {
  id: string;
  email: string;
  name: string;
}

/** DAL-style helper: the logged-in user for this request, or null. */
export const getSessionUser = cache(async (): Promise<SessionUser | null> => {
  const session = await auth();
  const id = session?.user?.id;
  if (!id) return null;
  return { id, email: session.user?.email ?? "", name: session.user?.name ?? "" };
});
