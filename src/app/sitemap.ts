import type { MetadataRoute } from "next";
import { getCatalogProducts } from "@/lib/products/catalog-server";
import { getSiteUrl } from "@/lib/site-url";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = getSiteUrl();
  const staticPages: MetadataRoute.Sitemap = [
    { url: siteUrl, changeFrequency: "daily", priority: 1 },
    { url: `${siteUrl}/atividades`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${siteUrl}/sobre`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${siteUrl}/termos`, changeFrequency: "yearly", priority: 0.2 },
    { url: `${siteUrl}/privacidade`, changeFrequency: "yearly", priority: 0.2 },
  ];

  // A catalog outage must not break the sitemap; static pages are still useful.
  const products = await getCatalogProducts().catch(() => []);
  return [
    ...staticPages,
    ...products.map((product) => ({
      url: `${siteUrl}/produto/${encodeURIComponent(product.id)}`,
      changeFrequency: "weekly" as const,
      priority: 0.9,
    })),
  ];
}
