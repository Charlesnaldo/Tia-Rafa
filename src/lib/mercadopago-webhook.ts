import { createHmac, timingSafeEqual } from "node:crypto";

// The queried ID is the same ID used for both the signature and the API lookup.
export function verifyMercadoPagoWebhook(request: Request, secret: string, now = Date.now()) {
  const params = new URL(request.url).searchParams;
  const id = params.get("data.id");
  const requestId = request.headers.get("x-request-id");
  const signature = request.headers.get("x-signature") || "";
  if (!id || !/^\d{1,30}$/.test(id) || !requestId || requestId.length > 200) return null;
  if (params.getAll("data.id").length !== 1) return null;

  const parts = signature.split(",").map((part) => part.trim().split("="));
  const timestamps = parts.filter(([key]) => key === "ts");
  const signatures = parts.filter(([key]) => key === "v1");
  if (timestamps.length !== 1 || signatures.length !== 1) return null;
  const timestamp = timestamps[0][1] || "";
  const digest = signatures[0][1] || "";
  if (!/^\d{10,13}$/.test(timestamp) || !/^[a-f0-9]{64}$/i.test(digest)) return null;
  const issuedAt = Number(timestamp) * (timestamp.length <= 10 ? 1000 : 1);
  if (Math.abs(now - issuedAt) > 10 * 60 * 1000) return null;

  const manifest = `id:${id};request-id:${requestId};ts:${timestamp};`;
  const expected = createHmac("sha256", secret).update(manifest).digest();
  return timingSafeEqual(expected, Buffer.from(digest, "hex")) ? id : null;
}
