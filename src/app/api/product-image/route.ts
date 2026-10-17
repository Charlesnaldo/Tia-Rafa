import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { listProductImagePaths } from "@/lib/supabase/storage-images";
import sharp from "sharp";
import { PRODUCT_IMAGE_WIDTHS } from "@/lib/product-image-loader";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

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
  const requestedWidth = request.nextUrl.searchParams.get("w");
  const width = requestedWidth === null ? 1600 : Number(requestedWidth);

  if (!isAllowedProductImagePath(imagePath) || !PRODUCT_IMAGE_WIDTHS.some((size) => size === width)) {
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

    if (data.size > 15 * 1024 * 1024) {
      return NextResponse.json({ error: "Imagem excede o tamanho permitido." }, { status: 413 });
    }
    const input = Buffer.from(await data.arrayBuffer());
    const optimized = await sharp(input, { limitInputPixels: 40_000_000 })
      .rotate()
      .resize({ width, withoutEnlargement: true })
      .webp({ quality: 75 })
      .toBuffer();

    return new Response(new Uint8Array(optimized), {
      headers: {
        // Short, bounded caching: recheck active-product membership after at most a minute.
        "Cache-Control": "public, max-age=60, s-maxage=60, must-revalidate",
        "Content-Type": "image/webp",
        "Content-Length": String(optimized.byteLength),
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch {
    return NextResponse.json({ error: "Imagem indisponivel." }, { status: 404 });
  }
}
