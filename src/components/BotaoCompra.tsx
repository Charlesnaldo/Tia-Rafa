"use client";

import { useState } from "react";
import { Loader2, Download, Package } from "lucide-react";
import { Produto } from "@/constants/produtos";

export default function BotaoCompra({ produto }: { produto: Produto }) {
  const [loading, setLoading] = useState(false);

  const handleCheckout = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        body: JSON.stringify({
          id: produto.id,
          nome: produto.nome,
          preco: produto.preco,
        }),
      });

      const data = await response.json();
      if (data.url) {
        window.location.href = data.url; // Redireciona para o Mercado Pago
      }
    } catch (error) {
      console.error("Erro ao iniciar checkout", error);
    } finally {
      setLoading(false);
    }
  };

  const buttonText = produto.tipo === 'digital' ? 'Baixar Agora' : 'Receber em Casa';
  const buttonIcon = produto.tipo === 'digital' ? <Download size={22} /> : <Package size={22} />;

  return (
    <button
      onClick={handleCheckout}
      disabled={loading}
      className="w-full py-5 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-2xl font-black text-lg transition-all flex items-center justify-center gap-3 disabled:opacity-70 shadow-xl shadow-purple-200 hover:shadow-2xl hover:scale-[1.02] active:scale-[0.98]"
    >
      {loading ? <Loader2 className="animate-spin" /> : buttonIcon}
      {loading ? "Processando..." : buttonText}
    </button>
  );
}
