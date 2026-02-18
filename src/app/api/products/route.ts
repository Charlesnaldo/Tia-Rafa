import { NextResponse } from "next/server";
import { PRODUTOS_LISTA } from "@/constants/produtos";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

type ProductView = {
  id: string;
  nome: string;
  preco_cents: number;
  tipo: "digital" | "fisico";
};

function getFallbackProducts(): ProductView[] {
  return Object.values(PRODUTOS_LISTA).map((product) => ({
    id: product.id,
    nome: product.nome,
    preco_cents: product.preco,
    tipo: product.tipo,
  }));
}

export async function GET() {
  const fallback = getFallbackProducts();

  try {
    const supabase = getSupabaseAdminClient();
    const ids = fallback.map((product) => product.id);
    const { data, error } = await supabase
      .from("products")
      .select("id, nome, preco_cents, tipo, is_active")
      .in("id", ids);

    if (error || !data) {
      return NextResponse.json({ products: fallback });
    }

    const merged = new Map<string, ProductView>(fallback.map((product) => [product.id, product]));

    for (const row of data) {
      if (!row?.is_active) continue;
      const base = merged.get(row.id);
      if (!base) continue;
      merged.set(row.id, {
        id: row.id,
        nome: row.nome || base.nome,
        preco_cents: Number.isFinite(row.preco_cents) ? Number(row.preco_cents) : base.preco_cents,
        tipo: row.tipo === "fisico" ? "fisico" : "digital",
      });
    }

    return NextResponse.json({ products: Array.from(merged.values()) });
  } catch {
    return NextResponse.json({ products: fallback });
  }
}
