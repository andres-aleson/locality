import { NextResponse } from "next/server";
import { updateSubmissionStatus } from "@/lib/locality/submissions";

export async function PATCH(request: Request, ctx: RouteContext<"/api/locality/submissions/[id]">) {
  const { id } = await ctx.params;
  const body = await request.json().catch(() => null);
  const status = body?.status;

  if (status !== "approved" && status !== "rejected") {
    return NextResponse.json({ error: "status must be 'approved' or 'rejected'." }, { status: 400 });
  }

  const updated = await updateSubmissionStatus(id, status);
  if (!updated) {
    return NextResponse.json({ error: "Submission not found." }, { status: 404 });
  }

  return NextResponse.json({ submission: updated });
}
