import "server-only";
import { getSupabase } from "@/lib/supabase";
import { circleIdForSchool, SCHOOLS } from "./seed";
import type {
  BadgeType,
  Child,
  Circle,
  CircleInvite,
  CircleMessage,
  EmergencyContact,
  Message,
  Ride,
  RideOffer,
  RideRequest,
  RideStatus,
  SafetyReport,
  User,
  VerificationSteps,
} from "./types";

// --- row shapes (snake_case, as stored) -----------------------------------

interface ProfileRow {
  id: string;
  name: string;
  avatar_color: string;
  phone: string;
  email: string;
  address: string;
  badges: BadgeType[];
  reliability_score: number;
  completed_rides: number;
  phone_verified: boolean;
  email_verified: boolean;
  address_verified: boolean;
  school_verified: boolean;
  license_verified: boolean;
  parent_verified: boolean;
  license_submission_id: string | null;
  residence_submission_id: string | null;
  tos_accepted_at: string | null;
}

interface ChildRow {
  id: string;
  profile_id: string;
  name: string;
  grade: string;
  school_id: string;
}

interface EmergencyContactRow {
  id: string;
  profile_id: string;
  name: string;
  phone: string;
  relationship: string;
}

interface OfferRow {
  id: string;
  driver_id: string;
  circle_id: string;
  days: string[];
  pickup_time: string;
  seats_available: number;
}

interface RequestRow {
  id: string;
  requester_id: string;
  circle_id: string;
  pickup: string;
  dropoff: string;
  date: string;
  time: string;
  child_count: number;
  notes: string;
}

interface RideRow {
  id: string;
  offer_id: string | null;
  request_id: string | null;
  driver_id: string;
  parent_id: string;
  child_name: string;
  pickup: string;
  dropoff: string;
  date: string;
  time: string;
  status: RideStatus;
  pickup_confirmed: boolean;
  dropoff_confirmed: boolean;
}

interface MessageRow {
  id: string;
  ride_id: string;
  sender_id: string;
  text: string;
  created_at: string;
}

interface CircleMessageRow {
  id: string;
  circle_id: string;
  sender_id: string;
  text: string;
  created_at: string;
}

interface InviteRow {
  circle_id: string;
  email: string;
}

// --- mappers ---------------------------------------------------------------

function toUser(row: ProfileRow, children: Child[]): User {
  return {
    id: row.id,
    name: row.name,
    avatarColor: row.avatar_color,
    phone: row.phone,
    email: row.email,
    address: row.address,
    badges: row.badges,
    reliabilityScore: Number(row.reliability_score),
    completedRides: row.completed_rides,
    children,
  };
}

function toChild(row: ChildRow): Child {
  return { id: row.id, name: row.name, grade: row.grade, schoolId: row.school_id };
}

function toEmergencyContact(row: EmergencyContactRow): EmergencyContact {
  return { id: row.id, name: row.name, phone: row.phone, relationship: row.relationship };
}

function toOffer(row: OfferRow): RideOffer {
  return {
    id: row.id,
    driverId: row.driver_id,
    circleId: row.circle_id,
    school: SCHOOLS.find((s) => circleIdForSchool(s.id) === row.circle_id)?.name ?? "your school",
    days: row.days,
    pickupTime: row.pickup_time,
    seatsAvailable: row.seats_available,
  };
}

function toRequest(row: RequestRow): RideRequest {
  return {
    id: row.id,
    requesterId: row.requester_id,
    pickup: row.pickup,
    dropoff: row.dropoff,
    date: row.date,
    time: row.time,
    childCount: row.child_count,
    notes: row.notes,
  };
}

function toRide(row: RideRow): Ride {
  return {
    id: row.id,
    offerId: row.offer_id ?? undefined,
    requestId: row.request_id ?? undefined,
    driverId: row.driver_id,
    parentId: row.parent_id,
    childName: row.child_name,
    pickup: row.pickup,
    dropoff: row.dropoff,
    date: row.date,
    time: row.time,
    status: row.status,
    pickupConfirmed: row.pickup_confirmed,
    dropoffConfirmed: row.dropoff_confirmed,
  };
}

function toMessage(row: MessageRow): Message {
  return {
    id: row.id,
    rideId: row.ride_id,
    senderId: row.sender_id,
    text: row.text,
    timestamp: row.created_at,
  };
}

function toCircleMessage(row: CircleMessageRow): CircleMessage {
  return {
    id: row.id,
    circleId: row.circle_id,
    senderId: row.sender_id,
    text: row.text,
    timestamp: row.created_at,
  };
}

export function verificationFromProfile(row: ProfileRow): VerificationSteps {
  return {
    phone: row.phone_verified,
    email: row.email_verified,
    address: row.address_verified,
    school: row.school_verified,
    license: row.license_verified,
    parent: row.parent_verified,
  };
}

// Document-based review (Drive upload + OCR + admin approval) is disabled for
// now pending legal review of how license/residence documents are handled —
// license and address are self-attested, same as the parent-confirmation
// step. The underlying Drive/OCR/submissions pipeline is left intact (see
// submissions.ts, googleDrive.ts, documentCheck.ts) so re-enabling it later
// is a small change, not a rebuild.
/** True once every verification step is self-attested AND the ToS/Privacy Policy is accepted. */
export function isAccountApproved(row: ProfileRow): boolean {
  const isVerified = Object.values(verificationFromProfile(row)).every(Boolean);
  return isVerified && Boolean(row.tos_accepted_at);
}

// --- profiles ----------------------------------------------------------

export async function getProfile(id: string): Promise<User | null> {
  const { data: row, error } = await getSupabase()
    .from("locality_profiles")
    .select()
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  if (!row) return null;

  const children = await getChildrenForProfile(id);
  return toUser(row as ProfileRow, children);
}

export async function getProfileRow(id: string): Promise<ProfileRow | null> {
  const { data, error } = await getSupabase()
    .from("locality_profiles")
    .select()
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return data as ProfileRow | null;
}

/** Creates a bare profile row on first Locality login, pre-filled from the Google session. */
export async function getOrCreateProfile(
  id: string,
  defaults: { name?: string; email?: string }
): Promise<ProfileRow> {
  const existing = await getProfileRow(id);
  if (existing) return existing;

  const { data, error } = await getSupabase()
    .from("locality_profiles")
    .insert({ id, name: defaults.name ?? "", email: defaults.email ?? "" })
    .select()
    .single();
  if (error) throw error;
  return data as ProfileRow;
}

export async function getChildrenForProfile(profileId: string): Promise<Child[]> {
  const { data, error } = await getSupabase()
    .from("locality_children")
    .select()
    .eq("profile_id", profileId);
  if (error) throw error;
  return (data as ChildRow[]).map(toChild);
}

export async function getUsersByIds(ids: string[]): Promise<Record<string, User>> {
  if (ids.length === 0) return {};
  const unique = Array.from(new Set(ids));

  const [{ data: profiles, error: profilesError }, { data: children, error: childrenError }] =
    await Promise.all([
      getSupabase().from("locality_profiles").select().in("id", unique),
      getSupabase().from("locality_children").select().in("profile_id", unique),
    ]);
  if (profilesError) throw profilesError;
  if (childrenError) throw childrenError;

  const childrenByProfile = new Map<string, Child[]>();
  for (const row of children as ChildRow[]) {
    const list = childrenByProfile.get(row.profile_id) ?? [];
    list.push(toChild(row));
    childrenByProfile.set(row.profile_id, list);
  }

  const result: Record<string, User> = {};
  for (const row of profiles as ProfileRow[]) {
    result[row.id] = toUser(row, childrenByProfile.get(row.id) ?? []);
  }
  return result;
}

export async function updateProfileFields(
  id: string,
  fields: Partial<{ name: string; phone: string; email: string; address: string }>
): Promise<void> {
  const { error } = await getSupabase().from("locality_profiles").update(fields).eq("id", id);
  if (error) throw error;
}

export async function setVerificationStep(
  id: string,
  step: keyof VerificationSteps,
  fields: { phone?: string; email?: string; address?: string }
): Promise<void> {
  const columnByStep: Record<keyof VerificationSteps, string> = {
    phone: "phone_verified",
    email: "email_verified",
    address: "address_verified",
    school: "school_verified",
    license: "license_verified",
    parent: "parent_verified",
  };

  const update: Record<string, unknown> = { [columnByStep[step]]: true };
  if (step === "phone" && fields.phone) update.phone = fields.phone;
  if (step === "email" && fields.email) update.email = fields.email;
  if (step === "address" && fields.address) update.address = fields.address;

  const { error } = await getSupabase().from("locality_profiles").update(update).eq("id", id);
  if (error) throw error;
}

export async function setTosAccepted(id: string): Promise<void> {
  const { error } = await getSupabase()
    .from("locality_profiles")
    .update({ tos_accepted_at: new Date().toISOString() })
    .eq("id", id);
  if (error) throw error;
}

export async function addChild(
  profileId: string,
  input: { name: string; grade: string; schoolId: string }
): Promise<void> {
  const { error } = await getSupabase()
    .from("locality_children")
    .insert({ profile_id: profileId, name: input.name, grade: input.grade, school_id: input.schoolId });
  if (error) throw error;
}

export async function getEmergencyContacts(profileId: string): Promise<EmergencyContact[]> {
  const { data, error } = await getSupabase()
    .from("locality_emergency_contacts")
    .select()
    .eq("profile_id", profileId)
    .order("created_at", { ascending: true });
  if (error) throw error;
  return (data as EmergencyContactRow[]).map(toEmergencyContact);
}

export async function addEmergencyContact(
  profileId: string,
  input: { name: string; phone: string; relationship: string }
): Promise<EmergencyContact> {
  const { data, error } = await getSupabase()
    .from("locality_emergency_contacts")
    .insert({ profile_id: profileId, name: input.name, phone: input.phone, relationship: input.relationship })
    .select()
    .single();
  if (error) throw error;
  return toEmergencyContact(data as EmergencyContactRow);
}

export async function deleteEmergencyContact(profileId: string, contactId: string): Promise<void> {
  const { error } = await getSupabase()
    .from("locality_emergency_contacts")
    .delete()
    .eq("id", contactId)
    .eq("profile_id", profileId);
  if (error) throw error;
}

export async function recordDocumentSubmission(
  profileId: string,
  kind: "license" | "residence",
  submissionId: string
): Promise<void> {
  const column = kind === "license" ? "license_submission_id" : "residence_submission_id";
  const { error } = await getSupabase()
    .from("locality_profiles")
    .update({ [column]: submissionId })
    .eq("id", profileId);
  if (error) throw error;
}

export async function addBadges(profileId: string, badges: BadgeType[]): Promise<void> {
  const row = await getProfileRow(profileId);
  if (!row) return;
  const missing = badges.filter((b) => !row.badges.includes(b));
  if (missing.length === 0) return;

  const { error } = await getSupabase()
    .from("locality_profiles")
    .update({ badges: [...row.badges, ...missing] })
    .eq("id", profileId);
  if (error) throw error;
}

// --- circles -------------------------------------------------------------

export async function getCircles(): Promise<Circle[]> {
  const { data, error } = await getSupabase().from("locality_circle_members").select();
  if (error) throw error;

  const membersByCircle = new Map<string, string[]>();
  for (const row of data as { circle_id: string; profile_id: string }[]) {
    const list = membersByCircle.get(row.circle_id) ?? [];
    list.push(row.profile_id);
    membersByCircle.set(row.circle_id, list);
  }

  return SCHOOLS.map((school) => {
    const id = circleIdForSchool(school.id);
    return {
      id,
      name: `${school.name} Carpool Circle`,
      schoolId: school.id,
      memberIds: membersByCircle.get(id) ?? [],
    };
  });
}

export async function joinCircle(profileId: string, circleId: string): Promise<void> {
  const { error } = await getSupabase()
    .from("locality_circle_members")
    .upsert({ circle_id: circleId, profile_id: profileId }, { onConflict: "circle_id,profile_id" });
  if (error) throw error;
}

export async function leaveCircle(profileId: string, circleId: string): Promise<void> {
  const { error } = await getSupabase()
    .from("locality_circle_members")
    .delete()
    .eq("circle_id", circleId)
    .eq("profile_id", profileId);
  if (error) throw error;
}

export async function inviteFamily(circleId: string, email: string, invitedBy: string): Promise<void> {
  const { error } = await getSupabase()
    .from("locality_invites")
    .insert({ circle_id: circleId, email, invited_by: invitedBy });
  if (error) throw error;
}

export async function getInvitesForCircle(circleId: string): Promise<CircleInvite[]> {
  const { data, error } = await getSupabase()
    .from("locality_invites")
    .select()
    .eq("circle_id", circleId);
  if (error) throw error;
  return (data as InviteRow[]).map((r) => ({ circleId: r.circle_id, email: r.email }));
}

export async function isCircleMember(profileId: string, circleId: string): Promise<boolean> {
  const { data, error } = await getSupabase()
    .from("locality_circle_members")
    .select("circle_id")
    .eq("circle_id", circleId)
    .eq("profile_id", profileId)
    .maybeSingle();
  if (error) throw error;
  return Boolean(data);
}

// --- offers / requests / matching -----------------------------------------

export async function createOffer(input: {
  driverId: string;
  circleId: string;
  days: string[];
  pickupTime: string;
  seatsAvailable: number;
}): Promise<RideOffer> {
  const { data, error } = await getSupabase()
    .from("locality_ride_offers")
    .insert({
      driver_id: input.driverId,
      circle_id: input.circleId,
      days: input.days,
      pickup_time: input.pickupTime,
      seats_available: input.seatsAvailable,
    })
    .select()
    .single();
  if (error) throw error;
  return toOffer(data as OfferRow);
}

export async function createRequest(input: {
  requesterId: string;
  circleId: string;
  pickup: string;
  dropoff: string;
  date: string;
  time: string;
  childCount: number;
  notes: string;
}): Promise<RideRequest> {
  const { data, error } = await getSupabase()
    .from("locality_ride_requests")
    .insert({
      requester_id: input.requesterId,
      circle_id: input.circleId,
      pickup: input.pickup,
      dropoff: input.dropoff,
      date: input.date,
      time: input.time,
      child_count: input.childCount,
      notes: input.notes,
    })
    .select()
    .single();
  if (error) throw error;
  return toRequest(data as RequestRow);
}

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function weekdayOf(dateStr: string): string | null {
  if (!dateStr) return null;
  const d = new Date(`${dateStr}T00:00:00`);
  if (Number.isNaN(d.getTime())) return null;
  return WEEKDAYS[d.getDay()];
}

export interface CandidateMatch {
  offer: RideOffer;
  driver: User;
}

export async function findMatches(circleId: string, date: string): Promise<CandidateMatch[]> {
  const { data, error } = await getSupabase()
    .from("locality_ride_offers")
    .select()
    .eq("circle_id", circleId)
    .gt("seats_available", 0);
  if (error) throw error;

  const weekday = weekdayOf(date);
  const offers = (data as OfferRow[])
    .map(toOffer)
    .filter((offer) => !weekday || offer.days.includes(weekday));

  const drivers = await getUsersByIds(offers.map((o) => o.driverId));

  return offers
    .map((offer) => ({ offer, driver: drivers[offer.driverId] }))
    .filter((m): m is CandidateMatch => Boolean(m.driver))
    .sort((a, b) => b.driver.reliabilityScore - a.driver.reliabilityScore);
}

export async function confirmMatch(requestId: string, offerId: string, requesterId: string): Promise<string> {
  const [{ data: request, error: requestError }, { data: offer, error: offerError }] = await Promise.all([
    getSupabase().from("locality_ride_requests").select().eq("id", requestId).maybeSingle(),
    getSupabase().from("locality_ride_offers").select().eq("id", offerId).maybeSingle(),
  ]);
  if (requestError) throw requestError;
  if (offerError) throw offerError;
  if (!request || !offer) throw new Error("Request or offer not found.");

  const requestRow = request as RequestRow;
  const offerRow = offer as OfferRow;

  const requesterChildren = await getChildrenForProfile(requesterId);
  const childName = requesterChildren[0]?.name ?? "your child";

  const { data: ride, error: rideError } = await getSupabase()
    .from("locality_rides")
    .insert({
      offer_id: offerRow.id,
      request_id: requestRow.id,
      driver_id: offerRow.driver_id,
      parent_id: requesterId,
      child_name: childName,
      pickup: requestRow.pickup,
      dropoff: requestRow.dropoff,
      date: requestRow.date,
      time: offerRow.pickup_time,
      status: "pending",
    })
    .select()
    .single();
  if (rideError) throw rideError;

  const rideRow = ride as RideRow;
  const driver = await getProfile(offerRow.driver_id);
  const driverName = driver?.name ?? "there";

  await insertMessage(
    rideRow.id,
    offerRow.driver_id,
    offerRow.driver_id,
    requesterId,
    `Hi! This is ${driverName} — happy to drive ${childName} on ${requestRow.date || "the day you need"}. See you at pickup!`
  );

  return rideRow.id;
}

// --- rides -----------------------------------------------------------------

export async function getRidesForProfile(profileId: string): Promise<Ride[]> {
  const { data, error } = await getSupabase()
    .from("locality_rides")
    .select()
    .or(`driver_id.eq.${profileId},parent_id.eq.${profileId}`)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data as RideRow[]).map(toRide);
}

export async function getRide(id: string): Promise<Ride | null> {
  const { data, error } = await getSupabase().from("locality_rides").select().eq("id", id).maybeSingle();
  if (error) throw error;
  return data ? toRide(data as RideRow) : null;
}

export async function confirmRide(rideId: string): Promise<void> {
  const ride = await getRide(rideId);
  if (!ride) return;

  if (ride.offerId) {
    const { data: offer } = await getSupabase()
      .from("locality_ride_offers")
      .select("seats_available")
      .eq("id", ride.offerId)
      .maybeSingle();
    const seats = (offer as { seats_available: number } | null)?.seats_available ?? 0;
    await getSupabase()
      .from("locality_ride_offers")
      .update({ seats_available: Math.max(0, seats - 1) })
      .eq("id", ride.offerId);
  }

  const { error } = await getSupabase().from("locality_rides").update({ status: "confirmed" }).eq("id", rideId);
  if (error) throw error;
}

async function bumpReliability(profileId: string, isDriver: boolean): Promise<void> {
  const row = await getProfileRow(profileId);
  if (!row) return;

  const completedRides = row.completed_rides + 1;
  const reliabilityScore = isDriver
    ? Math.min(5, Number((Number(row.reliability_score) + 0.02).toFixed(2)))
    : Number(row.reliability_score);
  const badges = row.badges.includes("communityTrusted")
    ? row.badges
    : [...row.badges, "communityTrusted"];

  const { error } = await getSupabase()
    .from("locality_profiles")
    .update({ completed_rides: completedRides, reliability_score: reliabilityScore, badges })
    .eq("id", profileId);
  if (error) throw error;
}

async function completeIfBothConfirmed(rideId: string): Promise<void> {
  const ride = await getRide(rideId);
  if (!ride || !ride.pickupConfirmed || !ride.dropoffConfirmed || ride.status === "completed") return;

  const { error } = await getSupabase().from("locality_rides").update({ status: "completed" }).eq("id", rideId);
  if (error) throw error;

  await Promise.all([bumpReliability(ride.driverId, true), bumpReliability(ride.parentId, false)]);
}

export async function confirmPickup(rideId: string): Promise<void> {
  const { error } = await getSupabase().from("locality_rides").update({ pickup_confirmed: true }).eq("id", rideId);
  if (error) throw error;
  await completeIfBothConfirmed(rideId);
}

export async function confirmDropoff(rideId: string): Promise<void> {
  const { error } = await getSupabase().from("locality_rides").update({ dropoff_confirmed: true }).eq("id", rideId);
  if (error) throw error;
  await completeIfBothConfirmed(rideId);
}

// --- messages ----------------------------------------------------------

async function insertMessage(
  rideId: string,
  senderId: string,
  driverId: string,
  parentId: string,
  text: string
): Promise<Message> {
  const { data, error } = await getSupabase()
    .from("locality_messages")
    .insert({ ride_id: rideId, sender_id: senderId, driver_id: driverId, parent_id: parentId, text })
    .select()
    .single();
  if (error) throw error;
  return toMessage(data as MessageRow);
}

export async function getMessagesForRide(rideId: string): Promise<Message[]> {
  const { data, error } = await getSupabase()
    .from("locality_messages")
    .select()
    .eq("ride_id", rideId)
    .order("created_at", { ascending: true });
  if (error) throw error;
  return (data as MessageRow[]).map(toMessage);
}

export async function sendMessage(rideId: string, senderId: string, text: string): Promise<Message> {
  const ride = await getRide(rideId);
  if (!ride) throw new Error("Ride not found.");
  return insertMessage(rideId, senderId, ride.driverId, ride.parentId, text);
}

// --- circle group chat -------------------------------------------------

export async function getCircleMessages(circleId: string): Promise<CircleMessage[]> {
  const { data, error } = await getSupabase()
    .from("locality_circle_messages")
    .select()
    .eq("circle_id", circleId)
    .order("created_at", { ascending: true });
  if (error) throw error;
  return (data as CircleMessageRow[]).map(toCircleMessage);
}

export async function sendCircleMessage(
  circleId: string,
  senderId: string,
  text: string
): Promise<CircleMessage> {
  const { data, error } = await getSupabase()
    .from("locality_circle_messages")
    .insert({ circle_id: circleId, sender_id: senderId, text })
    .select()
    .single();
  if (error) throw error;
  return toCircleMessage(data as CircleMessageRow);
}

/** Latest message per circle, for the chat-inbox list — null for circles with no messages yet. */
export async function getLatestMessagePerCircle(
  circleIds: string[]
): Promise<Record<string, CircleMessage | null>> {
  const result: Record<string, CircleMessage | null> = Object.fromEntries(circleIds.map((id) => [id, null]));
  if (circleIds.length === 0) return result;

  const { data, error } = await getSupabase()
    .from("locality_circle_messages")
    .select()
    .in("circle_id", circleIds)
    .order("created_at", { ascending: false });
  if (error) throw error;

  for (const row of data as CircleMessageRow[]) {
    if (!result[row.circle_id]) result[row.circle_id] = toCircleMessage(row);
  }
  return result;
}

// --- safety ----------------------------------------------------------------

export async function reportIssue(
  reporterId: string,
  rideId: string | undefined,
  description: string
): Promise<SafetyReport> {
  const { data, error } = await getSupabase()
    .from("locality_safety_reports")
    .insert({ reporter_id: reporterId, ride_id: rideId ?? null, description })
    .select()
    .single();
  if (error) throw error;
  const row = data as { id: string; ride_id: string | null; description: string; created_at: string };
  return { id: row.id, rideId: row.ride_id ?? undefined, description: row.description, timestamp: row.created_at };
}
