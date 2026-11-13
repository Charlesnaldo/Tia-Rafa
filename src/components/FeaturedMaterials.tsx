import Link from "next/link";
import type { Produto } from "@/constants/produtos";
import { formatCurrency } from "@/lib/utils";
import FallbackImage from "./FallbackImage";
import BuyProductButton from "./BuyProductButton";

// Selected randomly once with the owner's authorization; this is not a sales ranking.
const selectedIds = ["historia-da-boneca-abayomi", "painel-para-trabalhar-as-profissoes", "coracao-autismo-quebra-cabeca"];

export default function FeaturedMaterials({ products }: { products: Produto[] }) {
  const selected = selectedIds.flatMap(id => products.find(product => product.id === id) || []);
  const featured = [...selected, ...products.filter(product => !selectedIds.includes(product.id))].slice(0, 3);
  if (!featured.length) return null;
  return (
    <section aria-labelledby="materiais-destaque-heading" className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
      <h2 id="materiais-destaque-heading" className="mb-6 text-2xl font-bold text-purple-950 sm:text-3xl">Materiais em destaque</h2>
      <div className="grid gap-4 sm:grid-cols-3">
        {featured.map(product => {
          const image = product.imagens?.[0] || product.imagem || "/embreve.jpg";
          return (
            <article key={product.id} className="flex items-start gap-4 rounded-2xl border border-purple-100 bg-white p-4 sm:flex-col">
              <Link href={`/produto/${product.id}`} className="relative aspect-square w-28 shrink-0 overflow-hidden rounded-xl bg-purple-50 focus-visible:outline-2 focus-visible:outline-purple-700 sm:w-full">
                <FallbackImage src={image} alt={product.nome} fill sizes="(max-width: 639px) 112px, (max-width: 1023px) 26vw, 350px" loading="lazy" quality={70} className="object-contain p-2" />
              </Link>
              <div className="flex min-w-0 flex-1 flex-col items-start sm:w-full">
                <h3 className="min-h-11 text-base font-semibold leading-snug text-slate-900 line-clamp-2">{product.nome}</h3>
                <p className="mt-2 text-xl font-semibold text-purple-950">{formatCurrency(product.preco)}</p>
                <BuyProductButton product={{ id: product.id, nome: product.nome, preco: product.preco, imagem: image }} />
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
