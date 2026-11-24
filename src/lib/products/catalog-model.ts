import type { Produto } from "@/constants/produtos";

export type PublishedProduct = {
  id: string;
  nome: string;
  descricao: string | null;
  preco_cents: number;
  tipo: "digital" | "fisico";
  imagem_url: string | null;
  imagem_urls?: string[];
  // Present on kits: the materials the kit delivers.
  inclui?: { id: string; nome: string }[];
};

function normalizeImageUrl(value: string | null | undefined) {
  return value && (value.startsWith("/") || /^https?:\/\//.test(value)) ? value : "/embreve.jpg";
}

export function buildCatalogWithOverrides(products: PublishedProduct[]): Record<string, Produto> {
  return Object.fromEntries(products.map(product => {
    const images = [...new Set((product.imagem_urls || []).filter(Boolean).map(normalizeImageUrl))];
    const primary = images[0] || normalizeImageUrl(product.imagem_url);
    return [product.id, {
      id: product.id, nome: product.nome || product.id,
      descricao: product.descricao || "",
      preco: Number.isFinite(product.preco_cents) ? product.preco_cents : 0,
      tipo: product.tipo === "fisico" ? "fisico" : "digital",
      imagem: primary, imagens: images.length ? images : [primary],
      cor: "bg-blue-100", tags: product.inclui?.length ? ["Kit"] : ["Novo"], estrelas: 5,
      inclui: product.inclui?.length ? product.inclui : undefined,
    } satisfies Produto];
  }));
}
