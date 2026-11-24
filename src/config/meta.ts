// Meta (Facebook/Instagram) Pixel. The ID is public: it ships in every page.
// The Conversions API token is secret and lives only in the META_CAPI_TOKEN env var.
export const META_PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID?.trim() || "733904945188552";
