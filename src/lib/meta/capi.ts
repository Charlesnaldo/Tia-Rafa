import { createHash } from "node:crypto";
import { META_PIXEL_ID } from "@/config/meta";

// Meta Conversions API. Optional and best-effort: without META_CAPI_TOKEN it does nothing,
// and a failure is logged, never thrown, so payment delivery is never affected.
const GRAPH_VERSION = process.env.META_GRAPH_VERSION?.trim() || "v23.0";

const sha256 = (value: string) => createHash("sha256").update(value).digest("hex");
const normalizeEmail = (email: string) => email.trim().toLowerCase();
// Meta expects digits with country code; store phones are Brazilian without it.
const normalizePhone = (phone: string) => {
  const digits = phone.replace(/\D/g, "");
  if (!digits) return "";
  return digits.length <= 11 ? `55${digits}` : digits;
};

export type PurchaseEvent = {
  paymentId: string;
  value: number;
  email: string;
  phone?: string;
  firstName?: string;
  contentIds: string[];
  fbp?: string;
  fbc?: string;
  clientIp?: string;
  userAgent?: string;
  eventSourceUrl: string;
  eventTime?: number;
};

export function buildPurchasePayload(event: PurchaseEvent) {
  const phone = event.phone ? normalizePhone(event.phone) : "";
  const firstName = event.firstName?.trim().split(/\s+/)[0]?.toLowerCase() || "";
  return {
    data: [{
      event_name: "Purchase",
      event_time: event.eventTime ?? Math.floor(Date.now() / 1000),
      // Same id as the browser Pixel event, so Meta counts the sale once.
      event_id: `purchase_${event.paymentId}`,
      action_source: "website",
      event_source_url: event.eventSourceUrl,
      user_data: {
        em: [sha256(normalizeEmail(event.email))],
        ...(phone ? { ph: [sha256(phone)] } : {}),
        ...(firstName ? { fn: [sha256(firstName)] } : {}),
        country: [sha256("br")],
        ...(event.fbp ? { fbp: event.fbp } : {}),
        ...(event.fbc ? { fbc: event.fbc } : {}),
        ...(event.clientIp ? { client_ip_address: event.clientIp } : {}),
        ...(event.userAgent ? { client_user_agent: event.userAgent } : {}),
      },
      custom_data: {
        currency: "BRL",
        value: Number(event.value.toFixed(2)),
        content_type: "product",
        content_ids: event.contentIds,
        order_id: event.paymentId,
      },
    }],
  };
}

export async function sendMetaPurchase(event: PurchaseEvent) {
  const token = process.env.META_CAPI_TOKEN?.trim();
  if (!token || !META_PIXEL_ID) return { sent: false, reason: "not-configured" as const };
  try {
    const response = await fetch(`https://graph.facebook.com/${GRAPH_VERSION}/${META_PIXEL_ID}/events`, {
      method: "POST",
      // Token in the header, never in the URL, so it does not end up in logs.
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify(buildPurchasePayload(event)),
      signal: AbortSignal.timeout(8000),
    });
    if (!response.ok) {
      console.error("Meta CAPI recusou o evento de compra:", response.status, await response.text().catch(() => ""));
      return { sent: false, reason: "rejected" as const };
    }
    return { sent: true as const };
  } catch (error) {
    console.error("Falha ao enviar compra para a Meta:", error);
    return { sent: false, reason: "error" as const };
  }
}
