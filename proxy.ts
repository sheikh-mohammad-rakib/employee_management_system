import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { verifyToken } from "@/lib/jwt"

const PUBLIC_ROUTES = ["/login", "/register"]

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Allow public auth routes
  if (PUBLIC_ROUTES.some((r) => pathname.startsWith(r))) {
    const token = request.cookies.get("access_token")?.value
    if (token) {
      const payload = await verifyToken(token)
      if (payload) {
        // Already authenticated — redirect to appropriate dashboard
        const dest = payload.role === "EMPLOYEE" ? "/employee" : "/admin"
        return NextResponse.redirect(new URL(dest, request.url))
      }
    }
    return NextResponse.next()
  }

  // Protect dashboard and API routes
  if (
    pathname.startsWith("/employee") ||
    pathname.startsWith("/admin") ||
    pathname.startsWith("/api/attendance") ||
    pathname.startsWith("/api/leaves") ||
    pathname.startsWith("/api/tasks") ||
    pathname.startsWith("/api/password") ||
    pathname.startsWith("/api/users")
  ) {
    const token = request.cookies.get("access_token")?.value
    const payload = token ? await verifyToken(token) : null

    if (!payload) {
      return NextResponse.redirect(new URL("/login", request.url))
    }

    // Role enforcement for admin routes
    if (
      pathname.startsWith("/admin") &&
      payload.role === "EMPLOYEE"
    ) {
      return NextResponse.redirect(new URL("/employee", request.url))
    }

    // Role enforcement for employee routes (admin can visit too for now)
    return NextResponse.next()
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    "/login",
    "/register",
    "/employee/:path*",
    "/admin/:path*",
    "/api/attendance/:path*",
    "/api/leaves/:path*",
    "/api/tasks/:path*",
    "/api/password/:path*",
    "/api/users/:path*",
  ],
}
