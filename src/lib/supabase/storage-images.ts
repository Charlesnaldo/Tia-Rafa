import type { SupabaseClient } from "@supabase/supabase-js";

const MATERIALS_BUCKET = "materiais";
const DEFAULT_SIGNED_URL_TTL_SECONDS = 60 * 60 * 24;

type StorageClient = Pick<SupabaseClient, "storage">;

export function isDirectUrl(value: string) {
  return value.startsWith("http://") || value.startsWith("https://") || value.startsWith("/");
}

export function buildPublicStorageUrl(path: string | null) {
  if (!path) return null;
  const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!supabaseUrl) return null;
  return `${supabaseUrl}/storage/v1/object/public/${MATERIALS_BUCKET}/${path
    .split("/")
    .map(encodeURIComponent)
    .join("/")}`;
}

export async function resolveStorageImageUrl(
  supabase: StorageClient | null,
  path: string | null,
  expiresIn = DEFAULT_SIGNED_URL_TTL_SECONDS
) {
  if (!path) return null;
  if (isDirectUrl(path)) return path;

  const fallbackPublicUrl = buildPublicStorageUrl(path);
  if (!supabase) return fallbackPublicUrl;

  try {
    const signed = await supabase.storage.from(MATERIALS_BUCKET).createSignedUrl(path, expiresIn);
    return signed.data?.signedUrl || fallbackPublicUrl;
  } catch {
    return fallbackPublicUrl;
  }
}

export async function listProductImagePaths(
  supabase: StorageClient,
  productId: string,
  primaryImagePath: string | null
) {
  const imagePaths: string[] = [];
  const folder = `${productId}/imagens`;
  const listed = await supabase.storage.from(MATERIALS_BUCKET).list(folder, {
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

  if (primaryImagePath && !imagePaths.includes(primaryImagePath)) {
    imagePaths.unshift(primaryImagePath);
  }

  return imagePaths;
}

export async function resolveProductImageUrls(
  supabase: StorageClient,
  productId: string,
  primaryImagePath: string | null,
  expiresIn = DEFAULT_SIGNED_URL_TTL_SECONDS
) {
  const imagePaths = await listProductImagePaths(supabase, productId, primaryImagePath);
  if (imagePaths.length === 0) return [];

  const directPaths = imagePaths.filter((path) => isDirectUrl(path));
  const storagePaths = imagePaths.filter((path) => !isDirectUrl(path));

  const resolvedByPath = new Map<string, string>();
  for (const directPath of directPaths) {
    resolvedByPath.set(directPath, directPath);
  }

  if (storagePaths.length > 0) {
    try {
      const signedBatch = await supabase.storage.from(MATERIALS_BUCKET).createSignedUrls(storagePaths, expiresIn);
      if (!signedBatch.error && Array.isArray(signedBatch.data)) {
        for (let i = 0; i < storagePaths.length; i += 1) {
          const path = storagePaths[i];
          const signedUrl = signedBatch.data[i]?.signedUrl || null;
          if (signedUrl) {
            resolvedByPath.set(path, signedUrl);
            continue;
          }
          const fallbackUrl = buildPublicStorageUrl(path);
          if (fallbackUrl) resolvedByPath.set(path, fallbackUrl);
        }
      } else {
        for (const path of storagePaths) {
          const fallbackUrl = buildPublicStorageUrl(path);
          if (fallbackUrl) resolvedByPath.set(path, fallbackUrl);
        }
      }
    } catch {
      for (const path of storagePaths) {
        const fallbackUrl = buildPublicStorageUrl(path);
        if (fallbackUrl) resolvedByPath.set(path, fallbackUrl);
      }
    }
  }

  return imagePaths
    .map((path) => resolvedByPath.get(path) || null)
    .filter((value): value is string => Boolean(value));
}
