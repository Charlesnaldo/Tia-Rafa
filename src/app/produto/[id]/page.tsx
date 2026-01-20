"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { PRODUTOS_LISTA } from "@/constants/produtos";
import { 
  ShieldCheck, 
  Lock, 
  Mail, 
  CreditCard, 
  ChevronLeft, 
  Sparkles, 
  Zap, 
  ArrowRight,
  Loader2
} from "lucide-react";

export default function CheckoutPage() {
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");

  const id = searchParams.get("id") || "alfabetizacao-magica";
  const produto = PRODUTOS_LISTA[id as keyof typeof PRODUTOS_LISTA] || PRODUTOS_LISTA["alfabetizacao-magica"];

  const handlePagamento = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return alert("Por favor, digite seu e-mail para receber o material.");
    
    setLoading(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        body: JSON.stringify({ 
          id, 
          emailCliente: email, 
          nomeProduto: produto.nome,
          preco: produto.preco
        }),
      });
      const data = await res.json();
      if (data.init_point) window.location.href = data.init_point;
    } catch (err) {
      alert("Erro ao processar. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FFF8F5] to-[#FDF2F8] font-fredoka py-12 px-6">
      <div className="max-w-6xl mx-auto">
        
        {/* Header Simples (Foco Total) */}
        <div className="mb-12 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2 text-gray-400 hover:text-orange-500 transition-colors font-bold uppercase text-xs tracking-widest">
            <ChevronLeft size={18} /> Voltar
          </Link>
          <div className="flex items-center gap-2 text-green-600 font-black text-xs uppercase tracking-widest">
            <Lock size={14} /> Ambiente 100% Seguro
          </div>
        </div>

        <div className="grid lg:grid-cols-12 gap-12 items-start">
          
          {/* Coluna Esquerda: Resumo do Produto (Design Premium) */}
          <div className="lg:col-span-5 space-y-8">
            <div className="bg-white/40 backdrop-blur-xl rounded-[3rem] p-8 border border-white/60 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 p-6 opacity-10">
                <Sparkles size={80} className="text-orange-400" />
              </div>

              <h2 className="text-sm font-black text-orange-400 uppercase tracking-[0.3em] mb-8">Seu Material</h2>
              
              <div className="relative w-full aspect-square rounded-[2.5rem] overflow-hidden shadow-2xl mb-8 border-4 border-white">
                <Image 
                  src={produto.imagem} 
                  fill 
                  className="object-cover" 
                  alt={produto.nome} 
                  unoptimized
                />
              </div>

              <div className="space-y-2">
                <h1 className="text-3xl font-black text-amber-950 tracking-tighter leading-none">
                  {produto.nome}
                </h1>
                <div className="inline-block px-3 py-1 bg-orange-100 rounded-full">
                  <p className="text-orange-600 font-black text-[10px] uppercase tracking-widest">Entrega Imediata por E-mail</p>
                </div>
              </div>

              <div className="mt-10 pt-8 border-t border-orange-100 flex justify-between items-end">
                <div>
                  <p className="text-gray-400 text-xs font-bold uppercase">Total a pagar</p>
                  <p className="text-5xl font-black text-amber-950 tracking-tighter">R$ {produto.preco}</p>
                </div>
                <div className="text-right">
                  <p className="text-green-600 font-bold text-xs">Pagamento Único</p>
                  <p className="text-gray-400 text-[10px]">Sem mensalidades</p>
                </div>
              </div>
            </div>

            {/* Selos de Confiança */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/60 p-4 rounded-3xl flex items-center gap-3 border border-white">
                <ShieldCheck className="text-green-500" size={24} />
                <p className="text-[10px] font-bold text-gray-500 uppercase leading-tight">Garantia de <br/> Satisfação</p>
              </div>
              <div className="bg-white/60 p-4 rounded-3xl flex items-center gap-3 border border-white">
                <Zap className="text-yellow-500" size={24} />
                <p className="text-[10px] font-bold text-gray-500 uppercase leading-tight">Acesso <br/> Instantâneo</p>
              </div>
            </div>
          </div>

          {/* Coluna Direita: Formulário (Ação) */}
          <div className="lg:col-span-7">
            <div className="bg-white rounded-[4rem] p-10 md:p-16 shadow-2xl shadow-orange-100/50 border border-orange-50">
              <div className="mb-12">
                <h2 className="text-3xl font-black text-amber-950 mb-2">Finalizar Compra</h2>
                <p className="text-gray-400 font-medium font-fredoka">Preencha os dados abaixo para receber seu material premium.</p>
              </div>

              <form onSubmit={handlePagamento} className="space-y-8">
                {/* Campo de E-mail */}
                <div className="space-y-4">
                  <label className="text-sm font-black text-gray-700 uppercase tracking-widest flex items-center gap-2">
                    <Mail size={16} className="text-orange-400" /> Onde você quer receber o PDF?
                  </label>
                  <input 
                    required
                    type="email" 
                    placeholder="seuMelhorEmail@exemplo.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-gray-50 border-2 border-transparent focus:border-orange-200 focus:bg-white p-6 rounded-2xl outline-none transition-all text-lg font-bold text-gray-700 placeholder:text-gray-300"
                  />
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tight">
                    * Verifique se o e-mail está correto. O link de download será enviado para ele.
                  </p>
                </div>

                {/* Métodos de Pagamento Visual */}
                <div className="pt-8 space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="h-[1px] flex-1 bg-gray-100"></div>
                    <span className="text-[10px] font-black text-gray-300 uppercase tracking-[0.3em]">Pagar com</span>
                    <div className="h-[1px] flex-1 bg-gray-100"></div>
                  </div>
                  
                  <div className="flex justify-center gap-6 opacity-40 grayscale hover:grayscale-0 transition-all">
                    <CreditCard size={32} />
                    <div className="text-2xl font-black italic">PIX</div>
                    <div className="text-2xl font-black italic">BOLETO</div>
                  </div>
                </div>

                <button 
                  type="submit"
                  disabled={loading}
                  className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-gray-200 text-white font-black py-8 rounded-[2.5rem] text-2xl shadow-[0_25px_50px_-12px_rgba(249,115,22,0.4)] transition-all flex items-center justify-center gap-4 group"
                >
                  {loading ? (
                    <Loader2 className="animate-spin" />
                  ) : (
                    <>
                      PAGAR AGORA
                      <ArrowRight className="group-hover:translate-x-2 transition-transform" />
                    </>
                  )}
                </button>
              </form>

              <div className="mt-12 text-center">
                <p className="text-gray-400 text-xs font-medium">
                  Ao clicar em pagar, você será redirecionado para o checkout seguro do <span className="font-bold">Mercado Pago</span>.
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}