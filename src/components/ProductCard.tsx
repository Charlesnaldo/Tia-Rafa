"use client";

import Link from "next/link";
import Image from "next/image";
import { ShoppingCart, Sparkles, Download, Package } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { useCart } from "@/context/CartContext"; // Import useCart

interface ProductCardProps {
  id: string;
  nome: string;
  preco: number;
  imagem?: string;
  imagens?: string[];
  cor: string;
  tipo: 'digital' | 'fisico';
  tags?: string[];
}

export default function ProductCard({ 
  id, 
  nome, 
  preco, 
  imagem, 
  imagens = [], 
  cor, 
  tipo, 
  tags = [] 
}: ProductCardProps) {
  const imagemPrincipal = imagens[0] || imagem || "/embreve.jpg";
  const temSegundaImagem = imagens.length > 1;
  const { addToCart } = useCart(); // Use the cart hook

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart({ id, nome, preco, imagem: imagemPrincipal }, 1); // Add 1 quantity
  };

  return (
    <Link
      href={`/produto/${id}`}
      className="group bg-white rounded-3xl border border-gray-100 p-6 hover:shadow-2xl hover:shadow-purple-100/50 transition-all duration-500 relative flex flex-col h-full hover:-translate-y-2"
    >
      {/* Badge do Tipo */}
      <div className="absolute top-6 right-6 z-10">
        <div className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-black uppercase tracking-wide shadow-md ${
          tipo === 'digital' 
            ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-blue-200/50' 
            : 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-orange-200/50'
        }`}>
          {tipo === 'digital' ? (
            <>
              <Download size={12} />
              <span>DIGITAL</span>
            </>
          ) : (
            <>
              <Package size={12} />
              <span>FÍSICO</span>
            </>
          )}
        </div>
      </div>

      {/* Container da Imagem */}
      <div className={`relative aspect-square rounded-[2rem] overflow-hidden mb-6 shadow-lg ${cor} bg-gradient-to-br ${cor}/10`}>
        {/* Imagem Principal */}
        <Image
          src={imagemPrincipal}
          alt={nome}
          fill
          className="object-contain p-4 transition-transform duration-700 group-hover:scale-110"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />

        {/* Overlay de Hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

        {/* Badge de Várias Imagens */}
        {temSegundaImagem && (
          <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full text-xs font-bold text-gray-700 shadow-md flex items-center gap-1.5">
            <Sparkles size={12} className="text-purple-500" />
            <span>+{imagens.length - 1} fotos</span>
          </div>
        )}
      </div>

      {/* Conteúdo */}
      <div className="flex flex-col flex-1 px-2">
        {/* Tags */}
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {tags.slice(0, 2).map(tag => (
              <span 
                key={tag} 
                className="text-xs font-bold text-purple-600 bg-purple-50 px-3 py-1 rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Nome do Produto */}
        <h3 className="text-lg font-black text-gray-900 leading-tight mb-4 line-clamp-2 group-hover:text-purple-700 transition-colors">
          {nome}
        </h3>

        {/* Preço e Botão */}
        <div className="mt-auto flex items-center justify-between pt-4 border-t border-gray-100">
          <div>
            <span className="text-xs text-gray-500 font-semibold block mb-1">
              INVESTIMENTO
            </span>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-black text-gray-900">
                R$ {formatCurrency(preco)}
              </span>
              {tipo === 'digital' && (
                <span className="text-xs text-green-600 font-bold bg-green-50 px-2 py-0.5 rounded">
                  DOWNLOAD IMEDIATO
                </span>
              )}
            </div>
          </div>

          {/* Botão de Carrinho */}
          <button
            onClick={handleAddToCart} // Use the new handler
            className="relative group/btn"
          >
            <div className="bg-gradient-to-br from-purple-500 to-pink-600 text-white p-3.5 rounded-2xl shadow-lg shadow-purple-200/50 transform transition-all duration-300 group-hover/btn:scale-110 group-hover/btn:rotate-12">
              <ShoppingCart size={20} strokeWidth={2.5} />
            </div>
            {/* Tooltip */}
            <div className="absolute -top-12 right-0 bg-gray-900 text-white text-xs font-bold px-3 py-2 rounded-lg opacity-0 group-hover/btn:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-lg">
              Adicionar ao carrinho
              <div className="absolute -bottom-1 right-3 w-2 h-2 bg-gray-900 rotate-45"></div>
            </div>
          </button>
        </div>

        {/* Info Extra para Físico */}
        {tipo === 'fisico' && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="flex items-center gap-2 text-xs text-gray-600">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              <span className="font-medium">Entrega para todo Brasil</span>
            </div>
          </div>
        )}
      </div>
    </Link>
  );
}
