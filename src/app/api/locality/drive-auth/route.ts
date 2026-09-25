import { NextResponse } from "next/server";
import { getAuthUrl } from "@/lib/locality/googleDrive";

export async function GET() {
  try {
    const url = getAuthUrl();
    return NextResponse.redirect(url);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Not configured." },
      { status: 503 }
    );
  }
}
