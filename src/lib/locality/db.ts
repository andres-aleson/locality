import "server-only";
import { and, asc, desc, eq, gt, inArray, or, sql } from "drizzle-orm";
import { getDb } from "@/db";
import {
  localityChildren,
  localityCircleMembers,
  localityCircleMessages,
  localityEmergencyContacts,
  localityInvites,
  localityMessages,
  localityProfiles,
  localityRideOffers,
  localityRideRequests,
  localityRides,
  localitySafetyReports,
} from "@/db/schema";
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
  reliability_score: number | string; // Postgres numeric comes back as a string
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
  const row = await getProfileRow(id);
  if (!row) return null;

  const children = await getChildrenForProfile(id);
  return toUser(row, children);
}

export async function getProfileRow(id: string): Promise<ProfileRow | null> {
  const [row] = await getDb().select().from(localityProfiles).where(eq(localityProfiles.id, id)).limit(1);
  return (row as ProfileRow | undefined) ?? null;
}

/** Creates a bare profile row on first Locality login, pre-filled from the Google session. */
export async function getOrCreateProfile(
  id: string,
  defaults: { name?: string; email?: string }
): Promise<ProfileRow> {
  const existing = await getProfileRow(id);
  if (existing) return existing;

  await getDb()
    .insert(localityProfiles)
    .values({ id, name: defaults.name ?? "", email: defaults.email ?? "" })
    .onConflictDoNothing();
  return (await getProfileRow(id))!;
}

export async function getChildrenForProfile(profileId: string): Promise<Child[]> {
  const rows = await getDb().select().from(localityChildren).where(eq(localityChildren.profile_id, profileId));
  return rows.map(toChild);
}

export async function getUsersByIds(ids: string[]): Promise<Record<string, User>> {
  if (ids.length === 0) return {};
  const unique = Array.from(new Set(ids));

  const [profiles, children] = await Promise.all([
    getDb().select().from(localityProfiles).where(inArray(localityProfiles.id, unique)),
    getDb().select().from(localityChildren).where(inArray(localityChildren.profile_id, unique)),
  ]);

  const childrenByProfile = new Map<string, Child[]>();
  for (const row of children) {
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
  if (Object.keys(fields).length === 0) return;
  await getDb().update(localityProfiles).set(fields).where(eq(localityProfiles.id, id));
}

export async function setVerificationStep(
  id: string,
  step: keyof VerificationSteps,
  fields: { phone?: string; email?: string; address?: string }
): Promise<void> {
  const columnByStep = {
    phone: "phone_verified",
    email: "email_verified",
    address: "address_verified",
    school: "school_verified",
    license: "license_verified",
    parent: "parent_verified",
  } as const satisfies Record<keyof VerificationSteps, keyof typeof localityProfiles.$inferInsert>;

  const update: Partial<typeof localityProfiles.$inferInsert> = { [columnByStep[step]]: true };
  if (step === "phone" && fields.phone) update.phone = fields.phone;
  if (step === "email" && fields.email) update.email = fields.email;
  if (step === "address" && fields.address) update.address = fields.address;

  await getDb().update(localityProfiles).set(update).where(eq(localityProfiles.id, id));
}

export async function setTosAccepted(id: string): Promise<void> {
  await getDb()
    .update(localityProfiles)
    .set({ tos_accepted_at: new Date().toISOString() })
    .where(eq(localityProfiles.id, id));
}

export async function addChild(
  profileId: string,
  input: { name: string; grade: string; schoolId: string }
): Promise<void> {
  await getDb()
    .insert(localityChildren)
    .values({ profile_id: profileId, name: input.name, grade: input.grade, school_id: input.schoolId });
}

export async function getEmergencyContacts(profileId: string): Promise<EmergencyContact[]> {
  const rows = await getDb()
    .select()
    .from(localityEmergencyContacts)
    .where(eq(localityEmergencyContacts.profile_id, profileId))
    .orderBy(asc(localityEmergencyContacts.created_at));
  return rows.map(toEmergencyContact);
}

export async function addEmergencyContact(
  profileId: string,
  input: { name: string; phone: string; relationship: string }
): Promise<EmergencyContact> {
  const [row] = await getDb()
    .insert(localityEmergencyContacts)
    .values({ profile_id: profileId, name: input.name, phone: input.phone, relationship: input.relationship })
    .returning();
  return toEmergencyContact(row);
}

export async function deleteEmergencyContact(profileId: string, contactId: string): Promise<void> {
  await getDb()
    .delete(localityEmergencyContacts)
    .where(and(eq(localityEmergencyContacts.id, contactId), eq(localityEmergencyContacts.profile_id, profileId)));
}

export async function recordDocumentSubmission(
  profileId: string,
  kind: "license" | "residence",
  submissionId: string
): Promise<void> {
  await getDb()
    .update(localityProfiles)
    .set(kind === "license" ? { license_submission_id: submissionId } : { residence_submission_id: submissionId })
    .where(eq(localityProfiles.id, profileId));
}

export async function addBadges(profileId: string, badges: BadgeType[]): Promise<void> {
  const row = await getProfileRow(profileId);
  if (!row) return;
  const missing = badges.filter((b) => !row.badges.includes(b));
  if (missing.length === 0) return;

  await getDb()
    .update(localityProfiles)
    .set({ badges: [...row.badges, ...missing] })
    .where(eq(localityProfiles.id, profileId));
}

// --- circles -------------------------------------------------------------

export async function getCircles(): Promise<Circle[]> {
  const rows = await getDb().select().from(localityCircleMembers);

  const membersByCircle = new Map<string, string[]>();
  for (const row of rows) {
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
  await getDb()
    .insert(localityCircleMembers)
    .values({ circle_id: circleId, profile_id: profileId })
    .onConflictDoNothing();
}

export async function leaveCircle(profileId: string, circleId: string): Promise<void> {
  await getDb()
    .delete(localityCircleMembers)
    .where(and(eq(localityCircleMembers.circle_id, circleId), eq(localityCircleMembers.profile_id, profileId)));
}

export async function inviteFamily(circleId: string, email: string, invitedBy: string): Promise<void> {
  await getDb().insert(localityInvites).values({ circle_id: circleId, email, invited_by: invitedBy });
}

export async function getInvitesForCircle(circleId: string): Promise<CircleInvite[]> {
  const rows: InviteRow[] = await getDb()
    .select({ circle_id: localityInvites.circle_id, email: localityInvites.email })
    .from(localityInvites)
    .where(eq(localityInvites.circle_id, circleId));
  return rows.map((r) => ({ circleId: r.circle_id, email: r.email }));
}

export async function isCircleMember(profileId: string, circleId: string): Promise<boolean> {
  const [row] = await getDb()
    .select({ circle_id: localityCircleMembers.circle_id })
    .from(localityCircleMembers)
    .where(and(eq(localityCircleMembers.circle_id, circleId), eq(localityCircleMembers.profile_id, profileId)))
    .limit(1);
  return Boolean(row);
}

// --- offers / requests / matching -----------------------------------------

export async function createOffer(input: {
  driverId: string;
  circleId: string;
  days: string[];
  pickupTime: string;
  seatsAvailable: number;
}): Promise<RideOffer> {
  const [row] = await getDb()
    .insert(localityRideOffers)
    .values({
      driver_id: input.driverId,
      circle_id: input.circleId,
      days: input.days,
      pickup_time: input.pickupTime,
      seats_available: input.seatsAvailable,
    })
    .returning();
  return toOffer(row);
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
  const [row] = await getDb()
    .insert(localityRideRequests)
    .values({
      requester_id: input.requesterId,
      circle_id: input.circleId,
      pickup: input.pickup,
      dropoff: input.dropoff,
      date: input.date,
      time: input.time,
      child_count: input.childCount,
      notes: input.notes,
    })
    .returning();
  return toRequest(row);
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
  const rows = await getDb()
    .select()
    .from(localityRideOffers)
    .where(and(eq(localityRideOffers.circle_id, circleId), gt(localityRideOffers.seats_available, 0)));

  const weekday = weekdayOf(date);
  const offers = rows.map(toOffer).filter((offer) => !weekday || offer.days.includes(weekday));

  const drivers = await getUsersByIds(offers.map((o) => o.driverId));

  return offers
    .map((offer) => ({ offer, driver: drivers[offer.driverId] }))
    .filter((m): m is CandidateMatch => Boolean(m.driver))
    .sort((a, b) => b.driver.reliabilityScore - a.driver.reliabilityScore);
}

export async function confirmMatch(requestId: string, offerId: string, requesterId: string): Promise<string> {
  const [[requestRow], [offerRow]] = await Promise.all([
    getDb().select().from(localityRideRequests).where(eq(localityRideRequests.id, requestId)).limit(1),
    getDb().select().from(localityRideOffers).where(eq(localityRideOffers.id, offerId)).limit(1),
  ]);
  if (!requestRow || !offerRow) throw new Error("Request or offer not found.");

  const requesterChildren = await getChildrenForProfile(requesterId);
  const childName = requesterChildren[0]?.name ?? "your child";

  const [rideRow] = await getDb()
    .insert(localityRides)
    .values({
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
    .returning();

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
  const rows = await getDb()
    .select()
    .from(localityRides)
    .where(or(eq(localityRides.driver_id, profileId), eq(localityRides.parent_id, profileId)))
    .orderBy(desc(localityRides.created_at));
  return (rows as RideRow[]).map(toRide);
}

export async function getRide(id: string): Promise<Ride | null> {
  const [row] = await getDb().select().from(localityRides).where(eq(localityRides.id, id)).limit(1);
  return row ? toRide(row as RideRow) : null;
}

export async function confirmRide(rideId: string): Promise<void> {
  const ride = await getRide(rideId);
  if (!ride) return;

  if (ride.offerId) {
    await getDb()
      .update(localityRideOffers)
      .set({ seats_available: sql`greatest(${localityRideOffers.seats_available} - 1, 0)` })
      .where(eq(localityRideOffers.id, ride.offerId));
  }

  await getDb().update(localityRides).set({ status: "confirmed" }).where(eq(localityRides.id, rideId));
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

  await getDb()
    .update(localityProfiles)
    .set({ completed_rides: completedRides, reliability_score: String(reliabilityScore), badges })
    .where(eq(localityProfiles.id, profileId));
}

async function completeIfBothConfirmed(rideId: string): Promise<void> {
  const ride = await getRide(rideId);
  if (!ride || !ride.pickupConfirmed || !ride.dropoffConfirmed || ride.status === "completed") return;

  await getDb().update(localityRides).set({ status: "completed" }).where(eq(localityRides.id, rideId));

  await Promise.all([bumpReliability(ride.driverId, true), bumpReliability(ride.parentId, false)]);
}

export async function confirmPickup(rideId: string): Promise<void> {
  await getDb().update(localityRides).set({ pickup_confirmed: true }).where(eq(localityRides.id, rideId));
  await completeIfBothConfirmed(rideId);
}

export async function confirmDropoff(rideId: string): Promise<void> {
  await getDb().update(localityRides).set({ dropoff_confirmed: true }).where(eq(localityRides.id, rideId));
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
  const [row] = await getDb()
    .insert(localityMessages)
    .values({ ride_id: rideId, sender_id: senderId, driver_id: driverId, parent_id: parentId, text })
    .returning();
  return toMessage(row);
}

export async function getMessagesForRide(rideId: string): Promise<Message[]> {
  const rows = await getDb()
    .select()
    .from(localityMessages)
    .where(eq(localityMessages.ride_id, rideId))
    .orderBy(asc(localityMessages.created_at));
  return rows.map(toMessage);
}

export async function sendMessage(rideId: string, senderId: string, text: string): Promise<Message> {
  const ride = await getRide(rideId);
  if (!ride) throw new Error("Ride not found.");
  return insertMessage(rideId, senderId, ride.driverId, ride.parentId, text);
}

// --- circle group chat -------------------------------------------------

export async function getCircleMessages(circleId: string): Promise<CircleMessage[]> {
  const rows = await getDb()
    .select()
    .from(localityCircleMessages)
    .where(eq(localityCircleMessages.circle_id, circleId))
    .orderBy(asc(localityCircleMessages.created_at));
  return rows.map(toCircleMessage);
}

export async function sendCircleMessage(
  circleId: string,
  senderId: string,
  text: string
): Promise<CircleMessage> {
  const [row] = await getDb()
    .insert(localityCircleMessages)
    .values({ circle_id: circleId, sender_id: senderId, text })
    .returning();
  return toCircleMessage(row);
}

/** Latest message per circle, for the chat-inbox list — null for circles with no messages yet. */
export async function getLatestMessagePerCircle(
  circleIds: string[]
): Promise<Record<string, CircleMessage | null>> {
  const result: Record<string, CircleMessage | null> = Object.fromEntries(circleIds.map((id) => [id, null]));
  if (circleIds.length === 0) return result;

  const rows = await getDb()
    .selectDistinctOn([localityCircleMessages.circle_id])
    .from(localityCircleMessages)
    .where(inArray(localityCircleMessages.circle_id, circleIds))
    .orderBy(localityCircleMessages.circle_id, desc(localityCircleMessages.created_at));

  for (const row of rows) result[row.circle_id] = toCircleMessage(row);
  return result;
}

// --- safety ----------------------------------------------------------------

export async function reportIssue(
  reporterId: string,
  rideId: string | undefined,
  description: string
): Promise<SafetyReport> {
  const [row] = await getDb()
    .insert(localitySafetyReports)
    .values({ reporter_id: reporterId, ride_id: rideId ?? null, description })
    .returning();
  return { id: row.id, rideId: row.ride_id ?? undefined, description: row.description, timestamp: row.created_at };
}
