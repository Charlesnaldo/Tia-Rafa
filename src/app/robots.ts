import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/site-url";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      // Product photos are served by an API route; Pinterest and Google must reach them.
      allow: ["/", "/api/product-image"],
      disallow: ["/admin", "/api/", "/carrinho", "/checkout", "/sucesso"],
    },
    sitemap: `${getSiteUrl()}/sitemap.xml`,
  };
}
