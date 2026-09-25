"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getSessionUser, getSupabaseServerClient } from "@/lib/supabase-server";
import * as db from "./db";
import { getSubmission } from "./submissions";
import type { SubmissionStatus, User, VerificationSteps } from "./types";

export async function signInWithGoogleForLocality(): Promise<void> {
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
    options: { redirectTo: `${origin}/locality/auth/callback` },
  });

  if (error || !data.url) {
    throw new Error(error?.message ?? "Failed to start Google sign-in");
  }

  redirect(data.url);
}

export async function signOutOfLocality(): Promise<void> {
  const supabase = await getSupabaseServerClient();
  if (supabase) await supabase.auth.signOut();
  redirect("/locality");
}

async function requireLocalityProfile() {
  const user = await getSessionUser();
  if (!user) throw new Error("Not signed in");

  await db.getOrCreateProfile(user.id, {
    name: (user.user_metadata?.full_name as string | undefined) ?? "",
    email: user.email ?? "",
  });

  return user.id;
}

export async function completeVerificationStep(
  step: keyof VerificationSteps,
  fields?: {
    phone?: string;
    email?: string;
    address?: string;
    childName?: string;
    childGrade?: string;
    schoolId?: string;
  }
): Promise<void> {
  const profileId = await requireLocalityProfile();

  await db.setVerificationStep(profileId, step, fields ?? {});

  if (step === "school" && fields?.childName && fields?.schoolId) {
    await db.addChild(profileId, {
      name: fields.childName,
      grade: fields.childGrade || "",
      schoolId: fields.schoolId,
    });
  }

  revalidatePath("/locality/verification");
}

export async function recordDocumentSubmission(
  kind: "license" | "residence",
  submissionId: string
): Promise<void> {
  const profileId = await requireLocalityProfile();
  await db.recordDocumentSubmission(profileId, kind, submissionId);
  revalidatePath("/locality/verification");
}

export async function getMyDocumentStatuses(): Promise<{
  license: SubmissionStatus | null;
  residence: SubmissionStatus | null;
}> {
  const profileId = await requireLocalityProfile();
  const row = await db.getProfileRow(profileId);
  if (!row) return { license: null, residence: null };

  const [license, residence] = await Promise.all([
    row.license_submission_id ? getSubmission(row.license_submission_id) : null,
    row.residence_submission_id ? getSubmission(row.residence_submission_id) : null,
  ]);

  return { license: license?.status ?? null, residence: residence?.status ?? null };
}

/** Grants the three verification badges once the account is actually approved — not just filled in. */
export async function maybeGrantVerificationBadges(profileId: string): Promise<void> {
  const row = await db.getProfileRow(profileId);
  if (!row) return;

  if (!db.isAccountApproved(row)) return;

  await db.addBadges(profileId, ["identityVerified", "parentVerified", "driverVerified"]);
}

/** For pages that need to know "is anyone signed in, and are they fully approved". */
export async function getAccountStatus(): Promise<{
  signedIn: boolean;
  accountApproved: boolean;
  profile: User | null;
}> {
  const user = await getSessionUser();
  if (!user) return { signedIn: false, accountApproved: false, profile: null };

  const row = await db.getOrCreateProfile(user.id, {
    name: (user.user_metadata?.full_name as string | undefined) ?? "",
    email: user.email ?? "",
  });
  const approved = db.isAccountApproved(row);
  const profile = await db.getProfile(user.id);

  await maybeGrantVerificationBadges(user.id);

  return { signedIn: true, accountApproved: approved, profile };
}

/** Everything the verification wizard needs on load, in one call. */
export async function getVerificationPageData(): Promise<{
  profile: User;
  verification: VerificationSteps;
  tosAccepted: boolean;
  accountApproved: boolean;
}> {
  const profileId = await requireLocalityProfile();
  const row = await db.getProfileRow(profileId);
  if (!row) throw new Error("Profile not found");

  const profile = await db.getProfile(profileId);
  const accountApproved = db.isAccountApproved(row);

  if (accountApproved) await maybeGrantVerificationBadges(profileId);

  return {
    profile: profile!,
    verification: db.verificationFromProfile(row),
    tosAccepted: Boolean(row.tos_accepted_at),
    accountApproved,
  };
}

export async function acceptTermsOfService(): Promise<void> {
  const profileId = await requireLocalityProfile();
  await db.setTosAccepted(profileId);
  revalidatePath("/locality/verification");
}

export async function updateProfile(fields: {
  name?: string;
  phone?: string;
  email?: string;
  address?: string;
}): Promise<void> {
  const profileId = await requireLocalityProfile();
  await db.updateProfileFields(profileId, fields);
  revalidatePath("/locality/app/profile");
  revalidatePath("/locality/verification");
}

export async function addEmergencyContact(fields: {
  name: string;
  phone: string;
  relationship: string;
}): Promise<void> {
  const profileId = await requireLocalityProfile();
  if (!fields.name.trim() || !fields.phone.trim()) return;
  await db.addEmergencyContact(profileId, {
    name: fields.name.trim(),
    phone: fields.phone.trim(),
    relationship: fields.relationship.trim(),
  });
  revalidatePath("/locality/app/profile");
}

export async function deleteEmergencyContact(contactId: string): Promise<void> {
  const profileId = await requireLocalityProfile();
  await db.deleteEmergencyContact(profileId, contactId);
  revalidatePath("/locality/app/profile");
}

export async function getMyEmergencyContacts(): Promise<import("./types").EmergencyContact[]> {
  const profileId = await requireLocalityProfile();
  return db.getEmergencyContacts(profileId);
}

export async function joinCircle(circleId: string): Promise<void> {
  const profileId = await requireLocalityProfile();
  await db.joinCircle(profileId, circleId);
  revalidatePath("/locality/app/circle");
}

export async function leaveCircle(circleId: string): Promise<void> {
  const profileId = await requireLocalityProfile();
  await db.leaveCircle(profileId, circleId);
  revalidatePath("/locality/app/circle");
  redirect("/locality/app/circle");
}

export async function inviteFamily(circleId: string, email: string): Promise<void> {
  const profileId = await requireLocalityProfile();
  await db.inviteFamily(circleId, email, profileId);
  revalidatePath(`/locality/app/circle/${circleId}`);
}

export async function createOffer(input: {
  circleId: string;
  days: string[];
  pickupTime: string;
  seatsAvailable: number;
}): Promise<void> {
  const profileId = await requireLocalityProfile();
  await db.createOffer({ driverId: profileId, ...input });
  revalidatePath("/locality/app");
}

export async function createRequest(input: {
  circleId: string;
  pickup: string;
  dropoff: string;
  date: string;
  time: string;
  childCount: number;
  notes: string;
}): Promise<{ requestId: string; matches: db.CandidateMatch[] }> {
  const profileId = await requireLocalityProfile();
  const request = await db.createRequest({ requesterId: profileId, ...input });
  const matches = await db.findMatches(input.circleId, input.date);
  return { requestId: request.id, matches };
}

export async function confirmMatch(requestId: string, offerId: string): Promise<string> {
  const profileId = await requireLocalityProfile();
  const rideId = await db.confirmMatch(requestId, offerId, profileId);
  revalidatePath("/locality/app");
  return rideId;
}

export async function confirmRide(rideId: string): Promise<void> {
  await requireLocalityProfile();
  await db.confirmRide(rideId);
  revalidatePath(`/locality/app/ride/${rideId}`);
  revalidatePath("/locality/app");
}

export async function confirmPickup(rideId: string): Promise<void> {
  await requireLocalityProfile();
  await db.confirmPickup(rideId);
  revalidatePath(`/locality/app/ride/${rideId}`);
}

export async function confirmDropoff(rideId: string): Promise<void> {
  await requireLocalityProfile();
  await db.confirmDropoff(rideId);
  revalidatePath(`/locality/app/ride/${rideId}`);
}

export async function sendMessage(rideId: string, text: string): Promise<import("./types").Message | null> {
  const profileId = await requireLocalityProfile();
  if (!text.trim()) return null;
  const message = await db.sendMessage(rideId, profileId, text.trim());
  revalidatePath(`/locality/app/ride/${rideId}/messages`);
  return message;
}

export async function sendCircleMessage(
  circleId: string,
  text: string
): Promise<import("./types").CircleMessage | null> {
  const profileId = await requireLocalityProfile();
  if (!text.trim()) return null;
  if (!(await db.isCircleMember(profileId, circleId))) {
    throw new Error("You need to join this community before you can post in its chat.");
  }
  const message = await db.sendCircleMessage(circleId, profileId, text.trim());
  revalidatePath(`/locality/app/circle/${circleId}/chat`);
  return message;
}

export async function reportIssue(rideId: string | undefined, description: string): Promise<void> {
  const profileId = await requireLocalityProfile();
  if (!description.trim()) return;
  await db.reportIssue(profileId, rideId, description.trim());
  revalidatePath("/locality/app/safety");
}
