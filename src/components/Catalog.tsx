"use client";

import { ShoppingCart, FileText, SearchX } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react"; // Adicionado para evitar erro de build

const produtos = [
  { id: 1, nome: "Alfabeto Pontilhado", preco: "12,90", cor: "bg-purple-100" },
  { id: 2, nome: "Números 1 a 10", preco: "10,00", cor: "bg-blue-100" },
  { id: 3, nome: "Vogais Coloridas", preco: "15,00", cor: "bg-pink-100" },
  { id: 4, nome: "Formas Geométricas", preco: "12,00", cor: "bg-orange-100" },
  { id: 5, nome: "Colorir Animais", preco: "09,90", cor: "bg-green-100" },
  { id: 6, nome: "Lógica Infantil", preco: "19,90", cor: "bg-yellow-100" },
  { id: 7, nome: "Caligrafia Mágica", preco: "22,00", cor: "bg-indigo-100" },
  { id: 8, nome: "Corpo Humano", preco: "25,00", cor: "bg-red-100" },
];

// Componente Interno para lidar com os parâmetros de busca
function CatalogContent() {
  const searchParams = useSearchParams();
  const busca = searchParams.get("busca")?.toLowerCase() || "";

  // AQUI É ONDE DEFINIMOS A VARIÁVEL QUE ESTAVA DANDO ERRO
  const produtosFiltrados = produtos.filter((item) =>
    item.nome.toLowerCase().includes(busca)
  );

  return (
    <section id="catalogo" className="py-16 bg-white font-fredoka">
      <div className="max-w-[1600px] mx-auto px-2 md:px-6">
        
        {/* TÍTULO DINÂMICO */}
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-6xl font-black leading-tight tracking-tighter">
            {busca ? (
              <span className="text-gray-900 animate-in fade-in">🔍 Resultados para: {busca}</span>
            ) : (
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 via-pink-500 to-orange-400">
                Nosso Catálogo Mágico
              </span>
            )}
          </h2>
          <div className="flex justify-center mt-4">
            <div className="h-2 w-24 bg-gradient-to-r from-purple-600 to-pink-500 rounded-full animate-pulse" />
          </div>
        </div>

        {/* LISTAGEM DE PRODUTOS */}
        {produtosFiltrados.length > 0 ? (
          <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2 md:gap-4">
            {produtosFiltrados.map((item) => (
              <Link 
                key={item.id} 
                href={`/produto/${item.id}`} 
                className="group relative bg-white rounded-[2rem] border border-gray-100 p-3 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 ease-out overflow-hidden"
              >
                {/* Imagem com Hover Zoom */}
                <div className={`relative aspect-square ${item.cor} rounded-[1.5rem] overflow-hidden mb-3`}>
                  <div className="w-full h-full flex items-center justify-center text-gray-400 group-hover:scale-110 transition-transform duration-500">
                    <FileText size={40} className="opacity-20" />
                  </div>
                  <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                    <span className="text-[10px] font-black text-purple-600">VER DETALHES</span>
                  </div>
                </div>

                {/* Info */}
                <div className="px-1 space-y-1">
                  <h3 className="text-[11px] md:text-xs font-black text-gray-800 line-clamp-2 h-8 group-hover:text-purple-600 transition-colors">
                    {item.nome}
                  </h3>
                  <div className="flex items-center justify-between pt-1">
                    <div className="flex flex-col">
                      <span className="text-[8px] text-gray-400 font-bold uppercase tracking-wider">Apenas</span>
                      <span className="text-sm md:text-base font-black text-gray-900">R${item.preco}</span>
                    </div>
                    <div className="bg-pink-500 text-white p-2.5 rounded-xl transform group-hover:rotate-[360deg] group-hover:scale-110 transition-all duration-500 shadow-lg">
                      <ShoppingCart size={16} strokeWidth={3} />
                    </div>
                  </div>
                </div>
                <div className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-purple-500 to-pink-500 w-0 group-hover:w-full transition-all duration-500" />
              </Link>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center py-20 text-gray-400 animate-in fade-in">
            <SearchX size={48} className="mb-4 opacity-20" />
            <p className="font-bold">Nenhum material encontrado.</p>
          </div>
        )}
      </div>
    </section>
  );
}

// O componente principal envolve o conteúdo em Suspense
// Isso é obrigatório no Next.js ao usar useSearchParams
export default function Catalog() {
  return (
    <Suspense fallback={<div className="text-center py-20">Carregando catálogo...</div>}>
      <CatalogContent />
    </Suspense>
  );
}