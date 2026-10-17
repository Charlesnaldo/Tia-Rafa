import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { listProductImagePaths } from "@/lib/supabase/storage-images";

export const dynamic = "force-dynamic";

const IMAGE_CONTENT_TYPES: Record<string, string> = {
  avif: "image/avif",
  gif: "image/gif",
  jpeg: "image/jpeg",
  jpg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
};

function normalizeImagePath(value: string | null) {
  return (value || "").trim().replace(/^\/+/, "");
}

function getImageContentType(path: string) {
  const extension = path.split(".").pop()?.toLowerCase() || "";
  return IMAGE_CONTENT_TYPES[extension] || null;
}

function isAllowedProductImagePath(path: string) {
  if (!path || path.length > 1024 || path.includes("..") || /[\\%?#]/.test(path)) return false;
  if ([...path].some((character) => character.charCodeAt(0) < 32)) return false;
  if (!/^[^/]+\/imagens\/[^/]+$/.test(path)) return false;
  return Boolean(getImageContentType(path));
}

export async function GET(request: NextRequest) {
  const imagePath = normalizeImagePath(request.nextUrl.searchParams.get("path"));

  if (!isAllowedProductImagePath(imagePath)) {
    return NextResponse.json({ error: "Imagem invalida." }, { status: 400 });
  }

  try {
    const supabase = getSupabaseAdminClient();
    const productId = imagePath.split("/")[0];
    const { data: product, error: productError } = await supabase.from("products")
      .select("id, imagem_url").eq("id", productId).eq("is_active", true).maybeSingle();
    if (productError) throw productError;
    if (!product) return NextResponse.json({ error: "Imagem nao encontrada." }, { status: 404 });
    const publishedPaths = await listProductImagePaths(supabase, product.id, product.imagem_url);
    if (!publishedPaths.includes(imagePath)) {
      return NextResponse.json({ error: "Imagem nao encontrada." }, { status: 404 });
    }
    const { data, error } = await supabase.storage.from("materiais").download(imagePath);

    if (error || !data) {
      return NextResponse.json({ error: "Imagem nao encontrada." }, { status: 404 });
    }

    const contentType = getImageContentType(imagePath) || "application/octet-stream";

    return new Response(data, {
      headers: {
        "Cache-Control": "no-store",
        "Content-Type": contentType,
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch {
    return NextResponse.json({ error: "Imagem indisponivel." }, { status: 404 });
  }
}
