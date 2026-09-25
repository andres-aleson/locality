import { NextResponse } from "next/server";
import { getSubmission } from "@/lib/locality/submissions";

// Deliberately unauthenticated (unlike /api/locality/submissions, which is
// admin-only) — this is how the uploader's own browser polls whether their
// license/residence photo has cleared review. Only exposes the status, none
// of the other submission fields (uploader info, Drive link).
export async function GET(_request: Request, ctx: RouteContext<"/api/locality/submission-status/[id]">) {
  const { id } = await ctx.params;
  const submission = await getSubmission(id);
  if (!submission) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }
  return NextResponse.json({ status: submission.status });
}
