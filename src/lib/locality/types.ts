export type BadgeType =
  | "identityVerified"
  | "driverVerified"
  | "parentVerified"
  | "communityTrusted";

export interface Child {
  id: string;
  name: string;
  grade: string;
  schoolId: string;
}

export interface EmergencyContact {
  id: string;
  name: string;
  phone: string;
  relationship: string;
}

export interface User {
  id: string;
  name: string;
  avatarColor: string;
  phone: string;
  email: string;
  address: string;
  badges: BadgeType[];
  reliabilityScore: number;
  completedRides: number;
  children: Child[];
}

export interface School {
  id: string;
  name: string;
  gradeRange: string;
}

// One community per school — a parent can join as many as they have kids in.
export interface Circle {
  id: string;
  name: string;
  schoolId: string;
  memberIds: string[];
}

export interface CircleInvite {
  circleId: string;
  email: string;
}

export interface RideOffer {
  id: string;
  driverId: string;
  circleId: string;
  school: string;
  days: string[];
  pickupTime: string;
  seatsAvailable: number;
}

export interface RideRequest {
  id: string;
  requesterId: string;
  pickup: string;
  dropoff: string;
  date: string;
  time: string;
  childCount: number;
  notes: string;
}

export type RideStatus = "pending" | "confirmed" | "completed" | "no-show";

export interface Ride {
  id: string;
  offerId?: string;
  requestId?: string;
  driverId: string;
  parentId: string;
  childName: string;
  pickup: string;
  dropoff: string;
  date: string;
  time: string;
  status: RideStatus;
  pickupConfirmed: boolean;
  dropoffConfirmed: boolean;
}

export interface Message {
  id: string;
  rideId: string;
  senderId: string;
  text: string;
  timestamp: string;
}

export interface CircleMessage {
  id: string;
  circleId: string;
  senderId: string;
  text: string;
  timestamp: string;
}

export interface VerificationSteps {
  phone: boolean;
  email: boolean;
  address: boolean;
  school: boolean;
  license: boolean;
  parent: boolean;
}

export interface SafetyReport {
  id: string;
  rideId?: string;
  description: string;
  timestamp: string;
}

export type SubmissionKind = "residence" | "license";
// auto_approved = passed the automatic quality check, no human action needed
// (but still recorded in Drive for an audit trail). pending = flagged by the
// quality check and needs a human to look at it.
export type SubmissionStatus = "pending" | "auto_approved" | "approved" | "rejected";

export interface SubmissionQualityCheck {
  sharpness: number;
  matchedKeywords: string[];
  reasons: string[];
}

export interface Submission {
  id: string;
  kind: SubmissionKind;
  uploaderName: string;
  uploaderEmail: string;
  fileName: string;
  driveFileId: string;
  driveViewLink: string;
  uploadedAt: string;
  status: SubmissionStatus;
  reviewedAt?: string;
  qualityCheck: SubmissionQualityCheck;
}

export interface DocumentSubmissions {
  license: string | null;
  residence: string | null;
}

export interface LocalityState {
  users: Record<string, User>;
  circles: Circle[];
  offers: RideOffer[];
  requests: RideRequest[];
  rides: Ride[];
  messages: Message[];
  verification: VerificationSteps;
  documentSubmissions: DocumentSubmissions;
  pendingInvites: CircleInvite[];
  safetyReports: SafetyReport[];
}
