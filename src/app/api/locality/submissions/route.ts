import { NextResponse } from "next/server";
import { listSubmissions } from "@/lib/locality/submissions";

export async function GET() {
  const submissions = await listSubmissions();
  return NextResponse.json({ submissions });
}
