import { getCatalogProducts } from "@/lib/products/catalog-server";
import { getSiteUrl } from "@/lib/site-url";

// Product feed for Pinterest Catalogs (TSV). Pinterest reads it on a schedule and turns every
// active material into a product Pin. Only public data: no material paths, no prices from the cart.
export const revalidate = 3600;

const COLUMNS = [
  "id", "title", "description", "link", "image_link", "additional_image_link",
  "price", "availability", "condition", "brand", "product_type", "google_product_category",
] as const;

// TSV cells cannot contain tabs or line breaks.
const cell = (value: string) => value.replace(/[\t\r\n]+/g, " ").replace(/\s{2,}/g, " ").trim();
const absolute = (site: string, src: string) => (src.startsWith("/") ? `${site}${src}` : src);
// The feed asks the image proxy for a size Pinterest likes (1000px+ wide).
const largeImage = (site: string, src: string) => {
  if (!src.startsWith("/api/product-image?")) return absolute(site, src);
  const path = new URLSearchParams(src.slice(src.indexOf("?") + 1)).get("path") || "";
  // Keep "/" unencoded: some crawlers (seen with Canva) re-encode "%2F" to "%252F" and get a 400.
  const safePath = path.split("/").map(encodeURIComponent).join("/");
  return `${site}/api/product-image?path=${safePath}&w=1080`;
};

export async function GET() {
  const site = getSiteUrl();
  const products = await getCatalogProducts().catch(() => null);
  if (!products) return new Response("Catalogo indisponivel.", { status: 503 });

  const rows = products
    .filter((produto) => produto.preco > 0 && produto.imagem && !produto.imagem.endsWith("/embreve.jpg"))
    .map((produto) => {
      const images = [produto.imagem, ...(produto.imagens || [])].filter((src): src is string => Boolean(src));
      const unique = [...new Set(images)].map((src) => largeImage(site, src));
      const description = produto.descricao || `${produto.nome} - material didático da Tia Rafa, pronto para imprimir.`;
      const link = `${site}/produto/${encodeURIComponent(produto.id)}?utm_source=pinterest&utm_medium=catalog`;
      return [
        produto.id,
        produto.nome.slice(0, 500),
        description.slice(0, 500),
        link,
        unique[0],
        unique.slice(1, 10).join(","),
        `${(produto.preco / 100).toFixed(2)} BRL`,
        "in stock",
        "new",
        "Tia Rafa",
        produto.inclui?.length ? "Kit de materiais didáticos" : "Material didático",
        "Media > Books > Print Books",
      ].map((value) => cell(String(value ?? ""))).join("\t");
    });

  return new Response([COLUMNS.join("\t"), ...rows].join("\n") + "\n", {
    headers: {
      "Content-Type": "text/tab-separated-values; charset=utf-8",
      "Cache-Control": "public, max-age=0, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
