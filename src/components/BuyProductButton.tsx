"use client";

import { useRouter } from "next/navigation";
import { useCart, type CartItem } from "@/context/CartContext";

export default function BuyProductButton({ product }: { product: Omit<CartItem, "quantity"> }) {
  const { addToCart } = useCart();
  const router = useRouter();
  return (
    <button type="button" aria-label={`Comprar destaque: ${product.nome}`}
      onClick={() => { addToCart(product, 1); router.push("/carrinho"); }}
      className="mt-3 inline-flex min-h-11 items-center justify-center rounded-xl bg-green-700 px-5 text-sm font-semibold text-white transition-colors hover:bg-green-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-700">
      Comprar
    </button>
  );
}
