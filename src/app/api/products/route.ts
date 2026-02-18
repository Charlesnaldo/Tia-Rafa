import { NextResponse } from "next/server";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

type ProductView = {
  id: string;
  nome: string;
  preco_cents: number;
  tipo: "digital" | "fisico";
  imagem_url: string | null;
  material_path: string | null;
};

async function resolveImageUrl(
  supabase: ReturnType<typeof getSupabaseAdminClient> | null,
  value: string | null
) {
  if (!value) return null;
  if (value.startsWith("http://") || value.startsWith("https://") || value.startsWith("/")) {
    return value;
  }
  if (!supabase) return value;
  try {
    const signed = await supabase.storage.from("materiais").createSignedUrl(value, 60 * 60 * 24);
    return signed.data?.signedUrl || value;
  } catch {
    return value;
  }
}

export async function GET() {
  const fallback: ProductView[] = [];

  try {
    const supabase = getSupabaseAdminClient();
    const { data, error } = await supabase
      .from("products")
      .select("id, nome, preco_cents, tipo, imagem_url, material_path, is_active")
      .eq("is_active", true);

    if (error || !data) {
      return NextResponse.json({ products: fallback });
    }

    const merged = new Map<string, ProductView>();

    for (const row of data) {
      if (!row?.is_active) continue;
      const resolvedImageUrl = await resolveImageUrl(supabase, row.imagem_url ?? null);
      const base = merged.get(row.id);
      if (!base) {
        merged.set(row.id, {
          id: row.id,
          nome: row.nome || row.id,
          preco_cents: Number.isFinite(row.preco_cents) ? Number(row.preco_cents) : 0,
          tipo: row.tipo === "fisico" ? "fisico" : "digital",
          imagem_url: resolvedImageUrl,
          material_path: row.material_path ?? null,
        });
        continue;
      }
      merged.set(row.id, {
        id: row.id,
        nome: row.nome || base.nome,
        preco_cents: Number.isFinite(row.preco_cents) ? Number(row.preco_cents) : base.preco_cents,
        tipo: row.tipo === "fisico" ? "fisico" : "digital",
        imagem_url: resolvedImageUrl ?? base.imagem_url,
        material_path: row.material_path ?? base.material_path,
      });
    }

    return NextResponse.json({ products: Array.from(merged.values()) });
  } catch {
    return NextResponse.json({ products: fallback });
  }
}
