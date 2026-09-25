import { redirect } from "next/navigation";
import { getAccountStatus } from "@/lib/locality/actions";
import { getCircles } from "@/lib/locality/db";
import { OfferForm } from "./OfferForm";

export const dynamic = "force-dynamic";

export default async function OfferRidePage() {
  const { profile: currentUser } = await getAccountStatus();
  if (!currentUser) redirect("/locality/login");

  const circles = await getCircles();
  const myCircles = circles.filter((c) => c.memberIds.includes(currentUser.id));

  return <OfferForm myCircles={myCircles} />;
}
