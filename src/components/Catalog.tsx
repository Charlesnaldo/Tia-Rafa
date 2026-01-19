"use client";

import { ShoppingCart, FileText } from "lucide-react";

const produtos = [
  { id: 1, nome: "Alfabeto Pontilhado", preco: "12,90", cor: "bg-purple-100" },
  { id: 2, nome: "Números 1 a 10", preco: "10,00", cor: "bg-blue-100" },
  { id: 3, nome: "Vogais Coloridas", preco: "15,00", cor: "bg-pink-100" },
  { id: 4, nome: "Formas Geométricas", preco: "12,00", cor: "bg-orange-100" },
  { id: 5, nome: "Colorir Animais", preco: "09,90", cor: "bg-green-100" },
  { id: 6, nome: "Lógica Infantil", preco: "19,90", cor: "bg-yellow-100" },
  { id: 7, nome: "Caligrafia Mágica", preco: "22,00", cor: "bg-indigo-100" },
  { id: 8, nome: "Corpo Humano", preco: "25,00", cor: "bg-red-100" },
  { id: 9, nome: "Formas Geométricas", preco: "12,00", cor: "bg-orange-100" },
  { id: 10, nome: "Colorir Animais", preco: "09,90", cor: "bg-green-100" },
  { id: 11, nome: "Lógica Infantil", preco: "19,90", cor: "bg-yellow-100" },
  { id: 12, nome: "Caligrafia Mágica", preco: "22,00", cor: "bg-indigo-100" },
  { id: 13, nome: "Corpo Humano", preco: "25,00", cor: "bg-red-100" },
  // Adicione mais para testar a segunda linha...
];

export default function Catalog() {
  return (
    <section id="catalogo" className="py-16 bg-white font-fredoka">
      <div className="max-w-[1600px] mx-auto px-2 md:px-6">
        
        <div className="text-center mb-10">
          <h2 className="text-3xl font-black text-gray-900">📦 Nosso Catálogo</h2>
          <p className="text-gray-500 text-sm mt-2">Escolha seus materiais e receba agora!</p>
        </div>

        {/* Grid Ajustado: 4 colunas no mobile | 8 colunas no desktop */}
        <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2 md:gap-4">
          {produtos.map((item) => (
            <div 
              key={item.id} 
              className="group bg-white rounded-3xl border border-gray-100 p-2 shadow-sm hover:shadow-md transition-all duration-300"
            >
              {/* Espaço da Imagem (Menor para caber 8) */}
              <div className={`relative aspect-square ${item.cor} rounded-2xl overflow-hidden mb-2`}>
                <div className="absolute top-1 right-1 bg-white/90 px-1.5 py-0.5 rounded-md flex items-center gap-0.5 shadow-sm">
                  <FileText size={8} className="text-orange-500" />
                  <span className="text-[8px] font-black text-gray-600">PDF</span>
                </div>
              </div>

              {/* Informações Compactas */}
              <div className="px-1 text-center md:text-left">
                <h3 className="text-[10px] md:text-xs font-black text-gray-800 leading-tight h-7 line-clamp-2">
                  {item.nome}
                </h3>
                
                <div className="flex flex-col md:flex-row items-center justify-between mt-2 gap-1">
                  <span className="text-xs md:text-sm font-black text-purple-600 italic">
                    R${item.preco}
                  </span>
                  
                  <button className="bg-pink-500 hover:bg-pink-600 text-white p-1.5 rounded-xl transition-all active:scale-90">
                    <ShoppingCart size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}