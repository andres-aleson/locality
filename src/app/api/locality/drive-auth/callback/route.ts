import { NextRequest, NextResponse } from "next/server";
import { exchangeCodeForRefreshToken } from "@/lib/locality/googleDrive";

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  if (!code) {
    return new NextResponse("Missing authorization code.", { status: 400 });
  }

  try {
    const refreshToken = await exchangeCodeForRefreshToken(code);
    return new NextResponse(
      `<!doctype html><html><body style="font-family: system-ui, sans-serif; max-width: 640px; margin: 60px auto; line-height: 1.6; color: #0f172a;">
        <h1>Drive connected</h1>
        <p>Copy this value into <code>.env.local</code> as <code>GOOGLE_REFRESH_TOKEN</code>, then restart the dev server:</p>
        <pre style="background:#f1f5f9; padding:16px; border-radius:8px; overflow-x:auto; word-break: break-all; white-space: pre-wrap;">${refreshToken}</pre>
        <p style="color:#64748b; font-size: 14px;">This is shown once. If you lose it, revoke Locality's access at <a href="https://myaccount.google.com/permissions">myaccount.google.com/permissions</a> and revisit <a href="/api/locality/drive-auth">/api/locality/drive-auth</a> to get a new one.</p>
      </body></html>`,
      { headers: { "Content-Type": "text/html; charset=utf-8" } }
    );
  } catch (err) {
    return new NextResponse(err instanceof Error ? err.message : "Authorization failed.", {
      status: 500,
    });
  }
}
