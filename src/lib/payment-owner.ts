import { createHash, randomBytes, timingSafeEqual } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";

const COOKIE_NAME = "payment_owner";

export function getPaymentOwner(request: NextRequest) {
  const value = request.cookies.get(COOKIE_NAME)?.value;
  return value && /^[a-f0-9]{64}$/.test(value) ? value : null;
}

export function createPaymentOwner(request: NextRequest) {
  return getPaymentOwner(request) || randomBytes(32).toString("hex");
}

export function hashPaymentOwner(owner: string) {
  return createHash("sha256").update(owner).digest("hex");
}

export function matchesPaymentOwner(owner: string, expected: unknown) {
  if (typeof expected !== "string" || !/^[a-f0-9]{64}$/.test(expected)) return false;
  return timingSafeEqual(Buffer.from(hashPaymentOwner(owner), "hex"), Buffer.from(expected, "hex"));
}

export function setPaymentOwner(response: NextResponse, owner: string) {
  response.cookies.set(COOKIE_NAME, owner, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/api",
    maxAge: 60 * 60 * 24 * 7,
  });
  response.headers.set("Cache-Control", "private, no-store");
  return response;
}
