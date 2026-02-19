"use client";

import { useCart } from "@/context/CartContext";
import Image from "next/image";
import Link from "next/link";
import { formatCurrency } from "@/lib/utils";
import { Trash2, PlusCircle, MinusCircle, XCircle, ShoppingBag, ArrowRight } from "lucide-react";

export default function CartPage() {
  const { cartItems, removeFromCart, updateQuantity, clearCart, cartTotal, itemCount } = useCart();
  const getItemImage = (item: { imagem?: string }) => item.imagem || "/embreve.jpg";

  if (itemCount === 0) {
    return (
      <div className="relative min-h-[calc(100vh-180px)] overflow-hidden bg-[radial-gradient(circle_at_top,#f3e8ff_0%,#fff_45%,#eef2ff_100%)] px-4 py-14">
        <div className="mx-auto flex w-full max-w-2xl flex-col items-center rounded-[2.5rem] border border-white/70 bg-white/80 p-10 text-center shadow-[0_20px_80px_rgba(76,29,149,0.12)] backdrop-blur">
          <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-purple-100 text-purple-500">
            <XCircle size={52} />
          </div>
          <h1 className="mb-2 text-3xl font-black text-gray-900">Seu carrinho esta vazio</h1>
          <p className="mb-8 max-w-md text-gray-600">
            Adicione seus materiais para continuar. Assim que finalizar, voce recebe tudo por e-mail.
          </p>
          <Link
            href="/#catalogo"
            className="inline-flex items-center gap-2 rounded-full bg-purple-600 px-8 py-4 text-sm font-black uppercase tracking-[0.2em] text-white transition hover:bg-purple-700"
          >
            Explorar materiais
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,#e0f2fe_0%,#f8fafc_45%,#eef2ff_100%)] font-fredoka py-8 px-4 lg:py-14">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 rounded-[2.2rem] border border-white/70 bg-white/80 px-6 py-6 shadow-[0_20px_70px_rgba(30,41,59,0.08)] backdrop-blur md:px-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="mb-2 inline-flex items-center gap-2 rounded-full bg-blue-100 px-3 py-1 text-[10px] font-black uppercase tracking-[0.3em] text-blue-700">
                <ShoppingBag size={14} />
                Carrinho
              </p>
              <h1 className="text-3xl font-black text-gray-900 md:text-4xl">Revise seu pedido</h1>
              <p className="text-sm text-gray-500">Confira os itens antes de ir para o pagamento seguro.</p>
            </div>
            <Link
              href="/#catalogo"
              className="inline-flex items-center justify-center gap-2 self-start rounded-full border border-gray-200 bg-white px-5 py-3 text-xs font-black uppercase tracking-[0.22em] text-gray-600 transition hover:border-blue-300 hover:text-blue-600 md:self-auto"
            >
              Continuar comprando
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            {cartItems.map((item) => (
              <div
                key={item.id}
                className="flex flex-col gap-4 rounded-[1.8rem] border border-white/80 bg-white/90 p-4 shadow-[0_16px_40px_rgba(15,23,42,0.08)] sm:flex-row sm:items-center sm:gap-5 sm:p-5"
              >
                <div className="relative h-24 w-full overflow-hidden rounded-2xl sm:w-24 sm:flex-shrink-0">
                  <Image src={getItemImage(item)} alt={item.nome} fill sizes="96px" className="object-cover" />
                </div>
                <div className="flex-grow">
                  <h2 className="text-lg font-black text-gray-800">{item.nome}</h2>
                  <p className="text-xs font-black uppercase tracking-[0.2em] text-purple-600">Unitario: {formatCurrency(item.preco)}</p>
                  <div className="mt-3 inline-flex items-center gap-3 rounded-full border border-gray-200 bg-gray-50 px-3 py-2">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      disabled={item.quantity <= 1}
                      className="text-gray-500 transition-colors hover:text-red-500 disabled:opacity-50"
                      aria-label={`Diminuir quantidade de ${item.nome}`}
                    >
                      <MinusCircle size={18} />
                    </button>
                    <span className="min-w-6 text-center text-sm font-black text-gray-700">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="text-gray-500 transition-colors hover:text-green-500"
                      aria-label={`Aumentar quantidade de ${item.nome}`}
                    >
                      <PlusCircle size={18} />
                    </button>
                  </div>
                </div>
                <div className="flex items-center justify-between gap-3 sm:flex-col sm:items-end">
                  <p className="text-xl font-black text-gray-900">{formatCurrency(item.preco * item.quantity)}</p>
                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="rounded-full border border-red-100 bg-red-50 p-2 text-red-500 transition hover:border-red-200 hover:bg-red-100 hover:text-red-600"
                    aria-label={`Remover ${item.nome} do carrinho`}
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="lg:col-span-1">
            <div className="sticky top-24 flex flex-col rounded-[2rem] border border-blue-100 bg-white/95 p-6 shadow-[0_20px_60px_rgba(30,64,175,0.14)]">
              <h2 className="mb-6 text-2xl font-black text-gray-800">Resumo do Pedido</h2>

              <div className="mb-3 flex items-center justify-between text-gray-600">
                <span className="font-bold">Itens ({itemCount})</span>
                <span className="font-black">{formatCurrency(cartTotal)}</span>
              </div>

              <div className="mb-3 flex items-center justify-between rounded-xl bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
                <span className="font-black uppercase tracking-[0.16em]">Entrega</span>
                <span className="font-black">Gratis</span>
              </div>

              <div className="mt-4 flex items-center justify-between border-t border-dashed border-gray-200 pt-4 text-xl font-black text-gray-900">
                <span>Total</span>
                <span>{formatCurrency(cartTotal)}</span>
              </div>

              <Link
                href="/checkout"
                className="mt-8 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-blue-600 px-6 py-4 text-center text-sm font-black uppercase tracking-[0.18em] text-white transition hover:bg-blue-700"
              >
                Ir para o pagamento
                <ArrowRight size={16} />
              </Link>

              <button
                onClick={clearCart}
                className="mt-4 w-full rounded-2xl border border-red-100 bg-red-50 px-6 py-3 text-sm font-black uppercase tracking-[0.16em] text-red-600 transition hover:bg-red-100"
              >
                Limpar carrinho
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
