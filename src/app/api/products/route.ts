import { NextResponse } from "next/server";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

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

async function resolveImageUrl(
  supabase: ReturnType<typeof getSupabaseAdminClient> | null,
  value: string | null
) {
  if (!value) return null;
  if (value.startsWith("http://") || value.startsWith("https://") || value.startsWith("/")) {
    return value;
  }
  const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const fallbackPublicUrl = supabaseUrl
    ? `${supabaseUrl}/storage/v1/object/public/materiais/${value.split("/").map(encodeURIComponent).join("/")}`
    : null;
  if (!supabase) return fallbackPublicUrl;
  try {
    const signed = await supabase.storage.from("materiais").createSignedUrl(value, 60 * 60 * 24);
    return signed.data?.signedUrl || fallbackPublicUrl;
  } catch {
    return fallbackPublicUrl;
  }
}

async function resolveProductImageUrls(
  supabase: ReturnType<typeof getSupabaseAdminClient>,
  productId: string,
  imagemUrl: string | null
) {
  const imagePaths: string[] = [];
  const folder = `${productId}/imagens`;
  const listed = await supabase.storage.from("materiais").list(folder, {
    limit: 100,
    offset: 0,
    sortBy: { column: "name", order: "asc" },
  });

  if (!listed.error && Array.isArray(listed.data)) {
    for (const item of listed.data) {
      if (!item?.name || item.id === null) continue;
      imagePaths.push(`${folder}/${item.name}`);
    }
  }

  if (imagemUrl && !imagePaths.includes(imagemUrl)) {
    imagePaths.unshift(imagemUrl);
  }

  if (imagePaths.length === 0) return [];

  const directPaths = imagePaths.filter((path) => path.startsWith("http://") || path.startsWith("https://") || path.startsWith("/"));
  const storagePaths = imagePaths.filter((path) => !directPaths.includes(path));

  const resolvedByPath = new Map<string, string>();
  for (const directPath of directPaths) {
    resolvedByPath.set(directPath, directPath);
  }

  if (storagePaths.length > 0) {
    try {
      const signedBatch = await supabase.storage.from("materiais").createSignedUrls(storagePaths, 60 * 60 * 24);
      if (!signedBatch.error && Array.isArray(signedBatch.data)) {
        for (let i = 0; i < storagePaths.length; i += 1) {
          const path = storagePaths[i];
          const signedUrl = signedBatch.data[i]?.signedUrl || null;
          const fallbackUrl = await resolveImageUrl(null, path);
          if (signedUrl) resolvedByPath.set(path, signedUrl);
          else if (fallbackUrl) resolvedByPath.set(path, fallbackUrl);
        }
      } else {
        for (const path of storagePaths) {
          const fallbackUrl = await resolveImageUrl(null, path);
          if (fallbackUrl) resolvedByPath.set(path, fallbackUrl);
        }
      }
    } catch {
      for (const path of storagePaths) {
        const fallbackUrl = await resolveImageUrl(null, path);
        if (fallbackUrl) resolvedByPath.set(path, fallbackUrl);
      }
    }
  }

  const urls = imagePaths
    .map((path) => resolvedByPath.get(path) || null)
    .filter((value): value is string => Boolean(value));

  return urls;
}

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
        const resolvedImageUrl = resolvedImageUrls[0] || (await resolveImageUrl(supabase, row.imagem_url ?? null));

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
