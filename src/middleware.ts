import { NextRequest, NextResponse } from "next/server";

export default async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip middleware for API routes, static files, and favicon
  if (
    pathname.startsWith("/api") ||
    pathname.startsWith("/_next") ||
    pathname.includes("favicon") ||
    pathname.includes(".ico") ||
    pathname.includes(".svg") ||
    pathname.includes(".png") ||
    pathname.includes(".jpg")
  ) {
    return NextResponse.next();
  }

  // Public routes that don't require authentication
  const publicRoutes = [
    "/",
    "/auth",
    "/auth/connexion",
    "/auth/inscription",
    "/auth/mot-de-passe-oublie",
  ];
  const isPublicRoute = publicRoutes.some(
    (route) => pathname === route || pathname.startsWith(route + "/")
  );

  try {
    // Check session via API call
    const sessionResponse = await fetch(
      new URL("/api/auth/get-session", request.url),
      {
        headers: {
          cookie: request.headers.get("cookie") || "",
        },
      }
    );

    let isLoggedIn = false;

    if (sessionResponse.ok) {
      const sessionData = await sessionResponse.json();
      isLoggedIn = !!sessionData?.user;
    }

    // If user is not logged in and trying to access protected route
    if (!isLoggedIn && !isPublicRoute) {
      return NextResponse.redirect(new URL("/auth/connexion", request.url));
    }

    // If user is logged in and trying to access auth pages, redirect to dashboard
    if (isLoggedIn && isPublicRoute && pathname !== "/") {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    return NextResponse.next();
  } catch (error) {
    console.error("Middleware error:", error);
    // If session check fails, allow access to public routes only
    if (!isPublicRoute) {
      return NextResponse.redirect(new URL("/auth/connexion", request.url));
    }
    return NextResponse.next();
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - All files with extensions (images, etc.)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)",
  ],
};
