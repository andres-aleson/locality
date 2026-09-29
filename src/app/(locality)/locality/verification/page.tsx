import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/session";
import { getVerificationPageData } from "@/lib/locality/actions";
import { VerificationWizard } from "./VerificationWizard";

export const dynamic = "force-dynamic";

export default async function VerificationPage() {
  const user = await getSessionUser();
  if (!user) redirect("/locality/login");

  const { profile, verification, tosAccepted, accountApproved } = await getVerificationPageData();

  return (
    <VerificationWizard
      initialProfile={profile}
      initialVerification={verification}
      initialTosAccepted={tosAccepted}
      initialAccountApproved={accountApproved}
    />
  );
}
