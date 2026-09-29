import "server-only";
import { desc, eq } from "drizzle-orm";
import { getDb } from "@/db";
import { localitySubmissions } from "@/db/schema";
import type { Submission, SubmissionStatus } from "./types";

interface SubmissionRow {
  id: string;
  kind: Submission["kind"];
  uploader_name: string;
  uploader_email: string;
  file_name: string;
  drive_file_id: string;
  drive_view_link: string;
  status: SubmissionStatus;
  quality_check: Submission["qualityCheck"];
  uploaded_at: string;
  reviewed_at: string | null;
}

function toSubmission(row: SubmissionRow): Submission {
  return {
    id: row.id,
    kind: row.kind,
    uploaderName: row.uploader_name,
    uploaderEmail: row.uploader_email,
    fileName: row.file_name,
    driveFileId: row.drive_file_id,
    driveViewLink: row.drive_view_link,
    status: row.status,
    qualityCheck: row.quality_check,
    uploadedAt: row.uploaded_at,
    reviewedAt: row.reviewed_at ?? undefined,
  };
}

export async function listSubmissions(): Promise<Submission[]> {
  const rows = await getDb().select().from(localitySubmissions).orderBy(desc(localitySubmissions.uploaded_at));
  return (rows as SubmissionRow[]).map(toSubmission);
}

export async function getSubmission(id: string): Promise<Submission | null> {
  const [row] = await getDb().select().from(localitySubmissions).where(eq(localitySubmissions.id, id)).limit(1);
  return row ? toSubmission(row as SubmissionRow) : null;
}

export async function addSubmission(input: Omit<Submission, "id" | "uploadedAt">): Promise<Submission> {
  const [row] = await getDb()
    .insert(localitySubmissions)
    .values({
      kind: input.kind,
      uploader_name: input.uploaderName,
      uploader_email: input.uploaderEmail,
      file_name: input.fileName,
      drive_file_id: input.driveFileId,
      drive_view_link: input.driveViewLink,
      status: input.status,
      quality_check: input.qualityCheck,
    })
    .returning();
  return toSubmission(row as SubmissionRow);
}

export async function updateSubmissionStatus(
  id: string,
  status: Extract<SubmissionStatus, "approved" | "rejected">
): Promise<Submission | null> {
  const [row] = await getDb()
    .update(localitySubmissions)
    .set({ status, reviewed_at: new Date().toISOString() })
    .where(eq(localitySubmissions.id, id))
    .returning();
  return row ? toSubmission(row as SubmissionRow) : null;
}
