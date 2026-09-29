import { NextResponse, type NextRequest } from "next/server";
import { auth } from "@/lib/auth";

// Next.js 16 renamed Middleware to Proxy — same mechanism, new file/export name.
// Gates /admin (LocalReach) and /locality/admin + its review API (Locality)
// behind their own shared passwords, and /dashboard + /onboarding behind
// Google sign-in (Auth.js). LocalReach and Locality are separate
// products sharing this repo, so they get separate admin passwords.
export async function proxy(request: NextRequest): Promise<NextResponse> {
  const { pathname } = request.nextUrl;

  if (
    (pathname === "/locality" || pathname.startsWith("/locality/")) &&
    process.env.LOCALITY_MAINTENANCE_MODE === "true"
  ) {
    return new NextResponse(
      "Locality is temporarily offline for maintenance. Please check back soon.",
      { status: 503, headers: { "Retry-After": "3600" } }
    );
  }

  if (pathname.startsWith("/admin")) {
    return basicAuth(request, process.env.ADMIN_PASSWORD, "LocalReach admin");
  }

  if (
    pathname.startsWith("/locality/admin") ||
    pathname.startsWith("/api/locality/submissions") ||
    pathname.startsWith("/api/locality/drive-auth")
  ) {
    return basicAuth(request, process.env.LOCALITY_ADMIN_PASSWORD, "Locality admin");
  }

  // Only these paths require a signed-in session — the rest of /locality
  // (landing, terms, privacy, login, auth callback) is public and must fall
  // through untouched, since the matcher below now also covers those paths
  // for the maintenance-mode check above.
  const needsSession =
    pathname.startsWith("/dashboard") ||
    pathname === "/onboarding" ||
    pathname.startsWith("/locality/app") ||
    pathname === "/locality/verification";

  if (needsSession) {
    return sessionAuth(request);
  }

  return NextResponse.next();
}

function basicAuth(request: NextRequest, password: string | undefined, realm: string): NextResponse {
  // Fail closed: an unconfigured password blocks access rather than granting it.
  if (!password) {
    return new NextResponse(`Admin panel not configured — set the password for "${realm}".`, {
      status: 503,
    });
  }

  const expected = `Basic ${Buffer.from(`admin:${password}`).toString("base64")}`;

  if (request.headers.get("authorization") === expected) {
    return NextResponse.next();
  }

  return new NextResponse("Authentication required", {
    status: 401,
    headers: { "WWW-Authenticate": `Basic realm="${realm}"` },
  });
}

// Decodes and verifies the Auth.js session cookie (a signed JWT) — no
// database round-trip. Pages still re-check the session server-side.
async function sessionAuth(request: NextRequest): Promise<NextResponse> {
  const loginPath = request.nextUrl.pathname.startsWith("/locality") ? "/locality/login" : "/login";

  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.redirect(new URL(loginPath, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/dashboard/:path*",
    "/onboarding",
    "/locality",
    "/locality/:path*",
    "/api/locality/submissions/:path*",
    "/api/locality/drive-auth/:path*",
  ],
};
