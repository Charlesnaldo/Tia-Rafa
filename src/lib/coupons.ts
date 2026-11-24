import type { SupabaseClient } from "@supabase/supabase-js";
import { isMissingSchema } from "@/lib/supabase/missing-schema";

export type Coupon = {
  code: string;
  description: string | null;
  percent_off: number | null;
  amount_off_cents: number | null;
  min_items: number;
  min_subtotal_cents: number;
  max_uses: number | null;
  uses: number;
  expires_at: string | null;
  is_active: boolean;
};

export type CouponResult =
  | { ok: true; code: string; discountCents: number; description: string | null }
  | { ok: false; error: string };

export function normalizeCouponCode(value: unknown) {
  return typeof value === "string" ? value.trim().toUpperCase().slice(0, 32) : "";
}

// Pure: decides whether a coupon applies and how much it takes off. Never leaves less than R$ 0,01.
export function computeCouponDiscount(coupon: Coupon | null, subtotalCents: number, itemCount: number, now = Date.now()): CouponResult {
  if (!coupon || !coupon.is_active) return { ok: false, error: "Cupom invalido." };
  if (coupon.expires_at && new Date(coupon.expires_at).getTime() < now) return { ok: false, error: "Cupom expirado." };
  if (coupon.max_uses !== null && coupon.uses >= coupon.max_uses) return { ok: false, error: "Cupom esgotado." };
  if (itemCount < coupon.min_items) return { ok: false, error: `Este cupom vale a partir de ${coupon.min_items} itens.` };
  if (subtotalCents < coupon.min_subtotal_cents) {
    const minimo = (coupon.min_subtotal_cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
    return { ok: false, error: `Este cupom vale para compras a partir de ${minimo}.` };
  }
  const raw = coupon.percent_off !== null
    ? Math.round((subtotalCents * coupon.percent_off) / 100)
    : coupon.amount_off_cents ?? 0;
  const discountCents = Math.max(0, Math.min(raw, subtotalCents - 1));
  if (discountCents === 0) return { ok: false, error: "Cupom nao se aplica a este carrinho." };
  return { ok: true, code: coupon.code, discountCents, description: coupon.description };
}

export async function loadCoupon(supabase: SupabaseClient, code: string): Promise<Coupon | null> {
  if (!/^[A-Z0-9_-]{3,32}$/.test(code)) return null;
  const { data, error } = await supabase
    .from("coupons")
    .select("code, description, percent_off, amount_off_cents, min_items, min_subtotal_cents, max_uses, uses, expires_at, is_active")
    .eq("code", code)
    .maybeSingle();
  if (error) {
    if (isMissingSchema(error)) return null;
    throw new Error("Falha ao consultar cupom.");
  }
  return (data as Coupon | null) ?? null;
}
