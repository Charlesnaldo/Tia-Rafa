import { NextRequest, NextResponse } from "next/server";
import { getAdminSessionCookieName, verifyAdminSession } from "@/lib/admin-session";

export async function middleware(request: NextRequest) {
  if (!request.nextUrl.pathname.startsWith("/admin")) {
    return NextResponse.next();
  }

  if (request.nextUrl.pathname === "/admin/login") {
    return NextResponse.next();
  }

  const session = await verifyAdminSession(request.cookies.get(getAdminSessionCookieName())?.value);
  if (!session) {
    const loginUrl = new URL("/admin/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
