import type { NextRequest } from "next/server";
import { getAdminSessionCookieName, verifyAdminSession } from "@/lib/admin-session";

// API routes are outside the /admin proxy matcher, so each admin route checks the signed cookie itself.
export async function requireAdmin(request: NextRequest) {
  return verifyAdminSession(request.cookies.get(getAdminSessionCookieName())?.value);
}
