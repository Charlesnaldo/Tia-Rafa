import { NextResponse, type NextRequest } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { expandKits, loadKitComponents } from "@/lib/products/kits";
import { buildDigitalDeliveryEmail, getPurchasedProducts, getResend } from "@/lib/email/delivery";

export const dynamic = "force-dynamic";

// Sends the digital materials of an order again, with fresh download links.
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!await requireAdmin(request)) return NextResponse.json({ error: "Nao autorizado." }, { status: 401 });
  const { id } = await params;
  try {
    const resend = getResend();
    if (!resend) return NextResponse.json({ error: "Envio de e-mail nao configurado." }, { status: 503 });

    const supabase = getSupabaseAdminClient();
    const { data: order, error } = await supabase.from("orders")
      .select("id, customers(email), order_items(product_id)")
      .eq("id", id).maybeSingle();
    if (error) throw error;
    if (!order) return NextResponse.json({ error: "Pedido nao encontrado." }, { status: 404 });

    const customer = (Array.isArray(order.customers) ? order.customers[0] : order.customers) as { email?: string } | null;
    if (!customer?.email) return NextResponse.json({ error: "Pedido sem e-mail do cliente." }, { status: 422 });

    const ids = [...new Set(((order.order_items || []) as { product_id: string }[]).map((item) => item.product_id))];
    const entregaveis = expandKits(ids, await loadKitComponents(supabase, ids));
    const produtos = await getPurchasedProducts(entregaveis);
    const origin = new URL(request.url).origin;
    let sent = 0;
    for (const produtoId of entregaveis) {
      const produto = produtos.get(produtoId);
      if (produto?.tipo !== "digital") continue;
      const result = await resend.emails.send(await buildDigitalDeliveryEmail(origin, customer.email, produto));
      if (result.error) throw new Error(result.error.message);
      sent += 1;
    }
    if (sent === 0) return NextResponse.json({ error: "Este pedido nao tem materiais digitais." }, { status: 422 });
    return NextResponse.json({ sent, to: customer.email });
  } catch (error) {
    console.error("Falha ao reenviar material:", error);
    return NextResponse.json({ error: "Falha ao reenviar o material." }, { status: 500 });
  }
}
