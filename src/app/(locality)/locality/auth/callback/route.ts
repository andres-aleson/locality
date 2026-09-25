import { NextResponse, type NextRequest } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase-server";

export async function GET(request: NextRequest): Promise<NextResponse> {
  const code = request.nextUrl.searchParams.get("code");
  const supabase = code ? await getSupabaseServerClient() : null;

  if (supabase) {
    const { error } = await supabase.auth.exchangeCodeForSession(code!);
    if (!error) {
      return NextResponse.redirect(new URL("/locality/verification", request.url));
    }
  }

  return NextResponse.redirect(new URL("/locality/login", request.url));
}
