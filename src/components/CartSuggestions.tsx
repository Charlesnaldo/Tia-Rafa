"use client";

import { useEffect, useMemo, useRef } from "react";
import { Plus, Sparkles } from "lucide-react";
import FallbackImage from "@/components/FallbackImage";
import { useCart } from "@/context/CartContext";
import { useProductsCatalog } from "@/lib/products/useProductsCatalog";
import { formatCurrency } from "@/lib/utils";

// Refills the cart from "?itens=id:qty,id:qty" (link in the unpaid-Pix reminder), then cleans the URL.
export function useRestoreCartFromUrl() {
  const { cartItems, addToCart } = useCart();
  const { productsById, loaded } = useProductsCatalog();
  const done = useRef(false);
  useEffect(() => {
    if (done.current || !loaded || typeof window === "undefined") return;
    const param = new URLSearchParams(window.location.search).get("itens");
    if (!param) return;
    done.current = true;
    for (const part of param.split(",").slice(0, 20)) {
      const [rawId, rawQty] = part.split(":");
      const id = decodeURIComponent(rawId || "");
      const quantity = Math.min(Math.max(Number.parseInt(rawQty || "1", 10) || 1, 1), 20);
      const produto = productsById[id];
      if (!produto || cartItems.some((item) => item.id === id)) continue;
      addToCart({ id: produto.id, nome: produto.nome, preco: produto.preco, imagem: produto.imagem }, quantity);
    }
    window.history.replaceState(null, "", "/carrinho");
  }, [loaded, productsById, cartItems, addToCart]);
}

// "Combina com o seu carrinho": kits that contain a cart item first, then other materials.
export default function CartSuggestions() {
  const { cartItems, addToCart } = useCart();
  const { productsArray } = useProductsCatalog();
  const suggestions = useMemo(() => {
    const inCart = new Set(cartItems.map((item) => item.id));
    const candidates = productsArray.filter((produto) => !inCart.has(produto.id));
    const kitScore = (produto: (typeof productsArray)[number]) =>
      produto.inclui?.some((item) => inCart.has(item.id)) ? 0 : produto.inclui?.length ? 1 : 2;
    return [...candidates].sort((a, b) => kitScore(a) - kitScore(b)).slice(0, 3);
  }, [cartItems, productsArray]);

  if (suggestions.length === 0) return null;
  return (
    <section aria-labelledby="sugestoes-heading" className="mt-10 rounded-[2rem] border border-white/80 bg-white/90 p-6 shadow-[0_16px_40px_rgba(15,23,42,0.08)]">
      <h2 id="sugestoes-heading" className="mb-5 flex items-center gap-2 text-xl font-black text-gray-800">
        <Sparkles size={18} className="text-pink-500" /> Combina com o seu carrinho
      </h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {suggestions.map((produto) => (
          <div key={produto.id} className="flex flex-col rounded-2xl border border-gray-100 bg-gray-50/60 p-3">
            <div className="relative mb-3 aspect-square w-full overflow-hidden rounded-xl bg-white">
              <FallbackImage src={produto.imagem || "/embreve.jpg"} alt={produto.nome} fill sizes="(max-width: 640px) 90vw, 200px" className="object-cover" />
            </div>
            {produto.inclui?.length ? (
              <span className="mb-1 self-start rounded-full bg-purple-100 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-purple-700">
                Kit com {produto.inclui.length} materiais
              </span>
            ) : null}
            <p className="line-clamp-2 text-sm font-black text-gray-800">{produto.nome}</p>
            <p className="mt-1 text-base font-black text-purple-900">{formatCurrency(produto.preco)}</p>
            <button
              type="button"
              onClick={() => addToCart({ id: produto.id, nome: produto.nome, preco: produto.preco, imagem: produto.imagem }, 1)}
              className="mt-3 inline-flex items-center justify-center gap-1 rounded-xl bg-purple-600 px-3 py-2 text-xs font-black uppercase tracking-wider text-white transition hover:bg-purple-700"
              aria-label={`Adicionar ${produto.nome} ao carrinho`}
            >
              <Plus size={14} /> Adicionar
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}
