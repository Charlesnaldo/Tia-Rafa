import { NextResponse } from "next/server";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { computeCouponDiscount, loadCoupon, normalizeCouponCode } from "@/lib/coupons";
import { allowRequest } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

type Body = { code?: unknown; cartItems?: unknown };

// Preview only: /api/process_payment recomputes the discount from database prices.
export async function POST(request: Request) {
  try {
    const body = (await request.json().catch(() => ({}))) as Body;
    const code = normalizeCouponCode(body.code);
    const cartItems = Array.isArray(body.cartItems) ? body.cartItems.slice(0, 20) : [];
    if (!code) return NextResponse.json({ error: "Informe o cupom." }, { status: 400 });
    if (!await allowRequest(request, "coupon", [["ip", 20, 600], ["global", 2000, 3600]])) {
      return NextResponse.json({ error: "Muitas tentativas. Tente novamente em alguns minutos." }, { status: 429 });
    }

    const items = cartItems
      .map((item) => item as { id?: unknown; quantity?: unknown })
      .filter((item): item is { id: string; quantity: number } =>
        typeof item.id === "string" && item.id.length <= 128 && Number.isInteger(item.quantity) && Number(item.quantity) > 0);
    if (items.length === 0) return NextResponse.json({ error: "Carrinho vazio." }, { status: 400 });

    const supabase = getSupabaseAdminClient();
    const { data: products, error } = await supabase.from("products")
      .select("id, preco_cents").in("id", items.map((item) => item.id)).eq("is_active", true);
    if (error) throw error;
    const prices = new Map((products || []).map((row) => [row.id, Number(row.preco_cents) || 0]));
    const subtotalCents = items.reduce((total, item) => total + (prices.get(item.id) ?? 0) * item.quantity, 0);
    const itemCount = items.reduce((total, item) => total + item.quantity, 0);

    const result = computeCouponDiscount(await loadCoupon(supabase, code), subtotalCents, itemCount);
    if (!result.ok) return NextResponse.json({ error: result.error }, { status: 400 });
    return NextResponse.json({
      code: result.code,
      description: result.description,
      discountCents: result.discountCents,
      totalCents: subtotalCents - result.discountCents,
    }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("Falha ao validar cupom:", error);
    return NextResponse.json({ error: "Nao foi possivel validar o cupom agora." }, { status: 503 });
  }
}
