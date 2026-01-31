"use client";

import { useState, Suspense } from "react";
import { ShoppingCart, FileText, SearchX, Zap } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { PRODUTOS_LISTA } from "@/constants/produtos";
import { formatCurrency } from "@/lib/utils";


function CatalogContent() {
  const searchParams = useSearchParams();
  const busca = searchParams.get("busca")?.toLowerCase() || "";
  const [categoria, setCategoria] = useState<'todos' | 'digital' | 'fisico'>('todos');
  const [tagAtiva, setTagAtiva] = useState<string>('Tudo');

  const produtosArray = Object.values(PRODUTOS_LISTA);
  const todasTags = ['Tudo', ...Array.from(new Set(produtosArray.flatMap(p => p.tags || [])))];

  const produtosFiltrados = produtosArray.filter((produto) => {
    const matchesBusca = produto.nome.toLowerCase().includes(busca);
    const matchesCategoria = categoria === 'todos' || produto.tipo === categoria;
    const matchesTag = tagAtiva === 'Tudo' || (produto.tags && produto.tags.includes(tagAtiva));
    return matchesBusca && matchesCategoria && matchesTag;
  });

  return (
    <section className="py-20 bg-white font-fredoka scroll-mt-20">
      <div id="catalogo"className="max-w-[1600px] mx-auto px-4 md:px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-6xl font-black tracking-tighter mb-8 leading-tight">
            {busca ? (
              <span className="text-gray-900">🔍 Resultados para: {busca}</span>
            ) : (
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 via-pink-500 to-orange-400">
                Nosso Catálogo Mágico
              </span>
            )}
          </h2>

          {/* Filtros de Tipo */}
          <div className="flex flex-wrap justify-center gap-3 mb-8">
            {[
              { id: 'todos', label: 'Todos os Materiais', icon: <ShoppingCart size={16} /> },
              { id: 'digital', label: 'Arquivos Digitais', icon: <FileText size={16} /> },
              { id: 'fisico', label: 'Produtos Prontos', icon: <Zap size={16} /> },
            ].map((filtro) => (
              <button
                key={filtro.id}
                onClick={() => setCategoria(filtro.id as 'todos' | 'digital' | 'fisico')}
                className={`flex items-center cursor-pointer gap-2 px-5 py-2.5 rounded-2xl font-black text-xs uppercase tracking-wider transition-all ${categoria === filtro.id
                    ? 'bg-purple-600 text-white shadow-xl shadow-purple-200 scale-105'
                    : 'bg-gray-50 text-gray-400 hover:bg-gray-100 hover:text-gray-600'
                  }`}
              >
                {filtro.icon}
                {filtro.label}
              </button>
            ))}
          </div>

          {/* Filtros de Tags */}
          <div className="flex flex-wrap justify-center gap-2 max-w-4xl mx-auto">
            {todasTags.map((tag) => (
              <button
                key={tag}
                onClick={() => setTagAtiva(tag)}
                className={`px-4 py-1.5 rounded-full text-[11px] font-bold transition-all border-2 ${tagAtiva === tag
                    ? 'bg-pink-50 border-pink-200 text-pink-600'
                    : 'bg-white border-gray-100 text-gray-400 hover:border-gray-200'
                  }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        {produtosFiltrados.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6 md:gap-8">
            {produtosFiltrados.map((produto) => (
              <Link
                key={produto.id}
                href={`/produto/${produto.id}`}
                className="group bg-white rounded-[2.5rem] border border-gray-50 p-4 hover:shadow-2xl hover:shadow-purple-100/50 transition-all duration-500 relative flex flex-col h-full"
              >
                <div className={`absolute top-6 right-6 z-10 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest shadow-sm ${produto.tipo === 'digital'
                    ? 'bg-blue-500 text-white shadow-blue-200'
                    : 'bg-orange-500 text-white shadow-orange-200'
                  }`}>
                  {produto.tipo === 'digital' ? 'PDF' : 'Físico'}
                </div>

                <div className={`relative aspect-square ${produto.cor} rounded-[2rem] overflow-hidden mb-5 shadow-inner`}>
                  <Image
                    src={produto.imagem}
                    alt={produto.nome}
                    width={400}
                    height={400}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-500" />
                </div>

                <div className="flex flex-col flex-1">
                  <div className="flex gap-1 mb-2">
                    {produto.tags?.slice(0, 2).map(tag => (
                      <span key={tag} className="text-[9px] font-bold text-gray-400 border border-gray-100 px-2 py-0.5 rounded-md">
                        {tag}
                      </span>
                    ))}
                  </div>

                  <h3 className="text-base font-black text-gray-800 line-clamp-2 leading-snug mb-4 h-12">
                    {produto.nome}
                  </h3>

                  <div className="mt-auto flex items-end justify-between">
                    <div className="flex flex-col">
                      <span className="text-[10px] text-gray-400 font-black uppercase tracking-wider mb-0.5">Apenas</span>
                      <span className="text-xl font-black text-gray-900 group-hover:text-purple-600 transition-colors">
                        R$ {formatCurrency(produto.preco)}
                      </span>
                    </div>

                    <div className="bg-gradient-to-br from-pink-500 to-rose-600 text-white p-2.5 rounded-2xl shadow-lg shadow-pink-200 transform group-hover:rotate-12 transition-all">
                      <ShoppingCart size={20} strokeWidth={3} />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center py-32 text-center">
            <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-6">
              <SearchX size={40} className="text-gray-200" />
            </div>
            <p className="font-black text-2xl text-gray-300">Nenhum material mágico encontrado.</p>
            <button
              onClick={() => { setCategoria('todos'); setTagAtiva('Tudo'); }}
              className="mt-4 text-purple-600 font-bold hover:underline"
            >
              Limpar todos os filtros
            </button>
          </div>
        )}
      </div>
    </section>
  );
}

// 2. O Export principal agora é o "Boundary" que protege a página
export default function Catalog() {
  return (
    <Suspense fallback={
      <div className="py-20 text-center flex flex-col items-center justify-center min-h-[400px]">
        <div className="w-12 h-12 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mb-4"></div>
        <p className="font-fredoka font-bold text-gray-400">Preparando o catálogo...</p>
      </div>
    }>
      <CatalogContent />
    </Suspense>
  );
}