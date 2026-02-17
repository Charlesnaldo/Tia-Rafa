"use client";

import { useCart } from "@/context/CartContext";
import Image from "next/image";
import Link from "next/link";
import { formatCurrency } from "@/lib/utils";
import { Trash2, PlusCircle, MinusCircle, XCircle } from "lucide-react";
import { PRODUTOS_LISTA } from "@/constants/produtos";

export default function CartPage() {
  const { cartItems, removeFromCart, updateQuantity, clearCart, cartTotal, itemCount } = useCart();
  const getItemImage = (item: { id: string; imagem?: string }) => {
    const produtoAtual = PRODUTOS_LISTA[item.id];
    return item.imagem || produtoAtual?.imagens?.[0] || produtoAtual?.imagem || "/embreve.jpg";
  };

  if (itemCount === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] py-10 px-4">
        <XCircle size={80} className="text-gray-300 mb-6" />
        <h1 className="text-3xl font-black text-gray-800 mb-2">Seu carrinho está vazio!</h1>
        <p className="text-gray-600 mb-8 text-center max-w-md">Parece que você ainda não adicionou nenhum material. Que tal dar uma olhada em nossas opções?</p>
        <Link href="/#catalogo" className="bg-purple-500 hover:bg-purple-600 text-white font-bold py-3 px-6 rounded-xl transition-colors">
          Ver Materiais
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 font-fredoka py-10 px-4 lg:py-16">
      <div className="max-w-6xl mx-auto bg-white p-6 md:p-10 rounded-3xl shadow-xl border border-gray-100">
        <h1 className="text-4xl font-black text-gray-800 mb-8 text-center">Seu Carrinho</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-6">
            {cartItems.map((item) => (
              <div key={item.id} className="flex items-center gap-4 bg-gray-50 p-4 rounded-2xl shadow-sm border border-gray-100 animate-in fade-in slide-in-from-left-4 duration-500">
                <div className="relative w-24 h-24 rounded-lg overflow-hidden flex-shrink-0">
                  <Image src={getItemImage(item)} alt={item.nome} fill sizes="96px" className="object-cover" />
                </div>
                <div className="flex-grow">
                  <h2 className="text-lg font-bold text-gray-800">{item.nome}</h2>
                  <p className="text-purple-600 font-semibold">{formatCurrency(item.preco)}</p>
                  <div className="flex items-center gap-3 mt-2">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      disabled={item.quantity <= 1}
                      className="text-gray-500 hover:text-red-500 disabled:opacity-50 transition-colors"
                    >
                      <MinusCircle size={20} />
                    </button>
                    <span className="font-bold text-gray-700">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="text-gray-500 hover:text-green-500 transition-colors"
                    >
                      <PlusCircle size={20} />
                    </button>
                  </div>
                </div>
                <div className="flex flex-col items-end">
                  <p className="text-lg font-black text-gray-900 mb-2">{formatCurrency(item.preco * item.quantity)}</p>
                  <button onClick={() => removeFromCart(item.id)} className="text-red-500 hover:text-red-700 transition-colors">
                    <Trash2 size={24} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Cart Summary */}
          <div className="lg:col-span-1 bg-gradient-to-br from-purple-50 to-pink-50 p-6 rounded-3xl shadow-lg border border-purple-100 flex flex-col animate-in fade-in slide-in-from-right-4 duration-500">
            <h2 className="text-2xl font-black text-gray-800 mb-6">Resumo do Pedido</h2>

            <div className="flex justify-between items-center text-gray-700 mb-3">
              <span className="font-medium">Itens ({itemCount})</span>
              <span className="font-bold">{formatCurrency(cartTotal)}</span>
            </div>

            <div className="flex justify-between items-center text-xl font-black text-gray-900 border-t border-gray-200 pt-4 mt-4">
              <span>Total</span>
              <span>{formatCurrency(cartTotal)}</span>
            </div>

            <Link href="/checkout" className="mt-8 w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-4 px-6 rounded-xl text-center text-lg transition-colors shadow-lg shadow-purple-200/50">
              Ir para o Pagamento
            </Link>

            <button onClick={clearCart} className="mt-4 w-full text-red-500 hover:text-red-700 font-semibold py-3 px-6 rounded-xl transition-colors">
              Limpar Carrinho
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
