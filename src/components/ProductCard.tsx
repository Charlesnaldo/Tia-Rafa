"use client";

import { Star, ShoppingCart, Download, Package } from "lucide-react";

interface ProductProps {
  title: string;
  description: string;
  price: string;
  imageColor: string;
  tipo: 'digital' | 'fisico';
  estrelas?: number;
}

export default function ProductCard({ title, description, price, imageColor, tipo, estrelas = 5 }: ProductProps) {
  return (
    <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-gray-100 flex flex-col items-start transition-all hover:shadow-2xl hover:-translate-y-2 relative overflow-hidden group h-full">
      {/* Badge de Tipo */}
      <div className={`absolute top-6 right-6 z-10 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest shadow-sm ${tipo === 'digital'
          ? 'bg-blue-500 text-white shadow-blue-200'
          : 'bg-orange-500 text-white shadow-orange-200'
        }`}>
        {tipo === 'digital' ? 'PDF' : 'Físico'}
      </div>

      {/* Thumbnail */}
      <div className={`w-full aspect-square ${imageColor} rounded-[2rem] mb-6 flex items-center justify-center relative overflow-hidden shadow-inner`}>
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-500" />
        {tipo === 'digital' ? (
          <Download className="w-12 h-12 text-white/40 group-hover:scale-110 transition-transform duration-500" />
        ) : (
          <Package className="w-12 h-12 text-white/40 group-hover:scale-110 transition-transform duration-500" />
        )}
      </div>

      {/* Estrelas */}
      <div className="flex gap-0.5 mb-3">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            size={12}
            fill={i < estrelas ? "#FFD700" : "none"}
            className={i < estrelas ? "text-yellow-400" : "text-gray-200"}
          />
        ))}
      </div>

      {/* Info do Produto */}
      <h3 className="text-lg font-black text-gray-800 leading-tight group-hover:text-purple-600 transition-colors">{title}</h3>
      <p className="text-gray-400 mt-2 text-xs leading-relaxed font-medium line-clamp-2">
        {description}
      </p>

      {/* Preço e Ação */}
      <div className="mt-auto pt-6 w-full flex items-center justify-between gap-4">
        <div>
          <span className="text-[10px] text-gray-300 block uppercase font-black tracking-widest mb-0.5">Investimento</span>
          <span className="text-xl font-black text-gray-900 group-hover:text-purple-600 transition-colors">R$ {price}</span>
        </div>

        <button className="bg-gradient-to-br from-pink-500 to-rose-600 text-white px-5 py-3 rounded-2xl font-black text-xs uppercase tracking-wider hover:shadow-xl hover:shadow-pink-200 transition-all active:scale-95 flex items-center gap-2">
          {tipo === 'digital' ? 'Baixar' : 'Pedir'}
          <ShoppingCart size={14} strokeWidth={3} />
        </button>
      </div>
    </div>
  );
}