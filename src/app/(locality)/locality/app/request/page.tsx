import { redirect } from "next/navigation";
import { getAccountStatus } from "@/lib/locality/actions";
import { getCircles } from "@/lib/locality/db";
import { RequestForm } from "./RequestForm";

export const dynamic = "force-dynamic";

export default async function RequestRidePage() {
  const { profile: currentUser } = await getAccountStatus();
  if (!currentUser) redirect("/locality/login");

  const circles = await getCircles();
  const myCircles = circles.filter((c) => c.memberIds.includes(currentUser.id));

  return <RequestForm myCircles={myCircles} />;
}
