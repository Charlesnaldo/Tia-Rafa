import "server-only";
import { unstable_cache } from "next/cache";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { buildProductImageProxyUrl, resolveProductImageUrls, resolveStorageImageUrl } from "@/lib/supabase/storage-images";
import { buildCatalogWithOverrides, type PublishedProduct } from "./catalog-model";

async function loadPublishedProducts(): Promise<PublishedProduct[]> {
  const configured = Boolean(
    (process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL) &&
    (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY)
  );
  // Explicit local preview supports production-build audits without database secrets.
  const preview = process.env.CATALOG_PREVIEW_ORIGIN;
  if (!configured && (process.env.NODE_ENV === "development" || preview)) {
    const origin = preview || "https://www.tiarafaela.com.br";
    if (preview && !/^http:\/\/(localhost|127\.0\.0\.1):\d+$/.test(origin)) {
      throw new Error("CATALOG_PREVIEW_ORIGIN must be an explicit loopback origin.");
    }
    const response = await fetch(`${origin}/api/products`, {
      next: { revalidate: 60 }, signal: AbortSignal.timeout(10000),
    });
    if (!response.ok) throw new Error("Public catalog preview unavailable.");
    const data = await response.json() as { products?: PublishedProduct[] };
    return (data.products || []).map(product => ({
      ...product,
      imagem_url: !preview && product.imagem_url?.startsWith("/") ? new URL(product.imagem_url, origin).href : product.imagem_url,
      imagem_urls: (product.imagem_urls || []).map(url => !preview && url.startsWith("/") ? new URL(url, origin).href : url),
    }));
  }

  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase.from("products")
    .select("id, nome, descricao, preco_cents, tipo, imagem_url, is_active")
    .eq("is_active", true);
  if (error) throw error;
  return Promise.all((data || []).map(async row => {
    const images = await resolveProductImageUrls(supabase, row.id, row.imagem_url ?? null);
    const primary = images[0] || buildProductImageProxyUrl(row.imagem_url ?? null) ||
      await resolveStorageImageUrl(supabase, row.imagem_url ?? null);
    return {
      id: row.id, nome: row.nome || row.id, descricao: row.descricao ?? null,
      preco_cents: Number.isFinite(row.preco_cents) ? Number(row.preco_cents) : 0,
      tipo: row.tipo === "fisico" ? "fisico" as const : "digital" as const,
      imagem_url: primary, imagem_urls: images,
    };
  }));
}

// This project has not enabled Cache Components; preserve its documented ISR model.
// Errors propagate so a temporary upstream failure does not become a cached empty catalog.
export const getPublishedProducts = unstable_cache(loadPublishedProducts, ["published-products-v1"], {
  revalidate: 60, tags: ["published-products"],
});

export async function getCatalogProducts() {
  return Object.values(buildCatalogWithOverrides(await getPublishedProducts()));
}
