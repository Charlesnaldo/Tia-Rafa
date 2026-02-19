"use client"; // Convert to Client Component

import React, { useState } from "react";
import { formatCurrency } from "@/lib/utils";
import { notFound, useRouter } from "next/navigation"; // Import useRouter
import Galeria from "@/components/Galeria";
import Link from "next/link";
import Image from "next/image";
import {
  ChevronLeft,
  ShieldCheck,
  Sparkles,
  Printer,
  Star,
  Package,
  Zap,
  Truck,
  CreditCard,
  Mail,
  Heart,
  CheckCircle2,
  MinusCircle, // Import for quantity control
  PlusCircle, // Import for quantity control
  ShoppingCart, // Import for Add to Cart button
  Download, // Import Download icon
} from "lucide-react";
import BotaoCompartilhar from "@/components/BotaoCompartilhar";
import { useCart } from "@/context/CartContext"; // Import useCart
import { useProductsCatalog } from "@/lib/products/useProductsCatalog";

export default function ProdutoDetalhes({
  params
}: {
  params: Promise<{ id: string }> // Keep params as a Promise type
}) {
  const router = useRouter();
  const { addToCart } = useCart();
  const { productsById, loaded } = useProductsCatalog();
  const [quantity, setQuantity] = useState(1); // State for quantity

  const { id } = React.use(params); // Unwrap the Promise using React.use()
  const produto = productsById[id];

  if (!produto && loaded) notFound();
  if (!produto) {
    return (
      <main className="min-h-screen bg-[#FAFAFA] font-fredoka text-[#2D3748] pb-10 pt-10">
        <section className="max-w-4xl mx-auto px-6">
          <div className="rounded-3xl border border-gray-100 bg-white p-8 text-sm font-bold text-gray-500 shadow-sm">
            Carregando produto...
          </div>
        </section>
      </main>
    );
  }

  const listaImagens = produto.imagens && produto.imagens.length > 0
    ? produto.imagens
    : [produto.imagem || "/embreve.jpg"];

  const handleAddToCart = () => {
    addToCart({
      id: produto.id,
      nome: produto.nome,
      preco: produto.preco,
      imagem: produto.imagem || listaImagens[0],
    }, quantity);
    // Optionally add a toast notification here
  };

  const handleBuyNow = () => {
    addToCart({
      id: produto.id,
      nome: produto.nome,
      preco: produto.preco,
      imagem: produto.imagem || listaImagens[0],
    }, quantity);
    router.push('/carrinho'); // Redirect to cart page
  };

  return (
    <main className="min-h-screen bg-[#FAFAFA] font-fredoka text-[#2D3748] pb-10 pt-5 md:pt-10">
      <section className="max-w-6xl mx-auto px-6 grid md:grid-cols-2 gap-12 items-start">

        {/* Lado Esquerdo: Preview com Galeria Interativa */}
        <div className="relative">
          <Link
            href="/#catalogo"
            className="group inline-flex items-center gap-2 text-sm font-bold text-gray-400 hover:text-purple-600 transition-colors mb-8"
          >
            <ChevronLeft size={30} className="group-hover:-translate-x-1 transition-transform" />
            Voltar para a loja
          </Link>

          {/* COMPONENTE DE GALERIA SUBSTITUINDO A IMAGEM ESTÁTICA */}
          <Galeria
            imagens={listaImagens}
            nome={produto.nome}
            cor={produto.cor}
          />

          <div className="absolute top-[85px] -right-2 bg-white p-4 rounded-2xl shadow-xl flex items-center gap-3 border border-gray-50 z-10">
            <div className="bg-yellow-100 p-2 rounded-xl text-yellow-600">
              <Sparkles size={20} />
            </div>
            <span className="text-xs font-bold uppercase tracking-tight">Material<br />Premium</span>
          </div>
        </div>

        {/* Lado Direito: Info e Botão */}
        <div className="flex flex-col pt-4 md:pt-14">
          <div className="flex items-center gap-2 text-purple-500 font-bold text-xs uppercase tracking-widest mb-4">
            <span className="w-8 h-[2px] bg-purple-500"></span>
            {produto.tipo === 'digital' ? 'Arquivo Digital' : 'Produto Físico'}
          </div>

          <div className="flex justify-between items-start gap-4 mb-4">
            <h1 className="text-4xl md:text-5xl font-black text-gray-800 leading-[1.1]">
              {produto.nome}
            </h1>
            <BotaoCompartilhar titulo={produto.nome} />
          </div>

          {/* Estrelas */}
          {produto.estrelas && (
            <div className="flex items-center gap-2 mb-6">
              <div className="flex gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    size={18}
                    fill={i < produto.estrelas! ? "#FFD700" : "none"}
                    className={i < produto.estrelas! ? "text-yellow-400" : "text-gray-200"}
                  />
                ))}
              </div>
              <span className="text-sm text-gray-400 font-bold">({produto.estrelas}.0)</span>
            </div>
          )}

          <p className="text-lg text-gray-500 leading-relaxed mb-8">
            {produto.descricao || "Desenvolvido para facilitar o aprendizado de forma lúdica e eficaz, ideal para reforço escolar ou sala de aula."}
          </p>

          <div className="grid grid-cols-2 gap-4 mb-10">
            {produto.tipo === 'digital' ? (
              <>
                <div className="flex items-center gap-3 p-4 bg-white rounded-2xl border border-gray-100 shadow-sm">
                  <Printer className="text-blue-400" size={20} />
                  <span className="text-sm font-semibold">Pronto para imprimir</span>
                </div>
                <div className="flex items-center gap-3 p-4 bg-white rounded-2xl border border-gray-100 shadow-sm">
                  <Zap className="text-yellow-400" size={20} />
                  <span className="text-sm font-semibold">Acesso imediato</span>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center gap-3 p-4 bg-white rounded-2xl border border-gray-100 shadow-sm">
                  <Package className="text-orange-400" size={20} />
                  <span className="text-sm font-semibold">Alta qualidade</span>
                </div>
                <div className="flex items-center gap-3 p-4 bg-white rounded-2xl border border-gray-100 shadow-sm">
                  <Truck className="text-green-400" size={20} />
                  <span className="text-sm font-semibold">Frete grátis</span>
                </div>
              </>
            )}
          </div>

          <div className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-xl shadow-gray-200/50">
            <div className="flex items-baseline gap-2 mb-6">
              <span className="text-gray-400 text-lg font-medium">Investimento:</span>
              <span className="text-4xl font-black text-gray-800">R$ {formatCurrency(produto.preco * quantity)}</span> {/* Update price based on quantity */}
            </div>

            {/* Quantity Selector */}
            <div className="flex items-center gap-4 mb-6">
              <span className="text-lg font-medium text-gray-700">Quantidade:</span>
              <div className="flex items-center border border-gray-300 rounded-lg p-1">
                <button
                  onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
                  className="p-2 text-gray-500 hover:text-red-500 disabled:opacity-50"
                  disabled={quantity <= 1}
                >
                  <MinusCircle size={24} />
                </button>
                <span className="px-4 text-xl font-bold text-gray-800">{quantity}</span>
                <button
                  onClick={() => setQuantity(prev => prev + 1)}
                  className="p-2 text-gray-500 hover:text-green-500"
                >
                  <PlusCircle size={24} />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Adicionar ao Carrinho */}
              <button
                onClick={handleAddToCart}
                className="w-full py-4 bg-purple-100 hover:bg-purple-200 text-purple-700 rounded-2xl font-black text-lg transition-all flex items-center justify-center gap-3 shadow-md hover:shadow-lg active:scale-[0.98]"
              >
                <ShoppingCart size={22} />
                Adicionar +
              </button>

              {/* Comprar Agora */}
              <button
                onClick={handleBuyNow}
                className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-2xl font-black text-lg transition-all flex items-center justify-center gap-3 shadow-xl shadow-purple-200 hover:shadow-2xl active:scale-[0.98]"
              >
                {produto.tipo === 'digital' ? <Download size={22} /> : <Package size={22} />}
                Comprar Agora
              </button>
            </div>


            <div className="mt-6 flex items-center justify-center gap-6 opacity-40 grayscale hover:grayscale-0 transition-all">
              <Image src="/mercadopago-logo.webp" alt="Mercado Pago" width={56} height={16} style={{ height: 'auto', width: 'auto' }} />
              <div className="w-[1px] h-4 bg-gray-400"></div>
              <div className="flex items-center gap-1 text-[10px] font-bold">
                <ShieldCheck size={12} />
                COMPRA SEGURA
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Seção Como Funciona */}
      <section className="max-w-6xl mx-auto px-6 py-20 border-t border-gray-100 mt-8">
        <div className="flex flex-col items-center mb-16">
          <span className="bg-purple-100 text-purple-600 text-[10px] font-black uppercase tracking-[0.2em] px-4 py-1.5 rounded-full mb-4 border border-purple-200">
            Passo a Passo
          </span>
          <h3 className="text-3xl md:text-4xl font-black text-gray-800 text-center">
            Como você vai receber?
          </h3>
        </div>

        <div className="grid md:grid-cols-3 gap-10">
          {(produto.tipo === 'digital' ? [
            { t: "Pagamento Seguro", d: "Confirmação instantânea via PIX ou em até 12x no cartão.", icon: <CreditCard className="text-emerald-500" /> },
            { t: "Acesso via E-mail", d: "Você receberá um link exclusivo para download no e-mail cadastrado.", icon: <Mail className="text-blue-500" /> },
            { t: "Uso Ilimitado", d: "Imprima em casa ou na gráfica, quantas vezes precisar.", icon: <Printer className="text-purple-600" /> }
          ] : [
            { t: "Pagamento Seguro", d: "Pague com total segurança via PIX ou Cartão de Crédito.", icon: <CreditCard className="text-emerald-500" /> },
            { t: "Feito com Carinho", d: "Seu material é impresso e embalado com todo cuidado pedagógico.", icon: <Heart className="text-pink-500" /> },
            { t: "Entrega Garantida", d: "Envio rápido pelos Correios com código de rastreio em tempo real.", icon: <Truck className="text-orange-500" /> }
          ]).map((item, i) => (
            <div key={i} className="group relative p-10 bg-white rounded-[40px] border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-300">
              <span className="absolute top-6 right-8 text-6xl font-black text-gray-100 group-hover:text-purple-50 transition-colors">
                0{i + 1}
              </span>

              <div className="relative w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-300">
                {item.icon}
              </div>

              <h4 className="font-bold text-xl mb-3 text-gray-800 flex items-center gap-2">
                {item.t}
                <CheckCircle2 size={16} className="text-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity" />
              </h4>

              <p className="text-gray-500 text-sm leading-relaxed font-medium">
                {item.d}
              </p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
