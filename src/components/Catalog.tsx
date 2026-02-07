"use client";

import { useState, Suspense, useMemo } from "react";
import { ShoppingCart, FileText, SearchX, Zap, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { PRODUTOS_LISTA } from "@/constants/produtos";
import { formatCurrency } from "@/lib/utils";

function CatalogContent() {
  const searchParams = useSearchParams();
  const busca = searchParams.get("busca")?.toLowerCase() || "";
  
  // CONFIGURAÇÃO DO FUNDO
  const bgImage = "/background.webp";

  const [categoria, setCategoria] = useState<'todos' | 'digital' | 'fisico'>('todos');
  const [tagAtiva, setTagAtiva] = useState<string>('Tudo');

  // Lógica de Paginação
  const [paginaAtual, setPaginaAtual] = useState(1);
  const itensPorPagina = 10; // Exibe 10 produtos por página

  const produtosArray = Object.values(PRODUTOS_LISTA);
  const todasTags = ['Tudo', ...Array.from(new Set(produtosArray.flatMap(p => p.tags || [])))];

  // Filtro de produtos
  const produtosFiltrados = useMemo(() => {
    const filtrados = produtosArray.filter((produto) => {
      const matchesBusca = produto.nome.toLowerCase().includes(busca);
      const matchesCategoria = categoria === 'todos' || produto.tipo === categoria;
      const matchesTag = tagAtiva === 'Tudo' || (produto.tags && produto.tags.includes(tagAtiva));
      return matchesBusca && matchesCategoria && matchesTag;
    });
    return filtrados;
  }, [busca, categoria, tagAtiva]);

  // Cálculos de Paginação
  const totalPaginas = Math.ceil(produtosFiltrados.length / itensPorPagina);
  const produtosExibidos = produtosFiltrados.slice(
    (paginaAtual - 1) * itensPorPagina,
    paginaAtual * itensPorPagina
  );

  return (
    <section 
      className="relative py-16 font-fredoka scroll-mt-10 overflow-hidden" 
      id="catalogo"
    >
      {/* BACKGROUND DIRETO NO CÓDIGO */}
      <div 
        className="absolute inset-0 -z-10 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url('${bgImage}')` }}
      />
      {/* OVERLAY PARA LEITURA (opcional, remova a classe bg-white/60 se quiser a imagem pura) */}
      <div className="absolute inset-0 -z-10 bg-white/92 backdrop-blur-[2px]" />

      <div className="max-w-[1400px] mx-auto px-4 relative z-10">
        {/* Cabeçalho */}
        <div className="text-center mb-5">
          <h2 className="text-5xl md:text-6xl font-black tracking-tighter mb-6 leading-tight">
            {busca ? (
              <span className="text-gray-900 bg-white/80 px-4 py-1 rounded-2xl">🔍 Resultados para: {busca}</span>
            ) : (
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 via-pink-500 to-orange-400">
                Nosso Catálogo Mágico
              </span>
            )}
          </h2>

          {/* Filtros de Tipo */}
          <div className="flex flex-wrap justify-center gap-2 mb-6">
            {[
              { id: 'todos', label: 'Todos', icon: <ShoppingCart size={14} /> },
              { id: 'digital', label: 'Digital', icon: <FileText size={14} /> },
              { id: 'fisico', label: 'Físico', icon: <Zap size={14} /> },
            ].map((filtro) => (
              <button
                key={filtro.id}
                onClick={() => setCategoria(filtro.id as 'todos' | 'digital' | 'fisico')}
                className={`flex items-center cursor-pointer gap-1 px-4 py-2 rounded-2xl font-bold text-xs uppercase tracking-wider transition-all shadow-sm ${categoria === filtro.id
                  ? 'bg-purple-600 text-white shadow-lg shadow-purple-200 scale-105'
                  : 'bg-white/90 text-gray-400 hover:bg-white hover:text-gray-600 border border-gray-100'
                  }`}
              >
                {filtro.icon}
                {filtro.label}
              </button>
            ))}
          </div>

          {/* Filtros de Tags */}
          <div className="flex flex-wrap justify-center gap-1.5 max-w-4xl mx-auto mb-6">
            {todasTags.slice(0, 8).map((tag) => (
              <button
                key={tag}
                onClick={() => setTagAtiva(tag)}
                className={`px-3 py-1 rounded-full text-[10px] font-bold transition-all border ${tagAtiva === tag
                  ? 'bg-pink-50 border-pink-200 text-pink-600 shadow-sm'
                  : 'bg-white/80 border-gray-100 text-gray-400 hover:border-gray-200'
                  }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        {/* Grid de Produtos */}
        {produtosExibidos.length > 0 ? (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-5">
              {produtosExibidos.map((produto) => {
                const imagemFinal = (produto.imagens && produto.imagens.length > 0) 
                  ? produto.imagens[0] 
                  : (produto.imagem || "/img/placeholder.png");
                
                return (
                  <Link
                    key={produto.id}
                    href={`/produto/${produto.id}`}
                    className="group bg-white/90 backdrop-blur-sm rounded-2xl border border-white/50 p-3 hover:shadow-xl hover:shadow-purple-100/30 transition-all duration-300 relative flex flex-col h-full hover:-translate-y-1"
                  >
                    <div className={`absolute top-2 right-2 z-10 px-2 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider shadow-sm ${produto.tipo === 'digital'
                      ? 'bg-blue-500 text-white shadow-blue-200'
                      : 'bg-orange-500 text-white shadow-orange-200'
                      }`}>
                      {produto.tipo === 'digital' ? 'PDF' : 'Físico'}
                    </div>

                    <div className={`relative aspect-square rounded-xl overflow-hidden mb-3 shadow-inner ${produto.cor}`}>
                      <Image
                        src={imagemFinal}
                        alt={produto.nome}
                        width={300}
                        height={300}
                        className="w-full h-full object-cover transition-all duration-500 group-hover:scale-105 p-2"
                      />
                    </div>

                    <div className="flex flex-col flex-1 px-0.5">
                      <div className="flex gap-1 mb-2">
                        {produto.tags?.slice(0, 1).map(tag => (
                          <span key={tag} className="text-[9px] font-bold text-gray-400 bg-gray-50/50 px-1.5 py-0.5 rounded-md">
                            {tag}
                          </span>
                        ))}
                      </div>

                      <h3 className="text-sm font-bold text-gray-800 line-clamp-2 leading-tight mb-3 h-10">
                        {produto.nome}
                      </h3>

                      <div className="mt-auto flex items-end justify-between">
                        <div className="flex flex-col">
                          <span className="text-[10px] text-gray-400 font-bold uppercase mb-0.5">Investimento</span>
                          <span className="text-lg font-black text-gray-900 group-hover:text-purple-600 transition-colors">
                            R$ {formatCurrency(produto.preco)}
                          </span>
                        </div>

                        <div className="bg-gradient-to-br from-purple-500 to-pink-600 text-white p-2 rounded-xl shadow-md shadow-purple-100 transform group-hover:rotate-12 transition-all">
                          <ShoppingCart size={25} strokeWidth={3} />
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>

            {/* PAGINAÇÃO */}
            {totalPaginas > 1 && (
              <div className="mt-12 flex justify-center items-center gap-2">
                <button
                  onClick={() => setPaginaAtual(p => Math.max(p - 1, 1))}
                  disabled={paginaAtual === 1}
                  className="p-2 rounded-xl bg-white border border-gray-100 text-purple-600 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-purple-50 transition-all"
                >
                  <ChevronLeft size={20} />
                </button>
                
                {Array.from({ length: totalPaginas }, (_, i) => i + 1).map((num) => (
                  <button
                    key={num}
                    onClick={() => setPaginaAtual(num)}
                    className={`w-10 h-10 rounded-xl cursor-pointer  font-bold text-sm transition-all ${
                      paginaAtual === num
                        ? "bg-purple-600 text-white shadow-md scale-110"
                        : "bg-white text-gray-400 border border-gray-100 hover:text-purple-600"
                    }`}
                  >
                    {num}
                  </button>
                ))}

                <button
                  onClick={() => setPaginaAtual(p => Math.min(p + 1, totalPaginas))}
                  disabled={paginaAtual === totalPaginas}
                  className="p-2 rounded-xl bg-white border border-gray-100 text-purple-600 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed hover:bg-purple-50 transition-all"
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center py-20 text-center relative z-10">
            <div className="w-20 h-20 bg-white/80 rounded-full flex items-center justify-center mb-4 shadow-sm">
              <SearchX size={32} className="text-gray-200" />
            </div>
            <p className="font-bold text-xl text-gray-500">Nenhum material mágico encontrado.</p>
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