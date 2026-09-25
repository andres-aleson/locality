import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

// Next.js 16 renamed Middleware to Proxy — same mechanism, new file/export name.
// Gates /admin (LocalReach) and /locality/admin + its review API (Locality)
// behind their own shared passwords, and /dashboard + /onboarding behind
// Google sign-in (Supabase Auth). LocalReach and Locality are separate
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

// Calls Supabase (not just a cookie-presence check) so an expired access
// token gets refreshed and rewritten to the response here — skipping this
// causes sessions to silently desync, per Supabase's SSR guidance.
async function sessionAuth(request: NextRequest): Promise<NextResponse> {
  const loginPath = request.nextUrl.pathname.startsWith("/locality") ? "/locality/login" : "/login";
  let response = NextResponse.next({ request });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    return NextResponse.redirect(new URL(loginPath, request.url));
  }

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options)
        );
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.redirect(new URL(loginPath, request.url));
  }

  return response;
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
