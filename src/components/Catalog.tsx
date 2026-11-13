import CatalogClient from "./CatalogClient";
import type { Produto } from "@/constants/produtos";

// Server boundary: the interactive grid is prerendered with the published data.
export default function Catalog({ products, search = "", unavailable = false }: {
  products: Produto[]; search?: string; unavailable?: boolean;
}) {
  if (unavailable) return (
    <section id="catalogo" className="mx-auto min-h-[600px] max-w-5xl px-6 py-16 text-center">
      <h1 className="text-2xl font-bold text-purple-950">Catálogo temporariamente indisponível</h1>
      <p className="mt-4 text-slate-600">Tente novamente em alguns instantes.</p>
      <a href="/#catalogo" className="mt-6 inline-flex rounded-xl bg-purple-700 px-6 py-3 text-white">Recarregar catálogo</a>
    </section>
  );
  return <CatalogClient products={products} search={search} />;
}
