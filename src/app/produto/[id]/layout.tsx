import type { Metadata } from "next";
import { getCatalogProducts } from "@/lib/products/catalog-server";
import { baseOpenGraph } from "@/lib/site-metadata";

type Props = { params: Promise<{ id: string }>; children: React.ReactNode };

// The page is a client component, so product metadata (title, share preview) lives here.
export async function generateMetadata({ params }: Omit<Props, "children">): Promise<Metadata> {
  const { id } = await params;
  const products = await getCatalogProducts().catch(() => []);
  const produto = products.find((product) => product.id === id);
  if (!produto) return { title: "Material não encontrado" };

  const description = (produto.descricao || `${produto.nome} - material didático da Tia Rafa.`).slice(0, 160);
  const image = produto.imagem || produto.imagens?.[0];
  return {
    title: produto.nome,
    description,
    alternates: { canonical: `/produto/${encodeURIComponent(produto.id)}` },
    openGraph: {
      ...baseOpenGraph,
      title: produto.nome,
      description,
      url: `/produto/${encodeURIComponent(produto.id)}`,
      images: image ? [{ url: image, alt: produto.nome }] : baseOpenGraph.images,
    },
  };
}

export default function ProdutoLayout({ children }: Props) {
  return children;
}
