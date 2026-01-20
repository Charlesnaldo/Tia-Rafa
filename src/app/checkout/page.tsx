"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation"; // Para ler o ID da URL
import Image from "next/image";
import { PRODUTOS_LISTA } from "@/constants/produtos"; // Importando sua lista
import { ShieldCheck, Zap, CreditCard, ArrowRight, Loader2, Mail } from "lucide-react";

export default function CheckoutPage() {
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState(""); // Estado para o e-mail

  // 1. CAPTURA DINÂMICA: Puxa o ID da URL (?id=...)
  const idDoProduto = searchParams.get("id") || "alfabetizacao-magica";
  
  // 2. BUSCA OS DADOS: Pega o objeto correto da sua lista
  const produto = PRODUTOS_LISTA[idDoProduto as keyof typeof PRODUTOS_LISTA] || PRODUTOS_LISTA["alfabetizacao-magica"];

  const handleCheckout = async () => {
    if (!email) {
      alert("Por favor, preencha seu e-mail para receber o material.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: idDoProduto,
          nome: produto.nome,
          preco: produto.preco,
          emailCliente: email // Enviando o e-mail para o Resend usar depois
        }),
      });

      const data = await response.json();
      if (data.init_point) {
        window.location.href = data.init_point;
      }
    } catch (error) {
      alert("Erro ao processar pagamento. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] font-fredoka py-20 px-6">
      <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12">
        
        {/* Resumo do Pedido */}
        <div className="space-y-8">
          <h2 className="text-3xl font-black text-gray-900">Seu Pedido</h2>
          <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 flex gap-4 items-center">
            <div className="w-20 h-20 bg-orange-100 rounded-2xl relative overflow-hidden shrink-0">
               {/* AQUI PUXA A FOTO DINÂMICA */}
               <Image 
                src={produto.imagem} 
                fill 
                className="object-cover" 
                alt={produto.nome}
                unoptimized 
               />
            </div>
            <div>
              <h3 className="font-black text-gray-800">{produto.nome}</h3>
              <p className="text-orange-500 font-bold text-lg">R$ {produto.preco}</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-3 text-gray-500 text-sm font-bold">
              <Zap size={18} className="text-yellow-500" /> ENTREGA AUTOMÁTICA VIA E-MAIL
            </div>
            <div className="flex items-center gap-3 text-gray-500 text-sm font-bold">
              <ShieldCheck size={18} className="text-green-500" /> PAGAMENTO 100% SEGURO
            </div>
          </div>
        </div>

        {/* Coluna de Pagamento */}
        <div className="bg-white p-8 md:p-12 rounded-[3rem] shadow-xl border border-gray-50">
          
          {/* CAMPO DE E-MAIL (Essencial para o envio do PDF) */}
          <div className="mb-8">
            <label className="block text-sm font-black text-gray-700 mb-2 uppercase tracking-widest">
              Seu E-mail de Acesso
            </label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input 
                type="email"
                placeholder="exemplo@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-transparent focus:border-orange-200 rounded-2xl outline-none font-bold transition-all"
              />
            </div>
          </div>

          <div className="mb-8 text-center border-t pt-8">
            <p className="text-gray-400 font-black uppercase tracking-widest text-xs mb-2">Total a pagar</p>
            <h1 className="text-5xl font-black text-gray-900">R$ {produto.preco}</h1>
          </div>

          <button 
            onClick={handleCheckout}
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-black py-6 rounded-2xl text-xl shadow-lg transition-all flex items-center justify-center gap-4 group"
          >
            {loading ? (
              <Loader2 className="animate-spin" />
            ) : (
              <>
                PAGAR COM MERCADO PAGO
                <ArrowRight className="group-hover:translate-x-2 transition-transform" />
              </>
            )}
          </button>

          <div className="mt-8 flex justify-center gap-4">
            <CreditCard className="text-gray-300" />
            <div className="h-6 w-[1px] bg-gray-100" />
            <span className="text-gray-400 text-[10px] font-bold uppercase tracking-tighter self-center">
              Pix, Cartão ou Boleto
            </span>
          </div>
        </div>

      </div>
    </div>
  );
}