"use client";

import Link from "next/link";
import Image from "next/image";
import { ShoppingCart } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface ProductCardProps {
  id: string;
  nome: string;
  preco: number;
  imagem: string;
  cor: string;
  tipo: 'digital' | 'fisico';
  tags?: string[];
}

export default function ProductCard({ id, nome, preco, imagem, cor, tipo, tags }: ProductCardProps) {
  return (
    <Link
      href={`/produto/${id}`}
      className="group bg-white rounded-[2.5rem] border border-gray-100 p-4 hover:shadow-2xl hover:shadow-purple-100/50 transition-all duration-500 relative flex flex-col h-full"
    >
      {/* Badge Flutuante */}
      <div className={`absolute top-6 right-6 z-10 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest shadow-sm ${
        tipo === 'digital' ? 'bg-blue-500 text-white' : 'bg-orange-500 text-white'
      }`}>
        {tipo === 'digital' ? 'PDF' : 'Físico'}
      </div>

      {/* Container da Imagem */}
      <div className={`relative aspect-square ${cor} rounded-[2rem] overflow-hidden mb-5 shadow-inner`}>
        <Image
          src={imagem}
          alt={nome}
          fill
          className="object-cover group-hover:scale-110 transition-transform duration-700 p-2"
        />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-500" />
      </div>

      {/* Informações */}
      <div className="flex flex-col flex-1 px-1">
        <div className="flex gap-1 mb-2">
          {tags?.slice(0, 1).map(tag => (
            <span key={tag} className="text-[9px] font-bold text-gray-400 bg-gray-50 px-2 py-0.5 rounded-md">
              {tag}
            </span>
          ))}
        </div>

        <h3 className="text-base font-black text-gray-800 line-clamp-2 leading-snug mb-4 h-12">
          {nome}
        </h3>

        <div className="mt-auto flex items-end justify-between">
          <div className="flex flex-col">
            <span className="text-[10px] text-gray-400 font-black uppercase mb-0.5">Investimento</span>
            <span className="text-xl font-black text-gray-900 group-hover:text-purple-600 transition-colors">
              R$ {formatCurrency(preco)}
            </span>
          </div>

          <div className="bg-gradient-to-br from-purple-500 to-pink-600 text-white p-3 rounded-2xl shadow-lg shadow-purple-100 transform group-hover:rotate-12 group-hover:scale-110 transition-all">
            <ShoppingCart size={18} strokeWidth={3} />
          </div>
        </div>
      </div>
    </Link>
  );
}