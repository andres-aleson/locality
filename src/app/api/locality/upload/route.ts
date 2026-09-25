import { NextResponse } from "next/server";
import { isDriveConfigured, uploadToDrive } from "@/lib/locality/googleDrive";
import { addSubmission } from "@/lib/locality/submissions";
import { runDocumentCheck } from "@/lib/locality/documentCheck";
import type { SubmissionKind } from "@/lib/locality/types";

const VALID_KINDS: SubmissionKind[] = ["residence", "license"];

export async function POST(request: Request) {
  const formData = await request.formData();
  const file = formData.get("file");
  const kind = formData.get("kind");
  const uploaderName = String(formData.get("uploaderName") ?? "");
  const uploaderEmail = String(formData.get("uploaderEmail") ?? "");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file provided." }, { status: 400 });
  }
  if (typeof kind !== "string" || !VALID_KINDS.includes(kind as SubmissionKind)) {
    return NextResponse.json({ error: "Invalid submission kind." }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());

  // Quality check only — it can't confirm a document is genuine, only that
  // it's readable and looks like the right kind of document.
  const check = await runDocumentCheck(buffer, kind as SubmissionKind);

  if (check.blurry) {
    return NextResponse.json(
      {
        error: "That photo is too blurry to read. Please retake it in good lighting and upload again.",
        quality: check,
      },
      { status: 422 }
    );
  }

  if (!isDriveConfigured()) {
    return NextResponse.json(
      {
        error:
          "Google Drive isn't connected yet — ask the Locality team to finish setup at /api/locality/drive-auth.",
        quality: check,
      },
      { status: 503 }
    );
  }

  try {
    const timestampedName = `${Date.now()}-${kind}-${file.name}`;

    const { fileId, viewLink } = await uploadToDrive({
      buffer,
      fileName: timestampedName,
      mimeType: file.type || "application/octet-stream",
    });

    const submission = await addSubmission({
      kind: kind as SubmissionKind,
      uploaderName,
      uploaderEmail,
      fileName: file.name,
      driveFileId: fileId,
      driveViewLink: viewLink,
      status: check.passed ? "auto_approved" : "pending",
      qualityCheck: {
        sharpness: check.sharpness,
        matchedKeywords: check.matchedKeywords,
        reasons: check.reasons,
      },
    });

    return NextResponse.json({ submission, quality: check });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Upload failed." },
      { status: 500 }
    );
  }
}
