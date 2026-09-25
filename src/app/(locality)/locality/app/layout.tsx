import { redirect } from "next/navigation";
import { getAccountStatus } from "@/lib/locality/actions";
import { NavBar } from "@/components/locality/NavBar";

// Per-account data — must never be prerendered/cached as static content.
export const dynamic = "force-dynamic";

export default async function LocalityAppLayout({ children }: { children: React.ReactNode }) {
  const { signedIn, accountApproved } = await getAccountStatus();
  if (!signedIn) redirect("/locality/login");
  if (!accountApproved) redirect("/locality/verification");

  return (
    <div className="flex min-h-screen flex-1 flex-col">
      <div className="flex flex-1 flex-col pb-2">{children}</div>
      <NavBar />
    </div>
  );
}
