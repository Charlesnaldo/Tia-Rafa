import { NextResponse, type NextRequest } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { isMissingSchema } from "@/lib/supabase/missing-schema";
import { buildShippedEmail, getResend } from "@/lib/email/delivery";

export const dynamic = "force-dynamic";

const STATUSES = ["pendente", "enviado", "entregue"] as const;
type FulfillmentStatus = (typeof STATUSES)[number];

// Updates shipping of a physical order; marking it "enviado" e-mails the tracking code to the customer.
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!await requireAdmin(request)) return NextResponse.json({ error: "Nao autorizado." }, { status: 401 });
  const { id } = await params;
  try {
    const body = (await request.json().catch(() => ({}))) as { status?: unknown; trackingCode?: unknown };
    const status = STATUSES.includes(body.status as FulfillmentStatus) ? body.status as FulfillmentStatus : null;
    const trackingCode = typeof body.trackingCode === "string" ? body.trackingCode.trim().toUpperCase().slice(0, 40) : "";
    if (!status) return NextResponse.json({ error: "Status de envio invalido." }, { status: 400 });
    if (status === "enviado" && !/^[A-Z0-9-]{6,40}$/.test(trackingCode)) {
      return NextResponse.json({ error: "Informe um codigo de rastreio valido." }, { status: 400 });
    }

    const supabase = getSupabaseAdminClient();
    const { data: order, error } = await supabase.from("orders")
      .select("id, tracking_code, customers(nome, email)").eq("id", id).maybeSingle();
    if (error) {
      if (isMissingSchema(error)) return NextResponse.json({ error: "Rode a migracao do banco para usar o envio." }, { status: 409 });
      throw error;
    }
    if (!order) return NextResponse.json({ error: "Pedido nao encontrado." }, { status: 404 });

    const update: Record<string, unknown> = { fulfillment_status: status };
    if (status === "enviado") Object.assign(update, { tracking_code: trackingCode, shipped_at: new Date().toISOString() });
    const { error: updateError } = await supabase.from("orders").update(update).eq("id", id);
    if (updateError) throw updateError;

    let emailed = false;
    const customer = (Array.isArray(order.customers) ? order.customers[0] : order.customers) as { nome?: string; email?: string } | null;
    const resend = getResend();
    if (status === "enviado" && trackingCode !== order.tracking_code && customer?.email && resend) {
      const result = await resend.emails.send(buildShippedEmail(customer.email, customer.nome || "Cliente", trackingCode));
      emailed = !result.error;
    }
    return NextResponse.json({ ok: true, emailed });
  } catch (error) {
    console.error("Falha ao atualizar envio:", error);
    return NextResponse.json({ error: "Falha ao atualizar o envio." }, { status: 500 });
  }
}
