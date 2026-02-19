import { NextResponse } from "next/server";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { resolveProductImageUrls, resolveStorageImageUrl } from "@/lib/supabase/storage-images";

export const revalidate = 60;

type ProductView = {
  id: string;
  nome: string;
  descricao: string | null;
  preco_cents: number;
  tipo: "digital" | "fisico";
  imagem_url: string | null;
  imagem_urls: string[];
  material_path: string | null;
};

export async function GET() {
  const fallback: ProductView[] = [];

  try {
    const supabase = getSupabaseAdminClient();
    const { data, error } = await supabase
      .from("products")
      .select("id, nome, descricao, preco_cents, tipo, imagem_url, material_path, is_active")
      .eq("is_active", true);

    if (error || !data) {
      return NextResponse.json({ products: fallback });
    }

    const activeRows = data.filter((row) => row?.is_active);
    const products = await Promise.all(
      activeRows.map(async (row): Promise<ProductView> => {
        const resolvedImageUrls = await resolveProductImageUrls(supabase, row.id, row.imagem_url ?? null);
        const resolvedImageUrl = resolvedImageUrls[0] || (await resolveStorageImageUrl(supabase, row.imagem_url ?? null));

        return {
          id: row.id,
          nome: row.nome || row.id,
          descricao: row.descricao ?? null,
          preco_cents: Number.isFinite(row.preco_cents) ? Number(row.preco_cents) : 0,
          tipo: row.tipo === "fisico" ? "fisico" : "digital",
          imagem_url: resolvedImageUrl,
          imagem_urls: resolvedImageUrls,
          material_path: row.material_path ?? null,
        };
      })
    );

    return NextResponse.json({ products });
  } catch {
    return NextResponse.json({ products: fallback });
  }
}
