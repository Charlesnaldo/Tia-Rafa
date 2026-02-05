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
    <section className="py-16 bg-white font-fredoka scroll-mt-10" id="catalogo">
      <div className="max-w-[1400px] mx-auto px-4">
        {/* Cabeçalho compacto mas mantendo o texto original */}
        <div className="text-center mb-5">
          <h2 className="text-5xl md:text-6xl font-black tracking-tighter mb-6 leading-tight">
            {busca ? (
              <span className="text-gray-900">🔍 Resultados para: {busca}</span>
            ) : (
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 via-pink-500 to-orange-400">
                Nosso Catálogo Mágico
              </span>
            )}
          </h2>

          {/* Filtros de Tipo mais compactos */}
          <div className="flex flex-wrap justify-center gap-2 mb-6">
            {[
              { id: 'todos', label: 'Todos', icon: <ShoppingCart size={14} /> },
              { id: 'digital', label: 'Digital', icon: <FileText size={14} /> },
              { id: 'fisico', label: 'Físico', icon: <Zap size={14} /> },
            ].map((filtro) => (
              <button
                key={filtro.id}
                onClick={() => setCategoria(filtro.id as 'todos' | 'digital' | 'fisico')}
                className={`flex items-center cursor-pointer gap-1 px-4 py-2 rounded-2xl font-bold text-xs uppercase tracking-wider transition-all ${categoria === filtro.id
                  ? 'bg-purple-600 text-white shadow-lg shadow-purple-200 scale-105'
                  : 'bg-gray-50 text-gray-400 hover:bg-gray-100 hover:text-gray-600'
                  }`}
              >
                {filtro.icon}
                {filtro.label}
              </button>
            ))}
          </div>

          {/* Filtros de Tags mais compactos */}
          <div className="flex flex-wrap justify-center gap-1.5 max-w-4xl mx-auto mb-6">
            {todasTags.slice(0, 8).map((tag) => (
              <button
                key={tag}
                onClick={() => setTagAtiva(tag)}
                className={`px-3 py-1 rounded-full text-[10px] font-bold transition-all border ${tagAtiva === tag
                  ? 'bg-pink-50 border-pink-200 text-pink-600'
                  : 'bg-white border-gray-100 text-gray-400 hover:border-gray-200'
                  }`}
              >
                {tag}
              </button>
            ))}
            {todasTags.length > 8 && (
              <span className="text-[10px] text-gray-400 px-2 py-1">
                +{todasTags.length - 8}
              </span>
            )}
          </div>
        </div>

        {/* Grid compacto mas mantendo layout */}
        {produtosFiltrados.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-5">
            {produtosFiltrados.map((produto) => {
              const imagemFinal = (produto.imagens && produto.imagens.length > 0) 
                ? produto.imagens[0] 
                : (produto.imagem || "/img/placeholder.png");
              
              return (
                <Link
                  key={produto.id}
                  href={`/produto/${produto.id}`}
                  className="group bg-white rounded-2xl border border-gray-50 p-3 hover:shadow-xl hover:shadow-purple-100/30 transition-all duration-300 relative flex flex-col h-full hover:-translate-y-1"
                >
                  <div className={`absolute top-2 right-2 z-10 px-2 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider shadow-sm ${produto.tipo === 'digital'
                    ? 'bg-blue-500 text-white shadow-blue-200'
                    : 'bg-orange-500 text-white shadow-orange-200'
                    }`}>
                    {produto.tipo === 'digital' ? 'PDF' : 'Físico'}
                  </div>

                  {/* Imagem simplificada */}
                  <div className={`relative aspect-square rounded-xl overflow-hidden mb-3 shadow-inner ${produto.cor}`}>
                    <Image
                      src={imagemFinal}
                      alt={produto.nome}
                      width={300}
                      height={300}
                      className="w-full h-full object-cover transition-all duration-500 group-hover:scale-105 p-2"
                    />
                  </div>

                  {/* Conteúdo mais compacto */}
                  <div className="flex flex-col flex-1 px-0.5">
                    {/* Tags mini */}
                    <div className="flex gap-1 mb-2">
                      {produto.tags?.slice(0, 1).map(tag => (
                        <span key={tag} className="text-[9px] font-bold text-gray-400 bg-gray-50 px-1.5 py-0.5 rounded-md">
                          {tag}
                        </span>
                      ))}
                    </div>

                    {/* Nome do produto */}
                    <h3 className="text-sm font-bold text-gray-800 line-clamp-2 leading-tight mb-3 h-10">
                      {produto.nome}
                    </h3>

                    {/* Preço e ação mais compactos */}
                    <div className="mt-auto flex items-end justify-between">
                      <div className="flex flex-col">
                        <span className="text-[10px] text-gray-400 font-bold uppercase mb-0.5">Investimento</span>
                        <span className="text-lg font-black text-gray-900 group-hover:text-purple-600 transition-colors">
                          R$ {formatCurrency(produto.preco)}
                        </span>
                      </div>

                      <div className="bg-gradient-to-br from-purple-500 to-pink-600 text-white p-2 rounded-xl shadow-md shadow-purple-100 transform group-hover:rotate-12 transition-all">
                        <ShoppingCart size={16} strokeWidth={3} />
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center py-20 text-center">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4">
              <SearchX size={32} className="text-gray-200" />
            </div>
            <p className="font-bold text-xl text-gray-300">Nenhum material mágico encontrado.</p>
            <button
              onClick={() => { setCategoria('todos'); setTagAtiva('Tudo'); }}
              className="mt-3 text-purple-600 font-bold hover:underline text-sm"
            >
              Limpar todos os filtros
            </button>
          </div>
        )}
      </div>
    </section>
  );
}

export default function Catalog() {
  return (
    <Suspense fallback={
      <div className="py-16 text-center">
        <div className="w-8 h-8 border-3 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto mb-3"></div>
        <p className="font-bold text-gray-400 text-sm">Preparando o catálogo...</p>
      </div>
    }>
      <CatalogContent />
    </Suspense>
  );
}