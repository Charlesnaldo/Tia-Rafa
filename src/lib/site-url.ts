const FALLBACK_SITE_URL = "https://www.tiarafaela.com.br";

// Canonical origin for metadata, sitemap and robots. NEXT_PUBLIC_URL wins when it is a valid public URL.
export function getSiteUrl() {
  const configured = process.env.NEXT_PUBLIC_URL?.trim();
  if (configured) {
    try {
      const url = new URL(configured);
      if (url.protocol === "https:" && url.hostname !== "localhost") return url.origin;
    } catch {
      // Fall back to the production domain.
    }
  }
  return FALLBACK_SITE_URL;
}
