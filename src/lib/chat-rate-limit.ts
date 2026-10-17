import { createHash } from "node:crypto";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

export async function allowChatRequest(request: Request) {
  // Vercel overwrites this header. Never trust a client-provided session ID as a quota key.
  // Other hosts share a conservative bucket until their trusted proxy is configured.
  const ip = process.env.VERCEL === "1"
    ? request.headers.get("x-vercel-forwarded-for")?.split(",")[0].trim() || "unknown"
    : "shared";
  const key = createHash("sha256").update(ip).digest("hex");
  const supabase = getSupabaseAdminClient();
  for (const [bucket, limit, seconds] of [
    [`chat:ip:${key}`, 10, 60], ["chat:global:minute", 100, 60], ["chat:global:day", 1000, 86400],
  ] as const) {
    const { data, error } = await supabase.rpc("consume_api_rate_limit", {
      p_key: bucket, p_limit: limit, p_window_seconds: seconds,
    });
    if (error || typeof data !== "boolean") throw new Error("Limitador de mensagens indisponivel.");
    if (!data) return false;
  }
  return true;
}
