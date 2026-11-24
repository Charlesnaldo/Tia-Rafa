import { createHash } from "node:crypto";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

type Limit = readonly [scope: "ip" | "global", limit: number, windowSeconds: number];

// Durable quotas shared by all server instances (consume_api_rate_limit in security-hardening.sql).
// Fails closed: if the limiter cannot answer, the request is refused.
export async function allowRequest(request: Request, name: string, limits: readonly Limit[]) {
  // Vercel overwrites this header; elsewhere all clients share one conservative bucket.
  const ip = process.env.VERCEL === "1"
    ? request.headers.get("x-vercel-forwarded-for")?.split(",")[0].trim() || "unknown"
    : "shared";
  const ipKey = createHash("sha256").update(ip).digest("hex");
  const supabase = getSupabaseAdminClient();
  for (const [scope, limit, seconds] of limits) {
    const bucket = scope === "ip" ? `${name}:ip:${ipKey}:${seconds}` : `${name}:global:${seconds}`;
    const { data, error } = await supabase.rpc("consume_api_rate_limit", {
      p_key: bucket, p_limit: limit, p_window_seconds: seconds,
    });
    if (error || typeof data !== "boolean") throw new Error("Limitador indisponivel.");
    if (!data) return false;
  }
  return true;
}
