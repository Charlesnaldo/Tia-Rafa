// Meta (Facebook/Instagram) Pixel. The ID is public: it ships in every page.
// The Conversions API token is secret and lives only in the META_CAPI_TOKEN env var.
export const META_PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID?.trim() || "422491110328106";

// Pinterest tag (conversion tracking). Public: it ships in every page.
export const PINTEREST_TAG_ID = process.env.NEXT_PUBLIC_PINTEREST_TAG_ID?.trim() || "2613623359448";
