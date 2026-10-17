import type { ImageLoaderProps } from "next/image";

export const PRODUCT_IMAGE_WIDTHS = [32, 48, 64, 96, 128, 256, 384, 640, 750, 828, 1080, 1200, 1600] as const;

export function isProductImageProxy(src: string) {
  return src.startsWith("/api/product-image?");
}

// Route-handler images cannot be passed through Vercel's static Image Optimization API.
// Keep responsive srcsets, but resize these images in the authorized route itself.
export function productImageLoader({ src, width }: ImageLoaderProps) {
  const params = new URLSearchParams(src.slice(src.indexOf("?") + 1));
  const targetWidth = PRODUCT_IMAGE_WIDTHS.find((size) => size >= width) || 1600;
  return `/api/product-image?${new URLSearchParams({ path: params.get("path") || "", w: String(targetWidth) })}`;
}
